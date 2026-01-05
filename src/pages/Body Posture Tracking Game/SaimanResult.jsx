import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function SaimanResult() {
  const navigate = useNavigate();
  const [result, setResult] = useState(null);

  useEffect(() => {
    const stored = localStorage.getItem("saimanAdhdResult");
    if (stored) setResult(JSON.parse(stored));
  }, []);

  if (!result) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white bg-[#0e1b4d]">
        No result found
      </div>
    );
  }

  const riskColor =
    result.subtype === "Hyperactive-Impulsive"
      ? "text-red-400"
      : result.subtype === "Inattentive"
      ? "text-yellow-300"
      : "text-green-400";

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0e1b4d] via-[#1b3a8f] to-[#274690] text-white px-6 py-8">
      <h1 className="mb-10 text-4xl font-extrabold text-center">
        🧠 ADHD Screening Result
      </h1>

      {/* SCORE CARD */}
      <div className="max-w-3xl p-8 mx-auto border shadow-xl bg-white/10 rounded-3xl border-white/20">
        <div className="mb-8 text-center">
          <p className="text-lg text-white/70">ADHD Risk Score</p>
          <p className="mt-2 text-6xl font-black">
            {result.adhd_score} / 10
          </p>
          <p className={`text-2xl font-bold mt-3 ${riskColor}`}>
            {result.subtype}
          </p>
        </div>

        {/* META */}
        <div className="grid grid-cols-2 gap-4 mb-8 text-sm">
          <Info label="Child ID" value={result.child_id} />
          <Info label="Age" value={result.age} />
          <Info label="Gender" value={result.gender} />
          <Info label="Rounds Played" value={result.rounds} />
        </div>

        {/* DERIVED FEATURES */}
        <h3 className="mb-4 text-xl font-bold">
          🔍 Model Derived Features
        </h3>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <Feature
            name="Fidgeting Score"
            value={result.derived_features.fidget_score}
            hint="Higher = more restlessness"
          />
          <Feature
            name="Freeze Stability"
            value={result.derived_features.stability_score}
            hint="Lower = poor motor control"
          />
          <Feature
            name="Mean Velocity"
            value={result.derived_features.mean_velocity}
            hint="Average movement speed"
          />
          <Feature
            name="Max Velocity"
            value={result.derived_features.max_velocity}
            hint="Sudden impulsive motion"
          />
          <Feature
            name="Motion Variability"
            value={result.derived_features.std_velocity}
            hint="Movement inconsistency"
          />
          <Feature
            name="Posture Sway (X/Y)"
            value={`${result.derived_features.sway_x.toFixed(3)}, ${result.derived_features.sway_y.toFixed(3)}`}
            hint="Body balance"
          />
        </div>
      </div>

      {/* FOOTER */}
      <div className="flex justify-center mt-10">
        <button
          onClick={() => navigate("/")}
          className="px-8 py-3 rounded-xl bg-white/20 hover:bg-white/30"
        >
          Back to Home
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
  // Handle both number and string values
  const displayValue = typeof value === 'string' ? value : Number(value).toFixed(3);
  
  return (
    <div className="p-4 border bg-white/5 rounded-xl border-white/10">
      <p className="font-semibold">{name}</p>
      <p className="mt-1 text-lg font-bold">{displayValue}</p>
      <p className="mt-1 text-xs text-white/60">{hint}</p>
    </div>
  );
}
