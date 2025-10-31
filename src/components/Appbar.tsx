"use client";
import Button from "@/commons/Button";
import Svg from "@/commons/Svg";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { authAPI } from "@/commons/Api";

export default function Appbar() {
    const pathname = usePathname();
    const router = useRouter();
    const dropdownRef = useRef<HTMLDivElement>(null);

    const Links = [
        { name: "Icons", href: "/icons" },
        { name: "Illustration", href: "/illustration", pending: true },
        { name: "Pricing", href: "/pricing" },
        { name: "Plugin", href: "/plugin" },
    ];

    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const [user, setUser] = useState<any>(null);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isLoadingUser, setIsLoadingUser] = useState(true);

    // Fetch user profile
    useEffect(() => {
        const fetchUser = async () => {
            try {
                const token = localStorage.getItem("token");
                if (token) {
                    const response = await authAPI.getProfile();
                    if (response.success && response.user) {
                        setUser(response.user);
                    }
                }
            } catch (error) {
                console.error("Error fetching user:", error);
                // Token might be invalid, clear it
                localStorage.removeItem("token");
            } finally {
                setIsLoadingUser(false);
            }
        };

        fetchUser();
    }, []);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        };

        if (isDropdownOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isDropdownOpen]);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    const handleLogout = () => {
        localStorage.removeItem("token");
        setUser(null);
        setIsDropdownOpen(false);
        router.push("/");
    };

    const toggleDropdown = () => {
        setIsDropdownOpen(!isDropdownOpen);
    };

    // Get user initials
    const getInitials = (name: string) => {
        if (!name) return "U";
        const parts = name.trim().split(" ");
        if (parts.length >= 2) {
            return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
        }
        return name.substring(0, 2).toUpperCase();
    };

    return (
        <>
            <div className="h-[64px] md:h-[44px] bg-[#7AE684] py-[12px] px-[16px] grid place-items-center">
                <p className="text-[12px] text-[#2D6332] text-center font-[600] leading-[20px]">
                    Your one-time or recurring contribution does a lot to keep figcons going.
                </p>
            </div>

            <nav
                className={`w-full h-[96px] py-[16px] md:py-[24px] px-[16px] md:px-[40px] flex justify-between items-center sticky top-0 z-50 ${isScrolled ? "bg-white/95 backdrop-blur-md shadow-sm" : "bg-white"
                    }`}
            >
                <div className="flex items-center gap-[12px]">
                    <button
                        onClick={toggleMenu}
                        className="bg-[#f6f6f6] w-[40px] h-[40px] rounded-full flex md:hidden items-center justify-center transition-transform duration-200"
                    >
                        <Svg icon="menu" />
                    </button>
                    <Link href="/">
                        <Svg icon="logo" />
                    </Link>
                </div>

                <div className="hidden md:flex items-center bg-[#F6F6F6] rounded-full h-[50px] px-[16px]">
                    {Links.map((items, index) => {
                        const isActive = pathname === items.href;
                        const isDisabled = items.pending === true;
                        return (
                            <Link
                                key={index}
                                href={items.href}
                                className={`${isDisabled ? `opacity-50 text-[#b7b7b7] pointer-events-none cursor-not-allowed text-[14px] py-[8px] px-[16px] leading-[20px]` : `${isActive ? "text-[#0e0e0e]" : "text-[#b7b7b7]"
                                    } text-[14px] py-[8px] px-[16px] leading-[20px] hover:text-[#0e0e0e] transition-all duration-300`} `}
                            >
                                {items.name}
                            </Link>
                        );
                    })}
                </div>

                {/* Desktop: Auth Buttons or Profile */}
                <div className="flex gap-[8px] items-center">
                    {isLoadingUser ? (
                        <div className="w-[40px] h-[40px] rounded-full bg-[#f6f6f6] animate-pulse"></div>
                    ) : user ? (
                        <div className="relative" ref={dropdownRef}>
                            <button
                                onClick={toggleDropdown}
                                className="flex items-center gap-[8px] hover:opacity-80 transition-opacity"
                            >
                                {user.profileImage ? (
                                    <div className="relative w-[40px] h-[40px] rounded-full border-2 border-[#E84C88] overflow-hidden">
                                        <Image
                                            src={user.profileImage}
                                            alt={user.username || "User"}
                                            width={40}
                                            height={40}
                                            className="object-cover"
                                            unoptimized
                                        />
                                    </div>
                                ) : (
                                    <div className="w-[40px] h-[40px] rounded-full bg-[#E84C88] flex items-center justify-center text-white font-bold text-[14px]">
                                        {getInitials(user.username || "User")}
                                    </div>
                                )}
                            </button>

                            {/* Dropdown Menu */}
                            {isDropdownOpen && (
                                <div className="absolute right-0 mt-[12px] w-[280px] bg-white rounded-[16px] shadow-lg border border-[#ececec] overflow-hidden z-50">
                                    {/* User Info */}
                                    <div className="p-[16px] border-b border-[#ececec]">
                                        <div className="flex items-center gap-[12px]">
                                            {user.profileImage ? (
                                                <div className="relative w-[48px] h-[48px] rounded-full overflow-hidden flex-shrink-0">
                                                    <Image
                                                        src={user.profileImage}
                                                        alt={user.username}
                                                        width={48}
                                                        height={48}
                                                        className="object-cover"
                                                        unoptimized
                                                    />
                                                </div>
                                            ) : (
                                                <div className="w-[48px] h-[48px] rounded-full bg-[#E84C88] flex items-center justify-center text-white font-bold text-[18px]">
                                                    {getInitials(user.username)}
                                                </div>
                                            )}
                                            <div className="flex-1 min-w-0">
                                                <p className="text-[#0e0e0e] font-[600] text-[14px] truncate">
                                                    {user.username}
                                                </p>
                                                <p className="text-[#b7b7b7] text-[12px] truncate">
                                                    {user.email}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Menu Items */}
                                    <div className="py-[8px]">
                                        <Link
                                            href="/profile"
                                            onClick={() => setIsDropdownOpen(false)}
                                            className="flex items-center gap-[12px] px-[16px] py-[12px] hover:bg-[#f6f6f6] transition-colors"
                                        >
                                            <svg className="w-[20px] h-[20px] text-[#0e0e0e]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                            </svg>
                                            <span className="text-[#0e0e0e] text-[14px] font-[500]">Profile</span>
                                        </Link>
                                        <button
                                            onClick={handleLogout}
                                            className="w-full flex items-center gap-[12px] px-[16px] py-[12px] hover:bg-[#f6f6f6] transition-colors text-left"
                                        >
                                            <svg className="w-[20px] h-[20px] text-[#E84C88]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                            </svg>
                                            <span className="text-[#E84C88] text-[14px] font-[500]">Logout</span>
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <>
                            <Button
                                text="Login"
                                className="w-[65px] md:w-[88px] text-[12px] md:text-[14px] bg-[#E84C88] text-[#ffffff] font-bold transition-transform duration-200"
                                href="/auth/signin"
                            />
                            <Button
                                text="Sign Up"
                                className="w-[77px] md:w-[104px] text-[12px] md:text-[14px] bg-[#f6f6f6] text-[#0e0e0e] font-bold transition-transform duration-200"
                                href="/auth/signup"
                            />
                        </>
                    )}
                </div>
            </nav>

            {/* Full Screen Mobile Menu */}
            <div
                className={`fixed inset-0 z-[60] md:hidden transition-all duration-500 ease-in-out ${isMenuOpen ? "opacity-100 visible" : "opacity-0 invisible"
                    }`}
            >
                {/* Backdrop */}
                <div
                    className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                    onClick={toggleMenu}
                />

                {/* Menu Content */}
                <div
                    className={`absolute top-0 left-0 h-full w-full max-w-sm bg-white shadow-2xl transform transition-transform duration-500 ease-in-out ${isMenuOpen ? "translate-x-0" : "-translate-x-full"
                        }`}
                >
                    <div className="flex flex-col h-full">
                        {/* Header */}
                        <div className="flex items-center justify-between p-6 border-b border-gray-200">
                            <Link href="/">
                                <Svg icon="logo" />
                            </Link>
                            <button
                                onClick={toggleMenu}
                                className="bg-[#f6f6f6] w-[40px] h-[40px] rounded-full flex md:hidden items-center justify-center transition-transform duration-200"
                            >
                                <Svg icon="menu" />
                            </button>
                        </div>

                        {/* Navigation Links */}
                        <div className="flex-1 flex flex-col justify-center px-6 space-y-8">
                            {Links.map((item, index) => {
                                const isActive = pathname === item.href;
                                return (
                                    <Link
                                        key={index}
                                        href={item.href}
                                        onClick={toggleMenu}
                                        className={`text-2xl font-semibold ${isActive
                                            ? "text-[#0e0e0e]"
                                            : "text-[#b7b7b7]"
                                            } hover:text-[#0e0e0e] transition-all duration-300 transform hover:translate-x-2`}
                                    >
                                        {item.name}
                                    </Link>
                                );
                            })}
                        </div>

                        {/* Mobile: Buttons or User Info */}
                        <div className="p-6 space-y-4 border-t border-gray-200">
                            {user ? (
                                <>
                                    {/* User Info */}
                                    <div className="flex items-center gap-[12px] p-[16px] bg-[#f6f6f6] rounded-[12px]">
                                        {user.profileImage ? (
                                            <div className="relative w-[48px] h-[48px] rounded-full overflow-hidden flex-shrink-0">
                                                <Image
                                                    src={user.profileImage}
                                                    alt={user.username}
                                                    width={48}
                                                    height={48}
                                                    className="object-cover"
                                                    unoptimized
                                                />
                                            </div>
                                        ) : (
                                            <div className="w-[48px] h-[48px] rounded-full bg-[#E84C88] flex items-center justify-center text-white font-bold text-[18px]">
                                                {getInitials(user.username)}
                                            </div>
                                        )}
                                        <div className="flex-1 min-w-0">
                                            <p className="text-[#0e0e0e] font-[600] text-[14px] truncate">
                                                {user.username}
                                            </p>
                                            <p className="text-[#b7b7b7] text-[12px] truncate">
                                                {user.email}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Profile Button */}
                                    <Button
                                        text="Profile"
                                        className="w-full h-12 text-[14px] bg-[#0e0e0e] text-[#ffffff] font-bold transition-transform duration-200"
                                        href="/profile"
                                    />

                                    {/* Logout Button */}
                                    <button
                                        onClick={handleLogout}
                                        className="w-full h-12 text-[14px] bg-[#E84C88] text-[#ffffff] font-bold rounded-full hover:bg-[#d43d75] transition-colors"
                                    >
                                        Logout
                                    </button>
                                </>
                            ) : (
                                <>
                                    <Button
                                        text="Login"
                                        className="w-full h-12 text-[14px] bg-[#0e0e0e] text-[#ffffff] font-bold transition-transform duration-200"
                                        href="/auth/signin"
                                    />
                                    <Button
                                        text="Sign Up"
                                        className="w-full h-12 text-[14px] bg-[#f6f6f6] text-[#0e0e0e] font-bold transition-transform duration-200"
                                        href="/auth/signup"
                                    />
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}