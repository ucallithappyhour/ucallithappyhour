"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

type Gig = {
  id: number;
  venue_name: string | null;
  venue_address: string | null;
  gig_date: string | null;
  start_time: string | null;
  end_time: string | null;
  recurring_type: string | null;
};

export default function Home() {
  const [gigs, setGigs] = useState<Gig[]>([]);

  async function loadGigs() {
    const { data, error } = await supabase
      .from("gigs")
      .select("*")
      .eq("artist_slug", "default")
      .order("gig_date", { ascending: true });

    if (!error) {
      setGigs(data || []);
    }
  }

  function formatGigDate(dateValue: string | null) {
    if (!dateValue) return "Date TBD";

    const date = new Date(`${dateValue}T12:00:00`);

    return date.toLocaleDateString([], {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric"
    });
  }

  function formatGigTime(start: string | null, end: string | null) {
    if (!start && !end) return "Time TBD";
    if (start && !end) return start;
    if (!start && end) return end;
    return `${start} - ${end}`;
  }

  useEffect(() => {
    loadGigs();
  }, []);

  return (
    <main className="page" style={{ position: "relative", overflow: "hidden" }}>
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: 245,
          transform: "translateX(-50%)",
          width: "100vw",
          textAlign: "center",
          fontSize: "clamp(90px, 16vw, 240px)",
          fontWeight: 900,
          letterSpacing: "-7px",
          color: "rgba(255,255,255,0.07)",
          zIndex: 0,
          pointerEvents: "none",
          whiteSpace: "nowrap",
          lineHeight: 0.8
        }}
      >
        BRIAN QUINN
      </div>

      <div className="overlay" style={{ position: "relative", zIndex: 1 }}>
        <div className="container">
          <div className="hero">
            <h1 className="title">Request tonight&apos;s songs.</h1>

            <p className="tagline">Influence tomorrow&apos;s setlist.</p>

            <div
              className="event-card"
              style={{
                position: "relative",
                minHeight: 240,
                paddingRight: 260
              }}
            >
              <p className="performer">Brian Quinn</p>

              <div className="details">
                {gigs.length > 0
                  ? `${gigs[0].venue_name || "Venue TBD"} • ${formatGigDate(
                      gigs[0].gig_date
                    )} • ${formatGigTime(gigs[0].start_time, gigs[0].end_time)}`
                  : "Upcoming gigs coming soon"}
              </div>

              <Link className="btn" href="/brian-quinn/request-song">
                Request a Song
              </Link>

              <div
                style={{
                  position: "absolute",
                  top: 28,
                  right: 36,
                  width: 190,
                  height: 170,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center"
                }}
              >
                <img
                  src="/brian-logo.jpg"
                  alt="Brian Quinn Logo"
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "contain",
                    display: "block"
                  }}
                />
              </div>
            </div>
          </div>

          <div className="section">
            <h2>Upcoming Appearances</h2>

            {gigs.length === 0 ? (
              <p className="empty">No upcoming gigs listed yet.</p>
            ) : (
              gigs.map((gig) => (
                <div
                  key={gig.id}
                  style={{
                    borderTop: "1px solid #333",
                    paddingTop: 14,
                    marginTop: 14
                  }}
                >
                  <p style={{ margin: "0 0 6px", fontWeight: 900 }}>
                    {gig.venue_name || "Venue TBD"}
                  </p>

                  <p className="details" style={{ margin: "0 0 6px" }}>
                    {formatGigDate(gig.gig_date)} •{" "}
                    {formatGigTime(gig.start_time, gig.end_time)}
                  </p>

                  <p className="details" style={{ margin: 0 }}>
                    {gig.venue_address || "Address TBD"} •{" "}
                    {gig.recurring_type || "One-Time"}
                  </p>
                </div>
              ))
            )}
          </div>

          <div className="section">
            <h2>How it works</h2>
            <p>
              Search Brian&apos;s current catalog. Request a song for tonight.
              If your song isn&apos;t listed, suggest it for a future show.
            </p>
          </div>

          <div className="section">
            <p>
              <strong>Enjoying the music?</strong>
            </p>
            <span className="details">Tip Brian directly on Venmo.</span>
            <br />
            <br />
            <a
              className="btn secondary"
              href="https://venmo.com/Brian-Quinn-41"
              target="_blank"
              rel="noopener noreferrer"
            >
              Tip Brian
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}