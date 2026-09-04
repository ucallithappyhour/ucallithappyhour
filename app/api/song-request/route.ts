import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  "https://xrrowiwkhbfvvnsepgjk.supabase.co",
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const MAX_TONIGHT_REQUESTS_PER_GIG = 3;

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const {
      song,
      artist,
      artist_slug,
      requester_name,
      dedication,
      request_type,
      gig_id,
      occurrence_date,
      visitor_id
    } = body;

    const resolvedRequestType = request_type || "tonight";
    const resolvedGigId = gig_id ? Number(gig_id) : null;
    const resolvedOccurrenceDate =
      typeof occurrence_date === "string" && occurrence_date.trim()
        ? occurrence_date.trim()
        : null;

    if (!song || !artist || !artist_slug) {
      return NextResponse.json(
        { error: "Missing song, artist, or artist slug." },
        { status: 400 }
      );
    }

    /*
     * Any request tied to a specific gig must also identify
     * the exact occurrence of that gig.
     *
     * Example:
     * gig_id = 3
     * occurrence_date = 2026-09-04
     */
    if (resolvedGigId && !resolvedOccurrenceDate) {
      return NextResponse.json(
        { error: "Missing gig occurrence date." },
        { status: 400 }
      );
    }

    /*
     * Validate that the supplied occurrence actually exists
     * and is still active.
     */
    if (resolvedGigId && resolvedOccurrenceDate) {
      const { data: occurrence, error: occurrenceError } = await supabase
        .from("gig_occurrences")
        .select("id, gig_id, occurrence_date, status, archive_at")
        .eq("gig_id", resolvedGigId)
        .eq("occurrence_date", resolvedOccurrenceDate)
        .maybeSingle();

      if (occurrenceError) {
        return NextResponse.json(
          { error: occurrenceError.message },
          { status: 500 }
        );
      }

      if (!occurrence) {
        return NextResponse.json(
          { error: "That gig occurrence could not be found." },
          { status: 400 }
        );
      }

      if (
        occurrence.status === "archived" ||
        (occurrence.archive_at &&
          new Date(occurrence.archive_at).getTime() <= Date.now())
      ) {
        return NextResponse.json(
          { error: "Requests for this performance are now closed." },
          { status: 400 }
        );
      }
    }

    /*
     * Enforce the 3-request limit PER PERSON,
     * PER SPECIFIC OCCURRENCE.
     *
     * This means:
     *
     * Screwballs 9/4 = 3 requests
     * Screwballs 9/11 = fresh 3 requests
     */
    if (
      resolvedRequestType === "tonight" &&
      resolvedGigId &&
      resolvedOccurrenceDate &&
      visitor_id
    ) {
      const { count, error: countError } = await supabase
        .from("song_requests")
        .select("id", { count: "exact", head: true })
        .eq("artist_slug", artist_slug)
        .eq("gig_id", resolvedGigId)
        .eq("occurrence_date", resolvedOccurrenceDate)
        .eq("request_type", "tonight")
        .eq("visitor_id", visitor_id);

      if (countError) {
        return NextResponse.json(
          { error: countError.message },
          { status: 500 }
        );
      }

      if ((count || 0) >= MAX_TONIGHT_REQUESTS_PER_GIG) {
        return NextResponse.json(
          {
            error:
              "You've reached the maximum of 3 requests for this performance. Thanks for helping shape tonight's setlist! We hope you'll join us again at the next show. 🎵"
          },
          { status: 429 }
        );
      }
    }

    const { error } = await supabase.from("song_requests").insert({
      song,
      artist,
      artist_slug,
      requester_name,
      dedication,
      status: "pending",
      request_type: resolvedRequestType,
      gig_id: resolvedGigId,
      occurrence_date: resolvedOccurrenceDate,
      visitor_id: visitor_id || null
    });

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Song request API error:", error);

    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}