// File: src/pages/eyetrack/game/ChildEyeGame.jsx
import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./eyecollect.css";

/**
 * ChildEyeGame.jsx
 * Under-8 interactive version:
 * - No participant details / cohort / age
 * - No calibration / re-calibration / free-viewing / PLR
 * - Auto flow: Instruction image -> Play -> Task -> next instruction...
 * - Camera records during the whole session
 * - Toggleable small camera preview (OFF by default)
 * - Back button with safe cleanup
 * - Prosaccade has Correct / Missed counters
 * - After last game ends: auto downloads camera video + logs JSON
 *
 * Instruction images:
 *   /public/instuction1.jpg
 *   /public/instuction2.jpg
 *   /public/instuction3.jpg
 *   ...
 */

export default function ChildEyeGame() {
  const navigate = useNavigate();

  // Stage / canvas
  const stageWrapRef = useRef(null);
  const canvasRef = useRef(null);

  // Camera preview (hidden by default) + recording
  const videoRef = useRef(null);
  const camStreamRef = useRef(null);
  const camRecorderRef = useRef(null);
  const camChunksRef = useRef([]);
  const sessionPrefixRef = useRef(null);

  // Audio + loop
  const audioCtxRef = useRef(null);
  const rafRef = useRef(null);
  const runningRef = useRef(false);

  // Canvas size
  const canvasSizeRef = useRef({ w: 0, h: 0 });

  // Click handler management
  const canvasClickHandlerRef = useRef(null);

  // UI state
  const [status, setStatus] = useState("Idle");
  const [toastMsg, setToastMsg] = useState("");
  const [toastVisible, setToastVisible] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [recCam, setRecCam] = useState(false);

  // Prosaccade counters
  const [hitCount, setHitCount] = useState(0);
  const [missCount, setMissCount] = useState(0);

  // File uploader state
  const [generatedFiles, setGeneratedFiles] = useState([]); // { id, name, file, type, sizeBytes }
  const [selectedGeneratedIds, setSelectedGeneratedIds] = useState(new Set());
  const [uploadQueue, setUploadQueue] = useState([]);

  // Flow state: instruction -> playing
  // We show instruction image + "Play Next" before each task starts.
  const [flowMode, setFlowMode] = useState("idle"); // "idle" | "instruction" | "playing" | "done"
  const [stepIndex, setStepIndex] = useState(0);

  // Tasks pipeline (only the ones you requested)
  const stepsRef = useRef([
    {
      key: "prosaccade",
      name: "Catch the RED fruit",
      instructionImg: "/instuction1.jpg",
    },
    {
      key: "antisaccade",
      name: "Opposite treasure",
      instructionImg: "/instuction2.jpg",
    },
    {
      key: "fixation",
      name: "Look at the +",
      instructionImg: "/instuction3.jpg",
    },
    {
      key: "pursuit",
      name: "Follow the moving dot",
      instructionImg: "/instuction4.jpg",
    },
  ]);

  // Simple logs (child version)
  const logsRef = useRef({
    meta: {},
    events: [],
    trials: [],
  });

  function logEvent(type, payload = {}) {
    logsRef.current.events.push({
      t_ms: Math.round(performance.now()),
      type,
      payload,
    });
  }

  function addTrialSummary(entry) {
    logsRef.current.trials.push(entry);
  }

  function showToast(msg, ms = 1400) {
    setToastMsg(msg);
    setToastVisible(true);
    window.setTimeout(() => setToastVisible(false), ms);
  }

  // ---------- Utility helpers ----------
  function formatBytes(bytes) {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  }

  function blobToFile(blob, filename, mimeType) {
    return new File([blob], filename, { type: mimeType });
  }

  // ---------- Canvas helpers ----------
  function setCanvasClickHandler(handler) {
    const canvas = canvasRef.current;
    if (!canvas) return;

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
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
    canvasSizeRef.current = { w: canvas.width, h: canvas.height };
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

  // ---------- Loop ----------
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

  // ---------- Audio ----------
  useEffect(() => {
    audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
    return () => {
      try {
        audioCtxRef.current?.close?.();
      } catch {}
    };
  }, []);

  function beep(freq = 700, ms = 120, type = "sine", vol = 0.12) {
    const actx = audioCtxRef.current;
    if (!actx) return;
    try {
      if (actx.state === "suspended") actx.resume();
    } catch {}

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

  // ---------- Resize ----------
  useEffect(() => {
    function fit() {
      forceFitCanvas();
    }
    fit();
    window.addEventListener("resize", fit);
    return () => window.removeEventListener("resize", fit);
  }, []);

  // ---------- Camera recording ----------
  async function startCameraRecording() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 1280 }, height: { ideal: 720 }, frameRate: { ideal: 30, max: 30 } },
        audio: false,
      });

      camStreamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      // Determine best supported mime type
      const mimeOptions = [
        "video/mp4;codecs=avc1",
        "video/mp4;codecs=h264",
        "video/webm;codecs=vp9",
        "video/webm;codecs=vp8",
        "video/webm",
      ];

      let chosenMime = "video/webm"; // fallback
      for (const mime of mimeOptions) {
        if (MediaRecorder.isTypeSupported(mime)) {
          chosenMime = mime;
          break;
        }
      }

      const recorder = new MediaRecorder(stream, { mimeType: chosenMime });
      camRecorderRef.current = recorder;
      camChunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size) camChunksRef.current.push(e.data);
      };

      recorder.onstart = () => {
        setRecCam(true);
        logEvent("cam_rec_start", {});
      };

      recorder.onstop = () => {
        setRecCam(false);
        logEvent("cam_rec_stop", {});

        // Download video only after recorder fully stops
        if (camChunksRef.current.length) {
          const blob = new Blob(camChunksRef.current, { type: chosenMime });
          // Determine file extension based on mime type
          const ext = chosenMime.includes("mp4") ? "mp4" : "webm";
          const filename = `${sessionPrefixRef.current}_cam.${ext}`;
          downloadBlob(blob, filename);

          // Create File object and add to generatedFiles
          const fileObj = blobToFile(blob, filename, chosenMime);
          const fileId = `video_${Date.now()}`;
          const newFile = {
            id: fileId,
            name: filename,
            file: fileObj,
            type: "video",
            sizeBytes: blob.size,
          };
          setGeneratedFiles((prev) => [...prev, newFile]);
          setSelectedGeneratedIds((prev) => new Set([...prev, fileId]));
        }
      };

      recorder.start();
      setStatus("Camera recording ON");
      showToast("🎥 Camera started");
    } catch (e) {
      console.error(e);
      alert("Camera permission needed to play.");
    }
  }

  function stopCameraRecording() {
    try {
      if (camRecorderRef.current?.state === "recording") camRecorderRef.current.stop();
    } catch {}

    try {
      camStreamRef.current?.getTracks()?.forEach((t) => t.stop());
      camStreamRef.current = null;
    } catch {}
  }

  // ---------- Downloads ----------
  function buildPrefix() {
    if (sessionPrefixRef.current) return sessionPrefixRef.current;
    const d = new Date();
    const ds = d.toISOString().slice(0, 19).replace(/[:T]/g, "-");
    sessionPrefixRef.current = `CHILD_${ds}`;
    return sessionPrefixRef.current;
  }

  function downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  function downloadText(text, filename, type = "text/plain") {
    const blob = new Blob([text], { type });
    downloadBlob(blob, filename);
  }

  // ---------- CSV Generators ----------
  function generateEventsCSV() {
    const events = logsRef.current.events;
    if (!events || events.length === 0) {
      return "t_ms,type\n";
    }

    // Collect all unique payload keys
    const payloadKeys = new Set();
    events.forEach((evt) => {
      if (evt.payload && typeof evt.payload === "object") {
        Object.keys(evt.payload).forEach((k) => payloadKeys.add(k));
      }
    });

    const sortedPayloadKeys = Array.from(payloadKeys).sort();
    const headers = ["t_ms", "type", ...sortedPayloadKeys];
    const rows = [headers.join(",")];

    events.forEach((evt) => {
      const values = [evt.t_ms, evt.type];
      sortedPayloadKeys.forEach((key) => {
        const val = evt.payload?.[key] ?? "";
        let strVal = String(val);
        if (typeof evt.payload?.[key] === "object") {
          strVal = JSON.stringify(evt.payload[key]);
        }
        // Escape quotes in CSV
        if (strVal.includes('"') || strVal.includes(",") || strVal.includes("\n")) {
          strVal = '"' + strVal.replace(/"/g, '""') + '"';
        }
        values.push(strVal);
      });
      rows.push(values.join(","));
    });

    return rows.join("\n");
  }

  function generateTrialsCSV() {
    const trials = logsRef.current.trials;
    if (!trials || trials.length === 0) {
      return "";
    }

    // Collect all unique keys across all trial objects
    const allKeys = new Set();
    trials.forEach((trial) => {
      Object.keys(trial).forEach((k) => allKeys.add(k));
    });

    const sortedKeys = Array.from(allKeys).sort();
    const headers = sortedKeys;
    const rows = [headers.join(",")];

    trials.forEach((trial) => {
      const values = sortedKeys.map((key) => {
        const val = trial[key] ?? "";
        let strVal = String(val);
        // Escape quotes in CSV
        if (strVal.includes('"') || strVal.includes(",") || strVal.includes("\n")) {
          strVal = '"' + strVal.replace(/"/g, '""') + '"';
        }
        return strVal;
      });
      rows.push(values.join(","));
    });

    return rows.join("\n");
  }

  function generateSessionCSV(finalHitCount, finalMissCount) {
    const meta = logsRef.current.meta;
    const summaryData = {
      ...meta,
      total_events: logsRef.current.events.length,
      total_trials: logsRef.current.trials.length,
      hitCount: finalHitCount,
      missCount: finalMissCount,
      ended_at_iso: new Date().toISOString(),
    };

    const allKeys = Object.keys(summaryData).sort();
    const headers = allKeys;
    const values = allKeys.map((key) => {
      const val = summaryData[key] ?? "";
      let strVal = String(val);
      // Escape quotes in CSV
      if (strVal.includes('"') || strVal.includes(",") || strVal.includes("\n")) {
        strVal = '"' + strVal.replace(/"/g, '""') + '"';
      }
      return strVal;
    });

    return headers.join(",") + "\n" + values.join(",");
  }

  function generateSessionJSON(finalHitCount, finalMissCount) {
    const meta = logsRef.current.meta;
    const summaryData = {
      ...meta,
      total_events: logsRef.current.events.length,
      total_trials: logsRef.current.trials.length,
      hitCount: finalHitCount,
      missCount: finalMissCount,
      ended_at_iso: new Date().toISOString(),
    };

    return JSON.stringify(summaryData, null, 2);
  }

  // ---------- Navigation / Back ----------
  function hardStopEverything() {
    try {
      setCanvasClickHandler(null);
      stopLoop();
      clearStage();
    } catch {}
    stopCameraRecording();
  }

  function goBack() {
    hardStopEverything();
    navigate(-1);
  }

  // ---------- UI helpers ----------
  function centerFixation(ctx, W, H) {
    ctx.fillStyle = "#93c5fd";
    ctx.font = "bold 64px system-ui";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("+", W / 2, H / 2);
  }

  // ---------- Flow control ----------
  function initSessionMeta() {
    const { w, h } = canvasSizeRef.current;
    // Build prefix early to ensure all files share the same timestamp
    buildPrefix();
    logsRef.current.meta = {
      app: "ChildEyeGame",
      stage_w: w,
      stage_h: h,
      dpr: window.devicePixelRatio || 1,
      user_agent: navigator.userAgent,
      started_at_iso: new Date().toISOString(),
    };
  }

  async function startSession() {
    // Prepare
    forceFitCanvas();
    initSessionMeta();
    logsRef.current.events = [];
    logsRef.current.trials = [];

    setHitCount(0);
    setMissCount(0);

    logEvent("session_start", {});
    await startCameraRecording();

    setStepIndex(0);
    setFlowMode("instruction");
    setStatus("Ready");
    showToast("🎮 Ready to play!");
  }

  function currentStep() {
    return stepsRef.current[stepIndex] || null;
  }

  function showInstructionForIndex(i) {
    setStepIndex(i);
    setFlowMode("instruction");
    setStatus(`Instruction: ${stepsRef.current[i]?.name || ""}`);
    clearStage();
    setCanvasClickHandler(null);
    stopLoop();
  }

  function playNext() {
    const step = currentStep();
    if (!step) return;

    setFlowMode("playing");
    setStatus(`Playing: ${step.name}`);
    logEvent("task_start", { task: step.key, step: stepIndex });

    // Launch correct game
    if (step.key === "prosaccade") runProsaccade();
    else if (step.key === "antisaccade") runAntisaccade();
    else if (step.key === "fixation") runFixationStability();
    else if (step.key === "pursuit") runSmoothPursuit();
  }

  function endTaskAndAdvance(taskKey) {
    logEvent("task_end", { task: taskKey, step: stepIndex });

    const nextIndex = stepIndex + 1;
    if (nextIndex >= stepsRef.current.length) {
      finishSession();
      return;
    }

    // show next instruction screen
    showInstructionForIndex(nextIndex);
    showToast("➡️ Next game!");
  }

  function finishSession() {
    setFlowMode("done");
    setStatus("All games complete");
    logEvent("session_end", {});
    hardStopEverything();

    // Capture final counter values
    const finalHitCount = hitCount;
    const finalMissCount = missCount;

    // Generate all outputs
    const eventsCSV = generateEventsCSV();
    const trialsCSV = generateTrialsCSV();
    const sessionJSON = generateSessionJSON(finalHitCount, finalMissCount);

    const prefix = sessionPrefixRef.current;

    // Download and store events.csv
    const eventsFilename = `${prefix}_events.csv`;
    downloadText(eventsCSV, eventsFilename, "text/csv");
    const eventsFile = new File([eventsCSV], eventsFilename, { type: "text/csv" });
    const eventsFileId = `events_${Date.now()}`;

    // Download and store trials.csv
    const trialsFilename = `${prefix}_trials.csv`;
    downloadText(trialsCSV, trialsFilename, "text/csv");
    const trialsFile = new File([trialsCSV], trialsFilename, { type: "text/csv" });
    const trialsFileId = `trials_${Date.now()}`;

    // Download and store session.json
    const sessionFilename = `${prefix}_session.json`;
    downloadText(sessionJSON, sessionFilename, "application/json");
    const sessionFile = new File([sessionJSON], sessionFilename, { type: "application/json" });
    const sessionFileId = `session_${Date.now()}`;

    // Add CSV and JSON files to generated files
    const newGeneratedFiles = [
      {
        id: eventsFileId,
        name: eventsFilename,
        file: eventsFile,
        type: "csv",
        sizeBytes: eventsFile.size,
      },
      {
        id: trialsFileId,
        name: trialsFilename,
        file: trialsFile,
        type: "csv",
        sizeBytes: trialsFile.size,
      },
      {
        id: sessionFileId,
        name: sessionFilename,
        file: sessionFile,
        type: "json",
        sizeBytes: sessionFile.size,
      },
    ];

    setGeneratedFiles(newGeneratedFiles);
    setSelectedGeneratedIds(new Set([eventsFileId, trialsFileId, sessionFileId]));

    // Stop the recorder; onstop will download the video and add it to generatedFiles
    if (camRecorderRef.current?.state === "recording") {
      camRecorderRef.current.stop();
    }

    showToast("✅ Downloaded all files");
  }

  // ---------- Uploader management ----------
  function toggleGeneratedFileSelection(id) {
    setSelectedGeneratedIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  }

  function addSelectedToUploader() {
    const selected = generatedFiles.filter((f) => selectedGeneratedIds.has(f.id));
    if (selected.length === 0) {
      showToast("⚠️ Select files first");
      return;
    }
    setUploadQueue(selected);
    showToast(`📋 Added ${selected.length} file(s)`);
  }

  function clearUploadQueue() {
    setUploadQueue([]);
    showToast("🗑️ Queue cleared");
  }

  function sendToBackend() {
    console.log("Upload queue:", uploadQueue);
    showToast("📤 Prepared for upload (backend later)");
  }

  function runProsaccade() {
    const c = getCanvas();
    if (!c) return;

    // reset counters for this game only (if you want overall, remove these)
    setHitCount(0);
    setMissCount(0);

    setCanvasClickHandler(null);
    stopLoop();

    showToast("🍓 Catch the RED fruit!");
    beep(750, 120, "sine");

    const fruits = ["🍓", "🍋", "🍇", "🍏", "🍊", "🍍"];
    let current = null;
    let trials = 0;

    const TRIAL_MAX = 12; // shorter for <8
    const FIX_MIN = 600;
    const FIX_MAX = 900;
    const TARGET_DUR = 1200;
    const ITI = 450;

    const HIT_RADIUS = 70;
    const FORGIVENESS = 20;

    function rand(a, b) {
      return Math.floor(a + Math.random() * (b - a));
    }

    function spawn() {
      const trial_id = `P_${Date.now()}_${trials + 1}`;
      const left = Math.random() < 0.5;
      const x = left ? c.W * 0.22 : c.W * 0.78;
      const y = c.H * 0.56;
      const isRed = Math.random() < 0.6;
      const emoji = isRed ? "🍓" : fruits[Math.floor(Math.random() * fruits.length)];
      const t0 = performance.now();

      current = {
        trial_id,
        x,
        y,
        emoji,
        isRed,
        phase: "fix",
        next: t0 + rand(FIX_MIN, FIX_MAX),
        t_on: null,
      };

      logEvent("trial_start", { task: "prosaccade", trial_id, side: left ? "left" : "right" });
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
        c.ctx.font = "92px serif";
        c.ctx.textAlign = "center";
        c.ctx.textBaseline = "middle";
        c.ctx.fillText(current.emoji, current.x, current.y);

        // timeout = miss if red
        if (t >= current.next) {
          const missed = current.isRed ? 1 : 0;
          if (missed) setMissCount((m) => m + 1);

          addTrialSummary({
            task: "prosaccade",
            trial_id: current.trial_id,
            side: current.x < c.W / 2 ? "left" : "right",
            correct: 0,
            hit: 0,
            rt_ms: "",
            end_reason: "timeout",
          });

          logEvent("trial_end", { trial_id: current.trial_id, reason: "timeout" });

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

      // if click not near target: count as miss only for red trials (encourage accurate tapping)
      if (!accepted) {
        if (current.isRed) {
          setMissCount((m) => m + 1);
          showToast("😢 Missed!");
          beep(280, 120, "sawtooth", 0.08);
        }
        return;
      }

      const correct = current.isRed ? 1 : 0;
      const rt = current.t_on ? Math.round(performance.now() - current.t_on) : "";

      if (correct) {
        setHitCount((c) => c + 1);
        showToast("🎉 Great!");
        beep(880, 110, "triangle", 0.12);
      } else {
        setMissCount((m) => m + 1);
        showToast("❌ Red only!");
        beep(300, 120, "sawtooth", 0.1);
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
      showToast("✅ Finished!");
      setStatus("Prosaccade complete");
      endTaskAndAdvance("prosaccade");
    }

    setCanvasClickHandler(onClick);
    startLoop(draw);
  }

  function runAntisaccade() {
    const c = getCanvas();
    if (!c) return;

    setCanvasClickHandler(null);
    stopLoop();

    showToast("👀 Click the treasure (opposite side)");
    beep(700, 130, "sine");

    let phase = "fix";
    let cueSideLeft = true;
    let cueAt = 0;
    let respAt = 0;
    let trials = 0;

    const TRIAL_MAX = 10; // shorter
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

      logEvent("trial_start", { task: "antisaccade", trial_id, cue_side: cueSideLeft ? "left" : "right" });
      logEvent("fix_on", { trial_id });

      cueAt = t0 + (600 + Math.random() * 300);
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
        const y = c.H * 0.56;

        c.ctx.font = "90px serif";
        c.ctx.textAlign = "center";
        c.ctx.textBaseline = "middle";
        c.ctx.fillText(alien, x, y);

        if (!respAt) respAt = t + 320;

        if (t > respAt) {
          phase = "resp";
          t_target_on = t;

          const tx = cueSideLeft ? c.W * 0.75 : c.W * 0.25;
          const ty = c.H * 0.56;

          logEvent("target_on", { trial_id, x: Math.round(tx), y: Math.round(ty) });
        }
      }

      if (phase === "resp") {
        const x = cueSideLeft ? c.W * 0.75 : c.W * 0.25;
        const y = c.H * 0.56;

        c.ctx.font = "90px serif";
        c.ctx.textAlign = "center";
        c.ctx.textBaseline = "middle";
        c.ctx.fillText(treasure, x, y);
      }
    }

    function onClick(e) {
      if (phase !== "resp") return;

      const rect = c.canvas.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;

      const tx = cueSideLeft ? c.W * 0.75 : c.W * 0.25;
      const ty = c.H * 0.56;

      const d = Math.hypot(mx - tx, my - ty);
      const TREASURE_RADIUS = 70;
      const accepted = d < TREASURE_RADIUS;

      const rt = t_target_on ? Math.round(performance.now() - t_target_on) : "";

      if (accepted) {
        showToast("🏆 Correct!");
        beep(880, 110, "triangle");
      } else {
        showToast("👾 Try opposite side!");
        beep(300, 120, "sawtooth", 0.1);
      }

      logEvent("response", { trial_id, correct: accepted ? 1 : 0, rt_ms: rt });
      logEvent("trial_end", { trial_id, reason: "click" });

      addTrialSummary({
        task: "antisaccade",
        trial_id,
        cue_side: cueSideLeft ? "left" : "right",
        correct: accepted ? 1 : 0,
        rt_ms: rt,
        end_reason: "click",
      });

      setTimeout(newTrial, 420);
    }

    function finish() {
      setCanvasClickHandler(null);
      stopLoop();
      clearStage();
      showToast("✅ Finished!");
      setStatus("Antisaccade complete");
      endTaskAndAdvance("antisaccade");
    }

    setCanvasClickHandler(onClick);
    startLoop(draw);
    newTrial();
  }

  function runFixationStability() {
    const c = getCanvas();
    if (!c) return;

    setCanvasClickHandler(null);
    stopLoop();

    const DURATION_MS = 8000; // shorter for kids
    setStatus("Fixation — 8s");
    showToast("🎯 Look at the +");
    logEvent("fix_start", { duration_ms: DURATION_MS });

    const t0 = performance.now();

    function draw() {
      clearStage();
      centerFixation(c.ctx, c.W, c.H);
    }

    startLoop(draw);

    setTimeout(() => {
      stopLoop();
      clearStage();
      logEvent("fix_end", { elapsed_ms: Math.round(performance.now() - t0) });
      showToast("✅ Good job!");
      setStatus("Fixation complete");
      endTaskAndAdvance("fixation");
    }, DURATION_MS);
  }

  function runSmoothPursuit() {
    const c = getCanvas();
    if (!c) return;

    setCanvasClickHandler(null);
    stopLoop();

    const DURATION_MS = 12000; // shorter
    const AMP = 0.35;
    const FREQ = 0.35;
    const R = 14;

    setStatus("Pursuit — 12s");
    showToast("🟡 Follow the dot");
    logEvent("pursuit_start", { duration_ms: DURATION_MS, freq_hz: FREQ, amp_ratio: AMP });

    const t0 = performance.now();

    function draw() {
      clearStage();
      const t = (performance.now() - t0) / 1000;

      const x = Math.round(c.W / 2 + Math.sin(2 * Math.PI * FREQ * t) * (c.W * AMP));
      const y = Math.round(c.H * 0.56);

      c.ctx.beginPath();
      c.ctx.arc(x, y, R, 0, Math.PI * 2);
      c.ctx.fillStyle = "#facc15";
      c.ctx.fill();
    }

    startLoop(draw);

    setTimeout(() => {
      stopLoop();
      clearStage();
      logEvent("pursuit_end", { elapsed_ms: Math.round(performance.now() - t0) });
      showToast("✅ Great!");
      setStatus("Pursuit complete");
      endTaskAndAdvance("pursuit");
    }, DURATION_MS);
  }

  // ---------- Fullscreen ----------
  async function goFullscreen() {
    const el = stageWrapRef.current;
    if (!el) return;
    try {
      if (el.requestFullscreen) await el.requestFullscreen();
      else if (el.webkitRequestFullscreen) await el.webkitRequestFullscreen();

      setTimeout(() => {
        forceFitCanvas();
        window.dispatchEvent(new Event("resize"));
      }, 200);
    } catch (e) {
      console.warn("Fullscreen failed:", e);
    }
  }

  // ---------- Initial entry: show instruction 1 after start ----------
  useEffect(() => {
    if (flowMode === "instruction") {
      // make sure canvas is not animating behind the instruction
      setCanvasClickHandler(null);
      stopLoop();
      clearStage();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [flowMode, stepIndex]);

  const step = currentStep();

  return (
    <div className="app">
      <aside className="left">
        <h2 className="h">🧒 Child Eye Game (Under 8)</h2>

        <div className="row" style={{ gap: 10 }}>
          <button className="btn ghost" onClick={goBack}>
            ⬅️ Back
          </button>

          <button className="btn ghost" onClick={goFullscreen}>
            ⛶ Fullscreen
          </button>
        </div>

        <div className="status" style={{ marginTop: 10 }}>
          <div>
            <strong>Status:</strong> <span>{status}</span>
          </div>
          <div>
            Camera rec: <span className="pill">{recCam ? "on" : "off"}</span>
          </div>
        </div>

        <div className="status" style={{ marginTop: 10 }}>
          <div className="labelRow">
            <input
              type="checkbox"
              checked={showPreview}
              onChange={(e) => setShowPreview(e.target.checked)}
              id="togglePreviewChild"
            />
            <label htmlFor="togglePreviewChild">
              <strong>Show camera preview</strong>
            </label>
          </div>

          <div className="legend small" style={{ marginTop: 6 }}>
            Preview is for parent/teacher only.
          </div>
        </div>

        {/* Prosaccade scoreboard visible always (only meaningful for that game) */}
        <div className="status" style={{ marginTop: 10 }}>
          <div>✅ Correct: <strong>{hitCount}</strong></div>
          <div>❌ Missed: <strong>{missCount}</strong></div>
        </div>

        {/* File Uploader Section - visible after session finishes */}
        {(generatedFiles.length > 0 || uploadQueue.length > 0) && (
          <div className="status" style={{ marginTop: 12, borderTop: "1px solid rgba(255,255,255,.2)", paddingTop: 12 }}>
            <div className="legend" style={{ marginBottom: 10 }}>
              <strong>Uploads</strong>
            </div>

            {/* Generated files list with checkboxes */}
            {generatedFiles.length > 0 && (
              <div style={{ marginBottom: 10 }}>
                <div className="legend small" style={{ marginBottom: 6 }}>
                  Generated files:
                </div>
                {generatedFiles.map((genFile) => (
                  <div
                    key={genFile.id}
                    className="labelRow"
                    style={{ marginBottom: 6, alignItems: "flex-start" }}
                  >
                    <input
                      type="checkbox"
                      checked={selectedGeneratedIds.has(genFile.id)}
                      onChange={() => toggleGeneratedFileSelection(genFile.id)}
                      id={`check_${genFile.id}`}
                    />
                    <label
                      htmlFor={`check_${genFile.id}`}
                      style={{ marginLeft: 6, fontSize: "0.9em" }}
                    >
                      <div>{genFile.name}</div>
                      <div className="legend small" style={{ marginTop: 2 }}>
                        {formatBytes(genFile.sizeBytes)}
                      </div>
                    </label>
                  </div>
                ))}

                <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
                  <button
                    className="btn secondary"
                    style={{ flex: 1, fontSize: "0.85em" }}
                    onClick={addSelectedToUploader}
                  >
                    Add to uploader
                  </button>
                  <button
                    className="btn ghost"
                    style={{ flex: 1, fontSize: "0.85em" }}
                    onClick={() => setSelectedGeneratedIds(new Set())}
                  >
                    Deselect
                  </button>
                </div>
              </div>
            )}

            {/* Upload queue section */}
            {uploadQueue.length > 0 && (
              <div style={{ marginTop: 10, borderTop: "1px solid rgba(255,255,255,.1)", paddingTop: 10 }}>
                <div className="legend" style={{ marginBottom: 6 }}>
                  Ready to upload: <strong>{uploadQueue.length} file(s)</strong>
                </div>
                {uploadQueue.map((file) => (
                  <div key={file.id} className="legend small" style={{ marginBottom: 4 }}>
                    ✓ {file.name}
                  </div>
                ))}

                <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
                  <button
                    className="btn"
                    style={{ flex: 1, fontSize: "0.85em" }}
                    onClick={sendToBackend}
                  >
                    Send to backend
                  </button>
                  <button
                    className="btn ghost"
                    style={{ flex: 1, fontSize: "0.85em" }}
                    onClick={clearUploadQueue}
                  >
                    Clear
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {flowMode === "idle" && (
          <button className="btn" onClick={startSession}>
            ▶️ Start Games
          </button>
        )}

        {flowMode === "instruction" && step && (
          <div className="status" style={{ marginTop: 12 }}>
            <div className="legend">
              <strong>Round {stepIndex + 1}:</strong> {step.name}
            </div>

            <div style={{ marginTop: 10 }}>
              <img
                src={step.instructionImg}
                alt={`Instruction ${stepIndex + 1}`}
                style={{ width: "100%", borderRadius: 10, border: "1px solid rgba(255,255,255,.18)" }}
              />
            </div>

            <button className="btn secondary" style={{ marginTop: 10 }} onClick={playNext}>
              ▶️ Play Next
            </button>

            <div className="legend small" style={{ marginTop: 8 }}>
              Tip: Child taps targets on the screen.
            </div>
          </div>
        )}

        {flowMode === "playing" && (
          <div className="legend" style={{ marginTop: 12 }}>
            Playing… (auto continues)
          </div>
        )}

        {flowMode === "done" && (
          <div className="status" style={{ marginTop: 12 }}>
            <div className="legend">
              <strong>All done!</strong> Downloads should start automatically.
            </div>
            <button className="btn secondary" onClick={startSession} style={{ marginTop: 10 }}>
              🔁 Play Again
            </button>
          </div>
        )}
      </aside>

      <main className="right" ref={stageWrapRef} id="stageWrap" style={{ position: "relative" }}>
        <canvas id="stage" ref={canvasRef}></canvas>

        {/* small toggleable camera preview */}
        {showPreview && (
          <video
            ref={videoRef}
            autoPlay
            muted
            playsInline
            style={{
              position: "absolute",
              bottom: 10,
              right: 10,
              width: 170,
              height: 120,
              borderRadius: 10,
              border: "2px solid rgba(34,211,238,0.9)",
              objectFit: "cover",
              background: "#000",
            }}
          />
        )}

        {toastVisible && <div className="toast">{toastMsg}</div>}
      </main>
    </div>
  );
}
