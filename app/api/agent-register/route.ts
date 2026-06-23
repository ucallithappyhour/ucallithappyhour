import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const resend = new Resend(process.env.RESEND_API_KEY);

function makeReferralCode(agencyName: string) {
  return (
    agencyName
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, "")
      .slice(0, 10) + "25"
  );
}

function makeSetupToken() {
  return crypto.randomUUID().replace(/-/g, "");
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const agencyName = body.agency_name?.trim();
    const contactName = body.contact_name?.trim();
    const email = body.email?.trim().toLowerCase();
    const phone = body.phone?.trim() || "";
    const artistCount = Number(body.artist_count || 0);

    if (!agencyName || !contactName || !email) {
      return NextResponse.json(
        { error: "Agency name, contact name, and email are required." },
        { status: 400 }
      );
    }

    const baseCode = makeReferralCode(agencyName);

    const { data: existing } = await supabase
      .from("booking_agents")
      .select("id")
      .eq("referral_code", baseCode)
      .maybeSingle();

    const referralCode = existing
      ? `${baseCode}${Math.floor(100 + Math.random() * 900)}`
      : baseCode;

    const setupToken = makeSetupToken();
    const setupTokenExpiresAt = new Date(
      Date.now() + 1000 * 60 * 60 * 24 * 30
    ).toISOString();

    const dashboardUrl = `https://www.ucallithappyhour.com/agents/${referralCode}`;
    const profileUrl = `https://www.ucallithappyhour.com/agents/${referralCode}/profile?token=${setupToken}`;
    const referralUrl = `https://www.ucallithappyhour.com/register?agent=${referralCode}`;

    const { data, error } = await supabase
      .from("booking_agents")
      .insert({
        agency_name: agencyName,
        contact_name: contactName,
        email,
        phone,
        artist_count: artistCount,
        referral_code: referralCode,
        setup_token: setupToken,
        setup_token_expires_at: setupTokenExpiresAt,
        status: "active"
      })
      .select()
      .single();

    if (error) {
      console.error("Agent registration error:", error);
      return NextResponse.json(
        { error: "Could not create agent registration." },
        { status: 500 }
      );
    }

    await resend.emails.send({
      from: "U Call It Happy Hour <noreply@ucallithappyhour.com>",
      to: email,
      subject: "Your U Call It Happy Hour Agent Links",
      html: `
        <div style="font-family:Arial,sans-serif; color:#111; line-height:1.6;">
          <div style="text-align:center; margin-bottom:24px;">
            <img
              src="https://www.ucallithappyhour.com/ucallit-logo.png.png"
              alt="U Call It Happy Hour"
              width="190"
              style="display:block; margin:0 auto;"
            />
          </div>

          <h2>Your Booking Agent Dashboard Is Ready</h2>

          <p>Hi ${contactName},</p>

          <p>
            Your U Call It Happy Hour booking agent profile has been created for
            <strong> ${agencyName}</strong>.
          </p>

          <p>
            Share your referral link with artists. They save <strong>$25</strong>
            on setup, and you earn <strong>$25</strong> when they complete setup.
          </p>

          <p><strong>Agent Code:</strong> ${referralCode}</p>

          <p>
            <a
              href="${dashboardUrl}"
              style="display:inline-block;background:#d4af37;color:#000;padding:12px 18px;border-radius:8px;text-decoration:none;font-weight:bold;"
            >
              Open Agent Dashboard
            </a>
          </p>

          <p>
            <a
              href="${profileUrl}"
              style="display:inline-block;background:#111;color:#fff;padding:12px 18px;border-radius:8px;text-decoration:none;font-weight:bold;"
            >
              Set Up Agency Profile
            </a>
          </p>

          <hr style="margin:24px 0;" />

          <p><strong>Referral Link:</strong><br />${referralUrl}</p>
          <p><strong>Dashboard Link:</strong><br />${dashboardUrl}</p>
          <p><strong>Profile Setup Link:</strong><br />${profileUrl}</p>

          <p style="font-size:13px;color:#555;margin-top:24px;">
            Save or bookmark your dashboard link so you can track referred
            artists and commissions anytime.
          </p>
        </div>
      `
    });

    return NextResponse.json({
      success: true,
      agent: data,
      referral_code: referralCode,
      referral_url: referralUrl,
      dashboard_url: dashboardUrl,
      profile_url: profileUrl
    });
  } catch (error) {
    console.error("Agent register route error:", error);
    return NextResponse.json(
      { error: "Unexpected server error." },
      { status: 500 }
    );
  }
}