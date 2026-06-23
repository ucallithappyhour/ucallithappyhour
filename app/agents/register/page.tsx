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

export default function AgentRegisterPage() {
  const [agencyName, setAgencyName] = useState("");
  const [contactName, setContactName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [artistCount, setArtistCount] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const [referralUrl, setReferralUrl] = useState("");
  const [dashboardUrl, setDashboardUrl] = useState("");
  const [profileUrl, setProfileUrl] = useState("");

  async function submitAgentRequest(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setReferralUrl("");
    setDashboardUrl("");
    setProfileUrl("");

    if (password.length < 6) {
      setMessage("Password must be at least 6 characters.");
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setMessage("Passwords do not match.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/agent-register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          agency_name: agencyName,
          contact_name: contactName,
          email,
          password,
          phone,
          artist_count: Number(artistCount || 0)
        })
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.error || "Something went wrong.");
        setLoading(false);
        return;
      }

      setMessage("Agent account created. Your links are ready.");
      setReferralUrl(data.referral_url || "");
      setDashboardUrl(data.dashboard_url || "");
      setProfileUrl(data.profile_url || "");

      setAgencyName("");
      setContactName("");
      setEmail("");
      setPassword("");
      setConfirmPassword("");
      setPhone("");
      setArtistCount("");
    } catch (err) {
      console.error(err);
      setMessage("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function copyText(text: string, label: string) {
    if (!text) return;
    await navigator.clipboard.writeText(text);
    setMessage(`${label} copied.`);
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

            <h1 className="title">Request Your Agent Link</h1>

            <p style={{ fontSize: 18, lineHeight: 1.6, opacity: 0.9 }}>
              Create your booking agent account, get your referral link, and
              track artist signups from your dashboard.
            </p>

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

              <p style={{ fontSize: 18, lineHeight: 1.6, marginBottom: 0 }}>
                Artists you refer save <strong>$25</strong> on setup. You earn{" "}
                <strong>$25</strong> when they complete setup.
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
                Agent Account Setup
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

                <label style={labelStyle}>Password</label>
                <input
                  style={inputStyle}
                  required
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Create a password"
                />

                <label style={labelStyle}>Confirm Password</label>
                <input
                  style={inputStyle}
                  required
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm password"
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
                  {loading ? "Creating..." : "Create Agent Account"}
                </button>
              </form>

              {message && (
                <p style={{ marginTop: 16, fontWeight: "bold", color: "#111" }}>
                  {message}
                </p>
              )}

              {(referralUrl || dashboardUrl || profileUrl) && (
                <div
                  style={{
                    marginTop: 18,
                    padding: 16,
                    borderRadius: 12,
                    background: "#f3f3f3",
                    border: "1px solid #ddd"
                  }}
                >
                  <p style={{ marginTop: 0, fontWeight: "bold" }}>
                    Save These Links
                  </p>

                  {dashboardUrl && (
                    <>
                      <p style={{ wordBreak: "break-all" }}>
                        <strong>Dashboard:</strong> {dashboardUrl}
                      </p>
                      <button
                        type="button"
                        onClick={() => copyText(dashboardUrl, "Dashboard link")}
                        style={{
                          padding: "10px 14px",
                          borderRadius: 8,
                          border: 0,
                          background: "#111",
                          color: "#fff",
                          fontWeight: "bold",
                          cursor: "pointer",
                          marginBottom: 12
                        }}
                      >
                        Copy Dashboard Link
                      </button>
                    </>
                  )}

                  {profileUrl && (
                    <>
                      <p style={{ wordBreak: "break-all" }}>
                        <strong>Profile Setup:</strong> {profileUrl}
                      </p>
                      <button
                        type="button"
                        onClick={() => copyText(profileUrl, "Profile link")}
                        style={{
                          padding: "10px 14px",
                          borderRadius: 8,
                          border: 0,
                          background: "#111",
                          color: "#fff",
                          fontWeight: "bold",
                          cursor: "pointer",
                          marginBottom: 12
                        }}
                      >
                        Copy Profile Link
                      </button>
                    </>
                  )}

                  {referralUrl && (
                    <>
                      <p style={{ wordBreak: "break-all" }}>
                        <strong>Referral:</strong> {referralUrl}
                      </p>
                      <button
                        type="button"
                        onClick={() => copyText(referralUrl, "Referral link")}
                        style={{
                          padding: "10px 14px",
                          borderRadius: 8,
                          border: 0,
                          background: "#111",
                          color: "#fff",
                          fontWeight: "bold",
                          cursor: "pointer"
                        }}
                      >
                        Copy Referral Link
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>

            <div style={{ marginTop: 24 }}>
              <Link href="/agents" style={{ color: "#ffd84d", fontWeight: "bold" }}>
                ← Back to Agent Portal
              </Link>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}