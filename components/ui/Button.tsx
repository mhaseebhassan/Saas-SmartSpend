"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
export type ButtonSize = "default" | "sm" | "lg" | "icon";

const buttonVariants = (variant: ButtonVariant = "primary", size: ButtonSize = "default") => {
    const base = "relative inline-flex items-center justify-center gap-2 rounded-xl text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/50 disabled:opacity-50 disabled:pointer-events-none active:scale-95 duration-200 overflow-hidden isolate z-0 cursor-pointer select-none";

    const variants: Record<ButtonVariant, string> = {
        primary: "bg-gradient-to-r from-cyan-500 via-violet-500 to-pink-500 text-white shadow-[0_0_20px_rgba(6,182,212,0.3)] hover:shadow-[0_0_30px_rgba(139,92,246,0.5)] border border-transparent",
        secondary: "bg-white/[0.06] text-foreground border border-white/[0.08] hover:bg-white/[0.1] hover:border-cyan-400/20 hover:shadow-[0_0_20px_rgba(6,182,212,0.15)]",
        ghost: "text-muted-foreground hover:text-foreground hover:bg-white/[0.06]",
        danger: "bg-red-500/80 text-white border border-red-500/30 shadow-[0_0_20px_rgba(239,68,68,0.25)] hover:bg-red-500/95 hover:shadow-[0_0_25px_rgba(239,68,68,0.4)]",
    };

    const sizes: Record<ButtonSize, string> = {
        default: "h-11 py-2 px-5",
        sm: "h-9 px-4 rounded-lg text-xs",
        lg: "h-12 px-7 rounded-2xl text-base",
        icon: "h-11 w-11 rounded-xl",
    };

    return cn(base, variants[variant] || variants.primary, sizes[size] || sizes.default);
};

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: ButtonVariant;
    size?: ButtonSize;
    isLoading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(({
    className,
    variant = "primary",
    size = "default",
    isLoading = false,
    disabled,
    children,
    onClick,
    type = "button",
    ...props
}, ref) => {
    const isDisabled = disabled || isLoading;
    const isGhostOrLink = variant === "ghost";

    return (
        <motion.button
            ref={ref}
            aria-disabled={isDisabled}
            aria-busy={isLoading}
            whileHover={isDisabled ? {} : { scale: isGhostOrLink ? 1.03 : 1.015 }}
            whileTap={isDisabled ? {} : { scale: 0.975 }}
            transition={{ type: "spring" as const, stiffness: 500, damping: 20 }}
            className={cn(buttonVariants(variant, size), className)}
            disabled={isDisabled}
            onClick={onClick as React.MouseEventHandler<HTMLButtonElement>}
            type={type}
            {...(props as any)}
        >
            {/* Stunning Moving Shimmer Shine Overlay for Primary variant */}
            {variant === "primary" && !isDisabled && (
                <motion.div
                    className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-12"
                    animate={{ translateX: ["100%"] }}
                    transition={{ repeat: Infinity, duration: 2, ease: "linear", repeatDelay: 3 }}
                />
            )}

            {/* Subtle Hover Shine Effect for Danger variant */}
            {variant === "danger" && !isDisabled && (
                <motion.div
                    className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12"
                    animate={{ translateX: ["100%"] }}
                    transition={{ repeat: Infinity, duration: 2.5, ease: "linear", repeatDelay: 4 }}
                />
            )}

            <span className="relative z-10 flex items-center justify-center gap-2">
                {isLoading && (
                    <svg
                        aria-hidden="true"
                        className="animate-spin -ml-1 mr-1 h-4 w-4 text-current"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                    >
                        <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                        />
                        <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                    </svg>
                )}
                {children}
            </span>
        </motion.button>
    );
});

Button.displayName = "Button";

export { Button, buttonVariants };
