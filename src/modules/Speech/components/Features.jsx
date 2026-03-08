import React from 'react';
import { useTranslation } from 'react-i18next';

const Features = () => {
  const { t } = useTranslation();

  const features = [
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
        </svg>
      ), titleKey: 'speech.fileUploadTitle', descKey: 'speech.fileUploadDesc', color: 'from-blue-400/20 to-blue-600/20', borderColor: 'border-blue-400/30'
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      ), titleKey: 'speech.aiAnalysis', descKey: 'speech.aiAnalysisDesc', color: 'from-purple-400/20 to-purple-600/20', borderColor: 'border-purple-400/30'
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
        </svg>
      ), titleKey: 'speech.speechTranscription', descKey: 'speech.speechTranscriptionDesc', color: 'from-green-400/20 to-green-600/20', borderColor: 'border-green-400/30'
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ), titleKey: 'speech.detailedReports', descKey: 'speech.detailedReportsDesc', color: 'from-orange-400/20 to-orange-600/20', borderColor: 'border-orange-400/30'
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      ), titleKey: 'speech.securePrivate', descKey: 'speech.securePrivateDesc', color: 'from-red-400/20 to-red-600/20', borderColor: 'border-red-400/30'
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ), titleKey: 'speech.fastResults', descKey: 'speech.fastResultsDesc', color: 'from-yellow-400/20 to-yellow-600/20', borderColor: 'border-yellow-400/30'
    }
  ];

  return (
    <section id="features" className="section-padding relative">
      <div className="container-custom">
        <div className="text-center mb-16 relative z-10">
          <h2 className="text-4xl lg:text-5xl font-black text-white mb-6 animate-fade-in-up drop-shadow-md">
            {t('speech.powerfulFeatures')}
          </h2>
          <p className="text-xl text-white/80 max-w-2xl mx-auto animate-fade-in-up animate-delay-100 font-medium tracking-wide">
            {t('speech.powerfulFeaturesDesc')}
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 relative z-10">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20 shadow-[0_8px_32px_0_rgba(31,38,135,0.37)] transform hover:-translate-y-2 hover:shadow-[0_15px_40px_0_rgba(59,130,246,0.3)] transition-all duration-300 relative overflow-hidden group animate-fade-in-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-100 transition-opacity duration-500 ease-out`}></div>

              <div className="relative inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 shadow-inner mb-6 group-hover:scale-110 transition-transform duration-500 z-10">
                <div className={`text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.5)] bg-gradient-to-br ${feature.color} text-transparent bg-clip-text`}>
                  {feature.icon}
                </div>
              </div>

              <h3 className="text-xl font-bold text-white mb-4 relative z-10 drop-shadow-sm group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-blue-200 transition-all duration-300">
                {t(feature.titleKey)}
              </h3>

              <p className="text-white/80 leading-relaxed font-medium tracking-wide relative z-10 group-hover:text-white transition-colors duration-300">
                {t(feature.descKey)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;