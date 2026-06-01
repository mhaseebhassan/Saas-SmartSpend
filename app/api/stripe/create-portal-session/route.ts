import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import { getStripe } from "@/lib/stripe";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    await connectDB();
    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    if (!user.stripeCustomerId) {
      return NextResponse.json(
        { message: "No active subscription found. You must subscribe first." },
        { status: 400 }
      );
    }

    const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";

    const portalSession = await getStripe().billingPortal.sessions.create({
      customer: user.stripeCustomerId,
      return_url: `${baseUrl}/dashboard`,
    });

    return NextResponse.json({ url: portalSession.url }, { status: 200 });
  } catch (error) {
    console.error("Error creating billing portal session:", error);
    return NextResponse.json(
      { message: "Internal server error", error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
