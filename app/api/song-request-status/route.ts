import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  "https://xrrowiwkhbfvvnsepgjk.supabase.co",
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { ids, status } = body;

    if (!Array.isArray(ids) || ids.length === 0 || !status) {
      return NextResponse.json(
        { error: "Missing ids or status." },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from("song_requests")
      .update({ status })
      .in("id", ids);

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