"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

const Input = React.forwardRef(({
    className,
    type = "text",
    label,
    error,
    helperText,
    disabled,
    id,
    ...props
}, ref) => {
    const generatedId = React.useId();
    const inputId = id || generatedId;

    return (
        <div className="flex flex-col space-y-1.5 w-full text-left">
            {label && (
                <label 
                    htmlFor={inputId} 
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
                <input
                    ref={ref}
                    type={type}
                    id={inputId}
                    disabled={disabled}
                    className={cn(
                        "flex h-11 w-full rounded-xl border border-white/5 bg-secondary/30 px-3.5 py-2 text-sm text-foreground file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-40 transition-all duration-200 shadow-sm",
                        error && "border-destructive/50 focus:border-destructive/80 focus:ring-destructive/20",
                        className
                    )}
                    {...props}
                />
                
                {/* Glow ring transition overlay */}
                <div className="absolute inset-0 rounded-xl pointer-events-none border border-transparent peer-focus:border-primary/30 transition-all duration-200" />
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

Input.displayName = "Input";

export { Input };
