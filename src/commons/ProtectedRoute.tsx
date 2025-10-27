"use client";
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/commons/AuthContext';

interface ProtectedRouteProps {
    children: React.ReactNode;
    redirectTo?: string;
    requireAuth?: boolean;
}

export default function ProtectedRoute({ 
    children, 
    redirectTo = '/auth/signin', 
    requireAuth = true 
}: ProtectedRouteProps) {
    const { isAuthenticated, isLoading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!isLoading) {
            if (requireAuth && !isAuthenticated) {
                router.push(redirectTo);
            } else if (!requireAuth && isAuthenticated) {
                router.push('/');
            }
        }
    }, [isAuthenticated, isLoading, router, redirectTo, requireAuth]);

    // Show loading while checking authentication
    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0e0e0e] mx-auto mb-4"></div>
                    <p className="text-[#0e0e0e] text-[18px] font-[600]">Loading...</p>
                </div>
            </div>
        );
    }

    // Show loading while redirecting
    if (requireAuth && !isAuthenticated) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0e0e0e] mx-auto mb-4"></div>
                    <p className="text-[#0e0e0e] text-[18px] font-[600]">Redirecting to login...</p>
                </div>
            </div>
        );
    }

    if (!requireAuth && isAuthenticated) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0e0e0e] mx-auto mb-4"></div>
                    <p className="text-[#0e0e0e] text-[18px] font-[600]">Redirecting to home...</p>
                </div>
            </div>
        );
    }

    return <>{children}</>;
}
