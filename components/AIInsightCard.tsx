"use client";

import * as React from "react";
import { Sparkles, RefreshCw } from "lucide-react";
import { SkeletonLine } from "@/components/ui/Skeleton";

export function AIInsightCard() {
    const [insight, setInsight] = React.useState<string | null>(null);
    const [isLoading, setIsLoading] = React.useState(true);

    const fetchInsight = async () => {
        setIsLoading(true);
        try {
            const res = await fetch("/api/ai/insight");
            if (res.ok) {
                const data = await res.json();
                setInsight(data.insight);
            } else {
                setInsight("Could not generate insight right now.");
            }
        } catch (error) {
            setInsight("Could not generate insight right now.");
        } finally {
            setIsLoading(false);
        }
    };

    React.useEffect(() => {
        fetchInsight();
    }, []);

    return (
        <div className="p-5 rounded-xl bg-gradient-to-br from-[#09090B] to-[#111] border border-indigo-500/20 shadow-sm relative overflow-hidden">
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2 text-indigo-400">
                    <Sparkles className="w-4 h-4" />
                    <h3 className="text-xs font-semibold uppercase tracking-wider">AI Insight</h3>
                </div>
                <button 
                    onClick={fetchInsight} 
                    disabled={isLoading}
                    className="p-1 rounded hover:bg-white/5 transition-colors disabled:opacity-50"
                    title="Refresh Insight"
                >
                    <RefreshCw className={`w-3.5 h-3.5 text-white/50 ${isLoading ? 'animate-spin' : ''}`} />
                </button>
            </div>
            
            <div className="text-sm text-white/80 leading-relaxed">
                {isLoading ? (
                    <div className="space-y-2">
                        <SkeletonLine className="h-4 w-full" />
                        <SkeletonLine className="h-4 w-5/6" />
                        <SkeletonLine className="h-4 w-4/6" />
                    </div>
                ) : (
                    <p>{insight}</p>
                )}
            </div>
        </div>
    );
}
