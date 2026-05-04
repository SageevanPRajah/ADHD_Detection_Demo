import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Dashboard from "../components/Dashboard.jsx";
import { Eye, Activity, Mic, PenTool, ExternalLink, ShieldCheck, Users, Search, ChevronRight, CheckCircle2, XCircle, ArrowLeft } from "lucide-react";
import { useTranslation } from "react-i18next";
import axios from "axios";

import { AuthEndPoint } from "../utils/ApiRequest.js";
import { authHeaders } from "../utils/authSession.js";
import { normalizeApiList, normalizeApiRecord } from "../utils/apiNormalize.js";

const AdminPanel = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [pendingDoctors, setPendingDoctors] = useState([]);
  const [allDoctors, setAllDoctors] = useState([]);
  const [selectedReq, setSelectedReq] = useState(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const loadDoctors = async () => {
    setLoading(true);
    setError("");
    try {
      const [pendingResponse, allResponse] = await Promise.all([
        axios.get(`${AuthEndPoint}/admin/doctors/pending`, { headers: authHeaders() }),
        axios.get(`${AuthEndPoint}/admin/doctors`, { headers: authHeaders() }),
      ]);
      setPendingDoctors(normalizeApiList(pendingResponse.data));
      setAllDoctors(normalizeApiList(allResponse.data));
      setSelectedReq((current) => {
        const normalizedPending = normalizeApiList(pendingResponse.data);
        if (!current) return normalizedPending[0] || null;
        return normalizedPending.find((doctor) => doctor.id === current.id) || normalizedPending[0] || null;
      });
    } catch (requestError) {
      setError(requestError?.response?.data?.detail || "Failed to load doctor requests");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDoctors();
  }, []);

  const filteredRequests = useMemo(() => {
    if (!search.trim()) return pendingDoctors;
    const term = search.toLowerCase();
    return pendingDoctors.filter((doctor) => {
      return [doctor.fullName, doctor.medicalCouncilId, doctor.specialization, doctor.hospital]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(term));
    });
  }, [pendingDoctors, search]);

  const handleAction = async (doctorId, action) => {
    setMessage("");
    setError("");
    try {
      await axios.post(`${AuthEndPoint}/admin/doctors/${doctorId}/${action}`, {}, { headers: authHeaders() });
      setMessage(action === "approve" ? "Doctor approved successfully. Default password is TestD@1234" : "Doctor rejected successfully.");
      await loadDoctors();
    } catch (requestError) {
      setError(requestError?.response?.data?.detail || `Failed to ${action} doctor`);
    }
  };

  return (
    <Dashboard roleLabel={t("admin.dashboard")}>
      <div className="font-sans flex flex-col gap-6 max-w-7xl mx-auto mt-2 pb-8 animate-adhdSnap">
        <div className="flex items-center">
          <button
            onClick={() => navigate("/")}
            className="group flex items-center gap-2 text-sm font-semibold text-slate-400 hover:text-white transition-colors"
          >
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-800/50 group-hover:bg-slate-700 transition-colors border border-slate-700/50 group-hover:border-slate-500">
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            </div>
            Back to Home
          </button>
        </div>

        <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Active Doctors", value: String(allDoctors.filter((doctor) => doctor.status === "ACTIVE").length), icon: ShieldCheck, color: "text-emerald-400", border: "border-emerald-500/20", bg: "bg-emerald-500/10" },
            { label: "Total Doctors", value: String(allDoctors.length), icon: Users, color: "text-blue-400", border: "border-blue-500/20", bg: "bg-blue-500/10" },
            { label: "Pending Requests", value: String(pendingDoctors.length), icon: Activity, color: "text-amber-400", border: "border-amber-500/20", bg: "bg-amber-500/10" },
            { label: "Assessments Today", value: "0", icon: Eye, color: "text-indigo-400", border: "border-indigo-500/20", bg: "bg-indigo-500/10" },
          ].map((stat, idx) => (
            <div key={idx} className={`relative overflow-hidden rounded-2xl border ${stat.border} bg-clinic-surfaceDark p-5 shadow-lg shadow-black/40 group hover:-translate-y-1 transition-transform`}>
              <div className={`absolute -right-4 -top-4 w-16 h-16 rounded-full ${stat.bg} blur-xl group-hover:scale-150 transition-transform duration-500`}></div>
              <div className="flex justify-between items-start relative z-10">
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{stat.label}</p>
                  <p className="text-3xl font-bold text-white mt-1">{stat.value}</p>
                </div>
                <div className={`p-2 rounded-xl ${stat.bg} ${stat.color}`}>
                  <stat.icon className="w-5 h-5" />
                </div>
              </div>
            </div>
          ))}
        </section>

        <div className="grid gap-6 md:grid-cols-3">
          <section className="rounded-3xl border border-white/10 bg-gradient-to-br from-clinic-surfaceDark to-slate-900 p-6 shadow-2xl md:col-span-2 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-blue-500/5 blur-[100px] pointer-events-none rounded-full"></div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 relative z-10">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
                  </span>
                  Verification Queue
                </h2>
                <p className="text-xs text-slate-400 mt-1">Review pending doctor registration requests.</p>
              </div>

              <div className="hidden sm:flex relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  placeholder="Search doctors..."
                  className="bg-black/40 border border-slate-700/50 rounded-full pl-9 pr-4 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-blue-500/50 w-56"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                />
              </div>
            </div>

            {message && <div className="mb-4 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-xs text-emerald-300">{message}</div>}
            {error && <div className="mb-4 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-xs text-red-300">{error}</div>}

            <div className="space-y-3 relative z-10">
              {loading ? (
                <div className="rounded-2xl border border-slate-700/60 bg-black/30 p-6 text-sm text-slate-400">Loading doctor requests...</div>
              ) : filteredRequests.length === 0 ? (
                <div className="rounded-2xl border border-slate-700/60 bg-black/30 p-6 text-sm text-slate-400">No pending doctor requests found.</div>
              ) : (
                filteredRequests.map((req) => (
                  <div key={req.id} className="group relative rounded-2xl border border-slate-700/60 bg-black/40 p-1 transition-all hover:bg-black/60 hover:border-blue-500/30">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3 gap-4">
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 flex items-center justify-center rounded-full bg-indigo-500/20 text-indigo-400 font-bold border border-indigo-500/30">
                          {(req.fullName || req.full_name || "D").charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-white">{req.fullName || req.full_name}</p>
                          <p className="text-xs text-slate-400 mt-0.5">{req.specialization} • <span className="text-slate-500">{req.hospital}</span></p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="text-[10px] text-slate-500 hidden sm:inline-block">Submitted: {new Date(req.createdAt || req.created_at).toLocaleDateString()}</span>
                        <button
                          onClick={() => setSelectedReq(selectedReq?.id === req.id ? null : req)}
                          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-all ${selectedReq?.id === req.id ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'bg-blue-500/10 text-blue-400 hover:bg-blue-500/20'} border border-blue-500/30`}
                        >
                          {selectedReq?.id === req.id ? 'Close' : 'Review'} <ChevronRight className={`w-3.5 h-3.5 transition-transform ${selectedReq?.id === req.id ? 'rotate-90' : ''}`} />
                        </button>
                      </div>
                    </div>

                    <div className={`overflow-hidden transition-all duration-300 ease-in-out ${selectedReq?.id === req.id ? 'max-h-[32rem] opacity-100 mt-2' : 'max-h-0 opacity-0'}`}>
                      <div className="mx-3 mb-3 rounded-xl border border-slate-700 bg-slate-900/80 p-4 shadow-inner">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <p className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold mb-1">Registration Details</p>
                            <div className="space-y-2 text-xs">
                              <p className="flex justify-between"><span className="text-slate-400">License ID</span> <span className="font-mono text-white bg-slate-800 px-1.5 rounded">{req.medicalCouncilId || req.medical_council_id}</span></p>
                              <p className="flex justify-between"><span className="text-slate-400">Hospital</span> <span className="text-white">{req.hospital}</span></p>
                              <p className="flex justify-between"><span className="text-slate-400">Phone</span> <span className="text-white">{req.phoneNumber || req.phone_number}</span></p>
                              <p className="flex justify-between"><span className="text-slate-400">Status</span> <span className="text-white">{req.status}</span></p>
                            </div>
                          </div>
                          <div>
                            <p className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold mb-1">Application Notes</p>
                            <p className="text-xs text-slate-300 leading-relaxed bg-slate-800/50 p-2 rounded-lg border border-slate-700/50">
                              "{req.notes || 'No notes provided.'}"
                            </p>
                            {req.certificateFilename && <p className="mt-2 text-[10px] text-slate-500">Certificate: {req.certificateFilename}</p>}
                          </div>
                        </div>

                        <div className="mt-4 pt-4 border-t border-slate-700/50 flex gap-3 pb-1">
                          <button onClick={() => handleAction(req.id, "approve")} className="flex-1 rounded-xl bg-emerald-500 text-emerald-950 font-bold py-2 text-xs transition hover:bg-emerald-400 flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20">
                            <CheckCircle2 className="w-4 h-4" /> Approve Access
                          </button>
                          <button onClick={() => handleAction(req.id, "reject")} className="flex-1 rounded-xl border border-red-500/50 bg-red-500/10 text-red-400 font-bold py-2 text-xs transition hover:bg-red-500/20 flex items-center justify-center gap-2">
                            <XCircle className="w-4 h-4" /> Reject
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>

          <aside className="space-y-6">
            <div className="rounded-3xl bg-gradient-to-b from-clinic-surfaceDark to-slate-900 p-6 shadow-2xl border border-white/10 relative overflow-hidden">
              <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-cyan-500/10 blur-[50px] rounded-full pointer-events-none"></div>

              <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-4">
                Assessment Data Tools
              </h3>

              <div className="space-y-3">
                {[
                  { id: 'eye', name: 'Eye Tracking Data', icon: Eye, color: 'text-blue-400', link: '/eyetrack/terms' },
                  { id: 'body', name: 'Body Posture Data', icon: Activity, color: 'text-emerald-400', link: '/saiman-instructions' },
                  { id: 'voice', name: 'Voice Tracking Data', icon: Mic, color: 'text-purple-400', link: '/speech/' },
                  { id: 'handwriting', name: 'Handwriting Data', icon: PenTool, color: 'text-amber-400', link: '/guest/handwriting' },
                ].map((portal) => (
                  <a
                    key={portal.id}
                    href={portal.link}
                    className="group flex items-center justify-between rounded-xl border border-slate-700/60 bg-black/30 p-3 transition-all hover:bg-slate-800 hover:border-slate-500"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-1.5 rounded-lg bg-slate-800 group-hover:bg-slate-700 transition-colors ${portal.color}`}>
                        <portal.icon className="h-4 w-4" />
                      </div>
                      <span className="text-xs font-semibold text-slate-300 group-hover:text-white transition-colors">{portal.name}</span>
                    </div>
                    <ExternalLink className="h-3 w-3 text-slate-500 group-hover:text-white transition-colors" />
                  </a>
                ))}
              </div>
            </div>

            <div className="rounded-3xl border border-slate-700/50 bg-black/40 p-6">
              <h3 className="text-sm font-bold text-slate-300 mb-4">{t("admin.quickAdmin")}</h3>
              <div className="grid grid-cols-1 gap-2">
                <button className="text-left px-4 py-2.5 rounded-xl bg-slate-800/50 text-xs font-medium text-slate-300 hover:bg-slate-700 hover:text-white transition-colors border border-transparent hover:border-slate-600">
                  {t("admin.approveNew")}
                </button>
                <button className="text-left px-4 py-2.5 rounded-xl bg-slate-800/50 text-xs font-medium text-slate-300 hover:bg-slate-700 hover:text-white transition-colors border border-transparent hover:border-slate-600">
                  {t("admin.createParentIds")}
                </button>
                <button className="text-left px-4 py-2.5 rounded-xl bg-slate-800/50 text-xs font-medium text-slate-300 hover:bg-slate-700 hover:text-white transition-colors border border-transparent hover:border-slate-600">
                  {t("admin.manageTemplates")}
                </button>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </Dashboard>
  );
};

export default AdminPanel;
