import React from "react";
import Dashboard from "../components/Dashboard.jsx";
import {
  Search,
  Eye,
  UserPlus,
  Send,
  Activity,
  EyeIcon,
  Mic,
  PenTool
} from "lucide-react";

const initialParents = [
  {
    parentId: "P-1001",
    parentName: "Lakshmi Perera",
    childName: "Niru",
    contact: "+94 71 234 5678",
    lastVisit: "2025-02-12",
    trials: {
      eye: [62, 70],
      body: [55, 60],
      voice: [48, 52],
      handwriting: [40, 46]
    }
  },
  {
    parentId: "P-1002",
    parentName: "Ahmed Rizwan",
    childName: "Zayan",
    contact: "+94 76 555 1122",
    lastVisit: "2025-02-15",
    trials: {
      eye: [58, 64],
      body: [52, 58],
      voice: [50, 56],
      handwriting: [42, 48]
    }
  },
  {
    parentId: "P-1003",
    parentName: "Sanduni Jayasinghe",
    childName: "Tharun",
    contact: "+94 77 889 3311",
    lastVisit: "2025-02-18",
    trials: {
      eye: [65, 72],
      body: [60, 66],
      voice: [55, 61],
      handwriting: [48, 54]
    }
  }
];

const DoctorPanel = () => {
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
    return (
      p.parentId.toLowerCase().includes(term) ||
      p.parentName.toLowerCase().includes(term)
    );
  });

  const handleCreateParent = () => {
    if (!newParentName.trim() || !newParentContact.trim()) return;

    const nextIdNumber = 1000 + parents.length + 1;
    const parentId = `P-${nextIdNumber}`;

    const newParent = {
      parentId,
      parentName: newParentName.trim(),
      childName: "Child name pending",
      contact: newParentContact.trim(),
      lastVisit: "Not yet",
      trials: {
        eye: [0, 0],
        body: [0, 0],
        voice: [0, 0],
        handwriting: [0, 0]
      }
    };

    setParents((prev) => [...prev, newParent]);
    setSelected(newParent);
    setNewParentName("");
    setNewParentContact("");
  };

  const handleSaveReview = () => {
    if (!selected || !reviewText.trim()) return;
    setLastReview({
      parentId: selected.parentId,
      parentName: selected.parentName,
      text: reviewText.trim(),
      time: new Date().toLocaleString()
    });
    setReviewText("");
  };

  const renderGameMiniChart = (scores) => {
    const maxScore = 100;
    return (
      <div className="mt-1 flex gap-1">
        {scores.map((score, idx) => (
          <div
            key={idx}
            className="w-4 rounded-t bg-clinic-primary/70"
            style={{ height: `${Math.max((score / maxScore) * 40, 4)}px` }}
            title={`Trial ${idx + 1}: ${score}`}
          />
        ))}
      </div>
    );
  };

  return (
    <Dashboard roleLabel="Doctor Dashboard">
      <div className="mt-4 grid gap-4 md:grid-cols-[2.2fr,1.2fr]">
        {/* MAIN: patient list + detail */}
        <section className="rounded-2xl bg-clinic-surfaceDark p-4 shadow-xl shadow-black/40">
          <h2 className="text-sm font-semibold text-clinic-primary">
            Today&apos;s children
          </h2>
          <p className="mt-1 text-xs text-slate-400">
            Parent-based view of children scheduled for ADHD screening.
          </p>

          {/* search */}
          <div className="mt-3 flex flex-col gap-2 md:flex-row md:items-center">
            <div className="flex flex-1 items-center gap-2 rounded-xl bg-black/30 px-3 py-2 text-xs text-slate-200">
              <Search className="h-3 w-3 text-slate-400" />
              <input
                type="text"
                placeholder="Search by Parent ID or Parent name..."
                className="w-full bg-transparent text-[11px] outline-none placeholder:text-slate-500"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <p className="text-[10px] text-slate-500">
              Primary key: <span className="font-mono">Parent_ID</span>
            </p>
          </div>

          {/* table */}
          <div className="mt-3 overflow-hidden rounded-xl border border-slate-700/80 bg-black/20">
            <table className="min-w-full border-collapse text-[11px]">
              <thead className="bg-black/40 text-slate-300">
                <tr>
                  <th className="px-3 py-2 text-left font-semibold">Parent ID</th>
                  <th className="px-3 py-2 text-left font-semibold">Parent</th>
                  <th className="px-3 py-2 text-left font-semibold">Child</th>
                  <th className="px-3 py-2 text-left font-semibold">Contact</th>
                  <th className="px-3 py-2 text-left font-semibold">
                    Last visit
                  </th>
                  <th className="px-3 py-2 text-right font-semibold">Inspect</th>
                </tr>
              </thead>
              <tbody>
                {filteredParents.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-3 py-4 text-center text-[11px] text-slate-500"
                    >
                      No parents found for &quot;{search}&quot;.
                    </td>
                  </tr>
                ) : (
                  filteredParents.map((p) => (
                    <tr
                      key={p.parentId}
                      className={`border-t border-slate-800/70 ${
                        selected && selected.parentId === p.parentId
                          ? "bg-clinic-primary/10"
                          : "hover:bg-white/5"
                      }`}
                    >
                      <td className="px-3 py-2 font-mono text-slate-200">
                        {p.parentId}
                      </td>
                      <td className="px-3 py-2 text-slate-200">
                        {p.parentName}
                      </td>
                      <td className="px-3 py-2 text-slate-300">
                        {p.childName}
                      </td>
                      <td className="px-3 py-2 text-slate-300">
                        {p.contact}
                      </td>
                      <td className="px-3 py-2 text-slate-400">{p.lastVisit}</td>
                      <td className="px-3 py-2 text-right">
                        <button
                          type="button"
                          onClick={() => setSelected(p)}
                          className="inline-flex items-center gap-1 rounded-full border border-clinic-primary/50 px-2 py-1 text-[10px] font-medium text-clinic-primary hover:bg-clinic-primary/10"
                        >
                          <Eye className="h-3 w-3" />
                          Inspect
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
              <h3 className="text-xs font-semibold text-clinic-primary">
                Weekly trials & progress — {selected.childName}
              </h3>
              <p className="mt-1 text-[11px] text-slate-400">
                Showing two trials per game for this week. Values are demo
                scores (0–100).
              </p>

              <div className="mt-3 grid gap-3 md:grid-cols-2">
                {/* Eye tracking */}
                <div className="rounded-xl border border-slate-700/80 bg-slate-950/60 p-3">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1 text-slate-100">
                      <EyeIcon className="h-3 w-3 text-clinic-primary" />
                      Eye Tracking Game
                    </span>
                    <span className="text-[10px] text-slate-400">
                      Trials: {selected.trials.eye.join(" / ")}
                    </span>
                  </div>
                  {renderGameMiniChart(selected.trials.eye)}
                </div>

                {/* Body posture */}
                <div className="rounded-xl border border-slate-700/80 bg-slate-950/60 p-3">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1 text-slate-100">
                      <Activity className="h-3 w-3 text-clinic-secondary" />
                      Body Posture Tracking Game
                    </span>
                    <span className="text-[10px] text-slate-400">
                      Trials: {selected.trials.body.join(" / ")}
                    </span>
                  </div>
                  {renderGameMiniChart(selected.trials.body)}
                </div>

                {/* Voice tracking */}
                <div className="rounded-xl border border-slate-700/80 bg-slate-950/60 p-3">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1 text-slate-100">
                      <Mic className="h-3 w-3 text-clinic-accent" />
                      Voice Tracking Game
                    </span>
                    <span className="text-[10px] text-slate-400">
                      Trials: {selected.trials.voice.join(" / ")}
                    </span>
                  </div>
                  {renderGameMiniChart(selected.trials.voice)}
                </div>

                {/* Handwriting */}
                <div className="rounded-xl border border-slate-700/80 bg-slate-950/60 p-3">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1 text-slate-100">
                      <PenTool className="h-3 w-3 text-indigo-300" />
                      Handwriting Tracking Game
                    </span>
                    <span className="text-[10px] text-slate-400">
                      Trials: {selected.trials.handwriting.join(" / ")}
                    </span>
                  </div>
                  {renderGameMiniChart(selected.trials.handwriting)}
                </div>
              </div>

              {/* review panel */}
              <div className="mt-4 rounded-xl border border-slate-700/80 bg-slate-950/60 p-3">
                <h4 className="text-xs font-semibold text-slate-100">
                  Review notes for parent ({selected.parentName})
                </h4>
                <p className="mt-1 text-[10px] text-slate-400">
                  Use this space to record feedback you plan to share with the
                  parent (not visible to them yet).
                </p>
                <textarea
                  rows={3}
                  className="mt-2 w-full rounded-lg border border-slate-700 bg-black/40 px-2 py-1 text-[11px] text-slate-100 outline-none focus:border-clinic-primary focus:ring-1 focus:ring-clinic-primary/60"
                  placeholder="Eg: Child shows improvement in sustained attention during eye-tracking game..."
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                />
                <div className="mt-2 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={handleSaveReview}
                    className="inline-flex items-center gap-1 rounded-full bg-clinic-primary px-3 py-1.5 text-[11px] font-semibold text-slate-900 hover:bg-clinic-primary/90"
                  >
                    <Send className="h-3 w-3" />
                    Save review for parent
                  </button>
                  {lastReview && lastReview.parentId === selected.parentId && (
                    <p className="text-[10px] text-emerald-400">
                      Last saved: {lastReview.time}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </section>

        {/* SIDEBAR: quick actions + create parent + recent review */}
        <aside className="space-y-3">
          {/* quick actions */}
          <div className="rounded-2xl bg-clinic-surfaceDark p-4 shadow-xl shadow-black/40">
            <h3 className="text-xs font-semibold text-slate-200">
              Quick actions
            </h3>
            <ul className="mt-2 space-y-1 text-xs text-slate-300">
              <li>• Start new ADHD assessment</li>
              <li>• Invite parent to portal</li>
              <li>• Review last visit notes</li>
            </ul>
          </div>

          {/* create parent account */}
          <div className="rounded-2xl bg-clinic-surfaceDark p-4 shadow-xl shadow-black/40">
            <h3 className="flex items-center gap-1 text-xs font-semibold text-slate-200">
              <UserPlus className="h-3 w-3 text-clinic-primary" />
              Create parent account
            </h3>
            <p className="mt-1 text-[11px] text-slate-400">
              One parent account per child. Use this for new families.
            </p>

            <div className="mt-2 space-y-2 text-[11px]">
              <input
                type="text"
                placeholder="Parent full name"
                className="w-full rounded-lg border border-slate-700 bg-black/40 px-2 py-1 text-slate-100 outline-none placeholder:text-slate-500 focus:border-clinic-primary"
                value={newParentName}
                onChange={(e) => setNewParentName(e.target.value)}
              />
              <input
                type="text"
                placeholder="Contact (phone / email)"
                className="w-full rounded-lg border border-slate-700 bg-black/40 px-2 py-1 text-slate-100 outline-none placeholder:text-slate-500 focus:border-clinic-primary"
                value={newParentContact}
                onChange={(e) => setNewParentContact(e.target.value)}
              />
              <button
                type="button"
                onClick={handleCreateParent}
                className="mt-1 w-full rounded-full bg-clinic-primary px-3 py-1.5 text-[11px] font-semibold text-slate-900 hover:bg-clinic-primary/90"
              >
                Create parent account
              </button>
              <p className="text-[10px] text-slate-500">
                New account will appear in the table with a generated Parent ID.
              </p>
            </div>
          </div>

          {/* recent review */}
          <div className="rounded-2xl bg-clinic-surfaceDark p-4 shadow-xl shadow-black/40">
            <h3 className="text-xs font-semibold text-slate-200">
              Latest saved review
            </h3>
            {lastReview ? (
              <div className="mt-2 rounded-xl bg-black/30 p-3 text-[11px] text-slate-200">
                <p className="font-semibold">
                  {lastReview.parentName} ({lastReview.parentId})
                </p>
                <p className="mt-1 text-[10px] text-slate-400">
                  {lastReview.time}
                </p>
                <p className="mt-2 text-[11px] text-slate-100">
                  {lastReview.text}
                </p>
              </div>
            ) : (
              <p className="mt-2 text-[11px] text-slate-400">
                No reviews saved yet. Select a parent and add review notes from
                the detail panel.
              </p>
            )}
          </div>
        </aside>
      </div>
    </Dashboard>
  );
};

export default DoctorPanel;
