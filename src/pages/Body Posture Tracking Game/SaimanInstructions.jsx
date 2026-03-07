import React from "react";
import { useNavigate } from "react-router-dom";
import { Play, ArrowLeft, Sparkles, ShieldCheck, Hand, Zap } from "lucide-react";

export default function SaimanSaysInstructions() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0e1b4d] via-[#1b3a8f] to-[#274690] text-white relative overflow-hidden">
      {/* floating shapes */}
      <div className="absolute inset-0 pointer-events-none opacity-30">
        <div className="absolute rounded-full left-8 top-10 h-28 w-28 bg-cyan-300 blur-3xl" />
        <div className="absolute w-32 h-32 bg-pink-400 rounded-full right-8 top-24 blur-3xl" />
        <div className="absolute w-40 h-40 -translate-x-1/2 bg-yellow-300 rounded-full left-1/2 bottom-16 blur-3xl" />
      </div>

      {/* top bar */}
      <header className="relative z-10 flex items-center justify-between max-w-6xl px-6 py-6 mx-auto">
        <button
          onClick={() => navigate("/guest")}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl bg-white/15 hover:bg-white/25"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        <div className="text-right">
          <p className="text-[11px] uppercase tracking-[0.28em] text-white/70">
            Superhero Attention Game
          </p>
          <h1 className="text-2xl font-extrabold tracking-tight md:text-3xl">
            🦸 Saiman Says
          </h1>
        </div>
      </header>

      <main className="relative z-10 max-w-6xl px-6 pb-12 mx-auto">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1.25fr,0.75fr]">
          {/* left big card */}
          <section className="border shadow-2xl rounded-3xl border-white/20 bg-white/10 p-7 shadow-black/30 md:p-10">
            <div className="flex items-start gap-4">
              <div className="flex items-center justify-center w-12 h-12 mt-1 text-yellow-200 rounded-2xl bg-yellow-300/20">
                <Sparkles className="w-6 h-6" />
              </div>

              <div>
                <h2 className="text-3xl font-black tracking-tight md:text-4xl">
                  How to Play
                </h2>
                <p className="mt-2 text-sm text-white/80 md:text-base">
                  Follow Saiman&apos;s moves like a superhero. Sometimes you must
                  move, sometimes you must stay still!
                </p>
              </div>
            </div>

            {/* rules */}
            <div className="grid grid-cols-1 gap-4 mt-7 md:grid-cols-2">
              <RuleCard
                icon={<Hand className="w-5 h-5" />}
                title="Do the action"
                text="When you see the action clip, copy it clearly."
                tone="from-cyan-400/25 to-white/5"
              />
              <RuleCard
                icon={<ShieldCheck className="w-5 h-5" />}
                title="Freeze like a statue"
                text="When it’s FREEZE time, stay very still."
                tone="from-indigo-400/25 to-white/5"
              />
              <RuleCard
                icon={<Zap className="w-5 h-5" />}
                title="Power charge!"
                text="Your power bar fills when you follow correctly."
                tone="from-yellow-400/25 to-white/5"
              />
              <RuleCard
                icon={<Sparkles className="w-5 h-5" />}
                title="Just try your best"
                text="No worries if you make mistakes. Keep going!"
                tone="from-pink-400/25 to-white/5"
              />
            </div>

            {/* tips */}
            <div className="p-5 border mt-7 rounded-2xl border-white/15 bg-black/20">
              <p className="text-sm font-semibold text-white/90">
                Super Tips ✨
              </p>
              <ul className="mt-2 space-y-1 text-sm text-white/75">
                <li>• Stand where your full body fits in the camera.</li>
                <li>• Keep the room bright (turn on lights).</li>
                <li>• Face the screen and try to stay in the middle.</li>
              </ul>
            </div>

            {/* action buttons */}
            <div className="flex flex-col gap-3 mt-8 sm:flex-row">
              <button
                onClick={() => navigate("/saiman-game")}
                className="inline-flex items-center justify-center flex-1 gap-2 px-6 py-4 text-base font-black shadow-xl rounded-2xl bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-900 shadow-black/30 hover:brightness-110"
              >
                <Play className="w-5 h-5" />
                Start Game
              </button>

              <button
                onClick={() => navigate("/")}
                className="inline-flex items-center justify-center flex-1 gap-2 px-6 py-4 text-base font-bold rounded-2xl bg-white/15 hover:bg-white/25"
              >
                Back to Portal
              </button>
            </div>
          </section>

          {/* right side mascot panel */}
          <aside className="border shadow-2xl rounded-3xl border-white/20 bg-white/10 p-7 shadow-black/30">
            <div className="flex items-center justify-between">
              <p className="text-xs uppercase tracking-[0.25em] text-white/70">
                Meet Saiman
              </p>
              <span className="rounded-full bg-white/15 px-3 py-1 text-[11px] font-semibold">
                Hero Guide
              </span>
            </div>

            <div className="flex flex-col items-center mt-6 text-center">
              {/* If you have an image, put it in public/img/saiman_hero.png */}
              <div className="relative">
                <div className="absolute rounded-full -inset-4 bg-cyan-400/20 blur-2xl" />
                <img
                  src="/body posture image/superHero.png"
                  alt="Saiman"
                  className="relative object-cover w-56 h-56 border shadow-xl rounded-3xl border-white/20 bg-black/20 shadow-black/30"
                  onError={(e) => {
                    // fallback if you don't have the image yet
                    e.currentTarget.style.display = "none";
                  }}
                />
                <div className="relative mt-2 text-sm text-white/70">
                  If the image is missing, add it to{" "}
                  <span className="font-mono text-white/90">
                    
                  </span>
                </div>
              </div>

              <p className="mt-6 text-base font-bold">
                “Let’s power up together!”
              </p>
              <p className="mt-2 text-sm text-white/70">
                Watch the action video and copy the movement. When it’s FREEZE,
                stay still like a superhero statue.
              </p>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}

function RuleCard({ icon, title, text, tone }) {
  return (
    <div
      className={`rounded-2xl border border-white/15 bg-gradient-to-br ${tone} p-4`}
    >
      <div className="flex items-start gap-3">
        <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-white/15">
          <span className="text-white">{icon}</span>
        </div>
        <div>
          <p className="text-sm font-extrabold">{title}</p>
          <p className="mt-1 text-sm text-white/75">{text}</p>
        </div>
      </div>
    </div>
  );
}
