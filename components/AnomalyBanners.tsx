"use client";

import * as React from "react";
import { AlertTriangle, X } from "lucide-react";

interface Anomaly {
    category: string;
    thisWeek: number;
    average: number;
    spike: number;
}

export function AnomalyBanners() {
    const [anomalies, setAnomalies] = React.useState<Anomaly[]>([]);
    const [dismissed, setDismissed] = React.useState<Set<string>>(new Set());

    React.useEffect(() => {
        const fetchAnomalies = async () => {
            try {
                const res = await fetch("/api/ai/anomalies");
                if (res.ok) {
                    const data = await res.json();
                    if (data.anomalies) {
                        setAnomalies(data.anomalies);
                    }
                }
            } catch (error) {
                // ignore
            }
        };
        fetchAnomalies();
    }, []);

    const visibleAnomalies = anomalies.filter(a => !dismissed.has(a.category));

    if (visibleAnomalies.length === 0) return null;

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
