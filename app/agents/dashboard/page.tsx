"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../../lib/supabase";

export default function AgentDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [agent, setAgent] = useState<any>(null);

  useEffect(() => {
    async function load() {
      const {
        data: { user }
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/agents/login");
        return;
      }

      const { data, error } = await supabase
        .from("booking_agents")
        .select("*")
        .eq("auth_user_id", user.id)
        .single();

      if (error || !data) {
        router.push("/agents/login");
        return;
      }

      setAgent(data);
      setLoading(false);
    }

    load();
  }, [router]);

  if (loading) {
    return (
      <main className="page">
        <p style={{ color: "#fff", padding: 20 }}>Loading dashboard...</p>
      </main>
    );
  }

  return (
    <main className="page">
      <div className="overlay">
        <div className="container">
          <section
            className="accountCard"
            style={{ maxWidth: 900, margin: "0 auto" }}
          >
            <h1>{agent.agency_name} Dashboard</h1>

            <p>
              <strong>Referral Code:</strong> {agent.referral_code}
            </p>

            <p>
              <strong>Email:</strong> {agent.email}
            </p>

            <hr style={{ margin: "20px 0" }} />

            <h2>Referral Link</h2>

            <p style={{ wordBreak: "break-word" }}>
              https://www.ucallithappyhour.com/register?agent=
              {agent.referral_code}
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}