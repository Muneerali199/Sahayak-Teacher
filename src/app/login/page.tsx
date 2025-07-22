"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Logo } from "@/components/icons";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/auth-context";
import { Loader } from "@/components/ui/loader";

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { user, loading } = useAuth();
  const [isSigningIn, setIsSigningIn] = React.useState(false);
  const [hostname, setHostname] = React.useState("");

  React.useEffect(() => {
    if (user) {
      router.push("/dashboard");
    }
    // Set hostname only on the client side
    setHostname(window.location.hostname);
  }, [user, router]);

  const handleGoogleSignIn = async () => {
    if (!auth) {
        toast({
            title: "Configuration Error",
            description: "Firebase is not configured. Please check src/lib/firebase.ts.",
            variant: "destructive",
        });
        return;
    }
    setIsSigningIn(true);
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      router.push("/dashboard");
    } catch (error: any) {
      console.error("Authentication Error:", error);
      let description = "Could not sign in with Google. Please try again.";
      if (error.code === 'auth/unauthorized-domain') {
          description = `This app's domain is not authorized. Please go to your Firebase Console -> Authentication -> Settings, and add '${hostname}' to the 'Authorized domains' list.`;
      } else if (error.code === 'auth/operation-not-allowed') {
          description = "Authentication failed. In the Firebase Console, please ensure Google Sign-In is enabled under Authentication -> Sign-in method.";
      }
      toast({
        title: "Authentication Failed",
        description: description,
        variant: "destructive",
        duration: 9000,
      });
    } finally {
        setIsSigningIn(false);
    }
  };
  
  const isLoading = loading || isSigningIn;

  if (loading || user) {
      return (
          <div className="flex min-h-screen items-center justify-center bg-background">
              <Loader size="lg" />
          </div>
      )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary/5 via-background to-accent/5 p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <div className="mx-auto flex items-center justify-center gap-2 mb-4">
            <Logo className="h-10 w-10 text-primary" />
          </div>
          <CardTitle className="font-headline">Welcome to Sahayak</CardTitle>
          <CardDescription>Sign in to access your dashboard</CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            className="w-full"
            onClick={handleGoogleSignIn}
            disabled={isLoading}
          >
            {isLoading ? <Loader className="mr-2"/> : 
             <svg
                className="mr-2 h-4 w-4"
                aria-hidden="true"
                focusable="false"
                data-prefix="fab"
                data-icon="google"
                role="img"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 488 512"
              >
                <path
                  fill="currentColor"
                  d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 126 23.4 172.9 61.9l-76.2 74.9C307.4 104.5 280.3 96 248 96c-88.8 0-160.1 71.1-160.1 160.1s71.3 160.1 160.1 160.1c98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"
                ></path>
              </svg>
            }
            Sign In with Google
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
