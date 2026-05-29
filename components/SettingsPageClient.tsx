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

// Floating Confetti Particle Component
const ConfettiParticle = ({ delay }) => {
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
    const [categories, setCategories] = React.useState([]);
    const [preferencesLoading, setPreferencesLoading] = React.useState(true);

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
    const [passwordErrors, setPasswordErrors] = React.useState({});

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
    const handleProfileSubmit = async (e) => {
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
    const handlePasswordSubmit = async (e) => {
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
    const handlePrefsSubmit = async (e) => {
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

    return (
        <div className="space-y-6 text-left select-none relative w-full">
            {/* Confetti floating layout */}
            {showConfetti && (
                <div className="absolute inset-0 pointer-events-none overflow-hidden z-50">
                    {Array.from({ length: 80 }).map((_, i) => (
                        <ConfettiParticle key={i} delay={i * 0.04} />
                    ))}
                </div>
            )}

            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold tracking-tight text-white/95">Account Settings</h1>
                <p className="text-xs text-muted-foreground">Manage profile info, active subscription plans, defaults, and security configurations.</p>
            </div>

            {/* Two-Column Responsive Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Left side: Profile Photo Block + Plans & Billing (Col span 1) */}
                <div className="space-y-6 lg:col-span-1">
                    
                    {/* User profile details box */}
                    <Card className="bg-card/40 border-white/5 overflow-hidden text-center p-6 relative">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
                        <div className="flex flex-col items-center space-y-4">
                            {/* Avatar initials with hover spotlight pulse */}
                            <motion.div
                                whileHover={{ scale: 1.05 }}
                                className="w-20 h-20 rounded-full bg-gradient-to-tr from-primary to-indigo-400 flex items-center justify-center text-white font-extrabold text-2xl shadow-lg shadow-primary/20 border-2 border-white/10 relative group cursor-pointer"
                            >
                                <span className="relative z-10">{initials}</span>
                                <div className="absolute -inset-0.5 rounded-full bg-primary/30 blur opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                            </motion.div>

                            <div className="space-y-1">
                                <h3 className="text-lg font-bold text-white tracking-tight">{profileName || "SmartSpend User"}</h3>
                                <p className="text-xs text-muted-foreground font-mono">{profileEmail}</p>
                            </div>

                            {/* Plan Pill indicator */}
                            {isProUser ? (
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-warning/10 border border-warning/30 text-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.08)]">
                                    <Crown className="w-3.5 h-3.5 fill-current" /> Pro Plan
                                </span>
                            ) : (
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider bg-white/5 border border-white/10 text-muted-foreground">
                                    Free Plan
                                </span>
                            )}
                        </div>
                    </Card>

                    {/* Subscription & Stripe Portal Control card */}
                    <Card className="bg-card/40 border-white/5 relative overflow-hidden">
                        <CardHeader className="pb-3 text-left">
                            <CardTitle className="text-sm font-bold text-white/90">Premium Tier</CardTitle>
                            <CardDescription>Upgrade to unlock Heatmaps, Multi-Category Trajectories and Alerts.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4 text-left">
                            {isProUser ? (
                                <div className="space-y-4">
                                    <div className="bg-white/5 border border-white/5 p-4 rounded-xl space-y-2">
                                        <div className="flex items-center gap-2 text-xs font-bold text-white">
                                            <CheckCircle2 className="w-4 h-4 text-success" />
                                            <span>Full Access Enabled</span>
                                        </div>
                                        <p className="text-[11px] text-muted-foreground leading-relaxed">
                                            Your account currently utilizes all SmartSpend premium analysis features. Management of billing and plans is processed securely in your Stripe customer dashboard.
                                        </p>
                                    </div>
                                    <Button
                                        onClick={handleManageBilling}
                                        isLoading={stripeLoading}
                                        className="w-full flex items-center justify-center gap-2 text-xs font-bold h-11"
                                    >
                                        <Shield className="w-4 h-4" /> Manage Subscription
                                    </Button>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <div className="bg-[#6366F1]/5 border border-[#6366F1]/10 p-4 rounded-xl space-y-2">
                                        <div className="flex items-center gap-2 text-xs font-bold text-indigo-400">
                                            <Crown className="w-4 h-4 fill-current animate-pulse" />
                                            <span>Upgrade to SmartSpend Pro</span>
                                        </div>
                                        <p className="text-[11px] text-muted-foreground leading-relaxed">
                                            Get predictive analysis warnings, premium Heatmaps, customized monthly presets, and remove limits for only <strong>$5.99/mo</strong>.
                                        </p>
                                    </div>
                                    <Button
                                        onClick={handleUpgradeToPro}
                                        isLoading={stripeLoading}
                                        className="w-full flex items-center justify-center gap-2 text-xs font-bold bg-primary text-white h-11 shadow-indigo-500/20 hover:shadow-indigo-500/35"
                                    >
                                        <Sparkles className="w-4 h-4 text-warning" /> Upgrade to Pro
                                    </Button>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                </div>

                {/* Right side: Detailed forms Profile name, system settings, security, and danger zone (Col span 2) */}
                <div className="space-y-6 lg:col-span-2">
                    
                    {/* General profile form */}
                    <Card className="bg-card/40 border-white/5 text-left">
                        <CardHeader>
                            <CardTitle className="text-md font-bold text-white/90">Profile Details</CardTitle>
                            <CardDescription>Configure primary display parameters and communications.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleProfileSubmit} className="space-y-5">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <Input
                                        label="Display Name"
                                        placeholder="e.g. John Doe"
                                        value={profileName}
                                        onChange={(e) => setProfileName(e.target.value)}
                                        required
                                    />
                                    <div className="relative">
                                        <Input
                                            label="Email Address"
                                            value={profileEmail}
                                            disabled
                                            helperText="Account emails are locked for validation constraints."
                                        />
                                        <Lock className="w-3.5 h-3.5 text-muted-foreground/60 absolute right-3 top-10" />
                                    </div>
                                </div>
                                <div className="flex justify-end pt-2">
                                    <Button type="submit" isLoading={profileSubmitting} className="px-5">
                                        <Check className="w-4 h-4 mr-1.5" /> Save Changes
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>

                    {/* System preferences form */}
                    <Card className="bg-card/40 border-white/5 text-left">
                        <CardHeader>
                            <CardTitle className="text-md font-bold text-white/90">System Preferences</CardTitle>
                            <CardDescription>Customize localizations, date visual grids, and default categories.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {preferencesLoading ? (
                                <div className="py-12 flex justify-center items-center gap-2">
                                    <Loader2 className="w-5 h-5 text-primary animate-spin" />
                                    <span className="text-xs text-muted-foreground">Syncing settings preferences...</span>
                                </div>
                            ) : (
                                <form onSubmit={handlePrefsSubmit} className="space-y-5">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        {/* Currency */}
                                        <Select
                                            label="Base Currency"
                                            value={currency}
                                            onChange={(e) => setCurrency(e.target.value)}
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
                                        >
                                            <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                                            <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                                        </Select>

                                        {/* Default Category */}
                                        <Select
                                            label="Default Category"
                                            value={defaultCategory}
                                            onChange={(e) => setDefaultCategory(e.target.value)}
                                        >
                                            <option value="">None / Uncategorized</option>
                                            {categories.map(cat => (
                                                <option key={cat._id} value={cat._id}>{cat.name}</option>
                                            ))}
                                        </Select>
                                    </div>
                                    <div className="flex justify-end pt-2">
                                        <Button type="submit" isLoading={prefsSubmitting} className="px-5">
                                            <Check className="w-4 h-4 mr-1.5" /> Save Preferences
                                        </Button>
                                    </div>
                                </form>
                            )}
                        </CardContent>
                    </Card>

                    {/* Change Password Security collapsible details */}
                    <Card className="bg-card/40 border-white/5 text-left">
                        <CardHeader>
                            <CardTitle className="text-md font-bold text-white/90">Account Security</CardTitle>
                            <CardDescription>Keep credentials secure with periodic updates.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handlePasswordSubmit} className="space-y-5">
                                <div className="relative">
                                    <Input
                                        label="Current Password"
                                        placeholder="••••••••"
                                        type={showCurrentPassword ? "text" : "password"}
                                        value={currentPassword}
                                        onChange={(e) => setCurrentPassword(e.target.value)}
                                        error={passwordErrors.currentPassword}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                        className="absolute right-3.5 top-[38px] text-muted-foreground hover:text-white p-1 rounded transition-colors cursor-pointer"
                                    >
                                        {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="relative">
                                        <Input
                                            label="New Password"
                                            placeholder="Min. 6 characters"
                                            type={showNewPassword ? "text" : "password"}
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            error={passwordErrors.newPassword}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowNewPassword(!showNewPassword)}
                                            className="absolute right-3.5 top-[38px] text-muted-foreground hover:text-white p-1 rounded transition-colors cursor-pointer"
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
                                    />
                                </div>
                                <div className="flex justify-end pt-2">
                                    <Button type="submit" isLoading={passwordSubmitting} className="px-5">
                                        <Lock className="w-4 h-4 mr-1.5" /> Change Password
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>

                    {/* Danger Zone account removal section */}
                    <Card className="border-red-500/25 bg-red-500/[0.02] shadow-[0_0_20px_rgba(239,68,68,0.02)] text-left">
                        <CardHeader>
                            <CardTitle className="text-md font-bold text-red-400">Danger Zone</CardTitle>
                            <CardDescription className="text-red-400/80">High-risk actions containing irreversible operations.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-red-500/[0.03] border border-red-500/10 p-4 rounded-xl">
                                <div className="space-y-1">
                                    <h4 className="text-xs font-bold text-white">Permanently Delete Account</h4>
                                    <p className="text-[11px] text-muted-foreground max-w-md leading-relaxed">
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
                                    className="shrink-0 flex items-center gap-1.5"
                                >
                                    <Trash2 className="w-3.5 h-3.5" /> Delete Account
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                </div>

            </div>

            {/* Custom Account Deletion confirmation modal */}
            <Modal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                title="Irreversible Account Deletion"
                description="This action will permanently delete your account, transaction histories, custom categories, and end subscriptions. It cannot be undone."
                className="border-red-500/20 max-w-md"
            >
                <div className="space-y-5 text-left">
                    <div className="bg-red-500/10 border border-red-500/25 p-4 rounded-xl flex gap-3 text-red-400 items-start">
                        <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
                        <div className="text-xs leading-relaxed space-y-1">
                            <span className="font-bold">Important Notice:</span>
                            <p className="text-red-400/85">
                                After execution, your database documents will be scheduled for soft deletion and archived, removing all dashboard panels. You will be signed out immediately.
                            </p>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-300 block">
                            Type <span className="font-mono bg-red-500/20 text-red-300 px-1.5 py-0.5 rounded font-black">DELETE</span> to confirm:
                        </label>
                        <input
                            type="text"
                            placeholder="Type DELETE..."
                            value={deleteConfirmationText}
                            onChange={(e) => setDeleteConfirmationText(e.target.value)}
                            className="h-11 w-full rounded-xl border border-red-500/20 bg-secondary/30 px-3.5 text-sm text-foreground focus:outline-none focus:border-red-500/50 focus:ring-2 focus:ring-red-500/10 transition-all font-bold"
                        />
                    </div>

                    <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/5">
                        <Button
                            variant="ghost"
                            onClick={() => setIsDeleteModalOpen(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="danger"
                            onClick={handleDeleteAccount}
                            disabled={deleteConfirmationText !== "DELETE" || deleteSubmitting}
                            isLoading={deleteSubmitting}
                            className="px-6 font-bold"
                        >
                            Confirm Deletion
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}
