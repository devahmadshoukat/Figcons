"use client";
import Svg from "@/commons/Svg";
import { useRef, useState } from "react";

interface IconsEditorProps {
    selectedIcon: string;
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

    const fileTypes = ["SVG", "PNG", "JSX", "PDF"];

    const tags = [
        "Fingerprint", "Thumbprint", "Authentication", "Scan", "Touch ID", "Secure", "Security", "Biometric", "Identity", "Scanner", "Login", "Password", "Identification", "Access", "Touch", "ID", "Lock", "Interface", "Box", "Frame"
    ];


    return (
        <div ref={editorRef} className="w-[100%] md:w-[252px] 2xl:w-[300px] 3xl:w-[350px] w-full h-full flex flex-col gap-[16px] md:px-0 px-[16px] py-[16px] md:py-0 md:pb-[8px]">
            <div ref={iconPreviewRef} className="flex flex-col gap-[12px]">
                <div className="px-[8px] py-[8px] flex justify-between items-center">
                    <h1 className="text-[#0e0e0e] text-[16px] font-bold leading-[24px] capitalize">{selectedIcon}</h1>
                    <div className="flex gap-[4px] items-center">
                        <Svg icon="share" />
                        <p className="text-[#454545] text-[14px] font-normal leading-[20px]">Share</p>
                    </div>
                </div>
                <div className="border border-[#ececec] rounded-[20px] h-[213px] 2xl:h-[250px] 3xl:h-[280px] flex justify-center items-center">
                    <Svg w={`${Math.min(size, 190)}px`} h={`${Math.min(size, 190)}px`} icon={selectedIcon as keyof typeof import("@/public/assets").assets} />
                </div>
                <div ref={buttonsRef} className="flex gap-[8px] items-center">
                    <button className="px-[12px] py-[8px] w-[50%] rounded-full bg-[#0e0e0e] text-[#ffffff] text-[12px] font-bold leading-[20px] h-[40px] 2xl:h-[48px] 3xl:h-[52px]">Copy</button>
                    <button className="px-[12px] py-[8px] w-[50%] rounded-full bg-[#f6f6f6] text-[#0e0e0e] text-[12px] font-bold leading-[20px] h-[40px] 2xl:h-[48px] 3xl:h-[52px]">Download</button>
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