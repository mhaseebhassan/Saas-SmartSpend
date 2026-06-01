"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { Button } from "@/components/ui/Button";
import { LayoutDashboard, LogOut, User } from "lucide-react";
import { motion } from "framer-motion";

export default function Navbar() {
    const { status, data: session } = useSession();

    return (
        <nav className="sticky top-0 z-50 w-full border-b border-white/[0.06] bg-[#05070F]/80 backdrop-blur-2xl">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex h-16 items-center justify-between">
                    <Link href="/" className="flex items-center gap-1.5 sm:gap-2 group">
                        <div className="bg-white/[0.04] border border-white/[0.06] p-1.5 sm:p-2 rounded-xl group-hover:border-cyan-400/20 group-hover:shadow-[0_0_20px_rgba(6,182,212,0.15)] transition-all duration-300">
                            <LayoutDashboard className="w-4 h-4 sm:w-5 sm:h-5 text-cyan-400 group-hover:text-cyan-300 transition-colors" />
                        </div>
                        <span className="font-extrabold text-lg sm:text-xl tracking-tight bg-gradient-to-r from-cyan-400 via-violet-400 to-pink-400 bg-clip-text text-transparent drop-shadow-[0_0_15px_rgba(6,182,212,0.35)] select-none transition-all duration-300 group-hover:brightness-110">
                            SmartSpend
                        </span>
                    </Link>

                    <div className="flex items-center gap-2 sm:gap-4">
                        {status === "authenticated" ? (
                            <div className="flex items-center gap-2 sm:gap-4">
                                <div className="hidden md:flex flex-col items-end">
                                    <span className="text-sm font-medium leading-none text-[#F1F5F9]">{session.user.name}</span>
                                    <span className="text-xs text-[#94A3B8] mt-0.5">{session.user.email}</span>
                                </div>
                                {session.user.image ? (
                                    <div className="relative group/avatar">
                                        <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 to-violet-500 rounded-full blur opacity-30 group-hover/avatar:opacity-60 transition duration-300" />
                                        <img src={session.user.image} alt="Profile" className="relative w-8 h-8 rounded-full border border-white/[0.06]" />
                                    </div>
                                ) : (
                                    <div className="relative group/avatar">
                                        <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 to-violet-500 rounded-full blur opacity-30 group-hover/avatar:opacity-60 transition duration-300" />
                                        <div className="relative w-8 h-8 rounded-full bg-[#111827] flex items-center justify-center text-cyan-400 border border-white/[0.06]">
                                            <User className="w-4 h-4" />
                                        </div>
                                    </div>
                                )}

                                <button
                                    onClick={() => signOut()}
                                    className="p-2 rounded-xl text-[#94A3B8] hover:text-[#EF4444] hover:bg-[#EF4444]/10 border border-white/[0.06] hover:border-transparent transition-all duration-300"
                                    title="Sign Out"
                                >
                                    <LogOut className="w-4 h-4" />
                                </button>
                            </div>
                        ) : (
                            <div className="flex items-center gap-1.5 sm:gap-3">
                                <Link href="/login">
                                    <button className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-semibold text-[#94A3B8] hover:text-[#F1F5F9] hover:bg-white/[0.04] border border-white/[0.06] hover:border-white/[0.12] rounded-xl transition-all duration-300">
                                        Login
                                    </button>
                                </Link>
                                <Link href="/register">
                                    <button className="relative px-3.5 sm:px-5 py-1.5 sm:py-2 text-xs sm:text-sm font-semibold text-white rounded-xl overflow-hidden group/btn shadow-[0_4px_20px_rgba(6,182,212,0.15)] hover:shadow-[0_4px_25px_rgba(6,182,212,0.3)] transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]">
                                        {/* Aurora gradient background */}
                                        <span className="absolute inset-0 bg-gradient-to-r from-cyan-500 via-violet-500 to-pink-500 transition-all duration-300 group-hover/btn:brightness-110" />
                                        {/* Hover overlay glow */}
                                        <span className="absolute inset-0 bg-gradient-to-r from-cyan-500 via-violet-500 to-pink-500 opacity-0 group-hover/btn:opacity-100 blur-md transition-all duration-300 -z-10" />
                                        <span className="relative z-10">Get Started</span>
                                    </button>
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
}
