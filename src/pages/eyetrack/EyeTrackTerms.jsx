import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const EyeTrackTerms = () => {
  const navigate = useNavigate();

  const handleContinue = () => {
    navigate("/eyetrack/child-game");
  };

  const handleBack = () => {
    navigate("/guest");
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
                Eye Tracking Game – Terms & Conditions
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="mx-auto flex max-w-2xl flex-col px-4 pb-8 pt-6">
        <div className="rounded-2xl bg-clinic-surfaceDark p-6 shadow-xl shadow-black/40">
          <h1 className="text-2xl font-bold text-clinic-primary">
            Eye Tracking Game
          </h1>
          <p className="mt-2 text-sm text-slate-300">
            Terms & Conditions
          </p>

          {/* Parent guidance */}
          <div className="mt-6 rounded-xl border border-clinic-accent/40 bg-clinic-accent/5 p-4">
            <p className="text-sm font-semibold text-clinic-accent">
              ⚠️ Parent/Guardian Guidance Required
            </p>
            <p className="mt-2 text-xs leading-relaxed text-slate-300">
              A parent or guardian must supervise this assessment. Please read
              the rule below carefully before your child begins.
            </p>
          </div>

          {/* Rules */}
          <div className="mt-6 space-y-4">
            <h2 className="text-sm font-semibold text-slate-200">
              Important Rule
            </h2>

            <div className="rounded-xl border border-slate-700/80 bg-black/20 p-4">
              <div className="flex gap-3">
                <div className="flex-shrink-0 text-lg font-bold text-clinic-primary">
                  1
                </div>
                <p className="text-sm leading-relaxed text-slate-300">
                  If parents are near the child, they must hide their eyes; only
                  the child's eyes should be visible to the camera.
                </p>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="mt-8 flex gap-3">
            <button
              type="button"
              onClick={handleContinue}
              className="flex-1 rounded-full bg-clinic-primary px-4 py-3 text-sm font-semibold text-slate-900 transition hover:bg-clinic-primary/90"
            >
              Continue
            </button>
            <button
              type="button"
              onClick={handleBack}
              className="inline-flex items-center gap-2 rounded-full border border-slate-600 px-4 py-3 text-sm font-semibold text-slate-300 hover:bg-slate-800/50"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Guest Dashboard
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default EyeTrackTerms;