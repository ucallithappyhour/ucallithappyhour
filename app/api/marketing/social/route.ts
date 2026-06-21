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
  )}&size=460&margin=1`;

  const svg = `
<svg width="1080" height="1080" viewBox="0 0 1080 1080" xmlns="http://www.w3.org/2000/svg">

  <defs>
    <radialGradient id="bg" cx="50%" cy="18%" r="85%">
      <stop offset="0%" stop-color="#2b220f"/>
      <stop offset="55%" stop-color="#101010"/>
      <stop offset="100%" stop-color="#050505"/>
    </radialGradient>
  </defs>

  <rect width="1080" height="1080" fill="url(#bg)"/>

  <rect
    x="40"
    y="40"
    width="1000"
    height="1000"
    rx="34"
    fill="none"
    stroke="#d4af37"
    stroke-width="6"
  />

  <text
    x="540"
    y="92"
    text-anchor="middle"
    font-family="Arial"
    font-size="24"
    font-weight="900"
    fill="#d4af37"
  >
    U CALL IT HAPPY HOUR
  </text>

  ${
    logoUrl
      ? `
  <image
    href="${escapeSvg(logoUrl)}"
    x="340"
    y="115"
    width="400"
    height="180"
    preserveAspectRatio="xMidYMid meet"
  />
  `
      : ""
  }

  <text
    x="540"
    y="360"
    text-anchor="middle"
    font-family="Arial Black, Arial"
    font-size="62"
    font-weight="900"
    fill="#ffffff"
  >
    ${escapeSvg(artistName).toUpperCase()}
  </text>

  <rect
    x="250"
    y="390"
    width="580"
    height="52"
    rx="26"
    fill="#d4af37"
  />

  <text
    x="540"
    y="425"
    text-anchor="middle"
    font-family="Arial"
    font-size="24"
    font-weight="900"
    fill="#050505"
  >
    LIVE MUSIC INTERACTIVE REQUESTS
  </text>

  <text
    x="540"
    y="525"
    text-anchor="middle"
    font-family="Arial Black, Arial"
    font-size="84"
    font-weight="900"
    fill="#d4af37"
  >
    REQUEST A
  </text>

  <text
    x="540"
    y="610"
    text-anchor="middle"
    font-family="Arial Black, Arial"
    font-size="84"
    font-weight="900"
    fill="#d4af37"
  >
    SONG TONIGHT
  </text>

  <text
    x="540"
    y="665"
    text-anchor="middle"
    font-family="Arial"
    font-size="30"
    font-weight="700"
    fill="#ffffff"
  >
    Scan to browse the setlist and send a request.
  </text>

  <rect
    x="340"
    y="700"
    width="400"
    height="400"
    rx="22"
    fill="#d4af37"
  />

  <rect
    x="360"
    y="720"
    width="360"
    height="360"
    rx="14"
    fill="#ffffff"
  />

  <image
    href="${escapeSvg(qrUrl)}"
    x="385"
    y="745"
    width="310"
    height="310"
  />

  <text
    x="540"
    y="1045"
    text-anchor="middle"
    font-family="Arial Black, Arial"
    font-size="28"
    font-weight="900"
    fill="#ffffff"
  >
    NO APP | NO LOGIN | INSTANT REQUESTS
  </text>

  <text
    x="540"
    y="1080"
    text-anchor="middle"
    font-family="Arial"
    font-size="20"
    font-weight="700"
    fill="#d4af37"
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