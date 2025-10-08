"use client";
import Image from "next/image";
import { useEffect, useRef, useState } from 'react';

export const FlexlineIconsPrinciples1 = () => {
    const principlesRef = useRef<HTMLDivElement>(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                }
            },
            { threshold: 0.1 }
        );

        const currentRef = principlesRef.current;
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
        <div ref={principlesRef} className="w-[100%] flex md:flex-row flex-col gap-[32px] md:gap-[0px] overflow-hidden">
            <div className={`w-[100%] md:w-[30%] px-[24px] md:px-[80px] pt-[32px] md:pt-[64px] md:border-r border-[#454545] transition-all duration-600 ease-out ${
                isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-6'
            }`}>
                <div className="w-[100%] md:w-[190px] flex flex-col gap-[12px]">
                    <h1 className="text-[30px] text-[#ffffff] font-bold leading-[40px]">Unmatched Consistency</h1>
                    <p className="text-[#b7b7b7] text-[16px] font-normal leading-[24px]">Strict construction principles ensure every icon looks like part of one family—so your design system stays flawless.</p>
                </div>
            </div>
            <div className="w-[100%] md:w-[70%] flex flex-col gap-[40px] pb-[112px] overflow-hidden">
                <div className="w-[100%] h-[240px] md:h-[400px] bg-[#323232] flex justify-end items-center p-[40px] overflow-hidden">
                    <Image src="/FlexlineIconsPrinciples1.svg" alt="Flexline Icons Principles" width={1000} height={1000} className={`w-[100%] md:w-[600px] h-[160px] md:h-[287px] pointer-events-none transition-all duration-600 ease-out ${
                        isVisible ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-3'
                    }`} style={{ transitionDelay: isVisible ? '150ms' : '0ms' }} />
                </div>
                <div className={`flex flex-col w-[100%] justify-end text-end items-end pr-[24px] md:pr-[40px] transition-all duration-600 ease-out ${
                    isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'
                }`} style={{ transitionDelay: isVisible ? '300ms' : '0ms' }}>
                    <p className="text-[#b7b7b7] text-[16px] font-normal leading-[24px]">Constructions Principles</p>
                    <h1 className="text-[#ffffff] text-[16px] font-bold leading-[24px]">Flex Solid Icons</h1>
                </div>
            </div>
        </div>
    )
}
export const FlexlineIconsPrinciples2 = () => {
    const principlesRef2 = useRef<HTMLDivElement>(null);
    const [isVisible2, setIsVisible2] = useState(false);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible2(true);
                }
            },
            { threshold: 0.1 }
        );

        const currentRef = principlesRef2.current;
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
        <div ref={principlesRef2} className="w-[100%] flex md:flex-row flex-col flex-col-reverse gap-[32px] md:gap-[0px] overflow-hidden">
            <div className="w-[100%] md:w-[70%] flex flex-col gap-[40px] pb-[112px] overflow-hidden">
                <div className="w-[100%] h-[240px] md:h-[400px] bg-[#323232] flex justify-center items-center p-[40px] overflow-hidden">
                    <Image src="/FlexlineIconsPrinciples2.svg" alt="Flexline Icons Principles" width={1000} height={1000} className={`w-[100%] md:w-[530px] h-[120px] md:h-[160px] pointer-events-none transition-all duration-600 ease-out ${
                        isVisible2 ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-3'
                    }`} />
                </div>
                <div className={`flex flex-col w-[100%] justify-end text-end items-end pr-[24px] md:pr-[40px] transition-all duration-600 ease-out ${
                    isVisible2 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'
                }`} style={{ transitionDelay: isVisible2 ? '150ms' : '0ms' }}>
                    <p className="text-[#b7b7b7] text-[16px] font-normal leading-[24px]">Constructions Principles</p>
                    <h1 className="text-[#ffffff] text-[16px] font-bold leading-[24px]">Flex Solid Icons</h1>
                </div>
            </div>
            <div className={`w-[100%] md:w-[30%] px-[24px] md:px-[80px] pt-[32px] md:pt-[64px] md:border-l border-[#454545] transition-all duration-600 ease-out ${
                isVisible2 ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-6'
            }`} style={{ transitionDelay: isVisible2 ? '300ms' : '0ms' }}>
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
    const [isVisible3, setIsVisible3] = useState(false);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible3(true);
                }
            },
            { threshold: 0.1 }
        );

        const currentRef = principlesRef3.current;
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
        <div ref={principlesRef3} className="w-[100%] flex md:flex-row flex-col gap-[32px] md:gap-[0px] overflow-hidden">
            <div className={`w-[100%] md:w-[30%] px-[24px] md:px-[80px] pt-[32px] md:pt-[64px] md:border-r border-[#454545] transition-all duration-600 ease-out ${
                isVisible3 ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-6'
            }`}>
                <div className="w-[100%] md:w-[190px] flex flex-col gap-[12px]">
                    <h1 className="text-[30px] text-[#ffffff] font-bold leading-[40px]">Unmatched Consistency</h1>
                    <p className="text-[#b7b7b7] text-[16px] font-normal leading-[24px]">Strict construction principles ensure every icon looks like part of one family—so your design system stays flawless.</p>
                </div>
            </div>
            <div className="w-[100%] md:w-[70%] flex flex-col gap-[40px] pb-[112px] overflow-hidden">
                <div className="w-[100%] h-[240px] md:h-[400px] bg-[#323232] flex justify-center items-center p-[40px] overflow-hidden">
                    <Image src="/FlexlineIconsPrinciples3.svg" alt="Flexline Icons Principles" width={1000} height={1000} className={`w-[100%] md:w-[530px] h-[186px] md:h-[287px] pointer-events-none transition-all duration-600 ease-out ${
                        isVisible3 ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-3'
                    }`} style={{ transitionDelay: isVisible3 ? '150ms' : '0ms' }} />
                </div>
                <div className={`flex flex-col w-[100%] justify-end text-end items-end pr-[24px] md:pr-[40px] transition-all duration-600 ease-out ${
                    isVisible3 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'
                }`} style={{ transitionDelay: isVisible3 ? '300ms' : '0ms' }}>
                    <p className="text-[#b7b7b7] text-[16px] font-normal leading-[24px]">Constructions Principles</p>
                    <h1 className="text-[#ffffff] text-[16px] font-bold leading-[24px]">Flex Solid Icons</h1>
                </div>
            </div>
        </div>
    )
}