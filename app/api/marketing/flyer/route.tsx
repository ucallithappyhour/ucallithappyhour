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
          background: "#090909",
          color: "white",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          padding: "58px 72px 52px",
          fontFamily: "Arial, Helvetica, sans-serif",
          textAlign: "center"
        }}
      >
        <div
          style={{
            height: "245px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: "16px"
          }}
        >
          {artist.logo_url ? (
            <img
              src={artist.logo_url}
              alt={artistName}
              style={{
                width: "460px",
                maxHeight: "235px",
                objectFit: "contain"
              }}
            />
          ) : (
            <div
              style={{
                fontSize: 66,
                fontWeight: 900,
                lineHeight: 1.05,
                maxWidth: "900px"
              }}
            >
              {artistName.toUpperCase()}
            </div>
          )}
        </div>

        <div
          style={{
            color: "#f2c14e",
            fontSize: 60,
            fontWeight: 900,
            letterSpacing: "1px",
            marginBottom: "26px"
          }}
        >
          REQUEST A SONG TONIGHT
        </div>

        <div
          style={{
            color: "#ffffff",
            fontSize: 72,
            fontWeight: 900,
            lineHeight: 1.05,
            maxWidth: "920px",
            marginBottom: "30px"
          }}
        >
          {artistName.toUpperCase()}
        </div>

        <div
          style={{
            background: "white",
            border: "12px solid #f2c14e",
            borderRadius: "28px",
            padding: "30px",
            display: "flex",
            marginBottom: "28px"
          }}
        >
          <img
            src={qrUrl}
            alt="QR Code"
            style={{
              width: "545px",
              height: "545px"
            }}
          />
        </div>

        <div
          style={{
            fontSize: 34,
            lineHeight: 1.2,
            maxWidth: "850px",
            color: "#eeeeee",
            marginBottom: "32px"
          }}
        >
          Scan to browse tonight&apos;s setlist and request songs live.
        </div>

        <div
          style={{
            color: "#f2c14e",
            fontSize: 36,
            fontWeight: 900,
            letterSpacing: "1px",
            marginBottom: "34px"
          }}
        >
          NO APP • NO LOGIN • INSTANT REQUESTS
        </div>

        <div
          style={{
            width: "780px",
            height: "2px",
            background: "#f2c14e",
            marginBottom: "30px"
          }}
        />

        <div
          style={{
            color: "#f2c14e",
            fontSize: 42,
            fontWeight: 900,
            letterSpacing: "1px",
            marginBottom: "22px"
          }}
        >
          REQUEST SONGS LIVE
        </div>

        <div
          style={{
            color: "#f2c14e",
            fontSize: 22,
            fontWeight: 900,
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