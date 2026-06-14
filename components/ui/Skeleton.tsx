"use client";

import React from "react";
import { cn } from "@/lib/utils";

/*
 * CSS shimmer animation injected via a <style> tag.
 * Uses a subtle left-to-right sweep: bg-white/[0.04] base → bg-white/[0.08] highlight.
 */
const shimmerStyle = `
@keyframes skeleton-shimmer {
  0% {
    background-position: -400px 0;
  }
  100% {
    background-position: 400px 0;
  }
}

.skeleton-shimmer {
  background: linear-gradient(
    90deg,
    rgba(255, 255, 255, 0.04) 0%,
    rgba(255, 255, 255, 0.08) 40%,
    rgba(255, 255, 255, 0.04) 80%
  );
  background-size: 800px 100%;
  animation: skeleton-shimmer 1.8s ease-in-out infinite;
}
`;

let styleInjected = false;
function InjectShimmerStyle() {
    if (typeof window === "undefined") return null;
    if (styleInjected) return null;
    styleInjected = true;
    return <style dangerouslySetInnerHTML={{ __html: shimmerStyle }} />;
}

/* ─────────────────────────────────────────────
 *  SkeletonLine — a rounded bar with shimmer
 * ───────────────────────────────────────────── */
export interface SkeletonLineProps extends React.HTMLAttributes<HTMLDivElement> {}

export function SkeletonLine({ className, ...props }: SkeletonLineProps) {
    return (
        <>
            <InjectShimmerStyle />
            <div
                className={cn("skeleton-shimmer rounded-md h-4 w-full", className)}
                {...props}
            />
        </>
    );
}

/* ─────────────────────────────────────────────
 *  SkeletonCard — full card skeleton: header + lines
 * ───────────────────────────────────────────── */
export interface SkeletonCardProps extends React.HTMLAttributes<HTMLDivElement> {}

export function SkeletonCard({ className, ...props }: SkeletonCardProps) {
    return (
        <>
            <InjectShimmerStyle />
            <div
                className={cn(
                    "rounded-xl border border-white/[0.06] bg-[#09090B] p-5 space-y-4",
                    className
                )}
                {...props}
            >
                {/* Header area */}
                <div className="flex items-center gap-3">
                    <div className="skeleton-shimmer w-10 h-10 rounded-lg shrink-0" />
                    <div className="space-y-2 flex-1">
                        <div className="skeleton-shimmer rounded-md h-3 w-1/3" />
                        <div className="skeleton-shimmer rounded-md h-2.5 w-1/2" />
                    </div>
                </div>
                {/* Body lines */}
                <div className="skeleton-shimmer rounded-md h-7 w-2/3" />
                <div className="skeleton-shimmer rounded-md h-3 w-1/2" />
                <div className="skeleton-shimmer rounded-md h-1.5 w-full rounded-full mt-2" />
            </div>
        </>
    );
}

/* ─────────────────────────────────────────────
 *  SkeletonChart — chart placeholder with bars
 * ───────────────────────────────────────────── */
export interface SkeletonChartProps extends React.HTMLAttributes<HTMLDivElement> {}

export function SkeletonChart({ className, ...props }: SkeletonChartProps) {
    return (
        <>
            <InjectShimmerStyle />
            <div
                className={cn(
                    "rounded-xl border border-white/[0.06] bg-[#09090B] p-5 space-y-5",
                    className
                )}
                {...props}
            >
                {/* Chart header */}
                <div className="space-y-2">
                    <div className="skeleton-shimmer rounded-md h-4 w-32" />
                    <div className="skeleton-shimmer rounded-md h-3 w-56" />
                </div>
                {/* Chart bars */}
                <div className="h-[240px] flex items-end gap-2 pt-4">
                    {[20, 50, 35, 80, 60, 95, 40, 70, 25, 55, 45, 85].map((h, i) => (
                        <div key={i} className="flex-1 flex items-end h-full">
                            <div
                                className="skeleton-shimmer w-full rounded-t-md"
                                style={{ height: `${h}%` }}
                            />
                        </div>
                    ))}
                </div>
            </div>
        </>
    );
}

/* ─────────────────────────────────────────────
 *  Default export (base shimmer block) for backward compat
 * ───────────────────────────────────────────── */
export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {}

export default function Skeleton({ className, ...props }: SkeletonProps) {
    return (
        <>
            <InjectShimmerStyle />
            <div
                className={cn("skeleton-shimmer rounded-md", className)}
                {...props}
            />
        </>
    );
}
