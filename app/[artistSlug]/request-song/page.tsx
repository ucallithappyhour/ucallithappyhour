"use client";

import { useParams, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "../../../lib/supabase";

type Song = {
  title: string;
  artist: string;
};

type Artist = {
  artist_slug: string;
  artist_name: string | null;
  tip_type: string | null;
  tip_link: string | null;
};

export default function DynamicRequestSongPage() {
  const params = useParams();
  const searchParams = useSearchParams();

  const artistSlug = String(params.artistSlug || "");
  const requestTypeFromUrl = searchParams.get("type");
  const gigIdFromUrl = searchParams.get("gig");

  const isGigFutureRequest =
    requestTypeFromUrl === "future" && Boolean(gigIdFromUrl);

  const [artist, setArtist] = useState<Artist | null>(null);
  const [query, setQuery] = useState("");
  const [songs, setSongs] = useState<Song[]>([]);
  const [songsLoading, setSongsLoading] = useState(true);
  const [selectedSong, setSelectedSong] = useState<Song | null>(null);
  const [mode, setMode] = useState<"tonight" | "future">(
    requestTypeFromUrl === "future" ? "future" : "tonight"
  );
  const [futureTitle, setFutureTitle] = useState("");
  const [futureArtist, setFutureArtist] = useState("");
  const [name, setName] = useState("");
  const [dedication, setDedication] = useState("");
  const [loading, setLoading] = useState(false);
  const [freeBirdMode, setFreeBirdMode] = useState(false);
  const [premiumSongMode, setPremiumSongMode] = useState<
  "browneyedgirl" | "wagonwheel" | false
>(false);
  const [successMode, setSuccessMode] = useState<"tonight" | "future" | null>(
    null
);
const [limitReached, setLimitReached] = useState(false);
const [audienceEmail, setAudienceEmail] = useState("");
const [audienceMessage, setAudienceMessage] = useState("");
const [savingAudience, setSavingAudience] = useState(false);
const [audienceSaved, setAudienceSaved] = useState(false);

  const artistName = artist?.artist_name || "the artist";
  const resolvedArtistSlug = artist?.artist_slug || artistSlug;

  useEffect(() => {
    async function loadArtistAndSongs() {
      setSongsLoading(true);

      const { data: artistData } = await supabase
        .from("artists")
        .select("artist_slug, artist_name, tip_type, tip_link")
        .eq("artist_slug", artistSlug)
        .single();

      setArtist(artistData || null);

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
      loadArtistAndSongs();
    }
  }, [artistSlug]);

  useEffect(() => {
    if (requestTypeFromUrl === "future") {
      setMode("future");
      setSelectedSong(null);
    }
  }, [requestTypeFromUrl]);

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
    setMode(requestTypeFromUrl === "future" ? "future" : "tonight");
    setFutureTitle("");
    setFutureArtist("");
    setName("");
    setDedication("");
    setQuery("");
    setLoading(false);
    setFreeBirdMode(false);
    setPremiumSongMode(false);
    setSuccessMode(null);
    setLimitReached(false);
  }

function openTonightRequest(song: Song) {
  const normalizedTitle = song.title.toLowerCase().replace(/[^a-z0-9]/g, "");
  const normalizedSlug = String(artistSlug).toLowerCase().trim();

  setName("");
  setDedication("");
  setLoading(false);
  setFreeBirdMode(false);
  setPremiumSongMode(false);
  setSuccessMode(null);

  if (normalizedSlug === "brian-quinn") {
    if (normalizedTitle.includes("freebird")) {
      setSelectedSong(null);
      setMode("tonight");
      setFreeBirdMode(true);
      return;
    }

if (
  normalizedTitle.includes("browneyedgirl") ||
  normalizedTitle.includes("vanmorrison")
) {
  setSelectedSong(null);
  setMode("tonight");
  setPremiumSongMode("browneyedgirl");
  return;
}

if (
  normalizedTitle.includes("wagonwheel") ||
  normalizedTitle.includes("dariusrucker")
) {
  setSelectedSong(null);
  setMode("tonight");
  setPremiumSongMode("wagonwheel");
  return;
}
  }

  setSelectedSong(song);
  setMode("tonight");
}

function openFutureSuggestion() {
  const normalizedTitle = query.toLowerCase().replace(/[^a-z0-9]/g, "");
  const normalizedSlug = String(artistSlug).toLowerCase().trim();

  setSelectedSong(null);
  setMode("future");
  setFutureTitle(query.trim());
  setFutureArtist("");
  setName("");
  setDedication("");
  setLoading(false);
  setFreeBirdMode(false);
  setPremiumSongMode(false);
  setSuccessMode(null);

  if (normalizedSlug === "brian-quinn") {
    if (normalizedTitle.includes("freebird")) {
      setFreeBirdMode(true);
      return;
    }

   if (
  normalizedTitle.includes("browneyedgirl") ||
  normalizedTitle.includes("browneyegirl")
) {
  setPremiumSongMode("browneyedgirl");
  return;
}

  if (
  normalizedTitle.includes("wagonwheel") ||
  normalizedTitle.includes("wagonwheels")
) {
  setPremiumSongMode("wagonwheel");
  return;
}
  }
}

  function openTipLink() {
    if (!artist?.tip_link) return;
    window.open(artist.tip_link, "_blank", "noopener,noreferrer");
  }

async function saveAudienceEmail() {
  setAudienceMessage("");

  const cleanEmail = audienceEmail.trim().toLowerCase();

  if (!cleanEmail || !cleanEmail.includes("@")) {
    setAudienceMessage("Please enter a valid email address.");
    return;
  }

  setSavingAudience(true);

  const { error } = await supabase.from("audience_members").insert({
    email: cleanEmail,
    artist_slug: resolvedArtistSlug,
    source: "request_confirmation"
  });

  setSavingAudience(false);

  if (error) {
    setAudienceMessage("Could not save your email. Please try again.");
    return;
  }

  setAudienceSaved(true);
  setAudienceMessage("You're on the list!");
}

async function submitRequest() {
  const title = mode === "tonight" ? selectedSong?.title : futureTitle.trim();

  const songArtist =
    mode === "tonight"
      ? selectedSong?.artist
      : futureArtist.trim() || "Unknown Artist";

  if (!title) return;

  const normalizedTitle = title.toLowerCase().replace(/[^a-z0-9]/g, "");

  let visitorId = localStorage.getItem("ucihh-visitor-id");

if (!visitorId) {
  visitorId = crypto.randomUUID();
  localStorage.setItem("ucihh-visitor-id", visitorId);
}

  if (artistSlug === "brian-quinn") {
    if (normalizedTitle.includes("freebird")) {
      setFreeBirdMode(true);
      return;
    }
  }

  if (normalizedTitle.includes("browneyedgirl")) {
    setPremiumSongMode("browneyedgirl");
    return;
  }

  if (normalizedTitle.includes("wagonwheel")) {
    setPremiumSongMode("wagonwheel");
    return;
  }

const todayKey = new Date().toLocaleDateString("en-CA", {
  timeZone: "America/New_York",
});

const requestLimitKey = [
  "ucihh-request-count",
  resolvedArtistSlug,
  gigIdFromUrl || "no-gig",
].join("-");

const currentRequestCount = parseInt(
  localStorage.getItem(requestLimitKey) ?? "0",
  10
);

if (currentRequestCount >= 3) {
  alert(
    "You've reached the maximum of 3 requests for this performance. Thanks for helping shape the setlist! 🎵"
  );
  return;
}

  setLoading(true);

  try {
    const response = await fetch("/api/song-request", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        song: title,
        artist: songArtist,
        artist_slug: resolvedArtistSlug,
        requester_name: name.trim() || null,
        dedication: dedication.trim() || null,
        request_type: mode,
        gig_id: gigIdFromUrl ? Number(gigIdFromUrl) : null,
visitor_id: visitorId,
      })
    });

const data = await response.json();

if (!response.ok) {
  alert("Request did not send: " + (data.error || "Unknown error"));
  setLoading(false);
  return;
}

const newCount = currentRequestCount + 1;

localStorage.setItem(requestLimitKey, String(newCount));

if (newCount >= 3) {
  setLimitReached(true);
}

setSuccessMode(mode);

} catch (err) {
  console.error(err);
  alert("Request did not send. Please try again.");
} finally {
  setLoading(false);
}
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
      <div style={{ width: "100%", maxWidth: 760, margin: "0 auto" }}>
        <h1
          style={{
            fontSize: "clamp(30px, 7vw, 56px)",
            lineHeight: 1,
            marginBottom: 12,
            textAlign: "center"
          }}
        >
          {isGigFutureRequest
            ? "Help build this show's setlist."
            : "Request tonight's songs."}
        </h1>

        <p
          style={{
            textAlign: "center",
            opacity: 0.8,
            fontSize: 18,
            marginBottom: 24
          }}
        >
          {isGigFutureRequest
            ? "Suggest songs for this upcoming performance."
            : "Search by song or artist."}
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
            <>
              {matches.map((song) => (
                <button
                  key={`${song.title}-${song.artist}`}
                  onClick={() =>
                    isGigFutureRequest
                      ? (setSelectedSong(song),
                        setMode("future"),
                        setFutureTitle(song.title),
                        setFutureArtist(song.artist),
                        setSuccessMode(null),
                        setFreeBirdMode(false))
                      : openTonightRequest(song)
                  }
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
              ))}

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
            </>
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

      {(selectedSong ||
  futureTitle.trim().length > 0 ||
  freeBirdMode ||
  premiumSongMode) && (
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

            {freeBirdMode ? (
              <>
                <h2 style={{ marginTop: 0 }}>🦅 Free Bird Request Detected</h2>

                <p style={{ fontSize: 17, lineHeight: 1.5 }}>
                  Brian&apos;s current rate for Free Bird is{" "}
                  <strong>$1,000</strong>.
                </p>

                <button
                  onClick={openTipLink}
                  style={{
                    width: "100%",
                    padding: "15px 18px",
                    fontSize: 18,
                    borderRadius: 10,
                    border: 0,
                    background: "#ffd84d",
                    color: "#000",
                    cursor: "pointer",
                    fontWeight: "bold",
                    marginBottom: 12
                  }}
                >
                  💸 Pay Brian $1,000
                </button>

                <button
                  onClick={resetToCatalog}
                  style={{
                    width: "100%",
                    padding: "12px 18px",
                    fontSize: 16,
                    borderRadius: 8,
                    cursor: "pointer"
                  }}
                >
                  Back to Catalog
                </button>
              </>
            ) : premiumSongMode ? (
  <>
    <h2 style={{ marginTop: 0 }}>
  {premiumSongMode === "browneyedgirl"
    ? "👀 Brown Eyed Girl Detected"
    : "🛞 Wagon Wheel Detected"}
</h2>

    <p style={{ fontSize: 17, lineHeight: 1.5 }}>
      Brian&apos;s current rate for this song is <strong>$500</strong>.
    </p>

    <p style={{ fontSize: 17, lineHeight: 1.5 }}>
  {premiumSongMode === "browneyedgirl"
    ? "Brian has heard this request approximately 47,000 times."
    : "Brian will happily spin that wheel one more time."}

  <br />
  <br />

  Current rate: <strong>$500</strong>.
</p>

<button
      onClick={openTipLink}
      style={{
        width: "100%",
        padding: "15px 18px",
        fontSize: 18,
        borderRadius: 10,
        border: 0,
        background: "#ffd84d",
        color: "#000",
        cursor: "pointer",
        fontWeight: "bold",
        marginBottom: 12
      }}
    >
      💸 Pay Brian $500
    </button>

    <button
      onClick={resetToCatalog}
      style={{
        width: "100%",
        padding: "12px 18px",
        fontSize: 16,
        borderRadius: 8,
        cursor: "pointer"
      }}
    >
      Back to Catalog
    </button>
  </>
) : successMode ? (
              <>
                <h2 style={{ marginTop: 0 }}>
                  {successMode === "tonight"
                    ? "🎵 Request Sent!"
                    : "🎵 Suggestion Received!"}
                </h2>

                <p style={{ fontSize: 17, lineHeight: 1.5 }}>
                  {successMode === "tonight"
                    ? "Thanks for helping shape tonight's setlist."
                    : `We'll pass your suggestion along to ${artistName} for future shows.`}
                </p>

{successMode === "tonight" && (
  <>
    <p
      style={{
        fontSize: 15,
        lineHeight: 1.5,
        color: "#bbb",
        marginBottom: 18
      }}
    >
      Your request has been sent to the artist. They'll do their best to play
      it, depending on timing, audience requests, and the flow of the show.
    </p>

    {limitReached && (
      <div
        style={{
          background: "#2a2200",
          border: "1px solid #ffd84d",
          color: "#ffd84d",
          padding: 14,
          borderRadius: 10,
          marginBottom: 18,
          lineHeight: 1.5
        }}
      >
        <strong>🎉 You've reached your limit for tonight!</strong>

        <br />
        <br />

        You've used all 3 song requests for this performance. Thanks for helping
        shape tonight's setlist!

        <br />
        <br />

        You'll be able to request 3 more songs at the next show.
      </div>
    )}
  </>
)}

                {artist?.tip_link && (
                  <>
                    <p style={{ fontSize: 17, lineHeight: 1.5 }}>
                      {successMode === "tonight"
                        ? `Enjoying ${artistName}'s music?`
                        : `Love what ${artistName} does?`}
                    </p>

                    <button
                      onClick={openTipLink}
                      style={{
                        width: "100%",
                        padding: "15px 18px",
                        fontSize: 18,
                        borderRadius: 10,
                        border: 0,
                        background: "#ffd84d",
                        color: "#000",
                        cursor: "pointer",
                        fontWeight: "bold",
                        marginBottom: 12
                      }}
                    >
                      💵 Tip {artistName}
                    </button>
                  </>
                )}

{!audienceSaved ? (
  <div
    style={{
      background: "#181818",
      padding: 18,
      borderRadius: 12,
      border: "1px solid #333",
      marginTop: 16,
      marginBottom: 16
    }}
  >
    <p style={{ fontWeight: "bold", fontSize: 17, marginBottom: 8 }}>
      Want to know when {artistName} plays again?
    </p>

    <p style={{ color: "#bbb", lineHeight: 1.5, marginBottom: 12 }}>
      Enter your email and we'll keep you posted about future shows.
    </p>

    <input
      value={audienceEmail}
      onChange={(e) => setAudienceEmail(e.target.value)}
      placeholder="Email address"
      type="email"
      style={{
        width: "100%",
        padding: 14,
        fontSize: 16,
        borderRadius: 8,
        marginBottom: 10
      }}
    />

    <button
      onClick={saveAudienceEmail}
      disabled={savingAudience}
      style={{
        width: "100%",
        padding: "14px 18px",
        fontSize: 16,
        borderRadius: 8,
        border: 0,
        background: "#ffd84d",
        color: "#000",
        cursor: "pointer",
        fontWeight: "bold"
      }}
    >
      {savingAudience ? "Saving..." : "Keep Me Updated"}
    </button>

    {audienceMessage && (
      <p style={{ marginTop: 10, color: "#ffd84d" }}>
        {audienceMessage}
      </p>
    )}
  </div>
) : (
  <p
    style={{
      color: "#7ee787",
      fontWeight: "bold",
      marginTop: 16,
      marginBottom: 16
    }}
  >
    ✅ Thanks! We'll keep you posted on future shows.
  </p>
)}

                <p style={{ opacity: 0.75, fontSize: 14, lineHeight: 1.4 }}>
                  No pressure — your{" "}
                  {successMode === "tonight" ? "request" : "suggestion"} has
                  already been submitted.
                </p>

                <button
                  onClick={resetToCatalog}
                  style={{
                    width: "100%",
                    padding: "12px 18px",
                    fontSize: 16,
                    borderRadius: 8,
                    cursor: "pointer",
                    marginTop: 8
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
                    : isGigFutureRequest
                    ? "Request for This Future Gig"
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
                    : isGigFutureRequest
                    ? "Submit Future Gig Request"
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
