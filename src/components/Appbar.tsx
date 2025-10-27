"use client"
import Button from "@/commons/Button";
import Svg from "@/commons/Svg";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/commons/AuthContext";
import Image from "next/image";

export default function Appbar() {
    const pathname = usePathname();
    const { user, isAuthenticated, logout } = useAuth();

    const Links = [
        { name: "Icons", href: "/icons" },
        { name: "Illustration", href: "/illustration" },
        { name: "Pricing", href: "/pricing" },
        { name: "Plugin", href: "/plugin" },
    ]

    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const [isVisible, setIsVisible] = useState(false);
    const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);

    useEffect(() => {
        // Initial animation
        const timer = setTimeout(() => {
            setIsVisible(true);
        }, 200);

        // Scroll effect
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50);
        };

        // Close dropdown when clicking outside
        const handleClickOutside = (event: MouseEvent) => {
            if (isProfileDropdownOpen) {
                const target = event.target as HTMLElement;
                if (!target.closest('.profile-dropdown-container')) {
                    setIsProfileDropdownOpen(false);
                }
            }
        };

        window.addEventListener('scroll', handleScroll);
        document.addEventListener('mousedown', handleClickOutside);

        return () => {
            clearTimeout(timer);
            window.removeEventListener('scroll', handleScroll);
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isProfileDropdownOpen]);

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    const toggleProfileDropdown = () => {
        setIsProfileDropdownOpen(!isProfileDropdownOpen);
    };

    return (
        <>
            <div className={`h-[64px] md:h-[44px] bg-[#f6f6f6] py-[12px] px-[16px] grid place-items-center transition-all duration-600 ease-out ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}>
                <p className="text-[12px] text-center font-[600] leading-[20px]">Your one-time or recurring contribution does a lot to keep figcons going.</p>
            </div>
            <nav className={`w-[100%] h-[96px] py-[16px] md:py-[24px] px-[16px] md:px-[40px] flex justify-between items-center sticky top-0 z-50 transition-all duration-600 ease-out ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}
             ${isScrolled ? 'bg-white/95 backdrop-blur-md shadow-sm' : 'bg-white'}`} style={{ transitionDelay: isVisible ? '150ms' : '0ms' }}>
                <div className={`flex items-center gap-[12px] transition-all duration-600 ease-out ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'}`}
                    style={{ transitionDelay: isVisible ? '300ms' : '0ms' }}>
                    <button
                        onClick={toggleMenu}
                        className="bg-[#f6f6f6] w-[40px] h-[40px] rounded-full flex md:hidden items-center justify-center hover:scale-105 transition-transform duration-200"
                    >
                        <Svg icon="menu" />
                    </button>
                    <Link href="/">
                        <Svg icon="logo" />
                    </Link>
                </div>
                <div className="hidden md:flex items-center">
                    {Links.map((items, index) => {
                        const isActive = pathname === items.href;
                        return (
                            <Link
                                key={index}
                                href={items.href}
                                className={`${isActive ? 'text-[#0e0e0e]' : 'text-[#b7b7b7]'} text-[14px] py-[8px] px-[16px] leading-[20px] hover:text-[#0e0e0e] transition-all duration-300 hover:scale-105 transform ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'}`}
                                style={{ transitionDelay: isVisible ? `${400 + index * 50}ms` : '0ms' }}
                            >
                                {items.name}
                            </Link>
                        )
                    })}
                </div>
                <div className={`flex gap-[8px] items-center transition-all duration-600 ease-out ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4'}`}
                    style={{ transitionDelay: isVisible ? '500ms' : '0ms' }}>
                    {isAuthenticated ? (
                        <div className="relative profile-dropdown-container">
                            {user?.isPremium && (
                                <span className="px-2 py-1 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-[10px] font-bold rounded-full mr-2">
                                    PREMIUM
                                </span>
                            )}
                            <button
                                onClick={toggleProfileDropdown}
                                className="relative"
                            >
                                {user?.profileImage ? (
                                    <Image
                                        src={user.profileImage}
                                        alt={user.username || "User"}
                                        width={32}
                                        height={32}
                                        className="w-8 h-8 rounded-full hover:ring-2 hover:ring-[#0e0e0e] transition-all duration-200"
                                    />
                                ) : (
                                    <div className="w-8 h-8 bg-[#0e0e0e] rounded-full flex items-center justify-center hover:ring-2 hover:ring-[#0e0e0e] transition-all duration-200">
                                        <span className="text-white text-[12px] font-bold">
                                            {user?.username?.charAt(0).toUpperCase()}
                                        </span>
                                    </div>
                                )}
                            </button>

                            {/* Profile Dropdown */}
                            {isProfileDropdownOpen && (
                                <div className="absolute right-0 top-full mt-2 w-fit bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                                    <div className="px-4 py-2 border-b border-gray-100">
                                        <p className="text-[14px] font-[600] text-[#0e0e0e]">{user?.username}</p>
                                        <p className="text-[12px] text-[#B7B7B7]">{user?.email}</p>
                                        {user?.isPremium && (
                                            <span className="inline-block px-2 py-1 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-[10px] font-bold rounded-full mt-1">
                                                PREMIUM
                                            </span>
                                        )}
                                    </div>
                                    <Link href="/profile">
                                        <button
                                            onClick={() => {
                                                setIsProfileDropdownOpen(false);
                                                // Add profile page navigation here if needed
                                            }}
                                            className="w-full px-4 py-2 text-left text-[14px] text-[#0e0e0e] hover:bg-gray-50 transition-colors"
                                        >
                                            Profile
                                        </button>
                                    </Link>
                                    <button
                                        onClick={() => {
                                            setIsProfileDropdownOpen(false);
                                            logout();
                                        }}
                                        className="w-full px-4 py-2 text-left text-[14px] text-red-600 hover:bg-red-50 transition-colors"
                                    >
                                        Logout
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <>
                            <Button text="Login" className="w-[65px] md:w-[88px] text-[12px] md:text-[14px] bg-[#0e0e0e] text-[#ffffff] font-bold hover:scale-105 transition-transform duration-200" href="/auth/signin" />
                            <Button text="Sign Up" className="w-[77px] md:w-[104px] text-[12px] md:text-[14px] bg-[#f6f6f6] text-[#0e0e0e] font-bold hover:scale-105 transition-transform duration-200" href="/auth/signup" />
                        </>
                    )}
                </div>
            </nav>

            {/* Full Screen Mobile Menu */}
            <div className={`fixed inset-0 z-[60] md:hidden transition-all duration-500 ease-in-out ${isMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`}>
                {/* Backdrop */}
                <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={toggleMenu} />

                {/* Menu Content */}
                <div className={`absolute top-0 left-0 h-full w-full max-w-sm bg-white shadow-2xl transform transition-transform duration-500 ease-in-out ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                    <div className="flex flex-col h-full">
                        {/* Header */}
                        <div className="flex items-center justify-between p-6 border-b border-gray-200">
                            <Link href="/">
                                <Svg icon="logo" />
                            </Link>
                            <button
                                onClick={toggleMenu}
                                className="bg-[#f6f6f6] w-[40px] h-[40px] rounded-full flex md:hidden items-center justify-center hover:scale-105 transition-transform duration-200"
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
                                        className={`text-2xl font-semibold ${isActive ? 'text-[#0e0e0e]' : 'text-[#b7b7b7]'} hover:text-[#0e0e0e] transition-all duration-300 transform hover:translate-x-2 ${isMenuOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
                                        style={{ transitionDelay: isMenuOpen ? `${index * 100}ms` : '0ms' }}
                                    >
                                        {item.name}
                                    </Link>
                                )
                            })}
                        </div>

                        {/* Buttons */}
                        <div className={`p-6 space-y-4 border-t border-gray-200 ${isMenuOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
                            style={{ transitionDelay: isMenuOpen ? '500ms' : '0ms' }}>
                            {isAuthenticated ? (
                                <>
                                    {user?.isPremium && (
                                        <div className="text-center">
                                            <span className="px-3 py-1 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-[12px] font-bold rounded-full">
                                                PREMIUM USER
                                            </span>
                                        </div>
                                    )}
                                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                        {user?.profileImage ? (
                                            <Image
                                                src={user.profileImage}
                                                alt={user.username || "User"}
                                                width={40}
                                                height={40}
                                                className="w-10 h-10 rounded-full"
                                            />
                                        ) : (
                                            <div className="w-10 h-10 bg-[#0e0e0e] rounded-full flex items-center justify-center">
                                                <span className="text-white text-[14px] font-bold">
                                                    {user?.username?.charAt(0).toUpperCase()}
                                                </span>
                                            </div>
                                        )}
                                        <div>
                                            <p className="text-[14px] font-[600] text-[#0e0e0e]">{user?.username}</p>
                                            <p className="text-[12px] text-[#B7B7B7]">{user?.email}</p>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <button
                                            onClick={() => {
                                                setIsMenuOpen(false);
                                                // Add profile page navigation here if needed
                                            }}
                                            className="w-full h-12 text-[14px] bg-[#f6f6f6] text-[#0e0e0e] font-bold hover:scale-105 transition-transform duration-200 rounded-full"
                                        >
                                            Profile
                                        </button>
                                        <button
                                            onClick={() => {
                                                setIsMenuOpen(false);
                                                logout();
                                            }}
                                            className="w-full h-12 text-[14px] bg-red-50 text-red-600 font-bold hover:scale-105 transition-transform duration-200 rounded-full"
                                        >
                                            Logout
                                        </button>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <Button
                                        text="Login"
                                        className="w-full h-12 text-[14px] bg-[#0e0e0e] text-[#ffffff] font-bold hover:scale-105 transition-transform duration-200"
                                        href="/auth/signin"
                                    />
                                    <Button
                                        text="Sign Up"
                                        className="w-full h-12 text-[14px] bg-[#f6f6f6] text-[#0e0e0e] font-bold hover:scale-105 transition-transform duration-200"
                                        href="/auth/signup"
                                    />
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}