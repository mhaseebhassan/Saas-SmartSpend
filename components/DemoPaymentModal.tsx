"use client";

import React, { useState } from "react";
import { X, CreditCard, Lock, CheckCircle2, Loader2, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/lib/toast-context";
import { useRouter } from "next/navigation";

interface DemoPaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export default function DemoPaymentModal({ isOpen, onClose, onSuccess }: DemoPaymentModalProps) {
    const { success, error } = useToast();
    const router = useRouter();

    const [cardNumber, setCardNumber] = useState("");
    const [expiry, setExpiry] = useState("");
    const [cvc, setCvc] = useState("");
    const [name, setName] = useState("");
    const [loading, setLoading] = useState(false);
    const [validationError, setValidationError] = useState("");

    // Simple Luhn Algorithm for basic card validation
    const luhnCheck = (val: string) => {
        let checksum = 0;
        let j = 1;
        for (let i = val.length - 1; i >= 0; i--) {
            let calc = 0;
            calc = Number(val.charAt(i)) * j;
            if (calc > 9) {
                checksum = checksum + 1;
                calc = calc - 10;
            }
            checksum = checksum + calc;
            if (j == 1) {
                j = 2;
            } else {
                j = 1;
            }
        }
        return (checksum % 10) == 0;
    };

    const handleCardChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value.replace(/\D/g, "");
        let formatted = val;
        if (val.length > 0) {
            formatted = val.match(/.{1,4}/g)?.join(" ") || "";
        }
        setCardNumber(formatted.substring(0, 19));
    };

    const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value.replace(/\D/g, "");
        if (val.length >= 2) {
            setExpiry(`${val.substring(0, 2)}/${val.substring(2, 4)}`);
        } else {
            setExpiry(val);
        }
    };

    const handleCvcChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setCvc(e.target.value.replace(/\D/g, "").substring(0, 4));
    };

    const validateForm = () => {
        setValidationError("");
        
        const rawCard = cardNumber.replace(/\s/g, "");
        if (rawCard.length < 13 || rawCard.length > 19) {
            return "Invalid card number length.";
        }
        
        if (!luhnCheck(rawCard)) {
            return "Invalid card number.";
        }

        if (expiry.length !== 5) {
            return "Invalid expiry date.";
        }

        const [monthStr, yearStr] = expiry.split("/");
        const month = parseInt(monthStr, 10);
        const year = parseInt(`20${yearStr}`, 10);

        if (month < 1 || month > 12) {
            return "Invalid expiry month.";
        }

        const now = new Date();
        const currentYear = now.getFullYear();
        const currentMonth = now.getMonth() + 1;

        if (year < currentYear || (year === currentYear && month < currentMonth)) {
            return "Card is expired.";
        }

        if (cvc.length < 3) {
            return "Invalid CVC.";
        }

        if (!name.trim()) {
            return "Name on card is required.";
        }

        return null;
    };

    const handlePayment = async (e: React.FormEvent) => {
        e.preventDefault();
        
        const err = validateForm();
        if (err) {
            setValidationError(err);
            return;
        }

        setLoading(true);
        setValidationError("");

        try {
            // Simulate network request
            const res = await fetch("/api/upgrade/demo", {
                method: "POST",
            });
            
            if (res.ok) {
                // Success
                onSuccess();
            } else {
                error("Payment failed. Please try again.");
            }
        } catch (err) {
            error("Payment failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        onClick={!loading ? onClose : undefined}
                    />
                    
                    <motion.div
                        initial={{ scale: 0.95, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.95, opacity: 0, y: 20 }}
                        className="relative w-full max-w-md bg-[#0A0A0A] border border-white/[0.08] shadow-2xl rounded-2xl overflow-hidden"
                    >
                        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-500 to-blue-500" />
                        
                        <div className="p-6 pb-0 flex justify-between items-start mb-4">
                            <div>
                                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                    <Sparkles className="w-5 h-5 text-cyan-400" />
                                    SmartSpend Pro
                                </h2>
                                <p className="text-sm text-white/50 mt-1">Upgrade your account instantly.</p>
                            </div>
                            <button 
                                onClick={!loading ? onClose : undefined}
                                className="p-1 rounded-lg text-white/40 hover:text-white hover:bg-white/[0.04] transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handlePayment} className="p-6 space-y-5">
                            {/* DEMO Notice */}
                            <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg flex items-start gap-3">
                                <Lock className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                                <div className="text-xs text-blue-200/70">
                                    <strong className="text-blue-300">Demo Portal:</strong> You can use any valid credit card number that passes the Luhn check, as long as the expiry date is in the future.
                                </div>
                            </div>

                            {validationError && (
                                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-xs text-red-400 font-medium">
                                    {validationError}
                                </div>
                            )}

                            <div>
                                <label className="block text-xs font-semibold uppercase tracking-wider text-white/50 mb-2">
                                    Name on Card
                                </label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="John Doe"
                                    className="w-full bg-[#111111] border border-white/[0.08] rounded-lg px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-cyan-500/50 transition-colors"
                                    disabled={loading}
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold uppercase tracking-wider text-white/50 mb-2">
                                    Card Information
                                </label>
                                <div className="rounded-lg border border-white/[0.08] overflow-hidden bg-[#111111] focus-within:border-cyan-500/50 transition-colors">
                                    <div className="flex items-center px-4 border-b border-white/[0.08]">
                                        <CreditCard className="w-4 h-4 text-white/40 mr-2" />
                                        <input
                                            type="text"
                                            value={cardNumber}
                                            onChange={handleCardChange}
                                            placeholder="0000 0000 0000 0000"
                                            className="w-full bg-transparent py-3 text-white placeholder-white/30 focus:outline-none font-mono"
                                            disabled={loading}
                                        />
                                    </div>
                                    <div className="flex">
                                        <input
                                            type="text"
                                            value={expiry}
                                            onChange={handleExpiryChange}
                                            placeholder="MM/YY"
                                            className="w-1/2 bg-transparent border-r border-white/[0.08] px-4 py-3 text-white placeholder-white/30 focus:outline-none font-mono"
                                            disabled={loading}
                                        />
                                        <input
                                            type="text"
                                            value={cvc}
                                            onChange={handleCvcChange}
                                            placeholder="CVC"
                                            className="w-1/2 bg-transparent px-4 py-3 text-white placeholder-white/30 focus:outline-none font-mono"
                                            disabled={loading}
                                        />
                                    </div>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full h-12 mt-4 bg-gradient-to-r from-cyan-500 to-blue-500 hover:opacity-90 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-opacity shadow-[0_0_20px_rgba(6,182,212,0.3)] disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        Processing...
                                    </>
                                ) : (
                                    <>
                                        Upgrade Now - $9.99/mo
                                    </>
                                )}
                            </button>
                            
                            <div className="flex items-center justify-center gap-2 text-[10px] text-white/30 mt-4">
                                <Lock className="w-3 h-3" /> Payments are securely processed via mock integration.
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
