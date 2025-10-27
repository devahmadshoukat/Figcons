"use client";
import { useEffect, useState, useCallback } from "react";
import IconsEditor from "./IconsEditor";
import { BACKEND_URL } from "@/commons/Api";

interface Icon {
    _id: string;
    name: string;
    cloudinaryUrl: string;
    isPremium: boolean;
    category: {
        _id: string;
        name: string;
        cloudinaryFolder: string;
    };
    isPublic: boolean;
    fileName: string;
    createdAt: string;
    updatedAt: string;
}

interface PaginationInfo {
    totalItems: number;
    currentPage: number;
    totalPages: number;
    limit: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
    nextPage: number | null;
    prevPage: number | null;
}

export default function IconsCanvas() {
    const API_URL = `${BACKEND_URL}/api/icons`;
    const [icons, setIcons] = useState<Icon[]>([]);
    const [selectedIcon, setSelectedIcon] = useState<Icon | null>(null);
    const [pagination, setPagination] = useState<PaginationInfo | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const [hasMorePages, setHasMorePages] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Draw icon on canvas
    const drawImageOnCanvas = (canvas: HTMLCanvasElement, imageUrl: string) => {
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const img = new Image();
        img.crossOrigin = 'anonymous';

        img.onload = () => {
            canvas.width = 40;
            canvas.height = 40;
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            const scale = Math.min(canvas.width / img.width, canvas.height / img.height);
            const scaledWidth = img.width * scale;
            const scaledHeight = img.height * scale;
            const x = (canvas.width - scaledWidth) / 2;
            const y = (canvas.height - scaledHeight) / 2;
            ctx.drawImage(img, x, y, scaledWidth, scaledHeight);
        };

        img.onerror = () => {
            ctx.fillStyle = '#f6f6f6';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = '#b7b7b7';
            ctx.font = '20px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('★', canvas.width / 2, canvas.height / 2);
        };

        img.src = imageUrl;
    };

    // Handle canvas reference
    const handleCanvasRef = (canvas: HTMLCanvasElement | null, imageUrl: string) => {
        if (canvas && imageUrl) {
            drawImageOnCanvas(canvas, imageUrl);
            canvas.addEventListener('contextmenu', (e) => e.preventDefault());
        }
    };

    // Fetch icons with infinite scroll support
    const fetchIcons = async (page: number = 1, append: boolean = false) => {
        if (append) {
            setLoadingMore(true);
        } else {
            setLoading(true);
        }
        setError(null);

        try {
            const response = await fetch(`${API_URL}?page=${page}&limit=100&sort=createdAt&order=desc`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            if (data.success && data.data) {
                // Sort premium icons to top
                const sorted = data.data.sort((a: Icon, b: Icon) =>
                    a.isPremium === b.isPremium ? 0 : a.isPremium ? -1 : 1
                );

                if (append) {
                    setIcons(prevIcons => [...prevIcons, ...sorted]);
                } else {
                    setIcons(sorted);
                }

                setPagination(data.pagination);
                setCurrentPage(page);
                setHasMorePages(data.pagination.hasNextPage);
            } else {
                setError('API returned unsuccessful response');
            }
        } catch (err) {
            console.error("Error fetching icons:", err);

            if (err instanceof TypeError && err.message.includes('fetch')) {
                setError('Unable to connect to the server. Please check if both the frontend and backend servers are running.');
            } else if (err instanceof Error) {
                setError(`Error: ${err.message}`);
            } else {
                setError('An unexpected error occurred while fetching icons.');
            }

            if (!append) {
                setIcons([]);
                setPagination(null);
            }
        } finally {
            if (append) {
                setLoadingMore(false);
            } else {
                setLoading(false);
            }
        }
    };

    // Initial fetch
    useEffect(() => {
        fetchIcons(1);
    }, []);

    // Handle icon click
    const handleIconClick = (icon: Icon) => {
        setSelectedIcon(icon);
    };

    // Handle close editor
    const handleCloseEditor = () => {
        setSelectedIcon(null);
    };

    // Retry function for failed requests
    const handleRetry = () => {
        fetchIcons(currentPage);
    };

    // Load more icons for infinite scroll
    const loadMoreIcons = useCallback(() => {
        if (!loadingMore && hasMorePages && pagination) {
            fetchIcons(currentPage + 1, true);
        }
    }, [loadingMore, hasMorePages, pagination, currentPage]);

    // Infinite scroll detection with throttling
    useEffect(() => {
        let timeoutId: NodeJS.Timeout;

        const handleScroll = () => {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => {
                const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
                const windowHeight = window.innerHeight;
                const documentHeight = document.documentElement.scrollHeight;

                const scrollPercentage = (scrollTop + windowHeight) / documentHeight;

                if (scrollPercentage >= 0.5 && !loadingMore && hasMorePages) {
                    loadMoreIcons();
                }
            }, 100);
        };

        window.addEventListener('scroll', handleScroll, { passive: true });

        return () => {
            window.removeEventListener('scroll', handleScroll);
            clearTimeout(timeoutId);
        };
    }, [loadingMore, hasMorePages, currentPage, pagination, loadMoreIcons]);

    // Handle body overflow when editor opens/closes
    useEffect(() => {
        if (selectedIcon) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }

        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [selectedIcon]);

    return (
        <div className="w-full flex">
            {/* Left side - Icons Canvas */}
            <div className="flex-1 md:px-[40px] px-[16px] py-[32px] overflow-y-auto w-[80%]">
                <div className="flex flex-col gap-[32px] w-full">
                    <div className="flex flex-col gap-[20px] items-start">
                        <div className="flex flex-col gap-[8px] ml-[16px]">
                            <h1 className="text-[#0e0e0e] text-[18px] font-bold leading-[32px]">
                                3D Editor
                                <span className="ml-[12px] text-[#b7b7b7] text-[14px] font-normal leading-[20px]">
                                    {pagination ? `${pagination.totalItems} Icons` : `${icons.length} Icons`}
                                </span>
                            </h1>
                            {pagination && (
                                <p className="text-[#666666] text-[12px] font-normal leading-[16px]">
                                    Showing {icons.length} of {pagination.totalItems} icons
                                    {hasMorePages && (
                                        <span className="ml-2 text-[#0e0e0e] font-medium">• Scroll to load more</span>
                                    )}
                                </p>
                            )}
                        </div>

                        <div className="w-full flex flex-wrap justify-center gap-[12px]">
                            {loading ? (
                                <div className="w-full flex justify-center items-center py-8">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0e0e0e]"></div>
                                </div>
                            ) : error ? (
                                <div className="w-full flex flex-col items-center justify-center py-12 px-4">
                                    <div className="text-center max-w-md">
                                        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                            </svg>
                                        </div>
                                        <h3 className="text-[#0e0e0e] text-[18px] font-bold mb-2">Connection Error</h3>
                                        <p className="text-[#666666] text-[14px] mb-6">{error}</p>
                                        <button
                                            onClick={handleRetry}
                                            className="px-6 py-3 bg-[#0e0e0e] text-white rounded-full text-[14px] font-semibold hover:bg-[#333333] transition-all duration-200"
                                        >
                                            Try Again
                                        </button>
                                    </div>
                                </div>
                            ) : icons.length === 0 ? (
                                <div className="w-full flex flex-col items-center justify-center py-12 px-4">
                                    <div className="text-center max-w-md">
                                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <svg className="w-8 h-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                                            </svg>
                                        </div>
                                        <h3 className="text-[#0e0e0e] text-[18px] font-bold mb-2">No Icons Found</h3>
                                        <p className="text-[#666666] text-[14px] mb-6">No icons are available at the moment.</p>
                                        <button
                                            onClick={handleRetry}
                                            className="px-6 py-3 bg-[#0e0e0e] text-white rounded-full text-[14px] font-semibold hover:bg-[#333333] transition-all duration-200"
                                        >
                                            Refresh
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                icons.map((item) => (
                                    <div
                                        key={item._id}
                                        onClick={() => handleIconClick(item)}
                                        onContextMenu={(e) => e.preventDefault()}
                                        className={`relative w-[83.5px] md:w-[102px] h-[83.5px] md:h-[102px] rounded-[20px] border border-[#ECECEC] flex justify-center items-center cursor-pointer transition-all duration-300 hover:border-[#0e0e0e] bg-white hover:shadow-md`}
                                    >
                                        {/* Premium badge */}
                                        {item.isPremium && (
                                            <div className="absolute text-[#0e0e0e] top-2 right-2 text-[14px] font-bold">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none">
                                                    <path d="M13.1655 2.3045L14.4105 3.003L15.838 3.0205C16.668 3.031 17.433 3.4725 17.857 4.186L18.586 5.4135L19.8135 6.1425C20.5275 6.5665 20.969 7.3315 20.979 8.1615L20.9965 9.589L21.695 10.834C22.101 11.558 22.101 12.4415 21.695 13.1655L20.9965 14.4105L20.979 15.838C20.9685 16.668 20.527 17.433 19.8135 17.857L18.586 18.586L17.857 19.8135C17.433 20.5275 16.668 20.969 15.838 20.979L14.4105 20.9965L13.1655 21.695C12.4415 22.101 11.558 22.101 10.834 21.695L9.589 20.9965L8.1615 20.979C7.3315 20.9685 6.5665 20.527 6.1425 19.8135L5.4135 18.586L4.186 17.857C3.472 17.433 3.0305 16.668 3.0205 15.838L3.003 14.4105L2.3045 13.1655C1.8985 12.4415 1.8985 11.558 2.3045 10.834L3.003 9.589L3.0205 8.1615C3.031 7.3315 3.4725 6.5665 4.186 6.1425L5.4135 5.4135L6.1425 4.186C6.5665 3.472 7.3315 3.0305 8.1615 3.0205L9.589 3.003L10.834 2.3045C11.5585 1.8985 12.4415 1.8985 13.1655 2.3045Z" fill="url(#paint0_linear_5329_72240)" />
                                                    <path opacity="0.05" d="M16.0861 8.08584L11.0001 13.1718L8.41412 10.5858C8.02362 10.1953 7.39062 10.1953 7.00012 10.5858L6.29312 11.2928C5.90262 11.6833 5.90262 12.3163 6.29312 12.7068L10.2931 16.7068C10.6836 17.0973 11.3166 17.0973 11.7071 16.7068L18.2071 10.2068C18.5976 9.81634 18.5976 9.18334 18.2071 8.79284L17.5001 8.08584C17.1096 7.69534 16.4766 7.69534 16.0861 8.08584Z" fill="black" />
                                                    <path opacity="0.07" d="M10.4695 16.5302L6.46951 12.5302C6.17651 12.2372 6.17651 11.7622 6.46951 11.4697L7.17651 10.7627C7.46951 10.4697 7.94451 10.4697 8.23701 10.7627L11 13.5252L16.2625 8.26272C16.5555 7.96972 17.0305 7.96972 17.323 8.26272L18.03 8.96972C18.323 9.26272 18.323 9.73772 18.03 10.0302L11.53 16.5302C11.2375 16.8227 10.7625 16.8227 10.4695 16.5302Z" fill="black" />
                                                    <path d="M10.6465 16.3536L6.6465 12.3536C6.451 12.1581 6.451 11.8416 6.6465 11.6466L7.3535 10.9396C7.549 10.7441 7.8655 10.7441 8.0605 10.9396L11 13.8791L16.4395 8.43959C16.635 8.24409 16.9515 8.24409 17.1465 8.43959L17.8535 9.14659C18.049 9.34209 18.049 9.65859 17.8535 9.85359L11.3535 16.3536C11.1585 16.5491 10.8415 16.5491 10.6465 16.3536Z" fill="white" />
                                                    <defs>
                                                        <linearGradient id="paint0_linear_5329_72240" x1="5.1975" y1="5.1975" x2="18.973" y2="18.973" gradientUnits="userSpaceOnUse">
                                                            <stop stopColor="#75DAFF" />
                                                            <stop offset="1" stopColor="#1EA2E4" />
                                                        </linearGradient>
                                                    </defs>
                                                </svg>
                                            </div>
                                        )}

                                        <canvas
                                            ref={(canvas) => handleCanvasRef(canvas, item.cloudinaryUrl)}
                                            className="w-[32px] h-[32px] rounded-lg"
                                            style={{ imageRendering: 'auto' }}
                                            onContextMenu={(e) => e.preventDefault()}
                                        />
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Infinite Scroll Loading Indicator */}
                        {loadingMore && (
                            <div className="flex w-[100%] justify-center items-center py-8">
                                <div className="flex flex-col items-center gap-3">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0e0e0e]"></div>
                                </div>
                            </div>
                        )}

                        {/* End of content indicator */}
                        {!hasMorePages && icons.length > 0 && !error && (
                            <div className="flex justify-center items-center py-8">
                                <div className="flex flex-col items-center gap-2">
                                    <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                                        <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                    </div>
                                    <p className="text-[#666666] text-[14px] font-medium">All icons loaded</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Backdrop overlay */}
            {selectedIcon && (
                <div
                    className="fixed inset-0 bg-black/20 z-[9999] animate-fadeIn"
                    onClick={handleCloseEditor}
                />
            )}

            {/* Right side - Icons Editor */}
            {selectedIcon && (
                <div className="fixed right-0 top-0 w-[100%] md:w-[300px] 3xl:w-[350px] h-full bg-white border-l border-[#ececec] shadow-2xl z-[9999] overflow-y-auto animate-slideInRight" style={{ scrollbarWidth: 'thin' }}>
                    <div className="sticky top-0 bg-white/95 backdrop-blur-sm border-b border-[#ececec] p-4 z-10">
                        <div className="flex justify-between items-center">
                            <div className="flex flex-col gap-[2px]">
                                <h2 className="text-[#0e0e0e] text-[16px] font-bold leading-[20px]">Icon Editor</h2>
                                <p className="text-[#666666] text-[11px] font-normal leading-[14px]">Customize and export</p>
                            </div>
                            <button
                                onClick={handleCloseEditor}
                                className="text-[#454545] hover:text-[#0e0e0e] transition-all duration-200 p-2 rounded-full hover:bg-gray-100 hover:scale-105"
                                title="Close editor"
                            >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <line x1="18" y1="6" x2="6" y2="18"></line>
                                    <line x1="6" y1="6" x2="18" y2="18"></line>
                                </svg>
                            </button>
                        </div>
                    </div>
                    <div className="p-4 pb-8">
                        <IconsEditor selectedIcon={selectedIcon} onClose={handleCloseEditor} />
                    </div>
                </div>
            )}
        </div>
    );
}