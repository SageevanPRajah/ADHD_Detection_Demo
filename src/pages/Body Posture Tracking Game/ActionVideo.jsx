// src/pages/Body Posture Tracking Game/ActionVideo.jsx

import React from "react";

export default function ActionVideo({ src }) {
  if (!src) return null;

  return (
    <video
      key={src}
      src={src}
      autoPlay
      
      playsInline
      className="mt-6 border shadow-xl w-96 rounded-3xl border-white/20"
    />
  );
}
