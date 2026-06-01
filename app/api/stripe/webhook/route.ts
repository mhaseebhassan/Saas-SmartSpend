import { NextRequest, NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";

export async function POST(req: NextRequest) {
  let rawBody;
  try {
    rawBody = await req.text();
  } catch (err) {
    return NextResponse.json(
      { message: "Error reading request body" },
      { status: 400 }
    );
  }

  const signature = req.headers.get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!signature || !webhookSecret) {
    return NextResponse.json(
      { message: "Missing stripe-signature or webhook secret" },
      { status: 400 }
    );
  }

  let event;
  try {
    event = getStripe().webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (err: any) {
    console.error(`Webhook signature verification failed: ${err.message}`);
    return NextResponse.json(
      { message: `Webhook Error: ${err.message}` },
      { status: 400 }
    );
  }

  try {
    await connectDB();

    switch (event.type) {
      case "checkout.session.completed": {
        const session: any = event.data.object;
        const userId = session.metadata?.userId;
        const stripeCustomerId = session.customer;

        if (!userId) {
          console.warn("No userId in metadata for completed session:", session.id);
          break;
        }

        await User.findByIdAndUpdate(userId, {
          isPro: true,
          stripeCustomerId: stripeCustomerId,
        });

        // Trigger in-app notification for premium upgrade
        try {
          const Notification = (await import("@/models/Notification")).default;
          await Notification.create({
              userId: userId,
              title: "Premium Upgraded! 🚀",
              message: "Congratulations! You have successfully upgraded to SmartSpend Pro.",
              type: "subscription",
              link: "/dashboard",
          });
        } catch (notifErr) {
          console.error("Failed to create upgrade notification:", notifErr);
        }

        console.log(`User ${userId} successfully upgraded to Pro via session ${session.id}`);
        break;
      }

      case "customer.subscription.deleted": {
        const subscription: any = event.data.object;
        const stripeCustomerId = subscription.customer;

        if (!stripeCustomerId) {
          console.warn("No customer in deleted subscription:", subscription.id);
          break;
        }

        const user = await User.findOneAndUpdate(
          { stripeCustomerId: stripeCustomerId },
          { isPro: false }
        );

        // Trigger in-app notification for premium cancellation
        if (user) {
          try {
            const Notification = (await import("@/models/Notification")).default;
            await Notification.create({
                userId: user._id,
                title: "Premium Downgraded 😔",
                message: "Your SmartSpend Pro subscription has ended and your account has reverted to the Free tier.",
                type: "subscription",
                link: "/dashboard",
            });
          } catch (notifErr) {
            console.error("Failed to create cancellation notification:", notifErr);
          }
        }

        console.log(`Subscription deleted. User with customer ID ${stripeCustomerId} downgraded from Pro.`);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error) {
    console.error("Error processing Stripe webhook:", error);
    return NextResponse.json(
      { message: "Webhook handler failed", error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
