"use client";
import Svg from "@/commons/Svg";
import { useEffect, useRef, useState } from 'react';

export default function Hero() {
    const heroRef = useRef<HTMLDivElement>(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                }
            },
            { threshold: 0.3 }
        );

        const currentRef = heroRef.current;
        if (currentRef) {
            observer.observe(currentRef);
        }

        return () => {
            if (currentRef) {
                observer.unobserve(currentRef);
            }
        };
    }, []);

    return (
        <div ref={heroRef} className="relative w-[100%] flex flex-col items-center justify-center gap-[80px]">
            <div className="w-[100%] mx-auto md:w-[914px] flex flex-col gap-[16px] md:gap-[32px] text-center items-center justify-center">
                <p className={`text-[#0e0e0e] text-[34px] md:text-[64px] leading-[40px] md:leading-[72px] font-[800] transition-all duration-600 ease-out ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
                    style={{ transitionDelay: isVisible ? '100ms' : '0ms' }}>Bring Your Ideas to Life with <span className="text-[#dbdbdb]">Stunning Icons & Illustrations</span></p>
                <p className={`text-[#B7B7B7] text-[12px] md:text-[16px] leading-[20px] md:leading-[24px] font-[400] transition-all duration-600 ease-out ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
                    style={{ transitionDelay: isVisible ? '200ms' : '0ms' }}>Ready-to-use, high-quality designs crafted for your website, app, and brand.</p>
            </div>
            <button className={`px-[16px] py-[8px] rounded-full w-[45%] md:w-[200px] h-[56px] leading-[20px] bg-[#0e0e0e] text-[#ffffff] font-bold md:text-[16px] text-[14px] flex gap-[8px] items-center justify-center hover:bg-[#2a2a2a] transition-all duration-300 ease-out transform hover:scale-105 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
                style={{ transitionDelay: isVisible ? '300ms' : '0ms' }}>
                <Svg icon="puzzle" /> Explore Plugins
            </button>
            <div className={`relative md:absolute -bottom-[80px] md:-bottom-[28%] 2xl:right-[5%] -right-[30%] md:-right-[5%] translate-x-[-50%] flex flex-col justify-center items-center transition-all duration-600 ease-out ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
                style={{ transitionDelay: isVisible ? '450ms' : '0ms' }}>
                <p className="w-[223px] rotate-[-10deg] Kalam text-[24px] leading-[32px] font-normal text-center">Beautiful Assets, Just a Click Away</p>
                <Svg icon="arrowbottom" />
            </div>
        </div>
    )
}