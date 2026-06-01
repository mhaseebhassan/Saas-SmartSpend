"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import {
    LayoutDashboard,
    Wallet,
    PiggyBank,
    BarChart3,
    Repeat,
    Settings,
    User,
    ChevronRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

export default function Sidebar() {
    const pathname = usePathname();
    const { data: session } = useSession();
    const [isExpanded, setIsExpanded] = useState(false);

    const links = [
        { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
        { name: "Expenses", href: "/dashboard/expenses", icon: Wallet },
        { name: "Budgets", href: "/dashboard/budgets", icon: PiggyBank },
        { name: "Analytics", href: "/dashboard/analytics", icon: BarChart3 },
        { name: "Recurring", href: "/dashboard/recurring", icon: Repeat },
        { name: "Settings", href: "/dashboard/settings", icon: Settings },
    ];

    // Read user details from session with fallback values
    const user = session?.user;
    const isPro = user?.isPro === true;
    const name = user?.name || "Smart Spender";
    const email = user?.email || "spending@smart.com";
    const image = user?.image;

    // Colored Fallback for Avatar
    const getInitials = (n: string) => {
        return n
            .split(" ")
            .map((item) => item[0])
            .join("")
            .substring(0, 2)
            .toUpperCase();
    };

    return (
        <motion.aside
            initial={{ x: -20, opacity: 0, width: 72 }}
            animate={{ 
                x: 0, 
                opacity: 1, 
                width: isExpanded ? 260 : 72 
            }}
            transition={{
                x: { duration: 0.4, ease: [0.16, 1, 0.3, 1] },
                opacity: { duration: 0.4, ease: [0.16, 1, 0.3, 1] },
                width: { type: "spring", stiffness: 400, damping: 25 }
            }}
            onMouseEnter={() => setIsExpanded(true)}
            onMouseLeave={() => setIsExpanded(false)}
            className="hidden md:flex flex-col border-r border-white/[0.04] bg-[#05070F]/80 backdrop-blur-2xl h-[calc(100vh-64px)] sticky top-16 p-3 select-none z-30 overflow-visible flex-shrink-0"
        >
            {/* User Profile Card with layout transition matching */}
            <motion.div
                layout
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
                className={cn(
                    "flex items-center bg-[#111827]/60 backdrop-blur-xl border border-white/[0.06] mb-6 relative overflow-hidden group transition-colors duration-300",
                    isExpanded ? "p-3 rounded-xl gap-3 w-full" : "p-1 rounded-xl justify-center h-12 w-12 mx-auto"
                )}
            >
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                
                {image ? (
                    <img 
                        src={image} 
                        alt={name} 
                        className="w-10 h-10 rounded-xl border border-white/[0.06] shadow-sm object-cover flex-shrink-0" 
                    />
                ) : (
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/20 to-violet-500/20 flex items-center justify-center text-cyan-400 font-bold text-sm border border-white/[0.06] flex-shrink-0">
                        {getInitials(name)}
                    </div>
                )}

                <AnimatePresence initial={false}>
                    {isExpanded && (
                        <motion.div 
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -10 }}
                            transition={{ duration: 0.2 }}
                            className="flex flex-col min-w-0 flex-1 overflow-hidden text-left"
                        >
                            <span className="text-sm font-semibold text-[#F1F5F9] leading-tight mb-1 group-hover:text-cyan-400 transition-colors block break-words">
                                {name}
                            </span>
                            <span className="text-[10px] text-[#94A3B8] leading-tight mb-1.5 block break-all">
                                {email}
                            </span>
                            
                            {/* Premium Plan Badges */}
                            {isPro ? (
                                <span className="text-[9px] tracking-wider font-extrabold text-amber-400 bg-amber-400/10 border border-amber-400/20 px-2 py-0.5 rounded-md inline-block w-fit uppercase shadow-[0_0_10px_rgba(245,158,11,0.1)]">
                                    PRO
                                </span>
                            ) : (
                                <span className="text-[9px] tracking-wider font-extrabold text-[#94A3B8] bg-white/5 border border-white/10 px-2 py-0.5 rounded-md inline-block w-fit uppercase">
                                    FREE
                                </span>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>

            {/* Navigation Header */}
            <div className={cn(
                "font-semibold text-[10px] text-[#94A3B8]/60 mb-3 uppercase tracking-widest transition-all duration-300 truncate",
                isExpanded ? "px-3.5 opacity-100" : "px-0 opacity-0 h-0 overflow-hidden mb-0"
            )}>
                Main Menu
            </div>

            {/* Links Block */}
            <div className="space-y-1.5 flex-1">
                {links.map((link) => {
                    const Icon = link.icon;
                    const isActive = pathname === link.href;

                    return (
                        <Link
                            key={link.name}
                            href={link.href}
                            className={cn(
                                "flex items-center group relative overflow-visible transition-colors duration-200",
                                isExpanded 
                                    ? "px-3.5 py-3 rounded-xl gap-3 text-sm font-medium" 
                                    : "mx-auto w-12 h-12 rounded-xl justify-center text-sm font-medium",
                                isActive 
                                    ? "text-cyan-400 font-semibold" 
                                    : "text-[#94A3B8] hover:text-[#F1F5F9]"
                            )}
                        >
                            <Icon className={cn("w-[18px] h-[18px] transition-colors relative z-20 duration-200 flex-shrink-0", 
                                isActive ? "text-cyan-400" : "text-[#94A3B8] group-hover:text-[#F1F5F9]"
                            )} />
                            
                            <AnimatePresence initial={false}>
                                {isExpanded && (
                                    <motion.span 
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -10 }}
                                        transition={{ duration: 0.2 }}
                                        className="relative z-20 flex-1 truncate text-sm font-medium"
                                    >
                                        {link.name}
                                    </motion.span>
                                )}
                            </AnimatePresence>
                            
                            {/* Premium Active Indicator Pill background */}
                            {isActive && (
                                <motion.div
                                    layoutId="active-nav-pill"
                                    className="absolute inset-0 bg-white/[0.03] z-10 rounded-xl"
                                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                                />
                            )}

                            {/* Neon aurora gradient vertical left bar */}
                            {isActive && (
                                <motion.div
                                    layoutId="active-indicator-line"
                                    className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-6 rounded-r-full bg-gradient-to-b from-cyan-400 via-violet-400 to-pink-400 shadow-[0_0_12px_rgba(6,182,212,0.6)] z-30"
                                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                                />
                            )}

                            {isExpanded && (
                                <ChevronRight className={cn(
                                    "w-3.5 h-3.5 text-[#94A3B8]/60 relative z-20 group-hover:text-[#F1F5F9] transition-all group-hover:translate-x-0.5 duration-200 opacity-0 group-hover:opacity-100",
                                    isActive && "opacity-0"
                                )} />
                            )}

                            {/* Premium Collapsed Tooltip matching Midnight Aurora style */}
                            {!isExpanded && (
                                <div className="absolute left-full ml-4 px-3 py-1.5 rounded-lg bg-[#1A2035]/95 border border-white/[0.08] text-xs font-semibold text-[#F1F5F9] shadow-[0_4px_20px_rgba(0,0,0,0.4),0_0_15px_rgba(6,182,212,0.1)] opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200 pointer-events-none whitespace-nowrap z-50">
                                    {link.name}
                                </div>
                            )}
                        </Link>
                    );
                })}
            </div>
        </motion.aside>
    );
}
