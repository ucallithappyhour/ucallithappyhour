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
};

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
                {gigs.length > 0
                  ? `${gigs[0].venue_name || "Venue TBD"} • ${formatGigDate(
                      gigs[0].gig_date
                    )} • ${formatGigTime(gigs[0].start_time, gigs[0].end_time)}`
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

          {artist.tip_link && (
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
                href={artist.tip_link}
                target="_blank"
                rel="noopener noreferrer"
              >
                Tip {artistName}
              </a>
            </div>
          )}

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
            <h2>About the Artist</h2>
            <p>{artist.bio || "Artist bio coming soon."}</p>
          </div>

          {(artist.website ||
            artist.facebook ||
            artist.instagram ||
            artist.youtube) && (
            <div className="section">
              <h2>Connect</h2>

              <div className="actions">
                {artist.website && (
                  <a className="btn secondary" href={artist.website} target="_blank" rel="noopener noreferrer">
                    Website
                  </a>
                )}

                {artist.facebook && (
                  <a className="btn secondary" href={artist.facebook} target="_blank" rel="noopener noreferrer">
                    Facebook
                  </a>
                )}

                {artist.instagram && (
                  <a className="btn secondary" href={artist.instagram} target="_blank" rel="noopener noreferrer">
                    Instagram
                  </a>
                )}

                {artist.youtube && (
                  <a className="btn secondary" href={artist.youtube} target="_blank" rel="noopener noreferrer">
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