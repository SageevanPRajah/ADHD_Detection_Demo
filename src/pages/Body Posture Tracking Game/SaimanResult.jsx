import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Activity, 
  ChevronLeft, 
  Zap, 
  Wind, 
  Move, 
  BarChart3, 
  AlertCircle,
  BrainCircuit
} from "lucide-react";

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
        <div className="text-center">
          <AlertCircle className="w-12 h-12 mx-auto mb-4 text-red-400 opacity-50" />
          <p className="text-xl font-medium">No result found</p>
          <button 
            onClick={() => navigate("/saiman-game")}
            className="mt-6 px-6 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
          >
            Return to Assessment
          </button>
        </div>
      </div>
    );
  }

  const getScoreColor = (score) => {
    if (score >= 7) return "text-red-400";
    if (score >= 4) return "text-yellow-400";
    return "text-green-400";
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0e1b4d] via-[#1b3a8f] to-[#274690] text-white px-4 py-12 font-sans">
      <div className="max-w-4xl mx-auto">
        {/* HEADER */}
        <div className="flex items-center justify-between mb-12">
          <button
            onClick={() => navigate("/saiman-game")}
            className="group flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all"
          >
            <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span>Back</span>
          </button>
          
          <div className="flex items-center gap-3">
             <BrainCircuit className="w-10 h-10 text-blue-400" />
             <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/70">
              Screening Results
            </h1>
          </div>
          <div className="w-24" /> {/* Spacer */}
        </div>

        {/* MAIN SCORE CARD */}
        <div className="relative mb-8 p-10 rounded-[2.5rem] bg-white/[0.03] border border-white/10 backdrop-blur-xl overflow-hidden group">
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-blue-500/10 rounded-full blur-[80px]" />
          
          <div className="relative flex flex-col items-center text-center">
            <span className="px-4 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold uppercase tracking-wider mb-4">
              ADHD Risk Indicators
            </span>
            <p className="text-white/60 text-lg mb-2">Overall Risk Score</p>
            <div className={`text-8xl font-black tracking-tighter ${getScoreColor(result.adhd_score)}`}>
              {result.adhd_score}<span className="text-3xl text-white/20 ml-2">/ 10</span>
            </div>
            
            <div className="mt-8 flex gap-8 items-center text-sm text-white/50">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-400" />
                <span>Low Risk</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-yellow-400" />
                <span>Moderate</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-red-400" />
                <span>High Risk</span>
              </div>
            </div>
          </div>
        </div>

        {/* FEATURES GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <FeatureCard
            icon={<Activity className="text-orange-400" />}
            name="Fidgeting Score"
            value={result.derived_features.fidget_score}
            hint="Measures restlessness and micro-movements"
            info="Higher values indicate increased physical activity throughout the session."
          />
          <FeatureCard
            icon={<Zap className="text-yellow-400" />}
            name="Freeze Stability"
            value={result.derived_features.stability_score}
            hint="Measures motor control during pause"
            info="A lower score indicates better motor stability and controlled movements."
          />
          <FeatureCard
            icon={<Move className="text-blue-400" />}
            name="Mean Velocity"
            value={result.derived_features.mean_velocity}
            hint="Average physical movement speed"
            info="Reflects the general pace of movement during structured tasks."
          />
          <FeatureCard
            icon={<Wind className="text-purple-400" />}
            name="Max Velocity"
            value={result.derived_features.max_velocity}
            hint="Sudden impulsive motor spikes"
            info="High peaks can be associated with impulsive physical reactions."
          />
          <FeatureCard
            icon={<BarChart3 className="text-emerald-400" />}
            name="Motion Variability"
            value={result.derived_features.std_velocity}
            hint="Consistency of movement patterns"
            info="Standard deviation of velocity, showing how erratic movements were."
          />
          <FeatureCard
            icon={<Activity className="text-rose-400" />}
            name="Posture Sway"
            value={`${result.derived_features.sway_x.toFixed(3)} / ${result.derived_features.sway_y.toFixed(3)}`}
            hint="Core body balance (X/Y axis)"
            info="Indicates side-to-side and front-to-back postural stability."
          />
        </div>

        {/* RECOMMENDATION PLACEHOLDER */}
        <div className="mt-8 p-6 rounded-3xl bg-blue-500/5 border border-blue-500/10 flex items-start gap-4">
           <div className="p-3 rounded-2xl bg-blue-500/10">
              <AlertCircle className="w-6 h-6 text-blue-400" />
           </div>
           <div>
              <h4 className="font-bold text-blue-200">Note to Parents/Doctors</h4>
              <p className="mt-1 text-sm text-blue-200/60 leading-relaxed">
                These results are generated by an AI model based on body posture and movement data. 
                They should be used as a screening tool only and not as a formal medical diagnosis. 
                Consult with a qualified healthcare professional for a complete clinical assessment.
              </p>
           </div>
        </div>
      </div>
    </div>
  );
}

function FeatureCard({ icon, name, value, hint, info }) {
  const displayValue = typeof value === 'string' ? value : Number(value).toFixed(3);
  
  return (
    <div className="p-6 rounded-[2rem] bg-white/[0.02] border border-white/5 hover:border-white/20 transition-all group relative overflow-hidden">
      <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
        {icon}
      </div>
      
      <div className="flex flex-col h-full">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-xl bg-white/5">
            {React.cloneElement(icon, { size: 18 })}
          </div>
          <p className="font-bold text-sm text-white/50 uppercase tracking-wider">{name}</p>
        </div>
        
        <div className="mt-auto">
          <p className="text-3xl font-black text-white group-hover:text-blue-400 transition-colors uppercase tracking-tight">
            {displayValue}
          </p>
          <div className="mt-3">
             <p className="text-[11px] font-medium text-white/40 leading-tight">
               {hint}
             </p>
          </div>
        </div>
      </div>
    </div>
  );
}
