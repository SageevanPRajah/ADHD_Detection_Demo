import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Navigation from '../components/Navigation';
import FileUpload from '../components/FileUpload';
import Footer from '../components/Footer';

const AnalyzePage = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const fileUploadRef = useRef(null);
  const [error, setError] = useState(null);

  const handleAnalysisComplete = (result) => {
    sessionStorage.setItem('analysisResult', JSON.stringify(result));
    sessionStorage.removeItem('isAnalyzing');
    navigate('/speech/results', { state: { result } });
  };

  const handleError = (errorMessage) => {
    setError(errorMessage);
    sessionStorage.removeItem('isAnalyzing');
    navigate('/speech/analyze');
  };

  const handleLoading = (loading) => {
    if (loading) {
      sessionStorage.setItem('isAnalyzing', 'true');
      navigate('/speech/results');
    }
  };

  return (
    <div className="speech-module min-h-screen">
      <Navigation />

      <section id="upload" className="section-padding">
        <div className="container-custom">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">{t('speech.analyzeSpeech')}</h2>
            <p className="text-xl text-white/80 max-w-2xl mx-auto">{t('speech.analyzeSpeechDesc')}</p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="bg-white/10 backdrop-blur-md rounded-3xl shadow-large p-8 lg:p-12 card-hover border border-white/20">
              <FileUpload
                ref={fileUploadRef}
                onAnalysisComplete={handleAnalysisComplete}
                onError={handleError}
                onLoading={handleLoading}
              />
            </div>
          </div>
        </div>
      </section>

      {error && (
        <section className="section-padding">
          <div className="container-custom">
            <div className="max-w-2xl mx-auto text-center">
              <div className="bg-red-500/20 backdrop-blur-md rounded-2xl p-8 shadow-medium border border-red-400/30">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-red-500/30 rounded-full mb-6">
                  <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-white mb-4">{t('speech.analysisError')}</h3>
                <p className="text-white/90 mb-6">{error}</p>
                <button onClick={() => setError(null)} className="btn-secondary bg-white/20 hover:bg-white/30 border-white/30 text-white hover:text-white">
                  {t('speech.tryAgain')}
                </button>
              </div>
            </div>
          </div>
        </section>
      )}

      <Footer />
    </div>
  );
};

export default AnalyzePage;