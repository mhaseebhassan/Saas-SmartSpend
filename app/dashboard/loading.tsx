import React from "react";
import { SkeletonCard, SkeletonChart, SkeletonLine } from "@/components/ui/Skeleton";

export default function DashboardLoading() {
    return (
        <div className="space-y-6 w-full pb-10 mt-6">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <SkeletonLine className="h-8 w-48 mb-2" />
                    <SkeletonLine className="h-4 w-64" />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <SkeletonCard className="lg:col-span-2 min-h-[160px]" />
                <SkeletonCard className="min-h-[160px]" />
                <SkeletonCard className="min-h-[160px]" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    <SkeletonChart className="min-h-[350px]" />
                </div>
                <div className="space-y-4">
                    <SkeletonCard className="min-h-[120px]" />
                    <SkeletonCard className="min-h-[120px]" />
                    <SkeletonCard className="min-h-[120px]" />
                </div>
            </div>
        </div>
    );
}
