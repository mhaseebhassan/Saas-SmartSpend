"use client";

import React from "react";
import { Button } from "@/components/ui/Button";
import { AlertOctagon, RotateCcw } from "lucide-react";

export default class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error("ErrorBoundary caught an error:", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="flex min-h-[300px] w-full flex-col items-center justify-center rounded-2xl border border-red-500/20 bg-[#EF4444]/5 p-6 text-center select-none">
                    <div className="w-12 h-12 bg-red-500/10 rounded-xl flex items-center justify-center text-red-500 mb-3 border border-red-500/20">
                        <AlertOctagon className="w-6 h-6 animate-bounce" />
                    </div>
                    <h3 className="text-sm font-bold text-white tracking-tight">Section Loading Failed</h3>
                    <p className="text-xs text-[#9CA3AF] max-w-sm mt-1 leading-relaxed">
                        An error occurred while loading this section of the page.
                    </p>
                    {this.state.error && (
                        <pre className="mt-3 max-w-xs md:max-w-md overflow-x-auto rounded-lg bg-black/40 p-2.5 text-[10px] font-mono text-red-300 text-left border border-white/5">
                            {this.state.error.message || String(this.state.error)}
                        </pre>
                    )}
                    <div className="mt-4">
                        <Button
                            size="sm"
                            onClick={() => {
                                this.setState({ hasError: false, error: null });
                                if (this.props.onReset) this.props.onReset();
                            }}
                            className="bg-red-500 hover:bg-red-600 text-white font-semibold flex items-center gap-1.5"
                        >
                            <RotateCcw className="w-3.5 h-3.5" />
                            Try Again
                        </Button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
