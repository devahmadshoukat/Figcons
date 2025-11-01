"use client";
import Appbar from "@/components/Appbar";
import Footer from "@/components/Footer";
import Filters from "@/app/icons/Filters";
import IconsCanvas from "@/app/icons/IconsCanvas";
import { useState } from "react";

export default function Icons() {
    const [searchQuery, setSearchQuery] = useState<string>("");

    return (
        <>
            <Appbar />
            <Filters searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
            <IconsCanvas searchQuery={searchQuery} />
            <Footer />
        </>
    )
}