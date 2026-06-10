import Link from "next/link";

export default function Home() {
  return (
    <main className="page">
      <div className="overlay">
        <div className="container">
          <div className="hero">
            <div className="brand">U Call It Happy Hour</div>

            <h1 className="title">
              Request tonight&apos;s songs.
            </h1>

            <p className="tagline">
              Influence tomorrow&apos;s setlist.
            </p>

            <div className="event-card">
              <p className="performer">Brian Quinn</p>

              <div className="details">
                Screwballs • Every Friday • 5–7 PM
              </div>

              <Link className="btn" href="/request-song">
                Request a Song
              </Link>
            </div>
          </div>

          <div className="section">
            <h2>How it works</h2>

            <p>
              Search Brian&apos;s current catalog. Request a song for
              tonight. If your song isn&apos;t listed, suggest it for a
              future show.
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

          <div className="footer">
            Demo catalog: Alice in Chains MTV Unplugged,
            The Brian Quinn Band, and Octane.
          </div>
        </div>
      </div>
    </main>
  );
}