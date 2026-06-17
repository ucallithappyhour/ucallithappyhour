"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabase";

type Artist = {
  artist_slug: string;
  artist_name: string | null;
  bio: string | null;
  genres: string | null;
  tip_type: string | null;
  tip_link: string | null;
  website: string | null;
  facebook: string | null;
  instagram: string | null;
  youtube: string | null;
};

export default function ArtistSetupPage() {
  const [token, setToken] = useState("");
  const [artist, setArtist] = useState<Artist | null>(null);
  const [message, setMessage] = useState("Loading setup page...");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const setupToken = params.get("token") || "";
    setToken(setupToken);

    if (!setupToken) {
      setMessage("Missing setup token.");
      return;
    }

    loadArtist(setupToken);
  }, []);

  async function loadArtist(setupToken: string) {
    const { data, error } = await supabase
      .from("artists")
      .select(
        "artist_slug, artist_name, bio, genres, tip_type, tip_link, website, facebook, instagram, youtube"
      )
      .eq("setup_token", setupToken)
      .maybeSingle();

    if (error || !data) {
      setMessage("Could not find your artist setup page.");
      return;
    }

    setArtist(data);
    setMessage("");
  }

  async function saveSetup() {
    if (!artist || !token) return;

    setSaving(true);
    setMessage("");

    const { error } = await supabase
      .from("artists")
      .update({
        artist_name: artist.artist_name,
        bio: artist.bio,
        genres: artist.genres,
        tip_type: artist.tip_type,
        tip_link: artist.tip_link,
        website: artist.website,
        facebook: artist.facebook,
        instagram: artist.instagram,
        youtube: artist.youtube,
        setup_completed: true
      })
      .eq("setup_token", token);

    if (error) {
      setMessage("Could not save setup. Please try again.");
      setSaving(false);
      return;
    }

    window.location.href = `/account/setup/next?token=${token}`;
  }

  if (!artist) {
    return (
      <main className="page">
        <div className="overlay">
          <div className="container">
            <div className="hero">
              <section className="accountCard">
                <h1>Artist Setup</h1>
                <p>{message}</p>
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
            <section
              className="accountCard"
              style={{ maxWidth: 760, margin: "0 auto" }}
            >
              <div className="brand">U CALL IT HAPPY HOUR</div>

              <h1 className="title">Complete Your Artist Setup</h1>

              <p className="tagline">
                Add the details fans will see on your request page.
              </p>

              {message && (
                <div className="message" style={{ marginBottom: 20 }}>
                  <p>{message}</p>
                </div>
              )}

              <label>Artist / Band Name</label>
              <input
                value={artist.artist_name || ""}
                onChange={(e) =>
                  setArtist({ ...artist, artist_name: e.target.value })
                }
                placeholder="Artist or band name"
              />

              <label>Short Bio</label>
              <textarea
                value={artist.bio || ""}
                onChange={(e) =>
                  setArtist({ ...artist, bio: e.target.value })
                }
                placeholder="Tell fans about your music, style, and shows."
              />

              <label>Genre(s)</label>
              <input
                value={artist.genres || ""}
                onChange={(e) =>
                  setArtist({ ...artist, genres: e.target.value })
                }
                placeholder="Acoustic Rock, Country, 90s, Originals..."
              />

              <label>Tip Type</label>
              <select
                value={artist.tip_type || ""}
                onChange={(e) =>
                  setArtist({ ...artist, tip_type: e.target.value })
                }
              >
                <option value="">Choose payment type</option>
                <option value="Venmo">Venmo</option>
                <option value="Cash App">Cash App</option>
                <option value="PayPal">PayPal</option>
                <option value="Other">Other</option>
              </select>

              <label>Tip Link / Handle</label>
              <input
                value={artist.tip_link || ""}
                onChange={(e) =>
                  setArtist({ ...artist, tip_link: e.target.value })
                }
                placeholder="Venmo handle, Cash App tag, PayPal link, etc."
              />

              <label>Website</label>
              <input
                value={artist.website || ""}
                onChange={(e) =>
                  setArtist({ ...artist, website: e.target.value })
                }
                placeholder="https://yourwebsite.com"
              />

              <label>Facebook</label>
              <input
                value={artist.facebook || ""}
                onChange={(e) =>
                  setArtist({ ...artist, facebook: e.target.value })
                }
                placeholder="Facebook URL"
              />

              <label>Instagram</label>
              <input
                value={artist.instagram || ""}
                onChange={(e) =>
                  setArtist({ ...artist, instagram: e.target.value })
                }
                placeholder="Instagram URL"
              />

              <label>YouTube</label>
              <input
                value={artist.youtube || ""}
                onChange={(e) =>
                  setArtist({ ...artist, youtube: e.target.value })
                }
                placeholder="YouTube URL"
              />

              <div className="actions" style={{ marginTop: 28 }}>
                <button
                  className="btn"
                  type="button"
                  onClick={saveSetup}
                  disabled={saving}
                >
                  {saving ? "Saving..." : "Save Profile & Continue →"}
                </button>
              </div>
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}