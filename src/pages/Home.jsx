import React from "react";
import Dashboard from "../components/Dashboard.jsx";
import AdhdLoader from "../components/AdhdLoader.jsx";
import SpiderMenu from "../components/SpiderMenu.jsx";

const Home = () => {
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const t = setTimeout(() => setLoading(false), 2600); // only on home
    return () => clearTimeout(t);
  }, []);

  if (loading) {
    return <AdhdLoader />;
  }

  return (
    <Dashboard roleLabel="Choose a role to continue">
      <div className="mt-4 flex flex-col gap-8">
        <SpiderMenu />

        <section className="mt-12 grid gap-4 text-xs text-slate-300 md:grid-cols-3">
          <div className="rounded-2xl bg-black/30 p-4 ring-1 ring-white/5">
            <p className="text-[11px] font-semibold text-clinic-primary">
              Doctor View
            </p>
            <p className="mt-1 text-[11px] text-slate-300">
              Access assessment forms, child timelines and progress heatmaps.
            </p>
          </div>
          <div className="rounded-2xl bg-black/30 p-4 ring-1 ring-white/5">
            <p className="text-[11px] font-semibold text-clinic-secondary">
              Parent View
            </p>
            <p className="mt-1 text-[11px] text-slate-300">
              Simple summaries, next-step guidance and home-practice tips.
            </p>
          </div>
          <div className="rounded-2xl bg-black/30 p-4 ring-1 ring-white/5">
            <p className="text-[11px] font-semibold text-clinic-accent">
              Admin View
            </p>
            <p className="mt-1 text-[11px] text-slate-300">
              Manage doctors, parent accounts and assessment templates.
            </p>
          </div>
        </section>
      </div>
    </Dashboard>
  );
};

export default Home;
