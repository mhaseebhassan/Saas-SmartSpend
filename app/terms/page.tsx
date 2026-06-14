import React from 'react';
import Link from 'next/link';

export const metadata = {
  title: "Terms & Conditions - SmartSpend",
  description: "Terms and conditions for using SmartSpend.",
};

export default function TermsPage() {
  return (
    <div className="container mx-auto px-6 py-32 max-w-4xl min-h-[80vh] flex flex-col">
      <div className="flex-grow">
        <h1 className="text-4xl md:text-5xl font-medium tracking-tight text-white mb-8">Terms & Conditions</h1>
        <div className="prose prose-invert max-w-none text-white/70 space-y-6">
          <p className="text-lg">
            Welcome to SmartSpend. These Terms & Conditions outline the rules and regulations for the use of our platform.
          </p>
          <h2 className="text-2xl font-medium text-white mt-8 mb-4">1. Acceptance of Terms</h2>
          <p>
            By accessing or using our service, you agree to be bound by these terms. If you disagree with any part of the terms, you may not access the service.
          </p>
          <h2 className="text-2xl font-medium text-white mt-8 mb-4">2. User Accounts</h2>
          <p>
            When you create an account with us, you must provide accurate and complete information. You are responsible for safeguarding the password that you use to access the service.
          </p>
          <h2 className="text-2xl font-medium text-white mt-8 mb-4">3. Privacy and Data</h2>
          <p>
            We take your privacy seriously. All financial data is encrypted and stored securely. Please refer to our Privacy Policy for detailed information on how we handle your data.
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
