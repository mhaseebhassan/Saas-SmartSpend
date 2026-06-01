/**
 * Midnight Aurora Design Tokens
 * Deep space + aurora gradient fintech design system
 */

export const colors = {
    // Backgrounds & Surfaces (deepest → most elevated)
    background: {
        deep: "#05070F",         // Deepest — sidebar, body
        default: "#0A0E1A",      // Main content area
        surface: "#111827",      // Card/panel surfaces
        elevated: "#1A2035",     // Elevated surfaces, hover states
        overlay: "#0A0E1A",      // Overlay/modal backgrounds
    },

    // Borders & Dividers
    border: {
        default: "rgba(255, 255, 255, 0.06)",
        subtle: "rgba(255, 255, 255, 0.04)",
        hover: "rgba(255, 255, 255, 0.1)",
        focus: "rgba(6, 182, 212, 0.5)",
        glow: "rgba(6, 182, 212, 0.2)",
    },

    // Aurora Gradient Colors
    aurora: {
        teal: "#06B6D4",
        purple: "#8B5CF6",
        pink: "#EC4899",
        blue: "#3B82F6",
        gradient: "linear-gradient(135deg, #06B6D4, #8B5CF6, #EC4899)",
    },

    // Primary — Aurora Teal
    primary: {
        DEFAULT: "#06B6D4",
        hover: "#0891B2",
        light: "#22D3EE",
        glow: "rgba(6, 182, 212, 0.15)",
    },

    // Status Colors
    success: {
        DEFAULT: "#10B981",
        hover: "#059669",
        light: "#34D399",
        glow: "rgba(16, 185, 129, 0.15)",
    },
    warning: {
        DEFAULT: "#F59E0B",
        hover: "#D97706",
        light: "#FBBF24",
        glow: "rgba(245, 158, 11, 0.15)",
    },
    danger: {
        DEFAULT: "#EF4444",
        hover: "#DC2626",
        light: "#F87171",
        glow: "rgba(239, 68, 68, 0.15)",
    },

    // Text Colors
    text: {
        primary: "#F1F5F9",      // Slate-100
        secondary: "#94A3B8",    // Slate-400
        tertiary: "#64748B",     // Slate-500
        disabled: "#475569",     // Slate-600
        inverse: "#05070F",      // Deep space
    },

    // Chart Colors — Aurora Palette
    chart: [
        "#06B6D4",  // Teal
        "#8B5CF6",  // Purple
        "#EC4899",  // Pink
        "#3B82F6",  // Blue
        "#10B981",  // Emerald
        "#F59E0B",  // Amber
        "#F97316",  // Orange
        "#6366F1",  // Indigo
    ],
};

export const spacing = {
    px: "1px",
    0: "0px",
    0.5: "0.125rem",
    1: "0.25rem",
    1.5: "0.375rem",
    2: "0.5rem",
    2.5: "0.625rem",
    3: "0.75rem",
    3.5: "0.875rem",
    4: "1rem",
    5: "1.25rem",
    6: "1.5rem",
    7: "1.75rem",
    8: "2rem",
    9: "2.25rem",
    10: "2.5rem",
    12: "3rem",
    14: "3.5rem",
    16: "4rem",
    20: "5rem",
    24: "6rem",
};

export const typography = {
    fontFamily: {
        sans: 'var(--font-sans, "Inter", ui-sans-serif, system-ui, sans-serif)',
        mono: 'var(--font-mono, ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace)',
    },
    fontSize: {
        xs: "0.75rem",
        sm: "0.875rem",
        base: "1rem",
        lg: "1.125rem",
        xl: "1.25rem",
        "2xl": "1.5rem",
        "3xl": "1.875rem",
        "4xl": "2.25rem",
        "5xl": "3rem",
        "6xl": "3.75rem",
    },
    fontWeight: {
        light: "300",
        normal: "400",
        medium: "500",
        semibold: "600",
        bold: "700",
        extrabold: "800",
        black: "900",
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
