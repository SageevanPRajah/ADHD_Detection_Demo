import React from 'react';
import { useTranslation } from 'react-i18next';

const Stats = () => {
  const { t } = useTranslation();

  const stats = [
    { value: '87%', labelKey: 'speech.accuracyRate', descKey: 'speech.accuracyRateDesc', color: 'from-blue-400 to-blue-600', text: 'text-blue-400' },
    { value: '<2min', labelKey: 'speech.processingTime', descKey: 'speech.processingTimeDesc', color: 'from-purple-400 to-purple-600', text: 'text-purple-400' },
    { value: '10K+', labelKey: 'speech.analysesDone', descKey: 'speech.analysesDoneDesc', color: 'from-green-400 to-emerald-600', text: 'text-green-400' },
    { value: '24/7', labelKey: 'speech.availability', descKey: 'speech.availabilityDesc', color: 'from-orange-400 to-red-500', text: 'text-orange-400' }
  ];

  return (
    <section className="section-padding">
      <div className="container-custom relative z-10">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="group relative bg-white/10 backdrop-blur-xl rounded-[2rem] p-8 text-center border border-white/20 shadow-[0_8px_32px_0_rgba(31,38,135,0.37)] transform hover:-translate-y-2 hover:shadow-2xl transition-all duration-300 overflow-hidden animate-fade-in-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-0 group-hover:opacity-10 transition-opacity duration-500`}></div>

              <div className="relative z-10">
                <div className={`text-4xl lg:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-br ${stat.color} mb-4 drop-shadow-md group-hover:scale-110 transition-transform duration-300`}>
                  {stat.value}
                </div>
                <div className="text-xl font-bold text-white mb-2 tracking-wide group-hover:text-blue-200 transition-colors duration-300">
                  {t(stat.labelKey)}
                </div>
                <div className="text-white/70 font-medium text-sm leading-relaxed group-hover:text-white/90 transition-colors duration-300">
                  {t(stat.descKey)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Stats;