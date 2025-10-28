"use client"
import Appbar from "@/components/Appbar";
import Footer from "@/components/Footer";
import Filters from "@/app/icons/Filters";
import IconsCanvas from "@/app/icons/IconsCanvas";
import { useState } from "react";

export default function Icons() {
    const [iconColor, setIconColor] = useState<string>("#0e0e0e");

    return (
        <>
            <Appbar />
            <Filters color={iconColor} onColorChange={setIconColor} onReset={() => setIconColor("#0e0e0e")} />
            <IconsCanvas tintColor={iconColor} />
            <Footer />
        </>
    )
}