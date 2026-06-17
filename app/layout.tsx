import './globals.css';

export const metadata = {
  title: "U Call It Happy Hour",
  description: "Request tonight's songs. Influence tomorrow's setlist.",
  openGraph: {
    title: "U Call It Happy Hour",
    description: "Request tonight's songs. Influence tomorrow's setlist.",
    url: "https://www.ucallithappyhour.com",
    siteName: "U Call It Happy Hour",
    images: [
      {
        url: "/ucallit-logo.png.png",
        width: 1200,
        height: 630,
        alt: "U Call It Happy Hour",
      },
    ],
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="siteLogoWrap">
          <img
            className="siteLogo"
            src="/ucallit-logo.png.png"
            alt="U Call It Happy Hour"
          />
        </div>

        {children}
      </body>
    </html>
  );
}