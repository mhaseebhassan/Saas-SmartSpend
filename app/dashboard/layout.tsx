"use client";

import React from "react";
import Sidebar from "@/components/Sidebar";
import TopBar from "@/components/TopBar";
import MobileBottomNav from "@/components/MobileBottomNav";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();

    return (
        <div className="flex min-h-[calc(100vh-64px)] bg-transparent">
            {/* Desktop Left Sidebar (hidden on mobile) */}
            <Sidebar />

            {/* Dashboard Content Container */}
            <div className="flex-1 flex flex-col min-w-0 relative">
                {/* Desktop & Mobile Dynamic Header */}
                <TopBar />

                {/* Dynamic Content Frame with Premium Page Transitions */}
                <main className="flex-1 p-4 sm:p-6 md:p-8 overflow-y-auto pb-24 md:pb-8 relative">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={pathname}
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -15 }}
                            transition={{ type: "spring", stiffness: 400, damping: 25 }}
                            className="w-full h-full"
                        >
                            {children}
                        </motion.div>
                    </AnimatePresence>
                </main>

                {/* Mobile Bottom Sticky Navigation Tab bar */}
                <MobileBottomNav />
            </div>
        </div>
    );
}
