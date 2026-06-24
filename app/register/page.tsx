"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function RegisterPage() {
  const [artistName, setArtistName] = useState("");
  const [contactName, setContactName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [artistType, setArtistType] = useState("Solo Artist");
  const [notes, setNotes] = useState("");
  const [referredBy, setReferredBy] = useState("");
  const [referringAgent, setReferringAgent] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const hasArtistReferral = referredBy.trim() !== "";
  const hasAgentReferral = referringAgent.trim() !== "";

  const setupFee = hasAgentReferral ? 74 : hasArtistReferral ? 79 : 99;
  const savings = hasAgentReferral ? 25 : hasArtistReferral ? 20 : 0;

  const requiredFieldsComplete =
    artistName.trim() !== "" &&
    contactName.trim() !== "" &&
    email.trim() !== "";

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ref = params.get("ref");
    const agent = params.get("agent");

    if (ref) setReferredBy(ref);
    if (agent) setReferringAgent(agent);
  }, []);

  async function submitRegistration() {
    setMessage("");

    if (!requiredFieldsComplete) {
      setMessage("Artist name, contact name, and email are required.");
      return;
    }

    setLoading(true);

    try {
      const registrationResponse = await fetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          artistName,
          contactName,
          email,
          phone,
          artistType,
          notes,
          referredBy,
          referringAgent
        })
      });

      const registrationResult = await registrationResponse.json();

      if (!registrationResponse.ok) {
        setMessage(registrationResult.error || "Could not submit registration.");
        setLoading(false);
        return;
      }

      const checkoutResponse = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          registrationId: registrationResult.registrationId,
          artistName,
          email,
          referredBy,
          referringAgent
        })
      });

      const checkoutResult = await checkoutResponse.json();

      if (!checkoutResponse.ok || !checkoutResult.url) {
        setMessage(
          checkoutResult.error ||
            "Registration saved, but Stripe checkout could not open. Please try again."
        );
        setLoading(false);
        return;
      }

      window.location.href = checkoutResult.url;
    } catch (error) {
      console.error(error);
      setMessage("Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  return (
    <main className="page">
      <div className="overlay">
        <div className="container">
          <div className="hero">
            
            <h1 className="title">Turn Your Crowd Into Part of the Show</h1>

<p className="tagline">
  Give fans a way to request songs, support you directly, and stay connected
  after the music stops.
</p>

<section className="accountCard" style={{ marginBottom: 24 }}>
  <h2 style={{ color: "#ffd84d" }}>What You Get</h2>

  <div
    style={{
      display: "grid",
      gap: 14,
      marginTop: 18
    }}
  >
    <div>
      <strong>🎵 Personalized Artist Page</strong>
      <p className="details">A simple page your fans can open from any phone.</p>
    </div>

    <div>
      <strong>📚 Searchable Song Library</strong>
      <p className="details">
        Upload and manage your live performance catalog in minutes.
      </p>
    </div>

    <div>
      <strong>📱 QR Marketing Kit</strong>
      <p className="details">
        Table tents, flyers, social graphics, and QR codes included.
      </p>
    </div>

    <div>
      <strong>💵 Tip Integration</strong>
      <p className="details">
        Connect Venmo or Cash App and collect more tips.
      </p>
    </div>

    <div>
      <strong>📧 Fan Email Collection</strong>
      <p className="details">
        Build your audience list automatically as fans interact with your page.
      </p>
    </div>

    <div>
      <strong>🎤 Live Request Dashboard</strong>
      <p className="details">
        Receive song requests in real time during your performances.
      </p>
    </div>

    <div>
      <strong>📊 Audience Insights</strong>
      <p className="details">
        See what fans request most and discover future setlist opportunities.
      </p>
    </div>
  </div>
</section>

<section className="accountCard" style={{ marginBottom: 24 }}>
  <h2 style={{ color: "#ffd84d" }}>Why Artists Use It</h2>

  <div
    style={{
      display: "grid",
      gap: 10,
      marginTop: 16,
      fontWeight: 800
    }}
  >
    <div>✓ Let fans request songs directly from their phones</div>
    <div>✓ Build your fan email list automatically</div>
    <div>✓ Create a searchable song catalog for every show</div>
    <div>✓ Increase tips with one-click payment links</div>
    <div>✓ Discover what your audience actually wants to hear</div>
    <div>✓ Give venues a more interactive experience</div>
    <div>✓ Encourage repeat attendance and future bookings</div>
  </div>

  <p style={{ marginTop: 18, fontStyle: "italic", opacity: 0.9 }}>
    One extra booking pays for itself.
  </p>
</section>
<section className="accountCard" style={{ marginBottom: 24 }}>
  <h2 style={{ color: "#ffd84d" }}>Investment</h2>
              {hasAgentReferral || hasArtistReferral ? (
                <>
                  <p
                    style={{
                      color: "#4ade80",
                      fontWeight: 800,
                      marginTop: 12
                    }}
                  >
                    🎉{" "}
                    {hasAgentReferral
                      ? "Booking agent referral applied"
                      : "Artist referral applied"}
                  </p>

                  <p
                    style={{
                      fontSize: "1.35rem",
                      fontWeight: 900,
                      marginTop: 8
                    }}
                  >
                    One-time artist setup fee:{" "}
                    <span style={{ textDecoration: "line-through", opacity: 0.65 }}>
                      $99
                    </span>{" "}
                    ${setupFee}
                  </p>

                  <p style={{ color: "#4ade80", marginTop: 8 }}>
                    You save ${savings} today.
                  </p>

                  <p style={{ marginTop: 8, opacity: 0.85 }}>
                    Referral code:{" "}
                    <strong>
                      {hasAgentReferral ? referringAgent : referredBy}
                    </strong>
                  </p>
                </>
              ) : (
                <p
                  style={{
                    fontSize: "1.35rem",
                    fontWeight: 900,
                    marginTop: 12
                  }}
                >
                  One-time artist setup fee: $99
                </p>
              )}

              <p style={{ marginTop: 12, lineHeight: 1.7 }}>
                This covers your personalized artist page, request dashboard, QR
                setup, tip integration, and starter materials to help fans start
                using it at your shows.
              </p>
            </section>

            <section
              className="accountCard"
              style={{ maxWidth: 620, margin: "0 auto" }}
            >
              <h2 style={{ color: "#ffd84d" }}>Ready to Get Started?</h2>

              <p className="empty">
                Fill out the short form below. Artist name, contact name, and
                email are required. Notes are optional.
              </p>

              {(hasAgentReferral || hasArtistReferral) && (
                <div
                  style={{
                    marginTop: 18,
                    marginBottom: 18,
                    padding: 16,
                    border: "1px solid rgba(74,222,128,0.45)",
                    borderRadius: 12,
                    background: "rgba(74,222,128,0.1)"
                  }}
                >
                  <strong>Referral discount applied.</strong>
                  <br />
                  You save ${savings} today. Your setup fee will be ${setupFee}.
                </div>
              )}

              <label>Artist / Band Name</label>
              <input
                value={artistName}
                onChange={(e) => setArtistName(e.target.value)}
                placeholder="Artist or band name"
                disabled={loading}
              />

              <label>Contact Name</label>
              <input
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
                placeholder="Your name"
                disabled={loading}
              />

              <label>Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email address"
                disabled={loading}
              />

              <label>Phone</label>
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Phone number"
                disabled={loading}
              />

              <label>Artist Type</label>
              <select
                value={artistType}
                onChange={(e) => setArtistType(e.target.value)}
                disabled={loading}
              >
                <option>Solo Artist</option>
                <option>Duo</option>
                <option>Band</option>
                <option>DJ</option>
                <option>Other</option>
              </select>

              <label>Notes</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Tell us where you play, how often you gig, or anything else we should know."
                disabled={loading}
              />

              <div
                style={{
                  marginTop: 30,
                  marginBottom: 30,
                  padding: 20,
                  border: "1px solid rgba(212,175,55,0.35)",
                  borderRadius: 12,
                  background: "rgba(212,175,55,0.08)"
                }}
              >
                <h3 style={{ marginBottom: 10 }}>
                  💰 Give $20, Get $20 Referral Program
                </h3>

                <p style={{ marginBottom: 10 }}>
                  Once your setup is complete, you&apos;ll receive your own
                  referral link.
                </p>

                <p style={{ marginBottom: 10 }}>
                  <strong>You earn $20</strong> every time an artist you refer
                  completes setup.
                </p>

                <p style={{ marginBottom: 0 }}>
                  <strong>They save $20</strong> on their setup fee when they
                  use your link.
                </p>
              </div>

              {message && (
                <div className="message" style={{ marginBottom: 20 }}>
                  <p>{message}</p>
                </div>
              )}

              {requiredFieldsComplete ? (
                <button
                  className="btn"
                  type="button"
                  onClick={submitRegistration}
                  disabled={loading}
                >
                  {loading
                    ? "Preparing Secure Checkout..."
                    : `Continue to Secure Checkout - $${setupFee}`}
                </button>
              ) : (
                <p style={{ marginTop: 14, opacity: 0.75, fontSize: 13 }}>
                  Enter artist name, contact name, and email to continue.
                </p>
              )}

              <div className="actions" style={{ marginTop: 20 }}>
                <Link className="btn secondary" href="/account">
                  Already registered? Log In
                </Link>
              </div>
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}