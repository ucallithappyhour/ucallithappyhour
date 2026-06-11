"use client";

import { useMemo, useState } from "react";
import { supabase } from "../../lib/supabase";

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
  const [selectedSong, setSelectedSong] = useState<(typeof songs)[number] | null>(null);
  const [name, setName] = useState("");
  const [dedication, setDedication] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return songs;

    return songs.filter((song) =>
      `${song.title} ${song.artist}`.toLowerCase().includes(q)
    );
  }, [query]);

  async function submitRequest() {
    if (!selectedSong || !name.trim()) return;

    setLoading(true);

    const { error } = await supabase.from("song_requests").insert({
      song: selectedSong.title,
      artist: selectedSong.artist,
      requester_name: name.trim(),
      dedication: dedication.trim(),
      status: "pending"
    });

    setLoading(false);

    if (error) {
      alert("Something went wrong. Please try again.");
      return;
    }

    setSubmitted(true);
  }

  if (submitted) {
    return (
      <main style={{ minHeight: "100vh", padding: 40, background: "#000", color: "#fff", fontFamily: "Arial, sans-serif" }}>
        <h1>Request sent!</h1>
        <p>Brian received your request.</p>
        <p>Tips go directly to the artist.</p>

        <a
          href="https://venmo.com/Brian-Quinn-41"
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: "#ffd84d", fontSize: 22 }}
        >
          Tip Brian on Venmo
        </a>

        <br />
        <br />

        <button
          onClick={() => {
            setSelectedSong(null);
            setName("");
            setDedication("");
            setQuery("");
            setSubmitted(false);
          }}
          style={{ padding: "12px 18px", fontSize: 16, borderRadius: 8 }}
        >
          Request another song
        </button>
      </main>
    );
  }

  return (
    <main style={{ minHeight: "100vh", padding: 40, background: "#000", color: "#fff", fontFamily: "Arial, sans-serif" }}>
      <h1>Request tonight&apos;s songs. Influence tomorrow&apos;s setlist.</h1>
      <p>Search by song or artist.</p>

      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search by song or artist..."
        style={{ width: "100%", maxWidth: 500, padding: 14, fontSize: 18, borderRadius: 8, marginTop: 20 }}
      />

      <div style={{ marginTop: 25, maxWidth: 500 }}>
        {matches.map((song) => (
          <button
            key={`${song.title}-${song.artist}`}
            onClick={() => setSelectedSong(song)}
            style={{
              display: "block",
              width: "100%",
              textAlign: "left",
              padding: 14,
              marginBottom: 10,
              fontSize: 17,
              borderRadius: 8,
              background: selectedSong?.title === song.title && selectedSong?.artist === song.artist ? "#ffd84d" : "#f3f3f3",
              color: "#000",
              cursor: "pointer"
            }}
          >
            <strong>{song.title}</strong>
            <br />
            <span>{song.artist}</span>
          </button>
        ))}
      </div>

      {selectedSong && (
        <div style={{ marginTop: 30, maxWidth: 500, background: "#181818", padding: 20, borderRadius: 12 }}>
          <h2>{selectedSong.title} — {selectedSong.artist}</h2>

          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your first name"
            style={{ width: "100%", padding: 14, fontSize: 18, borderRadius: 8, marginBottom: 12 }}
          />

          <textarea
            value={dedication}
            onChange={(e) => setDedication(e.target.value)}
            placeholder="Dedication or message optional"
            rows={4}
            style={{ width: "100%", padding: 14, fontSize: 18, borderRadius: 8, marginBottom: 12 }}
          />

          <p>Want to support the artist?</p>

          <a
            href="https://venmo.com/Brian-Quinn-41"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "#ffd84d", fontSize: 20 }}
          >
            Tip Brian on Venmo
          </a>

          <br />
          <br />

          <button
            onClick={submitRequest}
            disabled={loading || !name.trim()}
            style={{ padding: "14px 22px", fontSize: 18, borderRadius: 8, cursor: loading || !name.trim() ? "not-allowed" : "pointer" }}
          >
            {loading ? "Sending..." : "Submit Request"}
          </button>
        </div>
      )}
    </main>
  );
}