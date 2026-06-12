import Link from "next/link";

export default function Home() {
  return (
    <main className="page">
      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 0,
          pointerEvents: "none",
          overflow: "hidden"
        }}
      >
        <div
          style={{
            position: "absolute",
            top: "9vh",
            left: "50%",
            transform: "translateX(-50%)",
         fontFamily:
  '-apple-system, BlinkMacSystemFont, "Segoe UI", Inter, sans-serif',
fontSize: "clamp(150px, 20vw, 290px)",
fontWeight: 900,
letterSpacing: "-14px",
color: "rgba(255,255,255,0.055)",
whiteSpace: "nowrap",
lineHeight: 1,
userSelect: "none"
          }}
        >
          BRIAN QUINN
        </div>

        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,0.08) 28%, rgba(0,0,0,0.58) 68%, rgba(0,0,0,1) 100%)"
          }}
        />
      </div>

      <div className="overlay" style={{ position: "relative", zIndex: 1 }}>
        <div className="container">
          <div className="hero">
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