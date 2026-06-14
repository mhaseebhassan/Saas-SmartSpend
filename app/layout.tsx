import { Plus_Jakarta_Sans } from "next/font/google";
// @ts-ignore
import "./globals.css";
import { AuthProvider } from "@/components/AuthProvider";
import { ThemeProvider } from "@/components/ThemeProvider";
import { ToastProvider } from "@/lib/toast-context";
import Navbar from "@/components/Navbar";

const jakarta = Plus_Jakarta_Sans({ subsets: ["latin"] });

export const metadata = {
  title: "SmartSpend - Autonomous Wealth Management",
  description: "SmartSpend is the ultimate personal finance app for tracking expenses, managing budgets, and optimizing wealth with AI insights.",
  keywords: "finance, personal finance, budget tracker, wealth management, AI finance, expense tracker",
  authors: [{ name: "SmartSpend Inc." }],
  openGraph: {
    title: "SmartSpend - Autonomous Wealth Management",
    description: "Track your expenses and budget smartly with predictive AI insights and end-to-end security.",
    url: "https://smartspend.com",
    siteName: "SmartSpend",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "SmartSpend - Autonomous Wealth Management",
    description: "Track your expenses and budget smartly with predictive AI insights and end-to-end security.",
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className="dark">
      <body className={`${jakarta.className} bg-[#09090B] text-[#F1F5F9] min-h-screen overflow-x-hidden selection:bg-white/10 selection:text-white`}>
        <AuthProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem={false}
            forcedTheme="dark"
            disableTransitionOnChange
          >
            <ToastProvider>
              <div className="relative flex flex-col min-h-screen z-10">
                {/* Fixed Background - Refined Deep Dark */}
                <div className="fixed inset-0 -z-50 bg-[#09090B] pointer-events-none">
                </div>

                <Navbar />
                
                {/* Content wrapper */}
                <main className="flex-grow flex flex-col relative z-10 w-full">
                  {children}
                </main>
              </div>
            </ToastProvider>
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
