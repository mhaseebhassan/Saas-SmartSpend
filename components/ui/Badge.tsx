"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { motion, HTMLMotionProps } from "framer-motion";

export type BadgeVariant = "neutral" | "success" | "warning" | "danger";

const badgeVariants = (variant: BadgeVariant = "neutral") => {
    const base = "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border backdrop-blur-md select-none transition-all duration-300 w-fit";

    const variants: Record<BadgeVariant, string> = {
        neutral: "bg-white/[0.06] border-white/[0.08] text-slate-200 hover:bg-white/[0.1] hover:text-white",
        success: "bg-emerald-500/10 border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/20 shadow-[0_0_12px_rgba(16,185,129,0.15)]",
        warning: "bg-amber-500/10 border-amber-500/30 text-amber-300 hover:bg-amber-500/20 shadow-[0_0_12px_rgba(245,158,11,0.15)]",
        danger: "bg-red-500/10 border-red-500/30 text-red-300 hover:bg-red-500/20 shadow-[0_0_12px_rgba(239,68,68,0.15)]",
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
        neutral: "bg-slate-400",
        success: "bg-emerald-400",
        warning: "bg-amber-400",
        danger: "bg-red-400",
    };

    return (
        <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            className={cn(badgeVariants(variant), className)}
            {...props}
        >
            {dot && (
                <span className="relative flex h-1.5 w-1.5 shrink-0">
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
