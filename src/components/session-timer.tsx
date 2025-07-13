
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/auth-context';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from './ui/button';
import { useRouter } from 'next/navigation';

const SESSION_DURATION_SECONDS = 30 * 60; // 30 minutes
const WARNING_TIME_SECONDS = 60; // 1 minute warning

export function SessionTimer() {
    const { user, logout, isLoading } = useAuth();
    const router = useRouter();
    const [secondsLeft, setSecondsLeft] = useState(SESSION_DURATION_SECONDS);
    const [showWarning, setShowWarning] = useState(false);

    const resetTimer = useCallback(() => {
        setSecondsLeft(SESSION_DURATION_SECONDS);
        setShowWarning(false);
    }, []);

    const handleLogoutClick = useCallback(() => {
        setShowWarning(false);
        logout();
        router.push('/');
    }, [logout, router]);

    useEffect(() => {
        if (!user) {
            resetTimer();
            return;
        }

        const timer = setInterval(() => {
            setSecondsLeft(prev => {
                if (prev <= 1) {
                    clearInterval(timer);
                    handleLogoutClick();
                    return 0;
                }
                if (prev - 1 <= WARNING_TIME_SECONDS) {
                    setShowWarning(true);
                }
                return prev - 1;
            });
        }, 1000);

        // Reset timer on user activity
        const handleActivity = () => {
          resetTimer();
        };

        window.addEventListener('mousemove', handleActivity);
        window.addEventListener('keydown', handleActivity);
        window.addEventListener('click', handleActivity);

        // Cleanup function
        return () => {
          clearInterval(timer);
          window.removeEventListener('mousemove', handleActivity);
          window.removeEventListener('keydown', handleActivity);
          window.removeEventListener('click', handleActivity);
        };
    }, [user, resetTimer, handleLogoutClick]);


    if (isLoading || !user) {
        return null;
    }

    const progressPercentage = (secondsLeft / SESSION_DURATION_SECONDS) * 100;

    return (
        <>
            <div className="fixed top-0 left-0 w-full z-[100] h-1 bg-muted">
                <div
                    className="h-full bg-primary transition-all duration-1000 ease-linear"
                    style={{ width: `${progressPercentage}%` }}
                />
            </div>
            <AlertDialog open={showWarning} onOpenChange={setShowWarning}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you still there?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Your session will expire in {secondsLeft} seconds due to inactivity.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <Button variant="outline" onClick={handleLogoutClick}>Log Out</Button>
                        <Button onClick={resetTimer}>Stay Logged In</Button>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
