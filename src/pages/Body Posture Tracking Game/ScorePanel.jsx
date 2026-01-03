import React from "react";

export default function ScorePanel({ result }) {
  if (!result) {
    return (
      <p className="text-sm opacity-70">
        Results will appear here after the session.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <p className="text-sm opacity-80">ADHD Score</p>
        <div className="flex items-center gap-3">
          <div className="flex-1 h-3 overflow-hidden rounded-full bg-white/20">
            <div
              className="h-full bg-gradient-to-r from-red-400 to-green-400"
              style={{
                width: `${Math.min(100, (result.adhd_score / 10) * 100)}%`,
              }}
            />
          </div>
          <span className="font-mono">{result.adhd_score.toFixed(1)}/10</span>
        </div>
      </div>

      <div>
        <p className="text-sm opacity-80">Subtype</p>
        <p className="text-xl font-bold">{result.subtype}</p>
      </div>
    </div>
  );
}
