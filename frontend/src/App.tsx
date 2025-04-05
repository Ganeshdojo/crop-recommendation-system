import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import HomePage from "./pages/HomePage";
import { AuthPage } from "./pages/AuthPage";
// import { DashboardPage } from "./pages/DashboardPage";
import { PredictionPage } from "./pages/PredictionPage";
import { ResultsPage } from "./pages/ResultsPage";
import { VerifyPage } from "./pages/VerifyPage";
import { getTheme } from "./utils/helpers";
import { useNavigate } from "react-router-dom";
import TrainingPage from "./pages/TrainingPage";
import AboutPage from "./pages/AboutPage";
// import SettingsPage from "./pages/SettingsPage";

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isSignedIn, isLoaded } = useAuth();
  const navigate = useNavigate();
  
  // Check if user just completed verification
  const justVerified = sessionStorage.getItem('justVerified') === 'true';
  
  useEffect(() => {
    // Clear the verification flag after it's been used
    if (justVerified) {
      sessionStorage.removeItem('justVerified');
    }
  }, [justVerified]);
  
  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  // Allow access if signed in OR just verified
  if (!isSignedIn && !justVerified) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
};

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<AuthPage mode="login" />} />
      <Route path="/register" element={<AuthPage mode="register" />} />
      <Route path="/verify" element={<VerifyPage />} />
      <Route path="/about" element={<AboutPage />} />
      
      {/* Protected routes */}
      {/* <Route path="/dashboard" element={
        <ProtectedRoute>
          <DashboardPage />
        </ProtectedRoute>
      } /> */}
      <Route path="/prediction" element={
        <ProtectedRoute>
          <PredictionPage />
        </ProtectedRoute>
      } />
      <Route path="/results" element={
        <ProtectedRoute>
          <ResultsPage />
        </ProtectedRoute>
      } />
      <Route path="/training" element={
        <ProtectedRoute>
          <TrainingPage />
        </ProtectedRoute>
      } />
      {/* <Route path="/settings" element={<SettingsPage />} /> */}
      
      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

function App() {
  // Theme setup
  useEffect(() => {
    const theme = getTheme();
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
