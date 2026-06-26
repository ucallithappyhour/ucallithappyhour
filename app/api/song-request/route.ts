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
      visitor_id
    } = body;

    const resolvedRequestType = request_type || "tonight";
    const resolvedGigId = gig_id || null;

    if (!song || !artist || !artist_slug) {
      return NextResponse.json(
        { error: "Missing song, artist, or artist slug." },
        { status: 400 }
      );
    }

    if (resolvedRequestType === "tonight" && resolvedGigId && visitor_id) {
      const { count, error: countError } = await supabase
        .from("song_requests")
        .select("id", { count: "exact", head: true })
        .eq("artist_slug", artist_slug)
        .eq("gig_id", resolvedGigId)
        .eq("request_type", "tonight")
        .eq("visitor_id", visitor_id);

      if (countError) {
        return NextResponse.json({ error: countError.message }, { status: 500 });
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
      visitor_id: visitor_id || null
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}