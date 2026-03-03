import React, { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import useWebcamRecorder from "../../body posture hooks/webRecorder.js";
import { sendAdhdVideo } from "../../Body posture Utills/api.js";

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
  const [apiError, setApiError] = useState(null);

  const [cameraReady, setCameraReady] = useState(false);
  const [cameraError, setCameraError] = useState("");
  const [lastRecording, setLastRecording] = useState(null);

  const { videoRef, setupStream, startRecording, stopRecording, stopStream } =
    useWebcamRecorder();

  const sessionTimerRef = useRef(null);
  const actionTimerRef = useRef(null);
  const cycleTimerRef = useRef(null);
  const [uploadedVideo, setUploadedVideo] = useState(null);

  /* ================= CAMERA ================= */

  // Camera turns on only when Start is pressed.

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

  const analyzeUploadedVideo = async () => {
    if (!uploadedVideo) return;

    setApiStatus("loading");
    setApiError(null);
    setAdhdResult(null);

    try {
      const token = localStorage.getItem("token");
      const result = await sendAdhdVideo(uploadedVideo, {
        childId: "demo001",
        age: 8,
        group: "Unknown",
        gender: "M",
        rounds: roundCount,
      }, token);

      setApiStatus("idle");

      if (result) {
        setAdhdResult(result);
        localStorage.setItem("saimanAdhdResult", JSON.stringify(result));
      } else {
        setApiError(
          "Failed to analyze video. Please check the backend server and try again."
        );
      }
    } catch (err) {
      setApiStatus("idle");
      setApiError(
        err.message || "An error occurred while analyzing the video."
      );
      console.error("Video analysis error:", err);
    }
  };

  /* ================= GAME LOOP ================= */

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
      setCurrentText("FREEZE! 🧊");
      setMode("freeze");

      clearTimeout(cycleTimerRef.current);
      cycleTimerRef.current = setTimeout(() => {
        runRound();
      }, FREEZE_DURATION * 1000);
    }, ACTION_DURATION * 1000);
  }, []);

  const startGameLoop = useCallback(() => {
    stopGameLoop();
    runRound();
  }, [runRound, stopGameLoop]);

  /* ================= START / STOP ================= */

  const startSession = async () => {
    setTimeLeft(TOTAL_SESSION_SECONDS);
    setRoundCount(0);
    setAdhdResult(null);

    const okStream = await setupStream();
    setCameraReady(okStream);
    setCameraError(okStream ? "" : "Camera permission required.");
    if (!okStream) return;

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

    stopStream();
    setCameraReady(false);

    const videoToAnalyze = uploadedVideo || blob;
    if (!videoToAnalyze) {
      alert("No video available to analyze");
      return;
    }

    setApiStatus("loading");
    setApiError(null);
    setAdhdResult(null);

    try {
      const token = localStorage.getItem("token");
      const result = await sendAdhdVideo(videoToAnalyze, {
        childId: "demo001",
        age: 8,
        group: "Unknown",
        gender: "M",
        rounds: roundCount,
      }, token);

      setApiStatus("idle");

      if (result) {
        setAdhdResult(result);
        localStorage.setItem("saimanAdhdResult", JSON.stringify(result));
      } else {
        setApiError(
          "Failed to analyze video. Please check the backend server and try again."
        );
      }
    } catch (err) {
      setApiStatus("idle");
      setApiError(
        err.message || "An error occurred while analyzing the video."
      );
      console.error("Video analysis error:", err);
    }
  };

  /* ================= UI HELPERS ================= */

  const formatTime = (sec) =>
    `${String(Math.floor(sec / 60)).padStart(2, "0")}:${String(
      sec % 60
    ).padStart(2, "0")}`;

  const triggerDownload = (blob) => {
    if (!blob) return;

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `saiman-says-recording-${new Date()
      .toISOString()
      .slice(0, 19)
      .replace(/:/g, "-")}.webm`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

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
        {/* GAME AREA */}
        <div className="p-8 border rounded-[2.5rem] bg-white/10 border-white/20 shadow-2xl">
          {/* TOP STATUS BAR */}
          <div className="flex justify-between mb-6 text-lg font-semibold text-white/80">
            <span>⏱ Time: {formatTime(timeLeft)}</span>
            <span>🔁 Rounds: {roundCount}</span>
          </div>

          {/* ACTION TEXT */}
          <h2 className="mb-8 text-5xl font-black tracking-wide text-center">
            {currentText || "Get Ready Hero!"}
          </h2>

          {/* 2 COLUMN LAYOUT */}
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
            {/* LEFT — SAIMAN ACTION VIDEO */}
            <div className="flex flex-col items-center">
              <p className="mb-3 text-sm font-bold tracking-wide uppercase text-cyan-300">
                Watch Saiman
              </p>

              <div className="relative  overflow-hidden rounded-3xl border border-white/30 bg-black/60 aspect-video min-h-[400px]">
                {running ? (
                  <ActionVideo src={currentVideo} />
                ) : (
                  <div className="flex items-center justify-center h-64 text-white/60">
                    Action video appears here
                  </div>
                )}
              </div>

              <p className="mt-3 text-sm text-center text-white/70">
                Copy Saiman&apos;s move exactly
              </p>
            </div>

            {/* RIGHT — LIVE CAMERA */}
            <div className="flex flex-col items-center">
              <p className="mb-3 text-sm font-bold tracking-wide text-yellow-300 uppercase">
                You on Camera
              </p>

              <div className="relative  overflow-hidden rounded-3xl border border-white/30 bg-black/60 aspect-video min-h-[400px]">
                <video
                  ref={videoRef}
                  className="object-cover w-full h-full"
                  autoPlay
                  muted
                  playsInline
                />

                {/* CAMERA OVERLAY */}
                {(!cameraReady || !running) && (
                  <div className="absolute inset-0 flex items-center justify-center px-6 text-lg text-center bg-black/70 text-white/80">
                    {cameraError || "Press Start to begin"}
                  </div>
                )}

                {/* FREEZE VISUAL */}
                {mode === "freeze" && running && (
                  <div className="absolute inset-0 flex items-center justify-center bg-blue-900/40 backdrop-blur-sm"></div>
                )}
              </div>

              <p className="mt-3 text-sm text-center text-white/70">
                Stay inside the camera box
              </p>
            </div>
          </div>

          {/* CONTROLS */}
          <div className="flex justify-center gap-8 mt-10">
            <button
              onClick={startSession}
              disabled={running}
              className={`px-12 py-4 text-xl font-black rounded-2xl transition ${running
                  ? "bg-gray-500"
                  : "bg-green-400 hover:bg-green-300 text-black"
                }`}
            >
              Start Game
            </button>

            <button
              onClick={endSession}
              disabled={!running}
              className={`px-12 py-4 text-xl font-black rounded-2xl transition ${running ? "bg-red-500 hover:bg-red-400" : "bg-gray-500"
                }`}
            >
              Stop
            </button>
          </div>
        </div>

        <button
          onClick={() => navigate("/saiman-result")}
          disabled={!adhdResult}
          className={`w-full py-4 mt-10 rounded-2xl transition ${adhdResult
              ? "bg-white/20 hover:bg-white/30"
              : "bg-white/10 opacity-50 cursor-not-allowed"
            }`}
        >
          View Result Page
        </button>

        {/* ERROR MESSAGE (Main Area) */}
        {apiError && (
          <div className="max-w-3xl p-4 mx-auto mt-6 text-red-300 bg-red-900/30 border border-red-500/50 rounded-xl">
            <p className="font-semibold">❌ Error:</p>
            <p className="text-sm">{apiError}</p>
          </div>
        )}

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

        {/* VIDEO UPLOAD SECTION */}
        <div className="max-w-3xl p-6 mx-auto mt-6 border rounded-2xl bg-white/10 border-white/20">
          <label className="block mb-2 text-sm text-white/80">
            Upload a video (optional)
          </label>

          <input
            type="file"
            accept="video/*"
            onChange={(e) => setUploadedVideo(e.target.files?.[0] || null)}
            className="w-full p-3 border bg-white/10 rounded-xl border-white/20"
          />

          {/* STATUS */}
          {uploadedVideo && (
            <p className="mt-2 text-sm text-green-300">
              ✅ Video selected: {uploadedVideo.name}
            </p>
          )}

          {/* ANALYZE BUTTON */}
          <button
            disabled={!uploadedVideo || apiStatus === "loading"}
            onClick={analyzeUploadedVideo}
            className={`w-full mt-4 py-3 rounded-xl font-bold transition ${!uploadedVideo
                ? "bg-gray-500 cursor-not-allowed"
                : apiStatus === "loading"
                  ? "bg-yellow-400 text-black"
                  : "bg-green-400 hover:bg-green-300 text-black"
              }`}
          >
            {apiStatus === "loading" ? "Analyzing video..." : "Analyze Video"}
          </button>

          {/* ERROR MESSAGE */}
          {apiError && (
            <div className="p-4 mt-4 text-red-300 bg-red-900/30 border border-red-500/50 rounded-xl">
              <p className="font-semibold">❌ Error:</p>
              <p className="text-sm">{apiError}</p>
            </div>
          )}

          {/* RESULT DISPLAY */}
        </div>
      </main>
    </div>
  );
}
