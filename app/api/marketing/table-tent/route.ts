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
  )}&size=520`;

  const svg = `
<svg width="1080" height="1080" xmlns="http://www.w3.org/2000/svg">

  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#0b0b0b"/>
      <stop offset="100%" stop-color="#171717"/>
    </linearGradient>

    <filter id="glow">
      <feGaussianBlur stdDeviation="10" result="blur"/>
      <feMerge>
        <feMergeNode in="blur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
  </defs>

  <rect width="1080" height="1080" fill="url(#bg)"/>

  <text
    x="540"
    y="70"
    text-anchor="middle"
    font-family="Arial"
    font-size="26"
    font-weight="700"
    fill="#f4c76b"
  >
    U CALL IT HAPPY HOUR
  </text>

  ${
    logoUrl
      ? `
  <image
    href="${logoUrl}"
    x="290"
    y="90"
    width="500"
    height="220"
    preserveAspectRatio="xMidYMid meet"
  />
  `
      : ""
  }

  <text
    x="540"
    y="365"
    text-anchor="middle"
    font-family="Arial"
    font-size="92"
    font-weight="900"
    fill="#ffffff"
  >
    REQUEST A SONG
  </text>

  <text
    x="540"
    y="435"
    text-anchor="middle"
    font-family="Arial"
    font-size="48"
    font-weight="700"
    fill="#f4c76b"
  >
    ${escapeSvg(artistName)}
  </text>

  <rect
    x="255"
    y="485"
    width="570"
    height="570"
    rx="28"
    fill="#f4c76b"
    opacity="0.18"
    filter="url(#glow)"
  />

  <rect
    x="285"
    y="515"
    width="510"
    height="510"
    rx="20"
    fill="#ffffff"
  />

  <image
    href="${qrUrl}"
    x="325"
    y="555"
    width="430"
    height="430"
  />

  <text
    x="540"
    y="935"
    text-anchor="middle"
    font-family="Arial"
    font-size="28"
    font-weight="700"
    fill="#ffffff"
  >
    Scan to browse the setlist and request a song.
  </text>

  <text
    x="540"
    y="985"
    text-anchor="middle"
    font-family="Arial"
    font-size="26"
    font-weight="700"
    fill="#f4c76b"
  >
    NO APP • NO LOGIN • INSTANT REQUESTS
  </text>

  <text
    x="540"
    y="1035"
    text-anchor="middle"
    font-family="Arial"
    font-size="22"
    fill="#ffffff"
  >
    Request tonight's songs. Influence tomorrow's setlist.
  </text>

</svg>`;

  return new NextResponse(svg, {
    headers: {
      "Content-Type": "image/svg+xml",
      "Content-Disposition": `attachment; filename="${artist.artist_slug}-social.svg"`
    }
  });
}