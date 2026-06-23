"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

const ADMIN_EMAIL = "u.call.it.happy.hour@gmail.com";

type ArtistOption = {
  artist_slug: string;
  artist_name: string;
};

type ArtistProfile = {
  artist_name: string;
  bio: string;
  genres: string;
  tip_type: string;
  tip_link: string;
  tip_button_text: string;
  tip_thank_you: string;
  facebook: string;
  instagram: string;
  youtube: string;
  website: string;
  referral_code: string;
  referral_count: number;
  referral_earnings: number;
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
  special_note: string | null;
  allow_requests: boolean | null;
};

type NewGig = {
  venue_name: string;
  venue_address: string;
  gig_date: string;
  start_time: string;
  end_time: string;
  recurring_type: string;
  special_note: string;
  allow_requests: boolean;

};

type NewArtist = {
  artist_name: string;
  artist_slug: string;
  owner_email: string;
};

const emptyProfile: ArtistProfile = {
  artist_name: "",
  bio: "",
  genres: "",
  tip_type: "",
  tip_link: "",
  tip_button_text: "",
  tip_thank_you: "",
  facebook: "",
  instagram: "",
  youtube: "",
  website: "",
  referral_code: "",
  referral_count: 0,
  referral_earnings: 0
};

const emptyGig: NewGig = {
  venue_name: "",
  venue_address: "",
  gig_date: "",
  start_time: "",
  end_time: "",
  recurring_type: "One-Time",
  special_note: "",
  allow_requests: true
};

const emptyArtist: NewArtist = {
  artist_name: "",
  artist_slug: "",
  owner_email: ""
};

export default function AccountPage() {
  const [authMode, setAuthMode] = useState<"login" | "create">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [user, setUser] = useState<any>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);

  const [artistOptions, setArtistOptions] = useState<ArtistOption[]>([]);
  const [selectedArtist, setSelectedArtist] = useState("");
  const [profile, setProfile] = useState<ArtistProfile>(emptyProfile);
  const [gigs, setGigs] = useState<Gig[]>([]);
  const [newGig, setNewGig] = useState<NewGig>(emptyGig);
  const [editingGigId, setEditingGigId] = useState<number | null>(null);
  const [newArtist, setNewArtist] = useState<NewArtist>(emptyArtist);
  const [message, setMessage] = useState("");

  const isAdmin = user?.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase();

  function makeSlug(name: string) {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }

  function updateField(field: keyof ArtistProfile, value: string) {
    setProfile((current) => ({
      ...current,
      [field]: value
    }));
  }

  function updateGigField(field: keyof NewGig, value: string) {
    setNewGig((current) => ({
      ...current,
      [field]: value
    }));
  }

  function updateNewArtistField(field: keyof NewArtist, value: string) {
    setNewArtist((current) => ({
      ...current,
      [field]: value
    }));
  }

  async function handleAuth() {
    setMessage("");

    if (!email || !password) {
      setMessage("Please enter your email and password.");
      return;
    }

    if (authMode === "create") {
      const { error } = await supabase.auth.signUp({
        email,
        password
      });

      if (error) {
        setMessage(error.message);
        return;
      }

      setMessage("Account created. You can log in now.");
      return;
    }

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      setMessage(error.message);
      return;
    }

    window.location.reload();
  }

  async function handleForgotPassword() {
    setMessage("");

    if (!email) {
      setMessage("Enter your email address first, then click Forgot Password.");
      return;
    }

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/account`
    });

    if (error) {
      setMessage(error.message);
      return;
    }

    setMessage("Password reset email sent. Check your inbox.");
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    window.location.reload();
  }

  async function loadArtists() {
    if (!user?.email) return;

    if (isAdmin) {
      const { data, error } = await supabase
        .from("artists")
        .select("artist_slug, artist_name")
        .order("artist_name", { ascending: true });

      if (error) {
        setMessage("Could not load artist list yet.");
        return;
      }

      setArtistOptions(data || []);

      if (data && data.length > 0 && !selectedArtist) {
        setSelectedArtist(data[0].artist_slug);
      }

      return;
    }

    const { data, error } = await supabase
      .from("artists")
      .select("artist_slug, artist_name")
      .eq("owner_email", user.email)
      .maybeSingle();

    if (error) {
      setMessage("Could not load your artist account.");
      return;
    }

    if (!data) {
      setSelectedArtist("");
      setProfile(emptyProfile);
      setGigs([]);
      setMessage("No artist profile has been assigned to this email address yet.");
      return;
    }

    setArtistOptions([data]);
    setSelectedArtist(data.artist_slug);
  }

  async function loadProfile() {
    if (!selectedArtist) return;

    setMessage("");

    const { data, error } = await supabase
      .from("artists")
      .select("*")
      .eq("artist_slug", selectedArtist)
      .maybeSingle();

    if (error) {
      setMessage("Could not load artist profile yet.");
      return;
    }

    if (!data) {
      setProfile(emptyProfile);
      return;
    }

    setProfile({
      artist_name: data.artist_name || "",
      bio: data.bio || "",
      genres: data.genres || "",
      tip_type: data.tip_type || "",
      tip_link: data.tip_link || "",
      tip_button_text: data.tip_button_text || "",
      tip_thank_you: data.tip_thank_you || "",
      facebook: data.facebook || "",
      instagram: data.instagram || "",
      youtube: data.youtube || "",
      website: data.website || "",
      referral_code: data.referral_code || "",
      referral_count: data.referral_count || 0,
      referral_earnings: Number(data.referral_earnings || 0)
    });
  }

  async function loadGigs() {
    if (!selectedArtist) return;

    const { data, error } = await supabase
      .from("gigs")
      .select("*")
      .eq("artist_slug", selectedArtist)
      .order("gig_date", { ascending: true });

    if (error) {
      setMessage("Could not load gigs yet.");
      return;
    }

    setGigs(data || []);
  }

  async function saveProfile() {
    if (!selectedArtist) return;

    setMessage("Saving...");

    const { error } = await supabase.from("artists").upsert(
      {
        artist_slug: selectedArtist,
        ...profile,
        updated_at: new Date().toISOString()
      },
      { onConflict: "artist_slug" }
    );

    if (error) {
      setMessage("Save failed. Check Supabase table permissions.");
      return;
    }

    setMessage("Saved successfully.");
    loadArtists();
  }

  async function addGig() {
    if (!selectedArtist) return;

    if (!newGig.venue_name.trim()) {
      setMessage("Add a venue name before saving the gig.");
      return;
    }

    setMessage("Saving gig...");

    const { error } = await supabase.from("gigs").insert({
      artist_slug: selectedArtist,
      venue_name: newGig.venue_name,
      venue_address: newGig.venue_address,
      gig_date: newGig.gig_date || null,
      start_time: newGig.start_time,
      end_time: newGig.end_time,
      recurring_type: newGig.recurring_type,
      special_note: newGig.special_note || null,
      allow_requests: newGig.allow_requests
    });

    if (error) {
      setMessage("Could not save gig. Check Supabase table permissions.");
      return;
    }

    setNewGig(emptyGig);
    setMessage("Gig saved successfully.");
    loadGigs();
  }

      function startEditGig(gig: Gig) {
    setEditingGigId(gig.id);

    setNewGig({
      venue_name: gig.venue_name || "",
      venue_address: gig.venue_address || "",
      gig_date: gig.gig_date || "",
      start_time: gig.start_time || "",
      end_time: gig.end_time || "",
      recurring_type: gig.recurring_type || "One-Time",
        special_note: gig.special_note || ""
    });

    setMessage("Editing gig. Make changes below, then save.");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function cancelEditGig() {
    setEditingGigId(null);
    setNewGig(emptyGig);
    setMessage("");
  }

  async function saveGig() {
    if (editingGigId) {
      if (!newGig.venue_name.trim()) {
        setMessage("Venue name is required.");
        return;
      }

      setMessage("Updating gig...");

      const { error } = await supabase
        .from("gigs")
        .update({
          venue_name: newGig.venue_name,
          venue_address: newGig.venue_address,
          gig_date: newGig.gig_date || null,
          start_time: newGig.start_time,
          end_time: newGig.end_time,
          recurring_type: newGig.recurring_type,
          special_note: newGig.special_note || null,
          allow_requests: newGig.allow_requests
        })
        .eq("id", editingGigId);

      if (error) {
        setMessage("Could not update gig.");
        return;
      }

      setEditingGigId(null);
      setNewGig(emptyGig);
      setMessage("Gig updated.");
      loadGigs();
      return;
    }

    addGig();
  }

  async function deleteGig(id: number) {
    setMessage("Deleting gig...");

    const { error } = await supabase.from("gigs").delete().eq("id", id);

    if (error) {
      setMessage("Could not delete gig.");
      return;
    }

    if (editingGigId === id) {
      cancelEditGig();
    }

    setMessage("Gig deleted.");
    loadGigs();
  }

  async function addArtist() {
    if (!isAdmin) return;

    const artistName = newArtist.artist_name.trim();
    const artistSlug = newArtist.artist_slug.trim() || makeSlug(artistName);
    const ownerEmail = newArtist.owner_email.trim();

    if (!artistName || !artistSlug || !ownerEmail) {
      setMessage("Artist name, slug, and owner email are required.");
      return;
    }

    setMessage("Creating artist...");

    const { error } = await supabase.from("artists").upsert(
      {
        artist_slug: artistSlug,
        artist_name: artistName,
        owner_email: ownerEmail,
        bio: "",
        genres: "",
        tip_type: "",
        tip_link: "",
        tip_button_text: "Tip Me",
        tip_thank_you: "Thanks for supporting live music!",
        facebook: "",
        instagram: "",
        youtube: "",
        website: "",
        updated_at: new Date().toISOString()
      },
      { onConflict: "artist_slug" }
    );

    if (error) {
      setMessage("Could not create artist. Check Supabase permissions.");
      return;
    }

    setNewArtist(emptyArtist);
    setSelectedArtist(artistSlug);
    setMessage("Artist created successfully.");
    loadArtists();
  }

  function formatGigDate(dateValue: string | null) {
    if (!dateValue) return "Date TBD";

    const date = new Date(`${dateValue}T12:00:00`);

    return date.toLocaleDateString([], {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric"
    });
  }

  function formatTime(time: string | null) {
    if (!time) return "";

    const [hours, minutes] = time.split(":");
    const hour = Number(hours);

    return new Date(2000, 0, 1, hour, Number(minutes)).toLocaleTimeString([], {
      hour: "numeric",
      minute: "2-digit"
    });
  }

  function formatGigTime(start: string | null, end: string | null) {
    if (!start && !end) return "Time TBD";
    if (start && !end) return formatTime(start);
    if (!start && end) return formatTime(end);

    return `${formatTime(start)} - ${formatTime(end)}`;
  }

  useEffect(() => {
    async function checkUser() {
      const { data } = await supabase.auth.getUser();
      setUser(data.user);
      setCheckingAuth(false);
    }

    checkUser();

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user || null);
      }
    );

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (user?.email) {
      loadArtists();
    }
  }, [user]);

  useEffect(() => {
    if (selectedArtist) {
      loadProfile();
      loadGigs();
      setNewGig(emptyGig);
      setEditingGigId(null);
    }
  }, [selectedArtist]);

  if (checkingAuth) {
    return (
      <main className="page">
        <div className="overlay">
          <div className="container">
            <div className="hero">
              <h1 className="title">Loading...</h1>
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="page">
        <div className="overlay">
          <div className="container">
            <div className="hero">
              <div className="brand">U Call It Happy Hour</div>

              <h1 className="title">
                {authMode === "login"
                  ? "Artist Login"
                  : "Create Artist Account"}
              </h1>

              <p className="tagline">
                Manage your gigs, update your profile, track requests, and grow your audience.
              </p>

              {message && <div className="message">{message}</div>}

              <section
                className="accountCard"
                style={{ maxWidth: 460, margin: "0 auto" }}
              >
                <label>Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email address"
                />

                <label>Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                />

                <button className="btn" type="button" onClick={handleAuth}>
                  {authMode === "login" ? "Log In" : "Create Account"}
                </button>

                {authMode === "login" && (
                  <button
                    className="smallbtn"
                    type="button"
                    style={{
                      marginTop: 14,
                      background: "transparent",
                      color: "#fff",
                      textDecoration: "underline"
                    }}
                    onClick={handleForgotPassword}
                  >
                    Forgot Password?
                  </button>
                )}

                <button
                  className="smallbtn"
                  type="button"
                  style={{
                    marginTop: 16,
                    background: "transparent",
                    color: "#fff",
                    textDecoration: "underline"
                  }}
                  onClick={() => {
                    setAuthMode(authMode === "login" ? "create" : "login");
                    setMessage("");
                  }}
                >
                  {authMode === "login"
                    ? "Need an account? Create one"
                    : "Already have an account? Log in"}
                </button>
              </section>
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (!selectedArtist && !isAdmin) {
    return (
      <main className="page">
        <div className="overlay">
          <div className="container">
            <div className="hero">
              <div className="brand">U Call It Happy Hour</div>

              <h1 className="title">No Artist Assigned</h1>

              <p className="tagline">
                This email address has not been linked to an artist profile yet.
              </p>

              {message && <div className="message">{message}</div>}

              <div className="actions">
                <button className="btn secondary" type="button" onClick={handleLogout}>
                  Log Out
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="page">
      <div className="overlay">
        <div className="container">
          <div className="hero">
            <div className="brand">U Call It Happy Hour</div>

            <h1 className="title">
              {isAdmin ? "Admin Artist Management" : "Set Up Your Artist Profile"}
            </h1>

            <p className="tagline">
              {isAdmin
                ? "Manage artists, profiles, gigs, tip links, and social links."
                : "Manage your profile, gigs, tip link, and social links."}
            </p>

            <div className="actions">
              <Link className="btn secondary" href="/dashboard">
                Back to Dashboard
              </Link>

              <button className="btn secondary" type="button" onClick={handleLogout}>
                Log Out
              </button>
            </div>

            {isAdmin && (
              <section className="accountCard" style={{ marginBottom: 20 }}>
                <h2>Admin: Select Artist</h2>

                <label>Select Artist</label>
                <select
                  value={selectedArtist}
                  onChange={(e) => setSelectedArtist(e.target.value)}
                >
                  {artistOptions.map((artist) => (
                    <option key={artist.artist_slug} value={artist.artist_slug}>
                      {artist.artist_name}
                    </option>
                  ))}
                </select>
              </section>
            )}

            {!isAdmin && (
              <section className="accountCard" style={{ marginBottom: 20 }}>
                <h2>Editing Artist: {profile.artist_name || "Loading..."}</h2>

                <p className="empty">
                  This account is linked to your artist profile.
                </p>
              </section>
            )}

            {isAdmin && (
              <section className="accountCard" style={{ marginBottom: 20 }}>
                <h2>Admin: Add Artist Without Fee</h2>

                <label>Artist Name</label>
                <input
                  value={newArtist.artist_name}
                  onChange={(e) => {
                    const value = e.target.value;
                    setNewArtist((current) => ({
                      ...current,
                      artist_name: value,
                      artist_slug: current.artist_slug || makeSlug(value)
                    }));
                  }}
                  placeholder="Artist name"
                />

                <label>Artist Slug</label>
                <input
                  value={newArtist.artist_slug}
                  onChange={(e) =>
                    updateNewArtistField("artist_slug", e.target.value)
                  }
                  placeholder="artist-name"
                />

                <label>Owner Email</label>
                <input
                  value={newArtist.owner_email}
                  onChange={(e) =>
                    updateNewArtistField("owner_email", e.target.value)
                  }
                  placeholder="artist@email.com"
                />

                <button className="btn" type="button" onClick={addArtist}>
                  Create Artist
                </button>
              </section>
            )}

            {message && <div className="message">{message}</div>}

            {selectedArtist && (
              <>
                <div className="accountGrid">
                  <section className="accountCard">
                    <h2>Profile</h2>

                    <label>Your Name</label>
                    <input
                      value={profile.artist_name}
                      onChange={(e) => updateField("artist_name", e.target.value)}
                      placeholder="Your Name"
                    />

                    <label>Short Bio</label>
                    <textarea
                      value={profile.bio}
                      onChange={(e) => updateField("bio", e.target.value)}
                      placeholder="Tell fans about yourself..."
                    />

                    <label>Genre(s)</label>
                    <input
                      value={profile.genres}
                      onChange={(e) => updateField("genres", e.target.value)}
                      placeholder="Rock, Country, Acoustic..."
                    />
                  </section>

                  <section className="accountCard">
                    <h2>E-Pay / Tips</h2>

                    <label>Payment Type</label>
                    <select
                      value={profile.tip_type}
                      onChange={(e) => updateField("tip_type", e.target.value)}
                    >
                      <option value="">Choose payment type</option>
                      <option value="Venmo">Venmo</option>
                      <option value="Cash App">Cash App</option>
                      <option value="PayPal">PayPal</option>
                      <option value="Zelle">Zelle</option>
                      <option value="Other">Other</option>
                    </select>

                    <label>Handle or Link</label>
                    <input
                      value={profile.tip_link}
                      onChange={(e) => updateField("tip_link", e.target.value)}
                      placeholder="Payment handle or link"
                    />

                    <label>Button Text</label>
                    <input
                      value={profile.tip_button_text}
                      onChange={(e) =>
                        updateField("tip_button_text", e.target.value)
                      }
                      placeholder="Tip Me"
                    />

                    <label>Thank You Message</label>
                    <textarea
                      value={profile.tip_thank_you}
                      onChange={(e) =>
                        updateField("tip_thank_you", e.target.value)
                      }
                      placeholder="Thanks for supporting live music!"
                    />
                  </section>

                  <section className="accountCard">
                    <h2>Upcoming Gigs</h2>

                    {gigs.length === 0 ? (
                      <p className="empty">No gigs added yet.</p>
                    ) : (
                      gigs.map((gig) => (
                        <div
                          key={gig.id}
                          style={{
                            borderTop: "1px solid rgba(255,255,255,0.18)",
                            paddingTop: 14,
                            marginTop: 14
                          }}
                        >
                          <p style={{ margin: "0 0 6px", fontWeight: 900 }}>
                            {gig.venue_name || "Venue TBD"}
                          </p>

                          <p style={{ margin: "0 0 6px", color: "#ddd" }}>
                            {formatGigDate(gig.gig_date)} •{" "}
                            {formatGigTime(gig.start_time, gig.end_time)}
                          </p>

                          <p style={{ margin: "0 0 10px", color: "#bbb" }}>
                            {gig.venue_address || "Address TBD"} •{" "}
                            {gig.recurring_type || "One-Time"}
                          </p>

                            {gig.special_note && (
                              <p
                                style={{
                                  marginTop: 8,
                                  color: "#d4af37",
                                  fontStyle: "italic"
                                }}
                              >
                                {gig.special_note}
                              </p>
                            )}
                            
                          <button
                            className="smallbtn"
                            type="button"
                            onClick={() => startEditGig(gig)}
                            style={{ marginRight: 10 }}
                          >
                            Edit Gig
                          </button>

                          <button
                            className="smallbtn"
                            type="button"
                            onClick={() => deleteGig(gig.id)}
                          >
                            Delete Gig
                          </button>
                        </div>
                      ))
                    )}

                    <hr style={{ margin: "22px 0", borderColor: "#333" }} />

                    <h3>{editingGigId ? "Edit Gig" : "Add New Gig"}</h3>

                    <label>Venue Name</label>
                    <input
                      value={newGig.venue_name}
                      onChange={(e) =>
                        updateGigField("venue_name", e.target.value)
                      }
                      placeholder="Enter venue name"
                    />

                    <label>Venue Address</label>
                    <input
                      value={newGig.venue_address}
                      onChange={(e) =>
                        updateGigField("venue_address", e.target.value)
                      }
                      placeholder="Enter venue address"
                    />

                    <label>Gig Date</label>
                    <input
                      type="date"
                      value={newGig.gig_date}
                      onChange={(e) => updateGigField("gig_date", e.target.value)}
                    />

                    <label>Start Time</label>
                    <input
                      type="time"
                      value={newGig.start_time}
                      onChange={(e) => updateGigField("start_time", e.target.value)}
                    />

                    <label>End Time</label>
                    <input
                      type="time"
                      value={newGig.end_time}
                      onChange={(e) => updateGigField("end_time", e.target.value)}
                    />

                    <label>Recurring Type</label>
                    <select
                      value={newGig.recurring_type}
                      onChange={(e) =>
                        updateGigField("recurring_type", e.target.value)
                      }
                    >
                      <option value="One-Time">One-Time</option>
                      <option value="Weekly">Weekly</option>
                      <option value="Monthly">Monthly</option>
                    </select>
<label>Special Note</label>

<textarea
  value={newGig.special_note}
  onChange={(e) =>
    updateGigField("special_note", e.target.value)
  }
  placeholder="Patio show, birthday party, Eagles game after-party, special guest appearance..."
/>

<label
  style={{
    display: "flex",
    alignItems: "center",
    gap: 10,
    marginTop: 12,
    fontWeight: 800
  }}
>
  <input
    type="checkbox"
    checked={newGig.allow_requests !== false}
    onChange={(e) =>
      updateGigField("allow_requests", e.target.checked)
    }
    style={{ width: 18, height: 18 }}
  />
  Allow song requests for this gig
</label>

<p
  style={{
    marginTop: 6,
    marginBottom: 18,
    color: "#bbb"
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
                        onClick={cancelEditGig}
                        style={{ marginLeft: 10 }}
                      >
                        Cancel Edit
                      </button>
                    )}
                  </section>

                  <section className="accountCard">
                    <h2>Social Links</h2>

                    <label>Facebook</label>
                    <input
                      value={profile.facebook}
                      onChange={(e) => updateField("facebook", e.target.value)}
                      placeholder="Facebook URL"
                    />

                    <label>Instagram</label>
                    <input
                      value={profile.instagram}
                      onChange={(e) => updateField("instagram", e.target.value)}
                      placeholder="Instagram URL"
                    />

                    <label>YouTube</label>
                    <input
                      value={profile.youtube}
                      onChange={(e) => updateField("youtube", e.target.value)}
                      placeholder="YouTube URL"
                    />

                    <label>Website</label>
                    <input
                      value={profile.website}
                      onChange={(e) => updateField("website", e.target.value)}
                      placeholder="Website URL"
                    />
                  </section>

                  <section className="accountCard">
                    <h2>Song Library</h2>

                    <p className="empty">
                      Manage the songs your audience can request. Add, remove,
                      organize, and feature songs from your catalog.
                    </p>

                    <a
                      className="btn secondary"
                      href="/account/library"
                      style={{ marginTop: 12 }}
                    >
                      Manage Library
                    </a>
                  </section>

                  <section className="accountCard">
                    <p className="performer">Marketing Tools</p>

                    <p className="empty" style={{ marginTop: 10 }}>
                      Download your QR code, table tent, flyer, and social media graphics.
                    </p>

                    <div style={{ display: "grid", gap: 12, marginTop: 15 }}>
                      <Link className="btn" href="/account/marketing-kit">
                        🎨 Open Marketing Kit
                      </Link>
                    </div>
                  </section>

                  <section className="accountCard">
                    <h2>Referral Program</h2>

                    <p className="empty">
                      Share your referral link with other artists. They save $20 and you earn $20 when they complete setup.
                    </p>

                    <div style={{ marginTop: 16, lineHeight: 1.9 }}>
                      <p><strong>Referral Code:</strong> {profile.referral_code || "Not Available"}</p>
                      <p><strong>Successful Referrals:</strong> {profile.referral_count || 0}</p>
                      <p><strong>Referral Earnings:</strong> ${Number(profile.referral_earnings || 0).toFixed(0)}</p>
                    </div>

                    {profile.referral_code && (
                      <>
                        <div
                          style={{
                            marginTop: 14,
                            padding: 12,
                            borderRadius: 8,
                            background: "rgba(255,255,255,0.06)"
                          }}
                        >
                          <input
                            readOnly
                            value={`https://www.ucallithappyhour.com/register?ref=${profile.referral_code}`}
                            style={{
                              width: "100%",
                              background: "transparent",
                              border: "none",
                              color: "#fff",
                              fontSize: 14,
                              marginBottom: 10
                            }}
                          />

                          <button
                            className="btn secondary"
                            type="button"
                            onClick={() =>
                              navigator.clipboard.writeText(
                                `https://www.ucallithappyhour.com/register?ref=${profile.referral_code}`
                              )
                            }
                          >
                            Copy Referral Link
                          </button>
                        </div>

                        <div style={{ display: "grid", gap: 12, marginTop: 15 }}>
                          <Link className="btn" href="/account/marketing-kit">
                            Open Marketing Kit
                          </Link>
                        </div>
                      </>
                    )}
                  </section>

                  <section className="accountCard">
                    <h2>Artwork</h2>

                    <p className="empty">
                      Manage the logo or image shown on the artist page.
                    </p>

                    <a
                      className="btn secondary"
                      href="/account/artwork"
                      style={{ marginTop: 12 }}
                    >
                      Manage Artwork
                    </a>
                  </section>
                </div>

                <div className="actions" style={{ marginTop: 28 }}>
                  <button className="btn" type="button" onClick={saveProfile}>
                    Save Account Info
                  </button>

                  <Link className="btn secondary" href="/dashboard">
                    Cancel
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}