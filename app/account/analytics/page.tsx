"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabase";

type AnalyticsData = {
  artist: { artist_slug: string; artist_name: string | null };
  days: number;
  totals: {
    page_views: number;
    unique_visitors: number;
    request_page_views: number;
    tip_link_clicks: number;
    request_rate: number;
    tip_click_rate: number;
  };
  sources: { source: string; count: number }[];
  daily: { date: string; page_views: number }[];
};

export default function ArtistAnalyticsPage() {
  const [days, setDays] = useState(30);
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      setMessage("");
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;

      if (!token) {
        setMessage("Please log in to view artist analytics.");
        setLoading(false);
        return;
      }

      const params = new URLSearchParams(window.location.search);
      const artist = params.get("artist");
      const query = new URLSearchParams({ days: String(days) });
      if (artist) query.set("artist", artist);

      const response = await fetch(`/api/artist-analytics?${query}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const result = await response.json();

      if (!response.ok) {
        setMessage(result.error || "Could not load analytics.");
        setData(null);
      } else {
        setData(result);
      }
      setLoading(false);
    }

    load();
  }, [days]);

  const maxDaily = Math.max(1, ...(data?.daily.map((row) => row.page_views) || []));

  return (
    <main className="analyticsPage">
      <div className="analyticsWrap">
        <header className="analyticsHeader">
          <div>
            <p className="analyticsEyebrow">Artist Analytics</p>
            <h1>{data?.artist.artist_name || "Performance overview"}</h1>
            <p>See how listeners engage with your U Call It page.</p>
          </div>
          <div className="analyticsHeaderActions">
            <select value={days} onChange={(event) => setDays(Number(event.target.value))}>
              <option value={7}>Last 7 days</option>
              <option value={30}>Last 30 days</option>
              <option value={90}>Last 90 days</option>
            </select>
            <Link className="btn secondary" href="/dashboard">Song Requests</Link>
            <Link className="btn secondary" href="/account">Artist Account</Link>
          </div>
        </header>

        {loading ? <div className="analyticsNotice">Loading analytics…</div> : null}
        {message ? <div className="analyticsNotice">{message}</div> : null}

        {data ? (
          <>
            <section className="analyticsCards">
              <Metric label="Page views" value={data.totals.page_views} />
              <Metric label="Unique visitors" value={data.totals.unique_visitors} />
              <Metric label="Request-page visits" value={data.totals.request_page_views} detail={`${data.totals.request_rate}% of page views`} />
              <Metric label="Tip-link clicks" value={data.totals.tip_link_clicks} detail={`${data.totals.tip_click_rate}% of page views`} />
            </section>

            <section className="analyticsGrid">
              <div className="analyticsPanel">
                <h2>Page views by day</h2>
                {data.daily.length ? (
                  <div className="analyticsBars">
                    {data.daily.map((row) => (
                      <div className="analyticsBarRow" key={row.date}>
                        <span>{new Date(`${row.date}T12:00:00`).toLocaleDateString(undefined, { month: "short", day: "numeric" })}</span>
                        <div><i style={{ width: `${(row.page_views / maxDaily) * 100}%` }} /></div>
                        <strong>{row.page_views}</strong>
                      </div>
                    ))}
                  </div>
                ) : <p className="analyticsEmpty">No page views in this period.</p>}
              </div>

              <div className="analyticsPanel">
                <h2>Traffic sources</h2>
                {data.sources.length ? (
                  <ul className="analyticsSources">
                    {data.sources.map((row) => (
                      <li key={row.source}><span>{row.source}</span><strong>{row.count}</strong></li>
                    ))}
                  </ul>
                ) : <p className="analyticsEmpty">No source data in this period.</p>}
              </div>
            </section>

            <p className="analyticsFootnote">
              Tip-link clicks show intent. Because payments go directly to your payment app, U Call It cannot verify the amount sent.
            </p>
          </>
        ) : null}
      </div>
    </main>
  );
}

function Metric({ label, value, detail }: { label: string; value: number; detail?: string }) {
  return <article className="analyticsMetric"><span>{label}</span><strong>{value}</strong>{detail ? <small>{detail}</small> : null}</article>;
}
