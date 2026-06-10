"use client";

import { useMemo, useState } from "react";

const songs = [
  "Nutshell",
  "Brother",
  "No Excuses",
  "Sludge Factory",
  "Down in a Hole",
  "Angry Chair",
  "Rooster",
  "Got Me Wrong",
  "Heaven Beside You",
  "Would?",
  "Frogs",
  "Over Now",
  "Killer Is Me",
  "Until Fall - The Brian Quinn Band",
  "Gasoline - Octane"
];

export default function RequestSongPage() {
  const [query, setQuery] = useState("");

  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return songs;

    return songs.filter((song) =>
      song.toLowerCase().includes(q)
    );
  }, [query]);

  return (
    <main style={{ minHeight: "100vh", padding: "40px", fontFamily: "Arial, sans-serif" }}>
      <h1>Request tonight's songs. Influence tomorrow's setlist.</h1>

      <p>
        Demo library featuring Alice in Chains: MTV Unplugged,
        plus selections from The Brian Quinn Band and Octane.
      </p>

      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Start typing a song..."
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

      <div style={{ marginTop: "25px", maxWidth: "500px" }}>
        {matches.length > 0 ? (
          matches.map((song) => (
            <button
              key={song}
              style={{
                display: "block",
                width: "100%",
                textAlign: "left",
                padding: "14px",
                marginBottom: "10px",
                fontSize: "17px",
                borderRadius: "8px",
                border: "1px solid #ddd",
                background: "white",
                cursor: "pointer"
              }}
            >
              {song}
            </button>
          ))
        ) : (
          <p>No matching songs found.</p>
        )}
      </div>
    </main>
  );
}
