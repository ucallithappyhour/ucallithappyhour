"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "../../../lib/supabase";

type Artist = {
  artist_slug: string;
  artist_name: string | null;
};

type Song = {
  id: number;
  title: string;
  artist: string;
  is_active: boolean;
};

export default function SongLibraryPage() {
  const [lockedArtist, setLockedArtist] = useState<Artist | null>(null);
  const [setupToken, setSetupToken] = useState("");
  const [songs, setSongs] = useState<Song[]>([]);
  const [query, setQuery] = useState("");
  const [newTitle, setNewTitle] = useState("");
  const [newArtist, setNewArtist] = useState("");
  const [bulkText, setBulkText] = useState("");
  const [message, setMessage] = useState("Loading...");
  const [loading, setLoading] = useState(true);

  async function loadSongs(slug: string) {
    const { data, error } = await supabase
      .from("songs")
      .select("id, title, artist, is_active")
      .eq("artist_slug", slug)
      .order("artist", { ascending: true })
      .order("title", { ascending: true });

    if (error) {
      setMessage("Could not load songs: " + error.message);
      return;
    }

    setSongs(data || []);
    setMessage("");
  }

  async function loadArtist() {
    setLoading(true);

    const params = new URLSearchParams(window.location.search);
    const token = params.get("token") || "";
    setSetupToken(token);

    if (token) {
      const { data, error } = await supabase
        .from("artists")
        .select("artist_slug, artist_name")
        .eq("setup_token", token)
        .maybeSingle();

      if (error || !data) {
        setMessage("Could not find your artist setup.");
        setLoading(false);
        return;
      }

      setLockedArtist(data);
      await loadSongs(data.artist_slug);
      setLoading(false);
      return;
    }

    const {
      data: { user }
    } = await supabase.auth.getUser();

    if (!user?.email) {
      setMessage("Please log in to manage your song library.");
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("artists")
      .select("artist_slug, artist_name")
      .eq("owner_email", user.email)
      .maybeSingle();

    if (error || !data) {
      setMessage("No artist account was found for this login.");
      setLoading(false);
      return;
    }

    setLockedArtist(data);
    await loadSongs(data.artist_slug);
    setLoading(false);
  }

  useEffect(() => {
    loadArtist();
  }, []);

  const filteredSongs = useMemo(() => {
    const q = query.trim().toLowerCase();

    if (!q) return songs;

    return songs.filter((song) =>
      `${song.title} ${song.artist}`.toLowerCase().includes(q)
    );
  }, [query, songs]);

  async function addSong() {
    if (!lockedArtist) return;

    if (!newTitle.trim() || !newArtist.trim()) {
      setMessage("Add both song title and artist.");
      return;
    }

    const { error } = await supabase.from("songs").insert({
      artist_slug: lockedArtist.artist_slug,
      title: newTitle.trim(),
      artist: newArtist.trim(),
      is_active: true
    });

    if (error) {
      setMessage("Could not add song: " + error.message);
      return;
    }

    setNewTitle("");
    setNewArtist("");
    setMessage("Song added.");
    loadSongs(lockedArtist.artist_slug);
  }

  async function toggleSong(song: Song) {
    if (!lockedArtist) return;

    const { error } = await supabase
      .from("songs")
      .update({ is_active: !song.is_active })
      .eq("id", song.id)
      .eq("artist_slug", lockedArtist.artist_slug);

    if (error) {
      setMessage("Could not update song: " + error.message);
      return;
    }

    loadSongs(lockedArtist.artist_slug);
  }

  async function deleteSong(song: Song) {
    if (!lockedArtist) return;

    const confirmDelete = window.confirm(
      `Delete "${song.title}" by ${song.artist}?`
    );

    if (!confirmDelete) return;

    const { error } = await supabase
      .from("songs")
      .delete()
      .eq("id", song.id)
      .eq("artist_slug", lockedArtist.artist_slug);

    if (error) {
      setMessage("Could not delete song: " + error.message);
      return;
    }

    setMessage("Song deleted.");
    loadSongs(lockedArtist.artist_slug);
  }

  async function importBulkSongs() {
    if (!lockedArtist) return;

    const lines = bulkText
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);

    if (lines.length === 0) {
      setMessage("Paste songs first.");
      return;
    }

    const rows = lines
      .map((line) => {
        const parts = line.split(",").map((part) => part.trim());

        if (parts.length < 2) return null;

        return {
          artist_slug: lockedArtist.artist_slug,
          artist: parts[0],
          title: parts.slice(1).join(","),
          is_active: true
        };
      })
      .filter(Boolean);

    const { error } = await supabase.from("songs").insert(rows);

    if (error) {
      setMessage("Could not import songs: " + error.message);
      return;
    }

    setBulkText("");
    setMessage(`${rows.length} songs imported.`);
    loadSongs(lockedArtist.artist_slug);
  }

  if (loading) {
    return (
      <main className="page">
        <div className="overlay">
          <div className="container">
            <div className="hero">
              <div className="brand">U CALL IT HAPPY HOUR</div>
              <h1 className="title">Song Library</h1>
              <div className="message">Loading...</div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="page">
      <div className="overlay">
        <div className="container">
          <div className="hero">
            <div className="brand">U CALL IT HAPPY HOUR</div>

            <h1 className="title">Song Library</h1>

            <p className="tagline">
              Add, remove, and manage requestable songs.
            </p>

            {message && <div className="message">{message}</div>}

            {lockedArtist && (
              <>
                <div className="section">
                  <h2>Artist</h2>

                  <div
                    style={{
                      padding: 14,
                      borderRadius: 10,
                      marginBottom: 18,
                      border: "1px solid rgba(255,255,255,0.2)",
                      background: "rgba(255,255,255,0.08)",
                      fontWeight: 800
                    }}
                  >
                    Managing Library For:{" "}
                    {lockedArtist.artist_name || lockedArtist.artist_slug}
                  </div>

                  <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search songs..."
                    style={{
                      width: "100%",
                      padding: 14,
                      borderRadius: 10,
                      marginBottom: 18
                    }}
                  />

                  <p className="details">
                    Showing {filteredSongs.length} of {songs.length} songs.
                  </p>
                </div>

                <div className="section">
                  <h2>Add Song</h2>

                  <input
                    value={newArtist}
                    onChange={(e) => setNewArtist(e.target.value)}
                    placeholder="Original artist / performer"
                    style={{
                      width: "100%",
                      padding: 14,
                      borderRadius: 10,
                      marginBottom: 12
                    }}
                  />

                  <input
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="Song title"
                    style={{
                      width: "100%",
                      padding: 14,
                      borderRadius: 10,
                      marginBottom: 12
                    }}
                  />

                  <button className="btn" onClick={addSong}>
                    Add Song
                  </button>
                </div>

                <div className="section">
                  <h2>Bulk Import</h2>

                  <p className="details">
                    Paste one song per line in this format: Artist, Title
                  </p>

                  <textarea
                    value={bulkText}
                    onChange={(e) => setBulkText(e.target.value)}
                    placeholder={"Tom Petty, Free Fallin'\nPearl Jam, Black"}
                    rows={6}
                    style={{
                      width: "100%",
                      padding: 14,
                      borderRadius: 10,
                      marginBottom: 12
                    }}
                  />

                  <button className="btn" onClick={importBulkSongs}>
                    Import Songs
                  </button>
                </div>

                <div className="section">
                  <h2>Current Library</h2>

                  {filteredSongs.map((song) => (
                    <div
                      key={song.id}
                      className="event-card"
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        gap: 16,
                        alignItems: "center"
                      }}
                    >
                      <div>
                        <p className="performer">{song.title}</p>
                        <p className="details">{song.artist}</p>
                        <p className="details">
                          Status: {song.is_active ? "Active" : "Hidden"}
                        </p>
                      </div>

                      <div className="actions">
                        <button
                          className="btn secondary"
                          onClick={() => toggleSong(song)}
                        >
                          {song.is_active ? "Hide" : "Show"}
                        </button>

                        <button
                          className="btn secondary"
                          onClick={() => deleteSong(song)}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}

                  {filteredSongs.length === 0 && (
                    <p className="details">No songs added yet.</p>
                  )}
                </div>

                {setupToken && (
                  <div className="actions" style={{ marginTop: 24 }}>
                    <Link
                      className="btn"
                      href={`/account/setup/next?token=${setupToken}`}
                    >
                      Back to Setup Steps
                    </Link>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}