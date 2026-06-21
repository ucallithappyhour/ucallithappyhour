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

  const artistName = artist.artist_name || artist.artist_slug;

  const artistUrl = `https://www.ucallithappyhour.com/${artist.artist_slug}`;

  const qrUrl = `https://quickchart.io/qr?text=${encodeURIComponent(
    artistUrl
  )}&size=1200&margin=1`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "1080px",
          height: "1350px",
          background: "#050505",
          color: "#fff",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          padding: "40px 50px",
          fontFamily: "Arial",
          textAlign: "center"
        }}
      >
        {/* LOGO */}
        <div
          style={{
            height: "240px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: "10px"
          }}
        >
          {artist.logo_url ? (
            <img
              src={artist.logo_url}
              alt={artistName}
              style={{
                width: "520px",
                maxHeight: "230px",
                objectFit: "contain"
              }}
            />
          ) : (
            <div
              style={{
                fontSize: 74,
                fontWeight: 900
              }}
            >
              {artistName.toUpperCase()}
            </div>
          )}
        </div>

        {/* ARTIST NAME */}
        <div
          style={{
            color: "#ffffff",
            fontSize: "72px",
            fontWeight: 900,
            lineHeight: 1,
            marginBottom: "18px",
            maxWidth: "950px"
          }}
        >
          {artistName.toUpperCase()}
        </div>

        {/* HEADLINE */}
        <div
          style={{
            color: "#f2c14e",
            fontSize: "58px",
            fontWeight: 900,
            marginBottom: "25px"
          }}
        >
          REQUEST A SONG TONIGHT
        </div>

        {/* QR */}
        <div
          style={{
            background: "#fff",
            border: "14px solid #f2c14e",
            borderRadius: "30px",
            padding: "25px",
            display: "flex",
            marginBottom: "22px"
          }}
        >
          <img
            src={qrUrl}
            alt="QR"
            style={{
              width: "620px",
              height: "620px"
            }}
          />
        </div>

        {/* SCAN TEXT */}
        <div
          style={{
            color: "#ffffff",
            fontSize: "42px",
            fontWeight: 700,
            marginBottom: "18px"
          }}
        >
          SCAN TO REQUEST SONGS LIVE
        </div>

        {/* BENEFIT */}
        <div
          style={{
            color: "#f2c14e",
            fontSize: "34px",
            fontWeight: 900,
            marginBottom: "24px"
          }}
        >
          NO APP • NO LOGIN • INSTANT REQUESTS
        </div>

        {/* BRAND */}
        <div
          style={{
            color: "#888",
            fontSize: "22px",
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
        "Content-Disposition": `attachment; filename="${artist.artist_slug}-flyer.png"`
      }
    }
  );
}