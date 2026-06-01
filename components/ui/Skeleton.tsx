"use client";

import React from "react";
import { motion, HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";

export interface SkeletonProps extends HTMLMotionProps<"div"> {}

export default function Skeleton({ className, ...props }: SkeletonProps) {
    return (
        <motion.div
            className={cn("relative overflow-hidden rounded-lg bg-[#1A2035]", className)}
            {...props}
        >
            {/* Shimmer sweep */}
            <motion.div
                initial={{ x: "-100%" }}
                animate={{ x: "100%" }}
                transition={{
                    repeat: Infinity,
                    duration: 1.6,
                    ease: "linear",
                }}
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.05] to-transparent pointer-events-none"
            />
        </motion.div>
    );
}

export interface CardSkeletonProps extends React.HTMLAttributes<HTMLDivElement> {}

export function CardSkeleton({ className, ...props }: CardSkeletonProps) {
    return (
        <div className={cn("rounded-2xl border border-white/[0.06] bg-[#111827]/60 backdrop-blur-xl p-6 space-y-4", className)} {...props}>
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-8 w-2/3" />
            <Skeleton className="h-3.5 w-1/2" />
        </div>
    );
}

export interface ChartSkeletonProps extends React.HTMLAttributes<HTMLDivElement> {}

export function ChartSkeleton({ className, ...props }: ChartSkeletonProps) {
    return (
        <div className={cn("rounded-2xl border border-white/[0.06] bg-[#111827]/60 backdrop-blur-xl p-6 space-y-6", className)} {...props}>
            <div className="flex justify-between items-center">
                <div className="space-y-2">
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-3.5 w-48" />
                </div>
                <div className="flex gap-2">
                    <Skeleton className="h-8 w-16 rounded-full" />
                    <Skeleton className="h-8 w-16 rounded-full" />
                </div>
            </div>
            <div className="h-60 flex items-end gap-3 pt-6">
                <Skeleton className="h-[20%] w-full rounded-t-lg" />
                <Skeleton className="h-[50%] w-full rounded-t-lg" />
                <Skeleton className="h-[35%] w-full rounded-t-lg" />
                <Skeleton className="h-[80%] w-full rounded-t-lg" />
                <Skeleton className="h-[65%] w-full rounded-t-lg" />
                <Skeleton className="h-[95%] w-full rounded-t-lg" />
                <Skeleton className="h-[40%] w-full rounded-t-lg" />
            </div>
        </div>
    );
}

export interface TableSkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
    rows?: number;
    cols?: number;
}

export function TableSkeleton({ rows = 5, cols = 4, className, ...props }: TableSkeletonProps) {
    return (
        <div className={cn("w-full border border-white/[0.06] rounded-2xl bg-[#111827]/60 backdrop-blur-xl overflow-hidden", className)} {...props}>
            <div className="px-6 py-4 border-b border-white/[0.06] flex items-center justify-between">
                <Skeleton className="h-5 w-1/4" />
                <Skeleton className="h-8 w-24 rounded-full" />
            </div>
            <div className="p-6 space-y-5">
                {Array.from({ length: rows }).map((_, i) => (
                    <div key={i} className="flex gap-4 items-center py-1">
                        {Array.from({ length: cols }).map((_, j) => (
                            <Skeleton
                                key={j}
                                className={cn(
                                    "h-4",
                                    j === 0 ? "w-1/3" : j === 1 ? "w-1/6" : j === 2 ? "w-1/4" : "w-1/12 ml-auto"
                                )}
                            />
                        ))}
                    </div>
                ))}
            </div>
        </div>
    );
}
