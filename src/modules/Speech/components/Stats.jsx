import React from 'react';
import { useTranslation } from 'react-i18next';

const Stats = () => {
  const { t } = useTranslation();

  const stats = [
    { value: '95%', labelKey: 'speech.accuracyRate', descKey: 'speech.accuracyRateDesc', color: 'text-blue-400' },
    { value: '<2min', labelKey: 'speech.processingTime', descKey: 'speech.processingTimeDesc', color: 'text-purple-400' },
    { value: '10K+', labelKey: 'speech.analysesDone', descKey: 'speech.analysesDoneDesc', color: 'text-green-400' },
    { value: '24/7', labelKey: 'speech.availability', descKey: 'speech.availabilityDesc', color: 'text-orange-400' }
  ];

  return (
    <section className="section-padding">
      <div className="container-custom">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div key={index} className="text-center bg-white/10 backdrop-blur-md rounded-2xl p-8 card-hover shadow-medium border border-white/20">
              <div className={`text-4xl lg:text-5xl font-bold ${stat.color} mb-3`}>{stat.value}</div>
              <div className="text-lg font-semibold text-white mb-2">{t(stat.labelKey)}</div>
              <div className="text-white/70 text-sm">{t(stat.descKey)}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Stats;