import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import RecurringPageClient from "@/components/RecurringPageClient";

export default async function RecurringPage() {
    const session = await getServerSession(authOptions);
    if (!session) {
        redirect("/login");
    }

    return (
        <div className="max-w-7xl mx-auto space-y-6">
            <RecurringPageClient />
        </div>
    );
}
