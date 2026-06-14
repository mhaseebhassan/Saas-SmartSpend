"use client";

import React from "react";
import { Button } from "@/components/ui/Button";
import { AlertOctagon, RotateCcw } from "lucide-react";
import { motion } from "framer-motion";

interface ErrorBoundaryProps {
    children: React.ReactNode;
    onReset?: () => void;
}

interface ErrorBoundaryState {
    hasError: boolean;
    error: Error | null;
}

export default class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
    constructor(props: ErrorBoundaryProps) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error): ErrorBoundaryState {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        console.error("ErrorBoundary caught an error:", error, errorInfo);
    }

    private renderStackTrace(stack: string) {
        const lines = stack.split("\n");
        return lines.map((line, idx) => {
            const trimmed = line.trim();
            if (trimmed.startsWith("at ")) {
                // It's a stack frame line
                // Check if it has a function name and file path in parentheses
                const parenMatch = trimmed.match(/^at\s+(.+?)\s*\((.+?)\)$/);
                if (parenMatch) {
                    const [, funcName, fileInfo] = parenMatch;
                    const fileInfoParts = fileInfo.split(":");
                    let lineCol = "";
                    let filePath = fileInfo;
                    
                    if (fileInfoParts.length >= 2) {
                        const col = fileInfoParts.pop();
                        const ln = fileInfoParts.pop();
                        if (ln && !isNaN(Number(ln)) && col && !isNaN(Number(col))) {
                            lineCol = `:${ln}:${col}`;
                            filePath = fileInfoParts.join(":");
                        } else if (ln && !isNaN(Number(ln))) {
                            lineCol = `:${ln}`;
                            filePath = [...fileInfoParts, col].join(":");
                        } else {
                            fileInfoParts.push(ln!, col!);
                        }
                    }
                    
                    return (
                        <div key={idx} className="pl-4 py-0.5 border-l border-red-500/10 hover:bg-white/[0.02] transition-colors leading-relaxed font-mono whitespace-nowrap text-[9px]">
                            <span className="text-red-400/60 mr-1.5 font-medium">at</span>
                            <span className="text-cyan-300 font-semibold">{funcName}</span>
                            <span className="text-white/30 mx-1">(</span>
                            <span className="text-slate-300/80">{filePath}</span>
                            {lineCol && <span className="text-gray-400 font-bold">{lineCol}</span>}
                            <span className="text-white/30">)</span>
                        </div>
                    );
                }
                
                // Simple 'at filePath:line:col' or similar without function name
                const simpleMatch = trimmed.match(/^at\s+(.+)$/);
                if (simpleMatch) {
                    const [, fileInfo] = simpleMatch;
                    const fileInfoParts = fileInfo.split(":");
                    let lineCol = "";
                    let filePath = fileInfo;
                    
                    if (fileInfoParts.length >= 2) {
                        const col = fileInfoParts.pop();
                        const ln = fileInfoParts.pop();
                        if (ln && !isNaN(Number(ln)) && col && !isNaN(Number(col))) {
                            lineCol = `:${ln}:${col}`;
                            filePath = fileInfoParts.join(":");
                        } else if (ln && !isNaN(Number(ln))) {
                            lineCol = `:${ln}`;
                            filePath = [...fileInfoParts, col].join(":");
                        } else {
                            fileInfoParts.push(ln!, col!);
                        }
                    }
                    
                    return (
                        <div key={idx} className="pl-4 py-0.5 border-l border-red-500/10 hover:bg-white/[0.02] transition-colors leading-relaxed font-mono whitespace-nowrap text-[9px]">
                            <span className="text-red-400/60 mr-1.5 font-medium">at</span>
                            <span className="text-slate-300/80">{filePath}</span>
                            {lineCol && <span className="text-gray-400 font-bold">{lineCol}</span>}
                        </div>
                    );
                }
            }
            
            // Otherwise, it's the main error line or standard trace line
            return (
                <div key={idx} className="font-semibold text-red-200/95 py-1 select-text border-b border-red-500/10 mb-2 pb-1.5 whitespace-pre-wrap break-all leading-normal text-[10px]">
                    {line}
                </div>
            );
        });
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="w-full p-1">
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ type: "spring", stiffness: 300, damping: 25 }}
                        className="flex min-h-[320px] w-full flex-col items-center justify-center rounded-2xl border border-red-500/20 bg-[#0A0E1A]/80 backdrop-blur-2xl p-6 md:p-8 text-center select-none relative overflow-hidden shadow-[inset_0_0_24px_rgba(239,68,68,0.03),_0_20px_40px_rgba(0,0,0,0.4)]"
                    >
                        {/* Dark neon warning background glow */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-red-500/10 rounded-full blur-[90px] pointer-events-none" />

                        {/* Corner accent glow lines */}
                        <div className="absolute top-0 left-0 w-16 h-[1px] bg-gradient-to-r from-red-500/30 to-transparent" />
                        <div className="absolute top-0 left-0 w-[1px] h-16 bg-gradient-to-b from-red-500/30 to-transparent" />

                        {/* Glowing warning octagon container */}
                        <div className="relative w-16 h-16 bg-red-500/10 rounded-2xl flex items-center justify-center text-red-500 mb-5 border border-red-500/30 shadow-[0_0_30px_rgba(239,68,68,0.25)] overflow-hidden">
                            {/* Pulse glow background layer */}
                            <div className="absolute inset-0 bg-gradient-to-br from-red-500/20 to-transparent animate-pulse -z-10" />
                            <AlertOctagon className="w-8 h-8 text-red-400 drop-shadow-[0_0_8px_rgba(239,68,68,0.8)] animate-pulse" />
                        </div>

                        <h3 className="text-base font-bold text-white tracking-tight drop-shadow-[0_0_12px_rgba(255,255,255,0.1)]">
                            Section Loading Failed
                        </h3>
                        
                        <p className="text-xs text-[#94A3B8] max-w-sm mt-2 leading-relaxed">
                            An error occurred while loading this section of the page.
                        </p>

                        {this.state.error && (
                            <motion.pre 
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.15 }}
                                className="mt-4 w-full max-w-[calc(100vw-4rem)] md:max-w-xl max-h-60 overflow-auto rounded-xl bg-black/75 backdrop-blur-md p-4 text-[10px] font-mono text-red-300 border border-red-500/20 shadow-[inset_0_0_15px_rgba(239,68,68,0.08)] text-left"
                            >
                                <div className="text-[9px] text-red-400/60 uppercase font-semibold tracking-wider mb-2 border-b border-red-500/10 pb-1 flex items-center justify-between">
                                    <span>Stack Trace / Error Message</span>
                                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />
                                </div>
                                <div className="space-y-0.5 overflow-x-auto">
                                    {this.state.error.stack ? (
                                        this.renderStackTrace(this.state.error.stack)
                                    ) : (
                                        <div className="font-semibold text-red-200/95 py-1 select-text leading-normal text-[10px]">
                                            {this.state.error.message || String(this.state.error)}
                                        </div>
                                    )}
                                </div>
                            </motion.pre>
                        )}

                        <div className="mt-6">
                            <Button
                                size="sm"
                                onClick={() => {
                                    this.setState({ hasError: false, error: null });
                                    if (this.props.onReset) this.props.onReset();
                                }}
                                className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-slate-400 text-white font-semibold flex items-center gap-2 border-0 shadow-[0_0_20px_rgba(6,182,212,0.4)] hover:shadow-[0_0_25px_rgba(139,92,246,0.6)] hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 px-5 py-2.5 rounded-xl group"
                            >
                                <RotateCcw className="w-3.5 h-3.5 transition-transform duration-500 group-hover:rotate-180" />
                                Try Again
                            </Button>
                        </div>
                    </motion.div>
                </div>
            );
        }

        return this.props.children;
    }
}
