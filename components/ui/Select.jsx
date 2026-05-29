"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";
import { motion } from "framer-motion";

const Select = React.forwardRef(({
    className,
    label,
    error,
    helperText,
    disabled,
    id,
    children,
    ...props
}, ref) => {
    const generatedId = React.useId();
    const selectId = id || generatedId;

    return (
        <div className="flex flex-col space-y-1.5 w-full text-left">
            {label && (
                <label 
                    htmlFor={selectId} 
                    className={cn(
                        "text-xs font-semibold uppercase tracking-wider text-muted-foreground select-none transition-colors",
                        disabled && "opacity-50",
                        error && "text-destructive"
                    )}
                >
                    {label}
                </label>
            )}

            <div className="relative w-full">
                <select
                    ref={ref}
                    id={selectId}
                    disabled={disabled}
                    className={cn(
                        "flex h-11 w-full rounded-xl border border-white/5 bg-secondary/30 px-3.5 py-2 text-sm text-foreground appearance-none focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-40 transition-all duration-200 shadow-sm pr-10 cursor-pointer [&>option]:bg-[#1A1D2E] [&>option]:text-foreground",
                        error && "border-destructive/50 focus:border-destructive/80 focus:ring-destructive/20",
                        className
                    )}
                    {...props}
                >
                    {children}
                </select>

                {/* Custom premium dropdown chevron arrow */}
                <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground transition-transform duration-200">
                    <ChevronDown className="h-4 w-4" />
                </div>
            </div>

            {/* Error or Helper text */}
            {error ? (
                <motion.p
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-xs font-medium text-destructive"
                >
                    {error}
                </motion.p>
            ) : helperText ? (
                <p className="text-xs text-muted-foreground/60">{helperText}</p>
            ) : null}
        </div>
    );
});

Select.displayName = "Select";

export { Select };
