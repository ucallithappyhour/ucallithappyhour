"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "../../../lib/supabase";

type BookingAgent = {
  id: string;
  agency_name: string | null;
  contact_name: string | null;
  email: string | null;
  phone: string | null;
  artists_represented: string | null;
  referral_code: string | null;
};

export default function AgentDashboard() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [agent, setAgent] = useState<BookingAgent | null>(null);
  const [copied, setCopied] = useState("");

  const referralLink = useMemo(() => {
    if (!agent?.referral_code) return "";
    return `https://www.ucallithappyhour.com/register?agent=${agent.referral_code}`;
  }, [agent]);

  const qrUrl = useMemo(() => {
    if (!referralLink) return "";
    return `https://quickchart.io/qr?text=${encodeURIComponent(
      referralLink
    )}&size=700&margin=2`;
  }, [referralLink]);

  useEffect(() => {
    async function loadDashboard() {
      const {
        data: { user }
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/agents");
        return;
      }

      const { data, error } = await supabase
        .from("booking_agents")
        .select("*")
        .eq("auth_user_id", user.id)
        .maybeSingle();

      if (error || !data) {
        router.push("/agents");
        return;
      }

      setAgent(data);
      setLoading(false);
    }

    loadDashboard();
  }, [router]);

  async function copyText(text: string, label: string) {
    if (!text) return;

    await navigator.clipboard.writeText(text);
    setCopied(label);

    setTimeout(() => {
      setCopied("");
    }, 1800);
  }

  async function logout() {
    await supabase.auth.signOut();
    router.push("/agents");
  }

  if (loading) {
    return (
      <main className="page">
        <div className="overlay">
          <div className="container">
            <section
              className="accountCard"
              style={{ maxWidth: 900, margin: "0 auto" }}
            >
              <p style={{ color: "#fff" }}>Loading dashboard...</p>
            </section>
          </div>
        </div>
      </main>
    );
  }

  if (!agent) return null;

  return (
    <main className="page">
      <div className="overlay">
        <div className="container">
          <section
            className="accountCard"
            style={{ maxWidth: 980, margin: "0 auto" }}
          >
            <div className="brand">U CALL IT HAPPY HOUR</div>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: 16,
                alignItems: "flex-start",
                flexWrap: "wrap"
              }}
            >
              <div>
                <h1 className="title" style={{ marginBottom: 8 }}>
                  Agent Dashboard
                </h1>

                <p style={{ fontSize: 18, lineHeight: 1.5, opacity: 0.9 }}>
                  Welcome back
                  {agent.contact_name ? `, ${agent.contact_name}` : ""}.
                  Track your referral link, QR code, artist signups, and
                  estimated commissions.
                </p>
              </div>

              <button
                onClick={logout}
                style={{
                  padding: "10px 14px",
                  borderRadius: 10,
                  border: "1px solid #444",
                  background: "#181818",
                  color: "#fff",
                  fontWeight: "bold",
                  cursor: "pointer"
                }}
              >
                Log Out
              </button>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                gap: 16,
                marginTop: 24
              }}
            >
              <div
                style={{
                  background: "#181818",
                  border: "1px solid #333",
                  borderRadius: 14,
                  padding: 20
                }}
              >
                <p style={{ margin: 0, opacity: 0.75 }}>Agent / Agency</p>
                <h2 style={{ marginBottom: 0 }}>
                  {agent.agency_name || "Booking Agent"}
                </h2>
              </div>

              <div
                style={{
                  background: "#181818",
                  border: "1px solid #333",
                  borderRadius: 14,
                  padding: 20
                }}
              >
                <p style={{ margin: 0, opacity: 0.75 }}>Referral Code</p>
                <h2 style={{ marginBottom: 0, color: "#ffd84d" }}>
                  {agent.referral_code || "Not set"}
                </h2>
              </div>

              <div
                style={{
                  background: "#181818",
                  border: "1px solid #333",
                  borderRadius: 14,
                  padding: 20
                }}
              >
                <p style={{ margin: 0, opacity: 0.75 }}>Commission</p>
                <h2 style={{ marginBottom: 0 }}>$25 / completed artist</h2>
              </div>
            </div>

            <div
              style={{
                background: "#fff",
                color: "#111",
                borderRadius: 16,
                padding: 24,
                marginTop: 24
              }}
            >
              <h2 style={{ marginTop: 0, color: "#111" }}>
                Your Referral Link
              </h2>

              <p style={{ lineHeight: 1.5, color: "#333" }}>
                Share this link with artists. When they complete setup, they get
                the agent discount and your referral is tracked.
              </p>

              <div
                style={{
                  background: "#f4f4f4",
                  border: "1px solid #ddd",
                  borderRadius: 10,
                  padding: 14,
                  wordBreak: "break-word",
                  fontWeight: "bold"
                }}
              >
                {referralLink}
              </div>

              <button
                onClick={() => copyText(referralLink, "Referral link copied")}
                style={{
                  marginTop: 14,
                  padding: "12px 16px",
                  borderRadius: 10,
                  border: 0,
                  background: "#ffd84d",
                  color: "#000",
                  fontWeight: "bold",
                  cursor: "pointer"
                }}
              >
                Copy Referral Link
              </button>

              {copied && (
                <p style={{ marginTop: 12, fontWeight: "bold", color: "#111" }}>
                  {copied}
                </p>
              )}
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "minmax(220px, 320px) 1fr",
                gap: 20,
                marginTop: 24,
                alignItems: "stretch"
              }}
            >
              <div
                style={{
                  background: "#fff",
                  color: "#111",
                  borderRadius: 16,
                  padding: 24,
                  textAlign: "center"
                }}
              >
                <h2 style={{ color: "#111", marginTop: 0 }}>Referral QR</h2>

                {qrUrl && (
                  <img
                    src={qrUrl}
                    alt="Agent referral QR code"
                    style={{
                      width: "100%",
                      maxWidth: 240,
                      background: "#fff",
                      borderRadius: 12
                    }}
                  />
                )}

                <button
                  onClick={() => copyText(qrUrl, "QR code link copied")}
                  style={{
                    marginTop: 14,
                    padding: "12px 16px",
                    borderRadius: 10,
                    border: 0,
                    background: "#ffd84d",
                    color: "#000",
                    fontWeight: "bold",
                    cursor: "pointer"
                  }}
                >
                  Copy QR Code Link
                </button>
              </div>

              <div
                style={{
                  background: "#181818",
                  border: "1px solid #333",
                  borderRadius: 16,
                  padding: 24
                }}
              >
                <h2 style={{ color: "#ffd84d", marginTop: 0 }}>
                  Referral Tracking
                </h2>

                <p style={{ fontSize: 17, lineHeight: 1.6 }}>
                  Artist signup tracking and commission totals will appear here
                  as referred artists complete setup.
                </p>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      "repeat(auto-fit, minmax(160px, 1fr))",
                    gap: 14,
                    marginTop: 20
                  }}
                >
                  <div
                    style={{
                      background: "#111",
                      border: "1px solid #333",
                      borderRadius: 12,
                      padding: 16
                    }}
                  >
                    <p style={{ margin: 0, opacity: 0.75 }}>Pending Signups</p>
                    <h2 style={{ marginBottom: 0 }}>0</h2>
                  </div>

                  <div
                    style={{
                      background: "#111",
                      border: "1px solid #333",
                      borderRadius: 12,
                      padding: 16
                    }}
                  >
                    <p style={{ margin: 0, opacity: 0.75 }}>Completed Artists</p>
                    <h2 style={{ marginBottom: 0 }}>0</h2>
                  </div>

                  <div
                    style={{
                      background: "#111",
                      border: "1px solid #333",
                      borderRadius: 12,
                      padding: 16
                    }}
                  >
                    <p style={{ margin: 0, opacity: 0.75 }}>
                      Estimated Commission
                    </p>
                    <h2 style={{ marginBottom: 0 }}>$0</h2>
                  </div>
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