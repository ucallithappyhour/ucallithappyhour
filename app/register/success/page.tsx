"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function SuccessPage() {
  const [setupUrl, setSetupUrl] = useState("/account");
  const [loadingSetupLink, setLoadingSetupLink] = useState(true);

  useEffect(() => {
    async function loadSetupLink() {
      const params = new URLSearchParams(window.location.search);
      const sessionId = params.get("session_id");

      if (!sessionId) {
        setLoadingSetupLink(false);
        return;
      }

      const response = await fetch("/api/get-setup-link", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ sessionId })
      });

      const result = await response.json();

      if (response.ok && result.setupUrl) {
        setSetupUrl(result.setupUrl);
      }

      setLoadingSetupLink(false);
    }

    loadSetupLink();
  }, []);

  return (
    <main className="page">
      <div className="overlay">
        <div className="container">
          <div className="hero">
            <div style={{ textAlign: "center", marginBottom: 20 }}>
              <img
                src="/ucallit-logo.png.png"
                alt="U Call It Happy Hour"
                style={{
                  width: 120,
                  height: "auto",
                  display: "inline-block"
                }}
              />
            </div>

            <section
              className="accountCard"
              style={{ maxWidth: 700, margin: "0 auto" }}
            >
              <div className="brand">U CALL IT HAPPY HOUR</div>

              <h1 className="title">Payment Received 🎉</h1>

              <p
                style={{
                  fontSize: "1.25rem",
                  fontWeight: 700,
                  marginBottom: 20
                }}
              >
                One more step: complete your artist setup.
              </p>

              <p style={{ lineHeight: 1.7 }}>
                Your artist page has been created. Now finish setting up your
                profile so fans can request songs, tip you, and stay connected
                to your shows.
              </p>

              <div
                style={{
                  marginTop: 30,
                  padding: 24,
                  border: "1px solid rgba(212,175,55,0.35)",
                  borderRadius: 12,
                  background: "rgba(212,175,55,0.08)"
                }}
              >
                <h2 style={{ marginBottom: 16 }}>Complete your setup</h2>

                <div style={{ lineHeight: 2 }}>
                  <div>✓ Add your bio and genres</div>
                  <div>✓ Connect your tip link</div>
                  <div>✓ Add social links</div>
                  <div>✓ Add gigs, logo, and songs next</div>
                  <div>✓ Receive your referral link</div>
                </div>
              </div>

              <div className="actions" style={{ marginTop: 32 }}>
                <Link className="btn" href={setupUrl}>
                  {loadingSetupLink
                    ? "Preparing Setup Link..."
                    : "Finish Setting Up My Artist Page"}
                </Link>

                <Link className="btn secondary" href="/">
                  Back to Home
                </Link>
              </div>
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}