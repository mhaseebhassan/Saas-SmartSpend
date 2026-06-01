"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { useSession } from "next-auth/react";
import { motion, useScroll, useTransform, useInView, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  Wallet,
  PieChart,
  ShieldCheck,
  LayoutDashboard,
  Sparkles,
  Shield,
  TrendingUp,
  Activity,
  Check,
  Lock,
  Calendar,
  Globe,
  Coins,
  Users,
  Star,
  MessageSquare,
  AlertTriangle,
  RefreshCw,
  Zap,
  DollarSign,
  ChevronRight,
  ArrowUpRight,
  Bell,
  Clock,
  Briefcase
} from "lucide-react";

// Hook to animate numbers (dynamic counters)
function Counter({
  value,
  suffix = "",
  prefix = "",
  decimals = 0,
  duration = 2
}: {
  value: number;
  suffix?: string;
  prefix?: string;
  decimals?: number;
  duration?: number;
}) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-50px" });

  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const end = value;
    if (start === end) return;

    const totalMiliseconds = duration * 1000;
    const intervalTime = 20; // 50 updates per second
    const totalSteps = totalMiliseconds / intervalTime;
    const increment = (end - start) / totalSteps;

    let currentStep = 0;
    const timer = setInterval(() => {
      currentStep++;
      start += increment;
      if (currentStep >= totalSteps) {
        clearInterval(timer);
        setCount(end);
      } else {
        setCount(start);
      }
    }, intervalTime);

    return () => clearInterval(timer);
  }, [inView, value, duration]);

  return (
    <span ref={ref} className="font-bold tracking-tight">
      {prefix}
      {count.toLocaleString(undefined, {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
      })}
      {suffix}
    </span>
  );
}

export default function Home() {
  const { data: session } = useSession();
  const { scrollY } = useScroll();

  // Scroll parallax animations for background blobs
  const yBlob1 = useTransform(scrollY, [0, 1000], [0, 200]);
  const yBlob2 = useTransform(scrollY, [0, 1000], [0, -150]);
  const yBlob3 = useTransform(scrollY, [0, 1000], [0, 80]);

  // 3D Mouse Tilt State for the Hero Dashboard mockup
  const mockupRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!mockupRef.current) return;
    
    // Disable tilt on mobile/tablet devices for better responsiveness and touch UX
    if (typeof window !== "undefined" && window.innerWidth < 768) {
      setTilt({ x: 0, y: 0 });
      return;
    }

    const rect = mockupRef.current.getBoundingClientRect();
    const halfWidth = rect.width / 2;
    const halfHeight = rect.height / 2;
    
    if (halfWidth <= 0 || halfHeight <= 0) return;

    const x = e.clientX - rect.left - halfWidth;
    const y = e.clientY - rect.top - halfHeight;
    
    // Limit rotation angle (degrees)
    const maxTilt = 8;
    const rawTiltX = -(y / halfHeight) * maxTilt;
    const rawTiltY = (x / halfWidth) * maxTilt;
    
    // Clamp to make sure tilt stays locked within bounds
    const tiltX = Math.max(-maxTilt, Math.min(maxTilt, rawTiltX));
    const tiltY = Math.max(-maxTilt, Math.min(maxTilt, rawTiltY));
    
    setTilt({ x: tiltX, y: tiltY });
  };

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 });
  };

  // State for annual/monthly billing toggle
  const [isYearly, setIsYearly] = useState(false);

  // Dynamic values based on billing cycle
  const pricingPlans = [
    {
      name: "Starter",
      description: "Perfect for tracking daily personal finances.",
      price: isYearly ? 0 : 0,
      period: "/mo",
      cta: "Get Started Free",
      link: "/register",
      popular: false,
      features: [
        "Interactive analytics dashboards",
        "Up to 3 basic manual budget tracks",
        "Single currency expense logging",
        "Monthly breakdown & report exports",
      ]
    },
    {
      name: "Pro",
      description: "AI-powered tracking for wealth optimization.",
      price: isYearly ? 7.20 : 9.00,
      period: "/mo",
      cta: "Get Started Pro",
      link: "/register?plan=pro",
      popular: true,
      features: [
        "Unlimited automated linked accounts",
        "Real-time instant bank connection sync",
        "Smart AI Spending Assistant & alerts",
        "Multi-currency conversion & assets tracking",
        "Asymmetric weekly predictive trends",
        "Priority 24/7 client concierge support",
      ]
    },
    {
      name: "Enterprise",
      description: "Tailored portfolio solutions for joint finances.",
      price: isYearly ? 39.20 : 49.00,
      period: "/mo",
      cta: "Contact Enterprise",
      link: "/register?plan=enterprise",
      popular: false,
      features: [
        "Multi-user shared family/team accounts",
        "Advanced custom tax write-off formats",
        "Early access developer API workspace",
        "Dedicated elite personal wealth strategist",
        "Custom banking SLA custom integrations",
      ]
    }
  ];

  const testimonials = [
    {
      quote: "SmartSpend completely transformed how I manage my monthly budgets. The automated bank sync works flawlessly.",
      author: "Sarah Jenkins",
      role: "Tech Lead at Stripe",
      rating: 5,
      avatar: "SJ"
    },
    {
      quote: "The interface is absolutely stellar. It feels like navigating a sci-fi cockpit. Managing my money has never been this satisfying.",
      author: "Elena Rostova",
      role: "Lead UX Designer",
      rating: 5,
      avatar: "ER"
    },
    {
      quote: "Zero bank connection dropouts. Total peace of mind with zero-knowledge data encryption. Highly recommended.",
      author: "Marcus Vance",
      role: "Senior Security Architect",
      rating: 5,
      avatar: "MV"
    }
  ];

  return (
    <div className="relative min-h-screen bg-[#05070F] text-[#F1F5F9] overflow-hidden font-sans">
      
      {/* 1. PARALLAX AURORA MESH BACKGROUND BLOBs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-[-10]">
        <motion.div
          style={{ y: yBlob1, x: "-10%" }}
          animate={{
            scale: [1, 1.15, 0.95, 1.05, 1],
            rotate: [0, 45, 90, 135, 180, 225, 270, 315, 360]
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute top-[-10%] left-[10%] w-[600px] h-[600px] md:w-[850px] md:h-[850px] rounded-full bg-cyan-500/10 blur-[130px]"
        />
        <motion.div
          style={{ y: yBlob2, x: "20%" }}
          animate={{
            scale: [1, 0.9, 1.1, 0.95, 1],
            rotate: [360, 270, 180, 90, 0]
          }}
          transition={{
            duration: 30,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute top-[25%] right-[5%] w-[500px] h-[500px] md:w-[750px] md:h-[750px] rounded-full bg-violet-600/10 blur-[140px]"
        />
        <motion.div
          style={{ y: yBlob3, x: "-5%" }}
          animate={{
            scale: [1, 1.2, 0.85, 1.05, 1],
            rotate: [0, 90, 180, 270, 360]
          }}
          transition={{
            duration: 22,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute bottom-[10%] left-[20%] w-[450px] h-[450px] md:w-[650px] md:h-[650px] rounded-full bg-pink-500/8 blur-[120px]"
        />
      </div>

      {/* Grid overlay for tech look */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none z-0" />

      {/* Hero Section */}
      <section className="container mx-auto px-4 pt-36 pb-32 text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30, filter: "blur(10px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* Badge indicator */}
          <div className="inline-flex items-center gap-2.5 rounded-full border border-white/[0.06] bg-[#111827]/60 backdrop-blur-xl px-4 py-1.5 text-xs font-semibold text-cyan-400 mb-8 shadow-2xl hover:border-cyan-500/20 hover:shadow-[0_0_20px_rgba(6,182,212,0.1)] transition-all duration-300 cursor-default">
            <span className="flex h-2.5 w-2.5 rounded-full bg-cyan-400 animate-pulse" />
            <span className="bg-gradient-to-r from-cyan-400 via-violet-400 to-pink-500 bg-clip-text text-transparent font-black uppercase tracking-wider text-[10px]">SmartSpend v2.0 is live</span>
          </div>

          {/* Glowing Main Heading */}
          <h1 className="text-5xl md:text-8xl font-black tracking-tight leading-none mb-6">
            <span className="bg-gradient-to-b from-white via-[#F1F5F9] to-[#94A3B8] bg-clip-text text-transparent">Smart spending </span>
            <br />
            <span className="bg-gradient-to-r from-cyan-400 via-violet-400 to-pink-500 bg-clip-text text-transparent filter drop-shadow-[0_0_30px_rgba(6,182,212,0.25)]">starts here.</span>
          </h1>

          <p className="text-base md:text-xl text-[#94A3B8] max-w-2xl mx-auto mb-10 leading-relaxed font-light">
            The ultra-fast, intelligent autonomous control center for modern personal finance.
            Connect instantly, set strict targets, and watch your assets compound with zero effort.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-24">
            {session ? (
              <Link href="/dashboard">
                <Button 
                  size="lg" 
                  className="h-14 px-8 text-base rounded-full bg-gradient-to-r from-cyan-500 via-violet-500 to-pink-500 text-white font-bold hover:scale-[1.02] active:scale-95 shadow-[0_0_40px_-10px_rgba(6,182,212,0.5)] hover:shadow-[0_0_40px_rgba(139,92,246,0.5)] transition-all duration-300 cursor-pointer"
                >
                  Go to Dashboard <LayoutDashboard className="ml-2 w-5 h-5" />
                </Button>
              </Link>
            ) : (
              <>
                <Link href="/register">
                  <Button 
                    size="lg" 
                    className="h-14 px-8 text-base rounded-full bg-gradient-to-r from-cyan-500 via-violet-500 to-pink-500 text-white font-bold hover:scale-[1.02] active:scale-95 shadow-[0_0_40px_-10px_rgba(6,182,212,0.5)] hover:shadow-[0_0_40px_rgba(139,92,246,0.5)] transition-all duration-300 cursor-pointer"
                  >
                    Get Started Free <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
                <Link href="/login">
                  <Button 
                    variant="ghost" 
                    size="lg" 
                    className="h-14 px-8 text-base rounded-full hover:bg-white/5 border border-white/[0.06] text-[#F1F5F9] backdrop-blur-md hover:border-cyan-400/20 hover:shadow-[0_0_30px_rgba(6,182,212,0.1)] transition-all duration-300"
                  >
                    Sign In
                  </Button>
                </Link>
              </>
            )}
          </div>
        </motion.div>

        {/* 3D Interactive Tilt Mockup */}
        <motion.div
          initial={{ opacity: 0, y: 60, rotateX: 15 }}
          animate={{ opacity: 1, y: 0, rotateX: 0 }}
          transition={{ duration: 1.2, delay: 0.2, type: "spring", stiffness: 100, damping: 20 }}
          className="relative max-w-5xl mx-auto w-full mb-16 pt-8 perspective-[1200px]"
        >
          <motion.div
            ref={mockupRef}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            animate={{ rotateX: tilt.x, rotateY: tilt.y }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            style={{ transformStyle: "preserve-3d" }}
            className="w-full relative bg-[#0A0E1A]/80 border border-white/[0.08] rounded-3xl p-4 md:p-6 shadow-[0_0_50px_rgba(6,182,212,0.15)] overflow-hidden backdrop-blur-2xl text-left"
          >
            {/* Gloss Header Bar inside Mockup */}
            <div className="flex items-center justify-between border-b border-white/[0.06] pb-4 mb-4">
              <div className="flex items-center gap-3">
                <div className="flex gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-red-500/70" />
                  <span className="w-3 h-3 rounded-full bg-yellow-500/70" />
                  <span className="w-3 h-3 rounded-full bg-emerald-500/70" />
                </div>
                <div className="h-5 w-[1px] bg-white/[0.06]" />
                <span className="text-xs font-black tracking-wider text-white flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-cyan-400" />
                  SMARTSPEND // OS
                </span>
              </div>
              <div className="flex items-center gap-4">
                <div className="hidden sm:flex items-center gap-2 bg-white/[0.03] border border-white/[0.06] rounded-lg px-2.5 py-1 text-[10px] text-[#94A3B8]">
                  <Clock className="w-3 h-3 text-cyan-400 animate-pulse" />
                  Realtime Sync Connected
                </div>
                <div className="relative">
                  <Bell className="w-4 h-4 text-[#94A3B8] hover:text-white transition-colors cursor-pointer" />
                  <span className="absolute top-0 right-0 w-1.5 h-1.5 bg-pink-500 rounded-full animate-ping" />
                </div>
                <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-cyan-400 to-violet-500 p-[1px]">
                  <div className="w-full h-full bg-[#05070F] rounded-full flex items-center justify-center text-[10px] font-black">
                    JD
                  </div>
                </div>
              </div>
            </div>

            {/* Layout Grid inside mockup */}
            <div className="grid grid-cols-12 gap-5" style={{ transformStyle: "preserve-3d" }}>
              {/* Mini Sidebar inside mockup */}
              <div 
                style={{ transform: "translateZ(10px)" }}
                className="col-span-12 sm:col-span-3 lg:col-span-2 flex sm:flex-col gap-2.5"
              >
                <div className="w-full bg-white/[0.02] border border-white/[0.04] p-3 rounded-2xl flex sm:flex-col gap-1.5">
                  <div className="flex items-center gap-2 p-2 rounded-xl bg-gradient-to-r from-cyan-500/10 to-violet-500/10 border border-cyan-400/20 text-white text-xs font-semibold">
                    <LayoutDashboard className="w-3.5 h-3.5 text-cyan-400" />
                    <span className="hidden sm:inline">Dashboard</span>
                  </div>
                  <div className="flex items-center gap-2 p-2 rounded-xl text-[#94A3B8] hover:bg-white/[0.04] hover:text-white text-xs font-medium transition-all cursor-pointer">
                    <Wallet className="w-3.5 h-3.5 text-violet-400" />
                    <span className="hidden sm:inline">Wallets</span>
                  </div>
                  <div className="flex items-center gap-2 p-2 rounded-xl text-[#94A3B8] hover:bg-white/[0.04] hover:text-white text-xs font-medium transition-all cursor-pointer">
                    <PieChart className="w-3.5 h-3.5 text-pink-400" />
                    <span className="hidden sm:inline">Budgets</span>
                  </div>
                  <div className="flex items-center gap-2 p-2 rounded-xl text-[#94A3B8] hover:bg-white/[0.04] hover:text-white text-xs font-medium transition-all cursor-pointer">
                    <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="hidden sm:inline">Investments</span>
                  </div>
                </div>
              </div>

              {/* Main Content Pane inside mockup */}
              <div 
                style={{ transform: "translateZ(20px)", transformStyle: "preserve-3d" }}
                className="col-span-12 sm:col-span-9 lg:col-span-10 grid grid-cols-12 gap-4"
              >
                {/* Stats Widgets inside Mockup */}
                <div 
                  style={{ transform: "translateZ(30px)" }}
                  className="col-span-12 md:col-span-6 lg:col-span-4 bg-white/[0.02] border border-white/[0.06] rounded-2xl p-4 flex justify-between items-center relative overflow-hidden group hover:border-cyan-400/25 transition-all"
                >
                  <div>
                    <p className="text-[10px] text-[#94A3B8] font-semibold uppercase tracking-wider mb-1">Net Portfolio Value</p>
                    <h3 className="text-xl font-black text-white">$128,450.60</h3>
                    <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-emerald-400 mt-1 bg-emerald-400/5 px-2 py-0.5 rounded-full border border-emerald-400/10">
                      <TrendingUp className="w-2.5 h-2.5" /> +14.2%
                    </span>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-cyan-400/10 flex items-center justify-center border border-cyan-400/20 shadow-[0_0_20px_rgba(6,182,212,0.1)]">
                    <Wallet className="w-5 h-5 text-cyan-400" />
                  </div>
                </div>

                <div 
                  style={{ transform: "translateZ(30px)" }}
                  className="col-span-12 md:col-span-6 lg:col-span-4 bg-white/[0.02] border border-white/[0.06] rounded-2xl p-4 flex justify-between items-center relative overflow-hidden group hover:border-violet-400/25 transition-all"
                >
                  <div>
                    <p className="text-[10px] text-[#94A3B8] font-semibold uppercase tracking-wider mb-1">Monthly Optimization</p>
                    <h3 className="text-xl font-black text-white">$3,420.15</h3>
                    <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-violet-400 mt-1 bg-violet-400/5 px-2 py-0.5 rounded-full border border-violet-400/10">
                      <Sparkles className="w-2.5 h-2.5" /> 84% Saved
                    </span>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-violet-400/10 flex items-center justify-center border border-violet-400/20 shadow-[0_0_20px_rgba(139,92,246,0.1)]">
                    <Sparkles className="w-5 h-5 text-violet-400" />
                  </div>
                </div>

                <div 
                  style={{ transform: "translateZ(30px)" }}
                  className="col-span-12 md:col-span-12 lg:col-span-4 bg-white/[0.02] border border-white/[0.06] rounded-2xl p-4 flex justify-between items-center relative overflow-hidden group hover:border-pink-400/25 transition-all"
                >
                  <div>
                    <p className="text-[10px] text-[#94A3B8] font-semibold uppercase tracking-wider mb-1">Smart Budgets Tracked</p>
                    <h3 className="text-xl font-black text-white">12 / 15</h3>
                    <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-pink-400 mt-1 bg-pink-400/5 px-2 py-0.5 rounded-full border border-pink-400/10">
                      <ShieldCheck className="w-2.5 h-2.5" /> 3 Alerts Pending
                    </span>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-pink-400/10 flex items-center justify-center border border-pink-400/20 shadow-[0_0_20px_rgba(236,72,153,0.1)]">
                    <PieChart className="w-5 h-5 text-pink-400" />
                  </div>
                </div>

                {/* SVG Visual Graph inside Mockup */}
                <div 
                  style={{ transform: "translateZ(25px)" }}
                  className="col-span-12 lg:col-span-8 bg-white/[0.02] border border-white/[0.06] rounded-2xl p-5"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h4 className="text-xs font-black tracking-wider uppercase text-white">Active Spending Analytics</h4>
                      <p className="text-[9px] text-[#94A3B8]">Auto-updating trends across standard bank pipelines.</p>
                    </div>
                    <div className="flex items-center gap-1.5 text-[10px]">
                      <span className="inline-block w-2.5 h-2.5 rounded-full bg-cyan-400" />
                      <span className="text-[#94A3B8] font-medium mr-3">Automated Sync</span>
                      <span className="inline-block w-2.5 h-2.5 rounded-full bg-pink-500" />
                      <span className="text-[#94A3B8] font-medium">Smart Budgets</span>
                    </div>
                  </div>

                  {/* SVG Bezier Line Chart */}
                  <div className="relative w-full h-36 bg-white/[0.01] border border-white/[0.02] rounded-xl p-2">
                    <svg viewBox="0 0 500 150" className="w-full h-full" preserveAspectRatio="none">
                      <defs>
                        <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
                          <stop offset="0%" stopColor="#06B6D4" />
                          <stop offset="50%" stopColor="#8B5CF6" />
                          <stop offset="100%" stopColor="#EC4899" />
                        </linearGradient>
                        <linearGradient id="fillGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.25" />
                          <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0.0" />
                        </linearGradient>
                      </defs>
                      {/* Area Fill */}
                      <path 
                        d="M 0 130 C 50 110, 80 120, 140 70 C 200 20, 240 80, 310 40 C 370 0, 420 90, 500 25 L 500 150 L 0 150 Z" 
                        fill="url(#fillGrad)" 
                      />
                      {/* Grid Lines */}
                      <line x1="0" y1="37" x2="500" y2="37" stroke="rgba(255,255,255,0.03)" strokeWidth="1" strokeDasharray="4" />
                      <line x1="0" y1="75" x2="500" y2="75" stroke="rgba(255,255,255,0.03)" strokeWidth="1" strokeDasharray="4" />
                      <line x1="0" y1="112" x2="500" y2="112" stroke="rgba(255,255,255,0.03)" strokeWidth="1" strokeDasharray="4" />
                      
                      {/* Bezier Path */}
                      <path 
                        d="M 0 130 C 50 110, 80 120, 140 70 C 200 20, 240 80, 310 40 C 370 0, 420 90, 500 25" 
                        fill="none" 
                        stroke="url(#lineGrad)" 
                        strokeWidth="3.5" 
                        strokeLinecap="round" 
                      />
                      {/* Glowing Points */}
                      <circle cx="140" cy="70" r="5.5" fill="#06B6D4" stroke="#05070F" strokeWidth="1.5" className="animate-pulse shadow-2xl" />
                      <circle cx="310" cy="40" r="5.5" fill="#8B5CF6" stroke="#05070F" strokeWidth="1.5" className="animate-pulse shadow-2xl" />
                      <circle cx="500" cy="25" r="5.5" fill="#EC4899" stroke="#05070F" strokeWidth="1.5" className="animate-pulse shadow-2xl" />
                    </svg>
                  </div>
                </div>

                {/* Right Categories panel */}
                <div 
                  style={{ transform: "translateZ(25px)" }}
                  className="col-span-12 lg:col-span-4 bg-white/[0.02] border border-white/[0.06] rounded-2xl p-5"
                >
                  <h4 className="text-xs font-black tracking-wider uppercase text-white mb-4">Category Budgets</h4>
                  <div className="flex flex-col gap-3">
                    <div>
                      <div className="flex justify-between text-[10px] text-[#94A3B8] font-bold mb-1.5">
                        <span>Housing & Utilities</span>
                        <span className="text-white">60% ($1,200)</span>
                      </div>
                      <div className="w-full h-2 bg-white/[0.04] rounded-full overflow-hidden border border-white/[0.04]">
                        <div className="h-full bg-[#06B6D4] rounded-full w-[60%]" />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-[10px] text-[#94A3B8] font-bold mb-1.5">
                        <span>Food & Dining</span>
                        <span className="text-pink-500 font-extrabold flex items-center gap-1">85% ($850) <AlertTriangle className="w-3 h-3 text-pink-500" /></span>
                      </div>
                      <div className="w-full h-2 bg-white/[0.04] rounded-full overflow-hidden border border-white/[0.04]">
                        <div className="h-full bg-pink-500 rounded-full w-[85%]" />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-[10px] text-[#94A3B8] font-bold mb-1.5">
                        <span>Tech & Equipment</span>
                        <span className="text-white">35% ($350)</span>
                      </div>
                      <div className="w-full h-2 bg-white/[0.04] rounded-full overflow-hidden border border-white/[0.04]">
                        <div className="h-full bg-[#8B5CF6] rounded-full w-[35%]" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Widgets with high 3D Parallax offset floating */}
            <div 
              style={{ transform: "translateZ(50px)", transformStyle: "preserve-3d" }}
              className="absolute -top-4 -right-4 md:-right-8 bg-[#111827]/90 border border-white/[0.08] backdrop-blur-2xl p-3.5 rounded-2xl shadow-2xl z-20 pointer-events-none hidden sm:flex items-center gap-3 animate-float border-cyan-400/20"
            >
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                <TrendingUp className="w-4 h-4 text-emerald-400 animate-pulse" />
              </div>
              <div>
                <p className="text-[9px] text-[#94A3B8] font-bold tracking-wide uppercase">AI Wealth Yield</p>
                <p className="text-xs font-black text-white">+$1,450.00 Saved</p>
              </div>
            </div>

            <div 
              style={{ transform: "translateZ(40px)", transformStyle: "preserve-3d" }}
              className="absolute -bottom-6 -left-6 md:-left-10 bg-[#111827]/90 border border-white/[0.08] backdrop-blur-2xl p-3.5 rounded-2xl shadow-2xl z-20 pointer-events-none hidden sm:flex items-center gap-3 animate-float-delayed border-pink-500/20"
            >
              <div className="w-8 h-8 rounded-lg bg-pink-500/10 flex items-center justify-center border border-pink-500/20">
                <AlertTriangle className="w-4 h-4 text-pink-500 animate-bounce" />
              </div>
              <div>
                <p className="text-[9px] text-[#94A3B8] font-bold tracking-wide uppercase">Budget Threat</p>
                <p className="text-xs font-black text-white">Coffee Cap Exceeded</p>
              </div>
            </div>

          </motion.div>
        </motion.div>
      </section>

      {/* 2. Bento Grid Section */}
      <section className="container mx-auto px-4 py-24 relative z-10">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="bg-gradient-to-r from-cyan-400 via-violet-400 to-pink-500 bg-clip-text text-transparent font-black uppercase text-xs tracking-widest">
            Future-Proof Features
          </span>
          <h2 className="text-4xl md:text-5xl font-black tracking-tight mt-2 text-white mb-4">
            Autonomous wealth management.
          </h2>
          <p className="text-[#94A3B8] text-base md:text-lg font-light leading-relaxed">
            Discover a standard set of premium finance systems constructed to deliver high fidelity optimization.
          </p>
        </div>

        {/* Asymmetric Bento Grid - 6 glass-frosted cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {/* Card 1 - AI Savings assistant (col-span-2) */}
          <motion.div
            whileHover={{ y: -6, scale: 1.015 }}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            className="md:col-span-2 bg-[#111827]/60 backdrop-blur-xl border border-white/[0.06] rounded-3xl p-8 hover:border-cyan-400/20 hover:shadow-[0_0_30px_rgba(6,182,212,0.1)] transition-all duration-500 relative overflow-hidden group flex flex-col justify-between"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-transparent to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
            
            <div className="relative z-10">
              <div className="p-3 rounded-2xl w-12 h-12 flex items-center justify-center bg-white/[0.04] border border-white/[0.06] mb-6 group-hover:scale-110 transition-transform duration-300">
                <Sparkles className="w-6 h-6 text-cyan-400" />
              </div>
              <h3 className="text-2xl font-bold mb-3 tracking-tight text-white flex items-center gap-2">
                Predictive AI Insights
                <span className="text-[10px] bg-cyan-400/10 border border-cyan-400/20 text-cyan-400 rounded-full px-2 py-0.5 font-bold uppercase tracking-wider">Neural</span>
              </h3>
              <p className="text-[#94A3B8] leading-relaxed text-sm md:text-base font-light max-w-md">
                Our custom financial model scans bank transactions to predict cycles, adjust limits, and alert you before you exceed budgets.
              </p>
            </div>

            {/* Interactive Mock visual inside bento card */}
            <div className="mt-8 border border-white/[0.06] rounded-2xl bg-[#0A0E1A]/60 p-4 relative overflow-hidden z-10">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                <span className="text-[10px] font-black uppercase text-white tracking-wider">SmartSpend Assistant</span>
              </div>
              <p className="text-xs text-[#94A3B8] leading-relaxed mb-3">
                "Hi! You've spent $35 more on dining out this week. Tap to automatically reallocate $40 from savings to cover this."
              </p>
              <div className="flex gap-2">
                <button className="text-[10px] font-bold bg-gradient-to-r from-cyan-500 to-violet-500 hover:opacity-90 transition-all text-white rounded-lg px-3 py-1.5 cursor-pointer">
                  Auto Reallocate
                </button>
                <button className="text-[10px] font-bold bg-white/[0.04] hover:bg-white/[0.08] transition-all text-[#94A3B8] rounded-lg px-3 py-1.5 border border-white/[0.06]">
                  Dismiss
                </button>
              </div>
            </div>
          </motion.div>

          {/* Card 2 - Instant Bank Sync (col-span-1) */}
          <motion.div
            whileHover={{ y: -6, scale: 1.015 }}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            className="bg-[#111827]/60 backdrop-blur-xl border border-white/[0.06] rounded-3xl p-8 hover:border-violet-400/20 hover:shadow-[0_0_30px_rgba(139,92,246,0.1)] transition-all duration-500 relative overflow-hidden group flex flex-col justify-between"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-transparent to-violet-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

            <div className="relative z-10">
              <div className="p-3 rounded-2xl w-12 h-12 flex items-center justify-center bg-white/[0.04] border border-white/[0.06] mb-6 group-hover:scale-110 transition-transform duration-300">
                <RefreshCw className="w-6 h-6 text-violet-400" />
              </div>
              <h3 className="text-xl font-bold mb-3 tracking-tight text-white">Global Bank Sync</h3>
              <p className="text-[#94A3B8] leading-relaxed text-sm font-light">
                Secure API pipelines map 10,000+ banks globally inside a single unified dashboard pipeline.
              </p>
            </div>

            {/* Orbiting Animation Visual inside card */}
            <div className="relative w-full h-24 mt-8 flex items-center justify-center overflow-hidden z-10">
              <div className="w-10 h-10 bg-violet-500/10 border border-violet-400/20 rounded-xl flex items-center justify-center shadow-lg">
                <Wallet className="w-5 h-5 text-violet-400" />
              </div>
              {/* Outer orbit rings */}
              <div className="absolute border border-white/[0.04] rounded-full w-20 h-20 animate-spin-slow" />
              <div className="absolute w-2.5 h-2.5 bg-cyan-400 rounded-full top-2 left-6 animate-pulse" />
              <div className="absolute w-2.5 h-2.5 bg-pink-500 rounded-full bottom-2 right-6 animate-pulse" />
            </div>
          </motion.div>

          {/* Card 3 - Analytics (col-span-1) */}
          <motion.div
            whileHover={{ y: -6, scale: 1.015 }}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            className="bg-[#111827]/60 backdrop-blur-xl border border-white/[0.06] rounded-3xl p-8 hover:border-pink-500/20 hover:shadow-[0_0_30px_rgba(236,72,153,0.1)] transition-all duration-500 relative overflow-hidden group flex flex-col justify-between"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-transparent to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

            <div className="relative z-10">
              <div className="p-3 rounded-2xl w-12 h-12 flex items-center justify-center bg-white/[0.04] border border-white/[0.06] mb-6 group-hover:scale-110 transition-transform duration-300">
                <PieChart className="w-6 h-6 text-pink-400" />
              </div>
              <h3 className="text-xl font-bold mb-3 tracking-tight text-white">Visual Trend Heatmaps</h3>
              <p className="text-[#94A3B8] leading-relaxed text-sm font-light">
                Beautiful high resolution charts that actually make sense. Drill down into monthly habits in milliseconds.
              </p>
            </div>

            {/* Custom SVG bars visual */}
            <div className="mt-8 flex items-end gap-2 h-16 w-full justify-center z-10">
              <div className="w-3 bg-white/[0.04] border border-white/[0.06] rounded-t h-8 group-hover:h-12 transition-all duration-500" />
              <div className="w-3 bg-[#06B6D4]/30 border border-[#06B6D4]/30 rounded-t h-12 group-hover:h-16 transition-all duration-500" />
              <div className="w-3 bg-[#8B5CF6]/30 border border-[#8B5CF6]/30 rounded-t h-10 group-hover:h-14 transition-all duration-500" />
              <div className="w-3 bg-white/[0.04] border border-white/[0.06] rounded-t h-6 group-hover:h-10 transition-all duration-500" />
              <div className="w-3 bg-[#EC4899]/30 border border-[#EC4899]/30 rounded-t h-14 group-hover:h-12 transition-all duration-500" />
            </div>
          </motion.div>

          {/* Card 4 - Auto budgeting (col-span-1) */}
          <motion.div
            whileHover={{ y: -6, scale: 1.015 }}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            className="bg-[#111827]/60 backdrop-blur-xl border border-white/[0.06] rounded-3xl p-8 hover:border-cyan-400/20 hover:shadow-[0_0_30px_rgba(6,182,212,0.1)] transition-all duration-500 relative overflow-hidden group flex flex-col justify-between"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-transparent to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

            <div className="relative z-10">
              <div className="p-3 rounded-2xl w-12 h-12 flex items-center justify-center bg-white/[0.04] border border-white/[0.06] mb-6 group-hover:scale-110 transition-transform duration-300">
                <Calendar className="w-6 h-6 text-cyan-400" />
              </div>
              <h3 className="text-xl font-bold mb-3 tracking-tight text-white">Recurring Guard</h3>
              <p className="text-[#94A3B8] leading-relaxed text-sm font-light">
                Automated scanning flags hidden subscriptions, pricing updates, and unexpected trial transitions before billing.
              </p>
            </div>

            {/* Calendar Mock design inside card */}
            <div className="mt-8 bg-white/[0.02] border border-white/[0.06] rounded-2xl p-3.5 flex justify-between items-center z-10">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-pink-500/10 border border-pink-500/20 flex items-center justify-center text-[10px] font-black text-pink-500 uppercase tracking-widest">
                  Netflix
                </div>
                <div>
                  <p className="text-[10px] text-white font-bold leading-none">Standard subscription</p>
                  <p className="text-[8px] text-[#94A3B8] mt-1">Trial expiring in 2 days</p>
                </div>
              </div>
              <span className="text-[9px] bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 rounded-full px-2 py-0.5 font-bold uppercase tracking-wider animate-pulse">Alert</span>
            </div>
          </motion.div>

          {/* Card 5 - Currency (col-span-1) */}
          <motion.div
            whileHover={{ y: -6, scale: 1.015 }}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            className="bg-[#111827]/60 backdrop-blur-xl border border-white/[0.06] rounded-3xl p-8 hover:border-violet-400/20 hover:shadow-[0_0_30px_rgba(139,92,246,0.1)] transition-all duration-500 relative overflow-hidden group flex flex-col justify-between"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-transparent to-violet-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

            <div className="relative z-10">
              <div className="p-3 rounded-2xl w-12 h-12 flex items-center justify-center bg-white/[0.04] border border-white/[0.06] mb-6 group-hover:scale-110 transition-transform duration-300">
                <Globe className="w-6 h-6 text-violet-400" />
              </div>
              <h3 className="text-xl font-bold mb-3 tracking-tight text-white">Global Asset Hub</h3>
              <p className="text-[#94A3B8] leading-relaxed text-sm font-light">
                Cross-border currency, equities, and digital assets track natively. Sync instantly at global live exchange rate indices.
              </p>
            </div>

            {/* Flags/Asset coins mock inside card */}
            <div className="mt-8 flex gap-2 justify-center z-10">
              <div className="w-8 h-8 rounded-full bg-white/[0.03] border border-white/[0.06] flex items-center justify-center font-bold text-xs">🇺🇸</div>
              <div className="w-8 h-8 rounded-full bg-white/[0.03] border border-white/[0.06] flex items-center justify-center font-bold text-xs">🇪🇺</div>
              <div className="w-8 h-8 rounded-full bg-white/[0.03] border border-white/[0.06] flex items-center justify-center font-bold text-xs">🇯🇵</div>
              <div className="w-8 h-8 rounded-full bg-white/[0.03] border border-white/[0.06] flex items-center justify-center font-bold text-xs">🇬🇧</div>
            </div>
          </motion.div>

          {/* Card 6 - Security (col-span-2) */}
          <motion.div
            whileHover={{ y: -6, scale: 1.015 }}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            className="md:col-span-2 bg-[#111827]/60 backdrop-blur-xl border border-white/[0.06] rounded-3xl p-8 hover:border-pink-500/20 hover:shadow-[0_0_30px_rgba(236,72,153,0.1)] transition-all duration-500 relative overflow-hidden group flex flex-col justify-between"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-transparent to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

            <div className="relative z-10">
              <div className="p-3 rounded-2xl w-12 h-12 flex items-center justify-center bg-white/[0.04] border border-white/[0.06] mb-6 group-hover:scale-110 transition-transform duration-300">
                <Lock className="w-6 h-6 text-pink-400" />
              </div>
              <h3 className="text-2xl font-bold mb-3 tracking-tight text-white flex items-center gap-2">
                Bank-Grade End-To-End Security
                <span className="text-[10px] bg-pink-400/10 border border-pink-400/25 text-pink-400 rounded-full px-2 py-0.5 font-bold uppercase tracking-wider">AES-256</span>
              </h3>
              <p className="text-[#94A3B8] leading-relaxed text-sm md:text-base font-light max-w-md">
                Zero-knowledge architecture. All sensitive financial logins and transaction keys are encrypted locally at the database core.
              </p>
            </div>

            {/* Fingerprint scan UI element inside card */}
            <div className="mt-8 border border-white/[0.06] rounded-2xl bg-[#0A0E1A]/60 p-4 flex items-center justify-between z-10">
              <div className="flex items-center gap-3">
                <div className="relative w-8 h-8 rounded-full bg-pink-500/10 border border-pink-500/20 flex items-center justify-center shadow-md animate-pulse">
                  <ShieldCheck className="w-4.5 h-4.5 text-pink-500" />
                </div>
                <div>
                  <p className="text-xs text-white font-extrabold uppercase tracking-wide">Encrypted Tunnel Active</p>
                  <p className="text-[9px] text-[#94A3B8]">Connected with 256-bit Secure Socket Layer validation.</p>
                </div>
              </div>
              <span className="text-[10px] text-emerald-400 font-extrabold uppercase tracking-wide border border-emerald-400/20 bg-emerald-400/5 px-2 py-0.5 rounded-full">Secure</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 3. Social Proof & Interactive Counters Section */}
      <section className="container mx-auto px-4 py-20 relative z-10 bg-gradient-to-b from-transparent via-[#0A0E1A]/30 to-transparent">
        <div className="max-w-5xl mx-auto border-y border-white/[0.06] py-16 px-4 md:px-12 bg-white/[0.01] backdrop-blur-2xl rounded-3xl relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(6,182,212,0.03)_0%,transparent_70%)] pointer-events-none" />

          {/* Grid layout for Counters */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-4 text-center relative z-10">
            <div>
              <p className="text-3xl md:text-5xl font-black bg-gradient-to-r from-cyan-400 via-violet-400 to-pink-500 bg-clip-text text-transparent">
                <Counter value={98400} suffix="+" />
              </p>
              <p className="text-xs md:text-sm text-[#94A3B8] font-bold uppercase tracking-wider mt-3">Active Builders</p>
            </div>
            
            <div>
              <p className="text-3xl md:text-5xl font-black bg-gradient-to-r from-cyan-400 via-violet-400 to-pink-500 bg-clip-text text-transparent">
                <Counter value={142} prefix="$" suffix="M+" />
              </p>
              <p className="text-xs md:text-sm text-[#94A3B8] font-bold uppercase tracking-wider mt-3">Expenses Optimized</p>
            </div>

            <div>
              <p className="text-3xl md:text-5xl font-black bg-gradient-to-r from-cyan-400 via-violet-400 to-pink-500 bg-clip-text text-transparent">
                <Counter value={24} suffix=".5%" decimals={1} />
              </p>
              <p className="text-xs md:text-sm text-[#94A3B8] font-bold uppercase tracking-wider mt-3">Avg Savings Rate</p>
            </div>

            <div>
              <p className="text-3xl md:text-5xl font-black bg-gradient-to-r from-cyan-400 via-violet-400 to-pink-500 bg-clip-text text-transparent">
                <Counter value={99} suffix=".99%" decimals={2} />
              </p>
              <p className="text-xs md:text-sm text-[#94A3B8] font-bold uppercase tracking-wider mt-3">Server Uptime SLA</p>
            </div>
          </div>

          {/* Professional Testimonials */}
          <div className="mt-20 border-t border-white/[0.06] pt-16">
            <h3 className="text-center text-xs font-black uppercase text-white tracking-widest mb-10">Trusted By Top Creators</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {testimonials.map((t, idx) => (
                <div 
                  key={idx} 
                  className="bg-[#111827]/40 border border-white/[0.06] rounded-2xl p-6 backdrop-blur-md relative flex flex-col justify-between hover:border-cyan-400/20 hover:shadow-[0_0_20px_rgba(6,182,212,0.05)] transition-all duration-300"
                >
                  <div>
                    <div className="flex gap-1.5 mb-4">
                      {[...Array(t.rating)].map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                    <p className="text-xs text-[#94A3B8] leading-relaxed italic mb-6">
                      "{t.quote}"
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-cyan-400 to-violet-500 p-[1px] flex items-center justify-center font-black text-[10px] text-white">
                      <div className="w-full h-full bg-[#0A0E1A] rounded-full flex items-center justify-center">
                        {t.avatar}
                      </div>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white">{t.author}</p>
                      <p className="text-[9px] text-[#94A3B8] font-semibold uppercase">{t.role}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 4. Tiered Pricing Cards Section */}
      <section className="container mx-auto px-4 py-24 relative z-10">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="bg-gradient-to-r from-cyan-400 via-violet-400 to-pink-500 bg-clip-text text-transparent font-black uppercase text-xs tracking-widest">
            Investment Tiers
          </span>
          <h2 className="text-4xl md:text-5xl font-black tracking-tight mt-2 text-white mb-4">
            Transparent Pricing Plans
          </h2>
          <p className="text-[#94A3B8] text-base md:text-lg font-light leading-relaxed">
            Upgrade anytime to unlock automated AI assistance and unlimited bank synchronizations.
          </p>

          {/* Billing Switcher Toggle */}
          <div className="inline-flex items-center gap-3.5 mt-8 bg-white/[0.02] border border-white/[0.06] rounded-full p-1.5">
            <button
              onClick={() => setIsYearly(false)}
              className={`px-5 py-2 text-xs font-bold rounded-full transition-all cursor-pointer ${
                !isYearly
                  ? "bg-gradient-to-r from-cyan-500 to-violet-500 text-white shadow-md"
                  : "text-[#94A3B8] hover:text-white"
              }`}
            >
              Monthly Billing
            </button>
            <button
              onClick={() => setIsYearly(true)}
              className={`px-5 py-2 text-xs font-bold rounded-full transition-all cursor-pointer flex items-center gap-1.5 ${
                isYearly
                  ? "bg-gradient-to-r from-cyan-500 to-violet-500 text-white shadow-md"
                  : "text-[#94A3B8] hover:text-white"
              }`}
            >
              Yearly Billing
              <span className="text-[9px] bg-cyan-400/20 text-cyan-400 border border-cyan-400/30 rounded-full px-1.5 py-0.5 font-black uppercase">
                Save 20%
              </span>
            </button>
          </div>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto items-stretch">
          {pricingPlans.map((plan, index) => {
            const isPro = plan.popular;
            
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="flex flex-col"
              >
                {/* Standard or Premium Glass card */}
                <div
                  className={`h-full flex flex-col justify-between rounded-3xl p-8 backdrop-blur-xl relative transition-all duration-300 border overflow-hidden ${
                    isPro
                      ? "bg-[#111827]/85 border-transparent shadow-[0_0_40px_rgba(6,182,212,0.15)] before:absolute before:inset-0 before:rounded-3xl before:p-[1px] before:bg-gradient-to-r before:from-cyan-500 before:via-violet-500 before:to-pink-500 before:-z-10"
                      : "bg-[#111827]/60 border-white/[0.06] hover:border-white/[0.12]"
                  }`}
                >
                  {/* Subtle Aurora spotlight for Pro */}
                  {isPro && (
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-cyan-400/20 to-violet-500/20 rounded-full blur-2xl pointer-events-none" />
                  )}

                  {/* Top content */}
                  <div>
                    {isPro && (
                      <div className="inline-block bg-gradient-to-r from-cyan-500 to-violet-500 text-[10px] text-white font-black uppercase tracking-wider px-3 py-1 rounded-full mb-6 shadow-md shadow-violet-500/20">
                        Recommended Plan
                      </div>
                    )}
                    <h3 className="text-2xl font-black tracking-tight text-white mb-2">{plan.name}</h3>
                    <p className="text-xs text-[#94A3B8] leading-relaxed mb-6 font-light">{plan.description}</p>
                    
                    {/* Price tier */}
                    <div className="flex items-baseline gap-1 mb-8">
                      <span className="text-4xl md:text-5xl font-black text-white tracking-tight">
                        {plan.price === 0 ? "Free" : `$${plan.price.toFixed(2)}`}
                      </span>
                      {plan.price > 0 && (
                        <span className="text-xs text-[#94A3B8] font-bold uppercase tracking-wider">{plan.period}</span>
                      )}
                    </div>

                    {/* Feature list */}
                    <div className="border-t border-white/[0.06] pt-6 mb-8">
                      <ul className="flex flex-col gap-3.5">
                        {plan.features.map((feature, idx) => (
                          <li key={idx} className="flex items-start gap-2.5 text-xs text-[#94A3B8]">
                            <Check className={`w-4 h-4 mt-0.5 shrink-0 ${isPro ? "text-cyan-400" : "text-[#F1F5F9]"}`} />
                            <span className="leading-relaxed font-light">{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Action CTA Button */}
                  <div className="mt-auto pt-6">
                    <Link href={plan.link}>
                      <button
                        className={`w-full py-3 px-5 text-xs font-bold rounded-xl active:scale-95 transition-all duration-200 cursor-pointer text-center ${
                          isPro
                            ? "bg-gradient-to-r from-cyan-500 via-violet-500 to-pink-500 text-white font-black shadow-[0_0_35px_rgba(6,182,212,0.3)] hover:opacity-90 hover:scale-[1.02]"
                            : "bg-[#1A2035] hover:bg-white/[0.04] text-[#F1F5F9] border border-white/[0.06] hover:border-white/[0.12]"
                        }`}
                      >
                        {plan.cta}
                      </button>
                    </Link>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* 5. Bottom CTA & Footer */}
      <section className="container mx-auto px-4 py-28 text-center relative z-10">
        <div className="max-w-4xl mx-auto bg-gradient-to-b from-[#111827]/80 to-[#111827]/30 border border-white/[0.06] rounded-3xl p-12 md:p-20 relative overflow-hidden backdrop-blur-2xl">
          {/* Neon Spotlight inside bottom CTA */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,rgba(6,182,212,0.06)_0%,transparent_60%)] pointer-events-none" />

          <Sparkles className="w-10 h-10 text-cyan-400 mx-auto mb-6 animate-pulse" />
          <h2 className="text-4xl md:text-6xl font-black tracking-tight text-white mb-6">
            Optimize your assets<br />autonomously today.
          </h2>
          <p className="text-[#94A3B8] text-base md:text-lg max-w-xl mx-auto mb-10 font-light leading-relaxed">
            Join thousands of modern wealth builders tracking investments, saving on subscriptions, and mastering their finance pipeline.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/register">
              <Button 
                size="lg" 
                className="h-14 px-8 text-base rounded-full bg-gradient-to-r from-cyan-500 via-violet-500 to-pink-500 text-white font-bold hover:scale-[1.02] active:scale-95 shadow-[0_0_40px_rgba(6,182,212,0.4)] transition-all cursor-pointer"
              >
                Create Free Account <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </div>
        </div>

        {/* Minimal Footer */}
        <footer className="mt-28 border-t border-white/[0.06] pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] text-[#94A3B8] font-semibold tracking-wider">
          <p>© {new Date().getFullYear()} SMARTSPEND GLOBAL INC. ALL ENCRYPTED DATA PROTECTED.</p>
          <div className="flex gap-6 uppercase">
            <span className="hover:text-white transition-colors cursor-pointer">Security Protocol</span>
            <span className="hover:text-white transition-colors cursor-pointer">Terms of Service</span>
            <span className="hover:text-white transition-colors cursor-pointer">Privacy Standard</span>
          </div>
        </footer>
      </section>

    </div>
  );
}
