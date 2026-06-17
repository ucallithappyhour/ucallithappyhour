"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";
import Link from "next/link";
import { supabase } from "../../../lib/supabase";

type Artist = {
  artist_slug: string;
  artist_name: string | null;
};

export default function MarketingKitPage() {
  const [artist, setArtist] = useState<Artist | null>(null);
  const [qrUrl, setQrUrl] = useState("");
  const [message, setMessage] = useState("Loading marketing kit...");

  useEffect(() => {
    loadArtist();
  }, []);

  async function loadArtist() {
    const {
      data: { user }
    } = await supabase.auth.getUser();

    if (!user?.email) {
      setMessage("Please log in first.");
      return;
    }

    const { data, error } = await supabase
      .from("artists")
      .select("artist_slug, artist_name")
      .eq("owner_email", user.email)
      .single();

    if (error || !data) {
      setMessage("Could not find your artist profile.");
      return;
    }

    setArtist(data);

    const artistPageUrl = `https://www.ucallithappyhour.com/${data.artist_slug}`;
    const qr = await QRCode.toDataURL(artistPageUrl, {
      width: 900,
      margin: 2
    });

    setQrUrl(qr);
    setMessage("");
  }

  function downloadQRCode() {
    if (!qrUrl || !artist) return;

    const link = document.createElement("a");
    link.href = qrUrl;
    link.download = `${artist.artist_slug}-qr-code.png`;
    link.click();
  }

  return (
    <main className="page">
      <div className="overlay">
        <div className="container">
          <div className="hero">
            <div className="brand">U Call It Happy Hour</div>

            <h1 className="title">Marketing Kit</h1>

            <p className="tagline">
              Download your QR code and share your request page with fans.
            </p>

            {message && <p>{message}</p>}

            {artist && (
              <div className="event-card" style={{ marginTop: 20 }}>
                <p className="performer">{artist.artist_name}</p>

                <p style={{ opacity: 0.8, marginTop: 8 }}>
                  Your request page:
                </p>

                <p style={{ wordBreak: "break-all", marginTop: 6 }}>
                  https://www.ucallithappyhour.com/{artist.artist_slug}
                </p>

                {qrUrl && (
                  <div style={{ textAlign: "center", marginTop: 25 }}>
                    <img
                      src={qrUrl}
                      alt="Artist QR Code"
                      style={{
                        width: 260,
                        maxWidth: "100%",
                        background: "#fff",
                        padding: 12,
                        borderRadius: 12
                      }}
                    />

                    <div style={{ marginTop: 20 }}>
                      <button className="btn" onClick={downloadQRCode}>
                        Download My QR Code
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            <div style={{ marginTop: 25 }}>
              <Link className="btn secondary" href="/account">
                Back to Account
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}