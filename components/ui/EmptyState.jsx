"use client";

import React from "react";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { FolderPlus } from "lucide-react";

export default function EmptyState({
    title = "No entries found",
    description = "Get started by creating your first entry.",
    ctaText,
    onCtaClick,
    ctaLink,
    icon,
}) {
    return (
        <div className="flex flex-col items-center justify-center border border-dashed border-[#2A2D3E] rounded-2xl bg-[#1A1D2E]/20 p-8 md:p-12 text-center select-none w-full">
            <div className="w-16 h-16 bg-[#6366F1]/10 rounded-2xl flex items-center justify-center text-[#6366F1] mb-4 border border-[#6366F1]/20">
                {icon || <FolderPlus className="w-8 h-8" />}
            </div>
            <h3 className="text-base font-bold text-white tracking-tight">{title}</h3>
            <p className="text-xs text-[#9CA3AF] max-w-xs mt-1 leading-relaxed">
                {description}
            </p>
            {ctaText && (ctaLink || onCtaClick) && (
                <div className="mt-5">
                    {ctaLink ? (
                        <Link href={ctaLink} passHref legacyBehavior>
                            <Button size="sm" className="px-4 py-2 font-semibold">
                                {ctaText}
                            </Button>
                        </Link>
                    ) : (
                        <Button size="sm" onClick={onCtaClick} className="px-4 py-2 font-semibold">
                            {ctaText}
                        </Button>
                    )}
                </div>
            )}
        </div>
    );
}
