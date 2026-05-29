"use client";

import Link from "next/link";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { ArrowRight, LayoutDashboard } from "lucide-react";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const router = useRouter();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await signIn("credentials", {
                email,
                password,
                redirect: false,
            });

            if (res.error) {
                setError("Invalid Credentials");
                return;
            }
            router.replace("dashboard");
        } catch (error) {
            console.log(error);
        }
    };

    const inputClass = "flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50";

    return (
        <div className="container relative h-screen flex-col items-center justify-center grid lg:max-w-none lg:grid-cols-2 lg:px-0">
            <Link
                href="/register"
                className="absolute right-4 top-4 md:right-8 md:top-8 inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2"
            >
                Register
            </Link>

            <div className="relative hidden h-full flex-col bg-muted p-10 text-white lg:flex dark:border-r">
                <div className="absolute inset-0 bg-primary/90" />
                <div className="relative z-20 flex items-center text-lg font-medium">
                    <LayoutDashboard className="mr-2 h-6 w-6" />
                    SmartSpend
                </div>
                <div className="relative z-20 mt-auto">
                    <blockquote className="space-y-2">
                        <p className="text-lg">
                            &ldquo;This library has saved me countless hours of work and
                            helped me deliver stunning designs to my clients faster than
                            ever before.&rdquo;
                        </p>
                        <footer className="text-sm">Sofia Davis</footer>
                    </blockquote>
                </div>
            </div>

            <div className="lg:p-8">
                <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
                    <div className="flex flex-col space-y-2 text-center">
                        <h1 className="text-2xl font-semibold tracking-tight">
                            Login to your account
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Enter your email below to login to your account
                        </p>
                    </div>

                    <div className="grid gap-6">
                        <form onSubmit={handleSubmit}>
                            <div className="grid gap-4">
                                <div className="grid gap-2">
                                    <label className="text-sm font-medium leading-none">Email</label>
                                    <input
                                        placeholder="name@example.com"
                                        type="email"
                                        autoCapitalize="none"
                                        autoComplete="email"
                                        autoCorrect="off"
                                        onChange={(e) => setEmail(e.target.value)}
                                        className={inputClass}
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <label className="text-sm font-medium leading-none">Password</label>
                                    <input
                                        placeholder="••••••••"
                                        type="password"
                                        onChange={(e) => setPassword(e.target.value)}
                                        className={inputClass}
                                    />
                                </div>
                                <Button>
                                    Sign In with Email
                                </Button>
                            </div>
                        </form>

                        {error && (
                            <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md text-center">
                                {error}
                            </div>
                        )}

                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t border-muted" />
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-background px-2 text-muted-foreground">
                                    Or continue with
                                </span>
                            </div>
                        </div>

                        <Button variant="outline" type="button" onClick={() => signIn("google")}>
                            Google
                        </Button>
                    </div>

                    <p className="px-8 text-center text-sm text-muted-foreground">
                        By clicking continue, you agree to our{" "}
                        <Link href="#" className="underline underline-offset-4 hover:text-primary">
                            Terms of Service
                        </Link>{" "}
                        and{" "}
                        <Link href="#" className="underline underline-offset-4 hover:text-primary">
                            Privacy Policy
                        </Link>
                        .
                    </p>
                </div>
            </div>
        </div>
    );
}
