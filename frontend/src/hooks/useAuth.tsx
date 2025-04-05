import { useAuth as useClerkAuth, useSignIn, useSignUp, useUser } from "@clerk/clerk-react";
import { useState } from "react";

export const useAuth = () => {
  const { isLoaded, userId, sessionId, signOut } = useClerkAuth();
  const { signIn } = useSignIn();
  const { signUp } = useSignUp();
  const { user } = useUser();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = async (email: string, password: string, rememberMe: boolean = false) => {
    if (!signIn) {
      setError("Sign in functionality not available");
      return;
    }
    
    setIsLoading(true);
    setError(null);
    try {
      await signIn.create({
        identifier: email,
        password,
      });
    } catch (err: any) {
      setError(err.message || "Failed to sign in");
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (fullName: string, email: string, password: string) => {
    if (!signUp) {
      setError("Sign up functionality not available");
      return;
    }
    
    setIsLoading(true);
    setError(null);
    try {
      await signUp.create({
        firstName: fullName.split(" ")[0],
        lastName: fullName.split(" ").slice(1).join(" "),
        emailAddress: email,
        password,
      });
    } catch (err: any) {
      setError(err.message || "Failed to sign up");
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await signOut?.();
    } catch (err: any) {
      setError(err.message || "Failed to sign out");
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoaded,
    isSignedIn: !!userId && !!sessionId,
    isAuthenticated: !!userId && !!sessionId,
    isLoading,
    error,
    user,
    login,
    register,
    logout,
  };
};
