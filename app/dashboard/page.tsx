"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "../../lib/supabase";

type SongRequest = {
  id: number;
  song: string;
  artist: string;
  requester_name: string | null;
  dedication: string | null;
  status: string;
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

    if (!error) {
      setRequests(data || []);
    }
  }

  useEffect(() => {
    loadRequests();

    const channel = supabase
      .channel("song-request-updates")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "song_requests" },
        () => {
          loadRequests();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  async function updateGroup(song: string, artist: string, status: string) {
    const ids = requests
      .filter((request) => request.song === song && request.artist === artist)
      .map((request) => request.id);

    await supabase.from("song_requests").update({ status }).in("id", ids);
    loadRequests();
  }

  const grouped = useMemo(() => {
    const groups: Record<string, SongRequest[]> = {};

    requests.forEach((request) => {
      const key = `${request.song}|||${request.artist}`;

      if (!groups[key]) {
        groups[key] = [];
      }

      groups[key].push(request);
    });

    return Object.entries(groups)
      .map(([key, items]) => {
        const [song, artist] = key.split("|||");
        return { song, artist, items };
      })
      .sort((a, b) => b.items.length - a.items.length);
  }, [requests]);

  return (
    <main style={{ minHeight: "100vh", padding: 30, background: "#000", color: "#fff", fontFamily: "Arial, sans-serif" }}>
      <h1>Live Song Requests</h1>
      <p>Grouped by song. New requests appear automatically.</p>

      {grouped.length === 0 ? (
        <div style={{ background: "#181818", padding: 20, borderRadius: 12 }}>
          <p>No pending requests yet.</p>
        </div>
      ) : (
        grouped.map((group) => (
          <div
            key={`${group.song}-${group.artist}`}
            style={{
              background: "#181818",
              padding: 20,
              borderRadius: 12,
              marginBottom: 20,
              border: "1px solid #333"
            }}
          >
            <h2>{group.song} — {group.artist}</h2>

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
                  <strong>Requested by:</strong>{" "}
                  {item.requester_name || "Guest"}
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

            <button
              onClick={() => updateGroup(group.song, group.artist, "played")}
              style={{
                padding: "10px 16px",
                marginRight: 10,
                borderRadius: 8,
                cursor: "pointer"
              }}
            >
              Played
            </button>

            <button
              onClick={() => updateGroup(group.song, group.artist, "skipped")}
              style={{
                padding: "10px 16px",
                borderRadius: 8,
                cursor: "pointer"
              }}
            >
              Skip
            </button>
          </div>
        ))
      )}
    </main>
  );
}