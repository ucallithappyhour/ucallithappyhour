"use client";

import Link from "next/link";
import { useState } from "react";
import { supabase } from "../../lib/supabase";

export default function RegisterPage() {
  const [artistName, setArtistName] = useState("");
  const [contactName, setContactName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [artistType, setArtistType] = useState("Solo Artist");
  const [notes, setNotes] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function submitRegistration() {
    setMessage("");

    if (!artistName || !contactName || !email) {
      setMessage("Artist name, contact name, and email are required.");
      return;
    }

    setLoading(true);

    const { error } = await supabase.from("artist_registrations").insert({
      artist_name: artistName,
      contact_name: contactName,
      email,
      phone,
      artist_type: artistType,
      notes,
      setup_fee: 99,
      status: "pending"
    });

    if (error) {
      setMessage(
        "Could not submit registration. The registration table may need to be created in Supabase."
      );
      setLoading(false);
      return;
    }

    setArtistName("");
    setContactName("");
    setEmail("");
    setPhone("");
    setArtistType("Solo Artist");
    setNotes("");
    setMessage(
      "Registration received. We'll contact you to complete setup and payment."
    );
    setLoading(false);
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

              <p
                style={{
                  fontSize: "1.1rem",
                  fontWeight: 800,
                  marginTop: 12
                }}
              >
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

              <p
                style={{
                  marginTop: 18,
                  fontStyle: "italic",
                  opacity: 0.9
                }}
              >
                One extra booking pays for itself.
              </p>
            </section>

            <section className="accountCard" style={{ marginBottom: 24 }}>
              <h2>Investment</h2>

              <p
                style={{
                  fontSize: "1.35rem",
                  fontWeight: 900,
                  marginTop: 12
                }}
              >
                One-time artist setup fee: $99
              </p>

              <p style={{ marginTop: 12, lineHeight: 1.7 }}>
                This covers your personalized artist page, request dashboard, QR
                setup, tip integration, and starter materials to help fans start
                using it at your shows.
              </p>
            </section>

            {message && <div className="message">{message}</div>}

            <section
              className="accountCard"
              style={{ maxWidth: 620, margin: "0 auto" }}
            >
              <h2>Ready to Get Started?</h2>

              <p className="empty">
                Fill out the short form below and we&apos;ll contact you to
                complete setup and payment.
              </p>

              <label>Artist / Band Name</label>
              <input
                value={artistName}
                onChange={(e) => setArtistName(e.target.value)}
                placeholder="Artist or band name"
              />

              <label>Contact Name</label>
              <input
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
                placeholder="Your name"
              />

              <label>Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email address"
              />

              <label>Phone</label>
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Phone number"
              />

              <label>Artist Type</label>
              <select
                value={artistType}
                onChange={(e) => setArtistType(e.target.value)}
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
              />

              <button
                className="btn"
                type="button"
                onClick={submitRegistration}
                disabled={loading}
              >
                {loading ? "Submitting..." : "Apply for Artist Setup"}
              </button>

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