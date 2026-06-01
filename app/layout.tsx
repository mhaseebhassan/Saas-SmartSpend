import { Inter } from "next/font/google";
// @ts-ignore
import "./globals.css";
import { AuthProvider } from "@/components/AuthProvider";
import { ThemeProvider } from "@/components/ThemeProvider";
import { ToastProvider } from "@/lib/toast-context";
import Navbar from "@/components/Navbar";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "SmartSpend - Personal Finance",
  description: "Track your expenses and budget smartly.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className="dark">
      <body className={`${inter.className} bg-[#05070F] text-[#F1F5F9] min-h-screen overflow-x-hidden selection:bg-cyan-500/30 selection:text-cyan-200`}>
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
                {/* Fixed Background Aurora Mesh */}
                <div className="fixed inset-0 -z-50 overflow-hidden bg-[#05070F] pointer-events-none">
                  {/* Purple Glow */}
                  <div className="absolute -top-[40%] -left-[20%] w-[80%] h-[80%] rounded-full bg-[#8B5CF6]/8 blur-[160px] pointer-events-none" />
                  {/* Teal Glow */}
                  <div className="absolute top-[20%] -right-[20%] w-[70%] h-[70%] rounded-full bg-[#06B6D4]/8 blur-[140px] pointer-events-none" />
                  {/* Pink Glow */}
                  <div className="absolute -bottom-[20%] left-[10%] w-[60%] h-[60%] rounded-full bg-[#EC4899]/5 blur-[120px] pointer-events-none" />
                  {/* Subtle Grid Overlay */}
                  <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />
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
