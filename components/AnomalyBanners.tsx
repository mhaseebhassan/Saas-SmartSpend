"use client";

import * as React from "react";
import { AlertTriangle, X } from "lucide-react";
import useSWR from "swr";

interface Anomaly {
    category: string;
    thisWeek: number;
    average: number;
    spike: number;
}

const fetcher = (url: string) => fetch(url).then(res => res.json());

export function AnomalyBanners() {
    const [dismissed, setDismissed] = React.useState<Set<string>>(new Set());
    
    const { data, error } = useSWR("/api/ai/anomalies", fetcher, {
        revalidateOnFocus: false,
        revalidateIfStale: false,
        dedupingInterval: 1000 * 60 * 60 * 24 // 24 hours cache
    });

    const anomalies: Anomaly[] = data?.anomalies || [];
    const visibleAnomalies = anomalies.filter(a => !dismissed.has(a.category));

    if (!data || error || visibleAnomalies.length === 0) return null;

    return (
        <div className="space-y-2 mb-4">
            {visibleAnomalies.map((anomaly) => (
                <div key={anomaly.category} className="flex items-center justify-between p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 text-sm">
                    <div className="flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4" />
                        <span>
                            <strong>{anomaly.category}</strong> spending is {anomaly.spike}% above your weekly average
                        </span>
                    </div>
                    <button 
                        onClick={() => {
                            const newDismissed = new Set(dismissed);
                            newDismissed.add(anomaly.category);
                            setDismissed(newDismissed);
                        }}
                        className="p-1 hover:bg-yellow-500/20 rounded-md transition-colors"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
            ))}
        </div>
    );
}
