import Image from "next/image";

export default function Hero() {
    return (
        <div className="w-[100%] flex flex-col items-center justify-center">
            <div className="w-[100%] mx-auto md:w-[902px] flex flex-col gap-[16px] md:gap-[32px] text-center items-center justify-center">
                <div className="flex gap-[12px] md:gap-[16px] items-center">
                    <Image width={1440} height={1000} className="w-[112px] md:w-[140px] h-[40px]" src="/herocollection.svg" alt="Hero" />
                    <p className="text-[#0E0E0E] leading-[20px] text-[11px] md:text-[14px] font-[600]">10k+ User in Over Website Every Month</p>
                </div>
                <p className="text-[#0e0e0e] text-[34px] md:text-[64px] leading-[40px] md:leading-[72px] font-[800]">Design assets that ship fast <span className="text-[#dbdbdb]">Icons, Illustrations, Emojis.</span></p>
                <p className="text-[#B7B7B7] text-[12px] md:text-[16px] leading-[20px] md:leading-[24px] font-[400]">Pixel‑perfect SVGs and vectors for web, iOS, and Android — free to start, pro when you scale.</p>
            </div>
            <div className="mx-auto flex justify-center justify-center w-[100%]">
                <div className="w-[100%] grid grid-cols-2 md:grid-cols-4 md:gap-0 gap-[32px] mt-[56px] mx-auto">
                    <div className="flex flex-col gap-[8px] justify-start items-center text-center">
                        <p className="text-[#0e0e0e] text-[30px] md:text-[30px] leading-[40px] font-bold">3200+</p>
                        <p className="w-[100%] md:w-[160px] 2xl:w-[200px] text-[#b7b7b7] text-[12px] md:text-[14px] leading-[20px] font-[400]">Assets available right now (Icons, Illustrations & Emojis).</p>
                    </div>
                    <div className="flex flex-col gap-[8px] justify-start items-center text-center">
                        <p className="text-[#0e0e0e] text-[30px] md:text-[30px] leading-[40px] font-bold">10x Faster</p>
                        <p className="w-[100%] md:w-[160px] 2xl:w-[200px] text-[#b7b7b7] text-[12px] md:text-[14px] leading-[20px] font-[400]">Asset delivery & integration.</p>
                    </div>
                    <div className="flex flex-col gap-[8px] justify-start items-center text-center">
                        <p className="text-[#0e0e0e] text-[30px] md:text-[30px] leading-[40px] font-bold">150K+</p>
                        <p className="w-[100%] md:w-[160px] 2xl:w-[200px] text-[#b7b7b7] text-[12px] md:text-[14px] leading-[20px] font-[400]">Monthly downloads across React, Vue & Flutter.</p>
                    </div>
                    <div className="flex flex-col gap-[8px] justify-start items-center text-center">
                        <p className="text-[#0e0e0e] text-[30px] md:text-[30px] leading-[40px] font-bold">5K+</p>
                        <p className="w-[100%] md:w-[160px] 2xl:w-[200px] text-[#b7b7b7] text-[12px] md:text-[14px] leading-[20px] font-[400]">Designers & developers who starred us on GitHub.</p>
                    </div>
                </div>
            </div>
        </div>
    )
}