import React from "react";
import Dashboard from "../components/Dashboard.jsx";
import { useTranslation } from "react-i18next";
import {
  Search, Eye, UserPlus, Send, Activity, EyeIcon, Mic, PenTool
} from "lucide-react";

const initialParents = [
  { parentId: "P-1001", parentName: "Lakshmi Perera", childName: "Niru", contact: "+94 71 234 5678", lastVisit: "2025-02-12", trials: { eye: [62, 70], body: [55, 60], voice: [48, 52], handwriting: [40, 46] } },
  { parentId: "P-1002", parentName: "Ahmed Rizwan", childName: "Zayan", contact: "+94 76 555 1122", lastVisit: "2025-02-15", trials: { eye: [58, 64], body: [52, 58], voice: [50, 56], handwriting: [42, 48] } },
  { parentId: "P-1003", parentName: "Sanduni Jayasinghe", childName: "Tharun", contact: "+94 77 889 3311", lastVisit: "2025-02-18", trials: { eye: [65, 72], body: [60, 66], voice: [55, 61], handwriting: [48, 54] } }
];

const DoctorPanel = () => {
  const { t } = useTranslation();
  const [parents, setParents] = React.useState(initialParents);
  const [search, setSearch] = React.useState("");
  const [selected, setSelected] = React.useState(initialParents[0] || null);
  const [newParentName, setNewParentName] = React.useState("");
  const [newParentContact, setNewParentContact] = React.useState("");
  const [reviewText, setReviewText] = React.useState("");
  const [lastReview, setLastReview] = React.useState(null);

  const filteredParents = parents.filter((p) => {
    if (!search.trim()) return true;
    const term = search.toLowerCase();
    return p.parentId.toLowerCase().includes(term) || p.parentName.toLowerCase().includes(term);
  });

  const handleCreateParent = () => {
    if (!newParentName.trim() || !newParentContact.trim()) return;
    const nextIdNumber = 1000 + parents.length + 1;
    const parentId = `P-${nextIdNumber}`;
    const newParent = { parentId, parentName: newParentName.trim(), childName: t("doctor.childNamePending"), contact: newParentContact.trim(), lastVisit: t("doctor.notYet"), trials: { eye: [0, 0], body: [0, 0], voice: [0, 0], handwriting: [0, 0] } };
    setParents((prev) => [...prev, newParent]);
    setSelected(newParent);
    setNewParentName("");
    setNewParentContact("");
  };

  const handleSaveReview = () => {
    if (!selected || !reviewText.trim()) return;
    setLastReview({ parentId: selected.parentId, parentName: selected.parentName, text: reviewText.trim(), time: new Date().toLocaleString() });
    setReviewText("");
  };

  const renderGameMiniChart = (scores) => {
    const maxScore = 100;
    return (
      <div className="mt-1 flex gap-1">
        {scores.map((score, idx) => (
          <div key={idx} className="w-4 rounded-t bg-clinic-primary/70" style={{ height: `${Math.max((score / maxScore) * 40, 4)}px` }} title={`Trial ${idx + 1}: ${score}`} />
        ))}
      </div>
    );
  };

  return (
    <Dashboard roleLabel={t("doctor.dashboard")}>
      <div className="mt-4 grid gap-4 md:grid-cols-[2.2fr,1.2fr]">
        {/* MAIN: patient list + detail */}
        <section className="rounded-2xl bg-clinic-surfaceDark p-4 shadow-xl shadow-black/40">
          <h2 className="text-sm font-semibold text-clinic-primary">{t("doctor.todaysChildren")}</h2>
          <p className="mt-1 text-xs text-slate-400">{t("doctor.todaysChildrenDesc")}</p>

          {/* search */}
          <div className="mt-3 flex flex-col gap-2 md:flex-row md:items-center">
            <div className="flex flex-1 items-center gap-2 rounded-xl bg-black/30 px-3 py-2 text-xs text-slate-200">
              <Search className="h-3 w-3 text-slate-400" />
              <input type="text" placeholder={t("doctor.searchPlaceholder")} className="w-full bg-transparent text-[11px] outline-none placeholder:text-slate-500" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <p className="text-[10px] text-slate-500">{t("doctor.primaryKey")} <span className="font-mono">Parent_ID</span></p>
          </div>

          {/* table */}
          <div className="mt-3 overflow-hidden rounded-xl border border-slate-700/80 bg-black/20">
            <table className="min-w-full border-collapse text-[11px]">
              <thead className="bg-black/40 text-slate-300">
                <tr>
                  <th className="px-3 py-2 text-left font-semibold">{t("doctor.parentId")}</th>
                  <th className="px-3 py-2 text-left font-semibold">{t("doctor.parent")}</th>
                  <th className="px-3 py-2 text-left font-semibold">{t("doctor.child")}</th>
                  <th className="px-3 py-2 text-left font-semibold">{t("doctor.contact")}</th>
                  <th className="px-3 py-2 text-left font-semibold">{t("doctor.lastVisit")}</th>
                  <th className="px-3 py-2 text-right font-semibold">{t("doctor.inspect")}</th>
                </tr>
              </thead>
              <tbody>
                {filteredParents.length === 0 ? (
                  <tr><td colSpan={6} className="px-3 py-4 text-center text-[11px] text-slate-500">{t("doctor.noParentsFound")} &quot;{search}&quot;.</td></tr>
                ) : (
                  filteredParents.map((p) => (
                    <tr key={p.parentId} className={`border-t border-slate-800/70 ${selected && selected.parentId === p.parentId ? "bg-clinic-primary/10" : "hover:bg-white/5"}`}>
                      <td className="px-3 py-2 font-mono text-slate-200">{p.parentId}</td>
                      <td className="px-3 py-2 text-slate-200">{p.parentName}</td>
                      <td className="px-3 py-2 text-slate-300">{p.childName}</td>
                      <td className="px-3 py-2 text-slate-300">{p.contact}</td>
                      <td className="px-3 py-2 text-slate-400">{p.lastVisit}</td>
                      <td className="px-3 py-2 text-right">
                        <button type="button" onClick={() => setSelected(p)} className="inline-flex items-center gap-1 rounded-full border border-clinic-primary/50 px-2 py-1 text-[10px] font-medium text-clinic-primary hover:bg-clinic-primary/10">
                          <Eye className="h-3 w-3" /> {t("doctor.inspect")}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* detail + weekly trials */}
          {selected && (
            <div className="mt-4 rounded-2xl bg-black/25 p-4 text-[11px] text-slate-200">
              <h3 className="text-xs font-semibold text-clinic-primary">{t("doctor.weeklyTrials")} — {selected.childName}</h3>
              <p className="mt-1 text-[11px] text-slate-400">{t("doctor.trialDesc")}</p>

              <div className="mt-3 grid gap-3 md:grid-cols-2">
                <div className="rounded-xl border border-slate-700/80 bg-slate-950/60 p-3">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1 text-slate-100"><EyeIcon className="h-3 w-3 text-clinic-primary" /> {t("doctor.eyeTrackingGame")}</span>
                    <span className="text-[10px] text-slate-400">{t("doctor.trials")}: {selected.trials.eye.join(" / ")}</span>
                  </div>
                  {renderGameMiniChart(selected.trials.eye)}
                </div>
                <div className="rounded-xl border border-slate-700/80 bg-slate-950/60 p-3">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1 text-slate-100"><Activity className="h-3 w-3 text-clinic-secondary" /> {t("doctor.bodyPostureGame")}</span>
                    <span className="text-[10px] text-slate-400">{t("doctor.trials")}: {selected.trials.body.join(" / ")}</span>
                  </div>
                  {renderGameMiniChart(selected.trials.body)}
                </div>
                <div className="rounded-xl border border-slate-700/80 bg-slate-950/60 p-3">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1 text-slate-100"><Mic className="h-3 w-3 text-clinic-accent" /> {t("doctor.voiceTrackingGame")}</span>
                    <span className="text-[10px] text-slate-400">{t("doctor.trials")}: {selected.trials.voice.join(" / ")}</span>
                  </div>
                  {renderGameMiniChart(selected.trials.voice)}
                </div>
                <div className="rounded-xl border border-slate-700/80 bg-slate-950/60 p-3">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1 text-slate-100"><PenTool className="h-3 w-3 text-indigo-300" /> {t("doctor.handwritingGame")}</span>
                    <span className="text-[10px] text-slate-400">{t("doctor.trials")}: {selected.trials.handwriting.join(" / ")}</span>
                  </div>
                  {renderGameMiniChart(selected.trials.handwriting)}
                </div>
              </div>

              {/* review panel */}
              <div className="mt-4 rounded-xl border border-slate-700/80 bg-slate-950/60 p-3">
                <h4 className="text-xs font-semibold text-slate-100">{t("doctor.reviewNotes")} ({selected.parentName})</h4>
                <p className="mt-1 text-[10px] text-slate-400">{t("doctor.reviewDesc")}</p>
                <textarea rows={3} className="mt-2 w-full rounded-lg border border-slate-700 bg-black/40 px-2 py-1 text-[11px] text-slate-100 outline-none focus:border-clinic-primary focus:ring-1 focus:ring-clinic-primary/60" placeholder={t("doctor.reviewPlaceholder")} value={reviewText} onChange={(e) => setReviewText(e.target.value)} />
                <div className="mt-2 flex items-center justify-between">
                  <button type="button" onClick={handleSaveReview} className="inline-flex items-center gap-1 rounded-full bg-clinic-primary px-3 py-1.5 text-[11px] font-semibold text-slate-900 hover:bg-clinic-primary/90">
                    <Send className="h-3 w-3" /> {t("doctor.saveReview")}
                  </button>
                  {lastReview && lastReview.parentId === selected.parentId && (
                    <p className="text-[10px] text-emerald-400">{t("doctor.lastSaved")}: {lastReview.time}</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </section>

        {/* SIDEBAR: quick actions + create parent + recent review */}
        <aside className="space-y-3">
          <div className="rounded-2xl bg-clinic-surfaceDark p-4 shadow-xl shadow-black/40">
            <h3 className="text-xs font-semibold text-slate-200">{t("doctor.quickActions")}</h3>
            <ul className="mt-2 space-y-1 text-xs text-slate-300">
              <li>• {t("doctor.startAssessment")}</li>
              <li>• {t("doctor.inviteParent")}</li>
              <li>• {t("doctor.reviewLastNotes")}</li>
            </ul>
          </div>

          <div className="rounded-2xl bg-clinic-surfaceDark p-4 shadow-xl shadow-black/40">
            <h3 className="flex items-center gap-1 text-xs font-semibold text-slate-200">
              <UserPlus className="h-3 w-3 text-clinic-primary" /> {t("doctor.createParentAccount")}
            </h3>
            <p className="mt-1 text-[11px] text-slate-400">{t("doctor.oneParent")}</p>
            <div className="mt-2 space-y-2 text-[11px]">
              <input type="text" placeholder={t("doctor.parentFullName")} className="w-full rounded-lg border border-slate-700 bg-black/40 px-2 py-1 text-slate-100 outline-none placeholder:text-slate-500 focus:border-clinic-primary" value={newParentName} onChange={(e) => setNewParentName(e.target.value)} />
              <input type="text" placeholder={t("doctor.contactPlaceholder")} className="w-full rounded-lg border border-slate-700 bg-black/40 px-2 py-1 text-slate-100 outline-none placeholder:text-slate-500 focus:border-clinic-primary" value={newParentContact} onChange={(e) => setNewParentContact(e.target.value)} />
              <button type="button" onClick={handleCreateParent} className="mt-1 w-full rounded-full bg-clinic-primary px-3 py-1.5 text-[11px] font-semibold text-slate-900 hover:bg-clinic-primary/90">{t("doctor.createParentAccount")}</button>
              <p className="text-[10px] text-slate-500">{t("doctor.newAccountNote")}</p>
            </div>
          </div>

          <div className="rounded-2xl bg-clinic-surfaceDark p-4 shadow-xl shadow-black/40">
            <h3 className="text-xs font-semibold text-slate-200">{t("doctor.latestReview")}</h3>
            {lastReview ? (
              <div className="mt-2 rounded-xl bg-black/30 p-3 text-[11px] text-slate-200">
                <p className="font-semibold">{lastReview.parentName} ({lastReview.parentId})</p>
                <p className="mt-1 text-[10px] text-slate-400">{lastReview.time}</p>
                <p className="mt-2 text-[11px] text-slate-100">{lastReview.text}</p>
              </div>
            ) : (
              <p className="mt-2 text-[11px] text-slate-400">{t("doctor.noReviews")}</p>
            )}
          </div>
        </aside>
      </div>
    </Dashboard>
  );
};

export default DoctorPanel;
