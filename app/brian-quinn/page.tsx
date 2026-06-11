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
                fontSize: "clamp(120px, 19vw, 310px)",
                fontWeight: 900,
                letterSpacing: "-10px",
                color: "rgba(255,255,255,0.10)",
                zIndex: 0,
                pointerEvents: "none",
                textAlign: "center",
                whiteSpace: "nowrap",
                lineHeight: 0.8
              }}
            >
              Brian Quinn
            </div>

            <div style={{ position: "relative", zIndex: 1 }}>
              <div className="brand">U Call It Happy Hour</div>

              <h1 className="title">Request tonight&apos;s songs.</h1>

              <p className="tagline">Influence tomorrow&apos;s setlist.</p>

              <div
                className="event-card"
                style={{
                  position: "relative",
                  minHeight: 240,
                  paddingRight: 190
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
                    right: 32,
                    textAlign: "center"
                  }}
                >
                  <img
                    src="/brian-logo.jpg"
                    alt="Brian Quinn Logo"
                    style={{
                      width: 100,
                      height: 100,
                      objectFit: "contain",
                      display: "block",
                      margin: "0 auto 8px"
                    }}
                  />

                  <a
                    href="https://venmo.com/Brian-Quinn-41"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      color: "#ffd84d",
                      fontWeight: 800,
                      textDecoration: "none",
                      fontSize: 16
                    }}
                  >
                    💵 Tip Brian →
                  </a>
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

            <span className="details">Tip Brian directly on Venmo.</span>

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

          <div className="footer">
            Demo catalog: Alice in Chains MTV Unplugged, The Brian Quinn Band,
            and Octane.
          </div>
        </div>
      </div>
    </main>
  );
}