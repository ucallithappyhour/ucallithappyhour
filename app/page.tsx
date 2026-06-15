"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

const artists = [
  {
    name: "Brian Quinn",
    details: "Screwballs • Every Friday • 5–7 PM",
    href: "/brian-quinn",
    button: "Enter Brian's Page",
    logo: "/brian-logo.jpg",
    alt: "Brian Quinn Logo"
  },
  {
    name: "Corey & Friends",
    details: "Venue TBD • Day/Time TBD",
    href: "/corey-and-friends",
    button: "Enter Corey's Page",
    logo: "/corey & friends-logo.jpg",
    alt: "Corey & Friends Logo"
  }
];

export default function Home() {
  const [query, setQuery] = useState("");

  const filteredArtists = useMemo(() => {
    const q = query.trim().toLowerCase();

    if (!q) return artists;

    return artists.filter((artist) =>
      artist.name.toLowerCase().includes(q)
    );
  }, [query]);

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

              {filteredArtists.length === 0 ? (
                <div className="event-card">
                  <p className="performer">No artists found</p>
                  <div className="details">
                    Try searching a different artist name.
                  </div>
                </div>
              ) : (
                filteredArtists.map((artist) => (
                  <div
                    key={artist.name}
                    className="event-card"
                    style={{
                      position: "relative",
                      minHeight: 190,
                      paddingRight: 230
                    }}
                  >
                    <p className="performer">{artist.name}</p>

                    <div className="details">{artist.details}</div>

                    <Link className="btn" href={artist.href}>
                      {artist.button}
                    </Link>

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
                        src={artist.logo}
                        alt={artist.alt}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "contain",
                          display: "block"
                        }}
                      />
                    </div>
                  </div>
                ))
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
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}