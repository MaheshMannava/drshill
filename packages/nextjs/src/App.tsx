import { Suspense } from "react";
import { useRoutes, Routes, Route } from "react-router-dom";
import Home from "./components/home";
import routes from "./routes";

function LoadingScreen() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gradient-to-br from-[#1E3A8A] via-[#1E40AF] to-[#F97316]">
      <div className="relative w-[600px] h-[600px] animate-pulse">
        <img
          src="/images/tempo-image-20250211T150855775Z.png"
          alt="Dr. Shill Logo"
          className="w-full h-full object-contain"
        />
      </div>
    </div>
  );
}

function App() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <div className="app bg-[#b3b3b3]">
        {/* Tempo routes for the editor */}
        {import.meta.env.VITE_TEMPO === "true" && useRoutes(routes)}

        {/* App routes */}
        <Routes>
          <Route path="/" element={<Home />} />
          {import.meta.env.VITE_TEMPO === "true" && (
            <Route path="/tempobook/*" />
          )}
        </Routes>
      </div>
    </Suspense>
  );
}

export default App;
