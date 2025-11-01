"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";

export default function IconShowcase() {
    const svgRefs = useRef<(HTMLDivElement | null)[]>([]);
    const containerRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        // Intersection Observer to trigger animation when component enters viewport
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        // Trigger animations when component is visible
                        runAnimations();
                        // Unobserve after animation is triggered (only animate once)
                        observer.unobserve(container);
                    }
                });
            },
            {
                threshold: 0.1, // Trigger when 10% of component is visible
                rootMargin: '0px' // You can adjust this to trigger earlier/later
            }
        );

        observer.observe(container);

        let timeoutId: NodeJS.Timeout | null = null;

        // Function to run all animations
        const runAnimations = () => {
            // Use requestAnimationFrame to ensure SVGs are fully rendered
            timeoutId = setTimeout(() => {
            svgRefs.current.forEach((svgContainer, index) => {
                if (!svgContainer) return;

                const svg = svgContainer.querySelector("svg");
                if (!svg) return;

                // Get all icon groups (g elements with filters or paths)
                const iconGroups = svg.querySelectorAll("g[filter], g > path");
                const allPaths = svg.querySelectorAll("path");
                const rects = svg.querySelectorAll("rect");

                // Set initial states with GPU acceleration hints
                gsap.set(iconGroups, {
                    opacity: 0,
                    scale: 0.8,
                    transformOrigin: "center center",
                    force3D: true
                });
                gsap.set(allPaths, {
                    opacity: 0,
                    force3D: true
                });
                gsap.set(rects, {
                    opacity: 0,
                    scale: 0.9,
                    force3D: true
                });

                // Create master timeline for this SVG with smooth easing
                const tl = gsap.timeline({
                    delay: index * 0.15,
                    defaults: { ease: "power2.out", force3D: true }
                });

                // Animate background rects first with optimized stagger
                tl.to(rects, {
                    opacity: 1,
                    scale: 1,
                    duration: 0.6,
                    stagger: {
                        amount: 0.4,
                        from: "start"
                    },
                    ease: "power2.out",
                    force3D: true
                });

                // Animate icon groups with optimized stagger
                tl.to(iconGroups, {
                    opacity: 1,
                    scale: 1,
                    duration: 0.5,
                    stagger: {
                        amount: 1.2,
                        from: "start"
                    },
                    ease: "back.out(1.5)",
                    force3D: true
                }, "-=0.3");

                // Animate paths (draw effect for stroke paths, fade for fill paths) - optimized
                allPaths.forEach((path, pathIndex) => {
                    const pathElement = path as SVGPathElement;
                    const hasStroke = pathElement.getAttribute("stroke");
                    const hasFill = pathElement.getAttribute("fill") && pathElement.getAttribute("fill") !== "none";

                    if (hasStroke && pathElement.getTotalLength() > 0) {
                        // Optimized draw animation for stroked paths
                        const length = pathElement.getTotalLength();
                        gsap.set(pathElement, {
                            strokeDasharray: length,
                            strokeDashoffset: length
                        });

                        tl.to(pathElement, {
                            strokeDashoffset: 0,
                            opacity: 1,
                            duration: 0.8,
                            ease: "power2.inOut",
                            force3D: true
                        }, pathIndex * 0.015);
                    } else if (hasFill) {
                        // Optimized fade in for filled paths
                        tl.to(pathElement, {
                            opacity: 1,
                            duration: 0.4,
                            ease: "power2.out",
                            force3D: true
                        }, pathIndex * 0.01);
                    } else {
                        // Default optimized fade for other paths
                        tl.to(pathElement, {
                            opacity: 1,
                            duration: 0.4,
                            ease: "power1.out",
                            force3D: true
                        }, pathIndex * 0.008);
                    }
                });

                // Optimized continuous animation for highlighted icons (limited to avoid lag)
                const highlightedIcons = svg.querySelectorAll('path[stroke="#E84C88"], path[fill="#E84C88"]');
                // Limit to first 10 icons to prevent performance issues
                Array.from(highlightedIcons).slice(0, 10).forEach((icon, iconIndex) => {
                    const parentGroup = icon.parentElement;
                    if (parentGroup && parentGroup.tagName === 'g') {
                        gsap.to(parentGroup, {
                            scale: 1.03,
                            duration: 2.5,
                            repeat: -1,
                            yoyo: true,
                            ease: "sine.inOut",
                            delay: 1.5 + index * 0.15 + iconIndex * 0.1,
                            transformOrigin: "center center",
                            force3D: true
                        });
                    } else {
                        // Fallback: animate opacity for paths without groups
                        gsap.to(icon, {
                            opacity: 0.85,
                            duration: 2.5,
                            repeat: -1,
                            yoyo: true,
                            ease: "sine.inOut",
                            delay: 1.5 + index * 0.15 + iconIndex * 0.1,
                            force3D: true
                        });
                    }
                });

                // Animate the pink border with continuous infinite animation
                // Find the rect with pink gradient border (the large card with 144x144 dimensions)
                const allRects = svg.querySelectorAll('rect');
                let pinkBorderRect: SVGRectElement | null = null;
                allRects.forEach((rect) => {
                    const stroke = rect.getAttribute('stroke');
                    if (stroke && stroke.includes('paint1_linear')) {
                        pinkBorderRect = rect as SVGRectElement;
                    }
                });

                if (pinkBorderRect) {
                    // Optimized moving border effect with GPU acceleration
                    const borderLength = (144 * 2 + 144 * 2); // perimeter: 576
                    const dashLength = 60; // Length of the moving border segment
                    const gapLength = borderLength - dashLength; // Rest is gap

                    gsap.set(pinkBorderRect, {
                        strokeDasharray: `${dashLength} ${gapLength}`,
                        strokeDashoffset: 0,
                        force3D: true
                    });

                    // Optimized smooth moving border animation
                    gsap.to(pinkBorderRect, {
                        strokeDashoffset: borderLength,
                        duration: 1.8,
                        repeat: -1,
                        ease: "none",
                        delay: 0.3 + index * 0.1,
                        force3D: true
                    });
                }

                // Optimized floating animations - limit to prevent lag
                const cardGroups = svg.querySelectorAll('g[filter]');
                // Limit floating animations to prevent performance issues
                Array.from(cardGroups).slice(0, 15).forEach((group, groupIndex) => {
                    const cardGroup = group as SVGGElement;

                    // Optimized subtle floating animation
                    gsap.to(cardGroup, {
                        y: -2,
                        duration: 3,
                        repeat: -1,
                        yoyo: true,
                        ease: "power1.inOut",
                        delay: 0.8 + index * 0.2 + groupIndex * 0.08,
                        transformOrigin: "center center",
                        force3D: true
                    });
                });

                // Optimized fade and scale for elements - limited to prevent lag
                const allElements = svg.querySelectorAll('g[filter], path, rect[fill="white"]');
                let fadedCount = 0;
                allElements.forEach((element, elemIndex) => {
                    if (element.getAttribute('opacity') === '0.4' && fadedCount < 10) {
                        // Optimized subtle pulse for faded cards (limited count)
                        gsap.to(element, {
                            opacity: 0.48,
                            duration: 3.5,
                            repeat: -1,
                            yoyo: true,
                            ease: "sine.inOut",
                            delay: 1.5 + index * 0.15 + fadedCount * 0.1,
                            force3D: true
                        });
                        fadedCount++;
                    }
                });

                // Optimized animations for third SVG (Smooth icons)
                // Animate connection lines with optimized drawing effect
                const connectionLines = svg.querySelectorAll('path[stroke="#ECECEC"]');
                if (connectionLines.length > 0) {
                    connectionLines.forEach((line, lineIndex) => {
                        const pathElement = line as SVGPathElement;
                        if (pathElement.getTotalLength() > 0) {
                            const length = pathElement.getTotalLength();
                            gsap.set(pathElement, {
                                strokeDasharray: length,
                                strokeDashoffset: length,
                                opacity: 0,
                                force3D: true
                            });

                            tl.to(pathElement, {
                                strokeDashoffset: 0,
                                opacity: 0.6,
                                duration: 1.0,
                                ease: "power2.inOut",
                                force3D: true
                            }, 0.6 + lineIndex * 0.08);
                        }
                    });
                }

                // Optimized pink card animation
                const pinkCard = svg.querySelector('rect[fill="#E84C88"]');
                if (pinkCard) {
                    gsap.set(pinkCard, {
                        scale: 0.85,
                        opacity: 0,
                        transformOrigin: "center center",
                        force3D: true
                    });

                    tl.to(pinkCard, {
                        scale: 1,
                        opacity: 1,
                        duration: 0.5,
                        ease: "back.out(1.5)",
                        force3D: true
                    }, 0.4);

                    // Optimized continuous pulse for pink card
                    gsap.to(pinkCard, {
                        scale: 1.03,
                        duration: 2.5,
                        repeat: -1,
                        yoyo: true,
                        ease: "sine.inOut",
                        delay: 1.5 + index * 0.15,
                        force3D: true
                    });
                }

                // Optimized opacity 0.6 elements - limited to prevent lag
                const fadedElements = svg.querySelectorAll('[opacity="0.6"]');
                Array.from(fadedElements).slice(0, 12).forEach((element, fadeIndex) => {
                    gsap.set(element, {
                        opacity: 0,
                        y: 8,
                        force3D: true
                    });

                    tl.to(element, {
                        opacity: 0.6,
                        y: 0,
                        duration: 0.6,
                        ease: "power2.out",
                        force3D: true
                    }, 0.8 + fadeIndex * 0.1);

                    // Optimized continuous fade animation
                    gsap.to(element, {
                        opacity: 0.68,
                        duration: 3.5,
                        repeat: -1,
                        yoyo: true,
                        ease: "sine.inOut",
                        delay: 2 + index * 0.15 + fadeIndex * 0.08,
                        force3D: true
                    });
                });

                // Optimized white cards animation
                const whiteCards = svg.querySelectorAll('rect[fill="white"]');
                whiteCards.forEach((card, cardIndex) => {
                    const rectElement = card as SVGRectElement;
                    const parentGroup = rectElement.parentElement;

                    if (parentGroup && !parentGroup.hasAttribute('opacity')) {
                        gsap.set(rectElement, {
                            scale: 0.95,
                            opacity: 0,
                            force3D: true
                        });

                        tl.to(rectElement, {
                            scale: 1,
                            opacity: 1,
                            duration: 0.4,
                            ease: "power2.out",
                            force3D: true
                        }, 0.5 + cardIndex * 0.06);
                    }
                });

                // Optimized animation for paths inside cards
                whiteCards.forEach((card) => {
                    const parentGroup = (card as SVGRectElement).parentElement;
                    if (parentGroup) {
                        const pathsInCard = parentGroup.querySelectorAll('path');
                        pathsInCard.forEach((path, pathIndex) => {
                            const pathElement = path as SVGPathElement;
                            const strokeColor = pathElement.getAttribute('stroke');
                            // Only animate paths that are not connection lines
                            if (strokeColor && strokeColor !== '#ECECEC') {
                                gsap.set(pathElement, {
                                    opacity: 0,
                                    force3D: true
                                });

                                tl.to(pathElement, {
                                    opacity: 1,
                                    duration: 0.5,
                                    ease: "power2.out",
                                    force3D: true
                                }, 0.7 + pathIndex * 0.04);
                            }
                        });
                    }
                });

                // Optimized paths in pink card
                if (pinkCard) {
                    const pinkCardGroup = (pinkCard as SVGRectElement).parentElement;
                    if (pinkCardGroup) {
                        const pinkPaths = pinkCardGroup.querySelectorAll('path');
                        pinkPaths.forEach((path, pathIndex) => {
                            const pathElement = path as SVGPathElement;
                            gsap.set(pathElement, {
                                opacity: 0,
                                force3D: true
                            });

                            tl.to(pathElement, {
                                opacity: 1,
                                duration: 0.5,
                                ease: "power2.out",
                                force3D: true
                            }, 0.6 + pathIndex * 0.04);
                        });
                    }
                }

                // Optimized animations for fourth SVG (Brutalist icons)
                // Animate connection lines with optimized drawing effect
                const brutalistLines = svg.querySelectorAll('path[stroke="#ECECEC"]');
                if (brutalistLines.length > 0 && brutalistLines.length < 10) {
                    // Only for brutalist SVG which has 2 connection lines
                    brutalistLines.forEach((line, lineIndex) => {
                        const pathElement = line as SVGPathElement;
                        if (pathElement.getTotalLength() > 0) {
                            const length = pathElement.getTotalLength();
                            gsap.set(pathElement, {
                                strokeDasharray: length,
                                strokeDashoffset: length,
                                opacity: 0,
                                force3D: true
                            });

                            tl.to(pathElement, {
                                strokeDashoffset: 0,
                                opacity: 0.8,
                                duration: 1.2,
                                ease: "power2.inOut",
                                force3D: true
                            }, 0.6 + lineIndex * 0.15);
                        }
                    });
                }

                // Optimized faded cards (opacity 0.15) - limited to prevent lag
                const brutalistFadedCards = svg.querySelectorAll('[opacity="0.15"]');
                Array.from(brutalistFadedCards).slice(0, 15).forEach((card, cardIndex) => {
                    const cardElement = card as SVGGElement;
                    gsap.set(cardElement, {
                        opacity: 0,
                        scale: 0.9,
                        y: 4,
                        transformOrigin: "center center",
                        force3D: true
                    });

                    tl.to(cardElement, {
                        opacity: 0.15,
                        scale: 1,
                        y: 0,
                        duration: 0.6,
                        ease: "power2.out",
                        force3D: true
                    }, 0.4 + cardIndex * 0.04);

                    // Optimized continuous animation for faded cards
                    gsap.to(cardElement, {
                        opacity: 0.18,
                        duration: 4.5,
                        repeat: -1,
                        yoyo: true,
                        ease: "sine.inOut",
                        delay: 2 + index * 0.15 + cardIndex * 0.06,
                        force3D: true
                    });
                });

                // Optimized highlighted pink cards animation
                const highlightedBrutalistCards = svg.querySelectorAll('g[filter*="filter28_d"], g[filter*="filter29_d"]');
                highlightedBrutalistCards.forEach((card, cardIndex) => {
                    const cardElement = card as SVGGElement;
                    gsap.set(cardElement, {
                        scale: 0.95,
                        opacity: 0,
                        transformOrigin: "center center",
                        force3D: true
                    });

                    tl.to(cardElement, {
                        scale: 1,
                        opacity: 1,
                        duration: 0.6,
                        ease: "back.out(1.5)",
                        force3D: true
                    }, 0.5 + cardIndex * 0.15);

                    // Optimized continuous pulse animation
                    gsap.to(cardElement, {
                        scale: 1.02,
                        duration: 2.5,
                        repeat: -1,
                        yoyo: true,
                        ease: "sine.inOut",
                        delay: 1.5 + index * 0.15 + cardIndex * 0.08,
                        transformOrigin: "center center",
                        force3D: true
                    });

                    // Optimized paths inside highlighted cards
                    const pathsInCard = cardElement.querySelectorAll('path');
                    pathsInCard.forEach((path, pathIndex) => {
                        const pathElement = path as SVGPathElement;
                        const strokeColor = pathElement.getAttribute('stroke');
                        if (strokeColor === '#E84C88') {
                            gsap.set(pathElement, {
                                opacity: 0,
                                force3D: true
                            });

                            tl.to(pathElement, {
                                opacity: 1,
                                duration: 0.5,
                                ease: "power2.out",
                                force3D: true
                            }, 0.7 + cardIndex * 0.15 + pathIndex * 0.04);
                        }
                    });
                });

                // Optimized animation for all rects in brutalist SVG
                const brutalistRects = svg.querySelectorAll('rect[fill="white"], rect[fill="#F6F6F6"]');
                brutalistRects.forEach((rect, rectIndex) => {
                    const rectElement = rect as SVGRectElement;
                    const parentGroup = rectElement.parentElement;
                    
                    // Skip if already animated in highlighted cards
                    if (parentGroup && !parentGroup.getAttribute('filter')?.includes('filter28') && 
                        !parentGroup.getAttribute('filter')?.includes('filter29')) {
                        gsap.set(rectElement, {
                            scale: 0.97,
                            opacity: 0,
                            force3D: true
                        });

                        tl.to(rectElement, {
                            scale: 1,
                            opacity: 1,
                            duration: 0.4,
                            ease: "power2.out",
                            force3D: true
                        }, 0.3 + rectIndex * 0.02);
                    }
                });

                // Optimized paths in faded cards
                Array.from(brutalistFadedCards).slice(0, 15).forEach((cardGroup) => {
                    const pathsInFadedCard = cardGroup.querySelectorAll('path');
                    pathsInFadedCard.forEach((path, pathIndex) => {
                        const pathElement = path as SVGPathElement;
                        gsap.set(pathElement, {
                            opacity: 0,
                            force3D: true
                        });

                        tl.to(pathElement, {
                            opacity: 1,
                            duration: 0.4,
                            ease: "power2.out",
                            force3D: true
                        }, 0.6 + pathIndex * 0.015);
                    });
                });

                // Optimized animations for fifth SVG (Playful icons)
                // Animate gradient circles with optimized fade and scale
                const allCircles = svg.querySelectorAll('circle');
                const playfulCircles: SVGCircleElement[] = [];
                allCircles.forEach((circle) => {
                    const fillOpacity = circle.getAttribute('fill-opacity');
                    if (fillOpacity === '0.6') {
                        playfulCircles.push(circle as SVGCircleElement);
                    }
                });

                playfulCircles.forEach((circle, circleIndex) => {
                    gsap.set(circle, {
                        opacity: 0,
                        scale: 0.85,
                        transformOrigin: "center center",
                        force3D: true
                    });

                    tl.to(circle, {
                        opacity: 0.6,
                        scale: 1,
                        duration: 0.8,
                        ease: "power2.out",
                        force3D: true
                    }, 0.25 + circleIndex * 0.12);

                    // Optimized continuous pulse for circles
                    gsap.to(circle, {
                        scale: 1.03,
                        opacity: 0.68,
                        duration: 3.5,
                        repeat: -1,
                        yoyo: true,
                        ease: "sine.inOut",
                        delay: 1.5 + index * 0.15 + circleIndex * 0.15,
                        transformOrigin: "center center",
                        force3D: true
                    });
                });

                // Optimized highlighted pink card animation
                const playfulHighlightedCard = svg.querySelector('g[filter*="filter0_d"]');
                if (playfulHighlightedCard) {
                    const cardElement = playfulHighlightedCard as SVGGElement;
                    gsap.set(cardElement, {
                        scale: 0.75,
                        opacity: 0,
                        rotation: -8,
                        transformOrigin: "center center",
                        force3D: true
                    });

                    tl.to(cardElement, {
                        scale: 1,
                        opacity: 1,
                        rotation: 0,
                        duration: 0.6,
                        ease: "back.out(1.7)",
                        force3D: true
                    }, 0.3);

                    // Optimized continuous bounce animation
                    gsap.to(cardElement, {
                        y: -3,
                        rotation: 1.5,
                        duration: 2.5,
                        repeat: -1,
                        yoyo: true,
                        ease: "sine.inOut",
                        delay: 1.2 + index * 0.15,
                        transformOrigin: "center center",
                        force3D: true
                    });

                    // Optimized pink paths inside highlighted card
                    const pinkPaths = cardElement.querySelectorAll('path[fill="#E84C88"]');
                    pinkPaths.forEach((path, pathIndex) => {
                        const pathElement = path as SVGPathElement;
                        gsap.set(pathElement, {
                            opacity: 0,
                            scale: 0.85,
                            transformOrigin: "center center",
                            force3D: true
                        });

                        tl.to(pathElement, {
                            opacity: 1,
                            scale: 1,
                            duration: 0.4,
                            ease: "back.out(1.3)",
                            force3D: true
                        }, 0.5 + pathIndex * 0.08);
                    });
                }

                // Optimized faded cards - limited to prevent lag
                const playfulFadedCards = svg.querySelectorAll('[opacity="0.4"]');
                Array.from(playfulFadedCards).slice(0, 12).forEach((card, cardIndex) => {
                    const cardElement = card as SVGGElement;
                    const rotationValue = cardIndex % 2 === 0 ? -3 : 3; // Alternate instead of random
                    gsap.set(cardElement, {
                        opacity: 0,
                        scale: 0.85,
                        y: 12,
                        rotation: rotationValue,
                        transformOrigin: "center center",
                        force3D: true
                    });

                    tl.to(cardElement, {
                        opacity: 0.4,
                        scale: 1,
                        y: 0,
                        rotation: 0,
                        duration: 0.6,
                        ease: "back.out(1.2)",
                        force3D: true
                    }, 0.4 + cardIndex * 0.06);

                    // Optimized continuous floating animation
                    gsap.to(cardElement, {
                        y: -6,
                        rotation: 1.5,
                        duration: 3.5,
                        repeat: -1,
                        yoyo: true,
                        ease: "sine.inOut",
                        delay: 2 + index * 0.15 + cardIndex * 0.08,
                        transformOrigin: "center center",
                        force3D: true
                    });

                    // Optimized paths inside faded cards
                    const pathsInCard = cardElement.querySelectorAll('path');
                    pathsInCard.forEach((path, pathIndex) => {
                        const pathElement = path as SVGPathElement;
                        gsap.set(pathElement, {
                            opacity: 0,
                            force3D: true
                        });

                        tl.to(pathElement, {
                            opacity: 1,
                            duration: 0.4,
                            ease: "power2.out",
                            force3D: true
                        }, 0.6 + cardIndex * 0.06 + pathIndex * 0.015);
                    });
                });

                // Optimized animation for all rects in playful SVG
                const playfulRects = svg.querySelectorAll('[opacity="0.4"] rect');
                playfulRects.forEach((rect, rectIndex) => {
                    const rectElement = rect as SVGRectElement;
                    const parentGroup = rectElement.parentElement;
                    
                    if (parentGroup && parentGroup.getAttribute('opacity') === '0.4') {
                        gsap.set(rectElement, {
                            scale: 0.95,
                            opacity: 0,
                            transformOrigin: "center center",
                            force3D: true
                        });

                        tl.to(rectElement, {
                            scale: 1,
                            opacity: 1,
                            duration: 0.5,
                            ease: "back.out(1.2)",
                            force3D: true
                        }, 0.4 + rectIndex * 0.05);
                    }
                });

                // Optimized animations for sixth SVG (30+ other styles)
                // Identify sixth SVG by checking for filter IDs with pattern filter*_d_652_5314
                const sixthSVGCards = svg.querySelectorAll('g[filter*="filter0_d_652_5314"], g[filter*="filter1_d_652_5314"], g[filter*="filter2_d_652_5314"], g[filter*="filter3_d_652_5314"], g[filter*="filter4_d_652_5314"], g[filter*="filter5_d_652_5314"]');
                
                if (sixthSVGCards.length >= 6) {
                    // Optimized card groups with smooth stagger entrance
                    sixthSVGCards.forEach((cardGroup, cardIndex) => {
                        const groupElement = cardGroup as SVGGElement;
                        
                        // Set initial state for card group
                        gsap.set(groupElement, {
                            opacity: 0,
                            y: 25,
                            scale: 0.97,
                            transformOrigin: "center center",
                            force3D: true
                        });

                        // Optimized entrance animation with stagger
                        tl.to(groupElement, {
                            opacity: 1,
                            y: 0,
                            scale: 1,
                            duration: 0.6,
                            ease: "power2.out",
                            force3D: true
                        }, 0.25 + cardIndex * 0.1);

                        // Optimized white card rectangles inside each group
                        const cardRect = groupElement.querySelector('rect[fill="white"]');
                        if (cardRect) {
                            gsap.set(cardRect, {
                                opacity: 0,
                                scale: 0.95,
                                transformOrigin: "center center",
                                force3D: true
                            });

                            tl.to(cardRect, {
                                opacity: 1,
                                scale: 1,
                                duration: 0.4,
                                ease: "back.out(1.3)",
                                force3D: true
                            }, 0.25 + cardIndex * 0.1);
                        }

                        // Optimized pink icon paths animation
                        const pinkIcons = groupElement.querySelectorAll('path[fill="#E84C88"]');
                        pinkIcons.forEach((icon, iconIndex) => {
                            const iconElement = icon as SVGPathElement;
                            const hasLength = iconElement.getTotalLength() > 0;
                            
                            if (hasLength) {
                                const length = iconElement.getTotalLength();
                                gsap.set(iconElement, {
                                    strokeDasharray: length,
                                    strokeDashoffset: length,
                                    opacity: 0,
                                    force3D: true
                                });

                                tl.to(iconElement, {
                                    strokeDashoffset: 0,
                                    opacity: 1,
                                    duration: 0.7,
                                    ease: "power2.inOut",
                                    force3D: true
                                }, 0.35 + cardIndex * 0.1 + iconIndex * 0.04);
                            } else {
                                // Optimized fade in for non-stroke paths
                                gsap.set(iconElement, {
                                    opacity: 0,
                                    scale: 0.85,
                                    transformOrigin: "center center",
                                    force3D: true
                                });

                                tl.to(iconElement, {
                                    opacity: 1,
                                    scale: 1,
                                    duration: 0.5,
                                    ease: "back.out(1.2)",
                                    force3D: true
                                }, 0.35 + cardIndex * 0.1 + iconIndex * 0.04);
                            }
                        });

                        // Optimized placeholder rectangles (gray bars)
                        const placeholderRects = groupElement.querySelectorAll('rect[fill="#F6F6F6"]');
                        placeholderRects.forEach((rect, rectIndex) => {
                            const rectElement = rect as SVGRectElement;
                            gsap.set(rectElement, {
                                opacity: 0,
                                scaleX: 0,
                                transformOrigin: "left center",
                                force3D: true
                            });

                            tl.to(rectElement, {
                                opacity: 1,
                                scaleX: 1,
                                duration: 0.4,
                                ease: "power2.out",
                                force3D: true
                            }, 0.4 + cardIndex * 0.1 + rectIndex * 0.06);
                        });

                        // Optimized continuous hover-like animation for each card
                        gsap.to(groupElement, {
                            y: -3,
                            duration: 3,
                            repeat: -1,
                            yoyo: true,
                            ease: "sine.inOut",
                            delay: 1.5 + index * 0.15 + cardIndex * 0.12,
                            transformOrigin: "center center",
                            force3D: true
                        });
                    });
                }
            });
            }, 100); // Small delay to ensure SVG is rendered
        };

        return () => {
            observer.disconnect();
            if (timeoutId) {
                clearTimeout(timeoutId);
            }
        };
    }, []);

    const Cards = [
        {
            title: "The encyclopedia of icons",
            description: "A complete library covering every concept you need—available in versatile styles for any platform.",
            image: (`
                <svg width="352" height="408" viewBox="0 0 352 408" fill="none" xmlns="http://www.w3.org/2000/svg">
<g clip-path="url(#clip0_652_4663)">
<rect width="352" height="408" rx="24" fill="#F6F6F6"/>
<g opacity="0.08" filter="url(#filter0_d_652_4663)">
<rect x="8" y="8" width="56" height="56" rx="12" fill="#F6F6F6" shape-rendering="crispEdges"/>
<path d="M32.5 43V45.2C32.5 45.48 32.5 45.62 32.4455 45.727C32.3976 45.8211 32.3211 45.8976 32.227 45.9455C32.12 46 31.98 46 31.7 46H29.8C29.52 46 29.38 46 29.273 45.9455C29.1789 45.8976 29.1024 45.8211 29.0545 45.727C29 45.62 29 45.48 29 45.2V43M43 43V45.2C43 45.48 43 45.62 42.9455 45.727C42.8976 45.8211 42.8211 45.8976 42.727 45.9455C42.62 46 42.48 46 42.2 46H40.3C40.02 46 39.88 46 39.773 45.9455C39.6789 45.8976 39.6024 45.8211 39.5545 45.727C39.5 45.62 39.5 45.48 39.5 45.2V43M27 36H45M27 29.5H45M30.5 39.5H32M40 39.5H41.5M31.8 43H40.2C41.8802 43 42.7202 43 43.362 42.673C43.9265 42.3854 44.3854 41.9265 44.673 41.362C45 40.7202 45 39.8802 45 38.2V30.8C45 29.1198 45 28.2798 44.673 27.638C44.3854 27.0735 43.9265 26.6146 43.362 26.327C42.7202 26 41.8802 26 40.2 26H31.8C30.1198 26 29.2798 26 28.638 26.327C28.0735 26.6146 27.6146 27.0735 27.327 27.638C27 28.2798 27 29.1198 27 30.8V38.2C27 39.8802 27 40.7202 27.327 41.362C27.6146 41.9265 28.0735 42.3854 28.638 42.673C29.2798 43 30.1198 43 31.8 43Z" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</g>
<g opacity="0.08" filter="url(#filter1_d_652_4663)">
<rect x="8" y="64" width="56" height="56" rx="12" fill="#F6F6F6" shape-rendering="crispEdges"/>
<path d="M36 92.5C37.6569 92.5 39 91.1569 39 89.5C39 87.8431 37.6569 86.5 36 86.5C34.3431 86.5 33 87.8431 33 89.5C33 91.1569 34.3431 92.5 36 92.5Z" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M36 102C38 98 44 95.4183 44 90C44 85.5817 40.4183 82 36 82C31.5817 82 28 85.5817 28 90C28 95.4183 34 98 36 102Z" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</g>
<g opacity="0.08" filter="url(#filter2_d_652_4663)">
<rect x="8" y="120" width="56" height="56" rx="12" fill="#F6F6F6" shape-rendering="crispEdges"/>
<path d="M46 148C46 153.523 41.5228 158 36 158M46 148C46 142.477 41.5228 138 36 138M46 148H44M36 158C30.4772 158 26 153.523 26 148M36 158V156M26 148C26 142.477 30.4772 138 36 138M26 148H28M36 138V140M43.0711 155.071L41.6569 153.657M30.3431 142.343L28.9289 140.929M41.6569 142.343L43.0711 140.929M28.9289 155.071L30.3431 153.657M32 148L34.5 146.5L36 144L37.5 146.5L40 148L37.5 149.5L36 152L34.5 149.5L32 148Z" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</g>
<g opacity="0.08" filter="url(#filter3_d_652_4663)">
<rect x="8" y="176" width="56" height="56" rx="12" fill="#F6F6F6" shape-rendering="crispEdges"/>
<path d="M40 205.374C43.5318 206.069 46 207.655 46 209.5C46 211.985 41.5228 214 36 214C30.4772 214 26 211.985 26 209.5C26 207.655 28.4682 206.069 32 205.374M36 209V195L41.3177 198.272C41.7056 198.511 41.8995 198.63 41.9614 198.781C42.0154 198.912 42.0111 199.06 41.9497 199.188C41.8792 199.334 41.6787 199.442 41.2777 199.658L36 202.5" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</g>
<g opacity="0.08" filter="url(#filter4_d_652_4663)">
<rect x="8" y="232" width="56" height="56" rx="12" fill="#F6F6F6" shape-rendering="crispEdges"/>
<path d="M28 263C28 263 29 262 32 262C35 262 37 264 40 264C43 264 44 263 44 263V251C44 251 43 252 40 252C37 252 35 250 32 250C29 250 28 251 28 251L28 270" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</g>
<g opacity="0.08" filter="url(#filter5_d_652_4663)">
<rect x="8" y="288" width="56" height="56" rx="12" fill="#F6F6F6" shape-rendering="crispEdges"/>
<path d="M35 308H31.8C30.1198 308 29.2798 308 28.638 308.327C28.0735 308.615 27.6146 309.074 27.327 309.638C27 310.28 27 311.12 27 312.8V318C27 318.93 27 319.395 27.1022 319.776C27.3796 320.812 28.1883 321.62 29.2235 321.898C29.605 322 30.07 322 31 322V324.336C31 324.868 31 325.135 31.1092 325.272C31.2042 325.391 31.3483 325.46 31.5005 325.46C31.6756 325.459 31.8837 325.293 32.2998 324.96L34.6852 323.052C35.1725 322.662 35.4162 322.467 35.6875 322.328C35.9282 322.205 36.1844 322.116 36.4492 322.061C36.7477 322 37.0597 322 37.6837 322H39.2C40.8802 322 41.7202 322 42.362 321.673C42.9265 321.385 43.3854 320.926 43.673 320.362C44 319.72 44 318.88 44 317.2V317M44.1213 307.879C45.2929 309.05 45.2929 310.95 44.1213 312.121C42.9497 313.293 41.0503 313.293 39.8787 312.121C38.7071 310.95 38.7071 309.05 39.8787 307.879C41.0503 306.707 42.9497 306.707 44.1213 307.879Z" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</g>
<g opacity="0.08" filter="url(#filter6_d_652_4663)">
<rect x="8" y="344" width="56" height="56" rx="12" fill="#F6F6F6" shape-rendering="crispEdges"/>
<path d="M43 369L46 366M46 366L43 363M46 366L40 366M40 381V379.8C40 378.12 40 377.28 39.673 376.638C39.3854 376.074 38.9265 375.615 38.362 375.327C37.7202 375 36.8802 375 35.2 375H30.8C29.1198 375 28.2798 375 27.638 375.327C27.0735 375.615 26.6146 376.074 26.327 376.638C26 377.28 26 378.12 26 379.8V381M36.5 367.5C36.5 369.433 34.933 371 33 371C31.067 371 29.5 369.433 29.5 367.5C29.5 365.567 31.067 364 33 364C34.933 364 36.5 365.567 36.5 367.5Z" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</g>
<g opacity="0.08" filter="url(#filter7_d_652_4663)">
<rect x="64" y="8" width="56" height="56" rx="12" fill="#F6F6F6" shape-rendering="crispEdges"/>
<path d="M82 36H102M82 36C82 41.5228 86.4772 46 92 46M82 36C82 30.4772 86.4772 26 92 26M102 36C102 41.5228 97.5228 46 92 46M102 36C102 30.4772 97.5228 26 92 26M92 26C94.5013 28.7384 95.9228 32.292 96 36C95.9228 39.708 94.5013 43.2616 92 46M92 26C89.4987 28.7384 88.0772 32.292 88 36C88.0772 39.708 89.4987 43.2616 92 46" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</g>
<g opacity="0.08" filter="url(#filter8_d_652_4663)">
<rect x="64" y="64" width="56" height="56" rx="12" fill="#F6F6F6" shape-rendering="crispEdges"/>
<path d="M92 95L89 92M92 95C93.3968 94.4687 94.7369 93.7987 96 93M92 95V100C92 100 95.03 99.45 96 98C97.08 96.38 96 93 96 93M89 92C89.5321 90.6194 90.2022 89.2961 91 88.05C92.1652 86.187 93.7876 84.6531 95.713 83.5941C97.6384 82.5351 99.8027 81.9864 102 82C102 84.72 101.22 89.5 96 93M89 92H84C84 92 84.55 88.97 86 88C87.62 86.92 91 88 91 88M84.5 96.5C83 97.76 82.5 101.5 82.5 101.5C82.5 101.5 86.24 101 87.5 99.5C88.21 98.66 88.2 97.37 87.41 96.59C87.0213 96.219 86.5093 96.0046 85.9722 95.988C85.4352 95.9714 84.9109 96.1537 84.5 96.5Z" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</g>
<g opacity="0.08" filter="url(#filter9_d_652_4663)">
<rect x="64" y="120" width="56" height="56" rx="12" fill="#F6F6F6" shape-rendering="crispEdges"/>
<path d="M83.076 143.483L87.364 146.546C87.5872 146.705 87.6987 146.785 87.8155 146.803C87.9182 146.819 88.0234 146.803 88.1165 146.756C88.2222 146.704 88.3045 146.594 88.469 146.375L89.3751 145.167C89.4216 145.104 89.4449 145.073 89.4722 145.047C89.4965 145.023 89.5232 145.002 89.5517 144.983C89.5839 144.963 89.6193 144.947 89.6902 144.915L93.5588 143.196C93.7192 143.125 93.7993 143.089 93.8598 143.034C93.9133 142.984 93.9554 142.924 93.9832 142.857C94.0146 142.781 94.0204 142.693 94.0321 142.518L94.3154 138.269M93.5 149.5L96.116 150.621C96.4195 150.751 96.5713 150.816 96.6517 150.924C96.7222 151.019 96.7569 151.136 96.7496 151.254C96.7413 151.388 96.6497 151.525 96.4665 151.8L95.2375 153.644C95.1507 153.774 95.1072 153.839 95.0499 153.886C94.9991 153.928 94.9406 153.959 94.8777 153.978C94.8067 154 94.7284 154 94.5719 154H92.5766C92.3693 154 92.2656 154 92.1774 153.965C92.0995 153.935 92.0305 153.885 91.9768 153.821C91.916 153.748 91.8832 153.65 91.8177 153.453L91.1048 151.314C91.0661 151.198 91.0468 151.14 91.0417 151.081C91.0372 151.029 91.0409 150.976 91.0528 150.925C91.0662 150.868 91.0935 150.813 91.1482 150.704L91.6897 149.621C91.7997 149.401 91.8547 149.291 91.9395 149.222C92.0141 149.162 92.1046 149.125 92.1999 149.114C92.3081 149.103 92.4248 149.142 92.6582 149.219L93.5 149.5ZM102 148C102 153.523 97.5228 158 92 158C86.4772 158 82 153.523 82 148C82 142.477 86.4772 138 92 138C97.5228 138 102 142.477 102 148Z" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</g>
<g opacity="0.08" filter="url(#filter10_d_652_4663)">
<rect x="64" y="176" width="56" height="56" rx="12" fill="#F6F6F6" shape-rendering="crispEdges"/>
<path d="M88 200V199M88 204.5V203.5M88 209V208M86.8 212H97.2C98.8802 212 99.7202 212 100.362 211.673C100.926 211.385 101.385 210.926 101.673 210.362C102 209.72 102 208.88 102 207.2V200.8C102 199.12 102 198.28 101.673 197.638C101.385 197.074 100.926 196.615 100.362 196.327C99.7202 196 98.8802 196 97.2 196H86.8C85.1198 196 84.2798 196 83.638 196.327C83.0735 196.615 82.6146 197.074 82.327 197.638C82 198.28 82 199.12 82 200.8V207.2C82 208.88 82 209.72 82.327 210.362C82.6146 210.926 83.0735 211.385 83.638 211.673C84.2798 212 85.1198 212 86.8 212Z" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</g>
<g opacity="0.08" filter="url(#filter11_d_652_4663)">
<rect x="64" y="288" width="56" height="56" rx="12" fill="#F6F6F6" shape-rendering="crispEdges"/>
<path d="M91 308H87.8C86.1198 308 85.2798 308 84.638 308.327C84.0735 308.615 83.6146 309.074 83.327 309.638C83 310.28 83 311.12 83 312.8V320.2C83 321.88 83 322.72 83.327 323.362C83.6146 323.926 84.0735 324.385 84.638 324.673C85.2798 325 86.1198 325 87.8 325H95.2C96.8802 325 97.7202 325 98.362 324.673C98.9265 324.385 99.3854 323.926 99.673 323.362C100 322.72 100 321.88 100 320.2V317M93 321H87M95 317H87M100.121 307.879C101.293 309.05 101.293 310.95 100.121 312.121C98.9497 313.293 97.0503 313.293 95.8787 312.121C94.7071 310.95 94.7071 309.05 95.8787 307.879C97.0503 306.707 98.9497 306.707 100.121 307.879Z" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</g>
<g opacity="0.08" filter="url(#filter12_d_652_4663)">
<rect x="120" y="8" width="56" height="56" rx="12" fill="#F6F6F6" shape-rendering="crispEdges"/>
<path d="M148 37C149.657 37 151 35.6569 151 34C151 32.3431 149.657 31 148 31C146.343 31 145 32.3431 145 34C145 35.6569 146.343 37 148 37Z" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M148 46C152 42 156 38.4183 156 34C156 29.5817 152.418 26 148 26C143.582 26 140 29.5817 140 34C140 38.4183 144 42 148 46Z" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</g>
<g opacity="0.08" filter="url(#filter13_d_652_4663)">
<rect x="120" y="120" width="56" height="56" rx="12" fill="#F6F6F6" shape-rendering="crispEdges"/>
<path d="M141 150.286C139.149 151.103 138 152.241 138 153.5C138 155.985 142.477 158 148 158C153.523 158 158 155.985 158 153.5C158 152.241 156.851 151.103 155 150.286M154 144C154 148.064 149.5 150 148 153C146.5 150 142 148.064 142 144C142 140.686 144.686 138 148 138C151.314 138 154 140.686 154 144ZM149 144C149 144.552 148.552 145 148 145C147.448 145 147 144.552 147 144C147 143.448 147.448 143 148 143C148.552 143 149 143.448 149 144Z" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</g>
<g opacity="0.08" filter="url(#filter14_d_652_4663)">
<rect x="120" y="176" width="56" height="56" rx="12" fill="#F6F6F6" shape-rendering="crispEdges"/>
<path d="M148 214C153.523 214 158 209.523 158 204C158 198.477 153.523 194 148 194C142.477 194 138 198.477 138 204C138 209.523 142.477 214 148 214Z" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M150.722 200.266C151.211 200.103 151.455 200.022 151.617 200.08C151.759 200.13 151.87 200.241 151.92 200.383C151.978 200.545 151.897 200.789 151.734 201.278L150.246 205.741C150.2 205.88 150.177 205.949 150.137 206.007C150.102 206.058 150.058 206.102 150.007 206.137C149.949 206.177 149.88 206.2 149.741 206.246L145.278 207.734C144.789 207.897 144.545 207.978 144.383 207.92C144.241 207.87 144.13 207.759 144.08 207.617C144.022 207.455 144.103 207.211 144.266 206.722L145.754 202.259C145.8 202.12 145.823 202.051 145.863 201.993C145.898 201.942 145.942 201.898 145.993 201.863C146.051 201.823 146.12 201.8 146.259 201.754L150.722 200.266Z" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</g>
<g opacity="0.08" filter="url(#filter15_d_652_4663)">
<rect x="120" y="232" width="56" height="56" rx="12" fill="#F6F6F6" shape-rendering="crispEdges"/>
<path d="M144 270V268M145.5 263V255M152 270V268M150.5 263V255M144.8 268H151.2C152.88 268 153.72 268 154.362 267.673C154.926 267.385 155.385 266.926 155.673 266.362C156 265.72 156 264.88 156 263.2V254.8C156 253.12 156 252.28 155.673 251.638C155.385 251.074 154.926 250.615 154.362 250.327C153.72 250 152.88 250 151.2 250H144.8C143.12 250 142.28 250 141.638 250.327C141.074 250.615 140.615 251.074 140.327 251.638C140 252.28 140 253.12 140 254.8V263.2C140 264.88 140 265.72 140.327 266.362C140.615 266.926 141.074 267.385 141.638 267.673C142.28 268 143.12 268 144.8 268Z" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</g>
<g opacity="0.08" filter="url(#filter16_d_652_4663)">
<rect x="120" y="288" width="56" height="56" rx="12" fill="#F6F6F6" shape-rendering="crispEdges"/>
<path d="M153 306V317M158 313.8V309.2C158 308.08 158 307.52 157.782 307.092C157.59 306.716 157.284 306.41 156.908 306.218C156.48 306 155.92 306 154.8 306H144.118C142.657 306 141.926 306 141.336 306.267C140.815 306.503 140.373 306.882 140.061 307.361C139.707 307.903 139.596 308.626 139.374 310.07L138.851 313.47C138.558 315.375 138.411 316.328 138.694 317.069C138.942 317.72 139.409 318.264 140.014 318.608C140.704 319 141.667 319 143.595 319H144.4C144.96 319 145.24 319 145.454 319.109C145.642 319.205 145.795 319.358 145.891 319.546C146 319.76 146 320.04 146 320.6V323.534C146 324.896 147.104 326 148.466 326C148.791 326 149.085 325.809 149.217 325.512L152.578 317.95C152.731 317.606 152.807 317.434 152.928 317.308C153.035 317.197 153.166 317.112 153.311 317.059C153.475 317 153.663 317 154.04 317H154.8C155.92 317 156.48 317 156.908 316.782C157.284 316.59 157.59 316.284 157.782 315.908C158 315.48 158 314.92 158 313.8Z" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</g>
<g opacity="0.08" filter="url(#filter17_d_652_4663)">
<rect x="120" y="344" width="56" height="56" rx="12" fill="#F6F6F6" shape-rendering="crispEdges"/>
<path d="M152 366L155 363M155 363L158 366M155 363V369M152 381V379.8C152 378.12 152 377.28 151.673 376.638C151.385 376.074 150.926 375.615 150.362 375.327C149.72 375 148.88 375 147.2 375H142.8C141.12 375 140.28 375 139.638 375.327C139.074 375.615 138.615 376.074 138.327 376.638C138 377.28 138 378.12 138 379.8V381M148.5 367.5C148.5 369.433 146.933 371 145 371C143.067 371 141.5 369.433 141.5 367.5C141.5 365.567 143.067 364 145 364C146.933 364 148.5 365.567 148.5 367.5Z" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</g>
<g opacity="0.08" filter="url(#filter18_d_652_4663)">
<rect x="176" y="8" width="56" height="56" rx="12" fill="#F6F6F6" shape-rendering="crispEdges"/>
<path d="M205 34.9999L195.5 44.4999M206.018 27.5384C207.236 28.3466 208.407 29.2994 209.501 30.3934C210.604 31.4968 211.564 32.6783 212.377 33.9077M201.255 31.896L198.38 30.9378C198.049 30.8274 197.684 30.8976 197.418 31.1231L194.56 33.5407C193.975 34.0356 194.142 34.9775 194.861 35.2424L197.568 36.2398M203.681 42.3524L204.678 45.0596C204.943 45.7786 205.885 45.9448 206.38 45.3599L208.797 42.5027C209.023 42.2363 209.093 41.8716 208.983 41.5405L208.024 38.6657M211.348 26.2706L206.442 27.0884C205.912 27.1767 205.426 27.4371 205.059 27.8293L198.446 34.8985C196.732 36.7308 196.78 39.5924 198.554 41.3667C200.328 43.1409 203.19 43.1886 205.022 41.4744L212.091 34.8614C212.483 34.4944 212.744 34.0085 212.832 33.4787L213.65 28.5722C213.875 27.2186 212.702 26.045 211.348 26.2706Z" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</g>
<g opacity="0.08" filter="url(#filter19_d_652_4663)">
<rect x="176" y="64" width="56" height="56" rx="12" fill="#F6F6F6" shape-rendering="crispEdges"/>
<path d="M204 82C207 84 207.923 88.292 208 92C207.923 95.708 207 100 204 102M204 82C201 84 200.077 88.292 200 92C200.077 95.708 201 100 204 102M204 82C198.477 82 194 86.4772 194 92M204 82C209.523 82 214 86.4772 214 92M204 102C209.523 102 214 97.5228 214 92M204 102C198.477 102 194 97.5228 194 92M214 92C212 95 207.708 95.9228 204 96C200.292 95.9228 196 95 194 92M214 92C212 89 207.708 88.0772 204 88C200.292 88.0772 196 89 194 92" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</g>
<g opacity="0.08" filter="url(#filter20_d_652_4663)">
<rect x="176" y="176" width="56" height="56" rx="12" fill="#F6F6F6" shape-rendering="crispEdges"/>
<path d="M194.687 207.645L196.595 206.544C196.698 206.484 196.82 206.463 196.937 206.485L200.691 207.188C201 207.246 201.285 207.008 201.283 206.694L201.269 203.404C201.268 203.315 201.292 203.227 201.337 203.15L203.232 199.906C203.33 199.737 203.322 199.527 203.209 199.367L200.019 194.826M211 196.859C205.5 199.5 208.5 203 209.5 203.5C211.377 204.438 213.988 204.5 213.988 204.5C213.996 204.334 214 204.168 214 204C214 198.477 209.523 194 204 194C198.477 194 194 198.477 194 204C194 209.523 198.477 214 204 214C204.168 214 204.334 213.996 204.5 213.988M208.758 213.94L205.591 205.591L213.94 208.758L210.238 210.238L208.758 213.94Z" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</g>
<g opacity="0.08" filter="url(#filter21_d_652_4663)">
<rect x="176" y="232" width="56" height="56" rx="12" fill="#F6F6F6" shape-rendering="crispEdges"/>
<path d="M202 256V255M202 260.5V259.5M202 265V264M197.2 252H210.8C211.92 252 212.48 252 212.908 252.218C213.284 252.41 213.59 252.716 213.782 253.092C214 253.52 214 254.08 214 255.2V256.5C212.067 256.5 210.5 258.067 210.5 260C210.5 261.933 212.067 263.5 214 263.5V264.8C214 265.92 214 266.48 213.782 266.908C213.59 267.284 213.284 267.59 212.908 267.782C212.48 268 211.92 268 210.8 268H197.2C196.08 268 195.52 268 195.092 267.782C194.716 267.59 194.41 267.284 194.218 266.908C194 266.48 194 265.92 194 264.8V263.5C195.933 263.5 197.5 261.933 197.5 260C197.5 258.067 195.933 256.5 194 256.5V255.2C194 254.08 194 253.52 194.218 253.092C194.41 252.716 194.716 252.41 195.092 252.218C195.52 252 196.08 252 197.2 252Z" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</g>
<g opacity="0.08" filter="url(#filter22_d_652_4663)">
<rect x="176" y="344" width="56" height="56" rx="12" fill="#F6F6F6" shape-rendering="crispEdges"/>
<path d="M208.5 376L213.5 381M213.5 376L208.5 381M204 375.5H199.5C198.104 375.5 197.407 375.5 196.839 375.672C195.56 376.06 194.56 377.06 194.172 378.339C194 378.907 194 379.604 194 381M206.5 367.5C206.5 369.985 204.485 372 202 372C199.515 372 197.5 369.985 197.5 367.5C197.5 365.015 199.515 363 202 363C204.485 363 206.5 365.015 206.5 367.5Z" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</g>
<g opacity="0.08" filter="url(#filter23_d_652_4663)">
<rect x="232" y="8" width="56" height="56" rx="12" fill="#F6F6F6" shape-rendering="crispEdges"/>
<path d="M253 37H256M250 33L252 34L253.271 30.1881C253.533 29.4013 253.664 29.0078 253.907 28.717C254.122 28.4601 254.398 28.2613 254.71 28.1388C255.062 28 255.477 28 256.306 28H263.694C264.523 28 264.938 28 265.29 28.1388C265.602 28.2613 265.878 28.4601 266.093 28.717C266.336 29.0078 266.467 29.4013 266.729 30.1881L268 34L270 33M264 37H267M254.8 34H265.2C266.88 34 267.72 34 268.362 34.327C268.926 34.6146 269.385 35.0735 269.673 35.638C270 36.2798 270 37.1198 270 38.8V41.5C270 41.9647 270 42.197 269.962 42.3902C269.804 43.1836 269.184 43.8038 268.39 43.9616C268.197 44 267.965 44 267.5 44H267C265.895 44 265 43.1046 265 42C265 41.7239 264.776 41.5 264.5 41.5H255.5C255.224 41.5 255 41.7239 255 42C255 43.1046 254.105 44 253 44H252.5C252.035 44 251.803 44 251.61 43.9616C250.816 43.8038 250.196 43.1836 250.038 42.3902C250 42.197 250 41.9647 250 41.5V38.8C250 37.1198 250 36.2798 250.327 35.638C250.615 35.0735 251.074 34.6146 251.638 34.327C252.28 34 253.12 34 254.8 34Z" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</g>
<g opacity="0.08" filter="url(#filter24_d_652_4663)">
<rect x="232" y="64" width="56" height="56" rx="12" fill="#F6F6F6" shape-rendering="crispEdges"/>
<path d="M260 102C261 97 268 96.4183 268 90C268 85.5817 264.418 82 260 82C255.582 82 252 85.5817 252 90C252 96.4183 259 97 260 102Z" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M260 93C261.657 93 263 91.6569 263 90C263 88.3431 261.657 87 260 87C258.343 87 257 88.3431 257 90C257 91.6569 258.343 93 260 93Z" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</g>
<g opacity="0.08" filter="url(#filter25_d_652_4663)">
<rect x="232" y="120" width="56" height="56" rx="12" fill="#F6F6F6" shape-rendering="crispEdges"/>
<path d="M270 148H268M270 148C270 153.523 265.523 158 260 158M270 148C270 142.477 265.523 138 260 138M267.071 155.071L265.657 153.657M252 148H250M250 148C250 153.523 254.477 158 260 158M250 148C250 142.477 254.477 138 260 138M254.343 142.343L252.929 140.929M260 140V138M265.657 142.343L267.071 140.929M260 158V156M252.929 155.071L254.343 153.657M260 144L264 148L260 152L256 148L260 144Z" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</g>
<g opacity="0.08" filter="url(#filter26_d_652_4663)">
<rect x="232" y="176" width="56" height="56" rx="12" fill="#F6F6F6" shape-rendering="crispEdges"/>
<path d="M264 205.374C267.532 206.069 270 207.655 270 209.5C270 211.985 265.523 214 260 214C254.477 214 250 211.985 250 209.5C250 207.655 252.468 206.069 256 205.374M260 209V201M260 201C261.657 201 263 199.657 263 198C263 196.343 261.657 195 260 195C258.343 195 257 196.343 257 198C257 199.657 258.343 201 260 201Z" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</g>
<g opacity="0.08" filter="url(#filter27_d_652_4663)">
<rect x="232" y="232" width="56" height="56" rx="12" fill="#F6F6F6" shape-rendering="crispEdges"/>
<path d="M267 258V254.2C267 253.08 267 252.52 266.782 252.092C266.59 251.716 266.284 251.41 265.908 251.218C265.48 251 264.92 251 263.8 251H256.2C255.08 251 254.52 251 254.092 251.218C253.716 251.41 253.41 251.716 253.218 252.092C253 252.52 253 253.08 253 254.2V258M253 257H250V256M267 257H270V256M254 261.5H254.01M266 261.5H266.01M254.8 258H265.2C266.88 258 267.72 258 268.362 258.327C268.926 258.615 269.385 259.074 269.673 259.638C270 260.28 270 261.12 270 262.8V266C270 266.932 270 267.398 269.848 267.765C269.645 268.255 269.255 268.645 268.765 268.848C268.398 269 267.932 269 267 269H266.4C266.028 269 265.843 269 265.687 268.975C264.831 268.84 264.16 268.169 264.025 267.313C264 267.157 264 266.972 264 266.6C264 266.507 264 266.461 263.994 266.422C263.96 266.208 263.792 266.04 263.578 266.006C263.539 266 263.493 266 263.4 266H256.6C256.507 266 256.461 266 256.422 266.006C256.208 266.04 256.04 266.208 256.006 266.422C256 266.461 256 266.507 256 266.6C256 266.972 256 267.157 255.975 267.313C255.84 268.169 255.169 268.84 254.313 268.975C254.157 269 253.972 269 253.6 269H253C252.068 269 251.602 269 251.235 268.848C250.745 268.645 250.355 268.255 250.152 267.765C250 267.398 250 266.932 250 266V262.8C250 261.12 250 260.28 250.327 259.638C250.615 259.074 251.074 258.615 251.638 258.327C252.28 258 253.12 258 254.8 258ZM254.5 261.5C254.5 261.776 254.276 262 254 262C253.724 262 253.5 261.776 253.5 261.5C253.5 261.224 253.724 261 254 261C254.276 261 254.5 261.224 254.5 261.5ZM266.5 261.5C266.5 261.776 266.276 262 266 262C265.724 262 265.5 261.776 265.5 261.5C265.5 261.224 265.724 261 266 261C266.276 261 266.5 261.224 266.5 261.5Z" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</g>
<g opacity="0.08" filter="url(#filter28_d_652_4663)">
<rect x="232" y="288" width="56" height="56" rx="12" fill="#F6F6F6" shape-rendering="crispEdges"/>
<path d="M255 326V315M250 317V324C250 325.105 250.895 326 252 326H265.426C266.907 326 268.166 324.92 268.391 323.456L269.468 316.456C269.748 314.639 268.342 313 266.503 313H263C262.448 313 262 312.552 262 312V308.466C262 307.104 260.896 306 259.534 306C259.209 306 258.915 306.191 258.783 306.488L255.264 314.406C255.103 314.767 254.745 315 254.35 315H252C250.895 315 250 315.895 250 317Z" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</g>
<g opacity="0.08" filter="url(#filter29_d_652_4663)">
<rect x="232" y="344" width="56" height="56" rx="12" fill="#F6F6F6" shape-rendering="crispEdges"/>
<path d="M264.5 364L269.5 369M269.5 364L264.5 369M264 381V379.8C264 378.12 264 377.28 263.673 376.638C263.385 376.074 262.926 375.615 262.362 375.327C261.72 375 260.88 375 259.2 375H254.8C253.12 375 252.28 375 251.638 375.327C251.074 375.615 250.615 376.074 250.327 376.638C250 377.28 250 378.12 250 379.8V381M260.5 367.5C260.5 369.433 258.933 371 257 371C255.067 371 253.5 369.433 253.5 367.5C253.5 365.567 255.067 364 257 364C258.933 364 260.5 365.567 260.5 367.5Z" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</g>
<g opacity="0.08" filter="url(#filter30_d_652_4663)">
<rect x="288" y="8" width="56" height="56" rx="12" fill="#F6F6F6" shape-rendering="crispEdges"/>
<path d="M316 26C318.501 28.7384 319.923 32.292 320 36C319.923 39.708 318.501 43.2616 316 46M316 26C313.499 28.7384 312.077 32.292 312 36C312.077 39.708 313.499 43.2616 316 46M316 26C310.477 26 306 30.4772 306 36C306 41.5228 310.477 46 316 46M316 26C321.523 26 326 30.4772 326 36C326 41.5228 321.523 46 316 46M306.5 33H325.5M306.5 39H325.5" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</g>
<g opacity="0.08" filter="url(#filter31_d_652_4663)">
<rect x="288" y="64" width="56" height="56" rx="12" fill="#F6F6F6" shape-rendering="crispEdges"/>
<path d="M315.5 85H315.934C318.982 85 320.505 85 321.084 85.5473C321.584 86.0204 321.805 86.7173 321.67 87.3922C321.514 88.173 320.27 89.0529 317.782 90.8125L313.718 93.6875C311.23 95.4471 309.986 96.327 309.83 97.1078C309.695 97.7827 309.916 98.4796 310.416 98.9527C310.995 99.5 312.518 99.5 315.566 99.5H316.5M312 85C312 86.6569 310.657 88 309 88C307.343 88 306 86.6569 306 85C306 83.3431 307.343 82 309 82C310.657 82 312 83.3431 312 85ZM326 99C326 100.657 324.657 102 323 102C321.343 102 320 100.657 320 99C320 97.3431 321.343 96 323 96C324.657 96 326 97.3431 326 99Z" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</g>
<g opacity="0.08" filter="url(#filter32_d_652_4663)">
<rect x="288" y="120" width="56" height="56" rx="12" fill="#F6F6F6" shape-rendering="crispEdges"/>
<path d="M319 138.458C318.053 138.16 317.045 138 316 138C310.477 138 306 142.477 306 148C306 153.523 310.477 158 316 158C321.523 158 326 153.523 326 148C326 146.285 325.568 144.67 324.807 143.259M321 141.75H321.005M314.5 157.888L314.5 155.685C314.5 155.566 314.543 155.45 314.621 155.36L317.106 152.459C317.311 152.221 317.247 151.856 316.975 151.7L314.119 150.068C314.041 150.023 313.977 149.959 313.932 149.881L312.07 146.619C311.974 146.449 311.787 146.351 311.592 146.368L306.064 146.861M325 142C325 144.209 323 146 321 148C319 146 317 144.209 317 142C317 139.791 318.791 138 321 138C323.209 138 325 139.791 325 142ZM321.25 141.75C321.25 141.888 321.138 142 321 142C320.862 142 320.75 141.888 320.75 141.75C320.75 141.612 320.862 141.5 321 141.5C321.138 141.5 321.25 141.612 321.25 141.75Z" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</g>
<g opacity="0.08" filter="url(#filter33_d_652_4663)">
<rect x="288" y="176" width="56" height="56" rx="12" fill="#F6F6F6" shape-rendering="crispEdges"/>
<path d="M313.5 214H318.5M312 194H320M316 197V194M308 204H324M321 211L322.5 214M311 211L309.5 214M312.5 207.5H312.51M319.5 207.5H319.51M312.8 211H319.2C320.88 211 321.72 211 322.362 210.673C322.926 210.385 323.385 209.926 323.673 209.362C324 208.72 324 207.88 324 206.2V201.8C324 200.12 324 199.28 323.673 198.638C323.385 198.074 322.926 197.615 322.362 197.327C321.72 197 320.88 197 319.2 197H312.8C311.12 197 310.28 197 309.638 197.327C309.074 197.615 308.615 198.074 308.327 198.638C308 199.28 308 200.12 308 201.8V206.2C308 207.88 308 208.72 308.327 209.362C308.615 209.926 309.074 210.385 309.638 210.673C310.28 211 311.12 211 312.8 211ZM313 207.5C313 207.776 312.776 208 312.5 208C312.224 208 312 207.776 312 207.5C312 207.224 312.224 207 312.5 207C312.776 207 313 207.224 313 207.5ZM320 207.5C320 207.776 319.776 208 319.5 208C319.224 208 319 207.776 319 207.5C319 207.224 319.224 207 319.5 207C319.776 207 320 207.224 320 207.5Z" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</g>
<g opacity="0.08" filter="url(#filter34_d_652_4663)">
<rect x="288" y="232" width="56" height="56" rx="12" fill="#F6F6F6" shape-rendering="crispEdges"/>
<path d="M309 258V264.011C309 264.37 309 264.55 309.055 264.708C309.103 264.848 309.182 264.976 309.286 265.082C309.403 265.201 309.563 265.282 309.884 265.442L315.284 268.142C315.547 268.273 315.678 268.339 315.816 268.365C315.937 268.388 316.063 268.388 316.184 268.365C316.322 268.339 316.453 268.273 316.716 268.142L322.116 265.442C322.437 265.282 322.597 265.201 322.714 265.082C322.818 264.976 322.897 264.848 322.945 264.708C323 264.55 323 264.37 323 264.011V258M306 256.5L315.642 251.679C315.773 251.613 315.839 251.581 315.908 251.568C315.969 251.556 316.031 251.556 316.092 251.568C316.161 251.581 316.227 251.613 316.358 251.679L326 256.5L316.358 261.321C316.227 261.387 316.161 261.42 316.092 261.432C316.031 261.444 315.969 261.444 315.908 261.432C315.839 261.42 315.773 261.387 315.642 261.321L306 256.5Z" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</g>
<g opacity="0.08" filter="url(#filter35_d_652_4663)">
<rect x="288" y="288" width="56" height="56" rx="12" fill="#F6F6F6" shape-rendering="crispEdges"/>
<path d="M323 325L326 322M326 322L323 319M326 322H320M316 319.5H311.5C310.104 319.5 309.407 319.5 308.839 319.672C307.56 320.06 306.56 321.06 306.172 322.339C306 322.907 306 323.604 306 325M318.5 311.5C318.5 313.985 316.485 316 314 316C311.515 316 309.5 313.985 309.5 311.5C309.5 309.015 311.515 307 314 307C316.485 307 318.5 309.015 318.5 311.5Z" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</g>
<g opacity="0.08" filter="url(#filter36_d_652_4663)">
<rect x="288" y="344" width="56" height="56" rx="12" fill="#F6F6F6" shape-rendering="crispEdges"/>
<path d="M326 381V379C326 377.136 324.725 375.57 323 375.126M319.5 363.291C320.966 363.884 322 365.321 322 367C322 368.679 320.966 370.116 319.5 370.709M321 381C321 379.136 321 378.204 320.696 377.469C320.29 376.489 319.511 375.71 318.531 375.304C317.796 375 316.864 375 315 375H312C310.136 375 309.204 375 308.469 375.304C307.489 375.71 306.71 376.489 306.304 377.469C306 378.204 306 379.136 306 381M317.5 367C317.5 369.209 315.709 371 313.5 371C311.291 371 309.5 369.209 309.5 367C309.5 364.791 311.291 363 313.5 363C315.709 363 317.5 364.791 317.5 367Z" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</g>
<g filter="url(#filter37_d_652_4663)">
<rect x="120" y="64" width="56" height="56" rx="12" fill="#F6F6F6" shape-rendering="crispEdges"/>
<path d="M153.745 82.8127C154.71 81.8163 156.304 81.8034 157.284 82.7841C158.238 83.738 158.256 85.279 157.324 86.2546L154.546 89.1643C154.328 89.3924 154.219 89.5064 154.152 89.64C154.092 89.7582 154.057 89.8871 154.048 90.0191C154.037 90.1682 154.073 90.3218 154.144 90.6291L155.872 98.1167C155.944 98.4321 155.981 98.5898 155.969 98.7423C155.959 98.8774 155.921 99.0089 155.858 99.1289C155.787 99.2645 155.673 99.3789 155.444 99.6078L155.073 99.9786C154.467 100.585 154.164 100.888 153.854 100.943C153.583 100.991 153.304 100.925 153.083 100.761C152.831 100.573 152.695 100.166 152.424 99.3532L150.414 93.3239L147.069 96.6692C146.869 96.8689 146.769 96.9687 146.703 97.0863C146.643 97.1905 146.603 97.3044 146.585 97.4227C146.563 97.5563 146.579 97.6966 146.61 97.9773L146.794 99.6307C146.825 99.9113 146.841 100.052 146.819 100.185C146.8 100.304 146.76 100.417 146.701 100.522C146.634 100.639 146.535 100.739 146.335 100.939L146.137 101.136C145.664 101.609 145.428 101.846 145.165 101.914C144.934 101.974 144.69 101.95 144.476 101.846C144.231 101.727 144.046 101.449 143.675 100.892L142.106 98.5399C142.04 98.4404 142.007 98.3907 141.968 98.3456C141.934 98.3056 141.897 98.2683 141.857 98.2341C141.812 98.1956 141.762 98.1624 141.663 98.0961L139.31 96.5278C138.754 96.1567 138.475 95.9712 138.356 95.7269C138.252 95.5126 138.228 95.2681 138.288 95.0376C138.357 94.7747 138.593 94.5382 139.066 94.0652L139.264 93.8677C139.464 93.668 139.563 93.5681 139.681 93.5013C139.785 93.4422 139.899 93.4022 140.017 93.3833C140.151 93.362 140.291 93.3776 140.572 93.4088L142.225 93.5925C142.506 93.6237 142.646 93.6393 142.78 93.618C142.898 93.5991 143.012 93.5592 143.116 93.5C143.234 93.4332 143.334 93.3334 143.533 93.1337L146.879 89.7884L140.849 87.7786C140.036 87.5075 139.63 87.372 139.442 87.1191C139.278 86.8982 139.212 86.6196 139.26 86.3487C139.315 86.0385 139.618 85.7355 140.224 85.1293L140.595 84.7586C140.824 84.5297 140.938 84.4152 141.074 84.3443C141.194 84.2816 141.325 84.2439 141.46 84.2335C141.613 84.2217 141.77 84.2581 142.086 84.3309L149.545 86.0522C149.855 86.1238 150.01 86.1595 150.16 86.1489C150.304 86.1386 150.445 86.0971 150.571 86.0272C150.703 85.9548 150.813 85.8405 151.035 85.612L153.745 82.8127Z" stroke="#E84C88" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M149.5 86L145 85L141.5 84L139 87L146.5 90L142.5 93.5H139.5L138.5 95.5L142 98.5L143.5 100.5L145 102L146.5 100.5L147 96.5L150.5 94L153 101L155.5 99.5L156 98L154.5 91.5V89L157.5 86V83.5L156 82L154 83L151.5 85.5L149.5 86Z" fill="#E84C88"/>
</g>
<g filter="url(#filter38_d_652_4663)">
<rect x="176" y="120" width="56" height="56" rx="12" fill="#F6F6F6" shape-rendering="crispEdges"/>
<path d="M196 151C196 151 197 150 200 150C203 150 205 152 208 152C211 152 212 151 212 151V140C212 140 211 141 208 141C205 141 203 139 200 139C197 139 196 140 196 140M196 158L196 138" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</g>
<g filter="url(#filter39_d_652_4663)">
<rect x="64" y="232" width="56" height="56" rx="12" fill="#F6F6F6" shape-rendering="crispEdges"/>
<path d="M83.4135 258.744C82.8181 258.513 82.5204 258.397 82.4335 258.23C82.3582 258.086 82.3581 257.914 82.4333 257.769C82.52 257.602 82.8175 257.486 83.4126 257.254L100.3 250.663C100.838 250.454 101.106 250.349 101.278 250.406C101.427 250.456 101.544 250.573 101.594 250.722C101.651 250.894 101.546 251.162 101.336 251.699L94.7461 268.587C94.5139 269.182 94.3977 269.48 94.2308 269.566C94.0862 269.642 93.9139 269.642 93.7693 269.566C93.6025 269.479 93.4867 269.182 93.2552 268.586L90.6271 261.828C90.5801 261.707 90.5566 261.647 90.5203 261.596C90.4881 261.551 90.4487 261.512 90.4036 261.479C90.3527 261.443 90.2923 261.42 90.1715 261.373L83.4135 258.744Z" stroke="#E84C88" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M101 250.5L84 257L82.5 258L90.5 261.5L94 269.5L101.5 252L101 250.5Z" fill="#E84C88"/>
</g>
<g filter="url(#filter40_d_652_4663)">
<rect x="64" y="344" width="56" height="56" rx="12" fill="#F6F6F6" shape-rendering="crispEdges"/>
<path d="M89.3544 381C90.0596 381.622 90.9858 382 92.0002 382C93.0147 382 93.9409 381.622 94.6461 381M82.2941 365.82C82.2798 364.369 83.0623 363.013 84.3264 362.3M101.702 365.82C101.717 364.369 100.934 363.013 99.6702 362.3M98.0002 368C98.0002 366.409 97.3681 364.883 96.2429 363.757C95.1177 362.632 93.5915 362 92.0002 362C90.4089 362 88.8828 362.632 87.7576 363.757C86.6324 364.883 86.0002 366.409 86.0002 368C86.0002 371.09 85.2207 373.206 84.3499 374.605C83.6154 375.786 83.2481 376.376 83.2616 376.541C83.2765 376.723 83.3151 376.793 83.462 376.902C83.5947 377 84.1928 377 85.3891 377H98.6114C99.8077 377 100.406 377 100.538 376.902C100.685 376.793 100.724 376.723 100.739 376.541C100.752 376.376 100.385 375.786 99.6506 374.605C98.7798 373.206 98.0002 371.09 98.0002 368Z" stroke="#E84C88" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M100.5 377H84L83 376.5L84.5 373.5L86 370.5V366.5L88 363.5L91.5 362L95.5 363L97.5 366L98 371L99.5 374L100.5 377Z" fill="#E84C88"/>
</g>
<g filter="url(#filter41_d_652_4663)">
<rect x="176" y="288" width="56" height="56" rx="12" fill="#F6F6F6" shape-rendering="crispEdges"/>
<path d="M201 310V314.501C201 315.052 201 315.328 200.931 315.583C200.87 315.809 200.77 316.023 200.636 316.214C200.483 316.43 200.272 316.607 199.849 316.96L196.151 320.04C195.728 320.393 195.517 320.57 195.364 320.786C195.23 320.977 195.13 321.191 195.069 321.417C195 321.672 195 321.948 195 322.499V322.8C195 323.92 195 324.48 195.218 324.908C195.41 325.284 195.716 325.59 196.092 325.782C196.52 326 197.08 326 198.2 326H209.8C210.92 326 211.48 326 211.908 325.782C212.284 325.59 212.59 325.284 212.782 324.908C213 324.48 213 323.92 213 322.8V322.499C213 321.948 213 321.672 212.931 321.417C212.87 321.191 212.77 320.977 212.636 320.786C212.483 320.57 212.272 320.393 211.849 320.04L208.151 316.96C207.728 316.607 207.517 316.43 207.364 316.214C207.23 316.023 207.13 315.809 207.069 315.583C207 315.328 207 315.052 207 314.501V310M200.3 310H207.7C207.98 310 208.12 310 208.227 309.946C208.321 309.898 208.398 309.821 208.446 309.727C208.5 309.62 208.5 309.48 208.5 309.2V306.8C208.5 306.52 208.5 306.38 208.446 306.273C208.398 306.179 208.321 306.102 208.227 306.054C208.12 306 207.98 306 207.7 306H200.3C200.02 306 199.88 306 199.773 306.054C199.679 306.102 199.602 306.179 199.554 306.273C199.5 306.38 199.5 306.52 199.5 306.8V309.2C199.5 309.48 199.5 309.62 199.554 309.727C199.602 309.821 199.679 309.898 199.773 309.946C199.88 310 200.02 310 200.3 310ZM197.5 321H210.5C210.965 321 211.197 321 211.39 321.038C212.184 321.196 212.804 321.816 212.962 322.61C213 322.803 213 323.035 213 323.5C213 323.965 213 324.197 212.962 324.39C212.804 325.184 212.184 325.804 211.39 325.962C211.197 326 210.965 326 210.5 326H197.5C197.035 326 196.803 326 196.61 325.962C195.816 325.804 195.196 325.184 195.038 324.39C195 324.197 195 323.965 195 323.5C195 323.035 195 322.803 195.038 322.61C195.196 321.816 195.816 321.196 196.61 321.038C196.803 321 197.035 321 197.5 321Z" stroke="#E84C88" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M199.423 307L200 306H208.938L208 309.5H199.423V307Z" fill="#E84C88"/>
<path d="M207 315.5V310.5H201L200.5 316.5L197 319L195 322L195.5 325.5L211.941 326L213 324L212.5 320.5L207 315.5Z" fill="#E84C88"/>
</g>
<rect width="352" height="408" fill="url(#paint0_radial_652_4663)"/>
<g filter="url(#filter42_d_652_4663)">
<rect x="232" y="156" width="96" height="96" rx="16" fill="white" shape-rendering="crispEdges"/>
<path d="M291.49 185.626C293.419 183.633 296.607 183.607 298.569 185.568C300.476 187.476 300.512 190.558 298.649 192.509L293.091 198.329C292.656 198.785 292.438 199.013 292.304 199.28C292.185 199.517 292.114 199.774 292.096 200.038C292.075 200.337 292.146 200.644 292.288 201.258L295.743 216.234C295.889 216.864 295.962 217.18 295.938 217.485C295.917 217.755 295.842 218.018 295.716 218.258C295.575 218.529 295.346 218.758 294.888 219.216L294.146 219.957C292.934 221.17 292.328 221.776 291.708 221.886C291.166 221.981 290.609 221.85 290.167 221.522C289.661 221.146 289.39 220.333 288.848 218.707L284.828 206.648L278.138 213.339C277.738 213.738 277.539 213.938 277.405 214.173C277.287 214.381 277.207 214.609 277.169 214.846C277.127 215.113 277.158 215.393 277.22 215.955L277.588 219.262C277.65 219.823 277.681 220.104 277.638 220.371C277.601 220.607 277.521 220.835 277.402 221.043C277.269 221.279 277.069 221.478 276.67 221.878L276.275 222.273C275.329 223.219 274.856 223.692 274.33 223.829C273.869 223.949 273.38 223.901 272.951 223.692C272.463 223.455 272.092 222.898 271.35 221.785L268.213 217.08C268.08 216.881 268.014 216.782 267.937 216.691C267.869 216.611 267.794 216.537 267.714 216.468C267.624 216.391 267.524 216.325 267.325 216.193L262.62 213.056C261.507 212.314 260.95 211.943 260.713 211.454C260.505 211.025 260.456 210.537 260.577 210.075C260.714 209.55 261.187 209.077 262.133 208.131L262.528 207.736C262.927 207.336 263.127 207.136 263.362 207.003C263.57 206.885 263.798 206.805 264.035 206.767C264.302 206.724 264.582 206.755 265.144 206.818L268.451 207.185C269.012 207.248 269.293 207.279 269.56 207.236C269.796 207.199 270.024 207.119 270.233 207C270.468 206.867 270.667 206.667 271.067 206.268L277.757 199.577L265.699 195.557C264.072 195.015 263.259 194.744 262.884 194.238C262.556 193.797 262.424 193.239 262.52 192.698C262.63 192.077 263.236 191.471 264.448 190.259L265.19 189.517C265.647 189.06 265.876 188.831 266.147 188.689C266.387 188.563 266.65 188.488 266.92 188.467C267.226 188.444 267.541 188.516 268.172 188.662L283.09 192.105C283.71 192.248 284.02 192.319 284.319 192.298C284.608 192.277 284.889 192.194 285.143 192.055C285.406 191.91 285.627 191.681 286.069 191.224L291.49 185.626Z" stroke="#0E0E0E" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/>
</g>
<g filter="url(#filter43_d_652_4663)">
<rect x="168" y="144" width="120" height="120" rx="18" fill="white" shape-rendering="crispEdges"/>
<path d="M228 211C220.268 211 214 204.732 214 197V184.037C214 183.071 214 182.589 214.141 182.202C214.377 181.554 214.887 181.043 215.535 180.807C215.922 180.667 216.405 180.667 217.37 180.667H238.63C239.595 180.667 240.078 180.667 240.465 180.807C241.113 181.043 241.623 181.554 241.859 182.202C242 182.589 242 183.071 242 184.037V197C242 204.732 235.732 211 228 211ZM228 211V218M242 185.333H247.833C248.921 185.333 249.464 185.333 249.893 185.511C250.465 185.748 250.919 186.202 251.156 186.774C251.333 187.203 251.333 187.746 251.333 188.833V190C251.333 192.17 251.333 193.255 251.095 194.145C250.448 196.561 248.561 198.448 246.145 199.095C245.255 199.333 244.17 199.333 242 199.333M214 185.333H208.167C207.079 185.333 206.536 185.333 206.107 185.511C205.535 185.748 205.081 186.202 204.844 186.774C204.667 187.203 204.667 187.746 204.667 188.833V190C204.667 192.17 204.667 193.255 204.905 194.145C205.552 196.561 207.439 198.448 209.855 199.095C210.745 199.333 211.83 199.333 214 199.333M217.37 227.333H238.63C239.202 227.333 239.667 226.869 239.667 226.296C239.667 221.714 235.952 218 231.37 218H224.63C220.048 218 216.333 221.714 216.333 226.296C216.333 226.869 216.798 227.333 217.37 227.333Z" stroke="#0E0E0E" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
</g>
<g filter="url(#filter44_d_652_4663)">
<rect x="24" y="156" width="96" height="96" rx="16" fill="white" shape-rendering="crispEdges"/>
<path d="M76 194H80.6745C81.1637 194 81.4083 194 81.6385 194.055C81.8425 194.104 82.0376 194.185 82.2166 194.295C82.4184 194.418 82.5914 194.591 82.9373 194.937L91.0627 203.063C91.4086 203.409 91.5816 203.582 91.7053 203.783C91.8149 203.962 91.8957 204.157 91.9447 204.362C92 204.592 92 204.836 92 205.325V211C92 211.932 92 212.398 91.8478 212.765C91.6448 213.255 91.2554 213.645 90.7654 213.848C90.3978 214 89.9319 214 89 214M79 214H76M76 214V194.4C76 192.16 76 191.04 75.564 190.184C75.1805 189.431 74.5686 188.819 73.816 188.436C72.9603 188 71.8402 188 69.6 188H58.4C56.1598 188 55.0397 188 54.184 188.436C53.4314 188.819 52.8195 189.431 52.436 190.184C52 191.04 52 192.16 52 194.4V210C52 212.209 53.7909 214 56 214M76 214H68M68 214C68 217.314 65.3137 220 62 220C58.6863 220 56 217.314 56 214M68 214C68 210.686 65.3137 208 62 208C58.6863 208 56 210.686 56 214M89 215C89 217.761 86.7614 220 84 220C81.2386 220 79 217.761 79 215C79 212.239 81.2386 210 84 210C86.7614 210 89 212.239 89 215Z" stroke="#0E0E0E" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/>
</g>
<g filter="url(#filter45_d_652_4663)">
<rect x="64" y="144" width="120" height="120" rx="18" fill="white" shape-rendering="crispEdges"/>
<path d="M105.333 208.667L109.007 223.363C109.111 223.777 109.162 223.983 109.224 224.164C109.821 225.927 111.408 227.166 113.263 227.318C113.453 227.333 113.666 227.333 114.092 227.333C114.626 227.333 114.892 227.333 115.117 227.312C117.338 227.096 119.096 225.338 119.312 223.117C119.333 222.892 119.333 222.626 119.333 222.092V188.833M139.167 207.5C143.677 207.5 147.333 203.844 147.333 199.333C147.333 194.823 143.677 191.167 139.167 191.167M119.917 188.833H111.167C105.368 188.833 100.667 193.534 100.667 199.333C100.667 205.132 105.368 209.833 111.167 209.833H119.917C124.038 209.833 129.08 212.043 132.97 214.163C135.239 215.4 136.374 216.019 137.117 215.928C137.806 215.843 138.327 215.534 138.731 214.969C139.167 214.36 139.167 213.142 139.167 210.705V187.961C139.167 185.525 139.167 184.306 138.731 183.697C138.327 183.133 137.806 182.823 137.117 182.739C136.374 182.648 135.239 183.267 132.97 184.504C129.08 186.624 124.038 188.833 119.917 188.833Z" stroke="#0E0E0E" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
</g>
<g filter="url(#filter46_d_652_4663)">
<rect x="104" y="132" width="144" height="144" rx="20" fill="white" shape-rendering="crispEdges"/>
<rect x="104" y="132" width="144" height="144" rx="20" stroke="url(#paint1_linear_652_4663)" stroke-width="4" shape-rendering="crispEdges"/>
<path d="M167.833 220.333V225.467C167.833 226.12 167.833 226.447 167.706 226.696C167.594 226.916 167.416 227.094 167.196 227.206C166.947 227.333 166.62 227.333 165.967 227.333H161.533C160.88 227.333 160.553 227.333 160.304 227.206C160.084 227.094 159.906 226.916 159.794 226.696C159.667 226.447 159.667 226.12 159.667 225.467V220.333M192.333 220.333V225.467C192.333 226.12 192.333 226.447 192.206 226.696C192.094 226.916 191.916 227.094 191.696 227.206C191.447 227.333 191.12 227.333 190.467 227.333H186.033C185.38 227.333 185.053 227.333 184.804 227.206C184.584 227.094 184.406 226.916 184.294 226.696C184.167 226.447 184.167 226.12 184.167 225.467V220.333M155 204H197M155 188.833H197M163.167 212.167H166.667M185.333 212.167H188.833M166.2 220.333H185.8C189.72 220.333 191.681 220.333 193.178 219.57C194.495 218.899 195.566 217.828 196.237 216.511C197 215.014 197 213.054 197 209.133V191.867C197 187.946 197 185.986 196.237 184.489C195.566 183.172 194.495 182.101 193.178 181.43C191.681 180.667 189.72 180.667 185.8 180.667H166.2C162.28 180.667 160.319 180.667 158.822 181.43C157.505 182.101 156.434 183.172 155.763 184.489C155 185.986 155 187.946 155 191.867V209.133C155 213.054 155 215.014 155.763 216.511C156.434 217.828 157.505 218.899 158.822 219.57C160.319 220.333 162.28 220.333 166.2 220.333Z" stroke="#0E0E0E" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
</g>
</g>
<defs>
<filter id="filter0_d_652_4663" x="-8" y="-8" width="88" height="88" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
<feFlood flood-opacity="0" result="BackgroundImageFix"/>
<feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
<feOffset/>
<feGaussianBlur stdDeviation="8"/>
<feComposite in2="hardAlpha" operator="out"/>
<feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.1 0"/>
<feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_652_4663"/>
<feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_652_4663" result="shape"/>
</filter>
<filter id="filter1_d_652_4663" x="-8" y="48" width="88" height="88" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
<feFlood flood-opacity="0" result="BackgroundImageFix"/>
<feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
<feOffset/>
<feGaussianBlur stdDeviation="8"/>
<feComposite in2="hardAlpha" operator="out"/>
<feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.1 0"/>
<feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_652_4663"/>
<feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_652_4663" result="shape"/>
</filter>
<filter id="filter2_d_652_4663" x="-8" y="104" width="88" height="88" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
<feFlood flood-opacity="0" result="BackgroundImageFix"/>
<feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
<feOffset/>
<feGaussianBlur stdDeviation="8"/>
<feComposite in2="hardAlpha" operator="out"/>
<feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.1 0"/>
<feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_652_4663"/>
<feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_652_4663" result="shape"/>
</filter>
<filter id="filter3_d_652_4663" x="-8" y="160" width="88" height="88" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
<feFlood flood-opacity="0" result="BackgroundImageFix"/>
<feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
<feOffset/>
<feGaussianBlur stdDeviation="8"/>
<feComposite in2="hardAlpha" operator="out"/>
<feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.1 0"/>
<feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_652_4663"/>
<feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_652_4663" result="shape"/>
</filter>
<filter id="filter4_d_652_4663" x="-8" y="216" width="88" height="88" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
<feFlood flood-opacity="0" result="BackgroundImageFix"/>
<feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
<feOffset/>
<feGaussianBlur stdDeviation="8"/>
<feComposite in2="hardAlpha" operator="out"/>
<feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.1 0"/>
<feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_652_4663"/>
<feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_652_4663" result="shape"/>
</filter>
<filter id="filter5_d_652_4663" x="-8" y="272" width="88" height="88" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
<feFlood flood-opacity="0" result="BackgroundImageFix"/>
<feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
<feOffset/>
<feGaussianBlur stdDeviation="8"/>
<feComposite in2="hardAlpha" operator="out"/>
<feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.1 0"/>
<feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_652_4663"/>
<feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_652_4663" result="shape"/>
</filter>
<filter id="filter6_d_652_4663" x="-8" y="328" width="88" height="88" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
<feFlood flood-opacity="0" result="BackgroundImageFix"/>
<feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
<feOffset/>
<feGaussianBlur stdDeviation="8"/>
<feComposite in2="hardAlpha" operator="out"/>
<feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.1 0"/>
<feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_652_4663"/>
<feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_652_4663" result="shape"/>
</filter>
<filter id="filter7_d_652_4663" x="48" y="-8" width="88" height="88" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
<feFlood flood-opacity="0" result="BackgroundImageFix"/>
<feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
<feOffset/>
<feGaussianBlur stdDeviation="8"/>
<feComposite in2="hardAlpha" operator="out"/>
<feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.1 0"/>
<feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_652_4663"/>
<feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_652_4663" result="shape"/>
</filter>
<filter id="filter8_d_652_4663" x="48" y="48" width="88" height="88" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
<feFlood flood-opacity="0" result="BackgroundImageFix"/>
<feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
<feOffset/>
<feGaussianBlur stdDeviation="8"/>
<feComposite in2="hardAlpha" operator="out"/>
<feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.1 0"/>
<feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_652_4663"/>
<feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_652_4663" result="shape"/>
</filter>
<filter id="filter9_d_652_4663" x="48" y="104" width="88" height="88" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
<feFlood flood-opacity="0" result="BackgroundImageFix"/>
<feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
<feOffset/>
<feGaussianBlur stdDeviation="8"/>
<feComposite in2="hardAlpha" operator="out"/>
<feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.1 0"/>
<feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_652_4663"/>
<feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_652_4663" result="shape"/>
</filter>
<filter id="filter10_d_652_4663" x="48" y="160" width="88" height="88" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
<feFlood flood-opacity="0" result="BackgroundImageFix"/>
<feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
<feOffset/>
<feGaussianBlur stdDeviation="8"/>
<feComposite in2="hardAlpha" operator="out"/>
<feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.1 0"/>
<feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_652_4663"/>
<feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_652_4663" result="shape"/>
</filter>
<filter id="filter11_d_652_4663" x="48" y="272" width="88" height="88" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
<feFlood flood-opacity="0" result="BackgroundImageFix"/>
<feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
<feOffset/>
<feGaussianBlur stdDeviation="8"/>
<feComposite in2="hardAlpha" operator="out"/>
<feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.1 0"/>
<feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_652_4663"/>
<feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_652_4663" result="shape"/>
</filter>
<filter id="filter12_d_652_4663" x="104" y="-8" width="88" height="88" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
<feFlood flood-opacity="0" result="BackgroundImageFix"/>
<feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
<feOffset/>
<feGaussianBlur stdDeviation="8"/>
<feComposite in2="hardAlpha" operator="out"/>
<feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.1 0"/>
<feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_652_4663"/>
<feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_652_4663" result="shape"/>
</filter>
<filter id="filter13_d_652_4663" x="104" y="104" width="88" height="88" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
<feFlood flood-opacity="0" result="BackgroundImageFix"/>
<feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
<feOffset/>
<feGaussianBlur stdDeviation="8"/>
<feComposite in2="hardAlpha" operator="out"/>
<feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.1 0"/>
<feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_652_4663"/>
<feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_652_4663" result="shape"/>
</filter>
<filter id="filter14_d_652_4663" x="104" y="160" width="88" height="88" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
<feFlood flood-opacity="0" result="BackgroundImageFix"/>
<feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
<feOffset/>
<feGaussianBlur stdDeviation="8"/>
<feComposite in2="hardAlpha" operator="out"/>
<feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.1 0"/>
<feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_652_4663"/>
<feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_652_4663" result="shape"/>
</filter>
<filter id="filter15_d_652_4663" x="104" y="216" width="88" height="88" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
<feFlood flood-opacity="0" result="BackgroundImageFix"/>
<feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
<feOffset/>
<feGaussianBlur stdDeviation="8"/>
<feComposite in2="hardAlpha" operator="out"/>
<feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.1 0"/>
<feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_652_4663"/>
<feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_652_4663" result="shape"/>
</filter>
<filter id="filter16_d_652_4663" x="104" y="272" width="88" height="88" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
<feFlood flood-opacity="0" result="BackgroundImageFix"/>
<feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
<feOffset/>
<feGaussianBlur stdDeviation="8"/>
<feComposite in2="hardAlpha" operator="out"/>
<feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.1 0"/>
<feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_652_4663"/>
<feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_652_4663" result="shape"/>
</filter>
<filter id="filter17_d_652_4663" x="104" y="328" width="88" height="88" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
<feFlood flood-opacity="0" result="BackgroundImageFix"/>
<feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
<feOffset/>
<feGaussianBlur stdDeviation="8"/>
<feComposite in2="hardAlpha" operator="out"/>
<feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.1 0"/>
<feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_652_4663"/>
<feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_652_4663" result="shape"/>
</filter>
<filter id="filter18_d_652_4663" x="160" y="-8" width="88" height="88" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
<feFlood flood-opacity="0" result="BackgroundImageFix"/>
<feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
<feOffset/>
<feGaussianBlur stdDeviation="8"/>
<feComposite in2="hardAlpha" operator="out"/>
<feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.1 0"/>
<feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_652_4663"/>
<feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_652_4663" result="shape"/>
</filter>
<filter id="filter19_d_652_4663" x="160" y="48" width="88" height="88" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
<feFlood flood-opacity="0" result="BackgroundImageFix"/>
<feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
<feOffset/>
<feGaussianBlur stdDeviation="8"/>
<feComposite in2="hardAlpha" operator="out"/>
<feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.1 0"/>
<feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_652_4663"/>
<feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_652_4663" result="shape"/>
</filter>
<filter id="filter20_d_652_4663" x="160" y="160" width="88" height="88" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
<feFlood flood-opacity="0" result="BackgroundImageFix"/>
<feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
<feOffset/>
<feGaussianBlur stdDeviation="8"/>
<feComposite in2="hardAlpha" operator="out"/>
<feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.1 0"/>
<feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_652_4663"/>
<feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_652_4663" result="shape"/>
</filter>
<filter id="filter21_d_652_4663" x="160" y="216" width="88" height="88" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
<feFlood flood-opacity="0" result="BackgroundImageFix"/>
<feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
<feOffset/>
<feGaussianBlur stdDeviation="8"/>
<feComposite in2="hardAlpha" operator="out"/>
<feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.1 0"/>
<feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_652_4663"/>
<feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_652_4663" result="shape"/>
</filter>
<filter id="filter22_d_652_4663" x="160" y="328" width="88" height="88" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
<feFlood flood-opacity="0" result="BackgroundImageFix"/>
<feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
<feOffset/>
<feGaussianBlur stdDeviation="8"/>
<feComposite in2="hardAlpha" operator="out"/>
<feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.1 0"/>
<feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_652_4663"/>
<feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_652_4663" result="shape"/>
</filter>
<filter id="filter23_d_652_4663" x="216" y="-8" width="88" height="88" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
<feFlood flood-opacity="0" result="BackgroundImageFix"/>
<feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
<feOffset/>
<feGaussianBlur stdDeviation="8"/>
<feComposite in2="hardAlpha" operator="out"/>
<feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.1 0"/>
<feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_652_4663"/>
<feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_652_4663" result="shape"/>
</filter>
<filter id="filter24_d_652_4663" x="216" y="48" width="88" height="88" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
<feFlood flood-opacity="0" result="BackgroundImageFix"/>
<feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
<feOffset/>
<feGaussianBlur stdDeviation="8"/>
<feComposite in2="hardAlpha" operator="out"/>
<feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.1 0"/>
<feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_652_4663"/>
<feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_652_4663" result="shape"/>
</filter>
<filter id="filter25_d_652_4663" x="216" y="104" width="88" height="88" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
<feFlood flood-opacity="0" result="BackgroundImageFix"/>
<feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
<feOffset/>
<feGaussianBlur stdDeviation="8"/>
<feComposite in2="hardAlpha" operator="out"/>
<feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.1 0"/>
<feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_652_4663"/>
<feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_652_4663" result="shape"/>
</filter>
<filter id="filter26_d_652_4663" x="216" y="160" width="88" height="88" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
<feFlood flood-opacity="0" result="BackgroundImageFix"/>
<feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
<feOffset/>
<feGaussianBlur stdDeviation="8"/>
<feComposite in2="hardAlpha" operator="out"/>
<feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.1 0"/>
<feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_652_4663"/>
<feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_652_4663" result="shape"/>
</filter>
<filter id="filter27_d_652_4663" x="216" y="216" width="88" height="88" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
<feFlood flood-opacity="0" result="BackgroundImageFix"/>
<feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
<feOffset/>
<feGaussianBlur stdDeviation="8"/>
<feComposite in2="hardAlpha" operator="out"/>
<feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.1 0"/>
<feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_652_4663"/>
<feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_652_4663" result="shape"/>
</filter>
<filter id="filter28_d_652_4663" x="216" y="272" width="88" height="88" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
<feFlood flood-opacity="0" result="BackgroundImageFix"/>
<feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
<feOffset/>
<feGaussianBlur stdDeviation="8"/>
<feComposite in2="hardAlpha" operator="out"/>
<feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.1 0"/>
<feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_652_4663"/>
<feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_652_4663" result="shape"/>
</filter>
<filter id="filter29_d_652_4663" x="216" y="328" width="88" height="88" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
<feFlood flood-opacity="0" result="BackgroundImageFix"/>
<feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
<feOffset/>
<feGaussianBlur stdDeviation="8"/>
<feComposite in2="hardAlpha" operator="out"/>
<feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.1 0"/>
<feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_652_4663"/>
<feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_652_4663" result="shape"/>
</filter>
<filter id="filter30_d_652_4663" x="272" y="-8" width="88" height="88" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
<feFlood flood-opacity="0" result="BackgroundImageFix"/>
<feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
<feOffset/>
<feGaussianBlur stdDeviation="8"/>
<feComposite in2="hardAlpha" operator="out"/>
<feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.1 0"/>
<feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_652_4663"/>
<feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_652_4663" result="shape"/>
</filter>
<filter id="filter31_d_652_4663" x="272" y="48" width="88" height="88" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
<feFlood flood-opacity="0" result="BackgroundImageFix"/>
<feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
<feOffset/>
<feGaussianBlur stdDeviation="8"/>
<feComposite in2="hardAlpha" operator="out"/>
<feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.1 0"/>
<feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_652_4663"/>
<feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_652_4663" result="shape"/>
</filter>
<filter id="filter32_d_652_4663" x="272" y="104" width="88" height="88" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
<feFlood flood-opacity="0" result="BackgroundImageFix"/>
<feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
<feOffset/>
<feGaussianBlur stdDeviation="8"/>
<feComposite in2="hardAlpha" operator="out"/>
<feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.1 0"/>
<feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_652_4663"/>
<feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_652_4663" result="shape"/>
</filter>
<filter id="filter33_d_652_4663" x="272" y="160" width="88" height="88" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
<feFlood flood-opacity="0" result="BackgroundImageFix"/>
<feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
<feOffset/>
<feGaussianBlur stdDeviation="8"/>
<feComposite in2="hardAlpha" operator="out"/>
<feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.1 0"/>
<feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_652_4663"/>
<feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_652_4663" result="shape"/>
</filter>
<filter id="filter34_d_652_4663" x="272" y="216" width="88" height="88" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
<feFlood flood-opacity="0" result="BackgroundImageFix"/>
<feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
<feOffset/>
<feGaussianBlur stdDeviation="8"/>
<feComposite in2="hardAlpha" operator="out"/>
<feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.1 0"/>
<feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_652_4663"/>
<feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_652_4663" result="shape"/>
</filter>
<filter id="filter35_d_652_4663" x="272" y="272" width="88" height="88" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
<feFlood flood-opacity="0" result="BackgroundImageFix"/>
<feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
<feOffset/>
<feGaussianBlur stdDeviation="8"/>
<feComposite in2="hardAlpha" operator="out"/>
<feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.1 0"/>
<feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_652_4663"/>
<feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_652_4663" result="shape"/>
</filter>
<filter id="filter36_d_652_4663" x="272" y="328" width="88" height="88" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
<feFlood flood-opacity="0" result="BackgroundImageFix"/>
<feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
<feOffset/>
<feGaussianBlur stdDeviation="8"/>
<feComposite in2="hardAlpha" operator="out"/>
<feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.1 0"/>
<feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_652_4663"/>
<feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_652_4663" result="shape"/>
</filter>
<filter id="filter37_d_652_4663" x="104" y="48" width="88" height="88" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
<feFlood flood-opacity="0" result="BackgroundImageFix"/>
<feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
<feOffset/>
<feGaussianBlur stdDeviation="8"/>
<feComposite in2="hardAlpha" operator="out"/>
<feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.1 0"/>
<feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_652_4663"/>
<feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_652_4663" result="shape"/>
</filter>
<filter id="filter38_d_652_4663" x="160" y="104" width="88" height="88" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
<feFlood flood-opacity="0" result="BackgroundImageFix"/>
<feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
<feOffset/>
<feGaussianBlur stdDeviation="8"/>
<feComposite in2="hardAlpha" operator="out"/>
<feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.1 0"/>
<feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_652_4663"/>
<feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_652_4663" result="shape"/>
</filter>
<filter id="filter39_d_652_4663" x="48" y="216" width="88" height="88" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
<feFlood flood-opacity="0" result="BackgroundImageFix"/>
<feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
<feOffset/>
<feGaussianBlur stdDeviation="8"/>
<feComposite in2="hardAlpha" operator="out"/>
<feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.1 0"/>
<feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_652_4663"/>
<feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_652_4663" result="shape"/>
</filter>
<filter id="filter40_d_652_4663" x="48" y="328" width="88" height="88" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
<feFlood flood-opacity="0" result="BackgroundImageFix"/>
<feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
<feOffset/>
<feGaussianBlur stdDeviation="8"/>
<feComposite in2="hardAlpha" operator="out"/>
<feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.1 0"/>
<feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_652_4663"/>
<feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_652_4663" result="shape"/>
</filter>
<filter id="filter41_d_652_4663" x="160" y="272" width="88" height="88" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
<feFlood flood-opacity="0" result="BackgroundImageFix"/>
<feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
<feOffset/>
<feGaussianBlur stdDeviation="8"/>
<feComposite in2="hardAlpha" operator="out"/>
<feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.1 0"/>
<feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_652_4663"/>
<feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_652_4663" result="shape"/>
</filter>
<filter id="filter42_d_652_4663" x="216" y="140" width="128" height="128" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
<feFlood flood-opacity="0" result="BackgroundImageFix"/>
<feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
<feOffset/>
<feGaussianBlur stdDeviation="8"/>
<feComposite in2="hardAlpha" operator="out"/>
<feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.1 0"/>
<feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_652_4663"/>
<feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_652_4663" result="shape"/>
</filter>
<filter id="filter43_d_652_4663" x="152" y="128" width="152" height="152" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
<feFlood flood-opacity="0" result="BackgroundImageFix"/>
<feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
<feOffset/>
<feGaussianBlur stdDeviation="8"/>
<feComposite in2="hardAlpha" operator="out"/>
<feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.1 0"/>
<feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_652_4663"/>
<feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_652_4663" result="shape"/>
</filter>
<filter id="filter44_d_652_4663" x="8" y="140" width="128" height="128" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
<feFlood flood-opacity="0" result="BackgroundImageFix"/>
<feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
<feOffset/>
<feGaussianBlur stdDeviation="8"/>
<feComposite in2="hardAlpha" operator="out"/>
<feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.1 0"/>
<feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_652_4663"/>
<feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_652_4663" result="shape"/>
</filter>
<filter id="filter45_d_652_4663" x="48" y="128" width="152" height="152" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
<feFlood flood-opacity="0" result="BackgroundImageFix"/>
<feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
<feOffset/>
<feGaussianBlur stdDeviation="8"/>
<feComposite in2="hardAlpha" operator="out"/>
<feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.1 0"/>
<feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_652_4663"/>
<feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_652_4663" result="shape"/>
</filter>
<filter id="filter46_d_652_4663" x="86" y="114" width="180" height="180" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
<feFlood flood-opacity="0" result="BackgroundImageFix"/>
<feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
<feOffset/>
<feGaussianBlur stdDeviation="8"/>
<feComposite in2="hardAlpha" operator="out"/>
<feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.1 0"/>
<feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_652_4663"/>
<feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_652_4663" result="shape"/>
</filter>
<radialGradient id="paint0_radial_652_4663" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(176 204) rotate(90) scale(204 176)">
<stop offset="0.679584" stop-color="#F6F6F6" stop-opacity="0"/>
<stop offset="1" stop-color="#F6F6F6"/>
</radialGradient>
<linearGradient id="paint1_linear_652_4663" x1="173.5" y1="209.5" x2="237.5" y2="136" gradientUnits="userSpaceOnUse">
<stop stop-color="#F3F3F3"/>
<stop offset="1" stop-color="#E84C88"/>
</linearGradient>
<clipPath id="clip0_652_4663">
<rect width="352" height="408" rx="24" fill="white"/>
</clipPath>
</defs>
</svg>

                `)
        },
        {
            title: "The Helvetica of icons",
            description: "Timeless, legible forms that fit anywhere—perfect for product UI and system patterns.",
            image: (`
                <svg width="352" height="408" viewBox="0 0 352 408" fill="none" xmlns="http://www.w3.org/2000/svg">
<g clip-path="url(#clip0_652_4773)">
<rect width="352" height="408" rx="24" fill="#F6F6F6"/>
<g opacity="0.4" filter="url(#filter0_d_652_4773)">
<rect x="8" y="8" width="56" height="56" rx="12" fill="white" shape-rendering="crispEdges"/>
<path d="M32.5 43V45.2C32.5 45.48 32.5 45.62 32.4455 45.727C32.3976 45.8211 32.3211 45.8976 32.227 45.9455C32.12 46 31.98 46 31.7 46H29.8C29.52 46 29.38 46 29.273 45.9455C29.1789 45.8976 29.1024 45.8211 29.0545 45.727C29 45.62 29 45.48 29 45.2V43M43 43V45.2C43 45.48 43 45.62 42.9455 45.727C42.8976 45.8211 42.8211 45.8976 42.727 45.9455C42.62 46 42.48 46 42.2 46H40.3C40.02 46 39.88 46 39.773 45.9455C39.6789 45.8976 39.6024 45.8211 39.5545 45.727C39.5 45.62 39.5 45.48 39.5 45.2V43M27 36H45M27 29.5H45M30.5 39.5H32M40 39.5H41.5M31.8 43H40.2C41.8802 43 42.7202 43 43.362 42.673C43.9265 42.3854 44.3854 41.9265 44.673 41.362C45 40.7202 45 39.8802 45 38.2V30.8C45 29.1198 45 28.2798 44.673 27.638C44.3854 27.0735 43.9265 26.6146 43.362 26.327C42.7202 26 41.8802 26 40.2 26H31.8C30.1198 26 29.2798 26 28.638 26.327C28.0735 26.6146 27.6146 27.0735 27.327 27.638C27 28.2798 27 29.1198 27 30.8V38.2C27 39.8802 27 40.7202 27.327 41.362C27.6146 41.9265 28.0735 42.3854 28.638 42.673C29.2798 43 30.1198 43 31.8 43Z" stroke="#ECECEC" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</g>
<g opacity="0.4" filter="url(#filter1_d_652_4773)">
<rect x="8" y="64" width="56" height="56" rx="12" fill="white" shape-rendering="crispEdges"/>
<path d="M36 92.5C37.6569 92.5 39 91.1569 39 89.5C39 87.8431 37.6569 86.5 36 86.5C34.3431 86.5 33 87.8431 33 89.5C33 91.1569 34.3431 92.5 36 92.5Z" stroke="#ECECEC" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M36 102C38 98 44 95.4183 44 90C44 85.5817 40.4183 82 36 82C31.5817 82 28 85.5817 28 90C28 95.4183 34 98 36 102Z" stroke="#ECECEC" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</g>
<g opacity="0.4" filter="url(#filter2_d_652_4773)">
<rect x="8" y="120" width="56" height="56" rx="12" fill="white" shape-rendering="crispEdges"/>
<path d="M46 148C46 153.523 41.5228 158 36 158M46 148C46 142.477 41.5228 138 36 138M46 148H44M36 158C30.4772 158 26 153.523 26 148M36 158V156M26 148C26 142.477 30.4772 138 36 138M26 148H28M36 138V140M43.0711 155.071L41.6569 153.657M30.3431 142.343L28.9289 140.929M41.6569 142.343L43.0711 140.929M28.9289 155.071L30.3431 153.657M32 148L34.5 146.5L36 144L37.5 146.5L40 148L37.5 149.5L36 152L34.5 149.5L32 148Z" stroke="#ECECEC" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</g>
<g opacity="0.4" filter="url(#filter3_d_652_4773)">
<rect x="8" y="176" width="56" height="56" rx="12" fill="white" shape-rendering="crispEdges"/>
<path d="M40 205.374C43.5318 206.069 46 207.655 46 209.5C46 211.985 41.5228 214 36 214C30.4772 214 26 211.985 26 209.5C26 207.655 28.4682 206.069 32 205.374M36 209V195L41.3177 198.272C41.7056 198.511 41.8995 198.63 41.9614 198.781C42.0154 198.912 42.0111 199.06 41.9497 199.188C41.8792 199.334 41.6787 199.442 41.2777 199.658L36 202.5" stroke="#ECECEC" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</g>
<g opacity="0.4" filter="url(#filter4_d_652_4773)">
<rect x="8" y="232" width="56" height="56" rx="12" fill="white" shape-rendering="crispEdges"/>
<path d="M28 263C28 263 29 262 32 262C35 262 37 264 40 264C43 264 44 263 44 263V251C44 251 43 252 40 252C37 252 35 250 32 250C29 250 28 251 28 251L28 270" stroke="#ECECEC" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</g>
<g opacity="0.4" filter="url(#filter5_d_652_4773)">
<rect x="8" y="288" width="56" height="56" rx="12" fill="white" shape-rendering="crispEdges"/>
<path d="M35 308H31.8C30.1198 308 29.2798 308 28.638 308.327C28.0735 308.615 27.6146 309.074 27.327 309.638C27 310.28 27 311.12 27 312.8V318C27 318.93 27 319.395 27.1022 319.776C27.3796 320.812 28.1883 321.62 29.2235 321.898C29.605 322 30.07 322 31 322V324.336C31 324.868 31 325.135 31.1092 325.272C31.2042 325.391 31.3483 325.46 31.5005 325.46C31.6756 325.459 31.8837 325.293 32.2998 324.96L34.6852 323.052C35.1725 322.662 35.4162 322.467 35.6875 322.328C35.9282 322.205 36.1844 322.116 36.4492 322.061C36.7477 322 37.0597 322 37.6837 322H39.2C40.8802 322 41.7202 322 42.362 321.673C42.9265 321.385 43.3854 320.926 43.673 320.362C44 319.72 44 318.88 44 317.2V317M44.1213 307.879C45.2929 309.05 45.2929 310.95 44.1213 312.121C42.9497 313.293 41.0503 313.293 39.8787 312.121C38.7071 310.95 38.7071 309.05 39.8787 307.879C41.0503 306.707 42.9497 306.707 44.1213 307.879Z" stroke="#ECECEC" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</g>
<g opacity="0.4" filter="url(#filter6_d_652_4773)">
<rect x="8" y="344" width="56" height="56" rx="12" fill="white" shape-rendering="crispEdges"/>
<path d="M43 369L46 366M46 366L43 363M46 366L40 366M40 381V379.8C40 378.12 40 377.28 39.673 376.638C39.3854 376.074 38.9265 375.615 38.362 375.327C37.7202 375 36.8802 375 35.2 375H30.8C29.1198 375 28.2798 375 27.638 375.327C27.0735 375.615 26.6146 376.074 26.327 376.638C26 377.28 26 378.12 26 379.8V381M36.5 367.5C36.5 369.433 34.933 371 33 371C31.067 371 29.5 369.433 29.5 367.5C29.5 365.567 31.067 364 33 364C34.933 364 36.5 365.567 36.5 367.5Z" stroke="#ECECEC" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</g>
<g opacity="0.4" filter="url(#filter7_d_652_4773)">
<rect x="64" y="8" width="56" height="56" rx="12" fill="white" shape-rendering="crispEdges"/>
<path d="M82 36H102M82 36C82 41.5228 86.4772 46 92 46M82 36C82 30.4772 86.4772 26 92 26M102 36C102 41.5228 97.5228 46 92 46M102 36C102 30.4772 97.5228 26 92 26M92 26C94.5013 28.7384 95.9228 32.292 96 36C95.9228 39.708 94.5013 43.2616 92 46M92 26C89.4987 28.7384 88.0772 32.292 88 36C88.0772 39.708 89.4987 43.2616 92 46" stroke="#ECECEC" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</g>
<g opacity="0.4" filter="url(#filter8_d_652_4773)">
<rect x="64" y="64" width="56" height="56" rx="12" fill="white" shape-rendering="crispEdges"/>
<path d="M92 95L89 92M92 95C93.3968 94.4687 94.7369 93.7987 96 93M92 95V100C92 100 95.03 99.45 96 98C97.08 96.38 96 93 96 93M89 92C89.5321 90.6194 90.2022 89.2961 91 88.05C92.1652 86.187 93.7876 84.6531 95.713 83.5941C97.6384 82.5351 99.8027 81.9864 102 82C102 84.72 101.22 89.5 96 93M89 92H84C84 92 84.55 88.97 86 88C87.62 86.92 91 88 91 88M84.5 96.5C83 97.76 82.5 101.5 82.5 101.5C82.5 101.5 86.24 101 87.5 99.5C88.21 98.66 88.2 97.37 87.41 96.59C87.0213 96.219 86.5093 96.0046 85.9722 95.988C85.4352 95.9714 84.9109 96.1537 84.5 96.5Z" stroke="#ECECEC" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</g>
<g opacity="0.4" filter="url(#filter9_d_652_4773)">
<rect x="64" y="120" width="56" height="56" rx="12" fill="white" shape-rendering="crispEdges"/>
<path d="M83.076 143.483L87.364 146.546C87.5872 146.705 87.6987 146.785 87.8155 146.803C87.9182 146.819 88.0234 146.803 88.1165 146.756C88.2222 146.704 88.3045 146.594 88.469 146.375L89.3751 145.167C89.4216 145.104 89.4449 145.073 89.4722 145.047C89.4965 145.023 89.5232 145.002 89.5517 144.983C89.5839 144.963 89.6193 144.947 89.6902 144.915L93.5588 143.196C93.7192 143.125 93.7993 143.089 93.8598 143.034C93.9133 142.984 93.9554 142.924 93.9832 142.857C94.0146 142.781 94.0204 142.693 94.0321 142.518L94.3154 138.269M93.5 149.5L96.116 150.621C96.4195 150.751 96.5713 150.816 96.6517 150.924C96.7222 151.019 96.7569 151.136 96.7496 151.254C96.7413 151.388 96.6497 151.525 96.4665 151.8L95.2375 153.644C95.1507 153.774 95.1072 153.839 95.0499 153.886C94.9991 153.928 94.9406 153.959 94.8777 153.978C94.8067 154 94.7284 154 94.5719 154H92.5766C92.3693 154 92.2656 154 92.1774 153.965C92.0995 153.935 92.0305 153.885 91.9768 153.821C91.916 153.748 91.8832 153.65 91.8177 153.453L91.1048 151.314C91.0661 151.198 91.0468 151.14 91.0417 151.081C91.0372 151.029 91.0409 150.976 91.0528 150.925C91.0662 150.868 91.0935 150.813 91.1482 150.704L91.6897 149.621C91.7997 149.401 91.8547 149.291 91.9395 149.222C92.0141 149.162 92.1046 149.125 92.1999 149.114C92.3081 149.103 92.4248 149.142 92.6582 149.219L93.5 149.5ZM102 148C102 153.523 97.5228 158 92 158C86.4772 158 82 153.523 82 148C82 142.477 86.4772 138 92 138C97.5228 138 102 142.477 102 148Z" stroke="#ECECEC" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</g>
<g opacity="0.4" filter="url(#filter10_d_652_4773)">
<rect x="64" y="176" width="56" height="56" rx="12" fill="white" shape-rendering="crispEdges"/>
<path d="M88 200V199M88 204.5V203.5M88 209V208M86.8 212H97.2C98.8802 212 99.7202 212 100.362 211.673C100.926 211.385 101.385 210.926 101.673 210.362C102 209.72 102 208.88 102 207.2V200.8C102 199.12 102 198.28 101.673 197.638C101.385 197.074 100.926 196.615 100.362 196.327C99.7202 196 98.8802 196 97.2 196H86.8C85.1198 196 84.2798 196 83.638 196.327C83.0735 196.615 82.6146 197.074 82.327 197.638C82 198.28 82 199.12 82 200.8V207.2C82 208.88 82 209.72 82.327 210.362C82.6146 210.926 83.0735 211.385 83.638 211.673C84.2798 212 85.1198 212 86.8 212Z" stroke="#ECECEC" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</g>
<g opacity="0.4" filter="url(#filter11_d_652_4773)">
<rect x="64" y="288" width="56" height="56" rx="12" fill="white" shape-rendering="crispEdges"/>
<path d="M91 308H87.8C86.1198 308 85.2798 308 84.638 308.327C84.0735 308.615 83.6146 309.074 83.327 309.638C83 310.28 83 311.12 83 312.8V320.2C83 321.88 83 322.72 83.327 323.362C83.6146 323.926 84.0735 324.385 84.638 324.673C85.2798 325 86.1198 325 87.8 325H95.2C96.8802 325 97.7202 325 98.362 324.673C98.9265 324.385 99.3854 323.926 99.673 323.362C100 322.72 100 321.88 100 320.2V317M93 321H87M95 317H87M100.121 307.879C101.293 309.05 101.293 310.95 100.121 312.121C98.9497 313.293 97.0503 313.293 95.8787 312.121C94.7071 310.95 94.7071 309.05 95.8787 307.879C97.0503 306.707 98.9497 306.707 100.121 307.879Z" stroke="#ECECEC" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</g>
<g opacity="0.4" filter="url(#filter12_d_652_4773)">
<rect x="120" y="8" width="56" height="56" rx="12" fill="white" shape-rendering="crispEdges"/>
<path d="M148 37C149.657 37 151 35.6569 151 34C151 32.3431 149.657 31 148 31C146.343 31 145 32.3431 145 34C145 35.6569 146.343 37 148 37Z" stroke="#ECECEC" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M148 46C152 42 156 38.4183 156 34C156 29.5817 152.418 26 148 26C143.582 26 140 29.5817 140 34C140 38.4183 144 42 148 46Z" stroke="#ECECEC" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</g>
<g opacity="0.4" filter="url(#filter13_d_652_4773)">
<rect x="120" y="120" width="56" height="56" rx="12" fill="white" shape-rendering="crispEdges"/>
<path d="M141 150.286C139.149 151.103 138 152.241 138 153.5C138 155.985 142.477 158 148 158C153.523 158 158 155.985 158 153.5C158 152.241 156.851 151.103 155 150.286M154 144C154 148.064 149.5 150 148 153C146.5 150 142 148.064 142 144C142 140.686 144.686 138 148 138C151.314 138 154 140.686 154 144ZM149 144C149 144.552 148.552 145 148 145C147.448 145 147 144.552 147 144C147 143.448 147.448 143 148 143C148.552 143 149 143.448 149 144Z" stroke="#ECECEC" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</g>
<g opacity="0.4" filter="url(#filter14_d_652_4773)">
<rect x="120" y="288" width="56" height="56" rx="12" fill="white" shape-rendering="crispEdges"/>
<path d="M153 306V317M158 313.8V309.2C158 308.08 158 307.52 157.782 307.092C157.59 306.716 157.284 306.41 156.908 306.218C156.48 306 155.92 306 154.8 306H144.118C142.657 306 141.926 306 141.336 306.267C140.815 306.503 140.373 306.882 140.061 307.361C139.707 307.903 139.596 308.626 139.374 310.07L138.851 313.47C138.558 315.375 138.411 316.328 138.694 317.069C138.942 317.72 139.409 318.264 140.014 318.608C140.704 319 141.667 319 143.595 319H144.4C144.96 319 145.24 319 145.454 319.109C145.642 319.205 145.795 319.358 145.891 319.546C146 319.76 146 320.04 146 320.6V323.534C146 324.896 147.104 326 148.466 326C148.791 326 149.085 325.809 149.217 325.512L152.578 317.95C152.731 317.606 152.807 317.434 152.928 317.308C153.035 317.197 153.166 317.112 153.311 317.059C153.475 317 153.663 317 154.04 317H154.8C155.92 317 156.48 317 156.908 316.782C157.284 316.59 157.59 316.284 157.782 315.908C158 315.48 158 314.92 158 313.8Z" stroke="#ECECEC" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</g>
<g opacity="0.4" filter="url(#filter15_d_652_4773)">
<rect x="120" y="344" width="56" height="56" rx="12" fill="white" shape-rendering="crispEdges"/>
<path d="M152 366L155 363M155 363L158 366M155 363V369M152 381V379.8C152 378.12 152 377.28 151.673 376.638C151.385 376.074 150.926 375.615 150.362 375.327C149.72 375 148.88 375 147.2 375H142.8C141.12 375 140.28 375 139.638 375.327C139.074 375.615 138.615 376.074 138.327 376.638C138 377.28 138 378.12 138 379.8V381M148.5 367.5C148.5 369.433 146.933 371 145 371C143.067 371 141.5 369.433 141.5 367.5C141.5 365.567 143.067 364 145 364C146.933 364 148.5 365.567 148.5 367.5Z" stroke="#ECECEC" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</g>
<g opacity="0.4" filter="url(#filter16_d_652_4773)">
<rect x="176" y="8" width="56" height="56" rx="12" fill="white" shape-rendering="crispEdges"/>
<path d="M205 34.9999L195.5 44.4999M206.018 27.5384C207.236 28.3466 208.407 29.2994 209.501 30.3934C210.604 31.4968 211.564 32.6783 212.377 33.9077M201.255 31.896L198.38 30.9378C198.049 30.8274 197.684 30.8976 197.418 31.1231L194.56 33.5407C193.975 34.0356 194.142 34.9775 194.861 35.2424L197.568 36.2398M203.681 42.3524L204.678 45.0596C204.943 45.7786 205.885 45.9448 206.38 45.3599L208.797 42.5027C209.023 42.2363 209.093 41.8716 208.983 41.5405L208.024 38.6657M211.348 26.2706L206.442 27.0884C205.912 27.1767 205.426 27.4371 205.059 27.8293L198.446 34.8985C196.732 36.7308 196.78 39.5924 198.554 41.3667C200.328 43.1409 203.19 43.1886 205.022 41.4744L212.091 34.8614C212.483 34.4944 212.744 34.0085 212.832 33.4787L213.65 28.5722C213.875 27.2186 212.702 26.045 211.348 26.2706Z" stroke="#ECECEC" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</g>
<g opacity="0.4" filter="url(#filter17_d_652_4773)">
<rect x="176" y="64" width="56" height="56" rx="12" fill="white" shape-rendering="crispEdges"/>
<path d="M204 82C207 84 207.923 88.292 208 92C207.923 95.708 207 100 204 102M204 82C201 84 200.077 88.292 200 92C200.077 95.708 201 100 204 102M204 82C198.477 82 194 86.4772 194 92M204 82C209.523 82 214 86.4772 214 92M204 102C209.523 102 214 97.5228 214 92M204 102C198.477 102 194 97.5228 194 92M214 92C212 95 207.708 95.9228 204 96C200.292 95.9228 196 95 194 92M214 92C212 89 207.708 88.0772 204 88C200.292 88.0772 196 89 194 92" stroke="#ECECEC" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</g>
<g opacity="0.4" filter="url(#filter18_d_652_4773)">
<rect x="176" y="344" width="56" height="56" rx="12" fill="white" shape-rendering="crispEdges"/>
<path d="M208.5 376L213.5 381M213.5 376L208.5 381M204 375.5H199.5C198.104 375.5 197.407 375.5 196.839 375.672C195.56 376.06 194.56 377.06 194.172 378.339C194 378.907 194 379.604 194 381M206.5 367.5C206.5 369.985 204.485 372 202 372C199.515 372 197.5 369.985 197.5 367.5C197.5 365.015 199.515 363 202 363C204.485 363 206.5 365.015 206.5 367.5Z" stroke="#ECECEC" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</g>
<g opacity="0.4" filter="url(#filter19_d_652_4773)">
<rect x="232" y="8" width="56" height="56" rx="12" fill="white" shape-rendering="crispEdges"/>
<path d="M253 37H256M250 33L252 34L253.271 30.1881C253.533 29.4013 253.664 29.0078 253.907 28.717C254.122 28.4601 254.398 28.2613 254.71 28.1388C255.062 28 255.477 28 256.306 28H263.694C264.523 28 264.938 28 265.29 28.1388C265.602 28.2613 265.878 28.4601 266.093 28.717C266.336 29.0078 266.467 29.4013 266.729 30.1881L268 34L270 33M264 37H267M254.8 34H265.2C266.88 34 267.72 34 268.362 34.327C268.926 34.6146 269.385 35.0735 269.673 35.638C270 36.2798 270 37.1198 270 38.8V41.5C270 41.9647 270 42.197 269.962 42.3902C269.804 43.1836 269.184 43.8038 268.39 43.9616C268.197 44 267.965 44 267.5 44H267C265.895 44 265 43.1046 265 42C265 41.7239 264.776 41.5 264.5 41.5H255.5C255.224 41.5 255 41.7239 255 42C255 43.1046 254.105 44 253 44H252.5C252.035 44 251.803 44 251.61 43.9616C250.816 43.8038 250.196 43.1836 250.038 42.3902C250 42.197 250 41.9647 250 41.5V38.8C250 37.1198 250 36.2798 250.327 35.638C250.615 35.0735 251.074 34.6146 251.638 34.327C252.28 34 253.12 34 254.8 34Z" stroke="#ECECEC" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</g>
<g opacity="0.4" filter="url(#filter20_d_652_4773)">
<rect x="232" y="64" width="56" height="56" rx="12" fill="white" shape-rendering="crispEdges"/>
<path d="M260 102C261 97 268 96.4183 268 90C268 85.5817 264.418 82 260 82C255.582 82 252 85.5817 252 90C252 96.4183 259 97 260 102Z" stroke="#ECECEC" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M260 93C261.657 93 263 91.6569 263 90C263 88.3431 261.657 87 260 87C258.343 87 257 88.3431 257 90C257 91.6569 258.343 93 260 93Z" stroke="#ECECEC" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</g>
<g opacity="0.4" filter="url(#filter21_d_652_4773)">
<rect x="232" y="120" width="56" height="56" rx="12" fill="white" shape-rendering="crispEdges"/>
<path d="M270 148H268M270 148C270 153.523 265.523 158 260 158M270 148C270 142.477 265.523 138 260 138M267.071 155.071L265.657 153.657M252 148H250M250 148C250 153.523 254.477 158 260 158M250 148C250 142.477 254.477 138 260 138M254.343 142.343L252.929 140.929M260 140V138M265.657 142.343L267.071 140.929M260 158V156M252.929 155.071L254.343 153.657M260 144L264 148L260 152L256 148L260 144Z" stroke="#ECECEC" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</g>
<g opacity="0.4" filter="url(#filter22_d_652_4773)">
<rect x="232" y="176" width="56" height="56" rx="12" fill="white" shape-rendering="crispEdges"/>
<path d="M264 205.374C267.532 206.069 270 207.655 270 209.5C270 211.985 265.523 214 260 214C254.477 214 250 211.985 250 209.5C250 207.655 252.468 206.069 256 205.374M260 209V201M260 201C261.657 201 263 199.657 263 198C263 196.343 261.657 195 260 195C258.343 195 257 196.343 257 198C257 199.657 258.343 201 260 201Z" stroke="#ECECEC" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</g>
<g opacity="0.4" filter="url(#filter23_d_652_4773)">
<rect x="232" y="232" width="56" height="56" rx="12" fill="white" shape-rendering="crispEdges"/>
<path d="M267 258V254.2C267 253.08 267 252.52 266.782 252.092C266.59 251.716 266.284 251.41 265.908 251.218C265.48 251 264.92 251 263.8 251H256.2C255.08 251 254.52 251 254.092 251.218C253.716 251.41 253.41 251.716 253.218 252.092C253 252.52 253 253.08 253 254.2V258M253 257H250V256M267 257H270V256M254 261.5H254.01M266 261.5H266.01M254.8 258H265.2C266.88 258 267.72 258 268.362 258.327C268.926 258.615 269.385 259.074 269.673 259.638C270 260.28 270 261.12 270 262.8V266C270 266.932 270 267.398 269.848 267.765C269.645 268.255 269.255 268.645 268.765 268.848C268.398 269 267.932 269 267 269H266.4C266.028 269 265.843 269 265.687 268.975C264.831 268.84 264.16 268.169 264.025 267.313C264 267.157 264 266.972 264 266.6C264 266.507 264 266.461 263.994 266.422C263.96 266.208 263.792 266.04 263.578 266.006C263.539 266 263.493 266 263.4 266H256.6C256.507 266 256.461 266 256.422 266.006C256.208 266.04 256.04 266.208 256.006 266.422C256 266.461 256 266.507 256 266.6C256 266.972 256 267.157 255.975 267.313C255.84 268.169 255.169 268.84 254.313 268.975C254.157 269 253.972 269 253.6 269H253C252.068 269 251.602 269 251.235 268.848C250.745 268.645 250.355 268.255 250.152 267.765C250 267.398 250 266.932 250 266V262.8C250 261.12 250 260.28 250.327 259.638C250.615 259.074 251.074 258.615 251.638 258.327C252.28 258 253.12 258 254.8 258ZM254.5 261.5C254.5 261.776 254.276 262 254 262C253.724 262 253.5 261.776 253.5 261.5C253.5 261.224 253.724 261 254 261C254.276 261 254.5 261.224 254.5 261.5ZM266.5 261.5C266.5 261.776 266.276 262 266 262C265.724 262 265.5 261.776 265.5 261.5C265.5 261.224 265.724 261 266 261C266.276 261 266.5 261.224 266.5 261.5Z" stroke="#ECECEC" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</g>
<g opacity="0.4" filter="url(#filter24_d_652_4773)">
<rect x="232" y="288" width="56" height="56" rx="12" fill="white" shape-rendering="crispEdges"/>
<path d="M255 326V315M250 317V324C250 325.105 250.895 326 252 326H265.426C266.907 326 268.166 324.92 268.391 323.456L269.468 316.456C269.748 314.639 268.342 313 266.503 313H263C262.448 313 262 312.552 262 312V308.466C262 307.104 260.896 306 259.534 306C259.209 306 258.915 306.191 258.783 306.488L255.264 314.406C255.103 314.767 254.745 315 254.35 315H252C250.895 315 250 315.895 250 317Z" stroke="#ECECEC" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</g>
<g opacity="0.4" filter="url(#filter25_d_652_4773)">
<rect x="232" y="344" width="56" height="56" rx="12" fill="white" shape-rendering="crispEdges"/>
<path d="M264.5 364L269.5 369M269.5 364L264.5 369M264 381V379.8C264 378.12 264 377.28 263.673 376.638C263.385 376.074 262.926 375.615 262.362 375.327C261.72 375 260.88 375 259.2 375H254.8C253.12 375 252.28 375 251.638 375.327C251.074 375.615 250.615 376.074 250.327 376.638C250 377.28 250 378.12 250 379.8V381M260.5 367.5C260.5 369.433 258.933 371 257 371C255.067 371 253.5 369.433 253.5 367.5C253.5 365.567 255.067 364 257 364C258.933 364 260.5 365.567 260.5 367.5Z" stroke="#ECECEC" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</g>
<g opacity="0.4" filter="url(#filter26_d_652_4773)">
<rect x="288" y="8" width="56" height="56" rx="12" fill="white" shape-rendering="crispEdges"/>
<path d="M316 26C318.501 28.7384 319.923 32.292 320 36C319.923 39.708 318.501 43.2616 316 46M316 26C313.499 28.7384 312.077 32.292 312 36C312.077 39.708 313.499 43.2616 316 46M316 26C310.477 26 306 30.4772 306 36C306 41.5228 310.477 46 316 46M316 26C321.523 26 326 30.4772 326 36C326 41.5228 321.523 46 316 46M306.5 33H325.5M306.5 39H325.5" stroke="#ECECEC" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</g>
<g opacity="0.4" filter="url(#filter27_d_652_4773)">
<rect x="288" y="64" width="56" height="56" rx="12" fill="white" shape-rendering="crispEdges"/>
<path d="M315.5 85H315.934C318.982 85 320.505 85 321.084 85.5473C321.584 86.0204 321.805 86.7173 321.67 87.3922C321.514 88.173 320.27 89.0529 317.782 90.8125L313.718 93.6875C311.23 95.4471 309.986 96.327 309.83 97.1078C309.695 97.7827 309.916 98.4796 310.416 98.9527C310.995 99.5 312.518 99.5 315.566 99.5H316.5M312 85C312 86.6569 310.657 88 309 88C307.343 88 306 86.6569 306 85C306 83.3431 307.343 82 309 82C310.657 82 312 83.3431 312 85ZM326 99C326 100.657 324.657 102 323 102C321.343 102 320 100.657 320 99C320 97.3431 321.343 96 323 96C324.657 96 326 97.3431 326 99Z" stroke="#ECECEC" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</g>
<g opacity="0.4" filter="url(#filter28_d_652_4773)">
<rect x="288" y="120" width="56" height="56" rx="12" fill="white" shape-rendering="crispEdges"/>
<path d="M319 138.458C318.053 138.16 317.045 138 316 138C310.477 138 306 142.477 306 148C306 153.523 310.477 158 316 158C321.523 158 326 153.523 326 148C326 146.285 325.568 144.67 324.807 143.259M321 141.75H321.005M314.5 157.888L314.5 155.685C314.5 155.566 314.543 155.45 314.621 155.36L317.106 152.459C317.311 152.221 317.247 151.856 316.975 151.7L314.119 150.068C314.041 150.023 313.977 149.959 313.932 149.881L312.07 146.619C311.974 146.449 311.787 146.351 311.592 146.368L306.064 146.861M325 142C325 144.209 323 146 321 148C319 146 317 144.209 317 142C317 139.791 318.791 138 321 138C323.209 138 325 139.791 325 142ZM321.25 141.75C321.25 141.888 321.138 142 321 142C320.862 142 320.75 141.888 320.75 141.75C320.75 141.612 320.862 141.5 321 141.5C321.138 141.5 321.25 141.612 321.25 141.75Z" stroke="#ECECEC" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</g>
<g opacity="0.4" filter="url(#filter29_d_652_4773)">
<rect x="288" y="176" width="56" height="56" rx="12" fill="white" shape-rendering="crispEdges"/>
<path d="M313.5 214H318.5M312 194H320M316 197V194M308 204H324M321 211L322.5 214M311 211L309.5 214M312.5 207.5H312.51M319.5 207.5H319.51M312.8 211H319.2C320.88 211 321.72 211 322.362 210.673C322.926 210.385 323.385 209.926 323.673 209.362C324 208.72 324 207.88 324 206.2V201.8C324 200.12 324 199.28 323.673 198.638C323.385 198.074 322.926 197.615 322.362 197.327C321.72 197 320.88 197 319.2 197H312.8C311.12 197 310.28 197 309.638 197.327C309.074 197.615 308.615 198.074 308.327 198.638C308 199.28 308 200.12 308 201.8V206.2C308 207.88 308 208.72 308.327 209.362C308.615 209.926 309.074 210.385 309.638 210.673C310.28 211 311.12 211 312.8 211ZM313 207.5C313 207.776 312.776 208 312.5 208C312.224 208 312 207.776 312 207.5C312 207.224 312.224 207 312.5 207C312.776 207 313 207.224 313 207.5ZM320 207.5C320 207.776 319.776 208 319.5 208C319.224 208 319 207.776 319 207.5C319 207.224 319.224 207 319.5 207C319.776 207 320 207.224 320 207.5Z" stroke="#ECECEC" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</g>
<g opacity="0.4" filter="url(#filter30_d_652_4773)">
<rect x="288" y="232" width="56" height="56" rx="12" fill="white" shape-rendering="crispEdges"/>
<path d="M309 258V264.011C309 264.37 309 264.55 309.055 264.708C309.103 264.848 309.182 264.976 309.286 265.082C309.403 265.201 309.563 265.282 309.884 265.442L315.284 268.142C315.547 268.273 315.678 268.339 315.816 268.365C315.937 268.388 316.063 268.388 316.184 268.365C316.322 268.339 316.453 268.273 316.716 268.142L322.116 265.442C322.437 265.282 322.597 265.201 322.714 265.082C322.818 264.976 322.897 264.848 322.945 264.708C323 264.55 323 264.37 323 264.011V258M306 256.5L315.642 251.679C315.773 251.613 315.839 251.581 315.908 251.568C315.969 251.556 316.031 251.556 316.092 251.568C316.161 251.581 316.227 251.613 316.358 251.679L326 256.5L316.358 261.321C316.227 261.387 316.161 261.42 316.092 261.432C316.031 261.444 315.969 261.444 315.908 261.432C315.839 261.42 315.773 261.387 315.642 261.321L306 256.5Z" stroke="#ECECEC" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</g>
<g opacity="0.4" filter="url(#filter31_d_652_4773)">
<rect x="288" y="288" width="56" height="56" rx="12" fill="white" shape-rendering="crispEdges"/>
<path d="M323 325L326 322M326 322L323 319M326 322H320M316 319.5H311.5C310.104 319.5 309.407 319.5 308.839 319.672C307.56 320.06 306.56 321.06 306.172 322.339C306 322.907 306 323.604 306 325M318.5 311.5C318.5 313.985 316.485 316 314 316C311.515 316 309.5 313.985 309.5 311.5C309.5 309.015 311.515 307 314 307C316.485 307 318.5 309.015 318.5 311.5Z" stroke="#ECECEC" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</g>
<g opacity="0.4" filter="url(#filter32_d_652_4773)">
<rect x="288" y="344" width="56" height="56" rx="12" fill="white" shape-rendering="crispEdges"/>
<path d="M326 381V379C326 377.136 324.725 375.57 323 375.126M319.5 363.291C320.966 363.884 322 365.321 322 367C322 368.679 320.966 370.116 319.5 370.709M321 381C321 379.136 321 378.204 320.696 377.469C320.29 376.489 319.511 375.71 318.531 375.304C317.796 375 316.864 375 315 375H312C310.136 375 309.204 375 308.469 375.304C307.489 375.71 306.71 376.489 306.304 377.469C306 378.204 306 379.136 306 381M317.5 367C317.5 369.209 315.709 371 313.5 371C311.291 371 309.5 369.209 309.5 367C309.5 364.791 311.291 363 313.5 363C315.709 363 317.5 364.791 317.5 367Z" stroke="#ECECEC" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</g>
<g filter="url(#filter33_d_652_4773)">
<rect x="120" y="64" width="56" height="56" rx="12" fill="white" shape-rendering="crispEdges"/>
<path d="M153.745 82.8127C154.71 81.8163 156.304 81.8034 157.284 82.7841C158.238 83.738 158.256 85.279 157.324 86.2546L154.546 89.1643C154.328 89.3924 154.219 89.5064 154.152 89.64C154.092 89.7582 154.057 89.8871 154.048 90.0191C154.037 90.1682 154.073 90.3218 154.144 90.6291L155.872 98.1167C155.944 98.4321 155.981 98.5898 155.969 98.7423C155.959 98.8774 155.921 99.0089 155.858 99.1289C155.787 99.2645 155.673 99.3789 155.444 99.6078L155.073 99.9786C154.467 100.585 154.164 100.888 153.854 100.943C153.583 100.991 153.304 100.925 153.083 100.761C152.831 100.573 152.695 100.166 152.424 99.3532L150.414 93.3239L147.069 96.6692C146.869 96.8689 146.769 96.9687 146.703 97.0863C146.643 97.1905 146.603 97.3044 146.585 97.4227C146.563 97.5563 146.579 97.6966 146.61 97.9773L146.794 99.6307C146.825 99.9113 146.841 100.052 146.819 100.185C146.8 100.304 146.76 100.417 146.701 100.522C146.634 100.639 146.535 100.739 146.335 100.939L146.137 101.136C145.664 101.609 145.428 101.846 145.165 101.914C144.934 101.974 144.69 101.95 144.476 101.846C144.231 101.727 144.046 101.449 143.675 100.892L142.106 98.5399C142.04 98.4404 142.007 98.3907 141.968 98.3456C141.934 98.3056 141.897 98.2683 141.857 98.2341C141.812 98.1956 141.762 98.1624 141.663 98.0961L139.31 96.5278C138.754 96.1567 138.475 95.9712 138.356 95.7269C138.252 95.5126 138.228 95.2681 138.288 95.0376C138.357 94.7747 138.593 94.5382 139.066 94.0652L139.264 93.8677C139.464 93.668 139.563 93.5681 139.681 93.5013C139.785 93.4422 139.899 93.4022 140.017 93.3833C140.151 93.362 140.291 93.3776 140.572 93.4088L142.225 93.5925C142.506 93.6237 142.646 93.6393 142.78 93.618C142.898 93.5991 143.012 93.5592 143.116 93.5C143.234 93.4332 143.334 93.3334 143.533 93.1337L146.879 89.7884L140.849 87.7786C140.036 87.5075 139.63 87.372 139.442 87.1191C139.278 86.8982 139.212 86.6196 139.26 86.3487C139.315 86.0385 139.618 85.7355 140.224 85.1293L140.595 84.7586C140.824 84.5297 140.938 84.4152 141.074 84.3443C141.194 84.2816 141.325 84.2439 141.46 84.2335C141.613 84.2217 141.77 84.2581 142.086 84.3309L149.545 86.0522C149.855 86.1238 150.01 86.1595 150.16 86.1489C150.304 86.1386 150.445 86.0971 150.571 86.0272C150.703 85.9548 150.813 85.8405 151.035 85.612L153.745 82.8127Z" stroke="#E84C88" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</g>
<g filter="url(#filter34_d_652_4773)">
<rect x="64" y="344" width="56" height="56" rx="12" fill="white" shape-rendering="crispEdges"/>
<path d="M89.3544 381C90.0596 381.622 90.9858 382 92.0002 382C93.0147 382 93.9409 381.622 94.6461 381M82.2941 365.82C82.2798 364.369 83.0623 363.013 84.3264 362.3M101.702 365.82C101.717 364.369 100.934 363.013 99.6702 362.3M98.0002 368C98.0002 366.409 97.3681 364.883 96.2429 363.757C95.1177 362.632 93.5915 362 92.0002 362C90.4089 362 88.8828 362.632 87.7576 363.757C86.6324 364.883 86.0002 366.409 86.0002 368C86.0002 371.09 85.2207 373.206 84.3499 374.605C83.6154 375.786 83.2481 376.376 83.2616 376.541C83.2765 376.723 83.3151 376.793 83.462 376.902C83.5947 377 84.1928 377 85.3891 377H98.6114C99.8077 377 100.406 377 100.538 376.902C100.685 376.793 100.724 376.723 100.739 376.541C100.752 376.376 100.385 375.786 99.6506 374.605C98.7798 373.206 98.0002 371.09 98.0002 368Z" stroke="#E84C88" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</g>
<g filter="url(#filter35_d_652_4773)">
<rect x="176" y="288" width="56" height="56" rx="12" fill="white" shape-rendering="crispEdges"/>
<path d="M201 310V314.501C201 315.052 201 315.328 200.931 315.583C200.87 315.809 200.77 316.023 200.636 316.214C200.483 316.43 200.272 316.607 199.849 316.96L196.151 320.04C195.728 320.393 195.517 320.57 195.364 320.786C195.23 320.977 195.13 321.191 195.069 321.417C195 321.672 195 321.948 195 322.499V322.8C195 323.92 195 324.48 195.218 324.908C195.41 325.284 195.716 325.59 196.092 325.782C196.52 326 197.08 326 198.2 326H209.8C210.92 326 211.48 326 211.908 325.782C212.284 325.59 212.59 325.284 212.782 324.908C213 324.48 213 323.92 213 322.8V322.499C213 321.948 213 321.672 212.931 321.417C212.87 321.191 212.77 320.977 212.636 320.786C212.483 320.57 212.272 320.393 211.849 320.04L208.151 316.96C207.728 316.607 207.517 316.43 207.364 316.214C207.23 316.023 207.13 315.809 207.069 315.583C207 315.328 207 315.052 207 314.501V310M200.3 310H207.7C207.98 310 208.12 310 208.227 309.946C208.321 309.898 208.398 309.821 208.446 309.727C208.5 309.62 208.5 309.48 208.5 309.2V306.8C208.5 306.52 208.5 306.38 208.446 306.273C208.398 306.179 208.321 306.102 208.227 306.054C208.12 306 207.98 306 207.7 306H200.3C200.02 306 199.88 306 199.773 306.054C199.679 306.102 199.602 306.179 199.554 306.273C199.5 306.38 199.5 306.52 199.5 306.8V309.2C199.5 309.48 199.5 309.62 199.554 309.727C199.602 309.821 199.679 309.898 199.773 309.946C199.88 310 200.02 310 200.3 310ZM197.5 321H210.5C210.965 321 211.197 321 211.39 321.038C212.184 321.196 212.804 321.816 212.962 322.61C213 322.803 213 323.035 213 323.5C213 323.965 213 324.197 212.962 324.39C212.804 325.184 212.184 325.804 211.39 325.962C211.197 326 210.965 326 210.5 326H197.5C197.035 326 196.803 326 196.61 325.962C195.816 325.804 195.196 325.184 195.038 324.39C195 324.197 195 323.965 195 323.5C195 323.035 195 322.803 195.038 322.61C195.196 321.816 195.816 321.196 196.61 321.038C196.803 321 197.035 321 197.5 321Z" stroke="#E84C88" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</g>
<g filter="url(#filter36_d_652_4773)">
<rect x="120" y="232" width="56" height="56" rx="12" fill="white" shape-rendering="crispEdges"/>
<path d="M144 270V268M145.5 263V255M152 270V268M150.5 263V255M144.8 268H151.2C152.88 268 153.72 268 154.362 267.673C154.926 267.385 155.385 266.926 155.673 266.362C156 265.72 156 264.88 156 263.2V254.8C156 253.12 156 252.28 155.673 251.638C155.385 251.074 154.926 250.615 154.362 250.327C153.72 250 152.88 250 151.2 250H144.8C143.12 250 142.28 250 141.638 250.327C141.074 250.615 140.615 251.074 140.327 251.638C140 252.28 140 253.12 140 254.8V263.2C140 264.88 140 265.72 140.327 266.362C140.615 266.926 141.074 267.385 141.638 267.673C142.28 268 143.12 268 144.8 268Z" stroke="#E84C88" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</g>
<g filter="url(#filter37_d_652_4773)">
<rect x="176" y="176" width="56" height="56" rx="12" fill="white" shape-rendering="crispEdges"/>
<path d="M194.687 207.645L196.595 206.544C196.698 206.484 196.82 206.463 196.937 206.485L200.691 207.188C201 207.246 201.285 207.008 201.283 206.694L201.269 203.404C201.268 203.315 201.292 203.227 201.337 203.15L203.232 199.906C203.33 199.737 203.322 199.527 203.209 199.367L200.019 194.826M211 196.859C205.5 199.5 208.5 203 209.5 203.5C211.377 204.438 213.988 204.5 213.988 204.5C213.996 204.334 214 204.168 214 204C214 198.477 209.523 194 204 194C198.477 194 194 198.477 194 204C194 209.523 198.477 214 204 214C204.168 214 204.334 213.996 204.5 213.988M208.758 213.94L205.591 205.591L213.94 208.758L210.238 210.238L208.758 213.94Z" stroke="#E84C88" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</g>
<g filter="url(#filter38_d_652_4773)">
<rect x="120" y="176" width="56" height="56" rx="12" fill="white" shape-rendering="crispEdges"/>
<path d="M148 214C153.523 214 158 209.523 158 204C158 198.477 153.523 194 148 194C142.477 194 138 198.477 138 204C138 209.523 142.477 214 148 214Z" stroke="#E84C88" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M150.722 200.266C151.211 200.103 151.455 200.022 151.617 200.08C151.759 200.13 151.87 200.241 151.92 200.383C151.978 200.545 151.897 200.789 151.734 201.278L150.246 205.741C150.2 205.88 150.177 205.949 150.137 206.007C150.102 206.058 150.058 206.102 150.007 206.137C149.949 206.177 149.88 206.2 149.741 206.246L145.278 207.734C144.789 207.897 144.545 207.978 144.383 207.92C144.241 207.87 144.13 207.759 144.08 207.617C144.022 207.455 144.103 207.211 144.266 206.722L145.754 202.259C145.8 202.12 145.823 202.051 145.863 201.993C145.898 201.942 145.942 201.898 145.993 201.863C146.051 201.823 146.12 201.8 146.259 201.754L150.722 200.266Z" stroke="#E84C88" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</g>
<g filter="url(#filter39_d_652_4773)">
<rect x="176" y="120" width="56" height="56" rx="12" fill="white" shape-rendering="crispEdges"/>
<path d="M196 151C196 151 197 150 200 150C203 150 205 152 208 152C211 152 212 151 212 151V140C212 140 211 141 208 141C205 141 203 139 200 139C197 139 196 140 196 140M196 158L196 138" stroke="#E84C88" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</g>
<g filter="url(#filter40_d_652_4773)">
<rect x="176" y="232" width="56" height="56" rx="12" fill="white" shape-rendering="crispEdges"/>
<path d="M202 256V255M202 260.5V259.5M202 265V264M197.2 252H210.8C211.92 252 212.48 252 212.908 252.218C213.284 252.41 213.59 252.716 213.782 253.092C214 253.52 214 254.08 214 255.2V256.5C212.067 256.5 210.5 258.067 210.5 260C210.5 261.933 212.067 263.5 214 263.5V264.8C214 265.92 214 266.48 213.782 266.908C213.59 267.284 213.284 267.59 212.908 267.782C212.48 268 211.92 268 210.8 268H197.2C196.08 268 195.52 268 195.092 267.782C194.716 267.59 194.41 267.284 194.218 266.908C194 266.48 194 265.92 194 264.8V263.5C195.933 263.5 197.5 261.933 197.5 260C197.5 258.067 195.933 256.5 194 256.5V255.2C194 254.08 194 253.52 194.218 253.092C194.41 252.716 194.716 252.41 195.092 252.218C195.52 252 196.08 252 197.2 252Z" stroke="#E84C88" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</g>
<g filter="url(#filter41_d_652_4773)">
<rect x="64" y="232" width="56" height="56" rx="12" fill="white" shape-rendering="crispEdges"/>
<path d="M83.4135 258.744C82.8181 258.513 82.5204 258.397 82.4335 258.23C82.3582 258.086 82.3581 257.914 82.4333 257.769C82.52 257.602 82.8175 257.486 83.4126 257.254L100.3 250.663C100.838 250.454 101.106 250.349 101.278 250.406C101.427 250.456 101.544 250.573 101.594 250.722C101.651 250.894 101.546 251.162 101.336 251.699L94.7461 268.587C94.5139 269.182 94.3977 269.48 94.2308 269.566C94.0862 269.642 93.9139 269.642 93.7693 269.566C93.6025 269.479 93.4867 269.182 93.2552 268.586L90.6271 261.828C90.5801 261.707 90.5566 261.647 90.5203 261.596C90.4881 261.551 90.4487 261.512 90.4036 261.479C90.3527 261.443 90.2923 261.42 90.1715 261.373L83.4135 258.744Z" stroke="#E84C88" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</g>
<rect width="352" height="408" fill="url(#paint0_radial_652_4773)"/>
</g>
<defs>
<filter id="filter0_d_652_4773" x="-8" y="-8" width="88" height="88" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
<feFlood flood-opacity="0" result="BackgroundImageFix"/>
<feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
<feOffset/>
<feGaussianBlur stdDeviation="8"/>
<feComposite in2="hardAlpha" operator="out"/>
<feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.1 0"/>
<feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_652_4773"/>
<feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_652_4773" result="shape"/>
</filter>
<filter id="filter1_d_652_4773" x="-8" y="48" width="88" height="88" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
<feFlood flood-opacity="0" result="BackgroundImageFix"/>
<feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
<feOffset/>
<feGaussianBlur stdDeviation="8"/>
<feComposite in2="hardAlpha" operator="out"/>
<feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.1 0"/>
<feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_652_4773"/>
<feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_652_4773" result="shape"/>
</filter>
<filter id="filter2_d_652_4773" x="-8" y="104" width="88" height="88" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
<feFlood flood-opacity="0" result="BackgroundImageFix"/>
<feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
<feOffset/>
<feGaussianBlur stdDeviation="8"/>
<feComposite in2="hardAlpha" operator="out"/>
<feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.1 0"/>
<feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_652_4773"/>
<feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_652_4773" result="shape"/>
</filter>
<filter id="filter3_d_652_4773" x="-8" y="160" width="88" height="88" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
<feFlood flood-opacity="0" result="BackgroundImageFix"/>
<feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
<feOffset/>
<feGaussianBlur stdDeviation="8"/>
<feComposite in2="hardAlpha" operator="out"/>
<feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.1 0"/>
<feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_652_4773"/>
<feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_652_4773" result="shape"/>
</filter>
<filter id="filter4_d_652_4773" x="-8" y="216" width="88" height="88" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
<feFlood flood-opacity="0" result="BackgroundImageFix"/>
<feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
<feOffset/>
<feGaussianBlur stdDeviation="8"/>
<feComposite in2="hardAlpha" operator="out"/>
<feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.1 0"/>
<feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_652_4773"/>
<feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_652_4773" result="shape"/>
</filter>
<filter id="filter5_d_652_4773" x="-8" y="272" width="88" height="88" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
<feFlood flood-opacity="0" result="BackgroundImageFix"/>
<feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
<feOffset/>
<feGaussianBlur stdDeviation="8"/>
<feComposite in2="hardAlpha" operator="out"/>
<feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.1 0"/>
<feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_652_4773"/>
<feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_652_4773" result="shape"/>
</filter>
<filter id="filter6_d_652_4773" x="-8" y="328" width="88" height="88" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
<feFlood flood-opacity="0" result="BackgroundImageFix"/>
<feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
<feOffset/>
<feGaussianBlur stdDeviation="8"/>
<feComposite in2="hardAlpha" operator="out"/>
<feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.1 0"/>
<feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_652_4773"/>
<feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_652_4773" result="shape"/>
</filter>
<filter id="filter7_d_652_4773" x="48" y="-8" width="88" height="88" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
<feFlood flood-opacity="0" result="BackgroundImageFix"/>
<feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
<feOffset/>
<feGaussianBlur stdDeviation="8"/>
<feComposite in2="hardAlpha" operator="out"/>
<feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.1 0"/>
<feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_652_4773"/>
<feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_652_4773" result="shape"/>
</filter>
<filter id="filter8_d_652_4773" x="48" y="48" width="88" height="88" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
<feFlood flood-opacity="0" result="BackgroundImageFix"/>
<feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
<feOffset/>
<feGaussianBlur stdDeviation="8"/>
<feComposite in2="hardAlpha" operator="out"/>
<feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.1 0"/>
<feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_652_4773"/>
<feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_652_4773" result="shape"/>
</filter>
<filter id="filter9_d_652_4773" x="48" y="104" width="88" height="88" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
<feFlood flood-opacity="0" result="BackgroundImageFix"/>
<feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
<feOffset/>
<feGaussianBlur stdDeviation="8"/>
<feComposite in2="hardAlpha" operator="out"/>
<feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.1 0"/>
<feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_652_4773"/>
<feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_652_4773" result="shape"/>
</filter>
<filter id="filter10_d_652_4773" x="48" y="160" width="88" height="88" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
<feFlood flood-opacity="0" result="BackgroundImageFix"/>
<feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
<feOffset/>
<feGaussianBlur stdDeviation="8"/>
<feComposite in2="hardAlpha" operator="out"/>
<feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.1 0"/>
<feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_652_4773"/>
<feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_652_4773" result="shape"/>
</filter>
<filter id="filter11_d_652_4773" x="48" y="272" width="88" height="88" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
<feFlood flood-opacity="0" result="BackgroundImageFix"/>
<feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
<feOffset/>
<feGaussianBlur stdDeviation="8"/>
<feComposite in2="hardAlpha" operator="out"/>
<feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.1 0"/>
<feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_652_4773"/>
<feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_652_4773" result="shape"/>
</filter>
<filter id="filter12_d_652_4773" x="104" y="-8" width="88" height="88" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
<feFlood flood-opacity="0" result="BackgroundImageFix"/>
<feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
<feOffset/>
<feGaussianBlur stdDeviation="8"/>
<feComposite in2="hardAlpha" operator="out"/>
<feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.1 0"/>
<feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_652_4773"/>
<feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_652_4773" result="shape"/>
</filter>
<filter id="filter13_d_652_4773" x="104" y="104" width="88" height="88" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
<feFlood flood-opacity="0" result="BackgroundImageFix"/>
<feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
<feOffset/>
<feGaussianBlur stdDeviation="8"/>
<feComposite in2="hardAlpha" operator="out"/>
<feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.1 0"/>
<feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_652_4773"/>
<feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_652_4773" result="shape"/>
</filter>
<filter id="filter14_d_652_4773" x="104" y="272" width="88" height="88" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
<feFlood flood-opacity="0" result="BackgroundImageFix"/>
<feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
<feOffset/>
<feGaussianBlur stdDeviation="8"/>
<feComposite in2="hardAlpha" operator="out"/>
<feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.1 0"/>
<feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_652_4773"/>
<feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_652_4773" result="shape"/>
</filter>
<filter id="filter15_d_652_4773" x="104" y="328" width="88" height="88" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
<feFlood flood-opacity="0" result="BackgroundImageFix"/>
<feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
<feOffset/>
<feGaussianBlur stdDeviation="8"/>
<feComposite in2="hardAlpha" operator="out"/>
<feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.1 0"/>
<feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_652_4773"/>
<feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_652_4773" result="shape"/>
</filter>
<filter id="filter16_d_652_4773" x="160" y="-8" width="88" height="88" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
<feFlood flood-opacity="0" result="BackgroundImageFix"/>
<feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
<feOffset/>
<feGaussianBlur stdDeviation="8"/>
<feComposite in2="hardAlpha" operator="out"/>
<feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.1 0"/>
<feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_652_4773"/>
<feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_652_4773" result="shape"/>
</filter>
<filter id="filter17_d_652_4773" x="160" y="48" width="88" height="88" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
<feFlood flood-opacity="0" result="BackgroundImageFix"/>
<feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
<feOffset/>
<feGaussianBlur stdDeviation="8"/>
<feComposite in2="hardAlpha" operator="out"/>
<feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.1 0"/>
<feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_652_4773"/>
<feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_652_4773" result="shape"/>
</filter>
<filter id="filter18_d_652_4773" x="160" y="328" width="88" height="88" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
<feFlood flood-opacity="0" result="BackgroundImageFix"/>
<feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
<feOffset/>
<feGaussianBlur stdDeviation="8"/>
<feComposite in2="hardAlpha" operator="out"/>
<feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.1 0"/>
<feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_652_4773"/>
<feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_652_4773" result="shape"/>
</filter>
<filter id="filter19_d_652_4773" x="216" y="-8" width="88" height="88" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
<feFlood flood-opacity="0" result="BackgroundImageFix"/>
<feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
<feOffset/>
<feGaussianBlur stdDeviation="8"/>
<feComposite in2="hardAlpha" operator="out"/>
<feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.1 0"/>
<feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_652_4773"/>
<feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_652_4773" result="shape"/>
</filter>
<filter id="filter20_d_652_4773" x="216" y="48" width="88" height="88" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
<feFlood flood-opacity="0" result="BackgroundImageFix"/>
<feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
<feOffset/>
<feGaussianBlur stdDeviation="8"/>
<feComposite in2="hardAlpha" operator="out"/>
<feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.1 0"/>
<feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_652_4773"/>
<feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_652_4773" result="shape"/>
</filter>
<filter id="filter21_d_652_4773" x="216" y="104" width="88" height="88" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
<feFlood flood-opacity="0" result="BackgroundImageFix"/>
<feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
<feOffset/>
<feGaussianBlur stdDeviation="8"/>
<feComposite in2="hardAlpha" operator="out"/>
<feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.1 0"/>
<feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_652_4773"/>
<feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_652_4773" result="shape"/>
</filter>
<filter id="filter22_d_652_4773" x="216" y="160" width="88" height="88" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
<feFlood flood-opacity="0" result="BackgroundImageFix"/>
<feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
<feOffset/>
<feGaussianBlur stdDeviation="8"/>
<feComposite in2="hardAlpha" operator="out"/>
<feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.1 0"/>
<feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_652_4773"/>
<feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_652_4773" result="shape"/>
</filter>
<filter id="filter23_d_652_4773" x="216" y="216" width="88" height="88" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
<feFlood flood-opacity="0" result="BackgroundImageFix"/>
<feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
<feOffset/>
<feGaussianBlur stdDeviation="8"/>
<feComposite in2="hardAlpha" operator="out"/>
<feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.1 0"/>
<feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_652_4773"/>
<feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_652_4773" result="shape"/>
</filter>
<filter id="filter24_d_652_4773" x="216" y="272" width="88" height="88" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
<feFlood flood-opacity="0" result="BackgroundImageFix"/>
<feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
<feOffset/>
<feGaussianBlur stdDeviation="8"/>
<feComposite in2="hardAlpha" operator="out"/>
<feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.1 0"/>
<feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_652_4773"/>
<feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_652_4773" result="shape"/>
</filter>
<filter id="filter25_d_652_4773" x="216" y="328" width="88" height="88" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
<feFlood flood-opacity="0" result="BackgroundImageFix"/>
<feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
<feOffset/>
<feGaussianBlur stdDeviation="8"/>
<feComposite in2="hardAlpha" operator="out"/>
<feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.1 0"/>
<feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_652_4773"/>
<feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_652_4773" result="shape"/>
</filter>
<filter id="filter26_d_652_4773" x="272" y="-8" width="88" height="88" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
<feFlood flood-opacity="0" result="BackgroundImageFix"/>
<feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
<feOffset/>
<feGaussianBlur stdDeviation="8"/>
<feComposite in2="hardAlpha" operator="out"/>
<feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.1 0"/>
<feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_652_4773"/>
<feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_652_4773" result="shape"/>
</filter>
<filter id="filter27_d_652_4773" x="272" y="48" width="88" height="88" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
<feFlood flood-opacity="0" result="BackgroundImageFix"/>
<feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
<feOffset/>
<feGaussianBlur stdDeviation="8"/>
<feComposite in2="hardAlpha" operator="out"/>
<feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.1 0"/>
<feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_652_4773"/>
<feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_652_4773" result="shape"/>
</filter>
<filter id="filter28_d_652_4773" x="272" y="104" width="88" height="88" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
<feFlood flood-opacity="0" result="BackgroundImageFix"/>
<feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
<feOffset/>
<feGaussianBlur stdDeviation="8"/>
<feComposite in2="hardAlpha" operator="out"/>
<feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.1 0"/>
<feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_652_4773"/>
<feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_652_4773" result="shape"/>
</filter>
<filter id="filter29_d_652_4773" x="272" y="160" width="88" height="88" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
<feFlood flood-opacity="0" result="BackgroundImageFix"/>
<feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
<feOffset/>
<feGaussianBlur stdDeviation="8"/>
<feComposite in2="hardAlpha" operator="out"/>
<feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.1 0"/>
<feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_652_4773"/>
<feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_652_4773" result="shape"/>
</filter>
<filter id="filter30_d_652_4773" x="272" y="216" width="88" height="88" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
<feFlood flood-opacity="0" result="BackgroundImageFix"/>
<feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
<feOffset/>
<feGaussianBlur stdDeviation="8"/>
<feComposite in2="hardAlpha" operator="out"/>
<feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.1 0"/>
<feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_652_4773"/>
<feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_652_4773" result="shape"/>
</filter>
<filter id="filter31_d_652_4773" x="272" y="272" width="88" height="88" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
<feFlood flood-opacity="0" result="BackgroundImageFix"/>
<feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
<feOffset/>
<feGaussianBlur stdDeviation="8"/>
<feComposite in2="hardAlpha" operator="out"/>
<feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.1 0"/>
<feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_652_4773"/>
<feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_652_4773" result="shape"/>
</filter>
<filter id="filter32_d_652_4773" x="272" y="328" width="88" height="88" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
<feFlood flood-opacity="0" result="BackgroundImageFix"/>
<feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
<feOffset/>
<feGaussianBlur stdDeviation="8"/>
<feComposite in2="hardAlpha" operator="out"/>
<feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.1 0"/>
<feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_652_4773"/>
<feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_652_4773" result="shape"/>
</filter>
<filter id="filter33_d_652_4773" x="104" y="48" width="88" height="88" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
<feFlood flood-opacity="0" result="BackgroundImageFix"/>
<feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
<feOffset/>
<feGaussianBlur stdDeviation="8"/>
<feComposite in2="hardAlpha" operator="out"/>
<feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.1 0"/>
<feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_652_4773"/>
<feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_652_4773" result="shape"/>
</filter>
<filter id="filter34_d_652_4773" x="48" y="328" width="88" height="88" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
<feFlood flood-opacity="0" result="BackgroundImageFix"/>
<feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
<feOffset/>
<feGaussianBlur stdDeviation="8"/>
<feComposite in2="hardAlpha" operator="out"/>
<feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.1 0"/>
<feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_652_4773"/>
<feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_652_4773" result="shape"/>
</filter>
<filter id="filter35_d_652_4773" x="160" y="272" width="88" height="88" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
<feFlood flood-opacity="0" result="BackgroundImageFix"/>
<feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
<feOffset/>
<feGaussianBlur stdDeviation="8"/>
<feComposite in2="hardAlpha" operator="out"/>
<feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.1 0"/>
<feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_652_4773"/>
<feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_652_4773" result="shape"/>
</filter>
<filter id="filter36_d_652_4773" x="104" y="216" width="88" height="88" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
<feFlood flood-opacity="0" result="BackgroundImageFix"/>
<feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
<feOffset/>
<feGaussianBlur stdDeviation="8"/>
<feComposite in2="hardAlpha" operator="out"/>
<feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.1 0"/>
<feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_652_4773"/>
<feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_652_4773" result="shape"/>
</filter>
<filter id="filter37_d_652_4773" x="160" y="160" width="88" height="88" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
<feFlood flood-opacity="0" result="BackgroundImageFix"/>
<feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
<feOffset/>
<feGaussianBlur stdDeviation="8"/>
<feComposite in2="hardAlpha" operator="out"/>
<feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.1 0"/>
<feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_652_4773"/>
<feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_652_4773" result="shape"/>
</filter>
<filter id="filter38_d_652_4773" x="104" y="160" width="88" height="88" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
<feFlood flood-opacity="0" result="BackgroundImageFix"/>
<feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
<feOffset/>
<feGaussianBlur stdDeviation="8"/>
<feComposite in2="hardAlpha" operator="out"/>
<feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.1 0"/>
<feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_652_4773"/>
<feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_652_4773" result="shape"/>
</filter>
<filter id="filter39_d_652_4773" x="160" y="104" width="88" height="88" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
<feFlood flood-opacity="0" result="BackgroundImageFix"/>
<feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
<feOffset/>
<feGaussianBlur stdDeviation="8"/>
<feComposite in2="hardAlpha" operator="out"/>
<feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.1 0"/>
<feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_652_4773"/>
<feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_652_4773" result="shape"/>
</filter>
<filter id="filter40_d_652_4773" x="160" y="216" width="88" height="88" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
<feFlood flood-opacity="0" result="BackgroundImageFix"/>
<feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
<feOffset/>
<feGaussianBlur stdDeviation="8"/>
<feComposite in2="hardAlpha" operator="out"/>
<feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.1 0"/>
<feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_652_4773"/>
<feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_652_4773" result="shape"/>
</filter>
<filter id="filter41_d_652_4773" x="48" y="216" width="88" height="88" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
<feFlood flood-opacity="0" result="BackgroundImageFix"/>
<feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
<feOffset/>
<feGaussianBlur stdDeviation="8"/>
<feComposite in2="hardAlpha" operator="out"/>
<feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.1 0"/>
<feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_652_4773"/>
<feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_652_4773" result="shape"/>
</filter>
<radialGradient id="paint0_radial_652_4773" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(176 204) rotate(90) scale(204 176)">
<stop offset="0.679584" stop-color="#F6F6F6" stop-opacity="0"/>
<stop offset="1" stop-color="#F6F6F6"/>
</radialGradient>
<clipPath id="clip0_652_4773">
<rect width="352" height="408" rx="24" fill="white"/>
</clipPath>
</defs>
</svg>

                `)
        },
        {
            title: "Smooth icons",
            description: "Elegant curves and fluid shapes that bring motion and warmth to your interfaces.",
            image: (`
                <svg xmlns="http://www.w3.org/2000/svg" width="352" height="408" viewBox="0 0 352 408" fill="none">
<g clip-path="url(#clip0_652_4868)">
<rect width="352" height="408" rx="24" fill="#F6F6F6"/>
<path d="M69 108H79.2957C88.1322 108 95.2957 115.163 95.2957 124V188C95.2957 196.837 102.459 204 111.296 204H125" stroke="#ECECEC"/>
<path d="M69 172H79.2957C88.1322 172 95.2957 179.163 95.2957 188C95.2957 196.837 102.459 204 111.296 204H125" stroke="#ECECEC"/>
<path d="M69 236H79.2957C88.1322 236 95.2957 228.837 95.2957 220C95.2957 211.163 102.459 204 111.296 204H125" stroke="#ECECEC"/>
<path d="M69 300H79.2957C88.1322 300 95.2957 292.837 95.2957 284V220C95.2957 211.163 102.459 204 111.296 204H125" stroke="#ECECEC"/>
<path d="M283 76H272.704C263.868 76 256.704 83.1634 256.704 92V188C256.704 196.837 249.541 204 240.704 204H227" stroke="#ECECEC"/>
<path d="M283 140H272.704C263.868 140 256.704 147.163 256.704 156V188C256.704 196.837 249.541 204 240.704 204H227" stroke="#ECECEC"/>
<path d="M274 204H231.5" stroke="#ECECEC"/>
<path d="M283 268H272.704C263.868 268 256.704 260.837 256.704 252V220C256.704 211.163 249.541 204 240.704 204H227" stroke="#ECECEC"/>
<path d="M283 332H272.704C263.868 332 256.704 324.837 256.704 316V220C256.704 211.163 249.541 204 240.704 204H227" stroke="#ECECEC"/>
<rect x="24" y="80" width="56" height="56" rx="12" fill="#E84C88"/>
<path d="M44 111C44 111 45 110 48 110C51 110 53 112 56 112C59 112 60 111 60 111V100C60 100 59 101 56 101C53 101 51 99 48 99C45 99 44 100 44 100M44 118L44 98" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
<rect x="24" y="144" width="56" height="56" rx="12" fill="white"/>
<path d="M59 181L62 178M62 178L59 175M62 178H56M52 175.5H47.5C46.1044 175.5 45.4067 175.5 44.8389 175.672C43.5605 176.06 42.56 177.06 42.1722 178.339C42 178.907 42 179.604 42 181M54.5 167.5C54.5 169.985 52.4853 172 50 172C47.5147 172 45.5 169.985 45.5 167.5C45.5 165.015 47.5147 163 50 163C52.4853 163 54.5 165.015 54.5 167.5Z" stroke="#B7B7B7" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
<rect x="24" y="208" width="56" height="56" rx="12" fill="white"/>
<path d="M50 232V231M50 236.5V235.5M50 241V240M45.2 228H58.8C59.9201 228 60.4802 228 60.908 228.218C61.2843 228.41 61.5903 228.716 61.782 229.092C62 229.52 62 230.08 62 231.2V232.5C60.067 232.5 58.5 234.067 58.5 236C58.5 237.933 60.067 239.5 62 239.5V240.8C62 241.92 62 242.48 61.782 242.908C61.5903 243.284 61.2843 243.59 60.908 243.782C60.4802 244 59.9201 244 58.8 244H45.2C44.0799 244 43.5198 244 43.092 243.782C42.7157 243.59 42.4097 243.284 42.218 242.908C42 242.48 42 241.92 42 240.8V239.5C43.933 239.5 45.5 237.933 45.5 236C45.5 234.067 43.933 232.5 42 232.5V231.2C42 230.08 42 229.52 42.218 229.092C42.4097 228.716 42.7157 228.41 43.092 228.218C43.5198 228 44.0799 228 45.2 228Z" stroke="#B7B7B7" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
<rect x="24" y="272" width="56" height="56" rx="12" fill="white"/>
<path d="M49 294V298.501C49 299.052 49 299.328 48.9313 299.583C48.8705 299.809 48.7704 300.023 48.6356 300.214C48.4834 300.43 48.2718 300.607 47.8486 300.96L44.1514 304.04C43.7282 304.393 43.5166 304.57 43.3644 304.786C43.2296 304.977 43.1295 305.191 43.0687 305.417C43 305.672 43 305.948 43 306.499V306.8C43 307.92 43 308.48 43.218 308.908C43.4097 309.284 43.7157 309.59 44.092 309.782C44.5198 310 45.0799 310 46.2 310H57.8C58.9201 310 59.4802 310 59.908 309.782C60.2843 309.59 60.5903 309.284 60.782 308.908C61 308.48 61 307.92 61 306.8V306.499C61 305.948 61 305.672 60.9313 305.417C60.8705 305.191 60.7704 304.977 60.6356 304.786C60.4834 304.57 60.2718 304.393 59.8486 304.04L56.1514 300.96C55.7282 300.607 55.5166 300.43 55.3644 300.214C55.2296 300.023 55.1295 299.809 55.0687 299.583C55 299.328 55 299.052 55 298.501V294M48.3 294H55.7C55.98 294 56.12 294 56.227 293.946C56.3211 293.898 56.3976 293.821 56.4455 293.727C56.5 293.62 56.5 293.48 56.5 293.2V290.8C56.5 290.52 56.5 290.38 56.4455 290.273C56.3976 290.179 56.3211 290.102 56.227 290.054C56.12 290 55.98 290 55.7 290H48.3C48.02 290 47.88 290 47.773 290.054C47.6789 290.102 47.6024 290.179 47.5545 290.273C47.5 290.38 47.5 290.52 47.5 290.8V293.2C47.5 293.48 47.5 293.62 47.5545 293.727C47.6024 293.821 47.6789 293.898 47.773 293.946C47.88 294 48.02 294 48.3 294ZM45.5 305H58.5C58.9647 305 59.197 305 59.3902 305.038C60.1836 305.196 60.8038 305.816 60.9616 306.61C61 306.803 61 307.035 61 307.5C61 307.965 61 308.197 60.9616 308.39C60.8038 309.184 60.1836 309.804 59.3902 309.962C59.197 310 58.9647 310 58.5 310H45.5C45.0353 310 44.803 310 44.6098 309.962C43.8164 309.804 43.1962 309.184 43.0384 308.39C43 308.197 43 307.965 43 307.5C43 307.035 43 306.803 43.0384 306.61C43.1962 305.816 43.8164 305.196 44.6098 305.038C44.803 305 45.0353 305 45.5 305Z" stroke="#B7B7B7" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
<rect x="116" y="144" width="120" height="120" rx="20" fill="white"/>
<path d="M199.333 204H194.667M199.333 204C199.333 216.887 188.887 227.333 176 227.333M199.333 204C199.333 191.113 188.887 180.667 176 180.667M192.499 220.499L189.199 217.199M157.333 204H152.667M152.667 204C152.667 216.887 163.113 227.333 176 227.333M152.667 204C152.667 191.113 163.113 180.667 176 180.667M162.801 190.801L159.501 187.501M176 185.333V180.667M189.199 190.801L192.499 187.501M176 227.333V222.667M159.501 220.499L162.801 217.199M176 194.667L185.333 204L176 213.333L166.667 204L176 194.667Z" stroke="#E84C88" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
<g opacity="0.6">
<rect x="116" y="272" width="120" height="120" rx="20" fill="white"/>
<path d="M155.177 321.46L165.183 328.607C165.703 328.978 165.964 329.164 166.236 329.207C166.476 329.245 166.721 329.207 166.938 329.099C167.185 328.975 167.377 328.719 167.761 328.208L169.875 325.389C169.984 325.244 170.038 325.172 170.102 325.109C170.158 325.054 170.221 325.004 170.287 324.961C170.362 324.913 170.445 324.876 170.61 324.803L179.637 320.791C180.011 320.625 180.198 320.542 180.34 320.412C180.464 320.297 180.563 320.156 180.627 319.999C180.701 319.822 180.714 319.618 180.742 319.209L181.402 309.295M179.5 335.5L185.604 338.116C186.312 338.42 186.666 338.571 186.854 338.823C187.018 339.045 187.099 339.317 187.082 339.592C187.063 339.906 186.849 340.226 186.422 340.867L183.554 345.169C183.352 345.473 183.25 345.625 183.116 345.735C182.998 345.832 182.861 345.905 182.715 345.95C182.549 346 182.366 346 182.001 346H177.345C176.862 346 176.62 346 176.414 345.919C176.232 345.848 176.071 345.732 175.946 345.582C175.804 345.412 175.727 345.183 175.575 344.724L173.911 339.734C173.821 339.463 173.776 339.328 173.764 339.19C173.753 339.068 173.762 338.945 173.79 338.826C173.821 338.691 173.885 338.564 174.012 338.309L175.276 335.781C175.533 335.268 175.661 335.011 175.859 334.852C176.033 334.711 176.244 334.624 176.466 334.6C176.719 334.573 176.991 334.664 177.536 334.845L179.5 335.5ZM199.333 332C199.333 344.887 188.887 355.333 176 355.333C163.113 355.333 152.667 344.887 152.667 332C152.667 319.113 163.113 308.667 176 308.667C188.887 308.667 199.333 319.113 199.333 332Z" stroke="#ECECEC" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
</g>
<g opacity="0.6">
<rect x="116" y="400" width="120" height="120" rx="20" fill="white"/>
</g>
<g opacity="0.6">
<rect x="116" y="16" width="120" height="120" rx="20" fill="white"/>
<path d="M199.333 76.0001C199.333 88.8867 188.887 99.3334 176 99.3334M199.333 76.0001C199.333 63.1134 188.887 52.6667 176 52.6667M199.333 76.0001H194.667M176 99.3334C163.113 99.3334 152.667 88.8867 152.667 76.0001M176 99.3334V94.6667M152.667 76.0001C152.667 63.1134 163.113 52.6667 176 52.6667M152.667 76.0001H157.333M176 52.6667V57.3334M192.499 92.4992L189.199 89.1994M162.801 62.8008L159.501 59.5009M189.199 62.8008L192.499 59.5009M159.501 92.4992L162.801 89.1994M166.667 76.0001L172.5 72.5001L176 66.6667L179.5 72.5001L185.333 76.0001L179.5 79.5001L176 85.3334L172.5 79.5001L166.667 76.0001Z" stroke="#ECECEC" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
</g>
<g opacity="0.6">
<rect x="116" y="-112" width="120" height="120" rx="20" fill="white"/>
</g>
<rect x="272" y="48" width="56" height="56" rx="12" fill="white"/>
<path d="M299.5 69H299.934C302.982 69 304.505 69 305.084 69.5473C305.584 70.0204 305.805 70.7173 305.67 71.3922C305.514 72.173 304.27 73.0529 301.782 74.8125L297.718 77.6875C295.23 79.4471 293.986 80.327 293.83 81.1078C293.695 81.7827 293.916 82.4796 294.416 82.9527C294.995 83.5 296.518 83.5 299.566 83.5H300.5M296 69C296 70.6569 294.657 72 293 72C291.343 72 290 70.6569 290 69C290 67.3431 291.343 66 293 66C294.657 66 296 67.3431 296 69ZM310 83C310 84.6569 308.657 86 307 86C305.343 86 304 84.6569 304 83C304 81.3431 305.343 80 307 80C308.657 80 310 81.3431 310 83Z" stroke="#0E0E0E" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
<rect x="272" y="112" width="56" height="56" rx="12" fill="white"/>
<path d="M303 130.458C302.053 130.16 301.045 130 300 130C294.477 130 290 134.477 290 140C290 145.523 294.477 150 300 150C305.523 150 310 145.523 310 140C310 138.285 309.568 136.67 308.807 135.259M305 133.75H305.005M298.5 149.888L298.5 147.685C298.5 147.566 298.543 147.45 298.621 147.36L301.106 144.459C301.311 144.221 301.247 143.856 300.975 143.7L298.119 142.068C298.041 142.023 297.977 141.959 297.932 141.881L296.07 138.619C295.974 138.449 295.787 138.351 295.592 138.368L290.064 138.861M309 134C309 136.209 307 138 305 140C303 138 301 136.209 301 134C301 131.791 302.791 130 305 130C307.209 130 309 131.791 309 134ZM305.25 133.75C305.25 133.888 305.138 134 305 134C304.862 134 304.75 133.888 304.75 133.75C304.75 133.612 304.862 133.5 305 133.5C305.138 133.5 305.25 133.612 305.25 133.75Z" stroke="#0E0E0E" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
<rect x="272" y="176" width="56" height="56" rx="12" fill="white"/>
<path d="M297.5 214H302.5M296 194H304M300 197V194M292 204H308M305 211L306.5 214M295 211L293.5 214M296.5 207.5H296.51M303.5 207.5H303.51M296.8 211H303.2C304.88 211 305.72 211 306.362 210.673C306.926 210.385 307.385 209.926 307.673 209.362C308 208.72 308 207.88 308 206.2V201.8C308 200.12 308 199.28 307.673 198.638C307.385 198.074 306.926 197.615 306.362 197.327C305.72 197 304.88 197 303.2 197H296.8C295.12 197 294.28 197 293.638 197.327C293.074 197.615 292.615 198.074 292.327 198.638C292 199.28 292 200.12 292 201.8V206.2C292 207.88 292 208.72 292.327 209.362C292.615 209.926 293.074 210.385 293.638 210.673C294.28 211 295.12 211 296.8 211ZM297 207.5C297 207.776 296.776 208 296.5 208C296.224 208 296 207.776 296 207.5C296 207.224 296.224 207 296.5 207C296.776 207 297 207.224 297 207.5ZM304 207.5C304 207.776 303.776 208 303.5 208C303.224 208 303 207.776 303 207.5C303 207.224 303.224 207 303.5 207C303.776 207 304 207.224 304 207.5Z" stroke="#0E0E0E" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
<rect x="272" y="240" width="56" height="56" rx="12" fill="white"/>
<path d="M293 266V272.011C293 272.37 293 272.55 293.055 272.708C293.103 272.848 293.182 272.976 293.286 273.082C293.403 273.201 293.563 273.282 293.884 273.442L299.284 276.142C299.547 276.273 299.678 276.339 299.816 276.365C299.937 276.388 300.063 276.388 300.184 276.365C300.322 276.339 300.453 276.273 300.716 276.142L306.116 273.442C306.437 273.282 306.597 273.201 306.714 273.082C306.818 272.976 306.897 272.848 306.945 272.708C307 272.55 307 272.37 307 272.011V266M290 264.5L299.642 259.679C299.773 259.613 299.839 259.581 299.908 259.568C299.969 259.556 300.031 259.556 300.092 259.568C300.161 259.581 300.227 259.613 300.358 259.679L310 264.5L300.358 269.321C300.227 269.387 300.161 269.42 300.092 269.432C300.031 269.444 299.969 269.444 299.908 269.432C299.839 269.42 299.773 269.387 299.642 269.321L290 264.5Z" stroke="#0E0E0E" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
<rect x="272" y="304" width="56" height="56" rx="12" fill="white"/>
<path d="M290.687 335.645L292.595 334.544C292.698 334.484 292.82 334.463 292.937 334.485L296.691 335.188C297 335.246 297.285 335.008 297.283 334.694L297.269 331.404C297.268 331.315 297.292 331.227 297.337 331.15L299.232 327.906C299.33 327.737 299.322 327.527 299.209 327.367L296.019 322.826M307 324.859C301.5 327.5 304.5 331 305.5 331.5C307.377 332.438 309.988 332.5 309.988 332.5C309.996 332.334 310 332.168 310 332C310 326.477 305.523 322 300 322C294.477 322 290 326.477 290 332C290 337.523 294.477 342 300 342C300.168 342 300.334 341.996 300.5 341.988M304.758 341.94L301.591 333.591L309.94 336.758L306.238 338.238L304.758 341.94Z" stroke="#0E0E0E" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</g>
<defs>
<clipPath id="clip0_652_4868">
<rect width="352" height="408" rx="24" fill="white"/>
</clipPath>
</defs>
</svg>
                `)
        },
        {
            title: "Brutalist icons",
            description: "Geometric, high-tech look for modern dashboards and bold visual systems.",
            image: (`
                <svg xmlns="http://www.w3.org/2000/svg" width="352" height="408" viewBox="0 0 352 408" fill="none">
<g clip-path="url(#clip0_652_5215)">
<rect width="352" height="408" rx="24" fill="#F6F6F6"/>
<path d="M68 13V27.5C68 36.3366 75.1634 43.5 84 43.5H132C140.837 43.5 148 50.6634 148 59.5V73" stroke="#ECECEC"/>
<path d="M228 13V27.5C228 36.3366 220.837 43.5 212 43.5H164C155.163 43.5 148 50.6634 148 59.5V73" stroke="#ECECEC"/>
<g opacity="0.15" filter="url(#filter0_d_652_5215)">
<rect x="8" y="64" width="56" height="56" rx="12" fill="white" shape-rendering="crispEdges"/>
<path d="M36 92.5C37.6569 92.5 39 91.1569 39 89.5C39 87.8431 37.6569 86.5 36 86.5C34.3431 86.5 33 87.8431 33 89.5C33 91.1569 34.3431 92.5 36 92.5Z" stroke="#B7B7B7" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M36 102C38 98 44 95.4183 44 90C44 85.5817 40.4183 82 36 82C31.5817 82 28 85.5817 28 90C28 95.4183 34 98 36 102Z" stroke="#B7B7B7" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</g>
<g opacity="0.15" filter="url(#filter1_d_652_5215)">
<rect x="8" y="120" width="56" height="56" rx="12" fill="white" shape-rendering="crispEdges"/>
<path d="M46 148C46 153.523 41.5228 158 36 158M46 148C46 142.477 41.5228 138 36 138M46 148H44M36 158C30.4772 158 26 153.523 26 148M36 158V156M26 148C26 142.477 30.4772 138 36 138M26 148H28M36 138V140M43.0711 155.071L41.6569 153.657M30.3431 142.343L28.9289 140.929M41.6569 142.343L43.0711 140.929M28.9289 155.071L30.3431 153.657M32 148L34.5 146.5L36 144L37.5 146.5L40 148L37.5 149.5L36 152L34.5 149.5L32 148Z" stroke="#B7B7B7" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</g>
<g opacity="0.15" filter="url(#filter2_d_652_5215)">
<rect x="8" y="176" width="56" height="56" rx="12" fill="white" shape-rendering="crispEdges"/>
<path d="M40 205.374C43.5318 206.069 46 207.655 46 209.5C46 211.985 41.5228 214 36 214C30.4772 214 26 211.985 26 209.5C26 207.655 28.4682 206.069 32 205.374M36 209V195L41.3177 198.272C41.7056 198.511 41.8995 198.63 41.9614 198.781C42.0154 198.912 42.0111 199.06 41.9497 199.188C41.8792 199.334 41.6787 199.442 41.2777 199.658L36 202.5" stroke="#B7B7B7" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</g>
<g opacity="0.15" filter="url(#filter3_d_652_5215)">
<rect x="8" y="232" width="56" height="56" rx="12" fill="white" shape-rendering="crispEdges"/>
<path d="M28 263C28 263 29 262 32 262C35 262 37 264 40 264C43 264 44 263 44 263V251C44 251 43 252 40 252C37 252 35 250 32 250C29 250 28 251 28 251L28 270" stroke="#B7B7B7" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</g>
<g opacity="0.15" filter="url(#filter4_d_652_5215)">
<rect x="8" y="288" width="56" height="56" rx="12" fill="white" shape-rendering="crispEdges"/>
<path d="M35 308H31.8C30.1198 308 29.2798 308 28.638 308.327C28.0735 308.615 27.6146 309.074 27.327 309.638C27 310.28 27 311.12 27 312.8V318C27 318.93 27 319.395 27.1022 319.776C27.3796 320.812 28.1883 321.62 29.2235 321.898C29.605 322 30.07 322 31 322V324.336C31 324.868 31 325.135 31.1092 325.272C31.2042 325.391 31.3483 325.46 31.5005 325.46C31.6756 325.459 31.8837 325.293 32.2998 324.96L34.6852 323.052C35.1725 322.662 35.4162 322.467 35.6875 322.328C35.9282 322.205 36.1844 322.116 36.4492 322.061C36.7477 322 37.0597 322 37.6837 322H39.2C40.8802 322 41.7202 322 42.362 321.673C42.9265 321.385 43.3854 320.926 43.673 320.362C44 319.72 44 318.88 44 317.2V317M44.1213 307.879C45.2929 309.05 45.2929 310.95 44.1213 312.121C42.9497 313.293 41.0503 313.293 39.8787 312.121C38.7071 310.95 38.7071 309.05 39.8787 307.879C41.0503 306.707 42.9497 306.707 44.1213 307.879Z" stroke="#B7B7B7" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</g>
<g opacity="0.15" filter="url(#filter5_d_652_5215)">
<rect x="64" y="64" width="56" height="56" rx="12" fill="white" shape-rendering="crispEdges"/>
<path d="M92 95L89 92M92 95C93.3968 94.4687 94.7369 93.7987 96 93M92 95V100C92 100 95.03 99.45 96 98C97.08 96.38 96 93 96 93M89 92C89.5321 90.6194 90.2022 89.2961 91 88.05C92.1652 86.187 93.7876 84.6531 95.713 83.5941C97.6384 82.5351 99.8027 81.9864 102 82C102 84.72 101.22 89.5 96 93M89 92H84C84 92 84.55 88.97 86 88C87.62 86.92 91 88 91 88M84.5 96.5C83 97.76 82.5 101.5 82.5 101.5C82.5 101.5 86.24 101 87.5 99.5C88.21 98.66 88.2 97.37 87.41 96.59C87.0213 96.219 86.5093 96.0046 85.9722 95.988C85.4352 95.9714 84.9109 96.1537 84.5 96.5Z" stroke="#B7B7B7" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</g>
<g opacity="0.15" filter="url(#filter6_d_652_5215)">
<rect x="64" y="120" width="56" height="56" rx="12" fill="white" shape-rendering="crispEdges"/>
<path d="M83.076 143.483L87.364 146.546C87.5872 146.705 87.6987 146.785 87.8155 146.803C87.9182 146.819 88.0234 146.803 88.1165 146.756C88.2222 146.704 88.3045 146.594 88.469 146.375L89.3751 145.167C89.4216 145.104 89.4449 145.073 89.4722 145.047C89.4965 145.023 89.5232 145.002 89.5517 144.983C89.5839 144.963 89.6193 144.947 89.6902 144.915L93.5588 143.196C93.7192 143.125 93.7993 143.089 93.8598 143.034C93.9133 142.984 93.9554 142.924 93.9832 142.857C94.0146 142.781 94.0204 142.693 94.0321 142.518L94.3154 138.269M93.5 149.5L96.116 150.621C96.4195 150.751 96.5713 150.816 96.6517 150.924C96.7222 151.019 96.7569 151.136 96.7496 151.254C96.7413 151.388 96.6497 151.525 96.4665 151.8L95.2375 153.644C95.1507 153.774 95.1072 153.839 95.0499 153.886C94.9991 153.928 94.9406 153.959 94.8777 153.978C94.8067 154 94.7284 154 94.5719 154H92.5766C92.3693 154 92.2656 154 92.1774 153.965C92.0995 153.935 92.0305 153.885 91.9768 153.821C91.916 153.748 91.8832 153.65 91.8177 153.453L91.1048 151.314C91.0661 151.198 91.0468 151.14 91.0417 151.081C91.0372 151.029 91.0409 150.976 91.0528 150.925C91.0662 150.868 91.0935 150.813 91.1482 150.704L91.6897 149.621C91.7997 149.401 91.8547 149.291 91.9395 149.222C92.0141 149.162 92.1046 149.125 92.1999 149.114C92.3081 149.103 92.4248 149.142 92.6582 149.219L93.5 149.5ZM102 148C102 153.523 97.5228 158 92 158C86.4772 158 82 153.523 82 148C82 142.477 86.4772 138 92 138C97.5228 138 102 142.477 102 148Z" stroke="#B7B7B7" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</g>
<g opacity="0.15" filter="url(#filter7_d_652_5215)">
<rect x="64" y="176" width="56" height="56" rx="12" fill="white" shape-rendering="crispEdges"/>
<path d="M88 200V199M88 204.5V203.5M88 209V208M86.8 212H97.2C98.8802 212 99.7202 212 100.362 211.673C100.926 211.385 101.385 210.926 101.673 210.362C102 209.72 102 208.88 102 207.2V200.8C102 199.12 102 198.28 101.673 197.638C101.385 197.074 100.926 196.615 100.362 196.327C99.7202 196 98.8802 196 97.2 196H86.8C85.1198 196 84.2798 196 83.638 196.327C83.0735 196.615 82.6146 197.074 82.327 197.638C82 198.28 82 199.12 82 200.8V207.2C82 208.88 82 209.72 82.327 210.362C82.6146 210.926 83.0735 211.385 83.638 211.673C84.2798 212 85.1198 212 86.8 212Z" stroke="#B7B7B7" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</g>
<g opacity="0.15" filter="url(#filter8_d_652_5215)">
<rect x="64" y="288" width="56" height="56" rx="12" fill="white" shape-rendering="crispEdges"/>
<path d="M91 308H87.8C86.1198 308 85.2798 308 84.638 308.327C84.0735 308.615 83.6146 309.074 83.327 309.638C83 310.28 83 311.12 83 312.8V320.2C83 321.88 83 322.72 83.327 323.362C83.6146 323.926 84.0735 324.385 84.638 324.673C85.2798 325 86.1198 325 87.8 325H95.2C96.8802 325 97.7202 325 98.362 324.673C98.9265 324.385 99.3854 323.926 99.673 323.362C100 322.72 100 321.88 100 320.2V317M93 321H87M95 317H87M100.121 307.879C101.293 309.05 101.293 310.95 100.121 312.121C98.9497 313.293 97.0503 313.293 95.8787 312.121C94.7071 310.95 94.7071 309.05 95.8787 307.879C97.0503 306.707 98.9497 306.707 100.121 307.879Z" stroke="#B7B7B7" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</g>
<g opacity="0.15" filter="url(#filter9_d_652_5215)">
<rect x="64" y="232" width="56" height="56" rx="12" fill="white" shape-rendering="crispEdges"/>
<path d="M91 252H87.8C86.1198 252 85.2798 252 84.638 252.327C84.0735 252.615 83.6146 253.074 83.327 253.638C83 254.28 83 255.12 83 256.8V264.2C83 265.88 83 266.72 83.327 267.362C83.6146 267.926 84.0735 268.385 84.638 268.673C85.2798 269 86.1198 269 87.8 269H95.2C96.8802 269 97.7202 269 98.362 268.673C98.9265 268.385 99.3854 267.926 99.673 267.362C100 266.72 100 265.88 100 264.2V261M93 265H87M95 261H87M100.121 251.879C101.293 253.05 101.293 254.95 100.121 256.121C98.9497 257.293 97.0503 257.293 95.8787 256.121C94.7071 254.95 94.7071 253.05 95.8787 251.879C97.0503 250.707 98.9497 250.707 100.121 251.879Z" stroke="#B7B7B7" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</g>
<g opacity="0.15" filter="url(#filter10_d_652_5215)">
<rect x="120" y="120" width="56" height="56" rx="12" fill="white" shape-rendering="crispEdges"/>
<path d="M141 150.286C139.149 151.103 138 152.241 138 153.5C138 155.985 142.477 158 148 158C153.523 158 158 155.985 158 153.5C158 152.241 156.851 151.103 155 150.286M154 144C154 148.064 149.5 150 148 153C146.5 150 142 148.064 142 144C142 140.686 144.686 138 148 138C151.314 138 154 140.686 154 144ZM149 144C149 144.552 148.552 145 148 145C147.448 145 147 144.552 147 144C147 143.448 147.448 143 148 143C148.552 143 149 143.448 149 144Z" stroke="#B7B7B7" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</g>
<g opacity="0.08" filter="url(#filter11_d_652_5215)">
<rect x="120" y="176" width="56" height="56" rx="12" fill="#F6F6F6" shape-rendering="crispEdges"/>
<path d="M148 214C153.523 214 158 209.523 158 204C158 198.477 153.523 194 148 194C142.477 194 138 198.477 138 204C138 209.523 142.477 214 148 214Z" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M150.722 200.266C151.211 200.103 151.455 200.022 151.617 200.08C151.759 200.13 151.87 200.241 151.92 200.383C151.978 200.545 151.897 200.789 151.734 201.278L150.246 205.741C150.2 205.88 150.177 205.949 150.137 206.007C150.102 206.058 150.058 206.102 150.007 206.137C149.949 206.177 149.88 206.2 149.741 206.246L145.278 207.734C144.789 207.897 144.545 207.978 144.383 207.92C144.241 207.87 144.13 207.759 144.08 207.617C144.022 207.455 144.103 207.211 144.266 206.722L145.754 202.259C145.8 202.12 145.823 202.051 145.863 201.993C145.898 201.942 145.942 201.898 145.993 201.863C146.051 201.823 146.12 201.8 146.259 201.754L150.722 200.266Z" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</g>
<g opacity="0.15" filter="url(#filter12_d_652_5215)">
<rect x="120" y="232" width="56" height="56" rx="12" fill="white" shape-rendering="crispEdges"/>
<path d="M144 270V268M145.5 263V255M152 270V268M150.5 263V255M144.8 268H151.2C152.88 268 153.72 268 154.362 267.673C154.926 267.385 155.385 266.926 155.673 266.362C156 265.72 156 264.88 156 263.2V254.8C156 253.12 156 252.28 155.673 251.638C155.385 251.074 154.926 250.615 154.362 250.327C153.72 250 152.88 250 151.2 250H144.8C143.12 250 142.28 250 141.638 250.327C141.074 250.615 140.615 251.074 140.327 251.638C140 252.28 140 253.12 140 254.8V263.2C140 264.88 140 265.72 140.327 266.362C140.615 266.926 141.074 267.385 141.638 267.673C142.28 268 143.12 268 144.8 268Z" stroke="#B7B7B7" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</g>
<g opacity="0.15" filter="url(#filter13_d_652_5215)">
<rect x="120" y="288" width="56" height="56" rx="12" fill="white" shape-rendering="crispEdges"/>
<path d="M153 306V317M158 313.8V309.2C158 308.08 158 307.52 157.782 307.092C157.59 306.716 157.284 306.41 156.908 306.218C156.48 306 155.92 306 154.8 306H144.118C142.657 306 141.926 306 141.336 306.267C140.815 306.503 140.373 306.882 140.061 307.361C139.707 307.903 139.596 308.626 139.374 310.07L138.851 313.47C138.558 315.375 138.411 316.328 138.694 317.069C138.942 317.72 139.409 318.264 140.014 318.608C140.704 319 141.667 319 143.595 319H144.4C144.96 319 145.24 319 145.454 319.109C145.642 319.205 145.795 319.358 145.891 319.546C146 319.76 146 320.04 146 320.6V323.534C146 324.896 147.104 326 148.466 326C148.791 326 149.085 325.809 149.217 325.512L152.578 317.95C152.731 317.606 152.807 317.434 152.928 317.308C153.035 317.197 153.166 317.112 153.311 317.059C153.475 317 153.663 317 154.04 317H154.8C155.92 317 156.48 317 156.908 316.782C157.284 316.59 157.59 316.284 157.782 315.908C158 315.48 158 314.92 158 313.8Z" stroke="#B7B7B7" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</g>
<g opacity="0.15" filter="url(#filter14_d_652_5215)">
<rect x="176" y="288" width="56" height="56" rx="12" fill="white" shape-rendering="crispEdges"/>
<path d="M209 306V317M214 313.8V309.2C214 308.08 214 307.52 213.782 307.092C213.59 306.716 213.284 306.41 212.908 306.218C212.48 306 211.92 306 210.8 306H200.118C198.657 306 197.926 306 197.336 306.267C196.815 306.503 196.373 306.882 196.061 307.361C195.707 307.903 195.596 308.626 195.374 310.07L194.851 313.47C194.558 315.375 194.411 316.328 194.694 317.069C194.942 317.72 195.409 318.264 196.014 318.608C196.704 319 197.667 319 199.595 319H200.4C200.96 319 201.24 319 201.454 319.109C201.642 319.205 201.795 319.358 201.891 319.546C202 319.76 202 320.04 202 320.6V323.534C202 324.896 203.104 326 204.466 326C204.791 326 205.085 325.809 205.217 325.512L208.578 317.95C208.731 317.606 208.807 317.434 208.928 317.308C209.035 317.197 209.166 317.112 209.311 317.059C209.475 317 209.663 317 210.04 317H210.8C211.92 317 212.48 317 212.908 316.782C213.284 316.59 213.59 316.284 213.782 315.908C214 315.48 214 314.92 214 313.8Z" stroke="#B7B7B7" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</g>
<g opacity="0.15" filter="url(#filter15_d_652_5215)">
<rect x="176" y="64" width="56" height="56" rx="12" fill="white" shape-rendering="crispEdges"/>
<path d="M204 82C207 84 207.923 88.292 208 92C207.923 95.708 207 100 204 102M204 82C201 84 200.077 88.292 200 92C200.077 95.708 201 100 204 102M204 82C198.477 82 194 86.4772 194 92M204 82C209.523 82 214 86.4772 214 92M204 102C209.523 102 214 97.5228 214 92M204 102C198.477 102 194 97.5228 194 92M214 92C212 95 207.708 95.9228 204 96C200.292 95.9228 196 95 194 92M214 92C212 89 207.708 88.0772 204 88C200.292 88.0772 196 89 194 92" stroke="#B7B7B7" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</g>
<g opacity="0.15" filter="url(#filter16_d_652_5215)">
<rect x="176" y="176" width="56" height="56" rx="12" fill="white" shape-rendering="crispEdges"/>
<path d="M194.687 207.645L196.595 206.544C196.698 206.484 196.82 206.463 196.937 206.485L200.691 207.188C201 207.246 201.285 207.008 201.283 206.694L201.269 203.404C201.268 203.315 201.292 203.227 201.337 203.15L203.232 199.906C203.33 199.737 203.322 199.527 203.209 199.367L200.019 194.826M211 196.859C205.5 199.5 208.5 203 209.5 203.5C211.377 204.438 213.988 204.5 213.988 204.5C213.996 204.334 214 204.168 214 204C214 198.477 209.523 194 204 194C198.477 194 194 198.477 194 204C194 209.523 198.477 214 204 214C204.168 214 204.334 213.996 204.5 213.988M208.758 213.94L205.591 205.591L213.94 208.758L210.238 210.238L208.758 213.94Z" stroke="#B7B7B7" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</g>
<g opacity="0.15" filter="url(#filter17_d_652_5215)">
<rect x="176" y="232" width="56" height="56" rx="12" fill="white" shape-rendering="crispEdges"/>
<path d="M202 256V255M202 260.5V259.5M202 265V264M197.2 252H210.8C211.92 252 212.48 252 212.908 252.218C213.284 252.41 213.59 252.716 213.782 253.092C214 253.52 214 254.08 214 255.2V256.5C212.067 256.5 210.5 258.067 210.5 260C210.5 261.933 212.067 263.5 214 263.5V264.8C214 265.92 214 266.48 213.782 266.908C213.59 267.284 213.284 267.59 212.908 267.782C212.48 268 211.92 268 210.8 268H197.2C196.08 268 195.52 268 195.092 267.782C194.716 267.59 194.41 267.284 194.218 266.908C194 266.48 194 265.92 194 264.8V263.5C195.933 263.5 197.5 261.933 197.5 260C197.5 258.067 195.933 256.5 194 256.5V255.2C194 254.08 194 253.52 194.218 253.092C194.41 252.716 194.716 252.41 195.092 252.218C195.52 252 196.08 252 197.2 252Z" stroke="#B7B7B7" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</g>
<g opacity="0.15" filter="url(#filter18_d_652_5215)">
<rect x="232" y="64" width="56" height="56" rx="12" fill="white" shape-rendering="crispEdges"/>
<path d="M260 102C261 97 268 96.4183 268 90C268 85.5817 264.418 82 260 82C255.582 82 252 85.5817 252 90C252 96.4183 259 97 260 102Z" stroke="#B7B7B7" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M260 93C261.657 93 263 91.6569 263 90C263 88.3431 261.657 87 260 87C258.343 87 257 88.3431 257 90C257 91.6569 258.343 93 260 93Z" stroke="#B7B7B7" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</g>
<g opacity="0.15" filter="url(#filter19_d_652_5215)">
<rect x="232" y="120" width="56" height="56" rx="12" fill="white" shape-rendering="crispEdges"/>
<path d="M270 148H268M270 148C270 153.523 265.523 158 260 158M270 148C270 142.477 265.523 138 260 138M267.071 155.071L265.657 153.657M252 148H250M250 148C250 153.523 254.477 158 260 158M250 148C250 142.477 254.477 138 260 138M254.343 142.343L252.929 140.929M260 140V138M265.657 142.343L267.071 140.929M260 158V156M252.929 155.071L254.343 153.657M260 144L264 148L260 152L256 148L260 144Z" stroke="#B7B7B7" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</g>
<g opacity="0.15" filter="url(#filter20_d_652_5215)">
<rect x="232" y="176" width="56" height="56" rx="12" fill="white" shape-rendering="crispEdges"/>
<path d="M264 205.374C267.532 206.069 270 207.655 270 209.5C270 211.985 265.523 214 260 214C254.477 214 250 211.985 250 209.5C250 207.655 252.468 206.069 256 205.374M260 209V201M260 201C261.657 201 263 199.657 263 198C263 196.343 261.657 195 260 195C258.343 195 257 196.343 257 198C257 199.657 258.343 201 260 201Z" stroke="#B7B7B7" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</g>
<g opacity="0.15" filter="url(#filter21_d_652_5215)">
<rect x="232" y="232" width="56" height="56" rx="12" fill="white" shape-rendering="crispEdges"/>
<path d="M267 258V254.2C267 253.08 267 252.52 266.782 252.092C266.59 251.716 266.284 251.41 265.908 251.218C265.48 251 264.92 251 263.8 251H256.2C255.08 251 254.52 251 254.092 251.218C253.716 251.41 253.41 251.716 253.218 252.092C253 252.52 253 253.08 253 254.2V258M253 257H250V256M267 257H270V256M254 261.5H254.01M266 261.5H266.01M254.8 258H265.2C266.88 258 267.72 258 268.362 258.327C268.926 258.615 269.385 259.074 269.673 259.638C270 260.28 270 261.12 270 262.8V266C270 266.932 270 267.398 269.848 267.765C269.645 268.255 269.255 268.645 268.765 268.848C268.398 269 267.932 269 267 269H266.4C266.028 269 265.843 269 265.687 268.975C264.831 268.84 264.16 268.169 264.025 267.313C264 267.157 264 266.972 264 266.6C264 266.507 264 266.461 263.994 266.422C263.96 266.208 263.792 266.04 263.578 266.006C263.539 266 263.493 266 263.4 266H256.6C256.507 266 256.461 266 256.422 266.006C256.208 266.04 256.04 266.208 256.006 266.422C256 266.461 256 266.507 256 266.6C256 266.972 256 267.157 255.975 267.313C255.84 268.169 255.169 268.84 254.313 268.975C254.157 269 253.972 269 253.6 269H253C252.068 269 251.602 269 251.235 268.848C250.745 268.645 250.355 268.255 250.152 267.765C250 267.398 250 266.932 250 266V262.8C250 261.12 250 260.28 250.327 259.638C250.615 259.074 251.074 258.615 251.638 258.327C252.28 258 253.12 258 254.8 258ZM254.5 261.5C254.5 261.776 254.276 262 254 262C253.724 262 253.5 261.776 253.5 261.5C253.5 261.224 253.724 261 254 261C254.276 261 254.5 261.224 254.5 261.5ZM266.5 261.5C266.5 261.776 266.276 262 266 262C265.724 262 265.5 261.776 265.5 261.5C265.5 261.224 265.724 261 266 261C266.276 261 266.5 261.224 266.5 261.5Z" stroke="#B7B7B7" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</g>
<g opacity="0.15" filter="url(#filter22_d_652_5215)">
<rect x="232" y="288" width="56" height="56" rx="12" fill="white" shape-rendering="crispEdges"/>
<path d="M255 326V315M250 317V324C250 325.105 250.895 326 252 326H265.426C266.907 326 268.166 324.92 268.391 323.456L269.468 316.456C269.748 314.639 268.342 313 266.503 313H263C262.448 313 262 312.552 262 312V308.466C262 307.104 260.896 306 259.534 306C259.209 306 258.915 306.191 258.783 306.488L255.264 314.406C255.103 314.767 254.745 315 254.35 315H252C250.895 315 250 315.895 250 317Z" stroke="#B7B7B7" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</g>
<g opacity="0.15" filter="url(#filter23_d_652_5215)">
<rect x="288" y="64" width="56" height="56" rx="12" fill="white" shape-rendering="crispEdges"/>
<path d="M315.5 85H315.934C318.982 85 320.505 85 321.084 85.5473C321.584 86.0204 321.805 86.7173 321.67 87.3922C321.514 88.173 320.27 89.0529 317.782 90.8125L313.718 93.6875C311.23 95.4471 309.986 96.327 309.83 97.1078C309.695 97.7827 309.916 98.4796 310.416 98.9527C310.995 99.5 312.518 99.5 315.566 99.5H316.5M312 85C312 86.6569 310.657 88 309 88C307.343 88 306 86.6569 306 85C306 83.3431 307.343 82 309 82C310.657 82 312 83.3431 312 85ZM326 99C326 100.657 324.657 102 323 102C321.343 102 320 100.657 320 99C320 97.3431 321.343 96 323 96C324.657 96 326 97.3431 326 99Z" stroke="#B7B7B7" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</g>
<g opacity="0.15" filter="url(#filter24_d_652_5215)">
<rect x="288" y="120" width="56" height="56" rx="12" fill="white" shape-rendering="crispEdges"/>
<path d="M319 138.458C318.053 138.16 317.045 138 316 138C310.477 138 306 142.477 306 148C306 153.523 310.477 158 316 158C321.523 158 326 153.523 326 148C326 146.285 325.568 144.67 324.807 143.259M321 141.75H321.005M314.5 157.888L314.5 155.685C314.5 155.566 314.543 155.45 314.621 155.36L317.106 152.459C317.311 152.221 317.247 151.856 316.975 151.7L314.119 150.068C314.041 150.023 313.977 149.959 313.932 149.881L312.07 146.619C311.974 146.449 311.787 146.351 311.592 146.368L306.064 146.861M325 142C325 144.209 323 146 321 148C319 146 317 144.209 317 142C317 139.791 318.791 138 321 138C323.209 138 325 139.791 325 142ZM321.25 141.75C321.25 141.888 321.138 142 321 142C320.862 142 320.75 141.888 320.75 141.75C320.75 141.612 320.862 141.5 321 141.5C321.138 141.5 321.25 141.612 321.25 141.75Z" stroke="#B7B7B7" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</g>
<g opacity="0.15" filter="url(#filter25_d_652_5215)">
<rect x="288" y="176" width="56" height="56" rx="12" fill="white" shape-rendering="crispEdges"/>
<path d="M313.5 214H318.5M312 194H320M316 197V194M308 204H324M321 211L322.5 214M311 211L309.5 214M312.5 207.5H312.51M319.5 207.5H319.51M312.8 211H319.2C320.88 211 321.72 211 322.362 210.673C322.926 210.385 323.385 209.926 323.673 209.362C324 208.72 324 207.88 324 206.2V201.8C324 200.12 324 199.28 323.673 198.638C323.385 198.074 322.926 197.615 322.362 197.327C321.72 197 320.88 197 319.2 197H312.8C311.12 197 310.28 197 309.638 197.327C309.074 197.615 308.615 198.074 308.327 198.638C308 199.28 308 200.12 308 201.8V206.2C308 207.88 308 208.72 308.327 209.362C308.615 209.926 309.074 210.385 309.638 210.673C310.28 211 311.12 211 312.8 211ZM313 207.5C313 207.776 312.776 208 312.5 208C312.224 208 312 207.776 312 207.5C312 207.224 312.224 207 312.5 207C312.776 207 313 207.224 313 207.5ZM320 207.5C320 207.776 319.776 208 319.5 208C319.224 208 319 207.776 319 207.5C319 207.224 319.224 207 319.5 207C319.776 207 320 207.224 320 207.5Z" stroke="#B7B7B7" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</g>
<g opacity="0.15" filter="url(#filter26_d_652_5215)">
<rect x="288" y="232" width="56" height="56" rx="12" fill="white" shape-rendering="crispEdges"/>
<path d="M309 258V264.011C309 264.37 309 264.55 309.055 264.708C309.103 264.848 309.182 264.976 309.286 265.082C309.403 265.201 309.563 265.282 309.884 265.442L315.284 268.142C315.547 268.273 315.678 268.339 315.816 268.365C315.937 268.388 316.063 268.388 316.184 268.365C316.322 268.339 316.453 268.273 316.716 268.142L322.116 265.442C322.437 265.282 322.597 265.201 322.714 265.082C322.818 264.976 322.897 264.848 322.945 264.708C323 264.55 323 264.37 323 264.011V258M306 256.5L315.642 251.679C315.773 251.613 315.839 251.581 315.908 251.568C315.969 251.556 316.031 251.556 316.092 251.568C316.161 251.581 316.227 251.613 316.358 251.679L326 256.5L316.358 261.321C316.227 261.387 316.161 261.42 316.092 261.432C316.031 261.444 315.969 261.444 315.908 261.432C315.839 261.42 315.773 261.387 315.642 261.321L306 256.5Z" stroke="#B7B7B7" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</g>
<g opacity="0.15" filter="url(#filter27_d_652_5215)">
<rect x="288" y="288" width="56" height="56" rx="12" fill="white" shape-rendering="crispEdges"/>
<path d="M323 325L326 322M326 322L323 319M326 322H320M316 319.5H311.5C310.104 319.5 309.407 319.5 308.839 319.672C307.56 320.06 306.56 321.06 306.172 322.339C306 322.907 306 323.604 306 325M318.5 311.5C318.5 313.985 316.485 316 314 316C311.515 316 309.5 313.985 309.5 311.5C309.5 309.015 311.515 307 314 307C316.485 307 318.5 309.015 318.5 311.5Z" stroke="#B7B7B7" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</g>
<g filter="url(#filter28_d_652_5215)">
<rect x="120" y="64" width="56" height="56" rx="12" fill="#F6F6F6" shape-rendering="crispEdges"/>
<path d="M153.745 82.8127C154.71 81.8163 156.304 81.8034 157.284 82.7841C158.238 83.738 158.256 85.279 157.324 86.2546L154.546 89.1643C154.328 89.3924 154.219 89.5064 154.152 89.64C154.092 89.7582 154.057 89.8871 154.048 90.0191C154.037 90.1682 154.073 90.3218 154.144 90.6291L155.872 98.1167C155.944 98.4321 155.981 98.5898 155.969 98.7423C155.959 98.8774 155.921 99.0089 155.858 99.1289C155.787 99.2645 155.673 99.3789 155.444 99.6078L155.073 99.9786C154.467 100.585 154.164 100.888 153.854 100.943C153.583 100.991 153.304 100.925 153.083 100.761C152.831 100.573 152.695 100.166 152.424 99.3532L150.414 93.3239L147.069 96.6692C146.869 96.8689 146.769 96.9687 146.703 97.0863C146.643 97.1905 146.603 97.3044 146.585 97.4227C146.563 97.5563 146.579 97.6966 146.61 97.9773L146.794 99.6307C146.825 99.9113 146.841 100.052 146.819 100.185C146.8 100.304 146.76 100.417 146.701 100.522C146.634 100.639 146.535 100.739 146.335 100.939L146.137 101.136C145.664 101.609 145.428 101.846 145.165 101.914C144.934 101.974 144.69 101.95 144.476 101.846C144.231 101.727 144.046 101.449 143.675 100.892L142.106 98.5399C142.04 98.4404 142.007 98.3907 141.968 98.3456C141.934 98.3056 141.897 98.2683 141.857 98.2341C141.812 98.1956 141.762 98.1624 141.663 98.0961L139.31 96.5278C138.754 96.1567 138.475 95.9712 138.356 95.7269C138.252 95.5126 138.228 95.2681 138.288 95.0376C138.357 94.7747 138.593 94.5382 139.066 94.0652L139.264 93.8677C139.464 93.668 139.563 93.5681 139.681 93.5013C139.785 93.4422 139.899 93.4022 140.017 93.3833C140.151 93.362 140.291 93.3776 140.572 93.4088L142.225 93.5925C142.506 93.6237 142.646 93.6393 142.78 93.618C142.898 93.5991 143.012 93.5592 143.116 93.5C143.234 93.4332 143.334 93.3334 143.533 93.1337L146.879 89.7884L140.849 87.7786C140.036 87.5075 139.63 87.372 139.442 87.1191C139.278 86.8982 139.212 86.6196 139.26 86.3487C139.315 86.0385 139.618 85.7355 140.224 85.1293L140.595 84.7586C140.824 84.5297 140.938 84.4152 141.074 84.3443C141.194 84.2816 141.325 84.2439 141.46 84.2335C141.613 84.2217 141.77 84.2581 142.086 84.3309L149.545 86.0522C149.855 86.1238 150.01 86.1595 150.16 86.1489C150.304 86.1386 150.445 86.0971 150.571 86.0272C150.703 85.9548 150.813 85.8405 151.035 85.612L153.745 82.8127Z" stroke="#E84C88" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M149.5 86L145 85L141.5 84L139 87L146.5 90L142.5 93.5H139.5L138.5 95.5L142 98.5L143.5 100.5L145 102L146.5 100.5L147 96.5L150.5 94L153 101L155.5 99.5L156 98L154.5 91.5V89L157.5 86V83.5L156 82L154 83L151.5 85.5L149.5 86Z" fill="#E84C88"/>
</g>
<g filter="url(#filter29_d_652_5215)">
<rect x="176" y="120" width="56" height="56" rx="12" fill="#F6F6F6" shape-rendering="crispEdges"/>
<path d="M201 142V146.501C201 147.052 201 147.328 200.931 147.583C200.87 147.809 200.77 148.023 200.636 148.214C200.483 148.43 200.272 148.607 199.849 148.96L196.151 152.04C195.728 152.393 195.517 152.57 195.364 152.786C195.23 152.977 195.13 153.191 195.069 153.417C195 153.672 195 153.948 195 154.499V154.8C195 155.92 195 156.48 195.218 156.908C195.41 157.284 195.716 157.59 196.092 157.782C196.52 158 197.08 158 198.2 158H209.8C210.92 158 211.48 158 211.908 157.782C212.284 157.59 212.59 157.284 212.782 156.908C213 156.48 213 155.92 213 154.8V154.499C213 153.948 213 153.672 212.931 153.417C212.87 153.191 212.77 152.977 212.636 152.786C212.483 152.57 212.272 152.393 211.849 152.04L208.151 148.96C207.728 148.607 207.517 148.43 207.364 148.214C207.23 148.023 207.13 147.809 207.069 147.583C207 147.328 207 147.052 207 146.501V142M200.3 142H207.7C207.98 142 208.12 142 208.227 141.946C208.321 141.898 208.398 141.821 208.446 141.727C208.5 141.62 208.5 141.48 208.5 141.2V138.8C208.5 138.52 208.5 138.38 208.446 138.273C208.398 138.179 208.321 138.102 208.227 138.054C208.12 138 207.98 138 207.7 138H200.3C200.02 138 199.88 138 199.773 138.054C199.679 138.102 199.602 138.179 199.554 138.273C199.5 138.38 199.5 138.52 199.5 138.8V141.2C199.5 141.48 199.5 141.62 199.554 141.727C199.602 141.821 199.679 141.898 199.773 141.946C199.88 142 200.02 142 200.3 142ZM197.5 153H210.5C210.965 153 211.197 153 211.39 153.038C212.184 153.196 212.804 153.816 212.962 154.61C213 154.803 213 155.035 213 155.5C213 155.965 213 156.197 212.962 156.39C212.804 157.184 212.184 157.804 211.39 157.962C211.197 158 210.965 158 210.5 158H197.5C197.035 158 196.803 158 196.61 157.962C195.816 157.804 195.196 157.184 195.038 156.39C195 156.197 195 155.965 195 155.5C195 155.035 195 154.803 195.038 154.61C195.196 153.816 195.816 153.196 196.61 153.038C196.803 153 197.035 153 197.5 153Z" stroke="#E84C88" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M199.423 139L200 138H208.938L208 141.5H199.423V139Z" fill="#E84C88"/>
<path d="M207 147.5V142.5H201L200.5 148.5L197 151L195 154L195.5 157.5L211.941 158L213 156L212.5 152.5L207 147.5Z" fill="#E84C88"/>
</g>
<rect width="352" height="408" fill="url(#paint0_radial_652_5215)"/>
</g>
<defs>
<filter id="filter0_d_652_5215" x="-8" y="48" width="88" height="88" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
<feFlood flood-opacity="0" result="BackgroundImageFix"/>
<feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
<feOffset/>
<feGaussianBlur stdDeviation="8"/>
<feComposite in2="hardAlpha" operator="out"/>
<feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.1 0"/>
<feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_652_5215"/>
<feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_652_5215" result="shape"/>
</filter>
<filter id="filter1_d_652_5215" x="-8" y="104" width="88" height="88" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
<feFlood flood-opacity="0" result="BackgroundImageFix"/>
<feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
<feOffset/>
<feGaussianBlur stdDeviation="8"/>
<feComposite in2="hardAlpha" operator="out"/>
<feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.1 0"/>
<feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_652_5215"/>
<feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_652_5215" result="shape"/>
</filter>
<filter id="filter2_d_652_5215" x="-8" y="160" width="88" height="88" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
<feFlood flood-opacity="0" result="BackgroundImageFix"/>
<feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
<feOffset/>
<feGaussianBlur stdDeviation="8"/>
<feComposite in2="hardAlpha" operator="out"/>
<feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.1 0"/>
<feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_652_5215"/>
<feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_652_5215" result="shape"/>
</filter>
<filter id="filter3_d_652_5215" x="-8" y="216" width="88" height="88" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
<feFlood flood-opacity="0" result="BackgroundImageFix"/>
<feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
<feOffset/>
<feGaussianBlur stdDeviation="8"/>
<feComposite in2="hardAlpha" operator="out"/>
<feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.1 0"/>
<feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_652_5215"/>
<feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_652_5215" result="shape"/>
</filter>
<filter id="filter4_d_652_5215" x="-8" y="272" width="88" height="88" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
<feFlood flood-opacity="0" result="BackgroundImageFix"/>
<feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
<feOffset/>
<feGaussianBlur stdDeviation="8"/>
<feComposite in2="hardAlpha" operator="out"/>
<feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.1 0"/>
<feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_652_5215"/>
<feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_652_5215" result="shape"/>
</filter>
<filter id="filter5_d_652_5215" x="48" y="48" width="88" height="88" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
<feFlood flood-opacity="0" result="BackgroundImageFix"/>
<feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
<feOffset/>
<feGaussianBlur stdDeviation="8"/>
<feComposite in2="hardAlpha" operator="out"/>
<feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.1 0"/>
<feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_652_5215"/>
<feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_652_5215" result="shape"/>
</filter>
<filter id="filter6_d_652_5215" x="48" y="104" width="88" height="88" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
<feFlood flood-opacity="0" result="BackgroundImageFix"/>
<feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
<feOffset/>
<feGaussianBlur stdDeviation="8"/>
<feComposite in2="hardAlpha" operator="out"/>
<feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.1 0"/>
<feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_652_5215"/>
<feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_652_5215" result="shape"/>
</filter>
<filter id="filter7_d_652_5215" x="48" y="160" width="88" height="88" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
<feFlood flood-opacity="0" result="BackgroundImageFix"/>
<feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
<feOffset/>
<feGaussianBlur stdDeviation="8"/>
<feComposite in2="hardAlpha" operator="out"/>
<feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.1 0"/>
<feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_652_5215"/>
<feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_652_5215" result="shape"/>
</filter>
<filter id="filter8_d_652_5215" x="48" y="272" width="88" height="88" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
<feFlood flood-opacity="0" result="BackgroundImageFix"/>
<feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
<feOffset/>
<feGaussianBlur stdDeviation="8"/>
<feComposite in2="hardAlpha" operator="out"/>
<feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.1 0"/>
<feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_652_5215"/>
<feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_652_5215" result="shape"/>
</filter>
<filter id="filter9_d_652_5215" x="48" y="216" width="88" height="88" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
<feFlood flood-opacity="0" result="BackgroundImageFix"/>
<feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
<feOffset/>
<feGaussianBlur stdDeviation="8"/>
<feComposite in2="hardAlpha" operator="out"/>
<feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.1 0"/>
<feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_652_5215"/>
<feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_652_5215" result="shape"/>
</filter>
<filter id="filter10_d_652_5215" x="104" y="104" width="88" height="88" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
<feFlood flood-opacity="0" result="BackgroundImageFix"/>
<feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
<feOffset/>
<feGaussianBlur stdDeviation="8"/>
<feComposite in2="hardAlpha" operator="out"/>
<feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.1 0"/>
<feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_652_5215"/>
<feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_652_5215" result="shape"/>
</filter>
<filter id="filter11_d_652_5215" x="104" y="160" width="88" height="88" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
<feFlood flood-opacity="0" result="BackgroundImageFix"/>
<feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
<feOffset/>
<feGaussianBlur stdDeviation="8"/>
<feComposite in2="hardAlpha" operator="out"/>
<feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.1 0"/>
<feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_652_5215"/>
<feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_652_5215" result="shape"/>
</filter>
<filter id="filter12_d_652_5215" x="104" y="216" width="88" height="88" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
<feFlood flood-opacity="0" result="BackgroundImageFix"/>
<feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
<feOffset/>
<feGaussianBlur stdDeviation="8"/>
<feComposite in2="hardAlpha" operator="out"/>
<feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.1 0"/>
<feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_652_5215"/>
<feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_652_5215" result="shape"/>
</filter>
<filter id="filter13_d_652_5215" x="104" y="272" width="88" height="88" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
<feFlood flood-opacity="0" result="BackgroundImageFix"/>
<feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
<feOffset/>
<feGaussianBlur stdDeviation="8"/>
<feComposite in2="hardAlpha" operator="out"/>
<feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.1 0"/>
<feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_652_5215"/>
<feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_652_5215" result="shape"/>
</filter>
<filter id="filter14_d_652_5215" x="160" y="272" width="88" height="88" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
<feFlood flood-opacity="0" result="BackgroundImageFix"/>
<feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
<feOffset/>
<feGaussianBlur stdDeviation="8"/>
<feComposite in2="hardAlpha" operator="out"/>
<feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.1 0"/>
<feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_652_5215"/>
<feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_652_5215" result="shape"/>
</filter>
<filter id="filter15_d_652_5215" x="160" y="48" width="88" height="88" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
<feFlood flood-opacity="0" result="BackgroundImageFix"/>
<feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
<feOffset/>
<feGaussianBlur stdDeviation="8"/>
<feComposite in2="hardAlpha" operator="out"/>
<feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.1 0"/>
<feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_652_5215"/>
<feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_652_5215" result="shape"/>
</filter>
<filter id="filter16_d_652_5215" x="160" y="160" width="88" height="88" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
<feFlood flood-opacity="0" result="BackgroundImageFix"/>
<feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
<feOffset/>
<feGaussianBlur stdDeviation="8"/>
<feComposite in2="hardAlpha" operator="out"/>
<feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.1 0"/>
<feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_652_5215"/>
<feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_652_5215" result="shape"/>
</filter>
<filter id="filter17_d_652_5215" x="160" y="216" width="88" height="88" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
<feFlood flood-opacity="0" result="BackgroundImageFix"/>
<feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
<feOffset/>
<feGaussianBlur stdDeviation="8"/>
<feComposite in2="hardAlpha" operator="out"/>
<feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.1 0"/>
<feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_652_5215"/>
<feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_652_5215" result="shape"/>
</filter>
<filter id="filter18_d_652_5215" x="216" y="48" width="88" height="88" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
<feFlood flood-opacity="0" result="BackgroundImageFix"/>
<feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
<feOffset/>
<feGaussianBlur stdDeviation="8"/>
<feComposite in2="hardAlpha" operator="out"/>
<feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.1 0"/>
<feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_652_5215"/>
<feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_652_5215" result="shape"/>
</filter>
<filter id="filter19_d_652_5215" x="216" y="104" width="88" height="88" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
<feFlood flood-opacity="0" result="BackgroundImageFix"/>
<feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
<feOffset/>
<feGaussianBlur stdDeviation="8"/>
<feComposite in2="hardAlpha" operator="out"/>
<feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.1 0"/>
<feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_652_5215"/>
<feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_652_5215" result="shape"/>
</filter>
<filter id="filter20_d_652_5215" x="216" y="160" width="88" height="88" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
<feFlood flood-opacity="0" result="BackgroundImageFix"/>
<feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
<feOffset/>
<feGaussianBlur stdDeviation="8"/>
<feComposite in2="hardAlpha" operator="out"/>
<feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.1 0"/>
<feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_652_5215"/>
<feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_652_5215" result="shape"/>
</filter>
<filter id="filter21_d_652_5215" x="216" y="216" width="88" height="88" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
<feFlood flood-opacity="0" result="BackgroundImageFix"/>
<feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
<feOffset/>
<feGaussianBlur stdDeviation="8"/>
<feComposite in2="hardAlpha" operator="out"/>
<feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.1 0"/>
<feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_652_5215"/>
<feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_652_5215" result="shape"/>
</filter>
<filter id="filter22_d_652_5215" x="216" y="272" width="88" height="88" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
<feFlood flood-opacity="0" result="BackgroundImageFix"/>
<feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
<feOffset/>
<feGaussianBlur stdDeviation="8"/>
<feComposite in2="hardAlpha" operator="out"/>
<feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.1 0"/>
<feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_652_5215"/>
<feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_652_5215" result="shape"/>
</filter>
<filter id="filter23_d_652_5215" x="272" y="48" width="88" height="88" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
<feFlood flood-opacity="0" result="BackgroundImageFix"/>
<feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
<feOffset/>
<feGaussianBlur stdDeviation="8"/>
<feComposite in2="hardAlpha" operator="out"/>
<feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.1 0"/>
<feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_652_5215"/>
<feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_652_5215" result="shape"/>
</filter>
<filter id="filter24_d_652_5215" x="272" y="104" width="88" height="88" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
<feFlood flood-opacity="0" result="BackgroundImageFix"/>
<feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
<feOffset/>
<feGaussianBlur stdDeviation="8"/>
<feComposite in2="hardAlpha" operator="out"/>
<feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.1 0"/>
<feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_652_5215"/>
<feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_652_5215" result="shape"/>
</filter>
<filter id="filter25_d_652_5215" x="272" y="160" width="88" height="88" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
<feFlood flood-opacity="0" result="BackgroundImageFix"/>
<feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
<feOffset/>
<feGaussianBlur stdDeviation="8"/>
<feComposite in2="hardAlpha" operator="out"/>
<feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.1 0"/>
<feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_652_5215"/>
<feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_652_5215" result="shape"/>
</filter>
<filter id="filter26_d_652_5215" x="272" y="216" width="88" height="88" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
<feFlood flood-opacity="0" result="BackgroundImageFix"/>
<feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
<feOffset/>
<feGaussianBlur stdDeviation="8"/>
<feComposite in2="hardAlpha" operator="out"/>
<feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.1 0"/>
<feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_652_5215"/>
<feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_652_5215" result="shape"/>
</filter>
<filter id="filter27_d_652_5215" x="272" y="272" width="88" height="88" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
<feFlood flood-opacity="0" result="BackgroundImageFix"/>
<feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
<feOffset/>
<feGaussianBlur stdDeviation="8"/>
<feComposite in2="hardAlpha" operator="out"/>
<feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.1 0"/>
<feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_652_5215"/>
<feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_652_5215" result="shape"/>
</filter>
<filter id="filter28_d_652_5215" x="104" y="48" width="88" height="88" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
<feFlood flood-opacity="0" result="BackgroundImageFix"/>
<feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
<feOffset/>
<feGaussianBlur stdDeviation="8"/>
<feComposite in2="hardAlpha" operator="out"/>
<feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.1 0"/>
<feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_652_5215"/>
<feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_652_5215" result="shape"/>
</filter>
<filter id="filter29_d_652_5215" x="160" y="104" width="88" height="88" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
<feFlood flood-opacity="0" result="BackgroundImageFix"/>
<feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
<feOffset/>
<feGaussianBlur stdDeviation="8"/>
<feComposite in2="hardAlpha" operator="out"/>
<feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.1 0"/>
<feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_652_5215"/>
<feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_652_5215" result="shape"/>
</filter>
<radialGradient id="paint0_radial_652_5215" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(176 204) rotate(90) scale(204 176)">
<stop offset="0.679584" stop-color="#F6F6F6" stop-opacity="0"/>
<stop offset="1" stop-color="#F6F6F6"/>
</radialGradient>
<clipPath id="clip0_652_5215">
<rect width="352" height="408" rx="24" fill="white"/>
</clipPath>
</defs>
</svg>`)
        },
        
        {
            title: "Playful icons",
            description: "Friendly, chunky silhouettes inspired by hand-drawn curves—great for marketing and onboarding.",
            image: (`
                <svg xmlns="http://www.w3.org/2000/svg" width="352" height="408" viewBox="0 0 352 408" fill="none">
<g clip-path="url(#clip0_652_5288)">
<rect width="352" height="408" rx="24" fill="#F6F6F6"/>
<circle cx="176" cy="54" r="150" fill="url(#paint0_linear_652_5288)" fill-opacity="0.6"/>
<circle cx="176" cy="354" r="150" fill="url(#paint1_linear_652_5288)" fill-opacity="0.6"/>
<g filter="url(#filter0_d_652_5288)">
<rect x="148" y="176" width="56" height="56" rx="12" fill="white" shape-rendering="crispEdges"/>
<path d="M183.24 197.58H182.84L179.46 194.2C179.19 193.93 178.75 193.93 178.47 194.2C178.2 194.47 178.2 194.91 178.47 195.19L180.86 197.58H171.14L173.53 195.19C173.8 194.92 173.8 194.48 173.53 194.2C173.26 193.93 172.82 193.93 172.54 194.2L169.17 197.58H168.77C167.87 197.58 166 197.58 166 200.14C166 201.11 166.2 201.75 166.62 202.17C166.86 202.42 167.15 202.55 167.46 202.62C167.75 202.69 168.06 202.7 168.36 202.7H183.64C183.95 202.7 184.24 202.68 184.52 202.62C185.36 202.42 186 201.82 186 200.14C186 197.58 184.13 197.58 183.24 197.58Z" fill="#E84C88"/>
<path d="M183.05 204H168.87C168.25 204 167.78 204.55 167.88 205.16L168.72 210.3C169 212.02 169.75 214 173.08 214H178.69C182.06 214 182.66 212.31 183.02 210.42L184.03 205.19C184.15 204.57 183.68 204 183.05 204ZM174.61 210.45C174.61 210.84 174.3 211.15 173.92 211.15C173.53 211.15 173.22 210.84 173.22 210.45V207.15C173.22 206.77 173.53 206.45 173.92 206.45C174.3 206.45 174.61 206.77 174.61 207.15V210.45ZM178.89 210.45C178.89 210.84 178.58 211.15 178.19 211.15C177.81 211.15 177.49 210.84 177.49 210.45V207.15C177.49 206.77 177.81 206.45 178.19 206.45C178.58 206.45 178.89 206.77 178.89 207.15V210.45Z" fill="#E84C88"/>
</g>
<g opacity="0.4">
<rect x="152" y="80" width="48" height="48" rx="10" fill="white"/>
<path d="M180 100.75C179.59 100.75 179.25 100.41 179.25 100V96.5C179.25 95.42 178.58 94.75 177.5 94.75H174.5C173.42 94.75 172.75 95.42 172.75 96.5V100C172.75 100.41 172.41 100.75 172 100.75C171.59 100.75 171.25 100.41 171.25 100V96.5C171.25 94.59 172.59 93.25 174.5 93.25H177.5C179.41 93.25 180.75 94.59 180.75 96.5V100C180.75 100.41 180.41 100.75 180 100.75Z" fill="#B7B7B7"/>
<path d="M172 109.78C171.59 109.78 171.25 109.44 171.25 109.03C171.25 108.61 171.59 108.28 172 108.28H183.76C184.06 108.28 184.29 108.02 184.26 107.72L183.58 102.03C183.34 100.09 183 98.5 179.6 98.5H172.4C169 98.5 168.66 100.09 168.43 102.03L167.53 109.53C167.24 111.99 168 114 171.51 114H180.49C183.65 114 184.58 112.37 184.53 110.25C184.52 109.98 184.3 109.78 184.03 109.78H172Z" fill="#B7B7B7"/>
</g>
<g opacity="0.4">
<rect x="152" y="280" width="48" height="48" rx="10" fill="white"/>
<path d="M183.96 300.96C183.29 300.22 182.28 299.79 180.88 299.64V298.88C180.88 297.51 180.3 296.19 179.28 295.27C178.25 294.33 176.91 293.89 175.52 294.02C173.13 294.25 171.12 296.56 171.12 299.06V299.64C169.72 299.79 168.71 300.22 168.04 300.96C167.07 302.04 167.1 303.48 167.21 304.48L167.91 310.05C168.12 312 168.91 314 173.21 314H178.79C183.09 314 183.88 312 184.09 310.06L184.79 304.47C184.9 303.48 184.93 302.04 183.96 300.96ZM175.66 295.41C176.66 295.32 177.61 295.63 178.35 296.3C179.08 296.96 179.49 297.9 179.49 298.88V299.58H172.51V299.06C172.51 297.28 173.98 295.57 175.66 295.41ZM176 310.58C173.91 310.58 172.21 308.88 172.21 306.79C172.21 304.7 173.91 303 176 303C178.09 303 179.79 304.7 179.79 306.79C179.79 308.88 178.09 310.58 176 310.58Z" fill="#B7B7B7"/>
<path d="M175 308.58C174.75 308.58 174.5 308.45 174.36 308.22C174.15 307.87 174.26 307.4 174.62 307.19L175.51 306.66V305.58C175.51 305.17 175.85 304.83 176.26 304.83C176.67 304.83 177 305.16 177 305.58V307.08C177 307.34 176.86 307.59 176.64 307.72L175.39 308.47C175.27 308.54 175.13 308.58 175 308.58Z" fill="#B7B7B7"/>
</g>
<g opacity="0.4">
<rect x="252" y="180" width="48" height="48" rx="10" fill="white"/>
<path d="M283.96 200.96C283.29 200.22 282.28 199.79 280.88 199.64V198.88C280.88 197.51 280.3 196.19 279.28 195.27C278.25 194.33 276.91 193.89 275.52 194.02C273.13 194.25 271.12 196.56 271.12 199.06V199.64C269.72 199.79 268.71 200.22 268.04 200.96C267.07 202.04 267.1 203.48 267.21 204.48L267.91 210.05C268.12 212 268.91 214 273.21 214H278.79C283.09 214 283.88 212 284.09 210.06L284.79 204.47C284.9 203.48 284.93 202.04 283.96 200.96ZM275.66 195.41C276.66 195.32 277.61 195.63 278.35 196.3C279.08 196.96 279.49 197.9 279.49 198.88V199.58H272.51V199.06C272.51 197.28 273.98 195.57 275.66 195.41ZM276 210.58C273.91 210.58 272.21 208.88 272.21 206.79C272.21 204.7 273.91 203 276 203C278.09 203 279.79 204.7 279.79 206.79C279.79 208.88 278.09 210.58 276 210.58Z" fill="#B7B7B7"/>
<path d="M277.6 207.31L277.07 206.78L277.57 206.28C277.86 205.99 277.86 205.51 277.57 205.22C277.28 204.93 276.8 204.93 276.51 205.22L276.01 205.72L275.48 205.19C275.19 204.9 274.71 204.9 274.42 205.19C274.13 205.48 274.13 205.96 274.42 206.25L274.95 206.78L274.4 207.33C274.11 207.62 274.11 208.1 274.4 208.39C274.55 208.54 274.74 208.61 274.93 208.61C275.12 208.61 275.31 208.54 275.46 208.39L276.01 207.84L276.54 208.37C276.69 208.52 276.88 208.59 277.07 208.59C277.26 208.59 277.45 208.52 277.6 208.37C277.89 208.08 277.89 207.61 277.6 207.31Z" fill="#B7B7B7"/>
</g>
<g opacity="0.4">
<rect x="232" y="100" width="48" height="48" rx="10" fill="white"/>
<path d="M263.96 120.96C263.29 120.22 262.28 119.79 260.88 119.64V118.88C260.88 117.51 260.3 116.19 259.28 115.27C258.25 114.33 256.91 113.89 255.52 114.02C253.13 114.25 251.12 116.56 251.12 119.06V119.64C249.72 119.79 248.71 120.22 248.04 120.96C247.07 122.04 247.1 123.48 247.21 124.48L247.91 130.05C248.12 132 248.91 134 253.21 134H258.79C263.09 134 263.88 132 264.09 130.06L264.79 124.47C264.9 123.48 264.92 122.04 263.96 120.96ZM255.66 115.41C256.66 115.32 257.61 115.63 258.35 116.3C259.08 116.96 259.49 117.9 259.49 118.88V119.58H252.51V119.06C252.51 117.28 253.98 115.57 255.66 115.41ZM252.42 125.15H252.41C251.86 125.15 251.41 124.7 251.41 124.15C251.41 123.6 251.86 123.15 252.41 123.15C252.97 123.15 253.42 123.6 253.42 124.15C253.42 124.7 252.97 125.15 252.42 125.15ZM259.42 125.15H259.41C258.86 125.15 258.41 124.7 258.41 124.15C258.41 123.6 258.86 123.15 259.41 123.15C259.97 123.15 260.42 123.6 260.42 124.15C260.42 124.7 259.97 125.15 259.42 125.15Z" fill="#B7B7B7"/>
</g>
<g opacity="0.4">
<rect x="72" y="100" width="48" height="48" rx="10" fill="white"/>
<path d="M103.24 117.58H102.84L99.46 114.2C99.19 113.93 98.75 113.93 98.47 114.2C98.2 114.47 98.2 114.91 98.47 115.19L100.86 117.58H91.14L93.53 115.19C93.8 114.92 93.8 114.48 93.53 114.2C93.26 113.93 92.82 113.93 92.54 114.2L89.17 117.58H88.77C87.87 117.58 86 117.58 86 120.14C86 121.11 86.2 121.75 86.62 122.17C86.86 122.42 87.15 122.55 87.46 122.62C87.75 122.69 88.06 122.7 88.36 122.7H103.64C103.95 122.7 104.24 122.68 104.52 122.62C105.36 122.42 106 121.82 106 120.14C106 117.58 104.13 117.58 103.24 117.58Z" fill="#B7B7B7"/>
<path d="M103.09 124H88.91C88.29 124 87.82 124.55 87.92 125.16L88.76 130.3C89.04 132.02 89.79 134 93.12 134H98.73C102.1 134 102.7 132.31 103.06 130.42L104.07 125.19C104.19 124.57 103.72 124 103.09 124ZM97.92 130.89C97.78 131.04 97.59 131.11 97.39 131.11C97.2 131.11 97.01 131.04 96.86 130.89L96.02 130.04L95.14 130.92C94.99 131.07 94.8 131.14 94.61 131.14C94.41 131.14 94.22 131.07 94.08 130.92C93.78 130.63 93.78 130.16 94.08 129.86L94.96 128.98L94.11 128.14C93.81 127.84 93.81 127.37 94.11 127.08C94.4 126.78 94.87 126.78 95.17 127.08L96.02 127.92L96.83 127.11C97.13 126.81 97.6 126.81 97.89 127.11C98.19 127.4 98.19 127.87 97.89 128.17L97.08 128.98L97.92 129.83C98.22 130.13 98.22 130.6 97.92 130.89Z" fill="#B7B7B7"/>
</g>
<g opacity="0.4">
<rect x="72" y="260" width="48" height="48" rx="10" fill="white"/>
<path d="M103.24 277.58H102.84L99.46 274.2C99.19 273.93 98.75 273.93 98.47 274.2C98.2 274.47 98.2 274.91 98.47 275.19L100.86 277.58H91.14L93.53 275.19C93.8 274.92 93.8 274.48 93.53 274.2C93.26 273.93 92.82 273.93 92.54 274.2L89.17 277.58H88.77C87.87 277.58 86 277.58 86 280.14C86 281.11 86.2 281.75 86.62 282.17C86.86 282.42 87.15 282.55 87.46 282.62C87.75 282.69 88.06 282.7 88.36 282.7H103.64C103.95 282.7 104.24 282.68 104.52 282.62C105.36 282.42 106 281.82 106 280.14C106 277.58 104.13 277.58 103.24 277.58Z" fill="#B7B7B7"/>
<path d="M103.09 284H88.91C88.29 284 87.82 284.55 87.92 285.16L88.76 290.3C89.04 292.02 89.79 294 93.12 294H98.73C102.1 294 102.7 292.31 103.06 290.42L104.07 285.19C104.19 284.57 103.72 284 103.09 284ZM98.88 288.05L95.63 291.05C95.49 291.18 95.31 291.25 95.12 291.25C94.93 291.25 94.74 291.18 94.59 291.03L93.09 289.53C92.8 289.24 92.8 288.76 93.09 288.47C93.39 288.18 93.86 288.18 94.16 288.47L95.15 289.46L97.87 286.95C98.17 286.67 98.65 286.69 98.93 286.99C99.21 287.3 99.19 287.77 98.88 288.05Z" fill="#B7B7B7"/>
</g>
<g opacity="0.4">
<rect x="232" y="260" width="48" height="48" rx="10" fill="white"/>
<path d="M263.96 280.96C263.29 280.22 262.28 279.79 260.88 279.64V278.88C260.88 277.51 260.3 276.19 259.28 275.27C258.25 274.33 256.91 273.89 255.52 274.02C253.13 274.25 251.12 276.56 251.12 279.06V279.64C249.72 279.79 248.71 280.22 248.04 280.96C247.07 282.04 247.1 283.48 247.21 284.48L247.91 290.05C248.12 292 248.91 294 253.21 294H258.79C263.09 294 263.88 292 264.09 290.06L264.79 284.47C264.9 283.48 264.93 282.04 263.96 280.96ZM255.66 275.41C256.66 275.32 257.61 275.63 258.35 276.3C259.08 276.96 259.49 277.9 259.49 278.88V279.58H252.51V279.06C252.51 277.28 253.98 275.57 255.66 275.41ZM256 290.58C253.91 290.58 252.21 288.88 252.21 286.79C252.21 284.7 253.91 283 256 283C258.09 283 259.79 284.7 259.79 286.79C259.79 288.88 258.09 290.58 256 290.58Z" fill="#B7B7B7"/>
<path d="M255.43 288.64C255.24 288.64 255.05 288.57 254.9 288.42L253.91 287.43C253.62 287.14 253.62 286.66 253.91 286.37C254.2 286.08 254.68 286.08 254.97 286.37L255.45 286.85L257.05 285.37C257.35 285.09 257.83 285.11 258.11 285.41C258.39 285.71 258.37 286.19 258.07 286.47L255.94 288.44C255.79 288.57 255.61 288.64 255.43 288.64Z" fill="#B7B7B7"/>
</g>
<g opacity="0.4">
<rect x="52" y="180" width="48" height="48" rx="10" fill="white"/>
<path d="M83.24 197.58H82.84L79.46 194.2C79.19 193.93 78.75 193.93 78.47 194.2C78.2 194.47 78.2 194.91 78.47 195.19L80.86 197.58H71.14L73.53 195.19C73.8 194.92 73.8 194.48 73.53 194.2C73.26 193.93 72.82 193.93 72.54 194.2L69.17 197.58H68.77C67.87 197.58 66 197.58 66 200.14C66 201.11 66.2 201.75 66.62 202.17C66.86 202.42 67.15 202.55 67.46 202.62C67.75 202.69 68.06 202.7 68.36 202.7H83.64C83.95 202.7 84.24 202.68 84.52 202.62C85.36 202.42 86 201.82 86 200.14C86 197.58 84.13 197.58 83.24 197.58Z" fill="#B7B7B7"/>
<path d="M83.05 204H68.87C68.25 204 67.78 204.55 67.88 205.16L68.72 210.3C69 212.02 69.75 214 73.08 214H78.69C82.06 214 82.66 212.31 83.02 210.42L84.03 205.19C84.15 204.57 83.68 204 83.05 204ZM76 211.5C73.66 211.5 71.75 209.59 71.75 207.25C71.75 206.84 72.09 206.5 72.5 206.5C72.91 206.5 73.25 206.84 73.25 207.25C73.25 208.77 74.48 210 76 210C77.52 210 78.75 208.77 78.75 207.25C78.75 206.84 79.09 206.5 79.5 206.5C79.91 206.5 80.25 206.84 80.25 207.25C80.25 209.59 78.34 211.5 76 211.5Z" fill="#B7B7B7"/>
</g>
<rect width="352" height="408" fill="url(#paint2_radial_652_5288)"/>
</g>
<defs>
<filter id="filter0_d_652_5288" x="132" y="160" width="88" height="88" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
<feFlood flood-opacity="0" result="BackgroundImageFix"/>
<feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
<feOffset/>
<feGaussianBlur stdDeviation="8"/>
<feComposite in2="hardAlpha" operator="out"/>
<feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.1 0"/>
<feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_652_5288"/>
<feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_652_5288" result="shape"/>
</filter>
<linearGradient id="paint0_linear_652_5288" x1="176" y1="127" x2="176" y2="204" gradientUnits="userSpaceOnUse">
<stop stop-color="#F6F6F6"/>
<stop offset="1" stop-color="#ECECEC"/>
</linearGradient>
<linearGradient id="paint1_linear_652_5288" x1="176" y1="310.5" x2="176" y2="204" gradientUnits="userSpaceOnUse">
<stop stop-color="#F6F6F6"/>
<stop offset="1" stop-color="#ECECEC"/>
</linearGradient>
<radialGradient id="paint2_radial_652_5288" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(176 204) rotate(90) scale(204 176)">
<stop offset="0.679584" stop-color="#F6F6F6" stop-opacity="0"/>
<stop offset="1" stop-color="#F6F6F6"/>
</radialGradient>
<clipPath id="clip0_652_5288">
<rect width="352" height="408" rx="24" fill="white"/>
</clipPath>
</defs>
</svg>
                `)
        },
           
       
       
        {
            title: "30+ other styles",
            description: "Explore special collections for unique vibes and use cases.",
            image: (`
                <svg xmlns="http://www.w3.org/2000/svg" width="352" height="408" viewBox="0 0 352 408" fill="none">
<rect width="352" height="408" rx="24" fill="#F6F6F6"/>
<g filter="url(#filter0_d_652_5314)">
<rect x="24" y="40" width="304" height="48" rx="12" fill="white" shape-rendering="crispEdges"/>
<path d="M48 54C45.38 54 43.25 56.13 43.25 58.75C43.25 61.32 45.26 63.4 47.88 63.49C47.96 63.48 48.04 63.48 48.1 63.49C48.12 63.49 48.13 63.49 48.15 63.49C48.16 63.49 48.16 63.49 48.17 63.49C50.73 63.4 52.74 61.32 52.75 58.75C52.75 56.13 50.62 54 48 54Z" fill="#E84C88"/>
<path d="M53.08 66.1499C50.29 64.2899 45.74 64.2899 42.93 66.1499C41.66 66.9999 40.96 68.1499 40.96 69.3799C40.96 70.6099 41.66 71.7499 42.92 72.5899C44.32 73.5299 46.16 73.9999 48 73.9999C49.84 73.9999 51.68 73.5299 53.08 72.5899C54.34 71.7399 55.04 70.5999 55.04 69.3599C55.03 68.1299 54.34 66.9899 53.08 66.1499Z" fill="#E84C88"/>
<rect x="72" y="55" width="80" height="6" rx="3" fill="#F6F6F6"/>
<rect x="72" y="67" width="244" height="6" rx="3" fill="#F6F6F6"/>
</g>
<g filter="url(#filter1_d_652_5314)">
<rect x="24" y="96" width="304" height="48" rx="12" fill="white" shape-rendering="crispEdges"/>
<path d="M56.05 118.63L51.38 116.62L50.34 116.18C50.18 116.1 50.04 115.89 50.04 115.71V112.65C50.04 111.69 49.33 110.55 48.47 110.11C48.17 109.96 47.81 109.96 47.51 110.11C46.66 110.55 45.95 111.7 45.95 112.66V115.72C45.95 115.9 45.81 116.11 45.65 116.19L39.95 118.64C39.32 118.9 38.81 119.69 38.81 120.37V121.69C38.81 122.54 39.45 122.96 40.24 122.62L45.25 120.46C45.64 120.29 45.96 120.5 45.96 120.93V122.04V123.84C45.96 124.07 45.83 124.4 45.67 124.56L43.35 126.89C43.11 127.13 43 127.6 43.11 127.94L43.56 129.3C43.74 129.89 44.41 130.17 44.96 129.89L47.34 127.89C47.7 127.58 48.29 127.58 48.65 127.89L51.03 129.89C51.58 130.16 52.25 129.89 52.45 129.3L52.9 127.94C53.01 127.61 52.9 127.13 52.66 126.89L50.34 124.56C50.17 124.4 50.04 124.07 50.04 123.84V120.93C50.04 120.5 50.35 120.3 50.75 120.46L55.76 122.62C56.55 122.96 57.19 122.54 57.19 121.69V120.37C57.19 119.69 56.68 118.9 56.05 118.63Z" fill="#E84C88"/>
<rect x="72" y="111" width="80" height="6" rx="3" fill="#F6F6F6"/>
<rect x="72" y="123" width="244" height="6" rx="3" fill="#F6F6F6"/>
</g>
<g filter="url(#filter2_d_652_5314)">
<rect x="24" y="152" width="304" height="48" rx="12" fill="white" shape-rendering="crispEdges"/>
<path d="M57.53 179.93C57.37 179.66 56.92 179.24 55.8 179.44C55.18 179.55 54.55 179.6 53.92 179.57C51.59 179.47 49.48 178.4 48.01 176.75C46.71 175.3 45.91 173.41 45.9 171.37C45.9 170.23 46.12 169.13 46.57 168.09C47.01 167.08 46.7 166.55 46.48 166.33C46.25 166.1 45.71 165.78 44.65 166.22C40.56 167.94 38.03 172.04 38.33 176.43C38.63 180.56 41.53 184.09 45.37 185.42C46.29 185.74 47.26 185.93 48.26 185.97C48.42 185.98 48.58 185.99 48.74 185.99C52.09 185.99 55.23 184.41 57.21 181.72C57.88 180.79 57.7 180.2 57.53 179.93Z" fill="#E84C88"/>
<rect x="72" y="167" width="80" height="6" rx="3" fill="#F6F6F6"/>
<rect x="72" y="179" width="244" height="6" rx="3" fill="#F6F6F6"/>
</g>
<g filter="url(#filter3_d_652_5314)">
<rect x="24" y="208" width="304" height="48" rx="12" fill="white" shape-rendering="crispEdges"/>
<path d="M52.65 223.86H45.91V226.88C45.91 227.27 45.59 227.58 45.21 227.58C44.83 227.58 44.51 227.27 44.51 226.88V223.86H43.35C39.4 223.86 38.1 225.04 38.01 228.73C38 228.91 38.08 229.1 38.21 229.23C38.34 229.37 38.51 229.44 38.71 229.44C40.11 229.44 41.26 230.6 41.26 232C41.26 233.4 40.11 234.56 38.71 234.56C38.52 234.56 38.34 234.63 38.21 234.77C38.08 234.9 38 235.09 38.01 235.27C38.1 238.96 39.4 240.14 43.35 240.14H44.51V237.12C44.51 236.73 44.83 236.42 45.21 236.42C45.59 236.42 45.91 236.73 45.91 237.12V240.14H52.65C56.75 240.14 58 238.89 58 234.79V229.21C58 225.11 56.75 223.86 52.65 223.86ZM54.47 231.9L53.54 232.8C53.5 232.83 53.49 232.89 53.5 232.94L53.72 234.21C53.76 234.44 53.67 234.68 53.47 234.82C53.28 234.96 53.03 234.98 52.82 234.87L51.67 234.27C51.63 234.25 51.57 234.25 51.53 234.27L50.38 234.87C50.29 234.92 50.19 234.94 50.09 234.94C49.96 234.94 49.84 234.9 49.73 234.82C49.54 234.68 49.44 234.45 49.48 234.21L49.7 232.94C49.71 232.89 49.69 232.84 49.66 232.8L48.73 231.9C48.56 231.74 48.5 231.49 48.57 231.27C48.64 231.04 48.83 230.88 49.07 230.85L50.35 230.66C50.4 230.65 50.44 230.62 50.47 230.58L51.04 229.42C51.15 229.21 51.36 229.08 51.6 229.08C51.84 229.08 52.05 229.21 52.15 229.42L52.72 230.58C52.74 230.63 52.78 230.66 52.83 230.66L54.11 230.85C54.35 230.88 54.54 231.05 54.61 231.27C54.7 231.49 54.64 231.73 54.47 231.9Z" fill="#E84C88"/>
<rect x="72" y="223" width="80" height="6" rx="3" fill="#F6F6F6"/>
<rect x="72" y="235" width="244" height="6" rx="3" fill="#F6F6F6"/>
</g>
<g filter="url(#filter4_d_652_5314)">
<rect x="24" y="264" width="304" height="48" rx="12" fill="white" shape-rendering="crispEdges"/>
<path d="M56.89 281.18V292.48C56.89 294.46 55.28 296.07 53.3 296.07C51.33 296.07 49.71 294.46 49.71 292.48C49.71 290.51 51.33 288.9 53.3 288.9C54.14 288.9 54.89 289.19 55.5 289.67V283.72L46.29 286.34V294.41C46.29 296.39 44.67 298 42.7 298C40.72 298 39.11 296.39 39.11 294.41C39.11 292.44 40.72 290.83 42.7 290.83C43.53 290.83 44.28 291.12 44.89 291.59V282.75C44.89 281.28 45.78 280.14 47.19 279.76L52.97 278.18C54.14 277.86 55.13 277.97 55.83 278.51C56.54 279.04 56.89 279.94 56.89 281.18Z" fill="#E84C88"/>
<rect x="72" y="279" width="80" height="6" rx="3" fill="#F6F6F6"/>
<rect x="72" y="291" width="244" height="6" rx="3" fill="#F6F6F6"/>
</g>
<g filter="url(#filter5_d_652_5314)">
<rect x="24" y="320" width="304" height="48" rx="12" fill="white" shape-rendering="crispEdges"/>
<path d="M53.18 337.25C51.47 337.25 49.43 337.9 49.43 341V347C49.43 350.1 51.47 350.75 53.18 350.75C54.89 350.75 56.93 350.1 56.93 347V341C56.93 337.9 54.89 337.25 53.18 337.25Z" fill="#E84C88"/>
<path d="M42.82 337.25C41.11 337.25 39.07 337.9 39.07 341V347C39.07 350.1 41.11 350.75 42.82 350.75C44.53 350.75 46.57 350.1 46.57 347V341C46.57 337.9 44.53 337.25 42.82 337.25Z" fill="#E84C88"/>
<path d="M49.43 343.25H46.57V344.75H49.43V343.25Z" fill="#E84C88"/>
<path d="M58.5 347.25C58.09 347.25 57.75 346.91 57.75 346.5V341.5C57.75 341.09 58.09 340.75 58.5 340.75C58.91 340.75 59.25 341.09 59.25 341.5V346.5C59.25 346.91 58.91 347.25 58.5 347.25Z" fill="#E84C88"/>
<path d="M37.5 347.25C37.09 347.25 36.75 346.91 36.75 346.5V341.5C36.75 341.09 37.09 340.75 37.5 340.75C37.91 340.75 38.25 341.09 38.25 341.5V346.5C38.25 346.91 37.91 347.25 37.5 347.25Z" fill="#E84C88"/>
<rect x="72" y="335" width="80" height="6" rx="3" fill="#F6F6F6"/>
<rect x="72" y="347" width="244" height="6" rx="3" fill="#F6F6F6"/>
</g>
<defs>
<filter id="filter0_d_652_5314" x="12" y="28" width="328" height="72" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
<feFlood flood-opacity="0" result="BackgroundImageFix"/>
<feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
<feOffset/>
<feGaussianBlur stdDeviation="6"/>
<feComposite in2="hardAlpha" operator="out"/>
<feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.05 0"/>
<feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_652_5314"/>
<feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_652_5314" result="shape"/>
</filter>
<filter id="filter1_d_652_5314" x="12" y="84" width="328" height="72" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
<feFlood flood-opacity="0" result="BackgroundImageFix"/>
<feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
<feOffset/>
<feGaussianBlur stdDeviation="6"/>
<feComposite in2="hardAlpha" operator="out"/>
<feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.05 0"/>
<feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_652_5314"/>
<feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_652_5314" result="shape"/>
</filter>
<filter id="filter2_d_652_5314" x="12" y="140" width="328" height="72" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
<feFlood flood-opacity="0" result="BackgroundImageFix"/>
<feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
<feOffset/>
<feGaussianBlur stdDeviation="6"/>
<feComposite in2="hardAlpha" operator="out"/>
<feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.05 0"/>
<feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_652_5314"/>
<feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_652_5314" result="shape"/>
</filter>
<filter id="filter3_d_652_5314" x="12" y="196" width="328" height="72" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
<feFlood flood-opacity="0" result="BackgroundImageFix"/>
<feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
<feOffset/>
<feGaussianBlur stdDeviation="6"/>
<feComposite in2="hardAlpha" operator="out"/>
<feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.05 0"/>
<feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_652_5314"/>
<feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_652_5314" result="shape"/>
</filter>
<filter id="filter4_d_652_5314" x="12" y="252" width="328" height="72" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
<feFlood flood-opacity="0" result="BackgroundImageFix"/>
<feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
<feOffset/>
<feGaussianBlur stdDeviation="6"/>
<feComposite in2="hardAlpha" operator="out"/>
<feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.05 0"/>
<feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_652_5314"/>
<feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_652_5314" result="shape"/>
</filter>
<filter id="filter5_d_652_5314" x="12" y="308" width="328" height="72" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
<feFlood flood-opacity="0" result="BackgroundImageFix"/>
<feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
<feOffset/>
<feGaussianBlur stdDeviation="6"/>
<feComposite in2="hardAlpha" operator="out"/>
<feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.05 0"/>
<feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_652_5314"/>
<feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_652_5314" result="shape"/>
</filter>
</defs>
</svg>
                `)
        },

    ];

    return (
        <div ref={containerRef} className="flex flex-col justify-center items-center gap-[32px]">
            <div className="md:w-[568px] w-[100%] flex flex-col gap-[12px] justify-center items-center text-center">
                <h1 className="text-[#0e0e0e] text-[20px] md:text-[30px] font-bold leading-[32px] md:leading-[40px]">
                    Everything You Need to Design Smarter
                </h1>
                <p className="text-[#454545] text-[14px] md:text-[16px] font-normal leading-[20px] md:leading-[24px]">
                    From clean minimal sets to playful creative styles, everything is crafted to fit perfectly into websites, apps, and brand projects.
                </p>
            </div>

            <div className="grid gap-[36px] md:gap-[0px] grid-cols-1 md:grid-cols-3">
                {Cards.map((card, index) => (
                    <div
                        key={index}
                        className="flex flex-col gap-[16px] md:gap-[70px] md:px-[24px] px-[0px] pb-[0px] md:pb-[32px]"
                    >

                        <div
                            ref={(el) => { svgRefs.current[index] = el; }}
                            dangerouslySetInnerHTML={{ __html: card.image }}
                            className="w-[100%] 2xl:h-[408px] md:h-[350px] h-[408px] rounded-[24px] pointer-events-none"
                        />
                        <div className="flex flex-col justify-start items-start gap-[8px]">
                            <h1 className="text-[#0e0e0e] text-[20px] font-bold leading-[32px]">
                                {card.title}
                            </h1>
                            <p className="text-[#454545] text-[12px] font-normal leading-[20px]">
                                {card.description}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}