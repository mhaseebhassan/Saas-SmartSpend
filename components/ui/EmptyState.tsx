"use client";

import React from "react";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";

export interface EmptyStateProps {
    icon: LucideIcon;
    title: string;
    description: string;
    actionLabel?: string;
    actionHref?: string;
    onAction?: () => void;
}

export default function EmptyState({
    icon: Icon,
    title,
    description,
    actionLabel,
    actionHref,
    onAction,
}: EmptyStateProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 350, damping: 30 }}
            className="flex flex-col items-center justify-center rounded-xl border border-white/[0.08] bg-[#09090B] p-12 md:p-16 text-center select-none w-full"
        >
            <div className="mb-5">
                <Icon className="w-16 h-16 text-white/10" strokeWidth={1} />
            </div>

            <h3 className="text-sm font-semibold text-white tracking-tight">
                {title}
            </h3>

            <p className="text-xs text-white/50 max-w-xs mt-1.5 leading-relaxed">
                {description}
            </p>

            {actionLabel && (actionHref || onAction) && (
                <div className="mt-5">
                    {actionHref ? (
                        <Link href={actionHref}>
                            <Button
                                size="sm"
                                className="px-5 h-9 font-medium bg-white text-black hover:bg-white/90 border-0"
                            >
                                {actionLabel}
                            </Button>
                        </Link>
                    ) : (
                        <Button
                            size="sm"
                            onClick={onAction}
                            className="px-5 h-9 font-medium bg-white text-black hover:bg-white/90 border-0"
                        >
                            {actionLabel}
                        </Button>
                    )}
                </div>
            )}
        </motion.div>
    );
}
