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
          background: "#070707",
          color: "#ffffff",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          padding: "44px",
          fontFamily: "Arial, Helvetica, sans-serif",
          textAlign: "center"
        }}
      >
        <div
          style={{
            width: "100%",
            height: "100%",
            border: "6px solid #f2c14e",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            padding: "34px 46px"
          }}
        >
          <div
            style={{
              width: "100%",
              borderTop: "3px solid #f2c14e",
              borderBottom: "3px solid #f2c14e",
              padding: "18px 0",
              marginBottom: "34px",
              display: "flex",
              justifyContent: "center"
            }}
          >
            <div
              style={{
                color: "#f2c14e",
                fontSize: 44,
                fontWeight: 900,
                letterSpacing: "8px"
              }}
            >
              LIVE MUSIC TONIGHT
            </div>
          </div>

          <div
            style={{
              width: "100%",
              height: "365px",
              background: "#111111",
              border: "3px solid #333333",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: "34px",
              padding: "22px"
            }}
          >
            {artist.logo_url ? (
              <img
                src={artist.logo_url}
                alt={artistName}
                style={{
                  maxWidth: "760px",
                  maxHeight: "230px",
                  objectFit: "contain",
                  marginBottom: "22px"
                }}
              />
            ) : null}

            <div
              style={{
                fontSize: artistName.length > 18 ? 58 : 74,
                fontWeight: 900,
                lineHeight: 1,
                letterSpacing: "2px",
                maxWidth: "900px"
              }}
            >
              {artistName.toUpperCase()}
            </div>
          </div>

          <div
            style={{
              color: "#f2c14e",
              fontSize: 58,
              fontWeight: 900,
              letterSpacing: "3px",
              marginBottom: "20px"
            }}
          >
            REQUEST SONGS LIVE
          </div>

          <div
            style={{
              fontSize: 30,
              color: "#eeeeee",
              marginBottom: "28px"
            }}
          >
            Scan the code. Pick a song. Send it to the artist.
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "#ffffff",
              border: "12px solid #f2c14e",
              padding: "24px",
              marginBottom: "30px"
            }}
          >
            <img
              src={qrUrl}
              alt="QR Code"
              style={{
                width: "430px",
                height: "430px"
              }}
            />
          </div>

          <div
            style={{
              width: "100%",
              background: "#f2c14e",
              color: "#070707",
              fontSize: 34,
              fontWeight: 900,
              letterSpacing: "2px",
              padding: "18px 0",
              marginBottom: "26px",
              display: "flex",
              justifyContent: "center"
            }}
          >
            NO APP • NO LOGIN • INSTANT REQUESTS
          </div>

          <div
            style={{
              fontSize: 24,
              color: "#dddddd",
              marginBottom: "auto"
            }}
          >
            Browse tonight&apos;s setlist and request songs in real time.
          </div>

          <div
            style={{
              width: "100%",
              borderTop: "2px solid #f2c14e",
              paddingTop: "20px",
              display: "flex",
              justifyContent: "center"
            }}
          >
            <div
              style={{
                color: "#f2c14e",
                fontSize: 20,
                fontWeight: 900,
                letterSpacing: "3px"
              }}
            >
              POWERED BY U CALL IT HAPPY HOUR
            </div>
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