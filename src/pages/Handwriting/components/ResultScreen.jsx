import React from "react";
import { CheckCircle, XCircle, ArrowRight } from "lucide-react";

/**
 * ResultScreen
 * Shown after the user taps "Good Job" on a drawing.
 * Displays a spinner while predicting, then shows the analysis result.
 */
export default function ResultScreen({ isPredicting, currentPrediction, handleBackToGame, t }) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0e1b4d] via-[#1b3a8f] to-[#274690] text-white relative overflow-hidden p-4 md:p-8 flex items-center justify-center">
      <div className="w-full max-w-md rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl shadow-black/40 text-center">
        {isPredicting ? (
          <div className="flex flex-col items-center gap-5 my-8">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-w-2 border-t-amber-400 border-r-transparent border-b-sky-400 border-l-transparent"></div>
            <h2 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-yellow-400">{t("hw.resultPending")}</h2>
            <p className="text-base text-slate-300">{t("hw.analyzingHw")}</p>
          </div>
        ) : currentPrediction?.error ? (
          <div className="flex flex-col items-center gap-5 my-4">
            <XCircle className="h-20 w-20 text-rose-500 max-w-md" />
            <h2 className="text-3xl font-extrabold text-rose-400">{t("hw.oops")}</h2>
            <p className="text-base text-slate-300">{currentPrediction.message}</p>
            <button
              onClick={handleBackToGame}
              className="mt-6 w-full rounded-2xl bg-slate-800 px-6 py-4 font-bold text-white hover:bg-slate-700 transition ring-1 ring-white/10 flex items-center justify-center gap-3"
            >
              <ArrowRight className="h-5 w-5 rotate-180" /> {t("hw.backToGame")}
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-5 my-4">
            <div className="relative">
              <div className="absolute inset-0 bg-emerald-400 blur-xl opacity-20 rounded-full"></div>
              <CheckCircle className="h-20 w-20 text-emerald-400 relative z-10" />
            </div>
            <h2 className="text-3xl font-extrabold text-emerald-300">{t("hw.analysisComplete")}</h2>

            <div className="w-full rounded-2xl bg-black/25 p-6 mt-2 ring-1 ring-white/10 text-left space-y-4">
              <div className="flex justify-between items-center pb-4 border-b border-white/10">
                <div className="text-sm text-slate-400 font-semibold">{t("hw.prediction")}</div>
                <div className={`text-xl font-bold ${currentPrediction?.prediction === 'ADHD' || currentPrediction?.prediction === 'ADHD Risk' ? 'text-rose-400' : 'text-emerald-400'}`}>
                  {currentPrediction?.prediction || 'Unknown'}
                </div>
              </div>

              <div className="flex justify-between items-center pb-4 border-b border-white/10">
                <div className="text-sm text-slate-400 font-semibold">{t("hw.probability")}</div>
                <div className="text-xl font-bold text-white">
                  {currentPrediction?.probability ? (currentPrediction.probability * 10).toFixed(1) : '0'}/10
                </div>
              </div>

              <div className="flex justify-between items-center">
                <div className="text-sm text-slate-400 font-semibold">{t("hw.riskLevel")}</div>
                <div className={`text-xl font-bold ${currentPrediction?.risk_level === 'High' ? 'text-rose-400' :
                    currentPrediction?.risk_level === 'Moderate' ? 'text-amber-400' : 'text-emerald-400'
                  }`}>
                  {currentPrediction?.risk_level || 'Unknown'}
                </div>
              </div>
            </div>

            <button
              onClick={handleBackToGame}
              className="mt-4 w-full flex items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4 font-bold text-white hover:from-blue-500 hover:to-indigo-500 transition shadow-lg shadow-blue-900/40"
            >
              {t("hw.continueGame")} <ArrowRight className="h-5 w-5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
