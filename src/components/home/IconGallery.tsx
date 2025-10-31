import Svg from "@/commons/Svg";
import Image from "next/image";

export default function IconGallery() {
    return (
        <div className="w-[100%] flex md:flex-row flex-col">
            <div className="w-[100%] flex justify-center items-center md:w-[50%] h-[600px] border-r border-[#ececec] px-[16px] md:px-[56px] py-[32px] md:py-[64px]">
                <Image
                    src="/IconGallery.svg"
                    alt="Icon Gallery"
                    width={1000}
                    height={1000}
                    className="w-[456px] h-[504px] pointer-events-none"
                />
            </div>
            <div className="relative w-[100%] md:w-[50%] flex flex-col gap-[56px] px-[16px] md:px-[56px] py-[32px] md:py-[64px]">
                <p className="text-[#0e0e0e] font-bold text-[16px] leading-[24px]">
                    Stop wasting time searching for the right icons, Illustration, Emojis{" "}
                    <span className="text-[#454545] font-normal text-[16px] leading-[24px]">
                        Access Streamline Pro and unlock 300,000+ high-quality, consistent, and fully customizable assets.
                    </span>
                </p>
                <div className="flex justify-center items-center gap-[8px]">
                    <button className="px-[16px] py-[8px] rounded-full 2xl:w-fit w-[45%] md:w-[200px] h-[50px] leading-[20px] bg-[#E84C88] text-[#ffffff] font-bold md:text-[16px] text-[14px] flex gap-[8px] items-center justify-center">
                        <Svg icon="energy" stroke="white" /> Browse Icons
                    </button>
                    <button className="px-[16px] py-[8px] rounded-full 2xl:w-fit w-[65%] md:w-[282px] h-[50px] leading-[20px] bg-[#7AE684] text-[#2D6332] font-bold md:text-[16px] text-[14px] flex gap-[8px] items-center justify-center">
                        <Svg icon="star" stroke="#2D6332" /> Start with Free icons
                    </button>
                </div>
                <div className="relative md:absolute -bottom-[80px] md:-bottom-[10%] 2xl:right-[15%] -right-[50%] md:-right-[5%] translate-x-[-50%] flex flex-col justify-center items-center">
                    <p className="w-[223px] rotate-[-10deg] Kalam text-[24px] leading-[32px] font-normal text-center">
                        Discover why creators love our icons
                    </p>
                    <Svg icon="arrowbottom" />
                </div>
            </div>
        </div>
    );
}