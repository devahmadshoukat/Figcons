"use client";
import IconsEditor from "@/app/icons/IconsEditor";
import Svg from "@/commons/Svg";
import { gsap } from "gsap";
import { useRef, useState } from "react";

// Const array of available icons
const ICONS_LIST = [
    "clouddownload", "star", "paint", "resize", "brandColors",
    "share", "arrowbottom", "redo", "search", "instrgram", "figma", "be", "youtube"
];

export default function IconsCanvas() {
    const [selectedIcon, setSelectedIcon] = useState<string | null>(null);
    const [isEditorOpen, setIsEditorOpen] = useState(false);
    const [hasAnimated, setHasAnimated] = useState(false);

    const mainContentRef = useRef<HTMLDivElement>(null);
    const editorRef = useRef<HTMLDivElement>(null);
    const mobileEditorRef = useRef<HTMLDivElement>(null);


    const handleIconClick = (iconName: string) => {
        if (selectedIcon === iconName && isEditorOpen) {
            // If clicking the same selected icon, close the editor
            closeEditor();
        } else {
            // If clicking a different icon or no icon is selected, open the editor
            openEditor(iconName);
        }
    };

    const openEditor = (iconName: string) => {
        setSelectedIcon(iconName);
        setIsEditorOpen(true);

        // Prevent body scroll only on mobile
        if (window.innerWidth < 768) {
            document.body.style.overflow = 'hidden';
        }

        // Only animate the first time editor opens
        if (!hasAnimated) {
            // Animate main content width
            if (mainContentRef.current) {
                gsap.to(mainContentRef.current, {
                    width: "calc(100% - 252px)",
                    duration: 0.4,
                    ease: "power2.out"
                });
            }

            // Animate editor panel
            if (editorRef.current) {
                gsap.fromTo(editorRef.current,
                    { x: 212, opacity: 0 },
                    { x: 0, opacity: 1, duration: 0.4, ease: "power2.out" }
                );
            }

            // Animate mobile editor
            if (mobileEditorRef.current) {
                gsap.fromTo(mobileEditorRef.current,
                    { y: "100%", opacity: 0 },
                    { y: 0, opacity: 1, duration: 0.4, ease: "power2.out" }
                );
            }

            setHasAnimated(true);
        }
    };

    const closeEditor = () => {
        setIsEditorOpen(false);
        setSelectedIcon(null);
        
        // Restore body scroll only on mobile
        if (window.innerWidth < 768) {
            document.body.style.overflow = 'auto';
        }

        // Reset main content width to 100% when closing
        if (mainContentRef.current) {
            gsap.to(mainContentRef.current, {
                width: "100%",
                duration: 0.4,
                ease: "power2.out"
            });
        }
    };

    return (
        <div className="w-[100%] md:px-[40px] px-[16px] py-[32px] gap-[10px] flex overflow-x-hidden">
            <div ref={mainContentRef} className="flex flex-col gap-[32px] w-[100%]">
                <div className="w-[100%] flex flex-col gap-[20px] justift-center items-start">
                    <h1 className="text-[#0e0e0e] text-[18px] font-bold leading-[32px] ml-[16px]">3D Editor <span className="ml-[12px] text-[#b7b7b7] text-[14px] font-normal leading-[20px]">{ICONS_LIST.length} Icons</span></h1>
                    <div className="w-[100%] flex flex-wrap justify-center gap-[12px]">
                        {ICONS_LIST.map((iconName, index) => (
                            <div
                                key={index}
                                className={`w-[83.5px] md:w-[102px] h-[83.5px] md:h-[102px] rounded-[20px] border flex justify-center items-center cursor-pointer transition-colors ${selectedIcon === iconName
                                    ? 'border-[#0e0e0e]'
                                    : 'border-[#ececec]'
                                    }`}
                                onClick={() => handleIconClick(iconName)}
                            >
                                <Svg stroke="#0e0e0e" w="32px" h="32px" icon={iconName as keyof typeof import("@/public/assets").assets} />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            {isEditorOpen && selectedIcon && (
                <>
                    {/* Desktop: Side panel */}
                    <div ref={editorRef} className="hidden md:block">
                        <IconsEditor selectedIcon={selectedIcon} />
                    </div>
                    {/* Mobile: Full screen popup */}
                    <div ref={mobileEditorRef} className="md:hidden fixed inset-0 z-50 bg-white overflow-hidden">
                        <div className="w-full h-full flex flex-col overflow-hidden">
                            <div className="flex justify-between items-center p-4 border-b border-[#ececec] flex-shrink-0">
                                <h2 className="text-[#0e0e0e] text-[18px] font-bold">Icon Editor</h2>
                                <button
                                    onClick={closeEditor}
                                    className="text-[#454545] text-[24px] hover:text-[#0e0e0e]"
                                >
                                    ✕
                                </button>
                            </div>
                            <div className="flex-1 overflow-y-auto overscroll-contain">
                                <IconsEditor selectedIcon={selectedIcon} />
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    )
}