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
      setMessage("Could not submit registration. The registration table may need to be created in Supabase.");
      setLoading(false);
      return;
    }

    setArtistName("");
    setContactName("");
    setEmail("");
    setPhone("");
    setArtistType("Solo Artist");
    setNotes("");
    setMessage("Registration received. We'll contact you to complete setup and payment.");
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
              <h2>Artist Registration</h2>

              <p className="empty">
                One-time setup fee: <strong>$99</strong>
              </p>

              <p>
                Includes your personalized artist page, request dashboard, QR code setup,
                tip integration, future request collection, and a starter kit with bar
                signs/table QR materials.
              </p>
            </section>

            {message && <div className="message">{message}</div>}

            <section className="accountCard" style={{ maxWidth: 620, margin: "0 auto" }}>
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

              <button className="btn" type="button" onClick={submitRegistration} disabled={loading}>
                {loading ? "Submitting..." : "Apply Now - $99 Setup"}
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