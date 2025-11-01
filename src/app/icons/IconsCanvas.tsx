"use client";
import IconsEditor from "@/app/icons/IconsEditor";
import { useRef, useState, useEffect, useCallback } from "react";
import { iconsAPI, paymentAPI } from "@/commons/Api";

interface Icon {
    _id: string;
    name: string;
    cloudinaryUrl: {
        svg: string;
        webp: string;
    };
    isPremium: boolean;
    isPublic: boolean;
    category: string | {
        _id: string;
        name: string;
        cloudinaryFolder: string;
    };
    tags?: string[];
}

interface CategoryGroup {
    category: {
        _id: string;
        name: string;
        cloudinaryFolder: string;
    };
    icons: Icon[];
    iconCount: number;
}

// Secure Icon Canvas Component
const SecureIconCanvas = ({ iconUrl, iconName }: { iconUrl: string; iconName: string }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d', { willReadFrequently: false });
        if (!ctx) return;

        // Load and draw image on canvas
        const img = new Image();
        img.crossOrigin = 'anonymous';

        img.onload = () => {
            // Clear canvas
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Draw image centered
            const size = 27;
            const x = (canvas.width - size) / 2;
            const y = (canvas.height - size) / 2;
            ctx.drawImage(img, x, y, size, size);
        };

        img.onerror = () => {
            console.error('Failed to load icon:', iconName);
        };

        img.src = iconUrl;
    }, [iconUrl, iconName]);

    return (
        <canvas
            ref={canvasRef}
            width={32}
            height={32}
            className="w-[32px] h-[32px] pointer-events-none select-none"
            onContextMenu={(e) => e.preventDefault()}
            style={{ imageRendering: 'auto' }}
        />
    );
};

interface IconsCanvasProps {
    searchQuery?: string;
}

export default function IconsCanvas({ searchQuery = "" }: IconsCanvasProps) {
    const [categoryGroups, setCategoryGroups] = useState<CategoryGroup[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [selectedIcon, setSelectedIcon] = useState<Icon | null>(null);
    const [isEditorOpen, setIsEditorOpen] = useState(false);
    const [totalIcons, setTotalIcons] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [userIsPremium, setUserIsPremium] = useState<boolean>(false);

    const mainContentRef = useRef<HTMLDivElement>(null);
    const loadMoreRef = useRef<HTMLDivElement>(null);

    // Fetch user premium status
    useEffect(() => {
        const fetchUserPremiumStatus = async () => {
            try {
                const token = localStorage.getItem("token");
                if (!token) {
                    setUserIsPremium(false);
                    return;
                }

                const response = await paymentAPI.getSubscriptionStatus();
                if (response.success && response.user) {
                    // Check if user has premium subscription (isPremium or active subscription)
                    const subscription = response.user.subscription;
                    const isPremium = response.user.isPremium || 
                                     (subscription && subscription.status === 'active') ||
                                     (subscription && subscription.type === 'lifetime');
                    setUserIsPremium(isPremium);
                } else {
                    setUserIsPremium(false);
                }
            } catch (error) {
                console.error('Error fetching premium status:', error);
                setUserIsPremium(false);
            }
        };

        fetchUserPremiumStatus();
    }, []);

    // Search icons
    const searchIcons = useCallback(async (query: string) => {
        try {
            setLoading(true);
            setCurrentPage(1);

            const response = await iconsAPI.search(query, {
                limit: 500
            });

            if (response.success && response.data) {
                // Search results are likely a flat array of icons
                const icons: Icon[] = Array.isArray(response.data) ? response.data : [];
                
                // Group icons by category
                const groupedByCategory = new Map<string, { category: any; icons: Icon[] }>();
                
                icons.forEach((icon) => {
                    const categoryObj = typeof icon.category === 'object' && icon.category !== null && '_id' in icon.category
                        ? icon.category
                        : null;
                    const categoryId = categoryObj ? categoryObj._id : (typeof icon.category === 'string' ? icon.category : 'unknown');
                    const categoryName = categoryObj ? categoryObj.name : 'Unknown';
                    const categoryFolder = categoryObj ? categoryObj.cloudinaryFolder : '';
                    
                    if (!groupedByCategory.has(categoryId)) {
                        groupedByCategory.set(categoryId, {
                            category: {
                                _id: categoryId,
                                name: categoryName,
                                cloudinaryFolder: categoryFolder
                            },
                            icons: []
                        });
                    }
                    groupedByCategory.get(categoryId)!.icons.push(icon);
                });

                // Convert map to array format
                const groupedArray: CategoryGroup[] = Array.from(groupedByCategory.values()).map(group => ({
                    category: group.category,
                    icons: group.icons,
                    iconCount: group.icons.length
                }));

                setCategoryGroups(groupedArray);
                setTotalIcons(icons.length);
                setHasMore(false); // Search typically returns all results at once
            } else {
                setCategoryGroups([]);
                setTotalIcons(0);
                setHasMore(false);
            }
        } catch (error) {
            console.error('Error searching icons:', error);
            setCategoryGroups([]);
            setTotalIcons(0);
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    }, []);

    // Fetch organized icons from API with pagination
    const fetchIcons = useCallback(async (page: number, append = false) => {
        try {
            if (page === 1) {
                setLoading(true);
            } else {
                setLoadingMore(true);
            }

            const response = await iconsAPI.getOrganized({
                page,
                limit: 500
            });

            if (response.success) {
                if (append) {
                    // Merge with existing category groups
                    setCategoryGroups(prev => {
                        const newGroups = [...prev];
                        const categoryMap = new Map<string, number>();

                        // Create map of existing categories
                        newGroups.forEach((group, index) => {
                            categoryMap.set(group.category._id, index);
                        });

                        // Merge or add new categories
                        response.data.forEach((newGroup: CategoryGroup) => {
                            const existingIndex = categoryMap.get(newGroup.category._id);
                            if (existingIndex !== undefined) {
                                // Merge icons into existing category
                                newGroups[existingIndex] = {
                                    ...newGroups[existingIndex],
                                    icons: [...newGroups[existingIndex].icons, ...newGroup.icons],
                                    iconCount: newGroups[existingIndex].iconCount + newGroup.iconCount
                                };
                            } else {
                                // Add new category
                                newGroups.push(newGroup);
                            }
                        });

                        return newGroups;
                    });
                } else {
                    // First page - replace all
                    setCategoryGroups(response.data);
                }

                setTotalIcons(response.summary?.totalIcons || 0);
                setHasMore(response.pagination?.hasNextPage || false);
            }
        } catch (error) {
            console.error('Error fetching icons:', error);
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    }, []);

    // Handle search query changes
    useEffect(() => {
        if (searchQuery.trim()) {
            // If there's a search query, perform search
            searchIcons(searchQuery.trim());
        } else {
            // If search is empty, fetch all organized icons
            setCurrentPage(1);
            fetchIcons(1, false);
        }
    }, [searchQuery, searchIcons, fetchIcons]);

    // Intersection Observer for infinite scroll (only for non-search mode)
    useEffect(() => {
        // Don't use infinite scroll when searching
        if (searchQuery.trim()) {
            return;
        }

        const observer = new IntersectionObserver(
            (entries) => {
                const first = entries[0];
                if (first.isIntersecting && hasMore && !loading && !loadingMore) {
                    // Load next page
                    const nextPage = currentPage + 1;
                    setCurrentPage(nextPage);
                    fetchIcons(nextPage, true);
                }
            },
            {
                root: null,
                rootMargin: '200px', // Start loading 200px before reaching the bottom
                threshold: 0
            }
        );

        const currentLoadMoreRef = loadMoreRef.current;
        if (currentLoadMoreRef) {
            observer.observe(currentLoadMoreRef);
        }

        return () => {
            if (currentLoadMoreRef) {
                observer.unobserve(currentLoadMoreRef);
            }
        };
    }, [hasMore, loading, loadingMore, currentPage, searchQuery, fetchIcons]);

    // Security: Disable keyboard shortcuts and protect canvas
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Prevent save/print shortcuts
            if ((e.ctrlKey || e.metaKey) && ['s', 'S', 'p', 'P'].includes(e.key)) {
                e.preventDefault();
            }
        };

        const handleContextMenu = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            // Prevent right-click on canvas elements
            if (target.tagName === 'CANVAS') {
                e.preventDefault();
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        document.addEventListener('contextmenu', handleContextMenu);

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            document.removeEventListener('contextmenu', handleContextMenu);
        };
    }, []);

    const handleIconClick = (icon: Icon) => {
        if (selectedIcon?._id === icon._id && isEditorOpen) {
            closeEditor();
        } else {
            openEditor(icon);
        }
    };

    const openEditor = (icon: Icon) => {
        setSelectedIcon(icon);
        setIsEditorOpen(true);

        // Prevent body scroll only on mobile
        if (window.innerWidth < 768) {
            document.body.style.overflow = "hidden";
        }
    };

    const closeEditor = () => {
        setIsEditorOpen(false);
        setSelectedIcon(null);

        // Restore body scroll only on mobile
        if (window.innerWidth < 768) {
            document.body.style.overflow = "auto";
        }
    };

    return (
        <div className="w-full md:px-[40px] px-[16px] py-[32px] gap-[10px] flex">
            <div ref={mainContentRef} className={`flex flex-col gap-[32px] w-full`}>
                <div className="w-full flex flex-col gap-[32px] justify-center items-start">
                    {loading ? (
                        <div className="w-full flex justify-center items-center py-[40px]">
                            <div className="flex flex-col items-center gap-[12px]">
                                <div className="w-[40px] h-[40px] border-4 border-[#E84C88] border-t-transparent rounded-full animate-spin"></div>
                                <div className="text-[#b7b7b7] text-[14px]">Loading icons...</div>
                            </div>
                        </div>
                    ) : categoryGroups.length === 0 ? (
                        <div className="w-full flex justify-center items-center py-[40px]">
                            <div className="text-[#b7b7b7] text-[14px]">No icons found</div>
                        </div>
                    ) : (
                        <div className="w-full flex flex-col gap-[40px]">
                            {categoryGroups.map((group) => (
                                <div key={group.category._id} className="w-full flex flex-col gap-[20px]">
                                    {/* Category Header */}
                                    <h2 className="text-[#0e0e0e] text-[16px] font-semibold leading-[24px] ml-[16px]">
                                        {group.category.name}
                                        <span className="ml-[8px] text-[#b7b7b7] text-[12px] font-normal">
                                            ({group.iconCount} {group.iconCount === 1 ? 'icon' : 'icons'})
                                        </span>
                                    </h2>

                                    {/* Icons Grid */}
                                    <div
                                        className="w-full flex flex-wrap justify-start gap-[12px]"
                                        onContextMenu={(e) => e.preventDefault()}
                                        onDragStart={(e) => e.preventDefault()}
                                    >
                                        {group.icons.map((icon) => (
                                            <div
                                                key={icon._id}
                                                className={`relative w-[83.5px] md:w-[102px] h-[83.5px] md:h-[102px] rounded-[20px] border flex justify-center items-center cursor-pointer transition-colors select-none ${selectedIcon?._id === icon._id ? "border-[#0e0e0e]" : "border-[#ececec]"
                                                    }`}
                                                onClick={() => handleIconClick(icon)}
                                                onContextMenu={(e) => e.preventDefault()}
                                            >
                                                {/* Show PRO badge if icon is premium AND user is NOT premium */}
                                                {icon.isPremium && !userIsPremium && (
                                                    <div className="absolute -top-[10px] bg-[#7AE684] h-[18px] text-[#2D6332] text-[8px] font-extrabold px-[8px] py-[4px] rounded-full">
                                                        PRO
                                                    </div>
                                                )}

                                                {/* Secure Canvas Display - Prevents direct image download */}
                                                <SecureIconCanvas
                                                    iconUrl={icon.cloudinaryUrl.webp}
                                                    iconName={icon.name}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Loading more indicator */}
                    {loadingMore && (
                        <div className="w-full flex justify-center items-center py-[40px]">
                            <div className="flex flex-col items-center gap-[12px]">
                                <div className="w-[40px] h-[40px] border-4 border-[#E84C88] border-t-transparent rounded-full animate-spin"></div>
                                <p className="text-[#b7b7b7] text-[14px]">Loading more icons...</p>
                            </div>
                        </div>
                    )}

                    {/* Intersection Observer trigger */}
                    {hasMore && !loading && (
                        <div ref={loadMoreRef} className="w-full h-[20px]" />
                    )}

                    {/* No more icons message */}
                    {!hasMore && !loading && categoryGroups.length > 0 && (
                        <div className="w-full flex justify-center items-center py-[40px]">
                            <div className="flex flex-col items-center gap-[8px]">
                                <p className="text-[#0e0e0e] text-[16px] font-semibold">
                                    🎉 You've reached the end!
                                </p>
                                <p className="text-[#b7b7b7] text-[14px]">
                                    All {totalIcons} icons loaded
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {isEditorOpen && selectedIcon && (
                <>
                    {/* Desktop: Side panel */}
                    <div className="hidden md:block w-[400px] px-[10px] sticky top-[120px] self-start max-h-[calc(100vh-120px)] overflow-y-auto ml-[20px]" style={{ scrollBehavior: 'smooth', scrollbarWidth: 'thin' }}>
                        <IconsEditor selectedIcon={selectedIcon} />
                    </div>

                    {/* Mobile: Full screen popup */}
                    <div className="md:hidden fixed inset-0 z-50 bg-white overflow-hidden">
                        <div className="w-full h-full flex flex-col overflow-hidden">
                            <div className="flex justify-between items-center p-4 border-b border-[#ececec] flex-shrink-0">
                                <h2 className="text-[#0e0e0e] text-[18px] font-bold">Icon Editor</h2>
                                <button
                                    onClick={closeEditor}
                                    className="text-[#454545] text-[24px] hover:text-[#0e0e0e]"
                                >
                                    ✕
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto overscroll-contain">
                                <IconsEditor selectedIcon={selectedIcon} />
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}