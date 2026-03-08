import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const Hero = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <section className="min-h-screen flex items-center relative overflow-hidden">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-20 w-72 h-72 bg-accent-500 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-primary-500 rounded-full blur-3xl"></div>
      </div>

      <div className="container-custom relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center px-5 py-2.5 bg-gradient-to-r from-blue-400/20 to-purple-400/20 backdrop-blur-sm rounded-full text-white text-sm font-semibold mb-8 animate-fade-in-up border border-blue-400/30">
            <span className="text-lg mr-2">🤖</span>
            <span>{t('speech.aiPowered')}</span>
            <span className="text-lg ml-2">✨</span>
          </div>

          <h1 className="text-5xl lg:text-7xl xl:text-8xl font-black text-white mb-8 leading-tight animate-fade-in-up animate-delay-100">
            {t('speech.heroTitle')}
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 mt-2">
              {t('speech.heroSub')}
            </span>
          </h1>

          <p className="text-xl lg:text-2xl text-white/90 mb-12 max-w-3xl mx-auto leading-relaxed animate-fade-in-up animate-delay-200 font-medium">
            {t('speech.heroDesc')}
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16 animate-fade-in-up animate-delay-300">
            <button onClick={() => navigate('/speech/age')} className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-bold px-10 py-5 rounded-full text-lg shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 border-2 border-white/20">
              <span className="flex items-center gap-2">
                <span>📖</span><span>{t('speech.startReading')}</span><span>🚀</span>
              </span>
            </button>
            <button onClick={() => navigate('/speech/features')} className="bg-white/20 hover:bg-white/30 text-white border-2 border-white/30 hover:border-white/50 font-bold px-10 py-5 rounded-full text-lg shadow-lg transform hover:scale-105 transition-all duration-300">
              <span className="flex items-center gap-2">
                <span>ℹ️</span><span>{t('speech.learnMore')}</span>
              </span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-2xl mx-auto animate-fade-in-up animate-delay-400">
            <div className="text-center bg-blue-400/15 backdrop-blur-sm rounded-2xl p-6 border border-blue-400/20 transform hover:scale-105 transition-all">
              <div className="text-2xl mb-2">⭐</div>
              <div className="text-3xl lg:text-4xl font-bold text-white mb-2">95%</div>
              <div className="text-white/80 text-sm font-medium">{t('speech.accuracy')}</div>
            </div>
            <div className="text-center bg-purple-400/15 backdrop-blur-sm rounded-2xl p-6 border border-purple-400/20 transform hover:scale-105 transition-all">
              <div className="text-2xl mb-2">⚡</div>
              <div className="text-3xl lg:text-4xl font-bold text-white mb-2">2min</div>
              <div className="text-white/80 text-sm font-medium">{t('speech.fastAnalysis')}</div>
            </div>
            <div className="text-center bg-pink-400/15 backdrop-blur-sm rounded-2xl p-6 border border-pink-400/20 transform hover:scale-105 transition-all">
              <div className="text-2xl mb-2">🎉</div>
              <div className="text-3xl lg:text-4xl font-bold text-white mb-2">24/7</div>
              <div className="text-white/80 text-sm font-medium">{t('speech.alwaysReady')}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce-slow">
        <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center">
          <div className="w-1 h-3 bg-white/50 rounded-full mt-2 animate-pulse"></div>
        </div>
      </div>
    </section>
  );
};

export default Hero;