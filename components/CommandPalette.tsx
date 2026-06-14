"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
    Search,
    LayoutDashboard,
    Wallet,
    PiggyBank,
    BarChart3,
    Repeat,
    Settings,
    Plus,
    Home,
    ArrowRight,
    Command,
} from "lucide-react";

/* ──────────────────── Types ──────────────────── */

interface CommandItem {
    id: string;
    label: string;
    icon: React.ElementType;
    category: "Navigation" | "Actions";
    shortcut?: string;
    action: () => void;
}

/* ──────────────────── Component ──────────────────── */

export default function CommandPalette() {
    const router = useRouter();
    const [open, setOpen] = React.useState(false);
    const [query, setQuery] = React.useState("");
    const [activeIndex, setActiveIndex] = React.useState(0);
    const inputRef = React.useRef<HTMLInputElement>(null);
    const listRef = React.useRef<HTMLDivElement>(null);

    /* ── Commands ──────────────────────────────── */

    const commands: CommandItem[] = React.useMemo(
        () => [
            // Navigation
            {
                id: "nav-overview",
                label: "Go to Overview",
                icon: LayoutDashboard,
                category: "Navigation",
                shortcut: "G then O",
                action: () => router.push("/dashboard"),
            },
            {
                id: "nav-expenses",
                label: "Go to Expenses",
                icon: Wallet,
                category: "Navigation",
                shortcut: "G then E",
                action: () => router.push("/dashboard/expenses"),
            },
            {
                id: "nav-budgets",
                label: "Go to Budgets",
                icon: PiggyBank,
                category: "Navigation",
                shortcut: "G then B",
                action: () => router.push("/dashboard/budgets"),
            },
            {
                id: "nav-analytics",
                label: "Go to Analytics",
                icon: BarChart3,
                category: "Navigation",
                shortcut: "G then A",
                action: () => router.push("/dashboard/analytics"),
            },
            {
                id: "nav-recurring",
                label: "Go to Recurring",
                icon: Repeat,
                category: "Navigation",
                shortcut: "G then R",
                action: () => router.push("/dashboard/recurring"),
            },
            {
                id: "nav-settings",
                label: "Go to Settings",
                icon: Settings,
                category: "Navigation",
                shortcut: "G then S",
                action: () => router.push("/dashboard/settings"),
            },
            // Actions
            {
                id: "action-new-expense",
                label: "Add New Expense",
                icon: Plus,
                category: "Actions",
                shortcut: "N",
                action: () => {
                    window.dispatchEvent(new CustomEvent("open-add-expense"));
                    router.push("/dashboard/expenses");
                },
            },
            {
                id: "action-home",
                label: "Go to Home",
                icon: Home,
                category: "Actions",
                shortcut: "G then H",
                action: () => router.push("/"),
            },
        ],
        [router]
    );

    /* ── Filtered + grouped ────────────────────── */

    const filtered = React.useMemo(() => {
        if (!query.trim()) return commands;
        const q = query.toLowerCase();
        return commands.filter((c) => c.label.toLowerCase().includes(q));
    }, [commands, query]);

    const grouped = React.useMemo(() => {
        const map = new Map<string, CommandItem[]>();
        for (const item of filtered) {
            const arr = map.get(item.category) || [];
            arr.push(item);
            map.set(item.category, arr);
        }
        return map;
    }, [filtered]);

    /* ── Global shortcut listener ──────────────── */

    React.useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === "k") {
                e.preventDefault();
                setOpen((prev) => !prev);
            }
        };
        window.addEventListener("keydown", down);
        return () => window.removeEventListener("keydown", down);
    }, []);

    /* ── Focus input on open ───────────────────── */

    React.useEffect(() => {
        if (open) {
            setQuery("");
            setActiveIndex(0);
            // small delay so the DOM is painted
            requestAnimationFrame(() => inputRef.current?.focus());
        }
    }, [open]);

    /* ── Reset active index when query changes ─── */

    React.useEffect(() => {
        setActiveIndex(0);
    }, [query]);

    /* ── Keyboard navigation inside palette ───── */

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "ArrowDown") {
            e.preventDefault();
            setActiveIndex((i) => (i + 1) % filtered.length);
        } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setActiveIndex((i) => (i - 1 + filtered.length) % filtered.length);
        } else if (e.key === "Enter") {
            e.preventDefault();
            if (filtered[activeIndex]) {
                filtered[activeIndex].action();
                setOpen(false);
            }
        } else if (e.key === "Escape") {
            e.preventDefault();
            setOpen(false);
        }
    };

    /* ── Scroll active item into view ──────────── */

    React.useEffect(() => {
        const el = listRef.current?.querySelector(`[data-index="${activeIndex}"]`);
        if (el) {
            el.scrollIntoView({ block: "nearest" });
        }
    }, [activeIndex]);

    /* ── Render ────────────────────────────────── */

    let flatIndex = -1; // tracks position across groups

    return (
        <AnimatePresence>
            {open && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        key="cmd-backdrop"
                        className="fixed inset-0 z-[999] bg-black/60 backdrop-blur-sm"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.15 }}
                        onClick={() => setOpen(false)}
                    />

                    {/* Modal */}
                    <motion.div
                        key="cmd-modal"
                        className="fixed inset-0 z-[1000] flex items-start justify-center pt-[18vh] px-4"
                        initial={{ opacity: 0, scale: 0.96, y: -10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.96, y: -10 }}
                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    >
                        <div
                            className="w-full max-w-lg rounded-2xl border border-white/[0.08] bg-[#111111] shadow-2xl overflow-hidden"
                            onKeyDown={handleKeyDown}
                        >
                            {/* Search input */}
                            <div className="flex items-center gap-3 px-4 border-b border-white/[0.06]">
                                <Search className="h-4 w-4 text-white/40 shrink-0" />
                                <input
                                    ref={inputRef}
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                    placeholder="Type a command or search..."
                                    className="flex-1 bg-transparent py-3.5 text-sm text-white placeholder:text-white/30 outline-none"
                                />
                                <kbd className="hidden sm:inline-flex h-5 items-center gap-0.5 rounded border border-white/10 bg-white/[0.04] px-1.5 text-[10px] font-medium text-white/30">
                                    ESC
                                </kbd>
                            </div>

                            {/* Command list */}
                            <div
                                ref={listRef}
                                className="max-h-72 overflow-y-auto overscroll-contain py-2 px-2"
                            >
                                {filtered.length === 0 && (
                                    <p className="py-8 text-center text-sm text-white/30">
                                        No results found.
                                    </p>
                                )}

                                {Array.from(grouped.entries()).map(([category, items]) => (
                                    <div key={category} className="mb-1">
                                        <p className="px-2 pt-2 pb-1 text-[11px] font-semibold uppercase tracking-wider text-white/25">
                                            {category}
                                        </p>

                                        {items.map((item) => {
                                            flatIndex++;
                                            const isActive = flatIndex === activeIndex;
                                            const Icon = item.icon;
                                            const idx = flatIndex; // capture for click

                                            return (
                                                <button
                                                    key={item.id}
                                                    data-index={idx}
                                                    onClick={() => {
                                                        item.action();
                                                        setOpen(false);
                                                    }}
                                                    onMouseEnter={() => setActiveIndex(idx)}
                                                    className={`
                                                        flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm
                                                        transition-colors duration-75 cursor-pointer
                                                        ${isActive ? "bg-white/[0.06] text-white" : "text-white/60 hover:bg-white/[0.04]"}
                                                    `}
                                                >
                                                    <Icon className="h-4 w-4 shrink-0" />
                                                    <span className="flex-1 truncate">{item.label}</span>

                                                    {item.shortcut && (
                                                        <span className="ml-auto flex items-center gap-1">
                                                            {item.shortcut.split(" ").map((part, pi) => (
                                                                <kbd
                                                                    key={pi}
                                                                    className="inline-flex h-5 items-center rounded border border-white/10 bg-white/[0.04] px-1.5 text-[10px] font-medium text-white/25"
                                                                >
                                                                    {part}
                                                                </kbd>
                                                            ))}
                                                        </span>
                                                    )}

                                                    {isActive && (
                                                        <ArrowRight className="h-3.5 w-3.5 text-white/30 shrink-0" />
                                                    )}
                                                </button>
                                            );
                                        })}
                                    </div>
                                ))}
                            </div>

                            {/* Footer hint */}
                            <div className="flex items-center justify-between border-t border-white/[0.06] px-4 py-2 text-[11px] text-white/20">
                                <div className="flex items-center gap-3">
                                    <span className="flex items-center gap-1">
                                        <kbd className="inline-flex h-4 items-center rounded border border-white/10 bg-white/[0.04] px-1 text-[10px]">↑</kbd>
                                        <kbd className="inline-flex h-4 items-center rounded border border-white/10 bg-white/[0.04] px-1 text-[10px]">↓</kbd>
                                        navigate
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <kbd className="inline-flex h-4 items-center rounded border border-white/10 bg-white/[0.04] px-1 text-[10px]">↵</kbd>
                                        select
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <kbd className="inline-flex h-4 items-center rounded border border-white/10 bg-white/[0.04] px-1 text-[10px]">esc</kbd>
                                        close
                                    </span>
                                </div>
                                <span className="flex items-center gap-1">
                                    <Command className="h-3 w-3" />K to toggle
                                </span>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
