"use client";

import { useEffect, useMemo, useState } from "react";
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
  email: string;
  status: string | null;
  setup_fee: number | null;
  referring_agent: string | null;
  created_at: string | null;
};

function formatDate(value?: string | null) {
  if (!value) return "-";
  return new Date(value).toLocaleDateString();
}

export default function AdminAgentsPage() {
  const [agents, setAgents] = useState<BookingAgent[]>([]);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [message, setMessage] = useState("");

  async function loadAgents() {
    const { data, error } = await supabase
      .from("booking_agents")
      .select("*")
      .order("id", { ascending: false });

    if (error) {
      setMessage("Could not load booking agents: " + error.message);
      return;
    }

    setAgents(data || []);
  }

  async function loadRegistrations() {
    const { data, error } = await supabase
      .from("artist_registrations")
      .select("id, artist_name, email, status, setup_fee, referring_agent, created_at")
      .not("referring_agent", "is", null)
      .order("id", { ascending: false });

    if (error) {
      setMessage("Could not load agent referrals: " + error.message);
      return;
    }

    setRegistrations(data || []);
  }

  useEffect(() => {
    loadAgents();
    loadRegistrations();
  }, []);

  const totalAgentReferrals = registrations.length;
  const totalCommissionOwed = totalAgentReferrals * 25;

  const activeAgents = useMemo(
    () => agents.filter((agent) => agent.referral_code),
    [agents]
  );

  function getReferralsForAgent(code: string | null) {
    if (!code) return [];
    return registrations.filter((reg) => reg.referring_agent === code);
  }

  function copyText(text: string) {
    navigator.clipboard.writeText(text);
    setMessage("Copied.");
  }

  return (
    <main className="page">
      <div className="overlay">
        <div className="container">
          <div className="hero">
            <h1 className="title">Booking Agents</h1>

            <p className="tagline">
              Track agent referral links, referred artists, and commissions owed.
            </p>

            {message && <div className="message">{message}</div>}

            <div
              className="section"
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                gap: 14
              }}
            >
              <div>
                <h3>Total Agents</h3>
                <p style={{ fontSize: 28, fontWeight: 900 }}>{agents.length}</p>
              </div>

              <div>
                <h3>Active Agent Codes</h3>
                <p style={{ fontSize: 28, fontWeight: 900 }}>
                  {activeAgents.length}
                </p>
              </div>

              <div>
                <h3>Agent Referrals</h3>
                <p style={{ fontSize: 28, fontWeight: 900 }}>
                  {totalAgentReferrals}
                </p>
              </div>

              <div>
                <h3>Commission Owed</h3>
                <p style={{ fontSize: 28, fontWeight: 900 }}>
                  ${totalCommissionOwed}
                </p>
              </div>
            </div>

            {agents.length === 0 ? (
              <div className="section">No booking agents found.</div>
            ) : (
              agents.map((agent) => {
                const referrals = getReferralsForAgent(agent.referral_code);
                const referralUrl = agent.referral_code
                  ? `https://www.ucallithappyhour.com/register?agent=${agent.referral_code}`
                  : "";
                const commissionOwed = referrals.length * 25;

                return (
                  <div key={agent.id} className="section">
                    <h2>{agent.agency_name || "Unnamed Agency"}</h2>

                    <p>
                      <strong>Status:</strong> {agent.status || "pending"}
                    </p>
                    <p>
                      <strong>Contact:</strong> {agent.contact_name || "-"}
                    </p>
                    <p>
                      <strong>Email:</strong> {agent.email || "-"}
                    </p>
                    <p>
                      <strong>Phone:</strong> {agent.phone || "-"}
                    </p>
                    <p>
                      <strong>Artists Represented:</strong>{" "}
                      {agent.artist_count ?? "-"}
                    </p>
                    <p>
                      <strong>Created:</strong> {formatDate(agent.created_at)}
                    </p>
                    <p>
                      <strong>Referral Code:</strong>{" "}
                      {agent.referral_code || "-"}
                    </p>

                    {referralUrl && (
                      <>
                        <p style={{ wordBreak: "break-all" }}>
                          <strong>Referral Link:</strong> {referralUrl}
                        </p>

                        <button
                          className="btn"
                          type="button"
                          onClick={() => copyText(referralUrl)}
                        >
                          Copy Referral Link
                        </button>
                      </>
                    )}

                    <div style={{ marginTop: 18 }}>
                      <p>
                        <strong>Artists Referred:</strong> {referrals.length}
                      </p>
                      <p>
                        <strong>Commission Owed:</strong> ${commissionOwed}
                      </p>
                    </div>

                    {referrals.length > 0 && (
                      <div style={{ marginTop: 18 }}>
                        <h3>Referred Artists</h3>

                        {referrals.map((reg) => (
                          <div
                            key={reg.id}
                            style={{
                              borderTop: "1px solid rgba(255,255,255,0.2)",
                              paddingTop: 12,
                              marginTop: 12
                            }}
                          >
                            <p>
                              <strong>{reg.artist_name}</strong>
                            </p>
                            <p>Email: {reg.email}</p>
                            <p>Status: {reg.status || "unknown"}</p>
                            <p>Setup Fee: ${reg.setup_fee || 74}</p>
                            <p>Registered: {formatDate(reg.created_at)}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </main>
  );
}