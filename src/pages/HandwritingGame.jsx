import React, { useState, useRef, useEffect } from 'react';
import {Home,CheckCircle,XCircle,Eraser,ArrowRight,PenTool,Info,Star} from 'lucide-react';

const activitySets = {
  kindergarten: [
    { content: "අ", instruction: "Write the letter: A" },
    { content: "ක", instruction: "Write the letter: Ka" },
    { content: "ග", instruction: "Write the letter: Ga" },
    { content: "ච", instruction: "Write the letter: Cha" },
    { content: "ප", instruction: "Write the letter: Pa" },
    { content: "බ", instruction: "Write the letter: Ba" },
    { content: "ම", instruction: "Write the letter: Ma" },
    { content: "ය", instruction: "Write the letter: Ya" }
  ],
  grade1: [
    { content: "අම්මා", instruction: "Write the word: Mother" },
    { content: "තාත්තා", instruction: "Write the word: Father" },
    { content: "මල", instruction: "Write the word: Flower" },
    { content: "ගස", instruction: "Write the word: Tree" },
    { content: "පොත", instruction: "Write the word: Book" },
    { content: "බල්ලා", instruction: "Write the word: Dog" }
  ],
  grade2: [
    { content: "පාසල", instruction: "Write the word: School" },
    { content: "ඉස්කෝලය", instruction: "Write the word: School" },
    { content: "ගුරුවරයා", instruction: "Write the word: Teacher" },
    { content: "මිතුරා", instruction: "Write the word: Friend" },
    { content: "කෑම", instruction: "Write the word: Food" },
    { content: "වතුර", instruction: "Write the word: Water" }
  ],
  grade3: [
    { content: "ආදරණීය", instruction: "Write the word: Lovely" },
    { content: "විශ්වාසය", instruction: "Write the word: Trust" },
    { content: "උදව්කරන", instruction: "Write the word: Helpful" },
    { content: "අධ්‍යාපනය", instruction: "Write the word: Education" },
    { content: "සතුටින්", instruction: "Write the word: Happily" }
  ],
  grade4: [
    { content: "ප්‍රජාතන්ත්‍රවාදය", instruction: "Write the word: Democracy" },
    { content: "විද්‍යාගාරය", instruction: "Write the word: Laboratory" },
    { content: "සංවර්ධනය", instruction: "Write the word: Development" },
    { content: "පරිසරය", instruction: "Write the word: Environment" }
  ],
  grade5: [
    { content: "තාක්ෂණික දියුණුව", instruction: "Write the phrase: Technological advancement" },
    { content: "විශ්ව විද්‍යාලය", instruction: "Write the phrase: University" },
    { content: "ජාත්‍යන්තර සබඳතා", instruction: "Write the phrase: International relations" },
    { content: "ප්‍රජාතන්ත්‍රවාදී රජය", instruction: "Write the phrase: Democratic government" }
  ]
};

const HandwritingGame = () => {
  const [gameStarted, setGameStarted] = useState(false);
  const [selectedGrade, setSelectedGrade] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [totalAttempts, setTotalAttempts] = useState(0);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);

  const canvasRef = useRef(null);
  const ctxRef = useRef(null);

  useEffect(() => {
    if (gameStarted && canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      ctx.lineWidth = 3;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.strokeStyle = '#1e88e5';
      ctxRef.current = ctx;
    }
  }, [gameStarted]);

  const startGame = (grade) => {
    setSelectedGrade(grade);
    setGameStarted(true);
    setCurrentIndex(0);
    setScore(0);
    setTotalAttempts(0);
  };

  const goHome = () => {
    setGameStarted(false);
    setSelectedGrade(null);
    setCurrentIndex(0);
    setScore(0);
    setTotalAttempts(0);
  };

  const clearCanvas = () => {
    ctxRef.current.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    setHasDrawn(false);
  };

  const handleCorrect = () => {
    setScore(score + 1);
    setTotalAttempts(totalAttempts + 1);

    const activities = activitySets[selectedGrade];
    if (currentIndex < activities.length - 1) {
      setCurrentIndex(currentIndex + 1);
      clearCanvas();
    } else {
      alert(`You completed all ${activities.length} activities.\nScore: ${score + 1}/${totalAttempts + 1}`);
      goHome();
    }
  };

  const handleWrong = () => {
    setTotalAttempts(totalAttempts + 1);
    clearCanvas();
  };

  const getEventPos = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const scaleX = canvasRef.current.width / rect.width;
    const scaleY = canvasRef.current.height / rect.height;

    const point = e.touches ? e.touches[0] : e;
    return {
      x: (point.clientX - rect.left) * scaleX,
      y: (point.clientY - rect.top) * scaleY
    };
  };

  const startDrawing = (e) => {
    e.preventDefault();
    setIsDrawing(true);
    setHasDrawn(true);
    const pos = getEventPos(e);
    ctxRef.current.beginPath();
    ctxRef.current.moveTo(pos.x, pos.y);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    e.preventDefault();
    const pos = getEventPos(e);
    ctxRef.current.lineTo(pos.x, pos.y);
    ctxRef.current.stroke();
  };

  const stopDrawing = () => setIsDrawing(false);

  if (!gameStarted) {
    return (
      <div className="min-h-screen bg-slate-900 p-6">
        <div className="mx-auto max-w-4xl rounded-3xl bg-slate-800 p-8">
          <h1 className="mb-6 flex items-center justify-center gap-2 text-3xl font-bold text-indigo-300">
            <PenTool /> Handwriting Game
          </h1>

          <div className="mb-8 rounded-xl bg-slate-700 p-6">
            <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold text-indigo-200">
              <Info /> Instructions for Parents
            </h2>
            <ul className="space-y-2 text-slate-300">
                <li className="flex items-start gap-2">
                  <span className="mt-1 text-indigo-400">•</span>
                  <span>Select your child's grade level below to start age-appropriate activities</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1 text-indigo-400">•</span>
                  <span>Your child will see a word/letter to write on the screen</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1 text-indigo-400">•</span>
                  <span>Let them write it on the canvas using their finger or mouse</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1 text-indigo-400">•</span>
                  <span>Click "Correct ✓" if they wrote it well, or "Try Again ✗" to practice more</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1 text-indigo-400">•</span>
                  <span>You can end the game anytime using the "End Game" button</span>
                </li>
              </ul>

          </div>

          <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
            {Object.keys(activitySets).map((grade) => (
              <button
                key={grade}
                onClick={() => startGame(grade)}
                className="rounded-xl bg-indigo-600 p-4 text-white hover:bg-indigo-700"
              >
                <Star className="mx-auto mb-2" />
                {grade.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const currentActivity = activitySets[selectedGrade][currentIndex];

  return (
    <div className="min-h-screen bg-slate-900 p-6">
      <div className="mx-auto max-w-5xl rounded-3xl bg-slate-800 p-8">
        <div className="mb-4 flex justify-between">
          <div>
            Activity {currentIndex + 1} | Score {score}/{totalAttempts}
          </div>
          <button onClick={goHome} className="flex items-center gap-2 text-red-400">
            <Home /> End
          </button>
        </div>

        <div className="mb-4 text-center text-4xl text-white">
          {currentActivity.content}
        </div>

        <canvas
          ref={canvasRef}
          width={800}
          height={400}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
          className="mx-auto block rounded-xl bg-white"
        />

        <div className="mt-6 flex justify-center gap-4">
          <button onClick={clearCanvas} className="flex items-center gap-2 bg-slate-600 px-4 py-2 text-white">
            <Eraser /> Clear
          </button>
          <button onClick={handleWrong} className="flex items-center gap-2 bg-red-600 px-4 py-2 text-white">
            <XCircle /> Try Again
          </button>
          <button onClick={handleCorrect} className="flex items-center gap-2 bg-green-600 px-4 py-2 text-white">
            <CheckCircle /> Correct <ArrowRight />
          </button>
        </div>
      </div>
    </div>
  );
};

export default HandwritingGame;
