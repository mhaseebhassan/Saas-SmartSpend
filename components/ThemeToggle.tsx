"use client";

import * as React from "react";
import { Moon, Sparkles } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/Button";
import { motion } from "framer-motion";

export function ThemeToggle() {
    const { setTheme } = useTheme();

    // Ensure theme is always set to dark
    React.useEffect(() => {
        setTheme("dark");
    }, [setTheme]);

    return (
        <div className="relative group">
            <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
            >
                <Button
                    variant="ghost"
                    size="icon"
                    className="relative rounded-full w-10 h-10 border border-white/[0.06] bg-[#111827]/60 backdrop-blur-xl text-cyan-400 hover:text-cyan-300 hover:border-cyan-400/20 hover:shadow-[0_0_15px_rgba(6,182,212,0.2)] transition-all duration-300"
                >
                    <Moon className="h-[1.2rem] w-[1.2rem] text-cyan-400 group-hover:text-purple-400 transition-colors duration-300" />
                    <Sparkles className="absolute -top-1 -right-1 w-3 h-3 text-pink-500 animate-pulse" />
                    <span className="sr-only">Midnight Aurora theme active</span>
                </Button>
            </motion.div>
            
            {/* Tooltip on hover */}
            <div className="absolute right-0 top-12 opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-300 z-50">
                <div className="bg-[#0A0E1A]/90 border border-white/[0.06] backdrop-blur-md text-[10px] text-white px-2.5 py-1.5 rounded-xl shadow-2xl whitespace-nowrap">
                    Midnight Aurora Active 🌌
                </div>
            </div>
        </div>
    );
}
