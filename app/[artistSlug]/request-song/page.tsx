"use client";

import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "../../../lib/supabase";

type Song = {
  title: string;
  artist: string;
};

export default function DynamicRequestSongPage() {
  const params = useParams();
  const artistSlug = String(params.artistSlug || "");

  const [query, setQuery] = useState("");
  const [songs, setSongs] = useState<Song[]>([]);
  const [songsLoading, setSongsLoading] = useState(true);
  const [selectedSong, setSelectedSong] = useState<Song | null>(null);
  const [mode, setMode] = useState<"tonight" | "future">("tonight");
  const [futureTitle, setFutureTitle] = useState("");
  const [futureArtist, setFutureArtist] = useState("");
  const [name, setName] = useState("");
  const [dedication, setDedication] = useState("");
  const [loading, setLoading] = useState(false);
  const [successMode, setSuccessMode] = useState<"tonight" | "future" | null>(
    null
  );

  useEffect(() => {
    async function loadSongs() {
      setSongsLoading(true);

      const { data, error } = await supabase
        .from("songs")
        .select("title, artist")
        .eq("artist_slug", artistSlug)
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

    if (artistSlug) {
      loadSongs();
    }
  }, [artistSlug]);

  const matches = useMemo(() => {
    const normalize = (text: string) =>
      text.toLowerCase().replace(/[^a-z0-9]/g, "");

    const q = normalize(query.trim());

    if (!q) return songs;

    return songs.filter((song) =>
      normalize(`${song.title} ${song.artist}`).includes(q)
    );
  }, [query, songs]);

  const hasSearch = query.trim().length > 0;
  const hasMatches = matches.length > 0;

  const showFutureSuggestion =
    hasSearch && !songsLoading && matches.length === 0;

  function resetToCatalog() {
    setSelectedSong(null);
    setMode("tonight");
    setFutureTitle("");
    setFutureArtist("");
    setName("");
    setDedication("");
    setQuery("");
    setLoading(false);
    setSuccessMode(null);
  }

  function openTonightRequest(song: Song) {
    setSelectedSong(song);
    setMode("tonight");
    setName("");
    setDedication("");
    setLoading(false);
    setSuccessMode(null);
  }

  function openFutureSuggestion() {
    setSelectedSong(null);
    setMode("future");
    setFutureTitle(query.trim());
    setFutureArtist("");
    setName("");
    setDedication("");
    setLoading(false);
    setSuccessMode(null);
  }

  async function submitRequest() {
    const title = mode === "tonight" ? selectedSong?.title : futureTitle.trim();

    const artist =
      mode === "tonight"
        ? selectedSong?.artist
        : futureArtist.trim() || "Unknown Artist";

    if (!title) return;

    setLoading(true);

    try {
      const response = await fetch("/api/song-request", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          song: title,
          artist,
          requester_name: name.trim() || null,
          dedication: dedication.trim() || null,
          request_type: mode
        })
      });

      const data = await response.json();

      if (!response.ok) {
        alert("Request did not send: " + data.error);
        setLoading(false);
        return;
      }

      setSuccessMode(mode);
    } catch (err) {
      alert("Request did not send. Please try again.");
    }

    setLoading(false);
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        padding: 24,
        background: "#000",
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
        </h1>

        <p
          style={{
            textAlign: "center",
            opacity: 0.8,
            fontSize: 18,
            marginBottom: 24
          }}
        >
          Search by song or artist.
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
            border: "1px solid #333",
            marginBottom: 24
          }}
        />

        <div>
          {songsLoading ? (
            <p>Loading songs...</p>
          ) : matches.length === 0 && query.trim().length === 0 ? (
            <div
              style={{
                background: "#181818",
                padding: 18,
                borderRadius: 12,
                border: "1px solid #333"
              }}
            >
              <p>No songs are currently loaded for this artist.</p>
            </div>
          ) : (
            matches.map((song) => (
              <button
                key={`${song.title}-${song.artist}`}
                onClick={() => openTonightRequest(song)}
                style={{
                  display: "block",
                  width: "100%",
                  textAlign: "left",
                  padding: 16,
                  marginBottom: 10,
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
          )}

          {hasSearch && hasMatches && !songsLoading && (
            <div
              style={{
                background: "#181818",
                padding: 18,
                borderRadius: 12,
                border: "1px solid #333",
                marginTop: 10,
                marginBottom: 10
              }}
            >
              <p style={{ fontWeight: "bold", marginBottom: 8 }}>
                Can&apos;t find the version you&apos;re looking for?
              </p>

              <p style={{ opacity: 0.85, marginBottom: 14 }}>
                Want the artist to consider a different artist, version, or
                arrangement?
              </p>

              <button
                onClick={openFutureSuggestion}
                style={{
                  padding: "14px 20px",
                  fontSize: 17,
                  borderRadius: 8,
                  border: 0,
                  background: "#ffd84d",
                  color: "#000",
                  cursor: "pointer",
                  fontWeight: "bold"
                }}
              >
                Suggest for Future Performance
              </button>
            </div>
          )}

          {showFutureSuggestion && (
            <div
              style={{
                background: "#181818",
                padding: 18,
                borderRadius: 12,
                border: "1px solid #333"
              }}
            >
              <p>No matching songs found.</p>
              <p>Want the artist to consider this for a future show?</p>

              <button
                onClick={openFutureSuggestion}
                style={{
                  padding: "14px 20px",
                  fontSize: 17,
                  borderRadius: 8,
                  border: 0,
                  background: "#ffd84d",
                  color: "#000",
                  cursor: "pointer",
                  fontWeight: "bold"
                }}
              >
                Suggest for Future Performance
              </button>
            </div>
          )}
        </div>
      </div>

      {(selectedSong || mode === "future") && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.82)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 20,
            zIndex: 9999
          }}
        >
          <div
            style={{
              width: "100%",
              maxWidth: 520,
              background: "#181818",
              color: "#fff",
              padding: 24,
              borderRadius: 16,
              border: "1px solid #333"
            }}
          >
            <button
              onClick={resetToCatalog}
              style={{
                float: "right",
                fontSize: 22,
                background: "transparent",
                color: "#fff",
                border: 0,
                cursor: "pointer"
              }}
            >
              ×
            </button>

            {successMode ? (
              <>
                <h2>
                  {successMode === "tonight"
                    ? "Request sent!"
                    : "Suggestion sent!"}
                </h2>

                <p>
                  {successMode === "tonight"
                    ? "Your request was received."
                    : "Your future song suggestion was received."}
                </p>

                <button
                  onClick={resetToCatalog}
                  style={{
                    padding: "12px 18px",
                    fontSize: 16,
                    borderRadius: 8,
                    cursor: "pointer"
                  }}
                >
                  Back to Catalog
                </button>
              </>
            ) : (
              <>
                <h2>
                  {mode === "tonight"
                    ? "Request for Tonight"
                    : "Suggest for Future Show"}
                </h2>

                {mode === "tonight" && selectedSong ? (
                  <>
                    <h3>{selectedSong.title}</h3>
                    <p>{selectedSong.artist}</p>
                  </>
                ) : (
                  <>
                    <input
                      value={futureTitle}
                      onChange={(e) => setFutureTitle(e.target.value)}
                      placeholder="Song title"
                      style={{
                        width: "100%",
                        padding: 14,
                        fontSize: 18,
                        borderRadius: 8,
                        marginBottom: 12
                      }}
                    />

                    <input
                      value={futureArtist}
                      onChange={(e) => setFutureArtist(e.target.value)}
                      placeholder="Artist / version optional"
                      style={{
                        width: "100%",
                        padding: 14,
                        fontSize: 18,
                        borderRadius: 8,
                        marginBottom: 12
                      }}
                    />
                  </>
                )}

                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your first name optional"
                  style={{
                    width: "100%",
                    padding: 14,
                    fontSize: 18,
                    borderRadius: 8,
                    marginBottom: 12
                  }}
                />

                {mode === "tonight" && (
                  <textarea
                    value={dedication}
                    onChange={(e) => setDedication(e.target.value)}
                    placeholder="Dedication or message optional"
                    rows={4}
                    style={{
                      width: "100%",
                      padding: 14,
                      fontSize: 18,
                      borderRadius: 8,
                      marginBottom: 12
                    }}
                  />
                )}

                <button
                  onClick={submitRequest}
                  disabled={loading}
                  style={{
                    padding: "14px 22px",
                    fontSize: 18,
                    borderRadius: 8,
                    cursor: loading ? "not-allowed" : "pointer"
                  }}
                >
                  {loading
                    ? "Sending..."
                    : mode === "tonight"
                    ? "Submit Tonight's Request"
                    : "Suggest for Future Show"}
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </main>
  );
}