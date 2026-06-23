import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

function makeReferralCode(agencyName: string) {
  return (
    agencyName
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

    const { data, error } = await supabase
      .from("booking_agents")
      .insert({
        agency_name: agencyName,
        contact_name: contactName,
        email,
        phone,
        artist_count: artistCount,
        referral_code: referralCode,
        status: "pending"
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

    const referralUrl = `https://www.ucallithappyhour.com/register?agent=${referralCode}`;

    return NextResponse.json({
      success: true,
      agent: data,
      referral_code: referralCode,
      referral_url: referralUrl
    });
  } catch (error) {
    console.error("Agent register route error:", error);
    return NextResponse.json(
      { error: "Unexpected server error." },
      { status: 500 }
    );
  }
}