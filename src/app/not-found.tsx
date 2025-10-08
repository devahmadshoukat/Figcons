import Button from "@/commons/Button";
import { GridBox } from "@/commons/GridBox";
import Appbar from "@/components/Appbar";
import Footer from "@/components/Footer";
import Link from "next/link";

export default function NotFound() {
    return (
        <div>
            <Appbar />
            <GridBox
                classNameChild1="px-[16px] md:px-[64px] py-[40px] md:py-[64px]"
                classNameChild3="px-[16px] md:px-[64px] py-[40px] md:py-[64px]"
                classNameChild4="px-[0] md:px-[64px]"
                classNameChild5="px-[16px] md:px-[0] py-[40px] md:py-[64px]"
                classNameChild6={true}
                classNameChild7={true}
                classNameChild8={true}
                classNameChild9="px-[16px] md:px-[64px] py-[40px] md:py-[64px]"
                classNameChild11="px-[16px] md:px-[0] py-[40px] md:py-[64px]"
            >
                <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
                    <div className="mb-8">
                        <h1 className="text-6xl md:text-8xl font-bold text-gray-900 mb-4">404</h1>
                        <h2 className="text-2xl md:text-3xl font-semibold text-gray-800 mb-4">
                            Page Not Found
                        </h2>
                        <p className="text-lg text-gray-600 mb-8 max-w-md">
                            Sorry, we couldn&apos;t find the page you&apos;re looking for.
                            It might have been moved, deleted, or you entered the wrong URL.
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4">
                        <Link href="/">
                            <Button
                                text="Go Home"
                                className="bg-[#0e0e0e] text-white hover:bg-[#2a2a2a] transition-colors duration-200"
                                href="/"
                            />
                        </Link>
                        <Link href="/plugin">
                            <Button
                                text="Browse Icons"
                                className="border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                                href="/"
                            />
                        </Link>
                    </div>
                </div>
            </GridBox>
            <Footer />
        </div>
    );
}
