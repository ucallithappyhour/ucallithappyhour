import Link from "next/link";

export default function Home() {
  return (
    <main className="page">
      <div className="overlay">
        <div className="container">
          <div className="hero">
            <div className="brand">U Call It Happy Hour</div>

            <h1 className="title">Choose Your Artist</h1>

            <p className="tagline">
              Request tonight&apos;s songs. Influence tomorrow&apos;s setlist.
            </p>

            <div className="section">
              <h2>Available artists</h2>

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
            </div>

            <div className="section">
              <h2>For artists</h2>

              <p>
                Give your crowd a simple way to request songs, influence future
                setlists, and support you directly.
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}