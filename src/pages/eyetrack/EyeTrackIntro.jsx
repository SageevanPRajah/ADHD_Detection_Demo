import React from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { ArrowLeft, Zap } from "lucide-react";

const EyeTrackIntro = () => {
  const navigate = useNavigate();
  const selectedAge = localStorage.getItem("eyetrackAgeGroup");

  // Guard: if no age group selected, redirect to terms
  if (!selectedAge) {
    return <Navigate to="/eyetrack/terms" replace />;
  }

  const handleStartGame = () => {
    localStorage.setItem("eyetrackAccepted", "true");
    navigate("/eyetrack");
  };

  const handleBack = () => {
    navigate("/eyetrack/terms");
  };

  return (
    <div className="min-h-screen bg-clinic-bgDark text-clinic-textDark">
      {/* Top bar */}
      <header className="border-b border-slate-700 bg-clinic-surfaceDark/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="leading-tight">
              <p className="text-sm font-semibold tracking-tight">
                ADHD Care Portal
              </p>
              <p className="text-[11px] text-slate-400">
                Eye Tracking Game – Get Ready!
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="mx-auto flex max-w-2xl flex-col px-4 pb-8 pt-6">
        <div className="rounded-2xl bg-clinic-surfaceDark p-6 shadow-xl shadow-black/40">
          {/* Age confirmation badge */}
          <div className="mb-4 inline-flex items-center rounded-full bg-clinic-secondary/20 px-3 py-1 text-xs font-semibold text-clinic-secondary">
            ✓ Selected age: {selectedAge}
          </div>

          <h1 className="text-2xl font-bold text-clinic-primary">
            Ready to play?
          </h1>
          <p className="mt-2 text-sm text-slate-300">
            Follow the simple rules below and you'll do great!
          </p>

          {/* Game rules */}
          <div className="mt-8 space-y-4">
            <h2 className="text-sm font-semibold text-slate-200">
              Game Rules
            </h2>

            <div className="space-y-3">
              <div className="flex gap-3 rounded-xl border border-slate-700/80 bg-black/20 p-4">
                <div className="flex-shrink-0 flex h-6 w-6 items-center justify-center rounded-full bg-clinic-primary/20 text-clinic-primary font-bold">
                  1
                </div>
                <p className="text-sm text-slate-300 leading-relaxed">
                  Click the <span className="font-semibold text-clinic-accent">green circle.</span>
                </p>
              </div>

              <div className="flex gap-3 rounded-xl border border-slate-700/80 bg-black/20 p-4">
                <div className="flex-shrink-0 flex h-6 w-6 items-center justify-center rounded-full bg-clinic-primary/20 text-clinic-primary font-bold">
                  2
                </div>
                <p className="text-sm text-slate-300 leading-relaxed">
                  If there is a trap, click <span className="font-semibold text-clinic-accent">above the trap.</span>
                </p>
              </div>
            </div>
          </div>

          {/* Tips */}
          <div className="mt-8 rounded-xl border border-clinic-accent/40 bg-clinic-accent/5 p-4">
            <div className="flex gap-3">
              <Zap className="h-5 w-5 text-clinic-accent flex-shrink-0" />
              <div>
                <p className="text-xs font-semibold text-clinic-accent">
                  Pro Tip
                </p>
                <p className="mt-1 text-xs text-slate-300 leading-relaxed">
                  Stay focused and respond as quickly as you can. You've got this!
                </p>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="mt-8 flex gap-3">
            <button
              type="button"
              onClick={handleStartGame}
              className="flex-1 rounded-full bg-clinic-accent px-4 py-3 text-sm font-semibold text-slate-900 hover:bg-clinic-accent/90 transition"
            >
              Start Game
            </button>
            <button
              type="button"
              onClick={handleBack}
              className="inline-flex items-center gap-2 rounded-full border border-slate-600 px-4 py-3 text-sm font-semibold text-slate-300 hover:bg-slate-800/50"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default EyeTrackIntro;
