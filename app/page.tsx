"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabase";

type Artist = {
  artist_slug: string;
  artist_name: string | null;
  genres: string | null;
};

type Gig = {
  artist_slug: string;
  venue_name: string | null;
  gig_date: string | null;
  start_time: string | null;
  end_time: string | null;
  recurring_type: string | null;
};

function fallbackLogo(slug: string) {
  if (slug === "brian-quinn") return "/brian-logo.jpg";
  if (slug === "corey-and-friends") return "/corey & friends-logo.jpg";
  return "";
}

function artistButtonName(name: string) {
  const firstName = name.split(" ")[0];
  return `Enter ${firstName}'s Page`;
}

function formatGigDate(dateValue: string | null) {
  if (!dateValue) return "Date TBD";

  const date = new Date(`${dateValue}T12:00:00`);

  return date.toLocaleDateString([], {
    weekday: "short",
    month: "short",
    day: "numeric"
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

function gigDetails(gig: Gig | undefined) {
  if (!gig) return "Next gig TBD";

  const venue = gig.venue_name || "Venue TBD";
  const date = formatGigDate(gig.gig_date);
  const time = formatGigTime(gig.start_time, gig.end_time);

  return `${venue} • ${date} • ${time}`;
}

function isToday(dateValue: string | null) {
  if (!dateValue) return false;

  const today = new Date().toISOString().slice(0, 10);

  return dateValue === today;
}

function todayGigDetails(gig: Gig | undefined) {
  if (!gig) return "";

  const venue = gig.venue_name || "Venue TBD";
  const time = formatGigTime(gig.start_time, gig.end_time);

  return `${venue} • ${time}`;
}

export default function Home() {
  const [query, setQuery] = useState("");
  const [artists, setArtists] = useState<Artist[]>([]);
  const [gigsByArtist, setGigsByArtist] = useState<Record<string, Gig>>({});
  const [todayGig, setTodayGig] = useState<Gig | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  async function loadArtistsAndGigs() {
    setLoading(true);
    setMessage("");

    const { data: artistData, error: artistError } = await supabase
      .from("artists")
      .select("artist_slug, artist_name, genres")
      .eq("is_active", true)
      .order("artist_name", { ascending: true });

    if (artistError) {
      setMessage("Could not load artists right now.");
      setArtists([]);
      setLoading(false);
      return;
    }

    const activeArtists = artistData || [];
    setArtists(activeArtists);

    const activeArtistSlugs = activeArtists.map((artist) => artist.artist_slug);
    const today = new Date().toISOString().slice(0, 10);

    const { data: gigData, error: gigError } = await supabase
      .from("gigs")
      .select("artist_slug, venue_name, gig_date, start_time, end_time, recurring_type")
      .in("artist_slug", activeArtistSlugs.length > 0 ? activeArtistSlugs : [""])
      .gte("gig_date", today)
      .order("gig_date", { ascending: true })
      .order("start_time", { ascending: true });

    if (gigError) {
      setMessage("Artists loaded, but upcoming gigs could not be loaded.");
      setGigsByArtist({});
      setTodayGig(null);
      setLoading(false);
      return;
    }

    const nextGigs: Record<string, Gig> = {};
    let firstTodayGig: Gig | null = null;

    (gigData || []).forEach((gig) => {
      if (!nextGigs[gig.artist_slug]) {
        nextGigs[gig.artist_slug] = gig;
      }

      if (!firstTodayGig && isToday(gig.gig_date)) {
        firstTodayGig = gig;
      }
    });

    setGigsByArtist(nextGigs);
    setTodayGig(firstTodayGig);
    setLoading(false);
  }

  useEffect(() => {
    loadArtistsAndGigs();
  }, []);

  const artistBySlug = useMemo(() => {
    const lookup: Record<string, Artist> = {};

    artists.forEach((artist) => {
      lookup[artist.artist_slug] = artist;
    });

    return lookup;
  }, [artists]);

  const filteredArtists = useMemo(() => {
    const q = query.trim().toLowerCase();

    if (!q) return artists;

    return artists.filter((artist) =>
      `${artist.artist_name || ""} ${artist.genres || ""}`
        .toLowerCase()
        .includes(q)
    );
  }, [query, artists]);

  const todayArtist = todayGig ? artistBySlug[todayGig.artist_slug] : null;
  const todayArtistName = todayArtist?.artist_name || "Tonight's Artist";

  return (
    <main className="page">
      <div className="overlay">
        <div className="container">
          <div className="hero">
            {todayGig && todayArtist && (
              <div
                className="event-card"
                style={{
                  marginBottom: 28,
                  border: "1px solid rgba(255, 209, 102, 0.7)",
                  boxShadow: "0 0 35px rgba(255, 209, 102, 0.12)"
                }}
              >
                <div className="details" style={{ color: "#ffd166", fontWeight: 900 }}>
                  Tonight&apos;s Live Music
                </div>

                <p className="performer">{todayArtistName}</p>

                <div className="details">
                  {todayGigDetails(todayGig)}
                </div>

                <Link className="btn" href={`/${todayArtist.artist_slug}`}>
                  Request Songs Now
                </Link>
              </div>
            )}

            <h1 className="title">Choose Your Artist</h1>

            <p className="tagline">
              Request tonight&apos;s songs. Influence tomorrow&apos;s setlist.
            </p>

            <div className="section">
              <h2>Available Artists</h2>

              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search artist..."
                style={{
                  width: "100%",
                  padding: 16,
                  fontSize: 18,
                  borderRadius: 10,
                  border: "1px solid rgba(255,255,255,0.25)",
                  marginBottom: 22
                }}
              />

              {message && <div className="message">{message}</div>}

              {loading ? (
                <div className="event-card">
                  <p className="performer">Loading artists...</p>
                </div>
              ) : filteredArtists.length === 0 ? (
                <div className="event-card">
                  <p className="performer">No artists found</p>
                  <div className="details">
                    Try searching a different artist name.
                  </div>
                </div>
              ) : (
                filteredArtists.map((artist) => {
                  const name = artist.artist_name || "Unnamed Artist";
                  const logo = fallbackLogo(artist.artist_slug);
                  const nextGig = gigsByArtist[artist.artist_slug];

                  return (
                    <div
                      key={artist.artist_slug}
                      className="event-card"
                      style={{
                        position: "relative",
                        minHeight: 190,
                        paddingRight: 230
                      }}
                    >
                      <p className="performer">{name}</p>

                      <div className="details">
                        {gigDetails(nextGig)}
                      </div>

                      {artist.genres && (
                        <p style={{ marginTop: 10, opacity: 0.8 }}>
                          {artist.genres}
                        </p>
                      )}

                      <Link className="btn" href={`/${artist.artist_slug}`}>
                        {artistButtonName(name)}
                      </Link>

                      {logo && (
                        <div
                          style={{
                            position: "absolute",
                            top: 24,
                            right: 32,
                            width: 150,
                            height: 140,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center"
                          }}
                        >
                          <img
                            src={logo}
                            alt={`${name} Logo`}
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
                  );
                })
              )}
            </div>

            <div className="section">
              <h2>For Artists</h2>

              <div className="event-card">
                <p className="performer">
                  Bring U Call It Happy Hour to Your Shows
                </p>

                <div className="details">
                  Personalized artist page • Request dashboard • QR starter kit •
                  Tip integration
                </div>

                <p style={{ marginTop: 14 }}>
                  Give your crowd a simple way to request songs, influence future
                  setlists, and support you directly.
                </p>

                <Link className="btn" href="/register">
                  Request Artist Setup - $99
                </Link>
              </div>

              <div className="actions" style={{ marginTop: 18 }}>
                <Link className="btn secondary" href="/account">
                  Artist Login
                </Link>

                <Link className="btn secondary" href="/registrations">
                  Admin Registrations
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}