"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabase";

type Artist = {
  artist_slug: string;
  artist_name: string | null;
  logo_url: string | null;
  hero_image_url: string | null;
};

type UploadKind = "logo" | "hero";

export default function ArtworkPage() {
  const [artists, setArtists] = useState<Artist[]>([]);
  const [artistSlug, setArtistSlug] = useState("brian-quinn");
  const [logoUrl, setLogoUrl] = useState("");
  const [heroImageUrl, setHeroImageUrl] = useState("");
  const [message, setMessage] = useState("");
  const [uploading, setUploading] = useState<UploadKind | "">("");
  const [dragging, setDragging] = useState<UploadKind | "">("");

  async function loadArtists() {
    const { data, error } = await supabase
      .from("artists")
      .select("artist_slug, artist_name, logo_url, hero_image_url")
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
      setHeroImageUrl(selected.hero_image_url || "");
    }
  }

  useEffect(() => {
    loadArtists();
  }, []);

  function handleArtistChange(slug: string) {
    setArtistSlug(slug);

    const selected = artists.find((artist) => artist.artist_slug === slug);
    setLogoUrl(selected?.logo_url || "");
    setHeroImageUrl(selected?.hero_image_url || "");
    setMessage("");
  }

  async function saveArtwork() {
    const { error } = await supabase
      .from("artists")
      .update({
        logo_url: logoUrl.trim() || null,
        hero_image_url: heroImageUrl.trim() || null
      })
      .eq("artist_slug", artistSlug);

    if (error) {
      setMessage("Could not save artwork: " + error.message);
      return;
    }

    setMessage("Artwork saved.");
    loadArtists();
  }

  async function uploadImage(file: File, kind: UploadKind) {
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setMessage("Please upload an image file.");
      return;
    }

    setUploading(kind);
    setMessage("");

    const fileExt = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const fileName = kind === "logo" ? "logo" : "hero";
    const filePath = `${artistSlug}/${fileName}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from("artist-artwork")
      .upload(filePath, file, {
        upsert: true,
        contentType: file.type
      });

    if (uploadError) {
      setUploading("");
      setMessage("Could not upload image: " + uploadError.message);
      return;
    }

    const { data } = supabase.storage
      .from("artist-artwork")
      .getPublicUrl(filePath);

    const publicUrl = data.publicUrl;

    const updateData =
      kind === "logo"
        ? { logo_url: publicUrl }
        : { hero_image_url: publicUrl };

    if (kind === "logo") {
      setLogoUrl(publicUrl);
    } else {
      setHeroImageUrl(publicUrl);
    }

    const { error: saveError } = await supabase
      .from("artists")
      .update(updateData)
      .eq("artist_slug", artistSlug);

    setUploading("");

    if (saveError) {
      setMessage("Image uploaded, but could not save URL: " + saveError.message);
      return;
    }

    setMessage(
      kind === "logo"
        ? "Logo uploaded and saved."
        : "Hero image uploaded and saved."
    );

    loadArtists();
  }

  function handleFileSelect(
    e: React.ChangeEvent<HTMLInputElement>,
    kind: UploadKind
  ) {
    const file = e.target.files?.[0];
    if (file) uploadImage(file, kind);
  }

  function handleDrop(e: React.DragEvent<HTMLDivElement>, kind: UploadKind) {
    e.preventDefault();
    setDragging("");

    const file = e.dataTransfer.files?.[0];
    if (file) uploadImage(file, kind);
  }

  return (
    <main className="page">
      <div className="overlay">
        <div className="container">
          <div className="hero">
            <h1 className="title">Artwork</h1>

            <p className="tagline">
              Manage the logo and hero image shown on artist pages.
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
                Drop an image here or choose a file. This updates the smaller
                artist logo.
              </p>

              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragging("logo");
                }}
                onDragLeave={() => setDragging("")}
                onDrop={(e) => handleDrop(e, "logo")}
                style={{
                  border:
                    dragging === "logo"
                      ? "2px solid #ffd166"
                      : "2px dashed #555",
                  borderRadius: 14,
                  padding: 28,
                  textAlign: "center",
                  marginBottom: 18,
                  background:
                    dragging === "logo"
                      ? "rgba(255, 209, 102, 0.12)"
                      : "#111"
                }}
              >
                <p style={{ marginBottom: 14 }}>
                  {uploading === "logo"
                    ? "Uploading logo..."
                    : "Drag and drop logo here"}
                </p>

                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileSelect(e, "logo")}
                  disabled={uploading !== ""}
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
            </div>

            <div className="section">
              <h2>Upload Hero Background</h2>

              <p className="details">
                Optional. If no hero image is uploaded, the artist page will keep
                using the large faded artist-name background.
              </p>

              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragging("hero");
                }}
                onDragLeave={() => setDragging("")}
                onDrop={(e) => handleDrop(e, "hero")}
                style={{
                  border:
                    dragging === "hero"
                      ? "2px solid #ffd166"
                      : "2px dashed #555",
                  borderRadius: 14,
                  padding: 28,
                  textAlign: "center",
                  marginBottom: 18,
                  background:
                    dragging === "hero"
                      ? "rgba(255, 209, 102, 0.12)"
                      : "#111"
                }}
              >
                <p style={{ marginBottom: 14 }}>
                  {uploading === "hero"
                    ? "Uploading hero image..."
                    : "Drag and drop hero image here"}
                </p>

                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileSelect(e, "hero")}
                  disabled={uploading !== ""}
                />
              </div>

              <h2>Hero Image URL</h2>

              <input
                value={heroImageUrl}
                onChange={(e) => setHeroImageUrl(e.target.value)}
                placeholder="https://example.com/hero.jpg"
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

            <div className="section">
              <h2>Hero Preview</h2>

              {heroImageUrl ? (
                <img
                  src={heroImageUrl}
                  alt="Hero image preview"
                  style={{
                    width: "100%",
                    maxHeight: 260,
                    objectFit: "cover",
                    background: "#111",
                    border: "1px solid #333",
                    borderRadius: 12
                  }}
                />
              ) : (
                <p className="empty">
                  No hero image set. The artist page will use the faded name
                  background.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}