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

      try {
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
      } catch (error) {
        console.error("Could not load setup link:", error);
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
            <section
              className="accountCard"
              style={{
                maxWidth: 700,
                margin: "0 auto"
              }}
            >
              <div className="brand">
                U CALL IT HAPPY HOUR
              </div>

              <h1 className="title">
                🎉 You're officially part of U Call It Happy Hour.
              </h1>

              <p
                style={{
                  fontSize: "1.1rem",
                  lineHeight: 1.8,
                  marginTop: 24,
                  marginBottom: 36
                }}
              >
                Your payment has been received and your artist page has
                been created.
                <br /><br />
                Let's get your page ready for fans. It only takes about
                2 minutes.
              </p>

              <div
                style={{
                  textAlign: "center"
                }}
              >
                <Link
                  className="btn"
                  href={setupUrl}
                  style={{
                    fontSize: "1.05rem",
                    padding: "14px 28px"
                  }}
                >
                  {loadingSetupLink
                    ? "Preparing Your Setup..."
                    : "Complete My Artist Setup →"}
                </Link>
              </div>
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}