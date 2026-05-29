"use client";

import React, { createContext, useContext, useState, useCallback, ReactNode } from "react";
import ToastContainer from "@/components/ui/Toast";

export type ToastType = "success" | "error" | "warning" | "info";

export interface Toast {
    id: string;
    message: string;
    type: ToastType;
    duration: number;
}

export interface ToastContextType {
    toast: {
        success: (message: string, duration?: number) => string;
        error: (message: string, duration?: number) => string;
        warning: (message: string, duration?: number) => string;
        info: (message: string, duration?: number) => string;
        add: (message: string, type?: ToastType, duration?: number) => string;
        remove: (id: string) => void;
    };
}

const ToastContext = createContext<ToastContextType | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const addToast = useCallback((message: string, type: ToastType = "info", duration = 4000) => {
        const id = Math.random().toString(36).substring(2, 9);
        setToasts((prevToasts) => [...prevToasts, { id, message, type, duration }]);
        return id;
    }, []);

    const removeToast = useCallback((id: string) => {
        setToasts((prevToasts) => prevToasts.filter((t) => t.id !== id));
    }, []);

    const success = useCallback((message: string, duration?: number) => addToast(message, "success", duration), [addToast]);
    const error = useCallback((message: string, duration?: number) => addToast(message, "error", duration), [addToast]);
    const warning = useCallback((message: string, duration?: number) => addToast(message, "warning", duration), [addToast]);
    const info = useCallback((message: string, duration?: number) => addToast(message, "info", duration), [addToast]);

    return (
        <ToastContext.Provider value={{ toast: { success, error, warning, info, add: addToast, remove: removeToast } }}>
            {children}
            <ToastContainer toasts={toasts} removeToast={removeToast} />
        </ToastContext.Provider>
    );
}

export function useToast() {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error("useToast must be used within a ToastProvider");
    }
    return context.toast;
}
