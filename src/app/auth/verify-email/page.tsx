"use client";
import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/commons/AuthContext';
import ProtectedRoute from '@/commons/ProtectedRoute';
import Appbar from '@/components/Appbar';
import Footer from '@/components/Footer';
import { BACKEND_URL } from "@/commons/Api";

function VerifyEmailContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { login } = useAuth();
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const [message, setMessage] = useState('');
    const [user, setUser] = useState<{ id: string; username: string; email: string } | null>(null);

    useEffect(() => {
        const verifyEmail = async () => {
            const token = searchParams.get('token');
            
            if (!token) {
                setStatus('error');
                setMessage('No verification token provided');
                return;
            }

            try {
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || BACKEND_URL}/api/auth/verify-email?token=${token}`);
                const data = await response.json();

                if (data.success) {
                    setStatus('success');
                    setMessage(data.message);
                    setUser(data.user);
                    
                    // Auto-login the user after successful verification
                    const loginToken = generateToken(data.user.id);
                    login(loginToken, data.user);
                    
                    // Redirect to home after 3 seconds
                    setTimeout(() => {
                        router.push('/');
                    }, 3000);
                } else {
                    setStatus('error');
                    setMessage(data.message);
                }
            } catch (error) {
                console.error('Email verification error:', error);
                setStatus('error');
                setMessage('Failed to verify email. Please try again.');
            }
        };

        verifyEmail();
    }, [searchParams, login, router]);

    const handleResendEmail = async () => {
        if (!user?.email) return;
        
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || BACKEND_URL}/api/auth/resend-verification`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email: user.email })
            });

            const data = await response.json();
            
            if (data.success) {
                setMessage('Verification email sent successfully!');
            } else {
                setMessage('Failed to resend verification email');
            }
        } catch (error) {
            console.error('Resend email error:', error);
            setMessage('Failed to resend verification email');
        }
    };

    const generateToken = (userId: string) => {
        // This is a simplified token generation for demo purposes
        // In production, you should use proper JWT generation
        return btoa(JSON.stringify({ userId, timestamp: Date.now() }));
    };

    return (
        <ProtectedRoute requireAuth={false}>
            <Appbar />
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-md w-full space-y-8">
                    <div className="text-center">
                        <div className="mx-auto h-16 w-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                            {status === 'loading' && (
                                <svg className="animate-spin h-8 w-8 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                            )}
                            {status === 'success' && (
                                <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                                </svg>
                            )}
                            {status === 'error' && (
                                <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                                </svg>
                            )}
                        </div>
                        <h2 className="mt-6 text-3xl font-bold text-gray-900">
                            {status === 'loading' && 'Verifying Email...'}
                            {status === 'success' && 'Email Verified!'}
                            {status === 'error' && 'Verification Failed'}
                        </h2>
                        <p className="mt-2 text-sm text-gray-600">
                            {status === 'loading' && 'Please wait while we verify your email address'}
                            {status === 'success' && 'Your email has been successfully verified'}
                            {status === 'error' && 'There was a problem verifying your email'}
                        </p>
                    </div>

                    <div className="bg-white py-8 px-6 shadow-xl rounded-lg">
                        <div className="text-center">
                            {status === 'success' && (
                                <div className="space-y-4">
                                    <div className="text-green-600 text-lg font-semibold">
                                        🎉 Welcome to Figcons!
                                    </div>
                                    <p className="text-gray-700">
                                        Your account has been successfully verified. You can now access all features of our platform.
                                    </p>
                                    {user && (
                                        <div className="bg-gray-50 p-4 rounded-lg">
                                            <p className="text-sm text-gray-600">
                                                Logged in as: <span className="font-semibold">{user.username}</span>
                                            </p>
                                            <p className="text-sm text-gray-600">
                                                Email: <span className="font-semibold">{user.email}</span>
                                            </p>
                                        </div>
                                    )}
                                    <div className="text-sm text-gray-500">
                                        Redirecting to home page in 3 seconds...
                                    </div>
                                    <button
                                        onClick={() => router.push('/')}
                                        className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 px-4 rounded-lg font-semibold hover:from-blue-600 hover:to-purple-700 transition-all duration-200 transform hover:scale-105"
                                    >
                                        Go to Home Page
                                    </button>
                                </div>
                            )}

                            {status === 'error' && (
                                <div className="space-y-4">
                                    <div className="text-red-600 text-lg font-semibold">
                                        Verification Failed
                                    </div>
                                    <p className="text-gray-700">
                                        {message}
                                    </p>
                                    <div className="space-y-3">
                                        <button
                                            onClick={handleResendEmail}
                                            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors duration-200"
                                        >
                                            Resend Verification Email
                                        </button>
                                        <button
                                            onClick={() => router.push('/auth/signup')}
                                            className="w-full bg-gray-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-gray-700 transition-colors duration-200"
                                        >
                                            Back to Sign Up
                                        </button>
                                    </div>
                                </div>
                            )}

                            {status === 'loading' && (
                                <div className="space-y-4">
                                    <div className="animate-pulse">
                                        <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto mb-2"></div>
                                        <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="text-center">
                        <p className="text-xs text-gray-500">
                            Having trouble? Contact our support team for assistance.
                        </p>
                    </div>
                </div>
            </div>
            <Footer />
        </ProtectedRoute>
    );
}

export default function VerifyEmail() {
    return (
        <Suspense fallback={
            <ProtectedRoute requireAuth={false}>
                <Appbar />
                <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
                    <div className="max-w-md w-full space-y-8">
                        <div className="text-center">
                            <div className="mx-auto h-16 w-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                                <svg className="animate-spin h-8 w-8 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                            </div>
                            <h2 className="mt-6 text-3xl font-bold text-gray-900">Verifying Email...</h2>
                            <p className="mt-2 text-sm text-gray-600">Please wait while we verify your email address</p>
                        </div>
                    </div>
                </div>
                <Footer />
            </ProtectedRoute>
        }>
            <VerifyEmailContent />
        </Suspense>
    );
}
