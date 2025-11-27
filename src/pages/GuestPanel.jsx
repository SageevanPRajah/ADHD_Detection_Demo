import React from "react";
import Dashboard from "../components/Dashboard.jsx";

const GuestPanel = () => {
  return (
    <Dashboard roleLabel="Guest Demo View">
      <div className="mt-4 space-y-4">
        <section className="rounded-2xl bg-clinic-surfaceDark p-4 shadow-xl shadow-black/40">
          <h2 className="text-sm font-semibold text-clinic-accent">
            Demo environment
          </h2>
          <p className="mt-1 text-xs text-slate-300">
            This view is for training and demo only. No real child data is
            stored.
          </p>
        </section>

        <section className="rounded-2xl bg-clinic-surfaceDark p-4 shadow-xl shadow-black/40">
          <h3 className="text-xs font-semibold text-slate-200">
            Example screening journey
          </h3>
          <ol className="mt-2 space-y-1 text-xs text-slate-300">
            <li>1. Choose a fictional child profile.</li>
            <li>2. Walk through the questionnaire screens.</li>
            <li>3. View sample visual feedback and reports.</li>
          </ol>
        </section>
      </div>
    </Dashboard>
  );
};

export default GuestPanel;
