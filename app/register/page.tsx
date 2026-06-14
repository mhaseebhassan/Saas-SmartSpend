"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { Logo } from "@/components/Logo";

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
            setError("Something went wrong. Please try again.");
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-[#000000] relative overflow-y-auto overflow-x-hidden px-4 py-12">
            
            {/* Ambient Background Grid */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none" />

            {/* Back to Home Brand Logo */}
            <Link href="/" className="absolute left-6 top-6 inline-flex items-center gap-2 text-white font-medium hover:opacity-80 transition-opacity z-20">
                <Logo className="h-6 w-6 text-white" />
                <span className="font-bold text-white tracking-tight">SmartSpend</span>
            </Link>

            {/* Floating Top Right Link */}
            <Link
                href="/login"
                className="absolute right-6 top-6 inline-flex items-center justify-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.02] text-xs font-medium text-white/70 hover:text-white hover:bg-white/[0.06] h-9 px-4 transition-all duration-200 z-20"
            >
                Login <ArrowRight className="h-3.5 w-3.5" />
            </Link>

            {/* Center Modal */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="w-full max-w-[400px] bg-[#0A0A0A] border border-white/[0.08] rounded-2xl p-8 shadow-2xl relative z-10"
            >
                <div className="flex flex-col space-y-1.5 text-center mb-8">
                    <h1 className="text-2xl font-semibold tracking-tight text-white">
                        Create an Account
                    </h1>
                    <p className="text-sm text-white/50">
                        Enter your details to register your new account
                    </p>
                </div>

                <div className="grid gap-5">
                    <form onSubmit={handleSubmit}>
                        <div className="grid gap-4">
                            <div className="grid gap-1.5">
                                <Input
                                    label="Full Name"
                                    placeholder="John Doe"
                                    type="text"
                                    onChange={(e) => setName(e.target.value)}
                                    value={name}
                                    required
                                    className="bg-transparent border-white/[0.08] text-white focus:border-white/20"
                                />
                            </div>
                            <div className="grid gap-1.5">
                                <Input
                                    label="Email Address"
                                    placeholder="name@example.com"
                                    type="email"
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
                                Create Account
                            </Button>
                        </div>
                    </form>

                    {error && (
                        <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-medium p-3 rounded-lg text-center">
                            {error}
                        </div>
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
