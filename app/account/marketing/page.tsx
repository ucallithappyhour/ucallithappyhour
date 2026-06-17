"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";
import Link from "next/link";
import { jsPDF } from "jspdf";
import { supabase } from "../../../lib/supabase";

type Artist = {
  artist_slug: string;
  artist_name: string | null;
  logo_url?: string | null;
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
      .select("artist_slug, artist_name, logo_url")
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

  function downloadTableTent() {
    if (!artist) return;

    const pdf = new jsPDF({
      orientation: "landscape",
      unit: "mm",
      format: "letter"
    });

    pdf.setFontSize(22);
    pdf.text("U CALL IT HAPPY HOUR", 20, 25);

    pdf.setFontSize(28);
    pdf.text(artist.artist_name || "Artist", 20, 50);

    pdf.setFontSize(14);
    pdf.text("Request Tonight's Songs", 20, 65);

    pdf.text(`ucallithappyhour.com/${artist.artist_slug}`, 20, 80);

    pdf.save(`${artist.artist_slug}-table-tent.pdf`);
  }

  function downloadFlyer() {
    if (!artist) return;

    const pdf = new jsPDF();

    pdf.setFontSize(30);
    pdf.text(artist.artist_name || "Artist", 20, 35);

    pdf.setFontSize(18);
    pdf.text("Request Tonight's Songs", 20, 55);

    pdf.text("Influence Tomorrow's Setlist", 20, 70);

    pdf.text(`ucallithappyhour.com/${artist.artist_slug}`, 20, 95);

    pdf.save(`${artist.artist_slug}-flyer.pdf`);
  }

  function downloadSocialGraphic() {
    if (!artist) return;

    const canvas = document.createElement("canvas");
    canvas.width = 1080;
    canvas.height = 1080;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.fillStyle = "#111";
    ctx.fillRect(0, 0, 1080, 1080);

    ctx.fillStyle = "#fff";
    ctx.font = "bold 70px Arial";
    ctx.fillText(artist.artist_name || "Artist", 60, 150);

    ctx.font = "40px Arial";
    ctx.fillText("Request Tonight's Songs", 60, 230);

    ctx.font = "34px Arial";
    ctx.fillText(`ucallithappyhour.com/${artist.artist_slug}`, 60, 310);

    const link = document.createElement("a");
    link.href = canvas.toDataURL("image/png");
    link.download = `${artist.artist_slug}-social.png`;
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
              Download your QR code and promotional materials to share your
              request page with fans.
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
                    {artist.logo_url && (
                      <img
                        src={artist.logo_url}
                        alt="Artist Logo"
                        style={{
                          width: 200,
                          maxWidth: "100%",
                          marginBottom: 20,
                          borderRadius: 12
                        }}
                      />
                    )}

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

                    <div
                      style={{
                        display: "grid",
                        gap: 12,
                        marginTop: 20
                      }}
                    >
                      <button className="btn" onClick={downloadQRCode}>
                        📱 Download QR Code
                      </button>

                      <button
                        className="btn secondary"
                        onClick={downloadTableTent}
                      >
                        🖨️ Download Table Tent
                      </button>

                      <button className="btn secondary" onClick={downloadFlyer}>
                        📄 Download Flyer
                      </button>

                      <button
                        className="btn secondary"
                        onClick={downloadSocialGraphic}
                      >
                        📣 Download Social Graphic
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