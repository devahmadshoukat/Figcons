"use client"
import Button from "@/commons/Button";
import Svg from "@/commons/Svg";
import Link from "next/link";

export default function Appbar() {
    const Links = [
        { name: "Icons", href: "/" },
        { name: "Illustration", href: "/" },
        { name: "Emojis", href: "/" },
        { name: "Pricing", href: "/" },
        { name: "Plugin", href: "/" },
    ]
    return (
        <>
            <div className="h-[64px] md:h-[44px] bg-[#f6f6f6] py-[12px] px-[16px] grid place-items-center">
                <p className="text-[12px] text-center font-[600] leading-[20px]">Your one-time or recurring contribution does a lot to keep figcons going.</p>
            </div>
            <nav className="w-[100%] h-[96px] py-[16px] md:py-[24px] px-[16px] md:px-[40px] flex justify-between items-center">
                <div className="flex items-center gap-[12px]">
                    <button className="bg-[#f6f6f6] w-[40px] h-[40px] rounded-full flex md:hidden items-center justify-center">
                        <Svg icon="menu" />
                    </button>
                    <Svg icon="logo" />
                </div>
                <div className="hidden md:flex items-center">
                    {Links.map((items, index) => {
                        return <Link key={index} href={items.href} className="text-[#b7b7b7] text-[14px] py-[8px] px-[16px] leading-[20px]">{items.name}</Link>
                    })}
                </div>
                <div className="flex gap-[8px] items-center">
                    <Button text="Login" className="w-[65px] md:w-[88px] text-[12px] md:text-[14px] bg-[#0e0e0e] text-[#ffffff] font-bold" />
                    <Button text="Sign Up" className="w-[77px] md:w-[104px] text-[12px] md:text-[14px] bg-[#f6f6f6] text-[#0e0e0e] font-bold" />
                </div>
            </nav>
        </>
    )
}