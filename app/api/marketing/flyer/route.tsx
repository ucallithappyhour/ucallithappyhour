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
    return NextResponse.json({ error: "Artist required" }, { status: 400 });
  }

  const { data: artist, error } = await supabase
    .from("artists")
    .select("*")
    .eq("artist_slug", artistSlug)
    .single();

  if (error || !artist) {
    return NextResponse.json({ error: "Artist not found" }, { status: 404 });
  }

  const artistName = artist.artist_name || artist.artist_slug;
  const artistUrl = `https://www.ucallithappyhour.com/${artist.artist_slug}`;

  const qrUrl = `https://quickchart.io/qr?text=${encodeURIComponent(
    artistUrl
  )}&size=1000&margin=2`;

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
          fontFamily: "Arial, Helvetica, sans-serif",
          padding: "40px 60px",
          textAlign: "center"
        }}
      >
        <div
          style={{
            height: "280px",
            width: "100%",
            display: "flex",
            justifyContent: "center",
            alignItems: "center"
          }}
        >
          {artist.logo_url ? (
            <img
              src={artist.logo_url}
              alt={artistName}
              style={{
                maxWidth: "900px",
                maxHeight: "240px",
                objectFit: "contain"
              }}
            />
          ) : (
            <div
              style={{
                fontSize: 90,
                fontWeight: 900,
                lineHeight: 1
              }}
            >
              {artistName.toUpperCase()}
            </div>
          )}
        </div>

        <div
          style={{
            color: "#f2c14e",
            fontSize: 72,
            fontWeight: 900,
            marginTop: 10,
            letterSpacing: "1px"
          }}
        >
          LIVE TONIGHT
        </div>

        <div
          style={{
            fontSize: 56,
            fontWeight: 700,
            marginTop: 10,
            marginBottom: 30,
            lineHeight: 1.05,
            maxWidth: "940px"
          }}
        >
          {artistName.toUpperCase()}
        </div>

        <div
          style={{
            background: "#ffffff",
            border: "10px solid #f2c14e",
            borderRadius: "24px",
            padding: "20px",
            display: "flex"
          }}
        >
          <img
            src={qrUrl}
            alt="QR"
            style={{
              width: "450px",
              height: "450px"
            }}
          />
        </div>

        <div
          style={{
            marginTop: 30,
            color: "#f2c14e",
            fontSize: 48,
            fontWeight: 900,
            letterSpacing: "1px"
          }}
        >
          SCAN TO REQUEST SONGS
        </div>

        <div
          style={{
            marginTop: 15,
            fontSize: 28,
            color: "#e5e5e5",
            lineHeight: 1.25,
            maxWidth: "850px"
          }}
        >
          Browse tonight&apos;s setlist and submit requests live.
        </div>

        <div
          style={{
            marginTop: 30,
            color: "#f2c14e",
            fontSize: 30,
            fontWeight: 700,
            letterSpacing: "1px"
          }}
        >
          NO APP • NO LOGIN • INSTANT REQUESTS
        </div>

        <div
          style={{
            marginTop: "auto",
            width: "80%",
            height: "2px",
            background: "#f2c14e"
          }}
        />

        <div
          style={{
            marginTop: 25,
            fontSize: 18,
            color: "#f2c14e",
            letterSpacing: "2px",
            fontWeight: 700
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