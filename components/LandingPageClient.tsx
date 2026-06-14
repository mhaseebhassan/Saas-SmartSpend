"use client";

import React, { useState, useRef } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { useSession } from "next-auth/react";
import { motion, useInView, useScroll, useTransform } from "framer-motion";
import {
  ArrowRight,
  Wallet,
  PieChart,
  LayoutDashboard,
  Sparkles,
  TrendingUp,
  Check,
  RefreshCw,
  Zap,
  Bell,
  CreditCard,
  BarChart3,
  Target,
  Users,
  ChevronRight,
} from "lucide-react";

/* ─── Fade-in wrapper ─── */
function FadeIn({
  children,
  delay = 0,
  className = "",
  direction = "up",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
  direction?: "up" | "down" | "left" | "right";
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });
  const dirs = {
    up: { y: 80, x: 0, rotateX: 15, scale: 0.9 },
    down: { y: -80, x: 0, rotateX: -15, scale: 0.9 },
    left: { x: 80, y: 0, rotateY: 15, scale: 0.9 },
    right: { x: -80, y: 0, rotateY: -15, scale: 0.9 },
  };
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, ...dirs[direction] }}
      animate={inView ? { opacity: 1, x: 0, y: 0, rotateX: 0, rotateY: 0, scale: 1 } : {}}
      transition={{ duration: 1.2, delay, type: "spring", bounce: 0.4 }}
      className={className}
      style={{ perspective: 1200 }}
    >
      {children}
    </motion.div>
  );
}

/* ─── Abstract chart bar heights for the mockup (decorative only) ─── */
const chartBars = [65, 45, 78, 52, 88, 42, 95, 68, 72, 55, 83, 47, 91, 60, 76, 50, 85, 58, 93, 70];

/* ─── Floating Nodes (from external project, adapted for finance) ─── */
function FloatingNodes() {
  const nodes = [
    { x: '10%', y: '20%', delay: 0, size: 48, label: '$' },
    { x: '85%', y: '15%', delay: 0.5, size: 40, label: '€' },
    { x: '80%', y: '70%', delay: 1, size: 44, label: '£' },
    { x: '15%', y: '65%', delay: 1.5, size: 36, label: '¥' },
    { x: '50%', y: '85%', delay: 0.8, size: 32, label: '%' },
  ];
  return (
    <>
      <style>{`
        @keyframes floatNode {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-18px) rotate(5deg); }
        }
      `}</style>
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        {nodes.map((n, i) => (
          <div key={i} style={{
            position: 'absolute', left: n.x, top: n.y,
            width: n.size, height: n.size,
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.02)',
            border: '1px solid rgba(255,255,255,0.08)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 16, fontWeight: 800, color: 'rgba(255,255,255,0.4)',
            animation: `floatNode 6s ease-in-out ${n.delay}s infinite`,
            boxShadow: '0 0 20px rgba(255,255,255,0.02)',
            backdropFilter: 'blur(4px)',
          }}>
            {n.label}
          </div>
        ))}
      </div>
    </>
  );
}

/* ─── Mouse Tracking Glow Card ─── */
function GlowCard({ children, className = "" }: { children: React.ReactNode, className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [opacity, setOpacity] = useState(0);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    setPosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  return (
    <div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setOpacity(1)}
      onMouseLeave={() => setOpacity(0)}
      className={`relative overflow-hidden ${className}`}
    >
      <div
        className="pointer-events-none absolute -inset-px transition-opacity duration-300 z-0 rounded-[inherit]"
        style={{
          opacity,
          background: `radial-gradient(500px circle at ${position.x}px ${position.y}px, rgba(255,255,255,0.06), transparent 40%)`,
        }}
      />
      <div className="relative z-10 h-full">{children}</div>
    </div>
  );
}

/* ─── Interactive Savings Calculator ─── */
function SavingsCalculator() {
  const [spend, setSpend] = useState(2500);
  const savings = Math.round(spend * 0.18); // 18% average AI savings

  return (
    <section className="container mx-auto px-6 py-24 relative z-10">
      <FadeIn>
        <div className="max-w-4xl mx-auto bg-white/[0.02] border border-white/[0.06] rounded-3xl p-10 md:p-16 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-[80px] pointer-events-none" />
          <h2 className="text-3xl md:text-4xl font-medium tracking-tight text-white mb-4">
            Calculate your potential savings.
          </h2>
          <p className="text-white/50 text-lg font-light mb-12 max-w-xl mx-auto">
            Adjust your estimated monthly spending to see how much smart budget tracking can save you per month.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="flex flex-col items-start text-left">
              <label className="text-sm font-medium text-white/60 mb-4">Monthly Spending</label>
              <div className="text-4xl font-semibold text-white mb-8">${spend.toLocaleString()}</div>
              <input 
                type="range" 
                min="500" 
                max="10000" 
                step="100"
                value={spend} 
                onChange={(e) => setSpend(Number(e.target.value))}
                className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-emerald-500 focus:outline-none"
              />
              <div className="flex justify-between w-full mt-3 text-xs text-white/30">
                <span>$500</span>
                <span>$10,000+</span>
              </div>
            </div>

            <div className="relative p-8 rounded-[2rem] bg-gradient-to-br from-emerald-500/10 to-transparent border border-emerald-500/20 text-left">
              <div className="text-sm font-medium text-emerald-400 mb-2">Estimated Monthly Savings</div>
              <div className="text-6xl font-bold text-white tracking-tighter">
                ${savings.toLocaleString()}
              </div>
              <p className="text-xs text-white/40 mt-4 leading-relaxed">
                Based on an 18% average optimization rate across our user base tracking subscriptions, impulse buys, and dynamic limits.
              </p>
            </div>
          </div>
        </div>
      </FadeIn>
    </section>
  );
}


export default function Home() {
  const { data: session } = useSession();
  const [isYearly, setIsYearly] = useState(true);

  // Scroll animations for Parallax effects
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  
  // Parallax transforms
  const auroraY = useTransform(scrollYProgress, [0, 1], [0, 600]);
  const heroImageY = useTransform(scrollYProgress, [0, 1], [0, -150]);
  const floatingNodesY = useTransform(scrollYProgress, [0, 1], [0, -400]);
  const marqueeX = useTransform(scrollYProgress, [0, 1], ["0%", "-50%"]);

  const pricingPlans = [
    {
      name: "Starter",
      description: "Perfect for tracking daily personal finances.",
      price: isYearly ? 0 : 0,
      period: "per user/month",
      cta: "Get Started Free",
      link: "/register",
      popular: false,
      features: [
        "Interactive analytics dashboards",
        "Up to 3 basic manual budget tracks",
        "Single currency expense logging",
        "Monthly breakdown & report exports",
      ],
    },
    {
      name: "Pro",
      description: "Advanced tracking for wealth optimization.",
      price: isYearly ? 8 : 10,
      period: "per user/month",
      cta: "Get Started Pro",
      link: "/register?plan=pro",
      popular: true,
      features: [
        "Unlimited manual & linked accounts",
        "Real-time instant bank connection sync",
        "Smart Spending Assistant & custom alerts",
        "Multi-currency conversion & assets tracking",
        "Advanced weekly and monthly visual trends",
        "Priority 24/7 client concierge support",
      ],
    },
    {
      name: "Enterprise",
      description: "Tailored portfolio solutions for joint finances.",
      price: isYearly ? 40 : 50,
      period: "per user/month",
      cta: "Contact Enterprise",
      link: "/register?plan=enterprise",
      popular: false,
      features: [
        "Multi-user shared family/team accounts",
        "Advanced custom tax write-off formats",
        "Early access developer API workspace",
        "Dedicated elite personal wealth strategist",
        "Custom banking SLA custom integrations",
      ],
    },
  ];

  return (
    <div className="relative min-h-screen text-[#E2E8F0] overflow-hidden font-sans selection:bg-white/10 selection:text-white">
      {/* Scroll Progress Bar */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-cyan-500 to-purple-500 origin-left z-50"
        style={{ scaleX: scrollYProgress }}
      />

      {/* Animated Aurora Background (Consistent on Scroll) */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-emerald-500/10 blur-[120px] mix-blend-screen animate-aurora-1" />
        <div className="absolute top-[20%] right-[-10%] w-[30%] h-[50%] rounded-full bg-cyan-500/10 blur-[120px] mix-blend-screen animate-aurora-2" />
        <div className="absolute bottom-[20%] left-[20%] w-[50%] h-[40%] rounded-full bg-purple-500/10 blur-[120px] mix-blend-screen animate-aurora-3" />
        <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.15)_1px,transparent_1px)] bg-[size:24px_24px] opacity-40" />
        <style>{`
          @keyframes aurora-1 {
            0%, 100% { transform: translateY(0) scale(1); }
            50% { transform: translateY(10%) scale(1.1); }
          }
          @keyframes aurora-2 {
            0%, 100% { transform: translateX(0) scale(1); }
            50% { transform: translateX(-10%) scale(1.2); }
          }
          @keyframes aurora-3 {
            0%, 100% { transform: translate(0, 0) scale(1); }
            50% { transform: translate(10%, -10%) scale(0.9); }
          }
          .animate-aurora-1 { animation: aurora-1 15s ease-in-out infinite; }
          .animate-aurora-2 { animation: aurora-2 20s ease-in-out infinite; }
          .animate-aurora-3 { animation: aurora-3 25s ease-in-out infinite; }
        `}</style>
      </div>

      {/* ═══════════ HERO SECTION ═══════════ */}
      <section ref={heroRef} className="container mx-auto px-6 pt-[80px] pb-32 text-center relative z-10 flex flex-col items-center">
        {/* Ambient Radial Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-emerald-500/10 via-transparent to-transparent blur-[100px] pointer-events-none z-0" />
        
        {/* Floating 3D Finance Nodes */}
        <motion.div style={{ y: floatingNodesY }} className="relative z-10 w-full">
          <FloatingNodes />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="flex flex-col items-center relative z-10"
        >
          {/* Badge */}
          <Link href={session ? "/dashboard" : "/register"}>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.08] text-xs text-white/60 mb-8 backdrop-blur-md hover:bg-white/[0.08] hover:text-white transition-colors cursor-pointer group"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>Real-time Financial Analytics</span>
              <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
            </motion.div>
          </Link>

          {/* Heading with Metallic Gradient */}
          <h1 className="text-5xl md:text-7xl lg:text-[84px] font-medium tracking-tight leading-[1.05] mb-6 max-w-4xl">
            <span className="bg-gradient-to-b from-white to-white/60 bg-clip-text text-transparent">Advanced </span>
            <span className="text-white/40">wealth management, redefined.</span>
          </h1>

          <p className="text-lg md:text-xl text-white/50 max-w-2xl mx-auto mb-10 leading-relaxed font-light">
            The ultra-fast, intelligent control center for modern personal finance.
            Connect instantly, set strict targets, and let your assets compound.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            {session ? (
              <Link href="/dashboard">
                <Button
                  size="lg"
                  className="h-12 px-6 rounded-full bg-white text-black font-medium hover:bg-white/90 transition-all cursor-pointer shadow-[0_0_20px_rgba(255,255,255,0.1)] flex items-center gap-2 group relative overflow-hidden"
                >
                  <span className="absolute inset-0 w-full h-full -translate-x-full bg-gradient-to-r from-transparent via-white/40 to-transparent group-hover:animate-shimmer" />
                  <span className="relative z-10 flex items-center gap-2">Go to Dashboard <LayoutDashboard className="w-4 h-4" /></span>
                </Button>
              </Link>
            ) : (
              <>
                <Link href="/register">
                  <Button
                    size="lg"
                    className="h-12 px-6 rounded-full bg-white text-black font-medium hover:bg-white/90 transition-all cursor-pointer shadow-[0_0_20px_rgba(255,255,255,0.1)] flex items-center gap-2 group relative overflow-hidden"
                  >
                    <span className="absolute inset-0 w-full h-full -translate-x-full bg-gradient-to-r from-transparent via-white/40 to-transparent group-hover:animate-shimmer" />
                    <span className="relative z-10 flex items-center gap-2">Get Started Free <ArrowRight className="w-4 h-4" /></span>
                  </Button>
                </Link>
                <Link href="/login">
                  <Button
                    variant="ghost"
                    size="lg"
                    className="h-12 px-6 rounded-full bg-white/[0.02] border border-white/[0.08] hover:bg-white/[0.06] text-white transition-all cursor-pointer backdrop-blur-sm"
                  >
                    Sign In
                  </Button>
                </Link>
              </>
            )}
          </div>
        </motion.div>

        {/* High-Fidelity App Preview */}
        <motion.div
          className="w-full max-w-6xl mt-24 relative z-10"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
          style={{ y: heroImageY }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-[#09090B] via-transparent to-transparent z-20 pointer-events-none h-full" />
          
          <div className="relative mx-auto rounded-xl border border-white/[0.1] bg-[#09090B]/50 p-2 backdrop-blur-xl shadow-[0_20px_80px_-20px_rgba(255,255,255,0.1)]">
            {/* macOS Chrome Header */}
            <div className="h-8 bg-white/[0.02] border-b border-white/[0.04] rounded-t-lg flex items-center px-4 gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-[#FF5F57] border border-white/10" />
              <div className="w-2.5 h-2.5 rounded-full bg-[#FEBC2E] border border-white/10" />
              <div className="w-2.5 h-2.5 rounded-full bg-[#28C840] border border-white/10" />
            </div>
            
            {/* The Actual Dashboard Image */}
            <div className="rounded-b-lg overflow-hidden bg-[#09090B]">
              <img 
                src="/dashboard.png" 
                alt="SmartSpend Dashboard Preview" 
                className="w-full h-auto object-cover opacity-90 hover:opacity-100 transition-opacity duration-500" 
              />
            </div>
          </div>
        </motion.div>
      </section>

      {/* ═══════════ FEATURES — BENTO GRID ═══════════ */}
      <section id="features" className="container mx-auto px-6 py-24 relative z-10">
        <FadeIn>
          <div className="text-center max-w-3xl mx-auto mb-20">
            <h2 className="text-3xl md:text-4xl font-medium tracking-tight text-white mb-4">
              Engineered for precision.
            </h2>
            <p className="text-white/50 text-lg font-light leading-relaxed">
              A standard set of premium finance systems constructed to deliver high-fidelity optimization without the visual clutter.
            </p>
          </div>
        </FadeIn>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-5xl mx-auto">
          {/* Bento Card 1 — Predictive AI */}
          <FadeIn delay={0} className="md:col-span-2">
            <GlowCard className="h-full bg-white/[0.02] border border-white/[0.06] rounded-[2rem] p-8 flex flex-col justify-between group">
              <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-bl from-cyan-500/[0.05] to-transparent rounded-full blur-2xl group-hover:from-cyan-500/[0.08] transition-all duration-500 pointer-events-none" />
              <div className="relative z-10">
                <Sparkles className="w-5 h-5 text-cyan-400/70 mb-4" />
                <h3 className="text-xl font-medium text-white mb-2">Smart Trend Insights</h3>
                <p className="text-white/50 text-sm leading-relaxed max-w-sm">
                  Our financial model scans transactions to visualize cycles, set dynamic limits, and alert you intelligently.
                </p>
              </div>
              <div className="mt-8 pt-4 border-t border-white/[0.06] relative z-10">
                <div className="flex items-center gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <p className="text-xs text-white/70">Auto-adjusting budget categories in real time.</p>
                </div>
              </div>
            </GlowCard>
          </FadeIn>

          {/* Bento Card 2 — Global Sync */}
          <FadeIn delay={0.1}>
            <GlowCard className="h-full bg-white/[0.02] border border-white/[0.06] rounded-[2rem] p-8 flex flex-col justify-between group">
              <div>
                <RefreshCw className="w-5 h-5 text-blue-400/70 mb-4" />
                <h3 className="text-xl font-medium text-white mb-2">Global Sync</h3>
                <p className="text-white/50 text-sm leading-relaxed">
                  Secure API pipelines map your linked institutions in milliseconds.
                </p>
              </div>
              <div className="mt-6 flex gap-1.5">
                {[1, 2, 3, 4, 5].map((_, i) => (
                  <div key={i} className="flex-1 h-1 rounded-full bg-white/[0.06] overflow-hidden">
                    <motion.div
                      className="h-full bg-blue-400/40 rounded-full"
                      initial={{ width: 0 }}
                      whileInView={{ width: "100%" }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.6, delay: i * 0.15 }}
                    />
                  </div>
                ))}
              </div>
            </GlowCard>
          </FadeIn>

          {/* Bento Card 3 — Visual Trends */}
          <FadeIn delay={0.15}>
            <GlowCard className="h-full bg-white/[0.02] border border-white/[0.06] rounded-[2rem] p-8 flex flex-col justify-between">
              <div>
                <PieChart className="w-5 h-5 text-purple-400/70 mb-4" />
                <h3 className="text-xl font-medium text-white mb-2">Visual Trends</h3>
                <p className="text-white/50 text-sm leading-relaxed">
                  High-resolution monochrome charts to drill down into habits instantly.
                </p>
              </div>
              <div className="mt-6 flex items-end gap-1 h-12">
                {[40, 65, 35, 80, 55, 70, 45, 90].map((h, i) => (
                  <motion.div
                    key={i}
                    className="flex-1 rounded-t-sm bg-gradient-to-t from-purple-400/10 to-purple-400/30"
                    initial={{ height: 0 }}
                    whileInView={{ height: `${h}%` }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: i * 0.06 }}
                  />
                ))}
              </div>
            </GlowCard>
          </FadeIn>

          {/* Bento Card 4 — Smart Alerts */}
          <FadeIn delay={0.2}>
            <GlowCard className="h-full bg-white/[0.02] border border-white/[0.06] rounded-[2rem] p-8 flex flex-col justify-between group">
              <div>
                <Bell className="w-5 h-5 text-amber-400/70 mb-4" />
                <h3 className="text-xl font-medium text-white mb-2">Smart Alerts</h3>
                <p className="text-white/50 text-sm leading-relaxed">
                  Get notified before you overspend. Budget thresholds trigger instant alerts.
                </p>
              </div>
              <div className="mt-6 space-y-2">
                <div className="flex items-center gap-2 p-2 rounded-lg bg-amber-400/[0.06] border border-amber-400/10">
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                  <span className="text-[10px] text-white/60">Budget threshold approaching — review spending</span>
                </div>
              </div>
            </GlowCard>
          </FadeIn>

          {/* Bento Card 5 — Subscription Tracking */}
          <FadeIn delay={0.25}>
            <GlowCard className="h-full bg-white/[0.02] border border-white/[0.06] rounded-[2rem] p-8 flex flex-col justify-between group">
              <div>
                <CreditCard className="w-5 h-5 text-rose-400/70 mb-4" />
                <h3 className="text-xl font-medium text-white mb-2">Subscription Tracking</h3>
                <p className="text-white/50 text-sm leading-relaxed">
                  Auto-detect and monitor recurring subscriptions so you never pay for a service you don't use.
                </p>
              </div>
              <div className="mt-6 space-y-2">
                <div className="flex items-center justify-between p-2 rounded-lg bg-white/[0.02] border border-white/[0.04]">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-rose-500/20 flex items-center justify-center text-[8px] font-bold text-rose-400">N</div>
                    <span className="text-[10px] text-white/80">Netflix</span>
                  </div>
                  <span className="text-[10px] text-white/50">$15.99/mo</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded-lg bg-white/[0.02] border border-white/[0.04]">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-emerald-500/20 flex items-center justify-center text-[8px] font-bold text-emerald-400">S</div>
                    <span className="text-[10px] text-white/80">Spotify</span>
                  </div>
                  <span className="text-[10px] text-white/50">$10.99/mo</span>
                </div>
              </div>
            </GlowCard>
          </FadeIn>

        </div>
      </section>

      {/* ═══════════ SAVINGS CALCULATOR ═══════════ */}
      <SavingsCalculator />

      {/* ═══════════ HOW IT WORKS ═══════════ */}
      <section className="container mx-auto px-6 py-24 relative z-10">
        <FadeIn>
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-medium tracking-tight text-white mb-4">
              Three steps to financial clarity.
            </h2>
            <p className="text-white/50 text-lg font-light leading-relaxed">
              Go from sign-up to full financial visibility in under two minutes.
            </p>
          </div>
        </FadeIn>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          {[
            {
              step: "01",
              icon: Users,
              title: "Create Your Account",
              desc: "Sign up for free — no credit card required. Get instant access to your personal dashboard.",
            },
            {
              step: "02",
              icon: Wallet,
              title: "Add Your Finances",
              desc: "Log expenses manually or connect bank accounts for automatic transaction syncing.",
            },
            {
              step: "03",
              icon: TrendingUp,
              title: "Watch Your Wealth Grow",
              desc: "Set budgets, track trends, and receive smart analytics to optimize every dollar.",
            },
          ].map((item, i) => (
            <FadeIn key={i} delay={i * 0.15}>
              <div className="relative p-8 rounded-[2rem] bg-white/[0.02] border border-white/[0.06] hover:bg-white/[0.04] transition-all duration-300 text-center group">
                {/* Step number */}
                <span className="text-[80px] font-bold text-white/[0.03] absolute top-2 right-4 leading-none select-none group-hover:text-white/[0.05] transition-colors">{item.step}</span>
                <div className="relative z-10">
                  <div className="w-12 h-12 rounded-[2rem] bg-white/[0.06] border border-white/[0.06] flex items-center justify-center mx-auto mb-6">
                    <item.icon className="w-5 h-5 text-white/60" />
                  </div>
                  <h3 className="text-lg font-medium text-white mb-3">{item.title}</h3>
                  <p className="text-sm text-white/50 leading-relaxed">{item.desc}</p>
                </div>
                {/* Connector line */}
                {i < 2 && (
                  <div className="hidden md:block absolute top-1/2 -right-4 w-8 h-px bg-white/[0.08]" />
                )}
              </div>
            </FadeIn>
          ))}
        </div>
      </section>

      {/* ═══════════ PRICING ═══════════ */}
      <section id="pricing" className="container mx-auto px-6 py-32 relative z-10">
        <FadeIn>
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-medium tracking-tight text-white mb-4">
              Simple, transparent pricing.
            </h2>
            <p className="text-white/50 text-lg font-light mb-8">
              Start for free, upgrade when you need more power.
            </p>

            <div className="inline-flex items-center p-1 bg-white/[0.02] border border-white/[0.08] rounded-lg">
              <button
                onClick={() => setIsYearly(false)}
                className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${
                  !isYearly ? "bg-white/10 text-white shadow-sm" : "text-white/40 hover:text-white"
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setIsYearly(true)}
                className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${
                  isYearly ? "bg-white/10 text-white shadow-sm" : "text-white/40 hover:text-white"
                }`}
              >
                Yearly
                <span className="ml-1.5 text-[10px] text-emerald-400">Save 20%</span>
              </button>
            </div>
          </div>
        </FadeIn>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {pricingPlans.map((plan, index) => (
            <FadeIn key={index} delay={index * 0.1}>
              <div
                className={`p-8 rounded-[2rem] border flex flex-col h-full ${
                  plan.popular
                    ? "bg-white/[0.04] border-white/20 shadow-[0_0_40px_rgba(255,255,255,0.04)] relative"
                    : "bg-white/[0.01] border-white/[0.06] hover:bg-white/[0.02] transition-colors"
                }`}
              >
                {plan.popular && (
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white text-black text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full">
                    Most Popular
                  </div>
                )}
                <h3 className="text-lg font-medium text-white mb-2">{plan.name}</h3>
                <p className="text-sm text-white/50 mb-6 h-10">{plan.description}</p>

                <div className="mb-8 border-b border-white/[0.06] pb-8">
                  <span className="text-4xl font-semibold text-white">${plan.price}</span>
                  <span className="text-xs text-white/40 ml-2">{plan.period}</span>
                </div>

                <ul className="flex flex-col gap-4 mb-8 flex-1">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-sm text-white/70">
                      <Check className="w-4 h-4 text-emerald-400/60 mt-0.5 shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <Link href={plan.link}>
                  <Button
                    className={`w-full py-2.5 rounded-lg font-medium text-sm transition-all ${
                      plan.popular
                        ? "bg-white text-black hover:bg-white/90 shadow-[0_0_20px_rgba(255,255,255,0.1)]"
                        : "bg-white/[0.02] border border-white/[0.08] text-white hover:bg-white/[0.06]"
                    }`}
                  >
                    {plan.cta}
                  </Button>
                </Link>
              </div>
            </FadeIn>
          ))}
        </div>
      </section>

      {/* ═══════════ FAQ ═══════════ */}
      <section className="container mx-auto px-6 py-24 relative z-10">
        <FadeIn>
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-medium tracking-tight text-white mb-4">
              Frequently asked questions.
            </h2>
          </div>
        </FadeIn>

        <div className="max-w-2xl mx-auto space-y-4">
          {[
            {
              q: "Is SmartSpend really free to start?",
              a: "Absolutely. The Starter plan is free forever with no credit card required. You get full dashboard access, up to 3 budget tracks, and monthly reports.",
            },
            {
              q: "How does the smart spending assistant work?",
              a: "Our system analyzes your transaction patterns to visualize your spending, suggest budget adjustments, and alert you before you overspend on any category.",
            },
            {
              q: "Is my financial data secure?",
              a: "Yes. We use AES-256 encryption, zero-knowledge architecture, and never store your banking credentials. Your data is encrypted at rest and in transit.",
            },
            {
              q: "Can I cancel my Pro subscription anytime?",
              a: "Yes, you can cancel anytime from your settings page. You'll retain Pro features until the end of your billing cycle with no cancellation fees.",
            },
          ].map((faq, i) => (
            <FadeIn key={i} delay={i * 0.08}>
              <details className="group bg-white/[0.02] border border-white/[0.06] rounded-xl overflow-hidden">
                <summary className="p-6 cursor-pointer text-sm font-medium text-white flex items-center justify-between hover:bg-white/[0.02] transition-colors list-none">
                  {faq.q}
                  <ChevronRight className="w-4 h-4 text-white/30 transition-transform group-open:rotate-90 shrink-0 ml-4" />
                </summary>
                <div className="px-6 pb-6 text-sm text-white/50 leading-relaxed border-t border-white/[0.04] pt-4">
                  {faq.a}
                </div>
              </details>
            </FadeIn>
          ))}
        </div>
      </section>

      {/* ═══════════ CTA & FOOTER ═══════════ */}
      <section className="container mx-auto px-6 py-20 text-center relative z-10 border-t border-white/[0.04]">
        <FadeIn>
          <div className="max-w-3xl mx-auto py-16 relative">
            {/* Glow behind CTA */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_400px_at_50%_50%,rgba(255,255,255,0.03),transparent)] pointer-events-none" />
            <h2 className="text-3xl md:text-5xl font-medium tracking-tight text-white mb-6 relative z-10">
              Ready to optimize?
            </h2>
            <p className="text-white/50 text-lg mb-10 font-light relative z-10">
              Take control of your finances with precision and clarity.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center relative z-10">
              {session ? (
                <Link href="/dashboard">
                  <Button size="lg" className="px-8 rounded-full bg-white text-black font-medium hover:bg-white/90 shadow-[0_0_30px_rgba(255,255,255,0.08)] flex items-center gap-2 group relative overflow-hidden">
                    <span className="absolute inset-0 w-full h-full -translate-x-full bg-gradient-to-r from-transparent via-white/40 to-transparent group-hover:animate-shimmer" />
                    <span className="relative z-10 flex items-center gap-2">Go to Dashboard <LayoutDashboard className="w-4 h-4" /></span>
                  </Button>
                </Link>
              ) : (
                <>
                  <Link href="/register">
                    <Button size="lg" className="px-8 rounded-full bg-white text-black font-medium hover:bg-white/90 shadow-[0_0_30px_rgba(255,255,255,0.08)] flex items-center gap-2">
                      Create Free Account <ArrowRight className="w-4 h-4" />
                    </Button>
                  </Link>
                  <Link href="/login">
                    <Button variant="ghost" size="lg" className="px-8 rounded-full bg-white/[0.02] border border-white/[0.08] hover:bg-white/[0.06] text-white">
                      Sign In
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </FadeIn>

        <footer className="mt-12 pt-8 border-t border-white/[0.04]">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-8">
            <div className="flex items-center gap-2 text-white/30">
              <Zap className="w-3.5 h-3.5" />
              <span className="text-xs font-medium">SmartSpend</span>
            </div>
            <nav className="flex flex-wrap items-center justify-center gap-6">
              <Link href="#features" className="text-xs text-white/30 hover:text-white/60 transition-colors">Features</Link>
              <Link href="#pricing" className="text-xs text-white/30 hover:text-white/60 transition-colors">Pricing</Link>
              <Link href="/about" className="text-xs text-white/30 hover:text-white/60 transition-colors">About</Link>
              <Link href="/terms" className="text-xs text-white/30 hover:text-white/60 transition-colors">Terms</Link>
              <Link href="/privacy" className="text-xs text-white/30 hover:text-white/60 transition-colors">Privacy</Link>
            </nav>
          </div>
          <div className="text-center text-xs text-white/20 pt-6 border-t border-white/[0.04]">
            <p>© {new Date().getFullYear()} SmartSpend Inc. All rights reserved.</p>
          </div>
        </footer>
      </section>
    </div>
  );
}
