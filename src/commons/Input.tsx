"use client";
import { useState } from "react";
import Svg from "@/commons/Svg";
import { assets } from "@/public/assets";
import { endpoints } from "@/commons/Api";

interface InputProps {
    label: string;
    type?: string;
    placeholder?: string;
    name?: string;
    value?: string;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    error?: string;
    disabled?: boolean;
}

export default function Input({ 
    label, 
    type = "text", 
    placeholder, 
    name, 
    value, 
    onChange,
    error,
    disabled = false
}: InputProps) {
    const [show, setShow] = useState(false);
    const isPassword = type === "password";

    return (
        <div className="flex flex-col gap-[12px]">
            <label className="text-[#0E0E0E] font-[600] text-[14px] leading-[20px]">
                {label}
            </label>
            <div className={`relative rounded-full py-[14px] px-[16px] ${disabled ? 'bg-[#e5e5e5]' : 'bg-[#F6F6F6]'}`}>
                <input
                    type={isPassword ? (show ? "text" : "password") : type}
                    placeholder={placeholder}
                    name={name}
                    value={value}
                    onChange={onChange}
                    disabled={disabled}
                    className={`text-[14px] w-full placeholder:text-[#B7B7B7] outline-none border-none bg-transparent pr-[48px] ${disabled ? 'cursor-not-allowed text-[#6b7280]' : ''}`}
                />
                {isPassword && (
                    <button
                        type="button"
                        onClick={() => setShow(!show)}
                        className="absolute right-[12px] top-1/2 transform -translate-y-1/2 p-1 hover:bg-[#e5e5e5] rounded-[6px] transition-all duration-200 group"
                    >
                        <div className="relative w-4 h-4 overflow-hidden">
                            {/* Eye Open */}
                            <div
                                className={`absolute inset-0 transition-all duration-400 ease-in-out transform ${show
                                    ? "opacity-0 scale-50 rotate-45 translate-y-1"
                                    : "opacity-100 scale-100 rotate-0 translate-y-0"
                                    }`}
                            >
                                <Svg
                                    icon="eyeOpen"
                                    w="16"
                                    h="16"
                                    stroke="#B7B7B7"
                                    className="group-hover:scale-110 transition-all duration-300"
                                />
                            </div>

                            {/* Eye Closed */}
                            <div
                                className={`absolute inset-0 transition-all duration-400 ease-in-out transform ${show
                                    ? "opacity-100 scale-100 rotate-0 translate-y-0"
                                    : "opacity-0 scale-50 -rotate-45 -translate-y-1"
                                    }`}
                            >
                                <Svg
                                    icon="eyeClosed"
                                    w="16"
                                    h="16"
                                    stroke="#B7B7B7"
                                    className="group-hover:scale-110 transition-all duration-300"
                                />
                            </div>
                        </div>
                    </button>
                )}
            </div>
            {error && (
                <p className="text-red-500 text-[12px] font-[500] ml-[16px]">
                    {error}
                </p>
            )}
        </div>
    );
}
export function LinkAccount() {
    const handleGoogleLogin = () => {
        // Redirect to backend Google OAuth
        if (typeof window !== 'undefined') {
            window.location.href = endpoints.auth.googleAuth;
        }
    };

    const handleAppleLogin = () => {
        // Apple login not implemented yet
        alert('Apple login coming soon!');
    };

    return (
        <div className="flex flex-col gap-[8px]">
            {/* Google Login */}
            <button 
                type="button"
                onClick={handleGoogleLogin}
                className="bg-[#F6F6F6] w-full flex items-center justify-center gap-3 px-6 py-3 rounded-full hover:bg-[#e5e5e5] transition-colors group"
            >
                <div dangerouslySetInnerHTML={{ __html: assets.google }} />
                <span className="text-[#0E0E0E] text-[14px] font-semibold">
                    Continue with Google
                </span>
            </button>
            <button 
                type="button"
                onClick={handleAppleLogin}
                className="bg-[#0E0E0E] w-full flex items-center justify-center gap-3 px-6 py-3 rounded-full hover:bg-[#2a2a2a] transition-colors group"
            >
                <div dangerouslySetInnerHTML={{ __html: assets.apple }} />
                <span className="text-[#F6F6F6] text-[14px] font-semibold">
                    Continue with Apple
                </span>
            </button>
        </div>
    )
}