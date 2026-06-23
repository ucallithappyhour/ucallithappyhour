"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";

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

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function loginAgent(e: React.FormEvent) {
    e.preventDefault();
    setMessage("");
    setLoading(true);

    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password
    });

    if (error || !data?.user?.email) {
      setLoading(false);
      setMessage(error?.message || "Login failed. Please try again.");
      return;
    }

    const { data: agent, error: agentError } = await supabase
      .from("booking_agents")
      .select("id")
      .eq("email", data.user.email)
      .maybeSingle();

    setLoading(false);

    if (agentError || !agent) {
      setMessage(
        "Login worked, but no booking agent account was found for this email."
      );
      return;
    }

    router.push("/agents/dashboard");
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
              Log in to track referred artists, signup status, referral links,
              QR codes, and estimated commissions.
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
              <h2 style={{ marginTop: 0, color: "#111" }}>Agent Login</h2>

              <form onSubmit={loginAgent}>
                <label style={labelStyle}>Email</label>
                <input
                  style={inputStyle}
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="agent@example.com"
                  autoComplete="email"
                />

                <label style={labelStyle}>Password</label>
                <input
                  style={inputStyle}
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                />

                <button
                  type="submit"
                  disabled={loading}
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
                    cursor: loading ? "not-allowed" : "pointer",
                    opacity: loading ? 0.75 : 1
                  }}
                >
                  {loading ? "Logging In..." : "Log In"}
                </button>
              </form>

              {message && (
                <p style={{ marginTop: 16, fontWeight: "bold", color: "#111" }}>
                  {message}
                </p>
              )}

              <p style={{ marginTop: 16, color: "#333", lineHeight: 1.6 }}>
                Use the email and password connected to your booking agent
                account.
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
                Request an agent account, share your referral link with artists
                in your roster, and earn <strong>$25</strong> for every artist
                who completes setup.
              </p>

              <Link className="btn" href="/agents/register">
                Request Agent Account
              </Link>
            </div>

            <div
              style={{
                background: "#181818",
                border: "1px solid #333",
                borderRadius: 14,
                padding: 22,
                marginTop: 24
              }}
            >
              <h2
                style={{
                  color: "#ffd84d",
                  marginTop: 0,
                  marginBottom: 16
                }}
              >
                How It Works
              </h2>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 12,
                  fontSize: 16,
                  lineHeight: 1.45
                }}
              >
                <div>
                  <strong style={{ color: "#ffd84d" }}>1.</strong> Share your
                  referral link
                </div>

                <div>
                  <strong style={{ color: "#ffd84d" }}>2.</strong> Artists
                  receive a setup discount
                </div>

                <div>
                  <strong style={{ color: "#ffd84d" }}>3.</strong> Track
                  signups in your dashboard
                </div>

                <div>
                  <strong style={{ color: "#ffd84d" }}>4.</strong> Earn $25 per
                  completed artist
                </div>
              </div>
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