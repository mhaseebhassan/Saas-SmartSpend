"use client";

import * as React from "react";
import { usePathname, useRouter } from "next/navigation";
import { Search, Bell, Menu, Sparkles, Check, Info, Calendar, AlertTriangle, X, Eye } from "lucide-react";
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
    const [dropdownOpen, setDropdownOpen] = React.useState(false);
    const dropdownRef = React.useRef(null);

    const getPageTitle = (path) => {
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
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setDropdownOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const markAllAsRead = async () => {
        try {
            const res = await fetch("/api/notifications", { method: "PATCH" });
            if (res.ok) {
                setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
                setUnreadCount(0);
            }
        } catch (err) {
            console.error("Failed to mark all notifications as read:", err);
        }
    };

    const handleNotificationClick = async (notif) => {
        if (!notif.isRead) {
            try {
                await fetch(`/api/notifications/${notif._id}`, { method: "PATCH" });
                setNotifications((prev) =>
                    prev.map((n) => (n._id === notif._id ? { ...n, isRead: true } : n))
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

    const timeAgo = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const seconds = Math.floor((now - date) / 1000);
        if (seconds < 60) return "just now";
        const minutes = Math.floor(seconds / 60);
        if (minutes < 60) return `${minutes}m ago`;
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `${hours}h ago`;
        const days = Math.floor(hours / 24);
        return `${days}d ago`;
    };

    const getIcon = (type) => {
        switch (type) {
            case "budget":
                return <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0" />;
            case "recurring":
                return <Calendar className="h-4 w-4 text-emerald-500 shrink-0" />;
            case "subscription":
                return <Sparkles className="h-4 w-4 text-purple-400 shrink-0" />;
            default:
                return <Info className="h-4 w-4 text-indigo-400 shrink-0" />;
        }
    };

    return (
        <header className="sticky top-16 z-30 flex h-16 w-full items-center justify-between border-b border-white/5 bg-background/60 backdrop-blur-xl px-4 md:px-8 select-none">
            {/* Page Title with dynamic mount slide-down */}
            <div className="flex items-center gap-4">
                <motion.div
                    key={pathname}
                    initial={{ y: -8, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                    className="flex flex-col text-left"
                >
                    <h1 className="text-lg font-bold tracking-tight text-white flex items-center gap-2">
                        {getPageTitle(pathname)}
                        {pathname === "/dashboard" && (
                            <Sparkles className="w-4 h-4 text-primary animate-pulse" />
                        )}
                    </h1>
                    <p className="text-[10px] text-muted-foreground hidden sm:block">
                        Manage, analyze, and optimize your financials.
                    </p>
                </motion.div>
            </div>

            {/* Global Actions Block */}
            <div className="flex items-center gap-3">
                {/* Simulated Global Search Box */}
                <div className="relative hidden sm:block w-48 md:w-64">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/60 transition-colors group-hover:text-foreground" />
                    <input
                        type="text"
                        placeholder="Search anything..."
                        className="h-9 w-full rounded-full border border-white/5 bg-secondary/20 pl-9 pr-4 text-xs text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all"
                    />
                </div>

                {/* Search Trigger for Mobile viewports */}
                <button className="sm:hidden p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors cursor-pointer">
                    <Search className="h-4.5 w-4.5" />
                </button>

                {/* Interactive Bell Notification Trigger & Dropdown */}
                <div className="relative" ref={dropdownRef}>
                    <button
                        onClick={() => setDropdownOpen(!dropdownOpen)}
                        className={cn(
                            "relative p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors cursor-pointer group",
                            dropdownOpen && "text-foreground bg-white/5"
                        )}
                    >
                        <Bell className="h-4.5 w-4.5 group-hover:rotate-12 transition-transform duration-200" />
                        {/* Glowing Notification Dot if unread exists */}
                        {unreadCount > 0 && (
                            <span className="absolute top-2 right-2.5 flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#6366F1] opacity-75" />
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#6366F1]" />
                            </span>
                        )}
                    </button>

                    <AnimatePresence>
                        {dropdownOpen && (
                            <motion.div
                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                transition={{ duration: 0.15 }}
                                className="absolute right-0 mt-2 w-80 md:w-96 rounded-2xl border border-[#2A2D3E] bg-[#1A1D2E] shadow-2xl z-[999] overflow-hidden"
                            >
                                <div className="flex items-center justify-between border-b border-[#2A2D3E] px-4 py-3 bg-[#121420]">
                                    <div className="flex items-center gap-2">
                                        <h3 className="font-semibold text-sm text-white">Notifications</h3>
                                        {unreadCount > 0 && (
                                            <span className="px-2 py-0.5 rounded-full text-[10px] bg-[#6366F1]/20 text-[#6366F1] font-bold">
                                                {unreadCount} new
                                            </span>
                                        )}
                                    </div>
                                    {unreadCount > 0 && (
                                        <button
                                            onClick={markAllAsRead}
                                            className="text-xs text-primary hover:text-primary-hover flex items-center gap-1 transition-colors cursor-pointer"
                                        >
                                            <Check className="h-3.5 w-3.5" />
                                            Mark all read
                                        </button>
                                    )}
                                </div>

                                <div className="max-h-[350px] overflow-y-auto divide-y divide-[#2A2D3E]/40">
                                    {notifications.length === 0 ? (
                                        <div className="flex flex-col items-center justify-center py-10 px-4 text-center select-none">
                                            <div className="p-3 bg-white/5 rounded-full mb-3 text-muted-foreground/60">
                                                <Bell className="h-6 w-6" />
                                            </div>
                                            <p className="text-sm text-gray-300 font-medium">All caught up!</p>
                                            <p className="text-xs text-muted-foreground mt-1">No notifications received yet.</p>
                                        </div>
                                    ) : (
                                        notifications.map((notif) => (
                                            <div
                                                key={notif._id}
                                                onClick={() => handleNotificationClick(notif)}
                                                className={cn(
                                                    "flex gap-3 px-4 py-3 hover:bg-[#121420]/30 transition-colors cursor-pointer relative",
                                                    !notif.isRead && "bg-[#6366F1]/5"
                                                )}
                                            >
                                                {getIcon(notif.type)}
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center justify-between gap-2">
                                                        <p className={cn(
                                                            "text-xs font-semibold text-gray-100 truncate",
                                                            !notif.isRead && "text-[#818CF8]"
                                                        )}>
                                                            {notif.title}
                                                        </p>
                                                        <span className="text-[10px] text-muted-foreground shrink-0">
                                                            {timeAgo(notif.createdAt)}
                                                        </span>
                                                    </div>
                                                    <p className="text-xs text-gray-400 leading-normal mt-0.5 line-clamp-2">
                                                        {notif.message}
                                                    </p>
                                                </div>
                                                {!notif.isRead && (
                                                    <div className="absolute right-2 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-[#6366F1]" />
                                                )}
                                            </div>
                                        ))
                                    )}
                                </div>

                                {notifications.length > 0 && (
                                    <div className="border-t border-[#2A2D3E] px-4 py-2 text-center bg-[#121420] text-[11px] text-muted-foreground">
                                        Stay on top of your financial alerts
                                    </div>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Mobile User Profile Avatar (visible only on mobile) */}
                <div className="md:hidden w-8 h-8 rounded-full border border-white/10 bg-primary/10 flex items-center justify-center text-xs font-bold text-primary overflow-hidden">
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
