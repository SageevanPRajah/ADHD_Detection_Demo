import React from "react";
import Dashboard from "../components/Dashboard.jsx";
import { useNavigate } from "react-router-dom";
import { Eye, Activity, Mic, PenTool, Mail } from "lucide-react";

const games = [
  {
    id: "eye",
    label: "Eye Tracking Game",
    description: "Follow moving targets to measure focus, saccades and gaze shifts.",
    icon: Eye,
    route: "/eyetrack"
  },
  {
    id: "body",
    label: "Body Posture Tracking Game",
    description:
      "Mirror simple poses to observe restlessness, fidgeting and posture changes.",
    icon: Activity,
    route: "/saiman-instructions"
  },
  {
    id: "voice",
    label: "Voice Tracking Game",
    description:
      "Read fun phrases aloud while the system listens for pace and impulsive speech.",
    icon: Mic,
    route: "/guest/voice-tracking"
  },
  {
    id: "handwriting",
    label: "Handwriting Tracking Game",
    description:
      "Trace shapes and letters to capture handwriting rhythm and micro-pauses.",
    icon: PenTool,
    route: "/guest/handwriting"
  }
];

const GuestPanel = () => {
  const navigate = useNavigate();
  const [played, setPlayed] = React.useState({
    eye: false,
    body: false,
    voice: false,
    handwriting: false
  });

  const allCompleted = Object.values(played).every(Boolean);

  const handleStartGame = (game) => {
    setPlayed((prev) => ({ ...prev, [game.id]: true }));
    // later these routes will contain the actual environments
    navigate(game.route);
  };

  const handleSendResults = () => {
    if (!allCompleted) return;
    // placeholder – wire up to your backend / email flow later
    alert("Results sent to your email (demo only).");
  };

  return (
    <Dashboard roleLabel="Guest Demo View">
      <div className="mt-4 space-y-4">
        {/* intro */}
        <section className="p-4 shadow-xl rounded-2xl bg-clinic-surfaceDark shadow-black/40">
          <h2 className="text-sm font-semibold text-clinic-accent">
            Important Disclaimer
          </h2>
          <p className="mt-1 text-xs text-slate-300">
            This game gives an initial analysis of ADHD likelihood based on your child’s responses. 
            The result may not always be accurate, so please use it only as a guide. 
            If the result suggests a possibility of ADHD or if you have any concerns consult a qualified doctor for proper evaluation.
          </p>
        </section>

        {/* game cards */}
        <section className="p-4 space-y-3 shadow-xl rounded-2xl bg-clinic-surfaceDark shadow-black/40">
          <h3 className="text-xs font-semibold text-slate-200">
            Try the game-based screening analysis
          </h3>
          <p className="mt-1 text-[11px] text-slate-400">
            Choose a game below. Each guest account can play every game once as
            a single trial.
          </p>

          <div className="grid gap-3 mt-3 md:grid-cols-2">
            {games.map((game) => {
              const Icon = game.icon;
              const isDone = played[game.id];

              return (
                <div
                  key={game.id}
                  className="flex flex-col rounded-3xl bg-gradient-to-br from-lime-400 via-clinic-secondary to-clinic-primary p-[1px] shadow-lg shadow-black/40"
                >
                  <div className="flex flex-col flex-1 px-4 py-5 text-center rounded-3xl bg-black/80">
                    <div className="flex items-center justify-center mx-auto rounded-full h-9 w-9 bg-black/60">
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <h4 className="mt-3 text-sm font-semibold text-white">
                      {game.label}
                    </h4>
                    <p className="mt-2 text-[11px] leading-relaxed text-slate-100/90">
                      {game.description}
                    </p>
                    <button
                      type="button"
                      onClick={() => handleStartGame(game)}
                      disabled={isDone}
                      className={`mt-4 inline-flex items-center justify-center rounded-full px-4 py-2 text-xs font-semibold transition ${
                        isDone
                          ? "cursor-not-allowed bg-black/40 text-slate-400"
                          : "bg-black text-white hover:bg-slate-900"
                      }`}
                    >
                      {isDone ? "Trial completed" : "Start Play"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* trial summary + send mail */}
        <section className="p-4 shadow-xl rounded-2xl bg-clinic-surfaceDark shadow-black/40">
          <h3 className="text-xs font-semibold text-slate-200">
            Game trial summary
          </h3>
          <p className="mt-1 text-[11px] text-slate-400">
            Each guest account can play <span className="font-semibold">one</span>{" "}
            trial per game. Once you have completed all four games, you can send
            a combined demo report to your email.
          </p>

          <div className="mt-3 grid gap-2 text-[11px] md:grid-cols-2">
            {games.map((game) => (
              <div
                key={game.id}
                className="flex items-center justify-between px-3 py-2 border rounded-xl border-slate-700/80 bg-black/30"
              >
                <span className="text-slate-200">{game.label}</span>
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] ${
                    played[game.id]
                      ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/40"
                      : "bg-slate-800 text-slate-400 border border-slate-600"
                  }`}
                >
                  {played[game.id] ? "Completed" : "Not played"}
                </span>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between gap-3 mt-4">
            <p className="text-[11px] text-slate-400">
              Status:{" "}
              {allCompleted ? (
                <span className="font-semibold text-emerald-400">
                  All 4 game trials completed.
                </span>
              ) : (
                <span className="font-semibold text-yellow-300">
                  Complete all 4 games to unlock email summary.
                </span>
              )}
            </p>

            <button
              type="button"
              onClick={handleSendResults}
              disabled={!allCompleted}
              className={`inline-flex items-center gap-1 rounded-full px-4 py-2 text-xs font-semibold transition ${
                allCompleted
                  ? "bg-clinic-accent text-slate-900 hover:bg-emerald-400"
                  : "cursor-not-allowed bg-slate-800 text-slate-500"
              }`}
            >
              <Mail className="w-3 h-3" />
              Send results to email
            </button>
          </div>
        </section>
      </div>
    </Dashboard>
  );
};

export default GuestPanel;
