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
    return NextResponse.json(
      { error: "Artist required" },
      { status: 400 }
    );
  }

  const { data: artist } = await supabase
    .from("artists")
    .select("artist_slug, artist_name, logo_url")
    .eq("artist_slug", artistSlug)
    .single();

  if (!artist) {
    return NextResponse.json(
      { error: "Artist not found" },
      { status: 404 }
    );
  }

  const artistName = artist.artist_name || artist.artist_slug;
  const logoUrl = artist.logo_url || "";

  const artistUrl = `https://www.ucallithappyhour.com/${artist.artist_slug}`;

  const qrUrl = `https://quickchart.io/qr?text=${encodeURIComponent(
    artistUrl
  )}&size=600&margin=1`;

  const svg = `
<svg width="1080" height="1080" xmlns="http://www.w3.org/2000/svg">

  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#050505"/>
      <stop offset="100%" stop-color="#151515"/>
    </linearGradient>
  </defs>

  <rect width="1080" height="1080" fill="url(#bg)"/>

  <text
    x="540"
    y="60"
    text-anchor="middle"
    font-family="Arial"
    font-size="24"
    font-weight="700"
    fill="#d4af37"
  >
    U CALL IT HAPPY HOUR
  </text>

  ${
    logoUrl
      ? `
  <image
    href="${logoUrl}"
    x="190"
    y="80"
    width="700"
    height="260"
    preserveAspectRatio="xMidYMid meet"
  />
  `
      : ""
  }

  <text
    x="540"
    y="430"
    text-anchor="middle"
    font-family="Arial"
    font-size="64"
    font-weight="900"
    fill="#ffffff"
  >
    ${escapeSvg(artistName).toUpperCase()}
  </text>

  <text
    x="540"
    y="500"
    text-anchor="middle"
    font-family="Arial"
    font-size="88"
    font-weight="900"
    fill="#d4af37"
  >
    REQUEST A SONG
  </text>

  <text
    x="540"
    y="555"
    text-anchor="middle"
    font-family="Arial"
    font-size="28"
    fill="#ffffff"
  >
    Scan to browse the setlist and send a request.
  </text>

  <rect
    x="300"
    y="600"
    width="480"
    height="480"
    rx="18"
    fill="#ffffff"
    stroke="#d4af37"
    stroke-width="6"
  />

  <image
    href="${qrUrl}"
    x="340"
    y="640"
    width="400"
    height="400"
  />

  <rect
    x="170"
    y="1010"
    width="740"
    height="2"
    fill="#d4af37"
  />

  <text
    x="540"
    y="965"
    text-anchor="middle"
    font-family="Arial"
    font-size="30"
    font-weight="700"
    fill="#ffffff"
  >
    NO APP • NO LOGIN • INSTANT REQUESTS
  </text>

</svg>`;

  return new NextResponse(svg, {
    headers: {
      "Content-Type": "image/svg+xml",
      "Content-Disposition": `attachment; filename="${artist.artist_slug}-social.svg"`
    }
  });
}