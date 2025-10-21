"use client";
import Svg from "@/commons/Svg";
import { useRef, useState, useEffect, useCallback } from "react";

interface Icon {
    _id: string;
    name: string;
    filename: string;
    category: { _id: string; name: string };
}

interface IconsEditorProps {
    selectedIcon: Icon | null;
}

export default function IconsEditor({ selectedIcon }: IconsEditorProps) {
    const editorRef = useRef<HTMLDivElement>(null);
    const iconPreviewRef = useRef<HTMLDivElement>(null);
    const buttonsRef = useRef<HTMLDivElement>(null);
    const settingsRef = useRef<HTMLDivElement>(null);
    const tagsRef = useRef<HTMLDivElement>(null);

    // State for export settings
    const [fileType, setFileType] = useState<string>("SVG");
    const [size, setSize] = useState<number>(32);
    const [stroke, setStroke] = useState<number>(2);
    const [fillColor, setFillColor] = useState<string>("");
    const [strokeColor, setStrokeColor] = useState<string>("");
    const [svgContent, setSvgContent] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(false);
    const [downloading, setDownloading] = useState<boolean>(false);
    const [copied, setCopied] = useState<boolean>(false);

    const fileTypes = ["SVG", "Webp"];

    const tags = [
        "Fingerprint", "Thumbprint", "Authentication", "Scan", "Touch ID", "Secure", "Security", "Biometric", "Identity", "Scanner", "Login", "Password", "Identification", "Access", "Touch", "ID", "Lock", "Interface", "Box", "Frame"
    ];

    const API_BASE = "https://figcons-backend.vercel.app/api/icons";

    // Extract colors from SVG
    const extractSvgColors = (svgText: string) => {
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = svgText;
        const svgElement = tempDiv.querySelector('svg');
        
        if (!svgElement) return { fill: "", stroke: "" };
        
        // Get the first path/element to extract colors
        const firstElement = svgElement.querySelector('path, line, circle, rect, polygon, polyline');
        if (!firstElement) return { fill: "", stroke: "" };
        
        const fill = firstElement.getAttribute('fill') || firstElement.getAttribute('fill-opacity') ? firstElement.getAttribute('fill') : "";
        const stroke = firstElement.getAttribute('stroke') || firstElement.getAttribute('stroke-opacity') ? firstElement.getAttribute('stroke') : "";
        
        return { fill: fill || "", stroke: stroke || "" };
    };

    // Fetch SVG content when icon is selected
    const fetchSvgContent = useCallback(async (icon: Icon) => {
        setLoading(true);
        try {
            const response = await fetch(`${API_BASE}/${icon._id}/svg/5dccc8ad0fb2663098cdde103b7c1bf0`);
            if (!response.ok) throw new Error("Failed to fetch SVG");
            const svgText = await response.text();
            setSvgContent(svgText);
            
            // Extract colors from the SVG
            const colors = extractSvgColors(svgText);
            setFillColor(colors.fill);
            setStrokeColor(colors.stroke);
        } catch (error) {
            console.error("Error fetching SVG:", error);
            setSvgContent("");
        } finally {
            setLoading(false);
        }
    }, []);

    // Process SVG content with dynamic settings
    const getProcessedSvg = () => {
        if (!svgContent) return "";
        
        // Create a temporary div to parse the SVG
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = svgContent;
        const svgElement = tempDiv.querySelector('svg');
        
        if (!svgElement) return svgContent;
        
        // Clone the SVG to avoid modifying the original
        const clonedSvg = svgElement.cloneNode(true) as SVGElement;
        
        // Set width and height
        clonedSvg.setAttribute('width', size.toString());
        clonedSvg.setAttribute('height', size.toString());
        clonedSvg.setAttribute('viewBox', svgElement.getAttribute('viewBox') || `0 0 ${size} ${size}`);
        
        // Update stroke width and colors for all path elements
        const paths = clonedSvg.querySelectorAll('path, line, circle, rect, polygon, polyline');
        paths.forEach((path) => {
            // Only set stroke-width if stroke color is provided
            if (strokeColor) {
                path.setAttribute('stroke-width', stroke.toString());
                path.setAttribute('stroke', strokeColor);
            }
            // Only set fill if fill color is provided
            if (fillColor) {
                path.setAttribute('fill', fillColor);
            }
        });
        
        return clonedSvg.outerHTML;
    };

    // Handle icon selection
    useEffect(() => {
        if (selectedIcon) {
            fetchSvgContent(selectedIcon);
        } else {
            setSvgContent("");
        }
    }, [selectedIcon, fetchSvgContent]);

    // Copy SVG to clipboard
    const handleCopy = async () => {
        if (!svgContent) return;
        
        try {
            const processedSvg = getProcessedSvg();
            await navigator.clipboard.writeText(processedSvg);
            setCopied(true);
            // Reset the copied state after 2 seconds
            setTimeout(() => setCopied(false), 2000);
            console.log("SVG copied to clipboard");
        } catch (error) {
            console.error("Failed to copy SVG:", error);
        }
    };

    // Download SVG file
    const handleDownload = async () => {
        if (!svgContent || !selectedIcon || downloading) return;
        
        setDownloading(true);
        try {
            const processedSvg = getProcessedSvg();
            const blob = new Blob([processedSvg], { type: 'image/svg+xml' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `${selectedIcon.name.replace(/Image preview$/i, '').replace(/-/g, '_')}.svg`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
            
            // Add a small delay to show the downloading state
            await new Promise(resolve => setTimeout(resolve, 1000));
        } catch (error) {
            console.error("Download failed:", error);
        } finally {
            setDownloading(false);
        }
    };


    return (
        <div ref={editorRef} className="w-[100%] md:w-[25%] flex flex-col gap-[16px] md:px-0 px-[16px] py-[16px] md:py-0 md:pb-[8px]">
            <div ref={iconPreviewRef} className="flex flex-col gap-[12px]">
                <div className="px-[8px] py-[8px] flex justify-between items-center">
                    <h1 className="text-[#0e0e0e] text-[16px] font-bold leading-[24px] capitalize">
                        {selectedIcon ? selectedIcon.name.replace(/Image preview$/i, '').replace(/-/g, ' ').split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ') : "Select an Icon"}
                    </h1>
                    <div className="flex gap-[4px] items-center">
                        <Svg icon="share" />
                        <p className="text-[#454545] text-[14px] font-normal leading-[20px]">Share</p>
                    </div>
                </div>
                <div className="border border-[#ececec] rounded-[20px] h-[213px] 2xl:h-[250px] 3xl:h-[280px] flex justify-center items-center">
                    {loading ? (
                        <div className="text-[#454545] text-[14px]">Loading...</div>
                    ) : svgContent ? (
                        <div 
                            dangerouslySetInnerHTML={{ __html: getProcessedSvg() }}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}
                        />
                    ) : selectedIcon ? (
                        <div className="text-[#454545] text-[14px]">Failed to load SVG</div>
                    ) : (
                        <div className="text-[#454545] text-[14px]">Select an icon to preview</div>
                    )}
                </div>
                <div ref={buttonsRef} className="flex gap-[8px] items-center">
                    <button 
                        onClick={handleCopy}
                        disabled={!svgContent}
                        className="px-[12px] py-[8px] w-[50%] rounded-full bg-[#0e0e0e] text-[#ffffff] text-[12px] font-bold leading-[20px] h-[40px] 2xl:h-[48px] 3xl:h-[52px] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {copied ? "Copied!" : "Copy"}
                    </button>
                    <button 
                        onClick={handleDownload}
                        disabled={!svgContent || downloading}
                        className="px-[12px] py-[8px] w-[50%] rounded-full bg-[#f6f6f6] text-[#0e0e0e] text-[12px] font-bold leading-[20px] h-[40px] 2xl:h-[48px] 3xl:h-[52px] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {downloading ? "Downloading..." : "Download"}
                    </button>
                </div>
            </div>
            <div ref={settingsRef} className="flex flex-col gap-[12px]">
                <div className="flex justify-between items-center py-[12px] px-[8px] border-t border-[#ececec]">
                    <h1 className="text-[#0e0e0e] text-[14px] font-bold leading-[20px]">Export Settings</h1>
                    <button
                        onClick={() => {
                            setFileType("SVG");
                            setSize(32);
                            setStroke(2);
                            // Reset to original SVG colors
                            if (svgContent) {
                                const colors = extractSvgColors(svgContent);
                                setFillColor(colors.fill);
                                setStrokeColor(colors.stroke);
                            } else {
                                setFillColor("");
                                setStrokeColor("");
                            }
                        }}
                        className="text-[#454545] text-[14px] font-normal leading-[20px] hover:text-[#0e0e0e] cursor-pointer"
                    >
                        Reset
                    </button>
                </div>
                <div className="py-[8px] flex flex-col gap-[8px] items-start">
                    <h1 className="text-[#0e0e0e] text-[12px] font-semibold leading-[20px]">File type</h1>
                    <div className="w-[100%] px-[4px] py-[4px] bg-[#f6f6f6] rounded-full h-[40px] 2xl:h-[48px] 3xl:h-[52px] flex">
                        {fileTypes.map((type) => (
                            <button
                                key={type}
                                onClick={() => setFileType(type)}
                                className={`px-[12px] py-[8px] rounded-full text-[12px] font-bold leading-[20px] flex items-center justify-center ${fileType === type
                                    ? 'bg-[#0e0e0e] text-[#ffffff]'
                                    : 'text-[#b7b7b7]'
                                    }`}
                            >
                                {type}
                            </button>
                        ))}
                    </div>
                </div>
                <div className="flex justify-between items-center gap-[12px]">
                    <div className="w-[50%] flex flex-col gap-[8px]">
                        <p className="text-[#0e0e0e] text-[12px] font-bold leading-[20px]">Size</p>
                        <div className="h-[40px] 2xl:h-[48px] 3xl:h-[52px] flex items-center justify-between bg-[#f6f6f6] rounded-full py-[4px] px-[12px]">
                            <input
                                type="number"
                                value={size}
                                onChange={(e) => setSize(Number(e.target.value))}
                                className="bg-transparent text-[#0e0e0e] text-[12px] font-bold leading-[20px] w-[60px] outline-none"
                                min="8"
                                max="512"
                            />
                            <p className="text-[#b7b7b7] text-[12px] font-bold leading-[20px]">px</p>
                        </div>
                    </div>
                    <div className="w-[50%] flex flex-col gap-[8px]">
                        <p className="text-[#0e0e0e] text-[12px] font-bold leading-[20px]">Stroke</p>
                        <div className="h-[40px] 2xl:h-[48px] 3xl:h-[52px] flex items-center justify-between bg-[#f6f6f6] rounded-full py-[4px] px-[12px]">
                            <input
                                type="number"
                                value={stroke}
                                onChange={(e) => setStroke(Number(e.target.value))}
                                className="bg-transparent text-[#0e0e0e] text-[12px] font-bold leading-[20px] w-[60px] outline-none"
                                min="1"
                                max="8"
                            />
                            <p className="text-[#b7b7b7] text-[12px] font-bold leading-[20px]">px</p>
                        </div>
                    </div>
                </div>
                <div className="flex justify-between items-center gap-[12px]">
                    <div className="w-[50%] flex flex-col gap-[8px]">
                        <p className="text-[#0e0e0e] text-[12px] font-bold leading-[20px]">Fill</p>
                        <div className="h-[40px] 2xl:h-[48px] 3xl:h-[52px] flex items-center justify-between bg-[#f6f6f6] rounded-full py-[4px] px-[12px]">
                            <input
                                type="color"
                                value={fillColor || "#000000"}
                                onChange={(e) => setFillColor(e.target.value)}
                                className="bg-transparent w-[30px] h-[30px] border-none outline-none cursor-pointer"
                            />
                            <p className="text-[#0e0e0e] text-[12px] font-bold leading-[20px]">{fillColor ? fillColor.toUpperCase() : "None"}</p>
                        </div>
                    </div>
                    <div className="w-[50%] flex flex-col gap-[8px]">
                        <p className="text-[#0e0e0e] text-[12px] font-bold leading-[20px]">Stroke</p>
                        <div className="h-[40px] 2xl:h-[48px] 3xl:h-[52px] flex items-center justify-between bg-[#f6f6f6] rounded-full py-[4px] px-[12px]">
                            <input
                                type="color"
                                value={strokeColor || "#000000"}
                                onChange={(e) => setStrokeColor(e.target.value)}
                                className="bg-transparent w-[30px] h-[30px] border-none outline-none cursor-pointer"
                            />
                            <p className="text-[#0e0e0e] text-[12px] font-bold leading-[20px]">{strokeColor ? strokeColor.toUpperCase() : "None"}</p>
                        </div>
                    </div>
                </div>
            </div>
            <div ref={tagsRef} className="flex flex-col gap-[12px] border-t border-[#ececec]" style={{ paddingBottom: "26px" }}>
                <div className="px-[8px] py-[12px]">
                    <p className="text-[#0e0e0e] text-[12px] font-bold leading-[20px]">Tags</p>
                </div>
                <div className="flex gap-[8px] justify-start flex-wrap">
                    {tags.map((tag) => (
                        <button key={tag} className="bg-[#f6f6f6] h-[40px] 2xl:h-[48px] 3xl:h-[52px] px-[16px] py-[4px] rounded-full text-[12px] font-bold leading-[20px] flex items-center justify-center">
                            {tag}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    )
}