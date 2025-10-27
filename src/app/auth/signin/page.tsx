"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { GridBox } from "@/commons/GridBox";
import Appbar from "@/components/Appbar";
import Footer from "@/components/Footer";
import { useAuth } from "@/commons/AuthContext";
import ProtectedRoute from "@/commons/ProtectedRoute";

export default function Signin() {
    const router = useRouter();
    const { login } = useAuth();
    const [formData, setFormData] = useState({
        identifier: '',
        password: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');


    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        setError('');
    };

    const handleGoogleSignin = () => {
        // Redirect to backend Google OAuth
        window.location.href = `${process.env.NEXT_PUBLIC_API_URL || 'https://figcons.vercel.app'}/api/auth/google`;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        // Validation
        if (!formData.identifier || !formData.password) {
            setError('Email/username and password are required');
            return;
        }

        setLoading(true);

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://figcons.vercel.app'}/api/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    identifier: formData.identifier,
                    password: formData.password
                })
            });

            const data = await response.json();

            if (data.success) {
                setSuccess('Successfully signed in!');
                // Use auth context login method
                login(data.token, data.user);
                
                // Redirect to callback page for consistency
                setTimeout(() => {
                    router.push('/auth/callback?token=' + encodeURIComponent(data.token) + '&success=true&user=' + encodeURIComponent(JSON.stringify(data.user)));
                }, 1500);
            } else {
                setError(data.message || 'Login failed');
            }
        } catch (error) {
            console.error('Signin error:', error);
            setError('Network error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <ProtectedRoute requireAuth={false}>
            <Appbar />
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
                <div className="w-full max-w-md mx-auto">
                    <div className="text-center mb-8">
                        <h1 className="text-[32px] md:text-[40px] font-[800] text-[#0e0e0e] mb-2">Sign In</h1>
                        <p className="text-[#B7B7B7] text-[14px]">Welcome back! Sign in to your account</p>
                    </div>

                    {/* Google Signin Button */}
                    <button
                        onClick={handleGoogleSignin}
                        className="w-full flex items-center justify-center gap-3 px-6 py-3 border border-[#e0e0e0] rounded-full hover:bg-[#f9f9f9] transition-colors mb-6"
                    >
                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                        </svg>
                        <span className="text-[14px] font-[600] text-[#0e0e0e]">Continue with Google</span>
                    </button>

                    <div className="relative mb-6">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-[#e0e0e0]"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-2 bg-white text-[#B7B7B7]">Or</span>
                        </div>
                    </div>

                    {/* Signin Form */}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label htmlFor="identifier" className="block text-[14px] font-[600] text-[#0e0e0e] mb-2">
                                Email or Username
                            </label>
                            <input
                                type="text"
                                id="identifier"
                                name="identifier"
                                value={formData.identifier}
                                onChange={handleInputChange}
                                className="w-full px-4 py-3 border border-[#e0e0e0] rounded-full focus:outline-none focus:border-[#0e0e0e] transition-colors"
                                placeholder="Enter your email or username"
                                required
                            />
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-[14px] font-[600] text-[#0e0e0e] mb-2">
                                Password
                            </label>
                            <input
                                type="password"
                                id="password"
                                name="password"
                                value={formData.password}
                                onChange={handleInputChange}
                                className="w-full px-4 py-3 border border-[#e0e0e0] rounded-full focus:outline-none focus:border-[#0e0e0e] transition-colors"
                                placeholder="Enter your password"
                                required
                            />
                        </div>

                        {error && (
                            <div className="p-3 bg-red-50 border border-red-200 rounded-full">
                                <p className="text-red-600 text-[14px] text-center">{error}</p>
                            </div>
                        )}

                        {success && (
                            <div className="p-3 bg-green-50 border border-green-200 rounded-full">
                                <p className="text-green-600 text-[14px] text-center">{success}</p>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full px-6 py-3 bg-[#0e0e0e] text-white rounded-full hover:bg-[#333] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Signing In...' : 'Sign In'}
                        </button>
                    </form>

                    <div className="text-center mt-6">
                        <p className="text-[#B7B7B7] text-[14px]">
                            Don&apos;t have an account?{' '}
                            <button
                                onClick={() => router.push('/auth/signup')}
                                className="text-[#0e0e0e] font-[600] hover:underline"
                            >
                                Sign Up
                            </button>
                        </p>
                    </div>
                </div>
            </GridBox>
            <Footer />
        </ProtectedRoute>
    );
}
