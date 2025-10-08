"use client";
import Svg from "@/commons/Svg";
import Image from "next/image";
import { useEffect, useRef, useState } from 'react';

export default function IconGallery() {
    const galleryRef = useRef<HTMLDivElement>(null);
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

        const currentRef = galleryRef.current;
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
        <div ref={galleryRef} className="w-[100%] flex md:flex-row flex-col">
            <div className="w-[100%] flex justify-center items-center md:w-[50%] h-[600px] border-r border-[#ececec] px-[16px] md:px-[56px] py-[32px] md:py-[64px]" >
                <Image src="/IconGallery.svg" alt="Icon Gallery" width={1000} height={1000} className={`w-[456px] h-[504px] pointer-events-none transition-all duration-600 ease-out ${isVisible ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-4'}`}
                />
            </div>
            <div className="relative w-[100%] md:w-[50%] flex flex-col gap-[56px] px-[16px] md:px-[56px] py-[32px] md:py-[64px]">
                <p className={`text-[#0e0e0e] font-bold text-[16px] leading-[24px] transition-all duration-600 ease-out ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
                    style={{ transitionDelay: isVisible ? '150ms' : '0ms' }}>Stop wasting time searching for the right icons, Illustration, Emojis <span className="text-[#454545] font-normal text-[16px] leading-[24px]">Access Streamline Pro and unlock 300,000+ high-quality, consistent, and fully customizable assets.</span></p>
                <div className={`flex gap-[8px] transition-all duration-600 ease-out ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
                    style={{ transitionDelay: isVisible ? '300ms' : '0ms' }}>
                    <button className="px-[16px] py-[8px] rounded-full w-[45%] md:w-[200px] h-[56px] leading-[20px] bg-[#0e0e0e] text-[#ffffff] font-bold md:text-[16px] text-[14px] flex gap-[8px] items-center justify-center"><Svg icon="energy" /> Browse Icons</button>
                    <button className="px-[16px] py-[8px] rounded-full w-[65%] md:w-[282px] h-[56px] leading-[20px] bg-[#ececec] text-[#0e0e0e] font-bold md:text-[16px] text-[14px] flex gap-[8px] items-center justify-center"><Svg icon="star" /> Start with Free icons</button>
                </div>
                <div className={`relative md:absolute -bottom-[80px] md:-bottom-[10%] 2xl:right-[15%] -right-[50%] md:-right-[5%] translate-x-[-50%] flex flex-col justify-center items-center transition-all duration-600 ease-out ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
                    style={{ transitionDelay: isVisible ? '450ms' : '0ms' }}>
                    <p className="w-[223px] rotate-[-10deg] Kalam text-[24px] leading-[32px] font-normal text-center">Discover why creators love our icons</p>
                    <Svg icon="arrowbottom" />
                </div>
            </div>
        </div>
    )
}