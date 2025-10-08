"use client"
import Svg from "@/commons/Svg";
import Appbar from "@/components/Appbar";
import Footer from "@/components/Footer";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function Profile() {
    const [isNotificationOn, setIsNotificationOn] = useState(true);
    const [activeSection, setActiveSection] = useState("profile-details");

    // Password visibility states
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // Navigation items data
    const navigationItems = [
        { id: "profile-details", label: "Profile", icon: "profile" },
        { id: "security", label: "Security", icon: "security" },
        { id: "social-profile", label: "Social Profile", icon: "social" },
        { id: "notifications", label: "Notifications", icon: "notifications" },
        { id: "delete-account", label: "Delete Account", icon: "deleteAccount" }
    ];

    // Form data state
    const [formData, setFormData] = useState({
        displayName: "Johan Joy",
        email: "johan@example.com",
        location: "Faisalabad, Punjab, Pakistan",
        currentPassword: "johndoe123",
        newPassword: "johndoe",
        confirmPassword: "johndoe",
        website: "https://yoursite.com",
        dribbble: "x.com/username",
        behance: "behance.com/username",
        linkedin: "linkedin.com/username",
        instagram: "Instagram.com/username",
        facebook: "facebook.com/username"
    });

    // Handle form input changes
    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    // Scroll detection to update active section
    useEffect(() => {
        const handleScroll = () => {
            const sections = ['profile-details', 'security', 'social-profile', 'notifications', 'delete-account'];
            const scrollPosition = window.scrollY + 200; // Offset for better detection

            for (const sectionId of sections) {
                const element = document.getElementById(sectionId);
                if (element) {
                    const rect = element.getBoundingClientRect();
                    const elementTop = rect.top + window.scrollY;
                    const elementBottom = elementTop + rect.height;

                    if (scrollPosition >= elementTop && scrollPosition < elementBottom) {
                        setActiveSection(sectionId);
                        break;
                    }
                }
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return <>
        <Appbar />
        <div className="px-4 md:px-[122px] py-4 md:py-[80px] flex flex-col md:flex-row gap-4 md:gap-[80px] w-[100%] max-w-[1440px] mx-auto">
            <div className="hidden md:flex flex-col gap-[32px] sticky top-[120px] self-start">
                <h1 className="text-[#0E0E0E] font-[700] text-[32px] leading-[48px]">Account Settings</h1>
                <div className="flex flex-col gap-[12px]">
                    {navigationItems.map((item) => (
                        <Link key={item.id} href={`#${item.id}`}>
                            <button className={`w-[200px] h-[48px] font-[700] py-[10px] px-[16px] rounded-[12px] flex items-center gap-[8px] text-[14px] leading-[20px] transition-all duration-300 ${activeSection === item.id
                                ? "bg-[#0E0E0E] text-[#ffffff]"
                                : "bg-[#f6f6f6] text-[#B7B7B7] hover:bg-[#e5e5e5]"
                                }`}>
                                <Svg icon={item.icon as any} stroke={activeSection === item.id ? "#ffffff" : "#b7b7b7"} />
                                {item.label}
                            </button>
                        </Link>
                    ))}
                </div>
            </div>
            <div className="w-full md:w-[480px] flex flex-col gap-[40px] rounded-[12px] overflow-y-auto scroll-smooth pt-[20px] md:pt-[80px]">
                {/* profile detial section */}
                <div id="profile-details" className="w-[100%] flex flex-col gap-[12px]">
                    <h1 className="text-[#0E0E0E] font-[700] text-[18px] leading-[32px]">Profile Details</h1>
                    <div className="flex items-center justify-center gap-[32px]">
                        <div className="w-[120px] h-[120px] rounded-full bg-[#f6f6f6]" />
                        <p className="w-[328px] text-[#B7B7B7] font-[400] text-[12px] leading-[20px]">Update your avatar by clicking the image 288x288px size recommended in PNG or JPG format only.</p>
                    </div>
                </div>
                <div className="flex flex-col gap-[24px]">
                    <div className="flex flex-col gap-[12px]">
                        <h1 className="text-[#0E0E0E] font-[600] text-[14px] leading-[20px]">Display Name</h1>
                        <input
                            className="outline-none bg-[#f6f6f6] h-[48px] py-[10px] px-[16px] rounded-[12px] font-[600] text-[14px]"
                            value={formData.displayName}
                            onChange={(e) => handleInputChange('displayName', e.target.value)}
                        />
                    </div>
                    <div className="flex flex-col md:flex-row gap-[16px] w-[100%]">
                        <div className="flex flex-col gap-[12px] w-[100%]">
                            <h1 className="text-[#0E0E0E] font-[600] text-[14px] leading-[20px]">Email</h1>
                            <input
                                className="outline-none bg-[#f6f6f6] h-[48px] py-[10px] px-[16px] rounded-[12px] font-[600] text-[14px]"
                                value={formData.email}
                                onChange={(e) => handleInputChange('email', e.target.value)}
                            />
                        </div>
                        <div className="flex flex-col gap-[12px] w-[100%]">
                            <h1 className="text-[#0E0E0E] font-[600] text-[14px] leading-[20px]">Location</h1>
                            <input
                                className="outline-none bg-[#f6f6f6] h-[48px] py-[10px] px-[16px] rounded-[12px] font-[600] text-[14px]"
                                value={formData.location}
                                onChange={(e) => handleInputChange('location', e.target.value)}
                            />
                        </div>
                    </div>
                </div>
                {/* security section */}
                <div id="security" className="flex flex-col gap-[12px] w-[100%]">
                    <h1 className="text-[#0E0E0E] font-[700] text-[18px] leading-[32px]">Security</h1>
                    <div className="flex flex-col gap-[24px]">
                        <div className="flex flex-col gap-[12px] w-[100%]">
                            <h1 className="text-[#0E0E0E] font-[600] text-[14px] leading-[20px]">Current Password</h1>
                            <div className="relative">
                                <input
                                    className="outline-none bg-[#f6f6f6] h-[48px] py-[10px] px-[16px] pr-[48px] rounded-[12px] font-[600] text-[14px] w-full"
                                    type={showCurrentPassword ? "text" : "password"}
                                    value={formData.currentPassword}
                                    onChange={(e) => handleInputChange('currentPassword', e.target.value)}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                    className="absolute right-[12px] top-1/2 transform -translate-y-1/2 p-1 hover:bg-[#e5e5e5] rounded-[6px] transition-all duration-200 group"
                                >
                                    <div className="relative w-4 h-4 overflow-hidden">
                                        <div className={`absolute inset-0 transition-all duration-400 ease-in-out transform ${showCurrentPassword
                                            ? 'opacity-0 scale-50 rotate-45 translate-y-1'
                                            : 'opacity-100 scale-100 rotate-0 translate-y-0'
                                            }`}>
                                            <Svg
                                                icon="eyeOpen"
                                                w="16"
                                                h="16"
                                                stroke="#B7B7B7"
                                                className="group-hover:scale-110 transition-all duration-300"
                                            />
                                        </div>
                                        <div className={`absolute inset-0 transition-all duration-400 ease-in-out transform ${showCurrentPassword
                                            ? 'opacity-100 scale-100 rotate-0 translate-y-0'
                                            : 'opacity-0 scale-50 -rotate-45 -translate-y-1'
                                            }`}>
                                            <Svg
                                                icon="eyeClosed"
                                                w="16"
                                                h="16"
                                                stroke="#B7B7B7"
                                                className="group-hover:scale-110 transition-all duration-300"
                                            />
                                        </div>
                                    </div>
                                </button>
                            </div>
                        </div>
                        <div className="flex flex-col gap-[12px] w-[100%]">
                            <h1 className="text-[#0E0E0E] font-[600] text-[14px] leading-[20px]">New Password</h1>
                            <div className="relative">
                                <input
                                    className="outline-none bg-[#f6f6f6] h-[48px] py-[10px] px-[16px] pr-[48px] rounded-[12px] font-[600] text-[14px] w-full"
                                    type={showNewPassword ? "text" : "password"}
                                    value={formData.newPassword}
                                    onChange={(e) => handleInputChange('newPassword', e.target.value)}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowNewPassword(!showNewPassword)}
                                    className="absolute right-[12px] top-1/2 transform -translate-y-1/2 p-1 hover:bg-[#e5e5e5] rounded-[6px] transition-all duration-200 group"
                                >
                                    <div className="relative w-4 h-4 overflow-hidden">
                                        <div className={`absolute inset-0 transition-all duration-400 ease-in-out transform ${showNewPassword
                                            ? 'opacity-0 scale-50 rotate-45 translate-y-1'
                                            : 'opacity-100 scale-100 rotate-0 translate-y-0'
                                            }`}>
                                            <Svg
                                                icon="eyeOpen"
                                                w="16"
                                                h="16"
                                                stroke="#B7B7B7"
                                                className="group-hover:scale-110 transition-all duration-300"
                                            />
                                        </div>
                                        <div className={`absolute inset-0 transition-all duration-400 ease-in-out transform ${showNewPassword
                                            ? 'opacity-100 scale-100 rotate-0 translate-y-0'
                                            : 'opacity-0 scale-50 -rotate-45 -translate-y-1'
                                            }`}>
                                            <Svg
                                                icon="eyeClosed"
                                                w="16"
                                                h="16"
                                                stroke="#B7B7B7"
                                                className="group-hover:scale-110 transition-all duration-300"
                                            />
                                        </div>
                                    </div>
                                </button>
                            </div>
                        </div>
                        <div className="flex flex-col gap-[12px] w-[100%]">
                            <h1 className="text-[#0E0E0E] font-[600] text-[14px] leading-[20px]">Confirm New Password</h1>
                            <div className="relative">
                                <input
                                    className="outline-none bg-[#f6f6f6] h-[48px] py-[10px] px-[16px] pr-[48px] rounded-[12px] font-[600] text-[14px] w-full"
                                    type={showConfirmPassword ? "text" : "password"}
                                    value={formData.confirmPassword}
                                    onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute right-[12px] top-1/2 transform -translate-y-1/2 p-1 hover:bg-[#e5e5e5] rounded-[6px] transition-all duration-200 group"
                                >
                                    <div className="relative w-4 h-4 overflow-hidden">
                                        <div className={`absolute inset-0 transition-all duration-400 ease-in-out transform ${showConfirmPassword
                                            ? 'opacity-0 scale-50 rotate-45 translate-y-1'
                                            : 'opacity-100 scale-100 rotate-0 translate-y-0'
                                            }`}>
                                            <Svg
                                                icon="eyeOpen"
                                                w="16"
                                                h="16"
                                                stroke="#B7B7B7"
                                                className="group-hover:scale-110 transition-all duration-300"
                                            />
                                        </div>
                                        <div className={`absolute inset-0 transition-all duration-400 ease-in-out transform ${showConfirmPassword
                                            ? 'opacity-100 scale-100 rotate-0 translate-y-0'
                                            : 'opacity-0 scale-50 -rotate-45 -translate-y-1'
                                            }`}>
                                            <Svg
                                                icon="eyeClosed"
                                                w="16"
                                                h="16"
                                                stroke="#B7B7B7"
                                                className="group-hover:scale-110 transition-all duration-300"
                                            />
                                        </div>
                                    </div>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
                {/* social profile section */}
                <div id="social-profile" className="flex flex-col gap-[12px] w-[100%]">
                    <h1 className="text-[#0E0E0E] font-[700] text-[18px] leading-[32px]">Security</h1>
                    <div className="flex flex-col md:flex-row gap-[16px]">
                        <div className="flex flex-col gap-[12px] w-[100%]">
                            <h1 className="text-[#0E0E0E] font-[600] text-[14px] leading-[20px]">Website</h1>
                            <input
                                className="outline-none bg-[#f6f6f6] h-[48px] py-[10px] px-[16px] rounded-[12px] font-[600] text-[14px] placeholder:text-[#B7B7B7]"
                                placeholder="https://yoursite.com"
                                value={formData.website}
                                onChange={(e) => handleInputChange('website', e.target.value)}
                            />
                        </div>
                        <div className="flex flex-col gap-[12px] w-[100%]">
                            <h1 className="text-[#0E0E0E] font-[600] text-[14px] leading-[20px]">Dribbble</h1>
                            <input
                                className="outline-none bg-[#f6f6f6] h-[48px] py-[10px] px-[16px] rounded-[12px] font-[600] text-[14px] placeholder:text-[#B7B7B7]"
                                placeholder="x.com/username"
                                value={formData.dribbble}
                                onChange={(e) => handleInputChange('dribbble', e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="flex flex-col md:flex-row gap-[16px]">
                        <div className="flex flex-col gap-[12px] w-[100%]">
                            <h1 className="text-[#0E0E0E] font-[600] text-[14px] leading-[20px]">Behance</h1>
                            <input
                                className="outline-none bg-[#f6f6f6] h-[48px] py-[10px] px-[16px] rounded-[12px] font-[600] text-[14px] placeholder:text-[#B7B7B7]"
                                placeholder="behance.com/username"
                                value={formData.behance}
                                onChange={(e) => handleInputChange('behance', e.target.value)}
                            />
                        </div>
                        <div className="flex flex-col gap-[12px] w-[100%]">
                            <h1 className="text-[#0E0E0E] font-[600] text-[14px] leading-[20px]">LinkedIn</h1>
                            <input
                                className="outline-none bg-[#f6f6f6] h-[48px] py-[10px] px-[16px] rounded-[12px] font-[600] text-[14px] placeholder:text-[#B7B7B7]"
                                placeholder="linkedin.com/username"
                                value={formData.linkedin}
                                onChange={(e) => handleInputChange('linkedin', e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="flex flex-col md:flex-row gap-[16px]">
                        <div className="flex flex-col gap-[12px] w-[100%]">
                            <h1 className="text-[#0E0E0E] font-[600] text-[14px] leading-[20px]">Instagram</h1>
                            <input
                                className="outline-none bg-[#f6f6f6] h-[48px] py-[10px] px-[16px] rounded-[12px] font-[600] text-[14px] placeholder:text-[#B7B7B7]"
                                placeholder="Instagram.com/username"
                                value={formData.instagram}
                                onChange={(e) => handleInputChange('instagram', e.target.value)}
                            />
                        </div>
                        <div className="flex flex-col gap-[12px] w-[100%]">
                            <h1 className="text-[#0E0E0E] font-[600] text-[14px] leading-[20px]">Facebook</h1>
                            <input
                                className="outline-none bg-[#f6f6f6] h-[48px] py-[10px] px-[16px] rounded-[12px] font-[600] text-[14px] placeholder:text-[#B7B7B7]"
                                placeholder="facebook.com/username"
                                value={formData.facebook}
                                onChange={(e) => handleInputChange('facebook', e.target.value)}
                            />
                        </div>
                    </div>
                </div>
                {/* notifications section */}
                <div id="notifications" className="flex flex-col gap-[12px] w-[100%]">
                    <h1 className="text-[#0E0E0E] font-[700] text-[18px] leading-[32px]">Notification</h1>
                    <div className="flex justify-between items-center w-[100%]">
                        <p className="text-[#0E0E0E] font-[600] text-[14px] leading-[20px]">Turn on your notification</p>
                        <svg className="cursor-pointer transition-all duration-300 ease-in-out" onClick={() => setIsNotificationOn(!isNotificationOn)} width="64" height="28" viewBox="0 0 64 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <rect width="64" height="28" rx="14" fill={isNotificationOn ? "#34C759" : "#E5E5E5"} className="transition-all duration-300 ease-in-out" />
                            <rect x={isNotificationOn ? "23" : "2"} y="2" width="39" height="24" rx="12" fill="white" className="transition-all duration-300 ease-in-out" />
                        </svg>
                    </div>
                </div>
                {/* logout section */}
                <div className="w-[100%]">
                    <button className="w-[100%] h-[48px] bg-[#f6f6f6] text-[#0E0E0E] font-[700] rounded-[12px] text-[14px] leading-[20px]">
                        Log Out
                    </button>
                </div>
                {/* delete account section */}
                <div id="delete-account" className="w-[100%] flex flex-col gap-[12px]">
                    <h1 className="text-[#0E0E0E] font-[700] text-[18px] leading-[32px]">Delete Account</h1>
                    <button className="w-[100%] h-[48px] bg-[#0e0e0e] text-[#f6f6f6] font-[700] rounded-[12px] text-[14px] leading-[20px]">
                        Delete Account
                    </button>
                </div>
            </div>
        </div>
        <Footer />
    </>;
}