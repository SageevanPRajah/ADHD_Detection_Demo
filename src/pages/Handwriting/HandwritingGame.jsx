import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { activitySets } from "./data/activitySets";
import { useHandwritingCanvas } from "./hooks/useHandwritingCanvas";
import { predictFromJSON, analyzeHandwritingSession } from "../../handwriting util/api.js";

import LandingPage from "./components/LandingPage";
import ResultScreen from "./components/ResultScreen";
import GameScreen from "./components/GameScreen";

/* ===================== ROOT PAGE ===================== */

export default function HandwritingGame() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const gradeMeta = [
    { key: "kindergarten", label: t("hw.kindergarten"), hint: t("hw.hintLetters"),    ring: "ring-pink-400/30",    bg: "from-pink-500/20 to-rose-500/10"    },
    { key: "grade1",       label: t("hw.grade1"),       hint: t("hw.hintEasyWords"),  ring: "ring-sky-400/30",     bg: "from-sky-500/20 to-blue-500/10"     },
    { key: "grade2",       label: t("hw.grade2"),       hint: t("hw.hintCommonWords"),ring: "ring-emerald-400/30", bg: "from-emerald-500/20 to-teal-500/10" },
    { key: "grade3",       label: t("hw.grade3"),       hint: t("hw.hintLongWords"),  ring: "ring-amber-400/30",   bg: "from-amber-500/20 to-orange-500/10" },
    { key: "grade4",       label: t("hw.grade4"),       hint: t("hw.hintHardWords"),  ring: "ring-violet-400/30",  bg: "from-violet-500/20 to-purple-500/10"},
    { key: "grade5",       label: t("hw.grade5"),       hint: t("hw.hintPhrases"),    ring: "ring-fuchsia-400/30", bg: "from-fuchsia-500/20 to-pink-500/10" }
  ];

  /* ===================== GAME STATE ===================== */

  const [gameStarted,      setGameStarted]      = useState(false);
  const [selectedGrade,    setSelectedGrade]    = useState(null);
  const [currentIndex,     setCurrentIndex]     = useState(0);
  const [score,            setScore]            = useState(0);
  const [totalAttempts,    setTotalAttempts]    = useState(0);
  const [showGuide,        setShowGuide]        = useState(true);
  const [penSize,          setPenSize]          = useState(8);
  const [breakLeft,        setBreakLeft]        = useState(0);
  const [showResultScreen, setShowResultScreen] = useState(false);
  const [isPredicting,     setIsPredicting]     = useState(false);
  const [currentPrediction,setCurrentPrediction]= useState(null);

  /* ===================== JSON UPLOAD + PREDICTION STATE ===================== */

  const [uploadedJSON,    setUploadedJSON]    = useState(null);
  const [predictionResult,setPredictionResult]= useState(null);
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [analysisAge,     setAnalysisAge]     = useState(6);
  const [analysisGender,  setAnalysisGender]  = useState("male");

  /* ===================== DERIVED ===================== */

  const activities = useMemo(
    () => (selectedGrade ? activitySets[selectedGrade] || [] : []),
    [selectedGrade]
  );

  const currentActivity = activities[currentIndex];
  const progressPct = activities.length
    ? Math.round(((currentIndex + 1) / activities.length) * 100)
    : 0;

  /* ===================== BREAK TIMER ===================== */

  useEffect(() => {
    if (breakLeft <= 0) return;
    const timer = setInterval(() => setBreakLeft((b) => Math.max(0, b - 1)), 1000);
    return () => clearInterval(timer);
  }, [breakLeft]);

  /* ===================== CANVAS HOOK ===================== */

  const {
    canvasRef,
    strokeDataRef,
    hasDrawn,
    setHasDrawn,
    clearCanvas,
    startDrawing,
    draw,
    stopDrawing
  } = useHandwritingCanvas({
    gameStarted,
    showResultScreen,
    currentIndex,
    penSize,
    breakLeft,
    currentActivity
  });

  /* ===================== GAME HANDLERS ===================== */

  const startGame = (gradeKey) => {
    setSelectedGrade(gradeKey);
    setCurrentIndex(0);
    setScore(0);
    setTotalAttempts(0);
    setGameStarted(true);
    setShowGuide(true);
    setBreakLeft(0);
    setHasDrawn(false);
    setTimeout(() => clearCanvas(true), 50);
  };

  const handleWrong = () => {
    strokeDataRef.current = [];
    setTotalAttempts((t) => t + 1);
    if (currentIndex < activities.length - 1) setCurrentIndex((i) => i + 1);
  };

  const goHome = () => {
    setGameStarted(false);
    setSelectedGrade(null);
    setCurrentIndex(0);
    setScore(0);
    setTotalAttempts(0);
    clearCanvas();
  };

  const handleCorrect = async () => {
    const sessionJSON = {
      grade:       selectedGrade,
      activity:    currentActivity.content,
      instruction: currentActivity.instruction,
      penSize,
      timestamp:   new Date().toISOString(),
      strokes:     strokeDataRef.current
    };

    strokeDataRef.current = [];
    setHasDrawn(false);

    setIsPredicting(true);
    setShowResultScreen(true);

    try {
      const data = await analyzeHandwritingSession(sessionJSON);
      setCurrentPrediction(data);
    } catch (err) {
      setCurrentPrediction({ error: true, message: err.message });
    } finally {
      setIsPredicting(false);
    }
  };

  const handleBackToGame = () => {
    setShowResultScreen(false);
    setCurrentPrediction(null);
    clearCanvas(true);

    setScore((s) => s + 1);
    setTotalAttempts((t) => t + 1);

    if (currentIndex < activities.length - 1) {
      setCurrentIndex((i) => i + 1);
    } else {
      alert(t("hw.finishedAll", { count: activities.length }));
      goHome();
    }
  };

  /* ===================== JSON UPLOAD HANDLERS ===================== */

  const transformToBackendFormat = (data) => {
    if (data && data.performanceMetrics && data.drawingData) {
      return data;
    }

    if (!data || !data.strokes || data.strokes.length === 0) {
      throw new Error("Invalid JSON format: missing strokes data");
    }

    const strokes = data.strokes;

    const strokeGroups = [];
    let currentStroke = null;

    for (let i = 0; i < strokes.length; i++) {
      const point = strokes[i];

      if (point.type === "start") {
        if (currentStroke && currentStroke.keyPoints.length > 1) {
          strokeGroups.push(currentStroke);
        }
        currentStroke = {
          keyPoints: [{ x: point.x, y: point.y, timestamp: point.timestamp }],
          startTime: point.timestamp
        };
      } else if (point.type === "move" && currentStroke) {
        currentStroke.keyPoints.push({ x: point.x, y: point.y, timestamp: point.timestamp });
      }
    }

    if (currentStroke && currentStroke.keyPoints.length > 1) {
      strokeGroups.push(currentStroke);
    }

    const drawingData = strokeGroups.map(stroke => {
      const keyPoints = stroke.keyPoints;
      const duration = (keyPoints[keyPoints.length - 1].timestamp - keyPoints[0].timestamp) / 1000;

      let totalLength = 0;
      for (let i = 1; i < keyPoints.length; i++) {
        const dx = keyPoints[i].x - keyPoints[i - 1].x;
        const dy = keyPoints[i].y - keyPoints[i - 1].y;
        totalLength += Math.sqrt(dx * dx + dy * dy);
      }

      const avgPressure = data.penSize || 8;

      return {
        strokeLength:    totalLength,
        duration:        duration || 0.001,
        averagePressure: avgPressure,
        keyPoints:       keyPoints
      };
    });

    const totalStrokes    = drawingData.length;
    const dataPoints      = strokes.length;
    const firstTimestamp  = strokes[0]?.timestamp || 0;
    const lastTimestamp   = strokes[strokes.length - 1]?.timestamp || firstTimestamp;
    const activityDuration = Math.max(0.1, (lastTimestamp - firstTimestamp) / 1000);

    const avgStrokeLength = drawingData.length > 0
      ? drawingData.reduce((sum, s) => sum + s.strokeLength, 0) / drawingData.length
      : 0;

    const completionSpeed = avgStrokeLength / activityDuration;

    let pauseCount = 0;
    for (let i = 0; i < strokeGroups.length - 1; i++) {
      const gap = (strokeGroups[i + 1].startTime - strokeGroups[i].keyPoints[strokeGroups[i].keyPoints.length - 1].timestamp) / 1000;
      if (gap > 0.2) pauseCount++;
    }

    const pressures = drawingData.map(s => s.averagePressure);
    const pressureVariation = pressures.length > 0
      ? Math.max(...pressures) - Math.min(...pressures)
      : 0;

    const performanceMetrics = {
      totalStrokes,
      dataPoints,
      activityDuration,
      averageStrokeLength: avgStrokeLength,
      completionSpeed,
      pauseCount,
      pressureVariation
    };

    return { performanceMetrics, drawingData };
  };

  const handleJSONUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(reader.result);
        setUploadedJSON(parsed);
        setPredictionResult(null);
      } catch (err) {
        alert("Invalid JSON file: " + err.message);
      }
    };
    reader.readAsText(file);
  };

  const analyzeUploadedJSON = async () => {
    if (!uploadedJSON) return;

    setAnalysisLoading(true);
    setPredictionResult(null);

    try {
      const transformedData = transformToBackendFormat(uploadedJSON);
      const result = await predictFromJSON(transformedData, analysisAge, analysisGender);
      setPredictionResult(result);
    } catch (error) {
      console.error("Analysis error:", error);

      let errorMessage = "Error analyzing file: ";
      try {
        if (error.message) {
          const errorText = error.message;
          try {
            const errorJson = JSON.parse(errorText);
            errorMessage += errorJson.error || errorText;
          } catch {
            errorMessage += errorText;
          }
        } else {
          errorMessage += "Unknown error occurred";
        }
      } catch (e) {
        errorMessage += error.message || "Could not connect to backend. Please ensure the backend server is running.";
      }

      setPredictionResult({ error: true, message: errorMessage });
    } finally {
      setAnalysisLoading(false);
    }
  };

  /* ===================== RENDER ===================== */

  if (!gameStarted) {
    return (
      <LandingPage
        gradeMeta={gradeMeta}
        navigate={navigate}
        startGame={startGame}
        t={t}
      />
    );
  }

  if (showResultScreen) {
    return (
      <ResultScreen
        isPredicting={isPredicting}
        currentPrediction={currentPrediction}
        handleBackToGame={handleBackToGame}
        t={t}
      />
    );
  }

  return (
    <GameScreen
      // game state
      selectedGrade={selectedGrade}
      currentIndex={currentIndex}
      activities={activities}
      currentActivity={currentActivity}
      score={score}
      totalAttempts={totalAttempts}
      progressPct={progressPct}
      showGuide={showGuide}
      setShowGuide={setShowGuide}
      breakLeft={breakLeft}
      setBreakLeft={setBreakLeft}
      penSize={penSize}
      setPenSize={setPenSize}
      goHome={goHome}
      // canvas hook
      canvasRef={canvasRef}
      startDrawing={startDrawing}
      draw={draw}
      stopDrawing={stopDrawing}
      hasDrawn={hasDrawn}
      clearCanvas={clearCanvas}
      handleWrong={handleWrong}
      handleCorrect={handleCorrect}
      // JSON analysis
      uploadedJSON={uploadedJSON}
      predictionResult={predictionResult}
      analysisLoading={analysisLoading}
      analysisAge={analysisAge}
      analysisGender={analysisGender}
      setAnalysisAge={setAnalysisAge}
      setAnalysisGender={setAnalysisGender}
      handleJSONUpload={handleJSONUpload}
      analyzeUploadedJSON={analyzeUploadedJSON}
      // i18n
      t={t}
    />
  );
}
