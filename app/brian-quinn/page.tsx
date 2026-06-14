"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { artists } from "../../lib/artists";
import { supabase } from "../../lib/supabase";

const fallbackArtist = artists.brianQuinn;

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

export default function Home() {
  const [artist, setArtist] = useState({
    slug: fallbackArtist.slug,
    name: fallbackArtist.name,
    genre: fallbackArtist.genre,
    bio: fallbackArtist.bio,
    tipLink: fallbackArtist.tipLink,
    tipType: "Venmo",
    website: fallbackArtist.website,
    facebook: fallbackArtist.facebook,
    instagram: fallbackArtist.instagram,
    youtube: fallbackArtist.youtube,
    logo: fallbackArtist.logo
  });

  const [gigs, setGigs] = useState<Gig[]>([]);

  async function loadArtist() {
    const { data, error } = await supabase
      .from("artists")
      .select("*")
      .eq("artist_slug", fallbackArtist.slug)
      .single();

    if (!error && data) {
      const profile = data as ArtistProfile;

      setArtist({
        slug: profile.artist_slug || fallbackArtist.slug,
        name: profile.artist_name || fallbackArtist.name,
        genre: profile.genres || fallbackArtist.genre,
        bio: profile.bio || fallbackArtist.bio,
        tipLink: profile.tip_link || fallbackArtist.tipLink,
        tipType: profile.tip_type || "Venmo",
        website: profile.website || fallbackArtist.website,
        facebook: profile.facebook || fallbackArtist.facebook,
        instagram: profile.instagram || fallbackArtist.instagram,
        youtube: profile.youtube || fallbackArtist.youtube,
        logo: profile.logo_url || fallbackArtist.logo
      });
    }
  }

  async function loadGigs() {
    const { data, error } = await supabase
      .from("gigs")
      .select("*")
      .eq("artist_slug", fallbackArtist.slug)
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
    loadArtist();
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
        {artist.name.toUpperCase()}
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
              <p className="performer">{artist.name}</p>

              <div className="details">
                {gigs.length > 0
                  ? `${gigs[0].venue_name || "Venue TBD"} • ${formatGigDate(
                      gigs[0].gig_date
                    )} • ${formatGigTime(gigs[0].start_time, gigs[0].end_time)}`
                  : "Upcoming gigs coming soon"}
              </div>

              <Link className="btn" href={`/${artist.slug}/request-song`}>
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
                  src={artist.logo}
                  alt={`${artist.name} Logo`}
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
            <p>
              <strong>Enjoying the music?</strong>
            </p>
            <span className="details">
              Tip {artist.name} directly on {artist.tipType}.
            </span>
            <br />
            <br />
            <a
              className="btn secondary"
              href={artist.tipLink}
              target="_blank"
              rel="noopener noreferrer"
            >
              Tip {artist.name}
            </a>
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
            <h2>About the Artist</h2>
            <p>{artist.bio}</p>
          </div>

          {(artist.website ||
            artist.facebook ||
            artist.instagram ||
            artist.youtube) && (
            <div className="section">
              <h2>Connect</h2>

              <div className="actions">
                {artist.website && (
                  <a
                    className="btn secondary"
                    href={artist.website}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Website
                  </a>
                )}

                {artist.facebook && (
                  <a
                    className="btn secondary"
                    href={artist.facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Facebook
                  </a>
                )}

                {artist.instagram && (
                  <a
                    className="btn secondary"
                    href={artist.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Instagram
                  </a>
                )}

                {artist.youtube && (
                  <a
                    className="btn secondary"
                    href={artist.youtube}
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