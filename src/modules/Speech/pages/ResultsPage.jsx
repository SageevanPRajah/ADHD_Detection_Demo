import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Navigation from '../components/Navigation';
import AnalysisResults from '../components/AnalysisResults';

const ResultsPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const [analysisResult, setAnalysisResult] = useState(null);

  const [isLoading, setIsLoading] = useState(() => {
    return sessionStorage.getItem('isAnalyzing') === 'true';
  });

  useEffect(() => {
    const isAnalyzing = sessionStorage.getItem('isAnalyzing') === 'true';
    setIsLoading(isAnalyzing);

    if (location.state?.result) {
      setAnalysisResult(location.state.result);
      sessionStorage.removeItem('isAnalyzing');
      setIsLoading(false);
    } else {
      const storedResult = sessionStorage.getItem('analysisResult');
      if (storedResult) {
        try {
          setAnalysisResult(JSON.parse(storedResult));
          sessionStorage.removeItem('isAnalyzing');
          setIsLoading(false);
        } catch (e) {
          console.error('Error parsing stored result:', e);
          if (!isAnalyzing) navigate('/speech/analyze');
        }
      } else if (!isAnalyzing) {
        navigate('/speech/analyze');
      }
    }

    let pollInterval;
    if (isAnalyzing) {
      pollInterval = setInterval(() => {
        const result = sessionStorage.getItem('analysisResult');
        const stillAnalyzing = sessionStorage.getItem('isAnalyzing') === 'true';
        if (result) {
          try {
            setAnalysisResult(JSON.parse(result));
            sessionStorage.removeItem('isAnalyzing');
            setIsLoading(false);
            clearInterval(pollInterval);
          } catch (e) {
            console.error('Error parsing stored result:', e);
          }
        } else if (!stillAnalyzing) {
          setIsLoading(false);
          clearInterval(pollInterval);
        }
      }, 300);
    }

    return () => { if (pollInterval) clearInterval(pollInterval); };
  }, [location.state, navigate]);

  const handleReset = () => {
    sessionStorage.removeItem('analysisResult');
    navigate('/speech/analyze');
  };

  if (isLoading || !analysisResult) {
    return (
      <div className="speech-module min-h-screen text-white">
        <Navigation />
        <section className="min-h-[calc(100vh-5rem)] flex items-center justify-center relative overflow-hidden">
          {/* Decorative background elements */}
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-[100px] animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '1s' }}></div>

          <div className="container-custom relative z-10">
            <div className="text-center max-w-md mx-auto">
              <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-12 rounded-3xl shadow-[0_8px_32px_0_rgba(31,38,135,0.37)] transform transition-all">
                <div className="relative inline-flex items-center justify-center w-24 h-24 mb-8">
                  {/* Glowing rings */}
                  <div className="absolute inset-0 border-4 border-transparent border-t-blue-400 border-b-purple-400 rounded-full animate-spin"></div>
                  <div className="absolute inset-2 border-4 border-transparent border-l-purple-400 border-r-blue-400 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
                  <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/20 to-purple-500/20 rounded-full blur-md"></div>
                  <span className="text-3xl relative z-10 animate-pulse">✨</span>
                </div>

                <h3 className="text-3xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-300 to-purple-300">
                  {t('speech.analyzingPatterns')}
                </h3>
                <p className="text-white/80 mb-8 text-lg font-medium tracking-wide">
                  {t('speech.analyzingWait')}
                </p>

                <div className="flex justify-center flex-col items-center gap-4">
                  <div className="flex space-x-3">
                    <div className="w-3 h-3 bg-blue-400 rounded-full animate-bounce shadow-[0_0_10px_rgba(96,165,250,0.8)]"></div>
                    <div className="w-3 h-3 bg-purple-400 rounded-full animate-bounce shadow-[0_0_10px_rgba(192,132,252,0.8)]" style={{ animationDelay: '0.15s' }}></div>
                    <div className="w-3 h-3 bg-blue-400 rounded-full animate-bounce shadow-[0_0_10px_rgba(96,165,250,0.8)]" style={{ animationDelay: '0.3s' }}></div>
                  </div>
                  <div className="w-48 h-1 bg-white/10 rounded-full overflow-hidden mt-2">
                    <div className="h-full bg-gradient-to-r from-blue-400 to-purple-400 w-1/2 animate-[slideToRight_2s_ease-in-out_infinite_alternate] rounded-full"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="speech-module min-h-screen">
      <Navigation />
      <section id="results" className="section-padding">
        <div className="container-custom">
          <div className="text-center mb-16 relative">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-blue-500/20 rounded-full blur-[80px] -z-10"></div>
            <h2 className="text-5xl lg:text-6xl font-black mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-300 via-purple-300 to-pink-300 tracking-tight drop-shadow-sm">
              {t('speech.analysisComplete')}
            </h2>
            <p className="text-xl text-white/80 max-w-2xl mx-auto font-medium">{t('speech.analysisCompleteDesc')}</p>
          </div>
          <AnalysisResults result={analysisResult} onReset={handleReset} />
        </div>
      </section>
    </div>
  );
};

export default ResultsPage;