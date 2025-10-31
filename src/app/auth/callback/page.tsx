"use client";
import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { setAuthToken } from "@/commons/Api";

function CallbackContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [message, setMessage] = useState("Processing authentication...");

    useEffect(() => {
        const handleCallback = () => {
            try {
                // Get query parameters
                const token = searchParams.get('token');
                const success = searchParams.get('success');
                const user = searchParams.get('user');
                const error = searchParams.get('error');

                // Check for errors
                if (error || success === 'false') {
                    setMessage(`Authentication failed: ${error || 'Unknown error'}`);
                    setTimeout(() => {
                        router.push('/auth/signin');
                    }, 3000);
                    return;
                }

                // Check if token exists
                if (!token) {
                    setMessage('No token received. Redirecting to signin...');
                    setTimeout(() => {
                        router.push('/auth/signin');
                    }, 2000);
                    return;
                }

                // Save token
                setAuthToken(token);

                // Parse user data (optional, for display)
                let userData = null;
                if (user) {
                    try {
                        userData = JSON.parse(decodeURIComponent(user));
                        console.log('User logged in:', userData);
                    } catch (e) {
                        console.error('Failed to parse user data:', e);
                    }
                }

                // Show success message
                setMessage('Authentication successful! Redirecting to home...');

                // Redirect to home page after 1 second
                setTimeout(() => {
                    router.push('/');
                }, 1000);

            } catch (error) {
                console.error('Callback error:', error);
                setMessage('Something went wrong. Redirecting to signin...');
                setTimeout(() => {
                    router.push('/auth/signin');
                }, 3000);
            }
        };

        handleCallback();
    }, [searchParams, router]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#F6F6F6] to-white">
            <div className="bg-white p-[40px] rounded-[24px] shadow-lg max-w-[500px] w-full mx-[20px]">
                <div className="flex flex-col items-center gap-[24px]">
                    {/* Loading Spinner */}
                    <div className="relative w-[80px] h-[80px]">
                        <div className="absolute inset-0 border-4 border-[#E84C88] border-t-transparent rounded-full animate-spin"></div>
                        <div className="absolute inset-[8px] border-4 border-[#7AE684] border-t-transparent rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1s' }}></div>
                    </div>

                    {/* Message */}
                    <div className="text-center">
                        <h1 className="text-[#0E0E0E] text-[24px] font-[700] mb-[12px]">
                            Please Wait
                        </h1>
                        <p className="text-[#0E0E0E] text-[16px] font-[400]">
                            {message}
                        </p>
                    </div>

                    {/* Progress Dots */}
                    <div className="flex gap-[8px]">
                        <div className="w-[8px] h-[8px] bg-[#E84C88] rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
                        <div className="w-[8px] h-[8px] bg-[#E84C88] rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        <div className="w-[8px] h-[8px] bg-[#E84C88] rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function CallbackPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-[#b7b7b7] text-[14px]">Loading...</div>
            </div>
        }>
            <CallbackContent />
        </Suspense>
    );
}
