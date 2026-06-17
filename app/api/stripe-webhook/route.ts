import { NextResponse } from "next/server";
import Stripe from "stripe";
import { Resend } from "resend";
import { supabase } from "../../../lib/supabase";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
const resend = new Resend(process.env.RESEND_API_KEY);

function makeSlug(name: string) {
  return name
    .toLowerCase()
    .trim()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function makeReferralCode(name: string) {
  const base = name
    .toUpperCase()
    .trim()
    .replace(/&/g, "AND")
    .replace(/[^A-Z0-9]+/g, "")
    .slice(0, 10);

  return `${base || "ARTIST"}20`;
}

export async function POST(request: Request) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json(
      { error: "Missing Stripe signature." },
      { status: 400 }
    );
  }

  try {
    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );

    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;

      const registrationId = session.metadata?.registrationId || "";
      const artistNameFromStripe = session.metadata?.artistName || "";
      const referredByFromStripe = session.metadata?.referredBy || "";

      if (!registrationId) {
        console.error("Missing registrationId in Stripe metadata.");
        return NextResponse.json({ received: true });
      }

      const { data: registration, error: registrationFetchError } =
        await supabase
          .from("artist_registrations")
          .select("*")
          .eq("id", registrationId)
          .maybeSingle();

      if (registrationFetchError || !registration) {
        console.error(
          "Could not find registration after Stripe payment:",
          registrationFetchError
        );
        return NextResponse.json({ received: true });
      }

      if (registration.status === "paid" || registration.status === "artist_created") {
        return NextResponse.json({ received: true });
      }

      const artistName = registration.artist_name || artistNameFromStripe;
      const contactName = registration.contact_name || "";
      const email = registration.email || session.customer_email || "";
      const artistType = registration.artist_type || null;
      const referredBy = registration.referred_by || referredByFromStripe || "";
      const slug = makeSlug(artistName);
      const referralCode = makeReferralCode(artistName);

      const { error: paidError } = await supabase
        .from("artist_registrations")
        .update({
          status: "paid"
        })
        .eq("id", registrationId);

      if (paidError) {
        console.error("Could not mark registration paid:", paidError);
      }

      const { data: existingArtist, error: existingArtistError } =
        await supabase
          .from("artists")
          .select("artist_slug")
          .eq("artist_slug", slug)
          .maybeSingle();

      if (existingArtistError) {
        console.error("Could not check existing artist:", existingArtistError);
      }

      if (!existingArtist) {
        const { error: artistCreateError } = await supabase
          .from("artists")
          .insert({
            artist_slug: slug,
            artist_name: artistName,
            genres: artistType,
            bio: null,
            tip_type: null,
            tip_link: null,
            logo_url: null,
            is_active: true,
            referral_code: referralCode,
            referral_count: 0,
            referral_earnings: 0
          });

        if (artistCreateError) {
          console.error("Could not create artist:", artistCreateError);
        }
      }

      const { error: artistCreatedStatusError } = await supabase
        .from("artist_registrations")
        .update({
          status: "artist_created"
        })
        .eq("id", registrationId);

      if (artistCreatedStatusError) {
        console.error(
          "Could not mark registration artist_created:",
          artistCreatedStatusError
        );
      }

      if (referredBy) {
        const { data: referringArtist, error: referringArtistError } =
          await supabase
            .from("artists")
            .select("artist_slug, referral_count, referral_earnings")
            .eq("referral_code", referredBy)
            .maybeSingle();

        if (referringArtistError) {
          console.error("Could not find referring artist:", referringArtistError);
        }

        if (referringArtist) {
          const currentCount = referringArtist.referral_count || 0;
          const currentEarnings = Number(referringArtist.referral_earnings || 0);

          const { error: referralUpdateError } = await supabase
            .from("artists")
            .update({
              referral_count: currentCount + 1,
              referral_earnings: currentEarnings + 20
            })
            .eq("artist_slug", referringArtist.artist_slug);

          if (referralUpdateError) {
            console.error("Could not update referral credit:", referralUpdateError);
          }
        }
      }

      if (email) {
        await resend.emails.send({
          from: "U Call It Happy Hour <noreply@ucallithappyhour.com>",
          to: email,
          subject: "🎉 Welcome to U Call It Happy Hour!",
          html: `
            <div style="text-align:center; margin-bottom:24px;">
              <img
                src="https://www.ucallithappyhour.com/ucallit-logo.png.png"
                alt="U Call It Happy Hour"
                width="200"
                style="display:block; margin:0 auto;"
              />
            </div>

            <h2>Welcome to U Call It Happy Hour${contactName ? `, ${contactName}` : ""}!</h2>

            <p>
              Your artist setup payment has been received and your artist page has been activated.
            </p>

            <h3>What's included:</h3>

            <ul>
              <li>Personalized artist request page</li>
              <li>Fan request dashboard</li>
              <li>QR starter kit for tables, signs, and flyers</li>
              <li>Tip integration</li>
              <li>Future setlist insights</li>
              <li>Give $20, Get $20 referral program</li>
            </ul>

            <h3>Your Artist Page</h3>

            <p>
              <a href="https://www.ucallithappyhour.com/${slug}">
                https://www.ucallithappyhour.com/${slug}
              </a>
            </p>

            <h3>Your Referral Link</h3>

            <p>
              <a href="https://www.ucallithappyhour.com/register?ref=${referralCode}">
                https://www.ucallithappyhour.com/register?ref=${referralCode}
              </a>
            </p>

            <p>
              Earn <strong>$20</strong> every time another artist completes setup using your link.
              They save <strong>$20</strong>, too.
            </p>

            <p>
              Cheers,<br />
              The U Call It Happy Hour Team
            </p>
          `
        });
      }

      await resend.emails.send({
        from: "U Call It Happy Hour <noreply@ucallithappyhour.com>",
        to: "u.call.it.happy.hour@gmail.com",
        subject: `✅ Paid artist activated: ${artistName}`,
        html: `
          <h2>Paid Artist Activated</h2>

          <p><strong>Artist:</strong> ${artistName}</p>
          <p><strong>Email:</strong> ${email || "Not provided"}</p>
          <p><strong>Artist URL:</strong> https://www.ucallithappyhour.com/${slug}</p>
          <p><strong>Referral Code:</strong> ${referralCode}</p>
          <p><strong>Referred By:</strong> ${referredBy || "None"}</p>
          <p><strong>Stripe Session:</strong> ${session.id}</p>
        `
      });
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Stripe webhook error:", error);

    return NextResponse.json(
      { error: "Webhook signature verification failed." },
      { status: 400 }
    );
  }
}