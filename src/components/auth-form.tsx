
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/context/auth-context";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal } from "lucide-react";

export function AuthForm() {
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
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
    const user = await login(loginEmail, loginPassword);
    if (user) {
      toast({ title: "Login Successful", description: `Welcome back, ${user.name}!` });
      if (user.role === 'admin') {
        router.push("/admin/dashboard");
      } else {
        router.push("/marketplace");
      }
    } else {
      setError("Invalid email or password. Please try again.");
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
     if (!regName || !regEmail || !regPassword) {
      setError("Please fill in all fields.");
      return;
    }
    const user = await register(regName, regEmail, regPassword);
    if (user) {
        toast({ title: "Registration Successful", description: `Welcome, ${user.name}!` });
        router.push("/marketplace");
    } else {
        setError("An account with this email already exists.");
    }
  };

  return (
    <Tabs defaultValue="login" className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="login">Login</TabsTrigger>
        <TabsTrigger value="register">Register</TabsTrigger>
      </TabsList>
      <TabsContent value="login">
        <Card>
          <CardHeader>
            <CardTitle className="font-headline text-2xl">Login</CardTitle>
            <CardDescription>
              Enter your email below to login to your account.
            </CardDescription>
          </CardHeader>
          <CardContent>
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
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="register">
        <Card>
          <CardHeader>
            <CardTitle className="font-headline text-2xl">Register</CardTitle>
            <CardDescription>
              Create an account to start exploring our cosmic brews.
            </CardDescription>
          </CardHeader>
          <CardContent>
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
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
