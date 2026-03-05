import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Result() {
  const navigate = useNavigate();
  const [result, setResult] = useState(null);
  
  useEffect(() => {
    // Retrieve result from localStorage
    const savedResult = localStorage.getItem('saimanAdhdResult');
    if (savedResult) {
      try {
        setResult(JSON.parse(savedResult));
      } catch (err) {
        console.error('Failed to parse result:', err);
      }
    }
  }, []);

  const getScoreColor = (score) => {
    if (score >= 7) return 'from-red-500 to-orange-500';
    if (score >= 4) return 'from-yellow-500 to-orange-500';
    return 'from-green-500 to-emerald-500';
  };

  const getScoreLabel = (score) => {
    if (score >= 7) return 'High';
    if (score >= 4) return 'Moderate';
    return 'Low';
  };

  const getSubtypeColor = (subtype) => {
    const subtypeLower = subtype?.toLowerCase() || '';
    if (subtypeLower.includes('inattentive')) return 'bg-blue-500/20 text-blue-300 border-blue-400';
    if (subtypeLower.includes('hyperactive') || subtypeLower.includes('impulsive')) return 'bg-red-500/20 text-red-300 border-red-400';
    if (subtypeLower.includes('combined')) return 'bg-purple-500/20 text-purple-300 border-purple-400';
    return 'bg-cyan-500/20 text-cyan-300 border-cyan-400';
  };

  if (!result) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0e1b4d] via-[#1b3a8f] to-[#274690] text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-white/30 mx-auto mb-4"></div>
          <p className="text-xl text-white/70">Loading results...</p>
          <button
            onClick={() => navigate('/saiman-game')}
            className="mt-6 px-6 py-2 bg-white/20 hover:bg-white/30 rounded-xl transition"
          >
            Go Back to Game
          </button>
        </div>
      </div>
    );
  }

  const score = result.adhd_score || 0;
  const subtype = result.subtype || 'Not Specified';
  const scorePercentage = Math.min(100, (score / 10) * 100);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0e1b4d] via-[#1b3a8f] to-[#274690] text-white">
      {/* Header */}
      <header className="flex items-center justify-between px-10 py-6">
        <h1 className="text-4xl font-extrabold">🧠 ADHD Assessment Results</h1>
        <button
          onClick={() => navigate('/')}
          className="px-5 py-2 bg-white/20 hover:bg-white/30 rounded-xl transition"
        >
          Home
        </button>
      </header>

      {/* Main Content */}
      <main className="px-5 pb-10 max-w-5xl mx-auto">
        {/* Score Card */}
        <div className="mt-8 p-8 border rounded-[2.5rem] bg-white/10 border-white/20 shadow-2xl backdrop-blur-sm">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-2 text-white/90">Your ADHD Score</h2>
            <p className="text-white/60">Based on your performance in Saiman Says game</p>
          </div>

          {/* Large Score Display */}
          <div className="flex flex-col items-center mb-8">
            <div className={`relative w-64 h-64 rounded-full bg-gradient-to-br ${getScoreColor(score)} flex items-center justify-center shadow-2xl transform transition-all duration-500 hover:scale-105`}>
              <div className="absolute inset-0 rounded-full bg-black/20"></div>
              <div className="relative z-10 text-center">
                <div className="text-7xl font-black">{score.toFixed(1)}</div>
                <div className="text-2xl font-bold mt-2">/ 10</div>
              </div>
            </div>
            
            {/* Score Label */}
            <div className="mt-6 px-6 py-3 rounded-full bg-white/10 border border-white/20">
              <span className="text-xl font-bold">{getScoreLabel(score)} Risk Level</span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-3">
              <span className="text-sm font-semibold text-white/80">Score Breakdown</span>
              <span className="text-sm font-mono text-white/60">{scorePercentage.toFixed(1)}%</span>
            </div>
            <div className="h-6 overflow-hidden rounded-full bg-white/20 backdrop-blur-sm">
              <div
                className={`h-full bg-gradient-to-r ${getScoreColor(score)} transition-all duration-1000 ease-out shadow-lg`}
                style={{ width: `${scorePercentage}%` }}
              >
                <div className="h-full bg-white/20 animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Subtype Card */}
        <div className="mt-8 p-8 border rounded-[2.5rem] bg-white/10 border-white/20 shadow-2xl backdrop-blur-sm">
          <div className="text-center mb-6">
            <h2 className="text-3xl font-bold mb-2 text-white/90">ADHD Subtype</h2>
            <p className="text-white/60">Identified subtype based on behavioral patterns</p>
          </div>

          <div className="flex justify-center">
            <div className={`px-8 py-6 rounded-3xl border-2 ${getSubtypeColor(subtype)} backdrop-blur-sm transform transition-all duration-300 hover:scale-105`}>
              <div className="text-center">
                <div className="text-5xl mb-4">🎯</div>
                <div className="text-3xl font-black uppercase tracking-wide">{subtype}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Information Cards */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 border rounded-2xl bg-white/5 border-white/10 backdrop-blur-sm">
            <div className="text-4xl mb-3">📊</div>
            <h3 className="text-xl font-bold mb-2">Assessment Method</h3>
            <p className="text-white/70 text-sm">
              This score is based on body posture tracking, reaction time, and movement analysis during gameplay.
            </p>
          </div>

          <div className="p-6 border rounded-2xl bg-white/5 border-white/10 backdrop-blur-sm">
            <div className="text-4xl mb-3">⚠️</div>
            <h3 className="text-xl font-bold mb-2">Important Note</h3>
            <p className="text-white/70 text-sm">
              This is a screening tool and not a medical diagnosis. Please consult with a healthcare professional for a comprehensive evaluation.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => navigate('/saiman-game')}
            className="px-8 py-4 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 rounded-2xl font-bold text-lg transition-all transform hover:scale-105 shadow-lg"
          >
            Play Again
          </button>
          <button
            onClick={() => navigate('/')}
            className="px-8 py-4 bg-white/20 hover:bg-white/30 rounded-2xl font-bold text-lg transition-all border border-white/20"
          >
            Return to Home
          </button>
        </div>
      </main>
    </div>
  );
}

export default Result;
