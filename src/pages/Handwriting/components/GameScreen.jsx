import React from "react";
import { Home, Sparkles, Eye, PauseCircle } from "lucide-react";
import DrawingCanvas from "./DrawingCanvas";


/**
 * GameScreen
 * The active game layout: top bar, progress bar, activity prompt,
 * drawing canvas, and JSON analysis panel.
 */
export default function GameScreen({
  // game state
  selectedGrade,
  currentIndex,
  activities,
  currentActivity,
  score,
  totalAttempts,
  progressPct,
  showGuide,
  setShowGuide,
  breakLeft,
  setBreakLeft,
  penSize,
  setPenSize,
  goHome,
  // canvas hook
  canvasRef,
  startDrawing,
  draw,
  stopDrawing,
  hasDrawn,
  clearCanvas,
  handleWrong,
  handleCorrect,
  // JSON analysis
  uploadedJSON,
  predictionResult,
  analysisLoading,
  analysisAge,
  analysisGender,
  setAnalysisAge,
  setAnalysisGender,
  handleJSONUpload,
  analyzeUploadedJSON,
  // i18n
  t
}) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0e1b4d] via-[#1b3a8f] to-[#274690] text-white relative overflow-hidden p-4 md:p-8">
      <div className="mx-auto max-w-6xl">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-4 shadow-2xl shadow-black/40 md:p-6">

          {/* Top bar */}
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-500/25 to-indigo-500/10 ring-1 ring-white/10">
                <Sparkles className="h-5 w-5 text-sky-200" />
              </div>
              <div>
                <div className="text-sm font-bold text-white">
                  {selectedGrade?.toUpperCase()} • {t("hw.activity")} {currentIndex + 1} / {activities.length}
                </div>
                <div className="text-xs text-slate-300">
                  {t("hw.stars")}: <span className="font-semibold text-yellow-200">{score}</span> • {t("hw.attempts")}:{" "}
                  <span className="font-semibold text-slate-100">{totalAttempts}</span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setShowGuide((v) => !v)}
                className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold ring-1 ring-white/10 transition ${showGuide
                  ? "bg-emerald-400/15 text-emerald-200 hover:bg-emerald-400/20"
                  : "bg-black/30 text-slate-200 hover:bg-black/40"
                  }`}
              >
                <Eye className="h-4 w-4" />
                {showGuide ? t("hw.guideOn") : t("hw.guideOff")}
              </button>

              <button
                type="button"
                onClick={() => setBreakLeft(30)}
                disabled={breakLeft > 0}
                className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold ring-1 ring-white/10 transition ${breakLeft > 0
                  ? "cursor-not-allowed bg-black/30 text-slate-400"
                  : "bg-indigo-400/15 text-indigo-200 hover:bg-indigo-400/20"
                  }`}
              >
                <PauseCircle className="h-4 w-4" />
                {breakLeft > 0 ? t("hw.breakCountdown", { count: breakLeft }) : t("hw.miniBreak")}
              </button>

              <button
                type="button"
                onClick={goHome}
                className="inline-flex items-center gap-2 rounded-full bg-red-500/10 px-4 py-2 text-sm font-semibold text-red-200 ring-1 ring-red-400/20 hover:bg-red-500/15"
              >
                <Home className="h-4 w-4" /> {t("hw.end")}
              </button>
            </div>
          </div>

          {/* Progress bar */}
          <div className="mt-4 rounded-2xl bg-black/25 p-3 ring-1 ring-white/10">
            <div className="flex items-center justify-between text-xs text-slate-200">
              <span>{t("hw.progress")}</span>
              <span className="font-semibold text-slate-100">{progressPct}%</span>
            </div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-800">
              <div className="h-full rounded-full bg-sky-400" style={{ width: `${progressPct}%` }} />
            </div>
          </div>

          {/* Activity prompt + canvas area */}
          <div className="mt-5 grid gap-4 md:grid-cols-[1.2fr,2fr]">
            {/* Left: task info + pen size */}
            <div className="rounded-2xl bg-black/25 p-4 ring-1 ring-white/10">
              <div className="text-xs font-semibold text-sky-200">{t("hw.yourTask")}</div>
              <div className="mt-2 rounded-2xl bg-slate-950/60 p-4 text-center ring-1 ring-white/10">
                <div className="text-4xl font-extrabold text-white md:text-5xl">
                  {currentActivity?.content}
                </div>
                <div className="mt-2 text-xs text-slate-200">
                  {currentActivity?.instruction}
                </div>
              </div>

              <div className="mt-3 rounded-xl bg-slate-900/40 p-3 text-xs text-slate-200 ring-1 ring-white/10">
                {t("hw.effortTip")}
              </div>

              <div className="mt-3">
                <label className="text-xs font-semibold text-slate-200">{t("hw.penSize")}</label>
                <div className="mt-2 flex items-center gap-3">
                  <input
                    type="range"
                    min={4}
                    max={16}
                    value={penSize}
                    onChange={(e) => setPenSize(Number(e.target.value))}
                    className="w-full"
                  />
                  <div className="w-10 text-center text-xs font-semibold text-slate-200">
                    {penSize}
                  </div>
                </div>
              </div>
            </div>

            {/* Right: drawing area */}
            <div className="rounded-2xl bg-black/25 p-4 ring-1 ring-white/10">
              <div className="mb-3 flex items-center justify-between">
                <div className="text-xs font-semibold text-slate-200">
                  {t("hw.drawingArea")}
                </div>
                <div className="text-[11px] text-slate-300">
                  {breakLeft > 0 ? t("hw.pauseBreath") : t("hw.useFinger")}
                </div>
              </div>

              <DrawingCanvas
                canvasRef={canvasRef}
                startDrawing={startDrawing}
                draw={draw}
                stopDrawing={stopDrawing}
                breakLeft={breakLeft}
                hasDrawn={hasDrawn}
                clearCanvas={clearCanvas}
                handleWrong={handleWrong}
                handleCorrect={handleCorrect}
                t={t}
              />
            </div>
          </div>
        </div>

        <p className="mt-4 text-center text-xs text-slate-400">
          {t("hw.keepShort")}
        </p>


      </div>
    </div>
  );
}
