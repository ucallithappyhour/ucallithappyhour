"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabase";

type Song = { song: string; artist: string; count: number; status?: string };
type AnalyticsData = {
  artist: { artist_slug: string; artist_name: string | null }; days: number;
  totals: { page_views: number; unique_visitors: number; request_page_views: number; submitted_requests: number; tracked_submissions: number; tip_link_clicks: number; request_rate: number; submission_rate: number; tip_click_rate: number };
  comparison: { page_views: number; request_page_views: number; tip_link_clicks: number };
  sources: { source: string; count: number }[];
  daily: { date: string; page_views: number }[];
  top_songs: Song[];
  gigs: { gig_id: number | null; occurrence_date: string; venue_name: string; total_requests: number; songs: Song[] }[];
};

export default function ArtistAnalyticsPage() {
  const [days, setDays] = useState(30);
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true); setMessage("");
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;
      if (!token) { setMessage("Please log in to view artist analytics."); setLoading(false); return; }
      const params = new URLSearchParams(window.location.search);
      const query = new URLSearchParams({ days: String(days) });
      if (params.get("artist")) query.set("artist", params.get("artist")!);
      const response = await fetch(`/api/artist-analytics?${query}`, { headers: { Authorization: `Bearer ${token}` } });
      const result = await response.json();
      if (!response.ok) { setMessage(result.error || "Could not load analytics."); setData(null); } else setData(result);
      setLoading(false);
    }
    load();
  }, [days]);

  const maxDaily = Math.max(1, ...(data?.daily.map((row) => row.page_views) || []));

  function exportCsv() {
    if (!data) return;
    const rows: (string | number)[][] = [["Gig date", "Venue", "Song", "Original artist", "Requests", "Status"]];
    data.gigs.forEach((gig) =>
      gig.songs.forEach((song) =>
        rows.push([
          gig.occurrence_date,
          gig.venue_name,
          song.song,
          song.artist,
          song.count,
          song.status || ""
        ])
      )
    );
    const csv = rows.map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(",")).join("\n");
    const link = document.createElement("a");
    link.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    link.download = `${data.artist.artist_slug}-analytics-${days}-days.csv`;
    link.click(); URL.revokeObjectURL(link.href);
  }

  return <main className="analyticsPage"><div className="analyticsWrap">
    <header className="analyticsHeader"><div><p className="analyticsEyebrow">Artist Analytics</p><h1>{data?.artist.artist_name || "Performance overview"}</h1><p>See how listeners engage with your U Call It page.</p></div>
      <div className="analyticsHeaderActions"><select value={days} onChange={(e) => setDays(Number(e.target.value))}><option value={7}>Last 7 days</option><option value={30}>Last 30 days</option><option value={90}>Last 90 days</option></select><button className="btn secondary" type="button" onClick={exportCsv} disabled={!data}>Export CSV</button><Link className="btn secondary" href="/dashboard">Song Requests</Link><Link className="btn secondary" href="/account">Artist Account</Link></div>
    </header>
    {loading ? <div className="analyticsNotice">Loading analytics…</div> : null}{message ? <div className="analyticsNotice">{message}</div> : null}
    {data ? <>
      <section className="analyticsCards analyticsCardsSix">
        <Metric label="Page views" value={data.totals.page_views} change={data.comparison.page_views} />
        <Metric label="Unique visitors" value={data.totals.unique_visitors} />
        <Metric label="Request-page visits" value={data.totals.request_page_views} detail={`${data.totals.request_rate}% of page views`} change={data.comparison.request_page_views} />
        <Metric label="Requests submitted" value={data.totals.submitted_requests} detail={data.totals.tracked_submissions ? `${data.totals.submission_rate}% submission conversion` : "Conversion tracking begins now"} />
        <Metric label="Tip-link clicks" value={data.totals.tip_link_clicks} detail={`${data.totals.tip_click_rate}% of page views`} change={data.comparison.tip_link_clicks} />
      </section>
      <section className="analyticsGrid"><div className="analyticsPanel"><h2>Page views by day</h2>{data.daily.length ? <div className="analyticsBars">{data.daily.map((row) => <div className="analyticsBarRow" key={row.date}><span>{new Date(`${row.date}T12:00:00`).toLocaleDateString(undefined, { month: "short", day: "numeric" })}</span><div><i style={{ width: `${(row.page_views / maxDaily) * 100}%` }} /></div><strong>{row.page_views}</strong></div>)}</div> : <p className="analyticsEmpty">No page views in this period.</p>}</div>
        <div className="analyticsPanel"><h2>Traffic sources</h2>{data.sources.length ? <ul className="analyticsSources">{data.sources.map((row) => <li key={row.source}><span>{row.source}</span><strong>{row.count}</strong></li>)}</ul> : <p className="analyticsEmpty">No source data in this period.</p>}</div>
      </section>
      <section className="analyticsGrid analyticsInsightsGrid"><div className="analyticsPanel"><h2>Top requested songs</h2>{data.top_songs.length ? <ol className="analyticsTopSongs">{data.top_songs.map((song) => <li key={`${song.song}-${song.artist}`}><span><strong>{song.song}</strong><small>{song.artist}</small></span><b>{song.count}</b></li>)}</ol> : <p className="analyticsEmpty">No song requests in this period.</p>}</div>
        <div className="analyticsPanel"><h2>Venue performance</h2>{data.gigs.length ? <ul className="analyticsSources">{data.gigs.map((gig) => <li key={`${gig.gig_id}-${gig.occurrence_date}`}><span><strong>{gig.venue_name}</strong><small>{formatDate(gig.occurrence_date)}</small></span><strong>{gig.total_requests} requests</strong></li>)}</ul> : <p className="analyticsEmpty">No gig activity in this period.</p>}</div>
      </section>
      <section className="analyticsPanel analyticsGigPanel"><h2>Songs requested by gig</h2>{data.gigs.length ? <div className="analyticsGigList">{data.gigs.map((gig) => <article className="analyticsGig" key={`${gig.gig_id}-${gig.occurrence_date}`}><header><div><h3>{gig.venue_name}</h3><span>{formatDate(gig.occurrence_date)}</span></div><strong>{gig.total_requests} requests</strong></header><ul>{gig.songs.map((song) => <li key={`${song.song}-${song.artist}`}><span><b>{song.song}</b><small>{song.artist || "Artist not listed"}</small></span><span className="analyticsSongMeta"><em>{song.status || "pending"}</em><strong>×{song.count}</strong></span></li>)}</ul></article>)}</div> : <p className="analyticsEmpty">No song requests in this period.</p>}</section>
      <p className="analyticsFootnote">Comparisons use the immediately preceding {days}-day period. Tip-link clicks show intent; payments go directly to the artist, so U Call It cannot verify amounts.</p>
    </> : null}
  </div></main>;
}

function formatDate(value: string) { return new Date(`${value}T12:00:00`).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" }); }
function Metric({ label, value, detail, change }: { label: string; value: number; detail?: string; change?: number }) {
  return <article className="analyticsMetric"><span>{label}</span><strong>{value}</strong>{detail ? <small>{detail}</small> : null}{change !== undefined ? <small className={change >= 0 ? "analyticsUp" : "analyticsDown"}>{change >= 0 ? "+" : ""}{change}% vs prior period</small> : null}</article>;
}
