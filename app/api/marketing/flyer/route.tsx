import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { ImageResponse } from "next/og";

export const runtime = "edge";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

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
    .select("*")
    .eq("artist_slug", artistSlug)
    .single();

  if (!artist) {
    return NextResponse.json(
      { error: "Artist not found" },
      { status: 404 }
    );
  }

  const artistName =
    artist.artist_name || artist.artist_slug;

  const artistUrl =
    `https://www.ucallithappyhour.com/${artist.artist_slug}`;

  const qrUrl =
    `https://quickchart.io/qr?text=${encodeURIComponent(
      artistUrl
    )}&size=1200&margin=2`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "1080px",
          height: "1350px",
          background: "#050505",
          color: "white",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          padding: "50px 70px",
          fontFamily: "Arial, Helvetica, sans-serif"
        }}
      >
        {/* LOGO / BAND NAME */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            width: "100%",
            height: "340px"
          }}
        >
          {artist.logo_url ? (
            <img
              src={artist.logo_url}
              alt={artistName}
              style={{
                maxWidth: "900px",
                maxHeight: "320px",
                objectFit: "contain"
              }}
            />
          ) : (
            <div
              style={{
                fontSize: 90,
                fontWeight: 900,
                textAlign: "center",
                lineHeight: 1
              }}
            >
              {artistName.toUpperCase()}
            </div>
          )}
        </div>

        {/* LIVE TONIGHT */}
        <div
          style={{
            color: "#f2c14e",
            fontSize: 72,
            fontWeight: 900,
            marginTop: 10
          }}
        >
          LIVE TONIGHT
        </div>

        {/* REQUEST SONGS */}
        <div
          style={{
            fontSize: 56,
            fontWeight: 700,
            marginTop: 15,
            marginBottom: 30
          }}
        >
          REQUEST SONGS LIVE
        </div>

        {/* QR */}
        <div
          style={{
            background: "white",
            border: "12px solid #f2c14e",
            borderRadius: "30px",
            padding: "25px",
            display: "flex"
          }}
        >
          <img
            src={qrUrl}
            alt="QR"
            style={{
              width: "500px",
              height: "500px"
            }}
          />
        </div>

        {/* SCAN MESSAGE */}
        <div
          style={{
            marginTop: 35,
            fontSize: 34,
            textAlign: "center",
            lineHeight: 1.25,
            color: "#f3f3f3"
          }}
        >
          Scan to browse tonight's setlist
        </div>

        <div
          style={{
            fontSize: 34,
            textAlign: "center",
            lineHeight: 1.25,
            color: "#f3f3f3",
            marginBottom: 25
          }}
        >
          and request songs instantly.
        </div>

        {/* NO APP */}
        <div
          style={{
            color: "#f2c14e",
            fontSize: 34,
            fontWeight: 900,
            textAlign: "center"
          }}
        >
          NO APP • NO LOGIN • INSTANT REQUESTS
        </div>

        <div
          style={{
            width: "850px",
            height: "2px",
            background: "#f2c14e",
            marginTop: 25,
            marginBottom: 25
          }}
        />

        {/* TAGLINE */}
        <div
          style={{
            fontSize: 28,
            textAlign: "center",
            color: "#ffffff"
          }}
        >
          Request tonight's songs.
        </div>

        <div
          style={{
            fontSize: 28,
            textAlign: "center",
            color: "#ffffff"
          }}
        >
          Influence tomorrow's setlist.
        </div>

        <div
          style={{
            marginTop: 25,
            color: "#f2c14e",
            fontSize: 20,
            fontWeight: 800,
            letterSpacing: "1px"
          }}
        >
          POWERED BY U CALL IT HAPPY HOUR
        </div>
      </div>
    ),
    {
      width: 1080,
      height: 1350,
      headers: {
        "Content-Type": "image/png",
        "Content-Disposition":
          `attachment; filename="${artist.artist_slug}-flyer.png"`
      }
    }
  );
}