import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import Dashboard from "../components/Dashboard.jsx";
import AdhdLoader from "../components/AdhdLoader.jsx";
import SpiderMenu from "../components/SpiderMenu.jsx";
import { Brain, Sparkles, Activity, Eye, Mic, PenTool, CheckCircle2 } from "lucide-react";

const Home = () => {
  const [loading, setLoading] = useState(true);
  const { t } = useTranslation();

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 2600);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return <AdhdLoader />;
  }

  return (
    <Dashboard roleLabel={t("home.chooseRole")}>
      <div className="flex flex-col gap-16 pb-16 font-sans mt-4 max-w-7xl mx-auto">

        {/* Main Spider Menu Section */}
        <section className="animate-adhdSnap relative z-20">
          <SpiderMenu />
        </section>

        {/* Informational Divider */}
        <div className="flex items-center justify-center gap-4 animate-adhdSnap" style={{ animationDelay: "0.2s" }}>
          <div className="h-px w-24 bg-gradient-to-r from-transparent to-clinic-primary/50"></div>
          <span className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-clinic-primary">
            <Brain className="w-4 h-4" /> About the System
          </span>
          <div className="h-px w-24 bg-gradient-to-l from-transparent to-clinic-primary/50"></div>
        </div>

        {/* What is ADHD & How it Works Section */}
        <section className="grid md:grid-cols-2 gap-8 animate-adhdSnap" style={{ animationDelay: "0.4s" }}>

          {/* Info Card 1 */}
          <div className="rounded-3xl bg-gradient-to-br from-indigo-900/40 to-slate-900/80 p-8 shadow-2xl border border-indigo-500/20 relative overflow-hidden group">
            <div className="absolute -left-10 -top-10 w-40 h-40 bg-indigo-500/10 blur-[60px] rounded-full pointer-events-none group-hover:bg-indigo-500/20 transition-colors"></div>

            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 rounded-2xl bg-indigo-500/20 border border-indigo-500/30">
                  <Brain className="w-6 h-6 text-indigo-400" />
                </div>
                <h2 className="text-xl font-bold text-white tracking-tight">Understanding ADHD</h2>
              </div>

              <p className="text-sm text-slate-300 leading-relaxed mb-6">
                Attention-Deficit/Hyperactivity Disorder (ADHD) is a neurodevelopmental condition that affects focus, self-control, and executive functioning. Early and accurate detection allows children to receive the structured environment and behavioral support they need to thrive.
              </p>

              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-bold text-slate-200">Hyperactivity & Impulsivity</h4>
                    <p className="text-xs text-slate-400 mt-0.5">Difficulty staying seated, excessive talking, or acting without thinking.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-bold text-slate-200">Inattention</h4>
                    <p className="text-xs text-slate-400 mt-0.5">Struggling to sustain focus on tasks, losing things often, or being easily distracted.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Info Card 2 */}
          <div className="rounded-3xl bg-gradient-to-bl from-cyan-900/30 to-slate-900/80 p-8 shadow-2xl border border-cyan-500/20 relative overflow-hidden group">
            <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-cyan-500/10 blur-[60px] rounded-full pointer-events-none group-hover:bg-cyan-500/20 transition-colors"></div>

            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 rounded-2xl bg-cyan-500/20 border border-cyan-500/30">
                  <Sparkles className="w-6 h-6 text-cyan-400" />
                </div>
                <h2 className="text-xl font-bold text-white tracking-tight">Our Multi-Modal Approach</h2>
              </div>

              <p className="text-sm text-slate-300 leading-relaxed mb-6">
                This platform provides an objective screening baseline using four distinct computerized interactive games, powered by advanced tracking heuristics.
              </p>

              <div className="grid grid-cols-2 gap-3 mt-4">
                <div className="flex items-center gap-2 p-3 rounded-xl bg-black/40 border border-slate-700 hover:border-blue-500/50 transition-colors">
                  <Eye className="w-4 h-4 text-blue-400" />
                  <span className="text-xs font-semibold text-slate-200">Gaze Tracking</span>
                </div>
                <div className="flex items-center gap-2 p-3 rounded-xl bg-black/40 border border-slate-700 hover:border-emerald-500/50 transition-colors">
                  <Activity className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-semibold text-slate-200">Posture Analysis</span>
                </div>
                <div className="flex items-center gap-2 p-3 rounded-xl bg-black/40 border border-slate-700 hover:border-purple-500/50 transition-colors">
                  <Mic className="w-4 h-4 text-purple-400" />
                  <span className="text-xs font-semibold text-slate-200">Vocal Metrics</span>
                </div>
                <div className="flex items-center gap-2 p-3 rounded-xl bg-black/40 border border-slate-700 hover:border-amber-500/50 transition-colors">
                  <PenTool className="w-4 h-4 text-amber-400" />
                  <span className="text-xs font-semibold text-slate-200">Motor Control</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Portal Access Summary */}
        <section className="grid gap-4 text-xs text-slate-300 md:grid-cols-3 animate-adhdSnap" style={{ animationDelay: "0.6s" }}>
          <div className="rounded-2xl bg-gradient-to-br from-black/40 to-black/60 p-5 ring-1 ring-white/10 hover:ring-clinic-primary/50 transition-all hover:-translate-y-1">
            <h3 className="text-sm font-bold text-clinic-primary mb-2 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-clinic-primary"></span>
              {t("home.doctorView")}
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              {t("home.doctorViewDesc")} Access clinical dashboards, write medical notes, and review comprehensive assessment data across all patients.
            </p>
          </div>

          <div className="rounded-2xl bg-gradient-to-br from-black/40 to-black/60 p-5 ring-1 ring-white/10 hover:ring-clinic-secondary/50 transition-all hover:-translate-y-1">
            <h3 className="text-sm font-bold text-clinic-secondary mb-2 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-clinic-secondary"></span>
              {t("home.parentView")}
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              {t("home.parentViewDesc")} Log in to securely view your child's tracking timeline, read doctor notes, and continue guided at-home exercises.
            </p>
          </div>

          <div className="rounded-2xl bg-gradient-to-br from-black/40 to-black/60 p-5 ring-1 ring-white/10 hover:ring-indigo-500/50 transition-all hover:-translate-y-1">
            <h3 className="text-sm font-bold text-indigo-400 mb-2 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
              {t("home.adminView")}
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              {t("home.adminViewDesc")} Manage the entire care portal. Review incoming doctor registration requests and maintain central system routing.
            </p>
          </div>
        </section>

      </div>
    </Dashboard>
  );
};

export default Home;
