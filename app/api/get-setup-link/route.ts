import { NextResponse } from "next/server";
import Stripe from "stripe";
import { supabaseAdmin } from "../../../lib/supabaseAdmin";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { sessionId } = body;

    if (!sessionId) {
      return NextResponse.json(
        { error: "Missing session ID." },
        { status: 400 }
      );
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId);

    const registrationId =
      session.metadata?.registration_id ||
      session.metadata?.registrationId ||
      "";

    if (!registrationId) {
      return NextResponse.json(
        { error: "Missing registration ID." },
        { status: 400 }
      );
    }

    const { data: registration, error: registrationError } =
      await supabaseAdmin
        .from("artist_registrations")
        .select("artist_name")
        .eq("id", Number(registrationId))
        .maybeSingle();

    if (registrationError || !registration) {
      return NextResponse.json(
        { error: "Could not find registration." },
        { status: 404 }
      );
    }

    const slug = registration.artist_name
      .toLowerCase()
      .trim()
      .replace(/&/g, "and")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

    const { data: artist, error: artistError } = await supabaseAdmin
      .from("artists")
      .select("setup_token")
      .eq("artist_slug", slug)
      .maybeSingle();

    if (artistError || !artist?.setup_token) {
      return NextResponse.json(
        { error: "Could not find setup token." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      setupUrl: `/account/setup?token=${artist.setup_token}`
    });
  } catch (error) {
    console.error("Get setup link error:", error);

    return NextResponse.json(
      { error: "Could not get setup link." },
      { status: 500 }
    );
  }
}