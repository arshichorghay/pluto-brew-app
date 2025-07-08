
"use client";

import { useAuth } from "@/context/auth-context";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const router = useRouter();

  if (!user) {
    // This could redirect to login or show a message.
    // For now, it will just be blank if the user somehow gets here without being logged in.
    return null;
  }

  const handleLogout = () => {
    logout();
    router.push('/');
  }

  return (
    <div className="container mx-auto py-8">
        <h1 className="text-3xl md:text-4xl font-headline mb-8">Your Profile</h1>
        <Card className="max-w-md mx-auto">
            <CardHeader className="items-center text-center p-6">
                <Avatar className="h-24 w-24 mb-4">
                    <AvatarImage src="https://placehold.co/96x96.png" alt={user.name} data-ai-hint="user avatar" />
                    <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
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
    </div>
  );
}
