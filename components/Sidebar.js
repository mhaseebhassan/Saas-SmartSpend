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

export default function Sidebar() {
    const pathname = usePathname();

    const links = [
        { name: "Overview", href: "/dashboard", icon: LayoutDashboard },
        { name: "Expenses", href: "/dashboard/expenses", icon: Wallet },
        { name: "Budgets", href: "/dashboard/budgets", icon: PiggyBank },
        { name: "Reports", href: "/dashboard/reports", icon: BarChart3 },
    ];

    return (
        <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="hidden md:flex flex-col w-64 border-r border-border bg-card/50 min-h-[calc(100vh-65px)] p-4"
        >
            <div className="font-semibold text-xs text-muted-foreground mb-4 px-4 uppercase tracking-wider">
                Menu
            </div>
            <div className="space-y-1">
                {links.map((link) => {
                    const Icon = link.icon;
                    const isActive = pathname === link.href;

                    return (
                        <Link
                            key={link.name}
                            href={link.href}
                            className={cn(
                                "flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all group relative overflow-hidden",
                                isActive
                                    ? "bg-primary/10 text-primary"
                                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                            )}
                        >
                            <Icon className={cn("w-5 h-5 transition-colors", isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground")} />
                            {link.name}
                            {isActive && (
                                <motion.div
                                    layoutId="sidebar-active"
                                    className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-r-full"
                                />
                            )}
                        </Link>
                    );
                })}
            </div>

            <div className="mt-auto pt-4 border-t border-border">
                <Link
                    href="#"
                    className={cn(
                        "flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-all"
                    )}
                >
                    <Settings className="w-5 h-5" />
                    Settings
                </Link>
            </div>
        </motion.div>
    );
}
