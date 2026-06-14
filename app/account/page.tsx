"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

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

export default function AccountPage() {
  const [profile, setProfile] = useState<ArtistProfile>(emptyProfile);
  const [message, setMessage] = useState("");

  function updateField(field: keyof ArtistProfile, value: string) {
    setProfile((current) => ({
      ...current,
      [field]: value
    }));
  }

  async function loadProfile() {
    const { data, error } = await supabase
      .from("artists")
      .select("*")
      .eq("artist_slug", "default")
      .single();

    if (error) {
      setMessage("Could not load artist profile yet.");
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

  async function saveProfile() {
    setMessage("Saving...");

    const { error } = await supabase
      .from("artists")
      .upsert(
        {
          artist_slug: "default",
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
  }

  useEffect(() => {
    loadProfile();
  }, []);

  return (
    <main className="page">
      <div className="overlay">
        <div className="container">
          <div className="hero">
            <div className="brand">U Call It Happy Hour</div>

            <h1 className="title">Set Up Your Artist Profile</h1>

            <p className="tagline">
              Manage your profile, tip link, and social links.
            </p>

            <div className="actions">
              <Link className="btn secondary" href="/dashboard">
                Back to Dashboard
              </Link>
            </div>

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
                  onChange={(e) => updateField("tip_button_text", e.target.value)}
                  placeholder="Tip Me"
                />

                <label>Thank You Message</label>
                <textarea
                  value={profile.tip_thank_you}
                  onChange={(e) => updateField("tip_thank_you", e.target.value)}
                  placeholder="Thanks for supporting live music!"
                />
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
                <h2>Coming Next</h2>
                <p>
                  Phase 1B will add multiple gig dates and venues.
                </p>
                <p>
                  Phase 1C will add full song library management.
                </p>
                <p>
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