"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

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
  const router = useRouter();
  const [agentCode, setAgentCode] = useState("");
  const [message, setMessage] = useState("");

  function openDashboard(e: React.FormEvent) {
    e.preventDefault();
    setMessage("");

    const cleanedCode = agentCode
      .trim()
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, "");

    if (!cleanedCode) {
      setMessage("Enter your agent code to open your dashboard.");
      return;
    }

    router.push(`/agents/${cleanedCode}`);
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

            <h1 className="title">Booking Agent Portal</h1>

            <p style={{ fontSize: 18, lineHeight: 1.6, opacity: 0.9 }}>
              Open your dashboard to track referred artists, signup status,
              referral links, QR codes, and estimated commissions.
            </p>

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
                Agent Dashboard Lookup
              </h2>

              <form onSubmit={openDashboard}>
                <label style={labelStyle}>Agent Code</label>
                <input
                  style={inputStyle}
                  value={agentCode}
                  onChange={(e) => setAgentCode(e.target.value)}
                  placeholder="ABC25"
                />

                <button
                  type="submit"
                  style={{
                    width: "100%",
                    marginTop: 8,
                    padding: "14px 18px",
                    borderRadius: 10,
                    border: 0,
                    background: "#ffd84d",
                    color: "#000",
                    fontWeight: "bold",
                    fontSize: 17,
                    cursor: "pointer"
                  }}
                >
                  Open Agent Dashboard
                </button>
              </form>

              {message && (
                <p style={{ marginTop: 16, fontWeight: "bold", color: "#111" }}>
                  {message}
                </p>
              )}

              <p style={{ marginTop: 16, color: "#333", lineHeight: 1.6 }}>
                Your agent code is the code at the end of your dashboard link.
                Example: <strong>ABC25</strong>
              </p>
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
                New Booking Agent or Talent Buyer?
              </h2>

              <p style={{ fontSize: 18, lineHeight: 1.6 }}>
                Request an agent link, share it with artists in your roster,
                and earn <strong>$25</strong> for every artist who completes
                setup.
              </p>

              <Link className="btn" href="/agents/register">
                Request Agent Link
              </Link>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                gap: 16,
                marginTop: 24
              }}
            >
              {[
                "Share your referral link",
                "Artists get a setup discount",
                "Track signups in your dashboard",
                "Earn $25 per completed artist"
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