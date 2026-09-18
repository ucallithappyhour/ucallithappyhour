import { NextResponse } from "next/server";
import { supabaseAdmin } from "../../../lib/supabaseAdmin";

const ADMIN_EMAIL = "u.call.it.happy.hour@gmail.com";
const validSlug = (value: string | null) => value && /^[a-z0-9-]{1,150}$/i.test(value) ? value : null;
const percentChange = (current: number, previous: number) => previous ? Math.round(((current - previous) / previous) * 1000) / 10 : current ? 100 : 0;

export async function GET(request: Request) {
  const authorization = request.headers.get("authorization");
  const token = authorization?.startsWith("Bearer ") ? authorization.slice(7) : "";
  if (!token) return NextResponse.json({ error: "Not signed in." }, { status: 401 });

  const { data: userData, error: userError } = await supabaseAdmin.auth.getUser(token);
  const email = userData.user?.email?.toLowerCase();
  if (userError || !email) return NextResponse.json({ error: "Session expired." }, { status: 401 });

  const url = new URL(request.url);
  const requestedSlug = validSlug(url.searchParams.get("artist"));
  const daysValue = Number(url.searchParams.get("days") || "30");
  const days = [7, 30, 90].includes(daysValue) ? daysValue : 30;
  const artistQuery = supabaseAdmin.from("artists").select("artist_slug, artist_name");
  const { data: artist } = email === ADMIN_EMAIL && requestedSlug
    ? await artistQuery.eq("artist_slug", requestedSlug).maybeSingle()
    : await artistQuery.eq("owner_email", email).maybeSingle();

  if (!artist?.artist_slug) return NextResponse.json({ error: "No artist profile is linked to this login." }, { status: 403 });

  const now = new Date();
  const since = new Date(now);
  since.setUTCDate(since.getUTCDate() - days);
  const previousSince = new Date(since);
  previousSince.setUTCDate(previousSince.getUTCDate() - days);

  const [eventResponse, requestResponse, gigResponse] = await Promise.all([
    supabaseAdmin.from("analytics_events")
      .select("event_type, visitor_id, source, gig_id, occurrence_date, created_at")
      .eq("artist_slug", artist.artist_slug).gte("created_at", previousSince.toISOString()).order("created_at"),
    supabaseAdmin.from("song_requests")
      .select("id, song, artist, status, gig_id, occurrence_date, created_at")
      .eq("artist_slug", artist.artist_slug).gte("created_at", since.toISOString()).order("created_at", { ascending: false }),
    supabaseAdmin.from("gigs").select("id, venue_name").eq("artist_slug", artist.artist_slug)
  ]);

  if (eventResponse.error || requestResponse.error || gigResponse.error) {
    return NextResponse.json({ error: "Could not load analytics." }, { status: 500 });
  }

  const allEvents = eventResponse.data || [];
  const rows = allEvents.filter((row) => new Date(row.created_at) >= since);
  const previousRows = allEvents.filter((row) => new Date(row.created_at) < since);
  const requests = requestResponse.data || [];
  const venueByGig = new Map((gigResponse.data || []).map((gig) => [gig.id, gig.venue_name || "Venue not listed"]));
  const count = (items: typeof rows, type: string) => items.filter((row) => row.event_type === type).length;
  const pageViews = rows.filter((row) => row.event_type === "artist_page_view");
  const requestViews = count(rows, "request_page_view");
  const trackedSubmissions = count(rows, "song_request_submitted");
  const tipClicks = count(rows, "tip_link_click");
  const visitors = new Set(pageViews.map((row) => row.visitor_id).filter(Boolean));
  const sourceCounts = new Map<string, number>();
  const dailyCounts = new Map<string, number>();

  pageViews.forEach((row) => {
    const source = row.source || "direct";
    sourceCounts.set(source, (sourceCounts.get(source) || 0) + 1);
    const date = String(row.created_at).slice(0, 10);
    dailyCounts.set(date, (dailyCounts.get(date) || 0) + 1);
  });

  const topSongs = new Map<string, { song: string; artist: string; count: number }>();
  const gigGroups = new Map<string, { gig_id: number | null; occurrence_date: string; venue_name: string; total_requests: number; songs: Map<string, { song: string; artist: string; count: number; status: string }> }>();

  requests.forEach((item) => {
    const songKey = `${item.song.toLowerCase()}|||${(item.artist || "").toLowerCase()}`;
    const topSong = topSongs.get(songKey) || { song: item.song, artist: item.artist || "", count: 0 };
    topSong.count += 1;
    topSongs.set(songKey, topSong);

    const date = item.occurrence_date || String(item.created_at).slice(0, 10);
    const groupKey = `${item.gig_id || "none"}|||${date}`;
    const group = gigGroups.get(groupKey) || {
      gig_id: item.gig_id, occurrence_date: date,
      venue_name: item.gig_id ? (venueByGig.get(item.gig_id) || "Venue not listed") : "No gig assigned",
      total_requests: 0, songs: new Map()
    };
    group.total_requests += 1;
    const groupedSong = group.songs.get(songKey) || { song: item.song, artist: item.artist || "", count: 0, status: item.status || "pending" };
    groupedSong.count += 1;
    groupedSong.status = item.status || groupedSong.status;
    group.songs.set(songKey, groupedSong);
    gigGroups.set(groupKey, group);
  });

  const rate = (value: number, base: number) => base ? Math.round((value / base) * 1000) / 10 : 0;
  const currentPageViews = pageViews.length;

  return NextResponse.json({
    artist: { artist_slug: artist.artist_slug, artist_name: artist.artist_name }, days,
    totals: {
      page_views: currentPageViews, unique_visitors: visitors.size, request_page_views: requestViews,
      submitted_requests: requests.length, tracked_submissions: trackedSubmissions, tip_link_clicks: tipClicks,
      request_rate: rate(requestViews, currentPageViews), submission_rate: rate(trackedSubmissions, requestViews),
      tip_click_rate: rate(tipClicks, currentPageViews)
    },
    comparison: {
      page_views: percentChange(currentPageViews, count(previousRows, "artist_page_view")),
      request_page_views: percentChange(requestViews, count(previousRows, "request_page_view")),
      tip_link_clicks: percentChange(tipClicks, count(previousRows, "tip_link_click"))
    },
    sources: [...sourceCounts.entries()].map(([source, value]) => ({ source, count: value })).sort((a, b) => b.count - a.count),
    daily: [...dailyCounts.entries()].map(([date, page_views]) => ({ date, page_views })),
    top_songs: [...topSongs.values()].sort((a, b) => b.count - a.count).slice(0, 10),
    gigs: [...gigGroups.values()].map((group) => ({
      gig_id: group.gig_id, occurrence_date: group.occurrence_date, venue_name: group.venue_name,
      total_requests: group.total_requests, songs: [...group.songs.values()].sort((a, b) => b.count - a.count)
    })).sort((a, b) => b.occurrence_date.localeCompare(a.occurrence_date))
  });
}
