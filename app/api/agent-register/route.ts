import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const resend = new Resend(process.env.RESEND_API_KEY);

// simple referral code generator
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
    const body = await req.json();

    const agencyName = body.agency_name?.trim();
    const contactName = body.contact_name?.trim();
    const email = body.email?.trim().toLowerCase();
    const phone = body.phone?.trim() || "";
    const artistCount = Number(body.artist_count || 0);
    const password = body.password?.trim(); // 🔥 REQUIRED FOR AUTH

    if (!agencyName || !contactName || !email || !password) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const referralCode = makeReferralCode(agencyName);

    // 1. CREATE SUPABASE AUTH USER (THIS IS THE KEY CHANGE)
    const { data: authUser, error: authError } =
      await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true
      });

    if (authError || !authUser?.user) {
      console.error("Auth error:", authError);
      return NextResponse.json(
        { error: authError?.message || "Auth user creation failed" },
        { status: 500 }
      );
    }

    // 2. CREATE AGENT ROW LINKED TO AUTH USER
    const { data, error } = await supabase
      .from("booking_agents")
      .insert({
        agency_name: agencyName,
        contact_name: contactName,
        email,
        phone,
        artist_count: artistCount,
        referral_code: referralCode,
        status: "active",
        auth_user_id: authUser.user.id // 🔗 CRITICAL LINK
      })
      .select()
      .single();

    if (error) {
      console.error("DB insert error:", error);
      return NextResponse.json(
        { error: "Failed to create agent record" },
        { status: 500 }
      );
    }

    // 3. EMAIL (CLEANED UP — NO TOKENS ANYMORE)
    await resend.emails.send({
      from: "U Call It Happy Hour <noreply@ucallithappyhour.com>",
      to: email,
      subject: "Your Agent Account is Ready",
      html: `
        <div style="font-family:Arial; color:#111;">
          <h2>Welcome to U Call It Happy Hour 🎸</h2>

          <p>Your booking agent account has been created.</p>

          <p><strong>Agency:</strong> ${agencyName}</p>
          <p><strong>Agent Code:</strong> ${referralCode}</p>

          <p>You can now log in with your email and password.</p>

          <p>
            <a href="https://www.ucallithappyhour.com/agents/login"
              style="display:inline-block;padding:12px 18px;background:#ffd84d;color:#000;font-weight:bold;text-decoration:none;border-radius:8px;">
              Login to Dashboard
            </a>
          </p>

          <hr />

          <p style="font-size:12px;color:#555;">
            Use your email + password to access your dashboard anytime.
          </p>
        </div>
      `
    });

    return NextResponse.json({
      success: true,
      agent: data,
      referral_code: referralCode,
      login_email: email,
      dashboard_url: "/agents/login"
    });
  } catch (error) {
    console.error("Agent register error:", error);
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}