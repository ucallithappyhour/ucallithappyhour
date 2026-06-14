"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "../../lib/supabase";

type SongRequest = {
  id: number;
  song: string;
  artist: string;
  requester_name: string | null;
  dedication: string | null;
  status: string;
  request_type: "tonight" | "future" | null;
  created_at: string;
};

export default function DashboardPage() {
  const [requests, setRequests] = useState<SongRequest[]>([]);

  async function loadRequests() {
    const { data, error } = await supabase
      .from("song_requests")
      .select("*")
      .eq("status", "pending")
      .order("created_at", { ascending: false });

    if (!error) setRequests(data || []);
  }

  useEffect(() => {
    loadRequests();

    const channel = supabase
      .channel("song-request-updates")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "song_requests" },
        () => loadRequests()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  async function updateGroup(song: string, artist: string, requestType: string, status: string) {
    const ids = requests
      .filter(
        (request) =>
          request.song === song &&
          request.artist === artist &&
          (request.request_type || "tonight") === requestType
      )
      .map((request) => request.id);

    await supabase.from("song_requests").update({ status }).in("id", ids);
    loadRequests();
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
        const [song, artist, requestType] = key.split("|||");
        return { song, artist, requestType, items: groupedItems };
      })
      .sort((a, b) => b.items.length - a.items.length);
  }

  const tonightGroups = useMemo(
    () => groupRequests(requests.filter((request) => (request.request_type || "tonight") === "tonight")),
    [requests]
  );

  const futureGroups = useMemo(
    () => groupRequests(requests.filter((request) => request.request_type === "future")),
    [requests]
  );

  function RequestGroupCard({ group }: { group: { song: string; artist: string; requestType: string; items: SongRequest[] } }) {
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
          {isFuture ? "⭐ Future Song Suggestion" : "🎤 Tonight's Playlist Request"}
        </div>

        <h2>{group.song} — {group.artist}</h2>

        <p>
          <strong>{group.items.length}</strong> request
          {group.items.length === 1 ? "" : "s"}
        </p>

        {group.items.map((item) => (
          <div key={item.id} style={{ borderTop: "1px solid #444", paddingTop: 12, marginTop: 12 }}>
            <p><strong>Requested by:</strong> {item.requester_name || "Guest"}</p>

            {item.dedication && (
              <p><strong>Dedication:</strong> “{item.dedication}”</p>
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

        <button
          onClick={() => updateGroup(group.song, group.artist, group.requestType, isFuture ? "reviewed" : "played")}
          style={{ padding: "10px 16px", marginRight: 10, borderRadius: 8, cursor: "pointer" }}
        >
          {isFuture ? "Mark Reviewed" : "Played"}
        </button>

        <button
          onClick={() => updateGroup(group.song, group.artist, group.requestType, "skipped")}
          style={{ padding: "10px 16px", borderRadius: 8, cursor: "pointer" }}
        >
          Skip
        </button>
      </div>
    );
  }

  return (
    <main style={{ minHeight: "100vh", padding: 30, background: "#000", color: "#fff", fontFamily: "Arial, sans-serif" }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 16, alignItems: "center", flexWrap: "wrap" }}>
        <div>
          <h1>Live Song Requests</h1>
          <p>Tonight's requests are separated from future song suggestions.</p>
        </div>

        <Link className="btn secondary" href="/account">
          Artist Account
        </Link>
      </div>

      <section style={{ marginTop: 30 }}>
        <h2>🎤 Tonight's Requests</h2>

        {tonightGroups.length === 0 ? (
          <div style={{ background: "#181818", padding: 20, borderRadius: 12 }}>
            <p>No pending tonight requests yet.</p>
          </div>
        ) : (
          tonightGroups.map((group) => (
            <RequestGroupCard key={`${group.song}-${group.artist}-${group.requestType}`} group={group} />
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
            <RequestGroupCard key={`${group.song}-${group.artist}-${group.requestType}`} group={group} />
          ))
        )}
      </section>
    </main>
  );
}