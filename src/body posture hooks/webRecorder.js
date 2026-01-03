import { useCallback, useRef, useState } from "react";

export default function useWebcamRecorder() {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const [recording, setRecording] = useState(false);

  const setupStream = useCallback(async () => {
    if (streamRef.current) {
      if (
        videoRef.current &&
        videoRef.current.srcObject !== streamRef.current
      ) {
        videoRef.current.srcObject = streamRef.current;
      }
      return true;
    }

    if (!navigator?.mediaDevices?.getUserMedia) {
      console.error(
        "Camera error: getUserMedia is not supported in this browser"
      );
      return false;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: false,
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.muted = true;
        try {
          await videoRef.current.play();
        } catch (playErr) {
          console.warn("Camera preview could not autoplay yet:", playErr);
        }
      }

      return true;
    } catch (err) {
      console.error("Camera error:", err);
      return false;
    }
  }, []);

  const startRecording = useCallback(async () => {
    const hasStream = streamRef.current ? true : await setupStream();
    if (!hasStream) return false;

    if (typeof MediaRecorder === "undefined") {
      console.error("Camera error: MediaRecorder API is not available");
      return false;
    }

    try {
      chunksRef.current = [];
      const recorder = new MediaRecorder(streamRef.current);
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data?.size) chunksRef.current.push(e.data);
      };

      recorder.start();
      setRecording(true);
      return true;
    } catch (err) {
      console.error("Failed to start recording:", err);
      return false;
    }
  }, [setupStream]);

  const stopRecording = useCallback(() => {
    return new Promise((resolve) => {
      const recorder = mediaRecorderRef.current;
      if (!recorder) {
        resolve(null);
        return;
      }

      const finish = () => {
        const blob = chunksRef.current.length
          ? new Blob(chunksRef.current, { type: "video/webm" })
          : null;
        setRecording(false);
        chunksRef.current = [];
        mediaRecorderRef.current = null;
        resolve(blob);
      };

      if (recorder.state === "inactive") {
        finish();
        return;
      }

      recorder.onstop = finish;
      recorder.stop();
    });
  }, []);

  const stopStream = useCallback(() => {
    try {
      if (
        mediaRecorderRef.current &&
        mediaRecorderRef.current.state !== "inactive"
      ) {
        mediaRecorderRef.current.stop();
      }
    } catch {
      // ignore
    }

    const stream = streamRef.current;
    if (stream) {
      stream.getTracks().forEach((t) => t.stop());
    }

    streamRef.current = null;
    mediaRecorderRef.current = null;
    chunksRef.current = [];
    setRecording(false);

    if (videoRef.current) {
      videoRef.current.pause?.();
      videoRef.current.srcObject = null;
    }
  }, []);

  return {
    videoRef,
    setupStream,
    startRecording,
    stopRecording,
    stopStream,
    recording,
  };
}
