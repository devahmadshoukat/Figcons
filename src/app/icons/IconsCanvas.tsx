"use client";
import { useEffect, useState } from "react";
import IconsEditor from "./IconsEditor";

interface Icon {
    id: string;
    name: string;
    cloudinaryUrl: string;
    isPremium: boolean;
}

export default function IconsCanvas() {
    const API_URL = 'https://figcons-backend.vercel.app/api/icons';
    const [icons, setIcons] = useState<Icon[]>([]);
    const [selectedIcon, setSelectedIcon] = useState<Icon | null>(null);

    // Draw icon on canvas
    const drawImageOnCanvas = (canvas: HTMLCanvasElement, imageUrl: string) => {
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const img = new Image();
        img.crossOrigin = 'anonymous';

        img.onload = () => {
            canvas.width = 40;
            canvas.height = 40;
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            const scale = Math.min(canvas.width / img.width, canvas.height / img.height);
            const scaledWidth = img.width * scale;
            const scaledHeight = img.height * scale;
            const x = (canvas.width - scaledWidth) / 2;
            const y = (canvas.height - scaledHeight) / 2;
            ctx.drawImage(img, x, y, scaledWidth, scaledHeight);
        };

        img.onerror = () => {
            ctx.fillStyle = '#f6f6f6';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = '#b7b7b7';
            ctx.font = '20px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('★', canvas.width / 2, canvas.height / 2);
        };

        img.src = imageUrl;
    };

    // Handle canvas reference
    const handleCanvasRef = (canvas: HTMLCanvasElement | null, imageUrl: string) => {
        if (canvas && imageUrl) {
            drawImageOnCanvas(canvas, imageUrl);
            canvas.addEventListener('contextmenu', (e) => e.preventDefault());
        }
    };

    // Fetch icons and sort premium to top
    useEffect(() => {
        fetch(API_URL)
            .then(res => res.json())
            .then(data => {
                if (data.success && data.data) {
                    const sorted = data.data.sort((a: Icon, b: Icon) =>
                        a.isPremium === b.isPremium ? 0 : a.isPremium ? -1 : 1
                    );
                    setIcons(sorted);
                }
            })
            .catch(err => console.error("Error fetching icons:", err));
    }, []);

    // Handle icon click
    const handleIconClick = (icon: Icon) => {
        setSelectedIcon(icon);
    };

    // Handle close editor
    const handleCloseEditor = () => {
        setSelectedIcon(null);
    };

    // Handle body overflow when editor opens/closes
    useEffect(() => {
        if (selectedIcon) {
            // Disable body overflow when editor is open
            document.body.style.overflow = 'hidden';
        } else {
            // Re-enable body overflow when editor is closed
            document.body.style.overflow = 'unset';
        }

        // Cleanup function to restore overflow on component unmount
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [selectedIcon]);

    return (
        <div className="w-full flex">
            {/* Left side - Icons Canvas */}
            <div className="flex-1 md:px-[40px] px-[16px] py-[32px] overflow-y-auto w-[80%]">
                <div className="flex flex-col gap-[32px] w-full">
                    <div className="flex flex-col gap-[20px] items-start">
                        <h1 className="text-[#0e0e0e] text-[18px] font-bold leading-[32px] ml-[16px]">
                            3D Editor
                            <span className="ml-[12px] text-[#b7b7b7] text-[14px] font-normal leading-[20px]">
                                {icons.length} Icons
                            </span>
                        </h1>

                        <div className="w-full flex flex-wrap justify-center gap-[12px]">
                            {icons.map((item, index) => (
                                <div
                                    key={index}
                                    onClick={() => handleIconClick(item)}
                                    onContextMenu={(e) => e.preventDefault()}
                                    className={`relative w-[83.5px] md:w-[102px] h-[83.5px] md:h-[102px] rounded-[20px] border flex justify-center items-center cursor-pointer transition-all duration-300
                                              hover:border-[#0e0e0e] bg-white hover:shadow-md`}
                                >
                                    {/* ♛ Premium badge */}
                                    {item.isPremium && (
                                        <div className="absolute text-[#0e0e0e] top-1 right-1 text-[14px] font-bold">
                                            👑
                                        </div>
                                    )}

                                    <canvas
                                        ref={(canvas) => handleCanvasRef(canvas, item.cloudinaryUrl)}
                                        className="w-10 h-10 rounded-lg"
                                        style={{ imageRendering: 'auto' }}
                                        onContextMenu={(e) => e.preventDefault()}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Backdrop overlay */}
            {selectedIcon && (
                <div
                    className="fixed inset-0 bg-black/20 z-[9999] animate-fadeIn"
                    onClick={handleCloseEditor}
                />
            )}

            {/* Right side - Icons Editor */}
            {selectedIcon && (
                <div className="fixed right-0 top-0 w-[100%] md:w-[300px] 3xl:w-[350px] h-full bg-white border-l border-[#ececec] shadow-2xl z-[9999] overflow-y-auto animate-slideInRight" style={{ scrollbarWidth: 'thin' }}>
                    <div className="sticky top-0 bg-white/95 backdrop-blur-sm border-b border-[#ececec] p-4 z-10">
                        <div className="flex justify-between items-center">
                            <div className="flex flex-col gap-[2px]">
                                <h2 className="text-[#0e0e0e] text-[16px] font-bold leading-[20px]">Icon Editor</h2>
                                <p className="text-[#666666] text-[11px] font-normal leading-[14px]">Customize and export</p>
                            </div>
                            <button
                                onClick={handleCloseEditor}
                                className="text-[#454545] hover:text-[#0e0e0e] transition-all duration-200 p-2 rounded-full hover:bg-gray-100 hover:scale-105"
                                title="Close editor"
                            >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <line x1="18" y1="6" x2="6" y2="18"></line>
                                    <line x1="6" y1="6" x2="18" y2="18"></line>
                                </svg>
                            </button>
                        </div>
                    </div>
                    <div className="p-4 pb-8">
                        <IconsEditor selectedIcon={selectedIcon} onClose={handleCloseEditor} />
                    </div>
                </div>
            )}
        </div>
    );
}