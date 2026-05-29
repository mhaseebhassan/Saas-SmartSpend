"use client";

import React from "react";
import { Button } from "@/components/ui/Button";
import { AlertOctagon, RotateCcw } from "lucide-react";

export default function DashboardError({ error, reset }) {
    React.useEffect(() => {
        console.error("Dashboard error:", error);
    }, [error]);

    return (
        <div className="flex min-h-[450px] w-full flex-col items-center justify-center rounded-3xl border border-red-500/10 bg-[#EF4444]/5 p-8 md:p-12 text-center select-none my-6">
            <div className="w-16 h-16 bg-red-500/10 rounded-2xl flex items-center justify-center text-red-500 mb-4 border border-red-500/20">
                <AlertOctagon className="w-8 h-8 animate-pulse" />
            </div>
            <h2 className="text-base md:text-lg font-bold text-white tracking-tight">Dashboard Render Failure</h2>
            <p className="text-xs text-[#9CA3AF] max-w-sm mt-1 leading-relaxed">
                We&apos;re sorry for the inconvenience. An unexpected exception was caught in the dashboard container. You can safely try resetting the panel or reload.
            </p>
            {error && (
                <div className="mt-4 max-w-md w-full overflow-x-auto rounded-xl bg-[#0F1117] p-4 text-[11px] font-mono text-red-400 text-left border border-white/5">
                    <p className="font-bold border-b border-white/5 pb-1 mb-2">Error Diagnostic Trace:</p>
                    <p className="whitespace-pre-wrap">{error.message || String(error)}</p>
                </div>
            )}
            <div className="mt-6 flex flex-wrap gap-3 justify-center">
                <Button
                    size="sm"
                    onClick={() => reset()}
                    className="bg-red-500 hover:bg-red-600 text-white font-semibold flex items-center gap-1.5"
                >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Reset Dashboard
                </Button>
                <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => window.location.reload()}
                    className="font-semibold"
                >
                    Reload Page
                </Button>
            </div>
        </div>
    );
}
