import { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { 
  useAuth as useClerkAuth, 
  useUser, 
  useSignIn, 
  useSignUp
} from '@clerk/clerk-react';

// Define types based on the return types of the hooks
type ClerkSignInResource = ReturnType<typeof useSignIn>["signIn"];
type ClerkSignUpResource = ReturnType<typeof useSignUp>["signUp"];

interface AuthContextType {
  isLoaded: boolean;
  isSignedIn: boolean | undefined;
  userId: string | null | undefined;
  username: string | null;
  email: string | null;
  profileImageUrl: string | null;
  signIn: ClerkSignInResource;
  signUp: ClerkSignUpResource;
  signOut: (() => Promise<void>) | undefined;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<void>;
  register: (fullName: string, email: string, password: string) => Promise<void>;
  resetAuthState: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const { isLoaded, userId, signOut, isSignedIn } = useClerkAuth();
  const { user } = useUser();
  const { signIn } = useSignIn();
  const { signUp } = useSignUp();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const username = user?.username || user?.firstName || null;
  const email = user?.primaryEmailAddress?.emailAddress || null;
  const profileImageUrl = user?.imageUrl || null;

  const login = async (email: string, password: string, rememberMe: boolean = false) => {
    if (!signIn) {
      setError("Sign in functionality not available");
      return;
    }
    
    setIsLoading(true);
    setError(null);
    try {
      const result = await signIn.create({
        identifier: email,
        password,
      });
      
      if (result.status === "complete") {
        // The status is complete, the user is signed in
        window.location.href = "/dashboard";
      } else {
        // Handle other status cases, like "needs_factor_2"
        console.log("Login needs additional steps:", result);
      }
    } catch (err: any) {
      console.error("Login error:", err);
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
      // Only include required parameters
      const result = await signUp.create({
        emailAddress: email,
        password,
      });
      
      if (result.status === "complete") {
        // The status is complete, redirect to the dashboard
        window.location.href = "/dashboard";
      } else if (result.status === "missing_requirements" && 
                 result.unverifiedFields.includes("email_address")) {
        // Prepare email verification
        await signUp.prepareEmailAddressVerification({
          strategy: "email_code",
        });
        
        // Store registration data for verification step
        localStorage.setItem('pendingRegistration', JSON.stringify({
          fullName,
          email,
          signUpId: result.id
        }));
        
        // Redirect to verification page
        window.location.href = "/verify";
      } else {
        console.log("Registration status:", result);
        setError("Registration couldn't be completed. Please try again.");
      }
    } catch (err: any) {
      console.error("Registration error:", err);
      setError(err.message || "Failed to sign up");
    } finally {
      setIsLoading(false);
    }
  };

  const resetAuthState = () => {
    setError(null);
    setIsLoading(false);
  };

  return (
    <AuthContext.Provider
      value={{
        isLoaded,
        isSignedIn,
        userId,
        username,
        email,
        profileImageUrl,
        signIn,
        signUp,
        signOut,
        isLoading,
        error,
        login,
        register,
        resetAuthState,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};