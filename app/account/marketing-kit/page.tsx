"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabase";

type Artist = {
  artist_slug: string;
  artist_name: string | null;
  referral_code: string | null;
};

export default function MarketingKitPage() {
  const [artist, setArtist] = useState<Artist | null>(null);
  const [message, setMessage] = useState("Loading your marketing kit...");

  useEffect(() => {
    loadArtist();
  }, []);

  async function loadArtist() {
    const {
      data: { user }
    } = await supabase.auth.getUser();

    if (!user?.email) {
      setMessage("Please log in to view your marketing kit.");
      return;
    }

    const { data, error } = await supabase
      .from("artists")
      .select("artist_slug, artist_name, referral_code")
      .eq("owner_email", user.email)
      .maybeSingle();

    if (error || !data) {
      setMessage("Artist not found.");
      return;
    }

    setArtist(data);
    setMessage("");
  }

  if (!artist) {
    return (
      <main className="page">
        <div className="overlay">
          <div className="container">
            <section
              className="accountCard"
              style={{ maxWidth: 760, margin: "0 auto" }}
            >
              <div className="brand">U CALL IT HAPPY HOUR</div>
              <h1 className="title">Marketing Kit</h1>
              <p className="tagline">{message}</p>

              {message.includes("log in") && (
                <div className="actions" style={{ marginTop: 24 }}>
                  <Link className="btn" href="/account">
                    Log In →
                  </Link>
                </div>
              )}
            </section>
          </div>
        </div>
      </main>
    );
  }

  const artistPageUrl = `https://www.ucallithappyhour.com/${artist.artist_slug}`;
  const referralUrl = `https://www.ucallithappyhour.com/register?ref=${
    artist.referral_code || ""
  }`;

  const artistQrUrl = `https://quickchart.io/qr?text=${encodeURIComponent(
    artistPageUrl
  )}&size=300`;

  const referralQrUrl = `https://quickchart.io/qr?text=${encodeURIComponent(
    referralUrl
  )}&size=300`;

  return (
    <main className="page">
      <div className="overlay">
        <div className="container">
          <section
            className="accountCard"
            style={{ maxWidth: 900, margin: "0 auto" }}
          >
            <div className="brand">U CALL IT HAPPY HOUR</div>

            <h1 className="title">Marketing Kit</h1>

            <p className="tagline">
              QR codes and links for {artist.artist_name || artist.artist_slug}.
            </p>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
                gap: 24,
                marginTop: 30
              }}
            >
              <div
                style={{
                  padding: 20,
                  borderRadius: 14,
                  background: "#fff",
                  color: "#000",
                  textAlign: "center"
                }}
              >
                <h2>🎵 Artist QR Code</h2>

                <p>Fans scan this to request songs.</p>

              <div
  style={{
    position: "relative",
    width: 260,
    height: 260,
    margin: "0 auto"
  }}
>
  <img
    src={artistQrUrl}
    alt="Artist QR Code"
    width="260"
    height="260"
    style={{
      maxWidth: "100%",
      height: "auto"
    }}
  />

  <img
    src="/ucallit-qr-logo.png"
    alt="U Call It Happy Hour"
    style={{
      position: "absolute",
      width: 54,
      height: 54,
      left: "50%",
      top: "50%",
      transform: "translate(-50%, -50%)",
      background: "#fff",
      borderRadius: "50%",
      padding: 3
    }}
  />
</div>

                <p style={{ wordBreak: "break-all", fontSize: 14 }}>
                  {artistPageUrl}
                </p>

                <a
                  className="btn"
                  href={artistQrUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Open / Print QR →
                </a>
              </div>

              <div
                style={{
                  padding: 20,
                  borderRadius: 14,
                  background: "#fff",
                  color: "#000",
                  textAlign: "center"
                }}
              >
                <h2>💰 Referral QR Code</h2>

                <p>Other artists scan this to join with your referral.</p>

              <div
  style={{
    position: "relative",
    width: 260,
    height: 260,
    margin: "0 auto"
  }}
>
  <img
    src={referralQrUrl}
    alt="Referral QR Code"
    width="260"
    height="260"
    style={{
      maxWidth: "100%",
      height: "auto"
    }}
  />

  <img
    src="/ucallit-qr-logo.png"
    alt="U Call It Happy Hour"
    style={{
      position: "absolute",
      width: 54,
      height: 54,
      left: "50%",
      top: "50%",
      transform: "translate(-50%, -50%)",
      background: "#fff",
      borderRadius: "50%",
      padding: 3
    }}
  />
</div>

                <p style={{ wordBreak: "break-all", fontSize: 14 }}>
                  {referralUrl}
                </p>

                <a
                  className="btn"
                  href={referralQrUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Open / Print QR →
                </a>
              </div>
            </div>

            <div
            style={{
                marginTop: 30,
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                gap: 16
            }}
            >
            <a
                className="btn"
                href={`/api/marketing/table-tent?artist=${artist.artist_slug}`}
                target="_blank"
                rel="noopener noreferrer"
            >
                🖨 Download Table Tent
            </a>

            <a
                className="btn"
                href={`/api/marketing/flyer?artist=${artist.artist_slug}`}
                target="_blank"
                rel="noopener noreferrer"
            >
                📄 Download Flyer
            </a>

            <a
                className="btn"
                href={`/api/marketing/social?artist=${artist.artist_slug}`}
                target="_blank"
                rel="noopener noreferrer"
            >
                📱 Download Social Graphic
            </a>
            </div>

            <div style={{ marginTop: 32 }}>
              <h2>🎤 Quick Use</h2>

              <ul>
                <li>Print or save your Artist QR Code.</li>
                <li>Display it at your next performance.</li>
                <li>Mention it to the audience at least twice during your set.</li>
                <li>Share your Referral QR Code with other artists.</li>
              </ul>
            </div>

            <div className="actions" style={{ marginTop: 28 }}>
              <Link className="btn" href="/account">
                Back to Account
              </Link>

              <Link className="btn secondary" href={`/${artist.artist_slug}`}>
                View Artist Page
              </Link>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}