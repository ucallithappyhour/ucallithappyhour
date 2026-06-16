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
      notes
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
        setup_fee: 99,
        status: "pending"
      });

    if (error) {
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
          <strong>Artist Type:</strong> ${artistType}
        </p>

        <p>
          <strong>Setup Fee:</strong> $99
        </p>

        <br />

         <p>
             Cheers,<br />
             The U Call It Happy Hour Team
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