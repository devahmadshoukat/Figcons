"use client";
import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { paymentAPI } from "@/commons/Api";
import Link from "next/link";

function PaymentSuccessContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
    const [message, setMessage] = useState("Verifying your payment...");
    const [countdown, setCountdown] = useState(5);

    useEffect(() => {
        const confirmPayment = async () => {
            try {
                // Get session_id from query params
                const sessionId = searchParams.get('session_id');

                if (!sessionId) {
                    setStatus('error');
                    setMessage('No payment session found');
                    return;
                }

                // Confirm payment with backend
                const response = await paymentAPI.confirmPayment(sessionId);

                if (response.success) {
                    setStatus('success');
                    setMessage('Payment successful! Your premium access is now active.');

                    // Start countdown
                    let count = 5;
                    const interval = setInterval(() => {
                        count--;
                        setCountdown(count);
                        if (count <= 0) {
                            clearInterval(interval);
                            router.push('/icons');
                        }
                    }, 1000);

                    return () => clearInterval(interval);
                }
            } catch (error: any) {
                console.error('Payment confirmation error:', error);
                setStatus('error');
                setMessage(error.message || 'Payment verification failed. Please contact support.');
            }
        };

        confirmPayment();
    }, [searchParams, router]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#F6F6F6] to-white p-[20px]">
            <div className="bg-white p-[40px] rounded-[24px] shadow-lg max-w-[500px] w-full">
                <div className="flex flex-col items-center gap-[24px] text-center">
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

                    {/* Title */}
                    <div className="flex flex-col gap-[12px]">
                        <h1 className="text-[#0E0E0E] text-[28px] font-[700]">
                            {status === 'verifying' && 'Verifying Payment'}
                            {status === 'success' && 'Payment Successful!'}
                            {status === 'error' && 'Payment Failed'}
                        </h1>
                        <p className="text-[#0E0E0E] text-[16px] font-[400] leading-[24px]">
                            {message}
                        </p>
                    </div>

                    {/* Countdown for success */}
                    {status === 'success' && (
                        <div className="text-center">
                            <p className="text-[#B7B7B7] text-[14px]">
                                Redirecting to icons in <span className="font-[700] text-[#E84C88]">{countdown}</span> seconds...
                            </p>
                        </div>
                    )}

                    {/* Action buttons for error state */}
                    {status === 'error' && (
                        <div className="flex flex-col gap-[12px] w-full mt-[12px]">
                            <Link href="/pricing">
                                <button className="w-full h-[48px] bg-[#E84C88] text-white font-[700] text-[14px] leading-[20px] rounded-full hover:bg-[#d43d75] transition-colors">
                                    Try Again
                                </button>
                            </Link>
                            <Link href="/icons">
                                <button className="w-full h-[48px] bg-[#F6F6F6] text-[#0E0E0E] font-[600] text-[14px] leading-[20px] rounded-full hover:bg-[#e5e5e5] transition-colors">
                                    Go to Icons
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
                                    {status === 'verifying' && 'Please Wait'}
                                </h3>
                                <p className="text-[#0E0E0E] text-[12px] font-[400] leading-[18px]">
                                    {status === 'success' && 'You now have access to all premium icons and features. Start exploring the full library!'}
                                    {status === 'error' && 'If you were charged but see this error, please contact support with your payment details.'}
                                    {status === 'verifying' && 'We\'re confirming your payment with our payment provider. This usually takes just a few seconds.'}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function PaymentSuccessPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-[#b7b7b7] text-[14px]">Loading...</div>
            </div>
        }>
            <PaymentSuccessContent />
        </Suspense>
    );
}
