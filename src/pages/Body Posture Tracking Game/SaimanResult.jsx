import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

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

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0e1b4d] via-[#1b3a8f] to-[#274690] text-white px-6 py-8">
      <h1 className="mb-10 text-4xl font-extrabold text-center">{t("saimanResult.title")}</h1>

      {/* SCORE CARD */}
      <div className="max-w-3xl p-8 mx-auto border shadow-xl bg-white/10 rounded-3xl border-white/20">
        <div className="mb-8 text-center">
          <p className="text-lg text-white/70">{t("saimanResult.riskScore")}</p>
          <p className="mt-2 text-6xl font-black">{result.adhd_score} / 10</p>
        </div>

        {/* META */}
        <div className="grid grid-cols-2 gap-4 mb-8 text-sm">
          <Info label={t("saimanResult.childId")} value={result.child_id} />
          <Info label={t("saimanResult.age")} value={result.age} />
          <Info label={t("saimanResult.gender")} value={result.gender} />
          <Info label={t("saimanResult.roundsPlayed")} value={result.rounds} />
        </div>

        {/* DERIVED FEATURES */}
        <h3 className="mb-4 text-xl font-bold">{t("saimanResult.modelFeatures")}</h3>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <Feature name={t("saimanResult.fidgetScore")} value={result.derived_features.fidget_score} hint={t("saimanResult.fidgetHint")} />
          <Feature name={t("saimanResult.freezeStability")} value={result.derived_features.stability_score} hint={t("saimanResult.freezeHint")} />
          <Feature name={t("saimanResult.meanVelocity")} value={result.derived_features.mean_velocity} hint={t("saimanResult.meanVelHint")} />
          <Feature name={t("saimanResult.maxVelocity")} value={result.derived_features.max_velocity} hint={t("saimanResult.maxVelHint")} />
          <Feature name={t("saimanResult.motionVar")} value={result.derived_features.std_velocity} hint={t("saimanResult.motionVarHint")} />
          <Feature name={t("saimanResult.postureSway")} value={`${result.derived_features.sway_x.toFixed(3)}, ${result.derived_features.sway_y.toFixed(3)}`} hint={t("saimanResult.postureSwayHint")} />
        </div>
      </div>

      {/* FOOTER */}
      <div className="flex justify-center mt-10">
        <button onClick={() => navigate("/saiman-game")} className="px-8 py-3 rounded-xl bg-white/20 hover:bg-white/30">
          {t("saimanResult.backToHome")}
        </button>
      </div>
    </div>
  );
}

function Info({ label, value }) {
  return (
    <div className="p-3 bg-white/5 rounded-xl">
      <p className="text-white/60">{label}</p>
      <p className="font-semibold">{value}</p>
    </div>
  );
}

function Feature({ name, value, hint }) {
  const displayValue = typeof value === 'string' ? value : Number(value).toFixed(3);
  return (
    <div className="p-4 border bg-white/5 rounded-xl border-white/10">
      <p className="font-semibold">{name}</p>
      <p className="mt-1 text-lg font-bold">{displayValue}</p>
      <p className="mt-1 text-xs text-white/60">{hint}</p>
    </div>
  );
}
