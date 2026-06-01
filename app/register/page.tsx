"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { LayoutDashboard, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

export default function RegisterPage() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError("");

        if (!name || !email || !password) {
            setError("All fields are necessary.");
            return;
        }

        setIsLoading(true);
        try {
            const res = await fetch("/api/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    name,
                    email,
                    password,
                }),
            });

            if (res.ok) {
                const form = e.currentTarget;
                form.reset();
                router.push("/login");
            } else {
                const data = await res.json();
                setError(data.message);
                setIsLoading(false);
            }
        } catch (error) {
            console.log("Registration failed", error);
            setError("Something went wrong. Please try again.");
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
                href="/login"
                className="absolute right-4 top-4 md:right-8 md:top-8 inline-flex items-center justify-center gap-1.5 rounded-xl border border-white/[0.06] bg-[#111827]/60 backdrop-blur-xl text-sm font-semibold text-muted-foreground hover:text-foreground hover:bg-white/[0.05] h-10 px-4 py-2 transition-all duration-300 hover:border-cyan-400/20 hover:shadow-[0_0_20px_rgba(6,182,212,0.1)] z-20"
            >
                Login <ArrowRight className="h-4 w-4" />
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
                        Create an Account
                    </h1>
                    <p className="text-sm text-[#94A3B8]">
                        Enter your details to register your new account
                    </p>
                </div>

                <div className="grid gap-6">
                    <form onSubmit={handleSubmit}>
                        <div className="grid gap-5">
                            <div className="grid gap-2">
                                <Input
                                    label="Full Name"
                                    placeholder="John Doe"
                                    type="text"
                                    onChange={(e) => setName(e.target.value)}
                                    value={name}
                                    required
                                    className="border-white/[0.06] focus:border-cyan-400/50 focus:ring-cyan-400/10 text-white"
                                />
                            </div>
                            <div className="grid gap-2">
                                <Input
                                    label="Email Address"
                                    placeholder="name@example.com"
                                    type="email"
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
                                Create Account
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
