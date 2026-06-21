"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "../../lib/supabase";

type Artist = {
  artist_slug: string;
  artist_name: string | null;
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
};

export default function DashboardPage() {
  const [requests, setRequests] = useState<SongRequest[]>([]);
  const [artist, setArtist] = useState<Artist | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  async function loadArtistAndRequests() {
    setLoading(true);
    setMessage("");

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

    const { data: artistData, error: artistError } = await supabase
      .from("artists")
      .select("artist_slug, artist_name")
      .eq("owner_email", user.email)
      .maybeSingle();

    if (artistError) {
      setArtist(null);
      setRequests([]);
      setMessage(`Could not load artist profile: ${artistError.message}`);
      setLoading(false);
      return;
    }

    if (!artistData) {
      setArtist(null);
      setRequests([]);
      setMessage("No artist profile is linked to this login.");
      setLoading(false);
      return;
    }

    setArtist(artistData);

    const { data, error } = await supabase
      .from("song_requests")
      .select("*")
      .eq("artist_slug", artistData.artist_slug)
      .eq("status", "pending")
      .order("created_at", { ascending: false });

    if (error) {
      setRequests([]);
      setMessage(`Could not load song requests: ${error.message}`);
    } else {
      setRequests(data || []);
    }

    setLoading(false);
  }

  async function loadRequestsOnly(currentArtistSlug: string) {
    const { data, error } = await supabase
      .from("song_requests")
      .select("*")
      .eq("artist_slug", currentArtistSlug)
      .eq("status", "pending")
      .order("created_at", { ascending: false });

    if (error) {
      setMessage(`Could not refresh requests: ${error.message}`);
      return;
    }

    setRequests(data || []);
  }

  useEffect(() => {
    loadArtistAndRequests();

    const channel = supabase
      .channel("song-request-updates")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "song_requests" },
        () => {
          loadArtistAndRequests();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  async function updateGroup(
    song: string,
    requestArtist: string,
    requestType: string,
    status: string
  ) {
    if (!artist?.artist_slug) return;

    const ids = requests
      .filter(
        (request) =>
          request.song === song &&
          request.artist === requestArtist &&
          (request.request_type || "tonight") === requestType &&
          request.artist_slug === artist.artist_slug
      )
      .map((request) => request.id);

    if (ids.length === 0) return;

    const { error } = await supabase
      .from("song_requests")
      .update({ status })
      .in("id", ids);

    if (error) {
      setMessage(`Could not update request: ${error.message}`);
      return;
    }

    setRequests((current) => current.filter((request) => !ids.includes(request.id)));

    if (artist.artist_slug) {
      loadRequestsOnly(artist.artist_slug);
    }
  }

  async function addGroupToLibrary(group: {
    song: string;
    artist: string;
    requestType: string;
    items: SongRequest[];
  }) {
    if (!artist?.artist_slug) return;

    const { error: songError } = await supabase.from("songs").insert({
      title: group.song,
      artist: group.artist || "",
      artist_slug: artist.artist_slug,
      is_active: true
    });

    if (songError) {
      setMessage(`Could not add song to library: ${songError.message}`);
      return;
    }

    await updateGroup(group.song, group.artist, group.requestType, "added_to_library");
  }

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
        return { song, artist: requestArtist, requestType, items: groupedItems };
      })
      .sort((a, b) => b.items.length - a.items.length);
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

  const futureGroups = useMemo(
    () =>
      groupRequests(
        requests.filter((request) => request.request_type === "future")
      ),
    [requests]
  );

  function RequestGroupCard({
    group
  }: {
    group: {
      song: string;
      artist: string;
      requestType: string;
      items: SongRequest[];
    };
  }) {
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
          {isFuture
            ? "⭐ Future Song Suggestion"
            : "🎤 Tonight's Playlist Request"}
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
            style={{ borderTop: "1px solid #444", paddingTop: 12, marginTop: 12 }}
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
            onClick={() => addGroupToLibrary(group)}
            style={{
              padding: "10px 16px",
              marginRight: 10,
              borderRadius: 8,
              cursor: "pointer",
              fontWeight: "bold"
            }}
          >
            Add to Library
          </button>
        ) : (
          <button
            onClick={() =>
              updateGroup(group.song, group.artist, group.requestType, "played")
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
            updateGroup(group.song, group.artist, group.requestType, "skipped")
          }
          style={{
            padding: "10px 16px",
            borderRadius: 8,
            cursor: "pointer"
          }}
        >
          Skip
        </button>
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
              : "Tonight's requests are separated from future song suggestions."}
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
            <h2>⭐ Future Song Suggestions</h2>

            {futureGroups.length === 0 ? (
              <div style={{ background: "#181818", padding: 20, borderRadius: 12 }}>
                <p>No future suggestions yet.</p>
              </div>
            ) : (
              futureGroups.map((group) => (
                <RequestGroupCard
                  key={`${group.song}-${group.artist}-${group.requestType}`}
                  group={group}
                />
              ))
            )}
          </section>
        </>
      )}
    </main>
  );
}