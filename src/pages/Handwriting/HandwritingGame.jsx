import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Home,
  CheckCircle,
  XCircle,
  Eraser,
  ArrowRight,
  PenTool,
  Info,
  Star,
  Sparkles,
  PauseCircle,
  Eye
} from "lucide-react";
import { predictFromJSON } from "../../handwriting util/api.js";

/* ===================== DATA ===================== */

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

const gradeMeta = [
  { key: "kindergarten", label: "Kindergarten", hint: "Letters", ring: "ring-pink-400/30", bg: "from-pink-500/20 to-rose-500/10" },
  { key: "grade1", label: "Grade 1", hint: "Easy words", ring: "ring-sky-400/30", bg: "from-sky-500/20 to-blue-500/10" },
  { key: "grade2", label: "Grade 2", hint: "Common words", ring: "ring-emerald-400/30", bg: "from-emerald-500/20 to-teal-500/10" },
  { key: "grade3", label: "Grade 3", hint: "Long words", ring: "ring-amber-400/30", bg: "from-amber-500/20 to-orange-500/10" },
  { key: "grade4", label: "Grade 4", hint: "Hard words", ring: "ring-violet-400/30", bg: "from-violet-500/20 to-purple-500/10" },
  { key: "grade5", label: "Grade 5+", hint: "Phrases", ring: "ring-fuchsia-400/30", bg: "from-fuchsia-500/20 to-pink-500/10" }
];

function clamp(n, a, b) {
  return Math.max(a, Math.min(b, n));
}

/* ===================== COMPONENT ===================== */

export default function HandwritingGame() {
  const [gameStarted, setGameStarted] = useState(false);
  const [selectedGrade, setSelectedGrade] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [totalAttempts, setTotalAttempts] = useState(0);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);
  const [showGuide, setShowGuide] = useState(true);
  const [penSize, setPenSize] = useState(8);
  const [breakLeft, setBreakLeft] = useState(0);
  const [showResultScreen, setShowResultScreen] = useState(false);
  const [isPredicting, setIsPredicting] = useState(false);
  const [currentPrediction, setCurrentPrediction] = useState(null);

  const canvasRef = useRef(null);
  const ctxRef = useRef(null);
  const strokeDataRef = useRef([]); // ✅ NEW
  const pointerIdRef = useRef(null);

  const activities = useMemo(
    () => (selectedGrade ? activitySets[selectedGrade] || [] : []),
    [selectedGrade]
  );

  /* ===================== JSON UPLOAD + PREDICTION STATES ===================== */

  const [uploadedJSON, setUploadedJSON] = useState(null);
  const [predictionResult, setPredictionResult] = useState(null);
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [analysisAge, setAnalysisAge] = useState(6);
  const [analysisGender, setAnalysisGender] = useState("male");

  const currentActivity = activities[currentIndex];

  // minimal helpers and UI state derived values
  const progressPct = activities.length ? Math.round(((currentIndex + 1) / activities.length) * 100) : 0;

  /* ===================== JSON UPLOAD ===================== */

  // Transform frontend JSON format to backend expected format
  const transformToBackendFormat = (data) => {
    // If already in backend format, return as is
    if (data && data.performanceMetrics && data.drawingData) {
      return data;
    }

    // Otherwise, transform from frontend format
    if (!data || !data.strokes || data.strokes.length === 0) {
      throw new Error("Invalid JSON format: missing strokes data");
    }

    const strokes = data.strokes;

    // Group strokes by start/move sequences
    const strokeGroups = [];
    let currentStroke = null;

    for (let i = 0; i < strokes.length; i++) {
      const point = strokes[i];

      if (point.type === "start") {
        // Save previous stroke if exists
        if (currentStroke && currentStroke.keyPoints.length > 1) {
          strokeGroups.push(currentStroke);
        }
        // Start new stroke
        currentStroke = {
          keyPoints: [{ x: point.x, y: point.y, timestamp: point.timestamp }],
          startTime: point.timestamp
        };
      } else if (point.type === "move" && currentStroke) {
        currentStroke.keyPoints.push({ x: point.x, y: point.y, timestamp: point.timestamp });
      }
    }

    // Add last stroke if exists
    if (currentStroke && currentStroke.keyPoints.length > 1) {
      strokeGroups.push(currentStroke);
    }

    // Calculate metrics for each stroke
    const drawingData = strokeGroups.map(stroke => {
      const keyPoints = stroke.keyPoints;
      const duration = (keyPoints[keyPoints.length - 1].timestamp - keyPoints[0].timestamp) / 1000; // in seconds

      // Calculate stroke length
      let totalLength = 0;
      for (let i = 1; i < keyPoints.length; i++) {
        const dx = keyPoints[i].x - keyPoints[i - 1].x;
        const dy = keyPoints[i].y - keyPoints[i - 1].y;
        totalLength += Math.sqrt(dx * dx + dy * dy);
      }

      // Calculate average pressure (using penSize from data or default)
      const avgPressure = data.penSize || 8;

      return {
        strokeLength: totalLength,
        duration: duration || 0.001, // avoid division by zero
        averagePressure: avgPressure,
        keyPoints: keyPoints
      };
    });

    // Calculate overall performance metrics
    const totalStrokes = drawingData.length;
    const dataPoints = strokes.length;
    const firstTimestamp = strokes[0]?.timestamp || 0;
    const lastTimestamp = strokes[strokes.length - 1]?.timestamp || firstTimestamp;
    const activityDuration = Math.max(0.1, (lastTimestamp - firstTimestamp) / 1000); // in seconds, minimum 0.1s

    const avgStrokeLength = drawingData.length > 0
      ? drawingData.reduce((sum, s) => sum + s.strokeLength, 0) / drawingData.length
      : 0;

    const completionSpeed = avgStrokeLength / activityDuration;

    // Estimate pause count (gaps between strokes > 200ms)
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

    return {
      performanceMetrics,
      drawingData
    };
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
      // Transform frontend format to backend format
      const transformedData = transformToBackendFormat(uploadedJSON);

      // Use the API utility function
      const result = await predictFromJSON(transformedData, analysisAge, analysisGender);
      setPredictionResult(result);
    } catch (error) {
      console.error("Analysis error:", error);

      // Parse error message from backend if available
      let errorMessage = "Error analyzing file: ";
      try {
        if (error.message) {
          const errorText = error.message;
          // Try to parse JSON error if it's a JSON response
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

      // Set error in state for display
      setPredictionResult({
        error: true,
        message: errorMessage
      });
    } finally {
      setAnalysisLoading(false);
    }
  };

  const startGame = (gradeKey) => {
    setSelectedGrade(gradeKey);
    setCurrentIndex(0);
    setScore(0);
    setTotalAttempts(0);
    setGameStarted(true);
    setShowGuide(true);
    setBreakLeft(0);
    setHasDrawn(false);
    // clear and draw guide after rendering
    setTimeout(() => clearCanvas(true), 50);
  };

  const handleWrong = () => {
    // simple fallback: clear strokes and advance
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

  const drawGuide = () => {
    const canvas = canvasRef.current;
    const ctx = ctxRef.current;
    if (!canvas || !ctx || !currentActivity) return;
    try {
      ctx.save();
      ctx.globalAlpha = 0.06;
      ctx.fillStyle = '#000';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const fontSize = Math.max(48, Math.min(120, canvas.width / (6 * (window.devicePixelRatio || 1))));
      ctx.font = `bold ${fontSize}px sans-serif`;
      ctx.fillText(currentActivity.content, canvas.width / (2 * (window.devicePixelRatio || 1)), canvas.height / (2 * (window.devicePixelRatio || 1)));
      ctx.restore();
    } catch (e) {
      // ignore drawing guide errors
    }
  };

  // initialize canvas and context when game starts (canvas is rendered)
  useEffect(() => {
    if (!gameStarted) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resizeCanvas = () => {
      // ensure canvas uses full container width
      canvas.style.width = '100%';
      const displayWidth = canvas.offsetWidth || 600;
      const displayHeight = 300;
      const ratio = window.devicePixelRatio || 1;
      canvas.width = displayWidth * ratio;
      canvas.height = displayHeight * ratio;
      canvas.style.height = `${displayHeight}px`;
      const ctx = canvas.getContext('2d');
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0); // reset and scale
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = penSize;
      ctxRef.current = ctx;
      clearCanvas(true);
      drawGuide();
    };

    resizeCanvas();
    const ro = new ResizeObserver(resizeCanvas);
    ro.observe(canvas);
    window.addEventListener('orientationchange', resizeCanvas);
    return () => {
      ro.disconnect();
      window.removeEventListener('orientationchange', resizeCanvas);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameStarted]);

  // attach native listeners to ensure pointer/touch events are captured (passive:false)
  useEffect(() => {
    if (!gameStarted) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const onDown = (ev) => startDrawing(ev);
    const onMove = (ev) => draw(ev);
    const onUp = (ev) => stopDrawing(ev);

    canvas.addEventListener('pointerdown', onDown, { passive: false });
    canvas.addEventListener('pointermove', onMove, { passive: false });
    canvas.addEventListener('pointerup', onUp, { passive: false });
    canvas.addEventListener('pointercancel', onUp, { passive: false });
    canvas.addEventListener('pointerleave', onUp, { passive: false });

    // touch fallbacks
    canvas.addEventListener('touchstart', onDown, { passive: false });
    canvas.addEventListener('touchmove', onMove, { passive: false });
    canvas.addEventListener('touchend', onUp, { passive: false });

    return () => {
      canvas.removeEventListener('pointerdown', onDown);
      canvas.removeEventListener('pointermove', onMove);
      canvas.removeEventListener('pointerup', onUp);
      canvas.removeEventListener('pointercancel', onUp);
      canvas.removeEventListener('pointerleave', onUp);

      canvas.removeEventListener('touchstart', onDown);
      canvas.removeEventListener('touchmove', onMove);
      canvas.removeEventListener('touchend', onUp);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameStarted]);

  // update pen size on context
  useEffect(() => {
    if (ctxRef.current) ctxRef.current.lineWidth = penSize;
  }, [penSize]);

  // break countdown
  useEffect(() => {
    if (breakLeft <= 0) return;
    const t = setInterval(() => setBreakLeft((b) => Math.max(0, b - 1)), 1000);
    return () => clearInterval(t);
  }, [breakLeft]);

  /* ===================== CANVAS ===================== */

  const clearCanvas = (keepGuide = false) => {
    const canvas = canvasRef.current;
    const ctx = ctxRef.current;
    if (!canvas || !ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    strokeDataRef.current = []; // ✅ RESET STROKES
    setHasDrawn(false);

    if (keepGuide) drawGuide();
  };

  const getEventPos = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const ev = e.nativeEvent || e;
    const touch = (ev.touches && ev.touches[0]) || (ev.changedTouches && ev.changedTouches[0]) || ev;
    return { x: touch.clientX - rect.left, y: touch.clientY - rect.top };
  };

  const startDrawing = (e) => {
    if (breakLeft > 0) return;
    e.preventDefault();

    const ctx = ctxRef.current;
    if (!ctx) return;

    const pos = getEventPos(e);
    console.log('startDrawing', { pos });
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
    // draw a small dot so the user sees immediate feedback
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.arc(pos.x, pos.y, Math.max(1, penSize / 2), 0, Math.PI * 2);
    ctx.fill();

    strokeDataRef.current.push({
      type: "start",
      x: pos.x,
      y: pos.y,
      timestamp: Date.now()
    });

    setIsDrawing(true);
    setHasDrawn(true);
    // store pointer id for capture release
    const ev = e.nativeEvent || e;
    if (ev.pointerId && canvasRef.current && canvasRef.current.setPointerCapture) {
      pointerIdRef.current = ev.pointerId;
      try { canvasRef.current.setPointerCapture(ev.pointerId); } catch (err) { /* ignore */ }
    }
  };

  const draw = (e) => {
    if (!isDrawing || breakLeft > 0) return;
    // don't block scrolling unless needed
    e.preventDefault && e.preventDefault();

    const ctx = ctxRef.current;
    if (!ctx) return;

    const pos = getEventPos(e);
    console.log('draw', { pos });
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();

    strokeDataRef.current.push({
      type: "move",
      x: pos.x,
      y: pos.y,
      timestamp: Date.now()
    });
  };

  const stopDrawing = (e) => {
    console.log('stopDrawing');
    // release pointer capture if any
    const id = pointerIdRef.current;
    if (id && canvasRef.current && canvasRef.current.releasePointerCapture) {
      try { canvasRef.current.releasePointerCapture(id); } catch (err) { /* ignore */ }
      pointerIdRef.current = null;
    }
    setIsDrawing(false);
  };

  /* ===================== SAVE JSON ===================== */

  const handleCorrect = async () => {
    const sessionJSON = {
      grade: selectedGrade,
      activity: currentActivity.content,
      instruction: currentActivity.instruction,
      penSize,
      timestamp: new Date().toISOString(),
      strokes: strokeDataRef.current
    };

    strokeDataRef.current = [];
    setHasDrawn(false);

    setIsPredicting(true);
    setShowResultScreen(true);

    try {
      const response = await fetch("http://localhost:8000/handwriting/predict", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(sessionJSON)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
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
      setTimeout(() => clearCanvas(true), 50);
    } else {
      alert(`Awesome! You finished all ${activities.length}.`);
      goHome();
    }
  };

  /* ===================== UI (UNCHANGED) ===================== */

  if (!gameStarted) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#1e3a7a] via-[#3d5aa8] to-[#4a6cb8] text-white relative overflow-hidden p-4 md:p-8">

        <div className="mx-auto max-w-5xl">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-5 shadow-2xl shadow-black/40 md:p-8">
            <div className="flex flex-col items-center gap-3 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500/30 to-indigo-500/10 ring-1 ring-white/10">
                <PenTool className="h-7 w-7 text-sky-200" />
              </div>
              <h1 className="text-2xl font-extrabold text-white tracking-tight text-amber-200 md:text-3xl">
                Handwriting Fun
              </h1>
              <p className="max-w-2xl text-sm text-slate-300">
                Calm, short handwriting activities. Let your child try and you can tap
                <span className="font-semibold text-sky-200"> Good job </span>
                when it looks correct.
              </p>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-[1.2fr,1.8fr]">
              <div className="rounded-2xl bg-black/20 p-4 ring-1 ring-white/10">
                <h2 className="mb-2 flex items-center gap-2 text-sm font-semibold text-sky-200">
                  <Info className="h-4 w-4" /> Parent guide (quick)
                </h2>
                <ul className="space-y-2 text-sm text-slate-200">
                  <li className="flex gap-2">
                    <span className="mt-2 h-1.5 w-1.5 rounded-full bg-sky-300"></span>
                    <span>Pick grade → child traces the word/letter.</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="mt-2 h-1.5 w-1.5 rounded-full bg-sky-300"></span>
                    <span>Use “Show guide” to help them trace.</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="mt-2 h-1.5 w-1.5 rounded-full bg-sky-300"></span>
                    <span>Use “Mini break” if the child gets restless.</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="mt-2 h-1.5 w-1.5 rounded-full bg-sky-300"></span>
                    <span>Keep sessions short (3–5 minutes).</span>
                  </li>
                </ul>

              </div>

              <div className="rounded-2xl bg-black/20 p-4 ring-1 ring-white/10">
                <h2 className="text-sm font-semibold text-white">
                  Choose grade level
                </h2>
                <p className="mt-1 text-xs text-slate-300">
                  Activities are Sinhala-friendly and increase in difficulty.
                </p>

                <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-3">
                  {gradeMeta.map((g) => (
                    <button
                      key={g.key}
                      type="button"
                      onClick={() => startGame(g.key)}
                      className={`group rounded-2xl bg-gradient-to-br ${g.bg} p-[1px] shadow-lg shadow-black/30`}
                    >
                      <div className={`rounded-2xl bg-slate-950/70 p-4 text-left ring-1 ${g.ring} transition group-hover:bg-slate-950/55`}>
                        <div className="flex items-start justify-between">
                          <div className="text-2xl">{g.emoji}</div>
                          <Star className="h-4 w-4 text-yellow-200/90" />
                        </div>
                        <div className="mt-3 text-sm font-bold text-white">{g.label}</div>
                        <div className="mt-1 text-xs text-slate-300">{g.hint}</div>
                        <div className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-sky-200">
                          Start <ArrowRight className="h-3 w-3" />
                        </div>
                      </div>
                    </button>
                  ))}
                </div>

                <div className="mt-4 rounded-xl bg-slate-900/40 p-3 text-xs text-slate-300 ring-1 ring-white/10">
                  Tip: For best ADHD focus, start with <span className="font-semibold text-white">Kindergarten / Grade 1</span>
                  and increase slowly.
                </div>
              </div>
            </div>
          </div>

          <p className="mt-4 text-center text-xs text-slate-400">
            This is a supportive activity, not a diagnosis tool.
          </p>
        </div>
      </div>
    );
  }

  if (showResultScreen) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#1e3a7a] via-[#3d5aa8] to-[#4a6cb8] text-white relative overflow-hidden p-4 md:p-8 flex items-center justify-center">
        <div className="w-full max-w-md rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl shadow-black/40 text-center">
          {isPredicting ? (
            <div className="flex flex-col items-center gap-5 my-8">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-w-2 border-t-amber-400 border-r-transparent border-b-sky-400 border-l-transparent"></div>
              <h2 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-yellow-400">Result Pending...</h2>
              <p className="text-base text-slate-300">Analyzing your handwriting patterns ✍️✨</p>
            </div>
          ) : currentPrediction?.error ? (
            <div className="flex flex-col items-center gap-5 my-4">
              <XCircle className="h-20 w-20 text-rose-500 max-w-md" />
              <h2 className="text-3xl font-extrabold text-rose-400">Oops!</h2>
              <p className="text-base text-slate-300">{currentPrediction.message}</p>
              <button onClick={handleBackToGame} className="mt-6 w-full rounded-2xl bg-slate-800 px-6 py-4 font-bold text-white hover:bg-slate-700 transition ring-1 ring-white/10 flex items-center justify-center gap-3">
                <ArrowRight className="h-5 w-5 rotate-180" /> Back to Game
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-5 my-4">
              <div className="relative">
                <div className="absolute inset-0 bg-emerald-400 blur-xl opacity-20 rounded-full"></div>
                <CheckCircle className="h-20 w-20 text-emerald-400 relative z-10" />
              </div>
              <h2 className="text-3xl font-extrabold text-emerald-300">Analysis Complete!</h2>

              <div className="w-full rounded-2xl bg-black/25 p-6 mt-2 ring-1 ring-white/10 text-left space-y-4">
                <div className="flex justify-between items-center pb-4 border-b border-white/10">
                  <div className="text-sm text-slate-400 font-semibold">Prediction</div>
                  <div className={`text-xl font-bold ${currentPrediction?.prediction === 'ADHD' || currentPrediction?.prediction === 'ADHD Risk' ? 'text-rose-400' : 'text-emerald-400'}`}>
                    {currentPrediction?.prediction || 'Unknown'}
                  </div>
                </div>

                <div className="flex justify-between items-center pb-4 border-b border-white/10">
                  <div className="text-sm text-slate-400 font-semibold">Probability</div>
                  <div className="text-xl font-bold text-white">
                    {currentPrediction?.probability ? (currentPrediction.probability * 100).toFixed(1) : '0'}%
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <div className="text-sm text-slate-400 font-semibold">Risk Level</div>
                  <div className={`text-xl font-bold ${currentPrediction?.risk_level === 'High' ? 'text-rose-400' :
                      currentPrediction?.risk_level === 'Moderate' ? 'text-amber-400' : 'text-emerald-400'
                    }`}>
                    {currentPrediction?.risk_level || 'Unknown'}
                  </div>
                </div>
              </div>

              <button onClick={handleBackToGame} className="mt-4 w-full flex items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4 font-bold text-white hover:from-blue-500 hover:to-indigo-500 transition shadow-lg shadow-blue-900/40">
                Continue Game <ArrowRight className="h-5 w-5" />
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // -------------------- GAME SCREEN --------------------
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1e3a7a] via-[#3d5aa8] to-[#4a6cb8] text-white relative overflow-hidden p-4 md:p-8">

      <div className="mx-auto max-w-6xl">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-4 shadow-2xl shadow-black/40 md:p-6">
          {/* top bar */}
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-500/25 to-indigo-500/10 ring-1 ring-white/10">
                <Sparkles className="h-5 w-5 text-sky-200" />
              </div>
              <div>
                <div className="text-sm font-bold text-white">
                  {selectedGrade?.toUpperCase()} • Activity {currentIndex + 1} / {activities.length}
                </div>
                <div className="text-xs text-slate-300">
                  Stars: <span className="font-semibold text-yellow-200">{score}</span> • Attempts:{" "}
                  <span className="font-semibold text-slate-100">{totalAttempts}</span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setShowGuide((v) => !v)}
                className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold ring-1 ring-white/10 transition ${showGuide ? "bg-emerald-400/15 text-emerald-200 hover:bg-emerald-400/20" : "bg-black/30 text-slate-200 hover:bg-black/40"
                  }`}
              >
                <Eye className="h-4 w-4" />
                {showGuide ? "Guide ON" : "Guide OFF"}
              </button>

              <button
                type="button"
                onClick={() => setBreakLeft(30)}
                disabled={breakLeft > 0}
                className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold ring-1 ring-white/10 transition ${breakLeft > 0 ? "cursor-not-allowed bg-black/30 text-slate-400" : "bg-indigo-400/15 text-indigo-200 hover:bg-indigo-400/20"
                  }`}
              >
                <PauseCircle className="h-4 w-4" />
                {breakLeft > 0 ? `Break ${breakLeft}s` : "Mini break"}
              </button>

              <button
                type="button"
                onClick={goHome}
                className="inline-flex items-center gap-2 rounded-full bg-red-500/10 px-4 py-2 text-sm font-semibold text-red-200 ring-1 ring-red-400/20 hover:bg-red-500/15"
              >
                <Home className="h-4 w-4" /> End
              </button>
            </div>
          </div>

          {/* progress */}
          <div className="mt-4 rounded-2xl bg-black/25 p-3 ring-1 ring-white/10">
            <div className="flex items-center justify-between text-xs text-slate-200">
              <span>Progress</span>
              <span className="font-semibold text-slate-100">{progressPct}%</span>
            </div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-800">
              <div className="h-full rounded-full bg-sky-400" style={{ width: `${progressPct}%` }} />
            </div>
          </div>

          {/* activity prompt */}
          <div className="mt-5 grid gap-4 md:grid-cols-[1.2fr,2fr]">
            <div className="rounded-2xl bg-black/25 p-4 ring-1 ring-white/10">
              <div className="text-xs font-semibold text-sky-200">Your task</div>
              <div className="mt-2 rounded-2xl bg-slate-950/60 p-4 text-center ring-1 ring-white/10">
                <div className="text-4xl font-extrabold text-white md:text-5xl">
                  {currentActivity?.content}
                </div>
                <div className="mt-2 text-xs text-slate-200">
                  {currentActivity?.instruction}
                </div>
              </div>

              <div className="mt-3 rounded-xl bg-slate-900/40 p-3 text-xs text-slate-200 ring-1 ring-white/10">
                Tip: Praise effort. Short strokes are okay. 😊
              </div>

              <div className="mt-3">
                <label className="text-xs font-semibold text-slate-200">Pen size</label>
                <div className="mt-2 flex items-center gap-3">
                  <input
                    type="range"
                    min={4}
                    max={16}
                    value={penSize}
                    onChange={(e) => setPenSize(Number(e.target.value))}
                    className="w-full"
                  />
                  <div className="w-10 text-center text-xs font-semibold text-slate-200">
                    {penSize}
                  </div>
                </div>
              </div>
            </div>

            {/* canvas */}
            <div className="rounded-2xl bg-black/25 p-4 ring-1 ring-white/10">
              <div className="mb-3 flex items-center justify-between">
                <div className="text-xs font-semibold text-slate-200">
                  Drawing area
                </div>
                <div className="text-[11px] text-slate-300">
                  {breakLeft > 0 ? "Pause time… breathe 🫧" : "Use finger or stylus ✍️"}
                </div>
              </div>

              <div className="rounded-2xl bg-white p-2">
                <canvas
                  ref={canvasRef}
                  onPointerDown={startDrawing}
                  onPointerMove={draw}
                  onPointerUp={stopDrawing}
                  onPointerCancel={stopDrawing}
                  onPointerLeave={stopDrawing}
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  style={{ touchAction: 'none', userSelect: 'none' }}
                  className={`block w-full rounded-xl bg-white ${breakLeft > 0 ? "opacity-70" : ""}`}
                />
              </div>

              {/* bottom actions */}
              <div className="mt-4 grid gap-3 md:grid-cols-3">
                <button
                  type="button"
                  onClick={() => clearCanvas(true)}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-800 px-4 py-3 text-sm font-bold text-white ring-1 ring-white/10 hover:bg-slate-700"
                >
                  <Eraser className="h-5 w-5" /> Clear
                </button>

                <button
                  type="button"
                  onClick={handleWrong}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-rose-600 px-4 py-3 text-sm font-bold text-white hover:bg-rose-500"
                >
                  <XCircle className="h-5 w-5" /> Let’s practice
                </button>

                <button
                  type="button"
                  onClick={handleCorrect}
                  disabled={!hasDrawn}
                  className={`inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-bold text-white transition ${hasDrawn ? "bg-emerald-600 hover:bg-emerald-500" : "cursor-not-allowed bg-emerald-900/40 text-emerald-200/50"
                    }`}
                  title={!hasDrawn ? "Draw something first" : "Mark as correct"}
                >
                  <CheckCircle className="h-5 w-5" /> Good job <ArrowRight className="h-5 w-5" />
                </button>
              </div>

              <div className="mt-3 text-center text-[11px] text-slate-200">
                Parent taps <span className="font-semibold text-amber-100">Good job</span> when it looks correct.
              </div>
            </div>
          </div>
        </div>

        <p className="mt-4 text-center text-xs text-slate-400">
          Keep sessions short and positive.
        </p>

      </div>
      {/* ===================== JSON ANALYSIS SECTION ===================== */}
      <div className="mt-8 rounded-2xl bg-black/30 p-6 ring-1 ring-white/10">
        <h2 className="text-lg font-bold text-white mb-4">
          Upload Handwriting JSON for Analysis
        </h2>

        <div className="mb-4">
          <input
            type="file"
            accept=".json"
            onChange={handleJSONUpload}
            className="block w-full text-sm text-slate-200 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-emerald-600 file:text-white hover:file:bg-emerald-500 cursor-pointer"
          />
          {uploadedJSON && (
            <p className="mt-2 text-xs text-emerald-200">
              ✓ File loaded successfully
            </p>
          )}
        </div>

        <div className="flex flex-wrap gap-3 mb-4">
          <div>
            <label className="block text-xs text-slate-300 mb-1">Age</label>
            <input
              type="number"
              value={analysisAge}
              onChange={(e) => setAnalysisAge(Number(e.target.value))}
              className="rounded-lg px-3 py-2 text-black bg-white w-24"
              min="1"
              max="18"
              placeholder="Age"
            />
          </div>

          <div>
            <label className="block text-xs text-slate-300 mb-1">Gender</label>
            <select
              value={analysisGender}
              onChange={(e) => setAnalysisGender(e.target.value)}
              className="rounded-lg px-3 py-2 text-black bg-white"
            >
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </div>
        </div>

        <button
          onClick={analyzeUploadedJSON}
          disabled={!uploadedJSON || analysisLoading}
          className="rounded-lg bg-emerald-600 px-6 py-3 font-bold text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-emerald-500 transition"
        >
          {analysisLoading ? "Analyzing..." : "Analyze & Predict"}
        </button>

        {predictionResult && (
          <div className={`mt-6 rounded-xl p-5 ring-1 ${predictionResult.error
            ? "bg-red-900/30 ring-red-500/30"
            : "bg-slate-900/60 ring-white/10"
            }`}>
            {predictionResult.error ? (
              <>
                <h3 className="text-md font-bold text-red-400 mb-3">Error</h3>
                <div className="space-y-2">
                  <p className="text-sm text-red-200 whitespace-pre-line">
                    {predictionResult.message}
                  </p>
                  <div className="mt-4 p-3 rounded-lg bg-black/30 text-xs text-slate-300">
                    <p className="font-semibold mb-2">Troubleshooting:</p>
                    <ul className="list-disc list-inside space-y-1">
                      <li>Ensure the backend server is running on http://localhost:8000</li>
                      <li>Check if the JSON file has valid stroke data</li>
                      <li>Verify the file format matches the expected structure</li>
                      <li>Check browser console for more details</li>
                    </ul>
                  </div>
                </div>
              </>
            ) : (
              <>
                <h3 className="text-md font-bold text-white mb-3">Prediction Results</h3>
                <div className="space-y-3">
                  <div>
                    <span className="text-xs text-slate-300">Prediction: </span>
                    <span className={`text-lg font-bold ${predictionResult.prediction === "ADHD"
                      ? "text-red-400"
                      : "text-emerald-400"
                      }`}>
                      {predictionResult.prediction}
                    </span>
                  </div>
                  <div>
                    <span className="text-xs text-slate-300">Probability: </span>
                    <span className="text-lg font-semibold text-white">
                      {(predictionResult.probability * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div>
                    <span className="text-xs text-slate-300">Risk Level: </span>
                    <span className={`text-lg font-semibold ${predictionResult.risk_level === "High"
                      ? "text-red-400"
                      : predictionResult.risk_level === "Moderate"
                        ? "text-yellow-400"
                        : "text-green-400"
                      }`}>
                      {predictionResult.risk_level}
                    </span>
                  </div>
                  <div className="mt-4 pt-3 border-t border-white/10">
                    <p className="text-xs text-slate-400">
                      Note: This is a prediction based on handwriting analysis and should not be used as a medical diagnosis.
                    </p>
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>

    </div>
  );

}  