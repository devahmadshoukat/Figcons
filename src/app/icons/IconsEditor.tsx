"use client";
import Svg from "@/commons/Svg";
import { useRef, useState, useEffect, useCallback } from "react";
import Image from "next/image";

interface Icon {
    id: string;
    name: string;
    cloudinaryUrl: string;
    isPremium: boolean;
}

interface IconsEditorProps {
    selectedIcon: Icon;
    onClose?: () => void;
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
    const [stroke, setStroke] = useState<number>(0);
    const [fillColor, setFillColor] = useState<string>("");
    const [strokeColor, setStrokeColor] = useState<string>("");
    const [hasFill, setHasFill] = useState<boolean>(true);
    const [hasStroke, setHasStroke] = useState<boolean>(true);
    const [customSVG, setCustomSVG] = useState<string>("");
    const [isInitialized, setIsInitialized] = useState<boolean>(false);
    const [isDownloading, setIsDownloading] = useState<boolean>(false);
    const [showPremiumModal, setShowPremiumModal] = useState<boolean>(false);
    const [showCopiedNotification, setShowCopiedNotification] = useState<boolean>(false);
    const [showPremiumCopyModal, setShowPremiumCopyModal] = useState<boolean>(false);

    const fileTypes = ["SVG", "PNG", "JPG", "ICO"];

    const tags = [
        "Fingerprint", "Thumbprint", "Authentication", "Scan", "Touch ID", "Secure", "Security", "Biometric", "Identity", "Scanner", "Login", "Password", "Identification", "Access", "Touch", "ID", "Lock", "Interface", "Box", "Frame"
    ];

    // Analyze SVG to detect fill and stroke properties and extract original colors
    const analyzeSVG = async (svgUrl: string) => {
        try {
            const response = await fetch(svgUrl);
            const svgText = await response.text();

            // Check for fill attributes
            const hasFillAttr = svgText.includes('fill=') || svgText.includes('fill:');
            const hasStrokeAttr = svgText.includes('stroke=') || svgText.includes('stroke:');

            // Check for default fill (if no fill attribute, it's usually black)
            const hasDefaultFill = !svgText.includes('fill="none"') && !svgText.includes('fill:none');
            const hasDefaultStroke = !svgText.includes('stroke="none"') && !svgText.includes('stroke:none');

            setHasFill(hasFillAttr || hasDefaultFill);
            setHasStroke(hasStrokeAttr || hasDefaultStroke);

            // Extract original colors
            let originalFillColor = "#000000";
            let originalStrokeColor = "#000000";

            // Extract fill color
            if (hasFillAttr) {
                const fillMatch = svgText.match(/fill="([^"]*)"/) || svgText.match(/fill:([^;]*);/);
                if (fillMatch && fillMatch[1] && fillMatch[1] !== 'none') {
                    originalFillColor = fillMatch[1];
                }
            }

            // Extract stroke color
            if (hasStrokeAttr) {
                const strokeMatch = svgText.match(/stroke="([^"]*)"/) || svgText.match(/stroke:([^;]*);/);
                if (strokeMatch && strokeMatch[1] && strokeMatch[1] !== 'none') {
                    originalStrokeColor = strokeMatch[1];
                }
            }

            // Extract stroke width
            const strokeWidthMatch = svgText.match(/stroke-width="([^"]*)"/) || svgText.match(/stroke-width:([^;]*);/);
            if (strokeWidthMatch && strokeWidthMatch[1]) {
                const strokeWidth = parseFloat(strokeWidthMatch[1]);
                if (!isNaN(strokeWidth)) {
                    setStroke(strokeWidth);
                }
            }

            // Set the original colors as default
            setFillColor(originalFillColor);
            setStrokeColor(originalStrokeColor);
            setIsInitialized(true);

        } catch (error) {
            console.error('Error analyzing SVG:', error);
            // Default to both if analysis fails
            setHasFill(true);
            setHasStroke(true);
            setIsInitialized(true);
        }
    };

    // Analyze SVG when selectedIcon changes
    useEffect(() => {
        if (selectedIcon?.cloudinaryUrl) {
            analyzeSVG(selectedIcon.cloudinaryUrl);
        }
    }, [selectedIcon]);

    // Create custom SVG with applied colors and stroke
    const createCustomSVG = useCallback(async (svgUrl: string) => {
        try {
            const response = await fetch(svgUrl);
            let svgText = await response.text();

            // Apply fill color if the icon has fill
            if (hasFill) {
                // Replace existing fill attributes
                svgText = svgText.replace(/fill="[^"]*"/g, `fill="${fillColor}"`);
                svgText = svgText.replace(/fill:[^;]*;/g, `fill:${fillColor};`);

                // Add fill to elements that don't have it but should have fill
                const elementsToUpdate = ['path', 'circle', 'rect', 'polygon', 'ellipse', 'line', 'polyline'];
                elementsToUpdate.forEach(element => {
                    const regex = new RegExp(`<${element}(?![^>]*fill=)`, 'g');
                    svgText = svgText.replace(regex, `<${element} fill="${fillColor}"`);
                });
            } else {
                // Remove fill if hasFill is false
                svgText = svgText.replace(/fill="[^"]*"/g, 'fill="none"');
                svgText = svgText.replace(/fill:[^;]*;/g, 'fill:none;');
            }

            // Apply stroke color and width if the icon has stroke
            if (hasStroke) {
                // Replace existing stroke attributes
                svgText = svgText.replace(/stroke="[^"]*"/g, `stroke="${strokeColor}"`);
                svgText = svgText.replace(/stroke:[^;]*;/g, `stroke:${strokeColor};`);
                svgText = svgText.replace(/stroke-width="[^"]*"/g, `stroke-width="${stroke}"`);
                svgText = svgText.replace(/stroke-width:[^;]*;/g, `stroke-width:${stroke};`);

                // Add stroke to elements that don't have it but should have stroke
                const elementsToUpdate = ['path', 'circle', 'rect', 'polygon', 'ellipse', 'line', 'polyline'];
                elementsToUpdate.forEach(element => {
                    const regex = new RegExp(`<${element}(?![^>]*stroke=)`, 'g');
                    svgText = svgText.replace(regex, `<${element} stroke="${strokeColor}" stroke-width="${stroke}"`);
                });
            } else {
                // Remove stroke if hasStroke is false
                svgText = svgText.replace(/stroke="[^"]*"/g, 'stroke="none"');
                svgText = svgText.replace(/stroke:[^;]*;/g, 'stroke:none;');
                svgText = svgText.replace(/stroke-width="[^"]*"/g, '');
                svgText = svgText.replace(/stroke-width:[^;]*;/g, '');
            }

            setCustomSVG(svgText);
        } catch (error) {
            console.error('Error creating custom SVG:', error);
        }
    }, [hasFill, fillColor, hasStroke, strokeColor, stroke]);

    // Update custom SVG when colors or stroke change
    useEffect(() => {
        if (selectedIcon?.cloudinaryUrl && isInitialized) {
            createCustomSVG(selectedIcon.cloudinaryUrl);
        }
    }, [selectedIcon, fillColor, strokeColor, stroke, hasFill, hasStroke, isInitialized, createCustomSVG]);


    // Handle copy functionality
    const handleCopy = async () => {
        // Check if ICO format is selected - copying is disabled for ICO
        if (fileType === 'ICO') {
            console.log('Copy is disabled for ICO format');
            return;
        }

        // Check if premium icon and SVG format - show premium copy modal
        if (selectedIcon?.isPremium && fileType === 'SVG') {
            setShowPremiumCopyModal(true);
            return;
        }

        if (customSVG) {
            try {
                if (fileType === 'SVG') {
                // Copy SVG content to clipboard
                await navigator.clipboard.writeText(customSVG);
                console.log('Custom SVG copied to clipboard');
                    displayCopiedNotification();
                } else if (fileType === 'PNG' || fileType === 'JPG') {
                    // Convert to the selected format and copy
                    let blob: Blob;
                    if (fileType === 'PNG') {
                        blob = await svgToPng(customSVG, size);
                    } else {
                        blob = await svgToJpg(customSVG, size);
                    }
                    
                    await navigator.clipboard.write([
                        new ClipboardItem({ [blob.type]: blob })
                    ]);
                    console.log(`${fileType} copied to clipboard`);
                    displayCopiedNotification();
                }
            } catch (err) {
                console.error('Failed to copy:', err);
            }
        } else if (selectedIcon?.cloudinaryUrl) {
            try {
                if (fileType === 'SVG') {
                    // Copy original SVG
                    const response = await fetch(selectedIcon.cloudinaryUrl);
                    const svgText = await response.text();
                    await navigator.clipboard.writeText(svgText);
                    console.log('SVG copied to clipboard');
                    displayCopiedNotification();
                } else if (fileType === 'PNG' || fileType === 'JPG') {
                    // Convert and copy
                const response = await fetch(selectedIcon.cloudinaryUrl);
                    const svgText = await response.text();
                    
                    let blob: Blob;
                    if (fileType === 'PNG') {
                        blob = await svgToPng(svgText, size);
                    } else {
                        blob = await svgToJpg(svgText, size);
                    }
                    
                await navigator.clipboard.write([
                    new ClipboardItem({ [blob.type]: blob })
                ]);
                    console.log(`${fileType} copied to clipboard`);
                    displayCopiedNotification();
                }
            } catch (err) {
                console.error('Failed to copy icon:', err);
            }
        }
    };

    // Show copied notification
    const displayCopiedNotification = () => {
        setShowCopiedNotification(true);
        setTimeout(() => {
            setShowCopiedNotification(false);
        }, 2000);
    };

    // Add watermark to SVG (unused but kept for potential future use)
    // const addWatermarkToSVG = (svgString: string): string => {
    //     const watermark = `
    //     <g opacity="0.3" transform="translate(10, 10)">
    //         <text x="0" y="0" font-family="Arial, sans-serif" font-size="8" fill="#666666" text-anchor="start">
    //             figcons icons
    //         </text>
    //     </g>`;
    //     
    //     return svgString.replace('</svg>', `${watermark}</svg>`);
    // };

    // Add watermark to PNG
    const addWatermarkToPNG = async (canvas: HTMLCanvasElement): Promise<void> => {
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Add watermark text
        ctx.save();
        ctx.globalAlpha = 0.3;
        ctx.font = '8px Arial';
        ctx.fillStyle = '#666666';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';
        ctx.fillText('figcons icons', 10, 10);
        ctx.restore();
    };

    // Convert SVG to PNG
    const svgToPng = async (svgString: string, size: number): Promise<Blob> => {
        return new Promise((resolve, reject) => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            if (!ctx) {
                reject(new Error('Could not get canvas context'));
                return;
            }

            canvas.width = size;
            canvas.height = size;

            const img = document.createElement('img');
            const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
            const url = URL.createObjectURL(svgBlob);

            img.onload = async () => {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                ctx.drawImage(img, 0, 0, size, size);
                
                // Add watermark for premium icons
                if (selectedIcon?.isPremium) {
                    await addWatermarkToPNG(canvas);
                }
                
                canvas.toBlob((blob) => {
                    URL.revokeObjectURL(url);
                    if (blob) {
                        resolve(blob);
                    } else {
                        reject(new Error('Failed to convert to PNG'));
                    }
                }, 'image/png');
            };

            img.onerror = () => {
                URL.revokeObjectURL(url);
                reject(new Error('Failed to load SVG'));
            };

            img.src = url;
        });
    };

    // Convert SVG to JPG
    const svgToJpg = async (svgString: string, size: number): Promise<Blob> => {
        return new Promise((resolve, reject) => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            if (!ctx) {
                reject(new Error('Could not get canvas context'));
                return;
            }

            canvas.width = size;
            canvas.height = size;

            // Set white background for JPG
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            const img = document.createElement('img');
            const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
            const url = URL.createObjectURL(svgBlob);

            img.onload = async () => {
                ctx.drawImage(img, 0, 0, size, size);
                
                // Add watermark for premium icons
                if (selectedIcon?.isPremium) {
                    await addWatermarkToPNG(canvas);
                }
                
                canvas.toBlob((blob) => {
                    URL.revokeObjectURL(url);
                    if (blob) {
                        resolve(blob);
                    } else {
                        reject(new Error('Failed to convert to JPG'));
                    }
                }, 'image/jpeg', 0.9);
            };

            img.onerror = () => {
                URL.revokeObjectURL(url);
                reject(new Error('Failed to load SVG'));
            };

            img.src = url;
        });
    };

    // Convert SVG to ICO
    const svgToIco = async (svgString: string, size: number): Promise<Blob> => {
        return new Promise((resolve, reject) => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            if (!ctx) {
                reject(new Error('Could not get canvas context'));
                return;
            }

            // ICO files typically use 16x16, 32x32, 48x48, 64x64 sizes
            const icoSize = Math.min(size, 64);
            canvas.width = icoSize;
            canvas.height = icoSize;

            const img = document.createElement('img');
            const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
            const url = URL.createObjectURL(svgBlob);

            img.onload = async () => {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                ctx.drawImage(img, 0, 0, icoSize, icoSize);
                
                // Add watermark for premium icons
                if (selectedIcon?.isPremium) {
                    await addWatermarkToPNG(canvas);
                }
                
                canvas.toBlob((blob) => {
                    URL.revokeObjectURL(url);
                    if (blob) {
                        resolve(blob);
                    } else {
                        reject(new Error('Failed to convert to ICO'));
                    }
                }, 'image/png');
            };

            img.onerror = () => {
                URL.revokeObjectURL(url);
                reject(new Error('Failed to load SVG'));
            };

            img.src = url;
        });
    };



    // Handle download functionality
    const handleDownload = async () => {
        if (!selectedIcon || isDownloading) return;

        // Check if premium icon restrictions apply
        if (selectedIcon.isPremium && fileType === 'SVG') {
            setShowPremiumModal(true);
            return;
        }

        setIsDownloading(true);

        try {
            let blob: Blob;
            let filename: string;
            // let mimeType: string;

            const iconName = selectedIcon.name || 'icon';
            const svgContent = customSVG || await fetch(selectedIcon.cloudinaryUrl).then(res => res.text());

            switch (fileType) {
                case 'SVG':
                    blob = new Blob([svgContent], { type: 'image/svg+xml' });
                    filename = `${iconName}.svg`;
                    // mimeType = 'image/svg+xml';
                    break;

                case 'PNG':
                    blob = await svgToPng(svgContent, size);
                    filename = `${iconName}.png`;
                    // mimeType = 'image/png';
                    break;

                case 'JPG':
                    blob = await svgToJpg(svgContent, size);
                    filename = `${iconName}.jpg`;
                    // mimeType = 'image/jpeg';
                    break;

                case 'ICO':
                    blob = await svgToIco(svgContent, size);
                    filename = `${iconName}.ico`;
                    // mimeType = 'image/x-icon';
                    break;

                default:
                    throw new Error(`Unsupported file type: ${fileType}`);
            }

            // Download the file
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
            a.download = filename;
            a.style.display = 'none';
                document.body.appendChild(a);
                a.click();
            
            // Clean up
            setTimeout(() => {
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);
                setIsDownloading(false);
            }, 100);

            } catch (err) {
            console.error(`Failed to download ${fileType}:`, err);
            setIsDownloading(false);
            
            // Fallback to original SVG download
            try {
                const response = await fetch(selectedIcon.cloudinaryUrl);
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `${selectedIcon.name || 'icon'}.svg`;
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);
            } catch (fallbackErr) {
                console.error('Fallback download also failed:', fallbackErr);
            }
        }
    };


    return (
        <div ref={editorRef} className="w-full h-full flex flex-col gap-[20px]">
            <div ref={iconPreviewRef} className="flex flex-col gap-[16px]">
                <div className="flex justify-between items-center">
                    <div className="flex flex-col gap-[4px]">
                        <h1 className="text-[#0e0e0e] text-[18px] font-bold leading-[24px] capitalize">{selectedIcon?.name || 'Icon'}</h1>
                        <p className="text-[#666666] text-[12px] font-normal leading-[16px]">Customize your icon</p>
                    </div>
                    <div className="flex gap-[8px] items-center">
                        <button className="flex items-center gap-[6px] px-[12px] py-[6px] bg-[#f8f9fa] hover:bg-[#e9ecef] rounded-full transition-all duration-200 text-[#666666] hover:text-[#0e0e0e]">
                            <Svg icon="share" />
                            <span className="text-[12px] font-medium">Share</span>
                        </button>
                    </div>
                </div>
                <div className="border border-[#ececec] rounded-[20px] h-[200px] bg-gradient-to-br from-[#fafafa] to-[#f5f5f5] flex justify-center items-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-[#f0f0f0] opacity-50"></div>
                    {customSVG ? (
                        <div
                            className="flex items-center justify-center relative"
                            style={{
                                width: `${Math.min(size, 180)}px`,
                                height: `${Math.min(size, 180)}px`
                            }}
                            dangerouslySetInnerHTML={{ __html: customSVG }}
                        />
                    ) : selectedIcon?.cloudinaryUrl ? (
                        <div
                            className="flex items-center justify-center relative"
                            style={{
                                width: `${Math.min(size, 180)}px`,
                                height: `${Math.min(size, 180)}px`
                            }}
                        >
                            <Image
                                src={selectedIcon.cloudinaryUrl}
                                alt={selectedIcon.name || 'Icon'}
                                width={Math.min(size, 180)}
                                height={Math.min(size, 180)}
                                className="w-full h-full object-contain drop-shadow-sm"
                            />
                        </div>
                    ) : (
                        <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center relative">
                            <span className="text-gray-400 text-2xl">★</span>
                        </div>
                    )}
                </div>
                <div ref={buttonsRef} className="flex gap-[12px] items-center">
                    <button
                        onClick={handleCopy}
                        disabled={fileType === 'ICO'}
                        className={`flex-1 px-[16px] py-[12px] rounded-full text-[14px] font-semibold leading-[20px] h-[44px] transition-all duration-200 flex items-center justify-center gap-[8px] shadow-sm hover:shadow-md ${
                            fileType === 'ICO' 
                                ? 'bg-[#b7b7b7] text-[#ffffff] cursor-not-allowed' 
                                : 'bg-[#0e0e0e] text-[#ffffff] hover:bg-[#333333]'
                        }`}
                        title={fileType === 'ICO' ? 'Copy is not available for ICO format' : 'Copy to clipboard'}
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                        </svg>
                        Copy
                        {fileType === 'ICO' && <span className="ml-1 text-[10px]">🔒</span>}
                    </button>
                    <button
                        onClick={handleDownload}
                        disabled={isDownloading}
                        className={`flex-1 px-[16px] py-[12px] rounded-full text-[14px] font-semibold leading-[20px] h-[44px] transition-all duration-200 flex items-center justify-center gap-[8px] border shadow-sm hover:shadow-md ${
                            isDownloading 
                                ? 'bg-[#e9ecef] text-[#666666] cursor-not-allowed border-[#e9ecef]' 
                                : 'bg-[#f8f9fa] text-[#0e0e0e] hover:bg-[#e9ecef] border-[#e9ecef]'
                        }`}
                    >
                        {isDownloading ? (
                            <>
                                <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M21 12a9 9 0 11-6.219-8.56"/>
                                </svg>
                                Downloading...
                            </>
                        ) : (
                            <>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                            <polyline points="7,10 12,15 17,10"></polyline>
                            <line x1="12" y1="15" x2="12" y2="3"></line>
                        </svg>
                        Download
                            </>
                        )}
                    </button>
                </div>
            </div>
            <div ref={settingsRef} className="flex flex-col gap-[16px] bg-[#fafafa] rounded-[16px] p-[16px]">
                <div className="flex justify-between items-center">
                    <div className="flex flex-col gap-[4px]">
                        <h1 className="text-[#0e0e0e] text-[16px] font-bold leading-[20px]">Export Settings</h1>
                        <p className="text-[#666666] text-[12px] font-normal leading-[16px]">Customize your export</p>
                    </div>
                    <button
                        onClick={() => {
                            setFileType("SVG");
                            setSize(32);
                            setStroke(2);
                            setFillColor("#000000");
                            setStrokeColor("#000000");
                            // Re-analyze the SVG to get original colors
                            if (selectedIcon?.cloudinaryUrl) {
                                analyzeSVG(selectedIcon.cloudinaryUrl);
                            }
                        }}
                        className="text-[#666666] text-[12px] font-medium leading-[16px] hover:text-[#0e0e0e] cursor-pointer px-[12px] py-[6px] rounded-full hover:bg-[#e9ecef] transition-all duration-200"
                    >
                        Reset
                    </button>
                </div>

                <div className="flex justify-between items-center gap-[12px]">
                    <div className="w-[50%] flex flex-col gap-[8px]">
                        <p className="text-[#0e0e0e] text-[12px] font-semibold leading-[20px]">Size</p>
                        <div className="h-[44px] flex items-center justify-between bg-[#ffffff] rounded-full py-[4px] px-[12px] border border-[#e9ecef]">
                            <input
                                type="number"
                                value={size}
                                onChange={(e) => setSize(Number(e.target.value))}
                                className="bg-transparent text-[#0e0e0e] text-[12px] font-semibold leading-[20px] w-[60px] outline-none"
                                min="8"
                                max="512"
                            />
                            <p className="text-[#666666] text-[12px] font-medium leading-[20px]">px</p>
                        </div>
                    </div>
                    {hasStroke && (
                        <div className="w-[50%] flex flex-col gap-[8px]">
                            <p className="text-[#0e0e0e] text-[12px] font-semibold leading-[20px]">Stroke</p>
                            <div className="h-[44px] flex items-center justify-between bg-[#ffffff] rounded-full py-[4px] px-[12px] border border-[#e9ecef]">
                                <input
                                    type="number"
                                    value={stroke}
                                    onChange={(e) => setStroke(Number(e.target.value))}
                                    className="bg-transparent text-[#0e0e0e] text-[12px] font-semibold leading-[20px] w-[60px] outline-none"
                                    min="1"
                                    max="8"
                                />
                                <p className="text-[#666666] text-[12px] font-medium leading-[20px]">px</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Color Controls */}
                <div className="flex flex-col gap-[16px]">
                    {hasFill && (
                        <div className="flex flex-col gap-[8px]">
                            <p className="text-[#0e0e0e] text-[12px] font-semibold leading-[20px]">Fill Color</p>
                            <div className="flex items-center gap-[12px]">
                                <input
                                    type="color"
                                    value={fillColor}
                                    onChange={(e) => setFillColor(e.target.value)}
                                    className="w-[44px] h-[44px] rounded-full border border-[#e9ecef] cursor-pointer shadow-sm hover:shadow-md transition-all duration-200"
                                />
                                <input
                                    type="text"
                                    value={fillColor}
                                    onChange={(e) => setFillColor(e.target.value)}
                                    className="flex-1 h-[44px] bg-[#ffffff] rounded-full px-[12px] text-[#0e0e0e] text-[12px] font-semibold outline-none border border-[#e9ecef] focus:border-[#0e0e0e] transition-all duration-200"
                                    placeholder="#000000"
                                />
                            </div>
                        </div>
                    )}

                    {hasStroke && (
                        <div className="flex flex-col gap-[8px]">
                            <p className="text-[#0e0e0e] text-[12px] font-semibold leading-[20px]">Stroke Color</p>
                            <div className="flex items-center gap-[12px]">
                                <input
                                    type="color"
                                    value={strokeColor}
                                    onChange={(e) => setStrokeColor(e.target.value)}
                                    className="w-[44px] h-[44px] rounded-full border border-[#e9ecef] cursor-pointer shadow-sm hover:shadow-md transition-all duration-200"
                                />
                                <input
                                    type="text"
                                    value={strokeColor}
                                    onChange={(e) => setStrokeColor(e.target.value)}
                                    className="flex-1 h-[44px] bg-[#ffffff] rounded-full px-[12px] text-[#0e0e0e] text-[12px] font-semibold outline-none border border-[#e9ecef] focus:border-[#0e0e0e] transition-all duration-200"
                                    placeholder="#000000"
                                />
                            </div>
                        </div>
                    )}
                </div>
                <div className="flex flex-col gap-[12px]">
                    <h2 className="text-[#0e0e0e] text-[14px] font-semibold leading-[20px]">File type</h2>
                    <div className="w-full px-[6px] py-[6px] bg-[#ffffff] rounded-full h-[48px] flex border border-[#e9ecef]">
                        {fileTypes.map((type) => {
                            const isDisabled = selectedIcon?.isPremium && type === 'SVG';
                            return (
                            <button
                                key={type}
                                    onClick={() => !isDisabled && setFileType(type)}
                                    disabled={isDisabled}
                                    className={`flex-1 px-[12px] py-[8px] rounded-[8px] text-[12px] font-semibold leading-[20px] flex items-center justify-center transition-all duration-200 ${
                                        isDisabled 
                                            ? 'text-[#b7b7b7] cursor-not-allowed bg-[#f8f9fa]' 
                                            : fileType === type
                                    ? 'bg-[#0e0e0e] rounded-full text-[#ffffff] shadow-sm'
                                    : 'text-[#666666] hover:text-[#0e0e0e] hover:bg-[#f8f9fa]'
                                    }`}
                                    title={isDisabled ? 'Premium icons only available in PNG/PDF format' : ''}
                            >
                                {type}
                                    {isDisabled && <span className="ml-1 text-[10px]">🔒</span>}
                            </button>
                            );
                        })}
                    </div>
                </div>
            </div>
            <div ref={tagsRef} className="flex flex-col gap-[16px] bg-[#fafafa] rounded-[16px] p-[16px]">
                <div className="flex flex-col gap-[4px]">
                    <p className="text-[#0e0e0e] text-[14px] font-semibold leading-[20px]">Tags</p>
                    <p className="text-[#666666] text-[12px] font-normal leading-[16px]">Related keywords</p>
                </div>
                <div className="flex gap-[8px] justify-start flex-wrap">
                    {tags.map((tag) => (
                        <button key={tag} className="bg-[#ffffff] h-[36px] px-[12px] py-[6px] rounded-full text-[11px] font-medium leading-[16px] flex items-center justify-center border border-[#e9ecef] hover:bg-[#f8f9fa] transition-all duration-200 shadow-sm hover:shadow-md">
                            {tag}
                        </button>
                    ))}
                </div>
            </div>

            {/* Copied Notification */}
            {showCopiedNotification && (
                <div className="fixed top-4 right-4 bg-[#0e0e0e] text-white px-4 py-2 rounded-full shadow-lg z-[10001] animate-slideInRight">
                    <div className="flex items-center gap-2">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M20 6L9 17l-5-5"/>
                        </svg>
                        <span className="text-[14px] font-medium">Copied!</span>
                    </div>
                </div>
            )}

            {/* Premium Copy Modal */}
            {showPremiumCopyModal && (
                <div className="fixed inset-0 bg-black/50 z-[10000] flex items-center justify-center p-4">
                    <div className="bg-white rounded-[20px] p-6 max-w-md w-full shadow-2xl animate-scaleIn">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center">
                                <span className="text-white text-lg">👑</span>
                            </div>
                            <div>
                                <h3 className="text-[#0e0e0e] text-[18px] font-bold">Premium Icon Copy</h3>
                                <p className="text-[#666666] text-[12px]">SVG copy is restricted for premium icons</p>
                            </div>
                        </div>
                        
                        <div className="mb-6">
                            <p className="text-[#666666] text-[14px] leading-[20px] mb-4">
                                Premium icons cannot be copied as SVG to protect the source code. 
                                You can copy them in other formats or download them.
                            </p>
                            
                            <div className="bg-[#f8f9fa] rounded-[12px] p-4 border border-[#e9ecef]">
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="text-[#0e0e0e] text-[12px] font-semibold">Available copy formats:</span>
                                </div>
                                <div className="flex gap-2 flex-wrap">
                                    <span className="px-2 py-1 bg-[#b7b7b7] text-white text-[10px] rounded-full">SVG 🔒</span>
                                    <span className="px-2 py-1 bg-[#0e0e0e] text-white text-[10px] rounded-full">PNG</span>
                                    <span className="px-2 py-1 bg-[#0e0e0e] text-white text-[10px] rounded-full">JPG</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => {
                                    setShowPremiumCopyModal(false);
                                    setFileType('PNG');
                                }}
                                className="flex-1 px-4 py-3 bg-[#0e0e0e] text-white rounded-full text-[14px] font-semibold hover:bg-[#333333] transition-all duration-200"
                            >
                                Copy as PNG
                            </button>
                            <button
                                onClick={() => {
                                    setShowPremiumCopyModal(false);
                                    setFileType('JPG');
                                }}
                                className="flex-1 px-4 py-3 bg-[#0e0e0e] text-white rounded-full text-[14px] font-semibold hover:bg-[#333333] transition-all duration-200"
                            >
                                Copy as JPG
                            </button>
                        </div>
                        
                        <button
                            onClick={() => setShowPremiumCopyModal(false)}
                            className="w-full mt-3 px-4 py-2 bg-[#f8f9fa] text-[#666666] rounded-full text-[14px] font-semibold hover:bg-[#e9ecef] transition-all duration-200"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}

            {/* Premium Modal */}
            {showPremiumModal && (
                <div className="fixed inset-0 bg-black/50 z-[10000] flex items-center justify-center p-4">
                    <div className="bg-white rounded-[20px] p-6 max-w-md w-full shadow-2xl animate-scaleIn">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center">
                                <span className="text-white text-lg">👑</span>
                            </div>
                            <div>
                                <h3 className="text-[#0e0e0e] text-[18px] font-bold">Premium Icon</h3>
                                <p className="text-[#666666] text-[12px]">This icon requires premium access</p>
                            </div>
                        </div>
                        
                        <div className="mb-6">
                            <p className="text-[#666666] text-[14px] leading-[20px] mb-4">
                                Premium icons are only available in PNG, JPG, and ICO formats with watermarks. 
                                SVG downloads are restricted to protect premium content.
                            </p>
                            
                            <div className="bg-[#f8f9fa] rounded-[12px] p-4 border border-[#e9ecef]">
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="text-[#0e0e0e] text-[12px] font-semibold">Available formats:</span>
                                </div>
                                <div className="flex gap-2 flex-wrap">
                                    <span className="px-2 py-1 bg-[#b7b7b7] text-white text-[10px] rounded-full">SVG 🔒</span>
                                    <span className="px-2 py-1 bg-[#0e0e0e] text-white text-[10px] rounded-full">PNG</span>
                                    <span className="px-2 py-1 bg-[#0e0e0e] text-white text-[10px] rounded-full">JPG</span>
                                    <span className="px-2 py-1 bg-[#0e0e0e] text-white text-[10px] rounded-full">ICO</span>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <button
                                onClick={() => {
                                    setShowPremiumModal(false);
                                    setFileType('PNG');
                                }}
                                className="px-4 py-3 bg-[#0e0e0e] text-white rounded-full text-[14px] font-semibold hover:bg-[#333333] transition-all duration-200"
                            >
                                Export as PNG
                            </button>
                            <button
                                onClick={() => {
                                    setShowPremiumModal(false);
                                    setFileType('JPG');
                                }}
                                className="px-4 py-3 bg-[#0e0e0e] text-white rounded-full text-[14px] font-semibold hover:bg-[#333333] transition-all duration-200"
                            >
                                Export as JPG
                            </button>
                            <button
                                onClick={() => {
                                    setShowPremiumModal(false);
                                    setFileType('ICO');
                                }}
                                className="px-4 py-3 bg-[#0e0e0e] text-white rounded-full text-[14px] font-semibold hover:bg-[#333333] transition-all duration-200"
                            >
                                Export as ICO
                            </button>
                        </div>
                        
                        <button
                            onClick={() => setShowPremiumModal(false)}
                            className="w-full mt-3 px-4 py-2 bg-[#f8f9fa] text-[#666666] rounded-full text-[14px] font-semibold hover:bg-[#e9ecef] transition-all duration-200"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}