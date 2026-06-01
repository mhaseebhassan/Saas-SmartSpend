"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSession, signOut } from "next-auth/react";
import {
    User as UserIcon,
    Shield,
    Lock,
    Settings as SettingsIcon,
    DollarSign,
    Trash2,
    Check,
    AlertTriangle,
    Crown,
    Sparkles,
    CheckCircle2,
    Eye,
    EyeOff,
    Loader2
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Select } from "@/components/ui/Select";
import { Toggle } from "@/components/ui/Toggle";
import { Modal } from "@/components/ui/Modal";
import { useToast } from "@/lib/toast-context";
import { cn } from "@/lib/utils";

// Floating Confetti Particle Component
const ConfettiParticle = ({ delay }: any) => {
    const [styleProps, setStyleProps] = React.useState(null);

    React.useEffect(() => {
        const randomX = Math.random() * 160 - 80; // horizontal drift (-80px to 80px)
        const randomY = Math.random() * 250 + 500; // fall height (500px to 750px)
        const randomRotate = Math.random() * 360;
        const colors = ["#6366F1", "#10B981", "#F59E0B", "#EF4444", "#3B82F6", "#EC4899", "#8B5CF6"];
        const color = colors[Math.floor(Math.random() * colors.length)];
        const scale = Math.random() * 0.6 + 0.4;
        const duration = Math.random() * 2.5 + 1.5;
        const left = `${Math.random() * 100}%`;
        setStyleProps({ randomX, randomY, randomRotate, color, scale, duration, left });
    }, []);

    if (!styleProps) return null;

    return (
        <motion.div
            initial={{ y: -20, x: 0, opacity: 1, scale: styleProps.scale }}
            animate={{
                y: styleProps.randomY,
                x: styleProps.randomX,
                opacity: 0,
                rotate: styleProps.randomRotate
            }}
            transition={{
                duration: styleProps.duration,
                ease: "easeOut",
                delay: delay
            }}
            className="absolute top-0 w-2.5 h-2.5 rounded-full z-50 pointer-events-none"
            style={{ backgroundColor: styleProps.color, left: styleProps.left }}
        />
    );
};

export default function SettingsPageClient() {
    const { data: session, update } = useSession();
    const { success, error, info } = useToast();

    // Datasets
    const [categories, setCategories] = React.useState<any[]>([]);
    const [preferencesLoading, setPreferencesLoading] = React.useState(true);

    // Active Tab State for Left-Side / Horizontal Switching
    const [activeTab, setActiveTab] = React.useState<"profile" | "billing" | "security" | "danger">("profile");

    // Profile States
    const [profileName, setProfileName] = React.useState("");
    const [profileEmail, setProfileEmail] = React.useState("");
    const [profileSubmitting, setProfileSubmitting] = React.useState(false);

    // Password States
    const [currentPassword, setCurrentPassword] = React.useState("");
    const [newPassword, setNewPassword] = React.useState("");
    const [confirmNewPassword, setConfirmNewPassword] = React.useState("");
    const [showCurrentPassword, setShowCurrentPassword] = React.useState(false);
    const [showNewPassword, setShowNewPassword] = React.useState(false);
    const [passwordSubmitting, setPasswordSubmitting] = React.useState(false);
    const [passwordErrors, setPasswordErrors] = React.useState<Record<string, string>>({});

    // Preferences States
    const [currency, setCurrency] = React.useState("USD");
    const [dateFormat, setDateFormat] = React.useState("MM/DD/YYYY");
    const [defaultCategory, setDefaultCategory] = React.useState("");
    const [prefsSubmitting, setPrefsSubmitting] = React.useState(false);

    // Subscription & Stripe Loading States
    const [stripeLoading, setStripeLoading] = React.useState(false);
    const [isProUser, setIsProUser] = React.useState(false);

    // Danger Zone States
    const [isDeleteModalOpen, setIsDeleteModalOpen] = React.useState(false);
    const [deleteConfirmationText, setDeleteConfirmationText] = React.useState("");
    const [deleteSubmitting, setDeleteSubmitting] = React.useState(false);

    // Confetti active state
    const [showConfetti, setShowConfetti] = React.useState(false);

    // Fetch user profile and preferences on mount
    const fetchUserData = React.useCallback(async () => {
        setPreferencesLoading(true);
        try {
            const prefRes = await fetch("/api/user/preferences");
            if (prefRes.ok) {
                const data = await prefRes.json();
                setCurrency(data.currency || "USD");
                setDateFormat(data.dateFormat || "MM/DD/YYYY");
                setDefaultCategory(data.defaultCategory || "");
            }
        } catch (err) {
            console.error("Error loading user preferences:", err);
            error("Failed to load user preferences.");
        } finally {
            setPreferencesLoading(false);
        }
    }, [error]);

    const fetchCategories = React.useCallback(async () => {
        try {
            const res = await fetch("/api/categories");
            if (res.ok) {
                const data = await res.json();
                setCategories(data || []);
            }
        } catch (err) {
            console.error("Error loading categories list:", err);
        }
    }, []);

    React.useEffect(() => {
        if (session?.user) {
            setProfileName(session.user.name || "");
            setProfileEmail(session.user.email || "");
            setIsProUser(session.user.isPro || false);
        }
    }, [session]);

    React.useEffect(() => {
        fetchUserData();
        fetchCategories();

        // Check upgraded search query param safely on client-side
        if (typeof window !== "undefined") {
            const queryParams = new URLSearchParams(window.location.search);
            if (queryParams.get("upgraded") === "true") {
                setShowConfetti(true);
                success("Congratulations! You have successfully upgraded to SmartSpend Pro! 🎉");
                // Clear query params to make URLs clean again
                window.history.replaceState({}, document.title, window.location.pathname);
            }
        }
    }, [fetchUserData, fetchCategories, success]);

    // Derived User Initials
    const initials = React.useMemo(() => {
        if (!profileName) return "US";
        return profileName
            .split(" ")
            .map(word => word[0])
            .slice(0, 2)
            .join("")
            .toUpperCase();
    }, [profileName]);

    // Handle Profile Name Update
    const handleProfileSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!profileName.trim()) {
            error("Name is required.");
            return;
        }

        setProfileSubmitting(true);
        try {
            const res = await fetch("/api/user", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: profileName })
            });

            if (res.ok) {
                const result = await res.json();
                // Refresh client session
                await update({ name: result.user.name });
                success("Profile updated successfully!");
            } else {
                const data = await res.json();
                error(data.message || "Failed to update profile.");
            }
        } catch (err) {
            console.error("Profile submit error:", err);
            error("Failed to update profile name.");
        } finally {
            setProfileSubmitting(false);
        }
    };

    // Handle Change Password Update
    const handlePasswordSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const errors: Record<string, string> = {};

        if (!newPassword || newPassword.length < 6) {
            errors.newPassword = "New password must be at least 6 characters.";
        }
        if (newPassword !== confirmNewPassword) {
            errors.confirmNewPassword = "Passwords do not match.";
        }

        if (Object.keys(errors).length > 0) {
            setPasswordErrors(errors);
            return;
        }

        setPasswordErrors({});
        setPasswordSubmitting(true);

        try {
            const res = await fetch("/api/user/password", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    currentPassword,
                    newPassword
                })
            });

            const data = await res.json();
            if (res.ok) {
                success("Password updated successfully!");
                setCurrentPassword("");
                setNewPassword("");
                setConfirmNewPassword("");
            } else {
                error(data.message || "Failed to change password.");
            }
        } catch (err) {
            console.error("Password submit error:", err);
            error("Something went wrong changing password.");
        } finally {
            setPasswordSubmitting(false);
        }
    };

    // Handle Preferences update
    const handlePrefsSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setPrefsSubmitting(true);

        try {
            const res = await fetch("/api/user/preferences", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    currency,
                    dateFormat,
                    defaultCategory: defaultCategory || null
                })
            });

            if (res.ok) {
                success("Preferences updated successfully!");
            } else {
                error("Failed to update preferences.");
            }
        } catch (err) {
            console.error("Preferences submit error:", err);
            error("Something went wrong saving preferences.");
        } finally {
            setPrefsSubmitting(false);
        }
    };

    // Handle Stripe checkout redirection
    const handleUpgradeToPro = async () => {
        setStripeLoading(true);
        try {
            const res = await fetch("/api/stripe/create-checkout-session", {
                method: "POST"
            });
            if (res.ok) {
                const data = await res.json();
                if (data.url) {
                    window.location.href = data.url;
                }
            } else {
                error("Stripe Integration failed to start.");
            }
        } catch (err) {
            console.error("Upgrade Stripe logic error:", err);
            error("Stripe Integration unavailable.");
        } finally {
            setStripeLoading(false);
        }
    };

    // Handle Stripe billing portal management
    const handleManageBilling = async () => {
        setStripeLoading(true);
        try {
            const res = await fetch("/api/stripe/create-portal-session", {
                method: "POST"
            });
            if (res.ok) {
                const data = await res.json();
                if (data.url) {
                    window.location.href = data.url;
                }
            } else {
                error("Failed to initialize billing portal.");
            }
        } catch (err) {
            console.error("Stripe billing portal redirect error:", err);
            error("Billing portal unavailable.");
        } finally {
            setStripeLoading(false);
        }
    };

    // Account deletion
    const handleDeleteAccount = async () => {
        if (deleteConfirmationText !== "DELETE") {
            error("Please confirm by typing 'DELETE' exactly.");
            return;
        }

        setDeleteSubmitting(true);
        try {
            const res = await fetch("/api/user", {
                method: "DELETE"
            });

            if (res.ok) {
                success("Your account has been deleted. Logging out...");
                setIsDeleteModalOpen(false);
                // Clear session cookies and signout redirecting to login page
                signOut({ callbackUrl: "/login" });
            } else {
                error("Failed to delete account.");
            }
        } catch (err) {
            console.error("Account delete error:", err);
            error("Something went wrong.");
        } finally {
            setDeleteSubmitting(false);
        }
    };

    // Navigation Tab items config
    const tabs = [
        { id: "profile", label: "Profile Details", icon: UserIcon },
        { id: "billing", label: "Premium Billing", icon: DollarSign },
        { id: "security", label: "Account Security", icon: Lock },
        { id: "danger", label: "Danger Zone", icon: AlertTriangle },
    ] as const;

    return (
        <div className="space-y-8 text-left select-none relative w-full pb-10">
            {/* Confetti floating layout */}
            {showConfetti && (
                <div className="absolute inset-0 pointer-events-none overflow-hidden z-50">
                    {Array.from({ length: 80 }).map((_, i) => (
                        <ConfettiParticle key={i} delay={i * 0.04} />
                    ))}
                </div>
            )}

            {/* Header */}
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-white/[0.06] pb-6">
                <div>
                    <h1 className="text-3xl font-extrabold tracking-tight text-white/95 bg-gradient-to-r from-white via-[#F1F5F9] to-[#94A3B8] bg-clip-text text-transparent">
                        Account Settings
                    </h1>
                    <p className="text-sm text-[#94A3B8] mt-1">
                        Manage profile info, active subscription plans, defaults, and security configurations.
                    </p>
                </div>
                {isProUser && (
                    <span className="self-start sm:self-auto inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-gradient-to-r from-cyan-500/10 via-violet-500/10 to-pink-500/10 border border-cyan-500/20 text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.08)]">
                        <Crown className="w-3.5 h-3.5 fill-current" /> Pro Access
                    </span>
                )}
            </div>

            {/* Main Content Layout with Left-side / Horizontal responsive Tabs */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
                
                {/* Left Side: Avatar Block + Navigation Tab Links */}
                <div className="lg:col-span-1 space-y-6">
                    
                    {/* User profile details box */}
                    <Card className="bg-[#111827]/60 backdrop-blur-xl border border-white/[0.06] overflow-hidden text-center p-6 relative shadow-[0_4px_30px_rgba(0,0,0,0.15)] hover:border-cyan-400/20 transition-all duration-300">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-cyan-500/5 to-violet-500/5 rounded-full blur-3xl pointer-events-none" />
                        <div className="flex flex-col items-center">
                            {/* Avatar initials with gorgeous aurora gradient ring border */}
                            <motion.div
                                whileHover={{ scale: 1.05 }}
                                transition={{ type: "spring", stiffness: 400, damping: 25 }}
                                className="bg-gradient-to-r from-cyan-500 via-violet-500 to-pink-500 p-[2px] rounded-full shadow-[0_0_20px_rgba(6,182,212,0.15)] hover:shadow-[0_0_30px_rgba(139,92,246,0.3)] transition-all duration-300 cursor-pointer group mb-4"
                            >
                                <div className="w-20 h-20 rounded-full bg-[#0A0E1A] flex items-center justify-center text-[#F1F5F9] font-extrabold text-2xl relative overflow-hidden">
                                    <span className="relative z-10">{initials}</span>
                                    <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/10 to-pink-500/10" />
                                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-gradient-to-tr from-cyan-500/20 via-violet-500/20 to-pink-500/20 transition-opacity duration-300" />
                                </div>
                            </motion.div>

                            <div className="space-y-1.5 w-full flex flex-col items-center">
                                <h3 className="text-lg font-bold text-[#F1F5F9] tracking-tight">{profileName || "SmartSpend User"}</h3>
                                <p className="text-xs text-[#94A3B8] font-mono select-all selection:bg-cyan-500/20 max-w-[180px] truncate block text-center">{profileEmail}</p>
                            </div>

                            {/* Plan Pill indicator */}
                            <div className="mt-4.5">
                                {isProUser ? (
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-gradient-to-r from-cyan-500 via-violet-500 to-pink-500 text-white shadow-[0_0_15px_rgba(139,92,246,0.25)] border border-white/[0.08]">
                                        <Crown className="w-3.5 h-3.5 fill-current" /> Pro Plan
                                    </span>
                                ) : (
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-semibold uppercase tracking-wider bg-white/[0.04] border border-white/[0.06] text-[#94A3B8]">
                                        Free Plan
                                    </span>
                                )}
                            </div>
                        </div>
                    </Card>

                    {/* Navigation Tab Switcher: Desktop (Vertical list) */}
                    <div className="hidden lg:flex flex-col gap-1.5 p-2 bg-[#111827]/60 backdrop-blur-xl border border-white/[0.06] rounded-2xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.02)]">
                        {tabs.map((tab) => {
                            const Icon = tab.icon;
                            const isActive = activeTab === tab.id;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={cn(
                                        "relative flex items-center gap-3 px-4 py-3 text-sm font-semibold rounded-xl transition-all duration-300 text-left outline-none cursor-pointer w-full group",
                                        isActive 
                                            ? "text-[#F1F5F9]" 
                                            : "text-[#94A3B8] hover:text-[#F1F5F9]"
                                    )}
                                >
                                    {isActive && (
                                        <motion.div
                                            layoutId="activeTabIndicatorDesktop"
                                            className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 via-violet-500/10 to-pink-500/10 rounded-xl border border-cyan-500/20 shadow-[0_0_15px_rgba(6,182,212,0.08)]"
                                            transition={{ type: "spring", stiffness: 380, damping: 30 }}
                                        />
                                    )}
                                    <Icon className={cn(
                                        "w-4 h-4 relative z-10 transition-colors duration-300",
                                        isActive ? "text-cyan-400" : "text-[#64748B] group-hover:text-[#94A3B8]",
                                        tab.id === "danger" && !isActive && "group-hover:text-red-400"
                                    )} />
                                    <span className="relative z-10 font-bold">{tab.label}</span>
                                    {tab.id === "billing" && isProUser && (
                                        <Crown className="w-3.5 h-3.5 ml-auto text-amber-400 relative z-10 fill-current animate-pulse" />
                                    )}
                                </button>
                            );
                        })}
                    </div>

                    {/* Navigation Tab Switcher: Mobile (Horizontal row) */}
                    <div className="flex lg:hidden overflow-x-auto scroll-smooth touch-pan-x snap-x gap-2 p-1.5 bg-[#111827]/60 backdrop-blur-xl border border-white/[0.06] rounded-2xl [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden shadow-[inset_0_1px_1px_rgba(255,255,255,0.02)]">
                        {tabs.map((tab) => {
                            const Icon = tab.icon;
                            const isActive = activeTab === tab.id;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={cn(
                                        "relative flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-xl transition-all duration-300 whitespace-nowrap outline-none cursor-pointer group snap-start",
                                        isActive 
                                            ? "text-[#F1F5F9]" 
                                            : "text-[#94A3B8] hover:text-[#F1F5F9]"
                                    )}
                                >
                                    {isActive && (
                                        <motion.div
                                            layoutId="activeTabIndicatorMobile"
                                            className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 via-violet-500/10 to-pink-500/10 rounded-xl border border-cyan-500/20 shadow-[0_0_15px_rgba(6,182,212,0.08)]"
                                            transition={{ type: "spring", stiffness: 380, damping: 30 }}
                                        />
                                    )}
                                    <Icon className={cn(
                                        "w-3.5 h-3.5 relative z-10 transition-colors duration-300",
                                        isActive ? "text-cyan-400" : "text-[#64748B] group-hover:text-[#94A3B8]"
                                    )} />
                                    <span className="relative z-10 font-bold">{tab.label}</span>
                                </button>
                            );
                        })}
                    </div>

                </div>

                {/* Right Column: Active Tab Content Panel */}
                <div className="lg:col-span-3 min-h-[500px]">
                    <AnimatePresence mode="wait">
                        
                        {/* TAB PANEL: Profile Details & System Preferences */}
                        {activeTab === "profile" && (
                            <motion.div
                                key="profile"
                                initial={{ opacity: 0, y: 15 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -15 }}
                                transition={{ type: "spring", stiffness: 400, damping: 25 }}
                                className="space-y-6"
                            >
                                {/* General profile form */}
                                <Card className="bg-[#111827]/60 backdrop-blur-xl border border-white/[0.06] text-left shadow-[0_4px_30px_rgba(0,0,0,0.2)] rounded-2xl overflow-hidden hover:border-cyan-400/20 hover:shadow-[0_0_30px_rgba(6,182,212,0.03)] transition-all duration-300">
                                    <CardHeader className="pb-4 border-b border-white/[0.04]">
                                        <div className="flex items-center gap-2.5">
                                            <div className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
                                                <UserIcon className="w-4 h-4" />
                                            </div>
                                            <div>
                                                <CardTitle className="text-md font-bold text-white/90">Profile Details</CardTitle>
                                                <CardDescription className="text-xs text-[#94A3B8] mt-0.5 font-medium">Configure primary display parameters and communications.</CardDescription>
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="pt-6">
                                        <form onSubmit={handleProfileSubmit} className="space-y-5">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                                <Input
                                                    label="Display Name"
                                                    placeholder="e.g. John Doe"
                                                    value={profileName}
                                                    onChange={(e) => setProfileName(e.target.value)}
                                                    required
                                                    className="bg-[#0A0E1A]/40 border-white/[0.06] focus:border-cyan-400/50 focus:ring-2 focus:ring-cyan-400/10 text-white placeholder-white/20 h-11"
                                                />
                                                <div className="relative">
                                                    <Input
                                                        label="Email Address"
                                                        value={profileEmail}
                                                        disabled
                                                        helperText="Account emails are locked for validation constraints."
                                                        className="bg-[#0A0E1A]/20 border-white/[0.04] text-muted-foreground/60 h-11"
                                                    />
                                                    <Lock className="w-3.5 h-3.5 text-[#64748B]/60 absolute right-3.5 top-[38px]" />
                                                </div>
                                            </div>
                                            <div className="flex justify-end pt-4 border-t border-white/[0.04]">
                                                <Button type="submit" isLoading={profileSubmitting} className="px-5 h-10 font-bold bg-[#F1F5F9] text-[#0A0E1A] hover:bg-white flex items-center gap-1.5 shadow-[0_4px_20px_rgba(255,255,255,0.08)] rounded-xl">
                                                    <Check className="w-4 h-4 mr-1.5" /> Save Changes
                                                </Button>
                                            </div>
                                        </form>
                                    </CardContent>
                                </Card>

                                {/* System preferences form */}
                                <Card className="bg-[#111827]/60 backdrop-blur-xl border border-white/[0.06] text-left shadow-[0_4px_30px_rgba(0,0,0,0.2)] rounded-2xl overflow-hidden hover:border-cyan-400/20 hover:shadow-[0_0_30px_rgba(6,182,212,0.03)] transition-all duration-300">
                                    <CardHeader className="pb-4 border-b border-white/[0.04]">
                                        <div className="flex items-center gap-2.5">
                                            <div className="p-2 rounded-lg bg-violet-500/10 border border-violet-500/20 text-violet-400">
                                                <SettingsIcon className="w-4 h-4" />
                                            </div>
                                            <div>
                                                <CardTitle className="text-md font-bold text-white/90">System Preferences</CardTitle>
                                                <CardDescription className="text-xs text-[#94A3B8] mt-0.5 font-medium">Customize localizations, date visual grids, and default categories.</CardDescription>
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="pt-6">
                                        {preferencesLoading ? (
                                            <div className="py-12 flex flex-col justify-center items-center gap-3">
                                                <Loader2 className="w-6 h-6 text-cyan-400 animate-spin" />
                                                <span className="text-xs text-muted-foreground">Syncing settings preferences...</span>
                                            </div>
                                        ) : (
                                            <form onSubmit={handlePrefsSubmit} className="space-y-5">
                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                                                    {/* Currency */}
                                                    <Select
                                                        label="Base Currency"
                                                        value={currency}
                                                        onChange={(e) => setCurrency(e.target.value)}
                                                        className="bg-[#0A0E1A]/40 border-white/[0.06] focus:border-cyan-400/50 text-white h-11"
                                                    >
                                                        <option value="USD">USD ($)</option>
                                                        <option value="EUR">EUR (€)</option>
                                                        <option value="GBP">GBP (£)</option>
                                                        <option value="PKR">PKR (₨)</option>
                                                    </Select>

                                                    {/* Date formatting */}
                                                    <Select
                                                        label="Date Format"
                                                        value={dateFormat}
                                                        onChange={(e) => setDateFormat(e.target.value)}
                                                        className="bg-[#0A0E1A]/40 border-white/[0.06] focus:border-cyan-400/50 text-white h-11"
                                                    >
                                                        <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                                                        <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                                                    </Select>

                                                    {/* Default Category */}
                                                    <Select
                                                        label="Default Category"
                                                        value={defaultCategory}
                                                        onChange={(e) => setDefaultCategory(e.target.value)}
                                                        className="bg-[#0A0E1A]/40 border-white/[0.06] focus:border-cyan-400/50 text-white h-11"
                                                    >
                                                        <option value="">None / Uncategorized</option>
                                                        {categories.map(cat => (
                                                            <option key={cat._id} value={cat._id}>{cat.name}</option>
                                                        ))}
                                                    </Select>
                                                </div>
                                                <div className="flex justify-end pt-4 border-t border-white/[0.04]">
                                                    <Button type="submit" isLoading={prefsSubmitting} className="px-5 h-10 font-bold bg-[#F1F5F9] text-[#0A0E1A] hover:bg-white flex items-center gap-1.5 shadow-[0_4px_20px_rgba(255,255,255,0.08)] rounded-xl">
                                                        <Check className="w-4 h-4 mr-1.5" /> Save Preferences
                                                    </Button>
                                                </div>
                                            </form>
                                        )}
                                    </CardContent>
                                </Card>
                            </motion.div>
                        )}

                        {/* TAB PANEL: Billing & Stripe Plans */}
                        {activeTab === "billing" && (
                            <motion.div
                                key="billing"
                                initial={{ opacity: 0, y: 15 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -15 }}
                                transition={{ type: "spring", stiffness: 400, damping: 25 }}
                                className="space-y-6"
                            >
                                {isProUser ? (
                                    <Card className="bg-[#111827]/80 backdrop-blur-2xl border border-cyan-500/20 shadow-[0_0_30px_rgba(6,182,212,0.05)] rounded-2xl overflow-hidden hover:border-cyan-500/30 transition-all duration-300">
                                        <CardHeader className="pb-4 border-b border-white/[0.06] relative">
                                            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-cyan-500/10 to-violet-500/10 rounded-full blur-3xl pointer-events-none animate-pulse" />
                                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="p-2 rounded-xl bg-gradient-to-tr from-cyan-500/10 to-violet-500/10 border border-cyan-500/20 text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.15)]">
                                                        <Crown className="w-5 h-5 fill-current animate-bounce" />
                                                    </div>
                                                    <div>
                                                        <CardTitle className="text-lg font-bold text-white tracking-wide">SmartSpend Premium</CardTitle>
                                                        <CardDescription className="text-xs text-cyan-400/80 font-bold mt-0.5">Active Premium Subscription</CardDescription>
                                                    </div>
                                                </div>
                                                <span className="self-start sm:self-auto inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-gradient-to-r from-cyan-500 via-violet-500 to-pink-500 text-white shadow-[0_0_15px_rgba(139,92,246,0.3)] border border-white/[0.08]">
                                                    <Crown className="w-3.5 h-3.5 fill-current" /> Pro Member
                                                </span>
                                            </div>
                                        </CardHeader>
                                        <CardContent className="p-6 space-y-6">
                                            <div className="bg-white/[0.02] border border-white/[0.06] p-5 rounded-2xl space-y-3 relative overflow-hidden">
                                                <div className="flex items-center gap-2 text-sm font-bold text-white">
                                                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                                                    <span>Full Access Enabled</span>
                                                </div>
                                                <p className="text-xs text-[#94A3B8] leading-relaxed">
                                                    Your account currently utilizes all SmartSpend premium analysis features. Management of billing and plans is processed securely in your Stripe customer dashboard. You have full access to predictive analysis warnings, premium Heatmaps, customized monthly presets, and remove all category limits.
                                                </p>
                                            </div>
                                            <div className="flex justify-end">
                                                <Button
                                                    onClick={handleManageBilling}
                                                    isLoading={stripeLoading}
                                                    className="w-full sm:w-auto flex items-center justify-center gap-2 text-xs font-bold h-11 bg-white/[0.04] hover:bg-white/[0.08] text-white border border-white/[0.06] hover:border-cyan-400/20 hover:shadow-[0_0_20px_rgba(6,182,212,0.1)] transition-all duration-300 px-6 rounded-xl"
                                                >
                                                    <Shield className="w-4 h-4 text-cyan-400" /> Manage Subscription
                                                </Button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ) : (
                                    <Card className="bg-[#111827]/60 backdrop-blur-xl border border-white/[0.06] text-left shadow-[0_4px_30px_rgba(0,0,0,0.2)] rounded-2xl overflow-hidden hover:border-cyan-400/20 hover:shadow-[0_0_30px_rgba(6,182,212,0.03)] transition-all duration-300">
                                        <CardHeader className="pb-4 border-b border-white/[0.04] relative">
                                            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-indigo-500/5 to-violet-500/5 rounded-full blur-3xl pointer-events-none" />
                                            <div className="flex items-center gap-2.5">
                                                <div className="p-2 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
                                                    <Crown className="w-4 h-4 text-indigo-400" />
                                                </div>
                                                <div>
                                                    <CardTitle className="text-md font-bold text-white/90">Premium Tier</CardTitle>
                                                    <CardDescription className="text-xs text-[#94A3B8] mt-0.5">Upgrade to unlock Heatmaps, Multi-Category Trajectories and Alerts.</CardDescription>
                                                </div>
                                            </div>
                                        </CardHeader>
                                        <CardContent className="pt-6 space-y-6">
                                            <div className="bg-gradient-to-tr from-[#6366F1]/5 via-transparent to-transparent border border-[#6366F1]/10 p-5 rounded-2xl space-y-4">
                                                <div className="flex items-center gap-2 text-sm font-bold text-indigo-400">
                                                    <Crown className="w-4 h-4 fill-current animate-pulse" />
                                                    <span>Upgrade to SmartSpend Pro</span>
                                                </div>
                                                <p className="text-xs text-[#94A3B8] leading-relaxed">
                                                    Get predictive analysis warnings, premium Heatmaps, customized monthly presets, and remove limits for only <strong>$5.99/mo</strong>.
                                                </p>
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs text-[#94A3B8]">
                                                    <div className="flex items-center gap-2">
                                                        <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
                                                        <span>Predictive AI Alerts</span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
                                                        <span>Premium Interactive Heatmaps</span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
                                                        <span>Unlimited Custom Presets</span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
                                                        <span>Multi-Category Trajectories</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2 border-t border-white/[0.04]">
                                                <div className="text-left">
                                                    <span className="text-2xl font-black text-white">$5.99</span>
                                                    <span className="text-xs text-[#94A3B8]"> / month</span>
                                                </div>
                                                <Button
                                                    onClick={handleUpgradeToPro}
                                                    isLoading={stripeLoading}
                                                    className="w-full sm:w-auto flex items-center justify-center gap-2 text-xs font-bold h-11 bg-gradient-to-r from-cyan-500 via-violet-500 to-pink-500 hover:opacity-90 text-white shadow-[0_0_30px_rgba(139,92,246,0.25)] hover:shadow-[0_0_40px_rgba(139,92,246,0.4)] transition-all duration-300 font-extrabold rounded-xl border border-white/[0.08] px-6"
                                                >
                                                    <Sparkles className="w-4 h-4 text-warning" /> Upgrade to Pro
                                                </Button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                )}
                            </motion.div>
                        )}

                        {/* TAB PANEL: Account Security */}
                        {activeTab === "security" && (
                            <motion.div
                                key="security"
                                initial={{ opacity: 0, y: 15 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -15 }}
                                transition={{ type: "spring", stiffness: 400, damping: 25 }}
                                className="space-y-6"
                            >
                                <Card className="bg-[#111827]/60 backdrop-blur-xl border border-white/[0.06] text-left shadow-[0_4px_30px_rgba(0,0,0,0.2)] rounded-2xl overflow-hidden hover:border-cyan-400/20 hover:shadow-[0_0_30px_rgba(6,182,212,0.03)] transition-all duration-300">
                                    <CardHeader className="pb-4 border-b border-white/[0.04]">
                                        <div className="flex items-center gap-2.5">
                                            <div className="p-2 rounded-lg bg-pink-500/10 border border-pink-500/20 text-pink-400">
                                                <Lock className="w-4 h-4" />
                                            </div>
                                            <div>
                                                <CardTitle className="text-md font-bold text-white/90">Account Security</CardTitle>
                                                <CardDescription className="text-xs text-[#94A3B8] mt-0.5 font-medium">Keep credentials secure with periodic updates.</CardDescription>
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="pt-6">
                                        <form onSubmit={handlePasswordSubmit} className="space-y-5">
                                            <div className="relative">
                                                <Input
                                                    label="Current Password"
                                                    placeholder="••••••••"
                                                    type={showCurrentPassword ? "text" : "password"}
                                                    value={currentPassword}
                                                    onChange={(e) => setCurrentPassword(e.target.value)}
                                                    error={passwordErrors.currentPassword}
                                                    className="bg-[#0A0E1A]/40 border-white/[0.06] focus:border-cyan-400/50 text-white placeholder-white/20 h-11 pr-12"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                                    className="absolute right-3.5 top-[38px] text-muted-foreground hover:text-white p-1.5 rounded transition-colors cursor-pointer outline-none"
                                                >
                                                    {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                                </button>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                                <div className="relative">
                                                    <Input
                                                        label="New Password"
                                                        placeholder="Min. 6 characters"
                                                        type={showNewPassword ? "text" : "password"}
                                                        value={newPassword}
                                                        onChange={(e) => setNewPassword(e.target.value)}
                                                        error={passwordErrors.newPassword}
                                                        className="bg-[#0A0E1A]/40 border-white/[0.06] focus:border-cyan-400/50 text-white placeholder-white/20 h-11 pr-12"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => setShowNewPassword(!showNewPassword)}
                                                        className="absolute right-3.5 top-[38px] text-muted-foreground hover:text-white p-1.5 rounded transition-colors cursor-pointer outline-none"
                                                    >
                                                        {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                                    </button>
                                                </div>
                                                <Input
                                                    label="Confirm New Password"
                                                    placeholder="••••••••"
                                                    type="password"
                                                    value={confirmNewPassword}
                                                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                                                    error={passwordErrors.confirmNewPassword}
                                                    className="bg-[#0A0E1A]/40 border-white/[0.06] focus:border-cyan-400/50 text-white placeholder-white/20 h-11"
                                                />
                                            </div>
                                            <div className="flex justify-end pt-4 border-t border-white/[0.04]">
                                                <Button type="submit" isLoading={passwordSubmitting} className="px-5 h-10 font-bold bg-[#F1F5F9] text-[#0A0E1A] hover:bg-white flex items-center gap-1.5 shadow-[0_4px_20px_rgba(255,255,255,0.08)] rounded-xl">
                                                    <Lock className="w-4 h-4 mr-1.5" /> Change Password
                                                </Button>
                                            </div>
                                        </form>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        )}

                        {/* TAB PANEL: Danger Zone */}
                        {activeTab === "danger" && (
                            <motion.div
                                key="danger"
                                initial={{ opacity: 0, y: 15 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -15 }}
                                transition={{ type: "spring", stiffness: 400, damping: 25 }}
                                className="space-y-6"
                            >
                                <Card className="bg-[#111827]/60 backdrop-blur-xl border border-red-500/30 shadow-[0_0_30px_rgba(239,68,68,0.04)] rounded-2xl overflow-hidden relative">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/[0.03] rounded-full blur-3xl pointer-events-none" />
                                    
                                    <CardHeader className="pb-4 border-b border-red-500/[0.08]">
                                        <div className="flex items-center gap-2.5">
                                            <div className="p-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400">
                                                <AlertTriangle className="w-5 h-5 animate-pulse" />
                                            </div>
                                            <div>
                                                <CardTitle className="text-md font-bold text-red-400">Danger Zone</CardTitle>
                                                <CardDescription className="text-xs text-red-300 mt-0.5 font-medium">High-risk actions containing irreversible operations.</CardDescription>
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="p-6 space-y-6">
                                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-red-500/10 border border-red-500/30 p-5 rounded-2xl shadow-[0_0_15px_rgba(239,68,68,0.02)]">
                                            <div className="space-y-1.5 max-w-lg">
                                                <h4 className="text-sm font-bold text-red-200">Permanently Delete Account</h4>
                                                <p className="text-xs text-[#94A3B8] leading-relaxed">
                                                    Erase transaction tables, budget alert records, historical categories database, and deactivate subscriptions instantly. This is irreversible.
                                                </p>
                                            </div>
                                            <Button
                                                variant="danger"
                                                size="sm"
                                                onClick={() => {
                                                    setDeleteConfirmationText("");
                                                    setIsDeleteModalOpen(true);
                                                }}
                                                className="shrink-0 flex items-center gap-1.5 font-bold px-4 py-2.5 h-10 rounded-xl outline-none"
                                            >
                                                <Trash2 className="w-4 h-4" /> Delete Account
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        )}

                    </AnimatePresence>
                </div>

            </div>

            {/* Custom Account Deletion confirmation modal */}
            <Modal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                title="Irreversible Account Deletion"
                description="This action will permanently delete your account, transaction histories, custom categories, and end subscriptions. It cannot be undone."
                className="border-red-500/20 max-w-md bg-[#0A0E1A]/95 backdrop-blur-2xl"
            >
                <div className="space-y-5 text-left">
                    <div className="bg-red-500/10 border border-red-500/30 p-4 rounded-xl flex gap-3 text-red-300 items-start shadow-[0_0_15px_rgba(239,68,68,0.05)]">
                        <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5 text-red-400" />
                        <div className="text-xs leading-relaxed space-y-1">
                            <span className="font-bold text-red-200">Important Notice:</span>
                            <p className="text-red-300/90">
                                After execution, your database documents will be scheduled for soft deletion and archived, removing all dashboard panels. You will be signed out immediately.
                            </p>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-[#94A3B8] block">
                            Type <span className="font-mono bg-red-500/20 text-red-300 px-1.5 py-0.5 rounded font-black">DELETE</span> to confirm:
                        </label>
                        <input
                            type="text"
                            placeholder="Type DELETE..."
                            value={deleteConfirmationText}
                            onChange={(e) => setDeleteConfirmationText(e.target.value)}
                            className="h-11 w-full rounded-xl border border-red-500/30 bg-[#0A0E1A]/40 px-3.5 text-sm text-[#F1F5F9] placeholder-white/20 focus:outline-none focus:border-red-500/50 focus:ring-2 focus:ring-red-500/10 transition-all font-bold"
                        />
                    </div>

                    <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/[0.06]">
                        <Button
                            variant="ghost"
                            onClick={() => setIsDeleteModalOpen(false)}
                            className="text-muted-foreground hover:text-white"
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="danger"
                            onClick={handleDeleteAccount}
                            disabled={deleteConfirmationText !== "DELETE" || deleteSubmitting}
                            isLoading={deleteSubmitting}
                            className="px-6 font-bold bg-red-500 hover:bg-red-600 text-white hover:shadow-[0_0_20px_rgba(239,68,68,0.2)]"
                        >
                            Confirm Deletion
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}
