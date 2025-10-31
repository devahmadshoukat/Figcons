"use client";
import Svg from "@/commons/Svg";

export default function Hero() {
    return (
        <div className="relative w-full flex flex-col items-center justify-center gap-[80px]">
            {/* Text Section */}
            <div className="w-full mx-auto md:w-[914px] flex flex-col gap-[16px] md:gap-[32px] text-center items-center justify-center">
                <p className="text-[#0e0e0e] text-[34px] md:text-[64px] leading-[40px] md:leading-[72px] font-[800]">
                    Bring Your Ideas to Life with{" "}
                    <span className="text-[#dbdbdb]">
                        Stunning Icons & Illustrations
                    </span>
                </p>
                <p className="text-[#B7B7B7] text-[12px] md:text-[16px] leading-[20px] md:leading-[24px] font-[400]">
                    Ready-to-use, high-quality designs crafted for your website, app, and brand.
                </p>
            </div>

            {/* Button */}
            <button className="px-[16px] py-[8px] rounded-full w-[45%] md:w-[200px] h-[56px] leading-[20px] bg-[#0e0e0e] text-[#ffffff] font-bold md:text-[16px] text-[14px] flex gap-[8px] items-center justify-center hover:bg-[#2a2a2a] transition-all duration-300 ease-out transform hover:scale-105">
                <Svg icon="puzzle" /> Explore Plugins
            </button>

            {/* Decorative Text + Arrow */}
            <div className="relative md:absolute -bottom-[80px] md:-bottom-[28%] 2xl:right-[5%] -right-[30%] md:-right-[5%] translate-x-[-50%] flex flex-col justify-center items-center">
                <p className="w-[223px] rotate-[-10deg] Kalam text-[24px] leading-[32px] font-normal text-center">
                    Beautiful Assets, Just a Click Away
                </p>
                <Svg icon="arrowbottom" />
            </div>
        </div>
    );
}
