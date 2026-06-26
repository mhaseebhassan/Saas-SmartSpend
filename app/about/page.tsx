import React from 'react';
import Link from 'next/link';

export const metadata = {
  title: "About SmartSpend",
  description: "Learn more about SmartSpend - your autonomous wealth management control center.",
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#000] text-white selection:bg-white/20">
      <div className="fixed inset-0 bg-[radial-gradient(#ffffff15_1px,transparent_1px)] bg-[size:32px_32px] [mask-image:linear-gradient(to_bottom,white_10%,transparent_60%)] pointer-events-none" />
      
      <div className="container mx-auto px-6 py-32 md:py-40 max-w-[800px] relative z-10 flex flex-col min-h-screen">
        <div className="flex-grow">
          <Link href="/" className="inline-block mb-12 text-sm font-medium text-white/40 hover:text-white transition-colors">
            ← Back to Home
          </Link>
          
          <h1 className="text-4xl md:text-5xl font-medium tracking-tight text-white mb-12">About SmartSpend</h1>
          
          <div className="space-y-8 text-base md:text-lg text-white/50 leading-relaxed font-normal">
            <p className="text-white/80 font-medium text-xl md:text-2xl leading-snug tracking-tight">
              SmartSpend is designed to be the ultimate control center for modern personal finance.
            </p>
            <p>
              By unifying your financial data and leveraging advanced intelligence, we help you take full control of your assets. Our mission is simple: provide an ultra-fast, intelligent, and secure platform that allows you to connect instantly, set strict targets, and watch your assets compound over time.
            </p>
            <p>
              Whether you are tracking daily expenses or optimizing long-term wealth, our predictive insights and real-time synchronization give you the edge you need in today's fast-paced financial landscape. Built on strict architectural principles, we guarantee zero latency and complete privacy.
            </p>
          </div>
        </div>
        
        <footer className="mt-32 pt-8 border-t border-white/[0.05] flex flex-col md:flex-row justify-between items-center gap-4 text-xs font-medium text-white/40">
          <div className="flex items-center gap-3">
            <span className="text-white">SmartSpend</span>
            <div className="w-1 h-1 rounded-full bg-white/20" />
            <span>© {new Date().getFullYear()}</span>
          </div>
          <div className="flex gap-6">
            <Link href="/about" className="hover:text-white transition-colors">About</Link>
            <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
          </div>
        </footer>
      </div>
    </div>
  );
}
