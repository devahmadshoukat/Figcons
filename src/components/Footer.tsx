"use client"
import Svg from "@/commons/Svg";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";

export default function Footer() {
    const footerRef = useRef<HTMLDivElement>(null);
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

        const currentRef = footerRef.current;
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
        <div ref={footerRef} className={`bg-[#f6f6f6] w-full min-h-[400px] md:h-[600px] px-4 md:px-14 py-6 md:py-10 flex flex-col justify-between items-center gap-8 md:gap-0 relative overflow-hidden transition-all duration-600 ease-out ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
        }`}>
            <div className={`grid grid-cols-2 md:grid-cols-4 max-w-7xl w-full gap-8 md:gap-12 transition-all duration-600 ease-out ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`} style={{ transitionDelay: isVisible ? '150ms' : '0ms' }}>
                <div className="flex flex-col gap-3 md:gap-6 min-w-0">
                    <h1 className="text-lg md:text-2xl font-bold leading-8 text-[#0e0e0e] hover:text-[#b7b7b7] transition-colors duration-300">For Designers</h1>
                    <div className="flex flex-col gap-3 md:gap-4">
                        <p className="text-sm md:text-base font-normal leading-6 text-[#0e0e0e] hover:text-[#b7b7b7] transition-colors duration-300 cursor-pointer break-words">Figma Plugins</p>
                        <p className="text-sm md:text-base font-normal leading-6 text-[#0e0e0e] hover:text-[#b7b7b7] transition-colors duration-300 cursor-pointer break-words">Preview in Figma</p>
                        <p className="text-sm md:text-base font-normal leading-6 text-[#0e0e0e] hover:text-[#b7b7b7] transition-colors duration-300 cursor-pointer break-words">Figma Icon Library</p>
                        <p className="text-sm md:text-base font-normal leading-6 text-[#0e0e0e] hover:text-[#b7b7b7] transition-colors duration-300 cursor-pointer break-words">Free Logos</p>
                    </div>
                </div>
                <div className="flex flex-col gap-3 md:gap-6 min-w-0">
                    <h1 className="text-lg md:text-2xl font-bold leading-8 text-[#0e0e0e] hover:text-[#b7b7b7] transition-colors duration-300">For Developers</h1>
                    <div className="flex flex-col gap-3 md:gap-4">
                        <p className="text-sm md:text-base font-normal leading-6 text-[#0e0e0e] hover:text-[#b7b7b7] transition-colors duration-300 cursor-pointer break-words">Docs</p>
                        <p className="text-sm md:text-base font-normal leading-6 text-[#0e0e0e] hover:text-[#b7b7b7] transition-colors duration-300 cursor-pointer break-words">React Icon Library</p>
                        <p className="text-sm md:text-base font-normal leading-6 text-[#0e0e0e] hover:text-[#b7b7b7] transition-colors duration-300 cursor-pointer break-words">Free Icon Font</p>
                        <p className="text-sm md:text-base font-normal leading-6 text-[#0e0e0e] hover:text-[#b7b7b7] transition-colors duration-300 cursor-pointer break-words">Packages</p>
                        <p className="text-sm md:text-base font-normal leading-6 text-[#0e0e0e] hover:text-[#b7b7b7] transition-colors duration-300 cursor-pointer break-words">MCP Server</p>
                    </div>
                </div>
                <div className="flex flex-col gap-3 md:gap-6 min-w-0">
                    <h1 className="text-lg md:text-2xl font-bold leading-8 text-[#0e0e0e] hover:text-[#b7b7b7] transition-colors duration-300">Resources</h1>
                    <div className="flex flex-col gap-3 md:gap-4">
                        <p className="text-sm md:text-base font-normal leading-6 text-[#0e0e0e] hover:text-[#b7b7b7] transition-colors duration-300 cursor-pointer break-words">UI8 Shop</p>
                        <p className="text-sm md:text-base font-normal leading-6 text-[#0e0e0e] hover:text-[#b7b7b7] transition-colors duration-300 cursor-pointer break-words">FAQ&apos;s</p>
                        <p className="text-sm md:text-base font-normal leading-6 text-[#0e0e0e] hover:text-[#b7b7b7] transition-colors duration-300 cursor-pointer break-words">Blog</p>
                    </div>
                </div>
                <div className="flex flex-col gap-3 md:gap-6 min-w-0">
                    <h1 className="text-lg md:text-2xl font-bold leading-8 text-[#0e0e0e] hover:text-[#b7b7b7] transition-colors duration-300">More</h1>
                    <div className="flex flex-col gap-3 md:gap-4">
                        <p className="text-sm md:text-base font-normal leading-6 text-[#0e0e0e] hover:text-[#b7b7b7] transition-colors duration-300 cursor-pointer break-words">Affiliate 30%</p>
                        <p className="text-sm md:text-base font-normal leading-6 text-[#0e0e0e] hover:text-[#b7b7b7] transition-colors duration-300 cursor-pointer break-words">Pricing</p>
                        <p className="text-sm md:text-base font-normal leading-6 text-[#0e0e0e] hover:text-[#b7b7b7] transition-colors duration-300 cursor-pointer break-words">License</p>
                        <p className="text-sm md:text-base font-normal leading-6 text-[#0e0e0e] hover:text-[#b7b7b7] transition-colors duration-300 cursor-pointer break-words">Author</p>
                        <p className="text-sm md:text-base font-normal leading-6 text-[#0e0e0e] hover:text-[#b7b7b7] transition-colors duration-300 cursor-pointer break-words">Privacy Policy</p>
                        <p className="text-sm md:text-base font-normal leading-6 text-[#0e0e0e] hover:text-[#b7b7b7] transition-colors duration-300 cursor-pointer break-words">Cookie Policy</p>
                        <p className="text-sm md:text-base font-normal leading-6 text-[#0e0e0e] hover:text-[#b7b7b7] transition-colors duration-300 cursor-pointer break-words">Terms of Services</p>
                    </div>
                </div>
            </div>
            <div className={`flex flex-col md:flex-row justify-between items-center gap-3 md:gap-0 z-50 w-full max-w-7xl transition-all duration-600 ease-out ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`} style={{ transitionDelay: isVisible ? '300ms' : '0ms' }}>
                <p className="text-[#0E0E0E] font-semibold text-xs md:text-sm leading-5 text-center md:text-left">© 2025 figcons.com. All rights reserved.</p>
                <div className="flex flex-col md:flex-row justify-center md:justify-end items-center gap-4 md:gap-8 w-full md:w-auto">
                    <div className="flex gap-4 md:gap-8 items-center">
                        <p className="text-[#0E0E0E] font-semibold text-xs md:text-sm leading-5 text-center">
                            <span className="text-[#b7b7b7]">Contact us →</span> info@figcons.com
                        </p>
                        <p className="text-[#0E0E0E] font-semibold text-xs md:text-sm leading-5 text-center">Consent Preferences</p>
                    </div>
                    <div className="flex gap-3 flex-wrap justify-center">
                        <Svg w="20px" h="20px" stroke="#0E0E0E" icon="youtube" className="hover:scale-110 transition-transform duration-300 cursor-pointer" />
                        <Svg w="20px" h="20px" stroke="#0E0E0E" icon="be" className="hover:scale-110 transition-transform duration-300 cursor-pointer" />
                        <Svg w="20px" h="20px" stroke="#0E0E0E" icon="figma" className="hover:scale-110 transition-transform duration-300 cursor-pointer" />
                        <Svg w="20px" h="20px" stroke="#0E0E0E" icon="Pluginweb" className="hover:scale-110 transition-transform duration-300 cursor-pointer" />
                        <Svg w="20px" h="20px" stroke="#0E0E0E" icon="instrgram" className="hover:scale-110 transition-transform duration-300 cursor-pointer" />
                    </div>
                </div>
            </div>
            <Image 
                src="/footerlogobottom.svg" 
                alt="Footer" 
                width={1000} 
                height={1000} 
                className={`w-full h-auto absolute bottom-0 left-0 pointer-events-none object-cover transition-all duration-600 ease-out ${
                    isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-102'
                }`}
                style={{ transitionDelay: isVisible ? '450ms' : '0ms' }}
            />
        </div>
    )
}