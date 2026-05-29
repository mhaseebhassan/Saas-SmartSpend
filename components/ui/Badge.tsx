"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { motion, HTMLMotionProps } from "framer-motion";

export type BadgeVariant = "neutral" | "success" | "warning" | "danger";

const badgeVariants = (variant: BadgeVariant = "neutral") => {
    const base = "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border backdrop-blur-md select-none transition-all duration-300 w-fit";

    const variants: Record<BadgeVariant, string> = {
        neutral: "bg-white/5 border-white/10 text-muted-foreground hover:bg-white/10",
        success: "bg-success/10 border-success/20 text-success hover:bg-success/15 shadow-[0_0_10px_rgba(16,185,129,0.05)]",
        warning: "bg-warning/10 border-warning/20 text-warning hover:bg-warning/15 shadow-[0_0_10px_rgba(245,158,11,0.05)]",
        danger: "bg-destructive/10 border-destructive/20 text-destructive hover:bg-destructive/15 shadow-[0_0_10px_rgba(239,68,68,0.05)]",
    };

    return cn(base, variants[variant] || variants.neutral);
};

export interface BadgeProps extends HTMLMotionProps<"div"> {
    className?: string;
    variant?: BadgeVariant;
    children?: React.ReactNode;
    dot?: boolean;
}

function Badge({ className, variant = "neutral", children, dot = false, ...props }: BadgeProps) {
    const dotColors: Record<BadgeVariant, string> = {
        neutral: "bg-muted-foreground/60",
        success: "bg-success",
        warning: "bg-warning",
        danger: "bg-destructive",
    };

    return (
        <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className={cn(badgeVariants(variant), className)}
            {...props}
        >
            {dot && (
                <span className="relative flex h-1.5 w-1.5">
                    {variant !== "neutral" && (
                        <span className={cn("animate-ping absolute inline-flex h-full w-full rounded-full opacity-75", dotColors[variant])} />
                    )}
                    <span className={cn("relative inline-flex rounded-full h-1.5 w-1.5", dotColors[variant])} />
                </span>
            )}
            {children}
        </motion.div>
    );
}

export { Badge, badgeVariants };
