import Link from "next/link";

export default function Home() {
  return (
    <main className="page">
      <div className="overlay">
        <div className="container">
          <div className="hero" style={{ position: "relative", overflow: "hidden" }}>
            <div
              style={{
                position: "absolute",
                left: "50%",
                top: "42%",
                transform: "translate(-50%, -50%)",
                fontSize: "clamp(150px, 24vw, 360px)",
                fontWeight: 900,
                letterSpacing: "-10px",
                color: "rgba(255,255,255,0.075)",
                zIndex: 0,
                pointerEvents: "none",
                whiteSpace: "nowrap",
                lineHeight: 0.8
              }}
            >
              BRIAN QUINN
            </div>

            <div style={{ position: "relative", zIndex: 1 }}>
              <div className="brand">U Call It Happy Hour</div>

              <h1 className="title">Request tonight&apos;s songs.</h1>

              <p className="tagline">Influence tomorrow&apos;s setlist.</p>

              <div
                className="event-card"
                style={{
                  position: "relative",
                  minHeight: 210,
                  paddingRight: 210
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
                    top: 26,
                    right: 32,
                    textAlign: "center"
                  }}
                >
                  <img
                    src="/brian-logo.jpg"
                    alt="Brian Quinn Logo"
                    style={{
                      width: 95,
                      height: 95,
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