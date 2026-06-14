"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { Button } from "@/components/ui/Button";
import { LogOut, User } from "lucide-react";
import { motion } from "framer-motion";
import { Logo } from "@/components/Logo";
import { usePathname } from "next/navigation";

export default function Navbar() {
    const { status, data: session } = useSession();
    const pathname = usePathname();

    if (pathname?.startsWith("/dashboard")) return null;

    return (
        <nav className="sticky top-0 z-50 w-full border-b border-white/[0.04] bg-[#09090B] backdrop-blur-xl">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex h-16 items-center justify-between">
                    <Link href="/" className="flex items-center gap-2 sm:gap-3 group">
                        <div className="bg-white/[0.02] border border-white/[0.04] p-1.5 sm:p-2 rounded-xl transition-all duration-300">
                            <Logo className="w-5 h-5 sm:w-6 sm:h-6 text-white transition-colors" />
                        </div>
                        <span className="font-bold text-lg sm:text-xl tracking-tight text-white select-none transition-all duration-300">
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
                                    <img src={session.user.image} alt="Profile" className="w-8 h-8 rounded-full border border-white/[0.06]" />
                                ) : (
                                    <div className="w-8 h-8 rounded-full bg-white/[0.04] flex items-center justify-center text-white border border-white/[0.06]">
                                        <User className="w-4 h-4" />
                                    </div>
                                )}

                                <button
                                    onClick={() => signOut()}
                                    className="p-2 rounded-xl text-white/50 hover:text-white hover:bg-white/[0.04] border border-transparent transition-all duration-300"
                                    title="Sign Out"
                                >
                                    <LogOut className="w-4 h-4" />
                                </button>
                                <Link href="/dashboard">
                                    <button className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-semibold bg-white text-black hover:bg-white/90 rounded-xl transition-all duration-300">
                                        Dashboard
                                    </button>
                                </Link>
                            </div>
                        ) : (
                            <div className="flex items-center gap-1.5 sm:gap-3">
                                <Link href="/login">
                                    <button className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-semibold text-white/70 hover:text-white hover:bg-white/[0.04] rounded-xl transition-all duration-300">
                                        Login
                                    </button>
                                </Link>
                                <Link href="/register">
                                    <button className="px-3.5 sm:px-5 py-1.5 sm:py-2 text-xs sm:text-sm font-semibold bg-white text-black hover:bg-white/90 rounded-xl transition-all duration-300">
                                        Get Started
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
