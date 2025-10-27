"use client"
import { BACKEND_URL } from "@/commons/Api";
import { useAuth } from "@/commons/AuthContext";
import ProtectedRoute from "@/commons/ProtectedRoute";
import Svg from "@/commons/Svg";
import Appbar from "@/components/Appbar";
import Footer from "@/components/Footer";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Profile() {
    const { user, isAuthenticated, updateUser } = useAuth();
    const router = useRouter();
    const [isNotificationOn, setIsNotificationOn] = useState(true);
    const [activeSection, setActiveSection] = useState("profile-details");
    const [isProcessingPayment, setIsProcessingPayment] = useState(false);
    const [paymentError, setPaymentError] = useState<string | null>(null);
    const [paymentSuccess, setPaymentSuccess] = useState(false);
    const [subscriptionInfo, setSubscriptionInfo] = useState<{ status: string; expiryDate?: string; type?: string; startDate?: string; stripeSessionId?: string; lastPaymentDate?: string } | null>(null);
    const [timeUntilExpiry, setTimeUntilExpiry] = useState<string>('');

    // Password visibility states
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // Navigation items data
    const navigationItems = [
        { id: "profile-details", label: "Profile", icon: "profile" as const },
        { id: "security", label: "Security", icon: "security" as const },
        { id: "pro-upgrade", label: "Pro Upgrade", icon: "security" as const },
        { id: "social-profile", label: "Social Profile", icon: "social" as const },
        { id: "notifications", label: "Notifications", icon: "notifications" as const },
        { id: "delete-account", label: "Delete Account", icon: "deleteAccount" as const }
    ];

    // Form data state - using user data from auth context
    const [formData, setFormData] = useState({
        displayName: user?.username || "",
        email: user?.email || "",
        location: "Faisalabad, Punjab, Pakistan",
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
        website: "https://yoursite.com",
        dribbble: "x.com/username",
        behance: "behance.com/username",
        linkedin: "linkedin.com/username",
        instagram: "Instagram.com/username",
        facebook: "facebook.com/username"
    });


    // Update form data when user data changes
    useEffect(() => {
        if (user) {
            setFormData(prev => ({
                ...prev,
                displayName: user.username || "",
                email: user.email || ""
            }));
        }
    }, [user, updateUser]);

    // Refresh user data on component mount to ensure latest info
    useEffect(() => {
        const refreshUserData = async () => {
            if (typeof window === 'undefined') return; // Skip on server side

            const token = localStorage.getItem('authToken');
            if (token && user) {
                try {
                    const response = await fetch(`${BACKEND_URL}/api/auth/profile`, {
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    });

                    if (response.ok) {
                        const data = await response.json();
                        if (data.success && data.user) {
                            updateUser(data.user);
                        }
                    }
                } catch (error) {
                    console.error('Error refreshing user data:', error);
                }
            }
        };

        refreshUserData();
    }, [updateUser, user]);

    // Calculate time until subscription expiry
    const calculateTimeUntilExpiry = (expiryDate: string) => {
        if (!expiryDate) return '';

        const now = new Date();
        const expiry = new Date(expiryDate);
        const diff = expiry.getTime() - now.getTime();

        if (diff <= 0) return 'Expired';

        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

        if (days > 0) {
            return `${days}d ${hours}h ${minutes}m`;
        } else if (hours > 0) {
            return `${hours}h ${minutes}m`;
        } else {
            return `${minutes}m`;
        }
    };

    // Update subscription info and timer
    useEffect(() => {
        if (user?.subscription) {
            setSubscriptionInfo(user.subscription);
            setTimeUntilExpiry(calculateTimeUntilExpiry(user?.subscription?.expiryDate || ''));

            // Update timer every minute
            const interval = setInterval(() => {
                setTimeUntilExpiry(calculateTimeUntilExpiry(user?.subscription?.expiryDate || ''));
            }, 60000);

            return () => clearInterval(interval);
        }
    }, [user?.subscription, updateUser]);

    // Handle payment success callback from Stripe Checkout
    useEffect(() => {
        const handlePaymentCallback = async () => {
            if (typeof window === 'undefined') return;

            const urlParams = new URLSearchParams(window.location.search);
            const paymentStatus = urlParams.get('payment');
            const sessionId = urlParams.get('session_id');

            if (paymentStatus === 'success' && sessionId) {
                console.log('Payment success callback, session ID:', sessionId);

                const token = localStorage.getItem('authToken');
                if (token) {
                    try {
                        const response = await fetch(`${BACKEND_URL}/api/payment/confirm-checkout-session`, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': `Bearer ${token}`
                            },
                            body: JSON.stringify({ sessionId })
                        });

                        const data = await response.json();
                        if (data.success) {
                            setPaymentSuccess(true);
                            updateUser(data.user);
                            // Clean up URL parameters
                            window.history.replaceState({}, document.title, window.location.pathname);
                        } else {
                            setPaymentError(data.message || 'Payment confirmation failed');
                        }
                    } catch (error) {
                        console.error('Payment confirmation error:', error);
                        setPaymentError('Failed to confirm payment');
                    }
                }
            } else if (paymentStatus === 'cancelled') {
                setPaymentError('Payment was cancelled');
                // Clean up URL parameters
                window.history.replaceState({}, document.title, window.location.pathname);
            }
        };

        handlePaymentCallback();
    }, [updateUser]);

    // Handle form input changes
    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    // Handle Pro upgrade payment
    const handleProUpgrade = async () => {
        // Check authentication first
        if (!isAuthenticated || !user) {
            setPaymentError("Please login first");
            // Redirect to login page
            router.push('/auth/signin');
            return;
        }

        if (user.isPremium) {
            setPaymentError("You are already a Pro user");
            return;
        }

        setIsProcessingPayment(true);
        setPaymentError(null);

        try {
            // Get token from localStorage (using correct key from AuthContext)
            const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
            console.log('User authentication check:', {
                isAuthenticated,
                user: user ? 'User exists' : 'No user',
                token: token ? 'Token exists' : 'No token',
                userId: user?.id
            });

            if (!token) {
                setPaymentError("Please login first");
                setIsProcessingPayment(false);
                router.push('/auth/signin');
                return;
            }

            // Create checkout session
            console.log('Creating checkout session with token:', token ? 'Token exists' : 'No token');

            const response = await fetch(`${BACKEND_URL}/api/payment/create-checkout-session`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });

            console.log('Checkout session response status:', response.status);

            if (!response.ok) {
                const errorText = await response.text();
                console.error('Checkout session error:', errorText);
                throw new Error(`HTTP ${response.status}: ${errorText}`);
            }

            const data = await response.json();
            console.log('Checkout session data:', data);

            if (!data.success) {
                throw new Error(data.message || 'Failed to create checkout session');
            }

            // Redirect to Stripe Checkout
            console.log('Redirecting to Stripe Checkout:', data.url);
            window.location.href = data.url;

        } catch (error) {
            console.error('Payment error:', error);
            setPaymentError(error instanceof Error ? error.message : 'Payment failed');
        } finally {
            setIsProcessingPayment(false);
        }
    };

    // Scroll detection to update active section
    useEffect(() => {
        const handleScroll = () => {
            const sections = ['profile-details', 'security', 'pro-upgrade', 'social-profile', 'notifications', 'delete-account'];
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

    return (
        <ProtectedRoute requireAuth={true}>
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
                                    <Svg icon={item.icon} stroke={activeSection === item.id ? "#ffffff" : "#b7b7b7"} />
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
                        <div className="flex items-center justify-start gap-[32px]">
                            <div className="w-[120px] h-[120px] rounded-full bg-[#f6f6f6] flex items-center justify-center overflow-hidden">
                                {user?.profileImage ? (
                                    <Image
                                        src={user.profileImage}
                                        alt={user.username || "User"}
                                        width={120}
                                        height={120}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <span className="text-[#0E0E0E] text-[48px] font-bold">
                                        {user?.username?.charAt(0).toUpperCase() || "U"}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-col gap-[24px]">
                        <div className="flex flex-col gap-[12px]">
                            <h1 className="text-[#0E0E0E] font-[600] text-[14px] leading-[20px]">Display Name</h1>
                            <input
                                className="outline-none bg-[#f6f6f6] h-[48px] py-[10px] px-[16px] rounded-[12px] font-[600] text-[14px] cursor-not-allowed opacity-60"
                                value={formData.displayName}
                                readOnly
                                disabled
                            />
                        </div>
                        <div className="flex flex-col md:flex-row gap-[16px] w-[100%]">
                            <div className="flex flex-col gap-[12px] w-[100%]">
                                <h1 className="text-[#0E0E0E] font-[600] text-[14px] leading-[20px]">Email</h1>
                                <input
                                    className="outline-none bg-[#f6f6f6] h-[48px] py-[10px] px-[16px] rounded-[12px] font-[600] text-[14px] cursor-not-allowed opacity-60"
                                    value={formData.email}
                                    readOnly
                                    disabled
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
                    {/* Pro upgrade section */}
                    <div id="pro-upgrade" className="flex flex-col gap-[12px] w-[100%]">
                        <h1 className="text-[#0E0E0E] font-[700] text-[18px] leading-[32px]">Pro Upgrade</h1>

                        {user?.isPremium ? (
                            <div className="flex flex-col gap-[16px] p-[24px] bg-gradient-to-r from-[#10B981] to-[#059669] rounded-[16px] text-white">
                                <div className="flex items-center gap-[12px]">
                                    <div className="w-[48px] h-[48px] bg-white/20 rounded-full flex items-center justify-center">
                                        <span className="text-[24px]">👑</span>
                                    </div>
                                    <div className="flex-1">
                                        <h2 className="text-[20px] font-bold">Pro Member</h2>
                                        <p className="text-[14px] opacity-90">Monthly subscription active</p>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-[18px] font-bold">
                                            {timeUntilExpiry || 'Loading...'}
                                        </div>
                                        <div className="text-[12px] opacity-80">
                                            {subscriptionInfo?.status === 'expired' ? 'Expired' : 'Time remaining'}
                                        </div>
                                    </div>
                                </div>

                                {subscriptionInfo?.expiryDate && (
                                    <div className="bg-white/10 rounded-[12px] p-[12px]">
                                        <div className="flex justify-between items-center text-[12px] mt-[4px]">
                                            <span>Next billing:</span>
                                            <span>{new Date(subscriptionInfo.expiryDate).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                )}

                                <div className="grid grid-cols-2 gap-[12px] text-[12px]">
                                    <div className="flex items-center gap-[8px]">
                                        <span className="text-[16px]">✓</span>
                                        <span>Unlimited SVG downloads</span>
                                    </div>
                                    <div className="flex items-center gap-[8px]">
                                        <span className="text-[16px]">✓</span>
                                        <span>Premium icon access</span>
                                    </div>
                                    <div className="flex items-center gap-[8px]">
                                        <span className="text-[16px]">✓</span>
                                        <span>Priority support</span>
                                    </div>
                                    <div className="flex items-center gap-[8px]">
                                        <span className="text-[16px]">✓</span>
                                        <span>Advanced customization</span>
                                    </div>
                                </div>

                                {subscriptionInfo?.status === 'expired' && (
                                    <button
                                        onClick={() => {
                                            // Handle renewal
                                            window.location.href = '/profile#pro-upgrade';
                                        }}
                                        className="w-full px-[16px] py-[12px] bg-white text-[#10B981] rounded-[12px] font-semibold hover:bg-gray-100 transition-all duration-200"
                                    >
                                        Renew Subscription
                                    </button>
                                )}
                            </div>
                        ) : (
                            <div className="flex flex-col gap-[16px]">
                                <div className="p-[24px] bg-gradient-to-r from-[#0E0E0E] to-[#333333] rounded-[16px] text-white">
                                    <div className="flex items-center justify-between mb-[16px]">
                                        <div>
                                            <h2 className="text-[20px] font-bold">Upgrade to Pro</h2>
                                            <p className="text-[14px] opacity-80">Unlock all premium features</p>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-[32px] font-bold">$5</div>
                                            <div className="text-[12px] opacity-80">Per month</div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-[12px] text-[12px] mb-[20px]">
                                        <div className="flex items-center gap-[8px]">
                                            <span className="text-[16px]">✓</span>
                                            <span>Unlimited SVG downloads</span>
                                        </div>
                                        <div className="flex items-center gap-[8px]">
                                            <span className="text-[16px]">✓</span>
                                            <span>Premium icon access</span>
                                        </div>
                                        <div className="flex items-center gap-[8px]">
                                            <span className="text-[16px]">✓</span>
                                            <span>Priority support</span>
                                        </div>
                                        <div className="flex items-center gap-[8px]">
                                            <span className="text-[16px]">✓</span>
                                            <span>Advanced customization</span>
                                        </div>
                                    </div>

                                    {paymentError && (
                                        <div className="mb-[16px] p-[12px] bg-red-500/20 border border-red-500/30 rounded-[8px] text-[14px] text-red-200">
                                            {paymentError}
                                            {paymentError.includes("login") && (
                                                <div className="mt-2 text-[12px] opacity-80">
                                                    Redirecting to login page...
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {paymentSuccess && (
                                        <div className="mb-[16px] p-[12px] bg-green-500/20 border border-green-500/30 rounded-[8px] text-[14px] text-green-200">
                                            Payment successful! You are now a Pro member.
                                        </div>
                                    )}

                                    <button
                                        onClick={handleProUpgrade}
                                        disabled={isProcessingPayment}
                                        className={`w-full h-[48px] rounded-[12px] font-bold text-[14px] transition-all duration-200 flex items-center justify-center gap-[8px] ${isProcessingPayment
                                            ? 'bg-gray-500 text-gray-300 cursor-not-allowed'
                                            : 'bg-white text-[#0E0E0E] hover:bg-gray-100'
                                            }`}
                                    >
                                        {isProcessingPayment ? (
                                            <>
                                                <div className="w-[16px] h-[16px] border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                                                Processing...
                                            </>
                                        ) : (
                                            <>
                                                <span className="text-[16px]">💳</span>
                                                Subscribe to Pro - $5/month
                                            </>
                                        )}
                                    </button>

                                    {/* Debug Information */}
                                    {/* <div className="mt-4 p-3 bg-gray-800 text-white text-xs rounded">
                                    <div>Debug Info:</div>
                                    <div>Authenticated: {isAuthenticated ? 'Yes' : 'No'}</div>
                                    <div>User: {user ? 'Exists' : 'None'}</div>
                                    <div>Token: {typeof window !== 'undefined' && localStorage.getItem('authToken') ? 'Exists' : 'None'}</div>
                                    <div>Premium: {user?.isPremium ? 'Yes' : 'No'}</div>
                                </div> */}
                                </div>

                                <div className="p-[16px] bg-[#f8f9fa] rounded-[12px] border border-[#e9ecef]">
                                    <h3 className="text-[#0E0E0E] font-semibold text-[14px] mb-[8px]">Test Mode</h3>
                                    <p className="text-[#666666] text-[12px] leading-[16px]">
                                        This is a test environment. Use Stripe test card numbers:
                                    </p>
                                    <div className="mt-[8px] text-[11px] text-[#666666]">
                                        <div>• Success: 4242 4242 4242 4242</div>
                                        <div>• Decline: 4000 0000 0000 0002</div>
                                        <div>• Any future expiry date and CVC</div>
                                    </div>
                                </div>
                            </div>
                        )}
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
        </ProtectedRoute>
    );
}