import LandingPageClient from "@/components/LandingPageClient";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "SmartSpend - Autonomous Wealth Management",
  description: "The ultra-fast, intelligent control center for modern personal finance. Connect instantly, set strict targets, and let your assets compound.",
  keywords: "smartspend, personal finance, wealth management, finance tracker, automated finance, AI budgeting",
  openGraph: {
    title: "SmartSpend - Autonomous Wealth Management",
    description: "The ultra-fast, intelligent control center for modern personal finance.",
    url: "https://smartspend.com",
    siteName: "SmartSpend",
    type: "website",
  },
};

export default function Page() {
  return <LandingPageClient />;
}
