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
    .select("artist_slug, artist_name")
    .eq("artist_slug", artistSlug)
    .single();

  if (!artist) {
    return NextResponse.json({ error: "Artist not found" }, { status: 404 });
  }

  const artistName = artist.artist_name || artist.artist_slug;
  const artistUrl = `https://www.ucallithappyhour.com/${artist.artist_slug}`;
  const qrUrl = `https://quickchart.io/qr?text=${encodeURIComponent(
    artistUrl
  )}&size=420`;

  const svg = `
<svg width="1080" height="1080" xmlns="http://www.w3.org/2000/svg">
  <rect width="1080" height="1080" fill="#0b0b0b"/>
  <text x="540" y="120" text-anchor="middle" font-family="Arial" font-size="34" font-weight="700" fill="#f4c76b">U CALL IT HAPPY HOUR</text>
  <text x="540" y="245" text-anchor="middle" font-family="Arial" font-size="72" font-weight="900" fill="#ffffff">REQUEST A SONG</text>
  <text x="540" y="330" text-anchor="middle" font-family="Arial" font-size="44" font-weight="700" fill="#f4c76b">${escapeSvg(
    artistName
  )}</text>

  <image href="${qrUrl}" x="330" y="390" width="420" height="420"/>

  <text x="540" y="875" text-anchor="middle" font-family="Arial" font-size="34" font-weight="700" fill="#ffffff">Scan to browse the setlist</text>
  <text x="540" y="930" text-anchor="middle" font-family="Arial" font-size="30" fill="#ffffff">No app. No login. Just pick a song.</text>
  <text x="540" y="1000" text-anchor="middle" font-family="Arial" font-size="24" fill="#f4c76b">Request tonight's songs. Influence tomorrow's setlist.</text>
</svg>`;

  return new NextResponse(svg, {
    headers: {
      "Content-Type": "image/svg+xml",
      "Content-Disposition": `attachment; filename="${artist.artist_slug}-social.svg"`
    }
  });
}