import { NextResponse } from "next/server";
import { supabaseAdmin } from "../../../lib/supabaseAdmin";

const ADMIN_EMAIL = "u.call.it.happy.hour@gmail.com";

function validSlug(value: string | null) {
  return value && /^[a-z0-9-]{1,150}$/i.test(value) ? value : null;
}

export async function GET(request: Request) {
  const authorization = request.headers.get("authorization");
  const token = authorization?.startsWith("Bearer ")
    ? authorization.slice(7)
    : "";

  if (!token) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }

  const { data: userData, error: userError } =
    await supabaseAdmin.auth.getUser(token);
  const email = userData.user?.email?.toLowerCase();

  if (userError || !email) {
    return NextResponse.json({ error: "Session expired." }, { status: 401 });
  }

  const url = new URL(request.url);
  const requestedSlug = validSlug(url.searchParams.get("artist"));
  const daysValue = Number(url.searchParams.get("days") || "30");
  const days = [7, 30, 90].includes(daysValue) ? daysValue : 30;

  let artistSlug: string | null = null;
  let artistName: string | null = null;

  if (email === ADMIN_EMAIL && requestedSlug) {
    const { data } = await supabaseAdmin
      .from("artists")
      .select("artist_slug, artist_name")
      .eq("artist_slug", requestedSlug)
      .maybeSingle();
    artistSlug = data?.artist_slug || null;
    artistName = data?.artist_name || null;
  } else {
    const { data } = await supabaseAdmin
      .from("artists")
      .select("artist_slug, artist_name")
      .eq("owner_email", email)
      .maybeSingle();
    artistSlug = data?.artist_slug || null;
    artistName = data?.artist_name || null;
  }

  if (!artistSlug) {
    return NextResponse.json(
      { error: "No artist profile is linked to this login." },
      { status: 403 }
    );
  }

  const since = new Date();
  since.setUTCDate(since.getUTCDate() - days);

  const { data: events, error } = await supabaseAdmin
    .from("analytics_events")
    .select("event_type, visitor_id, source, created_at")
    .eq("artist_slug", artistSlug)
    .gte("created_at", since.toISOString())
    .order("created_at", { ascending: true });

  if (error) {
    return NextResponse.json({ error: "Could not load analytics." }, { status: 500 });
  }

  const rows = events || [];
  const pageViews = rows.filter((row) => row.event_type === "artist_page_view");
  const requestViews = rows.filter((row) => row.event_type === "request_page_view");
  const tipClicks = rows.filter((row) => row.event_type === "tip_link_click");
  const visitors = new Set(pageViews.map((row) => row.visitor_id).filter(Boolean));
  const sourceCounts = new Map<string, number>();
  const dailyCounts = new Map<string, number>();

  pageViews.forEach((row) => {
    const source = row.source || "direct";
    sourceCounts.set(source, (sourceCounts.get(source) || 0) + 1);
    const day = String(row.created_at).slice(0, 10);
    dailyCounts.set(day, (dailyCounts.get(day) || 0) + 1);
  });

  const rate = (count: number) =>
    pageViews.length ? Math.round((count / pageViews.length) * 1000) / 10 : 0;

  return NextResponse.json({
    artist: { artist_slug: artistSlug, artist_name: artistName },
    days,
    totals: {
      page_views: pageViews.length,
      unique_visitors: visitors.size,
      request_page_views: requestViews.length,
      tip_link_clicks: tipClicks.length,
      request_rate: rate(requestViews.length),
      tip_click_rate: rate(tipClicks.length)
    },
    sources: [...sourceCounts.entries()]
      .map(([source, count]) => ({ source, count }))
      .sort((a, b) => b.count - a.count),
    daily: [...dailyCounts.entries()].map(([date, page_views]) => ({
      date,
      page_views
    }))
  });
}
