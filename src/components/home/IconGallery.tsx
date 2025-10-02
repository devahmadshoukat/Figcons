"use client";
import Svg from "@/commons/Svg";
import Image from "next/image";
import { useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Register ScrollTrigger plugin
gsap.registerPlugin(ScrollTrigger);

export default function IconGallery() {
    const galleryRef = useRef<HTMLDivElement>(null);
    const imageRef = useRef<HTMLImageElement>(null);
    const textRef = useRef<HTMLParagraphElement>(null);
    const buttonsRef = useRef<HTMLDivElement>(null);
    const arrowRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!galleryRef.current) return;

        const tl = gsap.timeline({
            scrollTrigger: {
                trigger: galleryRef.current,
                start: "top 80%",
                end: "bottom 20%",
                toggleActions: "play none none reverse",
            }
        });

        // Animate image with scale and opacity
        tl.fromTo(imageRef.current,
            { opacity: 0, scale: 0.8, y: 30 },
            { opacity: 1, scale: 1, y: 0, duration: 0.8, ease: "power3.out" }
        );

        // Animate text content
        tl.fromTo(textRef.current,
            { opacity: 0, y: 30 },
            { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" },
            "-=0.4"
        );

        // Animate buttons with stagger
        tl.fromTo(buttonsRef.current?.children,
            { opacity: 0, y: 20, scale: 0.9 },
            { 
                opacity: 1, 
                y: 0, 
                scale: 1, 
                duration: 0.5, 
                ease: "power2.out",
                stagger: 0.1
            },
            "-=0.3"
        );

        // Animate arrow with rotation
        tl.fromTo(arrowRef.current,
            { opacity: 0, y: 20, rotation: -10 },
            { opacity: 1, y: 0, rotation: -10, duration: 0.6, ease: "back.out(1.7)" },
            "-=0.2"
        );

    }, []);

    return (
        <div ref={galleryRef} className="w-[100%] flex md:flex-row flex-col">
            <div className="w-[100%] flex justify-center items-center md:w-[50%] h-[600px] border-r border-[#ececec] px-[16px] md:px-[56px] py-[32px] md:py-[64px]" >
                <Image ref={imageRef} src="/IconGallery.svg" alt="Icon Gallery" width={1000} height={1000} className="w-[456px] h-[504px] pointer-events-none" />
            </div>
            <div className="relative w-[100%] md:w-[50%] flex flex-col gap-[56px] px-[16px] md:px-[56px] py-[32px] md:py-[64px]">
                <p ref={textRef} className="text-[#0e0e0e] font-bold text-[16px] leading-[24px]">Stop wasting time searching for the right icons, Illustration, Emojis <span className="text-[#454545] font-normal text-[16px] leading-[24px]">Access Streamline Pro and unlock 300,000+ high-quality, consistent, and fully customizable assets.</span></p>
                <div ref={buttonsRef} className="flex gap-[8px]">
                    <button className="px-[16px] py-[8px] rounded-full w-[45%] md:w-[200px] h-[56px] leading-[20px] bg-[#0e0e0e] text-[#ffffff] font-bold md:text-[16px] text-[14px] flex gap-[8px] items-center justify-center"><Svg icon="energy" /> Browse Icons</button>
                    <button className="px-[16px] py-[8px] rounded-full w-[65%] md:w-[282px] h-[56px] leading-[20px] bg-[#ececec] text-[#0e0e0e] font-bold md:text-[16px] text-[14px] flex gap-[8px] items-center justify-center"><Svg icon="star" /> Start with Free icons</button>
                </div>
                <div ref={arrowRef} className="relative md:absolute -bottom-[80px] md:-bottom-[10%] 2xl:right-[15%] -right-[50%] md:-right-[5%] translate-x-[-50%] flex flex-col justify-center items-center">
                    <p className="w-[223px] rotate-[-10deg] Kalam text-[24px] leading-[32px] font-normal text-center">Discover why creators love our icons</p>
                    <Svg icon="arrowbottom" />
                </div>
            </div>
        </div>
    )
}