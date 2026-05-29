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

const Toggle = React.forwardRef<HTMLButtonElement, ToggleProps>(({
    className,
    checked = false,
    onChange,
    disabled = false,
    label,
    description,
    id,
    ...props
}, ref) => {
    const generatedId = React.useId();
    const toggleId = id || generatedId;

    const handleToggle = () => {
        if (!disabled && onChange) {
            onChange(!checked);
        }
    };

    return (
        <div className="flex items-center justify-between gap-4 cursor-pointer select-none" onClick={handleToggle}>
            {(label || description) && (
                <div className="flex flex-col text-left">
                    {label && (
                        <label 
                            htmlFor={toggleId}
                            className={cn(
                                "text-sm font-semibold text-white/90 cursor-pointer",
                                disabled && "opacity-50"
                            )}
                        >
                            {label}
                        </label>
                    )}
                    {description && (
                        <p className={cn(
                            "text-xs text-muted-foreground/80",
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
                className={cn(
                    "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-40",
                    checked ? "bg-primary" : "bg-white/10",
                    className
                )}
                {...props}
            >
                {/* Knob Animating smoothly with Spring Physics */}
                <motion.span
                    className="pointer-events-none block h-5 w-5 rounded-full bg-white shadow-lg ring-0"
                    animate={{ x: checked ? 20 : 0 }}
                    transition={{
                        type: "spring",
                        stiffness: 500,
                        damping: 30
                    }}
                />
            </button>
        </div>
    );
});

Toggle.displayName = "Toggle";

export { Toggle };
