"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
    Search,
    Bell,
    Check,
    X,
    Plus,
    Wallet,
    PiggyBank,
    Menu,
    LogOut,
    LayoutDashboard,
    PieChart,
    Settings,
    Repeat
} from "lucide-react";
import { useSession, signOut } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/Logo";

export default function TopBar() {
    const pathname = usePathname();
    const router = useRouter();
    const { data: session } = useSession();

    const [notifications, setNotifications] = React.useState<any[]>([]);
    const [unreadCount, setUnreadCount] = React.useState(0);
    const [dropdownOpen, setDropdownOpen] = React.useState(false);
    const [quickAddOpen, setQuickAddOpen] = React.useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
    const [userMenuOpen, setUserMenuOpen] = React.useState(false);

    const dropdownRef = React.useRef<HTMLDivElement>(null);
    const quickAddRef = React.useRef<HTMLDivElement>(null);
    const userMenuRef = React.useRef<HTMLDivElement>(null);

    const navLinks = [
        { name: "Overview", href: "/dashboard", icon: LayoutDashboard },
        { name: "Expenses", href: "/dashboard/expenses", icon: Wallet },
        { name: "Budgets", href: "/dashboard/budgets", icon: PiggyBank },
        { name: "Analytics", href: "/dashboard/analytics", icon: PieChart },
        { name: "Recurring", href: "/dashboard/recurring", icon: Repeat },
        { name: "Settings", href: "/dashboard/settings", icon: Settings },
    ];

    const fetchNotifications = React.useCallback(async () => {
        if (!session) return;
        try {
            const res = await fetch("/api/notifications");
            if (res.ok) {
                const data = await res.json();
                setNotifications(data.notifications || []);
                setUnreadCount(data.unreadCount || 0);
            }
        } catch (err) {}
    }, [session]);

    React.useEffect(() => {
        fetchNotifications();
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
            if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
                setUserMenuOpen(false);
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
        } catch (err) {}
    };

    const handleNotificationClick = async (notif: any) => {
        if (!notif.isRead) {
            try {
                await fetch(`/api/notifications/${notif._id}`, { method: "PATCH" });
                setNotifications((prev) =>
                    prev.map((n: any) => (n._id === notif._id ? { ...n, isRead: true } : n))
                );
                setUnreadCount((prev) => Math.max(0, prev - 1));
            } catch (err) {}
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

    return (
        <header className="sticky top-0 w-full border-b border-white/[0.06] bg-[#0A0A0A]/90 backdrop-blur-xl z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex h-16 items-center justify-between">
                    {/* Left: Logo & Mobile Toggle */}
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="md:hidden p-2 -ml-2 rounded-lg text-white/70 hover:text-white hover:bg-white/[0.04]"
                        >
                            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                        </button>
                        
                        <Link href="/" className="flex items-center gap-2 group">
                            <Logo className="w-6 h-6 text-white group-hover:text-emerald-400 transition-colors" />
                            <span className="font-bold text-lg hidden sm:block text-white tracking-tight">
                                SmartSpend
                            </span>
                        </Link>
                    </div>

                    {/* Center: Desktop Navigation */}
                    <nav className="hidden md:flex items-center gap-1">
                        {navLinks.map((link) => {
                            const isActive = pathname === link.href;
                            return (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className={cn(
                                        "px-3 py-1.5 rounded-md text-sm font-medium transition-colors",
                                        isActive 
                                            ? "bg-white/[0.08] text-white" 
                                            : "text-white/50 hover:text-white hover:bg-white/[0.04]"
                                    )}
                                >
                                    {link.name}
                                </Link>
                            );
                        })}
                    </nav>

                    {/* Right: Actions & User */}
                    <div className="flex items-center gap-2 sm:gap-3">
                        {/* Quick Add */}
                        <div className="relative" ref={quickAddRef}>
                            <button
                                onClick={() => setQuickAddOpen(!quickAddOpen)}
                                className="flex items-center justify-center w-8 h-8 rounded-full bg-emerald-500 text-emerald-950 hover:bg-emerald-400 transition-all shadow-sm"
                            >
                                <Plus className="w-4 h-4" />
                            </button>

                            <AnimatePresence>
                                {quickAddOpen && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 5, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: 5, scale: 0.95 }}
                                        transition={{ duration: 0.15 }}
                                        className="absolute right-0 mt-2 w-48 rounded-xl border border-white/[0.08] bg-[#111111] shadow-2xl p-1 z-50"
                                    >
                                        <div className="text-[10px] text-white/40 font-medium px-3 py-2 uppercase tracking-wider">
                                            Quick Actions
                                        </div>
                                        <button
                                            onClick={() => {
                                                setQuickAddOpen(false);
                                                router.push("/dashboard/expenses?action=new");
                                            }}
                                            className="flex items-center gap-2.5 w-full px-3 py-2 rounded-lg text-sm text-white hover:bg-white/[0.04] transition-colors"
                                        >
                                            <Wallet className="w-4 h-4 text-white/60" />
                                            <span>Add Expense</span>
                                        </button>
                                        <button
                                            onClick={() => {
                                                setQuickAddOpen(false);
                                                router.push("/dashboard/budgets?action=new");
                                            }}
                                            className="flex items-center gap-2.5 w-full px-3 py-2 rounded-lg text-sm text-white hover:bg-white/[0.04] transition-colors"
                                        >
                                            <PiggyBank className="w-4 h-4 text-white/60" />
                                            <span>Create Budget</span>
                                        </button>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Notifications */}
                        <div className="relative" ref={dropdownRef}>
                            <button
                                onClick={() => setDropdownOpen(!dropdownOpen)}
                                className={cn(
                                    "relative flex items-center justify-center w-8 h-8 rounded-full text-white/70 hover:text-white hover:bg-white/[0.06] transition-colors border border-white/[0.06]",
                                    dropdownOpen && "bg-white/[0.06] text-white"
                                )}
                            >
                                <Bell className="h-4 w-4" />
                                {unreadCount > 0 && (
                                    <span className="absolute top-0 right-0 w-2 h-2 rounded-full bg-emerald-500 border-2 border-[#0A0A0A]" />
                                )}
                            </button>

                            <AnimatePresence>
                                {dropdownOpen && (
                                    <>
                                        <motion.div
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            onClick={() => setDropdownOpen(false)}
                                            className="fixed inset-0 bg-black/40 z-40 md:hidden"
                                        />
                                        <motion.div
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: 10 }}
                                            className="absolute right-0 top-full mt-2 w-80 sm:w-96 rounded-xl border border-white/[0.08] bg-[#111111] shadow-2xl z-50 flex flex-col max-h-[80vh]"
                                        >
                                            <div className="flex items-center justify-between border-b border-white/[0.04] px-4 py-3">
                                                <h3 className="font-medium text-sm text-white">Notifications</h3>
                                                {unreadCount > 0 && (
                                                    <button
                                                        onClick={markAllAsRead}
                                                        className="text-xs text-white/50 hover:text-white transition-colors"
                                                    >
                                                        Mark all read
                                                    </button>
                                                )}
                                            </div>
                                            <div className="flex-1 overflow-y-auto p-2">
                                                {notifications.length === 0 ? (
                                                    <div className="flex flex-col items-center justify-center py-8 text-white/30 text-sm">
                                                        No new notifications
                                                    </div>
                                                ) : (
                                                    <div className="space-y-1">
                                                        {notifications.map((notif: any) => (
                                                            <div
                                                                key={notif._id}
                                                                onClick={() => handleNotificationClick(notif)}
                                                                className={cn(
                                                                    "p-3 rounded-lg border border-transparent hover:bg-white/[0.03] transition-colors cursor-pointer",
                                                                    !notif.isRead && "bg-white/[0.02] border-white/[0.04]"
                                                                )}
                                                            >
                                                                <div className="flex justify-between items-start mb-1">
                                                                    <span className={cn(
                                                                        "text-sm font-medium",
                                                                        !notif.isRead ? "text-white" : "text-white/60"
                                                                    )}>
                                                                        {notif.title}
                                                                    </span>
                                                                    <span className="text-xs text-white/40 shrink-0">
                                                                        {timeAgo(notif.createdAt)}
                                                                    </span>
                                                                </div>
                                                                <p className="text-sm text-white/50 line-clamp-2">
                                                                    {notif.message}
                                                                </p>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </motion.div>
                                    </>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* User Menu */}
                        <div className="relative" ref={userMenuRef}>
                            <button
                                onClick={() => setUserMenuOpen(!userMenuOpen)}
                                className="w-8 h-8 rounded-full border border-white/[0.1] bg-white/[0.02] flex items-center justify-center text-xs font-medium text-white overflow-hidden"
                            >
                                {session?.user?.image ? (
                                    <img src={session.user.image} alt="User" className="w-full h-full object-cover" />
                                ) : (
                                    <span>{session?.user?.name ? session.user.name[0].toUpperCase() : "U"}</span>
                                )}
                            </button>

                            <AnimatePresence>
                                {userMenuOpen && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 5, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: 5, scale: 0.95 }}
                                        transition={{ duration: 0.15 }}
                                        className="absolute right-0 mt-2 w-56 rounded-xl border border-white/[0.08] bg-[#111111] shadow-2xl p-1 z-50"
                                    >
                                        <div className="px-3 py-3 border-b border-white/[0.04] mb-1">
                                            <div className="text-sm font-medium text-white truncate">{session?.user?.name}</div>
                                            <div className="text-xs text-white/50 truncate">{session?.user?.email}</div>
                                        </div>
                                        <button
                                            onClick={() => {
                                                setUserMenuOpen(false);
                                                router.push("/dashboard/settings");
                                            }}
                                            className="flex items-center gap-2.5 w-full px-3 py-2 rounded-lg text-sm text-white hover:bg-white/[0.04] transition-colors"
                                        >
                                            <Settings className="w-4 h-4 text-white/60" />
                                            <span>Settings</span>
                                        </button>
                                        <button
                                            onClick={() => signOut({ callbackUrl: "/" })}
                                            className="flex items-center gap-2.5 w-full px-3 py-2 rounded-lg text-sm text-[#EF4444] hover:bg-[#EF4444]/10 transition-colors mt-1"
                                        >
                                            <LogOut className="w-4 h-4 text-[#EF4444]/80" />
                                            <span>Log out</span>
                                        </button>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </div>
            </div>

            {/* Mobile Navigation Menu */}
            <AnimatePresence>
                {mobileMenuOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="md:hidden border-t border-white/[0.06] overflow-hidden bg-[#0A0A0A]/95 backdrop-blur-xl"
                    >
                        <nav className="flex flex-col px-4 py-4 gap-1">
                            {navLinks.map((link) => {
                                const isActive = pathname === link.href;
                                return (
                                    <Link
                                        key={link.href}
                                        href={link.href}
                                        onClick={() => setMobileMenuOpen(false)}
                                        className={cn(
                                            "flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-colors",
                                            isActive 
                                                ? "bg-white/[0.08] text-white" 
                                                : "text-white/60 hover:text-white hover:bg-white/[0.04]"
                                        )}
                                    >
                                        <link.icon className="w-5 h-5 opacity-70" />
                                        {link.name}
                                    </Link>
                                );
                            })}
                        </nav>
                    </motion.div>
                )}
            </AnimatePresence>
        </header>
    );
}
