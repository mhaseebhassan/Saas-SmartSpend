import React from 'react';
import Link from 'next/link';

export const metadata = {
  title: "Privacy Policy - SmartSpend",
  description: "Privacy policy for SmartSpend - how we handle and protect your data.",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#000] text-white selection:bg-white/20">
      <div className="fixed inset-0 bg-[radial-gradient(#ffffff15_1px,transparent_1px)] bg-[size:32px_32px] [mask-image:linear-gradient(to_bottom,white_10%,transparent_60%)] pointer-events-none" />
      
      <div className="container mx-auto px-6 py-32 md:py-40 max-w-[800px] relative z-10 flex flex-col min-h-screen">
        <div className="flex-grow">
          <Link href="/" className="inline-block mb-12 text-sm font-medium text-white/40 hover:text-white transition-colors">
            ← Back to Home
          </Link>

          <h1 className="text-4xl md:text-5xl font-medium tracking-tight text-white mb-12">Privacy Policy</h1>
          
          <div className="space-y-10 text-base md:text-lg text-white/50 leading-relaxed font-normal">
            <p className="text-white/80 font-medium text-xl leading-snug tracking-tight">
              Your privacy is fundamentally engineered into our architecture. This policy explains exactly how SmartSpend protects your personal information.
            </p>

            <section>
              <h2 className="text-xl font-medium text-white mb-3 tracking-tight">1. Information We Collect</h2>
              <p>
                We collect information you provide directly, such as your name, email address, and financial data you choose to enter. We also collect usage data to improve our services, including device information, IP addresses, and interaction patterns.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-medium text-white mb-3 tracking-tight">2. How We Use Your Information</h2>
              <p>
                Your information is used strictly to provide, maintain, and improve our services. This includes generating automated financial insights, processing data syncs, and ensuring the absolute security of your account infrastructure.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-medium text-white mb-3 tracking-tight">3. Data Security & Encryption</h2>
              <p>
                We implement industry-leading cryptographic security measures to protect your data. All financial information is encrypted at rest (AES-256) and in transit (TLS 1.3). We do not, and will never, sell your personal data to third parties.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-medium text-white mb-3 tracking-tight">4. Data Retention</h2>
              <p>
                We retain your data only for as long as your account is active. You maintain complete sovereignty over your data and may request total deletion of your account and associated records at any time through your dashboard settings.
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
