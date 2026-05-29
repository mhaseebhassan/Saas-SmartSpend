"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

const Card = React.forwardRef(({ className, children, hoverGlow = true, ...props }, ref) => {
    return (
        <motion.div
            ref={ref}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className={cn(
                "relative rounded-2xl border border-white/5 bg-card/60 backdrop-blur-xl text-card-foreground shadow-lg overflow-hidden group transition-all duration-300",
                hoverGlow && "hover:border-primary/20 hover:shadow-[0_0_30px_rgba(99,102,241,0.15)]",
                className
            )}
            {...props}
        >
            {/* Subtle Gradient Hover Spotlight Glow */}
            {hoverGlow && (
                <div 
                    className="absolute -inset-[1px] bg-gradient-to-r from-primary/10 via-indigo-500/5 to-purple-500/10 opacity-0 group-hover:opacity-100 rounded-2xl blur-xl transition-all duration-500 pointer-events-none -z-10" 
                />
            )}
            
            {/* Subtle inner border for premium lighting */}
            <div className="absolute inset-px rounded-[15px] border border-white/5 pointer-events-none -z-10 group-hover:border-white/10 transition-colors duration-300" />
            
            {children}
        </motion.div>
    );
});
Card.displayName = "Card";

const CardHeader = React.forwardRef(({ className, ...props }, ref) => (
    <div
        ref={ref}
        className={cn("flex flex-col space-y-1.5 p-6", className)}
        {...props}
    />
));
CardHeader.displayName = "CardHeader";

const CardTitle = React.forwardRef(({ className, ...props }, ref) => (
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

const CardDescription = React.forwardRef(({ className, ...props }, ref) => (
    <p
        ref={ref}
        className={cn("text-sm text-muted-foreground/80", className)}
        {...props}
    />
));
CardDescription.displayName = "CardDescription";

const CardContent = React.forwardRef(({ className, ...props }, ref) => (
    <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
));
CardContent.displayName = "CardContent";

const CardFooter = React.forwardRef(({ className, ...props }, ref) => (
    <div
        ref={ref}
        className={cn("flex items-center p-6 pt-0 border-t border-white/5 mt-4", className)}
        {...props}
    />
));
CardFooter.displayName = "CardFooter";

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent };
