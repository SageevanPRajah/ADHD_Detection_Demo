import React, { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import useWebcamRecorder from "../../body posture hooks/webRecorder.js";
import { sendAdhdSession } from "../../Body posture Utills/api.js";

import ScorePanel from "./ScorePanel.jsx";
import ActionVideo from "./ActionVideo.jsx";
import { pickAction, FREEZE_VIDEO } from "./GameController.jsx";

/* ================= CONFIG ================= */

const TOTAL_SESSION_SECONDS = 120;
const ACTION_DURATION = 12;
const FREEZE_DURATION = 8;

/* ========================================= */

export default function SaimanSaysGame() {
  const navigate = useNavigate();

  const [running, setRunning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(TOTAL_SESSION_SECONDS);
  const [roundCount, setRoundCount] = useState(0);

  const [currentVideo, setCurrentVideo] = useState(null);
  const [currentText, setCurrentText] = useState("");
  const [mode, setMode] = useState("action");

  const [adhdResult, setAdhdResult] = useState(null);
  const [apiStatus, setApiStatus] = useState("idle");

  const [cameraReady, setCameraReady] = useState(false);
  const [cameraError, setCameraError] = useState("");
  const [lastRecording, setLastRecording] = useState(null);

  const { videoRef, setupStream, startRecording, stopRecording } =
    useWebcamRecorder();

  const sessionTimerRef = useRef(null);
  const stepTimerRef = useRef(null);

  /* ================= CAMERA ================= */

  useEffect(() => {
    let mounted = true;
    (async () => {
      const ok = await setupStream();
      if (!mounted) return;
      setCameraReady(ok);
      setCameraError(ok ? "" : "Camera permission required.");
    })();
    return () => (mounted = false);
  }, [setupStream]);

  /* ================= GLOBAL TIMER ================= */

  useEffect(() => {
    if (!running) return;

    sessionTimerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          endSession();
          return 0;
        }
        return t - 1;
      });
    }, 1000);

    return () => clearInterval(sessionTimerRef.current);
  }, [running]);

  /* ================= GAME LOOP ================= */

  const nextStep = useCallback(() => {
    if (mode === "action") {
      const action = pickAction();
      setCurrentVideo(action.video);
      setCurrentText(action.text);
      setMode("freeze");
      setRoundCount((r) => r + 1);

      stepTimerRef.current = setTimeout(() => {
        setCurrentVideo(FREEZE_VIDEO);
        setCurrentText("FREEZE! 🧊");
      }, ACTION_DURATION * 1000);
    } else {
      setMode("action");
    }
  }, [mode]);

  const startGameLoop = () => {
    nextStep();
    stepTimerRef.current = setInterval(
      nextStep,
      (ACTION_DURATION + FREEZE_DURATION) * 1000
    );
  };

  const stopGameLoop = () => {
    clearInterval(stepTimerRef.current);
    stepTimerRef.current = null;
  };

  /* ================= START / STOP ================= */

  const startSession = async () => {
    setTimeLeft(TOTAL_SESSION_SECONDS);
    setRoundCount(0);
    setAdhdResult(null);

    const ok = await startRecording();
    if (!ok) {
      setCameraError("Camera recording failed.");
      return;
    }

    setRunning(true);
    startGameLoop();
  };

  const endSession = async () => {
    stopGameLoop();
    setRunning(false);

    const blob = await stopRecording();
    setLastRecording(blob);

    setApiStatus("loading");
    const result = await sendAdhdSession(
      {
        freeze_stability: 0.6,
        reaction_time: 0.5,
        fidgeting: 0.4,
      },
      { rounds: roundCount }
    );

    setApiStatus("idle");
    setAdhdResult(result);
  };

  /* ================= UI HELPERS ================= */

  const formatTime = (sec) =>
    `${String(Math.floor(sec / 60)).padStart(2, "0")}:${String(
      sec % 60
    ).padStart(2, "0")}`;

  /* ================= RENDER ================= */

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0e1b4d] via-[#1b3a8f] to-[#274690] text-white">
      {/* HEADER */}
      <header className="flex items-center justify-between px-10 py-6">
        <h1 className="text-4xl font-extrabold">🦸 Saiman Says</h1>
        <button
          onClick={() => navigate("/")}
          className="px-5 py-2 bg-white/20 rounded-xl"
        >
          Exit
        </button>
      </header>

      {/* GAME AREA */}
      <main className="px-5 pb-5">
        <div className="rounded-[2rem] bg-white/10 border border-white/20 p-10 shadow-2xl">
          <div className="flex justify-between mb-6 text-lg">
            <span>⏱ {formatTime(timeLeft)}</span>
            <span>🔁 {roundCount}</span>
          </div>

          <h2 className="mb-6 text-5xl font-black text-center">
            {currentText}
          </h2>

          {running && (
            <div className="flex justify-center mb-8">
              <ActionVideo src={currentVideo} />
            </div>
          )}

          <div className="relative overflow-hidden border aspect-video rounded-3xl bg-black/50 border-white/20">
            <video
              ref={videoRef}
              className="object-cover w-full h-full"
              autoPlay
              muted
              playsInline
            />
            {(!cameraReady || !running) && (
              <div className="absolute inset-0 flex items-center justify-center text-lg bg-black/60">
                {cameraError || "Press Start to begin"}
              </div>
            )}
          </div>

          {/* CONTROLS */}
          <div className="flex justify-center gap-6 mt-10">
            <button
              onClick={startSession}
              disabled={running}
              className={`px-10 py-4 text-xl font-bold rounded-2xl ${
                running
                  ? "bg-gray-500"
                  : "bg-green-400 hover:bg-green-300 text-black"
              }`}
            >
              Start Game
            </button>

            <button
              onClick={endSession}
              disabled={!running}
              className={`px-10 py-4 text-xl font-bold rounded-2xl ${
                running
                  ? "bg-red-500 hover:bg-red-400"
                  : "bg-gray-500"
              }`}
            >
              Stop
            </button>
          </div>
        </div>

        {/* RESULT */}
        <div className="max-w-3xl p-8 mx-auto mt-10 border rounded-3xl bg-white/10 border-white/20">
          <h3 className="mb-4 text-2xl font-bold">🧠 Result</h3>
          {apiStatus === "loading" && <p>Analyzing…</p>}
          {apiStatus === "idle" && <ScorePanel result={adhdResult} />}
        </div>

        {/* DOWNLOAD */}
        <div className="max-w-3xl mx-auto mt-8">
          <button
            onClick={() => lastRecording && triggerDownload(lastRecording)}
            disabled={!lastRecording || running}
            className="w-full py-4 rounded-2xl bg-white/20 hover:bg-white/30 disabled:opacity-50"
          >
            {lastRecording ? "Download Recording" : "No Recording Yet"}
          </button>
        </div>
      </main>
    </div>
  );
}
