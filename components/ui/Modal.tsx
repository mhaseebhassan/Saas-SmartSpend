"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    description?: string;
    children?: React.ReactNode;
    className?: string;
    closeOnOverlayClick?: boolean;
}

const Modal: React.FC<ModalProps> = ({
    isOpen,
    onClose,
    title,
    description,
    children,
    className,
    closeOnOverlayClick = true,
}) => {
    const [mounted, setMounted] = React.useState(false);

    // Resolve mounting for Portals safely on client
    React.useEffect(() => {
        setMounted(true);
        if (isOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "unset";
        }
        return () => {
            document.body.style.overflow = "unset";
        };
    }, [isOpen]);

    // Handle Escape Key to close Modal
    React.useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape" && isOpen) {
                onClose?.();
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [isOpen, onClose]);

    if (!mounted) return null;

    const modalContent = (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
                    {/* Backdrop Overlay */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="fixed inset-0 z-50 bg-[#05070F]/85 backdrop-blur-xl cursor-pointer"
                        onClick={closeOnOverlayClick ? onClose : undefined}
                    />

                    {/* Modal Content Box */}
                    <motion.div
                        initial={{ scale: 0.95, opacity: 0, y: 15 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.95, opacity: 0, y: 15 }}
                        transition={{ 
                            type: "spring" as const, 
                            stiffness: 400, 
                            damping: 25,
                            duration: 0.3 
                        }}
                        className={cn(
                            "relative w-full max-w-lg rounded-2xl border border-white/[0.08] bg-[#111827]/90 backdrop-blur-2xl p-6 shadow-2xl z-[60] overflow-hidden my-auto",
                            className
                        )}
                    >
                        {/* Glow effect in top-corner (Aurora themed gradient) */}
                        <div className="absolute -top-10 -right-10 w-40 h-40 bg-gradient-to-br from-cyan-500/20 via-violet-500/15 to-transparent rounded-full blur-2xl pointer-events-none" />

                        {/* Close button */}
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 text-[#94A3B8] hover:text-[#F1F5F9] p-1.5 rounded-lg hover:bg-white/[0.06] border border-transparent hover:border-white/[0.06] transition-all cursor-pointer focus:outline-none focus:border-cyan-400/50 focus:ring-2 focus:ring-cyan-400/10"
                            aria-label="Close modal"
                        >
                            <X className="h-4 w-4" />
                        </button>

                        {/* Modal Header */}
                        {(title || description) && (
                            <div className="flex flex-col space-y-1.5 text-left mb-5">
                                {title && (
                                    <h2 id="modal-title" className="text-xl font-bold tracking-tight text-[#F1F5F9]">
                                        {title}
                                    </h2>
                                )}
                                {description && (
                                    <p className="text-sm text-[#94A3B8]">
                                        {description}
                                    </p>
                                )}
                            </div>
                        )}

                        {/* Content */}
                        <div className="relative z-10 text-[#F1F5F9]">
                            {children}
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );

    return createPortal(modalContent, document.body);
};

export { Modal };
