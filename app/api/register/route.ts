import { NextResponse } from "next/server";
import { Resend } from "resend";
import { supabaseAdmin } from "../../../lib/supabaseAdmin";

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

    const { data: registration, error } = await supabaseAdmin
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
        status: "unpaid"
      })
      .select("id");

    console.log("Registration insert result:", registration);

    if (error || !registration || registration.length === 0) {
      console.error(error);

      return NextResponse.json(
        { error: "Could not submit registration." },
        { status: 500 }
      );
    }

    const registrationId = registration[0].id;

    

    await resend.emails.send({
      from: "U Call It Happy Hour <noreply@ucallithappyhour.com>",
      to: "u.call.it.happy.hour@gmail.com",
      subject: `🎤 New unpaid artist registration: ${artistName}`,
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

        <p><strong>Status:</strong> unpaid</p>
        <p><strong>Registration ID:</strong> ${registrationId}</p>
        <p><strong>Artist Name:</strong> ${artistName}</p>
        <p><strong>Contact Name:</strong> ${contactName}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone:</strong> ${phone || "Not provided"}</p>
        <p><strong>Artist Type:</strong> ${artistType || "Not provided"}</p>
        <p><strong>Notes:</strong> ${notes || "None"}</p>
        <p><strong>Referred By:</strong> ${referredBy || "None"}</p>
        <p><strong>Setup Fee:</strong> $99</p>

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
            View Registration &rarr;
          </a>
        </p>
      `
    });

    return NextResponse.json({
      success: true,
      registrationId
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Something went wrong submitting the registration." },
      { status: 500 }
    );
  }
}