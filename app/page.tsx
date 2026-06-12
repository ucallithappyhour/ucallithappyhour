import Link from "next/link";

export default function Home() {
  return (
    <main className="page">
      <div className="overlay">
        <div className="container">
          <div className="hero">
            <div
              style={{
                position: "absolute",
                inset: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontFamily:
                  '"Montserrat", "League Spartan", "Arial Black", sans-serif',
                fontSize: "clamp(118px, 18vw, 280px)",
                fontWeight: 800,
                letterSpacing: "-0.05em",
                lineHeight: 1,
                textTransform: "uppercase",
                color: "rgba(255,255,255,0.085)",
                filter: "blur(0.4px)",
                transform: "translateY(12px)",
                zIndex: 0,
                pointerEvents: "none",
                textAlign: "center",
                whiteSpace: "nowrap",
                userSelect: "none"
              }}
            >
              BRIAN QUINN
            </div>

            <div style={{ position: "relative", zIndex: 1 }}>
              <div className="brand">U Call It Happy Hour</div>

              <h1 className="title">Request tonight&apos;s songs.</h1>

              <p className="tagline">
                Influence tomorrow&apos;s setlist.
              </p>

              <div
                className="event-card"
                style={{
                  position: "relative",
                  minHeight: 240,
                  paddingRight: 260
                }}
              >
                <p className="performer">Brian Quinn</p>

                <div className="details">
                  Screwballs • Every Friday • 5–7 PM
                </div>

                <Link className="btn" href="/request-song">
                  Request a Song
                </Link>

                <div
                  style={{
                    position: "absolute",
                    top: 28,
                    right: 36,
                    width: 190,
                    height: 170,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center"
                  }}
                >
                  <img
                    src="/brian-logo.jpg"
                    alt="Brian Quinn Logo"
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "contain",
                      display: "block"
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="section">
            <h2>How it works</h2>

            <p>
              Search Brian&apos;s current catalog. Request a song for tonight.
              If your song isn&apos;t listed, suggest it for a future show.
            </p>
          </div>

          <div className="section">
            <p>
              <strong>Enjoying the music?</strong>
            </p>

            <span className="details">
              Tip Brian directly on Venmo.
            </span>

            <br />
            <br />

            <a
              className="btn secondary"
              href="https://venmo.com/Brian-Quinn-41"
              target="_blank"
              rel="noopener noreferrer"
            >
              Tip Brian
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}