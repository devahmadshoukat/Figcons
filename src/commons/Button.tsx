"use client"
import Link from "next/link";

export default function Button({ text, className, href, onClick }: { text?: string; className?: string; href?: string; onClick?: () => void }) {
    const baseClasses = `px-[16px] py-[8px] rounded-full h-[40px] md:h-[48px] leading-[20px] flex items-center justify-center ${className || ''}`;
    
    if (href) return <Link href={href} className={baseClasses}>{text}</Link>
    if (onClick) return <button onClick={onClick} className={baseClasses}>{text}</button>

    return <button className={baseClasses}>{text}</button>
}