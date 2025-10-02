"use client"

import React, { useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Register ScrollTrigger plugin
gsap.registerPlugin(ScrollTrigger); 

// Constants
const CLASSES = {
  CONTAINER: 'w-full border-t border-[#ececec]',
  DARK_SECTION: 'bg-[#0e0e0e]',
  DARK_BORDER: 'border-[#454545]',
  LIGHT_BORDER: 'border-[#ececec]',
  DARK_TEXT: 'text-white',
  SECTION_DIVIDER: 'border-r md:border-l md:border-[#454545] mx-auto 2xl:max-w-[74%] md:max-w-[calc(100%-240px)] w-full pt-[100px]',
  BOTTOM_DIVIDER: 'w-full border-b border-[#454545]',
  CONTENT_WRAPPER: '2xl:px-[13%] md:px-[120px] px-0',
  INNER_WRAPPER: 'md:border-l md:border-r h-full',
} as const;

interface GridBoxProps {
  children: React.ReactNode;
  classNameParent?: string;
  darkSections?: string[];
  [key: `classNameChild${number}`]: string | boolean | undefined;
}

export const GridBox = ({
  children,
  classNameParent = '',
  darkSections = [],
  ...props
}: GridBoxProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sectionRefs = useRef<(HTMLDivElement | null)[]>([]);
  const childrenArray = React.Children.toArray(children);
  const hasMultipleChildren = childrenArray.length > 1;

  // Initialize section refs array
  useEffect(() => {
    sectionRefs.current = sectionRefs.current.slice(0, childrenArray.length);
  }, [childrenArray.length]);

  // Set up GSAP animations for inner content only
  useEffect(() => {
    if (!containerRef.current) return;

    const sections = sectionRefs.current.filter(Boolean);
    
    // Create scroll-triggered animations for inner content only
    sections.forEach((section, index) => {
      if (!section) return;

      const innerContent = section.querySelector('.inner-content');
      if (!innerContent) return;

      // Set initial state for inner content
      gsap.set(innerContent, {
        opacity: 0,
      });

      gsap.to(innerContent, {
        opacity: 1,
        duration: 1.2,
        ease: "power3.out",
        scrollTrigger: {
          trigger: section,
          start: "top 90%",
          end: "bottom 10%",
          toggleActions: "play none none reverse",
        },
      });
    });

    // Cleanup function
    return () => {
      ScrollTrigger.getAll().forEach(trigger => {
        if (trigger.trigger && sections.includes(trigger.trigger as HTMLDivElement)) {
          trigger.kill();
        }
      });
    };
  }, [childrenArray.length]);

  const getChildProps = (index: number) => {
    const childProp = props[`classNameChild${index + 1}` as keyof typeof props];

    if (typeof childProp === 'boolean') {
      return { isSpecialDark: childProp, className: '' };
    }

    if (typeof childProp === 'string') {
      return { isSpecialDark: false, className: childProp };
    }

    return { isSpecialDark: false, className: '' };
  };

  const isDarkSection = (index: number) => {
    const sectionKey = `section${index + 1}`;
    return darkSections.includes(sectionKey);
  };

  const isSpecialDarkSection = (index: number) => {
    return getChildProps(index).isSpecialDark;
  };

  const isDark = (index: number) => {
    return isDarkSection(index) || isSpecialDarkSection(index);
  };

  const getContinuousGroups = () => {
    const groups: { start: number; end: number; isDark: boolean }[] = [];
    let currentGroup: { start: number; end: number; isDark: boolean } | null = null;

    childrenArray.forEach((_, index) => {
      const isCurrentDark = isDark(index);
      
      if (currentGroup === null) {
        // Start new group
        currentGroup = { start: index, end: index, isDark: isCurrentDark };
      } else if (currentGroup.isDark === isCurrentDark) {
        // Extend current group
        currentGroup.end = index;
      } else {
        // End current group and start new one
        groups.push(currentGroup);
        currentGroup = { start: index, end: index, isDark: isCurrentDark };
      }
    });

    // Add the last group
    if (currentGroup) {
      groups.push(currentGroup);
    }

    return groups;
  };

  const shouldAddTopDivider = (index: number) => {
    const groups = getContinuousGroups();
    const currentGroup = groups.find(group => index >= group.start && index <= group.end);
    
    if (!currentGroup || !currentGroup.isDark) return false;
    
    // Add divider at the start of a dark group
    return index === currentGroup.start;
  };

  const shouldAddBottomDivider = (index: number) => {
    const groups = getContinuousGroups();
    const currentGroup = groups.find(group => index >= group.start && index <= group.end);
    
    if (!currentGroup || !currentGroup.isDark) return false;
    
    // Add divider at the end of a dark group (but not if it's the last child)
    return index === currentGroup.end && index < childrenArray.length - 1;
  };

  const getSectionStyles = (index: number) => {
    const { isSpecialDark, className } = getChildProps(index);
    const isDarkSection = isDark(index);

    return {
      bgColor: isDarkSection ? CLASSES.DARK_SECTION : '',
      borderColor: isDarkSection ? CLASSES.DARK_BORDER : CLASSES.LIGHT_BORDER,
      textColor: isSpecialDark ? CLASSES.DARK_TEXT : '',
      childClassName: className,
    };
  };

  const renderSectionDivider = () => (
    <>
      <div className={CLASSES.SECTION_DIVIDER} />
      <div className={CLASSES.BOTTOM_DIVIDER} />
    </>
  );

  return (
    <div ref={containerRef} className={CLASSES.CONTAINER}>
      {React.Children.map(children, (child, index) => {
        const isLastChild = index === childrenArray.length - 1;
        const shouldAddBorder = hasMultipleChildren && !isLastChild;
        const isCurrentDark = isDark(index);
        const styles = getSectionStyles(index);

        return (
          <div 
            key={index} 
            ref={(el) => {
              sectionRefs.current[index] = el;
            }}
            className={styles.bgColor}
          >
            {shouldAddTopDivider(index) && renderSectionDivider()}

            <div className={CLASSES.CONTENT_WRAPPER}>
              <div className={`${CLASSES.INNER_WRAPPER} ${styles.borderColor} ${classNameParent}`}>
                <div className={`inner-content ${styles.childClassName} ${styles.textColor}`}>
                  {child}
                </div>
              </div>
            </div>

            {shouldAddBottomDivider(index) && (
              <>
                <div className={CLASSES.BOTTOM_DIVIDER} />
                <div className={CLASSES.SECTION_DIVIDER} />
              </>
            )}

            {shouldAddBorder && (
              <div className={`w-full border-b ${styles.borderColor}`} />
            )}
          </div>
        );
      })}
    </div>
  );
};