import React, { useEffect, useState } from "react";
import Dashboard from "../components/Dashboard.jsx";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft, Activity, Calendar, Clock, BookOpen,
  MessageCircle, HelpCircle, FileText, CheckCircle2, TrendingUp, Sparkles, AlertCircle
} from "lucide-react";
import axios from "axios";

import { AuthEndPoint } from "../utils/ApiRequest.js";
import { authHeaders } from "../utils/authSession.js";
import { normalizeApiRecord } from "../utils/apiNormalize.js";

const ParentPanel = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const recentTrials = [
    { date: "Oct 24, 2025", type: "Eye Tracking", score: 85, color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20" },
    { date: "Oct 22, 2025", type: "Voice Analysis", score: 72, color: "text-purple-400", bg: "bg-purple-500/10", border: "border-purple-500/20" },
    { date: "Oct 20, 2025", type: "Posture Tracking", score: 68, color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20" }
  ];

  useEffect(() => {
    const loadProfile = async () => {
      setLoading(true);
      setError("");
      try {
        const { data } = await axios.get(`${AuthEndPoint}/parent/me`, { headers: authHeaders() });
        setProfile(normalizeApiRecord(data));
      } catch (requestError) {
        setError(requestError?.response?.data?.detail || "Failed to load profile");
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  return (
    <Dashboard roleLabel={t("parent.dashboard")}>
      <div className="font-sans flex flex-col gap-6 max-w-6xl mx-auto mt-2 pb-8 animate-adhdSnap">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/")}
              className="group flex items-center justify-center w-10 h-10 rounded-full bg-slate-800/50 hover:bg-slate-700 transition-colors border border-slate-700/50 hover:border-slate-500 shrink-0 shadow-lg shadow-black/20"
            >
              <ArrowLeft className="w-5 h-5 text-slate-400 group-hover:text-white group-hover:-translate-x-0.5 transition-all" />
            </button>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl font-bold text-white tracking-tight">Parent Portal</h1>
                <span className="bg-clinic-primary/20 border border-clinic-primary/30 text-clinic-primary text-[10px] font-bold px-2 py-0.5 rounded-full mt-1">
                  {profile?.parentId || profile?.parent_id || "Parent ID pending"}
                </span>
                {profile?.childName && (
                  <span className="bg-clinic-secondary/20 border border-clinic-secondary/30 text-clinic-secondary text-[10px] font-bold px-2 py-0.5 rounded-full mt-1">
                    Child: {profile.childName}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400">Track your child's progress, view reports, and connect with their doctor.</p>
            </div>
          </div>

          <div className="flex gap-2">
            <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 px-4 py-2 rounded-xl text-emerald-400 text-xs font-semibold shadow-inner">
              <Calendar className="w-4 h-4" />
              <span>Next Visit: Nov 12</span>
            </div>
          </div>
        </div>

        {loading && <div className="rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-slate-300">Loading parent profile...</div>}
        {error && <div className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">{error}</div>}

        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-indigo-900/40 to-slate-900 p-6 md:p-8 shadow-2xl">
          <div className="absolute top-[-50%] right-[-10%] w-[50%] h-[150%] rounded-full bg-indigo-500/10 blur-[80px] pointer-events-none"></div>

          <div className="relative z-10 flex flex-col md:flex-row gap-6 justify-between items-center text-center md:text-left">
            <div className="max-w-xl">
              <div className="inline-flex items-center gap-2 rounded-full bg-indigo-500/20 border border-indigo-500/30 px-3 py-1 text-xs font-semibold text-indigo-300 mb-4">
                <Sparkles className="w-3.5 h-3.5" /> Weekly Summary Ready
              </div>
              <h2 className="text-2xl md:text-3xl font-extrabold text-white mb-2 leading-tight">
                {profile?.childName || profile?.child_name || "Your child"} is being tracked through the ADHD assessment portal.
              </h2>
              <p className="text-sm text-slate-300 leading-relaxed">
                {profile?.doctor ? `Assigned doctor: ${profile.doctor.fullName || profile.doctor.full_name} (${profile.doctor.specialization || "Specialist"})` : "Assigned doctor details will appear here once available."}
              </p>
            </div>

            <div className="shrink-0 flex flex-col gap-3 w-full md:w-auto mt-4 md:mt-0">
              <button className="flex items-center justify-center gap-2 w-full md:w-auto px-6 py-3 rounded-xl bg-indigo-500 text-white font-bold text-sm shadow-lg shadow-indigo-500/30 hover:bg-indigo-400 hover:shadow-indigo-500/50 hover:scale-105 active:scale-95 transition-all">
                <FileText className="w-4 h-4" /> View Full Report
              </button>
              <button className="flex items-center justify-center gap-2 w-full md:w-auto px-6 py-3 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 font-semibold text-sm hover:bg-slate-700 hover:text-white transition-all">
                <Activity className="w-4 h-4 text-emerald-400" /> Start New Trial
              </button>
            </div>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-[1.6fr,1.4fr]">
          <section className="flex flex-col gap-6">
            <div className="rounded-3xl border border-slate-700/60 bg-gradient-to-b from-clinic-surfaceDark to-slate-900 p-6 shadow-xl relative overflow-hidden">
              <h2 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-clinic-secondary" />
                {t("parent.childOverview")}
              </h2>

              <div className="grid grid-cols-2 gap-3 mb-6">
                <div className="bg-black/40 border border-slate-800 p-3 rounded-2xl flex flex-col justify-center items-center text-center group hover:border-blue-500/30 transition-colors">
                  <p className="text-[10px] uppercase font-semibold tracking-wider text-slate-500 mb-1">Parent</p>
                  <p className="text-3xl font-black text-white group-hover:text-blue-400 transition-colors">{profile?.fullName ? profile.fullName.split(" ")[0] : profile?.full_name ? profile.full_name.split(" ")[0] : "N/A"}</p>
                </div>
                <div className="bg-black/40 border border-slate-800 p-3 rounded-2xl flex flex-col justify-center items-center text-center group hover:border-emerald-500/30 transition-colors">
                  <p className="text-[10px] uppercase font-semibold tracking-wider text-slate-500 mb-1">Child</p>
                  <p className="text-3xl font-black text-white group-hover:text-emerald-400 transition-colors flex items-center gap-1">{profile?.childName || profile?.child_name || "N/A"}</p>
                </div>
              </div>

              <h3 className="text-xs font-semibold text-slate-400 mb-3 uppercase tracking-wider">Recent Activity Log</h3>
              <div className="space-y-3">
                {recentTrials.map((trial, idx) => (
                  <div key={idx} className="flex items-center justify-between bg-black/30 border border-white/5 p-3 rounded-xl hover:bg-black/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${trial.bg} ${trial.border} border`}>
                        <Activity className={`w-4 h-4 ${trial.color}`} />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-white">{trial.type}</p>
                        <p className="text-[10px] text-slate-500 flex items-center gap-1"><Clock className="w-3 h-3" /> {trial.date}</p>
                      </div>
                    </div>
                    <div className="text-right flex flex-col items-end">
                      <div className="flex items-center gap-1 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded text-emerald-400 text-xs font-bold">
                        Score: {trial.score}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-3xl border border-slate-700/60 bg-clinic-surfaceDark p-6 shadow-xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-5">
                <MessageCircle className="w-24 h-24" />
              </div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-4 relative z-10">
                <MessageCircle className="w-4 h-4 text-amber-400" />
                {t("parent.doctorMessages")}
              </h3>

              <div className="bg-amber-500/5 border border-amber-500/20 p-4 rounded-2xl relative z-10">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center border border-amber-500/30 flex-shrink-0">
                    <span className="text-amber-500 font-bold text-xs">Dr</span>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-xs font-bold text-white">{profile?.doctor?.fullName || profile?.doctor?.full_name || "Assigned Doctor"}</p>
                      <p className="text-[10px] text-slate-500">Yesterday, 4:30 PM</p>
                    </div>
                    <p className="text-xs text-amber-200/90 leading-relaxed bg-black/20 p-3 rounded-xl rounded-tl-none border border-amber-500/10">
                      {profile?.doctor ? `Assigned doctor: ${profile.doctor.fullName || profile.doctor.full_name} (${profile.doctor.medicalCouncilId || profile.doctor.medical_council_id || "License pending"})` : "Doctor communication will appear here once the account is assigned."}
                    </p>
                    <button className="text-[10px] font-bold text-amber-500 uppercase tracking-wider mt-2 hover:text-amber-400 transition-colors">
                      Reply to Doctor
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <aside className="space-y-6">
            <div className="rounded-3xl bg-gradient-to-br from-emerald-900/30 to-slate-900 p-6 shadow-xl border border-emerald-500/20 relative overflow-hidden">
              <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-emerald-500/10 blur-[40px] rounded-full pointer-events-none"></div>

              <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-4 relative z-10">
                <BookOpen className="w-4 h-4 text-emerald-400" />
                Your Action Plan
              </h3>

              <ul className="space-y-3 relative z-10">
                {[
                  { text: t("parent.homePractice"), done: true },
                  { text: t("parent.schoolNotes"), done: false },
                  { text: t("parent.askDoctor"), done: false }
                ].map((step, i) => (
                  <li key={i} className="flex gap-3">
                    <div className="mt-0.5">
                      {step.done ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      ) : (
                        <div className="w-4 h-4 rounded-full border border-slate-600" />
                      )}
                    </div>
                    <span className={`text-xs leading-relaxed ${step.done ? 'text-slate-500 line-through' : 'text-slate-300'}`}>
                      {step.text}
                    </span>
                  </li>
                ))}
              </ul>

              <button className="mt-5 w-full bg-black/40 border border-emerald-500/30 text-emerald-400 text-xs font-bold py-2 rounded-xl hover:bg-emerald-500/10 transition-colors">
                View All Tasks
              </button>
            </div>

            <div className="rounded-3xl bg-slate-900 p-6 shadow-xl border border-slate-800">
              <h3 className="text-sm font-bold text-slate-300 flex items-center gap-2 mb-4">
                <HelpCircle className="w-4 h-4 text-blue-400" />
                Help Center
              </h3>

              <div className="grid gap-2">
                <a href="#" className="flex items-center justify-between p-3 rounded-xl bg-black/40 border border-slate-700/50 hover:bg-slate-800 transition-colors group">
                  <div className="flex items-center gap-2 text-xs text-slate-300 group-hover:text-white transition-colors">
                    <AlertCircle className="w-4 h-4 text-slate-500 group-hover:text-blue-400 transition-colors" /> Technical Support
                  </div>
                </a>
                <a href="#" className="flex items-center justify-between p-3 rounded-xl bg-black/40 border border-slate-700/50 hover:bg-slate-800 transition-colors group">
                  <div className="flex items-center gap-2 text-xs text-slate-300 group-hover:text-white transition-colors">
                    <BookOpen className="w-4 h-4 text-slate-500 group-hover:text-blue-400 transition-colors" /> Reading Guide on ADHD
                  </div>
                </a>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </Dashboard>
  );
};

export default ParentPanel;
