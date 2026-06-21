import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

function escapeSvg(text: string) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const artistSlug = searchParams.get("artist");

  if (!artistSlug) {
    return NextResponse.json({ error: "Artist required" }, { status: 400 });
  }

  const { data: artist } = await supabase
    .from("artists")
    .select("artist_slug, artist_name, logo_url")
    .eq("artist_slug", artistSlug)
    .single();

  if (!artist) {
    return NextResponse.json({ error: "Artist not found" }, { status: 404 });
  }

  const artistName = artist.artist_name || artist.artist_slug;
  const logoUrl = artist.logo_url || "";
  const artistUrl = `https://www.ucallithappyhour.com/${artist.artist_slug}`;

  const qrUrl = `https://quickchart.io/qr?text=${encodeURIComponent(
    artistUrl
  )}&size=500&margin=1`;

  const svg = `
<svg width="1080" height="1080" viewBox="0 0 1080 1080" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="spotlight" cx="50%" cy="20%" r="80%">
      <stop offset="0%" stop-color="#2a2412"/>
      <stop offset="48%" stop-color="#101010"/>
      <stop offset="100%" stop-color="#050505"/>
    </radialGradient>

    <linearGradient id="goldBar" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#8f6f1f"/>
      <stop offset="50%" stop-color="#d4af37"/>
      <stop offset="100%" stop-color="#8f6f1f"/>
    </linearGradient>
  </defs>

  <rect width="1080" height="1080" fill="url(#spotlight)"/>

  <rect x="54" y="54" width="972" height="972" rx="34" fill="none" stroke="#d4af37" stroke-width="6"/>
  <rect x="78" y="78" width="924" height="924" rx="26" fill="none" stroke="#ffffff" stroke-opacity="0.08" stroke-width="2"/>

  ${
    logoUrl
      ? `<image href="${escapeSvg(
          logoUrl
        )}" x="180" y="80" width="720" height="320" preserveAspectRatio="xMidYMid meet"/>`
      : `
  <text x="540" y="250" text-anchor="middle" font-family="Arial Black, Arial" font-size="76" font-weight="900" fill="#ffffff">
    ${escapeSvg(artistName).toUpperCase()}
  </text>`
  }

  <rect x="130" y="405" width="820" height="86" rx="43" fill="url(#goldBar)"/>

  <text x="540" y="463" text-anchor="middle" font-family="Arial Black, Arial" font-size="50" font-weight="900" fill="#050505">
    REQUEST SONGS LIVE
  </text>

  <text x="540" y="545" text-anchor="middle" font-family="Arial" font-size="34" font-weight="700" fill="#ffffff">
    Scan to browse the setlist
  </text>

  <text x="540" y="588" text-anchor="middle" font-family="Arial" font-size="34" font-weight="700" fill="#ffffff">
    and send requests instantly
  </text>

  <rect x="335" y="625" width="410" height="410" rx="24" fill="#d4af37"/>
  <rect x="355" y="645" width="370" height="370" rx="16" fill="#ffffff"/>

  <image href="${escapeSvg(qrUrl)}" x="380" y="670" width="320" height="320"/>

  <text x="540" y="1048" text-anchor="middle" font-family="Arial" font-size="24" font-weight="900" fill="#d4af37">
    U CALL IT HAPPY HOUR
  </text>

  <text x="540" y="1012" text-anchor="middle" font-family="Arial" font-size="25" font-weight="900" fill="#ffffff">
    NO APP  |  NO LOGIN  |  INSTANT REQUESTS
  </text>
</svg>`;

  return new NextResponse(svg, {
    headers: {
      "Content-Type": "image/svg+xml",
      "Content-Disposition": `attachment; filename="${artist.artist_slug}-social.svg"`
    }
  });
}