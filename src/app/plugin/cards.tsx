"use client";
import Svg, { IconName } from "@/commons/Svg";
import Image from "next/image";
import { useRef, useEffect, useState } from 'react';

export default function Cards() {
    const pluginRef = useRef<HTMLDivElement>(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                    // Unobserve after animation triggers to improve performance
                    observer.unobserve(entry.target);
                }
            },
            { 
                threshold: 0.2,
                rootMargin: '0px 0px -50px 0px'
            }
        );

        const currentRef = pluginRef.current;
        if (currentRef) {
            observer.observe(currentRef);
        }

        return () => {
            if (currentRef) {
                observer.unobserve(currentRef);
            }
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
        <div className="flex flex-col justify-center items-center gap-[51px]">
            <div className={`md:w-[500px] flex flex-col justify-center items-center text-center gap-[12px] transition-all duration-700 ease-out ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                }`}>
                <p className="text-[30px] font-bold leading-[40px]">Design Faster. Design Smarter.</p>
                <p className="w-[90%] md:w-[100%] text-[16px] leading-[24px]">Access a rich library of icons and illustrations that save you time and elevate your designs.</p>
            </div>
            <div ref={pluginRef} className="w-[100%] grid md:grid-cols-3 grid-cols-1 gap-[24px] md:gap-[0px]">
                {items.map((item, index) => (
                    <div
                        key={index}
                        className={`w-[100%] md:px-[20px] px-[0px] flex flex-col gap-[12px] items-center justify-center transform transition-all duration-800 ease-out will-change-transform ${isVisible
                            ? 'opacity-100 translate-y-0 scale-100'
                            : 'opacity-0 translate-y-8 scale-95'
                            }`}
                        style={{
                            transitionDelay: isVisible ? `${index * 150}ms` : '0ms',
                            transform: isVisible 
                                ? 'translateY(0) scale(1)' 
                                : 'translateY(32px) scale(0.95)'
                        }}
                    >
                        <Image 
                            src={item.image} 
                            alt="Plugin" 
                            width={1000} 
                            height={1000} 
                            className="w-[100%] 2xl:h-[400px] md:h-[400px] h-[500px] object-contain md:object-cover rounded-[32px] pointer-events-none transition-transform duration-300 hover:scale-105" 
                        />
                        <div className="flex flex-col gap-[8px]">
                            <h1 className="text-[20px] text-[#0e0e0e] font-bold leading-[32px]">{item.title}</h1>
                            <p className="text-[12px] text-[#454545] font-normal leading-[20px]">{item.description}</p>
                        </div>
                        <div className="flex items-center justify-center">
                            <button className="px-[24px] py-[4px] rounded-full bg-[#0e0e0e] w-[200px] h-[50px] 2xl:text-[16px] md:text-[13px] text-[12px] text-[#ffffff] font-bold leading-[24px] flex gap-[8px] items-center justify-center transition-all duration-300 hover:bg-[#333333] hover:scale-105 active:scale-95">
                                <Svg w="20px" h="20px" stroke="#ffffff" icon={item.button.icon} />
                                {item.button.text}
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}