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

        const tl = gsap.fromTo(titleRef.current,
            { opacity: 0, y: 30 },
            {
                opacity: 1,
                y: 0,
                duration: 0.8,
                ease: "power3.out",
                scrollTrigger: {
                    trigger: titleRef.current,
                    start: "top 80%",
                    end: "bottom 20%",
                    toggleActions: "play none none none",
                    once: true,
                }
            }
        );

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

        // Animate feature cards with stagger
        tl.fromTo(buildIconRef.current?.children,
            { opacity: 0, y: 20, scale: 0.98 },
            { 
                opacity: 1, 
                y: 0, 
                scale: 1, 
                duration: 0.6, 
                ease: "power2.out",
                stagger: 0.06
            }
        );

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
                    className={`flex flex-col gap-[16px] items-center justify-center py-[32px] md:py-[70px] px-[20px] md:px-[45px] ${isMobile ? (feature.hasBgMobile && 'bg-[#f6f6f6]') : (feature.hasBgDesktop && 'bg-[#f6f6f6]')}`}
                >
                    <div className="h-[155px] md:h-[210px] flex flex-col justify-center items-center md:gap-[56px] gap-[27px] text-center">
                        <Svg className="w-[64px] md:w-[80px]" icon={feature.icon} />
                        <p className="text-[#0e0e0e] w-[90%] md:w-auto text-[12px] md:text-[16px] font-normal leading-[24px]">
                            {feature.text}
                        </p>
                    </div>
                </div>
            ))}
        </div>
    );
}