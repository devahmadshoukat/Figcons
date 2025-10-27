"use client";
import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { GridBox } from "@/commons/GridBox";
import Appbar from "@/components/Appbar";
import Footer from "@/components/Footer";
import { useAuth } from "@/commons/AuthContext";

function AuthCallbackContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { login, isAuthenticated } = useAuth();
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const [message, setMessage] = useState('');
    const [countdown, setCountdown] = useState(3);
    const [hasProcessed, setHasProcessed] = useState(false);

    // Redirect if already authenticated and no callback parameters
    useEffect(() => {
        const token = searchParams.get('token');
        const success = searchParams.get('success');
        
        if (isAuthenticated && !token && !success) {
            router.push('/');
        }
    }, [isAuthenticated, searchParams, router]);

    useEffect(() => {
        // Prevent multiple executions
        if (hasProcessed) return;
        
        const handleCallback = async () => {
            try {
                const token = searchParams.get('token');
                const success = searchParams.get('success');
                const userData = searchParams.get('user');
                const error = searchParams.get('error');

                console.log('Callback params:', { token, success, userData, error });

                // Mark as processed to prevent re-execution
                setHasProcessed(true);

                if (success === 'false' || error) {
                    setStatus('error');
                    setMessage(error || 'Authentication failed');
                    return;
                }

                if (token && success === 'true') {
                    // Use auth context login method
                    if (userData) {
                        try {
                            const user = JSON.parse(decodeURIComponent(userData));
                            console.log('Parsed user data:', user);
                            login(token, user);
                        } catch (parseError) {
                            console.error('Error parsing user data:', parseError);
                            setStatus('error');
                            setMessage('Invalid user data received');
                            return;
                        }
                    }

                    setStatus('success');
                    setMessage('Successfully authenticated!');

                    // Start countdown and redirect
                    const countdownInterval = setInterval(() => {
                        setCountdown((prev) => {
                            if (prev <= 1) {
                                clearInterval(countdownInterval);
                                // Use setTimeout to avoid updating Router during render
                                setTimeout(() => {
                                    router.push('/');
                                }, 0);
                                return 0;
                            }
                            return prev - 1;
                        });
                    }, 1000);

                    return () => clearInterval(countdownInterval);
                } else {
                    setStatus('error');
                    setMessage('Invalid authentication response');
                }
            } catch (error) {
                console.error('Callback error:', error);
                setStatus('error');
                setMessage('An error occurred during authentication');
            }
        };

        handleCallback();
    }, [searchParams, router, login, hasProcessed]);

    const handleRetry = () => {
        router.push('/auth/signup');
    };

    const handleGoHome = () => {
        router.push('/');
    };

    return (
        <div>
            <Appbar />
            {isAuthenticated && !searchParams.get('token') && !searchParams.get('success') ? (
                <div className="min-h-screen flex items-center justify-center">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0e0e0e] mx-auto mb-4"></div>
                        <p className="text-[#0e0e0e] text-[18px] font-[600]">Redirecting to home...</p>
                    </div>
                </div>
            ) : (
                <>
                    <GridBox
                        classNameChild1="px-[16px] md:px-[64px] py-[40px] md:py-[64px]"
                        classNameChild3="px-[16px] md:px-[64px] py-[40px] md:py-[64px]"
                        classNameChild4="px-[0] md:px-[64px]"
                        classNameChild5="px-[16px] md:px-[0] py-[40px] md:py-[64px]"
                        classNameChild6={true}
                        classNameChild7={true}
                        classNameChild8={true}
                        classNameChild9="px-[16px] md:px-[64px] py-[40px] md:py-[64px]"
                        classNameChild11="px-[16px] md:px-[0] py-[40px] md:py-[64px]"
                    >
                <div className="w-full min-h-[60vh] flex items-center justify-center">
                    <div className="text-center max-w-md mx-auto">
                        {status === 'loading' && (
                            <div className="space-y-6">
                                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#0e0e0e] mx-auto"></div>
                                <div>
                                    <p className="text-[#0e0e0e] text-[20px] font-[700] mb-2">Processing Authentication</p>
                                    <p className="text-[#B7B7B7] text-[14px]">Please wait while we verify your credentials...</p>
                                </div>
                            </div>
                        )}
                        
                        {status === 'success' && (
                            <div className="space-y-6">
                                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                                    <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-[#0e0e0e] text-[20px] font-[700] mb-2">Authentication Successful!</p>
                                    <p className="text-[#B7B7B7] text-[14px] mb-4">{message}</p>
                                    <div className="bg-green-50 border border-green-200 rounded-full p-4">
                                        <p className="text-green-700 text-[14px] font-[600]">
                                            Redirecting to home page in {countdown} second{countdown !== 1 ? 's' : ''}...
                                        </p>
                                    </div>
                                </div>
                                <div className="flex gap-3 justify-center">
                                    <button 
                                        onClick={handleGoHome}
                                        className="px-6 py-3 bg-[#0e0e0e] text-white rounded-full hover:bg-[#333] transition-colors text-[14px] font-[600]"
                                    >
                                        Go Home Now
                                    </button>
                                </div>
                            </div>
                        )}
                        
                        {status === 'error' && (
                            <div className="space-y-6">
                                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                                    <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-[#0e0e0e] text-[20px] font-[700] mb-2">Authentication Failed</p>
                                    <p className="text-[#B7B7B7] text-[14px] mb-4">{message}</p>
                                    <div className="bg-red-50 border border-red-200 rounded-full p-4">
                                        <p className="text-red-700 text-[14px]">
                                            There was an issue with your authentication. Please try again.
                                        </p>
                                    </div>
                                </div>
                                <div className="flex gap-3 justify-center">
                                    <button 
                                        onClick={handleRetry}
                                        className="px-6 py-3 bg-[#0e0e0e] text-white rounded-full hover:bg-[#333] transition-colors text-[14px] font-[600]"
                                    >
                                        Try Again
                                    </button>
                                    <button 
                                        onClick={handleGoHome}
                                        className="px-6 py-3 bg-[#f6f6f6] text-[#0e0e0e] rounded-full hover:bg-[#e0e0e0] transition-colors text-[14px] font-[600]"
                                    >
                                        Go Home
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
                    </GridBox>
                    <Footer />
                </>
            )}
        </div>
    );
}

export default function AuthCallback() {
    return (
        <Suspense fallback={
            <div>
                <Appbar />
                <div className="min-h-screen flex items-center justify-center">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0e0e0e] mx-auto mb-4"></div>
                        <p className="text-[#0e0e0e] text-[18px] font-[600]">Loading...</p>
                    </div>
                </div>
                <Footer />
            </div>
        }>
            <AuthCallbackContent />
        </Suspense>
    );
}
