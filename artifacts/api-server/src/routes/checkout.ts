import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, profilesTable } from "@workspace/db";
import { CreateCheckoutSessionBody, VerifyCheckoutQueryParams } from "@workspace/api-zod";
import { requireAuth } from "./profiles";
import { logger } from "../lib/logger";

const router: IRouter = Router();

// Stripe is optional — only enabled when STRIPE_SECRET_KEY is set
function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return null;
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const Stripe = require("stripe");
    return new Stripe(key, { apiVersion: "2025-04-30.basil" });
  } catch {
    return null;
  }
}

const PRO_PRICE_AMOUNT = 4900; // $49.00 in cents

router.post("/checkout/create-session", requireAuth, async (req: any, res): Promise<void> => {
  const parsed = CreateCheckoutSessionBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const stripe = getStripe();
  if (!stripe) {
    // If Stripe is not configured, return a mock success for development
    res.json({ url: parsed.data.successUrl + "?session_id=dev_mock_session" });
    return;
  }

  const { successUrl, cancelUrl } = parsed.data;

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: "ShiftSwap Pro Lifetime",
            description: "Unlimited swaps, priority AI matching, advanced filters",
          },
          unit_amount: PRO_PRICE_AMOUNT,
        },
        quantity: 1,
      },
    ],
    mode: "payment",
    success_url: successUrl + "?session_id={CHECKOUT_SESSION_ID}",
    cancel_url: cancelUrl,
    metadata: { clerkUserId: req.userId },
  });

  res.json({ url: session.url });
});

router.get("/checkout/verify", requireAuth, async (req: any, res): Promise<void> => {
  const parsed = VerifyCheckoutQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: "Missing session_id" });
    return;
  }

  const { session_id } = parsed.data;

  // Mock session for development
  if (session_id === "dev_mock_session") {
    await db
      .update(profilesTable)
      .set({ isPro: true })
      .where(eq(profilesTable.clerkUserId, req.userId));
    res.json({ success: true, isPro: true });
    return;
  }

  const stripe = getStripe();
  if (!stripe) {
    res.json({ success: false, isPro: false });
    return;
  }

  try {
    const session = await stripe.checkout.sessions.retrieve(session_id);
    if (session.payment_status === "paid") {
      await db
        .update(profilesTable)
        .set({ isPro: true })
        .where(eq(profilesTable.clerkUserId, req.userId));
      res.json({ success: true, isPro: true });
    } else {
      res.json({ success: false, isPro: false });
    }
  } catch (err) {
    logger.error({ err }, "Stripe session verification failed");
    res.status(400).json({ success: false, isPro: false });
  }
});

export default router;
