"use client";
import Svg from "@/commons/Svg";
import useMediaQuery from "@/commons/UseMediaQuery";
import { useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Register ScrollTrigger plugin
gsap.registerPlugin(ScrollTrigger);

export const BuildIconTitle = () => {
    const titleRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!titleRef.current) return;

        const tl = gsap.timeline({
            scrollTrigger: {
                trigger: titleRef.current,
                start: "top 85%",
                end: "bottom 15%",
                toggleActions: "play none none none",
                once: true,
                fastScrollEnd: true,
            }
        });

        // Animate title with smooth entrance
        tl.fromTo(titleRef.current,
            { 
                opacity: 0, 
                y: 40,
                scale: 0.95
            },
            {
                opacity: 1,
                y: 0,
                scale: 1,
                duration: 1.2,
                ease: "power3.out",
            }
        );

        // Add subtle bounce effect to the title
        tl.to(titleRef.current, {
            scale: 1.02,
            duration: 0.3,
            ease: "power2.out",
        }, "-=0.2")
        .to(titleRef.current, {
            scale: 1,
            duration: 0.4,
            ease: "elastic.out(1, 0.5)",
        });

        // Cleanup function
        return () => {
            tl.kill();
        };
    }, []);
    return (
        <div ref={titleRef} className="w-[100%] flex flex-col gap-[12px] items-center justify-center">
            <h1 className="text-[#0e0e0e] text-[24px] md:text-[30px] font-bold leading-[40px]">BuildIcon</h1>
            <p className="text-[#454545] text-[14px] md:text-[16px] font-normal leading-[24px]">Export and integrate in seconds.</p>
        </div>
    )
}

export default function BuildIcon() {
    const isMobile = useMediaQuery("(max-width: 768px)");
    const buildIconRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!buildIconRef.current) return;

        const tl = gsap.timeline({
            scrollTrigger: {
                trigger: buildIconRef.current,
                start: "top 85%",
                end: "bottom 15%",
                toggleActions: "play none none none",
                once: true,
                fastScrollEnd: true,
                refreshPriority: -1,
            }
        });

        // Animate feature cards with enhanced stagger and smooth effects
        tl.fromTo(buildIconRef.current?.children,
            { 
                opacity: 0, 
                y: 30, 
                scale: 0.9,
                rotationX: 15
            },
            { 
                opacity: 1, 
                y: 0, 
                scale: 1,
                rotationX: 0,
                duration: 0.8, 
                ease: "power3.out",
                stagger: {
                    amount: 0.3,
                    from: "start"
                }
            }
        );

        // Add subtle hover-like effect to each card
        tl.to(buildIconRef.current?.children, {
            scale: 1.02,
            duration: 0.2,
            ease: "power2.out",
            stagger: {
                amount: 0.1,
                from: "start"
            }
        }, "-=0.4")
        .to(buildIconRef.current?.children, {
            scale: 1,
            duration: 0.3,
            ease: "elastic.out(1, 0.3)",
            stagger: {
                amount: 0.1,
                from: "start"
            }
        });

        // Cleanup function
        return () => {
            tl.kill();
        };

    }, []);

    const features = [
        { icon: "paint" as const, text: "Recolor entire icons sets", hasBgDesktop: false, hasBgMobile: false },
        { icon: "resize" as const, text: "Resize vectors, with perfect quality", hasBgDesktop: true, hasBgMobile: true },
        { icon: "brandColors" as const, text: "Save your brand colors", hasBgDesktop: false, hasBgMobile: true },
        { icon: "globelsearch" as const, text: "Global search across all icons sets", hasBgDesktop: true, hasBgMobile: false },
        { icon: "adjust" as const, text: "Adjust stroke width, background color", hasBgDesktop: true, hasBgMobile: false },
        { icon: "clouddownload" as const, text: "Download as png, svg, pdf, or jsx", hasBgDesktop: false, hasBgMobile: true },
        { icon: "folder" as const, text: "Multi-select and download as zip", hasBgDesktop: true, hasBgMobile: true },
        { icon: "favorite" as const, text: "Save your favorites in projects", hasBgDesktop: false, hasBgMobile: false },
        { icon: "copy" as const, text: "Copy and paste in one-click", hasBgDesktop: false, hasBgMobile: false },
        { icon: "responsive" as const, text: "Responsive ready for Tailwind/React", hasBgDesktop: true, hasBgMobile: true },
        { icon: "figma" as const, text: "Keep focus with our Figma plugin", hasBgDesktop: false, hasBgMobile: true },
        { icon: "update" as const, text: "Free icons updates, synchronized in the app", hasBgDesktop: true, hasBgMobile: false }
    ];

    return (
        <div ref={buildIconRef} className="w-full grid md:grid-cols-4 grid-cols-2">
            {features.map((feature, index) => (
                <div
                    key={index}
                    className={`flex flex-col gap-[16px] items-center justify-center py-[32px] md:py-[70px] px-[20px] md:px-[45px] transition-all duration-300 ease-out hover:scale-105 hover:shadow-lg ${isMobile ? (feature.hasBgMobile && 'bg-[#f6f6f6]') : (feature.hasBgDesktop && 'bg-[#f6f6f6]')}`}
                >
                    <div className="h-[155px] md:h-[210px] flex flex-col justify-center items-center md:gap-[56px] gap-[27px] text-center">
                        <Svg className="w-[64px] md:w-[80px] transition-transform duration-300 ease-out hover:scale-110" icon={feature.icon} />
                        <p className="text-[#0e0e0e] w-[90%] md:w-auto text-[12px] md:text-[16px] font-normal leading-[24px]">
                            {feature.text}
                        </p>
                    </div>
                </div>
            ))}
        </div>
    );
}