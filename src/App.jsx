import React, { Suspense, lazy } from "react";
import { Routes, Route } from "react-router-dom";

import ProtectedRoute from "./components/ProtectedRoute.jsx";

const Home = lazy(() => import("./pages/Home.jsx"));
const DoctorPanel = lazy(() => import("./pages/DoctorPanel.jsx"));
const ParentPanel = lazy(() => import("./pages/ParentPanel.jsx"));
const GuestPanel = lazy(() => import("./pages/GuestPanel.jsx"));
const AdminPanel = lazy(() => import("./pages/AdminPanel.jsx"));
const SaimanInstructions = lazy(() => import("./pages/Body Posture Tracking Game/SaimanInstructions.jsx"));
const SaimanSaysGame = lazy(() => import("./pages/Body Posture Tracking Game/SaimanSaysGame.jsx"));
const SaimanResult = lazy(() => import("./pages/Body Posture Tracking Game/SaimanResult.jsx"));
const HandwritingGame = lazy(() => import("./pages/Handwriting/HandwritingGame.jsx"));
const SpeechRouter = lazy(() => import("./modules/Speech/SpeechRouter.jsx"));
const EyeTrackTerms = lazy(() => import("./pages/eyetrack/EyeTrackTerms.jsx"));
const EyeTrackIntro = lazy(() => import("./pages/eyetrack/EyeTrackIntro.jsx"));
const ChildEyeGame = lazy(() => import("./pages/eyetrack/games/ChildEyeGame.jsx"));

const routeFallback = (
  <div className="min-h-screen w-full bg-clinic-surfaceDark text-slate-200 flex items-center justify-center text-sm">
    Loading...
  </div>
);


function App() {
  return (
    <Suspense fallback={routeFallback}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/doctor" element={<ProtectedRoute allowedRoles={["DOCTOR"]}><DoctorPanel /></ProtectedRoute>} />
        <Route path="/parent" element={<ProtectedRoute allowedRoles={["PATIENT_PARENT"]}><ParentPanel /></ProtectedRoute>} />
        <Route path="/guest" element={<ProtectedRoute allowedRoles={["GUEST"]}><GuestPanel /></ProtectedRoute>} />
        <Route path="/admin" element={<ProtectedRoute allowedRoles={["ADMIN"]}><AdminPanel /></ProtectedRoute>} />
        <Route path="/saiman-game" element={<ProtectedRoute allowedRoles={["GUEST", "PATIENT_PARENT"]}><SaimanSaysGame /></ProtectedRoute>} />
        <Route path="/saiman-instructions" element={<ProtectedRoute allowedRoles={["GUEST", "PATIENT_PARENT"]}><SaimanInstructions /></ProtectedRoute>} />
        <Route path="/saiman-result" element={<ProtectedRoute allowedRoles={["GUEST", "PATIENT_PARENT"]}><SaimanResult /></ProtectedRoute>} />
        <Route path="/guest/handwriting" element={<ProtectedRoute allowedRoles={["GUEST", "PATIENT_PARENT"]}><HandwritingGame /></ProtectedRoute>} />
        <Route path="/speech/*" element={<ProtectedRoute allowedRoles={["GUEST", "PATIENT_PARENT"]}><SpeechRouter /></ProtectedRoute>} />

        <Route path="/eyetrack/terms" element={<ProtectedRoute allowedRoles={["GUEST", "PATIENT_PARENT"]}><EyeTrackTerms /></ProtectedRoute>} />
        <Route path="/eyetrack/intro" element={<ProtectedRoute allowedRoles={["GUEST", "PATIENT_PARENT"]}><EyeTrackIntro /></ProtectedRoute>} />
        <Route path="/eyetrack" element={<ProtectedRoute allowedRoles={["GUEST", "PATIENT_PARENT"]}><ChildEyeGame /></ProtectedRoute>} />
        <Route path="/eyetrack/child-game" element={<ProtectedRoute allowedRoles={["GUEST", "PATIENT_PARENT"]}><ChildEyeGame /></ProtectedRoute>} />

      </Routes>
    </Suspense>
  );
}

export default App;
