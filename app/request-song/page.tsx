"use client";

import { useMemo, useState } from "react";

const songs = [
  { title: "Nutshell", artist: "Alice in Chains" },
  { title: "Brother", artist: "Alice in Chains" },
  { title: "No Excuses", artist: "Alice in Chains" },
  { title: "Sludge Factory", artist: "Alice in Chains" },
  { title: "Down in a Hole", artist: "Alice in Chains" },
  { title: "Angry Chair", artist: "Alice in Chains" },
  { title: "Rooster", artist: "Alice in Chains" },
  { title: "Got Me Wrong", artist: "Alice in Chains" },
  { title: "Heaven Beside You", artist: "Alice in Chains" },
  { title: "Would?", artist: "Alice in Chains" },
  { title: "Frogs", artist: "Alice in Chains" },
  { title: "Over Now", artist: "Alice in Chains" },
  { title: "Killer Is Me", artist: "Alice in Chains" },
  { title: "Until Fall", artist: "The Brian Quinn Band" },
  { title: "Gasoline", artist: "Octane" }
];

export default function RequestSongPage() {
  const [query, setQuery] = useState("");

  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();

    if (!q) {
      return songs;
    }

    return songs.filter((song) =>
      `${song.title} ${song.artist}`.toLowerCase().includes(q)
    );
  }, [query]);

  return (
    <main
      style={{
        minHeight: "100vh",
        padding: "40px",
        fontFamily: "Arial, sans-serif",
        background: "#000",
        color: "#fff"
      }}
    >
      <h1>Request tonight's songs. Influence tomorrow's setlist.</h1>

      <p>
        Demo library featuring Alice in Chains: MTV Unplugged,
        plus selections from The Brian Quinn Band and Octane.
      </p>

      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search by song or artist..."
        style={{
          width: "100%",
          maxWidth: "500px",
          padding: "14px",
          fontSize: "18px",
          borderRadius: "8px",
          border: "1px solid #ccc",
          marginTop: "20px"
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
                padding: "14px",
                marginBottom: "10px",
                fontSize: "17px",
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
          <p>No matching songs found.</p>
        )}
      </div>
    </main>
  );
}