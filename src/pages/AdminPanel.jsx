import React from "react";
import Dashboard from "../components/Dashboard.jsx";
import { Eye, Activity, Mic, PenTool, ExternalLink } from "lucide-react";
import { useTranslation } from "react-i18next";

const dummyRequests = [
  { id: 1, name: "Dr. Maya Fernando", specialty: "Pediatric Neurologist", hospital: "Colombo Children's Hospital", city: "Colombo", submitted: "2025-02-12", license: "SLMC-458721", email: "maya.fernando@example.com", notes: "Interested in early-stage ADHD screening and tele-consult follow-ups." },
  { id: 2, name: "Dr. Ishara Perera", specialty: "Child Psychiatrist", hospital: "Kandy General Hospital", city: "Kandy", submitted: "2025-02-15", license: "SLMC-772019", email: "ishara.perera@example.com", notes: "Wants multi-clinic access and multi-language parent reports." },
  { id: 3, name: "Dr. Nimal Jayasinghe", specialty: "Developmental Pediatrician", hospital: "Galle Teaching Hospital", city: "Galle", submitted: "2025-02-20", license: "SLMC-335902", email: "nimal.j@example.com", notes: "Focus on school-based screening and classroom behaviour tracking." }
];

const AdminPanel = () => {
  const { t } = useTranslation();

  return (
    <Dashboard roleLabel={t("admin.dashboard")}>
      <div className="mt-4 grid gap-4 md:grid-cols-3">
        <section className="rounded-2xl bg-clinic-surfaceDark p-4 shadow-xl shadow-black/40 md:col-span-2">
          <h2 className="text-sm font-semibold text-indigo-400">{t("admin.systemOverview")}</h2>

          <div className="mt-6">
            <h3 className="text-xs font-semibold text-slate-200">{t("admin.pendingDoctors")}</h3>
            <p className="mt-1 text-[11px] text-slate-400">{t("admin.pendingDoctorsDesc")}</p>

            <ul className="mt-3 space-y-2 text-xs">
              {dummyRequests.map((req) => (
                <li key={req.id} className="relative flex items-center justify-between rounded-xl border border-slate-700/80 bg-black/30 px-3 py-2 text-slate-200 group">
                  <div className="flex flex-col">
                    <span className="text-[11px] font-semibold">{req.name}</span>
                    <span className="text-[10px] text-slate-400">{req.specialty} · {req.hospital}</span>
                    <span className="text-[10px] text-slate-500">{t("admin.submitted")}: {req.submitted}</span>
                  </div>
                  <button type="button" className="ml-3 inline-flex items-center gap-1 rounded-full border border-clinic-primary/40 px-2 py-1 text-[10px] font-medium text-clinic-primary transition-colors hover:bg-clinic-primary/10">
                    <Eye className="h-3 w-3" /> {t("admin.inspect")}
                  </button>
                  <div className="pointer-events-none absolute left-0 top-full z-30 mt-2 w-full rounded-xl border border-slate-700 bg-clinic-surfaceDark/95 p-3 text-[10px] text-slate-200 opacity-0 shadow-xl shadow-black/50 transition-opacity duration-150 group-hover:pointer-events-auto group-hover:opacity-100">
                    <p className="text-[11px] font-semibold">{req.name} — {req.specialty}</p>
                    <p className="mt-1 text-slate-300">{req.hospital}, {req.city}</p>
                    <p className="mt-1 text-slate-400">{t("admin.licenseId")} <span className="font-mono">{req.license}</span></p>
                    <p className="mt-1 text-slate-400">{t("admin.contactLabel")} <span className="font-mono">{req.email}</span></p>
                    <p className="mt-2 text-slate-300">{req.notes}</p>
                    <div className="mt-3 flex gap-2 text-[10px]">
                      <button className="flex-1 rounded-lg bg-clinic-primary px-2 py-1 font-semibold text-slate-900">{t("admin.approve")}</button>
                      <button className="flex-1 rounded-lg border border-red-500/60 bg-red-500/5 px-2 py-1 font-semibold text-red-400">{t("admin.reject")}</button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <aside className="space-y-3">
          <div className="rounded-2xl bg-clinic-surfaceDark p-4 shadow-xl shadow-black/40">
            <h3 className="text-xs font-semibold text-slate-200">{t("admin.quickAdmin")}</h3>
            <ul className="mt-2 space-y-1 text-xs text-slate-300">
              <li>• {t("admin.approveNew")}</li>
              <li>• {t("admin.createParentIds")}</li>
              <li>• {t("admin.manageTemplates")}</li>
            </ul>
          </div>

          <div className="rounded-2xl bg-clinic-surfaceDark p-4 shadow-xl shadow-black/40">
            <h3 className="text-xs font-semibold text-slate-200">{t("admin.dataPortals")}</h3>
            <p className="mt-1 text-[11px] text-slate-400">{t("admin.dataPortalsDesc")}</p>
            <div className="mt-3 space-y-2 text-xs">
              <a href="https://eye-tracking-simulation.vercel.app/" target="_blank" rel="noreferrer" className="flex items-center justify-between rounded-xl border border-slate-700/80 bg-black/25 px-3 py-2 text-slate-200 transition hover:border-clinic-primary hover:bg-clinic-primary/10">
                <span className="flex items-center gap-2"><Eye className="h-4 w-4 text-clinic-primary" /> {t("admin.eyeTrackingData")}</span>
                <ExternalLink className="h-3 w-3 text-slate-400" />
              </a>
              <a href="https://adhd-poses-detection-games.vercel.app/" target="_blank" rel="noreferrer" className="flex items-center justify-between rounded-xl border border-slate-700/80 bg-black/25 px-3 py-2 text-slate-200 transition hover:border-clinic-primary hover:bg-clinic-primary/10">
                <span className="flex items-center gap-2"><Activity className="h-4 w-4 text-clinic-secondary" /> {t("admin.bodyPostureData")}</span>
                <ExternalLink className="h-3 w-3 text-slate-400" />
              </a>
              <a href="#" target="_blank" rel="noreferrer" className="flex items-center justify-between rounded-xl border border-slate-700/80 bg-black/25 px-3 py-2 text-slate-200 transition hover:border-clinic-primary hover:bg-clinic-primary/10">
                <span className="flex items-center gap-2"><Mic className="h-4 w-4 text-clinic-accent" /> {t("admin.voiceTrackingData")}</span>
                <ExternalLink className="h-3 w-3 text-slate-400" />
              </a>
              <a href="#" target="_blank" rel="noreferrer" className="flex items-center justify-between rounded-xl border border-slate-700/80 bg-black/25 px-3 py-2 text-slate-200 transition hover:border-clinic-primary hover:bg-clinic-primary/10">
                <span className="flex items-center gap-2"><PenTool className="h-4 w-4 text-indigo-400" /> {t("admin.handwritingData")}</span>
                <ExternalLink className="h-3 w-3 text-slate-400" />
              </a>
            </div>
          </div>
        </aside>
      </div>
    </Dashboard>
  );
};

export default AdminPanel;
