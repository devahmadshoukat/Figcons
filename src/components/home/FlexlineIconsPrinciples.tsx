"use client";
import Image from "next/image";
import { useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Register ScrollTrigger plugin
gsap.registerPlugin(ScrollTrigger);

export const FlexlineIconsPrinciples1 = () => {
    const principlesRef = useRef<HTMLDivElement>(null);
    const textRef = useRef<HTMLDivElement>(null);
    const imageRef = useRef<HTMLImageElement>(null);
    const captionRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!principlesRef.current) return;

        const tl = gsap.timeline({
            scrollTrigger: {
                trigger: principlesRef.current,
                start: "top 80%",
                end: "bottom 20%",
                toggleActions: "play none none reverse",
            }
        });

        // Animate text content
        tl.fromTo(textRef.current,
            { opacity: 0, x: -50 },
            { opacity: 1, x: 0, duration: 0.8, ease: "power3.out" }
        );

        // Animate image with scale
        tl.fromTo(imageRef.current,
            { opacity: 0, scale: 0.8, y: 30 },
            { opacity: 1, scale: 1, y: 0, duration: 0.8, ease: "power3.out" },
            "-=0.4"
        );

        // Animate caption
        tl.fromTo(captionRef.current,
            { opacity: 0, y: 20 },
            { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" },
            "-=0.4"
        );

    }, []);
    return (
        <div ref={principlesRef} className="w-[100%] flex md:flex-row flex-col gap-[32px] md:gap-[0px] ">
            <div ref={textRef} className="w-[100%] md:w-[30%] px-[24px] md:px-[80px] pt-[32px] md:pt-[64px] md:border-r border-[#454545]">
                <div className="w-[100%] md:w-[190px] flex flex-col gap-[12px]">
                    <h1 className="text-[30px] text-[#ffffff] font-bold leading-[40px]">Unmatched Consistency</h1>
                    <p className="text-[#b7b7b7] text-[16px] font-normal leading-[24px]">Strict construction principles ensure every icon looks like part of one family—so your design system stays flawless.</p>
                </div>
            </div>
            <div className="w-[100%] md:w-[70%] flex flex-col gap-[40px] pb-[112px]">
                <div className="w-[100%] h-[240px] md:h-[400px] bg-[#323232] flex justify-end items-center p-[40px]">
                    <Image ref={imageRef} src="/FlexlineIconsPrinciples1.svg" alt="Flexline Icons Principles" width={1000} height={1000} className="w-[100%] md:w-[600px] h-[160px] md:h-[287px] pointer-events-none" />
                </div>
                <div ref={captionRef} className="flex flex-col w-[100%] justify-end text-end items-end pr-[24px] md:pr-[40px]">
                    <p className="text-[#b7b7b7] text-[16px] font-normal leading-[24px]">Constructions Principles</p>
                    <h1 className="text-[#ffffff] text-[16px] font-bold leading-[24px]">Flex Solid Icons</h1>
                </div>
            </div>
        </div>
    )
}
export const FlexlineIconsPrinciples2 = () => {
    const principlesRef2 = useRef<HTMLDivElement>(null);
    const textRef2 = useRef<HTMLDivElement>(null);
    const imageRef2 = useRef<HTMLImageElement>(null);
    const captionRef2 = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!principlesRef2.current) return;

        const tl = gsap.timeline({
            scrollTrigger: {
                trigger: principlesRef2.current,
                start: "top 80%",
                end: "bottom 20%",
                toggleActions: "play none none reverse",
            }
        });

        // Animate image first (since it's on the left)
        tl.fromTo(imageRef2.current,
            { opacity: 0, scale: 0.8, y: 30 },
            { opacity: 1, scale: 1, y: 0, duration: 0.8, ease: "power3.out" }
        );

        // Animate caption
        tl.fromTo(captionRef2.current,
            { opacity: 0, y: 20 },
            { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" },
            "-=0.4"
        );

        // Animate text content
        tl.fromTo(textRef2.current,
            { opacity: 0, x: 50 },
            { opacity: 1, x: 0, duration: 0.8, ease: "power3.out" },
            "-=0.4"
        );

    }, []);

    return (
        <div ref={principlesRef2} className="w-[100%] flex md:flex-row flex-col flex-col-reverse gap-[32px] md:gap-[0px]">
            <div className="w-[100%] md:w-[70%] flex flex-col gap-[40px] pb-[112px]">
                <div className="w-[100%] h-[240px] md:h-[400px] bg-[#323232] flex justify-center items-center p-[40px]">
                    <Image ref={imageRef2} src="/FlexlineIconsPrinciples2.svg" alt="Flexline Icons Principles" width={1000} height={1000} className="w-[100%] md:w-[530px] h-[120px] md:h-[160px] pointer-events-none" />
                </div>
                <div ref={captionRef2} className="flex flex-col w-[100%] justify-end text-end items-end pr-[24px] md:pr-[40px]">
                    <p className="text-[#b7b7b7] text-[16px] font-normal leading-[24px]">Constructions Principles</p>
                    <h1 className="text-[#ffffff] text-[16px] font-bold leading-[24px]">Flex Solid Icons</h1>
                </div>
            </div>
            <div ref={textRef2} className="w-[100%] md:w-[30%] px-[24px] md:px-[80px] pt-[32px] md:pt-[64px] md:border-l border-[#454545]">
                <div className="w-[100%] md:w-[190px] flex flex-col gap-[12px]">
                    <h1 className="text-[30px] text-[#ffffff] font-bold leading-[40px]">Unmatched Consistency</h1>
                    <p className="text-[#b7b7b7] text-[16px] font-normal leading-[24px]">Strict construction principles ensure every icon looks like part of one family—so your design system stays flawless.</p>
                </div>
            </div>
        </div>
    )
}
export const FlexlineIconsPrinciples3 = () => {
    const principlesRef3 = useRef<HTMLDivElement>(null);
    const textRef3 = useRef<HTMLDivElement>(null);
    const imageRef3 = useRef<HTMLImageElement>(null);
    const captionRef3 = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!principlesRef3.current) return;

        const tl = gsap.timeline({
            scrollTrigger: {
                trigger: principlesRef3.current,
                start: "top 80%",
                end: "bottom 20%",
                toggleActions: "play none none reverse",
            }
        });

        // Animate text content
        tl.fromTo(textRef3.current,
            { opacity: 0, x: -50 },
            { opacity: 1, x: 0, duration: 0.8, ease: "power3.out" }
        );

        // Animate image with scale
        tl.fromTo(imageRef3.current,
            { opacity: 0, scale: 0.8, y: 30 },
            { opacity: 1, scale: 1, y: 0, duration: 0.8, ease: "power3.out" },
            "-=0.4"
        );

        // Animate caption
        tl.fromTo(captionRef3.current,
            { opacity: 0, y: 20 },
            { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" },
            "-=0.4"
        );

    }, []);

    return (
        <div ref={principlesRef3} className="w-[100%] flex md:flex-row flex-col gap-[32px] md:gap-[0px]">
            <div ref={textRef3} className="w-[100%] md:w-[30%] px-[24px] md:px-[80px] pt-[32px] md:pt-[64px] md:border-r border-[#454545]">
                <div className="w-[100%] md:w-[190px] flex flex-col gap-[12px]">
                    <h1 className="text-[30px] text-[#ffffff] font-bold leading-[40px]">Unmatched Consistency</h1>
                    <p className="text-[#b7b7b7] text-[16px] font-normal leading-[24px]">Strict construction principles ensure every icon looks like part of one family—so your design system stays flawless.</p>
                </div>
            </div>
            <div className="w-[100%] md:w-[70%] flex flex-col gap-[40px] pb-[112px]">
                <div className="w-[100%] h-[240px] md:h-[400px] bg-[#323232] flex justify-center items-center p-[40px]">
                    <Image ref={imageRef3} src="/FlexlineIconsPrinciples3.svg" alt="Flexline Icons Principles" width={1000} height={1000} className="w-[100%] md:w-[530px] h-[186px] md:h-[287px] pointer-events-none" />
                </div>
                <div ref={captionRef3} className="flex flex-col w-[100%] justify-end text-end items-end pr-[24px] md:pr-[40px]">
                    <p className="text-[#b7b7b7] text-[16px] font-normal leading-[24px]">Constructions Principles</p>
                    <h1 className="text-[#ffffff] text-[16px] font-bold leading-[24px]">Flex Solid Icons</h1>
                </div>
            </div>
        </div>
    )
}