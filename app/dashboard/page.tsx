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
};

export default function DashboardPage() {
  const [requests, setRequests] = useState<SongRequest[]>([]);
  const [gigsById, setGigsById] = useState<Record<number, Gig>>({});
  const [artist, setArtist] = useState<Artist | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

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
      setGigsById({});
      setMessage(`Could not load song requests: ${requestError.message}`);
      setLoading(false);
      return;
    }

    const loadedRequests = (requestData || []) as SongRequest[];
    setRequests(loadedRequests);

    const gigIds = Array.from(
      new Set(
        loadedRequests
          .map((request) => request.gig_id)
          .filter((gigId): gigId is number => typeof gigId === "number")
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
          event: "INSERT",
          schema: "public",
          table: "song_requests"
        },
        () => {
          loadArtistAndRequests();
        }
      )
      .subscribe();

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

    const byGig: Record<number, SongRequest[]> = {};

    futureWithGig.forEach((request) => {
      if (!request.gig_id) return;
      if (!byGig[request.gig_id]) byGig[request.gig_id] = [];
      byGig[request.gig_id].push(request);
    });

    return Object.entries(byGig)
      .map(([gigId, gigRequests]) => {
        const numericGigId = Number(gigId);

        return {
          gigId: numericGigId,
          gig: gigsById[numericGigId] || null,
          groups: groupRequests(gigRequests)
        };
      })
      .sort((a, b) => {
        const aDate = a.gig?.gig_date || "";
        const bDate = b.gig?.gig_date || "";
        return aDate.localeCompare(bDate);
      });
  }, [requests, gigsById]);

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

  const { error: playlistError } = await supabase
    .from("gig_playlists")
    .insert({
      gig_id: firstRequest.gig_id,
      artist_slug: artist.artist_slug,
      song: group.song,
      artist: group.artist || "",
      position: 0
    });

  if (playlistError) {
    setMessage(
      `Could not add song to playlist: ${playlistError.message}`
    );
    return;
  }

  await updateGroup(group, "added_to_playlist");
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
            onClick={() =>
              alert("Playlist builder is next. Requests are now grouped by gig.")
            }
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
            Build Playlist
          </button>
        </div>

        {gigGroup.groups.map((group) => (
          <RequestGroupCard
            key={`${gigGroup.gigId}-${group.song}-${group.artist}`}
            group={group}
          />
        ))}
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
    </main>
  );
}