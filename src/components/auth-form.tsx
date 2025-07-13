
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/context/auth-context";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal, Loader2 } from "lucide-react";

export function AuthForm() {
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { user, login, register, isLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    // This effect handles redirection after a user's state changes (e.g., after login).
    if (!isLoading && user) {
        // User is logged in, redirect them away from the auth page.
        if (user.role === 'admin') {
          router.push("/admin/orders");
        } else {
          router.push("/marketplace");
        }
    }
  }, [user, isLoading, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      const loggedInUser = await login(loginEmail, loginPassword);
      toast({ title: "Login Successful", description: `Welcome back, ${loggedInUser.displayName || 'friend'}!` });
      // The useEffect hook will handle the redirection.
    } catch (err: any) {
       let message = "An unknown error occurred.";
       if (err.code) {
         switch (err.code) {
            case 'auth/user-not-found':
            case 'auth/wrong-password':
            case 'auth/invalid-credential':
              message = 'Invalid email or password.';
              break;
            case 'auth/too-many-requests':
              message = 'Too many login attempts. Please try again later.';
              break;
            default:
              message = 'An error occurred during login. Please try again.';
         }
       }
       setError(message);
       setIsSubmitting(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
     if (!regName || !regEmail || !regPassword) {
      setError("Please fill in all fields.");
      return;
    }
    setIsSubmitting(true);
    try {
        const registeredUser = await register(regName, regEmail, regPassword);
        toast({ title: "Registration Successful", description: `Welcome, ${registeredUser.displayName}!` });
        // The useEffect hook will handle the redirection.
    } catch (err: any) {
        let message = "An unknown error occurred during registration.";
        if (err.code) {
            switch (err.code) {
                case 'auth/email-already-in-use':
                    message = 'An account with this email address already exists.';
                    break;
                case 'auth/weak-password':
                    message = 'The password is too weak. Please choose a stronger password.';
                    break;
                case 'auth/invalid-email':
                    message = 'Please enter a valid email address.';
                    break;
                default:
                    message = 'An error occurred during registration. Please try again.';
            }
        }
        setError(message);
        setIsSubmitting(false);
    }
  };

  // While loading the initial auth state or if the user is already logged in (and about to be redirected),
  // we can show a simple loading state to prevent interaction with the form.
  if (isLoading || user) {
      return (
          <div className="w-full min-h-screen flex items-center justify-center p-6 bg-muted">
              <Loader2 className="h-8 w-8 animate-spin" />
          </div>
      )
  }

  return (
    <Card>
      <Tabs defaultValue="login" className="w-full">
        <CardHeader>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login" disabled={isSubmitting}>Login</TabsTrigger>
            <TabsTrigger value="register" disabled={isSubmitting}>Register</TabsTrigger>
          </TabsList>
        </CardHeader>
        <CardContent>
          <TabsContent value="login" className="mt-0">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold font-headline">Welcome Back!</h2>
              <p className="text-balance text-sm text-muted-foreground">
                Enter your credentials to access your account.
              </p>
            </div>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="m@example.com" required value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} disabled={isSubmitting} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" required value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} disabled={isSubmitting}/>
              </div>
              {error && (
                <Alert variant="destructive">
                  <Terminal className="h-4 w-4" />
                  <AlertTitle>Authentication Error</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isSubmitting ? 'Logging in...' : 'Login'}
                </Button>
            </form>
          </TabsContent>
          <TabsContent value="register" className="mt-0">
             <div className="text-center mb-6">
              <h2 className="text-2xl font-bold font-headline">Create an Account</h2>
              <p className="text-balance text-sm text-muted-foreground">
                Enter your information to get started.
              </p>
            </div>
            <form onSubmit={handleRegister} className="space-y-4">
             <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" placeholder="Pluto Pilot" required value={regName} onChange={(e) => setRegName(e.target.value)} disabled={isSubmitting}/>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email-reg">Email</Label>
              <Input id="email-reg" type="email" placeholder="m@example.com" required value={regEmail} onChange={(e) => setRegEmail(e.target.value)} disabled={isSubmitting}/>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password-reg">Password</Label>
              <Input id="password-reg" type="password" required value={regPassword} onChange={(e) => setRegPassword(e.target.value)} disabled={isSubmitting}/>
            </div>
             {error && (
                <Alert variant="destructive">
                  <Terminal className="h-4 w-4" />
                  <AlertTitle>Registration Error</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isSubmitting ? 'Creating account...' : 'Create Account'}
            </Button>
            </form>
          </TabsContent>
        </CardContent>
      </Tabs>
    </Card>
  );
}
