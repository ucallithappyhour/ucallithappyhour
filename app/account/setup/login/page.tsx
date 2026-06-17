"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "../../../../lib/supabase";

type Artist = {
  artist_slug: string;
  artist_name: string | null;
  owner_email: string | null;
};

export default function SetupLoginPage() {
  const [token, setToken] = useState("");
  const [artist, setArtist] = useState<Artist | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("Loading...");
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);

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
      .select("artist_slug, artist_name, owner_email")
      .eq("setup_token", setupToken)
      .maybeSingle();

    if (error || !data) {
      setMessage("Could not find your artist setup.");
      return;
    }

    setArtist(data);
    setEmail(data.owner_email || "");
    setMessage("");
  }

  async function createLogin() {
    if (!artist) return;

    if (!email.trim()) {
      setMessage("Email is required.");
      return;
    }

    if (password.length < 6) {
      setMessage("Password must be at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setMessage("Passwords do not match.");
      return;
    }

    setSaving(true);
    setMessage("");

    const { error: signUpError } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        emailRedirectTo: "https://www.ucallithappyhour.com/account"
      }
    });

    if (signUpError) {
      setMessage(signUpError.message);
      setSaving(false);
      return;
    }

    const { error: updateError } = await supabase
      .from("artists")
      .update({
        owner_email: email.trim(),
        setup_completed: true
      })
      .eq("setup_token", token);

    if (updateError) {
      setMessage("Login created, but setup could not be finalized.");
      setSaving(false);
      return;
    }

    setDone(true);
    setSaving(false);
  }

  if (done && artist) {
    return (
      <main className="page">
        <div className="overlay">
          <div className="container">
            <div className="hero">
              <section className="accountCard" style={{ maxWidth: 700, margin: "0 auto" }}>
                <div className="brand">U CALL IT HAPPY HOUR</div>

                <h1 className="title">🎉 Your Artist Page Is Ready!</h1>

                <p className="tagline">
                  Check your email to confirm your login, then you can return anytime to manage your page.
                </p>

                <div className="actions" style={{ marginTop: 28 }}>
                  <Link className="btn" href={`/${artist.artist_slug}`}>
                    View My Artist Page →
                  </Link>

                  <Link className="btn secondary" href="/account">
                    Go to Dashboard
                  </Link>
                </div>
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
            <section className="accountCard" style={{ maxWidth: 700, margin: "0 auto" }}>
              <div className="brand">U CALL IT HAPPY HOUR</div>

              <h1 className="title">Secure Your Account</h1>

              <p className="tagline">
                Create your login so you can come back anytime to manage gigs, songs, artwork, and requests.
              </p>

              {artist && (
                <p className="details" style={{ marginTop: 16 }}>
                  Artist: <strong>{artist.artist_name || artist.artist_slug}</strong>
                </p>
              )}

              {message && <div className="message">{message}</div>}

              <label>Email</label>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
              />

              <label>Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Create password"
              />

              <label>Confirm Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm password"
              />

              <div className="actions" style={{ marginTop: 28 }}>
                <button className="btn" type="button" onClick={createLogin} disabled={saving}>
                  {saving ? "Creating Login..." : "Create My Login →"}
                </button>

                {token && (
                  <Link className="btn secondary" href={`/account/setup/next?token=${token}`}>
                    Back to Setup Steps
                  </Link>
                )}
              </div>
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}