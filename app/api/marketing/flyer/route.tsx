import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { ImageResponse } from "next/og";
import { buildQrUrl } from "../../../lib/qr";

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

 const qrUrl = buildQrUrl(requestUrl, 900);

  return new ImageResponse(
    (
      <div
        style={{
          width: "1080px",
          height: "1350px",
          background: "#050505",
          color: "#ffffff",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          fontFamily: "Arial, Helvetica, sans-serif",
          padding: "54px 64px",
          textAlign: "center"
        }}
      >
        <div
          style={{
            width: "100%",
            height: "245px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: "22px"
          }}
        >
          {artist.logo_url ? (
            <img
              src={artist.logo_url}
              alt={artistName}
              style={{
                maxWidth: "780px",
                maxHeight: "230px",
                objectFit: "contain"
              }}
            />
          ) : (
            <div
              style={{
                fontSize: artistName.length > 18 ? 64 : 84,
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
            fontSize: 34,
            fontWeight: 900,
            letterSpacing: "8px",
            marginBottom: "18px"
          }}
        >
          LIVE TONIGHT
        </div>

        <div
          style={{
            fontSize: artistName.length > 18 ? 48 : 64,
            fontWeight: 900,
            lineHeight: 1,
            maxWidth: "920px",
            marginBottom: "34px"
          }}
        >
          {artistName.toUpperCase()}
        </div>

        <div
          style={{
            color: "#f2c14e",
            fontSize: 52,
            fontWeight: 900,
            letterSpacing: "1px",
            marginBottom: "26px"
          }}
        >
          SCAN TO REQUEST SONGS
        </div>

        <div
          style={{
            background: "#ffffff",
            border: "12px solid #f2c14e",
            borderRadius: "34px",
            padding: "26px",
            display: "flex",
            marginBottom: "34px"
          }}
        >
          <img
            src={qrUrl}
            alt="QR Code"
            style={{
              width: "500px",
              height: "500px"
            }}
          />
        </div>

        <div
          style={{
            fontSize: 32,
            lineHeight: 1.2,
            color: "#eeeeee",
            maxWidth: "820px",
            marginBottom: "28px"
          }}
        >
          Browse tonight&apos;s setlist and send your request live.
        </div>

        <div
          style={{
            background: "#f2c14e",
            color: "#050505",
            fontSize: 30,
            fontWeight: 900,
            letterSpacing: "1px",
            padding: "16px 34px",
            borderRadius: "999px",
            marginBottom: "auto"
          }}
        >
          NO APP • NO LOGIN
        </div>

        <div
          style={{
            color: "#f2c14e",
            fontSize: 20,
            fontWeight: 900,
            letterSpacing: "2px"
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