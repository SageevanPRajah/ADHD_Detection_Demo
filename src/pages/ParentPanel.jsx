import React from "react";
import Dashboard from "../components/Dashboard.jsx";

const ParentPanel = () => {
  return (
    <Dashboard roleLabel="Parent Dashboard">
      <div className="mt-4 grid gap-4 md:grid-cols-[1.6fr,1.4fr]">
        <section className="rounded-2xl bg-clinic-surfaceDark p-4 shadow-xl shadow-black/40">
          <h2 className="text-sm font-semibold text-clinic-secondary">
            Your child&apos;s overview
          </h2>
          <p className="mt-1 text-xs text-slate-300">
            A calm snapshot of progress, upcoming appointments and doctor
            notes.
          </p>
          <div className="mt-3 h-40 rounded-xl border border-dashed border-slate-700/80 bg-black/20 text-center text-xs text-slate-500">
            Replace with charts / progress bars.
          </div>
        </section>

        <aside className="space-y-3">
          <div className="rounded-2xl bg-clinic-surfaceDark p-4 shadow-xl shadow-black/40">
            <h3 className="text-xs font-semibold text-slate-200">
              Next suggested steps
            </h3>
            <ul className="mt-2 space-y-1 text-xs text-slate-300">
              <li>• Home practice tips</li>
              <li>• School coordination notes</li>
              <li>• Questions to ask your doctor</li>
            </ul>
          </div>
          <div className="rounded-2xl bg-clinic-surfaceDark p-4 shadow-xl shadow-black/40">
            <h3 className="text-xs font-semibold text-slate-200">
              Messages from doctor
            </h3>
            <p className="mt-1 text-[11px] text-slate-400">
              You can wire this to your messaging backend later.
            </p>
          </div>
        </aside>
      </div>
    </Dashboard>
  );
};

export default ParentPanel;
