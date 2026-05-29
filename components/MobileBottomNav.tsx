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
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-card/65 backdrop-blur-xl border-t border-white/5 px-2 py-1.5 shadow-[0_-10px_30px_rgba(0,0,0,0.3)] pb-safe-bottom">
            <div className="flex justify-around items-center max-w-lg mx-auto">
                {items.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href;

                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className="relative flex flex-col items-center justify-center py-1 px-3.5 rounded-2xl flex-1 min-w-0 transition-colors group"
                        >
                            {/* Animated Background Bubble for Active Item */}
                            {isActive && (
                                <motion.div
                                    layoutId="mobile-active-nav"
                                    className="absolute inset-0 bg-primary/10 rounded-2xl -z-10"
                                    transition={{ type: "spring", stiffness: 350, damping: 25 }}
                                />
                            )}

                            {/* Icon with scaling micro-animation */}
                            <motion.div
                                whileTap={{ scale: 0.85 }}
                                className={cn(
                                    "p-1 rounded-xl transition-colors relative z-10",
                                    isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                                )}
                            >
                                <Icon className="w-5.5 h-5.5" />
                            </motion.div>

                            {/* Label text */}
                            <span 
                                className={cn(
                                    "text-[9px] font-semibold tracking-wide transition-all mt-0.5 relative z-10",
                                    isActive ? "text-primary font-bold" : "text-muted-foreground/80"
                                )}
                            >
                                {item.name}
                            </span>

                            {/* Under-dot active indicator */}
                            {isActive && (
                                <motion.span 
                                    layoutId="mobile-nav-dot"
                                    className="absolute bottom-0.5 w-1 h-1 rounded-full bg-primary"
                                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                />
                            )}
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}
