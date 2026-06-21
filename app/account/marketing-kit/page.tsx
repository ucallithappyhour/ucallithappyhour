"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabase";

type Artist = {
  artist_slug: string;
  artist_name: string | null;
  referral_code: string | null;
  logo_url: string | null;
};

export default function MarketingKitPage() {
  const [artist, setArtist] = useState<Artist | null>(null);
  const [message, setMessage] = useState("Loading your marketing kit...");
  const [copied, setCopied] = useState("");

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
      .select("artist_slug, artist_name, referral_code, logo_url")
      .eq("owner_email", user.email)
      .maybeSingle();

    if (error || !data) {
      setMessage("Artist not found.");
      return;
    }

    setArtist(data);
    setMessage("");
  }

  async function copyText(label: string, value: string) {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(label);
      setTimeout(() => setCopied(""), 1800);
    } catch {
      setCopied("Copy failed");
      setTimeout(() => setCopied(""), 1800);
    }
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

  const artistName = artist.artist_name || artist.artist_slug;

  const artistPageUrl = `https://www.ucallithappyhour.com/${artist.artist_slug}`;
  const requestSongUrl = `https://www.ucallithappyhour.com/${artist.artist_slug}/request-song`;
  const referralUrl = `https://www.ucallithappyhour.com/register?ref=${
    artist.referral_code || ""
  }`;

  const artistQrUrl = `https://quickchart.io/qr?text=${encodeURIComponent(
    artistPageUrl
  )}&size=300`;

  const referralQrUrl = `https://quickchart.io/qr?text=${encodeURIComponent(
    referralUrl
  )}&size=300`;

  async function copyReferralMessage() {
    const referralMessage = `Hey! I've been using U Call It Happy Hour to take song requests during my shows.

If you sign up using my referral link you'll save $20 and I'll earn a referral reward.

${referralUrl}`;

    await copyText("Referral Message", referralMessage);
  }

  const cardStyle = {
    padding: 20,
    borderRadius: 14,
    background: "#fff",
    color: "#000",
    textAlign: "center" as const
  };

  return (
    <main className="page">
      <div className="overlay">
        <div className="container">
          <section
            className="accountCard"
            style={{ maxWidth: 760, margin: "0 auto" }}
          >
            <h1
              style={{
                textAlign: "center",
                fontSize: 52,
                fontWeight: 900,
                color: "#fff",
                marginBottom: 6,
                lineHeight: 1.05
              }}
            >
              {artistName}
            </h1>

            <div
              style={{
                textAlign: "center",
                fontSize: 26,
                fontWeight: 700,
                color: "#d4af37",
                marginBottom: 22
              }}
            >
              Marketing Kit
            </div>

            {artist.logo_url && (
              <div style={{ textAlign: "center", marginBottom: 16 }}>
                <img
                  src={artist.logo_url}
                  alt={artistName}
                  style={{
                    width: "100%",
                    maxWidth: 340,
                    maxHeight: 340,
                    objectFit: "contain"
                  }}
                />
              </div>
            )}

            <div style={{ textAlign: "center", marginBottom: 26 }}>
              <Link
                href={`/${artist.artist_slug}`}
                style={{
                  color: "#d4af37",
                  fontWeight: 800,
                  textDecoration: "none"
                }}
              >
                View Public Artist Page →
              </Link>
            </div>

            <p
              style={{
                textAlign: "center",
                fontSize: 18,
                marginBottom: 10,
                fontWeight: 700
              }}
            >
              Everything you need to promote your shows.
            </p>

            {copied && (
              <div
                style={{
                  marginTop: 16,
                  padding: "10px 14px",
                  borderRadius: 12,
                  background: "#12351f",
                  border: "1px solid #2f8f4e",
                  color: "#fff",
                  fontWeight: 700,
                  textAlign: "center"
                }}
              >
                {copied === "Copy failed" ? "Copy failed." : `Copied ${copied}.`}
              </div>
            )}

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr",
                gap: 24,
                maxWidth: 520,
                margin: "30px auto 0"
              }}
            >
              <div style={cardStyle}>
                <h2>🎵 Artist QR Code</h2>
                <p>Fans scan this to request songs.</p>

                <div
                  style={{
                    position: "relative",
                    width: 260,
                    maxWidth: "100%",
                    margin: "0 auto"
                  }}
                >
                  <img
                    src={artistQrUrl}
                    alt="Artist QR Code"
                    width="260"
                    height="260"
                    style={{ maxWidth: "100%", height: "auto" }}
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

                <p style={{ fontSize: 13, fontWeight: 700, marginTop: 10 }}>
                  Scan to Request Songs
                </p>

                <div style={{ display: "grid", gap: 10, marginTop: 14 }}>
                  <a
                    className="btn"
                    href={artistQrUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Open / Print QR →
                  </a>

                  <button
                    className="btn"
                    type="button"
                    onClick={() => copyText("Artist Page URL", artistPageUrl)}
                  >
                    📋 Copy Artist URL
                  </button>

                  <button
                    className="btn"
                    type="button"
                    onClick={() => copyText("Request Song URL", requestSongUrl)}
                  >
                    📋 Copy Request URL
                  </button>
                </div>
              </div>

              <div style={cardStyle}>
                <h2>💰 Earn $20 Per Artist</h2>

                <div
                  style={{
                    background: "#f4f4f4",
                    borderRadius: 12,
                    padding: 14,
                    marginBottom: 16,
                    fontWeight: 700
                  }}
                >
                  <div>🎸 1 Artist = $20</div>
                  <div>🎸 5 Artists = $100</div>
                  <div>🎸 10 Artists = $200</div>
                </div>

                <p style={{ lineHeight: 1.5, marginBottom: 16 }}>
                  When another artist joins using your referral link, they save
                  $20 and you earn a $20 referral reward.
                </p>

                <div
                  style={{
                    position: "relative",
                    width: 260,
                    maxWidth: "100%",
                    margin: "0 auto"
                  }}
                >
                  <img
                    src={referralQrUrl}
                    alt="Referral QR Code"
                    width="260"
                    height="260"
                    style={{ maxWidth: "100%", height: "auto" }}
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

                <p style={{ fontSize: 13, fontWeight: 700, marginTop: 10 }}>
                  Scan to Join & Save $20
                </p>

                <div style={{ display: "grid", gap: 10, marginTop: 14 }}>
                  <a
                    className="btn"
                    href={referralQrUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Open / Print QR →
                  </a>

                  <button
                    className="btn"
                    type="button"
                    onClick={() => copyText("Referral URL", referralUrl)}
                  >
                    📋 Copy Referral URL
                  </button>

                  <button
                    className="btn"
                    type="button"
                    onClick={copyReferralMessage}
                  >
                    📨 Share Referral Message
                  </button>
                </div>
              </div>

              <div style={cardStyle}>
                <h2>🎤 Quick Start Guide</h2>

                <div
                  style={{
                    textAlign: "left",
                    lineHeight: 1.8,
                    maxWidth: 420,
                    margin: "0 auto",
                    fontSize: 16
                  }}
                >
                  <p>1. Print or save your Artist QR Code.</p>
                  <p>2. Display it at your next performance.</p>
                  <p>3. Mention it to the audience during your set.</p>
                  <p>4. Share your Referral QR Code with other artists.</p>
                </div>
              </div>

              <div style={cardStyle}>
                <h2>📦 Marketing Materials</h2>

                <p style={{ lineHeight: 1.5, marginBottom: 20 }}>
                  Print these for shows or share them online.
                </p>

                <div
                  style={{
                    display: "grid",
                    gap: 18,
                    maxWidth: 420,
                    margin: "0 auto"
                  }}
                >
                  <div>
                    <a
                      className="btn"
                      href={`/api/marketing/table-tent?artist=${artist.artist_slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      🖨 Download Table Tent
                    </a>

                    <p style={{ marginTop: 8, fontSize: 14, opacity: 0.8 }}>
                      Perfect for tables and bar tops.
                    </p>
                  </div>

                  <div>
                    <a
                      className="btn"
                      href={`/api/marketing/flyer?artist=${artist.artist_slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      📄 Download Flyer
                    </a>

                    <p style={{ marginTop: 8, fontSize: 14, opacity: 0.8 }}>
                      Hang at venues or share before a show.
                    </p>
                  </div>

                  <div>
                    <a
                      className="btn"
                      href={`/api/marketing/social?artist=${artist.artist_slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      📱 Download Social Graphic
                    </a>

                    <p style={{ marginTop: 8, fontSize: 14, opacity: 0.8 }}>
                      Post on Facebook, Instagram, or your story.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="actions" style={{ marginTop: 28 }}>
              <Link className="btn" href="/account">
                ← Back to Account
              </Link>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}