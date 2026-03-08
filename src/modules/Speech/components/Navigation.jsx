import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from '../../../components/LanguageSwitcher.jsx';

const Navigation = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { t } = useTranslation();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className="relative z-50 transition-all duration-500 w-full pt-6 pb-2">
      <div className="container-custom px-4 lg:px-8">
        <div className={`mx-auto max-w-7xl rounded-[2.5rem] transition-all duration-500 border border-white/10 ${isScrolled
            ? 'py-3 px-6 lg:px-10 bg-black/40 backdrop-blur-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)]'
            : 'py-4 px-6 lg:px-10 bg-white/5 backdrop-blur-xl'
          }`}>
          <div className="flex items-center justify-between h-14 lg:h-16">
            <Link to="/speech" className="group flex items-center space-x-4">
              <div className="relative w-10 h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                <div className="absolute inset-0 bg-white/25 rounded-2xl blur-sm group-hover:blur-md transition-all"></div>
                <svg className="w-6 h-6 lg:w-7 lg:h-7 text-white relative z-10 drop-shadow-md" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
              </div>
              <div className="flex flex-col">
                <h1 className="text-xl lg:text-2xl font-black text-white tracking-tight drop-shadow-sm group-hover:text-blue-200 transition-colors">
                  {t('speech.navTitle')}
                </h1>
                <p className="text-[9px] uppercase tracking-[0.25em] font-bold text-blue-300/80 -mt-0.5">
                  {t('speech.navSubtitle')}
                </p>
              </div>
            </Link>

            <div className="hidden md:flex items-center space-x-10">
              <div className="flex items-center space-x-8 mr-4">
                {[
                  { to: '/speech/features', label: t('speech.features') },
                  { to: '/speech/analyze', label: t('speech.analyze') },
                  { to: '/speech/age', label: t('speech.readingTask') }
                ].map((link) => (
                  <Link
                    key={link.to}
                    to={link.to}
                    className="relative group text-white/80 hover:text-white transition-colors font-bold tracking-wide text-sm"
                  >
                    {link.label}
                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-400 to-purple-500 transition-all duration-300 group-hover:w-full"></span>
                  </Link>
                ))}
              </div>

              <div className="flex items-center space-x-4">
                <LanguageSwitcher />

                <Link to="/guest" className="group relative flex items-center space-x-2 px-6 py-2.5 bg-white/5 hover:bg-white/10 border border-white/20 rounded-2xl text-white/90 hover:text-white transition-all duration-300 overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <svg className="w-4 h-4 transform group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  <span className="font-bold text-xs uppercase tracking-widest relative z-10">Guest Hub</span>
                </Link>

                <Link to="/speech/age" className="relative group overflow-hidden px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl text-white font-black text-xs uppercase tracking-[0.15em] shadow-lg hover:shadow-blue-500/40 hover:scale-105 transition-all duration-300">
                  <div className="absolute inset-0 bg-white/20 -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out"></div>
                  <span className="relative z-10">{t('speech.getStarted')}</span>
                </Link>
              </div>
            </div>

            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className={`md:hidden p-3 rounded-2xl transition-all duration-300 ${isMobileMenuOpen ? 'bg-red-500/20 text-red-100 rotate-90' : 'bg-white/5 text-white'
                } border border-white/10 hover:bg-white/10`}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isMobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>

          {/* Mobile Menu */}
          {isMobileMenuOpen && (
            <div className="md:hidden absolute top-24 left-4 right-4 animate-fade-in-up">
              <div className="bg-[#0E1B4D]/40 backdrop-blur-3xl border border-white/20 rounded-[2.5rem] p-8 shadow-[0_15px_50px_rgba(0,0,0,0.5)] overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-transparent to-purple-500/10 pointer-events-none"></div>

                <div className="flex flex-col space-y-6 relative z-10">
                  {[
                    { to: '/speech/features', label: t('speech.features'), icon: '✨' },
                    { to: '/speech/analyze', label: t('speech.analyze'), icon: '📊' },
                    { to: '/speech/age', label: t('speech.readingTask'), icon: '📖' }
                  ].map((link, idx) => (
                    <Link
                      key={link.to}
                      to={link.to}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center space-x-4 p-4 hover:bg-white/10 rounded-2xl text-xl font-black text-white transition-all transform hover:translate-x-2 shadow-inner border border-transparent hover:border-white/10"
                      style={{ animationDelay: `${idx * 100}ms` }}
                    >
                      <span className="text-2xl">{link.icon}</span>
                      <span>{link.label}</span>
                    </Link>
                  ))}

                  <div className="pt-6 mt-2 border-t border-white/10 space-y-4">
                    <div className="flex justify-center p-4 bg-white/5 rounded-2xl border border-white/5">
                      <LanguageSwitcher />
                    </div>

                    <Link
                      to="/guest"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center justify-center space-x-3 p-5 bg-white/10 hover:bg-white/20 border border-white/20 rounded-3xl text-white font-bold transition-all active:scale-95 group"
                    >
                      <svg className="w-6 h-6 transform group-hover:-translate-x-2 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                      </svg>
                      <span className="text-lg uppercase tracking-wider">Guest Hub</span>
                    </Link>

                    <Link
                      to="/speech/age"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="w-full flex items-center justify-center p-6 bg-gradient-to-r from-blue-600 to-purple-600 rounded-[2rem] text-white font-black text-xl uppercase tracking-widest shadow-xl active:scale-95"
                    >
                      {t('speech.getStarted')}
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navigation;