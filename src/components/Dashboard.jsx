import React from "react";
import { Brain, Menu } from "lucide-react";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "./LanguageSwitcher.jsx";

const Dashboard = ({ children, roleLabel = "Welcome" }) => {
  const [open, setOpen] = React.useState(false);
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-clinic-bgDark text-clinic-textDark">
      {/* Top bar */}
      <header className="border-b border-slate-700 bg-clinic-surfaceDark/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-clinic-primary/20 text-clinic-primary">
              <Brain className="h-5 w-5" />
            </div>
            <div className="leading-tight">
              <p className="text-sm font-semibold tracking-tight">
                {t("dashboard.title")}
              </p>
              <p className="text-[11px] text-slate-400">
                {t("dashboard.subtitle")}
              </p>
            </div>
          </div>

          <div className="hidden items-center gap-3 text-xs text-slate-300 sm:flex">
            <LanguageSwitcher />
            <span className="rounded-full bg-clinic-primary/10 px-3 py-1 font-medium text-clinic-primary">
              {roleLabel}
            </span>
          </div>

          <button
            className="inline-flex items-center justify-center rounded-lg border border-slate-600 p-1.5 text-slate-300 sm:hidden"
            onClick={() => setOpen((v) => !v)}
          >
            <Menu className="h-4 w-4" />
          </button>
        </div>

        {/* simple mobile dropdown */}
        {open && (
          <div className="border-t border-slate-800 bg-clinic-surfaceDark px-4 py-2 text-xs text-slate-300 sm:hidden">
            <div className="flex items-center justify-between">
              <p>{t("dashboard.role")}: {roleLabel}</p>
              <LanguageSwitcher />
            </div>
          </div>
        )}
      </header>

      {/* Main content */}
      <main className="mx-auto flex max-w-6xl flex-1 flex-col px-4 pb-8 pt-6">
        {children}
      </main>
    </div>
  );
};

export default Dashboard;
