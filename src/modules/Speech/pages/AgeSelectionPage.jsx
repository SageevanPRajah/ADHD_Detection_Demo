import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';

const AgeSelectionPage = () => {
  const navigate = useNavigate();
  const [selectedAge, setSelectedAge] = useState(null);

  const handleAgeSelect = (age) => {
    setSelectedAge(age);

    // Navigate to speech reading task page
    navigate('/speech/reading', { state: { selectedAge: age } });
  };

  return (
    <div className="speech-module min-h-screen">
      <Navigation />

      <section className="py-20">
        <div className="container-custom">
          <div className="max-w-4xl mx-auto">

            {/* Section Header */}
            <div className="text-center mb-12">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-400/30 rounded-full mb-4">
                <span className="text-4xl">🎂</span>
              </div>

              <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
                Choose Your Age
              </h2>

              <p className="text-lg text-white/80">
                Pick your age to start the reading adventure! 📚
              </p>
            </div>

            {/* Age Selection Cards */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
              {[
                { age: 6, label: 'Age 6', description: 'Simple words', emoji: '🌟', color: 'from-yellow-400/30 to-orange-400/30' },
                { age: 7, label: 'Age 7', description: 'Easy sentences', emoji: '⭐', color: 'from-blue-400/30 to-cyan-400/30' },
                { age: 8, label: 'Age 8', description: 'Short stories', emoji: '✨', color: 'from-green-400/30 to-emerald-400/30' },
                { age: 9, label: 'Age 9', description: 'Long stories', emoji: '🎯', color: 'from-purple-400/30 to-pink-400/30' },
                { age: 10, label: 'Age 10', description: 'Complex texts', emoji: '🚀', color: 'from-red-400/30 to-pink-400/30' },
                { age: 11, label: 'Age 11+', description: 'Advanced reading', emoji: '💫', color: 'from-indigo-400/30 to-purple-400/30' }
              ].map(({ age, label, description, emoji, color }) => (
                <button
                  key={age}
                  onClick={() => handleAgeSelect(age)}
                  className={`relative bg-gradient-to-br ${color} backdrop-blur-md rounded-2xl p-6 border-2 transition-all duration-300 hover:scale-105 hover:shadow-xl text-left ${
                    selectedAge === age
                      ? 'border-blue-400 shadow-xl shadow-blue-500/30 scale-105'
                      : 'border-blue-500/30 hover:border-blue-400/50'
                  }`}
                >

                  <div className="absolute top-4 right-4 text-xl">
                    {emoji}
                  </div>

                  <div className="mt-2">
                    <div className="text-3xl mb-2">{emoji}</div>

                    <h3 className="text-xl font-bold text-white mb-1">
                      {label}
                    </h3>

                    <p className="text-sm text-white/80 mb-4">
                      {description}
                    </p>

                    <div className="flex items-center text-white/90 font-semibold text-sm bg-white/10 rounded-full px-4 py-2">
                      <span>Start</span>

                      <svg
                        className="w-4 h-4 ml-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>

                    </div>
                  </div>

                </button>
              ))}
            </div>

          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default AgeSelectionPage;