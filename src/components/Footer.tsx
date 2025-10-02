import Svg from "@/commons/Svg";
import Image from "next/image";

export default function Footer() {
    return (
        <div className="bg-[#f6f6f6] w-[100%] md:h-[600px] px-[16px] md:px-[56px] py-[24px] md:py-[40px] flex flex-col justify-between items-center gap-[53px] md:gap-[0px] relative">
            <div className="grid md:grid-cols-4 grid-cols-2 2xl:w-[80%] gap-[54px] md:gap-[0px] w-[100%]">
                <div className="flex flex-col gap-[12px] md:gap-[24px]">
                    <h1 className="text-[18px] md:text-[24px] font-bold leading-[32px] text-[#0e0e0e] ">For Designers</h1>
                    <div className="flex flex-col gap-[12px] md:gap-[16px]">
                        <p className="text-[14px] md:text-[16px] font-normal leading-[24px] text-[#0e0e0e]">Figma Plugins</p>
                        <p className="text-[14px] md:text-[16px] font-normal leading-[24px] text-[#0e0e0e]">Preview in Figma</p>
                        <p className="text-[14px] md:text-[16px] font-normal leading-[24px] text-[#0e0e0e]">Figma Icon Library</p>
                        <p className="text-[14px] md:text-[16px] font-normal leading-[24px] text-[#0e0e0e]">Free Logos</p>
                    </div>
                </div>
                <div className="flex flex-col gap-[12px] md:gap-[24px]">
                    <h1 className="text-[18px] md:text-[24px] font-bold leading-[32px] text-[#0e0e0e] ">For Developers</h1>
                    <div className="flex flex-col gap-[12px] md:gap-[16px]">
                        <p className="text-[14px] md:text-[16px] font-normal leading-[24px] text-[#0e0e0e]">Docs</p>
                        <p className="text-[14px] md:text-[16px] font-normal leading-[24px] text-[#0e0e0e]">React Icon Library</p>
                        <p className="text-[14px] md:text-[16px] font-normal leading-[24px] text-[#0e0e0e]">Free Icon Font</p>
                        <p className="text-[14px] md:text-[16px] font-normal leading-[24px] text-[#0e0e0e]">Packages</p>
                        <p className="text-[14px] md:text-[16px] font-normal leading-[24px] text-[#0e0e0e]">MCP Server</p>
                    </div>
                </div>
                <div className="flex flex-col gap-[12px] md:gap-[24px]">
                    <h1 className="text-[18px] md:text-[24px] font-bold leading-[32px] text-[#0e0e0e] ">Resources</h1>
                    <div className="flex flex-col gap-[12px] md:gap-[16px]">
                        <p className="text-[14px] md:text-[16px] font-normal leading-[24px] text-[#0e0e0e]">UI8 Shop</p>
                        <p className="text-[14px] md:text-[16px] font-normal leading-[24px] text-[#0e0e0e]">FAQ’s</p>
                        <p className="text-[14px] md:text-[16px] font-normal leading-[24px] text-[#0e0e0e]">Blog</p>
                    </div>
                </div>
                <div className="flex flex-col gap-[12px] md:gap-[24px]">
                    <h1 className="text-[18px] md:text-[24px] font-bold leading-[32px] text-[#0e0e0e] ">More</h1>
                    <div className="flex flex-col gap-[12px] md:gap-[16px]">
                        <p className="text-[14px] md:text-[16px] font-normal leading-[24px] text-[#0e0e0e]">Affiliate 30%</p>
                        <p className="text-[14px] md:text-[16px] font-normal leading-[24px] text-[#0e0e0e]">Pricing</p>
                        <p className="text-[14px] md:text-[16px] font-normal leading-[24px] text-[#0e0e0e]">License</p>
                        <p className="text-[14px] md:text-[16px] font-normal leading-[24px] text-[#0e0e0e]">Author</p>
                        <p className="text-[14px] md:text-[16px] font-normal leading-[24px] text-[#0e0e0e]">Privacy Policy</p>
                        <p className="text-[14px] md:text-[16px] font-normal leading-[24px] text-[#0e0e0e]">Cookie Policy</p>
                        <p className="text-[14px] md:text-[16px] font-normal leading-[24px] text-[#0e0e0e]">Terms of Services</p>
                    </div>
                </div>
            </div>
            <div className="flex md:flex-row flex-col justify-between items-center gap-[12px] z-[99999] w-[100%]">
                <p className="text-[#0E0E0E] font-[600] md:text-[14px] text-[12px] leading-[20px]">© 2025 figcons.com. All rights reserved.</p>
                <div className="flex md:flex-row flex-col justify-between items-center gap-[32px]">
                    <div className="flex gap-[32px]">
                        <p className="text-[#0E0E0E] font-[600] md:text-[14px] text-[12px] leading-[20px]"><span className="text-[#b7b7b7]">Contact us →</span> info@figcons.com</p>
                        <p className="text-[#0E0E0E] font-[600] md:text-[14px] text-[12px] leading-[20px]">Consent Preferences</p>
                    </div>
                    <div className="flex gap-[12px]">
                        <Svg w="20px" h="20px" stroke="#0E0E0E" icon="youtube" />
                        <Svg w="20px" h="20px" stroke="#0E0E0E" icon="be" />
                        <Svg w="20px" h="20px" stroke="#0E0E0E" icon="figma" />
                        <Svg w="20px" h="20px" stroke="#0E0E0E" icon="Pluginweb" />
                        <Svg w="20px" h="20px" stroke="#0E0E0E" icon="instrgram" />
                    </div>
                </div>

            </div>
            <Image src="/footerlogobottom.svg" alt="Footer" width={1000} height={1000} className="w-[100%] absolute bottom-0 left-0 pointer-events-none" />
        </div>
    )
}