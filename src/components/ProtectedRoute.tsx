"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/commons/AuthContext';

interface ProtectedRouteProps {
    children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
    const { isAuthenticated, isLoading } = useAuth();
    const router = useRouter();
    const [isChecking, setIsChecking] = useState(true);

    useEffect(() => {
        // Also check localStorage token as fallback (in case AuthContext hasn't loaded yet)
        const token = localStorage.getItem('token') || localStorage.getItem('authToken');
        
        if (!isLoading && !isAuthenticated && !token) {
            // User is not authenticated, redirect to login
            router.push('/auth/signin');
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

    // If not authenticated, don't render children (will redirect)
    if (!isAuthenticated) {
        const token = localStorage.getItem('token') || localStorage.getItem('authToken');
        if (!token) {
            return null; // Will redirect
        }
    }

    // User is authenticated, render children
    return <>{children}</>;
}

