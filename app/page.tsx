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
                fontSize: "clamp(120px, 22vw, 340px)",
                fontWeight: 1000,
                letterSpacing: "-14px",
                color: "rgba(255,255,255,0.11)",
                textTransform: "uppercase",
                filter: "blur(0.3px)",
                zIndex: 0,
                pointerEvents: "none",
                textAlign: "center"
              }}
            >
              Brian Quinn
            </div>

            <div style={{ position: "relative", zIndex: 1 }}>
              <div className="brand">U Call It Happy Hour</div>

              <h1 className="title">Request tonight&apos;s songs.</h1>

              <p className="tagline">Influence tomorrow&apos;s setlist.</p>

              <div className="event-card">
                <div>
                  <p className="performer">Brian Quinn</p>

                  <div className="details">
                    Screwballs • Every Friday • 5–7 PM
                  </div>

                  <Link className="btn" href="/request-song">
                    Request a Song
                  </Link>
                </div>

                <div
                  style={{
                    marginLeft: "auto",
                    textAlign: "center",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    minWidth: 170
                  }}
                >
                  <img
                    src="/brian-logo.jpg"
                    alt="Brian Quinn Logo"
                    style={{
                      width: 120,
                      height: 120,
                      objectFit: "contain",
                      marginBottom: 12
                    }}
                  />

                  <a
                    href="https://venmo.com/Brian-Quinn-41"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      color: "#ffd84d",
                      fontWeight: 800,
                      textDecoration: "none"
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