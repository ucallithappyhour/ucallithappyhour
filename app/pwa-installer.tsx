"use client";

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
  const [installPrompt, setInstallPrompt] = useState<InstallPromptEvent | null>(
    null
  );
  const [showIosHelp, setShowIosHelp] = useState(false);
  const [canInstallOnIos, setCanInstallOnIos] = useState(false);

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        // The website still works normally if service-worker registration fails.
      });
    }

    setCanInstallOnIos(isIosDevice() && !isStandalone());

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
  }, []);

  async function installApp() {
    if (installPrompt) {
      await installPrompt.prompt();
      const choice = await installPrompt.userChoice;

      if (choice.outcome === "accepted") {
        setInstallPrompt(null);
      }

      return;
    }

    setShowIosHelp(true);
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
