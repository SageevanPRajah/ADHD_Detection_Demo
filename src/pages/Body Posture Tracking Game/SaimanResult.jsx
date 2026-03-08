import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Activity, Zap, TrendingUp, Maximize, BarChart2, Move, ArrowLeft, Trophy } from "lucide-react";

export default function SaimanResult() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [result, setResult] = useState(null);

  useEffect(() => {
    const stored = localStorage.getItem("saimanAdhdResult");
    if (stored) setResult(JSON.parse(stored));
  }, []);

  if (!result) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white bg-[#0e1b4d]">
        {t("saimanResult.noResult")}
      </div>
    );
  }

  const getRiskData = (score) => {
    if (score < 3.5) return { label: "LOW RISK", color: "text-emerald-400", border: "border-emerald-500/30" };
    if (score < 7.0) return { label: "MODERATE RISK", color: "text-amber-400", border: "border-amber-500/30" };
    return { label: "HIGH RISK", color: "text-rose-400", border: "border-rose-500/30" };
  };
  const risk = getRiskData(result.adhd_score);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#152663] via-[#2445a3] to-[#345ba3] text-white px-6 py-8 selection:bg-blue-500/30 font-sans">
      <div className="max-w-4xl mx-auto">
        <header className="flex items-center justify-between mb-8">
           <button onClick={() => navigate("/saiman-game")} className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl transition-colors border border-white/5">
             <ArrowLeft className="w-6 h-6" />
           </button>
           <h1 className="text-2xl font-black tracking-tight uppercase tracking-widest text-white/60">{t("saimanResult.title")}</h1>
           <div className="w-10 h-10 rounded-xl bg-blue-500 flex items-center justify-center shadow-lg shadow-blue-500/20 text-white">
              <Trophy className="w-5 h-5 flex-shrink-0" />
           </div>
        </header>

        {/* PRIMARY RESULTS HERO - CENTERED */}
        <div className="flex flex-col items-center justify-center mb-10">
          {/* SCORE CARD */}
          <div className="p-10 border shadow-2xl bg-slate-900/60 backdrop-blur-xl rounded-[3rem] border-white/10 relative overflow-hidden flex flex-col items-center justify-center min-w-[320px] max-w-full">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 blur-[50px] rounded-full pointer-events-none" />
            <p className="text-xs font-black uppercase tracking-[0.3em] text-blue-400 mb-6">{t("saimanResult.riskScore")}</p>
            <div className="relative mb-6">
               <p className="text-[10rem] font-black tracking-tighter bg-gradient-to-br from-white to-white/40 bg-clip-text text-transparent leading-none">
                 {result.adhd_score}
               </p>
               <span className="absolute -right-10 bottom-6 text-xl font-black text-white/10">/ 10</span>
            </div>

            {/* RISK LEVEL BADGE */}
            <div className={`px-8 py-2.5 rounded-full border ${risk.border} bg-white/5 backdrop-blur-md flex items-center gap-2 ring-1 ring-white/10 shadow-xl shadow-black/20`}>
              <Zap className={`w-4 h-4 ${risk.color} animate-pulse`} />
              <span className={`text-sm font-black uppercase tracking-[0.2em] leading-none ${risk.color}`}>
                {risk.label}
              </span>
            </div>
          </div>
        </div>

        {/* TECHNICAL DETAILS SECTION - SEPARATE */}
        <section className="mt-16">
          <div className="flex items-center gap-4 mb-8">
             <div className="h-[1px] flex-1 bg-white/10" />
             <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-2xl border border-white/5">
                <BarChart2 className="w-4 h-4 text-white/40" />
                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40">Technical Model Features</h3>
             </div>
             <div className="h-[1px] flex-1 bg-white/10" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 opacity-70 hover:opacity-100 transition-opacity duration-500">
            <Feature icon={<Activity />} name={t("saimanResult.fidgetScore")} value={result.derived_features.fidget_score} hint={t("saimanResult.fidgetHint")} />
            <Feature icon={<Zap />} name={t("saimanResult.freezeStability")} value={result.derived_features.stability_score} hint={t("saimanResult.freezeHint")} />
            <Feature icon={<TrendingUp />} name={t("saimanResult.meanVelocity")} value={result.derived_features.mean_velocity} hint={t("saimanResult.meanVelHint")} />
            <Feature icon={<Maximize />} name={t("saimanResult.maxVelocity")} value={result.derived_features.max_velocity} hint={t("saimanResult.maxVelHint")} />
            <Feature icon={<BarChart2 />} name={t("saimanResult.motionVar")} value={result.derived_features.std_velocity} hint={t("saimanResult.motionVarHint")} />
            <Feature icon={<Move />} name={t("saimanResult.postureSway")} value={`${result.derived_features.sway_x.toFixed(3)}, ${result.derived_features.sway_y.toFixed(3)}`} hint={t("saimanResult.postureSwayHint")} />
          </div>
        </section>

        {/* FOOTER */}
        <div className="flex justify-center mt-12">
          <button 
            onClick={() => navigate("/saiman-game")} 
            className="group flex items-center gap-3 px-10 py-5 rounded-[2rem] bg-blue-600 hover:bg-blue-500 text-white font-black uppercase tracking-widest text-sm transition-all shadow-xl shadow-blue-600/20 hover:scale-105 active:scale-95"
          >
            {t("saimanResult.backToHome")}
          </button>
        </div>
      </div>
    </div>
  );
}

function Feature({ icon, name, value, hint }) {
  const displayValue = typeof value === 'string' ? value : Number(value).toFixed(3);
  return (
    <div className="p-6 rounded-[2rem] bg-white/[0.02] border border-white/5 hover:border-blue-500/30 transition-all group relative overflow-hidden">
      <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity text-blue-500">
        {React.cloneElement(icon, { size: 100 })}
      </div>
      
      <div className="flex flex-col h-full relative z-10">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400">
            {React.cloneElement(icon, { size: 18 })}
          </div>
          <p className="font-black text-[10px] text-white/40 uppercase tracking-[0.2em]">{name}</p>
        </div>
        
        <div className="mt-auto">
          <p className="text-3xl font-black text-white group-hover:text-blue-400 transition-colors tracking-tight">
            {displayValue}
          </p>
          <div className="mt-3">
             <p className="text-[11px] font-medium text-white/30 leading-tight">
               {hint}
             </p>
          </div>
        </div>
      </div>
    </div>
  );
}
