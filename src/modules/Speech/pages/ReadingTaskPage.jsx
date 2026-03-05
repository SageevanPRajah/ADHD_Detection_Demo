import React from 'react';
import Navigation from '../components/Navigation';
import ReadingTask from '../components/ReadingTask';
import Footer from '../components/Footer';

const ReadingTaskPage = () => {
  return (
    <div className="speech-module min-h-screen">
      <Navigation />
      <ReadingTask />
      <Footer />
    </div>
  );
};

export default ReadingTaskPage;