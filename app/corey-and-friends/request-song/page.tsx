"use client";

import { useMemo, useState } from "react";

const songs = [
  { title: "Truckin'", artist: "Grateful Dead" },
  { title: "Uncle John's Band", artist: "Grateful Dead" },
  { title: "China Cat Sunflower", artist: "Grateful Dead" },
  { title: "I Know You Rider", artist: "Traditional / Grateful Dead" },
  { title: "Sugaree", artist: "Jerry Garcia" },
  { title: "Roadhouse Blues", artist: "The Doors" },
  { title: "White Rabbit", artist: "Jefferson Airplane" },
  { title: "Me and Bobby McGee", artist: "Janis Joplin / Kris Kristofferson" },
  { title: "Get Out of My Life, Woman", artist: "Allen Toussaint" },
  { title: "Turn On Your Love Light", artist: 'Bobby "Blue" Bland' },
  { title: "Hey Pocky A-Way", artist: "The Meters" },
  { title: "Interstate Love Song", artist: "Stone Temple Pilots" },
  { title: "Plush", artist: "Stone Temple Pilots" },
  { title: "Shine", artist: "Collective Soul" },
  { title: "What I Got", artist: "Sublime" },
  { title: "Jane Says", artist: "Jane's Addiction" },
  { title: "Alive", artist: "Pearl Jam" },
  { title: "Santeria", artist: "Sublime" },
  { title: "Fool Me Twice", artist: "Cory & Friends" },
  { title: "If I Die", artist: "Cory & Friends" },
  { title: "We're All The Same", artist: "Cory & Friends" }
];

export default function RequestSongPage() {
  const [query, setQuery] = useState("");

  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();

    if (!q) {
      return songs;
    }

    return songs.filter((song) =>
      `${song.title} ${song.artist}`
        .toLowerCase()
        .includes(q)
    );
  }, [query]);

  return (
    <main
      style={{
        minHeight: "100vh",
        padding: "40px",
        background: "#111",
        color: "#fff",
        fontFamily: "Arial, sans-serif"
      }}
    >
      <h1>
        Request tonight&apos;s songs.
        <br />
        Influence tomorrow&apos;s setlist.
      </h1>

      <p>
        Search the current Cory &amp; Friends catalog.
      </p>

      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search by song or artist..."
        style={{
          width: "100%",
          maxWidth: "500px",
          padding: "14px",
          borderRadius: "10px",
          border: "1px solid #444",
          fontSize: "16px"
        }}
      />

      <div
        style={{
          marginTop: "25px",
          maxWidth: "500px"
        }}
      >
        {matches.length > 0 ? (
          matches.map((song) => (
            <button
              key={`${song.title}-${song.artist}`}
              style={{
                display: "block",
                width: "100%",
                textAlign: "left",
                marginBottom: "12px",
                padding: "14px",
                borderRadius: "8px",
                border: "1px solid #ddd",
                background: "#f3f3f3",
                color: "#000",
                cursor: "pointer"
              }}
            >
              <strong>{song.title}</strong>
              <br />
              <span>{song.artist}</span>
            </button>
          ))
        ) : (
          <p>No songs found.</p>
        )}
      </div>
    </main>
  );
}