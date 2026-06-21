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
    <radialGradient id="bg" cx="50%" cy="20%" r="85%">
      <stop offset="0%" stop-color="#33280f"/>
      <stop offset="45%" stop-color="#111111"/>
      <stop offset="100%" stop-color="#050505"/>
    </radialGradient>

    <linearGradient id="gold" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#8f6f1f"/>
      <stop offset="50%" stop-color="#d4af37"/>
      <stop offset="100%" stop-color="#8f6f1f"/>
    </linearGradient>
  </defs>

  <rect width="1080" height="1080" fill="url(#bg)"/>

  <rect x="50" y="50" width="980" height="980" rx="36" fill="none" stroke="#d4af37" stroke-width="6"/>
  <rect x="78" y="78" width="924" height="924" rx="28" fill="none" stroke="#ffffff" stroke-opacity="0.08" stroke-width="2"/>

  ${
    logoUrl
      ? `<image href="${escapeSvg(
          logoUrl
        )}" x="190" y="85" width="700" height="270" preserveAspectRatio="xMidYMid meet"/>`
      : `<text x="540" y="240" text-anchor="middle" font-family="Arial Black, Arial" font-size="74" font-weight="900" fill="#ffffff">${escapeSvg(
          artistName
        ).toUpperCase()}</text>`
  }

  <rect x="120" y="370" width="840" height="92" rx="46" fill="url(#gold)"/>
  <text x="540" y="432" text-anchor="middle" font-family="Arial Black, Arial" font-size="52" font-weight="900" fill="#060606">
    REQUEST SONGS LIVE
  </text>

  <text x="540" y="515" text-anchor="middle" font-family="Arial" font-size="34" font-weight="700" fill="#ffffff">
    Scan to browse tonight's setlist
  </text>
  <text x="540" y="558" text-anchor="middle" font-family="Arial" font-size="34" font-weight="700" fill="#ffffff">
    and send a request instantly
  </text>

  <rect x="130" y="620" width="405" height="405" rx="26" fill="#d4af37"/>
  <rect x="150" y="640" width="365" height="365" rx="18" fill="#ffffff"/>
  <image href="${escapeSvg(qrUrl)}" x="175" y="665" width="315" height="315"/>

  <rect x="575" y="620" width="375" height="405" rx="26" fill="#111111" stroke="#d4af37" stroke-width="5"/>

  <text x="762" y="705" text-anchor="middle" font-family="Arial Black, Arial" font-size="40" font-weight="900" fill="#d4af37">
    NO APP
  </text>
  <text x="762" y="785" text-anchor="middle" font-family="Arial Black, Arial" font-size="40" font-weight="900" fill="#ffffff">
    NO LOGIN
  </text>
  <text x="762" y="865" text-anchor="middle" font-family="Arial Black, Arial" font-size="34" font-weight="900" fill="#d4af37">
    INSTANT
  </text>
  <text x="762" y="915" text-anchor="middle" font-family="Arial Black, Arial" font-size="34" font-weight="900" fill="#d4af37">
    REQUESTS
  </text>

  <text x="540" y="1048" text-anchor="middle" font-family="Arial" font-size="24" font-weight="900" fill="#d4af37">
    U CALL IT HAPPY HOUR
  </text>
</svg>`;

  return new NextResponse(svg, {
    headers: {
      "Content-Type": "image/svg+xml",
      "Content-Disposition": `attachment; filename="${artist.artist_slug}-social.svg"`
    }
  });
}