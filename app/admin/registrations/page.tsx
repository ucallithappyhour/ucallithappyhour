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

export default function AdminRegistrationsPage() {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [message, setMessage] = useState("");

  async function loadRegistrations() {
    const { data, error } = await supabase
      .from("artist_registrations")
      .select("*")
      .eq("status", "pending")
      .order("id", { ascending: false });

    if (error) {
      setMessage("Could not load registrations.");
      return;
    }

    setRegistrations(data || []);
  }

  async function approve(reg: Registration) {
    setMessage("");

    const slug = makeSlug(reg.artist_name);

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
      is_active: true
    });

    if (artistError) {
      setMessage("Could not create artist: " + artistError.message);
      return;
    }

    const { error: registrationError } = await supabase
      .from("artist_registrations")
      .update({ status: "approved" })
      .eq("id", reg.id);

    if (registrationError) {
      setMessage(
        "Artist was created, but registration could not be marked approved."
      );
      return;
    }

    setMessage(`Artist approved and created: /${slug}`);
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
            <h1 className="title">Pending Registrations</h1>

            {message && <div className="message">{message}</div>}

            {registrations.length === 0 ? (
              <div className="section">No pending registrations.</div>
            ) : (
              registrations.map((reg) => (
                <div key={reg.id} className="section">
                  <h2>{reg.artist_name}</h2>

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
                    <strong>Type:</strong> {reg.artist_type}
                  </p>

                  <p>
                    <strong>Generated URL:</strong> /{makeSlug(reg.artist_name)}
                  </p>

                  <button className="btn" onClick={() => approve(reg)}>
                    Approve & Create Artist
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </main>
  );
}