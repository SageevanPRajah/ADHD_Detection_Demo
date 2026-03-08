import React from "react";
import { Routes, Route } from "react-router-dom";

import Home from "./pages/Home.jsx";
import DoctorPanel from "./pages/DoctorPanel.jsx";
import ParentPanel from "./pages/ParentPanel.jsx";
import GuestPanel from "./pages/GuestPanel.jsx";
import AdminPanel from "./pages/AdminPanel.jsx";
import SaimanInstructions from "./pages/Body Posture Tracking Game/SaimanInstructions.jsx";
import SaimanSaysGame from "./pages/Body Posture Tracking Game/SaimanSaysGame.jsx";
import Result from "./pages/Body Posture Tracking Game/SaimanResult.jsx";
import HandwritingGame from "./pages/Handwriting/HandwritingGame.jsx";
import SpeechRouter from "./modules/Speech/speechRouter";
import SaimanResult from "./pages/Body Posture Tracking Game/SaimanResult.jsx";

import EyeTrackTerms from "./pages/eyetrack/EyeTrackTerms.jsx";
import EyeTrackIntro from "./pages/eyetrack/EyeTrackIntro.jsx";
import ChildEyeGame from "./pages/eyetrack/games/ChildEyeGame.jsx";


function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/doctor" element={<DoctorPanel />} />
      <Route path="/parent" element={<ParentPanel />} />
      <Route path="/guest" element={<GuestPanel />} />
      <Route path="/admin" element={<AdminPanel />} />
      <Route path="/saiman-game" element={<SaimanSaysGame />} />
      <Route path="/saiman-instructions" element={<SaimanInstructions />} />
      <Route path="/saiman-result" element={<Result />} />
      <Route path="/guest/handwriting" element={<HandwritingGame />} />
      <Route path="/speech/*" element={<SpeechRouter />} />

      <Route path="/eyetrack/terms" element={<EyeTrackTerms />} />
      <Route path="/eyetrack/intro" element={<EyeTrackIntro />} />
      <Route path="/eyetrack" element={<ChildEyeGame />} />
      <Route path="/eyetrack/child-game" element={<ChildEyeGame />} />

    </Routes>
  );
}

export default App;
