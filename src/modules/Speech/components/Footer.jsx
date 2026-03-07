import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const Footer = () => {
  const { t } = useTranslation();

  return (
    <footer className="bg-[#0a1235] border-t border-white/10">
      <div className="container-custom py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="md:col-span-2">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">{t('speech.footerTitle')}</h3>
                <p className="text-xs text-white/60">{t('speech.footerSub')}</p>
              </div>
            </div>
            <p className="text-white/70 leading-relaxed max-w-md">{t('speech.footerDesc')}</p>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">{t('speech.quickLinks')}</h4>
            <ul className="space-y-3">
              <li><Link to="/speech/features" className="text-white/70 hover:text-white transition-colors">{t('speech.features')}</Link></li>
              <li><Link to="/speech/analyze" className="text-white/70 hover:text-white transition-colors">{t('speech.analyze')}</Link></li>
              <li><a href="#" className="text-white/70 hover:text-white transition-colors">{t('speech.howItWorks')}</a></li>
              <li><a href="#" className="text-white/70 hover:text-white transition-colors">{t('speech.research')}</a></li>
              <li><a href="#" className="text-white/70 hover:text-white transition-colors">{t('speech.contactLink')}</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">{t('speech.resources')}</h4>
            <ul className="space-y-3">
              <li><a href="#" className="text-white/70 hover:text-white transition-colors">{t('speech.documentation')}</a></li>
              <li><a href="#" className="text-white/70 hover:text-white transition-colors">{t('speech.apiReference')}</a></li>
              <li><a href="#" className="text-white/70 hover:text-white transition-colors">{t('speech.privacyPolicy')}</a></li>
              <li><a href="#" className="text-white/70 hover:text-white transition-colors">{t('speech.termsOfService')}</a></li>
            </ul>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="container-custom py-6">
          <div className="flex flex-col md:flex-row items-center justify-between text-white/50 text-sm">
            <p>{t('speech.copyright')}</p>
            <p className="mt-2 md:mt-0">
              {t('speech.builtWith')} · {t('speech.poweredBy')} FastAPI & React
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;