import { Routes, Route } from "react-router-dom";
import "./speech.css";
import Home from "./pages/Home";
import AgeSelectionPage from "./pages/AgeSelectionPage";
import ReadingTaskPage from "./pages/ReadingTaskPage";
import AnalyzePage from "./pages/AnalyzePage";
import ResultsPage from "./pages/ResultsPage";
import FeaturesPage from "./pages/FeaturesPage";

export default function SpeechRouter() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="features" element={<FeaturesPage />} />
      <Route path="age" element={<AgeSelectionPage />} />
      <Route path="reading" element={<ReadingTaskPage />} />
      <Route path="analyze" element={<AnalyzePage />} />
      <Route path="results" element={<ResultsPage />} />
    </Routes>
  );
}
