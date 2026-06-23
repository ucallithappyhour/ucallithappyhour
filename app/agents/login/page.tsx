"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../../lib/supabase";

export default function AgentLoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg("");
    setLoading(true);

    const { data, error: loginError } =
      await supabase.auth.signInWithPassword({
        email,
        password
      });

    setLoading(false);

    if (loginError) {
      setErrorMsg(loginError.message);
      return;
    }

    if (!data?.user) {
      setErrorMsg("Login failed. Please try again.");
      return;
    }

    // optional safety check (future-proofing hybrid setup)
    const { data: agent } = await supabase
      .from("booking_agents")
      .select("id")
      .eq("auth_user_id", data.user.id)
      .single();

    if (!agent) {
      setErrorMsg(
        "No agent profile linked to this account. Contact admin."
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
            style={{ maxWidth: 520, margin: "0 auto" }}
          >
            <h1>Agent Login</h1>

            <form onSubmit={handleLogin}>
              <input
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{
                  width: "100%",
                  padding: 12,
                  marginBottom: 10
                }}
              />

              <input
                placeholder="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{
                  width: "100%",
                  padding: 12,
                  marginBottom: 10
                }}
              />

              <button
                disabled={loading}
                style={{
                  width: "100%",
                  padding: 12,
                  background: "#ffd84d",
                  fontWeight: "bold",
                  border: 0,
                  cursor: "pointer"
                }}
              >
                {loading ? "Logging in..." : "Login"}
              </button>

              {errorMsg && (
                <p style={{ color: "red", marginTop: 10 }}>
                  {errorMsg}
                </p>
              )}
            </form>
          </section>
        </div>
      </div>
    </main>
  );
}