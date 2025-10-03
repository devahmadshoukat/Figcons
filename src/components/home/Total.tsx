"use client";
import { useRef, useEffect, useState } from 'react';

export default function Total() {
    const totalRef = useRef<HTMLDivElement>(null);
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

        const currentRef = totalRef.current;
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
        <div ref={totalRef} className="md:grid flex flex-wrap md:grid-cols-3 w-[100%]">
            <div className={`w-[50%] md:w-auto flex gap-[16px] justify-center items-end px-[15px] md:px-0 py-[40px] border-r border-[#ececec] transition-all duration-600 ease-out ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
            }`} style={{ transitionDelay: '0ms' }}>
                <h1 className="text-[64px] text-[#0e0e0e] font-bold leading-[72px]">4+</h1>
                <p className="w-auto md:w-[136px] text-[16px] text-[#b7b7b7] font-normal leading-[24px] pt-[10px]">Years of design experience</p>
            </div>
            <div className={`w-[50%] md:w-auto flex gap-[16px] justify-center items-end px-[15px] md:px-0 py-[40px] md:border-r border-[#ececec] transition-all duration-600 ease-out ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
            }`} style={{ transitionDelay: '150ms' }}>
                <h1 className="text-[64px] text-[#0e0e0e] font-bold leading-[72px]">12</h1>
                <p className="w-auto md:w-[136px] text-[16px] text-[#b7b7b7] font-normal leading-[24px] pt-[10px]">Full-time icon designers</p>
            </div>
            <div className={`w-[100%] md:w-auto flex gap-[16px] justify-center items-end px-[15px] md:px-0 py-[40px] border-t border-[#ececec] md:border-t-0 transition-all duration-600 ease-out ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
            }`} style={{ transitionDelay: '300ms' }}>
                <h1 className="text-[64px] text-[#0e0e0e] font-bold leading-[72px]">64</h1>
                <p className="w-auto md:w-[136px] text-[16px] text-[#b7b7b7] font-normal leading-[24px] pt-[10px]">Pro vector icon sets</p>
            </div>
        </div>
    )
}