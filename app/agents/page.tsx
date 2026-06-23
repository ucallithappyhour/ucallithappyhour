"use client";

import { useState } from "react";
import Link from "next/link";

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "12px",
  marginTop: 6,
  marginBottom: 14,
  borderRadius: 8,
  border: "1px solid #ccc",
  background: "#fff",
  color: "#111",
  fontSize: 16,
  boxSizing: "border-box"
};

const labelStyle: React.CSSProperties = {
  display: "block",
  fontWeight: "bold",
  marginTop: 12,
  color: "#111"
};

export default function AgentsPage() {
  const [agencyName, setAgencyName] = useState("");
  const [contactName, setContactName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [artistCount, setArtistCount] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [referralUrl, setReferralUrl] = useState("");

  async function submitAgentRequest(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setReferralUrl("");

    try {
      const res = await fetch("/api/agent-register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          agency_name: agencyName,
          contact_name: contactName,
          email,
          phone,
          artist_count: Number(artistCount || 0)
        })
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.error || "Something went wrong.");
        return;
      }

      setMessage("Agent request received. Your referral link is ready.");
      setReferralUrl(data.referral_url || "");
      setAgencyName("");
      setContactName("");
      setEmail("");
      setPhone("");
      setArtistCount("");
    } catch (err) {
      console.error(err);
      setMessage("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function copyReferralUrl() {
    if (!referralUrl) return;
    await navigator.clipboard.writeText(referralUrl);
    setMessage("Referral link copied.");
  }

  return (
    <main className="page">
      <div className="overlay">
        <div className="container">
          <section
            className="accountCard"
            style={{ maxWidth: 920, margin: "0 auto" }}
          >
            <div className="brand">U CALL IT HAPPY HOUR</div>

            <h1 className="title">Booking Agents & Talent Buyers</h1>

            <p style={{ fontSize: 18, lineHeight: 1.6, opacity: 0.9 }}>
              Give your artists a simple way to take live song requests,
              increase audience engagement, and turn every show into a smarter
              booking opportunity — while earning{" "}
              <strong style={{ color: "#ffd84d" }}>
                $25 for every artist you refer.
              </strong>
            </p>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                gap: 16,
                marginTop: 24
              }}
            >
              {[
                "Send artists your referral link",
                "Artists sign up and activate their page",
                "They use it at shows",
                "You earn $25 per activated artist"
              ].map((item, index) => (
                <div
                  key={item}
                  style={{
                    background: "#181818",
                    border: "1px solid #333",
                    borderRadius: 14,
                    padding: 18
                  }}
                >
                  <div
                    style={{
                      fontSize: 28,
                      fontWeight: "bold",
                      color: "#ffd84d",
                      marginBottom: 8
                    }}
                  >
                    {index + 1}
                  </div>
                  <p style={{ margin: 0, lineHeight: 1.4 }}>{item}</p>
                </div>
              ))}
            </div>

            <div
              style={{
                background: "#181818",
                border: "1px solid #333",
                borderRadius: 14,
                padding: 24,
                marginTop: 24
              }}
            >
              <h2 style={{ color: "#ffd84d", marginTop: 0 }}>
                Earn $25 Per Artist
              </h2>

              <p style={{ fontSize: 18, lineHeight: 1.6, marginBottom: 10 }}>
                Share your referral link with artists in your roster. When an
                artist completes setup, you earn a{" "}
                <strong>$25 referral commission.</strong>
              </p>

              <p style={{ opacity: 0.85, marginBottom: 0 }}>
                Represent 20 artists? That&apos;s a potential $500 in referral
                commissions.
              </p>
            </div>

            <div
              style={{
                background: "#fff",
                color: "#111",
                borderRadius: 16,
                padding: 24,
                marginTop: 30
              }}
            >
              <h2 style={{ marginTop: 0, color: "#111" }}>
                Request Your Agent Link
              </h2>

              <form onSubmit={submitAgentRequest}>
                <label style={labelStyle}>Agency Name</label>
                <input
                  style={inputStyle}
                  required
                  value={agencyName}
                  onChange={(e) => setAgencyName(e.target.value)}
                  placeholder="ABC Entertainment"
                />

                <label style={labelStyle}>Contact Name</label>
                <input
                  style={inputStyle}
                  required
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  placeholder="John Smith"
                />

                <label style={labelStyle}>Email</label>
                <input
                  style={inputStyle}
                  required
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="john@example.com"
                />

                <label style={labelStyle}>Phone</label>
                <input
                  style={inputStyle}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="555-555-5555"
                />

                <label style={labelStyle}>
                  Number of Artists Represented
                </label>
                <input
                  style={inputStyle}
                  type="number"
                  min="0"
                  value={artistCount}
                  onChange={(e) => setArtistCount(e.target.value)}
                  placeholder="25"
                />

                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    width: "100%",
                    marginTop: 18,
                    padding: "14px 18px",
                    borderRadius: 10,
                    border: 0,
                    background: "#ffd84d",
                    color: "#000",
                    fontWeight: "bold",
                    fontSize: 17,
                    cursor: loading ? "not-allowed" : "pointer",
                    opacity: loading ? 0.7 : 1
                  }}
                >
                  {loading ? "Creating..." : "Get My Referral Link"}
                </button>
              </form>

              {message && (
                <p style={{ marginTop: 16, fontWeight: "bold", color: "#111" }}>
                  {message}
                </p>
              )}

              {referralUrl && (
                <div
                  style={{
                    marginTop: 18,
                    padding: 16,
                    borderRadius: 12,
                    background: "#f3f3f3",
                    border: "1px solid #ddd"
                  }}
                >
                  <p
                    style={{
                      marginTop: 0,
                      fontWeight: "bold",
                      color: "#111"
                    }}
                  >
                    Agent Referral Link
                  </p>

                  <p style={{ wordBreak: "break-all", color: "#111" }}>
                    {referralUrl}
                  </p>

                  <button
                    type="button"
                    onClick={copyReferralUrl}
                    style={{
                      padding: "12px 16px",
                      borderRadius: 8,
                      border: 0,
                      background: "#111",
                      color: "#fff",
                      fontWeight: "bold",
                      cursor: "pointer"
                    }}
                  >
                    Copy Link
                  </button>
                </div>
              )}
            </div>

            <div style={{ marginTop: 24 }}>
              <Link href="/" style={{ color: "#ffd84d", fontWeight: "bold" }}>
                ← Back to Home
              </Link>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}