import { NextRequest, NextResponse } from "next/server";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

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

  const artistUrl = `https://www.ucallithappyhour.com/${artist.artist_slug}`;

  const qrUrl = `https://quickchart.io/qr?text=${encodeURIComponent(
    artistUrl
  )}&size=700`;

  const qrBytes = await fetch(qrUrl).then((r) => r.arrayBuffer());

  const pdf = await PDFDocument.create();
  const page = pdf.addPage([612, 792]);

  const titleFont = await pdf.embedFont(StandardFonts.HelveticaBold);
  const bodyFont = await pdf.embedFont(StandardFonts.Helvetica);

  const qrImage = await pdf.embedPng(qrBytes);

  page.drawRectangle({
    x: 0,
    y: 0,
    width: 612,
    height: 792,
    color: rgb(0.05, 0.05, 0.05)
  });

  page.drawText("LIVE MUSIC TONIGHT", {
    x: 90,
    y: 720,
    size: 28,
    font: titleFont,
    color: rgb(0.95, 0.76, 0.32)
  });

  page.drawText(artist.artist_name || artist.artist_slug, {
    x: 70,
    y: 660,
    size: 38,
    font: titleFont,
    color: rgb(1, 1, 1)
  });

  page.drawImage(qrImage, {
    x: 156,
    y: 280,
    width: 300,
    height: 300
  });

  page.drawText("SCAN TO REQUEST A SONG", {
    x: 120,
    y: 230,
    size: 24,
    font: titleFont,
    color: rgb(0.95, 0.76, 0.32)
  });

  page.drawText("No app. No login.", {
    x: 190,
    y: 185,
    size: 18,
    font: bodyFont,
    color: rgb(1, 1, 1)
  });

  page.drawText(
    "Request tonight's songs. Influence tomorrow's setlist.",
    {
      x: 80,
      y: 130,
      size: 14,
      font: bodyFont,
      color: rgb(1, 1, 1)
    }
  );

  const pdfBytes = await pdf.save();

  return new NextResponse(Buffer.from(pdfBytes), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${artist.artist_slug}-flyer.pdf"`
    }
  });
}