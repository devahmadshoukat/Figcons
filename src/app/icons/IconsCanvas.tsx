/* eslint-disable */
"use client";
import { useEffect, useState } from "react";
import IconsEditor from "./IconsEditor";

interface Icon {
    _id: string;
    name: string;
    filename: string;
    category: { _id: string; name: string };
}

interface CategoryGroup {
    _id: string;
    name: string;
    total: number;
    icons: Icon[];
}

interface Category {
    _id: string;
    name: string;
}

export default function IconsCanvas() {
    const [categories, setCategories] = useState<CategoryGroup[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [selectedIcon, setSelectedIcon] = useState<Icon | null>(null);
    const [showEditor, setShowEditor] = useState<boolean>(false);

    const API_BASE = "https://figcons-backend.vercel.app/api/icons";

    /* --------------------------------------------
       🧠 Fetch All Categories + Icons
    -------------------------------------------- */
    const fetchAllCategoriesWithIcons = async () => {
        setLoading(true);
        try {
            const catRes = await fetch(`${API_BASE}/categories`);
            if (!catRes.ok) throw new Error("Failed to fetch categories");
            const categoriesList: Category[] = await catRes.json();

            const categoryData: CategoryGroup[] = await Promise.all(
                categoriesList.map(async (cat: Category) => {
                    const res = await fetch(`${API_BASE}/categories/${cat.name}`);
                    if (!res.ok) return { ...cat, icons: [], total: 0 };
                    const data: { icons: Icon[]; total: number } = await res.json();
                    return { _id: cat._id, name: cat.name, icons: data.icons || [], total: data.total || 0 };
                })
            );

            setCategories(categoryData);
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "Failed to load icons");
        } finally {
            setLoading(false);
        }
    };

    /* --------------------------------------------
       🧱 Image Preload (WebP)
    -------------------------------------------- */
    const preloadImage = (icon: Icon) => {
        const img = new window.Image();
        img.src = `${API_BASE}/${icon._id}/webp/30x30`;
    };

    /* --------------------------------------------
       🎯 Handle Icon Selection
    -------------------------------------------- */
    const handleIconClick = (icon: Icon) => {
        // If clicking the same icon, toggle editor visibility
        if (selectedIcon && selectedIcon._id === icon._id) {
            setShowEditor(!showEditor);
        } else {
            // Select new icon and show editor
            setSelectedIcon(icon);
            setShowEditor(true);
        }
    };

    useEffect(() => {
        fetchAllCategoriesWithIcons();
    }, []);

    useEffect(() => {
        // preload all WebPs after categories loaded
        categories.forEach((cat) => {
            cat.icons.forEach((icon) => preloadImage(icon));
        });
    }, [categories]);

    /* --------------------------------------------
       🎨 UI
    -------------------------------------------- */
    return (
        <div className="py-8 flex flex-col gap-10">
            <h1 className="text-[20px] ml-6 font-bold text-gray-800">
                Icon Library{" "}
                <span className="ml-3 text-sm text-gray-500">
                    {loading ? "Loading..." : `${categories.length} Categories`}
                </span>
            </h1>

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-md text-sm">
                    {error}
                </div>
            )}
            <div className="flex px-6 gap-4 justify-center">
                <div className={`${showEditor ? 'w-[75%]' : 'w-[100%]'} flex flex-col gap-4 overflow-y-hidden`}>
                    {categories.map((category) => (
                        <div key={category._id} className="flex flex-col gap-4">
                            <div className="flex items-center justify-between">
                                <h2 className="text-[17px] font-semibold text-gray-800">
                                    {category.name}{" "}
                                    <span className="text-gray-500 text-sm font-normal">
                                        {category.total} Icons
                                    </span>
                                </h2>
                            </div>

                            <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                                {category.icons.map((icon) => {
                                    const imgSrc = `${API_BASE}/${icon._id}/webp/30x30`;
                                    // Clean up the name: remove "Image preview" suffix and format properly
                                    const cleanName = icon.name
                                        .replace(/Image preview$/i, '')
                                        .replace(/-/g, ' ')
                                        .split(' ')
                                        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                                        .join(' ');

                                    return (
                                        <div
                                            key={icon._id}
                                            onClick={() => handleIconClick(icon)}
                                            className={`relative w-[85px] h-[85px] border rounded-2xl flex flex-col items-center justify-center hover:shadow-md transition-all duration-200 group cursor-pointer ${selectedIcon && selectedIcon._id === icon._id
                                                ? 'border-black border-2'
                                                : 'border-gray-200'
                                                }`}
                                        >
                                            {/* WebP Icon */}
                                            <img src={imgSrc} alt={cleanName} />

                                            {/* Tooltip */}
                                            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
                                                {cleanName}
                                                <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>
                {showEditor && <IconsEditor selectedIcon={selectedIcon} />}
            </div>
            {loading && (
                <div className="text-center text-gray-500 text-sm mt-6">Loading icons...</div>
            )}
        </div>
    );
}
