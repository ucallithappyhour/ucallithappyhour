"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

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

type NewGig = {
  venue_name: string;
  venue_address: string;
  gig_date: string;
  start_time: string;
  end_time: string;
  recurring_type: string;
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
  website: ""
};

const emptyGig: NewGig = {
  venue_name: "",
  venue_address: "",
  gig_date: "",
  start_time: "",
  end_time: "",
  recurring_type: "One-Time"
};

export default function AccountPage() {
  const [authMode, setAuthMode] = useState<"login" | "create">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [user, setUser] = useState<any>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);

  const [artistOptions, setArtistOptions] = useState<ArtistOption[]>([]);
  const [selectedArtist, setSelectedArtist] = useState("brian-quinn");
  const [profile, setProfile] = useState<ArtistProfile>(emptyProfile);
  const [gigs, setGigs] = useState<Gig[]>([]);
  const [newGig, setNewGig] = useState<NewGig>(emptyGig);
  const [message, setMessage] = useState("");

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

      setMessage("Account created. Check your email to confirm it, then log in.");
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

  async function handleLogout() {
    await supabase.auth.signOut();
    window.location.reload();
  }

  async function loadArtists() {
    const { data, error } = await supabase
      .from("artists")
      .select("artist_slug, artist_name")
      .order("artist_name", { ascending: true });

    if (error) {
      setMessage("Could not load artist list yet.");
      return;
    }

    setArtistOptions(data || []);

    if (
      data &&
      data.length > 0 &&
      !data.some((a) => a.artist_slug === selectedArtist)
    ) {
      setSelectedArtist(data[0].artist_slug);
    }
  }

  async function loadProfile() {
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
      website: data.website || ""
    });
  }

  async function loadGigs() {
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
      recurring_type: newGig.recurring_type
    });

    if (error) {
      setMessage("Could not save gig. Check Supabase table permissions.");
      return;
    }

    setNewGig(emptyGig);
    setMessage("Gig saved successfully.");
    loadGigs();
  }

  async function deleteGig(id: number) {
    setMessage("Deleting gig...");

    const { error } = await supabase.from("gigs").delete().eq("id", id);

    if (error) {
      setMessage("Could not delete gig.");
      return;
    }

    setMessage("Gig deleted.");
    loadGigs();
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
    if (user) {
      loadArtists();
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      loadProfile();
      loadGigs();
      setNewGig(emptyGig);
    }
  }, [selectedArtist, user]);

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
                Log in to manage your artist profile, gigs, tips, and links.
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

                <button
                  className="smallbtn"
                  type="button"
                  style={{ marginTop: 16 }}
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

  return (
    <main className="page">
      <div className="overlay">
        <div className="container">
          <div className="hero">
            <div className="brand">U Call It Happy Hour</div>

            <h1 className="title">Set Up Your Artist Profile</h1>

            <p className="tagline">
              Manage your profile, gigs, tip link, and social links.
            </p>

            <div className="actions">
              <Link className="btn secondary" href="/dashboard">
                Back to Dashboard
              </Link>

              <button className="btn secondary" type="button" onClick={handleLogout}>
                Log Out
              </button>
            </div>

            <section className="accountCard" style={{ marginBottom: 20 }}>
              <h2>Editing Artist</h2>

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

            {message && <div className="message">{message}</div>}

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

                <h3>Add New Gig</h3>

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

                <button className="btn" type="button" onClick={addGig}>
                  Save Gig
                </button>
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
                  Phase 1C will add full song library management.
                </p>
              </section>

              <section className="accountCard">
                <h2>Artwork</h2>

                <p className="empty">
                  Artwork uploads will come after we connect Supabase storage.
                </p>
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
          </div>
        </div>
      </div>
    </main>
  );
}