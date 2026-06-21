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
  )}&size=620&margin=1`;

  return new ImageResponse(
    (
      <div
        style={{
          width: 1080,
          height: 1080,
          display: "flex",
          position: "relative",
          background:
            "radial-gradient(circle at 50% 24%, #3a2a0f 0%, #101010 45%, #050505 100%)",
          color: "white",
          fontFamily: "Arial",
          overflow: "hidden"
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 42,
            display: "flex",
            border: "7px solid #d4af37",
            borderRadius: 38
          }}
        />

        <div
          style={{
            position: "absolute",
            top: 62,
            left: 0,
            width: 1080,
            display: "flex",
            justifyContent: "center",
            fontSize: 24,
            fontWeight: 900,
            color: "#d4af37",
            letterSpacing: 3
          }}
        >
          U CALL IT HAPPY HOUR
        </div>

        <div
          style={{
            position: "absolute",
            top: 100,
            left: 240,
            width: 600,
            height: 165,
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
            <div style={{ display: "flex", fontSize: 64, fontWeight: 900 }}>
              {artistName.toUpperCase()}
            </div>
          )}
        </div>

        <div
          style={{
            position: "absolute",
            top: 270,
            left: 0,
            width: 1080,
            display: "flex",
            justifyContent: "center",
            fontSize: 56,
            fontWeight: 900,
            textShadow: "0 5px 0 #000"
          }}
        >
          {artistName.toUpperCase()}
        </div>

        <div
          style={{
            position: "absolute",
            top: 335,
            left: 220,
            width: 640,
            height: 54,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "#d4af37",
            color: "#050505",
            borderRadius: 999,
            fontSize: 26,
            fontWeight: 900,
            letterSpacing: 2
          }}
        >
          LIVE MUSIC REQUESTS
        </div>

        <div
          style={{
            position: "absolute",
            top: 410,
            left: 0,
            width: 1080,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            color: "#d4af37",
            fontWeight: 900,
            lineHeight: 0.9,
            textShadow: "0 6px 0 #000"
          }}
        >
          <div style={{ display: "flex", fontSize: 82 }}>REQUEST A</div>
          <div style={{ display: "flex", fontSize: 90 }}>SONG TONIGHT</div>
        </div>

        <div
          style={{
            position: "absolute",
            top: 570,
            left: 0,
            width: 1080,
            display: "flex",
            justifyContent: "center",
            fontSize: 28,
            fontWeight: 800
          }}
        >
          Scan to browse the setlist and send a request.
        </div>

        <div
          style={{
            position: "absolute",
            top: 625,
            left: 365,
            width: 350,
            height: 350,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "#d4af37",
            borderRadius: 30,
            boxShadow: "0 0 55px rgba(212,175,55,0.5)"
          }}
        >
          <div
            style={{
              width: 305,
              height: 305,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "#ffffff",
              borderRadius: 18
            }}
          >
            <img src={qrUrl} style={{ width: 268, height: 268 }} />
          </div>
        </div>

        <div
          style={{
            position: "absolute",
            bottom: 74,
            left: 0,
            width: 1080,
            display: "flex",
            justifyContent: "center",
            fontSize: 28,
            fontWeight: 900
          }}
        >
          NO APP | NO LOGIN | INSTANT REQUESTS
        </div>

        <div
          style={{
            position: "absolute",
            bottom: 38,
            left: 0,
            width: 1080,
            display: "flex",
            justifyContent: "center",
            fontSize: 22,
            fontWeight: 800,
            color: "#d4af37"
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