"use client";

import React, { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from "lucide-react";
import { cn } from "@/lib/utils";

function ToastItem({ toast, removeToast }) {
    const { id, message, type, duration } = toast;

    useEffect(() => {
        const timer = setTimeout(() => {
            removeToast(id);
        }, duration);

        return () => clearTimeout(timer);
    }, [id, duration, removeToast]);

    const icons = {
        success: <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />,
        error: <AlertCircle className="h-5 w-5 text-red-500 shrink-0" />,
        warning: <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0" />,
        info: <Info className="h-5 w-5 text-indigo-400 shrink-0" />,
    };

    const variantStyles = {
        success: "border-emerald-500/25 bg-[#10B981]/10 text-emerald-50",
        error: "border-red-500/25 bg-[#EF4444]/10 text-red-50",
        warning: "border-amber-500/25 bg-[#F59E0B]/10 text-amber-50",
        info: "border-indigo-500/25 bg-[#6366F1]/10 text-indigo-50",
    };

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95, transition: { duration: 0.2 } }}
            className={cn(
                "flex items-start gap-3 w-full border rounded-xl p-4 shadow-lg backdrop-blur-md bg-opacity-95",
                "bg-[#1A1D2E] border-[#2A2D3E]",
                variantStyles[type] || variantStyles.info
            )}
        >
            {icons[type] || icons.info}
            <div className="flex-1 text-sm font-medium leading-5 select-none">
                {message}
            </div>
            <button
                onClick={() => removeToast(id)}
                className="text-gray-400 hover:text-white transition-colors shrink-0 p-0.5 rounded-lg hover:bg-white/10"
            >
                <X className="h-4 w-4" />
            </button>
        </motion.div>
    );
}

export default function ToastContainer({ toasts, removeToast }) {
    return (
        <div className="fixed bottom-4 right-4 z-[99999] flex flex-col gap-2 w-full max-w-sm px-4 md:px-0">
            <AnimatePresence mode="popLayout">
                {toasts.map((toast) => (
                    <ToastItem key={toast.id} toast={toast} removeToast={removeToast} />
                ))}
            </AnimatePresence>
        </div>
    );
}
