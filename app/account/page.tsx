import Link from "next/link";

export default function AccountPage() {
  return (
    <main className="page">
      <div className="overlay">
        <div className="container">
          <div className="hero">
            <div className="brand">U Call It Happy Hour</div>

            <h1 className="title">Artist Account</h1>

            <p className="tagline">
              Manage your artist profile, gig info, artwork, song library, tip
              link, and socials.
            </p>

            <div className="actions">
              <Link className="btn secondary" href="/dashboard">
                Back to Dashboard
              </Link>
            </div>

            <div className="accountGrid">
              <section className="accountCard">
                <h2>Profile</h2>
                <label>Artist / Band Name</label>
                <input placeholder="Brian Quinn" />

                <label>Short Bio</label>
                <textarea placeholder="Acoustic rock, originals, covers, and live-request nights." />

                <label>Genre(s)</label>
                <input placeholder="Acoustic Rock, Classic Rock, 90s" />
              </section>

              <section className="accountCard">
                <h2>Artwork</h2>
                <label>Profile Photo</label>
                <input type="file" />

                <label>Logo</label>
                <input type="file" />

                <label>Hero / Background Image</label>
                <input type="file" />
              </section>

              <section className="accountCard">
                <h2>Gig Information</h2>
                <label>Venue Name</label>
                <input placeholder="Screwballs Sports Bar" />

                <label>Venue Address</label>
                <input placeholder="King of Prussia, PA" />

                <label>Gig Day / Date</label>
                <input placeholder="Every Friday" />

                <label>Start / End Time</label>
                <input placeholder="5 PM - 7 PM" />
              </section>

              <section className="accountCard">
                <h2>Song Library</h2>
                <label>Add Song</label>
                <input placeholder="Song title" />

                <label>Artist</label>
                <input placeholder="Original artist" />

                <button className="btn" type="button">
                  Add Song
                </button>

                <label>Bulk Paste Songs</label>
                <textarea placeholder={"Nutshell - Alice in Chains\nRooster - Alice in Chains"} />

                <button className="btn secondary" type="button">
                  Import List
                </button>
              </section>

              <section className="accountCard">
                <h2>E-Pay / Tips</h2>
                <label>Payment Type</label>
                <select defaultValue="">
                  <option value="" disabled>
                    Choose payment type
                  </option>
                  <option>Venmo</option>
                  <option>Cash App</option>
                  <option>PayPal</option>
                  <option>Zelle</option>
                  <option>Other</option>
                </select>

                <label>Handle or Link</label>
                <input placeholder="https://venmo.com/Brian-Quinn-41" />

                <label>Button Text</label>
                <input placeholder="Tip Brian" />

                <label>Thank You Message</label>
                <textarea placeholder="Thanks for supporting live music!" />
              </section>

              <section className="accountCard">
                <h2>Social Links</h2>
                <label>Facebook</label>
                <input placeholder="Facebook URL" />

                <label>Instagram</label>
                <input placeholder="Instagram URL" />

                <label>YouTube</label>
                <input placeholder="YouTube URL" />

                <label>Website</label>
                <input placeholder="Website URL" />
              </section>
            </div>

            <div className="actions" style={{ marginTop: 28 }}>
              <button className="btn" type="button">
                Save Account Info
              </button>
              <Link className="btn secondary" href="/dashboard">
                Cancel
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}