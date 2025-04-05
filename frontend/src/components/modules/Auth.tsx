import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { Card } from "../ui/Card";
import { Input } from "../ui/Input";
import { Button } from "../ui/Button";

type AuthMode = "login" | "register";

interface AuthProps {
  initialMode?: AuthMode;
}

// Use appropriate images from a service like Unsplash or similar
const loginBackground = "https://images.unsplash.com/photo-1560493676-04071c5f467b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1074&q=80";
const registerBackground = "https://images.unsplash.com/photo-1500382017468-9049fed747ef?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1332&q=80";

export const Auth = ({ initialMode = "login" }: AuthProps) => {
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  
  const { isLoading, error, login, register, resetAuthState } = useAuth();
  const navigate = useNavigate();
  
  // Reset form when changing modes
  useEffect(() => {
    resetAuthState();
    setValidationError(null);
    setFullName("");
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setRememberMe(false);
  }, [mode, resetAuthState]);

  const toggleTheme = () => {
    const html = document.documentElement;
    const isDark = html.classList.contains('dark');
    
    // Toggle dark class
    html.classList.toggle('dark');
    
    // Save preference 
    localStorage.setItem('theme', isDark ? 'light' : 'dark');
  };

  const toggleMode = () => {
    setMode(mode === "login" ? "register" : "login");
  };

  const validateForm = (): boolean => {
    // Reset validation error
    setValidationError(null);
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setValidationError("Please enter a valid email address");
      return false;
    }
    
    // Validate password length
    if (password.length < 8) {
      setValidationError("Password must be at least 8 characters long");
      return false;
    }
    
    // Additional validation for registration
    if (mode === "register") {
      // Validate full name
      if (fullName.trim().length < 3) {
        setValidationError("Please enter your full name");
        return false;
      }
      
      // Validate password confirmation
      if (password !== confirmPassword) {
        setValidationError("Passwords do not match");
        return false;
      }
    }
    
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!validateForm()) {
      return;
    }
    
    if (mode === "login") {
      await login(email, password, rememberMe);
    } else {
      await register(fullName, email, password);
    }
  };

  const formTitle = mode === "login" ? "Login" : "Create Account";
  const welcomeText = mode === "login" 
    ? "Welcome Back" 
    : "Create Account";
  const subtitleText = mode === "login"
    ? "Continue your journey to smarter, data-driven agriculture."
    : "Unlock the power of ML for sustainable farming and increased yields";
  const switchText = mode === "login"
    ? "Don't have an account?"
    : "Already have an account?";
  const switchAction = mode === "login"
    ? "Create account"
    : "Sign in";
  const buttonText = mode === "login" ? "Sign In" : "Create Account";

  return (
    <div className="flex min-h-screen">
      {/* Left side - Image and welcome text */}
      <div className="relative hidden w-1/2 bg-gray-900 lg:block">
        <div className="absolute inset-0 z-0">
          <img 
            src={mode === "login" ? loginBackground : registerBackground} 
            alt="Agriculture" 
            className="h-full w-full object-cover"
          />
        </div>
        <div className="absolute inset-0 bg-black/40 p-12 flex flex-col justify-end text-white">
          <h1 className="text-4xl font-bold mb-2">{welcomeText}</h1>
          <p className="text-lg mb-8">{subtitleText}</p>
          
          {mode === "login" && (
            <div className="flex items-center mb-4 text-sm">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-green-500/20 mr-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-primary" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              Secure, encrypted connection
            </div>
          )}
        </div>
      </div>
      
      {/* Right side - Form */}
      <div className="flex w-full lg:w-1/2 items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center">
              <svg className="h-8 w-8 text-primary" viewBox="0 0 24 24" fill="currentColor">
                <path d="M15.787 7.403a2.45 2.45 0 1 1-4.9 0 2.45 2.45 0 0 1 4.9 0zm-9.8 12.194h14.813v-3.272c0-2.38-1.93-4.31-4.31-4.31h-6.193c-2.38 0-4.31 1.93-4.31 4.31v3.272z"/>
              </svg>
              <span className="ml-2 text-xl font-bold">
                <span className="text-primary">Crop</span>
                <span> Recommendation</span>
              </span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={toggleTheme}
                className="rounded-full p-1 text-foreground/70 hover:text-foreground focus:outline-none"
                aria-label="Toggle theme"
              >
                {document.documentElement.classList.contains('dark') ? (
                  <svg
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                    />
                  </svg>
                ) : (
                  <svg
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                    />
                  </svg>
                )}
              </button>
            </div>
          </div>
          
          <div className="mb-6 flex items-center gap-2">
            <div className="text-green-500">
              <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              </svg>
            </div>
            <h1 className="text-2xl font-bold">{formTitle}</h1>
          </div>
          
          <form onSubmit={handleSubmit}>
            {mode === "register" && (
              <div className="mb-4">
                <label htmlFor="fullName" className="mb-2 block text-sm font-medium">
                  Full Name
                </label>
                <Input
                  id="fullName"
                  type="text" 
                  placeholder="Enter your full name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  icon={
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  }
                  required
                />
              </div>
            )}
            
            <div className="mb-4">
              <label htmlFor="email" className="mb-2 block text-sm font-medium">
                Email Address
              </label>
              <Input
                id="email"
                type="email" 
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                icon={
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                }
                required
              />
            </div>
            
            <div className="mb-4">
              <label htmlFor="password" className="mb-2 block text-sm font-medium">
                Password
              </label>
              <Input
                id="password"
                type="password" 
                placeholder={mode === "login" ? "Enter your password" : "Create password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                icon={
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 10-8 0v4h8z" />
                  </svg>
                }
                required
              />
            </div>
            
            {mode === "register" && (
              <div className="mb-4">
                <label htmlFor="confirmPassword" className="mb-2 block text-sm font-medium">
                  Confirm Password
                </label>
                <Input
                  id="confirmPassword"
                  type="password" 
                  placeholder="Confirm password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  icon={
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 10-8 0v4h8z" />
                    </svg>
                  }
                  required
                />
              </div>
            )}
            
            {mode === "login" && (
              <div className="mb-6 flex items-center">
                <input
                  id="remember"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 bg-gray-100 text-primary focus:ring-primary"
                />
                <label htmlFor="remember" className="ml-2 block text-sm">
                  Remember me for 30 days
                </label>
              </div>
            )}
            
            {/* Display validation error */}
            {validationError && (
              <div className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-500 dark:bg-red-900/30 dark:text-red-300">
                {validationError}
              </div>
            )}
            
            {/* Display error from auth context */}
            {error && (
              <div className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-500 dark:bg-red-900/30 dark:text-red-300">
                {error}
              </div>
            )}
            
            <Button 
              type="submit" 
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </div>
              ) : buttonText}
            </Button>
          </form>
          
          <div className="mt-6 text-center text-sm">
            <span className="text-gray-500">{switchText}</span>{" "}
            <button 
              onClick={toggleMode}
              className="text-primary hover:underline"
              type="button"
            >
              {switchAction}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
