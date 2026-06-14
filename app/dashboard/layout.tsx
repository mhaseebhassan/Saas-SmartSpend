"use client";

import React from "react";
import TopBar from "@/components/TopBar";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();

    return (
        <div className="flex flex-col min-h-screen bg-transparent">
            {/* Top Navigation / Header */}
            <TopBar />

            {/* Dashboard Content Container */}
            <main className="flex-1 p-4 sm:p-6 md:p-8 relative">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={pathname}
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -15 }}
                        transition={{ type: "spring", stiffness: 400, damping: 25 }}
                        className="w-full h-full max-w-7xl mx-auto"
                    >
                        {children}
                    </motion.div>
                </AnimatePresence>
            </main>
        </div>
    );
}
