import Sidebar from "@/components/Sidebar";
import TopBar from "@/components/TopBar";
import MobileBottomNav from "@/components/MobileBottomNav";

export default function DashboardLayout({ children }) {
    return (
        <div className="flex min-h-[calc(100vh-64px)] bg-background">
            {/* Desktop Left Sidebar (hidden on mobile) */}
            <Sidebar />

            {/* Dashboard Content Container */}
            <div className="flex-1 flex flex-col min-w-0 relative">
                {/* Desktop & Mobile Dynamic Header */}
                <TopBar />

                {/* Dynamic Content Frame */}
                <main className="flex-1 p-4 sm:p-6 md:p-8 overflow-y-auto pb-24 md:pb-8">
                    {children}
                </main>

                {/* Mobile Bottom Sticky Navigation Tab bar */}
                <MobileBottomNav />
            </div>
        </div>
    );
}
