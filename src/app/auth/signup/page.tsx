"use client";
import { assets } from "@/public/assets";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Input, { LinkAccount } from "@/commons/Input";
import { authAPI, seatAPI, setAuthToken } from "@/commons/Api";

function SignupForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const inviteToken = searchParams.get('inviteToken');
    const invitedEmail = searchParams.get('email');
    
    const [formData, setFormData] = useState({
        name: "",
        email: invitedEmail || "",
        password: "",
        confirmPassword: "",
    });
    const [errors, setErrors] = useState({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
    });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: "", text: "" });
    const [showEmailModal, setShowEmailModal] = useState(false);
    const [registeredEmail, setRegisteredEmail] = useState("");
    const [hasInvitation, setHasInvitation] = useState(false);

    // Check if user came from invitation
    useEffect(() => {
        if (inviteToken && invitedEmail) {
            setHasInvitation(true);
            setFormData(prev => ({ ...prev, email: invitedEmail }));
        }
    }, [inviteToken, invitedEmail]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        // Clear error when user types
        if (errors[name as keyof typeof errors]) {
            setErrors((prev) => ({ ...prev, [name]: "" }));
        }
    };

    const validateForm = () => {
        const newErrors = {
            name: "",
            email: "",
            password: "",
            confirmPassword: "",
        };
        let isValid = true;

        // Validate name
        if (!formData.name.trim()) {
            newErrors.name = "Full name is required";
            isValid = false;
        } else if (formData.name.trim().length < 2) {
            newErrors.name = "Name must be at least 2 characters";
            isValid = false;
        }

        // Validate email
        if (!formData.email.trim()) {
            newErrors.email = "Email is required";
            isValid = false;
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = "Email is invalid";
            isValid = false;
        }

        // Validate password
        if (!formData.password) {
            newErrors.password = "Password is required";
            isValid = false;
        } else if (formData.password.length < 6) {
            newErrors.password = "Password must be at least 6 characters";
            isValid = false;
        }

        // Validate confirm password
        if (!formData.confirmPassword) {
            newErrors.confirmPassword = "Please confirm your password";
            isValid = false;
        } else if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = "Passwords do not match";
            isValid = false;
        }

        setErrors(newErrors);
        return isValid;
    };

        const handleSubmit = async (e: React.FormEvent) => {
            e.preventDefault();
            
            if (!validateForm()) return;

            setLoading(true);
            setMessage({ type: "", text: "" });

            try {
                const response = await authAPI.register({
                    name: formData.name,
                    email: formData.email,
                    password: formData.password,
                });

                if (response.success) {
                    // If user registered via invitation, handle automatic acceptance
                    if (hasInvitation && inviteToken) {
                        try {
                            // Login the user first
                            const loginResponse = await authAPI.login({
                                email: formData.email,
                                password: formData.password,
                            });

                            if (loginResponse.success && loginResponse.token) {
                                setAuthToken(loginResponse.token);
                                
                                // Find the invitation by token
                                const statusResponse = await seatAPI.getStatus();
                                const invitation = statusResponse.receivedInvitations?.find(
                                    (inv: any) => inv.invitationToken === inviteToken && inv.status === 'pending'
                                );

                                if (invitation) {
                                    // Accept the invitation
                                    const acceptResponse = await seatAPI.accept(invitation._id);
                                    
                                    if (acceptResponse.success) {
                                        // Show success message and redirect to home
                                        setMessage({ 
                                            type: "success", 
                                            text: "Account created and premium access activated! Redirecting..." 
                                        });
                                        
                                        setTimeout(() => {
                                            router.push('/');
                                        }, 2000);
                                        return;
                                    }
                                }
                            }
                        } catch (inviteError) {
                            console.error('Failed to auto-accept invitation:', inviteError);
                            // Continue with normal flow if invitation acceptance fails
                        }
                    }
                    
                    // Normal flow: Store email and show modal
                    setRegisteredEmail(formData.email);
                    setShowEmailModal(true);
                    
                    // Clear form
                    setFormData({
                        name: "",
                        email: "",
                        password: "",
                        confirmPassword: "",
                    });
                }
            } catch (error: any) {
                setMessage({ 
                    type: "error", 
                    text: error.message || "Registration failed. Please try again." 
                });
            } finally {
                setLoading(false);
            }
        };

    return (
        <div className="p-[20px] flex">
            {/* LEFT PANEL */}
            <div className="bg-[#F6F6F6] rounded-[24px] w-[364px] min-h-[calc(100vh-40px)] hidden md:flex flex-col justify-between">
                <div className="p-[32px] flex flex-col gap-[32px]">
                    <div dangerouslySetInnerHTML={{ __html: assets.logo }} />
                    <div className="flex flex-col gap-[12px]">
                        <h1 className="text-[#0E0E0E] font-[800] text-[40px] leading-[48px]">
                            Discover & Use Beautiful{" "}
                            <span className="text-[#B7B7B7]">Icons & Illustrations!</span>
                        </h1>
                        <p className="text-[#0E0E0E] text-[14px] font-[400] leading-[20px]">
                            A free design library with 1000+ assets — crafted for websites,
                            apps, and creative projects.
                        </p>
                    </div>
                </div>
                <Image
                    src="/IconShowcase2.svg"
                    alt="IconShowcase"
                    width={9999}
                    height={9999}
                    className="w-[100%] h-[420px] object-contain"
                />
            </div>

            {/* RIGHT PANEL */}
            <div className="pt-[30px] md:pt-[72px] w-[100%] md:w-[calc(100%-364px)] rounded-[24px] flex flex-col gap-[48px] justify-center items-center md:min-h-[calc(100vh-40px)]">
                <div className="flex flex-col items-center gap-[16px]">
                    <h1 className="text-[#0E0E0E] font-[700] text-[30px] leading-[40px]">
                        Create new account
                    </h1>
                    
                    {/* Invitation Banner */}
                    {hasInvitation && (
                        <div className="bg-gradient-to-r from-[#E84C88]/20 to-[#7AE684]/20 border-2 border-[#E84C88] rounded-[16px] p-[16px] max-w-[400px]">
                            <div className="flex items-center gap-[12px]">
                                <span className="text-[24px]">🎉</span>
                                <div className="flex-1">
                                    <p className="text-[#0e0e0e] text-[14px] font-[600]">
                                        You've been invited to Premium!
                                    </p>
                                    <p className="text-[#6b7280] text-[12px] font-[400]">
                                        Create your account to activate free premium access
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <form onSubmit={handleSubmit} className="w-[100%] md:w-[400px] flex flex-col gap-[24px]">
                    <div className="flex flex-col gap-[24px]">
                        <Input 
                            label="Full name*" 
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="Enter your full name"
                            error={errors.name}
                        />
                        <Input 
                            label="Email*" 
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="Enter your email"
                            error={errors.email}
                            disabled={hasInvitation}
                        />
                        <Input 
                            label="Password*" 
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            placeholder="Enter your password"
                            error={errors.password}
                        />
                        <Input 
                            label="Confirm Password*" 
                            type="password"
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            placeholder="Enter your confirm password"
                            error={errors.confirmPassword}
                        />

                        {/* Message */}
                        {message.text && (
                            <div className={`p-3 rounded-lg text-[14px] font-[500] text-center ${
                                message.type === "success" 
                                    ? "bg-green-100 text-green-700" 
                                    : "bg-red-100 text-red-700"
                            }`}>
                                {message.text}
                            </div>
                        )}

                        {/* BUTTONS */}
                        <div className="flex flex-col gap-[12px] items-center">
                            <button 
                                type="submit"
                                disabled={loading}
                                className="w-full h-[48px] bg-[#E84C88] text-white font-[700] text-[14px] leading-[20px] rounded-full hover:bg-[#d43d75] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? "Creating account..." : "Create new account"}
                            </button>
                            <p className="text-[#0E0E0E] font-[400] text-[14px] leading-[20px] text-center">
                                Already have an account?{" "}
                                <Link href="/auth/signin" className="text-[#E84C88] font-[600] hover:underline">
                                    Sign in
                                </Link>
                            </p>
                        </div>
                    </div>

                    {/* OR Divider */}
                    <div className="relative mb-6">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-200"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-4 bg-white text-gray-500 font-medium">OR</span>
                        </div>
                    </div>
                    <LinkAccount />
                </form>
            </div>

                <div
                    className="fixed top-[25px] md:top-[56px] right-[25px] md:right-[56px] cursor-pointer"
                    dangerouslySetInnerHTML={{ __html: assets.circleClose }}
                />

                {/* Email Verification Modal */}
                {showEmailModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#00000080] backdrop-blur-sm p-[20px] animate-in fade-in duration-300">
                        <div className="bg-white rounded-[24px] p-[40px] max-w-[500px] w-full shadow-2xl animate-in zoom-in-95 duration-300">
                            <div className="flex flex-col items-center gap-[24px] text-center">
                                {/* Email Icon */}
                                <div className="relative">
                                    <div className="absolute inset-0 bg-[#E84C88] rounded-full opacity-20 animate-ping"></div>
                                    <div className="relative bg-[#E84C88] rounded-full p-[20px]">
                                        <svg 
                                            className="w-[48px] h-[48px] text-white" 
                                            fill="none" 
                                            stroke="currentColor" 
                                            viewBox="0 0 24 24"
                                        >
                                            <path 
                                                strokeLinecap="round" 
                                                strokeLinejoin="round" 
                                                strokeWidth={2} 
                                                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" 
                                            />
                                        </svg>
                                    </div>
                                </div>

                                {/* Title */}
                                <div className="flex flex-col gap-[12px]">
                                    <h2 className="text-[#0E0E0E] text-[28px] font-[700]">
                                        Check Your Email
                                    </h2>
                                    <p className="text-[#0E0E0E] text-[16px] font-[400] leading-[24px]">
                                        We've sent a verification link to:
                                    </p>
                                    <p className="text-[#E84C88] text-[16px] font-[600] break-all">
                                        {registeredEmail}
                                    </p>
                                </div>

                                {/* Warning */}
                                <p className="text-[#6b7280] text-[12px] font-[400]">
                                    Can't find the email? Check your spam folder or click below to resend.
                                </p>

                                {/* Action Buttons */}
                                <div className="flex flex-col gap-[12px] w-full">
                                    <button 
                                        onClick={() => setShowEmailModal(false)}
                                        className="w-full h-[48px] bg-[#E84C88] text-white font-[700] text-[14px] leading-[20px] rounded-full hover:bg-[#d43d75] transition-colors"
                                    >
                                        Got it!
                                    </button>
                                    <Link href="/auth/signin">
                                        <button 
                                            className="w-full h-[48px] bg-[#F6F6F6] text-[#0E0E0E] font-[600] text-[14px] leading-[20px] rounded-full hover:bg-[#e5e5e5] transition-colors"
                                        >
                                            Go to Sign In
                                        </button>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    }

export default function Page() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-[#b7b7b7] text-[14px]">Loading...</div>
            </div>
        }>
            <SignupForm />
        </Suspense>
    );
}