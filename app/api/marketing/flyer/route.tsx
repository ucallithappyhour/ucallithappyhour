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

  const { data: artist } = await supabase
    .from("artists")
    .select("*")
    .eq("artist_slug", artistSlug)
    .single();

  if (!artist) {
    return NextResponse.json({ error: "Artist not found" }, { status: 404 });
  }

  const artistName = artist.artist_name || artist.artist_slug;
  const artistUrl = `https://www.ucallithappyhour.com/${artist.artist_slug}`;

  const qrUrl = `https://quickchart.io/qr?text=${encodeURIComponent(
    artistUrl
  )}&size=900&margin=2`;

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
          justifyContent: "space-between",
          padding: "70px 80px",
          fontFamily: "Arial, Helvetica, sans-serif",
          textAlign: "center"
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center"
          }}
        >
          {artist.logo_url ? (
            <img
              src={artist.logo_url}
              alt={artistName}
              style={{
                width: "360px",
                maxHeight: "180px",
                objectFit: "contain",
                marginBottom: "55px"
              }}
            />
          ) : (
            <div
              style={{
                fontSize: 58,
                fontWeight: 900,
                marginBottom: "55px"
              }}
            >
              {artistName.toUpperCase()}
            </div>
          )}

          <div
            style={{
              color: "#f2c14e",
              fontSize: 58,
              fontWeight: 900,
              letterSpacing: "1px",
              marginBottom: "26px"
            }}
          >
            REQUEST A SONG TONIGHT
          </div>

          <div
            style={{
              fontSize: 70,
              fontWeight: 900,
              lineHeight: 1.05,
              maxWidth: "900px"
            }}
          >
            {artistName.toUpperCase()}
          </div>
        </div>

        <div
          style={{
            background: "white",
            border: "10px solid #f2c14e",
            borderRadius: "26px",
            padding: "28px",
            display: "flex"
          }}
        >
          <img
            src={qrUrl}
            alt="QR Code"
            style={{
              width: "520px",
              height: "520px"
            }}
          />
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center"
          }}
        >
          <div
            style={{
              fontSize: 34,
              lineHeight: 1.25,
              maxWidth: "850px",
              color: "#eeeeee",
              marginBottom: "36px"
            }}
          >
            Scan to browse tonight&apos;s setlist and request songs live.
          </div>

          <div
            style={{
              color: "#f2c14e",
              fontSize: 34,
              fontWeight: 900,
              letterSpacing: "1px",
              marginBottom: "42px"
            }}
          >
            NO APP • NO LOGIN • INSTANT REQUESTS
          </div>

          <div
            style={{
              width: "780px",
              height: "2px",
              background: "#f2c14e",
              marginBottom: "34px"
            }}
          />

          <div
            style={{
              fontSize: 32,
              marginBottom: "28px"
            }}
          >
            Request tonight&apos;s songs. Influence tomorrow&apos;s setlist.
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