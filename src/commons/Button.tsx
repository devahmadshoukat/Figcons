"use client"
import Link from "next/link";

export default function Button({ text, className, href }: { text?: string; className?: string; href?: string }) {
    return (
        <Link href={href || ""}>
            <button className={`px-[16px] py-[8px] rounded-full h-[40px] md:h-[48px] leading-[20px] ${className}`}>{text}</button>
        </Link>
    )
}