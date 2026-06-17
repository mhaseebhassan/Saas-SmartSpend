import React from 'react';
import Link from 'next/link';

export const metadata = {
  title: "About SmartSpend",
  description: "Learn more about SmartSpend - your autonomous wealth management control center.",
};

export default function AboutPage() {
  return (
    <div className="container mx-auto px-6 py-32 max-w-4xl min-h-[80vh] flex flex-col">
      <div className="flex-grow">
        <h1 className="text-4xl md:text-5xl font-medium tracking-tight text-white mb-8">About SmartSpend</h1>
        <div className="prose prose-invert max-w-none text-white/70 space-y-6">
          <p className="text-lg">
            SmartSpend is designed to be the ultimate control center for modern personal finance. 
            By unifying your financial data and leveraging advanced intelligence, we help you take full control of your assets.
          </p>
          <p>
            Our mission is simple: provide an ultra-fast, intelligent, and secure platform that allows you to connect instantly, 
            set strict targets, and watch your assets compound over time.
          </p>
          <p>
            Whether you are tracking daily expenses or optimizing long-term wealth, our predictive insights and 
            real-time synchronization give you the edge you need in today&apos;s fast-paced financial landscape.
          </p>
        </div>
      </div>
      
      <footer className="mt-20 pt-8 border-t border-white/[0.04] flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-white/30">
        <p>© {new Date().getFullYear()} SmartSpend Inc. All rights reserved.</p>
        <div className="flex flex-col md:flex-row gap-4 md:gap-6 items-center">
          <Link href="/about" className="hover:text-white transition-colors cursor-pointer">About</Link>
          <Link href="/terms" className="hover:text-white transition-colors cursor-pointer">Terms</Link>
          <Link href="/privacy" className="hover:text-white transition-colors cursor-pointer">Privacy</Link>
        </div>
      </footer>
    </div>
  );
}
