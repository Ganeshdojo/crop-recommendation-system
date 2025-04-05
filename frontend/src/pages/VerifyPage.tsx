// src/pages/VerifyPage.tsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSignUp } from "@clerk/clerk-react";
import { Input } from "../components/ui/Input";
import { Button } from "../components/ui/Button";

export const VerifyPage = () => {
  const [verificationCode, setVerificationCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pendingData, setPendingData] = useState<any>(null);
  const { signUp, isLoaded } = useSignUp();
  const navigate = useNavigate();

  useEffect(() => {
    // Get stored registration data
    const data = localStorage.getItem('pendingRegistration');
    if (data) {
      setPendingData(JSON.parse(data));
    } else {
      // No pending registration, redirect to signup
      navigate('/register');
    }
  }, [navigate]);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!signUp || !verificationCode || !isLoaded) {
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Attempt verification
      const result = await signUp.attemptEmailAddressVerification({
        code: verificationCode,
      });
      
      if (result.status === "complete") {
        // User has been created and is logged in
        localStorage.removeItem('pendingRegistration');
        
        // IMPORTANT: Create a session for the user
        const session = await result.createdSessionId;
        console.log("Session created:", session ? "Yes" : "No");
        
        // Set a flag to bypass authentication checks during the redirect
        sessionStorage.setItem('justVerified', 'true');
        
        // Hard redirect to reset the application state
        window.location.href = '/dashboard';
      } else {
        console.log("Verification result:", result);
        setError("Verification couldn't be completed. Please try again.");
      }
    } catch (err: any) {
      console.error("Verification error:", err);
      setError(err.message || "Failed to verify email");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (!signUp || !isLoaded) {
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Resend verification code
      await signUp.prepareEmailAddressVerification({
        strategy: "email_code",
      });
      
      // Show success message
      alert("Verification code resent. Please check your email.");
    } catch (err: any) {
      console.error("Resend error:", err);
      setError(err.message || "Failed to resend verification code");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-md rounded-lg border border-border bg-card p-8 shadow-sm">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold">Verify Your Email</h1>
          <p className="mt-2 text-muted-foreground">
            We've sent a verification code to {pendingData?.email}. Please enter it below.
          </p>
        </div>
        
        {error && (
          <div className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-500 dark:bg-red-900/30 dark:text-red-300">
            {error}
          </div>
        )}
        
        <form onSubmit={handleVerify}>
          <div className="mb-4">
            <label htmlFor="code" className="mb-2 block text-sm font-medium">
              Verification Code
            </label>
            <Input
              id="code"
              type="text"
              placeholder="Enter your verification code"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
              required
            />
          </div>
          
          <Button 
            type="submit" 
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? "Verifying..." : "Verify Email"}
          </Button>
        </form>
        
        <div className="mt-4 text-center">
          <button
            onClick={handleResend}
            className="text-sm text-primary hover:underline"
            disabled={isLoading}
            type="button"
          >
            Didn't receive a code? Resend
          </button>
        </div>
        
        <div className="mt-4 text-center">
          <button
            onClick={() => navigate('/register')}
            className="text-sm text-muted-foreground hover:underline"
            type="button"
          >
            Start over with registration
          </button>
        </div>
      </div>
    </div>
  );
};