import Sidebar from "@/components/Sidebar";

export default function DashboardLayout({ children }) {
    return (
        <div className="flex bg-background">
            <Sidebar />
            <div className="flex-1 p-6 md:p-8 overflow-y-auto max-h-[calc(100vh-65px)]">
                {children}
            </div>
        </div>
    );
}
