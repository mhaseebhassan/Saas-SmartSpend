"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { getProviders, signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { ArrowRight, LayoutDashboard } from "lucide-react";
import { motion } from "framer-motion";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [googleEnabled, setGoogleEnabled] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    useEffect(() => {
        getProviders()
            .then((providers) => setGoogleEnabled(Boolean(providers?.google)))
            .catch(() => setGoogleEnabled(false));
    }, []);

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");
        try {
            const res = await signIn("credentials", {
                email,
                password,
                redirect: false,
            });

            if (res?.error) {
                setError("Invalid Credentials");
                setIsLoading(false);
                return;
            }
            router.replace("/dashboard");
        } catch (error) {
            console.log(error);
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-[#05070F] relative overflow-y-auto overflow-x-hidden px-4 py-12">
            {/* Moving Aurora Mesh Background */}
            <motion.div
                className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full bg-cyan-500/10 blur-[150px] mix-blend-screen pointer-events-none z-[-10]"
                animate={{
                    x: [0, 80, 0],
                    y: [0, 50, 0],
                    scale: [1, 1.1, 1],
                }}
                transition={{
                    duration: 15,
                    repeat: Infinity,
                    ease: "easeInOut",
                }}
            />
            <motion.div
                className="absolute -bottom-40 -right-40 w-[600px] h-[600px] rounded-full bg-violet-500/10 blur-[150px] mix-blend-screen pointer-events-none z-[-10]"
                animate={{
                    x: [0, -80, 0],
                    y: [0, -50, 0],
                    scale: [1, 1.2, 1],
                }}
                transition={{
                    duration: 20,
                    repeat: Infinity,
                    ease: "easeInOut",
                }}
            />
            <motion.div
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-pink-500/5 blur-[180px] mix-blend-screen pointer-events-none z-[-10]"
                animate={{
                    scale: [1, 1.15, 1],
                }}
                transition={{
                    duration: 18,
                    repeat: Infinity,
                    ease: "easeInOut",
                }}
            />

            {/* Back to Home Brand Logo */}
            <Link href="/" className="absolute left-4 top-4 md:left-8 md:top-8 inline-flex items-center gap-2 text-white font-medium hover:opacity-80 transition-opacity z-20">
                <LayoutDashboard className="h-5 w-5 text-cyan-400 animate-pulse" />
                <span className="font-bold bg-gradient-to-r from-cyan-400 to-violet-400 bg-clip-text text-transparent">SmartSpend</span>
            </Link>

            {/* Floating Top Right Link */}
            <Link
                href="/register"
                className="absolute right-4 top-4 md:right-8 md:top-8 inline-flex items-center justify-center gap-1.5 rounded-xl border border-white/[0.06] bg-[#111827]/60 backdrop-blur-xl text-sm font-semibold text-muted-foreground hover:text-foreground hover:bg-white/[0.05] h-10 px-4 py-2 transition-all duration-300 hover:border-cyan-400/20 hover:shadow-[0_0_20px_rgba(6,182,212,0.1)] z-20"
            >
                Register <ArrowRight className="h-4 w-4" />
            </Link>

            {/* Premium Center Glass Modal */}
            <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
                className="w-full max-w-[420px] bg-[#111827]/80 backdrop-blur-2xl border border-white/[0.08] rounded-3xl p-8 sm:p-10 shadow-2xl relative z-10 hover:border-cyan-400/20 hover:shadow-[0_0_40px_rgba(6,182,212,0.15)] transition-all duration-500"
            >
                <div className="flex flex-col space-y-2 text-center mb-8">
                    <h1 className="text-3xl font-bold tracking-tight text-[#F1F5F9]">
                        Welcome Back
                    </h1>
                    <p className="text-sm text-[#94A3B8]">
                        Enter your credentials to access your account
                    </p>
                </div>

                <div className="grid gap-6">
                    <form onSubmit={handleSubmit}>
                        <div className="grid gap-5">
                            <div className="grid gap-2">
                                <Input
                                    label="Email Address"
                                    placeholder="name@example.com"
                                    type="email"
                                    autoCapitalize="none"
                                    autoComplete="email"
                                    autoCorrect="off"
                                    onChange={(e) => setEmail(e.target.value)}
                                    value={email}
                                    required
                                    className="border-white/[0.06] focus:border-cyan-400/50 focus:ring-cyan-400/10 text-white"
                                />
                            </div>
                            <div className="grid gap-2">
                                <Input
                                    label="Password"
                                    placeholder="••••••••"
                                    type="password"
                                    onChange={(e) => setPassword(e.target.value)}
                                    value={password}
                                    required
                                    className="border-white/[0.06] focus:border-cyan-400/50 focus:ring-cyan-400/10 text-white"
                                />
                            </div>

                            <Button 
                                type="submit" 
                                isLoading={isLoading}
                                className="w-full mt-2 bg-gradient-to-r from-cyan-500 via-violet-500 to-pink-500 text-white font-semibold hover:opacity-95 shadow-[0_0_20px_rgba(6,182,212,0.25)] hover:shadow-[0_0_30px_rgba(6,182,212,0.45)] border-0 h-11"
                            >
                                Sign In with Email
                            </Button>
                        </div>
                    </form>

                    {error && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-[#EF4444]/10 border border-[#EF4444]/20 text-[#EF4444] text-xs font-semibold p-3.5 rounded-xl text-center flex items-center justify-center gap-2"
                        >
                            <span className="w-1.5 h-1.5 rounded-full bg-[#EF4444] animate-pulse" />
                            {error}
                        </motion.div>
                    )}

                    {googleEnabled && (
                        <>
                            <div className="relative my-2">
                                <div className="absolute inset-0 flex items-center">
                                    <span className="w-full border-t border-white/[0.06]" />
                                </div>
                                <div className="relative flex justify-center text-xs uppercase">
                                    <span className="bg-[#0A0E1A] px-3.5 py-0.5 rounded-full border border-white/[0.06] text-[#94A3B8]/60 text-[10px] tracking-wider font-semibold">
                                        Or continue with
                                    </span>
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={() => {
                                    setIsLoading(true);
                                    signIn("google");
                                }}
                                className="w-full flex items-center justify-center gap-2.5 bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.06] text-white backdrop-blur-md rounded-xl py-3 px-4 text-sm font-semibold transition-all duration-300 hover:border-cyan-400/20 hover:shadow-[0_0_20px_rgba(6,182,212,0.1)] active:scale-98 cursor-pointer"
                            >
                                <svg className="w-4 h-4" viewBox="0 0 24 24">
                                    <path
                                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                        fill="#4285F4"
                                    />
                                    <path
                                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                        fill="#34A853"
                                    />
                                    <path
                                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                                        fill="#FBBC05"
                                    />
                                    <path
                                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                        fill="#EA4335"
                                    />
                                </svg>
                                Google
                            </button>
                        </>
                    )}
                </div>

                <p className="text-center text-xs text-[#64748B]/80 leading-relaxed mt-8">
                    By clicking continue, you agree to our{" "}
                    <Link href="#" className="underline underline-offset-4 hover:text-cyan-400 transition-colors">
                        Terms of Service
                    </Link>{" "}
                    and{" "}
                    <Link href="#" className="underline underline-offset-4 hover:text-cyan-400 transition-colors">
                        Privacy Policy
                    </Link>
                    .
                </p>
            </motion.div>
        </div>
    );
}
