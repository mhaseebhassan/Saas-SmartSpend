import React from 'react';
import Link from 'next/link';

export const metadata = {
  title: "Privacy Policy - SmartSpend",
  description: "Privacy policy for SmartSpend - how we handle and protect your data.",
};

export default function PrivacyPage() {
  return (
    <div className="container mx-auto px-6 py-32 max-w-4xl min-h-[80vh] flex flex-col">
      <div className="flex-grow">
        <h1 className="text-4xl md:text-5xl font-medium tracking-tight text-white mb-8">Privacy Policy</h1>
        <div className="prose prose-invert max-w-none text-white/70 space-y-6">
          <p className="text-lg">
            Your privacy is important to us. This Privacy Policy explains how SmartSpend collects, uses, and protects your personal information when you use our platform.
          </p>

          <h2 className="text-2xl font-medium text-white mt-8 mb-4">1. Information We Collect</h2>
          <p>
            We collect information you provide directly, such as your name, email address, and financial data you choose to enter. We also collect usage data to improve our services, including device information, IP addresses, and interaction patterns.
          </p>

          <h2 className="text-2xl font-medium text-white mt-8 mb-4">2. How We Use Your Information</h2>
          <p>
            Your information is used to provide, maintain, and improve our services. This includes generating financial insights, processing transactions, sending notifications, and ensuring the security of your account.
          </p>

          <h2 className="text-2xl font-medium text-white mt-8 mb-4">3. Data Security</h2>
          <p>
            We implement industry-standard security measures to protect your data. All financial information is encrypted at rest and in transit. We do not sell your personal data to third parties.
          </p>

          <h2 className="text-2xl font-medium text-white mt-8 mb-4">4. Data Retention</h2>
          <p>
            We retain your data for as long as your account is active or as needed to provide you services. You may request deletion of your account and associated data at any time through your account settings.
          </p>

          <h2 className="text-2xl font-medium text-white mt-8 mb-4">5. Contact Us</h2>
          <p>
            If you have any questions about this Privacy Policy, please contact us through our platform.
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
