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

    const plainQr = await QRCode.toDataURL(artistPageUrl, {
      width: 900,
      margin: 2,
      errorCorrectionLevel: "H"
    });

    const brandedQr = await addLogoToQr(plainQr, "/ucallit-qr-logo.png");

    setQrUrl(brandedQr);
    setMessage("");
  }

  function getLogoSrc() {
    return artist?.logo_url || "/ucallit-logo.png.png";
  }

  function loadImage(src: string): Promise<HTMLImageElement | null> {
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => resolve(img);
      img.onerror = () => resolve(null);
      img.src = src;
    });
  }

  function addLogoToQr(qrDataUrl: string, logoSrc: string): Promise<string> {
    return new Promise((resolve) => {
      const qrImage = new Image();
      qrImage.crossOrigin = "anonymous";

      qrImage.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = 900;
        canvas.height = 900;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve(qrDataUrl);
          return;
        }

        ctx.drawImage(qrImage, 0, 0, 900, 900);

        const logoImage = new Image();
        logoImage.crossOrigin = "anonymous";

        logoImage.onload = () => {
          const boxSize = 190;
          const logoSize = 150;
          const boxX = (900 - boxSize) / 2;
          const boxY = (900 - boxSize) / 2;
          const logoX = (900 - logoSize) / 2;
          const logoY = (900 - logoSize) / 2;

          ctx.fillStyle = "#ffffff";
          ctx.fillRect(boxX, boxY, boxSize, boxSize);
          ctx.drawImage(logoImage, logoX, logoY, logoSize, logoSize);

          resolve(canvas.toDataURL("image/png"));
        };

        logoImage.onerror = () => resolve(qrDataUrl);
        logoImage.src = logoSrc;
      };

      qrImage.onerror = () => resolve(qrDataUrl);
      qrImage.src = qrDataUrl;
    });
  }

  function downloadQRCode() {
    if (!qrUrl || !artist) return;

    const link = document.createElement("a");
    link.href = qrUrl;
    link.download = `${artist.artist_slug}-qr-code.png`;
    link.click();
  }

  async function downloadTableTent() {
    if (!artist || !qrUrl) return;

    const logo = await loadImage(getLogoSrc());

    const pdf = new jsPDF({
      orientation: "landscape",
      unit: "mm",
      format: "letter"
    });

    const centerX = 139.5;

    pdf.setFillColor(10, 10, 10);
    pdf.rect(0, 0, 279, 216, "F");

    pdf.setTextColor(212, 175, 55);
    pdf.setFontSize(20);
    pdf.text("U CALL IT HAPPY HOUR", centerX, 22, { align: "center" });

    if (logo) {
      pdf.addImage(logo, "PNG", 118.5, 30, 42, 42);
    }

    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(32);
    pdf.text(artist.artist_name || "Artist", centerX, 82, {
      align: "center"
    });

    pdf.setTextColor(212, 175, 55);
    pdf.setFontSize(18);
    pdf.text("SCAN TO REQUEST SONGS", centerX, 100, {
      align: "center"
    });

    pdf.addImage(qrUrl, "PNG", 99.5, 110, 80, 80);

    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(15);
    pdf.text("Influence Tomorrow's Setlist", centerX, 200, {
      align: "center"
    });

    pdf.setFontSize(11);
    pdf.text(`ucallithappyhour.com/${artist.artist_slug}`, centerX, 209, {
      align: "center"
    });

    pdf.save(`${artist.artist_slug}-table-tent.pdf`);
  }

  async function downloadFlyer() {
    if (!artist || !qrUrl) return;

    const logo = await loadImage(getLogoSrc());

    const pdf = new jsPDF();
    const centerX = 105;

    pdf.setFillColor(10, 10, 10);
    pdf.rect(0, 0, 210, 297, "F");

    pdf.setTextColor(212, 175, 55);
    pdf.setFontSize(18);
    pdf.text("U CALL IT HAPPY HOUR", centerX, 24, { align: "center" });

    if (logo) {
      pdf.addImage(logo, "PNG", 78, 35, 54, 54);
    }

    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(32);
    pdf.text(artist.artist_name || "Artist", centerX, 105, {
      align: "center"
    });

    pdf.setTextColor(212, 175, 55);
    pdf.setFontSize(19);
    pdf.text("SCAN TO REQUEST SONGS", centerX, 123, {
      align: "center"
    });

    pdf.addImage(qrUrl, "PNG", 45, 138, 120, 120);

    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(17);
    pdf.text("Influence Tomorrow's Setlist", centerX, 272, {
      align: "center"
    });

    pdf.setFontSize(12);
    pdf.text(`ucallithappyhour.com/${artist.artist_slug}`, centerX, 286, {
      align: "center"
    });

    pdf.save(`${artist.artist_slug}-flyer.pdf`);
  }

  async function downloadSocialGraphic() {
    if (!artist || !qrUrl) return;

    const logo = await loadImage(getLogoSrc());
    const qrImage = await loadImage(qrUrl);

    const canvas = document.createElement("canvas");
    canvas.width = 1080;
    canvas.height = 1080;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.fillStyle = "#0b0b0b";
    ctx.fillRect(0, 0, 1080, 1080);

    ctx.textAlign = "center";

    ctx.fillStyle = "#d4af37";
    ctx.font = "bold 44px Arial";
    ctx.fillText("U CALL IT HAPPY HOUR", 540, 75);

    if (logo) {
      ctx.drawImage(logo, 420, 105, 240, 240);
    }

    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 76px Arial";
    ctx.fillText(artist.artist_name || "Artist", 540, 410);

    ctx.fillStyle = "#d4af37";
    ctx.font = "bold 48px Arial";
    ctx.fillText("SCAN TO REQUEST SONGS", 540, 485);

    if (qrImage) {
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(310, 525, 460, 460);
      ctx.drawImage(qrImage, 330, 545, 420, 420);
    }

    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 34px Arial";
    ctx.fillText("Influence Tomorrow's Setlist", 540, 1020);

    ctx.font = "26px Arial";
    ctx.fillText(`ucallithappyhour.com/${artist.artist_slug}`, 540, 1055);

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
                    
                    <img
                      src={qrUrl}
                      alt="Artist QR Code"
                      style={{
                        width: 260,
                        marginTop: 20,
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