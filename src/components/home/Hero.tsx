"use client";
import Image from "next/image";
import { useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Register ScrollTrigger plugin
gsap.registerPlugin(ScrollTrigger);

export default function Hero() {
    const heroRef = useRef<HTMLDivElement>(null);
    const titleRef = useRef<HTMLParagraphElement>(null);
    const subtitleRef = useRef<HTMLParagraphElement>(null);
    const statsRef = useRef<HTMLDivElement>(null);
    const imageRef = useRef<HTMLImageElement>(null);

    useEffect(() => {
        if (!heroRef.current) return;

        const tl = gsap.timeline({
            scrollTrigger: {
                trigger: heroRef.current,
                start: "top 80%",
                end: "bottom 20%",
                toggleActions: "play none none reverse",
            }
        });

        // Animate image first
        tl.fromTo(imageRef.current, 
            { opacity: 0, scale: 0.8 },
            { opacity: 1, scale: 1, duration: 0.8, ease: "power3.out" }
        );

        // Animate title with split effect
        tl.fromTo(titleRef.current,
            { opacity: 0, y: 30 },
            { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" },
            "-=0.4"
        );

        // Animate subtitle
        tl.fromTo(subtitleRef.current,
            { opacity: 0, y: 20 },
            { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" },
            "-=0.6"
        );

        // Animate stats with stagger
        if (statsRef.current?.children) {
            tl.fromTo(statsRef.current.children,
                { opacity: 0, y: 40, scale: 0.9 },
                { 
                    opacity: 1, 
                    y: 0, 
                    scale: 1, 
                    duration: 0.6, 
                    ease: "power2.out",
                    stagger: 0.1
                },
                "-=0.4"
            );
        }

    }, []);

    return (
        <div ref={heroRef} className="w-[100%] flex flex-col items-center justify-center">
            <div className="w-[100%] mx-auto md:w-[902px] flex flex-col gap-[16px] md:gap-[32px] text-center items-center justify-center">
                <div className="flex gap-[12px] md:gap-[16px] items-center">
                    <Image 
                        ref={imageRef}
                        width={1440} 
                        height={1000} 
                        className="w-[112px] md:w-[140px] h-[40px] pointer-events-none" 
                        src="/herocollection.svg" 
                        alt="Hero" 
                    />
                    <p className="text-[#0E0E0E] leading-[20px] text-[11px] md:text-[14px] font-[600]">10k+ User in Over Website Every Month</p>
                </div>
                <p ref={titleRef} className="text-[#0e0e0e] text-[34px] md:text-[64px] leading-[40px] md:leading-[72px] font-[800]">Design assets that ship fast <span className="text-[#dbdbdb]">Icons, Illustrations, Emojis.</span></p>
                <p ref={subtitleRef} className="text-[#B7B7B7] text-[12px] md:text-[16px] leading-[20px] md:leading-[24px] font-[400]">Pixel‑perfect SVGs and vectors for web, iOS, and Android — free to start, pro when you scale.</p>
            </div>
            <div ref={statsRef} className="mx-auto flex justify-center justify-center w-[100%]">
                <div className="w-[100%] grid grid-cols-2 md:grid-cols-4 md:gap-0 gap-[32px] mt-[56px] mx-auto">
                    <div className="flex flex-col gap-[8px] justify-start items-center text-center">
                        <p className="text-[#0e0e0e] text-[30px] md:text-[30px] leading-[40px] font-bold">3200+</p>
                        <p className="w-[100%] md:w-[160px] 2xl:w-[200px] text-[#b7b7b7] text-[12px] md:text-[14px] leading-[20px] font-[400]">Assets available right now (Icons, Illustrations & Emojis).</p>
                    </div>
                    <div className="flex flex-col gap-[8px] justify-start items-center text-center">
                        <p className="text-[#0e0e0e] text-[30px] md:text-[30px] leading-[40px] font-bold">10x Faster</p>
                        <p className="w-[100%] md:w-[160px] 2xl:w-[200px] text-[#b7b7b7] text-[12px] md:text-[14px] leading-[20px] font-[400]">Asset delivery & integration.</p>
                    </div>
                    <div className="flex flex-col gap-[8px] justify-start items-center text-center">
                        <p className="text-[#0e0e0e] text-[30px] md:text-[30px] leading-[40px] font-bold">150K+</p>
                        <p className="w-[100%] md:w-[160px] 2xl:w-[200px] text-[#b7b7b7] text-[12px] md:text-[14px] leading-[20px] font-[400]">Monthly downloads across React, Vue & Flutter.</p>
                    </div>
                    <div className="flex flex-col gap-[8px] justify-start items-center text-center">
                        <p className="text-[#0e0e0e] text-[30px] md:text-[30px] leading-[40px] font-bold">5K+</p>
                        <p className="w-[100%] md:w-[160px] 2xl:w-[200px] text-[#b7b7b7] text-[12px] md:text-[14px] leading-[20px] font-[400]">Designers & developers who starred us on GitHub.</p>
                    </div>
                </div>
            </div>
        </div>
    )
}