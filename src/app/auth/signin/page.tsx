"use client";
import { assets } from "@/public/assets";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Input, { LinkAccount } from "@/commons/Input";
import { API_BASE_URL, authAPI, setAuthToken } from "@/commons/Api";
import GuestRoute from "@/components/GuestRoute";

function SignInPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        email: "",
        password: "",
    });
    const [errors, setErrors] = useState({
        email: "",
        password: "",
    });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: "", text: "" });
    const [needsEmailVerification, setNeedsEmailVerification] = useState(false);
    const [resendingEmail, setResendingEmail] = useState(false);

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
            email: "",
            password: "",
        };
        let isValid = true;

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
        }

        setErrors(newErrors);
        return isValid;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!validateForm()) return;

        setLoading(true);
        setMessage({ type: "", text: "" });
        setNeedsEmailVerification(false);

        try {
            const response = await authAPI.login({
                email: formData.email,
                password: formData.password,
            });

            if (response.success) {
                // Save token
                setAuthToken(response.token);
                
                // Show success message
                setMessage({ 
                    type: "success", 
                    text: "Login successful! Redirecting..." 
                });
                
                // Redirect to home after 1 second
                setTimeout(() => {
                    router.push("/");
                }, 1000);
            }
        } catch (error: any) {
            // Check if error is due to unverified email
            if (error.message && error.message.includes("verify your email")) {
                setNeedsEmailVerification(true);
                setMessage({ 
                    type: "warning", 
                    text: error.message 
                });
            } else {
                setMessage({ 
                    type: "error", 
                    text: error.message || "Login failed. Please check your credentials." 
                });
            }
        } finally {
            setLoading(false);
        }
    };

    const handleResendVerification = async () => {
        setResendingEmail(true);
        setMessage({ type: "", text: "" });

        try {
            // First login to get token (will fail but needed for resend endpoint)
            // Or we can call the resend endpoint that doesn't require auth
            const response = await fetch(`${API_BASE_URL}/api/auth/resend-verification-public`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email: formData.email })
            });

            const data = await response.json();

            if (data.success || response.ok) {
                setMessage({ 
                    type: "success", 
                    text: "Verification email sent! Please check your inbox." 
                });
            } else {
                throw new Error(data.message || "Failed to send verification email");
            }
        } catch (error: any) {
            setMessage({ 
                type: "error", 
                text: error.message || "Failed to send verification email. Please try again." 
            });
        } finally {
            setResendingEmail(false);
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
                <h1 className="text-[#0E0E0E] font-[700] text-[30px] leading-[40px]">
                    Login to your account
                </h1>

                <form onSubmit={handleSubmit} className="w-[100%] md:w-[400px] flex flex-col gap-[24px]">
                    <div className="flex flex-col gap-[24px]">
                        <Input 
                            label="Email*" 
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="Enter your email"
                            error={errors.email}
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

                        {/* Message */}
                        {message.text && (
                            <div className={`p-3 rounded-lg text-[14px] font-[500] text-center ${
                                message.type === "success" 
                                    ? "bg-green-100 text-green-700" 
                                    : message.type === "warning"
                                    ? "bg-yellow-100 text-yellow-700"
                                    : "bg-red-100 text-red-700"
                            }`}>
                                {message.text}
                            </div>
                        )}

                        {/* Resend Verification Button */}
                        {needsEmailVerification && (
                            <button
                                type="button"
                                onClick={handleResendVerification}
                                disabled={resendingEmail}
                                className="w-full h-[48px] bg-[#7AE684] text-[#2D6332] font-[700] text-[14px] leading-[20px] rounded-full hover:bg-[#6bd674] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {resendingEmail ? "Sending..." : "📧 Resend Verification Email"}
                            </button>
                        )}

                        {/* BUTTONS */}
                        <div className="flex flex-col gap-[12px] items-center">
                            <button 
                                type="submit"
                                disabled={loading}
                                className="w-full h-[48px] bg-[#E84C88] text-white font-[700] text-[14px] leading-[20px] rounded-full hover:bg-[#d43d75] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? "Signing in..." : "Sign in"}
                            </button>
                            <p className="text-[#0E0E0E] font-[400] text-[14px] leading-[20px] text-center">
                                Don't have an account yet?{" "}
                                <Link href="/auth/signup" className="text-[#E84C88] font-[600] hover:underline">
                                    Create new account
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
                            <span className="px-4 bg-white text-[#0E0E0E] font-bold">OR</span>
                        </div>
                    </div>
                    <LinkAccount />
                </form>
            </div>

            <div
                className="fixed top-[25px] md:top-[56px] right-[25px] md:right-[56px] cursor-pointer"
                dangerouslySetInnerHTML={{ __html: assets.circleClose }}
            />
        </div>
    );
}

export default function Page() {
    return (
        <GuestRoute>
            <SignInPage />
        </GuestRoute>
    );
}