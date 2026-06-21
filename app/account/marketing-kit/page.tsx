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
              QR codes, links, and downloads for{" "}
              {artist.artist_name || artist.artist_slug}.
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
                  fontWeight: 700
                }}
              >
                {copied === "Copy failed" ? "Copy failed." : `Copied ${copied}.`}
              </div>
            )}

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

                <p style={{ wordBreak: "break-all", fontSize: 13 }}>
                  {artistPageUrl}
                </p>

                <div
                  style={{
                    display: "grid",
                    gap: 10,
                    marginTop: 14
                  }}
                >
                  <a
                    className="btn"
                    href={artistQrUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Open / Print QR →
                  </a>

                  <button
                    className="btn secondary"
                    type="button"
                    onClick={() => copyText("Artist Page URL", artistPageUrl)}
                  >
                    Copy Artist Page URL
                  </button>

                  <button
                    className="btn secondary"
                    type="button"
                    onClick={() => copyText("Request Song URL", requestSongUrl)}
                  >
                    Copy Request Song URL
                  </button>
                </div>
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
                <h2>🎵 Give $20, Get $20</h2>

                <p
                    style={{
                        lineHeight: 1.5,
                        marginBottom: 16
                    }}
                    >
                        When another artist joins using your referral link,
                        they save $20 and you earn a $20 referral reward.
                    </p>

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

                <p style={{ wordBreak: "break-all", fontSize: 13 }}>
                  {referralUrl}
                </p>

                <div
                  style={{
                    display: "grid",
                    gap: 10,
                    marginTop: 14
                  }}
                >
                  <a
                    className="btn"
                    href={referralQrUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Open / Print QR →
                  </a>

                  <button
                    className="btn secondary"
                    type="button"
                    onClick={() => copyText("Referral URL", referralUrl)}
                  >
                    Copy Referral URL
                  </button>
                </div>
              </div>
            </div>

            <div style={{ marginTop: 34 }}>
              <h2>📣 Download Marketing Materials</h2>

              <p className="tagline" style={{ marginTop: 6 }}>
                Print these for shows or share them online.
              </p>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                  gap: 16,
                  marginTop: 18
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