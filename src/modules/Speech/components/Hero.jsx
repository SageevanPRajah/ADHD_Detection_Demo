import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const Hero = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <section className="min-h-screen flex items-center relative overflow-hidden">
      <div className="absolute inset-0 z-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/30 rounded-full blur-[100px] mix-blend-screen animate-blob"></div>
        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-purple-500/30 rounded-full blur-[100px] mix-blend-screen animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-32 left-1/2 w-96 h-96 bg-pink-500/30 rounded-full blur-[100px] mix-blend-screen animate-blob animation-delay-4000"></div>
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
      </div>

      <div className="container-custom relative z-10">
        <div className="max-w-4xl mx-auto text-center">


          <h1 className="text-5xl lg:text-7xl xl:text-8xl font-black text-white mb-8 leading-tight animate-fade-in-up animate-delay-100">
            {t('speech.heroTitle')}
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 mt-2">
              {t('speech.heroSub')}
            </span>
          </h1>

          <p className="text-xl lg:text-2xl text-white/90 mb-12 max-w-3xl mx-auto leading-relaxed animate-fade-in-up animate-delay-200 font-medium">
            {t('speech.heroDesc')}
          </p>

          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-16 animate-fade-in-up animate-delay-300">
            <button onClick={() => navigate('/speech/age')} className="group relative px-10 py-5 rounded-full text-lg font-bold text-white shadow-[0_0_20px_rgba(59,130,246,0.3)] border border-blue-400/50 bg-gradient-to-r from-blue-500 to-purple-500 overflow-hidden transform hover:scale-105 hover:shadow-[0_0_40px_rgba(168,85,247,0.6)] transition-all duration-300">
              <div className="absolute inset-0 bg-white/20 w-1/2 -skew-x-12 group-hover:animate-[slide_1s_ease-in-out]"></div>
              <span className="relative z-10 flex items-center gap-2 drop-shadow-md">
                <span>📖</span><span>{t('speech.startReading')}</span><span>🚀</span>
              </span>
            </button>
            <button onClick={() => navigate('/speech/features')} className="px-10 py-5 rounded-full text-lg font-bold text-white shadow-[0_0_20px_rgba(255,255,255,0.1)] border border-white/20 bg-white/10 hover:bg-white/20 hover:scale-105 transition-all duration-300 backdrop-blur-xl">
              <span className="flex items-center gap-2 drop-shadow-sm">
                <span>ℹ️</span><span>{t('speech.learnMore')}</span>
              </span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-3xl mx-auto animate-fade-in-up animate-delay-400">
            <div className="text-center bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20 shadow-[0_8px_32px_0_rgba(31,38,135,0.37)] transform hover:-translate-y-2 hover:shadow-[0_15px_40px_0_rgba(59,130,246,0.3)] transition-all duration-300 relative overflow-hidden group">
              <div className="absolute inset-0 bg-blue-500/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out"></div>
              <div className="w-16 h-16 mx-auto bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl flex items-center justify-center mb-6 shadow-[0_0_20px_rgba(59,130,246,0.5)] relative z-10">
                <span className="text-3xl">⭐</span>
              </div>
              <div className="text-4xl lg:text-5xl font-black text-white mb-2 drop-shadow-md relative z-10">87%</div>
              <div className="text-white/80 text-sm font-bold uppercase tracking-wider relative z-10">{t('speech.accuracy')}</div>
            </div>

            <div className="text-center bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20 shadow-[0_8px_32px_0_rgba(31,38,135,0.37)] transform hover:-translate-y-2 hover:shadow-[0_15px_40px_0_rgba(168,85,247,0.3)] transition-all duration-300 relative overflow-hidden group">
              <div className="absolute inset-0 bg-purple-500/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out"></div>
              <div className="w-16 h-16 mx-auto bg-gradient-to-br from-purple-400 to-purple-600 rounded-2xl flex items-center justify-center mb-6 shadow-[0_0_20px_rgba(168,85,247,0.5)] relative z-10">
                <span className="text-3xl">⚡</span>
              </div>
              <div className="text-4xl lg:text-5xl font-black text-white mb-2 drop-shadow-md relative z-10">2min</div>
              <div className="text-white/80 text-sm font-bold uppercase tracking-wider relative z-10">{t('speech.fastAnalysis')}</div>
            </div>

            <div className="text-center bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20 shadow-[0_8px_32px_0_rgba(31,38,135,0.37)] transform hover:-translate-y-2 hover:shadow-[0_15px_40px_0_rgba(236,72,153,0.3)] transition-all duration-300 relative overflow-hidden group">
              <div className="absolute inset-0 bg-pink-500/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out"></div>
              <div className="w-16 h-16 mx-auto bg-gradient-to-br from-pink-400 to-pink-600 rounded-2xl flex items-center justify-center mb-6 shadow-[0_0_20px_rgba(236,72,153,0.5)] relative z-10">
                <span className="text-3xl">🎉</span>
              </div>
              <div className="text-4xl lg:text-5xl font-black text-white mb-2 drop-shadow-md relative z-10">24/7</div>
              <div className="text-white/80 text-sm font-bold uppercase tracking-wider relative z-10">{t('speech.alwaysReady')}</div>
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