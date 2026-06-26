import React from 'react';
import Link from 'next/link';

export const metadata = {
  title: "Terms & Conditions - SmartSpend",
  description: "Terms and conditions for using SmartSpend.",
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#000] text-white selection:bg-white/20">
      <div className="fixed inset-0 bg-[radial-gradient(#ffffff15_1px,transparent_1px)] bg-[size:32px_32px] [mask-image:linear-gradient(to_bottom,white_10%,transparent_60%)] pointer-events-none" />
      
      <div className="container mx-auto px-6 py-32 md:py-40 max-w-[800px] relative z-10 flex flex-col min-h-screen">
        <div className="flex-grow">
          <Link href="/" className="inline-block mb-12 text-sm font-medium text-white/40 hover:text-white transition-colors">
            ← Back to Home
          </Link>

          <h1 className="text-4xl md:text-5xl font-medium tracking-tight text-white mb-12">Terms & Conditions</h1>
          
          <div className="space-y-10 text-base md:text-lg text-white/50 leading-relaxed font-normal">
            <p className="text-white/80 font-medium text-xl leading-snug tracking-tight">
              Welcome to SmartSpend. These Terms & Conditions outline the strict rules and architectural regulations for the use of our platform.
            </p>
            
            <section>
              <h2 className="text-xl font-medium text-white mb-3 tracking-tight">1. Acceptance of Terms</h2>
              <p>
                By accessing, authenticating, or using our platform infrastructure, you agree to be bound by these terms. If you disagree with any part of the terms, you may not access the service.
              </p>
            </section>
            
            <section>
              <h2 className="text-xl font-medium text-white mb-3 tracking-tight">2. User Accounts & Security</h2>
              <p>
                When you create an account with us, you must provide accurate and complete information. You are solely responsible for safeguarding the cryptographic keys (passwords) that you use to access the service and for any activities or actions under your password.
              </p>
            </section>
            
            <section>
              <h2 className="text-xl font-medium text-white mb-3 tracking-tight">3. Platform Usage</h2>
              <p>
                SmartSpend is provided as a financial analytics interface. You agree not to misuse our APIs, attempt to breach our security architectures, or use the platform for any illegal financial activities.
              </p>
            </section>
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
