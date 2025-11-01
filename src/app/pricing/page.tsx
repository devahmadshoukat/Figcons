"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Svg from "@/commons/Svg";
import Appbar from "@/components/Appbar";
import Footer from "@/components/Footer";
import { paymentAPI } from "@/commons/Api";

// Pricing tiers with multipliers
const SEAT_MULTIPLIERS = {
    "1 Seat": 1,
    "5 Seats": 5,
    "25 Seats": 25,
};

const BASE_PRICES = {
    Pro: 29, // $29/yearly per seat
    "Pro Plus": 99, // $99/lifetime per seat
};

const plans = [
    {
        name: "Free",
        desc: "Get started with 4,000+ free icons for personal projects—no cost.",
        price: "Free",
        subPrice: "",
        button: "Get Started",
        seats: [],
        type: "free",
        features: [
            { title: "4,000+ icons", desc: "Access to 4,000+ free icons for personal projects." },
            { title: "Smart Icon Search", desc: "Find the perfect icon fast with fuzzy search." },
            { title: "View Icon Names", desc: "Quickly reference and copy official icon names." },
            { title: "Copy & Download in Any Format", desc: "Instantly copy or download icons as SVG, PNG, JSX, and more." },
            { title: "Framework Support", desc: "Use in React, React Native, Vue, Angular, Svelte, & Flutter." },
            { title: "Flexible Delivery", desc: "Install via NPM, embed via CDN, or use with WordPress & VS Code." },
            { title: "Figma Plugin", desc: "Access full freedom of the official Figma Plugin, inside Figma." },
            { title: "Framer Plugin", desc: "Use Figcons inside Framer with the official marketplace plugin." },
            { title: "VS Code Plugin", desc: "Search and insert icons straight from your IDE." },
            { title: "WordPress Plugin", desc: "Use Figcons in your WordPress projects with ease." },
        ],
    },
    {
        name: "Pro",
        desc: "Great for freelance designers, developers & start-ups.",
        basePrice: 29,
        subPrice: "/yearly",
        button: "Subscribe Now",
        seats: ["1 Seat", "5 Seats", "25 Seats"],
        type: "yearly",
        features: [
            { title: "Everything in Free", desc: "All features from the Free plan included." },
            { title: "40,000+ premium icons", desc: "Access to the full premium icon library." },
            { title: "Advanced Search", desc: "Enhanced search with filters and sorting." },
            { title: "Priority Support", desc: "Get help faster with priority email support." },
            { title: "Commercial License", desc: "Use icons in unlimited commercial projects." },
            { title: "Team Collaboration", desc: "Share icons and projects with your team." },
            { title: "Custom Collections", desc: "Create and organize custom icon collections." },
            { title: "Export Presets", desc: "Save your favorite export settings." },
            { title: "Early Access", desc: "Get early access to new icons and features." },
            { title: "Cancel Anytime", desc: "No long-term commitment, cancel whenever you want." },
        ],
    },
    {
        name: "Pro Plus",
        desc: "For fast-moving teams that want lifetime access and full freedom.",
        basePrice: 99,
        subPrice: "/lifetime",
        button: "Buy Lifetime",
        seats: ["1 Seat", "5 Seats", "25 Seats"],
        type: "lifetime",
        features: [
            { title: "Everything in Pro", desc: "All Pro features included forever." },
            { title: "Lifetime Access", desc: "Pay once, use forever with no recurring fees." },
            { title: "Future Updates", desc: "Get all future icon additions at no extra cost." },
            { title: "Dedicated Support", desc: "Premium support with faster response times." },
            { title: "API Access", desc: "Direct API access for advanced integrations." },
            { title: "White Label", desc: "Remove Figcons branding from exports." },
            { title: "Custom Icons", desc: "Request custom icon designs (limited)." },
            { title: "Unlimited Downloads", desc: "Download as many icons as you need, anytime." },
            { title: "Transfer License", desc: "Transfer your license to team members." },
            { title: "Best Value", desc: "Save 70% compared to yearly subscription over 3 years." },
        ],
    },
];

export default function Pricing() {
    const router = useRouter();
    
    // Track selected seats for each plan (Pro and Pro Plus)
    const [selectedSeats, setSelectedSeats] = useState<{ [key: string]: string }>({
        Pro: "1 Seat",
        "Pro Plus": "1 Seat",
    });
    
    const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
    const [error, setError] = useState<string>("");
    const [userSubscription, setUserSubscription] = useState<any>(null);
    const [isLoadingUser, setIsLoadingUser] = useState(true);
    const [isUsingSharedSeat, setIsUsingSharedSeat] = useState(false);

    // Fetch user subscription status
    useEffect(() => {
        const fetchUserSubscription = async () => {
            try {
                const token = localStorage.getItem("token");
                if (!token) {
                    setIsLoadingUser(false);
                    return;
                }

                const response = await paymentAPI.getSubscriptionStatus();
                if (response.success && response.user) {
                    setUserSubscription(response.user.subscription);
                    
                    // Check if user is using a shared seat (assigned by someone else)
                    const subscription = response.user.subscription;
                    if (subscription?.assignedBy && subscription?.assignedByEmail) {
                        setIsUsingSharedSeat(true);
                        
                        // Set default selection to 5 seats for shared users (1 seat is disabled)
                        setSelectedSeats({
                            Pro: "5 Seats",
                            "Pro Plus": "5 Seats",
                        });
                    }
                }
            } catch (err) {
                console.error("Error fetching subscription:", err);
            } finally {
                setIsLoadingUser(false);
            }
        };

        fetchUserSubscription();
    }, []);

    // Handle seat selection
    const handleSeatChange = (planName: string, seat: string) => {
        setSelectedSeats((prev) => ({
            ...prev,
            [planName]: seat,
        }));
    };

    // Calculate price based on selected seats
    const calculatePrice = (planName: string) => {
        if (planName === "Free") return "Free";
        
        const basePrice = BASE_PRICES[planName as keyof typeof BASE_PRICES];
        const selectedSeat = selectedSeats[planName];
        const multiplier = SEAT_MULTIPLIERS[selectedSeat as keyof typeof SEAT_MULTIPLIERS] || 1;
        
        return `$${basePrice * multiplier}`;
    };

    // Handle checkout
    const handleCheckout = async (planName: string, planType: string) => {
        setError("");
        setLoadingPlan(planName);

        try {
            // Check if user is logged in
            const token = localStorage.getItem("token");
            if (!token) {
                // Redirect to signin
                router.push("/auth/signin");
                return;
            }

            // Handle Free plan
            if (planType === "free") {
                router.push("/icons");
                return;
            }

            // Calculate amount
            const basePrice = BASE_PRICES[planName as keyof typeof BASE_PRICES];
            const selectedSeat = selectedSeats[planName];
            const multiplier = SEAT_MULTIPLIERS[selectedSeat as keyof typeof SEAT_MULTIPLIERS] || 1;
            const amount = basePrice * multiplier;
            const seats = multiplier; // Number of seats

            let response;

            if (planType === "yearly") {
                // Yearly subscription
                response = await paymentAPI.createYearlySubscription({
                    amount: amount,
                    planName: `${planName} - ${selectedSeat}`,
                    seats: seats,
                    pricePerSeat: basePrice,
                });
            } else if (planType === "lifetime") {
                // Check if upgrading from yearly
                const isUpgrade = userSubscription?.type === 'yearly' && userSubscription?.status === 'active';
                
                // One-time lifetime payment
                response = await paymentAPI.createOnetimePayment({
                    amount: amount,
                    planName: `${planName} - ${selectedSeat}`,
                    isUpgrade: isUpgrade,
                    seats: seats,
                    pricePerSeat: basePrice,
                });
            }

            // Redirect to Stripe checkout
            if (response?.url) {
                window.location.href = response.url;
            } else if (response?.checkoutUrl) {
                window.location.href = response.checkoutUrl;
            } else {
                throw new Error("Failed to create checkout session");
            }
        } catch (err: any) {
            console.error("Checkout error:", err);
            if (err.message.includes("No token provided") || err.message.includes("authentication")) {
                // Not logged in, redirect to signin
                router.push("/auth/signin");
            } else {
                setError(err.message || "Failed to start checkout. Please try again.");
            }
        } finally {
            setLoadingPlan(null);
        }
    };

    return (
        <>
            <Appbar />
            <div className="border-t border-[#ececec] flex flex-col justify-center items-center">
                <div className="md:w-[590px] flex flex-col justify-center items-center text-center gap-[32px] py-[80px] px-[25px]">
                    <h1 className="text-[#0e0e0e] text-[36px] md:text-[64px] font-extrabold leading-[40px] md:leading-[72px]">
                        Choose a plan that works for you
                    </h1>
                    <p className="text-[#b7b7b7] text-[12px] md:text-[16px] font-normal leading-[16px] md:leading-[24px] w-[90%] md:w-[100%]">
                        40,000+ icons, 32,000+ premium illustrations for designers and developers
                    </p>
                    
                    {/* Shared Seat Notice */}
                    {isUsingSharedSeat && (
                        <div className="w-full max-w-[800px] bg-gradient-to-r from-[#E84C88] to-[#d43d75] text-white px-[24px] py-[16px] rounded-[16px] shadow-lg">
                            <div className="flex items-center gap-[12px]">
                                <svg className="w-[24px] h-[24px] flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                </svg>
                                <div className="flex flex-col items-start text-left">
                                    <h3 className="text-[16px] font-[700] leading-[24px]">
                                        🎉 You're using a shared seat!
                                    </h3>
                                    <p className="text-[13px] font-[400] leading-[20px] opacity-90">
                                        Shared by: <span className="font-[600]">{userSubscription?.assignedByEmail}</span>
                                    </p>
                                    <p className="text-[12px] font-[400] leading-[18px] opacity-80 mt-[4px]">
                                        Want your own plan? Choose 5 or 25 seats below. You'll automatically leave this shared seat when you purchase.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                    
                    {/* Error Message */}
                    {error && (
                        <div className="bg-red-100 text-red-700 px-[20px] py-[12px] rounded-full text-[14px] font-[500]">
                            {error}
                        </div>
                    )}
                </div>
            </div>

            <div className="2xl:w-[1440px] mx-auto grid grid-cols-1 md:grid-cols-3 gap-[25px] px-[25px] mb-[80px]">
                {plans.map((plan, i) => {
                    const displayPrice = calculatePrice(plan.name);
                    const isLoading = loadingPlan === plan.name;
                    
                    // Check if user can upgrade
                    const hasYearlySubscription = userSubscription?.type === 'yearly' && userSubscription?.status === 'active';
                    const hasLifetimeSubscription = userSubscription?.type === 'lifetime';
                    const isUpgradeOption = plan.type === 'lifetime' && hasYearlySubscription;
                    const isCurrentPlan = 
                        (plan.type === 'yearly' && hasYearlySubscription) ||
                        (plan.type === 'lifetime' && hasLifetimeSubscription);
                    
                    // Get current seats if user has this plan
                    const currentSeats = isCurrentPlan ? (userSubscription?.seats || 1) : null;
                    const selectedSeatCount = SEAT_MULTIPLIERS[selectedSeats[plan.name] as keyof typeof SEAT_MULTIPLIERS] || 1;
                    const canUpgradeSeats = isCurrentPlan && currentSeats && selectedSeatCount > currentSeats;
                    
                    return (
                        <div
                            key={i}
                            className={`flex flex-col gap-[48px] items-center justify-between py-[24px] px-[24px] border-[#ececec] border rounded-[24px] min-h-[1128px] md:min-h-[1380px] ${
                                plan.name === "Pro Plus" ? "border-[#7AE684] border-2" : ""
                            }`}
                        >
                            <div className="flex flex-col gap-[48px] items-center justify-center w-full">
                                <div className="flex flex-col gap-[32px] items-center justify-center w-full">
                                    {/* Plan Name & Description */}
                                    <div className="flex flex-col gap-[8px] items-start w-full">
                                        <div className="flex items-center gap-[12px] flex-wrap">
                                            <h1 className="text-[#0e0e0e] text-[32px] font-bold leading-[40px]">
                                                {plan.name}
                                            </h1>
                                            {plan.name === "Pro Plus" && !isUpgradeOption && (
                                                <span className="bg-[#7AE684] text-[#2D6332] px-[12px] py-[4px] rounded-full text-[12px] font-[700]">
                                                    BEST VALUE
                                                </span>
                                            )}
                                            {isUpgradeOption && (
                                                <span className="bg-[#E84C88] text-white px-[12px] py-[4px] rounded-full text-[12px] font-[700] animate-pulse">
                                                    ⬆️ UPGRADE
                                                </span>
                                            )}
                                            {isCurrentPlan && (
                                                <span className="bg-[#0e0e0e] text-white px-[12px] py-[4px] rounded-full text-[12px] font-[700]">
                                                    CURRENT PLAN
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-[#b7b7b7] text-[16px] font-normal leading-[24px]">
                                            {plan.desc}
                                        </p>
                                    </div>

                                    {/* Seat Selection */}
                                    {plan.seats.length > 0 && (
                                        <div className="w-full flex flex-col gap-[12px]">
                                            {/* Current Seats Info */}
                                            {currentSeats && (
                                                <div className="bg-[#F6F6F6] rounded-[12px] px-[16px] py-[8px] text-center">
                                                    <p className="text-[#0e0e0e] text-[12px] font-[600]">
                                                        Current: {currentSeats} {currentSeats === 1 ? 'Seat' : 'Seats'} 
                                                        <span className="text-[#b7b7b7] font-[400]"> (${userSubscription?.pricePerSeat || BASE_PRICES[plan.name as keyof typeof BASE_PRICES]}/seat)</span>
                                                    </p>
                                                </div>
                                            )}
                                            
                                            <div className="w-full flex gap-[16px]">
                                                {plan.seats.map((seat, idx) => {
                                                    const seatCount = SEAT_MULTIPLIERS[seat as keyof typeof SEAT_MULTIPLIERS] || 1;
                                                    const isCurrentSeat = currentSeats === seatCount;
                                                    const isSeatUpgrade = currentSeats && seatCount > currentSeats;
                                                    
                                                    // Disable 1-seat option for users with shared seats
                                                    const isDisabledForSharedUser = isUsingSharedSeat && seatCount === 1;
                                                    
                                                    return (
                                                        <button
                                                            key={idx}
                                                            onClick={() => !isDisabledForSharedUser && handleSeatChange(plan.name, seat)}
                                                            disabled={isLoading || isCurrentSeat || isDisabledForSharedUser}
                                                            className={`w-full px-[20px] py-[8px] ${
                                                                selectedSeats[plan.name] === seat && !isDisabledForSharedUser
                                                                    ? "bg-[#E84C88] text-white"
                                                                    : isCurrentSeat
                                                                    ? "bg-[#0e0e0e] text-white cursor-not-allowed"
                                                                    : isDisabledForSharedUser
                                                                    ? "bg-[#f5f5f5] text-[#b7b7b7] cursor-not-allowed opacity-50"
                                                                    : "bg-[#ECECEC] text-[#0e0e0e] hover:bg-[#d9d9d9]"
                                                            } text-[16px] font-bold leading-[24px] rounded-full flex flex-col items-center justify-center h-[56px] transition-colors disabled:opacity-50 disabled:cursor-not-allowed relative`}
                                                            title={isDisabledForSharedUser ? "1-seat plan not available for shared seat users" : ""}
                                                        >
                                                            <span>{seat}</span>
                                                            {isDisabledForSharedUser && (
                                                                <span className="text-[10px] font-[400]">Not available</span>
                                                            )}
                                                            {isSeatUpgrade && !isDisabledForSharedUser && (
                                                                <span className="text-[10px] font-[400]">+{seatCount - currentSeats} more</span>
                                                            )}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                            
                                            {/* Info box for shared seat users */}
                                            {isUsingSharedSeat && plan.seats.length > 0 && (
                                                <div className="w-full bg-[#FFF3F8] border border-[#E84C88] rounded-[12px] p-[16px]">
                                                    <div className="flex gap-[12px] items-start">
                                                        <span className="text-[18px]">💡</span>
                                                        <div className="flex flex-col gap-[4px]">
                                                            <p className="text-[#0e0e0e] text-[12px] font-[600]">
                                                                For Shared Seat Users
                                                            </p>
                                                            <p className="text-[#0e0e0e] text-[11px] font-[400] leading-[16px]">
                                                                Single seat plans are not available. Choose 5 or 25 seats to get your own subscription and automatically leave the shared seat.
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* Price Display */}
                                    <div className="flex justify-start items-start w-full">
                                        <h1 className="text-[#0e0e0e] text-[32px] font-bold leading-[48px]">
                                            {displayPrice}
                                            {plan.subPrice && displayPrice !== "Free" && (
                                                <span className="text-[#b7b7b7] text-[20px] font-normal leading-[32px]">
                                                    {plan.subPrice}
                                                </span>
                                            )}
                                        </h1>
                                    </div>
                                </div>

                                {/* Features */}
                                <div className="flex flex-col gap-[16px] items-start justify-center w-full">
                                    {plan.features.map((f, idx) => (
                                        <div key={idx} className="flex gap-[12px] items-start">
                                            <Svg icon="tick" stroke="#0e0e0e" className="m-[8px] flex-shrink-0" />
                                            <div className="flex flex-col gap-[8px] items-start">
                                                <p className="text-[#0e0e0e] text-[16px] font-bold leading-[24px]">
                                                    {f.title}
                                                </p>
                                                <p className="text-[#b7b7b7] text-[14px] font-normal leading-[20px]">
                                                    {f.desc}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* CTA Button */}
                            <button
                                onClick={() => handleCheckout(plan.name, plan.type)}
                                disabled={isLoading || (isCurrentPlan && !canUpgradeSeats)}
                                className={`w-full h-[56px] text-[16px] font-bold leading-[24px] rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                                    isCurrentPlan && !canUpgradeSeats
                                        ? "bg-[#0e0e0e] text-white cursor-not-allowed"
                                        : canUpgradeSeats
                                        ? "bg-[#7AE684] text-[#2D6332] hover:bg-[#6bd674]"
                                        : isUpgradeOption
                                        ? "bg-[#E84C88] text-white hover:bg-[#d43d75] animate-pulse"
                                        : plan.name === "Pro Plus"
                                        ? "bg-[#7AE684] text-[#2D6332] hover:bg-[#6bd674]"
                                        : plan.name === "Pro"
                                        ? "bg-[#E84C88] text-white hover:bg-[#d43d75]"
                                        : "bg-[#ececec] text-[#0e0e0e] hover:bg-[#d9d9d9]"
                                }`}
                            >
                                {isLoading ? (
                                    <div className="flex items-center justify-center gap-[8px]">
                                        <div className="w-[16px] h-[16px] border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                                        <span>Processing...</span>
                                    </div>
                                ) : isCurrentPlan && !canUpgradeSeats ? (
                                    "Current Plan ✓"
                                ) : canUpgradeSeats ? (
                                    `⬆️ Upgrade to ${selectedSeatCount} Seats`
                                ) : isUpgradeOption ? (
                                    "⬆️ Upgrade to Lifetime"
                                ) : (
                                    plan.button
                                )}
                            </button>
                            
                            {/* Upgrade Info Message */}
                            {isUpgradeOption && (
                                <div className="w-full bg-[#FFF3F8] border border-[#E84C88] rounded-[12px] p-[16px] -mt-[32px]">
                                    <div className="flex gap-[12px] items-start">
                                        <span className="text-[20px]">💡</span>
                                        <div className="flex flex-col gap-[4px]">
                                            <p className="text-[#0e0e0e] text-[13px] font-[600]">
                                                Upgrade and Save!
                                            </p>
                                            <p className="text-[#0e0e0e] text-[12px] font-[400] leading-[18px]">
                                                Your yearly subscription will be cancelled automatically. Pay once, use forever!
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Additional Info Section */}
            <div className="bg-[#F6F6F6] py-[60px] px-[25px] mb-[80px]">
                <div className="max-w-[1200px] mx-auto">
                    <h2 className="text-[#0e0e0e] text-[32px] font-bold leading-[40px] text-center mb-[40px]">
                        Frequently Asked Questions
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-[32px]">
                        <div className="flex flex-col gap-[12px]">
                            <h3 className="text-[#0e0e0e] text-[18px] font-[600]">
                                What's the difference between Yearly and Lifetime?
                            </h3>
                            <p className="text-[#0e0e0e] text-[14px] font-[400] leading-[22px]">
                                <strong>Yearly (Pro):</strong> Pay $29/year per seat, renews automatically. Cancel anytime.<br />
                                <strong>Lifetime (Pro Plus):</strong> Pay once $99 per seat, use forever. No recurring fees.
                            </p>
                        </div>
                        <div className="flex flex-col gap-[12px]">
                            <h3 className="text-[#0e0e0e] text-[18px] font-[600]">
                                What are "Seats"?
                            </h3>
                            <p className="text-[#0e0e0e] text-[14px] font-[400] leading-[22px]">
                                Each seat represents one team member who can access the premium features. Choose the number of seats based on your team size.
                            </p>
                        </div>
                        <div className="flex flex-col gap-[12px]">
                            <h3 className="text-[#0e0e0e] text-[18px] font-[600]">
                                Can I upgrade or downgrade later?
                            </h3>
                            <p className="text-[#0e0e0e] text-[14px] font-[400] leading-[22px]">
                                Yes! You can upgrade from Pro to Pro Plus anytime. Contact support for seat adjustments or plan changes.
                            </p>
                        </div>
                        <div className="flex flex-col gap-[12px]">
                            <h3 className="text-[#0e0e0e] text-[18px] font-[600]">
                                What payment methods do you accept?
                            </h3>
                            <p className="text-[#0e0e0e] text-[14px] font-[400] leading-[22px]">
                                We accept all major credit cards, debit cards, and other payment methods through Stripe secure checkout.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <Footer />
        </>
    );
}
