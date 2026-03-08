"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Button } from "@/components/ui/Button";
import { LayoutDashboard, LogOut, User } from "lucide-react";
import { motion } from "framer-motion";

export default function Navbar() {
    const { status, data: session } = useSession();

    return (
        <nav className="sticky top-0 z-50 w-full border-b border-white/10 bg-background/60 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex h-16 items-center justify-between">
                    <Link href="/" className="flex items-center gap-2 group">
                        <div className="bg-primary/10 p-2 rounded-lg group-hover:bg-primary/20 transition-colors">
                            <LayoutDashboard className="w-5 h-5 text-primary" />
                        </div>
                        <span className="font-bold text-xl tracking-tight">Smart<span className="text-primary">Spend</span></span>
                    </Link>

                    <div className="flex items-center gap-4">
                        <ThemeToggle />

                        {status === "authenticated" ? (
                            <div className="flex items-center gap-4">
                                <div className="hidden md:flex flex-col items-end">
                                    <span className="text-sm font-medium leading-none">{session.user.name}</span>
                                    <span className="text-xs text-muted-foreground">{session.user.email}</span>
                                </div>
                                {session.user.image ? (
                                    <img src={session.user.image} alt="Profile" className="w-8 h-8 rounded-full border border-border" />
                                ) : (
                                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary border border-border">
                                        <User className="w-4 h-4" />
                                    </div>
                                )}

                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => signOut()}
                                    className="text-muted-foreground hover:text-destructive transition-colors"
                                >
                                    <LogOut className="w-5 h-5" />
                                </Button>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2">
                                <Link href="/login">
                                    <Button variant="ghost">Login</Button>
                                </Link>
                                <Link href="/register">
                                    <Button>Get Started</Button>
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
}
