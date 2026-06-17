"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function SetupNextPage() {
  const [token, setToken] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setToken(params.get("token") || "");
  }, []);

  return (
    <main className="page">
      <div className="overlay">
        <div className="container">
          <div className="hero">
            <section
              className="accountCard"
              style={{ maxWidth: 820, margin: "0 auto" }}
            >
              <div className="brand">U CALL IT HAPPY HOUR</div>

              <h1 className="title">Your Profile Is Saved 🎉</h1>

              <p className="tagline">
                Finish building your artist page so fans can start requesting
                songs at your shows.
              </p>

              <div
                style={{
                  marginTop: 28,
                  display: "grid",
                  gap: 18
                }}
              >
                <div
                  style={{
                    padding: 20,
                    border: "1px solid rgba(212,175,55,0.35)",
                    borderRadius: 12,
                    background: "rgba(212,175,55,0.08)"
                  }}
                >
                  <h2>Add Upcoming Gigs</h2>
                  <p style={{ marginTop: 10, lineHeight: 1.7 }}>
                    Add your venue, date, time, and recurring show details so
                    fans know where to find you.
                  </p>

                  <Link
                    className="btn"
                    href={`/account/gigs${token ? `?token=${token}` : ""}`}
                    style={{ marginTop: 14 }}
                  >
                    Add Gigs →
                  </Link>
                </div>

                <div
                  style={{
                    padding: 20,
                    border: "1px solid rgba(255,255,255,0.15)",
                    borderRadius: 12,
                    background: "rgba(255,255,255,0.05)"
                  }}
                >
                  <h2>Upload Logo / Artwork</h2>
                  <p style={{ marginTop: 10, lineHeight: 1.7 }}>
                    Add your artist logo or band image so your request page
                    looks professional.
                  </p>

                  <Link
                    className="btn secondary"
                    href={`/account/artwork${token ? `?token=${token}` : ""}`}
                    style={{ marginTop: 14 }}
                  >
                    Upload Artwork →
                  </Link>
                </div>

                <div
                  style={{
                    padding: 20,
                    border: "1px solid rgba(255,255,255,0.15)",
                    borderRadius: 12,
                    background: "rgba(255,255,255,0.05)"
                  }}
                >
                  <h2>Add Song Library</h2>
                  <p style={{ marginTop: 10, lineHeight: 1.7 }}>
                    Add songs one at a time or import your catalog so fans can
                    search and request from your list.
                  </p>

                  <Link
                    className="btn secondary"
                    href={`/account/library${token ? `?token=${token}` : ""}`}
                    style={{ marginTop: 14 }}
                  >
                    Add Songs →
                  </Link>
                </div>

                <div
                  style={{
                    padding: 20,
                    border: "1px solid rgba(34,197,94,0.45)",
                    borderRadius: 12,
                    background: "rgba(34,197,94,0.12)"
                  }}
                >
                  <h2>Create Login / Manage Dashboard</h2>
                  <p style={{ marginTop: 10, lineHeight: 1.7 }}>
                    Your artist page is active. Next, create your login so you
                    can come back anytime to manage gigs, songs, artwork, and
                    requests.
                  </p>

                  <Link
                    className="btn"
                    href="/account"
                    style={{ marginTop: 14 }}
                  >
                    Go to Artist Dashboard →
                  </Link>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}