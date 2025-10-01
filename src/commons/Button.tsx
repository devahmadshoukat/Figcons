"use client"
export default function Button({ text, className }: { text?: string; className?: string; }) {
    return (<button className={`px-[16px] py-[8px] rounded-full h-[40px] md:h-[48px] leading-[20px] ${className}`}>{text}</button>)
}