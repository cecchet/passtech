"use client";

import { useEffect } from "react";

/** Registers the offline service worker (public/sw.js) once the page has loaded. */
export function ServiceWorkerRegister() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;
    window.addEventListener("load", () => {
      navigator.serviceWorker
        .register("/sw.js")
        .then((registration) => {
          // The browser's own update check is throttled (roughly once/24h) — force an
          // immediate check on every load, and again whenever connectivity comes back, so a
          // new sw.js (new precached assets, new caching logic) gets picked up promptly
          // instead of waiting on that timer. Each check is a tiny conditional-GET against
          // sw.js, not a full re-download unless the file actually changed.
          registration.update().catch(() => {});
          window.addEventListener("online", () => registration.update().catch(() => {}));
        })
        .catch(() => {
          // Offline support is a progressive enhancement — silently skip if it fails to register.
        });
    });
    // Ask the browser not to evict the offline cache under storage pressure — installed PWAs
    // are usually granted this automatically, but request it explicitly rather than relying on that.
    navigator.storage?.persist?.().catch(() => {});
  }, []);

  return null;
}
