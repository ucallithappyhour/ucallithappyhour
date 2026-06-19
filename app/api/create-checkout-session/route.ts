import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const { registrationId, artistName, email, referredBy } = body;

    if (!registrationId) {
      return NextResponse.json(
        { error: "Missing registration ID." },
        { status: 400 }
      );
    }

    const registrationIdString = String(registrationId);
    const hasReferral =
      typeof referredBy === "string" && referredBy.trim() !== "";
    const setupAmount = hasReferral ? 7900 : 9900;

    console.log("Creating checkout session for registration:", {
      registrationId: registrationIdString,
      artistName,
      email,
      referredBy,
      setupAmount
    });

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      customer_email: email,

      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: hasReferral
                ? "U Call It Happy Hour Artist Setup - Referral Discount"
                : "U Call It Happy Hour Artist Setup",
              description: hasReferral
                ? "Personalized artist page, QR starter kit, dashboard access, referral program, and fan engagement tools. Referral discount applied."
                : "Personalized artist page, QR starter kit, dashboard access, referral program, and fan engagement tools."
            },
            unit_amount: setupAmount
          },
          quantity: 1
        }
      ],

      metadata: {
        registration_id: registrationIdString,
        registrationId: registrationIdString,
        artist_name: artistName || "",
        artistName: artistName || "",
        email: email || "",
        referred_by: referredBy || "",
        referredBy: referredBy || "",
        setup_amount: String(setupAmount)
      },

      success_url:
        "https://www.ucallithappyhour.com/register/success?session_id={CHECKOUT_SESSION_ID}",

      cancel_url: hasReferral
        ? `https://www.ucallithappyhour.com/register?ref=${encodeURIComponent(
            referredBy
          )}`
        : "https://www.ucallithappyhour.com/register"
    });

    return NextResponse.json({
      url: session.url
    });
  } catch (error) {
    console.error("Create checkout session error:", error);

    return NextResponse.json(
      {
        error: "Could not create checkout session."
      },
      {
        status: 500
      }
    );
  }
}