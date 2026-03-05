import React from 'react';
import Navigation from '../components/Navigation';
import Hero from '../components/Hero';
import Footer from '../components/Footer';

const HomePage = () => {
  return (
    <div className="speech-module min-h-screen">
      <Navigation />
      <Hero />
      <Footer />
    </div>
  );
};

export default HomePage;