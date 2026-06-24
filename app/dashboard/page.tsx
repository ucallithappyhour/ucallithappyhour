"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "../../lib/supabase";

type Artist = {
  artist_slug: string;
  artist_name: string | null;
};

type Gig = {
  id: number;
  venue_name: string | null;
  gig_date: string | null;
  start_time: string | null;
  end_time: string | null;
};

type PlaylistSong = {
  id: number;
  gig_id: number;
  artist_slug: string;
  song: string;
  artist: string | null;
  position: number | null;
  created_at: string;
};

type SongRequest = {
  id: number;
  song: string;
  artist: string;
  requester_name: string | null;
  dedication: string | null;
  status: string;
  request_type: "tonight" | "future" | null;
  created_at: string;
  artist_slug: string | null;
  gig_id: number | null;
};

type RequestGroup = {
  song: string;
  artist: string;
  requestType: string;
  items: SongRequest[];
};

type GigRequestGroup = {
  gigId: number;
  gig: Gig | null;
  groups: RequestGroup[];
  playlist: PlaylistSong[];
};

export default function DashboardPage() {
  const [requests, setRequests] = useState<SongRequest[]>([]);
  const [playlistSongs, setPlaylistSongs] = useState<PlaylistSong[]>([]);
  const [gigsById, setGigsById] = useState<Record<number, Gig>>({});
  const [artist, setArtist] = useState<Artist | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
const [manualSongGigId, setManualSongGigId] = useState<number | null>(null);
const [manualSongTitle, setManualSongTitle] = useState("");
const [manualSongArtist, setManualSongArtist] = useState("");
  async function loadArtistAndRequests() {
    setLoading(true);
    setMessage("");

    const params = new URLSearchParams(window.location.search);
    const artistFromUrl = params.get("artist");

    let artistData: Artist | null = null;

    if (artistFromUrl) {
      const { data, error } = await supabase
        .from("artists")
        .select("artist_slug, artist_name")
        .eq("artist_slug", artistFromUrl)
        .maybeSingle();

      if (error || !data) {
        setArtist(null);
        setRequests([]);
        setPlaylistSongs([]);
        setMessage("Could not load that artist dashboard.");
        setLoading(false);
        return;
      }

      artistData = data;
    } else {
      const {
        data: { user }
      } = await supabase.auth.getUser();

      if (!user?.email) {
        setArtist(null);
        setRequests([]);
        setPlaylistSongs([]);
        setMessage("Please log in to view your dashboard.");
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("artists")
        .select("artist_slug, artist_name")
        .eq("owner_email", user.email)
        .maybeSingle();

      if (error || !data) {
        setArtist(null);
        setRequests([]);
        setPlaylistSongs([]);
        setMessage("No artist profile is linked to this login.");
        setLoading(false);
        return;
      }

      artistData = data;
    }

    setArtist(artistData);

    const { data: requestData, error: requestError } = await supabase
      .from("song_requests")
      .select("*")
      .eq("artist_slug", artistData.artist_slug)
      .eq("status", "pending")
      .order("created_at", { ascending: false });

    if (requestError) {
      setRequests([]);
      setPlaylistSongs([]);
      setGigsById({});
      setMessage(`Could not load song requests: ${requestError.message}`);
      setLoading(false);
      return;
    }

    const { data: playlistData, error: playlistError } = await supabase
      .from("gig_playlists")
      .select("*")
      .eq("artist_slug", artistData.artist_slug)
      .order("position", { ascending: true })
      .order("created_at", { ascending: true });

    if (playlistError) {
      setRequests([]);
      setPlaylistSongs([]);
      setGigsById({});
      setMessage(`Could not load playlists: ${playlistError.message}`);
      setLoading(false);
      return;
    }

    const loadedRequests = (requestData || []) as SongRequest[];
    const loadedPlaylistSongs = (playlistData || []) as PlaylistSong[];

    setRequests(loadedRequests);
    setPlaylistSongs(loadedPlaylistSongs);

    const gigIds = Array.from(
      new Set(
        [
          ...loadedRequests.map((request) => request.gig_id),
          ...loadedPlaylistSongs.map((song) => song.gig_id)
        ].filter((gigId): gigId is number => typeof gigId === "number")
      )
    );

    if (gigIds.length > 0) {
      const { data: gigData, error: gigError } = await supabase
        .from("gigs")
        .select("id, venue_name, gig_date, start_time, end_time")
        .in("id", gigIds);

      if (gigError) {
        setGigsById({});
      } else {
        const nextGigsById: Record<number, Gig> = {};

        (gigData || []).forEach((gig) => {
          nextGigsById[gig.id] = gig;
        });

        setGigsById(nextGigsById);
      }
    } else {
      setGigsById({});
    }

    setLoading(false);
  }

  useEffect(() => {
    loadArtistAndRequests();

    const channel = supabase
      .channel("song-request-updates")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "song_requests"
        },
        () => {
          loadArtistAndRequests();
        }
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "gig_playlists"
        },
        () => {
          loadArtistAndRequests();
        }
      )
      .subscribe((status) => {
  console.log("Realtime status:", status);
});

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  function groupRequests(items: SongRequest[]) {
    const groups: Record<string, SongRequest[]> = {};

    items.forEach((request) => {
      const requestType = request.request_type || "tonight";
      const key = `${request.song}|||${request.artist}|||${requestType}`;

      if (!groups[key]) groups[key] = [];
      groups[key].push(request);
    });

    return Object.entries(groups)
      .map(([key, groupedItems]) => {
        const [song, requestArtist, requestType] = key.split("|||");

        return {
          song,
          artist: requestArtist,
          requestType,
          items: groupedItems
        };
      })
      .sort((a, b) => b.items.length - a.items.length);
  }

  function formatGigDate(gig: Gig | null) {
    if (!gig?.gig_date) return "Date TBD";

    return new Date(`${gig.gig_date}T12:00:00`).toLocaleDateString([], {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric"
    });
  }

  function formatGigTime(gig: Gig | null) {
    if (!gig?.start_time) return "";

    const start = gig.start_time.slice(0, 5);
    const end = gig.end_time ? gig.end_time.slice(0, 5) : "";

    return end ? `${start} - ${end}` : start;
  }

  const tonightGroups = useMemo(
    () =>
      groupRequests(
        requests.filter(
          (request) => (request.request_type || "tonight") === "tonight"
        )
      ),
    [requests]
  );

  const upcomingGigGroups = useMemo(() => {
    const futureWithGig = requests.filter(
      (request) => request.request_type === "future" && request.gig_id
    );

    const gigIds = Array.from(
      new Set([
        ...futureWithGig
          .map((request) => request.gig_id)
          .filter((gigId): gigId is number => typeof gigId === "number"),
        ...playlistSongs.map((song) => song.gig_id)
      ])
    );

    return gigIds
      .map((gigId) => {
        const gigRequests = futureWithGig.filter(
          (request) => request.gig_id === gigId
        );

        const gigPlaylist = playlistSongs.filter(
          (playlistSong) => playlistSong.gig_id === gigId
        );

        return {
          gigId,
          gig: gigsById[gigId] || null,
          groups: groupRequests(gigRequests),
          playlist: gigPlaylist
        };
      })
      .sort((a, b) => {
        const aDate = a.gig?.gig_date || "";
        const bDate = b.gig?.gig_date || "";
        return aDate.localeCompare(bDate);
      });
  }, [requests, playlistSongs, gigsById]);

  const unassignedFutureGroups = useMemo(
    () =>
      groupRequests(
        requests.filter(
          (request) => request.request_type === "future" && !request.gig_id
        )
      ),
    [requests]
  );

  async function updateGroup(group: RequestGroup, status: string) {
    const ids = group.items.map((request) => request.id);

    if (ids.length === 0) return;

    setRequests((current) =>
      current.filter((request) => !ids.includes(request.id))
    );

    const response = await fetch("/api/song-request-status", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        ids,
        status
      })
    });

    const data = await response.json();

    if (!response.ok) {
      setMessage(`Could not update request: ${data.error}`);
      loadArtistAndRequests();
    }
  }

  async function addGroupToPlaylist(group: RequestGroup) {
    if (!artist?.artist_slug) return;

    const firstRequest = group.items[0];

    if (!firstRequest?.gig_id) {
      setMessage("This request is not tied to a gig yet.");
      return;
    }

    const existingForGig = playlistSongs.filter(
      (song) => song.gig_id === firstRequest.gig_id
    );

    const { error: playlistError } = await supabase
      .from("gig_playlists")
      .insert({
        gig_id: firstRequest.gig_id,
        artist_slug: artist.artist_slug,
        song: group.song,
        artist: group.artist || "",
        position: existingForGig.length + 1
      });

    if (playlistError) {
      setMessage(`Could not add song to playlist: ${playlistError.message}`);
      return;
    }

    await updateGroup(group, "added_to_playlist");
    await loadArtistAndRequests();
  }

async function removeFromPlaylist(song: PlaylistSong) {
  const { error } = await supabase
    .from("gig_playlists")
    .delete()
    .eq("id", song.id);

  if (error) {
    setMessage(`Could not remove song from playlist: ${error.message}`);
    return;
  }

  await loadArtistAndRequests();
}

async function movePlaylistSong(song: PlaylistSong, direction: "up" | "down") {
  const songsForGig = playlistSongs
    .filter((item) => item.gig_id === song.gig_id)
    .sort((a, b) => (a.position || 0) - (b.position || 0));

  const currentIndex = songsForGig.findIndex((item) => item.id === song.id);
  const swapIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;

  if (currentIndex < 0 || swapIndex < 0 || swapIndex >= songsForGig.length) {
    return;
  }

  const currentSong = songsForGig[currentIndex];
  const swapSong = songsForGig[swapIndex];

  const currentPosition = currentSong.position || currentIndex + 1;
  const swapPosition = swapSong.position || swapIndex + 1;

  await supabase
    .from("gig_playlists")
    .update({ position: swapPosition })
    .eq("id", currentSong.id);

  await supabase
    .from("gig_playlists")
    .update({ position: currentPosition })
    .eq("id", swapSong.id);

  await loadArtistAndRequests();
}

async function addManualSongToPlaylist() {
  if (!artist?.artist_slug) return;
  if (!manualSongGigId) return;
  if (!manualSongTitle.trim()) return;

  const existingForGig = playlistSongs.filter(
    (song) => song.gig_id === manualSongGigId
  );

  const { error } = await supabase
    .from("gig_playlists")
    .insert({
      gig_id: manualSongGigId,
      artist_slug: artist.artist_slug,
      song: manualSongTitle.trim(),
      artist: manualSongArtist.trim(),
      position: existingForGig.length + 1
    });

  if (error) {
    setMessage(`Could not add song: ${error.message}`);
    return;
  }

  setManualSongGigId(null);
  setManualSongTitle("");
  setManualSongArtist("");

  await loadArtistAndRequests();
}

  function RequestGroupCard({ group }: { group: RequestGroup }) {
    const isFuture = group.requestType === "future";

    return (
      <div
        style={{
          background: isFuture ? "#241a00" : "#181818",
          padding: 20,
          borderRadius: 12,
          marginBottom: 20,
          border: isFuture ? "2px solid #ffd84d" : "2px solid #7ee787"
        }}
      >
        <div
          style={{
            display: "inline-block",
            padding: "6px 10px",
            borderRadius: 999,
            background: isFuture ? "#ffd84d" : "#7ee787",
            color: "#000",
            fontWeight: "bold",
            marginBottom: 10
          }}
        >
          {isFuture ? "🎵 Suggested for This Gig" : "🎤 Tonight's Request"}
        </div>

        <h2>
          {group.song} — {group.artist}
        </h2>

        <p>
          <strong>{group.items.length}</strong> request
          {group.items.length === 1 ? "" : "s"}
        </p>

        {group.items.map((item) => (
          <div
            key={item.id}
            style={{
              borderTop: "1px solid #444",
              paddingTop: 12,
              marginTop: 12
            }}
          >
            <p>
              <strong>Requested by:</strong> {item.requester_name || "Guest"}
            </p>

            {item.dedication && (
              <p>
                <strong>Dedication:</strong> “{item.dedication}”
              </p>
            )}

            <p>
              <strong>Time:</strong>{" "}
              {new Date(item.created_at).toLocaleTimeString([], {
                hour: "numeric",
                minute: "2-digit"
              })}
            </p>
          </div>
        ))}

        {isFuture ? (
          <button
            onClick={() => addGroupToPlaylist(group)}
            style={{
              padding: "10px 16px",
              marginRight: 10,
              borderRadius: 8,
              cursor: "pointer",
              fontWeight: "bold"
            }}
          >
            Add to Playlist
          </button>
        ) : (
          <button
            onClick={() => updateGroup(group, "played")}
            style={{
              padding: "10px 16px",
              marginRight: 10,
              borderRadius: 8,
              cursor: "pointer",
              fontWeight: "bold"
            }}
          >
            Played
          </button>
        )}

        <button
          onClick={() => updateGroup(group, isFuture ? "reviewed" : "skipped")}
          style={{
            padding: "10px 16px",
            borderRadius: 8,
            cursor: "pointer",
            fontWeight: "bold"
          }}
        >
          {isFuture ? "Mark Reviewed" : "Skip"}
        </button>
      </div>
    );
  }

  function GigPlaylist({ songs }: { songs: PlaylistSong[] }) {
    if (songs.length === 0) {
      return (
        <div
          style={{
            background: "#101010",
            border: "1px solid #333",
            borderRadius: 12,
            padding: 16,
            marginBottom: 18
          }}
        >
          <h3 style={{ marginTop: 0 }}>🎵 Playlist</h3>
          <p style={{ marginBottom: 0, opacity: 0.75 }}>
            No songs added to this playlist yet.
          </p>
        </div>
      );
    }

    return (
      <div
        style={{
          background: "#101010",
          border: "1px solid #333",
          borderRadius: 12,
          padding: 16,
          marginBottom: 18
        }}
      >
        <h3 style={{ marginTop: 0 }}>🎵 Playlist</h3>

        {songs.map((song, index) => (
  <div
    key={song.id}
    style={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      gap: 12,
      borderTop: index === 0 ? "0" : "1px solid #333",
      paddingTop: index === 0 ? 0 : 10,
      marginTop: index === 0 ? 0 : 10
    }}
  >
    <div>
  <strong>
    {index + 1}. {song.song}
  </strong>
  <br />
  <span style={{ opacity: 0.8 }}>
    {song.artist || "Unknown Artist"}
  </span>

  <div
    style={{
      display: "flex",
      gap: 6,
      marginTop: 8
    }}
  >
    <button
      onClick={() => movePlaylistSong(song, "up")}
      disabled={index === 0}
    >
      ↑
    </button>

    <button
      onClick={() => movePlaylistSong(song, "down")}
      disabled={index === songs.length - 1}
    >
      ↓
    </button>
  </div>
</div>

    <button
      onClick={() => removeFromPlaylist(song)}
      style={{
        padding: "8px 12px",
        borderRadius: 8,
        cursor: "pointer",
        fontWeight: "bold"
      }}
    >
      Remove
    </button>
  </div>
))}
      </div>
    );
  }

  function GigRequestCard({ gigGroup }: { gigGroup: GigRequestGroup }) {
    const gigTime = formatGigTime(gigGroup.gig);

    return (
      <div
        style={{
          background: "#181818",
          padding: 22,
          borderRadius: 14,
          marginBottom: 24,
          border: "1px solid #333"
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: 16,
            alignItems: "flex-start",
            flexWrap: "wrap",
            borderBottom: "1px solid #333",
            paddingBottom: 14,
            marginBottom: 18
          }}
        >
          <div>
            <h2 style={{ marginTop: 0, marginBottom: 6 }}>
              {gigGroup.gig?.venue_name || `Gig #${gigGroup.gigId}`}
            </h2>

            <p style={{ margin: 0, opacity: 0.85 }}>
              {formatGigDate(gigGroup.gig)}
              {gigTime ? ` • ${gigTime}` : ""}
            </p>
          </div>

          <button
  onClick={() => setManualSongGigId(gigGroup.gigId)}
  style={{
    padding: "10px 16px",
    borderRadius: 999,
    cursor: "pointer",
    fontWeight: "bold",
    background: "#ffd84d",
    color: "#000",
    border: 0
  }}
>
  + Add Song
</button>

        </div>

        <GigPlaylist songs={gigGroup.playlist} />

        {gigGroup.groups.length > 0 && (
          <>
            <h3>Audience Suggestions</h3>

            {gigGroup.groups.map((group) => (
              <RequestGroupCard
                key={`${gigGroup.gigId}-${group.song}-${group.artist}`}
                group={group}
              />
            ))}
          </>
        )}
      </div>
    );
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        padding: 30,
        background: "#000",
        color: "#fff",
        fontFamily: "Arial, sans-serif"
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: 16,
          alignItems: "center",
          flexWrap: "wrap"
        }}
      >
        <div>
          <h1>Live Song Requests</h1>
          <p>
            {artist?.artist_name
              ? `Dashboard for ${artist.artist_name}.`
              : "Tonight's requests and upcoming gig setlists."}
          </p>
        </div>

        <Link className="btn secondary" href="/account">
          Artist Account
        </Link>
      </div>

      {loading ? (
        <section style={{ marginTop: 30 }}>
          <div style={{ background: "#181818", padding: 20, borderRadius: 12 }}>
            <p>Loading dashboard...</p>
          </div>
        </section>
      ) : message ? (
        <section style={{ marginTop: 30 }}>
          <div style={{ background: "#181818", padding: 20, borderRadius: 12 }}>
            <p>{message}</p>
          </div>
        </section>
      ) : (
        <>
          <section style={{ marginTop: 30 }}>
            <h2>🎤 Tonight's Requests</h2>

            {tonightGroups.length === 0 ? (
              <div style={{ background: "#181818", padding: 20, borderRadius: 12 }}>
                <p>No pending tonight requests yet.</p>
              </div>
            ) : (
              tonightGroups.map((group) => (
                <RequestGroupCard
                  key={`${group.song}-${group.artist}-${group.requestType}`}
                  group={group}
                />
              ))
            )}
          </section>

          <section style={{ marginTop: 40 }}>
            <h2>🎵 Upcoming Gig Requests</h2>

            {upcomingGigGroups.length === 0 ? (
              <div style={{ background: "#181818", padding: 20, borderRadius: 12 }}>
                <p>No upcoming gig requests yet.</p>
              </div>
            ) : (
              upcomingGigGroups.map((gigGroup) => (
                <GigRequestCard key={gigGroup.gigId} gigGroup={gigGroup} />
              ))
            )}
          </section>

          {unassignedFutureGroups.length > 0 && (
            <section style={{ marginTop: 40 }}>
              <h2>⭐ Unassigned Future Suggestions</h2>

              {unassignedFutureGroups.map((group) => (
                <RequestGroupCard
                  key={`${group.song}-${group.artist}-${group.requestType}`}
                  group={group}
                />
              ))}
            </section>
          )}
        </>
      )}
      {manualSongGigId && (
  <div
    style={{
      position: "fixed",
      inset: 0,
      background: "rgba(0,0,0,0.8)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 9999
    }}
  >
    <div
      style={{
        background: "#181818",
        padding: 24,
        borderRadius: 12,
        width: 420,
        maxWidth: "90%"
      }}
    >
      <h2>Add Song To Playlist</h2>

      <input
        placeholder="Song title"
        value={manualSongTitle}
        onChange={(e) => setManualSongTitle(e.target.value)}
        style={{
          width: "100%",
          padding: 12,
          marginBottom: 12
        }}
      />

      <input
        placeholder="Artist (optional)"
        value={manualSongArtist}
        onChange={(e) => setManualSongArtist(e.target.value)}
        style={{
          width: "100%",
          padding: 12,
          marginBottom: 16
        }}
      />

      <div style={{ display: "flex", gap: 10 }}>
        <button
          onClick={addManualSongToPlaylist}
          style={{
            padding: "12px 16px",
            fontWeight: "bold"
          }}
        >
          Add Song
        </button>

        <button
          onClick={() => {
            setManualSongGigId(null);
            setManualSongTitle("");
            setManualSongArtist("");
          }}
          style={{
            padding: "12px 16px"
          }}
        >
          Cancel
        </button>
      </div>
    </div>
  </div>
)}
    </main>
  );
}