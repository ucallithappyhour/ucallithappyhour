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
          background: "#050505",
          color: "white",
          fontFamily: "Arial"
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            background:
              "radial-gradient(circle at 50% 22%, #4a3510 0%, #171717 38%, #050505 78%)"
          }}
        />

        <div
          style={{
            position: "absolute",
            left: -150,
            top: 185,
            width: 560,
            height: 740,
            display: "flex",
            background:
              "radial-gradient(circle, rgba(212,175,55,0.26) 0%, rgba(212,175,55,0.08) 38%, rgba(0,0,0,0) 70%)"
          }}
        />

        <div
          style={{
            position: "absolute",
            right: -150,
            top: 185,
            width: 560,
            height: 740,
            display: "flex",
            background:
              "radial-gradient(circle, rgba(212,175,55,0.22) 0%, rgba(212,175,55,0.07) 38%, rgba(0,0,0,0) 70%)"
          }}
        />

        <div
          style={{
            position: "absolute",
            inset: 36,
            display: "flex",
            border: "7px solid #d4af37",
            borderRadius: 38
          }}
        />

        <div
          style={{
            position: "relative",
            zIndex: 2,
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            padding: "42px 64px 36px",
            boxSizing: "border-box"
          }}
        >
          <div
            style={{
              width: 700,
              height: 245,
              marginTop: 4,
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
                  fontSize: 78,
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
              fontSize: 68,
              fontWeight: 900,
              lineHeight: 1,
              marginTop: 4,
              textAlign: "center",
              textShadow: "0 5px 0 #000"
            }}
          >
            {artistName.toUpperCase()}
          </div>

          <div
            style={{
              marginTop: 14,
              width: 760,
              height: 58,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "#d4af37",
              color: "#050505",
              borderRadius: 999,
              fontSize: 28,
              fontWeight: 900,
              letterSpacing: 2
            }}
          >
            LIVE MUSIC REQUESTS
          </div>

          <div
            style={{
              marginTop: 20,
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
            <div style={{ display: "flex", fontSize: 92 }}>REQUEST A</div>
            <div style={{ display: "flex", fontSize: 104 }}>SONG TONIGHT</div>
          </div>

          <div
            style={{
              marginTop: 18,
              display: "flex",
              fontSize: 32,
              fontWeight: 800,
              textAlign: "center",
              color: "#ffffff"
            }}
          >
            Scan to browse the setlist and send a request.
          </div>

          <div
            style={{
              marginTop: 22,
              width: 430,
              height: 430,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "#d4af37",
              borderRadius: 34,
              boxShadow: "0 0 60px rgba(212,175,55,0.5)",
              padding: 18
            }}
          >
            <div
              style={{
                width: 382,
                height: 382,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "#ffffff",
                borderRadius: 22
              }}
            >
              <img
                src={qrUrl}
                style={{
                  width: 338,
                  height: 338
                }}
              />
            </div>
          </div>

          <div
            style={{
              marginTop: 22,
              display: "flex",
              fontSize: 32,
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
              marginTop: 8,
              display: "flex",
              fontSize: 24,
              fontWeight: 800,
              color: "#d4af37",
              textAlign: "center"
            }}
          >
            Request tonight&apos;s songs. Influence tomorrow&apos;s setlist.
          </div>

          <div
            style={{
              marginTop: 10,
              display: "flex",
              fontSize: 22,
              fontWeight: 900,
              color: "#d4af37",
              letterSpacing: 2
            }}
          >
            U CALL IT HAPPY HOUR
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