"use client";
import Link from "next/link";

export default function PaymentCancelPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#F6F6F6] to-white p-[20px]">
            <div className="bg-white p-[40px] rounded-[24px] shadow-lg max-w-[500px] w-full">
                <div className="flex flex-col items-center gap-[24px] text-center">
                    {/* Cancel Icon */}
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
                                d="M6 18L18 6M6 6l12 12" 
                            />
                        </svg>
                    </div>

                    {/* Title */}
                    <div className="flex flex-col gap-[12px]">
                        <h1 className="text-[#0E0E0E] text-[28px] font-[700]">
                            Payment Cancelled
                        </h1>
                        <p className="text-[#0E0E0E] text-[16px] font-[400] leading-[24px]">
                            Your payment was cancelled. No charges were made to your account.
                        </p>
                    </div>

                    {/* Action buttons */}
                    <div className="flex flex-col gap-[12px] w-full mt-[12px]">
                        <Link href="/pricing">
                            <button className="w-full h-[48px] bg-[#E84C88] text-white font-[700] text-[14px] leading-[20px] rounded-full hover:bg-[#d43d75] transition-colors">
                                View Pricing Again
                            </button>
                        </Link>
                        <Link href="/icons">
                            <button className="w-full h-[48px] bg-[#F6F6F6] text-[#0E0E0E] font-[600] text-[14px] leading-[20px] rounded-full hover:bg-[#e5e5e5] transition-colors">
                                Continue with Free Plan
                            </button>
                        </Link>
                    </div>

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
                                    Changed Your Mind?
                                </h3>
                                <p className="text-[#0E0E0E] text-[12px] font-[400] leading-[18px]">
                                    You can upgrade to Pro or Pro Plus anytime. Your free account will continue to work with access to 4,000+ free icons.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Additional Info */}
                    <div className="w-full border-t border-[#ececec] pt-[20px] mt-[12px]">
                        <p className="text-[#B7B7B7] text-[12px] font-[400]">
                            Have questions? Contact us at <a href="mailto:support@figcons.com" className="text-[#E84C88] font-[600] hover:underline">support@figcons.com</a>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

