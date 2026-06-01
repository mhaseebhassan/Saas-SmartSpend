"use client";

import React from "react";
import { Button } from "@/components/ui/Button";
import { AlertOctagon, RotateCcw } from "lucide-react";
import { motion } from "framer-motion";

export default function DashboardError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
    React.useEffect(() => {
        console.error("Dashboard error:", error);
    }, [error]);

    return (
        <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="flex min-h-[450px] w-full flex-col items-center justify-center rounded-3xl border border-white/[0.06] bg-[#111827]/60 backdrop-blur-xl p-8 md:p-12 text-center select-none my-6 relative overflow-hidden shadow-[0_0_50px_rgba(239,68,68,0.08)]"
        >
            {/* Red aurora background element */}
            <div className="absolute -top-[20%] left-1/2 -translate-x-1/2 w-[60%] h-[60%] rounded-full bg-[#EF4444]/5 blur-[80px] pointer-events-none" />

            <div className="w-16 h-16 bg-[#EF4444]/10 rounded-2xl flex items-center justify-center text-[#EF4444] mb-4 border border-white/[0.06] shadow-[0_0_20px_rgba(239,68,68,0.15)] relative z-10">
                <AlertOctagon className="w-8 h-8 animate-pulse" />
            </div>
            
            <h2 className="text-xl md:text-2xl font-black text-white tracking-tight relative z-10">
                Dashboard Render Failure
            </h2>
            <p className="text-xs md:text-sm text-[#94A3B8] max-w-sm mt-2 leading-relaxed relative z-10">
                We&apos;re sorry for the inconvenience. An unexpected exception was caught in the dashboard container. You can safely try resetting the panel or reload.
            </p>
            
            {error && (
                <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="mt-6 max-w-md w-full overflow-x-auto rounded-2xl bg-[#05070F]/80 backdrop-blur-md p-4 text-[11px] font-mono text-red-400 text-left border border-white/[0.06] relative z-10"
                >
                    <p className="font-bold border-b border-white/[0.06] pb-1 mb-2 text-[#EF4444] flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-[#EF4444] animate-ping" />
                        Error Diagnostic Trace:
                    </p>
                    <p className="whitespace-pre-wrap">{error.message || String(error)}</p>
                </motion.div>
            )}
            
            <div className="mt-8 flex flex-wrap gap-3 justify-center relative z-10">
                <Button
                    size="sm"
                    onClick={() => reset()}
                    className="bg-gradient-to-r from-[#EF4444] to-[#F59E0B] hover:shadow-[0_0_20px_rgba(239,68,68,0.3)] text-white font-bold flex items-center gap-1.5 border-0 h-10 px-5"
                >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Reset Dashboard
                </Button>
                <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => window.location.reload()}
                    className="font-bold border border-white/[0.06] bg-[#111827]/40 hover:bg-[#111827]/60 text-white h-10 px-5"
                >
                    Reload Page
                </Button>
            </div>
        </motion.div>
    );
}
