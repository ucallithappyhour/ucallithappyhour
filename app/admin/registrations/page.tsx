"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "../../../lib/supabase";

type Registration = {
  id: number;
  artist_name: string;
  contact_name: string;
  email: string;
  phone: string | null;
  artist_type: string | null;
  notes: string | null;
  referred_by: string | null;
  referring_agent: string | null;
  setup_fee: number | null;
  status: string;
  created_at?: string | null;
};

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
};

function makeSlug(name: string) {
  return name
    .toLowerCase()
    .trim()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function makeReferralCode(name: string) {
  const base = name
    .toUpperCase()
    .trim()
    .replace(/&/g, "AND")
    .replace(/[^A-Z0-9]+/g, "")
    .slice(0, 10);

  return `${base || "ARTIST"}20`;
}

function formatDate(value?: string | null) {
  if (!value) return "-";
  return new Date(value).toLocaleDateString();
}

function getCommission(reg: Registration) {
  if (reg.referring_agent) return 25;
  if (reg.referred_by) return 20;
  return 0;
}

export default function AdminRegistrationsPage() {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [artists, setArtists] = useState<Artist[]>([]);
  const [gigs, setGigs] = useState<Gig[]>([]);
  const [message, setMessage] = useState("");

  const [editingGigId, setEditingGigId] = useState<number | null>(null);
  const [editVenueName, setEditVenueName] = useState("");
  const [editVenueAddress, setEditVenueAddress] = useState("");
  const [editGigDate, setEditGigDate] = useState("");
  const [editStartTime, setEditStartTime] = useState("");
  const [editEndTime, setEditEndTime] = useState("");
  const [editRecurringType, setEditRecurringType] = useState("One-Time");

  const totalAgentReferrals = useMemo(
    () => registrations.filter((r) => r.referring_agent).length,
    [registrations]
  );

  const totalArtistReferrals = useMemo(
    () => registrations.filter((r) => r.referred_by).length,
    [registrations]
  );

  const totalCommissions = useMemo(
    () => registrations.reduce((sum, reg) => sum + getCommission(reg), 0),
    [registrations]
  );

  async function loadRegistrations() {
    const { data, error } = await supabase
      .from("artist_registrations")
      .select("*")
      .order("id", { ascending: false });

    if (error) {
      setMessage("Could not load registrations: " + error.message);
      return;
    }

    setRegistrations(data || []);
  }

  async function loadArtists() {
    const { data, error } = await supabase
      .from("artists")
      .select("artist_slug, artist_name")
      .order("artist_name", { ascending: true });

    if (error) {
      setMessage("Could not load artists: " + error.message);
      return;
    }

    setArtists(data || []);
  }

  async function loadGigs() {
    const { data, error } = await supabase
      .from("gigs")
      .select(
        "id, artist_slug, venue_name, venue_address, gig_date, start_time, end_time, recurring_type"
      )
      .order("gig_date", { ascending: true });

    if (error) {
      setMessage("Could not load gigs: " + error.message);
      return;
    }

    setGigs(data || []);
  }

  async function createArtistPage(reg: Registration) {
    setMessage("");

    const slug = makeSlug(reg.artist_name);
    const referralCode = makeReferralCode(reg.artist_name);

    const { data: existingArtist, error: checkError } = await supabase
      .from("artists")
      .select("artist_slug")
      .eq("artist_slug", slug)
      .maybeSingle();

    if (checkError) {
      setMessage("Could not check existing artists.");
      return;
    }

    if (existingArtist) {
      setMessage("An artist with this slug already exists.");
      return;
    }

    const { error: artistError } = await supabase.from("artists").insert({
      artist_slug: slug,
      artist_name: reg.artist_name,
      genres: reg.artist_type || null,
      bio: null,
      tip_type: null,
      tip_link: null,
      logo_url: null,
      is_active: true,
      referral_code: referralCode,
      referral_count: 0,
      referral_earnings: 0
    });

    if (artistError) {
      setMessage("Could not create artist: " + artistError.message);
      return;
    }

    const { error: registrationError } = await supabase
      .from("artist_registrations")
      .update({ status: "artist_created" })
      .eq("id", reg.id);

    if (registrationError) {
      setMessage(
        "Artist was created, but registration could not be marked artist_created."
      );
      return;
    }

    setMessage(`Artist page created: /${slug}`);
    loadRegistrations();
    loadArtists();
  }

  function getArtistName(slug: string) {
    const artist = artists.find((a) => a.artist_slug === slug);
    return artist?.artist_name || slug;
  }

  function startEditGig(gig: Gig) {
    setEditingGigId(gig.id);
    setEditVenueName(gig.venue_name || "");
    setEditVenueAddress(gig.venue_address || "");
    setEditGigDate(gig.gig_date || "");
    setEditStartTime(gig.start_time || "");
    setEditEndTime(gig.end_time || "");
    setEditRecurringType(gig.recurring_type || "One-Time");
    setMessage("Editing gig.");
  }

  function cancelEditGig() {
    setEditingGigId(null);
    setEditVenueName("");
    setEditVenueAddress("");
    setEditGigDate("");
    setEditStartTime("");
    setEditEndTime("");
    setEditRecurringType("One-Time");
  }

  async function saveGig(gig: Gig) {
    const { error } = await supabase
      .from("gigs")
      .update({
        venue_name: editVenueName.trim() || null,
        venue_address: editVenueAddress.trim() || null,
        gig_date: editGigDate || null,
        start_time: editStartTime || null,
        end_time: editEndTime || null,
        recurring_type: editRecurringType
      })
      .eq("id", gig.id);

    if (error) {
      setMessage("Could not update gig: " + error.message);
      return;
    }

    setMessage("Gig updated.");
    cancelEditGig();
    loadGigs();
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
    loadGigs();
  }

  function formatGig(gig: Gig) {
    const date = gig.gig_date || "Date TBD";
    const start = gig.start_time || "";
    const end = gig.end_time || "";

    if (start && end) return `${date} • ${start} - ${end}`;
    if (start) return `${date} • ${start}`;
    return date;
  }

  useEffect(() => {
    loadRegistrations();
    loadArtists();
    loadGigs();
  }, []);

  return (
    <main className="page">
      <div className="overlay">
        <div className="container">
          <div className="hero">
            <h1 className="title">Artist Registrations</h1>

            <p className="tagline">
              Track artist signups, payment status, referrals, commissions,
              artist pages, and gigs.
            </p>

            {message && <div className="message">{message}</div>}

            <div
              className="section"
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                gap: 14
              }}
            >
              <div>
                <h3>Total Registrations</h3>
                <p style={{ fontSize: 28, fontWeight: 900 }}>
                  {registrations.length}
                </p>
              </div>

              <div>
                <h3>Agent Referrals</h3>
                <p style={{ fontSize: 28, fontWeight: 900 }}>
                  {totalAgentReferrals}
                </p>
              </div>

              <div>
                <h3>Artist Referrals</h3>
                <p style={{ fontSize: 28, fontWeight: 900 }}>
                  {totalArtistReferrals}
                </p>
              </div>

              <div>
                <h3>Commissions Owed</h3>
                <p style={{ fontSize: 28, fontWeight: 900 }}>
                  ${totalCommissions}
                </p>
              </div>
            </div>

            {registrations.length === 0 ? (
              <div className="section">No artist registrations found.</div>
            ) : (
              registrations.map((reg) => {
                const slug = makeSlug(reg.artist_name);
                const referralCode = makeReferralCode(reg.artist_name);
                const commission = getCommission(reg);

                return (
                  <div key={reg.id} className="section">
                    <h2>{reg.artist_name}</h2>

                    <p>
                      <strong>Status:</strong> {reg.status || "unknown"}
                    </p>
                    <p>
                      <strong>Created:</strong> {formatDate(reg.created_at)}
                    </p>
                    <p>
                      <strong>Contact:</strong> {reg.contact_name}
                    </p>
                    <p>
                      <strong>Email:</strong> {reg.email}
                    </p>
                    <p>
                      <strong>Phone:</strong> {reg.phone || "-"}
                    </p>
                    <p>
                      <strong>Type:</strong> {reg.artist_type || "-"}
                    </p>
                    <p>
                      <strong>Setup Fee:</strong> ${reg.setup_fee || 99}
                    </p>
                    <p>
                      <strong>Artist Referral:</strong>{" "}
                      {reg.referred_by || "None"}
                    </p>
                    <p>
                      <strong>Agent Referral:</strong>{" "}
                      {reg.referring_agent || "None"}
                    </p>
                    <p>
                      <strong>Commission Owed:</strong>{" "}
                      {commission > 0 ? `$${commission}` : "None"}
                    </p>
                    <p>
                      <strong>Referral Code To Assign:</strong> {referralCode}
                    </p>

                    {reg.notes && (
                      <p>
                        <strong>Notes:</strong> {reg.notes}
                      </p>
                    )}

                    <p>
                      <strong>Artist URL:</strong> /{slug}
                    </p>

                    {reg.status === "artist_created" ? (
                      <p style={{ fontWeight: 800 }}>
                        Artist page already created.
                      </p>
                    ) : (
                      <button className="btn" onClick={() => createArtistPage(reg)}>
                        Create Artist Page
                      </button>
                    )}
                  </div>
                );
              })
            )}

            <div className="section">
              <h2>Admin Gig Editor</h2>

              {gigs.length === 0 ? (
                <p className="empty">No gigs found.</p>
              ) : (
                gigs.map((gig) => (
                  <div key={gig.id} className="event-card">
                    <p className="performer">{gig.venue_name || "Venue TBD"}</p>
                    <p className="details">
                      <strong>Artist:</strong> {getArtistName(gig.artist_slug)}
                    </p>

                    {editingGigId === gig.id ? (
                      <>
                        <label>Venue Name</label>
                        <input
                          value={editVenueName}
                          onChange={(e) => setEditVenueName(e.target.value)}
                        />

                        <label>Venue Address</label>
                        <input
                          value={editVenueAddress}
                          onChange={(e) => setEditVenueAddress(e.target.value)}
                        />

                        <label>Date</label>
                        <input
                          type="date"
                          value={editGigDate}
                          onChange={(e) => setEditGigDate(e.target.value)}
                        />

                        <label>Start Time</label>
                        <input
                          type="time"
                          value={editStartTime}
                          onChange={(e) => setEditStartTime(e.target.value)}
                        />

                        <label>End Time</label>
                        <input
                          type="time"
                          value={editEndTime}
                          onChange={(e) => setEditEndTime(e.target.value)}
                        />

                        <label>Recurring Type</label>
                        <select
                          value={editRecurringType}
                          onChange={(e) => setEditRecurringType(e.target.value)}
                        >
                          <option>One-Time</option>
                          <option>Weekly</option>
                          <option>Monthly</option>
                        </select>

                        <button className="btn" onClick={() => saveGig(gig)}>
                          Save Changes
                        </button>

                        <button
                          className="btn secondary"
                          onClick={cancelEditGig}
                          style={{ marginLeft: 10 }}
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        <p className="details">{formatGig(gig)}</p>

                        {gig.venue_address && (
                          <p className="details">{gig.venue_address}</p>
                        )}

                        <p className="details">
                          Recurring: {gig.recurring_type || "One-Time"}
                        </p>

                        <button className="btn" onClick={() => startEditGig(gig)}>
                          Edit
                        </button>

                        <button
                          className="btn secondary"
                          onClick={() => deleteGig(gig)}
                          style={{ marginLeft: 10 }}
                        >
                          Delete
                        </button>
                      </>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}