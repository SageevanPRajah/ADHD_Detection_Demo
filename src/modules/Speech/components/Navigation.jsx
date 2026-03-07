import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

const Navigation = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled ? 'bg-[#0E1B4D]/90 backdrop-blur-md shadow-soft' : 'bg-transparent'
    }`}>
      <div className="container-custom">
        <div className="flex items-center justify-between h-20">

          {/* Logo */}
          <Link to="/speech" className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-black rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">ADHD Speech</h1>
              <p className="text-xs text-white/70 -mt-1">Detection</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/speech/features" className="text-white/90 hover:text-white transition-colors font-medium">
              Features
            </Link>

            <Link to="/speech/analyze" className="text-white/90 hover:text-white transition-colors font-medium">
              Analyze
            </Link>

            <Link to="/speech/age" className="text-white/90 hover:text-white transition-colors font-medium">
              Reading Task
            </Link>

            <Link to="/speech/age" className="btn-primary text-sm">
              Get Started
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-white/10 transition-colors text-white"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isMobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16"/>
              )}
            </svg>
          </button>

        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-[#0E1B4D]/95 backdrop-blur-md border-t border-white/20 py-4 animate-fade-in-up">
            <div className="flex flex-col space-y-4">

              <Link
                to="/speech/features"
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-left px-4 py-2 text-white/90 hover:text-white hover:bg-white/10 rounded-lg"
              >
                Features
              </Link>

              <Link
                to="/speech/analyze"
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-left px-4 py-2 text-white/90 hover:text-white hover:bg-white/10 rounded-lg"
              >
                Analyze
              </Link>

              <Link
                to="/speech/age"
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-left px-4 py-2 text-white/90 hover:text-white hover:bg-white/10 rounded-lg"
              >
                Reading Task
              </Link>

              <div className="px-4 pt-4 border-t border-white/20">
                <Link
                  to="/speech/age"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="btn-primary w-full block text-center"
                >
                  Get Started
                </Link>
              </div>

            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;