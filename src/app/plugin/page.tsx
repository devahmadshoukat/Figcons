import Cards from "@/app/plugin/cards";
import Hero from "@/app/plugin/hero";
import { GridBox } from "@/commons/GridBox";
import Appbar from "@/components/Appbar";
import Footer from "@/components/Footer";

export default function Plugin() {
    return (
        <>
            <Appbar />
            <GridBox
                classNameChild1="px-[16px] md:px-[64px] py-[40px] md:py-[64px]"
                classNameChild2="px-[16px] md:px-[0] py-[40px] md:py-[64px]"
            >
                <Hero />
                <Cards />
            </GridBox>
            <Footer />
        </>
    );
}