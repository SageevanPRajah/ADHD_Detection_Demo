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
  { key: "kindergarten", label: "Kindergarten", emoji: "", hint: "Letters", ring: "ring-pink-400/30", bg: "from-pink-500/20 to-rose-500/10" },
  { key: "grade1", label: "Grade 1", emoji: "", hint: "Easy words", ring: "ring-sky-400/30", bg: "from-sky-500/20 to-blue-500/10" },
  { key: "grade2", label: "Grade 2", emoji: "", hint: "Common words", ring: "ring-emerald-400/30", bg: "from-emerald-500/20 to-teal-500/10" },
  { key: "grade3", label: "Grade 3", emoji: "", hint: "Long words", ring: "ring-amber-400/30", bg: "from-amber-500/20 to-orange-500/10" },
  { key: "grade4", label: "Grade 4", emoji: "", hint: "Hard words", ring: "ring-violet-400/30", bg: "from-violet-500/20 to-purple-500/10" },
  { key: "grade5", label: "Grade 5+", emoji: "", hint: "Phrases", ring: "ring-fuchsia-400/30", bg: "from-fuchsia-500/20 to-pink-500/10" }
];

function clamp(n, a, b) {
  return Math.max(a, Math.min(b, n));
}

export default function HandwritingGame() {
  const [gameStarted, setGameStarted] = useState(false);
  const [selectedGrade, setSelectedGrade] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [totalAttempts, setTotalAttempts] = useState(0);

  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);

  // ADHD-friendly toggles
  const [showGuide, setShowGuide] = useState(true);
  const [penSize, setPenSize] = useState(8);
  const [breakLeft, setBreakLeft] = useState(0);

  const canvasRef = useRef(null);
  const ctxRef = useRef(null);

  const activities = useMemo(() => {
    if (!selectedGrade) return [];
    return activitySets[selectedGrade] || [];
  }, [selectedGrade]);

  const currentActivity = activities[currentIndex];

  // Responsive canvas size (fits phone/tablet)
  const resizeCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const parent = canvas.parentElement;
    if (!parent) return;

    const rect = parent.getBoundingClientRect();
    const w = Math.floor(rect.width);
    const h = Math.floor(clamp(rect.width * 0.55, 260, 420));


    const dpr = window.devicePixelRatio || 1;
    canvas.width = Math.floor(w * dpr);
    canvas.height = Math.floor(h * dpr);
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;

    const ctx = canvas.getContext("2d");
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0); // draw in CSS pixels
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = "#2563eb";
    ctx.lineWidth = penSize;
    ctxRef.current = ctx;

    // redraw guide after resize
    drawGuide();
  };

  useEffect(() => {
    if (!gameStarted) return;
    resizeCanvas();
    const onResize = () => resizeCanvas();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameStarted]);

  // Update pen width when changed
  useEffect(() => {
    if (ctxRef.current) ctxRef.current.lineWidth = penSize;
  }, [penSize]);

  // Break timer (30s)
  useEffect(() => {
    if (breakLeft <= 0) return;
    const t = setInterval(() => setBreakLeft((s) => s - 1), 1000);
    return () => clearInterval(t);
  }, [breakLeft]);

  useEffect(() => {
    if (!gameStarted) return;
    // when activity changes, clear and guide
    clearCanvas(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIndex, showGuide, gameStarted]);

  const startGame = (grade) => {
    setSelectedGrade(grade);
    setGameStarted(true);
    setCurrentIndex(0);
    setScore(0);
    setTotalAttempts(0);
    setHasDrawn(false);
    setShowGuide(true);
    setPenSize(8);
    setBreakLeft(0);
    setTimeout(() => resizeCanvas(), 0);
  };

  const goHome = () => {
    setGameStarted(false);
    setSelectedGrade(null);
    setCurrentIndex(0);
    setScore(0);
    setTotalAttempts(0);
    setHasDrawn(false);
    setBreakLeft(0);
  };

  const clearCanvas = (keepGuide = false) => {
    const canvas = canvasRef.current;
    const ctx = ctxRef.current;
    if (!canvas || !ctx) return;

    // Clear in CSS pixels
    const w = canvas.getBoundingClientRect().width;
    const h = canvas.getBoundingClientRect().height;
    ctx.clearRect(0, 0, w, h);
    setHasDrawn(false);

    if (!keepGuide) return;
    drawGuide();
  };

  const drawGuide = () => {
    const ctx = ctxRef.current;
    const canvas = canvasRef.current;
    if (!ctx || !canvas || !currentActivity) return;

    const w = canvas.getBoundingClientRect().width;
    const h = canvas.getBoundingClientRect().height;

    // guide background
    ctx.save();
    ctx.globalAlpha = 1;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, w, h);

    // soft grid lines
    ctx.globalAlpha = 0.06;
    ctx.strokeStyle = "#0f172a";
    ctx.lineWidth = 1;
    const gap = 24;
    for (let x = gap; x < w; x += gap) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    }
    for (let y = gap; y < h; y += gap) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }

    // faint target content (tracing hint)
    if (showGuide) {
      ctx.globalAlpha = 0.16;
      ctx.fillStyle = "#0f172a";
      const text = currentActivity.content;
      const fontSize = clamp(Math.floor(w * 0.18), 42, 96);
      ctx.font = `700 ${fontSize}px system-ui, -apple-system, Segoe UI, Roboto, Arial`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(text, w / 2, h / 2);
    }

    ctx.restore();

    // reset drawing style
    ctx.strokeStyle = "#2563eb";
    ctx.lineWidth = penSize;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
  };

  const handleCorrect = () => {
    setScore((s) => s + 1);
    setTotalAttempts((t) => t + 1);

    if (currentIndex < activities.length - 1) {
      setCurrentIndex((i) => i + 1);
    } else {
      alert(`Awesome! You finished all ${activities.length}.\nStars: ${score + 1} / ${totalAttempts + 1}`);
      goHome();
    }
  };

  const handleWrong = () => {
    setTotalAttempts((t) => t + 1);
    clearCanvas(true);
  };

  const getEventPos = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const point = e.touches ? e.touches[0] : e;

    return {
      x: point.clientX - rect.left,
      y: point.clientY - rect.top
    };
  };

  const startDrawing = (e) => {
    if (breakLeft > 0) return;
    e.preventDefault();
    const ctx = ctxRef.current;
    if (!ctx) return;

    setIsDrawing(true);
    setHasDrawn(true);

    const pos = getEventPos(e);
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
  };

  const draw = (e) => {
    if (!isDrawing || breakLeft > 0) return;
    e.preventDefault();

    const ctx = ctxRef.current;
    if (!ctx) return;

    const pos = getEventPos(e);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
  };

  const stopDrawing = () => setIsDrawing(false);

  const progressPct = activities.length ? Math.round(((currentIndex + 1) / activities.length) * 100) : 0;

  // -------------------- HOME / GRADE PICKER --------------------
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
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                  onTouchStart={startDrawing}
                  onTouchMove={draw}
                  onTouchEnd={stopDrawing}
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
    </div>
  );
}
