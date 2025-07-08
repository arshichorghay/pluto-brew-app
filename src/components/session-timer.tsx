'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/auth-context';
import { Progress } from '@/components/ui/progress';

const SESSION_DURATION_SECONDS = 30 * 60; // 30 minutes

export function SessionTimer() {
    const { user } = useAuth();
    const [secondsLeft, setSecondsLeft] = useState(SESSION_DURATION_SECONDS);

    useEffect(() => {
        if (!user) {
            setSecondsLeft(SESSION_DURATION_SECONDS);
            return;
        }

        setSecondsLeft(SESSION_DURATION_SECONDS);

        const timer = setInterval(() => {
            setSecondsLeft(prev => {
                if (prev <= 1) {
                    clearInterval(timer);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [user]);

    if (!user) {
        return null;
    }

    const progressPercentage = (secondsLeft / SESSION_DURATION_SECONDS) * 100;

    return (
        <div className="fixed top-0 left-0 w-full z-[100]">
            <Progress value={progressPercentage} className="h-1 w-full rounded-none" />
        </div>
    );
}
