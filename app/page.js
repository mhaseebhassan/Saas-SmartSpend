"use client";

import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, Wallet, PieChart, ShieldCheck, LayoutDashboard } from "lucide-react";
import { Card, CardContent } from "@/components/ui/Card";
import { useSession } from "next-auth/react";

export default function Home() {
  const { data: session } = useSession();
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 500], [0, 200]);
  const y2 = useTransform(scrollY, [0, 500], [0, -150]);

  return (
    <div className="relative overflow-hidden min-h-screen bg-background">
      {/* Dynamic Background */}
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 pointer-events-none mix-blend-overlay"></div>

      {/* Aurora Blurs */}
      <motion.div
        style={{ y: y1, x: -100 }}
        className="absolute top-0 left-1/4 w-[800px] h-[800px] bg-primary/20 rounded-full blur-[120px] -z-10 mix-blend-screen"
      />
      <motion.div
        style={{ y: y2, x: 100 }}
        className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-purple-500/10 rounded-full blur-[100px] -z-10 mix-blend-screen"
      />

      <section className="container mx-auto px-4 pt-32 pb-40 text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, filter: "blur(10px)" }}
          animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 backdrop-blur-md px-4 py-1.5 text-sm font-medium text-muted-foreground mb-8 shadow-lg shadow-black/5 hover:border-white/20 transition-colors cursor-default">
            <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="bg-gradient-to-r from-emerald-400 to-cyan-500 bg-clip-text text-transparent font-bold">New</span>
            SmartSpend v2.0 is live
          </div>

          <h1 className="text-6xl md:text-8xl font-bold tracking-tighter mb-8 bg-gradient-to-b from-foreground via-foreground/90 to-foreground/50 bg-clip-text text-transparent drop-shadow-sm">
            Master your money.
          </h1>

          <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto mb-12 leading-relaxed font-light">
            The intelligent dashboard for modern finance tracking.
            <br className="hidden md:block" />
            Control expenses, set budgets, and grow your wealth.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            {session ? (
              <Link href="/dashboard">
                <Button size="lg" className="h-14 px-8 text-lg rounded-full shadow-[0_0_40px_-10px_rgba(124,58,237,0.5)] hover:shadow-[0_0_60px_-15px_rgba(124,58,237,0.6)] transition-shadow duration-500">
                  Go to Dashboard <LayoutDashboard className="ml-2 w-5 h-5" />
                </Button>
              </Link>
            ) : (
              <>
                <Link href="/register">
                  <Button size="lg" className="h-14 px-8 text-lg rounded-full bg-white text-black hover:bg-white/90 shadow-[0_0_40px_-10px_rgba(255,255,255,0.3)] hover:scale-105 transition-all duration-300">
                    Get Started Free <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
                <Link href="/login">
                  <Button variant="ghost" size="lg" className="h-14 px-8 text-lg rounded-full hover:bg-white/5 border border-transparent hover:border-white/10">
                    Sign In
                  </Button>
                </Link>
              </>
            )}
          </div>
        </motion.div>

        {/* Floating UI Mockup/Grid */}
        <motion.div
          initial={{ opacity: 0, y: 100, rotateX: 20 }}
          animate={{ opacity: 1, y: 0, rotateX: 0 }}
          transition={{ duration: 1, delay: 0.3, type: "spring" }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-32 text-left perspective-1000"
        >
          <FeatureCard
            delay={0.4}
            icon={<Wallet className="w-6 h-6 text-white" />}
            color="bg-blue-500"
            title="Track Expenses"
            description="Log every transaction instantly. AI categorization coming soon."
          />
          <FeatureCard
            delay={0.5}
            icon={<ShieldCheck className="w-6 h-6 text-white" />}
            color="bg-purple-500"
            title="Smart Budgets"
            description="Set strict limits. We'll alert you before you break the bank."
          />
          <FeatureCard
            delay={0.6}
            icon={<PieChart className="w-6 h-6 text-white" />}
            color="bg-emerald-500"
            title="Visual Analytics"
            description="Beautiful charts that actually make sense. See your money grow."
          />
        </motion.div>
      </section>
    </div>
  );
}

function FeatureCard({ icon, title, description, color, delay }) {
  return (
    <motion.div
      whileHover={{ y: -10, scale: 1.02 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: delay, duration: 0.5 }}
      className="group"
    >
      <Card className="h-full border-white/5 bg-white/5 backdrop-blur-2xl hover:bg-white/10 hover:border-white/10 transition-all duration-500 shadow-2xl overflow-hidden relative">
        <div className={`absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-500 bg-gradient-to-br from-transparent to-${color.replace('bg-', '')}/30`} />
        <CardContent className="pt-8 relative z-10">
          <div className={`mb-6 ${color} w-12 h-12 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-500`}>
            {icon}
          </div>
          <h3 className="text-xl font-bold mb-3 tracking-tight">{title}</h3>
          <p className="text-muted-foreground leading-relaxed text-sm">
            {description}
          </p>
        </CardContent>
      </Card>
    </motion.div>
  )
}
