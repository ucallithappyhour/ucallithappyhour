import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  "https://xrrowiwkhbfvvnsepgjk.supabase.co",
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const allowedEventTypes = new Set([
  "artist_page_view",
  "request_page_view",
  "tip_link_click"
]);

function optionalText(value: unknown, maxLength: number) {
  return typeof value === "string" && value.trim()
    ? value.trim().slice(0, maxLength)
    : null;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const artistSlug = optionalText(body.artist_slug, 150);
    const eventType = optionalText(body.event_type, 50);

    if (!artistSlug || !eventType || !allowedEventTypes.has(eventType)) {
      return NextResponse.json({ error: "Invalid analytics event." }, { status: 400 });
    }

    const gigId = Number(body.gig_id);
    const occurrenceDate = optionalText(body.occurrence_date, 10);

    const { error } = await supabase.from("analytics_events").insert({
      artist_slug: artistSlug,
      event_type: eventType,
      visitor_id: optionalText(body.visitor_id, 100),
      gig_id: Number.isSafeInteger(gigId) && gigId > 0 ? gigId : null,
      occurrence_date:
        occurrenceDate && /^\d{4}-\d{2}-\d{2}$/.test(occurrenceDate)
          ? occurrenceDate
          : null,
      source: optionalText(body.source, 100),
      page_path: optionalText(body.page_path, 500),
      referrer: optionalText(body.referrer, 1000)
    });

    if (error) {
      console.error("Analytics insert error:", error);
      return NextResponse.json({ error: "Could not save analytics event." }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Analytics API error:", error);
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
}
