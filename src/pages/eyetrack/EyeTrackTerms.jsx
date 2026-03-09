import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Eye, ShieldAlert, Play, CheckCircle2 } from "lucide-react";

const EyeTrackTerms = () => {
  const navigate = useNavigate();

  const handleContinue = () => {
    navigate("/eyetrack/child-game");
  };

  const handleBack = () => {
    navigate("/guest");
  };

  return (
    <div className="min-h-screen bg-clinic-bgDark flex flex-col relative overflow-hidden font-sans text-clinic-textDark">
      {/* Dynamic Background FX */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-clinic-primary/20 blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-clinic-secondary/20 blur-[120px]"></div>
      </div>

      {/* Top bar */}
      <header className="relative z-10 border-b border-white/10 bg-black/20 backdrop-blur-lg">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-clinic-primary to-clinic-secondary shadow-lg">
              <Eye className="h-5 w-5 text-white" />
            </div>
            <div className="leading-tight">
              <p className="text-base font-bold text-white tracking-tight">
                ADHD Care Portal
              </p>
              <p className="text-xs text-blue-200/70 font-medium">
                Eye Tracking Assessment
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="relative z-10 mx-auto flex w-full max-w-5xl flex-col flex-1 px-4 py-8 md:py-12 justify-center">

        {/* Hero Section */}
        <div className="text-center mb-10 animate-adhdSnap">
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-4 py-1.5 mb-6 text-sm font-medium text-blue-300">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
            </span>
            Assessment Preparation
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-white mb-4">
            Eye Tracking <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">Game</span>
          </h1>
          <p className="text-lg text-slate-300 max-w-2xl mx-auto">
            Before we begin, please review the rules carefully to ensure accurate results for your child's assessment.
          </p>
        </div>

        {/* Content Card */}
        <div className="mx-auto w-full max-w-4xl rounded-3xl border border-white/10 bg-white/5 p-6 md:p-10 shadow-2xl backdrop-blur-xl animate-adhdFloat" style={{ animationDuration: '6s' }}>

          {/* Parent guidance */}
          <div className="flex flex-col md:flex-row gap-5 items-start rounded-2xl border border-amber-500/30 bg-gradient-to-r from-amber-500/10 to-orange-500/5 p-6 mb-8 relative overflow-hidden group">
            <div className="absolute inset-0 bg-amber-500/10 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="flex-shrink-0 flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500/20 text-amber-500 shadow-inner border border-amber-500/30">
              <ShieldAlert className="h-7 w-7" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-amber-400 flex items-center gap-2">
                Parent/Guardian Guidance Required
              </h3>
              <p className="mt-2 text-sm md:text-base leading-relaxed text-amber-100/80">
                A parent or guardian must supervise this assessment. It is crucial for the success of the eye-tracking detection that <strong className="text-amber-300 font-semibold px-1">only the child's eyes</strong> are visible to the camera during gameplay.
              </p>
            </div>
          </div>

          {/* Rules structured nicely */}
          <div className="space-y-6">
            <div className="flex items-center gap-3 border-b border-white/10 pb-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500/20 text-blue-400">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <h2 className="text-xl font-semibold text-white">
                Important Rule <span className="text-slate-400 text-sm md:text-base font-normal ml-2">(Please read in your preferred language)</span>
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {/* English */}
              <div className="rounded-2xl border border-slate-700/50 bg-slate-800/40 p-6 hover:bg-slate-800/70 hover:border-blue-500/50 transition-all duration-300 cursor-default group hover:-translate-y-1 hover:shadow-lg hover:shadow-blue-500/10">
                <p className="text-xs font-bold uppercase tracking-wider text-blue-400 mb-3 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500 group-hover:scale-150 transition-transform"></span>
                  English
                </p>
                <p className="text-sm leading-relaxed text-slate-300">
                  If parents are near the child, they must hide their eyes; only the child's eyes should be visible to the camera.
                </p>
              </div>

              {/* Sinhala */}
              <div className="rounded-2xl border border-slate-700/50 bg-slate-800/40 p-6 hover:bg-slate-800/70 hover:border-emerald-500/50 transition-all duration-300 cursor-default group hover:-translate-y-1 hover:shadow-lg hover:shadow-emerald-500/10">
                <p className="text-xs font-bold uppercase tracking-wider text-emerald-400 mb-3 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 group-hover:scale-150 transition-transform"></span>
                  සිංහල
                </p>
                <p className="text-sm leading-relaxed text-slate-300">
                  දෙමාපියන් හෝ භාරකරු දරුවා අසල සිටිනවා නම්, ඔවුන්ගේ ඇස් කැමරාවට නොපෙනෙන ලෙස සිටිය යුතුය. කැමරාවට පෙනිය යුත්තේ දරුවාගේ ඇස් පමණි.
                </p>
              </div>

              {/* Tamil */}
              <div className="rounded-2xl border border-slate-700/50 bg-slate-800/40 p-6 hover:bg-slate-800/70 hover:border-purple-500/50 transition-all duration-300 cursor-default group hover:-translate-y-1 hover:shadow-lg hover:shadow-purple-500/10">
                <p className="text-xs font-bold uppercase tracking-wider text-purple-400 mb-3 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-500 group-hover:scale-150 transition-transform"></span>
                  தமிழ்
                </p>
                <p className="text-sm leading-relaxed text-slate-300">
                  பெற்றோர் அல்லது பாதுகாவலர் குழந்தையின் அருகில் இருந்தால், அவர்களின் கண்கள் கேமராவில் தெரியக்கூடாது. கேமராவில் குழந்தையின் கண்கள் மட்டும் தெளிவாகத் தெரிவது அவசியம்.
                </p>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="mt-10 flex flex-col sm:flex-row gap-4 pt-8 border-t border-white/10">
            <button
              type="button"
              onClick={handleBack}
              className="group flex-1 inline-flex items-center justify-center gap-2 rounded-xl border border-slate-600 bg-transparent px-6 py-4 text-sm font-semibold text-slate-300 transition-all duration-300 hover:bg-slate-800 hover:text-white hover:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 focus:ring-offset-clinic-bgDark"
            >
              <ArrowLeft className="h-5 w-5 transition-transform group-hover:-translate-x-1" />
              Back to Dashboard
            </button>

            <button
              type="button"
              onClick={handleContinue}
              className="group flex-[2] relative overflow-hidden inline-flex items-center justify-center gap-3 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 px-6 py-4 text-sm font-bold text-white shadow-lg shadow-blue-500/30 transition-all duration-300 hover:scale-[1.02] hover:shadow-blue-500/50 hover:from-blue-500 hover:to-cyan-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-clinic-bgDark"
            >
              <span className="absolute right-0 w-32 h-full -mr-8 transition-transform duration-700 ease-out transform skew-x-[45deg] bg-white opacity-10 group-hover:-translate-x-full"></span>
              <span className="relative z-10 text-base">I Understand, Continue</span>
              <Play className="h-5 w-5 fill-white relative z-10 transition-transform group-hover:translate-x-1 group-hover:scale-110" />
            </button>
          </div>
        </div>

        {/* Footer info */}
        <p className="text-center text-xs md:text-sm text-slate-500 mt-8">
          By continuing, you agree to ensure the environment is set up according to the rules above.
        </p>
      </main>
    </div>
  );
};

export default EyeTrackTerms;