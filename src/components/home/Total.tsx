"use client";
import { useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Register ScrollTrigger plugin
gsap.registerPlugin(ScrollTrigger);

export default function Total() {
    const totalRef = useRef<HTMLDivElement>(null);
    const statsRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!totalRef.current) return;

        const tl = gsap.timeline({
            scrollTrigger: {
                trigger: totalRef.current,
                start: "top 80%",
                end: "bottom 20%",
                toggleActions: "play none none reverse",
            }
        });

        // Animate stats with stagger and counter effect
        tl.fromTo(totalRef.current?.children,
            { opacity: 0, y: 40, scale: 0.9 },
            { 
                opacity: 1, 
                y: 0, 
                scale: 1, 
                duration: 0.8, 
                ease: "power2.out",
                stagger: 0.2
            }
        );

        // Add counter animation for numbers
        const numbers = totalRef.current?.querySelectorAll('h1');
        numbers?.forEach((number, index) => {
            const targetValue = parseInt(number.textContent || '0');
            gsap.fromTo(number, 
                { textContent: 0 },
                {
                    textContent: targetValue,
                    duration: 1.5,
                    ease: "power2.out",
                    snap: { textContent: 1 },
                    delay: index * 0.3,
                    onUpdate: function() {
                        number.textContent = Math.ceil(Number(this.targets()[0].textContent)).toString();
                    }
                }
            );
        });

    }, []);
    return (
        <div ref={totalRef} className="md:grid flex flex-wrap md:grid-cols-3 w-[100%]">
            <div className="w-[50%] md:w-auto flex gap-[16px] justify-center items-end px-[15px] md:px-0 py-[40px] border-r border-[#ececec]">
                <h1 className="text-[64px] text-[#0e0e0e] font-bold leading-[72px]">4+</h1>
                <p className="w-auto md:w-[136px] text-[16px] text-[#b7b7b7] font-normal leading-[24px] pt-[10px]">Years of design experience</p>
            </div>
            <div className="w-[50%] md:w-auto flex gap-[16px] justify-center items-end px-[15px] md:px-0 py-[40px] md:border-r border-[#ececec]">
                <h1 className="text-[64px] text-[#0e0e0e] font-bold leading-[72px]">12</h1>
                <p className="w-auto md:w-[136px] text-[16px] text-[#b7b7b7] font-normal leading-[24px] pt-[10px]">Full-time icon designers</p>
            </div>
            <div className="w-[100%] md:w-auto flex gap-[16px] justify-center items-end px-[15px] md:px-0 py-[40px] border-t border-[#ececec] md:border-t-0">
                <h1 className="text-[64px] text-[#0e0e0e] font-bold leading-[72px]">64</h1>
                <p className="w-auto md:w-[136px] text-[16px] text-[#b7b7b7] font-normal leading-[24px] pt-[10px]">Pro vector icon sets</p>
            </div>
        </div>
    )
}