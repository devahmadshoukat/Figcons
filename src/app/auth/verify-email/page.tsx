"use client";
import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { authAPI, setAuthToken } from "@/commons/Api";
import Link from "next/link";
import GuestRoute from "@/components/GuestRoute";

function VerifyEmailContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [status, setStatus] = useState<'verifying' | 'success' | 'error' | 'missing'>('verifying');
    const [message, setMessage] = useState("Verifying your email...");
    const [countdown, setCountdown] = useState(5);
    const [resendLoading, setResendLoading] = useState(false);
    const [resendMessage, setResendMessage] = useState("");

    useEffect(() => {
        const verifyEmail = async () => {
            try {
                // Get token from query params
                const token = searchParams.get('token');

                // Check if token exists
                if (!token) {
                    setStatus('missing');
                    setMessage('No verification token provided');
                    return;
                }

                // Call backend to verify email
                const response = await authAPI.verifyEmail(token);

                if (response.success) {
                    setStatus('success');
                    setMessage(response.message || 'Email verified successfully!');

                    // If token is returned, save it (user is now logged in)
                    if (response.token) {
                        setAuthToken(response.token);
                    }

                    // Start countdown
                    let count = 5;
                    const interval = setInterval(() => {
                        count--;
                        setCountdown(count);
                        if (count <= 0) {
                            clearInterval(interval);
                            // Redirect based on whether user is logged in
                            if (response.token) {
                                router.push('/');
                            } else {
                                router.push('/auth/signin');
                            }
                        }
                    }, 1000);

                    return () => clearInterval(interval);
                }
            } catch (error: any) {
                console.error('Verification error:', error);
                setStatus('error');
                setMessage(error.message || 'Email verification failed. The link may be invalid or expired.');
            }
        };

        verifyEmail();
    }, [searchParams, router]);

    const handleResendVerification = async () => {
        setResendLoading(true);
        setResendMessage("");
        
        try {
            // Note: This requires the user to be logged in
            // If not logged in, redirect to signin
            const response = await authAPI.resendVerification();
            
            if (response.success) {
                setResendMessage("Verification email sent! Please check your inbox.");
            }
        } catch (error: any) {
            if (error.message.includes('No token provided') || error.message.includes('authentication')) {
                setResendMessage("Please sign in first to resend verification email.");
                setTimeout(() => {
                    router.push('/auth/signin');
                }, 2000);
            } else {
                setResendMessage(error.message || "Failed to send verification email. Please try again.");
            }
        } finally {
            setResendLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#F6F6F6] to-white p-[20px]">
            <div className="bg-white p-[40px] rounded-[24px] shadow-lg max-w-[500px] w-full">
                <div className="flex flex-col items-center gap-[24px]">
                    {/* Icon based on status */}
                    {status === 'verifying' && (
                        <div className="relative w-[80px] h-[80px]">
                            <div className="absolute inset-0 border-4 border-[#E84C88] border-t-transparent rounded-full animate-spin"></div>
                            <div className="absolute inset-[8px] border-4 border-[#7AE684] border-t-transparent rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1s' }}></div>
                        </div>
                    )}

                    {status === 'success' && (
                        <div className="relative w-[80px] h-[80px] flex items-center justify-center">
                            <div className="absolute inset-0 bg-[#7AE684] rounded-full opacity-20 animate-ping"></div>
                            <svg 
                                className="w-[80px] h-[80px] text-[#7AE684]" 
                                fill="none" 
                                stroke="currentColor" 
                                viewBox="0 0 24 24"
                            >
                                <path 
                                    strokeLinecap="round" 
                                    strokeLinejoin="round" 
                                    strokeWidth={2} 
                                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" 
                                />
                            </svg>
                        </div>
                    )}

                    {status === 'error' && (
                        <div className="relative w-[80px] h-[80px] flex items-center justify-center">
                            <div className="absolute inset-0 bg-[#E84C88] rounded-full opacity-20"></div>
                            <svg 
                                className="w-[80px] h-[80px] text-[#E84C88]" 
                                fill="none" 
                                stroke="currentColor" 
                                viewBox="0 0 24 24"
                            >
                                <path 
                                    strokeLinecap="round" 
                                    strokeLinejoin="round" 
                                    strokeWidth={2} 
                                    d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" 
                                />
                            </svg>
                        </div>
                    )}

                    {status === 'missing' && (
                        <div className="relative w-[80px] h-[80px] flex items-center justify-center">
                            <div className="absolute inset-0 bg-[#B7B7B7] rounded-full opacity-20"></div>
                            <svg 
                                className="w-[80px] h-[80px] text-[#B7B7B7]" 
                                fill="none" 
                                stroke="currentColor" 
                                viewBox="0 0 24 24"
                            >
                                <path 
                                    strokeLinecap="round" 
                                    strokeLinejoin="round" 
                                    strokeWidth={2} 
                                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" 
                                />
                            </svg>
                        </div>
                    )}

                    {/* Title */}
                    <div className="text-center">
                        <h1 className="text-[#0E0E0E] text-[28px] font-[700] mb-[12px]">
                            {status === 'verifying' && 'Verifying Email'}
                            {status === 'success' && 'Email Verified!'}
                            {status === 'error' && 'Verification Failed'}
                            {status === 'missing' && 'Invalid Link'}
                        </h1>
                        <p className="text-[#0E0E0E] text-[16px] font-[400] leading-[24px]">
                            {message}
                        </p>
                    </div>

                    {/* Countdown for success */}
                    {status === 'success' && (
                        <div className="text-center">
                            <p className="text-[#B7B7B7] text-[14px]">
                                Redirecting in <span className="font-[700] text-[#E84C88]">{countdown}</span> seconds...
                            </p>
                        </div>
                    )}

                    {/* Action buttons for error/missing states */}
                    {(status === 'error' || status === 'missing') && (
                        <div className="flex flex-col gap-[12px] w-full mt-[12px]">
                            {/* Resend verification button (only for error, not missing) */}
                            {status === 'error' && (
                                <>
                                    <button 
                                        onClick={handleResendVerification}
                                        disabled={resendLoading}
                                        className="w-full h-[48px] bg-[#7AE684] text-[#2D6332] font-[700] text-[14px] leading-[20px] rounded-full hover:bg-[#6bd674] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {resendLoading ? "Sending..." : "Resend Verification Email"}
                                    </button>
                                    
                                    {resendMessage && (
                                        <div className={`p-3 rounded-lg text-[12px] text-center ${
                                            resendMessage.includes('sent') || resendMessage.includes('success')
                                                ? "bg-green-100 text-green-700" 
                                                : "bg-red-100 text-red-700"
                                        }`}>
                                            {resendMessage}
                                        </div>
                                    )}
                                </>
                            )}
                            
                            <Link href="/auth/signin">
                                <button className="w-full h-[48px] bg-[#E84C88] text-white font-[700] text-[14px] leading-[20px] rounded-full hover:bg-[#d43d75] transition-colors">
                                    Go to Sign In
                                </button>
                            </Link>
                            <Link href="/auth/signup">
                                <button className="w-full h-[48px] bg-[#F6F6F6] text-[#0E0E0E] font-[600] text-[14px] leading-[20px] rounded-full hover:bg-[#e5e5e5] transition-colors">
                                    Create New Account
                                </button>
                            </Link>
                        </div>
                    )}

                    {/* Loading dots for verifying state */}
                    {status === 'verifying' && (
                        <div className="flex gap-[8px]">
                            <div className="w-[8px] h-[8px] bg-[#E84C88] rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
                            <div className="w-[8px] h-[8px] bg-[#E84C88] rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                            <div className="w-[8px] h-[8px] bg-[#E84C88] rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                        </div>
                    )}

                    {/* Info box */}
                    <div className="w-full bg-[#F6F6F6] rounded-[16px] p-[20px] mt-[12px]">
                        <div className="flex gap-[12px] items-start">
                            <svg 
                                className="w-[20px] h-[20px] text-[#E84C88] flex-shrink-0 mt-[2px]" 
                                fill="currentColor" 
                                viewBox="0 0 20 20"
                            >
                                <path 
                                    fillRule="evenodd" 
                                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" 
                                    clipRule="evenodd" 
                                />
                            </svg>
                            <div className="flex flex-col gap-[4px]">
                                <h3 className="text-[#0E0E0E] text-[14px] font-[600]">
                                    {status === 'success' && 'What\'s Next?'}
                                    {status === 'error' && 'Need Help?'}
                                    {status === 'missing' && 'About Verification'}
                                    {status === 'verifying' && 'Please Wait'}
                                </h3>
                                <p className="text-[#0E0E0E] text-[12px] font-[400] leading-[18px]">
                                    {status === 'success' && 'Your account is now verified. You can now access all features and start using Figcons!'}
                                    {status === 'error' && 'If you continue to have issues, please request a new verification email from your profile settings.'}
                                    {status === 'missing' && 'Verification links are sent to your email when you register. Please check your inbox and spam folder.'}
                                    {status === 'verifying' && 'We\'re verifying your email address. This usually takes just a few seconds.'}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function VerifyEmailPage() {
    return (
        <GuestRoute>
            <Suspense fallback={
                <div className="min-h-screen flex items-center justify-center">
                    <div className="text-[#b7b7b7] text-[14px]">Loading...</div>
                </div>
            }>
                <VerifyEmailContent />
            </Suspense>
        </GuestRoute>
    );
}
