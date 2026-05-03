import React from "react";
import { ArrowLeft, PenTool, Info, Star, ArrowRight } from "lucide-react";

/**
 * LandingPage
 * Shown when the game has not started yet.
 * Displays grade selection cards and parent guide.
 */
export default function LandingPage({ gradeMeta, navigate, startGame, t }) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0e1b4d] via-[#1b3a8f] to-[#274690] text-white relative overflow-hidden p-4 md:p-8">
      <div className="mx-auto max-w-5xl">
        <button
          onClick={() => navigate("/guest")}
          className="mb-6 flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2 text-sm font-bold text-white transition hover:bg-white/20 ring-1 ring-white/10"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>

        <div className="rounded-3xl border border-white/10 bg-white/5 p-5 shadow-2xl shadow-black/40 md:p-8">
          <div className="flex flex-col items-center gap-3 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500/30 to-indigo-500/10 ring-1 ring-white/10">
              <PenTool className="h-7 w-7 text-sky-200" />
            </div>
            <h1 className="text-2xl font-extrabold text-white tracking-tight text-amber-200 md:text-3xl">
              {t("hw.title")}
            </h1>
            <p className="max-w-2xl text-sm text-slate-300">
              {t("hw.desc")}
              <span className="font-semibold text-sky-200"> {t("hw.goodJob")} </span>
              {t("hw.descEnd")}
            </p>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-[1.2fr,1.8fr]">
            {/* Parent guide */}
            <div className="rounded-2xl bg-black/20 p-4 ring-1 ring-white/10">
              <h2 className="mb-2 flex items-center gap-2 text-sm font-semibold text-sky-200">
                <Info className="h-4 w-4" /> {t("hw.parentGuide")}
              </h2>
              <ul className="space-y-2 text-sm text-slate-200">
                <li className="flex gap-2">
                  <span className="mt-2 h-1.5 w-1.5 rounded-full bg-sky-300"></span>
                  <span>{t("hw.guide1")}</span>
                </li>
                <li className="flex gap-2">
                  <span className="mt-2 h-1.5 w-1.5 rounded-full bg-sky-300"></span>
                  <span>{t("hw.guide2")}</span>
                </li>
                <li className="flex gap-2">
                  <span className="mt-2 h-1.5 w-1.5 rounded-full bg-sky-300"></span>
                  <span>{t("hw.guide3")}</span>
                </li>
                <li className="flex gap-2">
                  <span className="mt-2 h-1.5 w-1.5 rounded-full bg-sky-300"></span>
                  <span>{t("hw.guide4")}</span>
                </li>
              </ul>
            </div>

            {/* Grade selection */}
            <div className="rounded-2xl bg-black/20 p-4 ring-1 ring-white/10">
              <h2 className="text-sm font-semibold text-white">
                {t("hw.chooseGrade")}
              </h2>
              <p className="mt-1 text-xs text-slate-300">
                {t("hw.gradeDifficultyNote")}
              </p>

              <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-3">
                {gradeMeta.map((g) => (
                  <button
                    key={g.key}
                    type="button"
                    onClick={() => startGame(g.key)}
                    className={`group rounded-2xl bg-gradient-to-br ${g.bg} p-[1px] shadow-lg shadow-black/30`}
                  >
                    <div className={`rounded-2xl bg-slate-950/70 p-4 text-left ring-1 ${g.ring} transition group-hover:bg-slate-950/55`}>
                      <div className="flex items-start justify-between">
                        <Star className="h-4 w-4 text-yellow-200/90" />
                      </div>
                      <div className={`mt-3 text-lg ${g.font} text-white uppercase`}>{g.label}</div>
                      <div className="mt-1 text-xs font-bold text-slate-300">{g.hint}</div>
                      <div className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-sky-200">
                        {t("hw.startLabel")} <ArrowRight className="h-3 w-3" />
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              <div className="mt-4 rounded-xl bg-slate-900/40 p-3 text-xs text-slate-300 ring-1 ring-white/10">
                {t("hw.gradeTip")} <span className="font-semibold text-white">{t("hw.gradeTipBold")}</span>
                {" "}{t("hw.gradeTipEnd")}
              </div>
            </div>
          </div>
        </div>

        <p className="mt-4 text-center text-xs text-slate-400">
          {t("hw.disclaimer")}
        </p>
      </div>
    </div>
  );
}
