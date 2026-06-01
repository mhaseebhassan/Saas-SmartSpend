"use client";

import React, { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from "lucide-react";
import { cn } from "@/lib/utils";

export type ToastType = "success" | "error" | "warning" | "info";

export interface ToastItemData {
    id: string;
    message: string;
    type: ToastType;
    duration?: number;
}

export interface ToastItemProps {
    toast: ToastItemData;
    removeToast: (id: string) => void;
}

function ToastItem({ toast, removeToast }: ToastItemProps) {
    const { id, message, type, duration = 3000 } = toast;

    useEffect(() => {
        const timer = setTimeout(() => {
            removeToast(id);
        }, duration);

        return () => clearTimeout(timer);
    }, [id, duration, removeToast]);

    const icons: Record<ToastType, React.ReactNode> = {
        success: <CheckCircle2 className="h-5 w-5 text-[#10B981] shrink-0" />,
        error: <AlertCircle className="h-5 w-5 text-[#EF4444] shrink-0" />,
        warning: <AlertTriangle className="h-5 w-5 text-[#F59E0B] shrink-0" />,
        info: <Info className="h-5 w-5 text-[#06B6D4] shrink-0" />,
    };

    const variantGlow: Record<ToastType, string> = {
        success: "bg-[#10B981] shadow-[2px_0_10px_rgba(16,185,129,0.5)]",
        error: "bg-[#EF4444] shadow-[2px_0_10px_rgba(239,68,68,0.5)]",
        warning: "bg-[#F59E0B] shadow-[2px_0_10px_rgba(245,158,11,0.5)]",
        info: "bg-[#06B6D4] shadow-[2px_0_10px_rgba(6,182,212,0.5)]",
    };

    return (
        <motion.div 
            role={type === "error" || type === "warning" ? "alert" : "status"} 
            aria-live={type === "error" || type === "warning" ? "assertive" : "polite"}
            layout
            initial={{ opacity: 0, y: 24, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95, y: 10, transition: { duration: 0.15 } }}
            transition={{ type: "spring", stiffness: 350, damping: 25 }}
            className={cn(
                "relative flex items-start gap-3 w-full border rounded-xl p-4 shadow-lg backdrop-blur-xl overflow-hidden pl-5 select-none",
                "bg-[#111827]/80 border-white/[0.06] text-slate-100"
            )}
        >
            {/* Glow left edge */}
            <div className={cn("absolute left-0 top-0 bottom-0 w-1", variantGlow[type])} />

            {icons[type]}
            <div className="flex-1 text-sm font-medium leading-5 pr-2 text-slate-200">
                {message}
            </div>
            
            {/* Custom Close Button */}
            <button 
                aria-label="Close toast"
                onClick={() => removeToast(id)}
                className="text-slate-400 hover:text-slate-100 transition-all duration-200 shrink-0 p-1 rounded-md bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.04] hover:border-white/[0.1] active:scale-95 cursor-pointer"
            >
                <X className="h-3.5 w-3.5" />
            </button>
        </motion.div>
    );
}

export interface ToastContainerProps {
    toasts: ToastItemData[];
    removeToast: (id: string) => void;
}

export default function ToastContainer({ toasts, removeToast }: ToastContainerProps) {
    return (
        <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-full md:max-w-sm z-[99999] flex flex-col gap-2 pointer-events-none">
            <AnimatePresence mode="popLayout">
                {toasts.map((toast) => (
                    <div key={toast.id} className="pointer-events-auto">
                        <ToastItem toast={toast} removeToast={removeToast} />
                    </div>
                ))}
            </AnimatePresence>
        </div>
    );
}
