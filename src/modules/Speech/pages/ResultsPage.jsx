import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Navigation from '../components/Navigation';
import AnalysisResults from '../components/AnalysisResults';
import Footer from '../components/Footer';

const ResultsPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
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

          if (!isAnalyzing) {
            navigate('/speech/analyze');
          }
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

    return () => {
      if (pollInterval) {
        clearInterval(pollInterval);
      }
    };

  }, [location.state, navigate]);

  const handleReset = () => {
    sessionStorage.removeItem('analysisResult');
    navigate('/speech/analyze');
  };

  if (isLoading || !analysisResult) {
    return (
      <div className="speech-module min-h-screen text-white">
        <Navigation />

        <section className="min-h-[calc(100vh-5rem)] flex items-center justify-center">

          <div className="container-custom">
            <div className="text-center">

              <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 backdrop-blur-md rounded-full mb-8 border border-white/30">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-t-2 border-white/50 border-b-white"></div>
              </div>

              <h3 className="text-2xl font-bold mb-4 text-white">
                Analyzing Speech Patterns
              </h3>

              <p className="text-white/80 mb-8">
                This may take a few moments...
              </p>

              <div className="flex justify-center space-x-2">
                <div className="w-3 h-3 bg-white/80 rounded-full animate-bounce"></div>
                <div className="w-3 h-3 bg-white/80 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-3 h-3 bg-white/80 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
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

          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
              Analysis Complete
            </h2>

            <p className="text-xl text-white/80">
              Here are the detailed results of your speech analysis
            </p>
          </div>

          <AnalysisResults
            result={analysisResult}
            onReset={handleReset}
          />

        </div>

      </section>

      <Footer />

    </div>
  );
};

export default ResultsPage;