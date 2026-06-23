"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabase";

type Artist = {
  artist_slug: string;
  artist_name: string | null;
};

type Gig = {
  id: number;
  artist_slug: string;
  venue_name: string | null;
  venue_address: string | null;
  gig_date: string | null;
  start_time: string | null;
  end_time: string | null;
  recurring_type: string | null;
  allow_requests: boolean | null;
};

export default function GigsPage() {
  const [artist, setArtist] = useState<Artist | null>(null);
  const [setupToken, setSetupToken] = useState("");
  const [gigs, setGigs] = useState<Gig[]>([]);
  const [editingGigId, setEditingGigId] = useState<number | null>(null);

  const [venueName, setVenueName] = useState("");
  const [venueAddress, setVenueAddress] = useState("");
  const [gigDate, setGigDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [recurringType, setRecurringType] = useState("One-Time");
  const [allowRequests, setAllowRequests] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token") || "";
    setSetupToken(token);

    if (!token) {
      setMessage("Missing setup token.");
      return;
    }

    loadArtist(token);
  }, []);

  async function loadArtist(token: string) {
    const { data, error } = await supabase
      .from("artists")
      .select("artist_slug, artist_name")
      .eq("setup_token", token)
      .maybeSingle();

    if (error || !data) {
      setMessage("Could not find your artist setup.");
      return;
    }

    setArtist(data);
    loadGigs(data.artist_slug);
  }

  async function loadGigs(slug: string) {
    const { data, error } = await supabase
      .from("gigs")
      .select(
        "id, artist_slug, venue_name, venue_address, gig_date, start_time, end_time, recurring_type, allow_requests"
      )
      .eq("artist_slug", slug)
      .order("gig_date", { ascending: true });

    if (error) {
      setMessage("Could not load gigs: " + error.message);
      return;
    }

    setGigs(data || []);
  }

  function resetForm() {
    setEditingGigId(null);
    setVenueName("");
    setVenueAddress("");
    setGigDate("");
    setStartTime("");
    setEndTime("");
    setRecurringType("One-Time");
    setAllowRequests(true);
  }

  function editGig(gig: Gig) {
    setEditingGigId(gig.id);
    setVenueName(gig.venue_name || "");
    setVenueAddress(gig.venue_address || "");
    setGigDate(gig.gig_date || "");
    setStartTime(gig.start_time || "");
    setEndTime(gig.end_time || "");
    setRecurringType(gig.recurring_type || "One-Time");
    setAllowRequests(gig.allow_requests !== false);
    setMessage("Editing gig. Make changes, then save.");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function saveGig() {
    if (!artist) return;

    if (!venueName.trim()) {
      setMessage("Venue name is required.");
      return;
    }

    if (editingGigId) {
      const { error } = await supabase
        .from("gigs")
        .update({
          venue_name: venueName.trim(),
          venue_address: venueAddress.trim() || null,
          gig_date: gigDate || null,
          start_time: startTime || null,
          end_time: endTime || null,
          recurring_type: recurringType,
          allow_requests: allowRequests
        })
        .eq("id", editingGigId)
        .eq("artist_slug", artist.artist_slug);

      if (error) {
        setMessage("Could not update gig: " + error.message);
        return;
      }

      setMessage("Gig updated.");
    } else {
      const { error } = await supabase.from("gigs").insert({
        artist_slug: artist.artist_slug,
        venue_name: venueName.trim(),
        venue_address: venueAddress.trim() || null,
        gig_date: gigDate || null,
        start_time: startTime || null,
        end_time: endTime || null,
        recurring_type: recurringType,
        allow_requests: allowRequests
      });

      if (error) {
        setMessage("Could not add gig: " + error.message);
        return;
      }

      setMessage("Gig added.");
    }

    resetForm();
    loadGigs(artist.artist_slug);
  }

  async function deleteGig(gig: Gig) {
    const confirmDelete = window.confirm(
      `Delete gig at ${gig.venue_name || "this venue"}?`
    );

    if (!confirmDelete) return;

    const { error } = await supabase.from("gigs").delete().eq("id", gig.id);

    if (error) {
      setMessage("Could not delete gig: " + error.message);
      return;
    }

    setMessage("Gig deleted.");

    if (artist) {
      loadGigs(artist.artist_slug);
    }
  }

  function formatGig(gig: Gig) {
    const date = gig.gig_date || "Date TBD";
    const start = gig.start_time || "";
    const end = gig.end_time || "";

    if (start && end) return `${date} • ${start} - ${end}`;
    if (start) return `${date} • ${start}`;
    return date;
  }

  return (
    <main className="page">
      <div className="overlay">
        <div className="container">
          <div className="hero">
            <div className="brand">U CALL IT HAPPY HOUR</div>

            <h1 className="title">Upcoming Gigs</h1>

            <p className="tagline">
              Add your upcoming shows so fans know where to find you.
            </p>

            {message && <div className="message">{message}</div>}

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
                {artist?.artist_name || artist?.artist_slug || "Loading..."}
              </div>
            </div>

            <div className="section">
              <h2>{editingGigId ? "Edit Upcoming Show" : "Add Upcoming Show"}</h2>

              <label>Venue Name</label>
              <input
                value={venueName}
                onChange={(e) => setVenueName(e.target.value)}
                placeholder="Venue name"
              />

              <label>Venue Address</label>
              <input
                value={venueAddress}
                onChange={(e) => setVenueAddress(e.target.value)}
                placeholder="Venue address"
              />

              <label>Date</label>
              <input
                type="date"
                value={gigDate}
                onChange={(e) => setGigDate(e.target.value)}
              />

              <label>Start Time</label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
              />

              <label>End Time</label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
              />

              <label>Recurring Type</label>
              <select
                value={recurringType}
                onChange={(e) => setRecurringType(e.target.value)}
              >
                <option>One-Time</option>
                <option>Weekly</option>
                <option>Monthly</option>
              </select>

              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  marginTop: 14,
                  marginBottom: 18,
                  fontWeight: 800
                }}
              >
                <input
                  type="checkbox"
                  checked={allowRequests}
                  onChange={(e) => setAllowRequests(e.target.checked)}
                  style={{ width: 18, height: 18 }}
                />
                Allow song requests for this gig
              </label>

              <p
                className="details"
                style={{
                  marginTop: -8,
                  marginBottom: 18,
                  opacity: 0.8
                }}
              >
                Turn this off for ticketed shows, fixed setlists, tribute nights,
                or performances where requests are not a good fit.
              </p>

              <button className="btn" type="button" onClick={saveGig}>
                {editingGigId ? "Save Changes" : "Save Gig"}
              </button>

              {editingGigId && (
                <button
                  className="btn secondary"
                  type="button"
                  onClick={resetForm}
                  style={{ marginLeft: 10 }}
                >
                  Cancel Edit
                </button>
              )}
            </div>

            <div className="section">
              <h2>Current Gigs</h2>

              {gigs.length === 0 ? (
                <p className="empty">No gigs added yet.</p>
              ) : (
                gigs.map((gig) => (
                  <div key={gig.id} className="event-card">
                    <p className="performer">{gig.venue_name || "Venue TBD"}</p>

                    <p className="details">{formatGig(gig)}</p>

                    {gig.venue_address && (
                      <p className="details">{gig.venue_address}</p>
                    )}

                    <p className="details">
                      Recurring: {gig.recurring_type || "One-Time"}
                    </p>

                    <p
                      className="details"
                      style={{
                        color: gig.allow_requests === false ? "#ff8a8a" : "#8affb2",
                        fontWeight: 800
                      }}
                    >
                      Requests:{" "}
                      {gig.allow_requests === false ? "Off for this gig" : "On"}
                    </p>

                    <button
                      className="btn"
                      type="button"
                      onClick={() => editGig(gig)}
                    >
                      Edit
                    </button>

                    <button
                      className="btn secondary"
                      type="button"
                      onClick={() => deleteGig(gig)}
                      style={{ marginLeft: 10 }}
                    >
                      Delete
                    </button>
                  </div>
                ))
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
          </div>
        </div>
      </div>
    </main>
  );
}