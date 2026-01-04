import { Routes, Route } from "react-router-dom";

import Home from "./pages/Home.jsx";
import DoctorPanel from "./pages/DoctorPanel.jsx";
import ParentPanel from "./pages/ParentPanel.jsx";
import GuestPanel from "./pages/GuestPanel.jsx";
import AdminPanel from "./pages/AdminPanel.jsx";
import SaimanInstructions from "./pages/Body Posture Tracking Game/SaimanInstructions.jsx";
import SaimanSaysGame from "./pages/Body Posture Tracking Game/SaimanSaysGame.jsx";
import Result from "./pages/Body Posture Tracking Game/result.jsx";

import Eyetrack from "./pages/eyetrack/Eyetrack.jsx";
import EyeTrackTerms from "./pages/eyetrack/EyeTrackTerms.jsx";
import EyeTrackIntro from "./pages/eyetrack/EyeTrackIntro.jsx";
import ChildEyeGame from "./pages/eyetrack/game/ChildEyeGame.jsx"; 
import Eyecollect from "./pages/eyetrack/game/Eyecollect.jsx"; 

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

      <Route path="/eyetrack" element={<Eyetrack />} />
      <Route path="/eyetrack/terms" element={<EyeTrackTerms />} />
      <Route path="/eyetrack/intro" element={<EyeTrackIntro />} />
      <Route path="/eyetrack/child-game" element={<ChildEyeGame />} />
      <Route path="/eyecollect" element={<Eyecollect />} />

    </Routes>
  );
}

export default App;
