"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export interface ToggleProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "onChange"> {
    checked?: boolean;
    onChange?: (checked: boolean) => void;
    label?: string;
    description?: string;
}

const Toggle = React.forwardRef<HTMLButtonElement, ToggleProps>((
    {
        className,
        checked = false,
        onChange,
        disabled = false,
        label,
        description,
        id,
        ...props
    },
    ref
) => {
    const generatedId = React.useId();
    const toggleId = id || generatedId;
    const handleToggle = () => {
        if (!disabled && onChange) {
            onChange(!checked);
        }
    };

    return (
        <div className="flex items-center justify-between gap-4 select-none">
            {(label || description) && (
                <div className="flex flex-col text-left">
                    {label && (
                        <label 
                            htmlFor={toggleId}
                            className={cn(
                                "text-sm font-semibold text-[#F1F5F9] cursor-pointer transition-colors duration-200",
                                disabled && "opacity-50"
                            )}
                        >
                            {label}
                        </label>
                    )}
                    {description && (
                        <p className={cn(
                            "text-xs text-[#94A3B8]",
                            disabled && "opacity-50"
                        )}>
                            {description}
                        </p>
                    )}
                </div>
            )}

            <button
                ref={ref}
                type="button"
                id={toggleId}
                disabled={disabled}
                role="switch"
                aria-checked={checked}
                onClick={handleToggle}
                className={cn(
                    "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border p-[1px] transition-all duration-300 focus-visible:outline-none focus:border-cyan-400/50 focus:ring-2 focus:ring-cyan-400/10 disabled:cursor-not-allowed disabled:opacity-40",
                    checked 
                        ? "bg-gradient-to-r from-cyan-500 to-violet-500 border-cyan-500/20 shadow-[0_0_12px_rgba(6,182,212,0.25)]" 
                        : "bg-[#111827]/80 border-white/[0.06] hover:bg-[#111827] hover:border-cyan-400/20",
                    className
                )}
                {...props}
            >
                {/* Knob Animating smoothly with Spring Physics */}
                <motion.span
                    className="pointer-events-none block h-5 w-5 rounded-full bg-white shadow-[0_2px_4px_rgba(0,0,0,0.2),_0_0_1px_rgba(0,0,0,0.4)] ring-0"
                    animate={{ x: checked ? 20 : 0 }}
                    transition={{
                        type: "spring" as const,
                        stiffness: 400,
                        damping: 25
                    }}
                />
            </button>
        </div>
    );
});

Toggle.displayName = "Toggle";

export { Toggle };
