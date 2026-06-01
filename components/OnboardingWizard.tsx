"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { Sparkles, DollarSign, Tag, ArrowRight, ArrowLeft, Check, CheckCircle2 } from "lucide-react";
import { useToast } from "@/lib/toast-context";
import { cn } from "@/lib/utils";

const PRESET_CATEGORIES = [
    { name: "Food 🍔", color: "#10B981", defaultLimit: 400 },
    { name: "Housing 🏠", color: "#6366F1", defaultLimit: 1200 },
    { name: "Entertainment 🎬", color: "#F59E0B", defaultLimit: 200 },
    { name: "Transport 🚗", color: "#EF4444", defaultLimit: 300 },
];

const Confetti = () => {
    const particles = Array.from({ length: 80 });
    return (
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-50">
            {particles.map((_, i) => {
                const angle = Math.random() * 360;
                const distance = 100 + Math.random() * 250;
                const x = Math.cos((angle * Math.PI) / 180) * distance;
                const y = Math.sin((angle * Math.PI) / 180) * distance - 100;
                const delay = Math.random() * 0.4;
                const color = ["#06B6D4", "#8B5CF6", "#EC4899", "#10B981", "#F59E0B"][i % 5];

                return (
                    <motion.div
                        key={i}
                        initial={{ x: 0, y: 150, opacity: 1, scale: 0.5, rotate: 0 }}
                        animate={{
                            x: x,
                            y: y + 300,
                            opacity: 0,
                            scale: Math.random() * 1.2 + 0.4,
                            rotate: Math.random() * 720,
                        }}
                        transition={{
                            duration: 1.8 + Math.random() * 1.5,
                            ease: "easeOut",
                            delay: delay,
                        }}
                        className="absolute left-1/2 bottom-0 w-3 h-3 rounded-sm"
                        style={{ backgroundColor: color }}
                    />
                );
            })}
        </div>
    );
};

export default function OnboardingWizard({ onComplete }) {
    const { success, error } = useToast();
    const [step, setStep] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [successCelebration, setSuccessCelebration] = useState(false);

    // Step 1: Currency & Settings
    const [currency, setCurrency] = useState("USD");

    // Step 2: First Category
    const [categoryName, setCategoryName] = useState("");
    const [categoryColor, setCategoryColor] = useState("#6366F1");
    const [categoryLimit, setCategoryLimit] = useState("");
    const [createdCategoryId, setCreatedCategoryId] = useState("");

    // Step 3: First Expense
    const [expenseDesc, setExpenseDesc] = useState("");
    const [expenseAmount, setExpenseAmount] = useState("");

    const selectPreset = (preset) => {
        setCategoryName(preset.name);
        setCategoryColor(preset.color);
        setCategoryLimit(preset.defaultLimit.toString());
    };

    const handleStep1 = async () => {
        setIsLoading(true);
        try {
            // Update currency preference
            const res = await fetch("/api/user/preferences", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ currency }),
            });
            if (res.ok) {
                setStep(2);
            } else {
                error("Failed to save currency preferences.");
            }
        } catch (err) {
            console.error(err);
            error("Something went wrong.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleStep2 = async () => {
        if (!categoryName.trim()) {
            error("Please provide a category name");
            return;
        }
        setIsLoading(true);
        try {
            const res = await fetch("/api/categories", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: categoryName,
                    color: categoryColor,
                    monthlyLimit: parseFloat(categoryLimit) || 0,
                }),
            });
            const data = await res.json();
            if (res.ok) {
                setCreatedCategoryId(data._id);
                setStep(3);
            } else {
                error(data.message || "Failed to create category.");
            }
        } catch (err) {
            console.error(err);
            error("Something went wrong.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleStep3 = async () => {
        if (!expenseDesc.trim()) {
            error("Please enter an expense description");
            return;
        }
        if (!expenseAmount || parseFloat(expenseAmount) <= 0) {
            error("Please enter a valid expense amount");
            return;
        }
        setIsLoading(true);
        try {
            // 1. Create first expense
            const expenseRes = await fetch("/api/expenses", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    description: expenseDesc,
                    amount: parseFloat(expenseAmount),
                    categoryId: createdCategoryId,
                    date: new Date(),
                }),
            });

            if (!expenseRes.ok) {
                const data = await expenseRes.json();
                error(data.message || "Failed to log expense");
                setIsLoading(false);
                return;
            }

            // 2. Mark onboarding as complete
            const prefRes = await fetch("/api/user/preferences", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ onboardingComplete: true }),
            });

            if (prefRes.ok) {
                setSuccessCelebration(true);
                success("Welcome to SmartSpend! Onboarding completed successfully! 🎉");
                setTimeout(() => {
                    onComplete();
                }, 2200);
            } else {
                error("Failed to complete onboarding.");
            }
        } catch (err) {
            console.error(err);
            error("Something went wrong.");
        } finally {
            setIsLoading(false);
        }
    };

    const progressPercent = (step / 3) * 100;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#05070F]/85 backdrop-blur-md p-4 select-none">
            <div className="relative w-full max-w-lg rounded-3xl border border-white/[0.08] bg-[#111827]/80 backdrop-blur-2xl shadow-[0_0_50px_rgba(6,182,212,0.15)] overflow-hidden p-6 md:p-8 space-y-8">
                
                {/* 3-Step Indicators & Aurora Progress Meter */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between px-2">
                        {[1, 2, 3].map((num) => {
                            const isActive = step === num;
                            const isCompleted = step > num;
                            return (
                                <React.Fragment key={num}>
                                    <div className="flex flex-col items-center relative z-10">
                                        <motion.div
                                            animate={{
                                                scale: isActive ? 1.15 : 1.0,
                                                background: isActive
                                                    ? "linear-gradient(to right, #06B6D4, #8B5CF6, #EC4899)"
                                                    : isCompleted
                                                    ? "linear-gradient(to right, #10B981, #059669)"
                                                    : "rgba(255, 255, 255, 0.04)"
                                            }}
                                            transition={{ type: "spring", stiffness: 400, damping: 25 }}
                                            className={cn(
                                                "w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm text-white",
                                                "border border-white/[0.06] shadow-lg",
                                                isActive && "shadow-[0_0_15px_rgba(6,182,212,0.4)] border-cyan-400/30",
                                                isCompleted && "shadow-[0_0_15px_rgba(16,185,129,0.3)] border-emerald-400/30"
                                            )}
                                        >
                                            {isCompleted ? <Check className="w-5 h-5 text-white" /> : num}
                                        </motion.div>
                                        <span className={cn(
                                            "text-[10px] font-bold mt-2 tracking-wider uppercase transition-colors",
                                            isActive ? "text-cyan-400" : isCompleted ? "text-emerald-400" : "text-[#64748B]"
                                        )}>
                                            {num === 1 ? "Setup" : num === 2 ? "Category" : "Expense"}
                                        </span>
                                    </div>
                                    {num < 3 && (
                                        <div className="flex-1 h-[2px] bg-white/[0.04] mx-2 -mt-5 relative overflow-hidden">
                                            <motion.div
                                                initial={{ width: "0%" }}
                                                animate={{ width: isCompleted ? "100%" : isActive ? "50%" : "0%" }}
                                                transition={{ duration: 0.4 }}
                                                className="h-full bg-gradient-to-r from-cyan-500 to-violet-500"
                                            />
                                        </div>
                                    )}
                                </React.Fragment>
                            );
                        })}
                    </div>

                    <div className="space-y-1">
                        <div className="flex justify-between items-center text-[10px] font-bold text-[#94A3B8] uppercase tracking-wider">
                            <span>Step progress</span>
                            <span className="text-cyan-400">{progressPercent.toFixed(0)}% Complete</span>
                        </div>
                        <div className="h-1.5 w-full bg-white/[0.04] rounded-full overflow-hidden border border-white/[0.06] relative">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${progressPercent}%` }}
                                transition={{ type: "spring", stiffness: 400, damping: 25 }}
                                className="h-full bg-gradient-to-r from-[#06B6D4] via-[#8B5CF6] to-[#EC4899] relative"
                            >
                                <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.15),transparent)] animate-shimmer" style={{ animationDuration: '2s', width: '200%' }} />
                            </motion.div>
                        </div>
                    </div>
                </div>

                {/* Main Step Form Container */}
                <div className="relative">
                    <AnimatePresence mode="wait">
                        {successCelebration ? (
                            <motion.div
                                key="celebration"
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                                className="space-y-6 text-center py-4"
                            >
                                <Confetti />
                                <div className="relative w-20 h-20 mx-auto">
                                    <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: [0, 1.2, 1] }}
                                        transition={{ duration: 0.6, times: [0, 0.7, 1] }}
                                        className="w-full h-full bg-gradient-to-r from-[#06B6D4] to-[#8B5CF6] rounded-full flex items-center justify-center text-white shadow-[0_0_30px_rgba(6,182,212,0.4)]"
                                    >
                                        <CheckCircle2 className="w-10 h-10" />
                                    </motion.div>
                                    <motion.div
                                        animate={{ scale: [1, 1.4, 1], opacity: [0.4, 0, 0.4] }}
                                        transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                                        className="absolute inset-0 bg-cyan-500/30 rounded-full -z-10"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <h2 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-violet-400 to-pink-400 tracking-tight">
                                        All Set! 🎉
                                    </h2>
                                    <p className="text-xs md:text-sm text-[#94A3B8] max-w-sm mx-auto leading-relaxed">
                                        Your base preference, first category, and first expense are logged. Preparing your personalized Midnight Aurora experience...
                                    </p>
                                </div>
                            </motion.div>
                        ) : step === 1 ? (
                            <motion.div
                                key="step1"
                                initial={{ x: 20, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                exit={{ x: -20, opacity: 0 }}
                                transition={{ duration: 0.2 }}
                                className="space-y-6 text-center"
                            >
                                <div className="w-16 h-16 bg-[#06B6D4]/10 rounded-2xl flex items-center justify-center text-[#06B6D4] mx-auto border border-[#06B6D4]/20 shadow-[0_0_15px_rgba(6,182,212,0.15)]">
                                    <Sparkles className="w-8 h-8 animate-pulse" />
                                </div>
                                <div className="space-y-2">
                                    <h2 className="text-xl md:text-2xl font-black text-white tracking-tight">
                                        Welcome to SmartSpend! 🚀
                                    </h2>
                                    <p className="text-xs md:text-sm text-[#94A3B8] max-w-sm mx-auto leading-relaxed">
                                        Let&apos;s configure your core dashboard to fit your needs. What is your preferred base currency?
                                    </p>
                                </div>

                                <div className="grid grid-cols-3 gap-3 max-w-xs mx-auto">
                                    {["USD", "EUR", "GBP"].map((curr) => (
                                        <button
                                            key={curr}
                                            onClick={() => setCurrency(curr)}
                                            className={cn(
                                                "py-3 rounded-xl border text-xs font-bold transition-all duration-300 cursor-pointer",
                                                currency === curr
                                                    ? "border-cyan-400/50 bg-gradient-to-r from-cyan-500/10 to-violet-500/10 text-white shadow-[0_0_15px_rgba(6,182,212,0.15)]"
                                                    : "border-white/[0.06] bg-[#111827]/40 text-[#94A3B8] hover:text-white hover:border-cyan-400/20 hover:bg-[#111827]/60"
                                            )}
                                        >
                                            {curr}
                                        </button>
                                    ))}
                                </div>

                                <div className="pt-4">
                                    <Button
                                        onClick={handleStep1}
                                        isLoading={isLoading}
                                        className="w-full flex items-center justify-center gap-2 h-11 bg-gradient-to-r from-cyan-500 via-violet-500 to-pink-500 hover:shadow-[0_0_20px_rgba(6,182,212,0.4)] text-white hover:bg-none border-0 font-bold transition-all"
                                    >
                                        Get Started
                                        <ArrowRight className="w-4 h-4" />
                                    </Button>
                                </div>
                            </motion.div>
                        ) : step === 2 ? (
                            <motion.div
                                key="step2"
                                initial={{ x: 20, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                exit={{ x: -20, opacity: 0 }}
                                transition={{ duration: 0.2 }}
                                className="space-y-5 text-left"
                            >
                                <div className="text-center space-y-2">
                                    <div className="w-14 h-14 bg-[#8B5CF6]/10 rounded-2xl flex items-center justify-center text-[#8B5CF6] mx-auto border border-[#8B5CF6]/20 shadow-[0_0_15px_rgba(139,92,246,0.15)]">
                                        <Tag className="w-7 h-7" />
                                    </div>
                                    <h2 className="text-lg md:text-xl font-bold text-white tracking-tight">
                                        Your First Category
                                    </h2>
                                    <p className="text-xs text-[#94A3B8] max-w-xs mx-auto leading-relaxed">
                                        Expenses need categories. Choose a preset or define your custom name and budget limit.
                                    </p>
                                </div>

                                {/* Preset Buttons */}
                                <div className="space-y-2">
                                    <label className="text-[10px] uppercase font-bold text-[#64748B] tracking-wider">Quick Presets</label>
                                    <div className="flex flex-wrap gap-2">
                                        {PRESET_CATEGORIES.map((preset) => (
                                            <button
                                                key={preset.name}
                                                type="button"
                                                onClick={() => selectPreset(preset)}
                                                className="px-3 py-1.5 rounded-xl border border-white/[0.06] bg-[#111827]/60 text-xs text-[#94A3B8] hover:text-white hover:border-cyan-400/20 hover:shadow-[0_0_15px_rgba(6,182,212,0.05)] transition-all duration-300 cursor-pointer"
                                            >
                                                {preset.name}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Inputs */}
                                <div className="space-y-4">
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-semibold text-[#94A3B8]">Category Name</label>
                                        <input
                                            type="text"
                                            placeholder="e.g. Food, rent, electricity"
                                            value={categoryName}
                                            onChange={(e) => setCategoryName(e.target.value)}
                                            className="h-10 w-full rounded-xl border border-white/[0.06] bg-[#111827]/60 px-3 text-xs text-white placeholder-gray-500 focus:border-cyan-400/50 focus:ring-2 focus:ring-cyan-400/10 focus:outline-none transition-all duration-300"
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-semibold text-[#94A3B8]">Color Tag</label>
                                            <div className="flex items-center gap-2 h-10 px-3 rounded-xl border border-white/[0.06] bg-[#111827]/60 focus-within:border-cyan-400/50 focus-within:ring-2 focus-within:ring-cyan-400/10 transition-all duration-300">
                                                <input
                                                    type="color"
                                                    value={categoryColor}
                                                    onChange={(e) => setCategoryColor(e.target.value)}
                                                    className="w-6 h-6 border-0 bg-transparent cursor-pointer rounded overflow-hidden shrink-0"
                                                />
                                                <span className="text-[10px] font-mono text-[#94A3B8] uppercase">{categoryColor}</span>
                                            </div>
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-semibold text-[#94A3B8]">Monthly Budget ({currency})</label>
                                            <input
                                                type="number"
                                                placeholder="e.g. 500 (optional)"
                                                value={categoryLimit}
                                                onChange={(e) => setCategoryLimit(e.target.value)}
                                                className="h-10 w-full rounded-xl border border-white/[0.06] bg-[#111827]/60 px-3 text-xs text-white placeholder-gray-500 focus:border-cyan-400/50 focus:ring-2 focus:ring-cyan-400/10 focus:outline-none transition-all duration-300"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-4 flex gap-3">
                                    <Button
                                        variant="secondary"
                                        onClick={() => setStep(1)}
                                        className="w-1/3 flex items-center justify-center gap-1.5 h-11 border border-white/[0.06] bg-[#111827]/40 hover:bg-[#111827]/60 text-white font-bold"
                                    >
                                        <ArrowLeft className="w-4 h-4" />
                                        Back
                                    </Button>
                                    <Button
                                        onClick={handleStep2}
                                        isLoading={isLoading}
                                        className="flex-1 flex items-center justify-center gap-2 h-11 bg-gradient-to-r from-cyan-500 via-violet-500 to-pink-500 hover:shadow-[0_0_20px_rgba(6,182,212,0.4)] text-white hover:bg-none border-0 font-bold transition-all"
                                    >
                                        Save & Continue
                                        <ArrowRight className="w-4 h-4" />
                                    </Button>
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="step3"
                                initial={{ x: 20, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                exit={{ x: -20, opacity: 0 }}
                                transition={{ duration: 0.2 }}
                                className="space-y-5 text-left"
                            >
                                <div className="text-center space-y-2">
                                    <div className="w-14 h-14 bg-[#EC4899]/10 rounded-2xl flex items-center justify-center text-[#EC4899] mx-auto border border-[#EC4899]/20 shadow-[0_0_15px_rgba(236,72,153,0.15)]">
                                        <DollarSign className="w-7 h-7" />
                                    </div>
                                    <h2 className="text-lg md:text-xl font-bold text-white tracking-tight">
                                        Add Your First Expense
                                    </h2>
                                    <p className="text-xs text-[#94A3B8] max-w-xs mx-auto leading-relaxed">
                                        Almost done! Let&apos;s log your first expense under the new <strong>{categoryName}</strong> category.
                                    </p>
                                </div>

                                <div className="space-y-4">
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-semibold text-[#94A3B8]">Expense Description</label>
                                        <input
                                            type="text"
                                            placeholder="e.g. Grocery shopping, Weekly rent"
                                            value={expenseDesc}
                                            onChange={(e) => setExpenseDesc(e.target.value)}
                                            className="h-10 w-full rounded-xl border border-white/[0.06] bg-[#111827]/60 px-3 text-xs text-white placeholder-gray-500 focus:border-cyan-400/50 focus:ring-2 focus:ring-cyan-400/10 focus:outline-none transition-all duration-300"
                                        />
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-xs font-semibold text-[#94A3B8]">Amount ({currency})</label>
                                        <input
                                            type="number"
                                            placeholder="e.g. 45.99"
                                            value={expenseAmount}
                                            onChange={(e) => setExpenseAmount(e.target.value)}
                                            className="h-10 w-full rounded-xl border border-white/[0.06] bg-[#111827]/60 px-3 text-xs text-white placeholder-gray-500 focus:border-cyan-400/50 focus:ring-2 focus:ring-cyan-400/10 focus:outline-none transition-all duration-300"
                                        />
                                    </div>
                                </div>

                                <div className="pt-4 flex gap-3">
                                    <Button
                                        variant="secondary"
                                        onClick={() => setStep(2)}
                                        className="w-1/3 flex items-center justify-center gap-1.5 h-11 border border-white/[0.06] bg-[#111827]/40 hover:bg-[#111827]/60 text-white font-bold"
                                    >
                                        <ArrowLeft className="w-4 h-4" />
                                        Back
                                    </Button>
                                    <Button
                                        onClick={handleStep3}
                                        isLoading={isLoading}
                                        className="flex-1 flex items-center justify-center gap-2 h-11 bg-gradient-to-r from-emerald-500 to-teal-500 hover:shadow-[0_0_20px_rgba(16,185,129,0.4)] text-white hover:bg-none border-0 font-bold transition-all"
                                    >
                                        <Check className="w-4 h-4" />
                                        Finish & Setup Dashboard
                                    </Button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}
