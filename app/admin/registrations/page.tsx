"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabase";

type Registration = {
  id: number;
  artist_name: string;
  contact_name: string;
  email: string;
  phone: string | null;
  artist_type: string | null;
  notes: string | null;
  referred_by: string | null;
  setup_fee: number | null;
  status: string;
};

function makeSlug(name: string) {
  return name
    .toLowerCase()
    .trim()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function makeReferralCode(name: string) {
  const base = name
    .toUpperCase()
    .trim()
    .replace(/&/g, "AND")
    .replace(/[^A-Z0-9]+/g, "")
    .slice(0, 10);

  return `${base || "ARTIST"}20`;
}

export default function AdminRegistrationsPage() {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [message, setMessage] = useState("");

  async function loadRegistrations() {
    const { data, error } = await supabase
      .from("artist_registrations")
      .select("*")
      .order("id", { ascending: false });

    if (error) {
      setMessage("Could not load registrations.");
      return;
    }

    setRegistrations(data || []);
  }

  async function createArtistPage(reg: Registration) {
    setMessage("");

    const slug = makeSlug(reg.artist_name);
    const referralCode = makeReferralCode(reg.artist_name);

    const { data: existingArtist, error: checkError } = await supabase
      .from("artists")
      .select("artist_slug")
      .eq("artist_slug", slug)
      .maybeSingle();

    if (checkError) {
      setMessage("Could not check existing artists.");
      return;
    }

    if (existingArtist) {
      setMessage("An artist with this slug already exists.");
      return;
    }

    const { error: artistError } = await supabase.from("artists").insert({
      artist_slug: slug,
      artist_name: reg.artist_name,
      genres: reg.artist_type || null,
      bio: null,
      tip_type: null,
      tip_link: null,
      logo_url: null,
      is_active: true,
      referral_code: referralCode,
      referral_count: 0,
      referral_earnings: 0
    });

    if (artistError) {
      setMessage("Could not create artist: " + artistError.message);
      return;
    }

    const { error: registrationError } = await supabase
      .from("artist_registrations")
      .update({ status: "artist_created" })
      .eq("id", reg.id);

    if (registrationError) {
      setMessage(
        "Artist was created, but registration could not be marked artist_created."
      );
      return;
    }

    setMessage(`Artist page created: /${slug}`);
    loadRegistrations();
  }

  useEffect(() => {
    loadRegistrations();
  }, []);

  return (
    <main className="page">
      <div className="overlay">
        <div className="container">
          <div className="hero">
            <h1 className="title">Artist Registrations</h1>

            <p className="tagline">
              Track artist signups, payment status, referrals, and artist page
              creation.
            </p>

            {message && <div className="message">{message}</div>}

            {registrations.length === 0 ? (
              <div className="section">No artist registrations found.</div>
            ) : (
              registrations.map((reg) => {
                const slug = makeSlug(reg.artist_name);
                const referralCode = makeReferralCode(reg.artist_name);

                return (
                  <div key={reg.id} className="section">
                    <h2>{reg.artist_name}</h2>

                    <p>
                      <strong>Status:</strong> {reg.status || "unknown"}
                    </p>

                    <p>
                      <strong>Contact:</strong> {reg.contact_name}
                    </p>

                    <p>
                      <strong>Email:</strong> {reg.email}
                    </p>

                    <p>
                      <strong>Phone:</strong> {reg.phone || "-"}
                    </p>

                    <p>
                      <strong>Type:</strong> {reg.artist_type || "-"}
                    </p>

                    <p>
                      <strong>Setup Fee:</strong> ${reg.setup_fee || 99}
                    </p>

                    <p>
                      <strong>Referred By:</strong> {reg.referred_by || "None"}
                    </p>

                    <p>
                      <strong>Referral Code To Assign:</strong> {referralCode}
                    </p>

                    {reg.notes && (
                      <p>
                        <strong>Notes:</strong> {reg.notes}
                      </p>
                    )}

                    <p>
                      <strong>Artist URL:</strong> /{slug}
                    </p>

                    {reg.status === "artist_created" ? (
                      <p style={{ fontWeight: 800 }}>
                        Artist page already created.
                      </p>
                    ) : (
                      <button
                        className="btn"
                        onClick={() => createArtistPage(reg)}
                      >
                        Create Artist Page
                      </button>
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