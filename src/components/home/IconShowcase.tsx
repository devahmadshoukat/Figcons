"use client";
import Image from "next/image";
import { useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Register ScrollTrigger plugin
gsap.registerPlugin(ScrollTrigger);

export default function IconShowcase() {
    const showcaseRef = useRef<HTMLDivElement>(null);
    const titleRef = useRef<HTMLDivElement>(null);
    const cardsRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!showcaseRef.current) return;

        const tl = gsap.timeline({
            scrollTrigger: {
                trigger: showcaseRef.current,
                start: "top 80%",
                end: "bottom 20%",
                toggleActions: "play none none reverse",
            }
        });

        // Animate title section
        tl.fromTo(titleRef.current,
            { opacity: 0, y: 30 },
            { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" }
        );

        // Animate cards with stagger and scale effect
        tl.fromTo(cardsRef.current?.children,
            { opacity: 0, y: 50, scale: 0.8 },
            { 
                opacity: 1, 
                y: 0, 
                scale: 1, 
                duration: 0.7, 
                ease: "power2.out",
                stagger: 0.15
            },
            "-=0.4"
        );

    }, []);
    const Cards = [
        {
            title: "The encyclopedia of icons",
            description: "A complete library covering every concept you need—available in versatile styles for any platform.",
            image: "/IconShowcase1.svg",
        },
        {
            title: "The Helvetica of icons",
            description: "Timeless, legible forms that fit anywhere—perfect for product UI and system patterns.",
            image: "/IconShowcase2.svg",
        },
        {
            title: "Smooth icons",
            description: "Elegant curves and fluid shapes that bring motion and warmth to your interfaces.",
            image: "/IconShowcase3.svg",
        },
        {
            title: "Brutalist icons",
            description: "Geometric, high-tech look for modern dashboards and bold visual systems.",
            image: "/IconShowcase4.svg",
        },
        {
            title: "Playful icons",
            description: "Friendly, chunky silhouettes inspired by hand-drawn curves—great for marketing and onboarding.",
            image: "/IconShowcase5.svg",
        },
        {
            title: "30+ other styles",
            description: "Explore special collections for unique vibes and use cases.",
            image: "/IconShowcase6.svg",
        },
    ]
    return (
        <div ref={showcaseRef} className="flex flex-col justify-center items-center gap-[32px]">
            <div ref={titleRef} className="md:w-[568px] w-[100%] flex flex-col gap-[12px] justify-center items-center text-center">
                <h1 className="text-[#0e0e0e] text-[20px] md:text-[30px] font-bold leading-[32px] md:leading-[40px]">Everything You Need to Design Smarter</h1>
                <p className="text-[#454545] text-[14px] md:text-[16px] font-normal leading-[20px] md:leading-[24px]">From clean minimal sets to playful creative styles, everything is crafted to fit perfectly into websites, apps, and brand projects.</p>
            </div>
            <div ref={cardsRef} className="grid gap-[36px] md:gap-[0px] grid-cols-1 md:grid-cols-3">
                {Cards.map((card, index) => (
                    <div key={index} className="flex flex-col gap-[16px] md:gap-[32px] md:px-[24px] px-[0px] pb-[0px] md:pb-[32px]">
                        <Image src={card.image} width={999999} height={999999} className="w-[100%] 2xl:h-[408px] md:h-[350px] h-[408px] object-contain md:object-cover rounded-[24px] pointer-events-none" alt="" />
                        <div className="flex flex-col justify-start items-start gap-[8px]">
                            <h1 className="text-[#0e0e0e] text-[20px] font-bold leading-[32px]">{card.title}</h1>
                            <p className="text-[#454545] text-[12px] font-normal leading-[20px]">{card.description}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}