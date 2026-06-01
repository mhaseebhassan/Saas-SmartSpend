import Stripe from "stripe";

let stripeClient: Stripe | null = null;

export function getStripe() {
  const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

  if (!stripeSecretKey) {
    throw new Error("STRIPE_SECRET_KEY is not configured.");
  }

  if (!stripeClient) {
    stripeClient = new Stripe(stripeSecretKey, {
      apiVersion: "2023-10-16" as any,
    });
  }

  return stripeClient;
}
