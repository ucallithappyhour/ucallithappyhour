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

type GigOccurrence = {
  id: number;
  gig_id: number;
  occurrence_date: string;
  start_time: string | null;
  end_time: string | null;
  archive_at: string | null;
  status: string;
};

type PlaylistSong = {
  id: number;
  gig_id: number;
  occurrence_date: string | null;
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
  occurrence_date: string | null;
};

type RequestGroup = {
  song: string;
  artist: string;
  requestType: string;
  items: SongRequest[];
};

type OccurrenceGroup = {
  occurrence: GigOccurrence;
  gig: Gig | null;
  groups: RequestGroup[];
  playlist: PlaylistSong[];
};

type ManualSongTarget = {
  gigId: number;
  occurrenceDate: string;
};

function getOccurrenceKey(
  gigId: number | null | undefined,
  occurrenceDate: string | null | undefined
) {
  if (!gigId || !occurrenceDate) return "";
  return `${gigId}|||${occurrenceDate}`;
}

function getEasternDateKey(date = new Date()) {
  return date.toLocaleDateString("en-CA", {
    timeZone: "America/New_York"
  });
}

export default function DashboardPage() {
  const [requests, setRequests] = useState<SongRequest[]>([]);
  const [playlistSongs, setPlaylistSongs] = useState<PlaylistSong[]>([]);
  const [gigsById, setGigsById] = useState<Record<number, Gig>>({});
  const [occurrences, setOccurrences] = useState<GigOccurrence[]>([]);
  const [artist, setArtist] = useState<Artist | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const [manualSongTarget, setManualSongTarget] =
    useState<ManualSongTarget | null>(null);

  const [manualSongTitle, setManualSongTitle] = useState("");
  const [manualSongArtist, setManualSongArtist] = useState("");

  async function loadArtistAndRequests(showLoading = true) {
    if (showLoading) setLoading(true);

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
        setOccurrences([]);
        setGigsById({});
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
        setOccurrences([]);
        setGigsById({});
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
        setOccurrences([]);
        setGigsById({});
        setMessage("No artist profile is linked to this login.");
        setLoading(false);
        return;
      }

      artistData = data;
    }

    setArtist(artistData);

    const [
      requestResponse,
      playlistResponse,
      gigResponse
    ] = await Promise.all([
      supabase
        .from("song_requests")
        .select("*")
        .eq("artist_slug", artistData.artist_slug)
        .eq("status", "pending")
        .order("created_at", { ascending: false }),

      supabase
        .from("gig_playlists")
        .select("*")
        .eq("artist_slug", artistData.artist_slug)
        .order("position", { ascending: true })
        .order("created_at", { ascending: true }),

      supabase
        .from("gigs")
        .select("id, venue_name, gig_date, start_time, end_time")
        .eq("artist_slug", artistData.artist_slug)
    ]);

    if (requestResponse.error) {
      setMessage(
        `Could not load song requests: ${requestResponse.error.message}`
      );
      setLoading(false);
      return;
    }

    if (playlistResponse.error) {
      setMessage(
        `Could not load playlists: ${playlistResponse.error.message}`
      );
      setLoading(false);
      return;
    }

    if (gigResponse.error) {
      setMessage(`Could not load gigs: ${gigResponse.error.message}`);
      setLoading(false);
      return;
    }

    const loadedRequests =
      (requestResponse.data || []) as SongRequest[];

    const loadedPlaylistSongs =
      (playlistResponse.data || []) as PlaylistSong[];

    const loadedGigs =
      (gigResponse.data || []) as Gig[];

    const nextGigsById: Record<number, Gig> = {};

    loadedGigs.forEach((gig) => {
      nextGigsById[gig.id] = gig;
    });

    setRequests(loadedRequests);
    setPlaylistSongs(loadedPlaylistSongs);
    setGigsById(nextGigsById);

    const gigIds = loadedGigs.map((gig) => gig.id);

    if (gigIds.length === 0) {
      setOccurrences([]);
      setLoading(false);
      return;
    }

    /*
     * Only load occurrences whose archive cutoff
     * has not yet passed.
     *
     * Even if the cron job has not run during the last
     * few minutes, an expired occurrence cannot remain
     * visible on the dashboard.
     */
    const { data: occurrenceData, error: occurrenceError } =
      await supabase
        .from("gig_occurrences")
        .select(
          "id, gig_id, occurrence_date, start_time, end_time, archive_at, status"
        )
        .in("gig_id", gigIds)
        .eq("status", "active")
        .gt("archive_at", new Date().toISOString())
        .order("occurrence_date", { ascending: true })
        .order("start_time", { ascending: true })
        .limit(150);

    if (occurrenceError) {
      setOccurrences([]);
      setMessage(
        `Could not load gig occurrences: ${occurrenceError.message}`
      );
      setLoading(false);
      return;
    }

    setOccurrences(
      (occurrenceData || []) as GigOccurrence[]
    );

    setLoading(false);
  }

  useEffect(() => {
    loadArtistAndRequests(false);

    const channel = supabase
      .channel("artist-dashboard-updates")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "song_requests"
        },
        () => {
          loadArtistAndRequests(false);
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
          loadArtistAndRequests(false);
        }
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "gig_occurrences"
        },
        () => {
          loadArtistAndRequests(false);
        }
      )
      .subscribe();

    const interval = window.setInterval(() => {
      loadArtistAndRequests(false);
    }, 3000);

    return () => {
      window.clearInterval(interval);
      supabase.removeChannel(channel);
    };
  }, []);

  function groupRequests(items: SongRequest[]) {
    const groups: Record<string, SongRequest[]> = {};

    items.forEach((request) => {
      const requestType =
        request.request_type || "tonight";

      const key =
        `${request.song}|||${request.artist}|||${requestType}`;

      if (!groups[key]) {
        groups[key] = [];
      }

      groups[key].push(request);
    });

    return Object.entries(groups)
      .map(([key, groupedItems]) => {
        const [song, requestArtist, requestType] =
          key.split("|||");

        return {
          song,
          artist: requestArtist,
          requestType,
          items: groupedItems
        };
      })
      .sort(
        (a, b) =>
          b.items.length - a.items.length
      );
  }

  function formatGigDate(dateValue: string | null) {
    if (!dateValue) return "Date TBD";

    return new Date(
      `${dateValue}T12:00:00`
    ).toLocaleDateString([], {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric"
    });
  }

  function formatTime(time: string | null) {
    if (!time) return "";

    const [hours, minutes] =
      time.split(":");

    return new Date(
      2000,
      0,
      1,
      Number(hours),
      Number(minutes)
    ).toLocaleTimeString([], {
      hour: "numeric",
      minute: "2-digit"
    });
  }

  function formatOccurrenceTime(
    occurrence: GigOccurrence,
    gig: Gig | null
  ) {
    const start =
      occurrence.start_time ||
      gig?.start_time ||
      null;

    const end =
      occurrence.end_time ||
      gig?.end_time ||
      null;

    if (!start && !end) {
      return "";
    }

    if (start && !end) {
      return formatTime(start);
    }

    if (!start && end) {
      return formatTime(end);
    }

    return `${formatTime(start)} - ${formatTime(end)}`;
  }

  const todayKey = getEasternDateKey();

  /*
   * Build fast lookup maps for requests and playlists
   * using:
   *
   * gig_id + occurrence_date
   */
  const requestsByOccurrence = useMemo(() => {
    const map: Record<string, SongRequest[]> = {};

    requests.forEach((request) => {
      const key = getOccurrenceKey(
        request.gig_id,
        request.occurrence_date
      );

      if (!key) return;

      if (!map[key]) {
        map[key] = [];
      }

      map[key].push(request);
    });

    return map;
  }, [requests]);

  const playlistsByOccurrence = useMemo(() => {
    const map: Record<string, PlaylistSong[]> = {};

    playlistSongs.forEach((song) => {
      const key = getOccurrenceKey(
        song.gig_id,
        song.occurrence_date
      );

      /*
       * Old pre-occurrence playlist records have
       * occurrence_date = null.
       *
       * They remain in Supabase for history but are
       * intentionally NOT placed on an active show.
       */
      if (!key) return;

      if (!map[key]) {
        map[key] = [];
      }

      map[key].push(song);
    });

    Object.values(map).forEach((songs) => {
      songs.sort(
        (a, b) =>
          (a.position || 0) -
          (b.position || 0)
      );
    });

    return map;
  }, [playlistSongs]);

  /*
   * A still-active occurrence dated today OR earlier
   * belongs in the live section.
   *
   * This matters for a show with no end time:
   * Saturday's show can remain active until 2 AM Sunday.
   */
  const currentOccurrenceGroups =
    useMemo(() => {
      return occurrences
        .filter(
          (occurrence) =>
            occurrence.occurrence_date <= todayKey
        )
        .map((occurrence) => {
          const key = getOccurrenceKey(
            occurrence.gig_id,
            occurrence.occurrence_date
          );

          return {
            occurrence,
            gig:
              gigsById[occurrence.gig_id] ||
              null,
            groups: groupRequests(
              requestsByOccurrence[key] || []
            ),
            playlist:
              playlistsByOccurrence[key] || []
          };
        });
    }, [
      occurrences,
      gigsById,
      requestsByOccurrence,
      playlistsByOccurrence,
      todayKey
    ]);

  const upcomingOccurrenceGroups =
    useMemo(() => {
      const futureOccurrences =
        occurrences.filter(
          (occurrence) =>
            occurrence.occurrence_date > todayKey
        );

      /*
       * Always show the next 8 performances so the
       * artist can prepare a playlist.
       *
       * Any farther-out occurrence that already has
       * requests or playlist songs is also shown.
       */
      return futureOccurrences
        .filter((occurrence, index) => {
          if (index < 8) {
            return true;
          }

          const key = getOccurrenceKey(
            occurrence.gig_id,
            occurrence.occurrence_date
          );

          return Boolean(
            requestsByOccurrence[key]?.length ||
              playlistsByOccurrence[key]?.length
          );
        })
        .map((occurrence) => {
          const key = getOccurrenceKey(
            occurrence.gig_id,
            occurrence.occurrence_date
          );

          return {
            occurrence,
            gig:
              gigsById[occurrence.gig_id] ||
              null,
            groups: groupRequests(
              requestsByOccurrence[key] || []
            ),
            playlist:
              playlistsByOccurrence[key] || []
          };
        });
    }, [
      occurrences,
      gigsById,
      requestsByOccurrence,
      playlistsByOccurrence,
      todayKey
    ]);

  const unassignedFutureGroups =
    useMemo(
      () =>
        groupRequests(
          requests.filter(
            (request) =>
              request.request_type === "future" &&
              (!request.gig_id ||
                !request.occurrence_date)
          )
        ),
      [requests]
    );

  

  async function updateGroup(
    group: RequestGroup,
    status: string
  ) {
    const ids = group.items.map(
      (request) => request.id
    );

    if (ids.length === 0) return;

    setRequests((current) =>
      current.filter(
        (request) =>
          !ids.includes(request.id)
      )
    );

    const response = await fetch(
      "/api/song-request-status",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          ids,
          status
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      setMessage(
        `Could not update request: ${data.error}`
      );

      loadArtistAndRequests(false);
    }
  }

  async function addGroupToPlaylist(
    group: RequestGroup
  ) {
    if (!artist?.artist_slug) return;

    const firstRequest =
      group.items[0];

    if (
      !firstRequest?.gig_id ||
      !firstRequest.occurrence_date
    ) {
      setMessage(
        "This request is not tied to a specific gig occurrence."
      );
      return;
    }

    const existingForOccurrence =
      playlistSongs.filter(
        (song) =>
          song.gig_id ===
            firstRequest.gig_id &&
          song.occurrence_date ===
            firstRequest.occurrence_date
      );

    const { error } = await supabase
      .from("gig_playlists")
      .insert({
        gig_id: firstRequest.gig_id,
        occurrence_date:
          firstRequest.occurrence_date,
        artist_slug:
          artist.artist_slug,
        song: group.song,
        artist: group.artist || "",
        position:
          existingForOccurrence.length + 1
      });

    if (error) {
      setMessage(
        `Could not add song to playlist: ${error.message}`
      );
      return;
    }

    await updateGroup(
      group,
      "added_to_playlist"
    );

    await loadArtistAndRequests(false);
  }

  async function removeFromPlaylist(
    song: PlaylistSong
  ) {
    const { error } = await supabase
      .from("gig_playlists")
      .delete()
      .eq("id", song.id);

    if (error) {
      setMessage(
        `Could not remove song from playlist: ${error.message}`
      );
      return;
    }

    await loadArtistAndRequests(false);
  }

  async function movePlaylistSong(
    song: PlaylistSong,
    direction: "up" | "down"
  ) {
    const songsForOccurrence =
      playlistSongs
        .filter(
          (item) =>
            item.gig_id === song.gig_id &&
            item.occurrence_date ===
              song.occurrence_date
        )
        .sort(
          (a, b) =>
            (a.position || 0) -
            (b.position || 0)
        );

    const currentIndex =
      songsForOccurrence.findIndex(
        (item) =>
          item.id === song.id
      );

    const swapIndex =
      direction === "up"
        ? currentIndex - 1
        : currentIndex + 1;

    if (
      currentIndex < 0 ||
      swapIndex < 0 ||
      swapIndex >=
        songsForOccurrence.length
    ) {
      return;
    }

    const currentSong =
      songsForOccurrence[currentIndex];

    const swapSong =
      songsForOccurrence[swapIndex];

    const currentPosition =
      currentSong.position ||
      currentIndex + 1;

    const swapPosition =
      swapSong.position ||
      swapIndex + 1;

    await supabase
      .from("gig_playlists")
      .update({
        position: swapPosition
      })
      .eq("id", currentSong.id);

    await supabase
      .from("gig_playlists")
      .update({
        position: currentPosition
      })
      .eq("id", swapSong.id);

    await loadArtistAndRequests(false);
  }

  async function addManualSongToPlaylist() {
    if (!artist?.artist_slug) return;
    if (!manualSongTarget) return;
    if (!manualSongTitle.trim()) return;

    const existingForOccurrence =
      playlistSongs.filter(
        (song) =>
          song.gig_id ===
            manualSongTarget.gigId &&
          song.occurrence_date ===
            manualSongTarget.occurrenceDate
      );

    const { error } = await supabase
      .from("gig_playlists")
      .insert({
        gig_id:
          manualSongTarget.gigId,
        occurrence_date:
          manualSongTarget.occurrenceDate,
        artist_slug:
          artist.artist_slug,
        song: manualSongTitle.trim(),
        artist:
          manualSongArtist.trim(),
        position:
          existingForOccurrence.length + 1
      });

    if (error) {
      setMessage(
        `Could not add song: ${error.message}`
      );
      return;
    }

    setManualSongTarget(null);
    setManualSongTitle("");
    setManualSongArtist("");

    await loadArtistAndRequests(false);
  }

  function RequestGroupCard({
    group
  }: {
    group: RequestGroup;
  }) {
    const isFuture =
      group.requestType === "future";

    return (
      <div
        style={{
          background: isFuture
            ? "#241a00"
            : "#181818",
          padding: 20,
          borderRadius: 12,
          marginBottom: 20,
          border: isFuture
            ? "2px solid #ffd84d"
            : "2px solid #7ee787"
        }}
      >
        <div
          style={{
            display: "inline-block",
            padding: "6px 10px",
            borderRadius: 999,
            background: isFuture
              ? "#ffd84d"
              : "#7ee787",
            color: "#000",
            fontWeight: "bold",
            marginBottom: 10
          }}
        >
          {isFuture
            ? "🎵 Suggested for This Gig"
            : "🎤 Tonight's Request"}
        </div>

        <h2>
          {group.song} — {group.artist}
        </h2>

        <p>
          <strong>
            {group.items.length}
          </strong>{" "}
          request
          {group.items.length === 1
            ? ""
            : "s"}
        </p>

        {group.items.map((item) => (
          <div
            key={item.id}
            style={{
              borderTop:
                "1px solid #444",
              paddingTop: 12,
              marginTop: 12
            }}
          >
            <p>
              <strong>
                Requested by:
              </strong>{" "}
              {item.requester_name ||
                "Guest"}
            </p>

            {item.dedication && (
              <p>
                <strong>
                  Dedication:
                </strong>{" "}
                “{item.dedication}”
              </p>
            )}

            <p>
              <strong>Time:</strong>{" "}
              {new Date(
                item.created_at
              ).toLocaleTimeString([], {
                hour: "numeric",
                minute: "2-digit"
              })}
            </p>
          </div>
        ))}

        {isFuture ? (
          <button
            onClick={() =>
              addGroupToPlaylist(group)
            }
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
            onClick={() =>
              updateGroup(
                group,
                "played"
              )
            }
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
          onClick={() =>
            updateGroup(
              group,
              isFuture
                ? "reviewed"
                : "skipped"
            )
          }
          style={{
            padding: "10px 16px",
            borderRadius: 8,
            cursor: "pointer",
            fontWeight: "bold"
          }}
        >
          {isFuture
            ? "Mark Reviewed"
            : "Skip"}
        </button>
      </div>
    );
  }

  function GigPlaylist({
    songs
  }: {
    songs: PlaylistSong[];
  }) {
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
          <h3 style={{ marginTop: 0 }}>
            🎵 Playlist
          </h3>

          <p
            style={{
              marginBottom: 0,
              opacity: 0.75
            }}
          >
            No songs added to this
            playlist yet.
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
        <h3 style={{ marginTop: 0 }}>
          🎵 Playlist
        </h3>

        {songs.map(
          (song, index) => (
            <div
              key={song.id}
              style={{
                display: "flex",
                justifyContent:
                  "space-between",
                alignItems: "center",
                gap: 12,
                borderTop:
                  index === 0
                    ? "0"
                    : "1px solid #333",
                paddingTop:
                  index === 0
                    ? 0
                    : 10,
                marginTop:
                  index === 0
                    ? 0
                    : 10
              }}
            >
              <div>
                <strong>
                  {index + 1}.{" "}
                  {song.song}
                </strong>

                <br />

                <span
                  style={{
                    opacity: 0.8
                  }}
                >
                  {song.artist ||
                    "Unknown Artist"}
                </span>

                <div
                  style={{
                    display: "flex",
                    gap: 6,
                    marginTop: 8
                  }}
                >
                  <button
                    onClick={() =>
                      movePlaylistSong(
                        song,
                        "up"
                      )
                    }
                    disabled={index === 0}
                  >
                    ↑
                  </button>

                  <button
                    onClick={() =>
                      movePlaylistSong(
                        song,
                        "down"
                      )
                    }
                    disabled={
                      index ===
                      songs.length - 1
                    }
                  >
                    ↓
                  </button>
                </div>
              </div>

              <button
                onClick={() =>
                  removeFromPlaylist(
                    song
                  )
                }
                style={{
                  padding:
                    "8px 12px",
                  borderRadius: 8,
                  cursor: "pointer",
                  fontWeight: "bold"
                }}
              >
                Remove
              </button>
            </div>
          )
        )}
      </div>
    );
  }

  function GigRequestCard({
    occurrenceGroup,
    current = false
  }: {
    occurrenceGroup: OccurrenceGroup;
    current?: boolean;
  }) {
    const gigTime =
      formatOccurrenceTime(
        occurrenceGroup.occurrence,
        occurrenceGroup.gig
      );

    return (
      <div
        style={{
          background: "#181818",
          padding: 22,
          borderRadius: 14,
          marginBottom: 24,
          border: current
            ? "2px solid #7ee787"
            : "1px solid #333"
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent:
              "space-between",
            gap: 16,
            alignItems: "flex-start",
            flexWrap: "wrap",
            borderBottom:
              "1px solid #333",
            paddingBottom: 14,
            marginBottom: 18
          }}
        >
          <div>
            {current && (
              <div
                style={{
                  display:
                    "inline-block",
                  background:
                    "#7ee787",
                  color: "#000",
                  padding:
                    "5px 10px",
                  borderRadius: 999,
                  fontWeight: "bold",
                  marginBottom: 8
                }}
              >
                LIVE / CURRENT
              </div>
            )}

            <h2
              style={{
                marginTop: 0,
                marginBottom: 6
              }}
            >
              {occurrenceGroup.gig
                ?.venue_name ||
                `Gig #${occurrenceGroup.occurrence.gig_id}`}
            </h2>

            <p
              style={{
                margin: 0,
                opacity: 0.85
              }}
            >
              {formatGigDate(
                occurrenceGroup
                  .occurrence
                  .occurrence_date
              )}

              {gigTime
                ? ` • ${gigTime}`
                : ""}
            </p>
          </div>

          <button
            onClick={() =>
              setManualSongTarget({
                gigId:
                  occurrenceGroup
                    .occurrence
                    .gig_id,
                occurrenceDate:
                  occurrenceGroup
                    .occurrence
                    .occurrence_date
              })
            }
            style={{
              padding:
                "10px 16px",
              borderRadius: 999,
              cursor: "pointer",
              fontWeight: "bold",
              background:
                "#ffd84d",
              color: "#000",
              border: 0
            }}
          >
            + Add Song
          </button>
        </div>

        <GigPlaylist
          songs={
            occurrenceGroup.playlist
          }
        />

        {occurrenceGroup.groups
          .length > 0 && (
          <>
            <h3>
              Audience Requests &
              Suggestions
            </h3>

            {occurrenceGroup.groups.map(
              (group) => (
                <RequestGroupCard
                  key={`${occurrenceGroup.occurrence.id}-${group.song}-${group.artist}-${group.requestType}`}
                  group={group}
                />
              )
            )}
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
        fontFamily:
          "Arial, sans-serif"
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent:
            "space-between",
          gap: 16,
          alignItems: "center",
          flexWrap: "wrap"
        }}
      >
        <div>
          <h1>
            Live Song Requests
          </h1>

          <p>
            {artist?.artist_name
              ? `Dashboard for ${artist.artist_name}.`
              : "Tonight's requests and upcoming gig setlists."}
          </p>
        </div>

        <Link
          className="btn secondary"
          href="/account"
        >
          Artist Account
        </Link>
      </div>

      {loading ? (
        <section
          style={{ marginTop: 30 }}
        >
          <div
            style={{
              background: "#181818",
              padding: 20,
              borderRadius: 12
            }}
          >
            <p>
              Loading dashboard...
            </p>
          </div>
        </section>
      ) : message ? (
        <section
          style={{ marginTop: 30 }}
        >
          <div
            style={{
              background: "#181818",
              padding: 20,
              borderRadius: 12
            }}
          >
            <p>{message}</p>
          </div>
        </section>
      ) : (
        <>
          <section
            style={{ marginTop: 30 }}
          >
            <h2>
              🎤 Tonight&apos;s /
              Current Gig
            </h2>

            {currentOccurrenceGroups.length ===
            0 ? (
              <div
                style={{
                  background:
                    "#181818",
                  padding: 20,
                  borderRadius: 12
                }}
              >
                <p>
                  No active gig right
                  now.
                </p>
              </div>
            ) : (
              currentOccurrenceGroups.map(
                (group) => (
                  <GigRequestCard
                    key={
                      group.occurrence
                        .id
                    }
                    occurrenceGroup={
                      group
                    }
                    current
                  />
                )
              )
            )}

           
          </section>
{unassignedFutureGroups.length >
            0 && (
            <section
              style={{
                marginTop: 40
              }}
            >
              <h2>
                ⭐ Unassigned Future
                Suggestions
              </h2>

              {unassignedFutureGroups.map(
                (group) => (
                  <RequestGroupCard
                    key={`${group.song}-${group.artist}-${group.requestType}`}
                    group={group}
                  />
                )
              )}
            </section>
          )}
          <section
            style={{ marginTop: 40 }}
          >
            <h2>
              🎵 Upcoming Gigs
            </h2>

            {upcomingOccurrenceGroups.length ===
            0 ? (
              <div
                style={{
                  background:
                    "#181818",
                  padding: 20,
                  borderRadius: 12
                }}
              >
                <p>
                  No upcoming gigs
                  found.
                </p>
              </div>
            ) : (
              upcomingOccurrenceGroups.map(
                (group) => (
                  <GigRequestCard
                    key={
                      group.occurrence
                        .id
                    }
                    occurrenceGroup={
                      group
                    }
                  />
                )
              )
            )}
          </section>

          
        </>
      )}

      {manualSongTarget && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background:
              "rgba(0,0,0,0.8)",
            display: "flex",
            alignItems: "center",
            justifyContent:
              "center",
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
            <h2>
              Add Song To Playlist
            </h2>

            <input
              placeholder="Song title"
              value={manualSongTitle}
              onChange={(e) =>
                setManualSongTitle(
                  e.target.value
                )
              }
              style={{
                width: "100%",
                padding: 12,
                marginBottom: 12
              }}
            />

            <input
              placeholder="Artist (optional)"
              value={
                manualSongArtist
              }
              onChange={(e) =>
                setManualSongArtist(
                  e.target.value
                )
              }
              style={{
                width: "100%",
                padding: 12,
                marginBottom: 16
              }}
            />

            <div
              style={{
                display: "flex",
                gap: 10
              }}
            >
              <button
                onClick={
                  addManualSongToPlaylist
                }
                style={{
                  padding:
                    "12px 16px",
                  fontWeight:
                    "bold"
                }}
              >
                Add Song
              </button>

              <button
                onClick={() => {
                  setManualSongTarget(
                    null
                  );
                  setManualSongTitle(
                    ""
                  );
                  setManualSongArtist(
                    ""
                  );
                }}
                style={{
                  padding:
                    "12px 16px"
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