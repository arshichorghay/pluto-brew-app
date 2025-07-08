"use client";

import { useAuth } from "@/context/auth-context";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { User, Shield } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AddressManager } from "@/components/address-manager";

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const router = useRouter();

  if (!user) {
    // This could redirect to login or show a message.
    return null;
  }

  const handleLogout = () => {
    logout();
    router.push('/');
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl md:text-4xl font-headline mb-8">Your Account</h1>
      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2 mb-8">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="addresses">Addresses</TabsTrigger>
        </TabsList>
        <TabsContent value="profile">
          <Card className="max-w-md">
            <CardHeader className="items-center text-center p-6">
                <Avatar className="h-24 w-24 mb-4">
                    <AvatarFallback className="flex h-full w-full items-center justify-center">
                        {user.role === 'admin' ? (
                            <Shield className="h-12 w-12" />
                        ) : (
                            <User className="h-12 w-12" />
                        )}
                    </AvatarFallback>
                </Avatar>
                <CardTitle className="font-headline text-3xl">{user.name}</CardTitle>
                <CardDescription>{user.email}</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
                <div className="flex justify-between items-center p-4 bg-secondary rounded-lg">
                    <span className="font-medium">Role</span>
                    <span className="capitalize px-3 py-1 text-sm rounded-full bg-primary/20 text-primary font-semibold">{user.role}</span>
                </div>
                <Button variant="destructive" className="w-full" onClick={handleLogout}>Log Out</Button>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="addresses">
          <div className="max-w-3xl">
            <AddressManager />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
