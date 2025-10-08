"use client";
import Svg, { IconName } from "@/commons/Svg";
import Image from "next/image";
import { useEffect, useRef, useState } from 'react';

export default function Plugin() {
    const pluginRef = useRef<HTMLDivElement>(null);
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
        <div ref={pluginRef} className="w-[100%] grid md:grid-cols-3 grid-cols-1 gap-[24px] md:gap-[0px]">
            {items.map((item, index) => (
                <div 
                    key={index} 
                    className={`w-[100%] md:px-[24px] px-[0px] flex flex-col gap-[12px] items-center justify-center transition-all duration-1000 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] ${
                        isVisible 
                            ? 'opacity-100 translate-y-0 blur-0' 
                            : 'opacity-0 translate-y-6 blur-sm'
                    }`}
                    style={{
                        transitionDelay: isVisible ? `${index * 100}ms` : '0ms'
                    }}
                >
                    <Image src={item.image} alt="Plugin" width={1000} height={1000} className="w-[100%] 2xl:h-[400px] md:h-[400px] h-[500px] object-contain md:object-cover rounded-[32px] pointer-events-none" />
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