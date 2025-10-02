"use client"
import Button from "@/commons/Button";
import Svg from "@/commons/Svg";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function Appbar() {
    const Links = [
        { name: "Icons", href: "/" },
        { name: "Illustration", href: "/" },
        { name: "Emojis", href: "/" },
        { name: "Pricing", href: "/" },
        { name: "Plugin", href: "/" },
    ]

    const topBannerRef = useRef<HTMLDivElement>(null);
    const navRef = useRef<HTMLElement>(null);
    const logoRef = useRef<HTMLDivElement>(null);
    const linksRef = useRef<HTMLDivElement>(null);
    const buttonsRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const ctx = gsap.context(() => {
            // Initial animation for top banner
            gsap.fromTo(topBannerRef.current, 
                { y: -50, opacity: 0 },
                { 
                    y: 0, 
                    opacity: 1, 
                    duration: 0.8, 
                    ease: "power2.out",
                    delay: 0.2
                }
            );

            // Navbar slide down animation
            gsap.fromTo(navRef.current,
                { y: -100, opacity: 0 },
                {
                    y: 0,
                    opacity: 1,
                    duration: 1,
                    ease: "power3.out",
                    delay: 0.4
                }
            );

            // Logo animation
            gsap.fromTo(logoRef.current,
                { x: -50, opacity: 0, scale: 0.8 },
                {
                    x: 0,
                    opacity: 1,
                    scale: 1,
                    duration: 0.8,
                    ease: "back.out(1.7)",
                    delay: 0.6
                }
            );

            // Navigation links stagger animation
            gsap.fromTo(linksRef.current?.children || [],
                { y: -30, opacity: 0 },
                {
                    y: 0,
                    opacity: 1,
                    duration: 0.6,
                    stagger: 0.1,
                    ease: "power2.out",
                    delay: 0.8
                }
            );

            // Buttons animation
            gsap.fromTo(buttonsRef.current,
                { x: 50, opacity: 0, scale: 0.9 },
                {
                    x: 0,
                    opacity: 1,
                    scale: 1,
                    duration: 0.8,
                    ease: "back.out(1.7)",
                    delay: 1
                }
            );

            // Scroll-triggered navbar effects
            ScrollTrigger.create({
                trigger: navRef.current,
                start: "top top",
                end: "bottom top",
                onEnter: () => {
                    gsap.to(navRef.current, {
                        backgroundColor: "rgba(255, 255, 255, 0.95)",
                        backdropFilter: "blur(10px)",
                        duration: 0.3,
                        ease: "power2.out"
                    });
                },
                onLeaveBack: () => {
                    gsap.to(navRef.current, {
                        backgroundColor: "rgba(255, 255, 255, 1)",
                        backdropFilter: "blur(0px)",
                        duration: 0.3,
                        ease: "power2.out"
                    });
                }
            });

        }, navRef);

        return () => ctx.revert();
    }, []);

    return (
        <>
            <div ref={topBannerRef} className="h-[64px] md:h-[44px] bg-[#f6f6f6] py-[12px] px-[16px] grid place-items-center">
                <p className="text-[12px] text-center font-[600] leading-[20px]">Your one-time or recurring contribution does a lot to keep figcons going.</p>
            </div>
            <nav ref={navRef} className="w-[100%] h-[96px] py-[16px] md:py-[24px] px-[16px] md:px-[40px] flex justify-between items-center sticky top-0 z-50">
                <div ref={logoRef} className="flex items-center gap-[12px]">
                    <button className="bg-[#f6f6f6] w-[40px] h-[40px] rounded-full flex md:hidden items-center justify-center hover:scale-105 transition-transform duration-200">
                        <Svg icon="menu" />
                    </button>
                    <Svg icon="logo" />
                </div>
                <div ref={linksRef} className="hidden md:flex items-center">
                    {Links.map((items, index) => {
                        return (
                            <Link 
                                key={index} 
                                href={items.href} 
                                className="text-[#b7b7b7] text-[14px] py-[8px] px-[16px] leading-[20px] hover:text-[#0e0e0e] transition-colors duration-300 hover:scale-105 transform"
                            >
                                {items.name}
                            </Link>
                        )
                    })}
                </div>
                <div ref={buttonsRef} className="flex gap-[8px] items-center">
                    <Button text="Login" className="w-[65px] md:w-[88px] text-[12px] md:text-[14px] bg-[#0e0e0e] text-[#ffffff] font-bold hover:scale-105 transition-transform duration-200" />
                    <Button text="Sign Up" className="w-[77px] md:w-[104px] text-[12px] md:text-[14px] bg-[#f6f6f6] text-[#0e0e0e] font-bold hover:scale-105 transition-transform duration-200" />
                </div>
            </nav>
        </>
    )
}