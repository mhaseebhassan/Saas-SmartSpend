"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import ToastContainer from "@/components/ui/Toast";

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
    const [toasts, setToasts] = useState([]);

    const addToast = useCallback((message, type = "info", duration = 4000) => {
        const id = Math.random().toString(36).substring(2, 9);
        setToasts((prevToasts) => [...prevToasts, { id, message, type, duration }]);
        return id;
    }, []);

    const removeToast = useCallback((id) => {
        setToasts((prevToasts) => prevToasts.filter((t) => t.id !== id));
    }, []);

    const success = useCallback((message, duration) => addToast(message, "success", duration), [addToast]);
    const error = useCallback((message, duration) => addToast(message, "error", duration), [addToast]);
    const warning = useCallback((message, duration) => addToast(message, "warning", duration), [addToast]);
    const info = useCallback((message, duration) => addToast(message, "info", duration), [addToast]);

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
