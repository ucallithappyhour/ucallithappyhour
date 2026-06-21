import { ImageResponse } from "next/og";
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "edge";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

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
  const artistUrl = `https://www.ucallithappyhour.com/${artist.artist_slug}`;

  const qrUrl = `https://quickchart.io/qr?text=${encodeURIComponent(
    artistUrl
  )}&size=520&margin=1`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "1080px",
          height: "1080px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          background:
            "radial-gradient(circle at top, #34270d 0%, #111 48%, #050505 100%)",
          color: "white",
          fontFamily: "Arial",
          position: "relative",
          padding: "54px",
          boxSizing: "border-box"
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: "40px",
            border: "6px solid #d4af37",
            borderRadius: "34px"
          }}
        />

        <div
          style={{
            fontSize: 24,
            fontWeight: 900,
            color: "#d4af37",
            letterSpacing: "2px",
            marginTop: 8
          }}
        >
          U CALL IT HAPPY HOUR
        </div>

        <div
          style={{
            width: 560,
            height: 210,
            marginTop: 20,
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}
        >
          {artist.logo_url ? (
            <img
              src={artist.logo_url}
              style={{
                maxWidth: "100%",
                maxHeight: "100%",
                objectFit: "contain"
              }}
            />
          ) : (
            <div
              style={{
                fontSize: 64,
                fontWeight: 900,
                textAlign: "center"
              }}
            >
              {artistName.toUpperCase()}
            </div>
          )}
        </div>

        <div
          style={{
            fontSize: 58,
            fontWeight: 900,
            marginTop: 18,
            textAlign: "center",
            lineHeight: 1
          }}
        >
          {artistName.toUpperCase()}
        </div>

        <div
          style={{
            marginTop: 22,
            background: "#d4af37",
            color: "#050505",
            borderRadius: 999,
            padding: "16px 48px",
            fontSize: 28,
            fontWeight: 900,
            letterSpacing: "1px"
          }}
        >
          LIVE MUSIC REQUESTS
        </div>

        <div
          style={{
            marginTop: 34,
            color: "#d4af37",
            fontSize: 76,
            fontWeight: 900,
            textAlign: "center",
            lineHeight: 0.95
          }}
        >
          REQUEST A<br />SONG TONIGHT
        </div>

        <div
          style={{
            marginTop: 20,
            fontSize: 28,
            fontWeight: 700,
            textAlign: "center"
          }}
        >
          Scan to browse the setlist and send a request.
        </div>

        <div
          style={{
            marginTop: 28,
            width: 330,
            height: 330,
            background: "#d4af37",
            borderRadius: 24,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 16
          }}
        >
          <div
            style={{
              width: 292,
              height: 292,
              background: "white",
              borderRadius: 16,
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}
          >
            <img
              src={qrUrl}
              style={{
                width: 260,
                height: 260
              }}
            />
          </div>
        </div>

        <div
          style={{
            marginTop: 24,
            fontSize: 28,
            fontWeight: 900,
            textAlign: "center"
          }}
        >
          NO APP | NO LOGIN | INSTANT REQUESTS
        </div>

        <div
          style={{
            marginTop: 12,
            fontSize: 22,
            fontWeight: 700,
            color: "#d4af37",
            textAlign: "center"
          }}
        >
          Request tonight&apos;s songs. Influence tomorrow&apos;s setlist.
        </div>
      </div>
    ),
    {
      width: 1080,
      height: 1080
    }
  );
}