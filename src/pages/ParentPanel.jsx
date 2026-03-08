import React from "react";
import Dashboard from "../components/Dashboard.jsx";
import { useTranslation } from "react-i18next";

const ParentPanel = () => {
  const { t } = useTranslation();

  return (
    <Dashboard roleLabel={t("parent.dashboard")}>
      <div className="mt-4 grid gap-4 md:grid-cols-[1.6fr,1.4fr]">
        <section className="rounded-2xl bg-clinic-surfaceDark p-4 shadow-xl shadow-black/40">
          <h2 className="text-sm font-semibold text-clinic-secondary">{t("parent.childOverview")}</h2>
          <p className="mt-1 text-xs text-slate-300">{t("parent.childOverviewDesc")}</p>
          <div className="mt-3 h-40 rounded-xl border border-dashed border-slate-700/80 bg-black/20 text-center text-xs text-slate-500">
            {t("parent.replacePlaceholder")}
          </div>
        </section>

        <aside className="space-y-3">
          <div className="rounded-2xl bg-clinic-surfaceDark p-4 shadow-xl shadow-black/40">
            <h3 className="text-xs font-semibold text-slate-200">{t("parent.nextSteps")}</h3>
            <ul className="mt-2 space-y-1 text-xs text-slate-300">
              <li>• {t("parent.homePractice")}</li>
              <li>• {t("parent.schoolNotes")}</li>
              <li>• {t("parent.askDoctor")}</li>
            </ul>
          </div>
          <div className="rounded-2xl bg-clinic-surfaceDark p-4 shadow-xl shadow-black/40">
            <h3 className="text-xs font-semibold text-slate-200">{t("parent.doctorMessages")}</h3>
            <p className="mt-1 text-[11px] text-slate-400">{t("parent.wireBackend")}</p>
          </div>
        </aside>
      </div>
    </Dashboard>
  );
};

export default ParentPanel;
