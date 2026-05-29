/**
 * Design Tokens for SmartSpend SaaS Application
 * High-end premium design system tokens including color palette, spacing, and typography scales.
 */

export const colors = {
    // Backgrounds & Surfaces
    background: {
        default: "#0F1117",      // Deep slate background
        card: "#1A1D2E",         // Card surface background
        popover: "#121420",      // Popover / Tooltip background
    },
    
    // Borders & Dividers
    border: {
        default: "#2A2D3E",      // Subtle card/input border
        hover: "#3A3E56",       // Interactive border hover state
        focus: "#6366F1",       // Focus ring / primary highlight
    },

    // Accents & Brand
    primary: {
        DEFAULT: "#6366F1",     // Indigo-500
        hover: "#4F46E5",       // Indigo-600
        light: "#818CF8",       // Indigo-400
        glow: "rgba(99, 102, 241, 0.15)",
    },

    // Status Colors
    success: {
        DEFAULT: "#10B981",     // Emerald-500
        hover: "#059669",
        light: "#34D399",
        glow: "rgba(16, 185, 129, 0.15)",
    },
    warning: {
        DEFAULT: "#F59E0B",     // Amber-500
        hover: "#D97706",
        light: "#FBBF24",
        glow: "rgba(245, 158, 11, 0.15)",
    },
    danger: {
        DEFAULT: "#EF4444",     // Red-500
        hover: "#DC2626",
        light: "#F87171",
        glow: "rgba(239, 68, 68, 0.15)",
    },

    // Text Colors
    text: {
        primary: "#F3F4F6",     // Gray-100
        secondary: "#9CA3AF",   // Gray-400
        muted: "#6B7280",       // Gray-500
        disabled: "#4B5563",    // Gray-600
        inverse: "#0F1117",     // Dark slate
    }
};

export const spacing = {
    px: "1px",
    0: "0px",
    0.5: "0.125rem",  // 2px
    1: "0.25rem",     // 4px
    1.5: "0.375rem",   // 6px
    2: "0.5rem",       // 8px
    2.5: "0.625rem",   // 10px
    3: "0.75rem",      // 12px
    3.5: "0.875rem",   // 14px
    4: "1rem",         // 16px
    5: "1.25rem",      // 20px
    6: "1.5rem",       // 24px
    7: "1.75rem",      // 28px
    8: "2rem",         // 32px
    9: "2.25rem",      // 36px
    10: "2.5rem",      // 40px
    12: "3rem",        // 48px
    14: "3.5rem",      // 56px
    16: "4rem",        // 64px
    20: "5rem",        // 80px
    24: "6rem",        // 96px
};

export const typography = {
    fontFamily: {
        sans: 'var(--font-sans, ui-sans-serif, system-ui, sans-serif)',
        mono: 'var(--font-mono, ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace)',
    },
    fontSize: {
        xs: "0.75rem",      // 12px
        sm: "0.875rem",     // 14px
        base: "1rem",       // 16px
        lg: "1.125rem",     // 18px
        xl: "1.25rem",      // 20px
        "2xl": "1.5rem",    // 24px
        "3xl": "1.875rem",  // 30px
        "4xl": "2.25rem",   // 36px
        "5xl": "3rem",      // 48px
    },
    fontWeight: {
        light: "300",
        normal: "400",
        medium: "500",
        semibold: "600",
        bold: "700",
        extrabold: "800",
    },
    lineHeight: {
        none: "1",
        tight: "1.25",
        snug: "1.375",
        normal: "1.5",
        relaxed: "1.625",
        loose: "2",
    }
};

const designTokens = {
    colors,
    spacing,
    typography
};

export default designTokens;
