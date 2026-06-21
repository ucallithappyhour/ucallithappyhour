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
  maxWidth = 540
) {
  const width = font.widthOfTextAtSize(text, size);
  const x = Math.max((612 - width) / 2, 36);

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
    return NextResponse.json({ error: "Could not generate QR" }, { status: 500 });
  }

  const pdf = await PDFDocument.create();
  const page = pdf.addPage([612, 792]);

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
    width: 612,
    height: 792,
    color: black
  });

  if (artistLogoImage) {
    page.drawImage(artistLogoImage, {
      x: 216,
      y: 642,
      width: 180,
      height: 95
    });
  } else {
    drawCenteredText(page, artistName, 675, 38, titleFont, white);
  }

  drawCenteredText(page, "REQUEST A SONG TONIGHT", 590, 34, titleFont, gold);
  drawCenteredText(page, artistName, 540, 34, titleFont, white);
  drawCenteredText(
    page,
    "Scan to browse the setlist and send a request.",
    505,
    17,
    bodyFont,
    softWhite
  );

  const qrX = 171;
  const qrY = 265;
  const qrSize = 270;

  page.drawRectangle({
    x: qrX - 14,
    y: qrY - 14,
    width: qrSize + 28,
    height: qrSize + 28,
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
      size: 25,
      color: white
    });

    page.drawImage(centerLogoImage, {
      x: qrX + qrSize / 2 - 20,
      y: qrY + qrSize / 2 - 20,
      width: 40,
      height: 40
    });
  }

  const checkY = 205;
  drawCenteredText(page, "No App   No Login   Request Songs Instantly", checkY, 20, titleFont, gold);

  page.drawLine({
    start: { x: 82, y: 170 },
    end: { x: 530, y: 170 },
    thickness: 1,
    color: gold
  });

  drawCenteredText(
    page,
    "“Request tonight's songs.",
    130,
    24,
    bodyFont,
    gold
  );

  drawCenteredText(
    page,
    "Influence tomorrow's setlist.”",
    98,
    24,
    bodyFont,
    white
  );

  drawCenteredText(page, "U CALL IT HAPPY HOUR", 45, 12, titleFont, gold);

  const pdfBytes = await pdf.save();

  return new NextResponse(Buffer.from(pdfBytes), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${artist.artist_slug}-flyer.pdf"`
    }
  });
}