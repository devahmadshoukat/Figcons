"use client";
import { useEffect, useState } from "react";

/**
 * Custom hook to handle responsive media queries
 * @param query - CSS media query string (e.g. '(min-width: 768px)')
 * @returns boolean indicating if the media query matches
 */
export default function useMediaQuery(query: string): boolean {
    const [matches, setMatches] = useState<boolean>(false);

    useEffect(() => {
        // Check if we're in the browser environment
        if (typeof window === 'undefined') {
            return;
        }

        try {
            const mediaQueryList = window.matchMedia(query);
            setMatches(mediaQueryList.matches);

            const documentChangeHandler = (event: MediaQueryListEvent) => setMatches(event.matches);
            mediaQueryList.addEventListener('change', documentChangeHandler);

            return () => {
                mediaQueryList.removeEventListener('change', documentChangeHandler);
            };
        } catch (error) {
            console.warn(`Invalid media query: ${query}`, error);
        }
    }, [query]);

    return matches;
}