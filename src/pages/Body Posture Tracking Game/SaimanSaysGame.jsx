import React, { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Rocket, Zap, Clock, Trophy, Camera, Star, LogOut, Play, Square, Activity, Globe, Brain } from "lucide-react";

import useWebcamRecorder from "../../body posture hooks/webRecorder.js";
import usePoseDetector from "../../body posture hooks/usePoseDetector.js";
import { computeFeatures } from "../../Body posture Utills/featureCompute.js";
import { sendAdhdFeatures } from "../../Body posture Utills/api.js";

import ActionVideo from "./ActionVideo.jsx";
import { pickAction, FREEZE_VIDEO } from "./GameController.jsx";

/* ================= CONFIG ================= */
const TOTAL_SESSION_SECONDS = 120;
const ACTION_DURATION = 12;
const FREEZE_DURATION = 8;

const styles = `
  @keyframes neonPulse {
    0%, 100% { box-shadow: 0 0 10px rgba(37, 99, 235, 0.4), 0 0 20px rgba(37, 99, 235, 0.2); }
    50% { box-shadow: 0 0 20px rgba(37, 99, 235, 0.7), 0 0 40px rgba(37, 99, 235, 0.4); }
  }
  @keyframes neonPulseAction {
    0%, 100% { box-shadow: 0 0 15px rgba(34, 197, 94, 0.5); }
    50% { box-shadow: 0 0 30px rgba(34, 197, 94, 0.8); }
  }
  @keyframes neonPulseFreeze {
    0%, 100% { box-shadow: 0 0 15px rgba(59, 130, 246, 0.5); }
    50% { box-shadow: 0 0 30px rgba(59, 130, 246, 0.8); }
  }
  .neon-border-action { animation: neonPulseAction 2s infinite; border: 2px solid #22c55e; }
  .neon-border-freeze { animation: neonPulseFreeze 2s infinite; border: 2px solid #3b82f6; }
  .glass-card { background: rgba(15, 23, 42, 0.6); backdrop-filter: blur(12px); border: 1px solid rgba(255, 255, 255, 0.1); }
  .energy-bar-fill { transition: width 1s linear; }
`;

export default function SaimanSaysGame() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [running, setRunning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(TOTAL_SESSION_SECONDS);
  const [roundCount, setRoundCount] = useState(0);

  const [currentVideo, setCurrentVideo] = useState(null);
  const [currentText, setCurrentText] = useState("");
  const [mode, setMode] = useState("action"); // 'action' or 'freeze'

  const [adhdResult, setAdhdResult] = useState(null);
  const [apiStatus, setApiStatus] = useState("idle");

  const [cameraReady, setCameraReady] = useState(false);
  const [cameraError, setCameraError] = useState("");
  const [featureError, setFeatureError] = useState("");

  // Webcam stream (display only — no video recording needed)
  const { videoRef, setupStream, stopStream } = useWebcamRecorder();

  // Frontend pose detection (runs during the game in real-time)
  const { initPoseDetector, startCollecting, stopCollecting, isReady: poseReady, initError: poseInitError } = usePoseDetector();

  const sessionTimerRef = useRef(null);
  const actionTimerRef = useRef(null);
  const cycleTimerRef = useRef(null);

  // Init MediaPipe PoseLandmarker once on mount
  useEffect(() => {
    initPoseDetector();
  }, [initPoseDetector]);

  useEffect(() => {
    if (!running) return;
    sessionTimerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) { endSession(); return 0; }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(sessionTimerRef.current);
  }, [running]);

  const stopGameLoop = useCallback(() => {
    clearTimeout(actionTimerRef.current);
    clearTimeout(cycleTimerRef.current);
    actionTimerRef.current = null;
    cycleTimerRef.current = null;
  }, []);

  const runRound = useCallback(() => {
    const action = pickAction();
    setCurrentVideo(action.video);
    setCurrentText(action.text);
    setMode("action");
    setRoundCount((r) => r + 1);

    clearTimeout(actionTimerRef.current);
    actionTimerRef.current = setTimeout(() => {
      setCurrentVideo(FREEZE_VIDEO);
      setCurrentText(t("saiman.freeze") || "FREEZE! 🧊");
      setMode("freeze");

      clearTimeout(cycleTimerRef.current);
      cycleTimerRef.current = setTimeout(() => {
        runRound();
      }, FREEZE_DURATION * 1000);
    }, ACTION_DURATION * 1000);
  }, [t]);

  const startGameLoop = useCallback(() => {
    stopGameLoop();
    runRound();
  }, [runRound, stopGameLoop]);

  const startSession = async () => {
    setTimeLeft(TOTAL_SESSION_SECONDS);
    setRoundCount(0);
    setAdhdResult(null);
    setFeatureError("");

    const okStream = await setupStream();
    setCameraReady(okStream);
    setCameraError(okStream ? "" : t("saiman.cameraRequired"));
    if (!okStream) return;

    if (!poseReady) {
      setCameraError("Pose detector is still loading, please wait a moment.");
      return;
    }

    // Start real-time pose collection from the webcam video element
    startCollecting(videoRef.current);

    setRunning(true);
    startGameLoop();
  };

  const endSession = async () => {
    stopGameLoop();
    setRunning(false);

    // Stop pose collection and get the sequence
    const poseSeq = stopCollecting();

    stopStream();
    setCameraReady(false);

    // Compute features in the browser (JS math, ~5ms)
    let features;
    try {
      features = computeFeatures(poseSeq);
    } catch (err) {
      setFeatureError(err.message);
      return;
    }

    // Send only 8 numbers to backend → result in < 500ms
    setApiStatus("loading");
    const response = await sendAdhdFeatures(features, { rounds: roundCount });
    setApiStatus("idle");

    if (response && response.adhd_score !== undefined) {
      setAdhdResult({
        adhd_score: response.adhd_score,
        adhd_probability: response.adhd_probability,
        subtype: response.subtype,
        derived_features: response.derived_features,
      });
    }
  };

  const formatTime = (sec) =>
    `${String(Math.floor(sec / 60)).padStart(2, "0")}:${String(sec % 60).padStart(2, "0")}`;

  const triggerDownload = (blob) => {
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `adhd-saiman-recording.webm`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const timePercent = (timeLeft / TOTAL_SESSION_SECONDS) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#152663] via-[#2445a3] to-[#345ba3] text-slate-100 font-sans selection:bg-clinic-primary/30">
      <style>{styles}</style>

      {/* MediaPipe loading / error banner */}
      {!poseReady && !poseInitError && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-5 py-3 bg-slate-900/90 border border-clinic-primary/30 rounded-2xl text-xs text-slate-300 backdrop-blur shadow-xl">
          <Brain className="w-4 h-4 text-clinic-primary animate-pulse" />
          Preparing AI pose detector… (first load only)
        </div>
      )}
      {poseInitError && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 px-5 py-3 bg-red-900/80 border border-red-500/40 rounded-2xl text-xs text-red-300 backdrop-blur shadow-xl">
          ⚠ Pose detector failed to load: {poseInitError}
        </div>
      )}
      {featureError && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 px-5 py-3 bg-red-900/80 border border-red-500/40 rounded-2xl text-xs text-red-300 backdrop-blur shadow-xl">
          ⚠ {featureError}
        </div>
      )}

      {/* HEADER: NEON GLASSBAR */}
      <header className="sticky top-0 z-50 px-6 py-4 border-b border-white/5 bg-slate-900/60 backdrop-blur-xl">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-clinic-primary/20 rounded-2xl text-clinic-primary shadow-lg shadow-clinic-primary/10">
              <Rocket className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-white">{t("saiman.title")}</h1>
              <p className="text-[10px] uppercase tracking-[0.2em] text-clinic-secondary font-semibold">Mission: Copy Saiman</p>
            </div>
          </div>

          <div className="flex items-center gap-6">
            {/* ENERGY METER */}
            <div className="hidden md:flex flex-col items-end gap-1">
              <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                <Zap className="w-3 h-3 text-yellow-400" />
                Session Energy
              </div>
              <div className="w-48 h-2.5 bg-slate-800 rounded-full overflow-hidden border border-white/5">
                <div 
                  className="h-full bg-gradient-to-r from-clinic-secondary to-clinic-primary energy-bar-fill shadow-[0_0_10px_rgba(37,99,235,0.5)]" 
                  style={{ width: `${timePercent}%` }}
                />
              </div>
            </div>

            <button 
              onClick={() => navigate("/saiman-instructions")} 
              className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 rounded-xl transition duration-300 border border-white/5"
            >
              <LogOut className="w-4 h-4" />
              {t("saiman.exit")}
            </button>
          </div>
        </div>
      </header>

      {/* MAIN GAME CONTAINER */}
      <main className="relative z-10 max-w-7xl mx-auto px-6 py-10">
        
        {/* GAME STATUS / ACTION BOX */}
        <section className="mb-10 text-center">
          <div className="inline-flex items-center gap-3 px-6 py-3 mb-6 bg-clinic-primary/10 rounded-3xl border border-clinic-primary/20 backdrop-blur-md">
            <Activity className="w-5 h-5 text-clinic-primary animate-pulse" />
            <span className="text-sm font-bold text-clinic-primary tracking-wide">
              {running ? `ROUND ${roundCount} ACTIVE` : "SYSTEM READY"}
            </span>
          </div>
          
          <h2 className={`text-5xl md:text-7xl font-black tracking-tighter mb-4 ${mode === 'freeze' ? 'text-blue-400' : 'text-white'}`}>
            {currentText || t("saiman.getReady") || "Ready to Start?"}
          </h2>
          
          <div className="flex items-center justify-center gap-10 mt-6 text-slate-400 font-medium">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-clinic-secondary" />
              <span className="text-2xl font-mono text-white tracking-widest">{formatTime(timeLeft)}</span>
            </div>
            <div className="flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-400" />
              <span className="text-2xl font-mono text-white tracking-widest">{roundCount}</span>
            </div>
          </div>
        </section>

        {/* DUAL CAMERA VIEW */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          
          {/* SAIMAN PANEL */}
          <div className="flex flex-col gap-4">
             <div className="flex items-center justify-between px-2">
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-clinic-secondary">Saiman's Mission</span>
                <span className="flex h-2 w-2 rounded-full bg-clinic-secondary animate-ping" />
             </div>
             <div className={`relative aspect-video rounded-[2.5rem] overflow-hidden bg-slate-900 border-4 transition-all duration-700 ${running ? (mode === 'action' ? 'neon-border-action scale-[1.02]' : 'neon-border-freeze') : 'border-white/5'}`}>
               {running ? <ActionVideo src={currentVideo} /> : (
                 <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/40">
                    <Globe className="w-16 h-16 text-slate-700 mb-4 animate-spin-slow" />
                    <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Waiting for Signal...</p>
                 </div>
               )}
               {/* OVERLAY FOR FREEZE */}
               {mode === "freeze" && running && (
                  <div className="absolute inset-0 bg-blue-600/20 backdrop-blur-[2px] flex items-center justify-center">
                    <div className="px-10 py-5 bg-blue-900/80 rounded-3xl border border-blue-400/30 text-4xl font-black text-white italic tracking-tighter scale-110">
                      FREEZE!
                    </div>
                  </div>
                )}
             </div>
             <p className="text-[11px] text-center text-slate-500 font-semibold tracking-wide uppercase">Watch Saiman closely and mirror the pose</p>
          </div>

          {/* PLAYER PANEL */}
          <div className="flex flex-col gap-4">
             <div className="flex items-center justify-between px-2">
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-clinic-primary">Your Tracking Log</span>
                <span className={`flex h-2 w-2 rounded-full ${running ? 'bg-red-500 animate-pulse' : 'bg-slate-600'}`} />
             </div>
             <div className={`relative aspect-video rounded-[2.5rem] overflow-hidden bg-slate-900 border-4 transition-all duration-700 ${running ? 'border-white/10' : 'border-white/5'}`}>
                <video ref={videoRef} className="object-cover w-full h-full grayscale-[0.2] contrast-[1.1]" autoPlay muted playsInline />
                {(!cameraReady || !running) && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center bg-slate-900/90 backdrop-blur-md">
                    <Camera className="w-16 h-16 text-clinic-primary mb-6" />
                    <p className="text-lg font-bold text-white mb-2">{cameraError || t("saiman.pressStart") || "Initialize Biometric Link"}</p>
                    <p className="text-xs text-slate-500 max-w-xs uppercase tracking-widest leading-relaxed">System requires optical access to analyze posture stability</p>
                  </div>
                )}
                {/* FREEZE OVERLAY FOR PLAYER TOO */}
                {mode === "freeze" && running && (
                  <div className="absolute inset-0 bg-blue-900/30 backdrop-blur-[4px] ring-inset ring-[20px] ring-blue-500/20 transition-all" />
                )}
             </div>
             <p className="text-[11px] text-center text-slate-500 font-semibold tracking-wide uppercase">Stay centered in the grid for accurate data</p>
          </div>

        </div>

        {/* CONTROL HUB */}
        <section className="mt-16 flex flex-col items-center gap-10">
          <div className="flex flex-wrap justify-center gap-6">
            {!running ? (
              <button 
                onClick={startSession} 
                className="group relative flex items-center gap-4 px-12 py-6 bg-clinic-accent hover:bg-emerald-400 text-slate-900 rounded-[2rem] font-black text-2xl transition duration-500 shadow-[0_10px_30px_rgba(34,197,94,0.3)] hover:shadow-[0_15px_45px_rgba(34,197,94,0.5)] transform hover:scale-105 active:scale-95 overflow-hidden"
              >
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
                <Play className="w-8 h-8 fill-current translate-z-0" />
                <span className="relative z-10 uppercase tracking-tight">{t("saiman.startGame") || "Initiate Mission"}</span>
              </button>
            ) : (
              <button 
                onClick={endSession} 
                className="group relative flex items-center gap-4 px-12 py-6 bg-red-500 hover:bg-red-400 text-white rounded-[2rem] font-black text-2xl transition duration-500 shadow-[0_10px_30px_rgba(239,44,44,0.3)] hover:shadow-[0_15px_45px_rgba(239,44,44,0.5)] transform hover:scale-105 active:scale-95 overflow-hidden"
              >
                <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
                <Square className="w-8 h-8 fill-current" />
                <span className="relative z-10 uppercase tracking-tight">{t("saiman.stop") || "Abort Mission"}</span>
              </button>
            )}
          </div>

          {/* SECONDARY ACTIONS: GLASS BOX */}
          <div className="w-full max-w-4xl p-6 glass-card rounded-[3rem] shadow-2xl">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              
              <div className="flex items-center gap-4">
                 <div className="p-3 bg-white/5 rounded-2xl">
                    <Trophy className="w-8 h-8 text-yellow-500" />
                 </div>
                 <div>
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider">Mission Debriefing</h3>
                    <p className="text-xs text-slate-400">Analysis ready after abort or completion</p>
                 </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    if (adhdResult) localStorage.setItem('saimanAdhdResult', JSON.stringify(adhdResult));
                    navigate("/saiman-result");
                  }}
                  className={`flex items-center gap-3 px-8 py-4 rounded-2xl font-black text-sm transition duration-300 ${adhdResult ? "bg-clinic-primary text-white shadow-lg shadow-clinic-primary/20 hover:scale-105" : apiStatus === "loading" ? "bg-slate-700 text-slate-500 cursor-wait" : "bg-white/5 text-slate-500 cursor-not-allowed"}`}
                  disabled={!adhdResult || apiStatus === "loading"}
                >
                  {apiStatus === "loading" ? <Star className="w-4 h-4 animate-spin" /> : <Activity className="w-4 h-4" />}
                  {apiStatus === "loading" ? "Analyzing..." : t("saiman.viewResult")}
                </button>
              </div>

            </div>
          </div>
        </section>

      </main>
      
      {/* FINAL DECORATION */}
      <footer className="py-10 text-center text-slate-600 font-black text-[8px] uppercase tracking-[0.5em]">
        ADHD Posture Analysis Unit &copy; 2026 Space Dynamics
      </footer>
    </div>
  );
}
