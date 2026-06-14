"use client";

import React from "react";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { FolderPlus } from "lucide-react";
import { motion } from "framer-motion";

export interface EmptyStateProps {
    title?: string;
    description?: string;
    ctaText?: string;
    onCtaClick?: () => void;
    ctaLink?: string;
    icon?: React.ReactNode;
}

export default function EmptyState({
    title = "No entries found",
    description = "Get started by creating your first entry.",
    ctaText,
    onCtaClick,
    ctaLink,
    icon,
}: EmptyStateProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            className="flex flex-col items-center justify-center border border-dashed border-white/[0.08] rounded-2xl bg-[#111827]/60 backdrop-blur-xl p-8 md:p-12 text-center select-none w-full hover:border-cyan-400/20 hover:shadow-[0_0_30px_rgba(6,182,212,0.1)] transition-all duration-300 group"
        >
            <div className="relative w-16 h-16 rounded-2xl flex items-center justify-center text-white mb-5 bg-gradient-to-r from-cyan-500 via-cyan-600 to-blue-500 shadow-[0_0_25px_rgba(6,182,212,0.3)] group-hover:scale-105 transition-transform duration-300">
                {/* Pulse background glow */}
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 via-cyan-600 to-blue-500 rounded-2xl blur-lg opacity-40 group-hover:opacity-60 transition-all duration-300" />
                
                <div className="relative z-10 flex items-center justify-center text-white">
                    {icon || <FolderPlus className="w-8 h-8" />}
                </div>
            </div>

            <h3 className="text-base font-bold text-[#F1F5F9] tracking-tight group-hover:text-white transition-colors">
                {title}
            </h3>
            
            <p className="text-xs text-[#94A3B8] max-w-xs mt-2 leading-relaxed">
                {description}
            </p>

            {ctaText && (ctaLink || onCtaClick) && (
                <div className="mt-5">
                    {ctaLink ? (
                        <Link href={ctaLink} passHref legacyBehavior>
                            <Button 
                                size="sm" 
                                className="px-4 py-2 font-semibold bg-gradient-to-r from-cyan-500 via-cyan-600 to-blue-500 text-white border-0 hover:from-cyan-400 hover:via-cyan-500 hover:to-blue-400 shadow-[0_0_20px_rgba(6,182,212,0.35)] hover:shadow-[0_0_25px_rgba(6,182,212,0.55)] transition-all duration-300"
                            >
                                {ctaText}
                            </Button>
                        </Link>
                    ) : (
                        <Button 
                            size="sm" 
                            onClick={onCtaClick} 
                            className="px-4 py-2 font-semibold bg-gradient-to-r from-cyan-500 via-cyan-600 to-blue-500 text-white border-0 hover:from-cyan-400 hover:via-cyan-500 hover:to-blue-400 shadow-[0_0_20px_rgba(6,182,212,0.35)] hover:shadow-[0_0_25px_rgba(6,182,212,0.55)] transition-all duration-300"
                        >
                            {ctaText}
                        </Button>
                    )}
                </div>
            )}
        </motion.div>
    );
}
