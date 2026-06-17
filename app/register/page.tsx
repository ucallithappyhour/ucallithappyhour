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
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const requiredFieldsComplete =
    artistName.trim() !== "" &&
    contactName.trim() !== "" &&
    email.trim() !== "";

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ref = params.get("ref");

    if (ref) {
      setReferredBy(ref);
    }
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
          referredBy
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
          referredBy
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
            <div className="brand">U Call It Happy Hour</div>

            <h1 className="title">Become a U Call It Happy Hour Artist</h1>

            <p className="tagline">
              Turn your live shows into an interactive request experience.
            </p>

            <section className="accountCard" style={{ marginBottom: 24 }}>
              <h2>Artist Setup Includes</h2>

              <p style={{ fontSize: "1.1rem", fontWeight: 800, marginTop: 12 }}>
                Everything you need to launch.
              </p>

              <div
                style={{
                  marginTop: 18,
                  lineHeight: 1.9,
                  fontSize: 14,
                  fontWeight: 700
                }}
              >
                <div>✓ Personalized artist page for your fans</div>
                <div>✓ QR starter kit for tables, flyers, and signs</div>
                <div>✓ Fan song request dashboard</div>
                <div>✓ Future setlist insights</div>
                <div>✓ Venmo or Cash App tip integration</div>
                <div>✓ Ongoing platform updates and improvements</div>
              </div>

              <div className="details" style={{ marginTop: 20 }}>
                Your page gives fans one simple place to request songs, support
                you directly, and stay connected to your live shows.
              </div>
            </section>

            <section className="accountCard" style={{ marginBottom: 24 }}>
              <h2>Why Artists Use It</h2>

              <div
                style={{
                  marginTop: 16,
                  lineHeight: 1.9,
                  fontSize: 14,
                  fontWeight: 700
                }}
              >
                <div>✓ Engage your crowd in a new way</div>
                <div>✓ Discover what fans actually want to hear</div>
                <div>✓ Create a more memorable venue experience</div>
                <div>✓ Encourage repeat attendance</div>
                <div>✓ Increase tip opportunities</div>
              </div>

              <p style={{ marginTop: 18, fontStyle: "italic", opacity: 0.9 }}>
                One extra booking pays for itself.
              </p>
            </section>

            <section className="accountCard" style={{ marginBottom: 24 }}>
              <h2>Investment</h2>

              <p style={{ fontSize: "1.35rem", fontWeight: 900, marginTop: 12 }}>
                One-time artist setup fee: $99
              </p>

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
              <h2>Ready to Get Started?</h2>

              <p className="empty">
                Fill out the short form below. Artist name, contact name, and
                email are required. Notes are optional.
              </p>

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
                  🎵 Give $20, Get $20 Referral Program
                </h3>

                <p style={{ marginBottom: 10 }}>
                  Once your setup is complete, you{"'"}ll receive your own
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
                    : "Continue to Secure Checkout"}
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