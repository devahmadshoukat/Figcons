"use client";
import Svg, { IconName } from "@/commons/Svg";
import Image from "next/image";

export default function Plugin() {
    const items = [
        {
            title: "Web App Browser",
            description: "Instant access to all our icons from your web browser.",
            image: "/pluginWebAppBrowser.svg",
            button: {
                text: "Start Now",
                icon: "Pluginweb" as IconName,
                bgColor: `bg-[#E84C88]`,
                textColor: `text-[#ffffff]`
            }
        },
        {
            title: "Figma Plugin",
            description: "Drag and drop directly in Figma and customise stroke widths.",
            image: "/pluginFigma.svg",
            button: {
                text: "Install Plugin",
                icon: "figma" as IconName,
                bgColor: `bg-[#0E0E0E]`,
                textColor: `text-[#ffffff]`
            }
        },
        {
            title: "Framer Plugin",
            description: "Drag and drop directly in Framer and customise stroke widths.",
            image: "/pluginFramer.svg",
            button: {
                text: "Install Plugin",
                icon: "FramerPlugin" as IconName,
                bgColor: `bg-[#00AAFF]`,
                textColor: `text-[#ffffff]`
            }
        },
        {
            title: "Framer Plugin",
            description: "Drag and drop directly in Framer and customise stroke widths.",
            image: "/pluginFramer.svg",
            button: {
                text: "Install Plugin",
                icon: "FramerPlugin" as IconName,
                bgColor: `bg-[#00AAFF]`,
                textColor: `text-[#ffffff]`
            }
        },
        {
            title: "Framer Plugin",
            description: "Drag and drop directly in Framer and customise stroke widths.",
            image: "/pluginFramer.svg",
            button: {
                text: "Install Plugin",
                icon: "FramerPlugin" as IconName,
                bgColor: `bg-[#00AAFF]`,
                textColor: `text-[#ffffff]`
            }
        },
    ];

    return (
        <div className="w-[100%] grid md:grid-cols-3 grid-cols-1 gap-[24px] md:gap-[0]">
            {items.map((item, index) => (
                <div
                    key={index}
                    className="w-[100%] md:px-[24px] px-[0px] flex flex-col gap-[12px] mb-[0] md:mb-[32px] items-center justify-center"
                >
                    <Image
                        src={item.image}
                        alt="Plugin"
                        width={1000}
                        height={1000}
                        className="w-[100%] 2xl:h-[400px] md:h-[400px] h-[500px] object-contain md:object-cover rounded-[32px] pointer-events-none"
                    />
                    <div className="flex flex-col gap-[8px] text-center md:text-left">
                        <h1 className="text-[20px] text-[#0e0e0e] font-bold leading-[32px]">
                            {item.title}
                        </h1>
                        <p className="text-[12px] text-[#454545] font-normal leading-[20px]">
                            {item.description}
                        </p>
                    </div>
                    <div className="flex items-center justify-center">
                        <button className={`px-[24px] py-[4px] rounded-full ${item.button.bgColor} ${item.button.textColor} w-[200px] h-[50px] 2xl:text-[16px] md:text-[13px] text-[12px] font-bold leading-[24px] flex gap-[8px] items-center justify-center`}>
                            <Svg w="20px" h="20px" stroke="#ffffff" icon={item.button.icon} />
                            {item.button.text}
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
}