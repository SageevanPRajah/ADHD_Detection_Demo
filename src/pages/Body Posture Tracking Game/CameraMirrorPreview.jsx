import React, { useRef, useState } from "react";
import { Camera, X } from "lucide-react";

export default function CameraMirror({ disabled = false }) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState("");
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  const openCamera = async () => {
    setError("");
    setOpen(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch {
      setError("Cannot open camera. Please allow camera access.");
    }
  };

  const closeCamera = () => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setOpen(false);
    setError("");
  };

  if (disabled) return null;

  return (
    <div className="flex flex-col items-center w-full max-w-sm gap-4 mx-auto">

      {/* Toggle button */}
      {!open ? (
        <button
          onClick={openCamera}
          className="flex items-center gap-2 px-6 py-3 text-sm font-bold text-white transition-all bg-blue-900 shadow shadow-lg rounded-2xl hover:bg-blue-600 hover:scale-105 active:scale-95"
        >
          <Camera className="w-4 h-4" />
          Check My Position 📷
        </button>
      ) : (
        <div className="w-full">
          {/* Header */}
          <div className="flex items-center justify-between px-1 mb-2">
            <span className="text-xs font-bold tracking-widest text-indigo-300 uppercase">
              📷 Mirror Preview
            </span>
            <button
              onClick={closeCamera}
              className="flex items-center gap-1 px-3 py-1 text-xs font-bold transition-all rounded-lg bg-white/10 hover:bg-red-500/30 text-slate-300 hover:text-red-300"
            >
              <X className="w-3 h-3" /> Close
            </button>
          </div>

          <div className="relative overflow-hidden border-2 rounded-2xl bg-slate-900 border-indigo-500/40"
               style={{ aspectRatio: "4/3" }}>
            {error ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 p-4 text-center">
                <p className="text-sm font-semibold text-red-400">{error}</p>
                <button onClick={openCamera}
                  className="px-4 py-2 text-xs font-bold text-white bg-indigo-500 rounded-xl hover:bg-indigo-400">
                  Try Again
                </button>
              </div>
            ) : (
              <video
                ref={videoRef}
                autoPlay muted playsInline
                className="object-cover w-full h-full"
                style={{ transform: "scaleX(-1)" }}
              />
            )}
          </div>

          <p className="mt-2 text-xs text-center text-slate-400">
            Make sure your <strong className="text-white">Elbow.Shoulder,Head</strong> is visible before starting!
          </p>
        </div>
      )}
    </div>
  );
}
