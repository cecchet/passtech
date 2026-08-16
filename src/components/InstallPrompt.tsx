"use client";

import { useEffect, useState } from "react";

const DISMISSED_KEY = "safety-gear-check:install-prompt-dismissed";

function isStandalone(): boolean {
  if (typeof window === "undefined") return false;
  const nav = navigator as Navigator & { standalone?: boolean };
  return window.matchMedia("(display-mode: standalone)").matches || nav.standalone === true;
}

/** Small line-icon reproductions of each platform's actual install affordance — not screenshots, but shaped to match what you're looking for. */
function DesktopInstallIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="2" y="4" width="20" height="13" rx="1.5" />
      <path d="M8 21h8M12 17v4" />
      <path d="M12 7v6M9 10l3 3 3-3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function AndroidMenuIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5 shrink-0" fill="currentColor">
      <circle cx="12" cy="5" r="1.6" />
      <circle cx="12" cy="12" r="1.6" />
      <circle cx="12" cy="19" r="1.6" />
    </svg>
  );
}

function AppleShareIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M12 3v12" strokeLinecap="round" />
      <path d="M8 7l4-4 4 4" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M6 11h-.5A1.5 1.5 0 0 0 4 12.5v7A1.5 1.5 0 0 0 5.5 21h13a1.5 1.5 0 0 0 1.5-1.5v-7a1.5 1.5 0 0 0-1.5-1.5H18" strokeLinecap="round" />
    </svg>
  );
}

interface Platform {
  icon: () => React.JSX.Element;
  title: string;
  steps: string[];
}

const PLATFORMS: Platform[] = [
  {
    icon: DesktopInstallIcon,
    title: "Desktop (Chrome / Edge)",
    steps: [
      "Look for the install icon (a small monitor with a down arrow) at the right end of the address bar.",
      "Click it, then click “Install.” No icon there? Use the ⋮ menu → “Install PassTech…” instead.",
    ],
  },
  {
    icon: AndroidMenuIcon,
    title: "Android (Chrome)",
    steps: [
      "Tap the ⋮ menu in the top-right corner.",
      "Tap “Install app” or “Add to Home screen,” then confirm.",
    ],
  },
  {
    icon: AppleShareIcon,
    title: "iPhone / iPad (Safari)",
    steps: [
      "Tap the Share icon (square with an arrow pointing up) in the toolbar.",
      "Scroll down and tap “Add to Home Screen,” then confirm.",
    ],
  },
];

export function InstallPrompt() {
  const [installed, setInstalled] = useState(false);
  const [dismissed, setDismissed] = useState(true);

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    setInstalled(isStandalone());
    setDismissed(window.localStorage.getItem(DISMISSED_KEY) === "1");
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  if (installed || dismissed) return null;

  const dismiss = () => {
    setDismissed(true);
    window.localStorage.setItem(DISMISSED_KEY, "1");
  };

  return (
    <div className="mb-6 rounded-lg border border-sky-900 bg-sky-950/40 p-4">
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-semibold text-sky-200">📲 Install PassTech to use offline</p>
        <button
          type="button"
          onClick={dismiss}
          aria-label="Dismiss"
          className="shrink-0 rounded border border-sky-800 px-2 py-0.5 text-xs text-sky-300 hover:bg-sky-900"
        >
          Dismiss
        </button>
      </div>
      <p className="mt-1 text-xs text-sky-300/80">
        Add PassTech to your home screen or desktop to open it like a regular app and check your gear without a
        connection at the track.
      </p>
      <div className="mt-3 grid gap-3 sm:grid-cols-3">
        {PLATFORMS.map(({ icon: Icon, title, steps }) => (
          <div key={title} className="rounded border border-sky-900 bg-sky-950/40 p-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-sky-200">
              <Icon />
              {title}
            </div>
            <ol className="mt-2 list-decimal space-y-1 pl-4 text-[11px] text-sky-300/90">
              {steps.map((step, i) => (
                <li key={i}>{step}</li>
              ))}
            </ol>
          </div>
        ))}
      </div>
    </div>
  );
}
