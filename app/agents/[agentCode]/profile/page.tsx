"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { supabase } from "../../../../lib/supabase";

type BookingAgent = {
  id: number;
  agency_name: string | null;
  contact_name: string | null;
  email: string | null;
  phone: string | null;
  artist_count: number | null;
  referral_code: string | null;
  logo_url: string | null;
  website: string | null;
  facebook: string | null;
  instagram: string | null;
  bio: string | null;
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "12px",
  marginTop: 6,
  marginBottom: 14,
  borderRadius: 8,
  border: "1px solid #ccc",
  background: "#fff",
  color: "#111",
  fontSize: 16,
  boxSizing: "border-box"
};

const labelStyle: React.CSSProperties = {
  display: "block",
  fontWeight: "bold",
  marginTop: 12,
  color: "#111"
};

export default function AgentProfilePage() {
  const params = useParams();
  const agentCode = String(params.agentCode || "").toUpperCase();

  const [agent, setAgent] = useState<BookingAgent | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [dragging, setDragging] = useState(false);

  const [agencyName, setAgencyName] = useState("");
  const [contactName, setContactName] = useState("");
  const [website, setWebsite] = useState("");
  const [facebook, setFacebook] = useState("");
  const [instagram, setInstagram] = useState("");
  const [bio, setBio] = useState("");
  const [logoUrl, setLogoUrl] = useState("");

  const [message, setMessage] = useState("");

  async function loadAgent() {
    setLoading(true);
    setMessage("");

    const { data, error } = await supabase
      .from("booking_agents")
      .select("*")
      .eq("referral_code", agentCode)
      .maybeSingle();

    if (error || !data) {
      setMessage("Could not load agency profile.");
      setLoading(false);
      return;
    }

    setAgent(data);
    setAgencyName(data.agency_name || "");
    setContactName(data.contact_name || "");
    setWebsite(data.website || "");
    setFacebook(data.facebook || "");
    setInstagram(data.instagram || "");
    setBio(data.bio || "");
    setLogoUrl(data.logo_url || "");
    setLoading(false);
  }

  async function saveProfile() {
    if (!agent) return;

    setSaving(true);
    setMessage("");

    const { error } = await supabase
      .from("booking_agents")
      .update({
        agency_name: agencyName.trim() || null,
        contact_name: contactName.trim() || null,
        website: website.trim() || null,
        facebook: facebook.trim() || null,
        instagram: instagram.trim() || null,
        bio: bio.trim() || null,
        logo_url: logoUrl.trim() || null
      })
      .eq("id", agent.id);

    if (error) {
      setMessage("Could not save profile: " + error.message);
      setSaving(false);
      return;
    }

    setMessage("Agency profile saved.");
    setSaving(false);
    loadAgent();
  }

  async function uploadLogo(file: File) {
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setMessage("Please upload an image file.");
      return;
    }

    setUploading(true);
    setMessage("");

    const fileExt = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const filePath = `${agentCode}/logo.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from("agent-artwork")
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
      .from("agent-artwork")
      .getPublicUrl(filePath);

    const publicUrl = data.publicUrl;

    setLogoUrl(publicUrl);

    const { error: saveError } = await supabase
      .from("booking_agents")
      .update({
        logo_url: publicUrl
      })
      .eq("referral_code", agentCode);

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

  useEffect(() => {
    if (agentCode) loadAgent();
  }, [agentCode]);

  if (loading) {
    return (
      <main className="page">
        <div className="overlay">
          <div className="container">
            <section className="accountCard">
              <h1 className="title">Loading Agency Profile...</h1>
            </section>
          </div>
        </div>
      </main>
    );
  }

  if (!agent) {
    return (
      <main className="page">
        <div className="overlay">
          <div className="container">
            <section className="accountCard">
              <h1 className="title">Agency Profile Not Found</h1>
              <Link className="btn" href="/agents">
                Back to Agent Portal
              </Link>
            </section>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="page">
      <div className="overlay">
        <div className="container">
          <section
            className="accountCard"
            style={{ maxWidth: 760, margin: "0 auto" }}
          >
            <div className="brand">U CALL IT HAPPY HOUR</div>

            <h1 className="title">Edit Agency Profile</h1>

            <p className="tagline">
              Customize your agency profile and referral materials.
            </p>

            {message && <div className="message">{message}</div>}

            <div
              style={{
                background: "#fff",
                color: "#111",
                borderRadius: 16,
                padding: 24,
                marginTop: 24
              }}
            >
              {logoUrl && (
                <div style={{ textAlign: "center", marginBottom: 20 }}>
                  <img
                    src={logoUrl}
                    alt="Agency Logo"
                    style={{
                      maxWidth: 180,
                      maxHeight: 120,
                      objectFit: "contain"
                    }}
                  />
                </div>
              )}

              <h2 style={{ color: "#111", marginTop: 0 }}>Agency Logo</h2>

              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragging(true);
                }}
                onDragLeave={() => setDragging(false)}
                onDrop={handleDrop}
                style={{
                  border: dragging ? "2px solid #ffd84d" : "2px dashed #999",
                  borderRadius: 14,
                  padding: 28,
                  textAlign: "center",
                  marginBottom: 18,
                  background: dragging ? "#fff8d8" : "#fafafa"
                }}
              >
                <p style={{ color: "#111", marginBottom: 14 }}>
                  {uploading ? "Uploading logo..." : "Drag and drop logo here"}
                </p>

                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  disabled={uploading}
                  style={{ color: "#111" }}
                />
              </div>

              <label style={labelStyle}>Agency Name</label>
              <input
                style={inputStyle}
                value={agencyName}
                onChange={(e) => setAgencyName(e.target.value)}
                placeholder="ABC Entertainment"
              />

              <label style={labelStyle}>Contact Name</label>
              <input
                style={inputStyle}
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
                placeholder="John Smith"
              />

              <label style={labelStyle}>Website</label>
              <input
                style={inputStyle}
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                placeholder="https://agency.com"
              />

              <label style={labelStyle}>Facebook</label>
              <input
                style={inputStyle}
                value={facebook}
                onChange={(e) => setFacebook(e.target.value)}
                placeholder="https://facebook.com/..."
              />

              <label style={labelStyle}>Instagram</label>
              <input
                style={inputStyle}
                value={instagram}
                onChange={(e) => setInstagram(e.target.value)}
                placeholder="https://instagram.com/..."
              />

              <label style={labelStyle}>Agency Bio</label>
              <textarea
                style={{
                  ...inputStyle,
                  minHeight: 120,
                  resize: "vertical"
                }}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Tell artists about your agency, roster, markets served, or booking focus."
              />

              <button
                className="btn"
                type="button"
                onClick={saveProfile}
                disabled={saving || uploading}
                style={{ width: "100%", marginTop: 12 }}
              >
                {saving ? "Saving..." : "Save Agency Profile"}
              </button>
            </div>

            <div style={{ marginTop: 24 }}>
              <Link
                href={`/agents/${agentCode}`}
                style={{ color: "#ffd84d", fontWeight: 800 }}
              >
                ← Back to Dashboard
              </Link>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}