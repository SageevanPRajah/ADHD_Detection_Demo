import React from 'react';
import Navigation from '../components/Navigation';
import ReadingTask from '../components/ReadingTask';

const ReadingTaskPage = () => {
  return (
    <div className="speech-module min-h-screen">
      <Navigation />
      <ReadingTask />
    </div>
  );
};

export default ReadingTaskPage;