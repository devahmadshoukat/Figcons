"use client";
import { forwardRef } from 'react';

interface AnimationWrapperProps {
  children: React.ReactNode;
  className?: string;
}

const AnimationWrapper = forwardRef<HTMLDivElement, AnimationWrapperProps>(
  ({ children, className = "" }, ref) => {
    return (
      <div ref={ref} className={className}>
        {children}
      </div>
    );
  }
);

AnimationWrapper.displayName = "AnimationWrapper";

export default AnimationWrapper;
