import Svg from "@/commons/Svg";
import Appbar from "@/components/Appbar";
import Footer from "@/components/Footer";

const plans = [
    {
        name: "Free",
        desc: "Get started with 4,000+ free icons for personal projects—no cost.",
        price: "Free",
        subPrice: "",
        button: "Get Start Now",
        seats: [],
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
        price: "$29",
        subPrice: "/yearly",
        button: "Get Start Now",
        seats: ["1 Seat", "5 Seat", "25 Seat"],
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
        name: "Pro Plus",
        desc: "For fast-moving teams that want lifetime access and full freedom.",
        price: "$99",
        subPrice: "/lifetime",
        button: "Get Start Now",
        seats: ["1 Seat", "5 Seat", "25 Seat"],
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
];

export default function Pricing() {
    return (
        <>
            <Appbar />
            <div className="border-t border-[#ececec] flex flex-col justify-center items-center">
                <div className="md:w-[590px] flex flex-col justify-center items-center text-center gap-[32px] py-[80px]">
                    <h1 className="text-[#0e0e0e] text-[36px] md:text-[64px] font-extrabold leading-[40px] md:leading-[72px]">
                        Choose a plan that works for you
                    </h1>
                    <p className="text-[#b7b7b7] text-[12px] md:text-[16px] font-normal leading-[16px] md:leading-[24px] w-[90%] md:w-[100%]">
                        40,000+ icons, 32,000+ premium illustration for designer and developers
                    </p>
                </div>
            </div>
            <div className="2xl:w-[1440px] mx-auto grid grid-cols-1 md:grid-cols-3 gap-[25px] px-[25px] mb-[80px]">
                {plans.map((plan, i) => (
                    <div
                        key={i}
                        className="flex flex-col gap-[48px] items-center justify-between py-[24px] px-[24px] border-[#ececec] border rounded-[24px] h-[1128px] md:h-[1380px]"
                    >
                        <div className="flex flex-col gap-[48px] items-center justify-center w-full">
                            <div className="flex flex-col gap-[32px] items-center justify-center w-full">
                                <div className="flex flex-col gap-[8px] items-start">
                                    <h1 className="text-[#0e0e0e] text-[32px] font-bold leading-[40px]">
                                        {plan.name}
                                    </h1>
                                    <p className="text-[#b7b7b7] text-[16px] font-normal leading-[24px]">
                                        {plan.desc}
                                    </p>
                                </div>

                                {plan.seats.length > 0 && (
                                    <div className="w-full flex gap-[16px]">
                                        {plan.seats.map((seat, idx) => (
                                            <button
                                                key={idx}
                                                className={`w-full px-[20px] py-[8px] ${idx === 0 ? "bg-[#0e0e0e] text-white" : "bg-[#ececec] text-[#0e0e0e]"
                                                    } text-[16px] font-bold leading-[24px] rounded-full flex items-center justify-center h-[56px]`}
                                            >
                                                {seat}
                                            </button>
                                        ))}
                                    </div>
                                )}

                                {plan.price !== "Free" && (
                                    <div className="flex justify-start items-start w-full">
                                        <h1 className="text-[#0e0e0e] text-[32px] font-bold leading-[48px]">
                                            {plan.price}{" "}
                                            {plan.subPrice && (
                                                <span className="text-[#b7b7b7] text-[20px] font-normal leading-[32px]">
                                                    {plan.subPrice}
                                                </span>
                                            )}
                                        </h1>
                                    </div>
                                )}
                            </div>

                            {/* Features */}
                            <div className="flex flex-col gap-[16px] items-start justify-center w-full">
                                {plan.features.map((f, idx) => (
                                    <div key={idx} className="flex gap-[12px] items-start">
                                        <Svg icon="tick" stroke="#0e0e0e" className="m-[8px]" />
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

                        <button className={`w-full h-[56px] text-[16px] font-bold leading-[24px] rounded-full ${plan.name === "Pro Plus"
                            ? "bg-[#0e0e0e] text-[#ffff]"
                            : "bg-[#ececec] text-[#0e0e0e]"
                            }`}>
                            {plan.button}
                        </button>
                    </div>
                ))}
            </div>
            <Footer />
        </>
    );
}
