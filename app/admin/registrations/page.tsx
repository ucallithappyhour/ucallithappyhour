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

  async function approve(id: number) {
    const { error } = await supabase
      .from("artist_registrations")
      .update({ status: "approved" })
      .eq("id", id);

    if (error) {
      setMessage("Could not approve registration.");
      return;
    }

    setMessage("Artist approved.");
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

            {message && (
              <div className="message">{message}</div>
            )}

            {registrations.length === 0 ? (
              <div className="section">
                No pending registrations.
              </div>
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

                  <button
                    className="btn"
                    onClick={() => approve(reg.id)}
                  >
                    Approve
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