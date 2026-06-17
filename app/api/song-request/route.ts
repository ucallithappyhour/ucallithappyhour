import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  "https://xrrowiwkhbfvvnsepgjk.supabase.co",
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const { song, artist, requester_name, dedication, request_type } = body;

    const { error } = await supabase
      .from("song_requests")
      .insert({
        song,
        artist,
        requester_name,
        dedication,
        status: "pending",
        request_type
      });

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}