"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

const ADMIN_EMAIL = "u.call.it.happy.hour@gmail.com";

type Registration = {
  id: number;
  artist_name: string;
  contact_name: string;
  email: string;
  phone: string | null;
  artist_type: string | null;
  notes: string | null;
  setup_fee: number;
  status: string;
  created_at: string;
};

export default function RegistrationsPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [message, setMessage] = useState("");

  async function loadRegistrations() {
    const { data, error } = await supabase
      .from("artist_registrations")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      setMessage("Could not load registrations.");
      return;
    }

    setRegistrations(data || []);
  }

  async function updateStatus(id: number, status: string) {
    const { error } = await supabase
      .from("artist_registrations")
      .update({ status })
      .eq("id", id);

    if (error) {
      setMessage(`Could not mark registration as ${status}.`);
      return;
    }

    setMessage(`Registration marked ${status}.`);
    loadRegistrations();
  }

  useEffect(() => {
    async function initialize() {
      const { data } = await supabase.auth.getUser();

      setUser(data.user);

      if (
        data.user?.email?.toLowerCase() !==
        ADMIN_EMAIL.toLowerCase()
      ) {
        setLoading(false);
        return;
      }

      await loadRegistrations();

      setLoading(false);
    }

    initialize();
  }, []);

  if (loading) {
    return (
      <main className="page">
        <div className="overlay">
          <div className="container">
            <div className="hero">
              <h1 className="title">Loading...</h1>
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (
    user?.email?.toLowerCase() !==
    ADMIN_EMAIL.toLowerCase()
  ) {
    return (
      <main className="page">
        <div className="overlay">
          <div className="container">
            <div className="hero">
              <h1 className="title">Access Denied</h1>

              <p className="tagline">
                This page is only available to administrators.
              </p>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="page">
      <div className="overlay">
        <div className="container">
          <div className="hero">
            <div className="brand">
              U Call It Happy Hour
            </div>

            <h1 className="title">
              Artist Registrations
            </h1>

            <p className="tagline">
              Review incoming artist setup requests.
            </p>

            {message && (
              <div className="message">
                {message}
              </div>
            )}

            {registrations.length === 0 ? (
              <div className="event-card">
                No registrations yet.
              </div>
            ) : (
              registrations.map((registration) => (
                <div
                  key={registration.id}
                  className="event-card"
                  style={{ marginBottom: 20 }}
                >
                  <p className="performer">
                    {registration.artist_name}
                  </p>

                  <div className="details">
                    Contact:{" "}
                    {registration.contact_name}
                  </div>

                  <div className="details">
                    Email: {registration.email}
                  </div>

                  <div className="details">
                    Phone:{" "}
                    {registration.phone || "N/A"}
                  </div>

                  <div className="details">
                    Type:{" "}
                    {registration.artist_type || "N/A"}
                  </div>

                  <div className="details">
                    Fee: $
                    {registration.setup_fee}
                  </div>

                  <div className="details">
                    Status:{" "}
                    <strong>
                      {registration.status}
                    </strong>
                  </div>

                  {registration.notes && (
                    <div
                      style={{
                        marginTop: 12
                      }}
                    >
                      <strong>Notes:</strong>
                      <br />
                      {registration.notes}
                    </div>
                  )}

                  <div
                    className="actions"
                    style={{
                      marginTop: 18
                    }}
                  >
                    <button
                      className="btn"
                      onClick={() =>
                        updateStatus(
                          registration.id,
                          "approved"
                        )
                      }
                    >
                      Approve
                    </button>

                    <button
                      className="btn secondary"
                      onClick={() =>
                        updateStatus(
                          registration.id,
                          "paid"
                        )
                      }
                    >
                      Mark Paid
                    </button>

                    <button
                      className="smallbtn"
                      onClick={() =>
                        updateStatus(
                          registration.id,
                          "declined"
                        )
                      }
                    >
                      Decline
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </main>
  );
}