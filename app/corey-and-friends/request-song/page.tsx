"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "../../../lib/supabase";

type Song = {
  title: string;
  artist: string;
};

export default function RequestSongPage() {
  const [query, setQuery] = useState("");
  const [songs, setSongs] = useState<Song[]>([]);
  const [songsLoading, setSongsLoading] = useState(true);

  useEffect(() => {
    async function loadSongs() {
      setSongsLoading(true);

      const { data, error } = await supabase
        .from("songs")
        .select("title, artist")
        .eq("artist_slug", "corey-and-friends")
        .eq("is_active", true)
        .order("artist", { ascending: true })
        .order("title", { ascending: true });

      if (error) {
        alert("Could not load songs: " + error.message);
        setSongs([]);
        setSongsLoading(false);
        return;
      }

      setSongs(data || []);
      setSongsLoading(false);
    }

    loadSongs();
  }, []);

  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();

    if (!q) {
      return songs;
    }

    return songs.filter((song) =>
      `${song.title} ${song.artist}`.toLowerCase().includes(q)
    );
  }, [query, songs]);

  return (
    <main
      style={{
        minHeight: "100vh",
        padding: 24,
        background: "#111",
        color: "#fff",
        fontFamily: "Arial, sans-serif"
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 760,
          margin: "0 auto"
        }}
      >
        <h1
          style={{
            fontSize: "clamp(30px, 7vw, 56px)",
            lineHeight: 1,
            marginBottom: 12,
            textAlign: "center"
          }}
        >
          Request tonight&apos;s songs.
          <br />
          Influence tomorrow&apos;s setlist.
        </h1>

        <p
          style={{
            textAlign: "center",
            opacity: 0.8,
            fontSize: 18,
            marginBottom: 24
          }}
        >
          Search the current Cory &amp; Friends catalog.
        </p>

        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by song or artist..."
          style={{
            width: "100%",
            padding: 16,
            fontSize: 18,
            borderRadius: 10,
            border: "1px solid #444",
            marginBottom: 24
          }}
        />

        <div>
          {songsLoading ? (
            <p>Loading songs...</p>
          ) : matches.length > 0 ? (
            matches.map((song) => (
              <button
                key={`${song.title}-${song.artist}`}
                style={{
                  display: "block",
                  width: "100%",
                  textAlign: "left",
                  marginBottom: 10,
                  padding: 16,
                  fontSize: 17,
                  borderRadius: 10,
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
          ) : query.trim().length > 0 ? (
            <p>No songs found.</p>
          ) : (
            <p>No songs are currently loaded for this artist.</p>
          )}
        </div>
      </div>
    </main>
  );
}