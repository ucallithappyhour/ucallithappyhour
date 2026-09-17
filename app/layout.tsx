import './globals.css';
import PwaInstaller from './pwa-installer';

export const viewport = {
  themeColor: "#111111",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export const metadata = {
  metadataBase: new URL("https://www.ucallithappyhour.com"),
  manifest: "/manifest.webmanifest",
  title: "U Call It Happy Hour",
  description: "Request tonight's songs. Influence tomorrow's setlist.",
  applicationName: "U Call It Happy Hour",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent" as const,
    title: "U Call It",
  },
  icons: {
    icon: [
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/icons/apple-touch-icon.png", sizes: "180x180" }],
  },
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
        <PwaInstaller />
      </body>
    </html>
  );
}
