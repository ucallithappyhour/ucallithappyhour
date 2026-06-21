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
  color: any
) {
  const width = font.widthOfTextAtSize(text, size);
  const x = Math.max((612 - width) / 2, 24);

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
      x: 206,
      y: 650,
      width: 200,
      height: 105
    });
  } else {
    drawCenteredText(page, artistName.toUpperCase(), 690, 36, titleFont, white);
  }

  drawCenteredText(page, "REQUEST A SONG TONIGHT", 585, 34, titleFont, gold);

  drawCenteredText(
    page,
    artistName.toUpperCase(),
    535,
    40,
    titleFont,
    white
  );

  const qrX = 171;
  const qrY = 235;
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
      size: 26,
      color: white
    });

    page.drawImage(centerLogoImage, {
      x: qrX + qrSize / 2 - 21,
      y: qrY + qrSize / 2 - 21,
      width: 42,
      height: 42
    });
  }

  drawCenteredText(
    page,
    "Scan to browse tonight's setlist and request songs live.",
    195,
    17,
    bodyFont,
    softWhite
  );

  drawCenteredText(
    page,
    "NO APP  •  NO LOGIN  •  INSTANT REQUESTS",
    155,
    20,
    titleFont,
    gold
  );

  page.drawLine({
    start: { x: 90, y: 118 },
    end: { x: 522, y: 118 },
    thickness: 1,
    color: gold
  });

  drawCenteredText(
    page,
    "Request tonight's songs. Influence tomorrow's setlist.",
    82,
    18,
    bodyFont,
    white
  );

  drawCenteredText(page, "POWERED BY U CALL IT HAPPY HOUR", 38, 12, titleFont, gold);

  const pdfBytes = await pdf.save();

  return new NextResponse(Buffer.from(pdfBytes), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${artist.artist_slug}-flyer.pdf"`
    }
  });
}