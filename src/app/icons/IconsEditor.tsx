"use client";
import Svg from "@/commons/Svg";
import { useEffect, useState, useRef } from "react";
import { paymentAPI } from "@/commons/Api";

interface Icon {
    _id: string;
    name: string;
    cloudinaryUrl: {
        svg: string;
        webp: string;
    };
    isPremium: boolean;
    isPublic: boolean;
    category: string | {
        _id: string;
        name: string;
        cloudinaryFolder: string;
    };
    tags?: string[];
}

interface IconsEditorProps {
    selectedIcon: Icon;
}

// Secure SVG Canvas Component for Editor Preview
const SecureSVGCanvas = ({ svgUrl, iconName, size, color, onCanvasReady }: { 
    svgUrl: string; 
    iconName: string; 
    size: number; 
    color: string;
    onCanvasReady?: (canvas: HTMLCanvasElement) => void;
}) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d', { willReadFrequently: false });
        if (!ctx) return;

        // Load and draw SVG image on canvas with color transformation
        const img = new Image();
        img.crossOrigin = 'anonymous';

        img.onload = () => {
            // Clear canvas
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Calculate display size
            const canvasSize = Math.min(size, 190);
            
            // Draw image at center
            const x = (canvas.width - canvasSize) / 2;
            const y = (canvas.height - canvasSize) / 2;
            ctx.drawImage(img, x, y, canvasSize, canvasSize);

            // Apply color overlay if not black (default)
            if (color !== '#000000') {
                // Get image data
                const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                const data = imageData.data;

                // Parse the hex color
                const r = parseInt(color.slice(1, 3), 16);
                const g = parseInt(color.slice(3, 5), 16);
                const b = parseInt(color.slice(5, 7), 16);

                // Apply color to non-transparent pixels
                for (let i = 0; i < data.length; i += 4) {
                    if (data[i + 3] > 0) { // If pixel is not transparent
                        data[i] = r;     // Red
                        data[i + 1] = g; // Green
                        data[i + 2] = b; // Blue
                        // Keep alpha as is
                    }
                }

                ctx.putImageData(imageData, 0, 0);
            }
            
            // Notify parent that canvas is ready
            if (onCanvasReady && canvas) {
                onCanvasReady(canvas);
            }
        };

        img.onerror = () => {
            console.error('Failed to load SVG icon:', iconName);
        };

        img.src = svgUrl;
    }, [svgUrl, iconName, size, color, onCanvasReady]);

    return (
        <canvas
            ref={canvasRef}
            width={200}
            height={200}
            className="pointer-events-none select-none"
            onContextMenu={(e) => e.preventDefault()}
            style={{
                imageRendering: 'auto',
                width: '200px',
                height: '200px'
            }}
        />
    );
};

export default function IconsEditor({ selectedIcon }: IconsEditorProps) {
    // State for export settings
    const [fileType, setFileType] = useState<string>("SVG");
    const [color, setColor] = useState<string>("#000000");
    const [tempColor, setTempColor] = useState<string>("#000000");

    const [size, setSize] = useState<number>(32);
    const [canvasRef, setCanvasRef] = useState<HTMLCanvasElement | null>(null);
    const [message, setMessage] = useState<{ type: string; text: string } | null>(null);
    const [userIsPremium, setUserIsPremium] = useState<boolean>(false);
    const [loadingPremium, setLoadingPremium] = useState<boolean>(true);

    const fileTypes = ["SVG", "PNG", "JSX", "PDF"];

    // Predefined color palette (only 3 colors)
    const colorPalette = [
        "#000000", // Black
        "#FFFFFF", // White
        "#E84C88"  // Brand Pink
    ];

    // Fetch user premium status
    useEffect(() => {
        const fetchUserPremiumStatus = async () => {
            try {
                const token = localStorage.getItem("token");
                if (!token) {
                    setUserIsPremium(false);
                    setLoadingPremium(false);
                    return;
                }

                const response = await paymentAPI.getSubscriptionStatus();
                if (response.success && response.user) {
                    // Check if user has premium subscription (isPremium or active subscription)
                    const subscription = response.user.subscription;
                    const isPremium = response.user.isPremium || 
                                     (subscription && subscription.status === 'active') ||
                                     (subscription && subscription.type === 'lifetime');
                    setUserIsPremium(isPremium);
                } else {
                    setUserIsPremium(false);
                }
            } catch (error) {
                console.error('Error fetching premium status:', error);
                setUserIsPremium(false);
            } finally {
                setLoadingPremium(false);
            }
        };

        fetchUserPremiumStatus();
    }, []);

    // Debounce color updates to reduce lag
    useEffect(() => {
        const timer = setTimeout(() => {
            setColor(tempColor);
        }, 100); // 100ms debounce

        return () => clearTimeout(timer);
    }, [tempColor]);

    // Get modified SVG with color
    const getModifiedSVG = async (): Promise<string> => {
        try {
            const response = await fetch(selectedIcon.cloudinaryUrl.svg);
            let svgText = await response.text();
            
            // Parse and modify SVG
            const parser = new DOMParser();
            const svgDoc = parser.parseFromString(svgText, 'image/svg+xml');
            const svgElement = svgDoc.documentElement;
            
            // Set size and color
            svgElement.setAttribute('width', size.toString());
            svgElement.setAttribute('height', size.toString());
            svgElement.setAttribute('fill', color);
            
            // Update all path elements with color
            const paths = svgElement.querySelectorAll('path, circle, rect, polygon, polyline, line, ellipse');
            paths.forEach((el: Element) => {
                const currentFill = el.getAttribute('fill');
                if (currentFill !== 'none') {
                    el.setAttribute('fill', color);
                }
            });
            
            // Serialize back to string
            const serializer = new XMLSerializer();
            return serializer.serializeToString(svgElement);
        } catch (error) {
            console.error('Error modifying SVG:', error);
            return '';
        }
    };

    // Copy function based on file type
    const handleCopy = async () => {
        // Wait for premium status to load
        if (loadingPremium) {
            setMessage({ type: 'info', text: 'Loading...' });
            return;
        }

        // Check if icon is premium and user doesn't have premium access
        if (selectedIcon.isPremium && !userIsPremium) {
            setMessage({ type: 'error', text: 'Icon is premium' });
            setTimeout(() => setMessage(null), 4000);
            return;
        }

        if (fileType === 'JSX') {
            setMessage({ type: 'warning', text: 'JSX format coming soon!' });
            setTimeout(() => setMessage(null), 3000);
            return;
        }

        try {
            if (fileType === 'SVG') {
                const svgContent = await getModifiedSVG();
                await navigator.clipboard.writeText(svgContent);
                setMessage({ type: 'success', text: 'SVG copied to clipboard!' });
            } else if (fileType === 'PNG') {
                if (!canvasRef) {
                    setMessage({ type: 'error', text: 'Canvas not ready. Please wait...' });
                    return;
                }
                canvasRef.toBlob(async (blob) => {
                    if (blob) {
                        await navigator.clipboard.write([
                            new ClipboardItem({ 'image/png': blob })
                        ]);
                        setMessage({ type: 'success', text: 'PNG copied to clipboard!' });
                    }
                }, 'image/png');
            } else if (fileType === 'PDF') {
                setMessage({ type: 'warning', text: 'PDF copy not supported. Please download instead.' });
            }
            
            setTimeout(() => setMessage(null), 3000);
        } catch (error) {
            console.error('Copy failed:', error);
            setMessage({ type: 'error', text: 'Failed to copy. Please try again.' });
            setTimeout(() => setMessage(null), 3000);
        }
    };

    // Download function based on file type
    const handleDownload = async () => {
        // Wait for premium status to load
        if (loadingPremium) {
            setMessage({ type: 'info', text: 'Loading...' });
            return;
        }

        // Check if icon is premium and user doesn't have premium access
        if (selectedIcon.isPremium && !userIsPremium) {
            setMessage({ type: 'error', text: 'Icon is premium' });
            setTimeout(() => setMessage(null), 4000);
            return;
        }

        if (fileType === 'JSX') {
            setMessage({ type: 'warning', text: 'JSX format coming soon!' });
            setTimeout(() => setMessage(null), 3000);
            return;
        }

        try {
            const fileName = `${selectedIcon.name}_${size}px.${fileType.toLowerCase()}`;
            
            if (fileType === 'SVG') {
                const svgContent = await getModifiedSVG();
                const blob = new Blob([svgContent], { type: 'image/svg+xml' });
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = fileName;
                link.click();
                URL.revokeObjectURL(url);
                setMessage({ type: 'success', text: `${fileType} downloaded!` });
            } else if (fileType === 'PNG') {
                if (!canvasRef) {
                    setMessage({ type: 'error', text: 'Canvas not ready. Please wait...' });
                    return;
                }
                canvasRef.toBlob((blob) => {
                    if (blob) {
                        const url = URL.createObjectURL(blob);
                        const link = document.createElement('a');
                        link.href = url;
                        link.download = fileName;
                        link.click();
                        URL.revokeObjectURL(url);
                        setMessage({ type: 'success', text: `${fileType} downloaded!` });
                    }
                }, 'image/png');
            } else if (fileType === 'PDF') {
                // For PDF, we'll download the PNG as a workaround
                // Full PDF generation would require a library like jsPDF
                if (!canvasRef) {
                    setMessage({ type: 'error', text: 'Canvas not ready. Please wait...' });
                    return;
                }
                canvasRef.toBlob((blob) => {
                    if (blob) {
                        const url = URL.createObjectURL(blob);
                        const link = document.createElement('a');
                        link.href = url;
                        link.download = fileName.replace('.pdf', '.png');
                        link.click();
                        URL.revokeObjectURL(url);
                        setMessage({ type: 'success', text: 'PDF conversion coming soon. PNG downloaded instead.' });
                    }
                }, 'image/png');
            }
            
            setTimeout(() => setMessage(null), 3000);
        } catch (error) {
            console.error('Download failed:', error);
            setMessage({ type: 'error', text: 'Download failed. Please try again.' });
            setTimeout(() => setMessage(null), 3000);
        }
    };

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

    return (
        <div className="w-[100%] h-full flex flex-col gap-[16px] md:px-0 px-[16px] py-[16px] md:py-0 md:pb-[8px]">
            {/* Header and Icon Preview */}
            <div className="flex flex-col gap-[12px]">
                <div className="px-[8px] py-[8px] flex justify-between items-center">
                    <h1 className="text-[#0e0e0e] text-[16px] font-bold leading-[24px] capitalize">
                        {selectedIcon.name}
                    </h1>
                    <div className="flex gap-[4px] items-center">
                        <Svg icon="share" />
                        <p className="text-[#454545] text-[14px] font-normal leading-[20px]">
                            Share
                        </p>
                    </div>
                </div>

                <div
                    className="border border-[#ececec] rounded-[20px] h-[213px] 2xl:h-[250px] 3xl:h-[280px] flex justify-center items-center"
                    onContextMenu={(e) => e.preventDefault()}
                    onDragStart={(e) => e.preventDefault()}
                >
                    <SecureSVGCanvas
                        svgUrl={selectedIcon.cloudinaryUrl.svg}
                        iconName={selectedIcon.name}
                        size={size}
                        color={color}
                        onCanvasReady={setCanvasRef}
                    />
                </div>

                {message && (
                    <div className={`p-3 rounded-lg text-[14px] font-[500] text-center ${
                        message.type === "success" 
                            ? "bg-green-100 text-green-700" 
                            : message.type === "warning"
                            ? "bg-yellow-100 text-yellow-700"
                            : message.type === "info"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-red-100 text-red-700"
                    }`}>
                        {message.text}
                    </div>
                )}

                <div className="flex gap-[8px] items-center">
                    <button 
                        onClick={handleCopy}
                        className={`px-[12px] py-[8px] w-[50%] rounded-full text-[#ffffff] text-[12px] font-bold leading-[20px] h-[40px] 2xl:h-[48px] 3xl:h-[52px] transition-colors ${
                            (selectedIcon.isPremium && !userIsPremium) || loadingPremium
                                ? "bg-[#b7b7b7] cursor-not-allowed opacity-70"
                                : "bg-[#0e0e0e] hover:bg-[#2a2a2a]"
                        }`}
                    >
                        Copy
                    </button>
                    <button 
                        onClick={handleDownload}
                        className={`px-[12px] py-[8px] w-[50%] rounded-full text-[#0e0e0e] text-[12px] font-bold leading-[20px] h-[40px] 2xl:h-[48px] 3xl:h-[52px] transition-colors ${
                            (selectedIcon.isPremium && !userIsPremium) || loadingPremium
                                ? "bg-[#f0f0f0] cursor-not-allowed opacity-70"
                                : "bg-[#f6f6f6] hover:bg-[#e0e0e0]"
                        }`}
                    >
                        Download
                    </button>
                </div>
            </div>

            {/* Export Settings */}
            <div className="flex flex-col gap-[12px]">
                <div className="flex justify-between items-center py-[12px] px-[8px] border-t border-[#ececec]">
                    <h1 className="text-[#0e0e0e] text-[14px] font-bold leading-[20px]">
                        Export Settings
                    </h1>
                    <button
                        onClick={() => {
                            setFileType("SVG");
                            setColor("#000000");
                            setTempColor("#000000");
                            setSize(32);
                        }}
                        className="text-[#454545] text-[14px] font-normal leading-[20px] hover:text-[#0e0e0e] cursor-pointer"
                    >
                        Reset
                    </button>
                </div>

                <div className="py-[8px] flex flex-col gap-[8px] items-start">
                    <h1 className="text-[#0e0e0e] text-[12px] font-semibold leading-[20px]">
                        File type
                    </h1>
                    <div className="w-full px-[4px] py-[4px] bg-[#f6f6f6] rounded-full h-[40px] 2xl:h-[48px] 3xl:h-[52px] flex">
                        {fileTypes.map((type) => {
                            const isDisabled = type === 'JSX';
                            return (
                            <button
                                key={type}
                                    onClick={() => {
                                        if (isDisabled) {
                                            setMessage({ type: 'warning', text: 'JSX format coming soon!' });
                                            setTimeout(() => setMessage(null), 3000);
                                        } else {
                                            setFileType(type);
                                        }
                                    }}
                                    disabled={isDisabled}
                                    className={`w-[100%] px-[12px] py-[8px] rounded-full text-[12px] font-bold leading-[20px] flex items-center justify-center transition-all ${
                                        isDisabled
                                            ? "text-[#b7b7b7] opacity-50 cursor-not-allowed"
                                            : fileType === type
                                    ? "bg-[#0e0e0e] text-[#ffffff]"
                                            : "text-[#b7b7b7] hover:text-[#0e0e0e]"
                                    }`}
                                    title={isDisabled ? "Coming soon" : ""}
                            >
                                {type}
                            </button>
                            );
                        })}
                    </div>
                </div>

                <div className="py-[8px] flex flex-col gap-[8px] items-start">
                    <h1 className="text-[#0e0e0e] text-[12px] font-semibold leading-[20px]">
                        Color
                    </h1>

                    {/* Color Palette */}
                    <div className="w-full flex gap-[8px] flex-wrap">
                        {colorPalette.map((paletteColor) => (
                            <button
                                key={paletteColor}
                                onClick={() => {
                                    setColor(paletteColor);
                                    setTempColor(paletteColor);
                                }}
                                className={`w-[32px] h-[32px] rounded-full border-2 transition-all ${color === paletteColor
                                        ? "border-[#E84C88] scale-110"
                                        : "border-[#ececec] hover:border-[#b7b7b7]"
                                    }`}
                                style={{
                                    backgroundColor: paletteColor,
                                    boxShadow: paletteColor === "#FFFFFF" ? "inset 0 0 0 1px #ececec" : "none"
                                }}
                                title={paletteColor}
                            />
                        ))}

                        {/* Custom Color Picker */}
                        <div className="relative">
                            <input
                                type="color"
                                value={tempColor}
                                onChange={(e) => setTempColor(e.target.value)}
                                className="absolute opacity-0 w-[32px] h-[32px] cursor-pointer"
                                id="customColorPicker"
                            />
                            <svg
                                width={32}
                                height={32}
                                viewBox="0 0 48 48"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                                xmlnsXlink="http://www.w3.org/1999/xlink"
                            >
                                <mask
                                    id="mask0_670_84826"
                                    style={{ maskType: "alpha" }}
                                    maskUnits="userSpaceOnUse"
                                    x={0}
                                    y={0}
                                    width={48}
                                    height={48}
                                >
                                    <rect width={48} height={48} rx={24} fill="#E6E6E6" />
                                </mask>
                                <g mask="url(#mask0_670_84826)">
                                    <rect
                                        x={-6}
                                        y="-6.09677"
                                        width={60}
                                        height="60.9677"
                                        fill="url(#pattern0_670_84826)"
                                    />
                                </g>
                                <defs>
                                    <pattern
                                        id="pattern0_670_84826"
                                        patternContentUnits="objectBoundingBox"
                                        width={1}
                                        height={1}
                                    >
                                        <use
                                            xlinkHref="#image0_670_84826"
                                            transform="matrix(0.00203226 0 0 0.002 -0.00806452 0)"
                                        />
                                    </pattern>
                                    <image
                                        id="image0_670_84826"
                                        width={500}
                                        height={500}
                                        preserveAspectRatio="none"
                                        xlinkHref="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAfQAAAH0CAYAAADL1t+KAAAgAElEQVR4nO3dfZRcZ30n+O9z66279dYtt/VmLMkymJcBo8R4FzADAmxPNguDdxdykhlIxGDhnNmNMUPWnMzkxPYmE5LdGMMOGYw5iSEJhJ2J0wabBGSwBVi2sSQk5De1ZFlqdau6W9Vd3V1V3VV1677sH1W3+1bpVne9P8+99/s5p49EI3U/blXVt37P73kBiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiISAIhewBEtOL4uXfuNgzsBgBNE3thiUEAgMAuAXu3+8/awL5GvuaVfcBwouEhHKr6HkKch42x8hDseQH7BADAwPn+7c+db/irElHXMdCJeuT4uX2DhlHYK4QYFLbYC9ibhMBeoPFwbkWTgd4K503ACRtiAcI+odn2fCHad2Jo6NB8V78zES1joBN12PHT795ravZuYYu9TmXdzcBeSw8CfS2Hlit9YZ+wLXF+/ZZnTkgdEVEAMdCJWuRU3Bq0fRDYZQt7r7DLFbdKFAj0ek7YQpyAjTEN1iFW9ETtYaATNejImXfuK4e3/XYAewHsXuvvqEDhQL+cwHnYOGFD/FKDdaj/yucOrf2XiAhgoBN5On7unbtNU+wVNt5na9inYuXdKF8FurcTAA7ZAj/RSvYJLsYj8sZAJ0J5+twyC7cB2vsAex98Un03IgCBXk3gvA1xSLOsnxRifY9ymp6ojIFOoXX01XfdFoQKfC2BC/TLLVfw64affVT2YIhkYaBTaBw/987dliVug433AbhN9nh6JQSBXutRAD8Rhv0op+cpTBjoFGjHT797ryXs3wl6Fb6aEAa62wkAhyxbfJNb5SjoGOgUOE6IQ+A2BKgX3qqQB/qK8gr6RxnuFFQMdAoEhnh9DHQPDHcKIAY6+dbxc+/cbRniMwzx1THQ11AJd2HYX2bPnfyMgU6+4mwvs4X4TFh74s1ioDflhLDtL3M7HPkRA5184ciZd+7ThPY7gL1f9lj8hoHeGluIb2i29U2eVkd+wUAnZR0/t2/Qsor7YeMz4JR6yxjobSpPyX+5GE18g1U7qYyBTsphNd5ZDPTOYdVOKmOgkzKOvfrO/eyNdx4DvStOCNv+cv+W574heyBEDgY6SXX83L5By9DvgrA/A2BQ9niCiIHeVfM2xJf1aPxLnI4n2RjoJMXxc+/cbZnaPYB9GxjkXcVA74l5W4hHtZJ1H7e+kSwMdOopV5CzP94jDPTesoX4BoOdZGCgU08cOfPOfREh7rGBfbLHEjYMdGkOCdj3cQEd9QoDnbqKQS4fA106Bjv1BAOduoJBrg4GujIY7NRVDHTqqHKPXDyAEN03rjoGunIeFYb9WfbYqdMY6NQRXOymLga6mrh4jjqNgU5tce0jv0f2WMgbA11tNsR93MdOncBAp5YdO/uuu2DjHnAfudIY6L4wD+C+gSuf/ZLsgZB/MdCpaff+8837PvyGxYfBC1N8gYHuIwLnRTb/yf5rTnDhHDWNgU4N+92RX9tt2ObDsLHvA1cX8cbNJdlDogYw0H3EtKC9dB4wrUO2Gflk//80xf46NYyBTmvaP7JvMGrF7wJW+uQb4jY+dt0SEhFb5tCoAQx0/xBTaYjJ9PL/tm1xX19c/5J4/zz767QmTfYASG2f+odbb4tYsePuMAeArC7wwkxM1rCIgkc3qsIcAISw7ymWYseLP9zCbaC0Jlbo5Ol3R35tt2kZD9gQdV9IEhEbH7sujw1xq5dDoyaxQvcH8dokxMLiKn/AftQ2op/lNDzVwwqdLnP7IzffZVjm8dXCHACKpsDhZLxXwyIKLJHLrx7mAGCL20TEPF54Yviu3oyK/IYVOi07MHLLXtvGA7CbO671I9fmsWO92a1hUZtYoatPe2kM0JtaZHpIAz4bvzV1oltjIv9hhU4AgNsfufVe28LxZsMcAA4nmRZErRKp+WbDHAD2WcDx/A+33NuNMZE/sUIPuQMjt+y1TTwMgb3tfB1uY1MXK3SFrWxTa+ernNCAT7JaJ1boIXb7IzffZVs43m6YA8DhZBxFk+8PiZohJtPthjkA7LUA9taJFXoYuQ+I6eTXvf7KEm7aUezkl6QOYIWuqHwR2qnxTn9VHkgTYqzQQ+bAI7fsNyyzpV75Wk6mYsjqfEgRNUKbmOnGl90nIubx/MEreethCLFCD4n9I/sGY1b04bW2orVrx3oTH7k2381vQU1iha4esbAI8dpkl7+J/WgianySp8yFB8upEDgwcsveiBVbc195JyRzESRzkW5/GyJfE92pzqvZ4rZiKXZcP3hl22tkyB8Y6AHnLHwTPbwZ7cnxvl59KyLfEVPpVraptWo3F8yFB6fcA6pXU+z13LhNxzu26jK+NdXglLtCdAPaqQudWNnePE7BBx4r9ADq5RR7PSdTMW5jI6rRoW1qreEUfOAx0APmwCO37O/1FLuX8jnvLAuJHCKXh0hnZA9jtwVwFXxAMdAD5FOP3PKwDTwsexyO0XQUM3k+xIgAXHY1qkwCeLh48EplXiuoMzgnGgD7R/YNRs3YU5048a3TuI1NPvbQ5RPpLMTYtOxheDmRiJXez756MLB88rkDI7fsjVqxcyqGOVDexjaajskeBpE8pgUxkZI9inr2Fkuxc+yrBwMD3cecfjmAQdljWc2RaZ7zTuElUvPyFsI1ZpB99WBgoPvU7Y/c+oBK/fLVZHWBF2ZYpVMI6YZSvfPVCODhwg+vfED2OKh1LJt8Zv/IvsGIFXtAAL56N52I2PjYdXlsiCtdqQQSe+jyiNcmIRYWZQ+jKQL4RjxW+iz76v7DCt1HnMVvfgtzwNnGFpc9DKKeEbm878IcAGxgf7EUe8p+alDpVh5djoHuE85hMaoufmvEuYUoz3mn0BBjl2QPoR17eQiN/zDQfeDAyC17bQtPyT4sphN42AyFgUjN9/K89m7ZbQFPMdT9g4GuuE/9w6232RaeguIr2Rs1k9e4jY2CzbR8sxCuAYMW8FTxh1ukHSNNjWOgK+zAI7fsF8IeQUDC3HE4yW1sFFxSz2vvjkFb2CPc1qY+BrqiDjxyy36/bEtrVtEUODrNBXIUQPliebo9gATwMENdbQx0Bflpj3mrTqZiyOp8+FGwaBMzsofQVdyrrja+oirmU4/c8jBg3yV7HL3w5DgXyFFwiIVFIBeCewsE7uLFLmpioCvkU4/c8rAf95i3KpmLcBsbBYYIeHXuZgP7GerqYaArImxh7nhyvE/2EIjaJqbSQdim1hSGunoY6AoIa5gD5XPeuUCOfE03IC4FcyHcWhjqamGgSxbmMHecTMW4jY18K4Db1JrCUFcHA10ihnlZ+Zx3LpAj/xG5PEQ6I3sY0jHU1cBAl4RhXm00HcVMng9H8pcAnQjXNoa6fHwFlYBh7o1VOvmJSGfDsU2tCQx1uRjoPcYwry+Zi+DcQlT2MIjWFqzz2juKoS4PA72HDjxyy36G+eoOJxNcIEfKC8htal1jA/t5TGzvMdB7JMhns3dSVhd4YYa3sZHCdIPVeQN49nvvMdB7gGHeHJ7zTioTEynZQ/ANhnpv8VWzyw6M3LLXBniZQROKpsARHjZDChK5fPnMdmqYAB7QD165V/Y4woCB3kUHRm7Za1t4CgG7z7wXRtNRnvNOygnTee0dNGgBTzHUu4+B3iX7R/YNWhZGwDBvGbexkUpEah7IF2UPw68GLWDEfmqQr4ddxEDvgv0j+wajZuwpAeyWPRY/m8lrGE1zgRwpgNvUOmF3sRR7iqHePQz0LohZ0YchwOmlDjicjHMbG0kX9vPaO2hv0YhygXCXMNA77PZHbn3AhrhN9jiComhyGxtJphvl6XbqDFvcVvjhlVwo3AUM9A468Mgt+wH7LtnjCJojU3FuYyNptLFp2UMIHoG7uJ2t8/gq2SGV7WmcSuqSJ8e5QI56Tyws8rz2LhHAw1z53lkM9A743ZFf213ZnkZdksxFuI2Neo7b1LrLAp7K//M2Lh7uEAZ6m/aP7Bs0TJPb03rgyfE+2UOgEBFTaZ7X3n2DImJyO1uHMNDbFLFiD3BFe29kdYGTKS6Qox4wLYhLXAjXI3v1UoyL5DqAgd6G2x+5+S7entZbR6e5jY26T0zMcJtaD9nA/sITw1xQ3CYGeosOjNyyFxB8V9ljRVPwBDnqKpHLQ6QzsocRPrbgme9tYqC3YP/IvkEugpNnNB3FTJ4PXeoOnggnjwXwJLk28FWxBVE7xkVwkrFKp24Q6Sy3qck1WCzFRmQPwq8Y6E26/ZFb74WNfbLHEXbJXATnFqKyh0FBwvPaVbEv/8Mt98oehB8x0Jtw+3+/eR9g3yN7HFR2OJngAjnqGJGa5zY1RQhh35N/YpiFU5MY6A3aP7JvEJrgVJBCsjrPeacO0Q1W54oRtuD+9CYx0BsUs6IPg31z5ZxMxXjOO7VNTKRkD4EuN8ib2ZrDV8IG3P7IzXfxBjU1FU2BI9Nx2cMgHxO5fPnMdlKPLW7j/vTGMdDXUNlvzr65wkbTUZ7zTi3jee2Ks8U93J/eGAb6GmwTnGr3AW5jo1aI1DyQL8oeBq1u0OJNlg1hoK/i9kduvZfntPvDTF7DaJoL5KgJ3KbmJ3u5lW1tDPQ6ylPt3KLmJ4eTPOedGicm0zyv3UeEsDn1vgYGuof9I/sGLQvcouYzRZPb2KhBulGebidfsYCHuZWtPga6h6gVv0cAu2WPg5p3ZCrObWy0Jm1sWvYQqDV7i3qMM6d18JWvRmWqndskfOzJcS6Qo/rEwiLPa/czgbs49e6NgV6jsqqdfCyZi3AbG9XFbWr+x1Xv3hjoLlzVHhxPjvfJHgIpSEyleV57MHDVuwcGesXt/+3Wa7iqPTiyusDJFBfIkYtpQVziQrigEMK+Z/57W6+RPQ6VMNAdUfuvZQ+BOuvoNLex0QoxMcNtagHT12fxdduFgQ7g9v9+8yd5x3nwFE3BE+QIQOW89nRG9jCo8/blfnDlJ2UPQhWhD/TKtahflD0O6o7RdBQz+dA/zEOPJ8IFV1TDF7k3vSz0r3RRK34PeFZ7oLFKDzeRznKbWrANcm96WagD/VP/cPOvcM958CVzEZxbiMoeBsnA89rDQeCuxX+68ldkD0O2UAe6EOIB2WOg3jicTHCBXAiJ1Dy3qYWEFkHoX89DG+g3/vWfflK3+t4nexzUG1md57yHjm6wOg8RYYv35b6zI9QL5MJZsnzhZ0OJgf5frI/O7b5+449x7cAx2SOiHkhEbHzsujw2xMO1denKPmA4hMsIxGuT5WNeKfhyEWAuChjifMEUvzr47y/MyR6SDKGs0PsG+j4DYHfOGMIz6Y/iYOoApot7ZA+LuqxoChyZjsseBvWAyOUZ5mFQ0IDJOJCKAYYAgN2JCD4je1iyhK5C7/t/fn6NHY/8Ah4r269ddwzXb/wx1kdC+eYuND5ybR471puyh9EzYazQtVPjQL4oexjULYYoV+TedzbMF3TtVwd/b+xcr4clW+gqdCsq6m5TO7t4A74/fSdOZm6GbvEs8KDiNrZgE6l5hnlQWQKYjwIXE/XCHAAGY1ErlNvYQlWhV6rz1xr5s+ujc3jHpsdxdf/L3R4WSfCBq4t44+ZwrH4OVYVuWtBeOs8jXoNoKQLMRp2p9TUVdG1P2Kr0UFXodlRr+Mq9nDGEQ7OfwMHUAcyVtndzWCTB4STPeQ8iMZlmmAeNXumTT8caDnMASESt0F2xGppXtL77n3u/HY0+2erfv3bdMbxj0+OIa4VODoskunGbjnds1WUPo+tCU6HrRrk6p2CwRLkirz+1vqaSYX1gw/9+8akOjkppYanQha1F2uqpnF28ASNTn8fJzM2dGhNJdmQqjqwelqdA8Glj07KHQJ0yHwXGV+2TNySqafcgRIVrKP5D263Oa62PzuHdQ/+ArYmG2vGksGs2Gfi13cGedQlDhS4WFiFem5Q9DGpXQXNvQeuIMFXpYShP2q7Oa+WMIRxMHcDB1AHkzKFOfmnqsXMLUSTbrAJIPjExI3sI1A5DlPvkk/GOhjkQrio98P+Rna7Ovbx5/WFcv/FH7K/71Ia4jY+/ObiHkAS9QhdTaR7x6ldWZT95prtvqsNSpQe9Qu94de7lldxNGJn6PF7J3dTtb0VdkNUFTqZ4zrsvmRbEpXnZo6BWZCp98i6HORCeKj3Q/4G9qM5rsb/uT4mIjX/75iUkIrbsoXRckCt0MXYJIp2RPQxqRhf65I0IQ5Ue5Aq9J9V5Lae/fmj2E+yv+0jRFDjKc979JV9kmPuJIYDp7vTJGxGGKj2w/3EyqnMvb9/4Y7xp/dPsr/vEx65bwnB/sA4mCWqFrp25COTysodBa7FEeVp9Lip7JIGv0oNaoUupzr38MvNBjEx9HmeXbpA9FGoAz3n3B5HOMsz9IBcp98kVCHMg+FV6IP/DVKnOaw3FJnHj4OPsryvu13YXcM0mQ/YwOiZwFbpplW9T08NxFr8vFTRgNgbo6kVMkKv0IFbowtK035E9CC9zpe3sr/sAq3S1idQ8w1xV7j65gmEOAFo5H9QcXJsC9x/V94Wf7bEH+s/KHsda4loBb15/mP11RQXpnPdAVei6Ae3UBV7AohqnT74QBXzwT7OwJK7d+tkLgZsqDVqFLqy+xB/JHkQjdKsPv8x8EN+/dCf76wo6mYrxnHcFiYkUw1w1uQhwMV7uk/vkn2Z9n/1HCGBBG6z/oHt/sDkxNHwWwKDsoTRra+I1vH3jj9lfV8gbNxv4wNX+nz0JSoUucnmIMxdlD4McBa0c4gVfvvGdTy3a1179HyYCdcSgL/8l6hCJTUP74cMwB4Dp4h4cTB3AM3MfZX9dEaNpnvOuEp7XrghDlA+GmYz7NcwBYHBoQOxHwIpa3/5reBCAdqfsQbTr7OIN+P70nbymVRFHeNiMEkQ6C+SLsodB81HgYvvXmqogIuw7wUBXkog/8Oxt0MQu2QPpBKe/PjJ1N8bzb5E9nFBL5iIYTfOcd6lMq9w7J3mWXPvJfdInX4uA2JX9y9fdhgCFelACHQJR31fntXLGEA7NfgIHUwcwV9ouezihdTgZR9EMzHPed8RkmgvhZNG18tT6dO/PXu+FqCYClRuB+BdK/PGPr8XGTa/KHke3XbvuGN6x6XFuc5PAz9vYfL0oTjegvXRe9ijCxxLAbDQQU+trubSA1++8e1z5rc6NCEKFLrBuXaDeZdVzdvEGXtMqyZGpOLexSaCNTcseQvg415qGIMwBYPOG4PTSg/AKJRCJ/rbsQfSKbvXh6PyHMDJ1N6aLe2QPJ1QOJ7lArpdELs/z2nupoJWDfDY4ffJGRDXx22CgK0H0PfCcb7eqtcO5pvVg6gC3ufXIuQVuY+slMXZJ9hDCwRDlPrmka00VMJj56tWB2MLm+0C3oea57b0yXdyDkcm7cXT+Q9CtPtnDCbwnx/kz7gUxleZ57d1mifIFKuMJP+8n7wgNCMT57r7+DwjLYrhGxbUCrt/4I7x5/WHZQwm0m3YUcf2V/gkb3y2KM63yQjiubO+eTDRQW9A6IQiL4/z8tkyI9etCXZ3Xcvrrj0/fyf56Fx2d5ja2bhITMwzzbilo5YNhQtYnb8TQBv9X6b4OdBuR0CyGawavae2uoilwlCfIdUe+CJHOyB5F8PjgWlPZoprt+8Vxfg100Xf/T98flJPhumU8/xaMTN6Nk5mb2V/vsJOpGGbyfn36qEvjee2dZYnyca3jCWCJj9fVCIhdM1++6v3wcaj79V9YWFo/q/MGlY+R/Tyvae2ww0k/NabVJ9JZblPrpJzruFZqSH9M83WV7ttAFwIfkT0IP9GtPjyT/ij76x2UzEVwboEvlh1hWuUjXql9Tp88FWOfvEmaho+Agd5TIn7/4dsgxCbZA/Ejp7/Oa1o7g1V6Z4jUPLeptct9rSn75C0RApvm/4t/L2zxZaBDRFidt8l9TSv7663L6lwg1zbdgLg0L3sU/uX0yQNyralsWsS/VbrfAl0AEEKL/GvZAwkC55rW71+6k/31NpxMxXjOexvERIrb1FqViwAX49xT3kExTfxrVLJG9lia5btXIU63d17OGMIz6Y/iYOoA++stKJoCR1ilt0Tk8hALi7KH4T/OtaapYF5rKpNr2t13/BbonG7vouninuX+OqfhmzOa5jnvrRDcptYcq9InvxgP/XGt3eTXaXc/PSIEAI3T7d3nXNN6MnOz7KH4Cqv05oh0FsgXZQ/DP+bDda2pTJVpdw0+C3U/BTri9x/+CKfbe8Ppr49M3Y3x/FtkD8cXkrkIRtMx2cPwB9Mq985pbUuu/eTsk/dEZdrdd7PBfgp0TrdLkDOGcGj2EziYOoC50nbZw1He4STPeW+EmExzIdxanD75NPvkMvhx2t0vgV6ebheR98oeSFhNF/fg8ek7eU3rGoqmwAszrNJXpRvlfefkzbnWlH1yqWIRvBc+m3b3zaMl9icH9/Lsdvleyd2EkanP45XcTbKHoqwjU3FuY1uFNjYtewjqylT65Bn2yWUTELuSX7x6r+xxNMMvrzoikljny20EQeRc0zoydTe3udVxOMkFcl5ELs/z2r0UtHKQ81pTpQwkLF+dGueHQBcANDsW/7DsgVC1nDGEg6kDOJg6wGNka5xb4DY2L2LskuwhqMUQ5T75ZJx9cgXFo9qH4aNpdz8EOvB7fz0EIa6XPQzyNl3cg5HJu9lfr/HkOH8WbmIqzfPaHU6ffDzBPrnCNOD6n/7BNt9UK354JIm+XddxdbsPOP11HiNbltUFTqa4QA5AeZsaz2svc641ZZ/cF/7FVVHfrHb3RaBbWpSr232C17RWOzrNbWxA5US4sG9T47WmvhTT8F4w0Duicjqc9j7ZA6HmONe0Hpr9RKj760WTt7EhX4RIZ2SPQh5DANNxXmvqU1FNvA8+6aMrH+ixe3/wKxDaTtkDodaM59+Ckcm7Q31N68lUDDN51Z9q3aOF9bx251rT8QSwFN5/f7/TBHa+9uev+xUw0NsmtHUDrM4DoHyMbHj764eTCdlDkEKks+HcppZzHddKvjfYj/eBgd6W8n200cS/lD0Q6gynvx7Ga1qTuQjOLYTsxd20yke8hknBda0p++SBEY+Kfwkf3JGucqADgAahcUFcwLivaQ1Tfz1sVbpIzYdnm5pRudZ0kse1BlFEWz4GVmkqD1DE7v3BXt6uFlxnF2/A96fvDE1/PauHaIGcboRjm5rTJ7/Ia02DTAhseu3PX7cXrNBbxv55CDjXtH7/0p2huKb1ZCoWim1sYiIV/G1qS5HyBSq81jQU/NBHVzXQy8e9RmI8HS4kwnJNa9EUgZ96F7k8xMKi7GF0D681DaVoBNdD8e1rKge6EBqvSw0b55rWZ+Y+Gthp+NF0sM95F0HdpmZV+uS81jSUohHhHDDDQG/a7V8a4v7z8Dq7eANGpj6Pk5mbZQ+lK44EtJcu0lkgX5Q9jM5z9pMH+I0YrU4T2Pndz2xRehWvqoEu4rvfuk/2IEgup78+MnV34PrryVwEo+mAnfNuWuXeeZAsufaTs08eeu/YGd0HVuhNEQA0LRF/u+yBkBrc/fUgbXM7ErBz3kVqPjgL4ZxrTdknJ5f+eOTtULiPrmKgA4Cwo3EeKENVgnZNa1YXeGEmIFW6bgTjEBlea0qriEUs54AZJan4iC0vOhCRt8keCKnJuab1ldxNsofStiNTcWR1FZ+GzdHGpmUPoX2ZKK81pVVFNe1tUHhhnIqvJCL+uW9fwwNlaDW61Yej8x/CyNTdvj9G9nDS3wvkRC7v7/PaC1o5yGfZJ6fVCYFNz/zBjmvAQG9I+Z3P5iv2yh4I+UPOGMLB1AFf99fPLfh7G5sYuyR7CK1x+uSTcfbJqWGv2wznxDjlHjSqBToACC3ezwNlqClOf92vx8j69bAZX57X7r7WlH1yatL6vsj1UDDMAfUCvXxCHBfEUYv8ek3rTF7DyZTPFsj58TY1XmtKbaosjFNypbtqgQ4AggfKUDuca1ofn77TV/31oz7bxiYmZvyzTa2glS9Q4bWm1KaIpu2EgmEOqBfolRXuDHRq31xpOw6mDuDQ7Cd80V8vmj66jS1fhEhnZI9ibYYApit9cl3J12DyGU3ACXTlHlAqBboAIBL3fp83rFFHjeff4pv++slUzBfb2DTVz2t398mX1P95kr+8+oXtzs1rSoW6ao90YSX6dsseBAWTc02r6v31J8fVXiAnFhbV3qaWc11rStQFfQltNxQLc0CtQBcARCQS3yV7IBRcOWMIz6Q/ioOpA8r215O5CM4tKBpGpqXubWqFyrWmKR7XSt0Vj4hdYIW+Js2Oxd4jexAUfNPFPTiYOoBn5j6qZH9d1W1sSm5TMyrXmk7yWlPqjf6Y/R6ol59KDajybkfjCXHUM2cXb8D3p+9U7prWrK7gAjndgLg0L3sU1eaj5dXrPj6Yh/xHCG0TWKGvqvzDKZ+VS9Qzql7TejIVU2obm5hMq7NNjdeakkRRDUqe6a5KoAsAIv57f80FcSSN+5rWudJ22cNB0RTKTL2LXF6NbWq6xmtNSQk/+tw2Z2GcMg9EVQIdAIS4YjMDnaSbLu7B49N34pm5j0rf5jaaVuOcd+kL4axKn/wi++Skhh1XQLmV7qo8MwQAYfdt4BnupIyzizdgZOrz0vvrRyT30kU6C+SL8gbg7CdX4I0NkWNzX9Q5012ZUFcl0AFAaEIblD0IIjd3f13WNrdkLoLRtKRz3k0LYiIl53s715qyT04KEpo1CIXCHFAn0MsVutbHBXGkJNnXtB6RdM67SM33fiEcrzUlH4iunOmuzINUlUAHAAHN5pY1UppzTevR+Q/1tL+e1QVemG4uFGcAACAASURBVOlxla4bvb1NzRLAbIzXmpIvRKNCuUtaVHjWiOUPLcpLWcgXXsndhJGpz+OV3E09+55HpuI9PeddG5vu2fdCptInz7BPTv4Qrb6kRYlgVyHQgZU96FfLHghRo3SrD0fnP9TT/vrhZG8WyIlcvjfntTt98ln2yclfIhquhkJhDqgW6EQ+5PTXe3FN67mF3mxjE2OXuvsN3Neask9O/qVUdqkQ6OVrU//jI++VPRCidvTqmtZuHzbT1fPaea0pBcjLf7rtX1Z+q0Soq/OMsi0lfiBE7Spvc/t8165pnclrOJnq0gI50+reQric67hWogDQdVuDImEOqBPowo7GuQedAkO3+vBM+qN4fPrOrvTXj3ZpG5uYmOn8NrWCVr5AJRVjn5wCpS+mKbUXXYVAFwCEWLeBe9ApcOZK27vSXy+aXbiNLV/s7Hnt7j65rsxrHlHHbBqIKHVJiypzX0r8MIi6ZTz/FkwX9+DN6w/jTeufRlwrtP01T6ZiuH64hA3xzpS9WqfOa7dEefvZAleuUygok1+qVOiArc4PhagbnGNkv3/pzo71158c78wCObGw2JltarlI+QIVHtdKIWCt5JYS+SU70Fd+GPG+d0sdCVGP5IwhPJP+KA6mDrTdX0/mIji30OZEm2m1f5taoXKtaYrXmlJ4rO8T7wbUCXXZgQ4457izQqeQmS7uwcHUgbavaW13G1tb29Sca00nea0phY9l2TwpzoMSPwwiGdq9pjWrt7FATjcgLs239nd5rSkRoFB+qRDoyry7IZLFfU3reP4tTf/9k6lYS9vYxGS6+W1qSxFea0q0QpkMkx3oyz8EEYnyHHcKvZwxhEOzn8DB1AHMlbY3/PeKpmh66l3k8s1tU9MrffJp9smJACAeEe7ckv6kkB3oAC9mIbrMdHEPHp++s6n++mi6uXPeG14I5/TJL7JPTuSm2gUtqjw7lfhhEKnG6a83ek3rkQZ76SKdBfLFtf9ghn1yojUok18qBLoyPwwiFTVzTWsyF8Foeo1z3k0LYiK1+p/htaZEzVAix1QIdECRHwaRypxrWg+mDqx6jOyRNc55F6n5+gvhDFHuk/NaU6JGKfNEkR3oyvwgiPxiurgHI5N34+j8hzz761ld4IWZOlW6bnjfpmYJYDZWrsrZJydqhfQ8U+GZq8yCAiI/eSV3U93++pGpOLL65U9vbWz68i/k9Mkz7JMTtUCZDFMh0ImoRU5/3eua1sPJ6gVyIpevPq/dudaUfXKiQFAl0JV4d0PkV17XtJ5bqN7GJsYulX/Da02JOkmZJ5EK16cq88Mg8rvx/Fswnn8L3r7xx3jT+qdxOGnh7cNL5YVwBaM8vT6nwtOeKFCUyDE+s4kC6JeZD+KV3E14x+Dj+EDqZ3jm8Qw+OJjAhhaPfCci9SkT6P/jkbOyh0AUKMK0oCWvwaniHD5+5SREH9CBG8+JSFHKBDoRdU50OofozCIGbAuL2I6FC/3YOFSANmTzWU8UUKosiiOiDohkCkicuoTodBYwLeyKlp/io7ktsLOAOSFgzwmuaicKIL5XJwoALV9CdDIDLacvf24oIrCh8pY9rQ/gUnEDtiSysOYAZAW0IRtig5zxElHnMdCJfEyYFqLTOURmFi/7/3ZGqxfejua2YEsiW/4fBmClBEQOEFfYEFwsR+R7nHIn8qnozCISp1KeYX5VVCBRs5Emb8ZwdnG46nN2HrAmBKwUp+GJ/I4VOpHPaIs6YuPzELrp+f8nBLAt6r0tdmxpM3b0LaA/Uqr6vJ0FzEUBbRMghuyOj5mIuo8VOpFPCN1E/LVZxM/O1g1zoFyd1zuV3bC1y6r0ZRZgzQHmBQH78qKfiBTHCp1Icav1yWtt1ASGI6sfWpUsbMJV/QsYii15/wEDsKYFRD/760R+wgqdSGGRuXzdPrmXq+pMtdeqW6W7LPfXZ9lfJ/IDZQLdts0J2WMgUoW2qCNxZgax8XnAbCxNh13b1NaS1geQLGxq6M/aC5Vp+IXGvjZRWBi2rVRuqRPoZkmpHwyRDEI3ET8/V+6T50tr/4WKiAB2xZq7H+JUdisMu8E70C3AmhXlYC809W2IAku3oFRuKRPoRGHm9MkTpy5ByzSfmNsi9RfC1WPYGsaWhpr8S4CVFLAmBWA0+Q2JqKsY6ESSOX3y6HS2pb+fEI33zmudXRxG3ow1/ffsfHkanv11InWoEOjc9EqhpC3qiL8221Sf3MvOJqfaa43mtrb8d5f76629FyEKCiVyTIVABwC7pOefkz0Iol4QuonY+DziZ2erzl5vxUZNYEhrL9AvFddjrjTQ+hewysfIWhPsr1O4LJTM56BImAPqBDpR4C33yc/MIDLXmZvJr2mzOne8mNne9tew9Up/fZr9dSIZVAh0Gwq9wyHqhkimgPiZmeVrTTthm8d57a3KmzGMLW3uyNeyFyvT8LymlcJBmQyTHejLPwSjMPeSzIEQdYOWL5X75OfnVj2utVmRNhbC1XN2cbjxbWwNWD5Glv11CqjpguXOLemhLjvQHbZZyvPYCgoMYVrlPvmZmbb75F5WO6+9Vaue894qp78+yf46Bc+ibi9AgSB3qHCWuw0AltCU+aEQtSM6nUN0ZrFjU+u1BrTyvvNuGFsawo6+BWyIdjZ97Txg5wXEBkAbstV45SFqkyaWw1yJ/FKmQj958N5nZQ+CqB2RTAGJU5c62if3siva3aftaG5L1762nQXMCfbXKRh+/dDFZ6FImANqvE+2odCiAqJmCd1EbGK+K1PrtYaaOK+9VWl9AJeKG7Al0aXmd+WaVmQFtCtsiHXd+TZEPaBUfsmu0O2q35vmRWkjIWqSMC3Ekpnyca09CHMA2NnhhXD1dLNKX1a5ptWaFLB78+Mj6hjdwkXUZphksgMdcL3DMW1DqYPuieqJziw2da1pJ1zVwW1qa8mbsc4vkKtj+ZrWFKfhyT8qN60pVaGrMOUOlH8Ylm2ZGdkDIVqNtqgjNj7f0S1ojUiI8r7zXhpb2owdfQvojzR+61s77CxgLgpomwAxpMTrI1FdBdOaQPktqDIPVrUq9NLSK7IHQ+RF6Cbir82WrzXtcZgD3dmmtpaubGNbi+Xav967yQ+ipi2ZtjPlrkyFLjvQ3Uv+bcs0uBedlFJ1rWmP+uS1NmoCw13apraWZGFTe+e8t8rVX+cxsqSikrm8B12ZrWuyAx1w/TD0xVmeFkfKaPda007p9Ilwzep5le7Ca1pJVRcWzZegUJgDagQ6UHmXk8u8Ni57IETaoo7EmZm2rzXthOEebFNbS1ofQLKwSeoYlq9p5RweKeLFTGEcCk23A2oE+nIP4uyRv2OgkzRCNxE/P1fuk+d7sxBsNREB7OrQbWrtOpXd2tFz3ltiAdasKAc7j5Elyf7wRNod6EqEugqBDqz8QCzLLHFhHPVUVZ88o05SbIv0fiFcPYatYWxpSPYwyozKNa3sr5MkRdN+BSsr3JUIc0CdQAcqPxjbtrh1jXomMpdfudZUIYku3KbWrrOLw8ibMdnDWOb013mMLPWaCWRQKULBQK+yXJ0DsEqFzPOSx0MhoC3q5WtNJewpb8RORabaa43mtsoewmV4TSv12mzRfB7VYa5EqKt0sIwNwDb0PPvo1DVCNxGdziIyl5c9lLo2agJDmpqBfqm4HnOlAQzFlmQPpVrlmlaxAIhhG6JP9oAoyDIlaxyccq9ruUovFmZ5/Ct1RXQ6h8SZGaXDHACuUbQ6d7yY2S57CHXZeqW/Ps3+OnXP1FJJuWNfATUC3f1DsV568s+ekTweCpheXWvaCdt6eF57q/JmDGNLm2UPY1X2Iq9ppe756NPTz6C6Qlci1FUIdMfKD4a3rlEHaPlSuU9+fk7JPnmtiIIL4eo5uzgsfxvbWpxjZCfYX6fOcd2ypkyQO1QJ9KqFcZatM9CpZcK0EBufR/zMjLTjWlsh47z2Vkk5571VRrm/bk1y/zq1T7esi6hkFRQLdVUCHXCFul7I/Vz2YMifyvvJU8r3yWsNaOV9534ytjSErOGf1Wd2vtJfT7G/Tq2b062fQ8EwB9QJ9Oqta/n0y5LHQz6jLeq+6ZN72RVV5anYnNHcFtlDaJqddfXXiZqUzJsvgxX6mpZDff7Siwx0aojsa007YUiB89pbldYHcKm4QfYwmsdrWqlFP0stOoGuVJgD6gR6VYV+7vh/u2DbJpexUF3CtBBLZqRea9opO32yEK4eP1bpy1zXtNr+fhhRD5g2sv/5hfkLYIW+pqpQt02dZ7qTp+jMYrlPPuP/0uoqH2xTW0vejPlngVwddh6wJir9df91bKhH8qblnOGuXJgDCge6XsjyCFiqstwnT2Z82SevlRDlfedBMLa0Walz3ltlZ13nwxPVmNWXj3xloDfA+UFZhSUujKOyqmtNfdon9+KnbWpr8dU2trW4++vc5kYuybzlXhCnXFWhUqC7N+qbk6M/eE7yeEgyVa817YSNmsCwz7aprSVZ2IS50oDsYXQOr2mlGg+emnsOgAkeLNOQ5Sn31Niz8zwxLrwic3kkTqWUu9a0U/xyIlyzAlOluzjXtFqz7K+HmW7h4veSS/OonnJXikqBXtVDB2CVSjn20UNGW9SRODOD2Ph8IPrkXoZ9vE1tLWl9AMnCJtnD6Ap7oTINvyB7JCTDQqmqf84eegPcoW7qhewpyeOhHqnqk+dLsofTNREB7FL8NrV2ncpuVf+c91ZZgDUr2F8PoXTBOoXydLuSYQ6oF+iAq0rPzbzKPnrALffJz8wErk/uZVskOAvh6jFsDWNLQ7KH0V1Of53XtIbGkXT+OSg83Q6oF+juKXdz9LmvvsQDZoIrMpdH/MyMb49rbVbCR7eptevs4nAgtrGtxV50bXML/kM4tEwb2d87OvMSVip0JUNdtUAHXFPuAExTz7OPHjDaol6+1nR8PlDb0NayM+BT7bVGc1tlD6Fnlre5sfwIpEzJfh6VTIKiYQ6oF+iXLYwr5ucZ6AGxfK3p2VnfH9farI2awJAWrkC/VFwfrG1sa7Eq17ROsL8eNJfyhvIL4gD1Ah2omXbPpU7zKtUA8Ou1pp1yTciqc8epbHiqdIet85rWoPl5Wv85FJ9uB9QN9OVp99Gff+0lyywlJY+JWhTJFHx9rWknbAvAee2tyhoJjC1tlj0MKaquaQ3nQz8Qirad/MzRaXf/XMnqHFAz0IGaKr1kLHHa3We0fKncJz8/F6o+ea1IiBbC1XN2cTi429jW4hwjO8H+ul8tFC2nf650dQ6oGehVYQ7AKi7OMtB9YrlPfmYmdH1yL0E6r71VgTrnvVVGpb8+yf6631xcWu6fKx/qKgY6ULPSfeKFkSckj4casHytaUj75LUSorzvnICxpaFQbGNbi5139dc5De8Lf/Hy3BPwwQp3QN1AB1xV+sz48/OWWeSpcYoK2rWmnbInpvLTq/deym6XPQRl8JpWfyiY9ql/mlyaR3V1rixVX3GWb11zPopLc0/KHRLVErqJ+GuzgbvWtBOGAnxee6vS+gAuFTfIHoY63Ne0LsoeDHlJFown4cohKLwgDlA70N19dHNh8iVOuytCmBZiyUz5WlP2yT3tDPlCuHpGc1tkD0E9BmBNV/rrfDop5afTS7XT7Zxyb1FVH/308w+9zO1r8i33yWdYUtRzVYi3qa0lb8a4QK4OOw9YE+yvq6Jo28nPHpt9GT7pnwPqB3rVtDu3r8njXGvKPvnqIqK875zqG1vaHN5tbA1Y7q/zmlapXNvVfDHdDqgd6MDKFIcBwFyaG/+x5PGETliuNe2UXdymtibD1nAqy6n3VfGaVulOZUs/RjnIDfhgQRygdqBXnRgHwHzhR3/8BG9f643la01PXQrFtaadsFETGOY2tYYkC5vCdc57q5xrWid5jGwvmTayHzmU9Nquxgq9De5ANwCYRiHD1e5dFpnLI3EqVT6ulRoW9hPhmsVeeuPsfHka3pplf70XZorLq9sN+KR/Dvgn0Jer9OzCBKfdu8Tpk8fG59knb9Iwt6k1La0PIFnYJHsYvmIvsL/eC69kDGe63Rer2x2qvwRVTbkDMF/80Z9w2r3DhG4uX2vKPnnzeF5760J9znurKv11XtPaHaaN7P/yk6rpdlboHeSEujP1wWn3Dlnuk5+Z4XGtbdgW4Ta1VuXNGMaWhmQPw5eWr2mdZn+9k1zT7e4FccqHOeCvQF8O9ez8OAO9TZG5POJnZkJ9rWknJFidt+3s4jDPeW+Dveg6RpZP5ba9nKnqn/tmuh3wR6ADK/vRDQDmiz/+zwc57d6a5WtNx+d5XGsH7IwxzDthNLdV9hB8b/kYWb4ytsy0kf1ff5I8iOoFcb4Ic8AfgV67MM4AYHHavTm81rTzNmoCQxoDvRMuFddzG1snWLymtR2V6XZ3i5cVehe4T4wzABhzl04/KndI/lHeT85rTTuN1XlnncqySu+Uqmta2V9v2LMp/VFUMgbVJ8T5gl8CHaiZdj/1sy8+x7PdVxfJFMrXmrJP3nHbogIDzPOOyhoJjC1tlj2MQLGzgDnB/nojirad/ORzU8/Bp9PtgH8C3XPavbg4+12po1LUcp/8/Bz75F3AbWrdw21sXeBc0zrB/vpqJhaN78LH0+2AfwId8Jh2n3rtR5x2d3GuNWWfvLuu4nntXWPYGk+Q6xbD1V/ny8Nlvnku4+vpdsBfgQ7UTLuPv/jYBaOUPyp5TErgtaa9kRDlfefUPWNLQ9zG1kW8pvVymZJ59L+cWrgAH0+3A/4K9NpT4wwA5uLCRKin3bVFvdwn57WmPbEn5qenjH+9lN0uewiBt3xN6xzfoJ7KGN9FdZj75nQ4N7+9OrlPjTMAmL/8wR/+Yxj3pAvdRPy12fJxreyT98QQz2vvmbQ+gEvFDbKHEXyWa/96SCf3TBvZf/XkxX+Eq50LH4Y54L9AB6oXxhkALH1pLjRVutMnT5y6xD55j+3kQrieGs3xzvSeMQBrOpz99WS+ajGce0Gc7/gt0N13pDs/fCN55gd/K3VUPeJca8o+ee9dFeV57b2WN2NcINdjy/31EF3T+vWzC38LV57AJ3efe/FboAPVgV4CYIy/+NhEkBfH8VpTuSKivO+cem9saTO3sUkQlmtaK4vhJuDKE/h0uh3wd6C7p92NhdTot6SOqguEbiJ+fo7Xmkq2i9vUpDFsDaeynHqXonJNq3khuMfIPj+rfwvV1bkvF8M5/BjogMfiuJee/MITQTk5bvla01OXoGUC+kzyiY2awDC3qUmVLGziOe8yGZVjZCeDdYxs0baTH/vZpHPvua8Xwzn8HugmVqZJzKXsRd9X6VXXmpJ0PBFODeyly2fng3VN6+n50rewEuYl+Lw6B4IR6Mv/GOePf2fEr1vYtEWd15oqZpjb1JSR1geQLGySPQxCMK5pNW1k7zs5O4KaohAMdGlqq/RS+uLxhVIx+5TcYTVH6Gb5WtOzs9yGphCe164envOuEOea1gl/9tdTBeupH1/KL6CSHQhAmAPBCHT3ggbj4ovf+69SR9Wg5T75mRlea6qgbRFuU1NN3oxhbGlI9jDIxdYr/fVpf/XX//LV9H9FTXaAgS7d5VvYTn1/Qi/Mf0/usFYXyRRW+uTchqacBKtzZZ1dHOY57wqyF/3TX5/KW9/7yqlMYLaquQUl0Ku2sGWmXlHy5Dhea+oPO2MMc5WN5rbKHgLV4YdrWg/PLn4XAdqq5hakQF/uhbz89JeeV+mgGWFa5T45rzVV3kZNYEhjoKvsUnE9t7GpzH1Nq2L99UzJPHr7s6nnUZMZYKArw31PuvMPZMxNHH1Q6qgqyvvJU+yT+wSrc384lWWVrjo7X+mvp9Tprx9MFh7EylS7E+a+vCrVS1AC3X1PegmA+crhr/xcZpUeyRTK15qyT+4b26ICA8xzX8gaCYwtbZY9DGqAna1Mw0vur2dK5tEDz0//HJdvVfPlue1eghDowOV70ksATBlVunOtKfvk/sJtav7DbWw+Yrn665LulqpU51UzufDxzWpeghLoQPUWthIA45XDX+lZL53XmvrbVTyv3XcMW+MJcn4j6ZrWSnX+PKpXtjur2wMjKIHunnavevc1N3Hka93+5tGZRV5r6mMJUd53Tv4ztjTEbWw+tHxNa6o30/A/SBa+Bo9ZXARouh0ITqAD3ivejVcO/2XXeunaol7ukycz7JP72J5YkJ4G4fNSdrvsIVCL7Kxr/3qXZErm0TvKvfPaMA/Eyna3IL2SeS2Oq/TSO1ulO33y+NlZ9sl9bojntfteWh/ApeIG2cOgVlmu8+G7MMnpqs5re+eBqs6BYAU64B3oHavSq641ZZ88EHZyIVwgjOZ4Z7rvufrrndrmVqc6dwd6oAQx0Gt76R2p0iNzeSROpXitaYBcFeV57UGRN2NcIBcQzjWt1mz7/XWP6jyQvXNH0AId6HCVri3qSJyZQWx8nn3yAImI8r5zCo6xpc3cxhYg9kJlGn6htb8ftuocCG6ge1bpF05+555Gv4jQTcTPz5X75PlSd0ZK0uziNrXAMWwNp7Kceg8UC7BmRTnYmzxG9k9fnrsHIarOgWAGOlCnSp945Qfja93E5r7WVMsodhAxdcRGTWCY29QCKVnYxHPeg8ho7prWqbz1va+dzowjRNU5EOxA96zSJ14a+Zptm56N8MhcnteahgBPhAs29tKDq5FrWk0b2S+dToeqd+4IaqADq1Tp+cz0t91/UFvUy8e1js9zG1rADXObWuCl9QEkC5tkD4O6aHmbm0dpdjZX+nYYq3Mg+IHuWaWfPfaNv7PMUlLoZvla07Oz3IYWAjyvPTx4znsIWJVrWidW+utF205+/ljq7xDC6hxAaNYFicpHBIBWyE6bw32vX9o4E92nLXHBW1jsiAoMhbB3HjfzGMwnZQ+jpww7Ak3Y2Bxfkj0U6jYTsLMC0AWOZAv3/+mpuRMAdABFAIXK7w0EPMyBYFfowMo7MmfqRa/8avzi6P/9qFFcPCZzcNQ7CW5TC52xpc085z1E5hfMY//z08lH4fF6jxBU50DwAx1YOePdQPU/sDkx/+xfyBwY9c7OGLephY1haxjNbZU9DOqRb6Vzf4HqdVNOZR64M9vrCVOgO//QeuXDOJ383itL+uy3V/vL5H8bNYEhjdV5GF0qruc2thC4UNC//UfjM6+g5jUeAb2EpZ4wBLrDXaUvV+ovXfz/HrRsi+e5BtjOGMM8zE5lWaUHmWkj+9kLqQdRXZm7q/PQCEugu6fdq7YyzGVPL8wvvna/zMFR9wxHBAaY56GWNRLcxhZgz+fy9/8kW1jA5dvUQjXdDoQn0IHLe+nLVfrR177yXcPIc4FcwEQEsIvVOaFcpXMbW/AsGOaxD59Ofhf1q/PQhDkQrkAHqvelV/VZzl76p4bPeSd/uIrntVOFYWs8QS6A/vxi2jmvvbZQC/whMl7CGOjOArmqUB+b+dlErjD1kMzBUeckBLAthHvOqb6xpSFuYwuQ0ULxoYdmMhPwDvPQVedA+AId8K7SSwDMZ07/2VdNSx+VOTjqjD2xMD60aS0vZbfLHgJ1wKJtjd700sRXUee1HCEMcyC8ge5VpZcAWOPpp++VODbqgI0az2snb2l9gNvYAuCbqey9KL+Oe4V5KKtzIJyB7vDquxink987xb3p/nYNF8LRKl7MsEr3s9FC8aE/Gp85Be+FcKG+XSusgV57cUvVA+LFie98zTSLpyWOj1p0VVQgwTynVeTNGBfI+VTOsk7/wdjMt7D6QrhQVudAeAMdqJ56110fpfncmfkLc5x695sIz2unBo0tbeY2Nh/65kz23p/mCvOoLsR0hHyq3cFHdJlA9Y1skXT2dHrrpr1aPLr+BrlDo0ZdExNYzyNeLxPG29bWYkGgaEWxJZGTPRRq0Gih+NAnXp36Z6xU5oXKh/sCllALc4UOeB824171/iCn3v1hQCufCkfUqGRhE7JGn+xhUANylnX6ppcmHoT3YuZQHiLjJeyBDlwe6kW4Thq6MPf0vTzrXX27onwoU/NGc1tkD4HWYNrIfnNmeVW75+s0GOYAOOXuRaD8RkcDoKWzp9NbNr61lIhterfkcVEdwxHB3vkqOOVeX96MoT9SwoZoUfZQqI4XCoWvfPLs9JMoh3ex8lHASqAzzCtY1pTV7k133v2VAJjPvXr/t/RS7pDE8VEdEVFe2U7UqrOLw1wgp6i0YR764MsXnVXtzlS78/rMhXA1GOjVvB40BgDzxPg3OPWuoG0RblOj9uTNGMaWhmQPg2qYNrKfOjt1L6q3qFW9LkscnpIY6Cvq7U3XAZjzuVcXJueOfU7i+KhGgtvUqEPGljbznHfF/MNc7nM/yxUWsLK1uGrmFCHfc+6F80zehOvX5X56KvPC1NZNewW3sqlhT1xgQDDQ18Ie+tosCBSsOLb1ZWQPhVDeova/nZ78HqrDvFD51anOGeY1WKFfzqnSa6d4lrey8e50+TZqAkPcc04ddKm4nue8K2DBMI95bFGrnWpnmHtgoHtzT707qyqXt0j84sJffY79dLl28rx26oJT2a2yhxBqpo3s/rNTn8PlW9SKCPlNao1goHtz7013h3oJlX762OxTd0gcX6gNRwQGmOfUBVkjgWRhk+xhhNaDqYU7XH3z2tde7jlfA3voa7Oxcixs1f70Kze8dTER2/guqaMLmYgA3hTX+E60CeyhNyetr8PVA/PQBHOjl07kC1/8d+X95k6YO0e7OjOkDPM1MNAbVxvqYiL9zIuvu+JdO6Ja3xvlDi08ro4JbGTvvCkM9OZYELCgYTi+KHsooTFZMh9714vj/y9W1i+5F8E5e84Z5mtgobO62hvZak8osn554W/v53nvvZEQ5X3nRN02tjTEbWw9krOs0//+tan7Ud03rw1zVucNYIXevKqp94KeLpl24bnN69/0YSFEQvLYAu26uMZDZFrACr01ObMPO/oWZA8j0EwbX9x8uAAAFMJJREFU2fvGU3eMzC+lsFI4uafa2TdvAiv0xjhVeu27xxIA88LM0xe5SK67NmoCG/hopR5K6wPcxtZlD6YW7vj6TPYiqhfBuWdBneqcGsAKvTXu+9OXF8kNrXv9VH988z65QwumN8U18FC41rBCb91caQC7BuZkDyOQDmfz991xbvowLg9z9s1bxEBvnvMAu2zle3Lu+TPbh27cEIsMvE3a6ALoqqjAEHvnLWOgt865tGVzfEnySILlQkH/9vtPXfwGVvrmTphzqr0NnMRsTu3d6e53kwYA6+lTf3w/b2brnAjPayfJxpY28za2Dkob5qFffWm8dhHcZQuOwTBvGh+lrXM/2DSsVOtivnDhuW0b3/5uTYteIWdowXFNTGA9t6m1hRV6eywIFK0otiRysofieznLOr3/1anPXdCNAqrDPI+VdUkM8xaxQm9N7a1sVYvk5nOvZo6Nff3Tlm3wVbQNA1r5VDgi2ZKFTcgafbKH4WslG8lPnJn89M9yhQy8F8HxaNc2MdBb475q1X3WcFWoj83+5Pd55nvrdkX58CR1jOa2yB6Cb5k2sg+lFn7fI8zdd2XwStQ2ccq9MzwXyqWzp2cj0fhzm/p338o96s0Zjgj2zjuEU+6dkTdj6I+UsCFalD0UXzFtZB9MLdxxz/jMKZSn092VuVOd8/CYDmCgt8/9AHQHukBlO9vm9W9Icztb4yICeH2M29Q6hYHeOVmjD1f1Z3jOexOezeX/7I5z089gJcy9Do/hVHsHMNA7y12pu7ezneYe9cbt4Da1jmKgd45hR6AJm9vYGnQ4m7/vI6eT38Plu4O4Pa0LGOidY9f8WrXynaHemIQA9vA2tY5ioHdW1ujDtr4MYhoPMFtNnTB3r2hnZd5hDPTO8pp+X/5Izj1/mrezrW5PXGBAsDrvJAZ6Z1kQKFhxbOvLyB6KsiZL5mPvfXn8a/Dea17Ayv3mXATXQQz07vG8R30sdegnDHVvGzWBq9k47zgGeuctmnFsji+hP1KSPRTlTJbMx9528vy9qN7eWxvmXNHeBQz07nBPv9dW6gz1Ot4Q1xBjnnccA707skYfru6flz0MpdSE+WqVOfvmXcBA7656574Lhnq14YjAFi6E6woGenfoVpTb2FwaqMx5rGuXMdC7x+sB697SJsZSh376uivetT3soR4R5dvUuBCuOxjo3ZPW1+HqgfnQb2OrhPl9WDvMuQiuixjo3efuE122UI6hDlwdE9jI89q7hoHePRYELGgYji/KHoo0rjC34B3mPKO9Rxjo3VWvSndPvyPMoZ6oHCJD3cNA766FUj929C2EchtbTZh7XYXqnmYP3w+oxxjo3edeIFfvVLnQhvp1cQ0JFuddxUDvvpzZhx19C7KH0VMeYV6vMneOdaUuY6D3Tr1AD22ob9QEruI2ta5joHdf3oyFahtbk2HOafYeYaD3ljvUa7e0LYf69qEb18ciA2+TM8TeeVOc57X3AgO9N+ZKA9g1MCd7GF13oaB/e++LF/4M3mHunALH29MkYKD33pqhfmHmp88NrXv9ZJCPid0WFbiC29R6goHeG4YdQVRYGIzlZQ+law5n8/e9/9TFb4JhriQGuhxrhnpy7vkzQQ31iCj3zrkUrjcY6L2zUOoP7Da2ytnsj4FhriwGujyrhfry2e8b+153pj8x/K4g3ad+TUxgPbep9QwDvXcsCBStKLYkcrKH0jGmjezBhcX/9BuvTv4QK/vM3avZGeaKYKDLVRvqQE2oTy384nwkGn92U//uW4MQ6gMasJvb1HqKgd5bWaMPWxI5JDRD9lDaZtrIPphauOPO85eOovrQGB3lIHcWwDHMFcBAl8/rCVAV6uns6dlyqO98lxDahp6PsINeH+M2tV5joPfekhn3/Ta2nGWd/quZzO/fMz4zivonwDHMFcJAV0NDoZ5Zeu37Wza+/d2aFr2i5yPsgKGIwHYua+85Bnrv5c0YNkSLWBfVZQ+lJTnLOv3xM5N3/M1MJgmGuW8w0NVh13w4lkN9SU/r2fz5JzZveOMVfturHhHAG2LcpiYDA12OBaMfV/VnfLdAbrJkPvaps1P/6elcIYO1j3NlmCuEga6W1UJdQyXUx1KHfuK3veo7ogJD3KYmBQNdDsOOQBM2NseXZA+lYc4e8wu6UcRKmNdegaqDYa4kBrp6agPdc7Gcn/aqJwSwh9vUpGGgy5M1+rCtL+OLc95de8xtrJzLXkJ1VV5E9a1pDHOFMNDVU3v2u9f0O1DZ1qZFYodUXwG/i9vUpGKgy2NBwLAjSm9jM21kv5pa+OQd56afxUq/3F2Zu7elObemqf8OJYQY6GpaLdQBV7CXF8ud/UdVF8tt1AR2xhjmMjHQ5coafcqe856zrNO/eSb5b12L35zKXMfle8x5a5riGOjqqp12t1y/r5p+X9LT+rnUj/5RxYtd3hDXwDyXi4EuX9bow9X987KHUWWyZD72xl+ev7PSL3cfGOOEee1Kdl60ojgGuvrcVbqFOj11ABhLHfqJSn314YjAFi6Ek46BLp9uRdEfKWFDtCh7KADK/fL3vjz+EFZeW9wHxtSuZHcqc4a54hjo/rHmtjZU9dXlHkITEeXb1LgQTj4GuhrS+jrp57yXbCQfTC3c4eqXN7ItjWHuEwx0f6kNdc9qPZ09nc4svfb4FevfsjsSie+WMdAdUYFNXAinBAa6GiwIqdvY0oZ56OOvTt75NzOZSVy+kp17zAOAge4/XtPvtcGOJT2tn5958okrN7w1l4htfFcvB5gQ5d45qYGBro650gB29C30fBvbiXzhize+OH6/q19eu/jNHebcluZTDHR/8qrUvW5sw0T6mRd7PQV/XZzntauEga6WnNnXs3PenSn2f3d2+hCq++VeYe5eyc4w9yEGuj/VBrnXE1DKFPxGTeAqnu+qFAa6WvJmrCfb2OpMsbv75c5taV5hTj7EQPe/en11YOUQmuUp+KF1r59MxAZv6NZBNG+K87x21TDQ1TNXGsCugbmufG3TRvbZXP7Pbnp5/Cs1U+y1h8Vw8VvAMNCDoV6lXjsNj+Tc86cNa/GJwf5rrtO02I5ODmJbVOAKblNTDgNdPYYdQVRYGIzlO/p1Fwzz2L0T83fePZ46hsun2J2jW73CnFPsAcBAD46Gp+AXli7kzqV+/HgnF8xFRLl3zqVw6mGgq2mh1N/RbWwn8oUvvuPF8S8cXypksfqWNPbLA4qBHhz1Fsp5TsEDKwvmNiauelu7x8Zew/PalcVAV5MFgaIVbfuc95xlnf56KvN7NQvf6t2UxsNiAoyBHky1VXq9Y2ORzp5On0v96JGtm/YiHl1/QyvfbEADdsdYm6uKga6urNGHLYkcEprR0t8fLRQfuv7khf94KLM0i9Wn2J3fO8e4MswDiIEeXE6QOx/1LnkBAIzPPv0LLRI7tCG+fXezvfXXx7hNTWUMdLUtmfGmt7EtGOaxv5rJ/v4nXp06iOrZOK+DYtx3mHOKPcAY6MHltbVttd56pVov99Zj0fVvbWQl/FBEYDuXtSuNga62vBnDhmgR66L6mn/WtJE9WSj85TteHP+CR1XunMXOKfaQYqCHQ22g1z6xqw6kmUg/84JhLT6xsW/n9tX2rUcE8IYYt6mpjoGuvgWjH1f1Z1ZdIJc2zEP/18T8//nZsUvPVD5Vu/Ct9mIVbkkLGQZ6eNRW6l5P8OVoXli6kDs/8+TBjX2vO92f2PxWr1PmdkQFhrhNTXkMdPUZdqTuOe8lG8knFhbve/8rEw+5VrDXHt9aW5VzFXsIMdDDY60peM/V8FMLvxjLLL32+Ib+nbp70VxCAHu4Tc0XGOj+kDX6sK0vU3XO+2ih+NCnX5u+70vT86dR/Vx1b0dzh7nTK2dVHkIM9HByT7uvWbEv6Wl9fPbpYyUz97hzIM0ublPzDQa6P1gQMOwItiRyWDDMY/eMz//u/zF26dAF3dDhfQ67V1XOg2JCjK/I4SUAaCi/qYsCiLs+EgBilc9HKn9uefHcO3b+mxtu2XrjPRER6ehJc9Qd6/Q0ds0ekT0MakDJtpLT2sn77r5w8VjlU7X7yt2r2HXXh3NDGqvyEGOgh5sT0hrK4R2rfCSwEu5OsGtYCXYAwKf+xe//m20DrzvQq1vcqDUMdPVZws6e1zNf/8Opp7/t+rR7Bs0JcifAnQVvtSvYGeYhxkAn4PJqPQbvat0J9uVqfffg6zf8q6t/47eu7N/2aQnjpgYw0NU2oece+puFl/7+xcJMtvKp2kVvXlW5E+SsymkZA50c7mo9gpVq3Qn1etW6AIAbt75nx7t23HpgY2zww70fOq2Gga6mtFl47HvZM18/mL3gLHCoXbDqrsrdPfLaRW8McwLAQKfLOaHunoZ399edoHcHu/P3cOPW9+x4z45f/w/rYuv39XjcVAcDXS0ZSz/0j5nRL9YEOXB5kLun2N1Veb1FrBRyDHTyUlut1wa783v3ormq/vqHr/34DW8cvP7TfZG+ls6Hp85hoKthySodO7Y0/dBX5355zPVpd0XuXsHuDnOv6XWGOV2GgU6rcYI9Au9gd0/DX7YaHmCwq4CBLtcqQe61et2rIjfBrWjUAAY6NcJrGr62Yo9hJfgZ7AphoMvRYJA7B8TUVuScXqemMdCpUe5p+NWC3b0a/rJg5+K53mOg95bHYjfAe8FbbVVeL8gZ5tQQBjo1q15/3Qn2GC6v2KvuYAdWgn1DdOM+7mPvLgZ691nCzs4bxUOrBLlzypu7InfC3B3k7JNTyxjo1Cqv/rpz4pw73KNYJdidfezDfVt+i8HeHQz07rGEnU0WF/++Zh854B3k7orc+dWp1Nknp7Yx0Kld7mn41Sp2rxXxVY+/337TnR/etu7q34pHEtf1bPQhwEDvvLxtnD6nL/z9n1x67rGa/6t2at0d5KtV5OyTU9sY6NQJzuPI3V93B7v7Y81g//C1H7/hmo3XfYh99s5goHdO2iw89lJ+5vGahW7A2kHu/nCqcufPOn+fqC0MdOok95R67Va32lB3T8V7Bvvuwddv+OBVt314y8BVv8mLYFrHQG9PybaS40b2O9+ZP/VYzbQ64L1q3b3grTbIa6fWGeTUMQx06oZ6wV4v3N0Ve9XJcw5W7a1joLdmjWocqL56uF5FXq9HziCnjmOgUzfVBvtq0/H1KvbLqvb3bvv1fey1N46B3jinN/5o5tVDq1TjXhX5atPqDHLqCQY69YI7nN2L57zCvTbYPafjgfLWt/9h6wd/c2NicB+n5OtjoK+uZFvJObNw6J9yZ79Ts+XM4dUf9wpyA9UVuXv7GYOcuo6BTr1Uu3iu3nS8O+y9gv2yx+0Hrr7tujcPvf1DDPfLMdAv54T4zwuTj//93KnTHn+kthp3T6vX9shrp9W52I2kYKCTDO5g9+qz14Z7BN5Vu/trLWO4V2OglzUY4s6vtdV4bUVeW42brr/n/lpEPcNAJ9lqj5T1qtqdX53PN1S1Ayvhvi62/h1h7bmHOdDztnE6a+pHVwlxYPVq3DnZzcDq1Tin1Uk6BjqpwqvPXrv1LYr60/FrhvuNW9+z4/rhd+7bGN/8q2G6rz1sgZ6x9EMzZv4XP128cKhOTxzwDnGvaXV3kLurdfbHSTkMdFKN13S8szreq3J3Pue8CRBoINwB4Deu+/S+K/u2/2rQq/egB7pThY+XMr+4f+bYoVX+aG2IO8eyOpeluKfVjZrPuVerc1qdlMRAJ5WtVbXXVuvuqr2pcHe2ww32D//quuiGG4LUew9aoJdsK5m19GNTxuIv6mwvc1stxN3T6rVVOatx8h0GOvlBbdVeG+61Ae/Va/faAlf38X/j1vfsuGbTW64LQgXv90B3V+AvFFOnV5lGB6oXttVOp68W4ia8Q5zVOPkGA538prZqr11MVy/cnT/j1W9ftXp3fPjaj9+wY2DnDQPR9df1Rfuv80sV76dAL9lWMm8bpzOGfvqcPn/M45Q2L7bHhzvAa6fU61XhtQvcGOLkKwx08rNmwt1rSt4d7g1X747dg6/f8LYr3nndjoGdNySifdv7tP43qljJqxroeds4nbeM0SXTmDynzx/7Wf7i6TWmzx1eVbhXiHtV4wxxCiwGOgWBO4RXC3d3qNfubY/U/N3ayr3h58oHrr7tuuH+LTuGEsPXJaJ92+Na346+SN8Nbf0XtkF2oC9ZpWMF20wumcbktJk7nTQXk6tsIfNSG+Du8K7tidfuG/eaSvfaasYgJ99joFPQrBbuXgHv9VGvcm855IGVir4/MrBhKDF8XVTE1vfH1r0RALoZ+N0O9CWrdAwAclZpVLes3LSZO71kGtkmKm43r/BerRJf66O2h84Qp8BioFPQ1QZxowFfOy2/WsjD49eW3Lj1PTu2rd+9HQC29G17Y1SLrwcAp9J3/9lG3wQ0E+hOODucyhoAdGHmLhazowBw1pibXGNxWiNqg3W18PaaTm8mwDmdToHHQKcw8aq0vQK+9tfayr3eYTZazfeBx69hVC+4gctDtzaQa8O7NtTXCnCGOIVGmF9kKNxqp+bdlbdXcNcGvNefWSvgVwt5Pz8XbY/fe1XdQGMB7g7xesHtruBrvwdDnELJzy8iRJ3kFfBrhXy9aXmv6fl60/SNVPNez9NuPne9ArH2c2sFd73p87VCvN7/5xXeDHAiFwY6kbd6Ae8V0l4hvlbA136t2u9XOwb3r/U+1y6vgPQKbufXetvH1uqD14a0V2ivNn3OACfywEAnaly96tornOtV6PXCfa3V9F7h3o3nr1dw1qu8vYK8NqjrVej13gR4fS8iagADnah1tRXzWoG/WnDX+/xqAd/JKr2RqfN6H/VCud7n630vgAFO1DIGOlHnrTZlvlooN/o5r187Ya3p9dWCvvZz8Pi9169E1CEMdKLeWqsP3mwPvd7/bka9BW/u3682De/1/3t9XSLqIgY6kXpWC+56n+u0tVa6M6yJiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIha8v8D7GG94MqFpAcAAAAASUVORK5CYII="
                                    />
                                </defs>
                            </svg>

                        </div>
                    </div>

                    {/* Current Color Display */}
                    <div className="w-full flex items-center gap-[8px] mt-[4px]">
                        <p className="text-[#b7b7b7] text-[12px]">Current:</p>
                        <div className="flex items-center gap-[4px] bg-[#f6f6f6] px-[8px] py-[4px] rounded-full">
                            <div
                                className="w-[16px] h-[16px] rounded-full border border-[#ececec]"
                                style={{ backgroundColor: tempColor }}
                            />
                            <span className="text-[#0e0e0e] text-[12px] font-bold">{tempColor.toUpperCase()}</span>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col gap-[8px]">
                        <p className="text-[#0e0e0e] text-[12px] font-bold leading-[20px]">
                            Size
                        </p>
                        <div className="h-[40px] 2xl:h-[48px] 3xl:h-[52px] flex items-center justify-between bg-[#f6f6f6] rounded-full py-[4px] px-[12px]">
                            <input
                                type="number"
                                value={size}
                                onChange={(e) => setSize(Number(e.target.value))}
                                className="bg-transparent text-[#0e0e0e] text-[12px] font-bold leading-[20px] w-[60px] outline-none"
                            min="16"
                            max="190"
                            />
                            <p className="text-[#b7b7b7] text-[12px] font-bold leading-[20px]">
                                px
                            </p>
                    </div>
                </div>
            </div>

            {/* Tags Section */}
            <div className="flex flex-col gap-[12px] border-t border-[#ececec]" style={{ paddingBottom: "26px" }}>
                <div className="px-[8px] py-[12px]">
                    <p className="text-[#0e0e0e] text-[12px] font-bold leading-[20px]">
                        Tags
                    </p>
                </div>

                <div className="flex gap-[8px] justify-start flex-wrap">
                    {selectedIcon.tags && selectedIcon.tags.length > 0 ? (
                        selectedIcon.tags.map((tag, index) => (
                        <button
                                key={`${tag}-${index}`}
                            className="bg-[#f6f6f6] h-[40px] 2xl:h-[48px] 3xl:h-[52px] px-[16px] py-[4px] rounded-full text-[12px] font-bold leading-[20px] flex items-center justify-center"
                        >
                            {tag}
                        </button>
                        ))
                    ) : (
                        <p className="text-[#b7b7b7] text-[12px] px-[8px]">
                            No tags available
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}