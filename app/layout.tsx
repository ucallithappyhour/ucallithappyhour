import './globals.css';

export const metadata = {
  title: 'U Call It Happy Hour',
  description: "Request tonight's songs. Influence tomorrow's setlist.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="siteLogoWrap">
          <img
            className="siteLogo"
            src="/ucallit-logo.png"
            alt="U Call It Happy Hour"
          />
        </div>

        {children}
      </body>
    </html>
  );
}