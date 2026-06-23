"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { supabase } from "../../../lib/supabase";

type BookingAgent = {
  id: number;
  agency_name: string | null;
  contact_name: string | null;
  email: string | null;
  phone: string | null;
  artist_count: number | null;
  referral_code: string | null;
  status: string | null;
  created_at: string | null;
};

type Registration = {
  id: number;
  artist_name: string;
  contact_name: string | null;
  email: string;
  status: string | null;
  setup_fee: number | null;
  referring_agent: string | null;
  artist_slug?: string | null;
  created_at: string | null;
};

function formatDate(value?: string | null) {
  if (!value) return "-";
  return new Date(value).toLocaleDateString();
}

function makeSlug(name: string) {
  return name
    .toLowerCase()
    .trim()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export default function AgentDashboardPage() {
  const params = useParams();
  const agentCode = String(params.agentCode || "").toUpperCase();

  const [agent, setAgent] = useState<BookingAgent | null>(null);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const referralUrl = agentCode
    ? `https://www.ucallithappyhour.com/register?agent=${agentCode}`
    : "";

  const qrUrl = `https://quickchart.io/qr?text=${encodeURIComponent(
    referralUrl
  )}&size=900&margin=2&centerImageUrl=${encodeURIComponent(
    "https://www.ucallithappyhour.com/ucallit-logo.png.png"
  )}`;

  const completedRegistrations = useMemo(
    () =>
      registrations.filter(
        (reg) => reg.status === "paid" || reg.status === "artist_created"
      ),
    [registrations]
  );

  const pendingRegistrations = useMemo(
    () =>
      registrations.filter(
        (reg) => reg.status !== "paid" && reg.status !== "artist_created"
      ),
    [registrations]
  );

  const commissionOwed = completedRegistrations.length * 25;
  const potentialCommission = registrations.length * 25;

  async function loadDashboard() {
    setLoading(true);
    setMessage("");

    const { data: agentData, error: agentError } = await supabase
      .from("booking_agents")
      .select("*")
      .eq("referral_code", agentCode)
      .maybeSingle();

    if (agentError) {
      setMessage("Could not load agent dashboard.");
      setLoading(false);
      return;
    }

    setAgent(agentData || null);

    const { data: referralData, error: referralError } = await supabase
      .from("artist_registrations")
      .select(
        "id, artist_name, contact_name, email, status, setup_fee, referring_agent, artist_slug, created_at"
      )
      .eq("referring_agent", agentCode)
      .order("id", { ascending: false });

    if (referralError) {
      setMessage("Could not load referred artists.");
      setLoading(false);
      return;
    }

    setRegistrations(referralData || []);
    setLoading(false);
  }

  async function copyReferralUrl() {
    if (!referralUrl) return;
    await navigator.clipboard.writeText(referralUrl);
    setMessage("Referral link copied.");
  }

  async function copyDashboardUrl() {
    const dashboardUrl = `https://www.ucallithappyhour.com/agents/${agentCode}`;
    await navigator.clipboard.writeText(dashboardUrl);
    setMessage("Dashboard link copied.");
  }

  useEffect(() => {
    if (agentCode) loadDashboard();
  }, [agentCode]);

  if (loading) {
    return (
      <main className="page">
        <div className="overlay">
          <div className="container">
            <section className="accountCard">
              <h1 className="title">Loading Agent Dashboard...</h1>
            </section>
          </div>
        </div>
      </main>
    );
  }

  if (!agent) {
    return (
      <main className="page">
        <div className="overlay">
          <div className="container">
            <section className="accountCard">
              <h1 className="title">Agent Dashboard Not Found</h1>
              <p>
                We could not find an agent dashboard for referral code{" "}
                <strong>{agentCode}</strong>.
              </p>

              <Link className="btn" href="/agents/register">
                Request an Agent Link
              </Link>
            </section>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="page">
      <div className="overlay">
        <div className="container">
          <section
            className="accountCard"
            style={{ maxWidth: 980, margin: "0 auto" }}
          >
            <div className="brand">U CALL IT HAPPY HOUR</div>

            <h1 className="title">
              {agent.agency_name || "Agent"} Dashboard
            </h1>

            <p className="tagline">
              Track your referral link, referred artists, signup status, and
              estimated commissions.
            </p>

            {message && <div className="message">{message}</div>}

            <div
              style={{
                background: "#181818",
                border: "1px solid #333",
                borderRadius: 14,
                padding: 20,
                marginTop: 24
              }}
            >
              <h2>Your Referral Link</h2>

              <p style={{ wordBreak: "break-all", lineHeight: 1.6 }}>
                {referralUrl}
              </p>

              <button className="btn" type="button" onClick={copyReferralUrl}>
                Copy Referral Link
              </button>

              <button
                className="btn secondary"
                type="button"
                onClick={copyDashboardUrl}
                style={{ marginLeft: 10 }}
              >
                Copy Dashboard Link
              </button>

              <div
                style={{
                  marginTop: 24,
                  textAlign: "center",
                  background: "#111",
                  border: "1px solid #333",
                  borderRadius: 14,
                  padding: 20
                }}
              >
                <h3 style={{ marginTop: 0 }}>Agent Referral QR Code</h3>

                <img
                  src={qrUrl}
                  alt="Agent Referral QR"
                  width="260"
                  height="260"
                  style={{
                    background: "#fff",
                    padding: 14,
                    borderRadius: 16,
                    maxWidth: "100%",
                    height: "auto"
                  }}
                />

                <p
                  style={{
                    marginTop: 12,
                    opacity: 0.85
                  }}
                >
                  Scan to register with your referral discount.
                </p>

                <a
                  href={qrUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="btn"
                >
                  Download QR Code
                </a>
              </div>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                gap: 14,
                marginTop: 24
              }}
            >
              <div className="section">
                <h3>Artists Referred</h3>
                <p style={{ fontSize: 30, fontWeight: 900 }}>
                  {registrations.length}
                </p>
              </div>

              <div className="section">
                <h3>Completed</h3>
                <p style={{ fontSize: 30, fontWeight: 900 }}>
                  {completedRegistrations.length}
                </p>
              </div>

              <div className="section">
                <h3>Pending</h3>
                <p style={{ fontSize: 30, fontWeight: 900 }}>
                  {pendingRegistrations.length}
                </p>
              </div>

              <div className="section">
                <h3>Commission Owed</h3>
                <p style={{ fontSize: 30, fontWeight: 900 }}>
                  ${commissionOwed}
                </p>
              </div>
            </div>

            <div className="section">
              <h2>Commission Summary</h2>

              <p>
                <strong>$25</strong> is earned for every referred artist who
                completes setup.
              </p>

              <p>
                <strong>Confirmed commission:</strong> ${commissionOwed}
              </p>

              <p>
                <strong>Potential commission if all pending artists complete:</strong>{" "}
                ${potentialCommission}
              </p>
            </div>

            <div className="section">
              <h2>Referred Artists</h2>

              {registrations.length === 0 ? (
                <p className="empty">
                  No referred artists yet. Share your referral link to get
                  started.
                </p>
              ) : (
                registrations.map((reg) => {
                  const completed =
                    reg.status === "paid" || reg.status === "artist_created";

                  const artistSlug = reg.artist_slug || makeSlug(reg.artist_name);
                  const artistUrl = `https://www.ucallithappyhour.com/${artistSlug}`;

                  return (
                    <div
                      key={reg.id}
                      style={{
                        borderTop: "1px solid rgba(255,255,255,0.18)",
                        paddingTop: 14,
                        marginTop: 14
                      }}
                    >
                      <h3 style={{ marginBottom: 8 }}>{reg.artist_name}</h3>

                      <p>
                        <strong>Status:</strong>{" "}
                        {completed ? "Completed" : reg.status || "Pending"}
                      </p>

                      <p>
                        <strong>Contact:</strong> {reg.contact_name || "-"}
                      </p>

                      <p>
                        <strong>Email:</strong> {reg.email}
                      </p>

                      <p>
                        <strong>Artist Setup Fee:</strong> ${reg.setup_fee || 74}
                      </p>

                      <p>
                        <strong>Referral Discount:</strong> $25 off regular $99
                        setup
                      </p>

                      <p>
                        <strong>Agent Commission:</strong>{" "}
                        {completed ? "$25 earned" : "$25 pending"}
                      </p>

                      <p>
                        <strong>Registered:</strong> {formatDate(reg.created_at)}
                      </p>

                      {completed && (
                        <p style={{ marginTop: 12 }}>
                          <a
                            href={artistUrl}
                            target="_blank"
                            rel="noreferrer"
                            style={{
                              color: "#ffd84d",
                              fontWeight: 800
                            }}
                          >
                            View Artist Page →
                          </a>
                        </p>
                      )}
                    </div>
                  );
                })
              )}
            </div>

            <div style={{ marginTop: 24 }}>
              <Link href="/agents" style={{ color: "#ffd84d", fontWeight: 800 }}>
                ← Back to Agent Portal
              </Link>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}