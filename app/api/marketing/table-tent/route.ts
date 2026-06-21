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

function drawCenteredText(
  page: any,
  text: string,
  y: number,
  size: number,
  font: any,
  color: any,
  pageWidth = 612
) {
  const width = font.widthOfTextAtSize(text, size);
  const x = Math.max((pageWidth - width) / 2, 24);

  page.drawText(text, {
    x,
    y,
    size,
    font,
    color
  });
}

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

  const qrBytes = await fetchImageBytes(qrUrl);

  if (!qrBytes) {
    return NextResponse.json(
      { error: "Could not generate QR" },
      { status: 500 }
    );
  }

  const pdf = await PDFDocument.create();

  // 8.5 x 11 landscape
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

  let centerLogoImage: any = null;

  const centerLogoUrl = `${new URL(req.url).origin}/ucallit-qr-logo.png`;
  const centerLogoBytes = await fetchImageBytes(centerLogoUrl);

  if (centerLogoBytes) {
    try {
      centerLogoImage = await pdf.embedPng(centerLogoBytes);
    } catch {
      centerLogoImage = null;
    }
  }

  const black = rgb(0.035, 0.035, 0.035);
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

  // Center fold/cut guide
  page.drawLine({
    start: { x: 396, y: 30 },
    end: { x: 396, y: 582 },
    thickness: 1,
    color: rgb(0.25, 0.25, 0.25)
  });

  // LEFT PANEL
  page.drawText("REQUEST A SONG", {
    x: 70,
    y: 520,
    size: 34,
    font: titleFont,
    color: gold
  });

  page.drawText(artistName.toUpperCase(), {
    x: 70,
    y: 475,
    size: 30,
    font: titleFont,
    color: white
  });

  if (artistLogoImage) {
    page.drawImage(artistLogoImage, {
      x: 115,
      y: 340,
      width: 170,
      height: 95
    });
  }

  page.drawText("Scan the QR code to browse", {
    x: 70,
    y: 285,
    size: 19,
    font: bodyFont,
    color: softWhite
  });

  page.drawText("tonight's setlist and send a request.", {
    x: 70,
    y: 258,
    size: 19,
    font: bodyFont,
    color: softWhite
  });

  page.drawText("NO APP", {
    x: 70,
    y: 190,
    size: 24,
    font: titleFont,
    color: gold
  });

  page.drawText("NO LOGIN", {
    x: 70,
    y: 152,
    size: 24,
    font: titleFont,
    color: gold
  });

  page.drawText("INSTANT REQUESTS", {
    x: 70,
    y: 114,
    size: 24,
    font: titleFont,
    color: gold
  });

  page.drawText("Powered by U Call It Happy Hour", {
    x: 70,
    y: 52,
    size: 13,
    font: titleFont,
    color: softWhite
  });

  // RIGHT PANEL
  page.drawText("SCAN TO REQUEST", {
    x: 475,
    y: 520,
    size: 30,
    font: titleFont,
    color: gold
  });

  page.drawText("A SONG", {
    x: 545,
    y: 482,
    size: 30,
    font: titleFont,
    color: white
  });

  const qrX = 490;
  const qrY = 210;
  const qrSize = 230;

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

  if (centerLogoImage) {
    page.drawCircle({
      x: qrX + qrSize / 2,
      y: qrY + qrSize / 2,
      size: 23,
      color: white
    });

    page.drawImage(centerLogoImage, {
      x: qrX + qrSize / 2 - 18,
      y: qrY + qrSize / 2 - 18,
      width: 36,
      height: 36
    });
  }

  page.drawText("Request tonight's songs.", {
    x: 485,
    y: 155,
    size: 18,
    font: bodyFont,
    color: softWhite
  });

  page.drawText("Influence tomorrow's setlist.", {
    x: 465,
    y: 130,
    size: 18,
    font: bodyFont,
    color: softWhite
  });

  page.drawText("No app. No login.", {
    x: 525,
    y: 82,
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