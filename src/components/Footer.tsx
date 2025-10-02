"use client"
import Svg from "@/commons/Svg";
import Image from "next/image";
import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function Footer() {
    const footerRef = useRef<HTMLDivElement>(null);
    const columnsRef = useRef<HTMLDivElement>(null);
    const bottomSectionRef = useRef<HTMLDivElement>(null);
    const socialIconsRef = useRef<HTMLDivElement>(null);
    const backgroundImageRef = useRef<HTMLImageElement>(null);

    useEffect(() => {
        const ctx = gsap.context(() => {
            // Scroll-triggered animations for footer
            ScrollTrigger.create({
                trigger: footerRef.current,
                start: "top 80%",
                end: "bottom 20%",
                onEnter: () => {
                    // Main footer container animation
                    gsap.fromTo(footerRef.current,
                        { y: 100, opacity: 0 },
                        {
                            y: 0,
                            opacity: 1,
                            duration: 1.2,
                            ease: "power3.out"
                        }
                    );

                    // Columns stagger animation
                    gsap.fromTo(columnsRef.current?.children || [],
                        { y: 50, opacity: 0, scale: 0.95 },
                        {
                            y: 0,
                            opacity: 1,
                            scale: 1,
                            duration: 0.8,
                            stagger: 0.15,
                            ease: "back.out(1.7)"
                        }
                    );

                    // Bottom section animation
                    gsap.fromTo(bottomSectionRef.current,
                        { y: 30, opacity: 0 },
                        {
                            y: 0,
                            opacity: 1,
                            duration: 0.8,
                            ease: "power2.out",
                            delay: 0.4
                        }
                    );

                    // Social icons animation
                    gsap.fromTo(socialIconsRef.current?.children || [],
                        { y: 20, opacity: 0, scale: 0.8 },
                        {
                            y: 0,
                            opacity: 1,
                            scale: 1,
                            duration: 0.6,
                            stagger: 0.1,
                            ease: "back.out(1.7)",
                            delay: 0.6
                        }
                    );

                    // Background image animation
                    gsap.fromTo(backgroundImageRef.current,
                        { scale: 1.1, opacity: 0 },
                        {
                            scale: 1,
                            opacity: 1,
                            duration: 1.5,
                            ease: "power2.out",
                            delay: 0.8
                        }
                    );
                }
            });

        }, footerRef);

        // Set up hover animations for social icons with a small delay to ensure DOM is ready
        const setupHoverAnimations = () => {
            if (socialIconsRef.current && socialIconsRef.current.children && socialIconsRef.current.children.length > 0) {
                const icons = Array.from(socialIconsRef.current.children);
                icons.forEach((icon: Element) => {
                    gsap.set(icon, { transformOrigin: "center center" });
                    
                    icon.addEventListener('mouseenter', () => {
                        gsap.to(icon, {
                            scale: 1.2,
                            rotation: 5,
                            duration: 0.3,
                            ease: "power2.out"
                        });
                    });

                    icon.addEventListener('mouseleave', () => {
                        gsap.to(icon, {
                            scale: 1,
                            rotation: 0,
                            duration: 0.3,
                            ease: "power2.out"
                        });
                    });
                });
            }
        };

        // Use setTimeout to ensure DOM is fully rendered
        const timeoutId = setTimeout(setupHoverAnimations, 100);

        return () => {
            ctx.revert();
            clearTimeout(timeoutId);
        };
    }, []);

    return (
        <div ref={footerRef} className="bg-[#f6f6f6] w-full min-h-[400px] md:h-[600px] px-4 md:px-14 py-6 md:py-10 flex flex-col justify-between items-center gap-8 md:gap-0 relative overflow-hidden">
            <div ref={columnsRef} className="grid grid-cols-2 md:grid-cols-4 max-w-7xl w-full gap-8 md:gap-12">
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
                        <p className="text-sm md:text-base font-normal leading-6 text-[#0e0e0e] hover:text-[#b7b7b7] transition-colors duration-300 cursor-pointer break-words">FAQ's</p>
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
            <div ref={bottomSectionRef} className="flex flex-col md:flex-row justify-between items-center gap-3 md:gap-0 z-50 w-full max-w-7xl">
                <p className="text-[#0E0E0E] font-semibold text-xs md:text-sm leading-5 text-center md:text-left">© 2025 figcons.com. All rights reserved.</p>
                <div className="flex flex-col md:flex-row justify-center md:justify-end items-center gap-4 md:gap-8 w-full md:w-auto">
                    <div className="flex flex-col sm:flex-row gap-4 md:gap-8 items-center">
                        <p className="text-[#0E0E0E] font-semibold text-xs md:text-sm leading-5 text-center">
                            <span className="text-[#b7b7b7]">Contact us →</span> info@figcons.com
                        </p>
                        <p className="text-[#0E0E0E] font-semibold text-xs md:text-sm leading-5 text-center">Consent Preferences</p>
                    </div>
                    <div ref={socialIconsRef} className="flex gap-3 flex-wrap justify-center">
                        <Svg w="20px" h="20px" stroke="#0E0E0E" icon="youtube" />
                        <Svg w="20px" h="20px" stroke="#0E0E0E" icon="be" />
                        <Svg w="20px" h="20px" stroke="#0E0E0E" icon="figma" />
                        <Svg w="20px" h="20px" stroke="#0E0E0E" icon="Pluginweb" />
                        <Svg w="20px" h="20px" stroke="#0E0E0E" icon="instrgram" />
                    </div>
                </div>
            </div>
            <Image 
                ref={backgroundImageRef} 
                src="/footerlogobottom.svg" 
                alt="Footer" 
                width={1000} 
                height={1000} 
                className="w-full h-auto absolute bottom-0 left-0 pointer-events-none object-cover" 
            />
        </div>
    )
}