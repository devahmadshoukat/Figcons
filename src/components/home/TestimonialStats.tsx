import Image from "next/image";

export default function TestimonialStats() {
    const testimonials = [
        {
            quote: "The icon set is <strong>pixel-perfect</strong>. Easy to plug into React projects without any extra work.",
            profile: "/profile1.png",
            name: "Sarah L.",
            job: "Frontend Developer",
        },
        {
            quote: "Finally, one place for <strong>icons, emojis, and illustrations</strong>. Saved me hours on client work.",
            profile: "/profile2.png",
            name: "James P.",
            job: "Freelance Designer",
        },
        {
            quote: "Simple <strong>licensing, beautiful assets, and fast exports</strong>. Highly recommended!",
            profile: "/profile3.png",
            name: "Ayesha K.",
            job: "Product Designer",
        }
    ];

    return (
        <div className="w-[100%] flex flex-col 2xl:gap-[68px] gap-[48px] justify-center items-center">
            <div className="md:w-[500px] flex flex-col justify-center items-center text-center gap-[12px]">
                <p className="text-[30px] font-bold leading-[40px]">Trusted by Thousands Worldwide</p>
                <p className="w-[90%] md:w-[100%] text-[16px] leading-[24px]">
                    Real feedback from people using our icons, illustrations, and emojis daily.
                </p>
            </div>
            <div className="mx-auto flex justify-center w-[100%]">
                <div className="w-[100%] grid grid-cols-1 md:grid-cols-3 2xl:gap-[50px] gap-[32px] md:gap-0">
                    {testimonials.map((testimonial, index) => (
                        <div
                            key={index}
                            className="flex flex-col-reverse md:flex-col justify-center items-start gap-[24px] md:gap-[32px] w-[100%] 2xl:w-[85%] md:w-[250px]"
                        >
                            <p
                                className="text-[16px] leading-[24px] font-normal"
                                dangerouslySetInnerHTML={{ __html: testimonial.quote }}
                            ></p>
                            <div className="flex gap-[12px] items-center">
                                <Image
                                    className="w-[40px] h-[40px]"
                                    src={testimonial.profile}
                                    width={999}
                                    height={999}
                                    alt=""
                                />
                                <div>
                                    <p className="text-[#0e0e0e] text-[18px] leading-[24px] font-bold">{testimonial.name}</p>
                                    <p className="text-[#454545] text-[12px] leading-[20px] font-normal">{testimonial.job}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}