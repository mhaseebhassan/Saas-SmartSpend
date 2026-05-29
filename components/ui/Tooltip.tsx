"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

const Tooltip = ({
    children,
    content,
    position = "top",
    className,
    delay = 0.2,
}) => {
    const [isVisible, setIsVisible] = React.useState(false);
    const timeoutRef = React.useRef(null);

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

    const positionClasses = {
        top: "bottom-full left-1/2 -translate-x-1/2 mb-2 origin-bottom",
        bottom: "top-full left-1/2 -translate-x-1/2 mt-2 origin-top",
        left: "right-full top-1/2 -translate-y-1/2 mr-2 origin-right",
        right: "left-full top-1/2 -translate-y-1/2 ml-2 origin-left",
    };

    const arrowClasses = {
        top: "absolute top-full left-1/2 -translate-x-1/2 border-t-popover border-x-transparent border-b-transparent border-4",
        bottom: "absolute bottom-full left-1/2 -translate-x-1/2 border-b-popover border-x-transparent border-t-transparent border-4",
        left: "absolute left-full top-1/2 -translate-y-1/2 border-l-popover border-y-transparent border-r-transparent border-4",
        right: "absolute right-full top-1/2 -translate-y-1/2 border-r-popover border-y-transparent border-l-transparent border-4",
    };

    const floatAnimation = {
        initial: { opacity: 0, scale: 0.95 },
        animate: { opacity: 1, scale: 1 },
        exit: { opacity: 0, scale: 0.95 },
        transition: { type: "spring", stiffness: 500, damping: 25 }
    };

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
                        role="tooltip"
                        {...floatAnimation}
                        className={cn(
                            "absolute z-50 pointer-events-none px-2.5 py-1.5 rounded-lg border border-white/5 bg-popover text-xs font-medium text-muted-foreground shadow-2xl backdrop-blur-md whitespace-nowrap",
                            positionClasses[position],
                            className
                        )}
                    >
                        {content}
                        <span className={arrowClasses[position]} />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export { Tooltip };
