import React from "react";
import { Navigate } from "react-router-dom";
import GameCanvas from "./GameCanvas";

export default function Eyetrack() {
  const accepted = localStorage.getItem("eyetrackAccepted") === "true";

  // Guard: if user hasn't completed the intro, redirect to terms
  if (!accepted) {
    return <Navigate to="/eyetrack/terms" replace />;
  }

  return (
    <div style={{ width: "100vw", height: "100vh", background: "#0b132b" }}>
      <GameCanvas />
    </div>
  );
}
