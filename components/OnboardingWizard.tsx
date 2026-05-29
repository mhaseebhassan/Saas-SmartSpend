"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { Sparkles, DollarSign, Tag, ArrowRight, ArrowLeft, Check, CheckCircle2 } from "lucide-react";
import { useToast } from "@/lib/toast-context";

const PRESET_CATEGORIES = [
    { name: "Food 🍔", color: "#10B981", defaultLimit: 400 },
    { name: "Housing 🏠", color: "#6366F1", defaultLimit: 1200 },
    { name: "Entertainment 🎬", color: "#F59E0B", defaultLimit: 200 },
    { name: "Transport 🚗", color: "#EF4444", defaultLimit: 300 },
];

export default function OnboardingWizard({ onComplete }) {
    const { success, error } = useToast();
    const [step, setStep] = useState(1);
    const [isLoading, setIsLoading] = useState(false);

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
                success("Welcome to SmartSpend! Onboarding completed successfully! 🎉");
                onComplete();
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 select-none">
            <div className="relative w-full max-w-lg rounded-3xl border border-[#2A2D3E] bg-[#1A1D2E] shadow-2xl overflow-hidden p-6 md:p-8 space-y-6">
                
                {/* Header Progress Bar */}
                <div className="space-y-2">
                    <div className="flex justify-between items-center text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        <span>Step {step} of 3</span>
                        <span>{progressPercent.toFixed(0)}% Complete</span>
                    </div>
                    <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${progressPercent}%` }}
                            transition={{ duration: 0.3 }}
                            className="h-full bg-primary"
                        />
                    </div>
                </div>

                <AnimatePresence mode="wait">
                    {step === 1 && (
                        <motion.div
                            key="step1"
                            initial={{ x: 20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: -20, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="space-y-6 text-center"
                        >
                            <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mx-auto border border-primary/20">
                                <Sparkles className="w-8 h-8 animate-pulse" />
                            </div>
                            <div className="space-y-2">
                                <h2 className="text-xl md:text-2xl font-black text-white tracking-tight">
                                    Welcome to SmartSpend! 🚀
                                </h2>
                                <p className="text-xs md:text-sm text-[#9CA3AF] max-w-sm mx-auto leading-relaxed">
                                    Let&apos;s configure your core dashboard to fit your needs. What is your preferred base currency?
                                </p>
                            </div>

                            <div className="grid grid-cols-3 gap-3 max-w-xs mx-auto">
                                {["USD", "EUR", "GBP"].map((curr) => (
                                    <button
                                        key={curr}
                                        onClick={() => setCurrency(curr)}
                                        className={`py-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                                            currency === curr
                                                ? "border-primary bg-primary/10 text-white"
                                                : "border-[#2A2D3E] bg-[#121420]/30 text-[#9CA3AF] hover:text-white"
                                        }`}
                                    >
                                        {curr}
                                    </button>
                                ))}
                            </div>

                            <div className="pt-4">
                                <Button
                                    onClick={handleStep1}
                                    isLoading={isLoading}
                                    className="w-full flex items-center justify-center gap-2 h-11"
                                >
                                    Get Started
                                    <ArrowRight className="w-4 h-4" />
                                </Button>
                            </div>
                        </motion.div>
                    )}

                    {step === 2 && (
                        <motion.div
                            key="step2"
                            initial={{ x: 20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: -20, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="space-y-5 text-left"
                        >
                            <div className="text-center space-y-2">
                                <div className="w-14 h-14 bg-[#10B981]/10 rounded-2xl flex items-center justify-center text-[#10B981] mx-auto border border-[#10B981]/20">
                                    <Tag className="w-7 h-7" />
                                </div>
                                <h2 className="text-lg md:text-xl font-bold text-white tracking-tight">
                                    Your First Category
                                </h2>
                                <p className="text-xs text-[#9CA3AF] max-w-xs mx-auto leading-relaxed">
                                    Expenses need categories. Choose a preset or define your custom name and budget limit.
                                </p>
                            </div>

                            {/* Preset Buttons */}
                            <div className="space-y-1.5">
                                <label className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Quick Presets</label>
                                <div className="flex flex-wrap gap-2">
                                    {PRESET_CATEGORIES.map((preset) => (
                                        <button
                                            key={preset.name}
                                            onClick={() => selectPreset(preset)}
                                            className="px-3 py-1.5 rounded-xl border border-[#2A2D3E] bg-[#121420]/30 text-xs text-[#9CA3AF] hover:text-white transition-colors cursor-pointer"
                                        >
                                            {preset.name}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Inputs */}
                            <div className="space-y-4">
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-gray-300">Category Name</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. Food, rent, electricity"
                                        value={categoryName}
                                        onChange={(e) => setCategoryName(e.target.value)}
                                        className="h-10 w-full rounded-xl border border-[#2A2D3E] bg-[#121420]/50 px-3 text-xs text-white focus:outline-none focus:border-primary/50"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-xs font-semibold text-gray-300">Color Tag</label>
                                        <div className="flex items-center gap-2 h-10 px-3 rounded-xl border border-[#2A2D3E] bg-[#121420]/50">
                                            <input
                                                type="color"
                                                value={categoryColor}
                                                onChange={(e) => setCategoryColor(e.target.value)}
                                                className="w-6 h-6 border-0 bg-transparent cursor-pointer rounded overflow-hidden shrink-0"
                                            />
                                            <span className="text-[10px] font-mono text-muted-foreground uppercase">{categoryColor}</span>
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-semibold text-gray-300">Monthly Budget ({currency})</label>
                                        <input
                                            type="number"
                                            placeholder="e.g. 500 (optional)"
                                            value={categoryLimit}
                                            onChange={(e) => setCategoryLimit(e.target.value)}
                                            className="h-10 w-full rounded-xl border border-[#2A2D3E] bg-[#121420]/50 px-3 text-xs text-white focus:outline-none focus:border-primary/50"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="pt-4 flex gap-3">
                                <Button
                                    variant="secondary"
                                    onClick={() => setStep(1)}
                                    className="w-1/3 flex items-center justify-center gap-1.5 h-11"
                                >
                                    <ArrowLeft className="w-4 h-4" />
                                    Back
                                </Button>
                                <Button
                                    onClick={handleStep2}
                                    isLoading={isLoading}
                                    className="flex-1 flex items-center justify-center gap-2 h-11"
                                >
                                    Save & Continue
                                    <ArrowRight className="w-4 h-4" />
                                </Button>
                            </div>
                        </motion.div>
                    )}

                    {step === 3 && (
                        <motion.div
                            key="step3"
                            initial={{ x: 20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: -20, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="space-y-5 text-left"
                        >
                            <div className="text-center space-y-2">
                                <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mx-auto border border-primary/20">
                                    <DollarSign className="w-7 h-7" />
                                </div>
                                <h2 className="text-lg md:text-xl font-bold text-white tracking-tight">
                                    Add Your First Expense
                                </h2>
                                <p className="text-xs text-[#9CA3AF] max-w-xs mx-auto leading-relaxed">
                                    Almost done! Let&apos;s log your first expense under the new <strong>{categoryName}</strong> category.
                                </p>
                            </div>

                            <div className="space-y-4">
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-gray-300">Expense Description</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. Grocery shopping, Weekly rent"
                                        value={expenseDesc}
                                        onChange={(e) => setExpenseDesc(e.target.value)}
                                        className="h-10 w-full rounded-xl border border-[#2A2D3E] bg-[#121420]/50 px-3 text-xs text-white focus:outline-none focus:border-primary/50"
                                    />
                                </div>

                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-gray-300">Amount ({currency})</label>
                                    <input
                                        type="number"
                                        placeholder="e.g. 45.99"
                                        value={expenseAmount}
                                        onChange={(e) => setExpenseAmount(e.target.value)}
                                        className="h-10 w-full rounded-xl border border-[#2A2D3E] bg-[#121420]/50 px-3 text-xs text-white focus:outline-none focus:border-primary/50"
                                    />
                                </div>
                            </div>

                            <div className="pt-4 flex gap-3">
                                <Button
                                    variant="secondary"
                                    onClick={() => setStep(2)}
                                    className="w-1/3 flex items-center justify-center gap-1.5 h-11"
                                >
                                    <ArrowLeft className="w-4 h-4" />
                                    Back
                                </Button>
                                <Button
                                    onClick={handleStep3}
                                    isLoading={isLoading}
                                    className="flex-1 flex items-center justify-center gap-2 h-11 bg-success hover:bg-success-hover text-white shadow-success/20"
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
    );
}
