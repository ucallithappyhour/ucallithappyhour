import { NextRequest, NextResponse } from "next/server";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function fetchImageBytes(url: string) {
  const response = await fetch(url);
  if (!response.ok) return null;
  return response.arrayBuffer();
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const artistSlug = searchParams.get("artist");

  if (!artistSlug) {
    return NextResponse.json(
      { error: "Artist required" },
      { status: 400 }
    );
  }

  const { data: artist } = await supabase
    .from("artists")
    .select("*")
    .eq("artist_slug", artistSlug)
    .single();

  if (!artist) {
    return NextResponse.json(
      { error: "Artist not found" },
      { status: 404 }
    );
  }

  const artistName =
    (artist.artist_name || artist.artist_slug).toUpperCase();

  const artistUrl = `https://www.ucallithappyhour.com/${artist.artist_slug}`;

  const qrUrl = `https://quickchart.io/qr?text=${encodeURIComponent(
    artistUrl
  )}&size=900&margin=2`;

  const qrBytes = await fetchImageBytes(qrUrl);

  if (!qrBytes) {
    return NextResponse.json(
      { error: "Could not generate QR" },
      { status: 500 }
    );
  }

  const pdf = await PDFDocument.create();
  const page = pdf.addPage([792, 612]);

  const titleFont = await pdf.embedFont(StandardFonts.HelveticaBold);
  const bodyFont = await pdf.embedFont(StandardFonts.Helvetica);

  const qrImage = await pdf.embedPng(qrBytes);

  let artistLogoImage: any = null;

  if (artist.logo_url) {
    const logoBytes = await fetchImageBytes(artist.logo_url);

    if (logoBytes) {
      try {
        artistLogoImage = await pdf.embedPng(logoBytes);
      } catch {
        try {
          artistLogoImage = await pdf.embedJpg(logoBytes);
        } catch {
          artistLogoImage = null;
        }
      }
    }
  }

  const black = rgb(0.04, 0.04, 0.04);
  const gold = rgb(0.95, 0.76, 0.32);
  const white = rgb(1, 1, 1);
  const softWhite = rgb(0.92, 0.92, 0.92);

  page.drawRectangle({
    x: 0,
    y: 0,
    width: 792,
    height: 612,
    color: black
  });

  // Fold Line

  page.drawLine({
    start: { x: 396, y: 20 },
    end: { x: 396, y: 592 },
    thickness: 1,
    color: rgb(0.25, 0.25, 0.25)
  });

  // ==================================
  // LEFT PANEL
  // ==================================

  page.drawText("REQUEST A SONG TONIGHT", {
    x: 38,
    y: 525,
    size: 27,
    font: titleFont,
    color: gold
  });

  page.drawText(artistName, {
    x: 65,
    y: 475,
    size: 28,
    font: titleFont,
    color: white
  });

  if (artistLogoImage) {
    page.drawImage(artistLogoImage, {
      x: 85,
      y: 305,
      width: 230,
      height: 130
    });
  }

  page.drawText("Scan the QR code to browse", {
    x: 55,
    y: 250,
    size: 18,
    font: bodyFont,
    color: softWhite
  });

  page.drawText("tonight's setlist and send a request.", {
    x: 55,
    y: 223,
    size: 18,
    font: bodyFont,
    color: softWhite
  });

  page.drawText("- NO APP", {
    x: 55,
    y: 165,
    size: 22,
    font: titleFont,
    color: gold
  });

  page.drawText("- NO LOGIN", {
    x: 55,
    y: 125,
    size: 22,
    font: titleFont,
    color: gold
  });

  page.drawText("- INSTANT REQUESTS", {
    x: 55,
    y: 85,
    size: 22,
    font: titleFont,
    color: gold
  });

  page.drawText("Powered by U Call It Happy Hour", {
    x: 55,
    y: 38,
    size: 12,
    font: bodyFont,
    color: softWhite
  });

  // ==================================
  // RIGHT PANEL
  // ==================================

  page.drawText("SCAN TO REQUEST", {
    x: 455,
    y: 525,
    size: 28,
    font: titleFont,
    color: gold
  });

  page.drawText("A SONG", {
    x: 545,
    y: 485,
    size: 28,
    font: titleFont,
    color: white
  });

  const qrX = 485;
  const qrY = 205;
  const qrSize = 235;

  page.drawRectangle({
    x: qrX - 12,
    y: qrY - 12,
    width: qrSize + 24,
    height: qrSize + 24,
    color: white,
    borderColor: gold,
    borderWidth: 4
  });

  page.drawImage(qrImage, {
    x: qrX,
    y: qrY,
    width: qrSize,
    height: qrSize
  });

  page.drawText("Request tonight's songs.", {
    x: 485,
    y: 150,
    size: 18,
    font: bodyFont,
    color: softWhite
  });

  page.drawText("Influence tomorrow's setlist.", {
    x: 462,
    y: 125,
    size: 18,
    font: bodyFont,
    color: softWhite
  });

  page.drawText("SCAN NOW", {
    x: 535,
    y: 78,
    size: 18,
    font: titleFont,
    color: gold
  });

  const pdfBytes = await pdf.save();

  return new NextResponse(Buffer.from(pdfBytes), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${artist.artist_slug}-table-tent.pdf"`
    }
  });
}