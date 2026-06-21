import { NextRequest, NextResponse } from "next/server";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, serviceRoleKey);

function safeText(value: string | null | undefined, fallback = "") {
  return value && value.trim() ? value.trim() : fallback;
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const artistSlug = searchParams.get("artist");

  if (!artistSlug) {
    return NextResponse.json(
      { error: "Missing artist parameter" },
      { status: 400 }
    );
  }

  const { data: artist, error } = await supabase
    .from("artists")
    .select("artist_slug, artist_name, logo_url")
    .eq("artist_slug", artistSlug)
    .maybeSingle();

  if (error || !artist) {
    return NextResponse.json({ error: "Artist not found" }, { status: 404 });
  }

  const artistName = safeText(artist.artist_name, artist.artist_slug);
  const artistPageUrl = `https://www.ucallithappyhour.com/${artist.artist_slug}`;
  const qrUrl = `https://quickchart.io/qr?text=${encodeURIComponent(
    artistPageUrl
  )}&size=500`;

  const pdfDoc = await PDFDocument.create();

  // 8.5 x 11 landscape
  const page = pdfDoc.addPage([792, 612]);
  const { width, height } = page.getSize();

  const titleFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const bodyFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  page.drawRectangle({
    x: 0,
    y: 0,
    width,
    height,
    color: rgb(0.04, 0.04, 0.04)
  });

  page.drawText("U CALL IT HAPPY HOUR", {
    x: 60,
    y: height - 75,
    size: 18,
    font: boldFont,
    color: rgb(0.95, 0.76, 0.32)
  });

  page.drawText("REQUEST A SONG", {
    x: 60,
    y: height - 135,
    size: 46,
    font: titleFont,
    color: rgb(1, 1, 1)
  });

  page.drawText(`Tonight with ${artistName}`, {
    x: 60,
    y: height - 175,
    size: 24,
    font: bodyFont,
    color: rgb(1, 1, 1)
  });

  page.drawText("Scan the QR code to browse the setlist and send a request.", {
    x: 60,
    y: height - 220,
    size: 18,
    font: bodyFont,
    color: rgb(0.9, 0.9, 0.9)
  });

  page.drawText("No app. No login. Just pick a song.", {
    x: 60,
    y: height - 250,
    size: 18,
    font: boldFont,
    color: rgb(0.95, 0.76, 0.32)
  });

  const qrBytes = await fetch(qrUrl).then((res) => res.arrayBuffer());
  const qrImage = await pdfDoc.embedPng(qrBytes);

  page.drawImage(qrImage, {
    x: width - 330,
    y: 170,
    width: 240,
    height: 240
  });

  page.drawText(artistPageUrl, {
    x: width - 360,
    y: 130,
    size: 11,
    font: bodyFont,
    color: rgb(1, 1, 1)
  });

  page.drawText("Request tonight's songs. Influence tomorrow's setlist.", {
    x: 60,
    y: 70,
    size: 16,
    font: bodyFont,
    color: rgb(0.95, 0.76, 0.32)
  });

  const pdfBytes = await pdfDoc.save();

  return new NextResponse(Buffer.from(pdfBytes), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${artist.artist_slug}-table-tent.pdf"`
    }
  });
}