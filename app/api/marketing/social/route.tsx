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
          width: 1080,
          height: 1080,
          display: "flex",
          position: "relative",
          overflow: "hidden",
          background: "#050505",
          color: "white",
          fontFamily: "Arial"
        }}
      >
        {/* Background glow */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            background:
              "radial-gradient(circle at 50% 25%, #4a3510 0%, #161616 38%, #050505 78%)"
          }}
        />

        {/* Stage lights */}
        <div
          style={{
            position: "absolute",
            left: -120,
            top: 150,
            width: 520,
            height: 820,
            display: "flex",
            background:
              "radial-gradient(circle, rgba(212,175,55,0.28) 0%, rgba(212,175,55,0.08) 35%, rgba(0,0,0,0) 70%)",
            transform: "rotate(-18deg)"
          }}
        />

        <div
          style={{
            position: "absolute",
            right: -120,
            top: 150,
            width: 520,
            height: 820,
            display: "flex",
            background:
              "radial-gradient(circle, rgba(212,175,55,0.22) 0%, rgba(212,175,55,0.07) 35%, rgba(0,0,0,0) 70%)",
            transform: "rotate(18deg)"
          }}
        />

        {/* Border */}
        <div
          style={{
            position: "absolute",
            inset: 44,
            display: "flex",
            border: "6px solid #d4af37",
            borderRadius: 36
          }}
        />

        {/* Inner content */}
        <div
          style={{
            position: "relative",
            zIndex: 2,
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            padding: "54px 74px 44px",
            boxSizing: "border-box"
          }}
        >
          <div
            style={{
              display: "flex",
              fontSize: 24,
              fontWeight: 900,
              letterSpacing: 3,
              color: "#d4af37",
              marginTop: 2
            }}
          >
            U CALL IT HAPPY HOUR
          </div>

          <div
            style={{
              width: 560,
              height: 170,
              marginTop: 16,
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
                  fontSize: 62,
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
              display: "flex",
              fontSize: 58,
              fontWeight: 900,
              lineHeight: 1,
              marginTop: 8,
              textAlign: "center",
              textShadow: "0 4px 0 #000"
            }}
          >
            {artistName.toUpperCase()}
          </div>

          <div
            style={{
              marginTop: 14,
              display: "flex",
              background: "#d4af37",
              color: "#050505",
              borderRadius: 999,
              padding: "10px 44px",
              fontSize: 24,
              fontWeight: 900,
              letterSpacing: 1
            }}
          >
            LIVE MUSIC REQUESTS
          </div>

          <div
            style={{
              marginTop: 22,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              color: "#d4af37",
              fontWeight: 900,
              textAlign: "center",
              lineHeight: 0.9,
              textShadow: "0 5px 0 #000"
            }}
          >
            <div style={{ display: "flex", fontSize: 82 }}>REQUEST A</div>
            <div style={{ display: "flex", fontSize: 92 }}>SONG TONIGHT</div>
          </div>

          <div
            style={{
              marginTop: 20,
              display: "flex",
              fontSize: 30,
              fontWeight: 800,
              textAlign: "center",
              color: "#ffffff"
            }}
          >
            Scan to browse the setlist and send a request.
          </div>

          <div
            style={{
              marginTop: 24,
              width: 380,
              height: 380,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "#d4af37",
              borderRadius: 30,
              boxShadow: "0 0 50px rgba(212,175,55,0.45)",
              padding: 18
            }}
          >
            <div
              style={{
                width: 330,
                height: 330,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "#ffffff",
                borderRadius: 20
              }}
            >
              <img
                src={qrUrl}
                style={{
                  width: 292,
                  height: 292
                }}
              />
            </div>
          </div>

          <div
            style={{
              marginTop: 24,
              display: "flex",
              fontSize: 30,
              fontWeight: 900,
              color: "#ffffff",
              textAlign: "center",
              letterSpacing: 0.5
            }}
          >
            NO APP | NO LOGIN | INSTANT REQUESTS
          </div>

          <div
            style={{
              marginTop: 10,
              display: "flex",
              fontSize: 23,
              fontWeight: 800,
              color: "#d4af37",
              textAlign: "center"
            }}
          >
            Request tonight&apos;s songs. Influence tomorrow&apos;s setlist.
          </div>
        </div>
      </div>
    ),
    {
      width: 1080,
      height: 1080
    }
  );
}