import React from "react";

const pieceBase =
  "flex h-16 w-16 items-center justify-center rounded-xl shadow-lg shadow-black/40";

const AdhdLoader = () => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-clinic-bgDark">
      <div className="flex flex-col items-center gap-6">
        {/* floating letters */}
        <div className="relative flex gap-4">
          <div
            className={`${pieceBase} bg-clinic-primary/90 animate-adhdFloat`}
            style={{ animationDelay: "0s" }}
          >
            <span className="text-3xl font-black text-white">A</span>
          </div>
          <div
            className={`${pieceBase} bg-clinic-secondary/90 animate-adhdFloat`}
            style={{ animationDelay: "0.15s" }}
          >
            <span className="text-3xl font-black text-white">D</span>
          </div>
          <div
            className={`${pieceBase} bg-clinic-accent/90 animate-adhdFloat`}
            style={{ animationDelay: "0.3s" }}
          >
            <span className="text-3xl font-black text-white">H</span>
          </div>
          <div
            className={`${pieceBase} bg-indigo-500/90 animate-adhdFloat`}
            style={{ animationDelay: "0.45s" }}
          >
            <span className="text-3xl font-black text-white">D</span>
          </div>
        </div>

        {/* snapping puzzle word */}
        <div className="flex items-center gap-1 text-3xl font-extrabold tracking-[0.3em] text-clinic-textDark">
          <span className="inline-block animate-adhdSnap bg-clinic-primary/20 px-3 py-1">
            A
          </span>
          <span
            className="inline-block animate-adhdSnap bg-clinic-secondary/20 px-3 py-1"
            style={{ animationDelay: "0.15s" }}
          >
            D
          </span>
          <span
            className="inline-block animate-adhdSnap bg-clinic-accent/20 px-3 py-1"
            style={{ animationDelay: "0.3s" }}
          >
            H
          </span>
          <span
            className="inline-block animate-adhdSnap bg-indigo-500/20 px-3 py-1"
            style={{ animationDelay: "0.45s" }}
          >
            D
          </span>
        </div>

        <p className="text-xs uppercase tracking-[0.25em] text-slate-400">
          Assessing focus patterns...
        </p>
      </div>
    </div>
  );
};

export default AdhdLoader;
