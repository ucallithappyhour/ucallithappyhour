import Link from "next/link";

export default function Home() {
  return (
    <main className="page">
      <div className="overlay">
        <div className="container">
          <div className="hero">
            <h1 className="title">Choose Your Artist</h1>

            <p className="tagline">
              Request tonight&apos;s songs. Influence tomorrow&apos;s setlist.
            </p>

            <div className="section">
              <h2>Available Artists</h2>

              {/* Brian Quinn */}
              <div
                className="event-card"
                style={{
                  position: "relative",
                  minHeight: 190,
                  paddingRight: 230
                }}
              >
                <p className="performer">Brian Quinn</p>

                <div className="details">
                  Screwballs • Every Friday • 5–7 PM
                </div>

                <Link className="btn" href="/brian-quinn">
                  Enter Brian&apos;s Page
                </Link>

                <div
                  style={{
                    position: "absolute",
                    top: 24,
                    right: 32,
                    width: 150,
                    height: 140,
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

              {/* Corey & Friends */}
              <div
                className="event-card"
                style={{
                  position: "relative",
                  minHeight: 190,
                  paddingRight: 230
                }}
              >
                <p className="performer">Corey &amp; Friends</p>

                <div className="details">
                  Venue TBD • Day/Time TBD
                </div>

                <Link className="btn" href="/corey-and-friends">
                  Enter Corey&apos;s Page
                </Link>

                <div
                  style={{
                    position: "absolute",
                    top: 24,
                    right: 32,
                    width: 150,
                    height: 140,
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
              <h2>For Artists</h2>

              <div className="event-card">
                <p className="performer">Bring U Call It Happy Hour to Your Shows</p>

                <div className="details">
                  Personalized artist page • Request dashboard • QR starter kit • Tip integration
                </div>

                <p style={{ marginTop: 14 }}>
                  Give your crowd a simple way to request songs, influence future
                  setlists, and support you directly.
                </p>

                <Link className="btn" href="/register">
                  Request Artist Setup - $99
                </Link>
              </div>

              <div className="actions" style={{ marginTop: 18 }}>
                <Link className="btn secondary" href="/account">
                  Artist Login
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}