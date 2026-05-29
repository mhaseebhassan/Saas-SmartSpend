import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import SettingsPageClient from "@/components/SettingsPageClient";

export default async function SettingsPage() {
    const session = await getServerSession(authOptions);
    if (!session) {
        redirect("/login");
    }

    return (
        <div className="max-w-7xl mx-auto space-y-6">
            <SettingsPageClient />
        </div>
    );
}
