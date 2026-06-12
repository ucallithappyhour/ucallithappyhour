import Link from "next/link";

export default function Home() {
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
                  width: 150,
                  height: "auto",
                  display: "inline-block"
                }}
              />
            </div>

            <h1 className="title">Corey &amp; Friends</h1>

            <p className="tagline">
              Request tonight&apos;s songs. Influence tomorrow&apos;s setlist.
            </p>

            <div
              className="event-card"
              style={{
                position: "relative",
                minHeight: 240,
                paddingRight: 260
              }}
            >
              <p className="performer">Corey &amp; Friends</p>

              <div className="details">Venue TBD • Day/time TBD</div>

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
                  src="/corey & friends-logo.jpg"
                  alt="Corey & Friends Logo"
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

          <div className="section">
            <h2>How it works</h2>

            <p>
              Search Corey &amp; Friends&apos; current catalog. Request a song
              for tonight. If your song isn&apos;t listed, suggest it for a
              future show.
            </p>
          </div>

          <div className="section">
            <p>
              <strong>Enjoying the music?</strong>
            </p>

            <span className="details">Tip link coming soon.</span>
          </div>
        </div>
      </div>
    </main>
  );
}