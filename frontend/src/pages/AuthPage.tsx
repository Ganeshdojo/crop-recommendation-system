import { useEffect } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { Auth } from "../components/modules/Auth";

interface AuthPageProps {
  mode?: "login" | "register";
}

export const AuthPage = ({ mode = "login" }: AuthPageProps) => {
  const { isSignedIn, isLoaded } = useAuth();
  const navigate = useNavigate();
  
  // Check if user just verified their email
  const justVerified = sessionStorage.getItem('justVerified') === 'true';
  
  useEffect(() => {
    // If the user just verified and somehow ended up on the login page, redirect them
    if (justVerified) {
      sessionStorage.removeItem('justVerified');
      navigate('/dashboard', { replace: true });
    }
  }, [justVerified, navigate]);
  
  useEffect(() => {
    // Reset page title based on mode
    document.title = mode === "login" 
      ? "Login | AgroPredicta" 
      : "Sign Up | AgroPredicta";
  }, [mode]);
  
  // Show loading state while Clerk loads
  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  // Redirect to dashboard if already signed in
  if (isSignedIn) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return <Auth initialMode={mode} />;
};
