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

type Song = {
  title: string;
  artist: string;
};

export default function RequestSongPage() {
  const [query, setQuery] = useState("");
  const [selectedSong, setSelectedSong] = useState<Song | null>(null);
  const [mode, setMode] = useState<"tonight" | "future">("tonight");
  const [futureTitle, setFutureTitle] = useState("");
  const [futureArtist, setFutureArtist] = useState("");
  const [name, setName] = useState("");
  const [dedication, setDedication] = useState("");
  const [loading, setLoading] = useState(false);
  const [successMode, setSuccessMode] = useState<"tonight" | "future" | null>(null);

  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return songs;

    return songs.filter((song) =>
      `${song.title} ${song.artist}`.toLowerCase().includes(q)
    );
  }, [query]);

  const showFutureSuggestion = query.trim().length > 0 && matches.length === 0;

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
    setSuccessMode(null);
  }

  function openFutureSuggestion() {
    setSelectedSong(null);
    setMode("future");
    setFutureTitle(query.trim());
    setFutureArtist("");
    setName("");
    setDedication("");
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

    const { error } = await supabase.from("song_requests").insert({
      song: title,
      artist,
      requester_name: name.trim(),
      dedication: dedication.trim(),
      status: "pending",
      request_type: mode
    });

    setLoading(false);

    if (error) {
      alert("Something went wrong. Please try again.");
      return;
    }

    setSuccessMode(mode);
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        padding: 40,
        background: "#000",
        color: "#fff",
        fontFamily: "Arial, sans-serif"
      }}
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(320px, 550px) 1fr",
          gap: 40,
          alignItems: "start"
        }}
      >
        <div>
          <h1>Request tonight&apos;s songs. Influence tomorrow&apos;s setlist.</h1>
          <p>Search by song or artist.</p>

          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by song or artist..."
            style={{
              width: "100%",
              maxWidth: 500,
              padding: 14,
              fontSize: 18,
              borderRadius: 8,
              marginTop: 20
            }}
          />

          <div style={{ marginTop: 25, maxWidth: 500 }}>
            {matches.map((song) => (
              <button
                key={`${song.title}-${song.artist}`}
                onClick={() => openTonightRequest(song)}
                style={{
                  display: "block",
                  width: "100%",
                  textAlign: "left",
                  padding: 14,
                  marginBottom: 10,
                  fontSize: 17,
                  borderRadius: 8,
                  background: "#f3f3f3",
                  color: "#000",
                  cursor: "pointer"
                }}
              >
                <strong>{song.title}</strong>
                <br />
                <span>{song.artist}</span>
              </button>
            ))}

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
                <p>Want Brian to consider this for a future show?</p>

                <button
                  onClick={openFutureSuggestion}
                  style={{
                    padding: "14px 20px",
                    fontSize: 17,
                    borderRadius: 8,
                    background: "#ffd84d",
                    color: "#000",
                    cursor: "pointer"
                  }}
                >
                  Suggest for Future Performance
                </button>
              </div>
            )}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            minHeight: 500,
            textAlign: "center"
          }}
        >
          <img
            src="/brian-logo.jpg"
            alt="Brian Quinn Logo"
            style={{
              width: "100%",
              maxWidth: 320,
              marginBottom: 30
            }}
          />

          <h2 style={{ marginBottom: 10 }}>Brian Quinn</h2>

          <p style={{ opacity: 0.8, marginBottom: 20 }}>
            Screwballs • Fridays • 5–7 PM
          </p>

          <p style={{ maxWidth: 320, lineHeight: 1.6, opacity: 0.75 }}>
            Request tonight&apos;s songs.
            <br />
            Influence tomorrow&apos;s setlist.
          </p>
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
                <h2>{successMode === "tonight" ? "Request sent!" : "Suggestion sent!"}</h2>

                <p>
                  {successMode === "tonight"
                    ? "Brian received your request."
                    : "Brian received your future song suggestion."}
                </p>

                <p>
                  {successMode === "tonight"
                    ? "Enjoying the music?"
                    : "Love supporting live music?"}
                </p>

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
                <h2>{mode === "tonight" ? "Request for Tonight" : "Suggest for Future Show"}</h2>

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
                      placeholder="Artist name optional"
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