"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { getProviders, signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { Logo } from "@/components/Logo";

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
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-[#09090B] relative overflow-y-auto overflow-x-hidden px-4 py-12">
            
            {/* Ambient Background Grid */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none" />

            {/* Back to Home Brand Logo */}
            <Link href="/" className="absolute left-6 top-6 inline-flex items-center gap-2 text-white font-medium hover:opacity-80 transition-opacity z-20">
                <Logo className="h-6 w-6 text-white" />
                <span className="font-bold text-white tracking-tight">SmartSpend</span>
            </Link>

            {/* Floating Top Right Link */}
            <Link
                href="/register"
                className="absolute right-6 top-6 inline-flex items-center justify-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.02] text-xs font-medium text-white/70 hover:text-white hover:bg-white/[0.06] h-9 px-4 transition-all duration-200 z-20"
            >
                Register <ArrowRight className="h-3.5 w-3.5" />
            </Link>

            {/* Center Modal */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="w-full max-w-[400px] bg-[#09090B] border border-white/[0.08] rounded-2xl p-8 shadow-2xl relative z-10"
            >
                <div className="flex flex-col space-y-1.5 text-center mb-8">
                    <h1 className="text-2xl font-semibold tracking-tight text-white">
                        Welcome Back
                    </h1>
                    <p className="text-sm text-white/50">
                        Enter your credentials to access your account
                    </p>
                </div>

                <div className="grid gap-5">
                    <form onSubmit={handleSubmit}>
                        <div className="grid gap-4">
                            <div className="grid gap-1.5">
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
                                    className="bg-transparent border-white/[0.08] text-white focus:border-white/20"
                                />
                            </div>
                            <div className="grid gap-1.5">
                                <Input
                                    label="Password"
                                    placeholder="••••••••"
                                    type="password"
                                    onChange={(e) => setPassword(e.target.value)}
                                    value={password}
                                    required
                                    className="bg-transparent border-white/[0.08] text-white focus:border-white/20"
                                />
                            </div>

                            <Button 
                                type="submit" 
                                isLoading={isLoading}
                                className="w-full mt-2 bg-white text-black font-semibold hover:bg-white/90 h-10 rounded-lg"
                            >
                                Sign In
                            </Button>
                        </div>
                    </form>

                    {error && (
                        <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-medium p-3 rounded-lg text-center">
                            {error}
                        </div>
                    )}

                    {googleEnabled && (
                        <>
                            <div className="relative my-2">
                                <div className="absolute inset-0 flex items-center">
                                    <span className="w-full border-t border-white/[0.08]" />
                                </div>
                                <div className="relative flex justify-center text-xs uppercase">
                                    <span className="bg-[#09090B] px-2 text-white/40 tracking-wider">
                                        Or
                                    </span>
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={() => {
                                    setIsLoading(true);
                                    signIn("google");
                                }}
                                className="w-full flex items-center justify-center gap-2.5 bg-[#111111] hover:bg-[#1A1A1A] border border-white/[0.08] text-white rounded-lg h-10 text-sm font-medium transition-colors"
                            >
                                <svg className="w-4 h-4" viewBox="0 0 24 24">
                                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05" />
                                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                                </svg>
                                Continue with Google
                            </button>
                        </>
                    )}
                </div>

                <p className="text-center text-xs text-white/40 mt-6">
                    By clicking continue, you agree to our{" "}
                    <Link href="#" className="underline hover:text-white transition-colors">
                        Terms of Service
                    </Link>{" "}
                    and{" "}
                    <Link href="#" className="underline hover:text-white transition-colors">
                        Privacy Policy
                    </Link>
                    .
                </p>
            </motion.div>
        </div>
    );
}
