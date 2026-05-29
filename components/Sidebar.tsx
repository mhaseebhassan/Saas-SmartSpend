"use client";

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
import { motion } from "framer-motion";

export default function Sidebar() {
    const pathname = usePathname();
    const { data: session } = useSession();

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
    const getInitials = (n) => {
        return n
            .split(" ")
            .map((item) => item[0])
            .join("")
            .substring(0, 2)
            .toUpperCase();
    };

    return (
        <motion.aside
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="hidden md:flex flex-col w-68 border-r border-white/5 bg-card/45 backdrop-blur-xl h-[calc(100vh-64px)] sticky top-16 p-4 overflow-y-auto select-none"
        >
            {/* User Profile Card */}
            <div className="flex items-center gap-3 p-3.5 bg-white/5 rounded-xl border border-white/5 mb-6 relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                
                {image ? (
                    <img 
                        src={image} 
                        alt={name} 
                        className="w-10 h-10 rounded-xl border border-white/10 shadow-sm object-cover" 
                    />
                ) : (
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-purple-500/20 flex items-center justify-center text-primary font-bold text-sm border border-white/5">
                        {getInitials(name)}
                    </div>
                )}

                <div className="flex flex-col min-w-0 flex-1">
                    <span className="text-sm font-semibold text-white/90 truncate leading-none mb-1 group-hover:text-primary transition-colors">
                        {name}
                    </span>
                    <span className="text-[10px] text-muted-foreground truncate leading-none mb-1.5">
                        {email}
                    </span>
                    
                    {/* Premium Plan Badges */}
                    {isPro ? (
                        <span className="text-[9px] tracking-wider font-extrabold text-amber-400 bg-amber-400/10 border border-amber-400/20 px-2 py-0.5 rounded-md w-fit uppercase shadow-[0_0_10px_rgba(245,158,11,0.1)]">
                            PRO
                        </span>
                    ) : (
                        <span className="text-[9px] tracking-wider font-extrabold text-muted-foreground bg-white/5 border border-white/10 px-2 py-0.5 rounded-md w-fit uppercase">
                            FREE
                        </span>
                    )}
                </div>
            </div>

            {/* Navigation Header */}
            <div className="font-semibold text-[10px] text-muted-foreground mb-3 px-3.5 uppercase tracking-widest">
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
                                "flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-medium transition-all group relative overflow-hidden",
                                isActive 
                                    ? "text-primary font-semibold" 
                                    : "text-muted-foreground hover:text-foreground"
                            )}
                        >
                            <Icon className={cn("w-4.5 h-4.5 transition-colors relative z-20 duration-200", 
                                isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                            )} />
                            <span className="relative z-20 flex-1">{link.name}</span>
                            
                            {/* Premium layoutId Active Indicator Pill */}
                            {isActive && (
                                <motion.div
                                    layoutId="active-nav"
                                    className="absolute inset-0 bg-primary/10 border-l-2 border-primary z-10 rounded-xl"
                                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                                />
                            )}

                            <ChevronRight className={cn(
                                "w-3.5 h-3.5 text-muted-foreground/30 relative z-20 group-hover:text-foreground transition-all group-hover:translate-x-0.5 duration-200 opacity-0 group-hover:opacity-100",
                                isActive && "opacity-0"
                            )} />
                        </Link>
                    );
                })}
            </div>
        </motion.aside>
    );
}
