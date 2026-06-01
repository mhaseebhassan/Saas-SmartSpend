"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

export type TooltipPosition = "top" | "bottom" | "left" | "right";

export interface TooltipProps {
    children: React.ReactNode;
    content: React.ReactNode;
    position?: TooltipPosition;
    className?: string;
    delay?: number;
}

const Tooltip: React.FC<TooltipProps> = ({
    children,
    content,
    position = "top",
    className,
    delay = 0.2,
}) => {
    const [isVisible, setIsVisible] = React.useState(false);
    const timeoutRef = React.useRef<NodeJS.Timeout | null>(null);
    const tooltipRef = React.useRef<HTMLDivElement>(null);
    
    const [horizontalShift, setHorizontalShift] = React.useState<number>(0);
    const [verticalShift, setVerticalShift] = React.useState<number>(0);

    const showTooltip = () => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        timeoutRef.current = setTimeout(() => {
            setIsVisible(true);
        }, delay * 1000);
    };

    const hideTooltip = () => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        setIsVisible(false);
    };

    React.useEffect(() => {
        return () => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
        };
    }, []);

    React.useEffect(() => {
        if (!isVisible || !tooltipRef.current) {
            setHorizontalShift(0);
            setVerticalShift(0);
            return;
        }

        const rect = tooltipRef.current.getBoundingClientRect();
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        const padding = 12; // safety margin from screen borders

        if (position === "top" || position === "bottom") {
            if (rect.left < padding) {
                setHorizontalShift(padding - rect.left);
            } else if (rect.right > viewportWidth - padding) {
                setHorizontalShift(viewportWidth - padding - rect.right);
            } else {
                setHorizontalShift(0);
            }
        } else if (position === "left" || position === "right") {
            if (rect.top < padding) {
                setVerticalShift(padding - rect.top);
            } else if (rect.bottom > viewportHeight - padding) {
                setVerticalShift(viewportHeight - padding - rect.bottom);
            } else {
                setVerticalShift(0);
            }
        }
    }, [isVisible, position]);

    const positionClasses: Record<TooltipPosition, string> = {
        top: "bottom-full left-1/2 mb-2.5 origin-bottom",
        bottom: "top-full left-1/2 mt-2.5 origin-top",
        left: "right-full top-1/2 mr-2.5 origin-right",
        right: "left-full top-1/2 ml-2.5 origin-left",
    };

    const arrowClasses: Record<TooltipPosition, string> = {
        top: "absolute bottom-[-4px] left-1/2 w-2 h-2 bg-[#1A2035] border-b border-r border-white/[0.08] shadow-[1px_1px_3px_rgba(6,182,212,0.15)]",
        bottom: "absolute top-[-4px] left-1/2 w-2 h-2 bg-[#1A2035] border-t border-l border-white/[0.08] shadow-[-1px_-1px_3px_rgba(6,182,212,0.15)]",
        left: "absolute right-[-4px] top-1/2 w-2 h-2 bg-[#1A2035] border-t border-r border-white/[0.08] shadow-[1px_-1px_3px_rgba(6,182,212,0.15)]",
        right: "absolute left-[-4px] top-1/2 w-2 h-2 bg-[#1A2035] border-b border-l border-white/[0.08] shadow-[-1px_1px_3px_rgba(6,182,212,0.15)]",
    };

    const tooltipStyle: React.CSSProperties = {};
    const arrowStyle: React.CSSProperties = {};

    if (position === "top" || position === "bottom") {
        tooltipStyle.transform = `translateX(calc(-50% + ${horizontalShift}px))`;
        arrowStyle.transform = `translateX(calc(-50% - ${horizontalShift}px)) rotate(45deg)`;
    } else {
        tooltipStyle.transform = `translateY(calc(-50% + ${verticalShift}px))`;
        arrowStyle.transform = `translateY(calc(-50% - ${verticalShift}px)) rotate(45deg)`;
    }

    const springTransition = { type: "spring" as const, stiffness: 400, damping: 25 };

    return (
        <div 
            className="relative inline-block w-fit"
            onMouseEnter={showTooltip}
            onMouseLeave={hideTooltip}
            onFocus={showTooltip}
            onBlur={hideTooltip}
        >
            {children}
            <AnimatePresence>
                {isVisible && content && (
                    <motion.div
                        ref={tooltipRef}
                        role="tooltip"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={springTransition}
                        style={tooltipStyle}
                        className={cn(
                            "absolute z-50 pointer-events-none px-3 py-1.5 rounded-lg border border-white/[0.08] bg-[#1A2035]/95 text-xs font-medium text-slate-200 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.5),0_0_20px_rgba(6,182,212,0.03)] backdrop-blur-md whitespace-normal max-w-[calc(100vw-32px)] sm:max-w-xs break-words",
                            positionClasses[position],
                            className
                        )}
                    >
                        {content}
                        <span className={arrowClasses[position]} style={arrowStyle} />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export { Tooltip };
export default Tooltip;
