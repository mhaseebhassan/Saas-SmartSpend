"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/Logo";

export default function Navbar() {
    const { status } = useSession();
    const pathname = usePathname();

    if (pathname?.startsWith("/dashboard")) return null;

    return (
        <nav className="fixed top-0 z-50 w-full bg-[#09090B]/80 backdrop-blur-xl border-b border-white/[0.04] transition-all duration-300">
            <div className="max-w-[1400px] mx-auto px-6 py-2">
                <div className="flex h-10 items-center justify-between">
                    {/* Left Links */}
                    <div className="flex items-center gap-6 hidden lg:flex flex-1">
                        <Link href="/about" className="text-sm font-medium text-white/70 hover:text-white transition-colors">
                            About
                        </Link>
                        <Link href="/privacy" className="text-sm font-medium text-white/70 hover:text-white transition-colors">
                            Privacy
                        </Link>
                        <Link href="/terms" className="text-sm font-medium text-white/70 hover:text-white transition-colors">
                            Terms
                        </Link>
                    </div>

                    {/* Center Logo */}
                    <Link href="/" className="flex items-center gap-3 group justify-center">
                        <div className="bg-white/[0.03] border border-white/[0.08] p-1.5 rounded-xl group-hover:bg-white/[0.08] transition-colors shadow-sm">
                            <Logo className="w-5 h-5 text-white" />
                        </div>
                        <span className="font-bold text-2xl tracking-tight text-white select-none transition-all duration-300">
                            SmartSpend
                        </span>
                    </Link>

                    {/* Right Auth */}
                    <div className="flex items-center gap-6 flex-1 justify-end">
                        <div className="flex items-center gap-2">
                            {status === "authenticated" ? (
                                <div className="flex items-center gap-3">
                                    <Link href="/dashboard">
                                        <button className="px-5 py-2 text-sm font-medium text-white hover:text-white/80 transition-colors">
                                            Dashboard
                                        </button>
                                    </Link>
                                    <button
                                        onClick={() => signOut()}
                                        className="px-5 py-2 text-sm font-medium bg-white text-black rounded-full hover:bg-white/90 transition-all"
                                    >
                                        Log out
                                    </button>
                                </div>
                            ) : (
                                <div className="flex items-center gap-1">
                                    <Link href="/login">
                                        <button className="px-4 py-2 text-sm font-medium text-white/90 hover:text-white transition-colors">
                                            Log in
                                        </button>
                                    </Link>
                                    <Link href="/register">
                                        <button className="px-5 py-2 text-sm font-medium bg-white text-black rounded-full hover:bg-white/90 transition-all">
                                            Sign up
                                        </button>
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    );
}
