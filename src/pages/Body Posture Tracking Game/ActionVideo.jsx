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
      className="object-cover w-full h-full"
    />
  );
}
