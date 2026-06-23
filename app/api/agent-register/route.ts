import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";

function makeReferralCode(name: string) {
  return (
    name
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, "")
      .slice(0, 10) + "25"
  );
}

export async function POST(req: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceKey) {
      return NextResponse.json(
        { error: "Missing Supabase server environment variables." },
        { status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, serviceKey);

    const body = await req.json();

    const agencyName = body.agency_name?.trim();
    const contactName = body.contact_name?.trim();
    const email = body.email?.trim().toLowerCase();
    const password = body.password;
    const phone = body.phone?.trim() || "";
    const artistCount = Number(body.artist_count || 0);

    if (!agencyName || !contactName || !email || !password) {
      return NextResponse.json(
        { error: "Missing required fields." },
        { status: 400 }
      );
    }

    const referralCode = makeReferralCode(agencyName);

    const { data: authData, error: authError } =
      await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true
      });

    if (authError || !authData?.user) {
      return NextResponse.json(
        { error: authError?.message || "Auth user creation failed." },
        { status: 500 }
      );
    }

    const authUser = authData.user;

    const { data: agent, error: dbError } = await supabase
      .from("booking_agents")
      .insert({
        agency_name: agencyName,
        contact_name: contactName,
        email,
        phone,
        artist_count: artistCount,
        referral_code: referralCode,
        status: "active",
        auth_user_id: authUser.id
      })
      .select()
      .single();

    if (dbError) {
      return NextResponse.json(
        { error: dbError.message || "Failed to create agent record." },
        { status: 500 }
      );
    }

    if (process.env.RESEND_API_KEY) {
      try {
        const resend = new Resend(process.env.RESEND_API_KEY);

        await resend.emails.send({
          from: "U Call It Happy Hour <noreply@ucallithappyhour.com>",
          to: email,
          subject: "Your Agent Login is Ready",
          html: `
            <div style="font-family:Arial; color:#111; line-height:1.6;">
              <h2>Welcome to U Call It Happy Hour 🎸</h2>
              <p>Your agent account has been created successfully.</p>
              <p><strong>Agency:</strong> ${agencyName}</p>
              <p><strong>Referral Code:</strong> ${referralCode}</p>
              <p>You can now log in using your email and password.</p>
              <p>
                <a href="https://www.ucallithappyhour.com/agents"
                  style="display:inline-block;padding:12px 18px;background:#ffd84d;color:#000;font-weight:bold;text-decoration:none;border-radius:8px;">
                  Login to Dashboard
                </a>
              </p>
            </div>
          `
        });
      } catch (emailError) {
        console.error("Agent welcome email failed:", emailError);
      }
    }

    return NextResponse.json({
      success: true,
      agent,
      referral_code: referralCode,
      login_url: "/agents"
    });
  } catch (error) {
    console.error("Agent register error:", error);

    return NextResponse.json(
      { error: "Server error while creating agent account." },
      { status: 500 }
    );
  }
}