
"use client";

import { useState } from "react";
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
import { Terminal } from "lucide-react";

export function AuthForm() {
  const [loginEmail, setLoginEmail] = useState("admin@plutobrew.com");
  const [loginPassword, setLoginPassword] = useState("admin");
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const { login, register } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      const user = await login(loginEmail, loginPassword);
      if (user) {
        toast({ title: "Login Successful", description: `Welcome back, ${user.name}!` });
        if (user.role === 'admin') {
          router.push("/admin/dashboard");
        } else {
          router.push("/marketplace");
        }
      } else {
        // This case should ideally not be hit if login throws on failure
        setError("Invalid email or password. Please try again.");
      }
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
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
     if (!regName || !regEmail || !regPassword) {
      setError("Please fill in all fields.");
      return;
    }
    try {
        const user = await register(regName, regEmail, regPassword);
        if (user) {
            toast({ title: "Registration Successful", description: `Welcome, ${user.name}!` });
            router.push("/marketplace");
        }
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
    }
  };

  return (
    <Card>
      <Tabs defaultValue="login" className="w-full">
        <CardHeader>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="register">Register</TabsTrigger>
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
                <Input id="email" type="email" placeholder="m@example.com" required value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" required value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} />
              </div>
              {error && (
                <Alert variant="destructive">
                  <Terminal className="h-4 w-4" />
                  <AlertTitle>Authentication Error</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              <Button type="submit" className="w-full">Login</Button>
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
              <Input id="name" placeholder="Pluto Pilot" required value={regName} onChange={(e) => setRegName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email-reg">Email</Label>
              <Input id="email-reg" type="email" placeholder="m@example.com" required value={regEmail} onChange={(e) => setRegEmail(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password-reg">Password</Label>
              <Input id="password-reg" type="password" required value={regPassword} onChange={(e) => setRegPassword(e.target.value)} />
            </div>
             {error && (
                <Alert variant="destructive">
                  <Terminal className="h-4 w-4" />
                  <AlertTitle>Registration Error</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
            <Button type="submit" className="w-full">Create Account</Button>
            </form>
          </TabsContent>
        </CardContent>
      </Tabs>
    </Card>
  );
}
