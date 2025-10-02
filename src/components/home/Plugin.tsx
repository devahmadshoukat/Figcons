"use client";
import Svg, { IconName } from "@/commons/Svg";
import Image from "next/image";
import { useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Register ScrollTrigger plugin
gsap.registerPlugin(ScrollTrigger);

export default function Plugin() {
    const pluginRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!pluginRef.current) return;

        const tl = gsap.timeline({
            scrollTrigger: {
                trigger: pluginRef.current,
                start: "top 85%",
                end: "bottom 15%",
                toggleActions: "play none none none",
                once: true,
                fastScrollEnd: true,
                refreshPriority: -1,
            }
        });

        // Animate plugin cards with stagger
        tl.fromTo(pluginRef.current?.children,
            { opacity: 0, y: 25, scale: 0.98 },
            { 
                opacity: 1, 
                y: 0, 
                scale: 1, 
                duration: 0.5, 
                ease: "power2.out",
                stagger: 0.08
            }
        );

        // Cleanup function
        return () => {
            tl.kill();
        };

    }, []);
    const items = [
        {
            title: "Web App Browser",
            description: "Instant access to all our icons from your web browser.",
            image: "/pluginWebAppBrowser.svg",
            button: {
                text: "Start Now",
                icon: "Pluginweb" as IconName
            }
        },
        {
            title: "Web App Browser",
            description: "Instant access to all our icons from your web browser.",
            image: "/pluginWebAppBrowser.svg",
            button: {
                text: "Install Plugin",
                icon: "figma" as IconName
            }
        },
        {
            title: "Web App Browser",
            description: "Instant access to all our icons from your web browser.",
            image: "/pluginWebAppBrowser.svg",
            button: {
                text: "Install Plugin",
                icon: "FramerPlugin" as IconName
            }
        },
    ]
    return (
        <div ref={pluginRef} className="w-[100%] grid md:grid-cols-3 grid-cols-1 gap-[24px] md:gap-[0px]">
            {items.map((item, index) => (
                <div key={index} className="w-[100%] md:px-[24px] px-[0px] flex flex-col gap-[12px] items-start justify-center">
                    <Image src={item.image} alt="Plugin" width={1000} height={1000} className="w-[100%] 2xl:h-[400px] md:h-[300px] h-[500px] object-contain pointer-events-none" />
                    <div className="flex flex-col gap-[8px]">
                        <h1 className="text-[20px] text-[#0e0e0e] font-bold leading-[32px]">{item.title}</h1>
                        <p className="text-[12px] text-[#454545] font-normal leading-[20px]">{item.description}</p>
                    </div>
                    <div className="flex items-center justify-center">
                        <button className="px-[24px] py-[4px] rounded-full bg-[#0e0e0e] w-[200px] h-[50px] 2xl:text-[16px] md:text-[13px] text-[12px] text-[#ffffff] font-bold leading-[24px] flex gap-[8px] items-center justify-center">
                            <Svg w="20px" h="20px" stroke="#ffffff" icon={item.button.icon} />
                            {item.button.text}
                        </button>
                    </div>
                </div>
            ))}
        </div>
    )
}