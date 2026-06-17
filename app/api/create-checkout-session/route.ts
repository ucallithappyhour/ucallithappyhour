import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const {
      registrationId,
      artistName,
      email,
      referredBy
    } = body;

    const session = await stripe.checkout.sessions.create({
      mode: "payment",

      customer_email: email,

      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: "U Call It Happy Hour Artist Setup",
              description:
                "Personalized artist page, QR starter kit, dashboard access, referral program, and fan engagement tools."
            },
            unit_amount: 9900
          },
          quantity: 1
        }
      ],

      metadata: {
        registrationId: String(registrationId),
        referredBy: referredBy || "",
        artistName
      },

      success_url:
        "https://www.ucallithappyhour.com/register/success?session_id={CHECKOUT_SESSION_ID}",

      cancel_url:
        "https://www.ucallithappyhour.com/register"
    });

    return NextResponse.json({
      url: session.url
    });
  } catch (error) {
    console.error(error);

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