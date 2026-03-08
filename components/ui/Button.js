"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

const buttonVariants = (variant, size) => {
    const base = "relative inline-flex items-center justify-center rounded-lg text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background overflow-hidden";

    const variants = {
        default: "bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "border border-input hover:bg-accent hover:text-accent-foreground backdrop-blur-sm",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "underline-offset-4 hover:underline text-primary",
    };

    const sizes = {
        default: "h-10 py-2 px-4",
        sm: "h-9 px-3 rounded-md",
        lg: "h-11 px-8 rounded-md",
        icon: "h-10 w-10",
    };

    return cn(base, variants[variant] || variants.default, sizes[size] || sizes.default);
};

const Button = React.forwardRef(({ className, variant, size, asChild = false, ...props }, ref) => {
    const isGhost = variant === "ghost" || variant === "link";

    return (
        <motion.button
            ref={ref}
            whileHover={{ scale: isGhost ? 1.05 : 1.02 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
            className={cn(buttonVariants(variant, size), className)}
            {...props}
        >
            {/* Optional: Add a subtle shine effect for primary buttons */}
            {variant === "default" && (
                <motion.div
                    className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12"
                    animate={{ translateX: ["100%"] }}
                    transition={{ repeat: Infinity, duration: 2, ease: "linear", repeatDelay: 3 }}
                />
            )}
            <span className="relative z-10 flex items-center justify-center gap-2">
                {props.children}
            </span>
        </motion.button>
    );
});
Button.displayName = "Button";

export { Button, buttonVariants };
