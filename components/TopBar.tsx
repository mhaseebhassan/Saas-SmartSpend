"use client";

import * as React from "react";
import { usePathname, useRouter } from "next/navigation";
import {
    Search,
    Bell,
    Menu,
    Sparkles,
    Check,
    Info,
    Calendar,
    AlertTriangle,
    X,
    Eye,
    Plus,
    Wallet,
    PiggyBank,
    Repeat
} from "lucide-react";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

export interface TopBarProps {
    onMenuClick?: () => void;
}

export default function TopBar({ onMenuClick }: TopBarProps) {
    const pathname = usePathname();
    const router = useRouter();
    const { data: session } = useSession();

    const [notifications, setNotifications] = React.useState([]);
    const [unreadCount, setUnreadCount] = React.useState(0);
    const [dropdownOpen, setDropdownOpen] = React.useState(false); // Used for notification drawer
    const [quickAddOpen, setQuickAddOpen] = React.useState(false);

    const dropdownRef = React.useRef<HTMLDivElement>(null);
    const quickAddRef = React.useRef<HTMLDivElement>(null);

    const getPageTitle = (path: string) => {
        if (path === "/dashboard") return "Dashboard Overview";
        if (path.startsWith("/dashboard/expenses")) return "Expense Manager";
        if (path.startsWith("/dashboard/budgets")) return "Budget Planner";
        if (path.startsWith("/dashboard/analytics")) return "Financial Analytics";
        if (path.startsWith("/dashboard/recurring")) return "Recurring Transactions";
        if (path.startsWith("/dashboard/settings")) return "Account Settings";
        if (path.startsWith("/dashboard/reports")) return "Financial Reports";
        return "Dashboard";
    };

    const fetchNotifications = React.useCallback(async () => {
        if (!session) return;
        try {
            const res = await fetch("/api/notifications");
            if (res.ok) {
                const data = await res.json();
                setNotifications(data.notifications || []);
                setUnreadCount(data.unreadCount || 0);
            }
        } catch (err) {
            console.error("Failed to fetch notifications:", err);
        }
    }, [session]);

    React.useEffect(() => {
        fetchNotifications();
        // Poll for notifications every 60 seconds
        const interval = setInterval(fetchNotifications, 60000);
        return () => clearInterval(interval);
    }, [fetchNotifications]);

    React.useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setDropdownOpen(false);
            }
            if (quickAddRef.current && !quickAddRef.current.contains(event.target as Node)) {
                setQuickAddOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const markAllAsRead = async () => {
        try {
            const res = await fetch("/api/notifications", { method: "PATCH" });
            if (res.ok) {
                setNotifications((prev) => prev.map((n: any) => ({ ...n, isRead: true })));
                setUnreadCount(0);
            }
        } catch (err) {
            console.error("Failed to mark all notifications as read:", err);
        }
    };

    const handleNotificationClick = async (notif: any) => {
        if (!notif.isRead) {
            try {
                await fetch(`/api/notifications/${notif._id}`, { method: "PATCH" });
                setNotifications((prev) =>
                    prev.map((n: any) => (n._id === notif._id ? { ...n, isRead: true } : n))
                );
                setUnreadCount((prev) => Math.max(0, prev - 1));
            } catch (err) {
                console.error("Failed to mark notification as read:", err);
            }
        }
        setDropdownOpen(false);
        if (notif.link) {
            router.push(notif.link);
        }
    };

    const timeAgo = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
        if (seconds < 60) return "just now";
        const minutes = Math.floor(seconds / 60);
        if (minutes < 60) return `${minutes}m ago`;
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `${hours}h ago`;
        const days = Math.floor(hours / 24);
        return `${days}d ago`;
    };

    const getIcon = (type: string) => {
        switch (type) {
            case "budget":
                return <AlertTriangle className="h-4.5 w-4.5 text-amber-500 shrink-0 animate-pulse" />;
            case "recurring":
                return <Calendar className="h-4.5 w-4.5 text-emerald-500 shrink-0" />;
            case "subscription":
                return <Sparkles className="h-4.5 w-4.5 text-purple-400 shrink-0" />;
            default:
                return <Info className="h-4.5 w-4.5 text-cyan-400 shrink-0" />;
        }
    };

    // Group notifications elegantly by category type
    const groupedNotifications = React.useMemo(() => {
        const groups = [
            {
                title: "Budget Alerts",
                type: "budget",
                items: notifications.filter((n: any) => n.type === "budget"),
                icon: <AlertTriangle className="h-4 w-4 text-amber-500" />
            },
            {
                title: "Bills & Subscriptions",
                type: "recurring",
                items: notifications.filter((n: any) => n.type === "recurring" || n.type === "subscription"),
                icon: <Calendar className="h-4 w-4 text-emerald-500" />
            },
            {
                title: "System & Info",
                type: "info",
                items: notifications.filter((n: any) => n.type !== "budget" && n.type !== "recurring" && n.type !== "subscription"),
                icon: <Info className="h-4 w-4 text-cyan-400" />
            }
        ];
        return groups.filter(g => g.items.length > 0);
    }, [notifications]);

    return (
        <header 
            className={cn(
                "sticky top-16 flex h-16 w-full items-center justify-between border-b border-white/[0.04] bg-[#0A0E1A]/60 backdrop-blur-xl px-4 md:px-8 select-none transition-all duration-200",
                (dropdownOpen || quickAddOpen) ? "z-[1000]" : "z-30"
            )}
        >
            {/* Page Title with dynamic mount slide-down */}
            <div className="flex items-center gap-4 min-w-0">
                <motion.div
                    key={pathname}
                    initial={{ y: -8, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                    className="flex flex-col text-left min-w-0"
                >
                    <h1 className="text-base sm:text-xl font-extrabold tracking-tight flex items-center gap-2 min-w-0">
                        <span className="bg-gradient-to-r from-cyan-400 via-violet-500 to-pink-500 bg-clip-text text-transparent truncate block">
                            {getPageTitle(pathname)}
                        </span>
                        {pathname === "/dashboard" && (
                            <Sparkles className="w-4.5 h-4.5 text-cyan-400 animate-pulse shrink-0" />
                        )}
                    </h1>
                    <p className="text-[10px] text-[#94A3B8] hidden sm:block font-medium truncate">
                        Manage, analyze, and optimize your financials.
                    </p>
                </motion.div>
            </div>

            {/* Global Actions Block */}
            <div className="flex items-center gap-3 shrink-0">
                {/* Simulated Global Search Box */}
                <div className="relative hidden sm:block w-48 md:w-64 group">
                    <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#94A3B8]/60 transition-colors group-focus-within:text-cyan-400" />
                    <input
                        type="text"
                        placeholder="Search anything..."
                        className="h-9 w-full rounded-full border border-white/[0.06] bg-[#111827]/40 pl-10 pr-4 text-xs text-[#F1F5F9] placeholder:text-[#64748B] focus:outline-none focus:border-cyan-400/50 focus:ring-2 focus:ring-cyan-400/10 transition-all duration-300"
                    />
                </div>

                {/* Quick Add Button */}
                <div className="relative" ref={quickAddRef}>
                    <motion.button
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => setQuickAddOpen(!quickAddOpen)}
                        className="relative hidden sm:flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-gradient-to-r from-cyan-500 via-violet-500 to-pink-500 hover:shadow-[0_0_20px_rgba(6,182,212,0.4)] text-white text-xs font-semibold tracking-wide transition-all cursor-pointer shadow-lg active:scale-95 duration-200"
                    >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Quick Add</span>
                    </motion.button>
                    {/* Mobile version (Icon only pill) */}
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setQuickAddOpen(!quickAddOpen)}
                        className="relative sm:hidden flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-r from-cyan-500 via-violet-500 to-pink-500 hover:shadow-[0_0_20px_rgba(6,182,212,0.4)] text-white transition-all cursor-pointer shadow-lg"
                    >
                        <Plus className="w-4 h-4" />
                    </motion.button>

                    <AnimatePresence>
                        {quickAddOpen && (
                            <motion.div
                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                transition={{ duration: 0.15, type: "spring", stiffness: 400, damping: 25 }}
                                className="absolute right-0 mt-2 w-48 rounded-2xl border border-white/[0.08] bg-[#1A2035]/95 backdrop-blur-2xl shadow-2xl z-[999] overflow-hidden p-1.5"
                            >
                                <div className="text-[10px] uppercase font-bold text-[#94A3B8] tracking-wider px-3.5 py-2 select-none border-b border-white/[0.04] mb-1">
                                    Quick Actions
                                </div>
                                <button
                                    onClick={() => {
                                        setQuickAddOpen(false);
                                        router.push("/dashboard/expenses?action=new");
                                    }}
                                    className="flex items-center gap-2.5 w-full px-3 py-2 rounded-xl text-xs text-[#F1F5F9] hover:bg-white/5 transition-all text-left font-medium cursor-pointer"
                                >
                                    <Wallet className="w-4 h-4 text-emerald-400" />
                                    <span>Add Expense</span>
                                </button>
                                <button
                                    onClick={() => {
                                        setQuickAddOpen(false);
                                        router.push("/dashboard/budgets?action=new");
                                    }}
                                    className="flex items-center gap-2.5 w-full px-3 py-2 rounded-xl text-xs text-[#F1F5F9] hover:bg-white/5 transition-all text-left font-medium cursor-pointer"
                                >
                                    <PiggyBank className="w-4 h-4 text-cyan-400" />
                                    <span>Create Budget</span>
                                </button>
                                <button
                                    onClick={() => {
                                        setQuickAddOpen(false);
                                        router.push("/dashboard/recurring?action=new");
                                    }}
                                    className="flex items-center gap-2.5 w-full px-3 py-2 rounded-xl text-xs text-[#F1F5F9] hover:bg-white/5 transition-all text-left font-medium cursor-pointer"
                                >
                                    <Repeat className="w-4 h-4 text-purple-400" />
                                    <span>Set Recurring</span>
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Interactive Bell Notification Drawer Trigger */}
                <div className="relative" ref={dropdownRef}>
                    <button
                        onClick={() => setDropdownOpen(!dropdownOpen)}
                        className={cn(
                            "relative p-2 rounded-xl text-[#94A3B8] hover:text-[#F1F5F9] hover:bg-white/5 border border-white/[0.06] transition-colors cursor-pointer group",
                            dropdownOpen && "text-[#F1F5F9] bg-white/5 border-cyan-400/20"
                        )}
                    >
                        <Bell className="h-4.5 w-4.5 group-hover:rotate-12 transition-transform duration-200" />
                        {/* Glowing Notification Dot if unread exists */}
                        {unreadCount > 0 && (
                            <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-400" />
                            </span>
                        )}
                    </button>

                    <AnimatePresence>
                        {dropdownOpen && (
                            <>
                                {/* Drawer Backdrop overlay */}
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    onClick={() => setDropdownOpen(false)}
                                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[998]"
                                />

                                {/* Drawer Slide-out Panel */}
                                <motion.div
                                    initial={{ x: "100%" }}
                                    animate={{ x: 0 }}
                                    exit={{ x: "100%" }}
                                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                                    className="fixed right-0 top-0 h-full w-full sm:w-[420px] bg-[#0A0E1A]/95 backdrop-blur-2xl border-l border-white/[0.08] shadow-2xl z-[999] flex flex-col overflow-hidden"
                                >
                                    {/* Drawer Header */}
                                    <div className="flex items-center justify-between border-b border-white/[0.06] px-6 py-5 bg-[#0A0E1A]/40">
                                        <div className="flex items-center gap-2.5">
                                            <Bell className="h-5 w-5 text-cyan-400 animate-bounce" />
                                            <h3 className="font-bold text-base text-[#F1F5F9]">Notifications</h3>
                                            {unreadCount > 0 && (
                                                <span className="px-2.5 py-0.5 rounded-full text-[10px] bg-cyan-400/10 text-cyan-400 border border-cyan-400/20 font-bold">
                                                    {unreadCount} new
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {unreadCount > 0 && (
                                                <button
                                                    onClick={markAllAsRead}
                                                    className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1.5 transition-colors cursor-pointer mr-2 font-semibold"
                                                >
                                                    <Check className="h-3.5 w-3.5" />
                                                    <span>Mark all read</span>
                                                </button>
                                            )}
                                            <button
                                                onClick={() => setDropdownOpen(false)}
                                                className="p-1.5 rounded-lg text-[#94A3B8] hover:text-[#F1F5F9] hover:bg-white/5 transition-colors cursor-pointer"
                                            >
                                                <X className="h-5 w-5" />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Scrollable Drawer Body */}
                                    <div className="flex-1 overflow-y-auto p-6 space-y-6">
                                        {notifications.length === 0 ? (
                                            <div className="flex flex-col items-center justify-center h-full py-20 px-4 text-center select-none">
                                                <div className="p-4 bg-white/[0.04] border border-white/[0.06] rounded-full mb-4 text-slate-500 shadow-[0_0_30px_rgba(6,182,212,0.05)]">
                                                    <Bell className="h-8 w-8 text-cyan-400" />
                                                </div>
                                                <p className="text-base text-[#F1F5F9] font-semibold">All caught up!</p>
                                                <p className="text-xs text-[#94A3B8] mt-1.5 max-w-[240px] leading-relaxed">
                                                    You don't have any notifications or financial alerts at the moment.
                                                </p>
                                            </div>
                                        ) : (
                                            groupedNotifications.map((group) => (
                                                <div key={group.title} className="space-y-3">
                                                    {/* Group Header */}
                                                    <div className="flex items-center gap-2 px-1 text-[11px] font-bold text-[#94A3B8] tracking-wider uppercase">
                                                        {group.icon}
                                                        <span>{group.title}</span>
                                                        <span className="text-[10px] font-normal text-[#64748B] normal-case ml-auto">
                                                            ({group.items.length})
                                                        </span>
                                                    </div>

                                                    {/* Notifications in group */}
                                                    <div className="space-y-2.5">
                                                        {group.items.map((notif: any) => (
                                                            <div
                                                                key={notif._id}
                                                                onClick={() => handleNotificationClick(notif)}
                                                                className={cn(
                                                                    "flex gap-3 px-4 py-3.5 rounded-xl border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.05] hover:border-cyan-400/20 hover:shadow-[0_0_20px_rgba(6,182,212,0.05)] transition-all duration-200 cursor-pointer relative overflow-hidden group/item",
                                                                    !notif.isRead && "bg-cyan-500/[0.02] border-cyan-500/10"
                                                                )}
                                                            >
                                                                {/* Subtle Unread status background glow */}
                                                                {!notif.isRead && (
                                                                    <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 to-transparent pointer-events-none" />
                                                                )}

                                                                {/* Icon Container */}
                                                                <div className="p-2 rounded-xl bg-[#111827]/60 border border-white/[0.06] shrink-0 h-10 w-10 flex items-center justify-center">
                                                                    {getIcon(notif.type)}
                                                                </div>

                                                                <div className="flex-1 min-w-0">
                                                                    <div className="flex items-start justify-between gap-2">
                                                                        <p className={cn(
                                                                            "text-xs font-semibold text-[#F1F5F9] truncate group-hover/item:text-cyan-400 transition-colors",
                                                                            !notif.isRead && "text-white font-bold"
                                                                        )}>
                                                                            {notif.title}
                                                                        </p>
                                                                        <span className="text-[10px] text-[#64748B] shrink-0 mt-0.5 font-medium">
                                                                            {timeAgo(notif.createdAt)}
                                                                        </span>
                                                                    </div>
                                                                    <p className="text-xs text-[#94A3B8] leading-normal mt-1 line-clamp-2">
                                                                        {notif.message}
                                                                    </p>
                                                                </div>

                                                                {/* Unread Glowing indicator dot */}
                                                                {!notif.isRead && (
                                                                    <div className="absolute right-3 top-1/2 -translate-y-1/2 flex h-2 w-2">
                                                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
                                                                        <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-400" />
                                                                    </div>
                                                                )}
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>

                                    {/* Drawer Footer */}
                                    {notifications.length > 0 && (
                                        <div className="border-t border-white/[0.06] px-6 py-4 bg-[#0A0E1A]/40 text-center text-[11px] text-[#64748B] font-semibold">
                                            Stay on top of your financial alerts
                                        </div>
                                    )}
                                </motion.div>
                            </>
                        )}
                    </AnimatePresence>
                </div>

                {/* Mobile User Profile Avatar (visible only on mobile) */}
                <div className="md:hidden w-8 h-8 rounded-full border border-white/[0.06] bg-cyan-500/10 flex items-center justify-center text-xs font-bold text-cyan-400 overflow-hidden shadow-md">
                    {session?.user?.image ? (
                        <img src={session.user.image} alt="User avatar" className="w-full h-full object-cover" />
                    ) : (
                        <span>{session?.user?.name ? session.user.name[0].toUpperCase() : "S"}</span>
                    )}
                </div>
            </div>
        </header>
    );
}
