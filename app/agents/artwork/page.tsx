"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../../lib/supabase";

type BookingAgent = {
  id: string;
  agency_name: string | null;
  contact_name: string | null;
  email: string | null;
  logo_url: string | null;
};

export default function AgentArtworkPage() {
  const router = useRouter();

  const [agent, setAgent] = useState<BookingAgent | null>(null);
  const [logoUrl, setLogoUrl] = useState("");
  const [message, setMessage] = useState("");
  const [uploading, setUploading] = useState(false);
  const [dragging, setDragging] = useState(false);

  async function loadAgent() {
    const {
      data: { user }
    } = await supabase.auth.getUser();

    if (!user) {
      router.push("/agents");
      return;
    }

    const { data, error } = await supabase
      .from("booking_agents")
      .select("id, agency_name, contact_name, email, logo_url")
      .eq("auth_user_id", user.id)
      .maybeSingle();

    if (error || !data) {
      setMessage("Could not find your agent account.");
      return;
    }

    setAgent(data);
    setLogoUrl(data.logo_url || "");
  }

  useEffect(() => {
    loadAgent();
  }, []);

  async function saveArtwork() {
    if (!agent) return;

    const { error } = await supabase
      .from("booking_agents")
      .update({
        logo_url: logoUrl.trim() || null
      })
      .eq("id", agent.id);

    if (error) {
      setMessage("Could not save logo: " + error.message);
      return;
    }

    setMessage("Logo saved.");
    loadAgent();
  }

  async function uploadLogo(file: File) {
    if (!agent) return;

    if (!file.type.startsWith("image/")) {
      setMessage("Please upload an image file.");
      return;
    }

    setUploading(true);
    setMessage("");

    const fileExt = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const filePath = `${agent.id}/logo.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from("artist-artwork")
      .upload(filePath, file, {
        upsert: true,
        contentType: file.type
      });

    if (uploadError) {
      setUploading(false);
      setMessage("Could not upload logo: " + uploadError.message);
      return;
    }

    const { data } = supabase.storage
      .from("artist-artwork")
      .getPublicUrl(filePath);

    const publicUrl = data.publicUrl;

    setLogoUrl(publicUrl);

    const { error: saveError } = await supabase
      .from("booking_agents")
      .update({
        logo_url: publicUrl
      })
      .eq("id", agent.id);

    setUploading(false);

    if (saveError) {
      setMessage("Logo uploaded, but could not save URL: " + saveError.message);
      return;
    }

    setMessage("Logo uploaded and saved.");
    loadAgent();
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) uploadLogo(file);
  }

  function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setDragging(false);

    const file = e.dataTransfer.files?.[0];
    if (file) uploadLogo(file);
  }

  return (
    <main className="page">
      <div className="overlay">
        <div className="container">
          <section
            className="accountCard"
            style={{ maxWidth: 900, margin: "0 auto" }}
          >
            <div className="brand">U CALL IT HAPPY HOUR</div>

            <h1 className="title">Agency Branding</h1>

            <p className="tagline">
              Upload the logo shown on your agent dashboard and future referral
              materials.
            </p>

            {message && <div className="message">{message}</div>}

            <div className="section">
              <h2>Agent Account</h2>

              <div
                style={{
                  padding: 14,
                  borderRadius: 10,
                  marginBottom: 18,
                  border: "1px solid rgba(255,255,255,0.2)",
                  background: "rgba(255,255,255,0.08)",
                  fontWeight: 800
                }}
              >
                {agent?.agency_name ||
                  agent?.contact_name ||
                  agent?.email ||
                  "Booking Agent"}
              </div>
            </div>

            <div className="section">
              <h2>Upload Logo</h2>

              <p className="details">
                Drop an image here or choose a file. This updates your agency
                logo automatically.
              </p>

              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragging(true);
                }}
                onDragLeave={() => setDragging(false)}
                onDrop={handleDrop}
                style={{
                  border: dragging ? "2px solid #ffd166" : "2px dashed #555",
                  borderRadius: 14,
                  padding: 28,
                  textAlign: "center",
                  marginBottom: 18,
                  background: dragging ? "rgba(255, 209, 102, 0.12)" : "#111"
                }}
              >
                <p style={{ marginBottom: 14 }}>
                  {uploading ? "Uploading logo..." : "Drag and drop logo here"}
                </p>

                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  disabled={uploading || !agent}
                />
              </div>

              <h2>Logo URL</h2>

              <input
                value={logoUrl}
                onChange={(e) => setLogoUrl(e.target.value)}
                placeholder="https://example.com/logo.jpg"
                style={{
                  width: "100%",
                  padding: 14,
                  borderRadius: 10,
                  marginBottom: 18
                }}
              />

              <button className="btn" onClick={saveArtwork} disabled={!agent}>
                Save Logo
              </button>
            </div>

            <div className="section">
              <h2>Logo Preview</h2>

              {logoUrl ? (
                <img
                  src={logoUrl}
                  alt="Agency logo preview"
                  style={{
                    maxWidth: 260,
                    maxHeight: 220,
                    objectFit: "contain",
                    background: "#111",
                    border: "1px solid #333",
                    borderRadius: 12,
                    padding: 12
                  }}
                />
              ) : (
                <p className="empty">No logo set yet.</p>
              )}
            </div>

            <div className="actions" style={{ marginTop: 24 }}>
              <Link className="btn" href="/agents/dashboard">
                Back to Agent Dashboard
              </Link>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}