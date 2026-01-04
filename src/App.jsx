import { Routes, Route } from "react-router-dom";

import Home from "./pages/Home.jsx";
import DoctorPanel from "./pages/DoctorPanel.jsx";
import ParentPanel from "./pages/ParentPanel.jsx";
import GuestPanel from "./pages/GuestPanel.jsx";
import AdminPanel from "./pages/AdminPanel.jsx";

import Eyetrack from "./pages/eyetrack/Eyetrack.jsx";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/doctor" element={<DoctorPanel />} />
      <Route path="/parent" element={<ParentPanel />} />
      <Route path="/guest" element={<GuestPanel />} />
      <Route path="/admin" element={<AdminPanel />} />

      <Route path="/eyetrack" element={<Eyetrack />} />
    </Routes>
  );
}

export default App;
