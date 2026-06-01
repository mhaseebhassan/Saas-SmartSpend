"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";
import { motion } from "framer-motion";

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
    label?: string;
    error?: string;
    helperText?: string;
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(({
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
                        "text-xs font-semibold uppercase tracking-wider text-slate-300 select-none transition-colors",
                        disabled && "opacity-50",
                        error && "text-destructive"
                    )}
                >
                    {label}
                </label>
            )}

            <div className="relative w-full z-0">
                <select
                    ref={ref}
                    id={selectId}
                    disabled={disabled}
                    className={cn(
                        "flex h-11 w-full rounded-xl border border-white/[0.08] bg-[#0A0E1A]/80 px-3.5 py-2 text-sm text-foreground appearance-none focus:outline-none focus:border-cyan-400/50 focus:ring-2 focus:ring-cyan-400/10 disabled:cursor-not-allowed disabled:opacity-40 transition-all duration-200 shadow-sm cursor-pointer [&>option]:bg-[#1A1D2E] [&>option]:text-foreground peer",
                        error && "border-destructive/50 focus:border-destructive/80 focus:ring-destructive/20",
                        className,
                        "pr-12"
                    )}
                    {...props}
                >
                    {children}
                </select>

                {/* Custom premium dropdown chevron arrow */}
                <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-cyan-400 transition-transform duration-200">
                    <ChevronDown className="h-4 w-4" />
                </div>

                {/* Custom Glow Ring transition overlay with scaling */}
                <div 
                    className={cn(
                        "absolute inset-0 rounded-xl pointer-events-none border border-transparent peer-focus:scale-[1.02] transition-all duration-300 -z-10",
                        error ? "peer-focus:border-destructive/30 peer-focus:shadow-[0_0_15px_rgba(239,68,68,0.1)]" : "peer-focus:border-cyan-400/30 peer-focus:shadow-[0_0_15px_rgba(6,182,212,0.15)]"
                    )} 
                />
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
                <p className="text-xs text-slate-400/80">{helperText}</p>
            ) : null}
        </div>
    );
});

Select.displayName = "Select";

export { Select };

