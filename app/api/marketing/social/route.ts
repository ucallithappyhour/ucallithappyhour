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
  )}&size=560&margin=1`;

  const svg = `
<svg width="1080" height="1080" viewBox="0 0 1080 1080" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="spotlight" cx="50%" cy="20%" r="75%">
      <stop offset="0%" stop-color="#2a2412"/>
      <stop offset="45%" stop-color="#101010"/>
      <stop offset="100%" stop-color="#050505"/>
    </radialGradient>
  </defs>

  <rect width="1080" height="1080" fill="url(#spotlight)"/>

  <text x="540" y="64" text-anchor="middle" font-family="Arial" font-size="24" font-weight="800" fill="#d4af37">
    U CALL IT HAPPY HOUR
  </text>

  ${
    logoUrl
      ? `<image href="${escapeSvg(
          logoUrl
        )}" x="260" y="85" width="560" height="250" preserveAspectRatio="xMidYMid meet"/>`
      : ""
  }

  <text x="540" y="385" text-anchor="middle" font-family="Arial Black, Arial" font-size="54" font-weight="900" fill="#ffffff">
    ${escapeSvg(artistName).toUpperCase()}
  </text>

  <text x="540" y="470" text-anchor="middle" font-family="Arial Black, Arial" font-size="88" font-weight="900" fill="#d4af37">
    REQUEST A SONG
  </text>

  <text x="540" y="525" text-anchor="middle" font-family="Arial" font-size="30" font-weight="700" fill="#ffffff">
    Scan to browse the setlist and send a request.
  </text>

  <rect x="300" y="570" width="480" height="480" rx="28" fill="#d4af37"/>
  <rect x="320" y="590" width="440" height="440" rx="20" fill="#ffffff"/>

  <image href="${escapeSvg(qrUrl)}" x="350" y="620" width="380" height="380"/>

  <rect x="95" y="1000" width="890" height="46" rx="23" fill="#111111" stroke="#d4af37" stroke-width="3"/>

  <text x="540" y="1031" text-anchor="middle" font-family="Arial" font-size="25" font-weight="900" fill="#ffffff">
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