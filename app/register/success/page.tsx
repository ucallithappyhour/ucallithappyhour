import Link from "next/link";

export default function RegisterSuccessPage() {
  return (
    <main className="page">
      <div className="overlay">
        <div className="container">
          <div className="hero">
            <div className="brand">U Call It Happy Hour</div>

            <section
              className="accountCard"
              style={{ maxWidth: 720, margin: "0 auto" }}
            >
              <h1 className="title">Welcome to U Call It Happy Hour 🎉</h1>

              <p className="tagline">
                Your artist setup payment has been received.
              </p>

              <div className="details" style={{ marginTop: 24 }}>
                We&apos;ll begin preparing your artist experience, including your
                personalized request page, QR starter kit, dashboard access, and
                referral link.
              </div>

              <div
                style={{
                  marginTop: 28,
                  padding: 20,
                  border: "1px solid rgba(212,175,55,0.35)",
                  borderRadius: 12,
                  background: "rgba(212,175,55,0.08)"
                }}
              >
                <h2>What happens next?</h2>

                <div
                  style={{
                    marginTop: 14,
                    lineHeight: 1.9,
                    fontSize: 14,
                    fontWeight: 700
                  }}
                >
                  <div>✓ Your artist profile is created</div>
                  <div>✓ Your song request page is prepared</div>
                  <div>✓ Your QR code starter kit is generated</div>
                  <div>✓ Your referral link is assigned</div>
                  <div>✓ You&apos;ll receive setup details by email</div>
                </div>
              </div>

              <div
                style={{
                  marginTop: 28,
                  padding: 20,
                  border: "1px solid rgba(34,197,94,0.45)",
                  borderRadius: 12,
                  background: "rgba(34,197,94,0.12)"
                }}
              >
                <h2>Give $20, Get $20</h2>

                <p style={{ marginTop: 12, lineHeight: 1.7 }}>
                  Once your setup is complete, you&apos;ll receive your personal
                  referral link. Share it with other artists and earn $20 when
                  they complete setup. They&apos;ll save $20, too.
                </p>
              </div>

              <div className="actions" style={{ marginTop: 28 }}>
                <Link className="btn" href="/">
                  Back to Home
                </Link>

                <Link className="btn secondary" href="/account">
                  Complete Your Setup
                </Link>
              </div>
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}