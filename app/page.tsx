"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabase";

type Artist = {
  artist_slug: string;
  artist_name: string | null;
  genres: string | null;
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

export default function Home() {
  const [query, setQuery] = useState("");
  const [artists, setArtists] = useState<Artist[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  async function loadArtists() {
    setLoading(true);
    setMessage("");

    const { data, error } = await supabase
      .from("artists")
      .select("artist_slug, artist_name, genres")
      .eq("is_active", true)
      .order("artist_name", { ascending: true });

    if (error) {
      setMessage("Could not load artists right now.");
      setArtists([]);
      setLoading(false);
      return;
    }

    setArtists(data || []);
    setLoading(false);
  }

  useEffect(() => {
    loadArtists();
  }, []);

  const filteredArtists = useMemo(() => {
    const q = query.trim().toLowerCase();

    if (!q) return artists;

    return artists.filter((artist) =>
      `${artist.artist_name || ""} ${artist.genres || ""}`
        .toLowerCase()
        .includes(q)
    );
  }, [query, artists]);

  return (
    <main className="page">
      <div className="overlay">
        <div className="container">
          <div className="hero">
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
                        {artist.genres || "Live music artist"}
                      </div>

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