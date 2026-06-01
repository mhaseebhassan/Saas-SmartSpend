"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    Wallet,
    PiggyBank,
    BarChart3,
    Settings
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

export default function MobileBottomNav() {
    const pathname = usePathname();

    const items = [
        { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
        { name: "Expenses", href: "/dashboard/expenses", icon: Wallet },
        { name: "Budgets", href: "/dashboard/budgets", icon: PiggyBank },
        { name: "Analytics", href: "/dashboard/analytics", icon: BarChart3 },
        { name: "Settings", href: "/dashboard/settings", icon: Settings },
    ];

    return (
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#05070F]/90 backdrop-blur-2xl border-t border-white/[0.04] px-2 pt-1.5 pb-safe-bottom shadow-[0_-10px_30px_rgba(0,0,0,0.5)]">
            <div className="flex justify-around items-center max-w-lg mx-auto">
                {items.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href;

                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className="relative flex flex-col items-center justify-center py-2 px-3.5 rounded-2xl flex-1 min-w-0 transition-colors group"
                        >
                            {/* Radial Glow behind active icon */}
                            {isActive && (
                                <motion.div
                                    layoutId="mobile-active-glow"
                                    className="absolute -inset-1 bg-gradient-to-r from-cyan-500/10 to-teal-500/10 rounded-full blur-md -z-10"
                                    transition={{ type: "spring" as const, stiffness: 400, damping: 25 }}
                                />
                            )}

                            {/* Icon with scaling micro-animation */}
                            <motion.div
                                whileTap={{ scale: 0.85 }}
                                className={cn(
                                    "p-1 rounded-xl transition-colors relative z-10",
                                    isActive ? "text-cyan-400 drop-shadow-[0_0_8px_rgba(6,182,212,0.5)]" : "text-[#94A3B8] group-hover:text-[#F1F5F9]"
                                )}
                            >
                                <Icon className="w-5 h-5" />
                            </motion.div>

                            {/* Label text */}
                            <span 
                                className={cn(
                                    "text-[9px] font-semibold tracking-wide transition-colors mt-0.5 relative z-10",
                                    isActive ? "text-cyan-400 font-bold" : "text-[#94A3B8]/80 group-hover:text-[#F1F5F9]/80"
                                )}
                            >
                                {item.name}
                            </span>

                            {/* Underline indicator */}
                            {isActive && (
                                <motion.span 
                                    layoutId="mobile-active-underline"
                                    className="absolute bottom-0 left-3 right-3 h-[2px] rounded-full bg-gradient-to-r from-cyan-400 to-teal-400 shadow-[0_0_8px_rgba(6,182,212,0.8)]"
                                    transition={{ type: "spring" as const, stiffness: 400, damping: 25 }}
                                />
                            )}
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}
