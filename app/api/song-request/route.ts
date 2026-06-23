import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  "https://xrrowiwkhbfvvnsepgjk.supabase.co",
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

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
      gig_id
    } = body;

    if (!song || !artist || !artist_slug) {
      return NextResponse.json(
        { error: "Missing song, artist, or artist slug." },
        { status: 400 }
      );
    }

    const { error } = await supabase.from("song_requests").insert({
      song,
      artist,
      artist_slug,
      requester_name,
      dedication,
      status: "pending",
      request_type: request_type || "tonight",
      gig_id: gig_id || null
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}