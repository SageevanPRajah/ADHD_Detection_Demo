// File: src/pages/eyetrack/game/Eyecollect.jsx
import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./eyecollect.css";

export default function Eyecollect() {
  const stageWrapRef = useRef(null);
  const videoRef = useRef(null);
  const screenRef = useRef(null);
  const canvasRef = useRef(null);
  const liveThumbRef = useRef(null);

  const [status, setStatus] = useState("Idle");
  const [recCam, setRecCam] = useState(false);
  const [recScreen, setRecScreen] = useState(false);
  const [format, setFormat] = useState("—");
  const [toastMsg, setToastMsg] = useState("");
  const [toastVisible, setToastVisible] = useState(false);

  const [participantId, setParticipantId] = useState("");
  const [cohort, setCohort] = useState("");
  const [age, setAge] = useState("");
  const [note, setNote] = useState("");

  // Refs for media + logs
  const camStreamRef = useRef(null);
  const camRecorderRef = useRef(null);
  const camChunksRef = useRef([]);

  const screenStreamRef = useRef(null);
  const screenRecorderRef = useRef(null);
  const screenChunksRef = useRef([]);

  const chosenMimeRef = useRef("");
  const fileExtRef = useRef("webm");

  const logsRef = useRef({
    meta: {},
    events: [],
    trials: [],
    calibration: { grid: [], samples: [] },
  });

  const audioCtxRef = useRef(null);
  const rafRef = useRef(null);
  const runningRef = useRef(false);
  const navigate = useNavigate();

  // canvas width/height (store lowercase w/h consistently)
  const canvasSizeRef = useRef({ w: 0, h: 0 });

  // --- helpers to avoid duplicate click listeners across tasks ---
  const canvasClickHandlerRef = useRef(null);
  function setCanvasClickHandler(handler) {
    const canvas = canvasRef.current;
    if (!canvas) return;
    // remove previous
    if (canvasClickHandlerRef.current) {
      canvas.removeEventListener("click", canvasClickHandlerRef.current);
      canvasClickHandlerRef.current = null;
    }
    if (handler) {
      canvas.addEventListener("click", handler);
      canvasClickHandlerRef.current = handler;
    }
  }

  function forceFitCanvas() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    // IMPORTANT: size to actual displayed pixels
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
    canvasSizeRef.current = { w: canvas.width, h: canvas.height };
  }

  function goBack() {
    // stop everything safely before leaving
    try {
        setCanvasClickHandler(null);
        stopLoop();
        clearStage();

        if (camRecorderRef.current?.state === "recording") {
        camRecorderRef.current.stop();
        }
        if (screenRecorderRef.current?.state === "recording") {
        screenRecorderRef.current.stop();
        }

        camStreamRef.current?.getTracks().forEach((t) => t.stop());
        screenStreamRef.current?.getTracks().forEach((t) => t.stop());
    } catch (e) {
        console.warn("Cleanup before back failed:", e);
    }

    navigate(-1); // ⬅️ go to previous route
    }

  // Fit canvas on resize
  useEffect(() => {
    function fit() {
      forceFitCanvas();
    }
    fit();
    window.addEventListener("resize", fit);
    return () => window.removeEventListener("resize", fit);
  }, []);

  // Audio context
  useEffect(() => {
    audioCtxRef.current = new (window.AudioContext ||
      window.webkitAudioContext)();
    return () => {
      try {
        audioCtxRef.current?.close?.();
      } catch {
        // ignore
      }
    };
  }, []);

  function beep(freq = 700, ms = 120, type = "sine", vol = 0.15) {
    const actx = audioCtxRef.current;
    if (!actx) return;

    // Some browsers suspend AudioContext until user gesture; this is fine.
    try {
      if (actx.state === "suspended") actx.resume();
    } catch {
      // ignore
    }

    const o = actx.createOscillator();
    const g = actx.createGain();
    o.type = type;
    o.frequency.value = freq;
    g.gain.value = vol;
    o.connect(g);
    g.connect(actx.destination);
    o.start();
    setTimeout(() => o.stop(), ms);
  }

  function showToast(msg, ms = 1400) {
    setToastMsg(msg);
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), ms);
  }

  function logEvent(type, payload = {}) {
    logsRef.current.events.push({
      t_ms: performance.now(),
      type,
      payload,
    });
  }

  function addTrialSummary(entry) {
    logsRef.current.trials.push(entry);
  }

  function buildPrefix() {
    const id = participantId || "PID";
    const coh = (cohort || "NA").toUpperCase();
    const d = new Date();
    const ds = d.toISOString().slice(0, 19).replace(/[:T]/g, "-");
    return `${id}_${coh}_${ds}`;
  }

  function initMeta() {
    const { w, h } = canvasSizeRef.current;
    logsRef.current.meta = {
      participant_id: participantId,
      cohort,
      age,
      notes: note,
      stage_w: w,
      stage_h: h,
      dpr: window.devicePixelRatio || 1,
      user_agent: navigator.userAgent,
      started_at_iso: new Date().toISOString(),
    };
  }

  function saveBlob(chunks, filename) {
    const mime = chosenMimeRef.current || "video/webm";
    const blob = new Blob(chunks, { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  function toCSV(rows) {
    if (!rows.length) return "";
    const keys = Array.from(new Set(rows.flatMap((r) => Object.keys(r))));
    const esc = (v) => (v == null ? "" : String(v)).replace(/"/g, '""');
    const header = keys.map((k) => `"${esc(k)}"`).join(",");
    const body = rows
      .map((r) => keys.map((k) => `"${esc(r[k])}"`).join(","))
      .join("\n");
    return header + "\n" + body;
  }

  function downloadText(text, filename, type = "text/plain") {
    const blob = new Blob([text], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  function saveLogs() {
    const eventsRows = logsRef.current.events.map((e) => ({
      t_ms: Math.round(e.t_ms),
      type: e.type,
      ...Object.fromEntries(
        Object.entries(e.payload || {}).map(([k, v]) => [
          k,
          typeof v === "object" ? JSON.stringify(v) : v,
        ])
      ),
    }));

    if (eventsRows.length) {
      downloadText(toCSV(eventsRows), `${buildPrefix()}_events.csv`, "text/csv");
    }

    if (logsRef.current.trials.length) {
      downloadText(
        toCSV(logsRef.current.trials),
        `${buildPrefix()}_trials.csv`,
        "text/csv"
      );
    }

    downloadText(
      JSON.stringify(logsRef.current, null, 2),
      `${buildPrefix()}_session.json`,
      "application/json"
    );
  }

  function getCanvas() {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const ctx = canvas.getContext("2d");
    const { w, h } = canvasSizeRef.current;
    return { canvas, ctx, W: w, H: h };
  }

  function clearStage() {
    const c = getCanvas();
    if (!c) return;
    c.ctx.clearRect(0, 0, c.W, c.H);
  }

  // Animation loop helpers
  function startLoop(draw) {
    runningRef.current = true;
    function step() {
      if (!runningRef.current) return;
      draw();
      rafRef.current = requestAnimationFrame(step);
    }
    rafRef.current = requestAnimationFrame(step);
  }

  function stopLoop() {
    runningRef.current = false;
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
  }

  // Recording
  async function startCamera() {
    if (!participantId) {
      alert("Please set Participant ID first.");
      return;
    }

    // Make sure canvas is sized before meta
    forceFitCanvas();

    try {
      const camStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1920 },
          height: { ideal: 1080 },
          frameRate: { ideal: 60, max: 60 },
        },
        audio: false,
      });

      camStreamRef.current = camStream;
      if (videoRef.current) videoRef.current.srcObject = camStream;
      if (liveThumbRef.current) liveThumbRef.current.srcObject = camStream;

      // mime detection
      if (!chosenMimeRef.current) {
        const candidates = [
          "video/mp4;codecs=avc1",
          "video/mp4;codecs=h264",
          "video/webm;codecs=vp9",
          "video/webm;codecs=vp8",
        ];
        for (const t of candidates) {
          if (
            window.MediaRecorder &&
            MediaRecorder.isTypeSupported &&
            MediaRecorder.isTypeSupported(t)
          ) {
            chosenMimeRef.current = t;
            fileExtRef.current = t.startsWith("video/mp4") ? "mp4" : "webm";
            break;
          }
        }
      }

      const recOpts = chosenMimeRef.current
        ? { mimeType: chosenMimeRef.current, videoBitsPerSecond: 4_000_000 }
        : undefined;

      const recorder = new MediaRecorder(camStream, recOpts);
      camRecorderRef.current = recorder;
      camChunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size) camChunksRef.current.push(e.data);
      };

      recorder.onstop = () => {
        saveBlob(camChunksRef.current, `${buildPrefix()}_cam.${fileExtRef.current}`);
      };

      initMeta();
      logsRef.current.events = [];
      logsRef.current.trials = [];
      logsRef.current.calibration.samples = [];

      recorder.start();
      setRecCam(true);
      setFormat(chosenMimeRef.current || "webm");
      setStatus("Recording… Webcam ON");
      logEvent("session_start", {});
      showToast("🎥 Webcam recording started");
    } catch (err) {
      console.error(err);
      alert("Camera access denied. Allow camera and retry.");
    }
  }

  async function startScreen() {
    try {
      const screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: false,
      });

      screenStreamRef.current = screenStream;
      if (screenRef.current) screenRef.current.srcObject = screenStream;

      const recOpts = chosenMimeRef.current
        ? { mimeType: chosenMimeRef.current, videoBitsPerSecond: 4_000_000 }
        : undefined;

      const recorder = new MediaRecorder(screenStream, recOpts);
      screenRecorderRef.current = recorder;
      screenChunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size) screenChunksRef.current.push(e.data);
      };

      recorder.onstop = () => {
        saveBlob(
          screenChunksRef.current,
          `${buildPrefix()}_screen.${fileExtRef.current}`
        );
      };

      recorder.start();
      setRecScreen(true);
      logEvent("screen_recording_start", {});
      showToast("🖥️ Screen recording started");
    } catch (err) {
      console.warn("Screen share not started:", err);
    }
  }

  function stopAll() {
    try {
      // stop tasks + listeners
      setCanvasClickHandler(null);
      stopLoop();
      clearStage();

      if (camRecorderRef.current && camRecorderRef.current.state === "recording") {
        camRecorderRef.current.stop();
      }
      if (
        screenRecorderRef.current &&
        screenRecorderRef.current.state === "recording"
      ) {
        screenRecorderRef.current.stop();
      }

      if (camStreamRef.current) {
        camStreamRef.current.getTracks().forEach((t) => t.stop());
        camStreamRef.current = null;
      }

      if (screenStreamRef.current) {
        screenStreamRef.current.getTracks().forEach((t) => t.stop());
        screenStreamRef.current = null;
      }

      setRecCam(false);
      setRecScreen(false);

      logEvent("session_stop", {});
      saveLogs();
      setStatus("Idle");
      showToast("✅ Saved: videos + logs");
    } catch (e) {
      console.error(e);
    }
  }

  async function goFullscreen() {
    const el = stageWrapRef.current;
    if (!el) return;
    try {
      if (el.requestFullscreen) await el.requestFullscreen();
      else if (el.webkitRequestFullscreen) await el.webkitRequestFullscreen();

      // ✅ critical: fullscreen changes layout; refit canvas after it settles
      setTimeout(() => {
        forceFitCanvas();
        window.dispatchEvent(new Event("resize"));
      }, 200);
    } catch (e) {
      console.warn("Fullscreen failed:", e);
    }
  }

  // Sync flash
  function syncFlash() {
    const c = getCanvas();
    if (!c) return;

    const start = performance.now();
    const dur = 200;

    beep(900, 120, "square", 0.2);
    logEvent("sync_flash_start", {});

    function draw() {
      const t = performance.now() - start;
      c.ctx.fillStyle = t < dur ? "#ffffff" : "#0b132b";
      c.ctx.fillRect(0, 0, c.W, c.H);
      if (t < dur) {
        requestAnimationFrame(draw);
      } else {
        clearStage();
        logEvent("sync_flash_end", {});
        showToast("⚡ Sync flashed");
      }
    }
    draw();
  }

  // Calibration
  function calibrationGrid(n = 9) {
    // ✅ FIX: your ref stores lowercase w/h
    const { w: W, h: H } = canvasSizeRef.current;
    const xs = [0.15, 0.5, 0.85];
    const ys = n === 3 ? [0.5] : [0.2, 0.5, 0.8];
    const pts = [];
    for (const y of ys) for (const x of xs) pts.push({ x: Math.round(x * W), y: Math.round(y * H) });
    return pts;
  }

  function runCalibFixed(points) {
    const c = getCanvas();
    if (!c) return;

    setCanvasClickHandler(null);
    stopLoop();

    const DOT_MS = 1500;
    const R = 12;
    let idx = 0;

    logsRef.current.calibration.grid = points;
    setStatus(points.length === 9 ? "Calibration — 9-Point" : "Re-Calibration — 3-Point");
    showToast(points.length === 9 ? "👀 Follow the dots (9)" : "👀 Recalibrate (3 points)");
    beep(800, 100, "triangle");

    function drawPoint(p) {
      clearStage();
      c.ctx.beginPath();
      c.ctx.arc(p.x, p.y, R, 0, Math.PI * 2);
      c.ctx.fillStyle = "#22d3ee";
      c.ctx.fill();
      c.ctx.strokeStyle = "#e2e8f0";
      c.ctx.lineWidth = 2;
      c.ctx.beginPath();
      c.ctx.moveTo(p.x - 10, p.y);
      c.ctx.lineTo(p.x + 10, p.y);
      c.ctx.stroke();
      c.ctx.beginPath();
      c.ctx.moveTo(p.x, p.y - 10);
      c.ctx.lineTo(p.x, p.y + 10);
      c.ctx.stroke();
    }

    function showNext() {
      if (idx >= points.length) {
        clearStage();
        showToast("✨ Calibration done!");
        setStatus("Calibration complete");
        return;
      }
      const p = points[idx];
      logEvent("calib_point_start", { screen_x: p.x, screen_y: p.y });
      drawPoint(p);
      setTimeout(() => {
        logEvent("calib_point_end", { screen_x: p.x, screen_y: p.y });
        idx += 1;
        showNext();
      }, DOT_MS);
    }

    showNext();
  }

  function runCalibrationFun() {
    const c = getCanvas();
    if (!c) return;

    setCanvasClickHandler(null);

    setStatus("Calibration — Bubble Pop");
    showToast("🎈 Pop the bubbles!");
    beep(800, 100, "triangle");

    const bubbles = [];
    const colors = ["#60a5fa", "#22d3ee", "#f472b6", "#facc15", "#34d399", "#c084fc"];

    for (let i = 0; i < 9; i++) {
      bubbles.push({
        x: Math.random() * c.W * 0.8 + c.W * 0.1,
        y: Math.random() * c.H * 0.8 + c.H * 0.1,
        r: 26,
        c: colors[i % colors.length],
        vy: -(0.45 + Math.random() * 0.6),
      });
    }

    function draw() {
      clearStage();
      for (const b of bubbles) {
        b.y += b.vy;
        if (b.y < 40 || b.y > c.H - 40) b.vy *= -1;
        const g = c.ctx.createRadialGradient(b.x, b.y, 6, b.x, b.y, b.r + 14);
        g.addColorStop(0, b.c + "aa");
        g.addColorStop(1, "#00000011");
        c.ctx.fillStyle = g;
        c.ctx.beginPath();
        c.ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
        c.ctx.fill();
        c.ctx.lineWidth = 4;
        c.ctx.strokeStyle = "#ffffff22";
        c.ctx.stroke();
      }
    }

    function onClick(e) {
      const rect = c.canvas.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;

      for (let i = bubbles.length - 1; i >= 0; i--) {
        const b = bubbles[i];
        if ((mx - b.x) ** 2 + (my - b.y) ** 2 <= (b.r + 10) ** 2) {
          bubbles.splice(i, 1);
          beep(900, 120, "square", 0.08);
          break;
        }
      }

      if (bubbles.length === 0) {
        setCanvasClickHandler(null);
        stopLoop();
        clearStage();
        showToast("✨ Fun calibration done");
        setStatus("Calibration (fun) complete");
      }
    }

    setCanvasClickHandler(onClick);
    startLoop(draw);
  }

  function centerFixation(ctx, W, H) {
    ctx.fillStyle = "#93c5fd";
    ctx.font = "bold 44px system-ui";
    ctx.textAlign = "center";
    ctx.fillText("+", W / 2, H / 2);
  }

  // Prosaccade
  function runProsaccade() {
    const c = getCanvas();
    if (!c) return;

    setCanvasClickHandler(null);
    stopLoop();

    setStatus("Prosaccade — Catch the Red Fruit");
    showToast("🍓 Click the RED fruit!");
    beep(750, 120, "sine");

    const fruits = ["🍓", "🍋", "🍇", "🍏", "🍊", "🍍"];
    let current = null;
    let trials = 0;

    const TRIAL_MAX = 20;
    const FIX_MIN = 900;
    const FIX_MAX = 1200;
    const TARGET_DUR = 1400;
    const ITI = 500;

    const HIT_RADIUS = 58;
    const FORGIVENESS = 18;

    function rand(a, b) {
      return Math.floor(a + Math.random() * (b - a));
    }

    function spawn() {
      const trial_id = `P_${Date.now()}_${trials + 1}`;
      const left = Math.random() < 0.5;
      const x = left ? c.W * 0.22 : c.W * 0.78;
      const y = c.H * 0.55;
      const isRed = Math.random() < 0.6;
      const emoji = isRed ? "🍓" : fruits[Math.floor(Math.random() * fruits.length)];
      const t0 = performance.now();

      logEvent("trial_start", { task: "prosaccade", trial_id, side: left ? "left" : "right" });

      current = {
        trial_id,
        x,
        y,
        emoji,
        isRed,
        born: t0,
        phase: "fix",
        next: t0 + rand(FIX_MIN, FIX_MAX),
        t_on: null,
      };

      logEvent("fix_on", { trial_id });
    }

    function draw() {
      clearStage();
      centerFixation(c.ctx, c.W, c.H);

      if (!current) {
        spawn();
        return;
      }

      const t = performance.now();

      if (current.phase === "fix" && t >= current.next) {
        current.phase = "target";
        current.next = t + TARGET_DUR;
        current.t_on = t;

        logEvent("target_on", {
          trial_id: current.trial_id,
          x: Math.round(current.x),
          y: Math.round(current.y),
          isRed: current.isRed,
        });
      }

      if (current.phase === "target") {
        c.ctx.font = "72px serif";
        c.ctx.textAlign = "center";
        c.ctx.fillText(current.emoji, current.x, current.y);

        if (t >= current.next) {
          logEvent("trial_end", { trial_id: current.trial_id, reason: "timeout" });

          addTrialSummary({
            task: "prosaccade",
            trial_id: current.trial_id,
            side: current.x < c.W / 2 ? "left" : "right",
            correct: 0,
            hit: 0,
            rt_ms: "",
            end_reason: "timeout",
          });

          current = null;
          trials++;

          if (trials >= TRIAL_MAX) {
            finish();
            return;
          }

          const waitUntil = performance.now() + ITI;
          const waitLoop = () => {
            if (performance.now() < waitUntil) requestAnimationFrame(waitLoop);
            else spawn();
          };
          waitLoop();
        }
      }
    }

    function onClick(e) {
      if (!current || current.phase !== "target") return;

      const rect = c.canvas.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;

      const d = Math.hypot(mx - current.x, my - current.y);
      const inPrimary = d < HIT_RADIUS;
      const inForgiven = current.isRed && d < HIT_RADIUS + FORGIVENESS;
      const accepted = inPrimary || inForgiven;

      if (!accepted) return;

      const correct = current.isRed ? 1 : 0;
      const rt = current.t_on ? Math.round(performance.now() - current.t_on) : "";

      if (correct) {
        showToast("✅ Nice catch!");
        beep(880, 110, "triangle");
      } else {
        showToast("❌ Red only!");
        beep(300, 120, "sawtooth");
      }

      logEvent("response", { trial_id: current.trial_id, hit: 1, correct });
      logEvent("trial_end", { trial_id: current.trial_id, reason: "click" });

      addTrialSummary({
        task: "prosaccade",
        trial_id: current.trial_id,
        side: current.x < c.W / 2 ? "left" : "right",
        correct,
        hit: 1,
        rt_ms: rt,
        end_reason: "click",
      });

      current = null;
      trials++;

      if (trials >= TRIAL_MAX) {
        finish();
        return;
      }

      setTimeout(spawn, ITI);
    }

    function finish() {
      setCanvasClickHandler(null);
      stopLoop();
      clearStage();
      showToast("🍓 Prosaccade complete");
      setStatus("Prosaccade complete");
    }

    setCanvasClickHandler(onClick);
    startLoop(draw);
  }

  // Antisaccade
  function runAntisaccade() {
    const c = getCanvas();
    if (!c) return;

    setCanvasClickHandler(null);
    stopLoop();

    setStatus("Antisaccade — Opposite Treasure");
    showToast("👀 Look away from the alien — click the treasure!");
    beep(700, 130, "sine");

    let phase = "fix";
    let cueSideLeft = true;
    let cueAt = 0;
    let respAt = 0;
    let trials = 0;

    const TRIAL_MAX = 20;
    const alien = "👾";
    const treasure = "🪙";

    let trial_id = null;
    let t_target_on = null;

    function newTrial() {
      trials++;
      if (trials > TRIAL_MAX) {
        finish();
        return;
      }

      trial_id = `A_${Date.now()}_${trials}`;
      phase = "fix";
      cueSideLeft = Math.random() < 0.5;
      const t0 = performance.now();

      logEvent("trial_start", {
        task: "antisaccade",
        trial_id,
        cue_side: cueSideLeft ? "left" : "right",
      });

      logEvent("fix_on", { trial_id });

      cueAt = t0 + (700 + Math.random() * 400);
      respAt = 0;
      t_target_on = null;
    }

    function draw() {
      clearStage();
      centerFixation(c.ctx, c.W, c.H);

      const t = performance.now();

      if (phase === "fix" && t > cueAt) {
        phase = "cue";
        logEvent("cue_on", { trial_id, side: cueSideLeft ? "left" : "right" });
      }

      if (phase === "cue") {
        const x = cueSideLeft ? c.W * 0.25 : c.W * 0.75;
        const y = c.H * 0.55;

        c.ctx.font = "72px serif";
        c.ctx.textAlign = "center";
        c.ctx.fillText(alien, x, y);

        if (!respAt) respAt = t + 350;

        if (t > respAt) {
          phase = "resp";
          t_target_on = t;

          const tx = cueSideLeft ? c.W * 0.75 : c.W * 0.25;
          const ty = c.H * 0.55;

          logEvent("target_on", {
            trial_id,
            x: Math.round(tx),
            y: Math.round(ty),
          });
        }
      }

      if (phase === "resp") {
        const x = cueSideLeft ? c.W * 0.75 : c.W * 0.25;
        const y = c.H * 0.55;

        c.ctx.font = "72px serif";
        c.ctx.textAlign = "center";
        c.ctx.fillText(treasure, x, y);
      }
    }

    function onClick(e) {
      if (phase !== "resp") return;

      const rect = c.canvas.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;

      const tx = cueSideLeft ? c.W * 0.75 : c.W * 0.25;
      const ty = c.H * 0.55;

      const d = Math.hypot(mx - tx, my - ty);
      const TREASURE_RADIUS = 56;
      const FORGIVENESS = 16;

      const accepted = d < TREASURE_RADIUS + FORGIVENESS;
      const rt = t_target_on ? Math.round(performance.now() - t_target_on) : "";

      if (accepted) {
        showToast("🏆 Opposite — correct!");
        beep(880, 110, "triangle");
      } else {
        showToast("👾 That was the alien side!");
        beep(300, 120, "sawtooth");
      }

      logEvent("response", { trial_id, correct: accepted ? 1 : 0 });
      logEvent("trial_end", { trial_id, reason: "click" });

      addTrialSummary({
        task: "antisaccade",
        trial_id,
        cue_side: cueSideLeft ? "left" : "right",
        correct: accepted ? 1 : 0,
        rt_ms: rt,
        end_reason: "click",
      });

      setTimeout(newTrial, 450);
    }

    function finish() {
      setCanvasClickHandler(null);
      stopLoop();
      clearStage();
      showToast("👾 Antisaccade complete");
      setStatus("Antisaccade complete");
    }

    setCanvasClickHandler(onClick);
    startLoop(draw);
    newTrial();
  }

  // Free viewing — 10s
  function runFreeViewing() {
    const c = getCanvas();
    if (!c) return;

    setCanvasClickHandler(null);
    stopLoop();

    const DURATION_MS = 10000;
    setStatus("Free-Viewing — Relax (10s)");
    showToast("💤 Relax and watch the shapes");
    logEvent("free_view_start", {});
    const t0 = performance.now();

    function draw() {
      clearStage();
      const t = (performance.now() - t0) / 1000;

      for (let i = 0; i < 7; i++) {
        const x = Math.round((0.15 + 0.12 * i + 0.05 * Math.sin(t + i)) * c.W);
        const y = Math.round((0.3 + 0.22 * Math.cos(t * 0.9 + i)) * c.H);
        const r = 26 + 10 * Math.sin(t * 1.4 + i);
        const hue = 180 + i * 30;

        c.ctx.fillStyle = `hsl(${hue},70%,60%)`;
        c.ctx.beginPath();
        c.ctx.arc(x, y, r, 0, Math.PI * 2);
        c.ctx.fill();
      }
    }

    startLoop(draw);

    setTimeout(() => {
      stopLoop();
      clearStage();
      showToast("✅ Free-Viewing complete");
      setStatus("Free-Viewing complete");
      logEvent("free_view_end", {});
    }, DURATION_MS);
  }

  // Fixation stability
  function runFixationStability() {
    const c = getCanvas();
    if (!c) return;

    setCanvasClickHandler(null);
    stopLoop();

    const DURATION_MS = 15000;
    setStatus("Fixation Stability — 15s");
    showToast("🎯 Keep your eyes on the +");
    logEvent("fix_stability_start", { duration_ms: DURATION_MS });
    const t0 = performance.now();

    function draw() {
      clearStage();
      centerFixation(c.ctx, c.W, c.H);
    }

    startLoop(draw);

    setTimeout(() => {
      stopLoop();
      clearStage();
      logEvent("fix_stability_end", { elapsed_ms: Math.round(performance.now() - t0) });
      showToast("✅ Fixation stability done");
      setStatus("Fixation stability complete");
    }, DURATION_MS);
  }

  // Smooth pursuit
  function runSmoothPursuit() {
    const c = getCanvas();
    if (!c) return;

    setCanvasClickHandler(null);
    stopLoop();

    const DURATION_MS = 20000;
    const AMP = 0.35;
    const FREQ = 0.4;
    const R = 12;
    const logEvery = 50;
    let lastLog = 0;

    setStatus("Smooth Pursuit — 20s");
    showToast("🟡 Follow the moving dot");
    logEvent("pursuit_start", { duration_ms: DURATION_MS, freq_hz: FREQ, amp_ratio: AMP });
    const t0 = performance.now();

    function draw() {
      clearStage();
      const t = (performance.now() - t0) / 1000;

      const x = Math.round(c.W / 2 + Math.sin(2 * Math.PI * FREQ * t) * (c.W * AMP));
      const y = Math.round(c.H * 0.55);

      c.ctx.beginPath();
      c.ctx.arc(x, y, R, 0, Math.PI * 2);
      c.ctx.fillStyle = "#facc15";
      c.ctx.fill();

      const nowMs = performance.now();
      if (nowMs - lastLog >= logEvery) {
        lastLog = nowMs;
        logEvent("pursuit_pos", { x, y, t_ms: Math.round(nowMs - t0) });
      }
    }

    startLoop(draw);

    setTimeout(() => {
      stopLoop();
      clearStage();
      logEvent("pursuit_end", { elapsed_ms: Math.round(performance.now() - t0) });
      showToast("✅ Pursuit done");
      setStatus("Pursuit complete");
    }, DURATION_MS);
  }

  // Pupil light reflex
  function runPLR() {
    const c = getCanvas();
    if (!c) return;

    setCanvasClickHandler(null);
    stopLoop();

    const CYCLES = 3;
    const DARK_MS = 2000;
    const BRIGHT_MS = 2000;
    const totalMS = CYCLES * (DARK_MS + BRIGHT_MS);

    setStatus("Pupil Light Reflex — ~12s");
    showToast("💡 Look at the screen");
    logEvent("plr_start", { cycles: CYCLES, dark_ms: DARK_MS, bright_ms: BRIGHT_MS });

    let phase = "dark";
    let phaseEnd = performance.now() + DARK_MS;

    function draw() {
      clearStage();

      c.ctx.fillStyle = phase === "dark" ? "#0b0b0b" : "#ffffff";
      c.ctx.fillRect(0, 0, c.W, c.H);

      c.ctx.fillStyle = phase === "dark" ? "#222" : "#ddd";
      c.ctx.fillRect(c.W - 30, c.H - 30, 24, 24);

      if (performance.now() >= phaseEnd) {
        if (phase === "dark") {
          phase = "bright";
          phaseEnd = performance.now() + BRIGHT_MS;
          logEvent("plr_step", { phase: "bright" });
          beep(900, 80, "sine", 0.05);
        } else {
          phase = "dark";
          phaseEnd = performance.now() + DARK_MS;
          logEvent("plr_step", { phase: "dark" });
          beep(600, 80, "sine", 0.05);
        }
      }
    }

    logEvent("plr_step", { phase: "dark" });
    startLoop(draw);

    setTimeout(() => {
      stopLoop();
      clearStage();
      logEvent("plr_end", { total_ms: totalMS });
      showToast("✅ PLR done");
      setStatus("PLR complete");
    }, totalMS);
  }

  return (
    <div className="app">
      <aside className="left">
        <h2 className="h">🎮 ADHD Eye Tasks</h2>
        <button className="btn ghost" onClick={goBack}>
        ⬅️ Back
        </button>
        <p className="legend">
          We record the <strong>webcam</strong> (face) and optionally the{" "}
          <strong>screen</strong>. Child never sees their own video.
        </p>

        <div className="legend" style={{ margin: "8px 0 6px" }}>
          Participant &amp; Session
        </div>

        <div className="row">
          <input
            value={participantId}
            onChange={(e) => setParticipantId(e.target.value)}
            placeholder="Participant ID (e.g., SCH01_P003)"
          />
        </div>

        <div className="row">
          <select value={cohort} onChange={(e) => setCohort(e.target.value)}>
            <option value="">Cohort</option>
            <option>Control</option>
            <option>ADHD</option>
            <option>Unknown</option>
          </select>
          <input
            type="number"
            min="3"
            max="18"
            value={age}
            onChange={(e) => setAge(e.target.value)}
            placeholder="Age"
          />
        </div>

        <div className="row">
          <input
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Notes (lighting, distance ~50–60cm)"
          />
        </div>

        <button className="btn" onClick={startCamera}>
          🎥 Start Camera &amp; Recording
        </button>

        <button className="btn ghost" onClick={startScreen} disabled={!recCam}>
          🖥️ Start Screen Recording (optional)
        </button>

        <button className="btn ghost" onClick={goFullscreen}>
          ⛶ Go Fullscreen (recommended)
        </button>

        <div className="row">
          <button className="btn secondary" onClick={syncFlash} disabled={!recCam}>
            ⚡ Sync Flash + Beep
          </button>

          <button
            className="btn ghost"
            onClick={() => {
              logEvent("drift_marker", {});
              showToast("📍 Drift marker saved");
            }}
            disabled={!recCam}
          >
            📍 Mark Drift/Recal
          </button>
        </div>

        <div className="taskbar">
          <button
            className="btn secondary"
            onClick={() => runCalibFixed(calibrationGrid(9))}
            disabled={!recCam}
          >
            🔵 Calibration — 9-Point (ground truth)
          </button>

          <button
            className="btn secondary"
            onClick={() => runCalibFixed(calibrationGrid(3))}
            disabled={!recCam}
          >
            🔵 Re-Calibration — 3-Point
          </button>

          <button className="btn secondary" onClick={runCalibrationFun} disabled={!recCam}>
            🎈 Calibration — Bubble Pop (fun)
          </button>

          <button className="btn secondary" onClick={runProsaccade} disabled={!recCam}>
            🍓 Prosaccade — Catch the Red Fruit
          </button>

          <button className="btn secondary" onClick={runAntisaccade} disabled={!recCam}>
            👾 Antisaccade — Opposite Treasure
          </button>

          <button className="btn secondary" onClick={runFreeViewing} disabled={!recCam}>
            💤 Free-Viewing — Relax (10s)
          </button>

          <button className="btn secondary" onClick={runFixationStability} disabled={!recCam}>
            🎯 Fixation Stability — 15s
          </button>

          <button className="btn secondary" onClick={runSmoothPursuit} disabled={!recCam}>
            🟡 Smooth Pursuit — 20s
          </button>

          <button className="btn secondary" onClick={runPLR} disabled={!recCam}>
            💡 Pupil Light Reflex — 12s
          </button>
        </div>

        <button className="btn warn" onClick={stopAll} disabled={!recCam && !recScreen}>
          ⏹ Stop &amp; Save All
        </button>

        <div className="status" style={{ marginTop: 10 }}>
          <div>
            <strong>Status:</strong> <span>{status}</span>
          </div>
          <div>
            Webcam rec: <span className="pill">{recCam ? "on" : "off"}</span>
          </div>
          <div>
            Screen rec: <span className="pill">{recScreen ? "on" : "off"}</span>
          </div>
          <div>
            Video format: <span className="pill">{format}</span>
          </div>
        </div>

        <div id="previewBox" className="status">
          <div className="labelRow">
            <input
              type="checkbox"
              id="togglePreview"
              onChange={(e) => {
                if (!liveThumbRef.current) return;
                liveThumbRef.current.style.display = e.target.checked ? "block" : "none";
              }}
            />
            <label htmlFor="togglePreview">
              <strong>Show live preview</strong>
            </label>
          </div>

          <video id="liveThumb" ref={liveThumbRef} autoPlay playsInline muted></video>

          <div className="legend small" style={{ marginTop: 6 }}>
            Lighting: <span className="pill">—</span>
            <span className="pill">
              avg <span>—</span>
            </span>
          </div>
        </div>

        <div style={{ marginTop: 12 }}>
          <div className="legend">
            <strong>Tips</strong>
          </div>
          <ul className="legend">
            <li>Even lighting, child ~50–60 cm from screen.</li>
            <li>Face centered in webcam; avoid backlight.</li>
            <li>Short breaks are okay.</li>
          </ul>
          <div className="legend small">
            <span className="tag">🔵 9-pt = mapping</span>
            <span className="tag">⚡ sync = align timelines</span>
            <span className="tag">📄 CSV+JSON logs</span>
          </div>
        </div>
      </aside>

      <main className="right" ref={stageWrapRef} id="stageWrap">
        <video id="preview" ref={videoRef} autoPlay muted playsInline />
        <video id="screenPrev" ref={screenRef} autoPlay muted playsInline />
        <canvas id="stage" ref={canvasRef}></canvas>
        {toastVisible && <div className="toast">{toastMsg}</div>}
      </main>
    </div>
  );
}