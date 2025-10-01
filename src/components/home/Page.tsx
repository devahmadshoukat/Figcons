import { GridBox } from "@/commons/GridBox";
import Appbar from "@/components/Appbar";
import Hero from "@/components/home/Hero";
import IconGallery from "@/components/home/IconGallery";
import IconShowcase from "@/components/home/IconShowcase";
import { FlexlineIconsPrinciples1, FlexlineIconsPrinciples2, FlexlineIconsPrinciples3 } from "@/components/home/FlexlineIconsPrinciples";
import TestimonialStats from "@/components/home/TestimonialStats";
import Total from "@/components/home/Total";

export default function HomePage() {
    return (
        <div>
            <Appbar />
            <GridBox
                classNameChild1="px-[16px] md:px-[64px] py-[40px] md:py-[64px]"
                classNameChild3="px-[16px] md:px-[64px] py-[40px] md:py-[64px]"
                classNameChild4="px-[0] md:px-[64px]"
                classNameChild5="px-[16px] md:px-[64px] py-[40px] md:py-[64px]"
                classNameChild6={true}
                classNameChild7={true}
                classNameChild8={true}
            >
                <Hero />
                <IconGallery />
                <TestimonialStats />
                <Total />
                <IconShowcase />
                <FlexlineIconsPrinciples1 />
                <FlexlineIconsPrinciples2 />
                <FlexlineIconsPrinciples3 />
            </GridBox>
        </div>
    )
}