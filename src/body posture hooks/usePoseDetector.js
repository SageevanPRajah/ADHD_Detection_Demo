import { useCallback, useRef, useState } from "react";
import { PoseLandmarker, FilesetResolver } from "@mediapipe/tasks-vision";

// Same 8 landmark IDs used in the Python backend
const LANDMARK_IDS = [11, 12, 13, 14, 15, 16, 23, 24];

// Downsample webcam frames to this resolution before feeding to MediaPipe.
// 720p → 320×240 cuts processing load by ~9x with no accuracy loss for pose.
const PROCESS_WIDTH = 320;
const PROCESS_HEIGHT = 240;

export default function usePoseDetector() {
  const landmarkerRef = useRef(null);
  const poseSequenceRef = useRef([]); // Collected rows: [[x,y,x,y,...], ...]
  const rafRef = useRef(null);
  const canvasRef = useRef(null); // Offscreen canvas for downsampling
  const [isReady, setIsReady] = useState(false);
  const [initError, setInitError] = useState(null);

  /**
   * Load MediaPipe PoseLandmarker (WASM from CDN).
   * Call once on component mount.
   */
  const initPoseDetector = useCallback(async () => {
    try {
      const vision = await FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm"
      );

      landmarkerRef.current = await PoseLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath:
            "https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task",
          delegate: "GPU", // falls back to CPU automatically
        },
        runningMode: "VIDEO",
        numPoses: 1,
      });

      // Create offscreen canvas once
      const canvas = document.createElement("canvas");
      canvas.width = PROCESS_WIDTH;
      canvas.height = PROCESS_HEIGHT;
      canvasRef.current = canvas;

      setIsReady(true);
      console.log("[PoseDetector] Ready ✓");
    } catch (err) {
      console.error("[PoseDetector] Init failed:", err);
      setInitError(err.message);
    }
  }, []);

  /**
   * Start collecting pose data from the webcam video element.
   * Runs every animation frame — downsamples, detects, appends row.
   */
  const startCollecting = useCallback((videoElement) => {
    if (!landmarkerRef.current) {
      console.warn("[PoseDetector] Not ready yet, cannot start collecting");
      return;
    }

    poseSequenceRef.current = [];
    const ctx = canvasRef.current.getContext("2d");
    let lastTimestamp = -1;

    const processFrame = () => {
      const video = videoElement;

      if (!video || video.readyState < 2) {
        rafRef.current = requestAnimationFrame(processFrame);
        return;
      }

      const nowMs = performance.now();

      // Guard: MediaPipe requires strictly increasing timestamps
      if (nowMs > lastTimestamp) {
        // Downsample frame to 320×240 before pose detection
        ctx.drawImage(video, 0, 0, PROCESS_WIDTH, PROCESS_HEIGHT);

        const results = landmarkerRef.current.detectForVideo(
          canvasRef.current,
          nowMs
        );

        if (results.landmarks && results.landmarks.length > 0) {
          const lm = results.landmarks[0];
          const row = [];
          for (const id of LANDMARK_IDS) {
            row.push(lm[id].x, lm[id].y);
          }
          poseSequenceRef.current.push(row);
        }

        lastTimestamp = nowMs;
      }

      rafRef.current = requestAnimationFrame(processFrame);
    };

    rafRef.current = requestAnimationFrame(processFrame);
    console.log("[PoseDetector] Started collecting");
  }, []);

  /**
   * Stop collecting. Returns the full pose sequence array.
   */
  const stopCollecting = useCallback(() => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    const seq = [...poseSequenceRef.current];
    poseSequenceRef.current = [];
    console.log(`[PoseDetector] Stopped. Collected ${seq.length} frames.`);
    return seq;
  }, []);

  return { initPoseDetector, startCollecting, stopCollecting, isReady, initError };
}
