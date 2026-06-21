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
  )}&size=700&margin=1`;

  return new ImageResponse(
    (
      <div
        style={{
          width: 1080,
          height: 1080,
          display: "flex",
          position: "relative",
          overflow: "hidden",
          background:
            "radial-gradient(circle at 50% 28%, #3b2a0d 0%, #111 45%, #050505 100%)",
          color: "white",
          fontFamily: "Arial"
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
            top: 70,
            left: 240,
            width: 600,
            height: 180,
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
                display: "flex",
                fontSize: 70,
                fontWeight: 900
              }}
            >
              {artistName.toUpperCase()}
            </div>
          )}
        </div>

        <div
          style={{
            position: "absolute",
            top: 260,
            left: 0,
            width: 1080,
            display: "flex",
            justifyContent: "center",
            fontSize: 58,
            fontWeight: 900,
            textShadow: "0 5px 0 #000"
          }}
        >
          {artistName.toUpperCase()}
        </div>

        <div
          style={{
            position: "absolute",
            top: 330,
            left: 170,
            width: 740,
            height: 64,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "#d4af37",
            color: "#050505",
            borderRadius: 999,
            fontSize: 30,
            fontWeight: 900,
            letterSpacing: 2
          }}
        >
          LIVE MUSIC REQUESTS
        </div>

        <div
          style={{
            position: "absolute",
            top: 420,
            left: 0,
            width: 1080,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            color: "#d4af37",
            fontWeight: 900,
            textAlign: "center",
            lineHeight: 0.88,
            textShadow: "0 6px 0 #000"
          }}
        >
          <div style={{ display: "flex", fontSize: 88 }}>REQUEST A</div>
          <div style={{ display: "flex", fontSize: 96 }}>SONG TONIGHT</div>
        </div>

        <div
          style={{
            position: "absolute",
            top: 590,
            left: 0,
            width: 1080,
            display: "flex",
            justifyContent: "center",
            fontSize: 30,
            fontWeight: 800
          }}
        >
          Scan to browse the setlist and send a request.
        </div>

        <div
          style={{
            position: "absolute",
            top: 640,
            left: 345,
            width: 390,
            height: 390,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "#d4af37",
            borderRadius: 32,
            boxShadow: "0 0 55px rgba(212,175,55,0.5)"
          }}
        >
          <div
            style={{
              width: 340,
              height: 340,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "#ffffff",
              borderRadius: 20
            }}
          >
            <img src={qrUrl} style={{ width: 300, height: 300 }} />
          </div>
        </div>

        <div
          style={{
            position: "absolute",
            bottom: 58,
            left: 0,
            width: 1080,
            display: "flex",
            justifyContent: "center",
            fontSize: 30,
            fontWeight: 900
          }}
        >
          NO APP | NO LOGIN | INSTANT REQUESTS
        </div>

        <div
          style={{
            position: "absolute",
            bottom: 26,
            left: 0,
            width: 1080,
            display: "flex",
            justifyContent: "center",
            fontSize: 22,
            fontWeight: 900,
            color: "#d4af37",
            letterSpacing: 2
          }}
        >
          U CALL IT HAPPY HOUR
        </div>
      </div>
    ),
    {
      width: 1080,
      height: 1080
    }
  );
}