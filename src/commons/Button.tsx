"use client"
import Link from "next/link";

export default function Button({ text, className, href }: { text?: string; className?: string; href?: string }) {
    const baseClasses = `px-[16px] py-[8px] rounded-full h-[40px] md:h-[48px] leading-[20px] ${className || ''}`;
    if (href) return <Link href={href} className={baseClasses}>{text}</Link>

    return <button className={baseClasses}>{text}</button>
}