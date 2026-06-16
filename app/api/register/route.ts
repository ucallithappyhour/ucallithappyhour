import { NextResponse } from "next/server";
import { Resend } from "resend";
import { supabase } from "../../../lib/supabase";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const {
      artistName,
      contactName,
      email,
      phone,
      artistType,
      notes,
      referredBy
    } = body;

    if (!artistName || !contactName || !email) {
      return NextResponse.json(
        { error: "Artist name, contact name, and email are required." },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from("artist_registrations")
      .insert({
        artist_name: artistName,
        contact_name: contactName,
        email,
        phone,
        artist_type: artistType,
        notes,
        referred_by: referredBy || null,
        setup_fee: 99,
        status: "pending"
      });

    if (error) {
      console.error(error);

      return NextResponse.json(
        { error: "Could not submit registration." },
        { status: 500 }
      );
    }

    await resend.emails.send({
      from: "U Call It Happy Hour <noreply@ucallithappyhour.com>",
      to: email,
      subject: "Your U Call It Happy Hour registration was received",
      html: `
        <div style="text-align:center; margin-bottom:24px;">
          <img
            src="https://www.ucallithappyhour.com/ucallit-logo.png.png"
            alt="U Call It Happy Hour"
            width="200"
            style="display:block; margin:0 auto;"
          />
        </div>

        <h2>Thanks for registering, ${contactName}!</h2>

        <p>
          We received your artist setup request for
          <strong>${artistName}</strong>.
        </p>

        <p>
          We'll review your registration and contact you within 24-48 hours to complete setup and payment.
        </p>

        <p>
          <strong>Artist Type:</strong> ${artistType || "Not provided"}
        </p>

        <p>
          <strong>Setup Fee:</strong> $99
        </p>

        <hr style="margin:24px 0;" />

        <h3>🎵 Give $20, Get $20 Referral Program</h3>

        <p>
          Once approved, you'll receive your own personal referral link.
        </p>

        <p>
          Invite other musicians to U Call It Happy Hour and earn
          <strong> $20 </strong>
          every time an artist you refer completes setup.
        </p>

        <p>
          They'll save <strong>$20</strong> on their setup fee, too.
        </p>

        <p>
          Because great musicians know great musicians.
        </p>

        <br />

        <p>
          Cheers,<br />
          The U Call It Happy Hour Team
        </p>
      `
    });

    await resend.emails.send({
      from: "U Call It Happy Hour <noreply@ucallithappyhour.com>",
      to: "u.call.it.happy.hour@gmail.com",
      subject: `🎤 New Artist Registration: ${artistName}`,
      html: `
        <div style="text-align:center; margin-bottom:24px;">
          <img
            src="https://www.ucallithappyhour.com/ucallit-logo.png.png"
            alt="U Call It Happy Hour"
            width="200"
            style="display:block; margin:0 auto;"
          />
        </div>

        <h2>New Artist Registration</h2>

        <p><strong>Artist Name:</strong> ${artistName}</p>
        <p><strong>Contact Name:</strong> ${contactName}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone:</strong> ${phone || "Not provided"}</p>
        <p><strong>Artist Type:</strong> ${artistType || "Not provided"}</p>
        <p><strong>Notes:</strong> ${notes || "None"}</p>
        <p><strong>Referred By:</strong> ${referredBy || "None"}</p>

        <br />

        <p>
          <a
            href="https://www.ucallithappyhour.com/admin/registrations"
            style="
              display:inline-block;
              background:#d4af37;
              color:#000000;
              padding:12px 20px;
              text-decoration:none;
              border-radius:6px;
              font-weight:bold;
            "
          >
            Review &amp; Approve Registration &rarr;
          </a>
        </p>
      `
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Something went wrong submitting the registration." },
      { status: 500 }
    );
  }
}