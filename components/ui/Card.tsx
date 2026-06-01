"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
    hoverGlow?: boolean;
    gradientBorder?: boolean;
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(({ 
    className, 
    children, 
    hoverGlow = true, 
    gradientBorder = false,
    ...props 
}, ref) => {
    return (
        <motion.div
            ref={ref}
            initial={{ opacity: 0, y: 15, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            className={cn(
                "relative rounded-2xl text-card-foreground shadow-lg overflow-hidden group transition-all duration-300 z-0 isolate",
                gradientBorder 
                    ? "bg-gradient-to-r from-cyan-500 via-violet-500 to-pink-500 p-[1px] border-none" 
                    : "bg-[#111827]/60 backdrop-blur-xl border border-white/[0.06]",
                hoverGlow && "hover:border-cyan-400/20 hover:shadow-[0_0_30px_rgba(6,182,212,0.15),0_0_50px_rgba(139,92,246,0.1)]",
                className
            )}
            {...(props as any)}
        >
            {/* Subtle Gradient Hover Spotlight Glow */}
            {hoverGlow && (
                <div
                    className="absolute -inset-[1px] bg-gradient-to-r from-cyan-500/10 via-violet-500/5 to-pink-500/10 opacity-0 group-hover:opacity-100 rounded-2xl blur-xl transition-all duration-500 pointer-events-none -z-10"
                />
            )}

            {/* If gradient border is active, wrap children in inner glass container */}
            {gradientBorder ? (
                <div className="w-full h-full rounded-[15px] bg-[#111827]/90 backdrop-blur-2xl overflow-hidden z-0 isolate">
                    {children}
                </div>
            ) : (
                <>
                    {/* Subtle inner border for premium lighting */}
                    <div className="absolute inset-px rounded-[15px] border border-white/[0.04] pointer-events-none -z-10 group-hover:border-white/[0.08] transition-colors duration-300" />
                    {children}
                </>
            )}
        </motion.div>
    );
});
Card.displayName = "Card";

export interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
    headerUnderline?: boolean;
}

const CardHeader = React.forwardRef<HTMLDivElement, CardHeaderProps>(({ className, headerUnderline = false, children, ...props }, ref) => (
    <div
        ref={ref}
        className={cn("relative flex flex-col space-y-1.5 p-4 sm:p-6", className)}
        {...props}
    >
        {children}
        {headerUnderline && (
            <div className="absolute bottom-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-cyan-500/30 via-violet-500/30 to-transparent" />
        )}
    </div>
));
CardHeader.displayName = "CardHeader";

const CardTitle = React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(({ className, ...props }, ref) => (
    <h3
        ref={ref}
        className={cn(
            "text-xl font-bold leading-none tracking-tight text-white/95 bg-clip-text",
            className
        )}
        {...props}
    />
));
CardTitle.displayName = "CardTitle";

const CardDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(({ className, ...props }, ref) => (
    <p
        ref={ref}
        className={cn("text-sm text-muted-foreground/80", className)}
        {...props}
    />
));
CardDescription.displayName = "CardDescription";

const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ className, ...props }, ref) => (
    <div ref={ref} className={cn("p-4 sm:p-6 pt-0", className)} {...props} />
));
CardContent.displayName = "CardContent";

const CardFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ className, ...props }, ref) => (
    <div
        ref={ref}
        className={cn("flex items-center p-4 sm:p-6 pt-0 border-t border-white/[0.06] mt-4", className)}
        {...props}
    />
));
CardFooter.displayName = "CardFooter";

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent };

