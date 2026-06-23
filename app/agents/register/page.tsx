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

export default function AgentRegisterPage() {
  const router = useRouter();

  const [agencyName, setAgencyName] = useState("");
  const [contactName, setContactName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [artistCount, setArtistCount] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function submitAgentRequest(e: React.FormEvent) {
    e.preventDefault();

    setLoading(true);
    setMessage("");

    const isInvalid =
      !agencyName.trim() ||
      !contactName.trim() ||
      !email.trim() ||
      password.length < 6 ||
      password !== confirmPassword;

    if (isInvalid) {
      setMessage("Please complete all required fields correctly.");
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

      console.log("🔥 REGISTER RESPONSE:", data);

      if (!res.ok || !data?.success) {
        setMessage(data.error || "Something went wrong.");
        setLoading(false);
        return;
      }

      setMessage("Account created successfully. Redirecting...");

      // ✅ CLEAN SAAS FLOW (NO TIMEOUT HACKS)
      router.push("/account/setup/login");

    } catch (err) {
      console.error(err);
      setMessage("Server error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="page">
      <div className="overlay">
        <div className="container">
          <section className="accountCard" style={{ maxWidth: 920, margin: "0 auto" }}>

            <div className="brand">U CALL IT HAPPY HOUR</div>

            <h1 className="title">Request Your Agent Link</h1>

            <p style={{ fontSize: 18, opacity: 0.9 }}>
              Create your booking agent account and get your dashboard access.
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
              <h2>Agent Account Setup</h2>

              <form onSubmit={submitAgentRequest}>
                <label style={labelStyle}>Agency Name</label>
                <input style={inputStyle} value={agencyName} onChange={(e) => setAgencyName(e.target.value)} />

                <label style={labelStyle}>Contact Name</label>
                <input style={inputStyle} value={contactName} onChange={(e) => setContactName(e.target.value)} />

                <label style={labelStyle}>Email</label>
                <input style={inputStyle} type="email" value={email} onChange={(e) => setEmail(e.target.value)} />

                <label style={labelStyle}>Password</label>
                <input style={inputStyle} type="password" value={password} onChange={(e) => setPassword(e.target.value)} />

                <label style={labelStyle}>Confirm Password</label>
                <input style={inputStyle} type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />

                <label style={labelStyle}>Phone</label>
                <input style={inputStyle} value={phone} onChange={(e) => setPhone(e.target.value)} />

                <label style={labelStyle}>Artists Represented</label>
                <input style={inputStyle} type="number" value={artistCount} onChange={(e) => setArtistCount(e.target.value)} />

                <button
                  disabled={loading}
                  style={{
                    width: "100%",
                    padding: 14,
                    background: "#ffd84d",
                    fontWeight: "bold",
                    borderRadius: 10,
                    border: 0,
                    cursor: "pointer"
                  }}
                >
                  {loading ? "Creating..." : "Create Agent Account"}
                </button>
              </form>

              {message && (
                <p style={{ marginTop: 12, fontWeight: "bold" }}>
                  {message}
                </p>
              )}
            </div>

            <div style={{ marginTop: 20 }}>
              <Link href="/agents" style={{ color: "#ffd84d" }}>
                ← Back to Agent Portal
              </Link>
            </div>

          </section>
        </div>
      </div>
    </main>
  );
}