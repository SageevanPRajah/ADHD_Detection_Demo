import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Navigation from '../components/Navigation';

const AgeSelectionPage = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [selectedAge, setSelectedAge] = useState(null);

  const handleAgeSelect = (age) => {
    setSelectedAge(age);
    navigate('/speech/reading', { state: { selectedAge: age } });
  };

  return (
    <div className="speech-module min-h-screen">
      <Navigation />

      <section className="py-20">
        <div className="container-custom">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-16 relative z-10 animate-fade-in-up">
              <div className="inline-flex items-center justify-center w-24 h-24 bg-white/10 backdrop-blur-xl border border-white/20 shadow-[0_0_20px_rgba(59,130,246,0.3)] rounded-3xl mb-6 transform hover:rotate-12 transition-transform duration-300">
                <span className="text-5xl drop-shadow-md">🎂</span>
              </div>
              <h2 className="text-4xl lg:text-5xl font-black text-white mb-6 drop-shadow-md">{t('speech.chooseAge')}</h2>
              <p className="text-xl text-white/80 font-medium tracking-wide max-w-2xl mx-auto">{t('speech.chooseAgeDesc')}</p>
            </div>

            <div className="flex flex-wrap justify-center gap-6 relative z-10">
              {[
                { age: 6, labelKey: '6', descKey: 'speech.age6Desc', emoji: '🌟', color: 'from-blue-400 to-indigo-500', shadow: 'shadow-blue-500/30', glow: 'group-hover:shadow-[0_0_40px_rgba(59,130,246,0.5)]' },
                { age: 7, labelKey: '7', descKey: 'speech.age7Desc', emoji: '⭐', color: 'from-purple-400 to-fuchsia-500', shadow: 'shadow-purple-500/30', glow: 'group-hover:shadow-[0_0_40px_rgba(168,85,247,0.5)]' },
                { age: 8, labelKey: '8', descKey: 'speech.age8Desc', emoji: '✨', color: 'from-pink-400 to-rose-500', shadow: 'shadow-pink-500/30', glow: 'group-hover:shadow-[0_0_40px_rgba(244,63,94,0.5)]' },
                { age: 9, labelKey: '9', descKey: 'speech.age9Desc', emoji: '🎯', color: 'from-orange-400 to-amber-500', shadow: 'shadow-orange-500/30', glow: 'group-hover:shadow-[0_0_40px_rgba(249,115,22,0.5)]' },
                { age: 10, labelKey: '10', descKey: 'speech.age10Desc', emoji: '🚀', color: 'from-emerald-400 to-teal-500', shadow: 'shadow-emerald-500/30', glow: 'group-hover:shadow-[0_0_40px_rgba(16,185,129,0.5)]' }
              ].map(({ age, labelKey, descKey, emoji, color, shadow, glow }, index) => (
                <button
                  key={age}
                  onClick={() => handleAgeSelect(age)}
                  className={`group relative w-full sm:w-[calc(50%-12px)] lg:w-[calc(20%-20px)] min-w-[200px] text-center bg-white/5 backdrop-blur-2xl rounded-[2.5rem] p-8 border border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] transform transition-all duration-500 hover:-translate-y-4 overflow-hidden animate-fade-in-up ${glow}`}
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className={`absolute inset-0 bg-gradient-to-b ${color} opacity-0 group-hover:opacity-10 transition-opacity duration-500`}></div>

                  <div className="relative z-10 flex flex-col items-center">
                    <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${color} flex items-center justify-center text-4xl mb-6 shadow-2xl ${shadow} transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-500`}>
                      <span className="drop-shadow-lg">{emoji}</span>
                    </div>

                    <div className="mb-4">
                      <span className="text-sm font-bold text-white/40 uppercase tracking-[0.2em] mb-1 block">Age</span>
                      <h3 className="text-5xl font-black text-white tracking-tighter group-hover:scale-110 transition-transform duration-500">{labelKey}</h3>
                    </div>

                    <p className="text-white/60 font-medium text-sm leading-relaxed mb-8 h-10 flex items-center justify-center line-clamp-2">{t(descKey)}</p>

                    <div className="w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent mb-6"></div>

                    <div className={`inline-flex items-center justify-center w-full text-white font-bold text-sm bg-white/5 border border-white/10 rounded-2xl py-4 backdrop-blur-md group-hover:bg-white/10 group-hover:border-white/20 transition-all duration-300`}>
                      <span>SELECT AGE</span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AgeSelectionPage;