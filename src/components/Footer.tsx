"use client"
import Svg from "@/commons/Svg";
import Image from "next/image";

export default function Footer() {
    return (
        <div className="bg-[#f6f6f6] w-full min-h-[400px] md:h-[600px] px-4 md:px-14 py-6 md:py-10 flex flex-col justify-between items-center gap-8 md:gap-0 relative overflow-hidden">
            {/* Top Section */}
            <div className="grid grid-cols-2 md:grid-cols-4 max-w-7xl w-full gap-8 md:gap-12">
                <div className="flex flex-col gap-3 md:gap-6 min-w-0">
                    <h1 className="text-lg md:text-2xl font-bold leading-8 text-[#0e0e0e] hover:text-[#b7b7b7] transition-colors duration-300">For Designers</h1>
                    <div className="flex flex-col gap-3 md:gap-4">
                        <p className="text-sm md:text-base font-normal leading-6 text-[#0e0e0e] hover:text-[#b7b7b7] cursor-pointer">Figma Plugins</p>
                        <p className="text-sm md:text-base font-normal leading-6 text-[#0e0e0e] hover:text-[#b7b7b7] cursor-pointer">Preview in Figma</p>
                        <p className="text-sm md:text-base font-normal leading-6 text-[#0e0e0e] hover:text-[#b7b7b7] cursor-pointer">Figma Icon Library</p>
                        <p className="text-sm md:text-base font-normal leading-6 text-[#0e0e0e] hover:text-[#b7b7b7] cursor-pointer">Free Logos</p>
                    </div>
                </div>

                <div className="flex flex-col gap-3 md:gap-6 min-w-0">
                    <h1 className="text-lg md:text-2xl font-bold leading-8 text-[#0e0e0e] hover:text-[#b7b7b7] transition-colors duration-300">For Developers</h1>
                    <div className="flex flex-col gap-3 md:gap-4">
                        <p className="text-sm md:text-base font-normal leading-6 text-[#0e0e0e] hover:text-[#b7b7b7] cursor-pointer">Docs</p>
                        <p className="text-sm md:text-base font-normal leading-6 text-[#0e0e0e] hover:text-[#b7b7b7] cursor-pointer">React Icon Library</p>
                        <p className="text-sm md:text-base font-normal leading-6 text-[#0e0e0e] hover:text-[#b7b7b7] cursor-pointer">Free Icon Font</p>
                        <p className="text-sm md:text-base font-normal leading-6 text-[#0e0e0e] hover:text-[#b7b7b7] cursor-pointer">Packages</p>
                        <p className="text-sm md:text-base font-normal leading-6 text-[#0e0e0e] hover:text-[#b7b7b7] cursor-pointer">MCP Server</p>
                    </div>
                </div>

                <div className="flex flex-col gap-3 md:gap-6 min-w-0">
                    <h1 className="text-lg md:text-2xl font-bold leading-8 text-[#0e0e0e] hover:text-[#b7b7b7] transition-colors duration-300">Resources</h1>
                    <div className="flex flex-col gap-3 md:gap-4">
                        <p className="text-sm md:text-base font-normal leading-6 text-[#0e0e0e] hover:text-[#b7b7b7] cursor-pointer">UI8 Shop</p>
                        <p className="text-sm md:text-base font-normal leading-6 text-[#0e0e0e] hover:text-[#b7b7b7] cursor-pointer">FAQ&apos;s</p>
                        <p className="text-sm md:text-base font-normal leading-6 text-[#0e0e0e] hover:text-[#b7b7b7] cursor-pointer">Blog</p>
                    </div>
                </div>

                <div className="flex flex-col gap-3 md:gap-6 min-w-0">
                    <h1 className="text-lg md:text-2xl font-bold leading-8 text-[#0e0e0e] hover:text-[#b7b7b7] transition-colors duration-300">More</h1>
                    <div className="flex flex-col gap-3 md:gap-4">
                        <p className="text-sm md:text-base font-normal leading-6 text-[#0e0e0e] hover:text-[#b7b7b7] cursor-pointer">Affiliate 30%</p>
                        <p className="text-sm md:text-base font-normal leading-6 text-[#0e0e0e] hover:text-[#b7b7b7] cursor-pointer">Pricing</p>
                        <p className="text-sm md:text-base font-normal leading-6 text-[#0e0e0e] hover:text-[#b7b7b7] cursor-pointer">License</p>
                        <p className="text-sm md:text-base font-normal leading-6 text-[#0e0e0e] hover:text-[#b7b7b7] cursor-pointer">Author</p>
                        <p className="text-sm md:text-base font-normal leading-6 text-[#0e0e0e] hover:text-[#b7b7b7] cursor-pointer">Privacy Policy</p>
                        <p className="text-sm md:text-base font-normal leading-6 text-[#0e0e0e] hover:text-[#b7b7b7] cursor-pointer">Cookie Policy</p>
                        <p className="text-sm md:text-base font-normal leading-6 text-[#0e0e0e] hover:text-[#b7b7b7] cursor-pointer">Terms of Services</p>
                    </div>
                </div>
            </div>

            {/* Bottom Section */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-3 md:gap-0 z-50 w-full max-w-7xl">
                <p className="text-[#0E0E0E] font-semibold text-xs md:text-sm leading-5 text-center md:text-left">
                    © 2025 figcons.com. All rights reserved.
                </p>

                <div className="flex flex-col md:flex-row justify-center md:justify-end items-center gap-4 md:gap-8 w-full md:w-auto">
                    <div className="flex gap-4 md:gap-8 items-center">
                        <p className="text-[#0E0E0E] font-semibold text-xs md:text-sm leading-5 text-center">
                            <span className="text-[#b7b7b7]">Contact us →</span> info@figcons.com
                        </p>
                        <p className="text-[#0E0E0E] font-semibold text-xs md:text-sm leading-5 text-center">
                            Consent Preferences
                        </p>
                    </div>

                    <div className="flex gap-3 flex-wrap justify-center">
                        <Svg w="20px" h="20px" stroke="#0E0E0E" icon="youtube" className="hover:scale-110 transition-transform duration-300 cursor-pointer" />
                        <Svg w="20px" h="20px" stroke="#0E0E0E" icon="be" className="hover:scale-110 transition-transform duration-300 cursor-pointer" />
                        <Svg w="20px" h="20px" stroke="#0E0E0E" icon="figma" className="hover:scale-110 transition-transform duration-300 cursor-pointer" />
                        <Svg w="20px" h="20px" stroke="#0E0E0E" icon="Pluginweb" className="hover:scale-110 transition-transform duration-300 cursor-pointer" />
                        <Svg w="20px" h="20px" stroke="#0E0E0E" icon="instrgram" className="hover:scale-110 transition-transform duration-300 cursor-pointer" />
                    </div>
                </div>
            </div>

            {/* Background Image */}
            <Image
                src="/footerlogobottom.svg"
                alt="Footer"
                width={1000}
                height={1000}
                className="w-full h-auto absolute bottom-0 left-0 pointer-events-none object-cover"
            />
        </div>
    );
}