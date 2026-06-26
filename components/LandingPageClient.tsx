"use client";

import React, { useRef, useEffect } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { motion, useInView } from "framer-motion";
import { 
    ArrowRight, Globe, Target, Layers, Shield, 
    Landmark, BarChart3, TrendingUp, ChevronRight
} from "lucide-react";

function FadeIn({ children, delay = 0, className = "" }: { children: React.ReactNode, delay?: number, className?: string }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.1 });
  
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 15 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 15 }}
      transition={{ duration: 0.5, delay, ease: [0.21, 0.47, 0.32, 0.98] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

const PremiumIcon = ({ icon: Icon, color = "white", className = "mb-6" }: { icon: any, color?: "white" | "emerald" | "blue", className?: string }) => {
    const styles = {
        white: {
            border: "border-white/[0.12]",
            icon: "text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.4)]",
            gradient: "from-white/[0.08] to-transparent",
            glow: "via-white/30"
        },
        emerald: {
            border: "border-emerald-500/30",
            icon: "text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.5)]",
            gradient: "from-emerald-500/20 to-transparent",
            glow: "via-emerald-400/40"
        },
        blue: {
            border: "border-blue-500/30",
            icon: "text-blue-400 drop-shadow-[0_0_8px_rgba(96,165,250,0.5)]",
            gradient: "from-blue-500/20 to-transparent",
            glow: "via-blue-400/40"
        }
    }[color];

    return (
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center relative bg-[#050505] border ${styles.border} shadow-[0_8px_20px_rgba(0,0,0,0.4),inset_0_0_0_1px_rgba(255,255,255,0.02)] transition-transform duration-500 group-hover:scale-[1.03] ${className}`}>
            <div className={`absolute top-0 inset-x-2 h-px bg-gradient-to-r from-transparent ${styles.glow} to-transparent opacity-60`} />
            <div className={`absolute inset-0 rounded-2xl bg-gradient-to-b ${styles.gradient} opacity-60`} />
            <div className="absolute inset-x-0 bottom-0 h-4 bg-gradient-to-t from-black/40 to-transparent rounded-b-2xl pointer-events-none" />
            <Icon className={`w-6 h-6 relative z-10 ${styles.icon}`} strokeWidth={1.25} />
        </div>
    );
};

const BackgroundGrid = () => {
    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            document.documentElement.style.setProperty('--mouse-x', `${e.clientX}px`);
            document.documentElement.style.setProperty('--mouse-y', `${e.clientY}px`);
        };
        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    return (
        <div className="fixed inset-0 z-0 pointer-events-none flex justify-center bg-[#000000]">
            <div className="absolute inset-0 bg-[radial-gradient(#ffffff15_1px,transparent_1px)] bg-[size:32px_32px] [mask-image:linear-gradient(to_bottom,white_10%,transparent_90%)]" />
            <div 
                className="absolute inset-0 bg-[radial-gradient(#ffffff40_1px,transparent_1px)] bg-[size:32px_32px]"
                style={{
                    WebkitMaskImage: `radial-gradient(300px circle at var(--mouse-x) var(--mouse-y), white, transparent)`
                }}
            />
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-emerald-500/5 blur-[120px] rounded-full pointer-events-none" />
        </div>
    );
};

// ═══════════ NEW LIVE MARKET TICKER & GRAPH ═══════════

const TickerItem = ({ symbol, price, change, isPositive }: any) => (
    <div className="flex items-center gap-4 px-6 py-3 rounded-xl border border-white/[0.05] bg-[#050505] min-w-[220px]">
        <span className="text-white/70 font-medium tracking-tight text-sm">{symbol}</span>
        <div className="h-4 w-px bg-white/10" />
        <span className="text-white/90 font-mono text-sm">{price}</span>
        <span className={`font-mono text-xs ml-auto ${isPositive ? 'text-emerald-400' : 'text-white/40'}`}>
            {isPositive ? '+' : ''}{change}%
        </span>
    </div>
);

const LiveMarketSection = () => {
    const row1 = [
        { symbol: "BTC-USD", price: "64,230.00", change: 2.4, isPositive: true },
        { symbol: "EUR-USD", price: "1.0924", change: 0.15, isPositive: true },
        { symbol: "AAPL", price: "173.50", change: -1.2, isPositive: false },
        { symbol: "ETH-USD", price: "3,450.20", change: 5.2, isPositive: true },
        { symbol: "GBP-USD", price: "1.2640", change: -0.3, isPositive: false },
        { symbol: "TSLA", price: "202.10", change: 1.8, isPositive: true },
        { symbol: "XAU-USD", price: "2,340.50", change: 0.8, isPositive: true },
    ];
    // Double array to create seamless loop
    const ticker1 = [...row1, ...row1];

    const row2 = [
        { symbol: "NVDA", price: "880.20", change: 3.4, isPositive: true },
        { symbol: "USD-JPY", price: "151.20", change: 0.05, isPositive: true },
        { symbol: "MSFT", price: "420.55", change: -0.5, isPositive: false },
        { symbol: "SOL-USD", price: "145.20", change: -4.2, isPositive: false },
        { symbol: "AMZN", price: "178.30", change: 1.1, isPositive: true },
        { symbol: "SPX500", price: "5,201.10", change: 0.2, isPositive: true },
        { symbol: "WTI-OIL", price: "82.40", change: -1.5, isPositive: false },
    ];
    const ticker2 = [...row2, ...row2];

    return (
        <section className="w-full pb-32 relative z-10 overflow-hidden flex flex-col items-center">
            {/* Inline styles for perfect seamless CSS marquee */}
            <style dangerouslySetInnerHTML={{__html: `
                @keyframes marquee {
                    0% { transform: translateX(0%); }
                    100% { transform: translateX(-50%); }
                }
                .animate-marquee { animation: marquee 30s linear infinite; }
                .animate-marquee-reverse { animation: marquee 35s linear infinite reverse; }
            `}} />

            {/* Live Graph Mockup */}
            <FadeIn delay={0.4} className="w-full max-w-[1000px] px-6 mb-16">
                <div className="w-full h-[250px] md:h-[300px] relative border-b border-white/[0.1]">
                    {/* Y-axis labels */}
                    <div className="absolute left-0 top-0 bottom-0 flex flex-col justify-between text-[10px] text-white/30 font-mono pb-2">
                        <span>$250k</span>
                        <span>$150k</span>
                        <span>$50k</span>
                    </div>
                    
                    <div className="absolute inset-0 ml-12">
                        {/* Grid lines */}
                        <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
                            <div className="w-full h-px bg-white/[0.03]" />
                            <div className="w-full h-px bg-white/[0.03]" />
                            <div className="w-full h-px bg-white/[0.03]" />
                        </div>
                        
                        {/* Animated SVG Line */}
                        <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 1000 300">
                            <defs>
                                <linearGradient id="line-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                    <stop offset="0%" stopColor="#34d399" stopOpacity="0.2" />
                                    <stop offset="50%" stopColor="#10b981" stopOpacity="0.8" />
                                    <stop offset="100%" stopColor="#059669" stopOpacity="1" />
                                </linearGradient>
                                <linearGradient id="fill-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                                    <stop offset="0%" stopColor="#10b981" stopOpacity="0.15" />
                                    <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
                                </linearGradient>
                            </defs>
                            <motion.path 
                                initial={{ pathLength: 0, opacity: 0 }}
                                animate={{ pathLength: 1, opacity: 1 }}
                                transition={{ duration: 2.5, ease: "easeInOut", delay: 0.5 }}
                                d="M 0,280 C 100,280 150,220 250,230 C 350,240 400,150 500,160 C 600,170 700,80 800,100 C 900,120 950,40 1000,20"
                                fill="none"
                                stroke="url(#line-gradient)"
                                strokeWidth="3"
                                strokeLinecap="round"
                            />
                            <motion.path 
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 2, delay: 1.5 }}
                                d="M 0,280 C 100,280 150,220 250,230 C 350,240 400,150 500,160 C 600,170 700,80 800,100 C 900,120 950,40 1000,20 L 1000,300 L 0,300 Z"
                                fill="url(#fill-gradient)"
                            />
                        </svg>
                        
                        {/* Blinking Live Indicator at the end */}
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: [0, 1, 0] }}
                            transition={{ duration: 2, repeat: Infinity, delay: 3 }}
                            className="absolute right-[-4px] top-[18px] w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.8)]"
                        />
                    </div>
                </div>
            </FadeIn>

            {/* Infinite Market Tickers */}
            <FadeIn delay={0.6} className="w-full relative">
                {/* Edge Fades for smooth entry/exit */}
                <div className="absolute inset-y-0 left-0 w-20 md:w-40 bg-gradient-to-r from-black via-black/80 to-transparent z-10 pointer-events-none" />
                <div className="absolute inset-y-0 right-0 w-20 md:w-40 bg-gradient-to-l from-black via-black/80 to-transparent z-10 pointer-events-none" />
                
                <div className="flex flex-col gap-4">
                    <div className="flex w-max animate-marquee gap-4">
                        {ticker1.map((item, i) => <TickerItem key={i} {...item} />)}
                    </div>
                    <div className="flex w-max animate-marquee-reverse gap-4">
                        {ticker2.map((item, i) => <TickerItem key={i} {...item} />)}
                    </div>
                </div>
            </FadeIn>
        </section>
    );
};

export default function LandingPageClient() {
    const { data: session } = useSession();

    return (
        <div className="text-white min-h-screen font-sans selection:bg-white/20 selection:text-white relative">
            <BackgroundGrid />

            {/* ═══════════ HERO SECTION ═══════════ */}
            <section className="relative pt-40 pb-20 px-6 flex flex-col items-center text-center z-10 w-full max-w-[1400px] mx-auto">
                <FadeIn>
                    <div className="inline-flex items-center px-5 py-2 rounded-full border border-white/[0.08] mb-10 shadow-[0_0_20px_rgba(255,255,255,0.03)] bg-black/50 backdrop-blur-md relative overflow-hidden group cursor-default">
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out" />
                        <span className="text-xs font-semibold uppercase tracking-[0.2em] text-white/60 relative z-10">
                            The Intelligent Wealth Platform
                        </span>
                    </div>
                </FadeIn>
                
                <FadeIn delay={0.1}>
                    <h1 className="text-[4rem] md:text-[6.5rem] font-medium tracking-[-0.04em] mb-8 max-w-5xl leading-[1.0] text-transparent bg-clip-text bg-gradient-to-b from-white via-white to-white/40 filter drop-shadow-[0_0_40px_rgba(255,255,255,0.05)]">
                        Financial clarity, <br /> engineered perfectly.
                    </h1>
                </FadeIn>
                
                <FadeIn delay={0.2}>
                    <p className="text-lg md:text-xl text-white/40 max-w-2xl mx-auto mb-10 font-normal leading-relaxed tracking-tight">
                        A strictly structured, high-performance platform to manage your wealth. Connect accounts, track spending, and analyze data with zero latency.
                    </p>
                </FadeIn>

                <FadeIn delay={0.3} className="flex flex-col sm:flex-row items-center gap-4">
                    {session ? (
                        <Link href="/dashboard">
                            <button className="h-11 px-6 rounded-lg bg-white text-black font-medium text-sm flex items-center gap-2 hover:bg-white/90 transition-colors shadow-[0_0_0_1px_rgba(255,255,255,1)] group">
                                Enter Dashboard <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                            </button>
                        </Link>
                    ) : (
                        <>
                            <Link href="/register">
                                <button className="h-11 px-6 rounded-lg bg-white text-black font-medium text-sm flex items-center gap-2 hover:bg-white/90 transition-colors shadow-[0_0_0_1px_rgba(255,255,255,1)] group relative overflow-hidden">
                                    Start building wealth <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                                </button>
                            </Link>
                            <Link href="/about">
                                <button className="h-11 px-6 rounded-lg bg-transparent text-white font-medium text-sm border border-white/10 hover:bg-white/5 transition-colors shadow-sm">
                                    Explore features
                                </button>
                            </Link>
                        </>
                    )}
                </FadeIn>
            </section>

            {/* Replace Dashboard Image with Live Market Section */}
            <LiveMarketSection />

            {/* ═══════════ BENTO GRID (Strict Architecture) ═══════════ */}
            <section className="py-32 px-6 relative z-10 border-t border-white/[0.05] bg-[#020202]">
                <div className="max-w-[1200px] mx-auto">
                    <FadeIn>
                        <div className="mb-16">
                            <h2 className="text-3xl font-medium tracking-tight mb-4 text-white">
                                Everything you need. <span className="text-white/40">Nothing you don't.</span>
                            </h2>
                            <p className="text-white/40 text-lg">Built on a strict architecture designed for speed and reliability.</p>
                        </div>
                    </FadeIn>

                    <div className="grid md:grid-cols-3 gap-4 mb-4">
                        {/* Huge Data Card */}
                        <FadeIn className="md:col-span-2 h-[400px]">
                            <div className="rounded-2xl border border-white/[0.05] bg-[#080808] p-8 h-full flex flex-col justify-between hover:bg-[#0A0A0A] transition-colors relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-bl from-white/[0.03] to-transparent rounded-full blur-3xl pointer-events-none" />
                                
                                <div className="relative z-10 max-w-sm">
                                    <PremiumIcon icon={TrendingUp} color="emerald" />
                                    <h3 className="text-xl font-medium mb-2 text-white">Global Synchronization</h3>
                                    <p className="text-white/40 text-sm leading-relaxed">Connect accounts worldwide. Our engine parses, categorizes, and updates your unified balance in under 50ms.</p>
                                </div>

                                {/* Clean UI Mockup inside card */}
                                <div className="relative z-10 mt-8 bg-black border border-white/[0.05] rounded-xl p-5 flex items-end gap-2 h-32">
                                    {[20, 35, 15, 45, 30, 60, 40, 75, 55, 100].map((h, i) => (
                                        <motion.div 
                                            key={i}
                                            initial={{ scaleY: 0 }}
                                            whileInView={{ scaleY: 1 }}
                                            transition={{ duration: 0.6, delay: i * 0.03, ease: "easeOut" }}
                                            className="flex-1 bg-white/20 rounded-sm origin-bottom hover:bg-white/40 transition-colors"
                                            style={{ height: `${h}%` }}
                                        />
                                    ))}
                                </div>
                            </div>
                        </FadeIn>

                        {/* Smaller Analytics Card */}
                        <FadeIn delay={0.1} className="h-[400px]">
                            <div className="rounded-2xl border border-white/[0.05] bg-[#080808] p-8 h-full flex flex-col justify-between hover:bg-[#0A0A0A] transition-colors group">
                                <div>
                                    <PremiumIcon icon={BarChart3} color="blue" />
                                    <h3 className="text-xl font-medium mb-2 text-white">Deep Analytics</h3>
                                    <p className="text-white/40 text-sm leading-relaxed">Visual breakdowns that actually make sense. No clutter.</p>
                                </div>
                                
                                <div className="flex justify-center relative items-center mt-8">
                                    <svg className="w-28 h-28 -rotate-90 transform" viewBox="0 0 100 100">
                                        <circle cx="50" cy="50" r="44" stroke="#111" strokeWidth="3" fill="none" />
                                        <motion.circle 
                                            initial={{ strokeDasharray: "0, 276.4" }}
                                            whileInView={{ strokeDasharray: "207.3, 276.4" }}
                                            transition={{ duration: 1, ease: "easeOut" }}
                                            cx="50" cy="50" r="44" 
                                            stroke="#fff" 
                                            strokeWidth="3" 
                                            fill="none" 
                                            strokeLinecap="round" 
                                        />
                                    </svg>
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <span className="font-medium text-xl text-white">75%</span>
                                    </div>
                                </div>
                            </div>
                        </FadeIn>
                    </div>

                    {/* Features Grid */}
                    <div className="grid md:grid-cols-3 gap-4">
                        {[
                            { title: "Bank-Grade Encryption", desc: "AES-256 encryption at rest. TLS 1.3 in transit. Your data is isolated and mathematically secure.", icon: Shield },
                            { title: "Deterministic Rules", desc: "Set strict budgeting boundaries. The engine categorizes instantly without guessing.", icon: Target },
                            { title: "Single Source of Truth", desc: "Checking, savings, credit, and equity. One dashboard. Zero context switching.", icon: Landmark }
                        ].map((card, i) => (
                            <FadeIn key={i} delay={i * 0.1}>
                                <div className="rounded-2xl border border-white/[0.05] bg-[#080808] p-8 h-full flex flex-col hover:bg-[#0A0A0A] transition-colors group">
                                    <PremiumIcon icon={card.icon} color="white" />
                                    <h4 className="text-base font-medium mb-2 text-white">{card.title}</h4>
                                    <p className="text-white/40 text-sm leading-relaxed">{card.desc}</p>
                                </div>
                            </FadeIn>
                        ))}
                    </div>
                </div>
            </section>

            {/* ═══════════ FREEMIUM MODEL INFO ═══════════ */}
            <section className="bg-[#000] py-32 px-6 relative z-10 border-t border-white/[0.05]">
                <div className="max-w-[1200px] mx-auto text-center flex flex-col items-center group">
                    <FadeIn>
                        <PremiumIcon icon={Layers} color="white" className="mx-auto mb-8 w-16 h-16 [&>svg]:w-7 [&>svg]:h-7" />
                    </FadeIn>
                    <FadeIn delay={0.1}>
                        <h2 className="text-3xl md:text-5xl font-medium tracking-tight mb-6 text-white max-w-2xl leading-tight">
                            Enterprise-grade features.<br/>Available to everyone.
                        </h2>
                    </FadeIn>
                    <FadeIn delay={0.2}>
                        <p className="text-base text-white/40 font-normal leading-relaxed mb-10 max-w-xl mx-auto">
                            We don't gatekeep financial clarity. 
                            Every SmartSpend account includes our full suite of analytics, tracking, and security features—completely free. 
                        </p>
                    </FadeIn>
                    <FadeIn delay={0.3}>
                        <Link href="/register">
                            <button className="h-11 px-8 rounded-lg bg-white text-black font-medium text-sm hover:bg-white/90 transition-colors shadow-[0_0_0_1px_rgba(255,255,255,1)]">
                                Create free account
                            </button>
                        </Link>
                    </FadeIn>
                </div>
            </section>

            {/* ═══════════ SLEEK FOOTER ═══════════ */}
            <footer className="bg-[#000] border-t border-white/[0.05] text-white py-12 px-6 relative z-10">
                <div className="max-w-[1200px] mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex items-center gap-3">
                        <span className="font-semibold text-base tracking-tight text-white">SmartSpend</span>
                        <div className="w-1 h-1 rounded-full bg-white/20" />
                        <span className="text-sm text-white/40">© {new Date().getFullYear()}</span>
                    </div>
                    
                    <div className="flex gap-6 text-sm font-medium text-white/40">
                        <Link href="/about" className="hover:text-white transition-colors">About</Link>
                        <Link href="/dashboard" className="hover:text-white transition-colors">Dashboard</Link>
                        <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
                        <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
                    </div>
                </div>
            </footer>
        </div>
    );
}
