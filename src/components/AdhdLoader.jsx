import React, { useEffect, useState } from "react";
import { Activity, Eye, ScanSearch, Sparkles } from "lucide-react";

const AdhdLoader = () => {
  const [loadingText, setLoadingText] = useState("Initializing Engine...");

  // Cycle through loading states for a dynamic feel
  useEffect(() => {
    const states = [
      "Initializing Engine...",
      "Calibrating Sensors...",
      "Loading Assessment...",
      "Preparing Environment..."
    ];
    let index = 0;
    const interval = setInterval(() => {
      index = (index + 1) % states.length;
      setLoadingText(states[index]);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-clinic-bgDark relative overflow-hidden font-sans">
      {/* Background FX */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
        <div className="absolute w-[600px] h-[600px] rounded-full bg-blue-500/5 blur-[120px] animate-pulse"></div>
        <div className="absolute w-[400px] h-[400px] rounded-full bg-cyan-500/10 blur-[80px] animate-[pulse_3s_ease-in-out_infinite]"></div>
      </div>

      <div className="relative z-10 flex flex-col items-center gap-12">
        {/* Main Central Animation */}
        <div className="relative flex items-center justify-center">
          {/* Outer Rotating Dashed Ring */}
          <div className="absolute w-40 h-40 rounded-full border-[2px] border-dashed border-blue-500/30 animate-[spin_8s_linear_infinite]"></div>

          {/* Middle Counter-Rotating Solid Ring with glow */}
          <div className="absolute w-32 h-32 rounded-full border border-cyan-400/50 shadow-[0_0_30px_rgba(34,211,238,0.3)] animate-[spin_6s_linear_reverse_infinite] flex items-center justify-center">
            <div className="w-2 h-2 bg-cyan-400 rounded-full absolute -top-1 shadow-[0_0_10px_#22d3ee]"></div>
          </div>

          {/* Inner Pulsing Core */}
          <div className="relative flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-blue-600 to-cyan-500 shadow-[0_0_40px_rgba(59,130,246,0.5)] animate-adhdFloat">
            {/* Core Scanner Line */}
            <div className="absolute inset-x-0 h-[2px] bg-white/50 shadow-[0_0_8px_#ffffff] w-full animate-[scan_2s_ease-in-out_infinite]"></div>

            <Eye className="w-10 h-10 text-white relative z-10" />
          </div>

          {/* Floating Accents */}
          <Sparkles className="absolute -top-6 -right-6 w-5 h-5 text-cyan-300 animate-[pulse_2s_ease-in-out_infinite]" style={{ animationDelay: "0.2s" }} />
          <Activity className="absolute -bottom-8 -left-8 w-6 h-6 text-blue-400 animate-[pulse_2s_ease-in-out_infinite]" style={{ animationDelay: "0.8s" }} />
          <ScanSearch className="absolute -top-4 -left-10 w-5 h-5 text-emerald-400 animate-[pulse_2s_ease-in-out_infinite]" style={{ animationDelay: "1.5s" }} />
        </div>

        {/* Brand Text */}
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="flex items-center gap-2">
            <span className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300 tracking-wider">
              A
            </span>
            <span className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-emerald-300 tracking-wider animate-[pulse_2s_ease-in-out_infinite]" style={{ animationDelay: "0.2s" }}>
              D
            </span>
            <span className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 to-teal-400 tracking-wider animate-[pulse_2s_ease-in-out_infinite]" style={{ animationDelay: "0.4s" }}>
              H
            </span>
            <span className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-blue-500 tracking-wider animate-[pulse_2s_ease-in-out_infinite]" style={{ animationDelay: "0.6s" }}>
              D
            </span>
          </div>

          <div className="flex flex-col items-center gap-3">
            <div className="text-xs font-bold uppercase tracking-[0.3em] text-slate-400 flex items-center gap-2">
              Care Portal
            </div>

            {/* Loading Status Bar */}
            <div className="flex flex-col items-center gap-2 mt-2 w-48">
              <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-blue-500 via-cyan-400 to-blue-500 rounded-full w-[50%] animate-[progress_1.5s_ease-in-out_infinite_alternate]"></div>
              </div>
              <span className="text-[10px] uppercase font-semibold text-cyan-500 tracking-widest animate-pulse transition-all duration-300">
                {loadingText}
              </span>
            </div>
          </div>
        </div>
      </div>

      <style jsx="true">{`
        @keyframes scan {
          0%, 100% { top: 10%; opacity: 0; }
          10% { opacity: 1; }
          50% { top: 90%; }
          90% { opacity: 1; }
        }
        @keyframes progress {
          0% { width: 10%; transform: translateX(0); }
          50% { width: 80%; transform: translateX(20%); }
          100% { width: 10%; transform: translateX(900%); }
        }
      `}</style>
    </div>
  );
};

export default AdhdLoader;
