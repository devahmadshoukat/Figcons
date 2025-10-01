export default function Total() {
    return (
        <div className="md:grid flex flex-wrap md:grid-cols-3 w-[100%]">
            <div className="w-[50%] md:w-auto flex gap-[16px] justify-center items-end px-[15px] md:px-0 py-[40px] border-r border-[#ececec]">
                <h1 className="text-[64px] text-[#0e0e0e] font-bold leading-[72px]">4+</h1>
                <p className="w-auto md:w-[136px] text-[16px] text-[#b7b7b7] font-normal leading-[24px] pt-[10px]">Years of design experience</p>
            </div>
            <div className="w-[50%] md:w-auto flex gap-[16px] justify-center items-end px-[15px] md:px-0 py-[40px] md:border-r border-[#ececec]">
                <h1 className="text-[64px] text-[#0e0e0e] font-bold leading-[72px]">12</h1>
                <p className="w-auto md:w-[136px] text-[16px] text-[#b7b7b7] font-normal leading-[24px] pt-[10px]">Full-time icon designers</p>
            </div>
            <div className="w-[100%] md:w-auto flex gap-[16px] justify-center items-end px-[15px] md:px-0 py-[40px] border-t border-[#ececec] md:border-t-0">
                <h1 className="text-[64px] text-[#0e0e0e] font-bold leading-[72px]">64</h1>
                <p className="w-auto md:w-[136px] text-[16px] text-[#b7b7b7] font-normal leading-[24px] pt-[10px]">Pro vector icon sets</p>
            </div>
        </div>
    )
}