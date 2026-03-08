import React from "react";
import { useTranslation } from "react-i18next";
import Dashboard from "../components/Dashboard.jsx";
import AdhdLoader from "../components/AdhdLoader.jsx";
import SpiderMenu from "../components/SpiderMenu.jsx";

const Home = () => {
  const [loading, setLoading] = React.useState(true);
  const { t } = useTranslation();

  React.useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 2600);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return <AdhdLoader />;
  }

  return (
    <Dashboard roleLabel={t("home.chooseRole")}>
      <div className="mt-4 flex flex-col gap-8">
        <SpiderMenu />

        <section className="mt-12 grid gap-4 text-xs text-slate-300 md:grid-cols-3">
          <div className="rounded-2xl bg-black/30 p-4 ring-1 ring-white/5">
            <p className="text-[11px] font-semibold text-clinic-primary">
              {t("home.doctorView")}
            </p>
            <p className="mt-1 text-[11px] text-slate-300">
              {t("home.doctorViewDesc")}
            </p>
          </div>
          <div className="rounded-2xl bg-black/30 p-4 ring-1 ring-white/5">
            <p className="text-[11px] font-semibold text-clinic-secondary">
              {t("home.parentView")}
            </p>
            <p className="mt-1 text-[11px] text-slate-300">
              {t("home.parentViewDesc")}
            </p>
          </div>
          <div className="rounded-2xl bg-black/30 p-4 ring-1 ring-white/5">
            <p className="text-[11px] font-semibold text-clinic-accent">
              {t("home.adminView")}
            </p>
            <p className="mt-1 text-[11px] text-slate-300">
              {t("home.adminViewDesc")}
            </p>
          </div>
        </section>
      </div>
    </Dashboard>
  );
};

export default Home;
