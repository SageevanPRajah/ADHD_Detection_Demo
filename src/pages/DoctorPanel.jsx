import React from "react";
import Dashboard from "../components/Dashboard.jsx";

const DoctorPanel = () => {
  return (
    <Dashboard roleLabel="Doctor Dashboard">
      <div className="mt-4 grid gap-4 md:grid-cols-[2fr,1.3fr]">
        <section className="rounded-2xl bg-clinic-surfaceDark p-4 shadow-xl shadow-black/40">
          <h2 className="text-sm font-semibold text-clinic-primary">
            Today&apos;s children
          </h2>
          <p className="mt-1 text-xs text-slate-400">
            This section will show appointments / children waiting for ADHD
            screening.
          </p>
          <div className="mt-3 h-40 rounded-xl border border-dashed border-slate-700/80 bg-black/20 text-center text-xs text-slate-500">
            <div className="flex h-full items-center justify-center">
              Add your table / cards here.
            </div>
          </div>
        </section>

        <aside className="space-y-3">
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

          <div className="rounded-2xl bg-clinic-surfaceDark p-4 shadow-xl shadow-black/40">
            <h3 className="text-xs font-semibold text-slate-200">
              Recent activities
            </h3>
            <p className="mt-1 text-[11px] text-slate-400">
              Plug your timeline / chart here.
            </p>
          </div>
        </aside>
      </div>
    </Dashboard>
  );
};

export default DoctorPanel;
