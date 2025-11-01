"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/commons/AuthContext';

interface GuestRouteProps {
    children: React.ReactNode;
}

export default function GuestRoute({ children }: GuestRouteProps) {
    const { isAuthenticated, isLoading } = useAuth();
    const router = useRouter();
    const [isChecking, setIsChecking] = useState(true);

    useEffect(() => {
        // Also check localStorage token as fallback
        const token = localStorage.getItem('token') || localStorage.getItem('authToken');
        
        if (!isLoading && (isAuthenticated || token)) {
            // User is already authenticated, redirect to home
            router.push('/');
        } else {
            setIsChecking(false);
        }
    }, [isAuthenticated, isLoading, router]);

    // Show loading state while checking authentication
    if (isLoading || isChecking) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-[#b7b7b7] text-[14px]">Loading...</div>
            </div>
        );
    }

    // If authenticated, don't render children (will redirect)
    if (isAuthenticated) {
        const token = localStorage.getItem('token') || localStorage.getItem('authToken');
        if (token) {
            return null; // Will redirect
        }
    }

    // User is not authenticated, render children (auth pages)
    return <>{children}</>;
}

