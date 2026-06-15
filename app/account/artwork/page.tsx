"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabase";

type Artist = {
  artist_slug: string;
  artist_name: string | null;
  logo_url: string | null;
};

export default function ArtworkPage() {
  const [artists, setArtists] = useState<Artist[]>([]);
  const [artistSlug, setArtistSlug] = useState("brian-quinn");
  const [logoUrl, setLogoUrl] = useState("");
  const [message, setMessage] = useState("");
  const [uploading, setUploading] = useState(false);
  const [dragging, setDragging] = useState(false);

  async function loadArtists() {
    const { data, error } = await supabase
      .from("artists")
      .select("artist_slug, artist_name, logo_url")
      .eq("is_active", true)
      .order("artist_name", { ascending: true });

    if (error) {
      setMessage("Could not load artists: " + error.message);
      return;
    }

    const loadedArtists = data || [];
    setArtists(loadedArtists);

    const selected =
      loadedArtists.find((artist) => artist.artist_slug === artistSlug) ||
      loadedArtists[0];

    if (selected) {
      setArtistSlug(selected.artist_slug);
      setLogoUrl(selected.logo_url || "");
    }
  }

  useEffect(() => {
    loadArtists();
  }, []);

  function handleArtistChange(slug: string) {
    setArtistSlug(slug);

    const selected = artists.find((artist) => artist.artist_slug === slug);
    setLogoUrl(selected?.logo_url || "");
    setMessage("");
  }

  async function saveArtwork() {
    const { error } = await supabase
      .from("artists")
      .update({
        logo_url: logoUrl.trim() || null
      })
      .eq("artist_slug", artistSlug);

    if (error) {
      setMessage("Could not save artwork: " + error.message);
      return;
    }

    setMessage("Artwork saved.");
    loadArtists();
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
    const filePath = `${artistSlug}/logo.${fileExt}`;

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
      .from("artists")
      .update({
        logo_url: publicUrl
      })
      .eq("artist_slug", artistSlug);

    setUploading(false);

    if (saveError) {
      setMessage("Logo uploaded, but could not save URL: " + saveError.message);
      return;
    }

    setMessage("Logo uploaded and saved.");
    loadArtists();
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
          <div className="hero">
            <h1 className="title">Artwork</h1>

            <p className="tagline">
              Manage the logo shown on artist pages.
            </p>

            {message && <div className="message">{message}</div>}

            <div className="section">
              <h2>Artist</h2>

              <select
                value={artistSlug}
                onChange={(e) => handleArtistChange(e.target.value)}
                style={{
                  width: "100%",
                  padding: 14,
                  borderRadius: 10,
                  marginBottom: 18
                }}
              >
                {artists.map((artist) => (
                  <option key={artist.artist_slug} value={artist.artist_slug}>
                    {artist.artist_name || artist.artist_slug}
                  </option>
                ))}
              </select>
            </div>

            <div className="section">
              <h2>Upload Logo</h2>

              <p className="details">
                Drop an image here or choose a file. This updates the artist
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
                  disabled={uploading}
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

              <button className="btn" onClick={saveArtwork}>
                Save Artwork
              </button>
            </div>

            <div className="section">
              <h2>Logo Preview</h2>

              {logoUrl ? (
                <img
                  src={logoUrl}
                  alt="Artist logo preview"
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
          </div>
        </div>
      </div>
    </main>
  );
}