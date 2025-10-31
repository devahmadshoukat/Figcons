import Svg from "@/commons/Svg";

export default function Filters() {
    return (
        <div className="w-[100%] border-t border-[#ececec] py-[24px]">
            <div className="flex md:flex-row flex-col justify-start items-start md:justify-between gap-[20px] items-center md:px-[40px] px-[16px]">
                <div className="flex md:flex-row flex-col gap-[8px] md:gap-[20px] items-start md:items-center">
                    <h1 className="text-[#0e0e0e] font-bold leading-[40px] text-[12px] md:text-[14px]">Style</h1>
                    <div className="flex gap-[8px] items-center">
                        <button className="bg-[#0e0e0e] text-[#ffffff] font-bold text-[12px] md:text-[14px] leading-[20px] h-[48px] py-[8px] md:py-[8px] px-[12px] md:px-[20px] rounded-full ">Stroke</button>
                        <button className="bg-[#f6f6f6] text-[#b7b7b7] font-semibold text-[12px] md:text-[14px] leading-[20px] h-[48px] py-[8px] md:py-[8px] px-[12px] md:px-[20px] rounded-full ">Solid</button>
                        <button className="bg-[#f6f6f6] text-[#b7b7b7] font-semibold text-[12px] md:text-[14px] leading-[20px] h-[48px] py-[8px] md:py-[8px] px-[12px] md:px-[20px] rounded-full ">Duotone</button>
                        <button className="bg-[#f6f6f6] text-[#b7b7b7] font-semibold text-[12px] md:text-[14px] leading-[20px] h-[48px] py-[8px] md:py-[8px] px-[12px] md:px-[20px] rounded-full ">Two tone</button>
                        <button className="bg-[#f6f6f6] text-[#b7b7b7] font-semibold text-[12px] md:text-[14px] leading-[20px] h-[48px] py-[8px] md:py-[8px] px-[12px] md:px-[20px] rounded-full ">Bulk</button>
                    </div>
                </div>
                <div className="flex md:flex-row flex-col gap-[8px] md:gap-[20px] items-start md:items-center">
                    <h1 className="text-[#0e0e0e] font-bold leading-[40px] text-[12px] md:text-[14px]">Colors</h1>
                    <div className="flex gap-[8px] items-center">
                        <input type="color" className="w-[48px] h-[48px] rounded-full bg-[#0e0e0e]" name="" id="" />
                        <div className="w-[48px] h-[48px] rounded-full bg-[#f6f6f6] flex justify-center items-center" >
                            <Svg icon="undo" />
                        </div>
                        <div className="w-[48px] h-[48px] rounded-full bg-[#f6f6f6] flex justify-center items-center" >
                            <Svg icon="redo" />
                        </div>
                    </div>
                </div>
                <div className="bg-[#f6f6f6] px-[12px] py-[8px] w-[100%] md:w-[400px] h-[48px] rounded-full flex gap-[8px] items-center">
                    <Svg icon="search" />
                    <input className="w-[100%] outline-none bg-transparent text-[12px] md:text-[14px] text-[#000000] placeholder:text-[#b7b7b7]" type="text" placeholder="Search 40,000+ icons..." />
                </div>
            </div>
        </div>
    )
}