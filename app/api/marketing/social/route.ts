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
  )}&size=500`;

  const svg = `
<svg width="1080" height="1080" xmlns="http://www.w3.org/2000/svg">

  <rect width="1080" height="1080" fill="#0b0b0b"/>

  <text
    x="540"
    y="70"
    text-anchor="middle"
    font-family="Arial"
    font-size="28"
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
    x="315"
    y="90"
    width="450"
    height="220"
    preserveAspectRatio="xMidYMid meet"
  />
  `
      : ""
  }

  <text
    x="540"
    y="360"
    text-anchor="middle"
    font-family="Arial"
    font-size="84"
    font-weight="900"
    fill="#ffffff"
  >
    REQUEST A SONG
  </text>

  <text
    x="540"
    y="430"
    text-anchor="middle"
    font-family="Arial"
    font-size="44"
    font-weight="700"
    fill="#f4c76b"
  >
    ${escapeSvg(artistName)}
  </text>

  <rect
    x="295"
    y="470"
    width="490"
    height="490"
    rx="20"
    fill="#ffffff"
    stroke="#f4c76b"
    stroke-width="6"
  />

  <image
    href="${qrUrl}"
    x="330"
    y="505"
    width="420"
    height="420"
  />

  <text
    x="540"
    y="995"
    text-anchor="middle"
    font-family="Arial"
    font-size="30"
    font-weight="700"
    fill="#ffffff"
  >
    NO APP • NO LOGIN • INSTANT REQUESTS
  </text>

  <text
    x="540"
    y="1040"
    text-anchor="middle"
    font-family="Arial"
    font-size="22"
    fill="#f4c76b"
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