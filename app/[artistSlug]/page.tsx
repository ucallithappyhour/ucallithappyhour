"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

type ArtistProfile = {
  artist_slug: string;
  artist_name: string | null;
  bio: string | null;
  genres: string | null;
  tip_type: string | null;
  tip_link: string | null;
  website: string | null;
  facebook: string | null;
  instagram: string | null;
  youtube: string | null;
  logo_url?: string | null;
};

type Gig = {
  id: number;
  venue_name: string | null;
  venue_address: string | null;
  gig_date: string | null;
  start_time: string | null;
  end_time: string | null;
  recurring_type: string | null;
  special_note: string | null;
  allow_requests: boolean | null;
};

type GigOccurrence = {
  gig: Gig;
  occurrenceDate: Date;
};

function normalizeExternalUrl(url: string | null) {
  if (!url) return "";

  const trimmed = url.trim();

  if (!trimmed) return "";

  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return trimmed;
  }

  return `https://${trimmed}`;
}

export default function DynamicArtistPage() {
  const params = useParams();
  const artistSlug = String(params.artistSlug || "");

  const [artist, setArtist] = useState<ArtistProfile | null>(null);
  const [gigs, setGigs] = useState<Gig[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadArtist() {
    const { data, error } = await supabase
      .from("artists")
      .select("*")
      .eq("artist_slug", artistSlug)
      .maybeSingle();

    if (!error && data) {
      setArtist(data as ArtistProfile);
    }

    setLoading(false);
  }

  async function loadGigs() {
    const { data, error } = await supabase
      .from("gigs")
      .select("*")
      .eq("artist_slug", artistSlug)
      .order("gig_date", { ascending: true });

    if (!error) {
      setGigs(data || []);
    }
  }

  function formatTime(time: string | null) {
    if (!time) return "";

    const [hours, minutes] = time.split(":");
    const hour = Number(hours);

    return new Date(2000, 0, 1, hour, Number(minutes)).toLocaleTimeString([], {
      hour: "numeric",
      minute: "2-digit"
    });
  }

  function formatGigTime(start: string | null, end: string | null) {
    if (!start && !end) return "Time TBD";
    if (start && !end) return formatTime(start);
    if (!start && end) return formatTime(end);

    return `${formatTime(start)} - ${formatTime(end)}`;
  }

  function formatGigDateForDisplay(dateValue: Date | null) {
    if (!dateValue) return "Date TBD";

    return dateValue.toLocaleDateString([], {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric"
    });
  }

  function getNextOccurrence(gig: Gig) {
    if (!gig.gig_date) return null;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const date = new Date(`${gig.gig_date}T12:00:00`);

    if (gig.recurring_type === "Weekly") {
      while (date < today) {
        date.setDate(date.getDate() + 7);
      }
    } else if (gig.recurring_type === "Monthly") {
      while (date < today) {
        date.setMonth(date.getMonth() + 1);
      }
    } else if (date < today) {
      return null;
    }

    return date;
  }

  function buildGigOccurrences(gigList: Gig[]) {
    const occurrences: GigOccurrence[] = [];

    gigList.forEach((gig) => {
      const firstOccurrence = getNextOccurrence(gig);
      if (!firstOccurrence) return;

      const repeatCount =
        gig.recurring_type === "Weekly" || gig.recurring_type === "Monthly"
          ? 4
          : 1;

      for (let index = 0; index < repeatCount; index++) {
        const occurrenceDate = new Date(firstOccurrence);

        if (gig.recurring_type === "Weekly") {
          occurrenceDate.setDate(firstOccurrence.getDate() + index * 7);
        }

        if (gig.recurring_type === "Monthly") {
          occurrenceDate.setMonth(firstOccurrence.getMonth() + index);
        }

        occurrences.push({
          gig,
          occurrenceDate
        });
      }
    });

    return occurrences.sort(
      (a, b) => a.occurrenceDate.getTime() - b.occurrenceDate.getTime()
    );
  }

  useEffect(() => {
    if (artistSlug) {
      loadArtist();
      loadGigs();
    }
  }, [artistSlug]);

  if (loading) {
    return (
      <main className="page">
        <div className="overlay">
          <div className="container">
            <div className="hero">
              <h1 className="title">Loading...</h1>
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (!artist) {
    return (
      <main className="page">
        <div className="overlay">
          <div className="container">
            <div className="hero">
              <h1 className="title">Artist Not Found</h1>
              <p className="tagline">This artist page is not available yet.</p>
              <Link className="btn" href="/">
                Back Home
              </Link>
            </div>
          </div>
        </div>
      </main>
    );
  }

  const artistName = artist.artist_name || "Artist";
  const logo = artist.logo_url || "";
  const tipUrl = normalizeExternalUrl(artist.tip_link);
  const websiteUrl = normalizeExternalUrl(artist.website);
  const facebookUrl = normalizeExternalUrl(artist.facebook);
  const instagramUrl = normalizeExternalUrl(artist.instagram);
  const youtubeUrl = normalizeExternalUrl(artist.youtube);

  const upcomingOccurrences = buildGigOccurrences(gigs);
  const nextOccurrence = upcomingOccurrences[0] || null;

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
          fontSize: "clamp(70px, 13vw, 200px)",
          fontWeight: 900,
          letterSpacing: "-7px",
          color: "rgba(255,255,255,0.07)",
          zIndex: 0,
          pointerEvents: "none",
          whiteSpace: "nowrap",
          lineHeight: 0.8
        }}
      >
        {artistName.toUpperCase()}
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
                paddingRight: logo ? 260 : 24
              }}
            >
              <p className="performer">{artistName}</p>

              <div className="details">
                {nextOccurrence
                  ? `${
                      nextOccurrence.gig.venue_name || "Venue TBD"
                    } • ${formatGigDateForDisplay(
                      nextOccurrence.occurrenceDate
                    )} • ${formatGigTime(
                      nextOccurrence.gig.start_time,
                      nextOccurrence.gig.end_time
                    )}`
                  : "Upcoming gigs coming soon"}
              </div>

              <Link className="btn" href={`/${artist.artist_slug}/request-song`}>
                Request a Song
              </Link>

              {logo && (
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
                    src={logo}
                    alt={`${artistName} Logo`}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "contain",
                      display: "block"
                    }}
                  />
                </div>
              )}
            </div>
          </div>

          {tipUrl && (
  <div className="section">
    <p>
      <strong>Enjoying the music?</strong>
    </p>

    <span className="details">
      Tip {artistName} directly on {artist.tip_type || "their tip link"}.
    </span>

    <br />
    <br />

    <a
      className="btn secondary"
      href={tipUrl}
      target="_blank"
      rel="noopener noreferrer"
    >
      Tip {artistName}
    </a>
  </div>
)}

<div className="section">
  <h2>About the Artist</h2>
  <p>{artist.bio || "Artist bio coming soon."}</p>
</div>

<div className="section">
  <h2>Upcoming Appearances</h2>

  {upcomingOccurrences.length === 0 ? (
    <p className="empty">No upcoming gigs listed yet.</p>
  ) : (
    upcomingOccurrences.map((occurrence) => (
      <div
        key={`${occurrence.gig.id}-${occurrence.occurrenceDate.toISOString()}`}
        style={{
          borderTop: "1px solid #333",
          paddingTop: 14,
          marginTop: 14,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: 20
        }}
      >
        <div style={{ flex: 1 }}>
          <p style={{ margin: "0 0 6px", fontWeight: 900 }}>
            {occurrence.gig.venue_name || "Venue TBD"}
          </p>

          <p className="details" style={{ margin: "0 0 6px" }}>
            {formatGigDateForDisplay(occurrence.occurrenceDate)} •{" "}
            {formatGigTime(
              occurrence.gig.start_time,
              occurrence.gig.end_time
            )}
          </p>

          <p className="details" style={{ margin: 0 }}>
            {occurrence.gig.venue_address || "Address TBD"} •{" "}
            {occurrence.gig.recurring_type || "One-Time"}
          </p>

          {occurrence.gig.special_note && (
            <p
              style={{
                marginTop: 8,
                color: "#d4af37",
                fontStyle: "italic"
              }}
            >
              {occurrence.gig.special_note}
            </p>
          )}
        </div>

        <div
          style={{
            minWidth: 240,
            display: "flex",
            justifyContent: "flex-end",
            alignItems: "flex-start"
          }}
        >
          {occurrence.gig.allow_requests !== false ? (
            <Link
              className="btn secondary"
              href={`/${artist.artist_slug}/request-song?type=future&gig=${occurrence.gig.id}`}
            >
              Request Songs For This Gig
            </Link>
          ) : (
            <div
              style={{
                padding: "10px 16px",
                borderRadius: 8,
                background: "#333",
                color: "#aaa",
                fontWeight: 700
              }}
            >
              Requests Disabled
            </div>
          )}
        </div>
      </div>
    ))
  )}
</div>

{(websiteUrl || facebookUrl || instagramUrl || youtubeUrl) && (
  <div className="section">
    <h2>Connect</h2>

    <div className="actions">
      {websiteUrl && (
        <a
          className="btn secondary"
          href={websiteUrl}
          target="_blank"
          rel="noopener noreferrer"
        >
          Website
        </a>
      )}

      {facebookUrl && (
        <a
          className="btn secondary"
          href={facebookUrl}
          target="_blank"
          rel="noopener noreferrer"
        >
          Facebook
        </a>
      )}

      {instagramUrl && (
        <a
          className="btn secondary"
          href={instagramUrl}
          target="_blank"
          rel="noopener noreferrer"
        >
          Instagram
        </a>
      )}

      {youtubeUrl && (
        <a
          className="btn secondary"
          href={youtubeUrl}
          target="_blank"
          rel="noopener noreferrer"
        >
          YouTube
        </a>
      )}
    </div>
  </div>
)}
  </div>
      </div>
    </main>
  );
}