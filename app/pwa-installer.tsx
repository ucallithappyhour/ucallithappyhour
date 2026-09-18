"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

type InstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

function isIosDevice() {
  return /iphone|ipad|ipod/i.test(window.navigator.userAgent);
}

function isStandalone() {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (window.navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

export default function PwaInstaller() {
  const pathname = usePathname();
  const [installPrompt, setInstallPrompt] = useState<InstallPromptEvent | null>(
    null
  );
  const [showIosHelp, setShowIosHelp] = useState(false);
  const [canInstallOnIos, setCanInstallOnIos] = useState(false);
  const [showQrWelcome, setShowQrWelcome] = useState(false);
  const [welcomeType, setWelcomeType] = useState<
    "artist" | "agent" | "main"
  >("main");

  const reservedPaths = new Set([
    "account",
    "admin",
    "agents",
    "api",
    "dashboard",
    "register",
    "registrations",
    "request-song"
  ]);

  const pathParts = pathname.split("/").filter(Boolean);
  const isArtistPage =
    pathParts.length === 1 && !reservedPaths.has(pathParts[0].toLowerCase());

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        // The website still works normally if service-worker registration fails.
      });
    }

    setCanInstallOnIos(isIosDevice() && !isStandalone());

    const params = new URLSearchParams(window.location.search);
    const isAgentReferral = pathname === "/register" && params.has("agent");
    const isMainPage = pathname === "/";
    const alreadyWelcomed = sessionStorage.getItem("qr-welcome-seen") === "1";

    if (
      !isStandalone() &&
      !alreadyWelcomed &&
      (isArtistPage || isAgentReferral || isMainPage)
    ) {
      setWelcomeType(
        isAgentReferral ? "agent" : isArtistPage ? "artist" : "main"
      );
      setShowQrWelcome(true);
    }

    const handleInstallPrompt = (event: Event) => {
      event.preventDefault();
      setInstallPrompt(event as InstallPromptEvent);
    };

    const handleInstalled = () => {
      setInstallPrompt(null);
      setShowIosHelp(false);
    };

    window.addEventListener("beforeinstallprompt", handleInstallPrompt);
    window.addEventListener("appinstalled", handleInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleInstallPrompt);
      window.removeEventListener("appinstalled", handleInstalled);
    };
  }, [isArtistPage, pathname]);

  function closeQrWelcome() {
    sessionStorage.setItem("qr-welcome-seen", "1");
    setShowQrWelcome(false);
    setShowIosHelp(false);
  }

  async function installApp() {
    if (installPrompt) {
      await installPrompt.prompt();
      const choice = await installPrompt.userChoice;

      if (choice.outcome === "accepted") {
        setInstallPrompt(null);
        closeQrWelcome();
      }

      return;
    }

    setShowIosHelp(true);
  }

  if (showQrWelcome && !isStandalone()) {
    const welcomeContent = {
      artist: {
        eyebrow: "Welcome to U Call It Happy Hour",
        title: "Request songs tonight",
        copy: "No account required. Install for the quickest access, or continue in your browser.",
        installLabel: "Install Free App",
        continueLabel: "Continue in Browser"
      },
      agent: {
        eyebrow: "Your agent invited you",
        title: "Put your crowd in the show",
        copy: "Install the app for quick access, or continue to create your artist account.",
        installLabel: "Install Free App",
        continueLabel: "Continue to Artist Signup"
      },
      main: {
        eyebrow: "Welcome to U Call It Happy Hour",
        title: "Live music gets interactive",
        copy: "No account required. Install for the quickest access, or explore in your browser.",
        installLabel: "Install Free App",
        continueLabel: "Explore in Browser"
      }
    }[welcomeType];

    return (
      <div className="qrWelcomeBackdrop" role="presentation">
        <section
          className="qrWelcome"
          role="dialog"
          aria-modal="true"
          aria-labelledby="qr-welcome-title"
        >
          <img
            className="qrWelcomeLogo"
            src="/icons/icon-192.png"
            alt="U Call It Happy Hour"
          />
          <p className="qrWelcomeEyebrow">{welcomeContent.eyebrow}</p>
          <h2 id="qr-welcome-title">{welcomeContent.title}</h2>
          <p className="qrWelcomeCopy">{welcomeContent.copy}</p>

          {showIosHelp ? (
            <div className="qrWelcomeHelp" aria-live="polite">
              {canInstallOnIos ? (
                <>
                  Tap the <strong>Share</strong> button, then choose
                  <strong> Add to Home Screen</strong>.
                </>
              ) : (
                <>
                  Already installed? Select <strong>Open in app</strong> in your
browser&apos;s address bar. Otherwise, open the browser menu and
choose <strong>Install app</strong> or
<strong> Add to Home screen</strong>.
                </>
              )}
            </div>
          ) : null}

          <div className="qrWelcomeActions">
            <button
              className="qrWelcomePrimary"
              type="button"
              onClick={installApp}
            >
{installPrompt
  ? welcomeContent.installLabel
  : "Install or Open App"}            </button>
            <button
              className="qrWelcomeSecondary"
              type="button"
              onClick={closeQrWelcome}
            >
              {welcomeContent.continueLabel}
            </button>
          </div>

          {welcomeType !== "agent" ? (
            <Link
              className="qrWelcomeArtistLink"
              href="/register"
              onClick={closeQrWelcome}
            >
              Artist? Create an account
            </Link>
          ) : null}
        </section>
      </div>
    );
  }

  if ((!installPrompt && !canInstallOnIos) || isStandalone()) {
    return null;
  }

  return (
    <div className="pwaInstall">
      {showIosHelp ? (
        <div className="pwaInstallHelp" role="dialog" aria-live="polite">
          <button
            className="pwaInstallClose"
            type="button"
            aria-label="Close install instructions"
            onClick={() => setShowIosHelp(false)}
          >
            ×
          </button>
          <strong>Install U Call It</strong>
          <span>Tap Share, then choose Add to Home Screen.</span>
        </div>
      ) : (
        <button className="pwaInstallButton" type="button" onClick={installApp}>
          Install App
        </button>
      )}
    </div>
  );
}
