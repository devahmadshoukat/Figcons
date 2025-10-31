"use client";
import IconsEditor from "@/app/icons/IconsEditor";
import { useRef, useState, useEffect } from "react";
import { iconsAPI } from "@/commons/Api";

interface Icon {
    _id: string;
    name: string;
    cloudinaryUrl: {
        svg: string;
        webp: string;
    };
    isPremium: boolean;
    isPublic: boolean;
    category: string;
}

interface CategoryGroup {
    category: {
        _id: string;
        name: string;
        cloudinaryFolder: string;
    };
    icons: Icon[];
    iconCount: number;
}

// Secure Icon Canvas Component
const SecureIconCanvas = ({ iconUrl, iconName }: { iconUrl: string; iconName: string }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d', { willReadFrequently: false });
        if (!ctx) return;

        // Load and draw image on canvas
        const img = new Image();
        img.crossOrigin = 'anonymous';
        
        img.onload = () => {
            // Clear canvas
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            // Draw image centered
            const size = 27;
            const x = (canvas.width - size) / 2;
            const y = (canvas.height - size) / 2;
            ctx.drawImage(img, x, y, size, size);
        };

        img.onerror = () => {
            console.error('Failed to load icon:', iconName);
        };

        img.src = iconUrl;
    }, [iconUrl, iconName]);

    return (
        <canvas
            ref={canvasRef}
            width={32}
            height={32}
            className="w-[32px] h-[32px] pointer-events-none select-none"
            onContextMenu={(e) => e.preventDefault()}
            style={{ imageRendering: 'auto' }}
        />
    );
};

export default function IconsCanvas() {
    const [categoryGroups, setCategoryGroups] = useState<CategoryGroup[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedIcon, setSelectedIcon] = useState<Icon | null>(null);
    const [isEditorOpen, setIsEditorOpen] = useState(false);
    const [totalIcons, setTotalIcons] = useState(0);

    const mainContentRef = useRef<HTMLDivElement>(null);

    // Fetch organized icons from API
    useEffect(() => {
        const fetchIcons = async () => {
            try {
                const response = await iconsAPI.getOrganized();
                
                if (response.success) {
                    setCategoryGroups(response.data);
                    setTotalIcons(response.summary?.totalIcons || 0);
                }
            } catch (error) {
                console.error('Error fetching icons:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchIcons();
    }, []);

    // Security: Disable keyboard shortcuts and protect canvas
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Prevent save/print shortcuts
            if ((e.ctrlKey || e.metaKey) && ['s', 'S', 'p', 'P'].includes(e.key)) {
                e.preventDefault();
            }
        };

        const handleContextMenu = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            // Prevent right-click on canvas elements
            if (target.tagName === 'CANVAS') {
                e.preventDefault();
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        document.addEventListener('contextmenu', handleContextMenu);

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            document.removeEventListener('contextmenu', handleContextMenu);
        };
    }, []);

    const handleIconClick = (icon: Icon) => {
        if (selectedIcon?._id === icon._id && isEditorOpen) {
            closeEditor();
        } else {
            openEditor(icon);
        }
    };

    const openEditor = (icon: Icon) => {
        setSelectedIcon(icon);
        setIsEditorOpen(true);

        // Prevent body scroll only on mobile
        if (window.innerWidth < 768) {
            document.body.style.overflow = "hidden";
        }
    };

    const closeEditor = () => {
        setIsEditorOpen(false);
        setSelectedIcon(null);

        // Restore body scroll only on mobile
        if (window.innerWidth < 768) {
            document.body.style.overflow = "auto";
        }
    };

    return (
        <div className="w-full md:px-[40px] px-[16px] py-[32px] gap-[10px] flex overflow-x-hidden">
            <div ref={mainContentRef} className="flex flex-col gap-[32px] w-full">
                <div className="w-full flex flex-col gap-[32px] justify-center items-start">
                    {loading ? (
                        <div className="w-full flex justify-center items-center py-[40px]">
                            <div className="text-[#b7b7b7] text-[14px]">Loading icons...</div>
                        </div>
                    ) : categoryGroups.length === 0 ? (
                        <div className="w-full flex justify-center items-center py-[40px]">
                            <div className="text-[#b7b7b7] text-[14px]">No icons found</div>
                        </div>
                    ) : (
                        <div className="w-full flex flex-col gap-[40px]">
                            {categoryGroups.map((group) => (
                                <div key={group.category._id} className="w-full flex flex-col gap-[20px]">
                                    {/* Category Header */}
                                    <h2 className="text-[#0e0e0e] text-[16px] font-semibold leading-[24px] ml-[16px]">
                                        {group.category.name}
                                        <span className="ml-[8px] text-[#b7b7b7] text-[12px] font-normal">
                                            ({group.iconCount} {group.iconCount === 1 ? 'icon' : 'icons'})
                                        </span>
                                    </h2>

                                    {/* Icons Grid */}
                                    <div 
                                        className="w-full flex flex-wrap justify-start gap-[12px]"
                                        onContextMenu={(e) => e.preventDefault()}
                                        onDragStart={(e) => e.preventDefault()}
                                    >
                                        {group.icons.map((icon) => (
                                            <div
                                                key={icon._id}
                                                className={`relative w-[83.5px] md:w-[102px] h-[83.5px] md:h-[102px] rounded-[20px] border flex justify-center items-center cursor-pointer transition-colors select-none ${
                                                    selectedIcon?._id === icon._id ? "border-[#0e0e0e]" : "border-[#ececec]"
                                                }`}
                                                onClick={() => handleIconClick(icon)}
                                                onContextMenu={(e) => e.preventDefault()}
                                            >
                                                {/* Show PRO badge if isPremium is true */}
                                                {icon.isPremium && (
                                                    <div className="absolute -top-[10px] bg-[#7AE684] h-[18px] text-[#2D6332] text-[8px] font-extrabold px-[8px] py-[4px] rounded-full">
                                                        PRO
                                                    </div>
                                                )}
                                                
                                                {/* Secure Canvas Display - Prevents direct image download */}
                                                <SecureIconCanvas 
                                                    iconUrl={icon.cloudinaryUrl.webp}
                                                    iconName={icon.name}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {isEditorOpen && selectedIcon && (
                <>
                    {/* Desktop: Side panel */}
                    <div className="hidden md:block">
                        <IconsEditor selectedIcon={selectedIcon.name} />
                    </div>

                    {/* Mobile: Full screen popup */}
                    <div className="md:hidden fixed inset-0 z-50 bg-white overflow-hidden">
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
                                <IconsEditor selectedIcon={selectedIcon.name} />
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}