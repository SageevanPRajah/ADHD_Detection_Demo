import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const EyeTrackTerms = () => {
  const navigate = useNavigate();
  const [selectedAge, setSelectedAge] = React.useState(
    localStorage.getItem("eyetrackAgeGroup") || null
  );

  const ageGroups = ["5–7", "8–10"];

  const handleAgeSelect = (age) => {
    setSelectedAge(age);
  };

  const handleContinue = () => {
    if (!selectedAge) return;
    localStorage.setItem("eyetrackAgeGroup", selectedAge);
    navigate("/eyetrack/intro");
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
            <p className="mt-2 text-xs text-slate-300 leading-relaxed">
              A parent or guardian must supervise this assessment. Please read
              the rules below carefully before your child begins.
            </p>
          </div>

          {/* Rules */}
          <div className="mt-6 space-y-4">
            <h2 className="text-sm font-semibold text-slate-200">
              Important Rules
            </h2>

            <div className="rounded-xl border border-slate-700/80 bg-black/20 p-4">
              <div className="flex gap-3">
                <div className="flex-shrink-0 text-clinic-primary font-bold text-lg">
                  1
                </div>
                <p className="text-sm text-slate-300 leading-relaxed">
                  If parents are near the child, they must hide their eyes; only
                  the child's eyes should be visible to the camera.
                </p>
              </div>
            </div>
          </div>

          {/* Age group selection */}
          <div className="mt-8 space-y-4">
            <h2 className="text-sm font-semibold text-slate-200">
              Select Child's Age Group <span className="text-clinic-accent">*</span>
            </h2>
            <p className="text-xs text-slate-400">
              This helps us customize the game difficulty and provide appropriate
              guidance.
            </p>

            <div className="space-y-2">
              {ageGroups.map((age) => (
                <button
                  key={age}
                  type="button"
                  onClick={() => handleAgeSelect(age)}
                  className={`w-full rounded-xl border-2 p-4 text-left transition ${
                    selectedAge === age
                      ? "border-clinic-primary bg-clinic-primary/10"
                      : "border-slate-700 bg-black/30 hover:border-slate-600"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`h-5 w-5 rounded border-2 transition ${
                        selectedAge === age
                          ? "border-clinic-primary bg-clinic-primary"
                          : "border-slate-500 bg-transparent"
                      }`}
                    >
                      {selectedAge === age && (
                        <svg
                          className="h-full w-full text-white p-0.5"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      )}
                    </div>
                    <span className="text-sm font-medium text-slate-100">
                      Age {age}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Action buttons */}
          <div className="mt-8 flex gap-3">
            <button
              type="button"
              onClick={handleContinue}
              disabled={!selectedAge}
              className={`flex-1 rounded-full px-4 py-3 text-sm font-semibold transition ${
                selectedAge
                  ? "bg-clinic-primary text-slate-900 hover:bg-clinic-primary/90"
                  : "cursor-not-allowed bg-slate-800 text-slate-500"
              }`}
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
