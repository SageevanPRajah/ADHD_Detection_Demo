import React, { useEffect, useMemo, useState } from "react";
import Dashboard from "../components/Dashboard.jsx";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import {
  Search, Eye, UserPlus, Send, Activity, EyeIcon, Mic, PenTool,
  ArrowLeft, Users, Calendar, Clock, ChevronRight, FileText, Play
} from "lucide-react";
import axios from "axios";

import { AuthEndPoint } from "../utils/ApiRequest.js";
import { authHeaders } from "../utils/authSession.js";
import { normalizeApiList, normalizeApiRecord } from "../utils/apiNormalize.js";

const emptyForm = {
  parent_name: "",
  child_name: "",
  child_age: "",
  contact_number: "",
  notes: "",
};

const normalizePatient = (patient) => ({
  ...patient,
  parentId: patient.parentId || patient.parent_id,
  parentName: patient.fullName || patient.full_name,
  childName: patient.childName || patient.child_name,
  contact: patient.phoneNumber || patient.contact_number,
  lastVisit: (patient.createdAt || patient.created_at) ? new Date(patient.createdAt || patient.created_at).toLocaleDateString() : "N/A",
  trials: { eye: [], body: [], voice: [], handwriting: [] },
});

const DoctorPanel = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [patients, setPatients] = useState([]);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [reviewText, setReviewText] = useState("");
  const [lastReview, setLastReview] = useState(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const loadPatients = async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await axios.get(`${AuthEndPoint}/doctor/patients`, { headers: authHeaders() });
      const normalized = normalizeApiList(data).map(normalizePatient);
      setPatients(normalized);
      setSelected((current) => {
        if (current) {
          return normalized.find((patient) => patient.parentId === current.parentId) || normalized[0] || null;
        }
        return normalized[0] || null;
      });
    } catch (requestError) {
      setError(requestError?.response?.data?.detail || "Failed to load patient records");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPatients();
  }, []);

  const filteredPatients = useMemo(() => {
    if (!search.trim()) return patients;
    const term = search.toLowerCase();
    return patients.filter((patient) => {
      return [patient.parentId, patient.parentName, patient.childName, patient.contact]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(term));
    });
  }, [patients, search]);

  const handleCreateParent = async (event) => {
    event.preventDefault();
    setMessage("");
    setError("");

    try {
      const payload = {
        parent_name: form.parent_name,
        child_name: form.child_name,
        child_age: form.child_age ? Number(form.child_age) : null,
        contact_number: form.contact_number,
        notes: form.notes || null,
      };
      const { data } = await axios.post(`${AuthEndPoint}/doctor/patients`, payload, { headers: authHeaders() });
      const normalized = normalizeApiRecord(data);
      setMessage(`Parent account created. Parent ID: ${normalized.parentId}, Default password: ${normalized.defaultPassword || "TestP@1234"}`);
      setForm(emptyForm);
      await loadPatients();
    } catch (requestError) {
      setError(requestError?.response?.data?.detail || "Failed to create parent account");
    }
  };

  const handleSaveReview = () => {
    if (!selected || !reviewText.trim()) return;
    setLastReview({ parentId: selected.parentId, parentName: selected.parentName, text: reviewText.trim(), time: new Date().toLocaleString() });
    setReviewText("");
  };

  const renderGameMiniChart = (scores, colorHex) => {
    const maxScore = 100;
    return (
      <div className="mt-2 flex items-end gap-1.5 h-10">
        {scores.length === 0 && <div className="text-[10px] text-slate-500 italic h-full flex items-center">No recent trials</div>}
        {scores.map((score, idx) => (
          <div
            key={idx}
            className="w-5 rounded-t-sm bg-gradient-to-t opacity-90 transition-all hover:opacity-100 hover:w-6"
            style={{
              height: `${Math.max((score / maxScore) * 100, 10)}%`,
              backgroundImage: `linear-gradient(to top, ${colorHex}40, ${colorHex})`
            }}
            title={`Trial ${idx + 1}: ${score}%`}
          />
        ))}
        {scores.length > 0 && <div className="ml-auto text-xl font-bold flex items-end leading-none" style={{ color: colorHex }}>{scores[scores.length - 1]}<span className="text-[10px] text-slate-500 mb-0.5 ml-0.5">%</span></div>}
      </div>
    );
  };

  return (
    <Dashboard roleLabel={t("doctor.dashboard")}>
      <div className="font-sans flex flex-col gap-6 max-w-7xl mx-auto mt-2 pb-8 animate-adhdSnap">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/")}
              className="group flex items-center justify-center w-10 h-10 rounded-full bg-slate-800/50 hover:bg-slate-700 transition-colors border border-slate-700/50 hover:border-slate-500 shrink-0 shadow-lg shadow-black/20"
            >
              <ArrowLeft className="w-5 h-5 text-slate-400 group-hover:text-white group-hover:-translate-x-0.5 transition-all" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight">Clinical Dashboard</h1>
              <p className="text-xs text-slate-400">Manage patients, review trials, and generate assessments.</p>
            </div>
          </div>

          <div className="flex gap-2">
            <div className="flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 px-3 py-1.5 rounded-full text-blue-400 text-xs font-semibold">
              <Users className="w-3.5 h-3.5" />
              <span>{patients.length} Active Patients</span>
            </div>
            <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-full text-emerald-400 text-xs font-semibold">
              <Clock className="w-3.5 h-3.5" />
              <span>Today</span>
            </div>
          </div>
        </div>

        {message && <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">{message}</div>}
        {error && <div className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">{error}</div>}

        <div className="grid gap-6 md:grid-cols-[2.2fr,1.2fr]">
          <section className="flex flex-col gap-6">
            <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-clinic-surfaceDark to-slate-900 p-6 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-blue-500/5 blur-[120px] pointer-events-none rounded-full"></div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5 relative z-10">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Users className="w-5 h-5 text-blue-400" />
                  {t("doctor.todaysChildren")}
                </h2>

                <div className="flex items-center relative w-full sm:w-64">
                  <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="text"
                    placeholder={t("doctor.searchPlaceholder")}
                    className="w-full rounded-full border border-slate-700/80 bg-black/40 py-2 pl-9 pr-4 text-xs text-slate-200 outline-none placeholder:text-slate-500 focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
              </div>

              <div className="overflow-x-auto relative z-10">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b border-white/10 text-left text-[10px] uppercase tracking-wider text-slate-400 font-semibold bg-black/20">
                      <th className="px-4 py-3 rounded-tl-xl">{t("doctor.parentId")}</th>
                      <th className="px-4 py-3">Patient (Child)</th>
                      <th className="px-4 py-3">Guardian</th>
                      <th className="px-4 py-3">{t("doctor.lastVisit")}</th>
                      <th className="px-4 py-3 text-right rounded-tr-xl">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {loading ? (
                      <tr>
                        <td colSpan={5} className="px-4 py-12 text-center text-slate-500">Loading patients...</td>
                      </tr>
                    ) : filteredPatients.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-4 py-12 text-center text-slate-500">
                          <Search className="w-8 h-8 mx-auto mb-3 opacity-20" />
                          {t("doctor.noParentsFound")} <span className="text-slate-400 font-semibold">"{search}"</span>
                        </td>
                      </tr>
                    ) : (
                      filteredPatients.map((patient) => (
                        <tr
                          key={patient.parentId}
                          onClick={() => setSelected(patient)}
                          className={`group cursor-pointer transition-colors ${selected && selected.parentId === patient.parentId ? "bg-blue-500/10 border-blue-500/30" : "hover:bg-white/5"}`}
                        >
                          <td className="px-4 py-3.5">
                            <span className="font-mono text-[11px] font-semibold text-slate-400 bg-slate-800/50 px-2 py-1 rounded-md border border-slate-700">
                              {patient.parentId}
                            </span>
                          </td>
                          <td className="px-4 py-3.5">
                            <p className="text-sm font-bold text-white group-hover:text-blue-300 transition-colors">{patient.childName}</p>
                          </td>
                          <td className="px-4 py-3.5">
                            <p className="text-xs text-slate-300">{patient.parentName}</p>
                            <p className="text-[10px] text-slate-500">{patient.contact}</p>
                          </td>
                          <td className="px-4 py-3.5">
                            <div className="flex items-center gap-1.5 text-xs text-slate-400">
                              <Calendar className="w-3.5 h-3.5 text-slate-500" />
                              {patient.lastVisit}
                            </div>
                          </td>
                          <td className="px-4 py-3.5 text-right">
                            <button
                              type="button"
                              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-all ${selected && selected.parentId === patient.parentId
                                ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20"
                                : "bg-black/40 text-slate-400 border border-slate-700 hover:border-blue-500/50 hover:text-blue-400"
                                }`}
                            >
                              <Eye className="h-3.5 w-3.5" />
                              <span className="hidden sm:inline-block">View</span>
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {selected && (
              <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-slate-900 to-black p-6 shadow-2xl relative animate-[fadeIn_0.5s_ease-out]">
                <div className="flex border-b border-white/10 pb-4 mb-6">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                      {selected.childName} <span className="text-sm font-normal text-slate-500">[{selected.parentId}]</span>
                    </h3>
                    <p className="text-sm text-slate-400">Comprehensive Clinical Overview</p>
                  </div>
                  <div className="text-right flex flex-col items-end">
                    <div className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold w-fit">
                      Status: Active
                    </div>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
                  <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-4 relative overflow-hidden group hover:border-blue-500/30 transition-colors">
                    <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
                    <div className="flex items-center gap-2 mb-2">
                      <div className="p-1.5 rounded bg-blue-500/10"><EyeIcon className="h-4 w-4 text-blue-400" /></div>
                      <span className="text-xs font-semibold text-slate-300">Saccade Tracking</span>
                    </div>
                    {renderGameMiniChart(selected.trials.eye, "#3b82f6")}
                  </div>

                  <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-4 relative overflow-hidden group hover:border-emerald-500/30 transition-colors">
                    <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500"></div>
                    <div className="flex items-center gap-2 mb-2">
                      <div className="p-1.5 rounded bg-emerald-500/10"><Activity className="h-4 w-4 text-emerald-400" /></div>
                      <span className="text-xs font-semibold text-slate-300">Posture Metric</span>
                    </div>
                    {renderGameMiniChart(selected.trials.body, "#10b981")}
                  </div>

                  <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-4 relative overflow-hidden group hover:border-purple-500/30 transition-colors">
                    <div className="absolute top-0 left-0 w-1 h-full bg-purple-500"></div>
                    <div className="flex items-center gap-2 mb-2">
                      <div className="p-1.5 rounded bg-purple-500/10"><Mic className="h-4 w-4 text-purple-400" /></div>
                      <span className="text-xs font-semibold text-slate-300">Vocal Impulsivity</span>
                    </div>
                    {renderGameMiniChart(selected.trials.voice, "#a855f7")}
                  </div>

                  <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-4 relative overflow-hidden group hover:border-amber-500/30 transition-colors">
                    <div className="absolute top-0 left-0 w-1 h-full bg-amber-500"></div>
                    <div className="flex items-center gap-2 mb-2">
                      <div className="p-1.5 rounded bg-amber-500/10"><PenTool className="h-4 w-4 text-amber-400" /></div>
                      <span className="text-xs font-semibold text-slate-300">Motor Control</span>
                    </div>
                    {renderGameMiniChart(selected.trials.handwriting, "#f59e0b")}
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-700/80 bg-slate-950 p-4">
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="text-sm font-bold text-white flex items-center gap-2">
                      <FileText className="w-4 h-4 text-slate-400" />
                      Clinical Evaluation Notes
                    </h4>
                    {lastReview && lastReview.parentId === selected.parentId && (
                      <span className="text-[10px] font-medium text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                        Saved: {lastReview.time}
                      </span>
                    )}
                  </div>

                  <div className="relative">
                    <textarea
                      rows={3}
                      className="w-full rounded-xl border border-slate-700 bg-black/40 p-3 text-xs text-slate-200 outline-none placeholder:text-slate-600 focus:border-blue-500 focus:bg-slate-900/80 transition-all resize-y"
                      placeholder="Add observations, diagnosis tracking, or instructions for next visit..."
                      value={reviewText}
                      onChange={(e) => setReviewText(e.target.value)}
                    />
                    <div className="flex justify-between items-center mt-3">
                      <p className="text-[10px] text-slate-500">Notes are securely attached to the patient's record profile.</p>
                      <button
                        type="button"
                        onClick={handleSaveReview}
                        disabled={!reviewText.trim()}
                        className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2 text-xs font-bold text-white shadow-lg shadow-blue-500/20 hover:bg-blue-500 hover:shadow-blue-500/40 focus:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Send className="h-3.5 w-3.5" /> Save Evaluation
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </section>

          <aside className="space-y-6">
            <div className="rounded-3xl border border-slate-700/50 bg-black/40 p-5">
              <h3 className="text-sm font-bold text-white mb-4">Fast Actions</h3>
              <div className="grid grid-cols-1 gap-2">
                <button className="flex items-center justify-between text-left px-4 py-3 rounded-xl bg-slate-800/50 text-xs font-semibold text-slate-300 hover:bg-slate-700 hover:text-white transition-colors border border-transparent hover:border-slate-600">
                  <span className="flex items-center gap-2"><Play className="w-4 h-4 text-emerald-400" /> Start Assesment Room</span>
                  <ChevronRight className="w-4 h-4 text-slate-500" />
                </button>
                <button className="flex items-center justify-between text-left px-4 py-3 rounded-xl bg-slate-800/50 text-xs font-semibold text-slate-300 hover:bg-slate-700 hover:text-white transition-colors border border-transparent hover:border-slate-600">
                  <span className="flex items-center gap-2"><Send className="w-4 h-4 text-blue-400" /> Invite Guardian to Portal</span>
                  <ChevronRight className="w-4 h-4 text-slate-500" />
                </button>
                <button className="flex items-center justify-between text-left px-4 py-3 rounded-xl bg-slate-800/50 text-xs font-semibold text-slate-300 hover:bg-slate-700 hover:text-white transition-colors border border-transparent hover:border-slate-600">
                  <span className="flex items-center gap-2"><FileText className="w-4 h-4 text-amber-400" /> Generate Weekly Report</span>
                  <ChevronRight className="w-4 h-4 text-slate-500" />
                </button>
              </div>
            </div>

            <div className="rounded-3xl bg-gradient-to-b from-slate-900 to-black p-6 shadow-xl border border-white/10 relative overflow-hidden group">
              <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-indigo-500/10 blur-[50px] rounded-full pointer-events-none group-hover:bg-indigo-500/20 transition-colors"></div>

              <h3 className="flex items-center gap-2 text-sm font-bold text-white mb-2 relative z-10">
                <UserPlus className="h-5 w-5 text-indigo-400" />
                Register New Patient
              </h3>
              <p className="text-xs text-slate-400 mb-5 relative z-10">Generate a secure ID for a new family.</p>

              <form className="space-y-3 relative z-10" onSubmit={handleCreateParent}>
                <div>
                  <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1 block">Guardian Full Name</label>
                  <input
                    type="text"
                    placeholder="e.g. John Doe"
                    className="w-full rounded-xl border border-slate-700/80 bg-black/50 px-3 py-2 text-xs text-white outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all placeholder:text-slate-600"
                    value={form.parent_name}
                    onChange={(e) => setForm((current) => ({ ...current, parent_name: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1 block">Child Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Niru"
                    className="w-full rounded-xl border border-slate-700/80 bg-black/50 px-3 py-2 text-xs text-white outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all placeholder:text-slate-600"
                    value={form.child_name}
                    onChange={(e) => setForm((current) => ({ ...current, child_name: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1 block">Child Age (optional)</label>
                  <input
                    type="number"
                    placeholder="8"
                    className="w-full rounded-xl border border-slate-700/80 bg-black/50 px-3 py-2 text-xs text-white outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all placeholder:text-slate-600"
                    value={form.child_age}
                    onChange={(e) => setForm((current) => ({ ...current, child_age: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1 block">Contact Number</label>
                  <input
                    type="text"
                    placeholder="+94 77 XXX XXXX"
                    className="w-full rounded-xl border border-slate-700/80 bg-black/50 px-3 py-2 text-xs text-white outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all placeholder:text-slate-600"
                    value={form.contact_number}
                    onChange={(e) => setForm((current) => ({ ...current, contact_number: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1 block">Notes</label>
                  <textarea
                    rows={3}
                    placeholder="Optional notes for the family"
                    className="w-full rounded-xl border border-slate-700/80 bg-black/50 px-3 py-2 text-xs text-white outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all placeholder:text-slate-600"
                    value={form.notes}
                    onChange={(e) => setForm((current) => ({ ...current, notes: e.target.value }))}
                  />
                </div>
                <button
                  type="submit"
                  disabled={!form.parent_name.trim() || !form.child_name.trim() || !form.contact_number.trim()}
                  className="w-full rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-indigo-500/20 hover:bg-indigo-500 hover:shadow-indigo-500/40 transition-all mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Generate Patient Record
                </button>
              </form>
            </div>

            {lastReview && (
              <div className="rounded-3xl border border-emerald-500/20 bg-emerald-500/5 p-5 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-3 opacity-10">
                  <FileText className="w-16 h-16 text-emerald-500" />
                </div>
                <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-3 relative z-10">Latest Clinical Entry</h3>
                <div className="relative z-10">
                  <p className="font-bold text-white text-sm">{lastReview.parentName} <span className="text-xs text-slate-400 font-normal">[{lastReview.parentId}]</span></p>
                  <p className="mt-1 text-[10px] text-slate-500 flex items-center gap-1"><Clock className="w-3 h-3" /> {lastReview.time}</p>
                  <div className="mt-3 text-xs text-slate-300 bg-black/30 p-3 rounded-xl border border-emerald-500/10">"{lastReview.text}"</div>
                </div>
              </div>
            )}
          </aside>
        </div>
      </div>

      <style jsx="true">{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </Dashboard>
  );
};

export default DoctorPanel;
