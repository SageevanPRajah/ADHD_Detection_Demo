import React from "react";
import { useTranslation } from "react-i18next";
import Dashboard from "../components/Dashboard.jsx";
import { useNavigate } from "react-router-dom";
import { Eye, Activity, Mic, PenTool, Mail, CheckCircle2, ArrowRight, Play, AlertCircle, Sparkles, Check, ArrowLeft } from "lucide-react";

// define color themes for each game for visual flair
const gameThemes = {
  eye: { from: "from-blue-500/20", to: "to-cyan-500/5", border: "border-blue-500/30", iconColor: "text-blue-400", buttonBg: "bg-blue-600", hoverShadow: "hover:shadow-blue-500/20", progress: "text-blue-400 bg-blue-500/20 border-blue-500/30" },
  body: { from: "from-emerald-500/20", to: "to-teal-500/5", border: "border-emerald-500/30", iconColor: "text-emerald-400", buttonBg: "bg-emerald-600", hoverShadow: "hover:shadow-emerald-500/20", progress: "text-emerald-400 bg-emerald-500/20 border-emerald-500/30" },
  voice: { from: "from-purple-500/20", to: "to-fuchsia-500/5", border: "border-purple-500/30", iconColor: "text-purple-400", buttonBg: "bg-purple-600", hoverShadow: "hover:shadow-purple-500/20", progress: "text-purple-400 bg-purple-500/20 border-purple-500/30" },
  handwriting: { from: "from-amber-500/20", to: "to-orange-500/5", border: "border-amber-500/30", iconColor: "text-amber-400", buttonBg: "bg-amber-600", hoverShadow: "hover:shadow-amber-500/20", progress: "text-amber-400 bg-amber-500/20 border-amber-500/30" }
};

const GuestPanel = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  // Track strictly using the game IDs
  const [played, setPlayed] = React.useState({ eye: false, body: false, voice: false, handwriting: false });
  const allCompleted = Object.values(played).every(Boolean);
  const completedCount = Object.values(played).filter(Boolean).length;

  const games = [
    { id: "eye", labelKey: "guest.eyeTracking", descKey: "guest.eyeTrackingDesc", icon: Eye, route: "/eyetrack/terms" },
    { id: "body", labelKey: "guest.bodyPosture", descKey: "guest.bodyPostureDesc", icon: Activity, route: "/saiman-instructions" },
    { id: "voice", labelKey: "guest.voiceTracking", descKey: "guest.voiceTrackingDesc", icon: Mic, route: "/speech/" },
    { id: "handwriting", labelKey: "guest.handwriting", descKey: "guest.handwritingDesc", icon: PenTool, route: "/guest/handwriting" }
  ];

  const handleStartGame = (game) => {
    setPlayed((prev) => ({ ...prev, [game.id]: true }));
    navigate(game.route);
  };

  const handleSendResults = () => {
    if (!allCompleted) return;
    alert(t("guest.resultsSent"));
  };

  return (
    <Dashboard roleLabel={t("guest.dashboard")}>
      <div className="flex flex-col gap-6 font-sans pb-8 max-w-6xl mx-auto animate-adhdSnap mt-2">

        {/* Back Button */}
        <div className="flex items-center">
          <button
            onClick={() => navigate("/")}
            className="group flex items-center gap-2 text-sm font-semibold text-slate-400 hover:text-white transition-colors"
          >
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-800/50 group-hover:bg-slate-700 transition-colors border border-slate-700/50 group-hover:border-slate-500">
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            </div>
            Back to Home
          </button>
        </div>

        {/* Welcome Header */}
        <section className="relative overflow-hidden p-6 md:p-8 rounded-3xl bg-gradient-to-br from-clinic-surfaceDark to-slate-900 border border-white/10 shadow-2xl shadow-black/50">
          <div className="absolute top-[-50%] right-[-10%] w-[60%] h-[150%] rounded-full bg-clinic-primary/10 blur-[100px] pointer-events-none"></div>

          <div className="flex flex-col md:flex-row gap-6 justify-between items-start md:items-center relative z-10">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1 mb-4 text-xs font-semibold text-blue-300">
                <Sparkles className="w-4 h-4 text-blue-400" />
                Assessment Hub
              </div>
              <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight leading-tight">
                ADHD Detection <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">Suite</span>
              </h1>
              <p className="mt-2 text-sm md:text-base text-slate-300 max-w-xl leading-relaxed text-balance">
                Complete all 4 tracking modules to generate a comprehensive behavioral and cognitive assessment report.
              </p>
            </div>

            {/* Overall Progress Widget */}
            <div className="flex flex-col items-center bg-black/40 border border-white/10 rounded-2xl p-4 min-w-[180px]">
              <div className="flex items-center justify-between w-full mb-2">
                <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Progress</span>
                <span className="text-xs font-bold text-white bg-white/10 px-2 py-0.5 rounded-full">{completedCount}/4</span>
              </div>
              <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden flex">
                <div
                  className={`h-full transition-all duration-1000 ease-out bg-gradient-to-r ${completedCount === 4 ? 'from-emerald-500 to-teal-400' : 'from-blue-600 to-cyan-400'}`}
                  style={{ width: `${(completedCount / 4) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>
        </section>

        {/* Disclaimer Banner */}
        <section className="flex items-start gap-4 p-5 rounded-2xl border border-amber-500/20 bg-amber-500/5 shadow-lg shadow-black/20">
          <div className="flex-shrink-0 mt-0.5 text-amber-500">
            <AlertCircle className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-amber-400">{t("guest.disclaimer")}</h2>
            <p className="mt-1.5 text-xs text-amber-200/70 leading-relaxed max-w-3xl">
              {t("guest.disclaimerText")}
            </p>
          </div>
        </section>

        {/* Games Grid */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <span className="w-2 relative flex items-center justify-center">
                <span className="absolute w-2 h-2 rounded-full bg-blue-500"></span>
                <span className="absolute w-2 h-2 rounded-full bg-blue-400 animate-ping opacity-75"></span>
              </span>
              {t("guest.tryGames")}
            </h3>
            <p className="text-xs text-slate-400">{t("guest.chooseGame")}</p>
          </div>

          <div className="grid gap-5 mt-4 md:grid-cols-2 lg:grid-cols-2">
            {games.map((game) => {
              const Icon = game.icon;
              const isDone = played[game.id];
              const theme = gameThemes[game.id];

              return (
                <div
                  key={game.id}
                  className={`relative group flex flex-col rounded-3xl p-6 transition-all duration-300 ${isDone
                    ? "bg-slate-900/50 border border-slate-700/50 grayscale-[20%]"
                    : `bg-gradient-to-br from-clinic-surfaceDark to-black border-2 border-transparent bg-clip-padding ${theme.hoverShadow} hover:-translate-y-1`
                    }`}
                  style={!isDone ? {
                    backgroundImage: `linear-gradient(to bottom right, #0F1A33, #000000), linear-gradient(to bottom right, var(--tw-gradient-stops))`
                  } : {}}
                >
                  {/* Decorative Glow inside active cards */}
                  {!isDone && (
                    <div className={`absolute inset-0 bg-gradient-to-br ${theme.from} ${theme.to} opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl pointer-events-none`}></div>
                  )}

                  <div className="relative z-10 flex-1 flex flex-col">
                    <div className="flex justify-between items-start mb-4">
                      <div className={`flex items-center justify-center h-12 w-12 rounded-2xl shadow-inner ${isDone ? 'bg-slate-800 text-slate-500' : 'bg-slate-800 border ' + theme.border + ' ' + theme.iconColor}`}>
                        <Icon className={`w-6 h-6 ${isDone ? 'opacity-50' : ''}`} />
                      </div>

                      {isDone && (
                        <div className="flex items-center gap-1.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2.5 py-1 rounded-full text-xs font-bold">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          {t("guest.completed")}
                        </div>
                      )}
                    </div>

                    <h4 className={`text-lg font-bold mb-2 ${isDone ? 'text-slate-300' : 'text-white'}`}>
                      {t(game.labelKey)}
                    </h4>
                    <p className={`text-sm leading-relaxed mb-6 flex-1 ${isDone ? 'text-slate-500' : 'text-slate-400'}`}>
                      {t(game.descKey)}
                    </p>

                    <button
                      type="button"
                      onClick={() => handleStartGame(game)}
                      disabled={isDone}
                      className={`relative overflow-hidden inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-bold transition-all w-full sm:w-auto self-start shadow-md ${isDone
                        ? "cursor-not-allowed bg-slate-800 text-slate-500 border border-slate-700 shadow-none hover:bg-slate-800"
                        : `${theme.buttonBg} text-white hover:scale-[1.03] active:scale-[0.98]`
                        }`}
                    >
                      {!isDone && <span className="absolute inset-0 w-full h-full bg-white/20 -skew-x-12 -translate-x-full group-hover:animate-[shimmer_1s_forwards]"></span>}
                      {isDone ? (
                        <>
                          <Check className="w-4 h-4" />
                          {t("guest.trialCompleted")}
                        </>
                      ) : (
                        <>
                          {t("guest.startPlay")}
                          <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Action Panel */}
        <section className={`relative overflow-hidden p-6 rounded-3xl border shadow-xl transition-all duration-500 ${allCompleted
          ? 'bg-gradient-to-br from-emerald-900/40 to-teal-900/20 border-emerald-500/50 shadow-emerald-500/10'
          : 'bg-clinic-surfaceDark border-white/10 shadow-black/40'
          }`}>
          {allCompleted && (
            <div className="absolute top-[-50%] left-[-10%] w-[40%] h-[150%] rounded-full bg-emerald-500/10 blur-[80px] pointer-events-none"></div>
          )}

          <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
            <div className="flex-1 w-full text-center md:text-left">
              <h3 className="text-lg font-bold text-white flex items-center justify-center md:justify-start gap-2 mb-2">
                <CheckCircle2 className={`w-5 h-5 ${allCompleted ? 'text-emerald-400' : 'text-slate-500'}`} />
                {t("guest.trialSummary")}
              </h3>
              <p className="text-sm text-slate-400 max-w-lg mx-auto md:mx-0">
                {t("guest.trialSummaryDescA")}
                <strong className="text-slate-300 font-semibold px-1">{t("guest.trialSummaryDescB")}</strong>
                {t("guest.trialSummaryDescC")}
              </p>

              <div className="mt-4 flex flex-wrap justify-center md:justify-start gap-2">
                {games.map((game) => (
                  <div key={game.id} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold ${played[game.id] ? gameThemes[game.id].progress : 'bg-slate-800 text-slate-500 border-slate-700'
                    }`}>
                    {played[game.id] ? <Check className="w-3 h-3" /> : <div className="w-1.5 h-1.5 rounded-full bg-slate-600 m-0.5" />}
                    {t(game.labelKey)}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-col items-center md:items-end w-full md:w-auto shrink-0 border-t md:border-t-0 md:border-l border-white/10 pt-6 md:pt-0 md:pl-6">
              <p className="text-xs text-slate-400 mb-3 flex items-center gap-2">
                {t("guest.statusLabel")}:{" "}
                {allCompleted ? (
                  <span className="font-bold text-emerald-400 animate-pulse bg-emerald-500/10 px-2 py-0.5 rounded-full">
                    {t("guest.allCompleted")}
                  </span>
                ) : (
                  <span className="font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping"></span>
                    {t("guest.completeAll")}
                  </span>
                )}
              </p>

              <button
                type="button"
                onClick={handleSendResults}
                disabled={!allCompleted}
                className={`relative overflow-hidden w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl px-8 py-4 text-base font-bold transition-all duration-300 shadow-xl ${allCompleted
                  ? "bg-clinic-accent text-slate-900 hover:bg-emerald-400 hover:scale-105 active:scale-95 hover:shadow-emerald-500/30"
                  : "cursor-not-allowed bg-slate-800/80 text-slate-500 border border-slate-700/50"
                  }`}
              >
                {allCompleted && <span className="absolute inset-0 w-full h-full bg-white/30 -skew-x-12 -translate-x-[150%] animate-[shimmer_2s_infinite]"></span>}
                <Mail className={`w-5 h-5 ${allCompleted ? 'animate-bounce' : ''}`} />
                {t("guest.sendResults")}
              </button>
            </div>
          </div>
        </section>
      </div>

      <style jsx="true">{`
        @keyframes shimmer {
          100% {
            transform: translateX(100%) skewX(-12deg);
          }
        }
      `}</style>
    </Dashboard>
  );
};

export default GuestPanel;
