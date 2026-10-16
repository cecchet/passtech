"use client";

import { useState } from "react";
import { sendSignInCode, verifySignInCode } from "@/lib/techSheetServer";

const inputClass = "w-full rounded border border-neutral-500 bg-neutral-900 p-2 text-base text-neutral-100 sm:text-sm";
const primaryButtonClass = "rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-black hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-50";

/** Inline email + one-time-code sign-in — no password; the code arrives by email. */
export function TechSheetSignIn({ onSignedIn, intro }: { onSignedIn?: () => void; intro?: string }) {
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [step, setStep] = useState<"email" | "code">("email");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const send = async () => {
    setBusy(true);
    setError(null);
    try {
      await sendSignInCode(email.trim());
      setStep("code");
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  };

  const verify = async () => {
    setBusy(true);
    setError(null);
    try {
      await verifySignInCode(email.trim(), code.trim());
      onSignedIn?.();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="rounded-lg border border-neutral-700 bg-neutral-950 p-3">
      <p className="mb-2 text-sm text-neutral-300">{intro ?? "Sign in with your email — we'll send you a one-time code."}</p>
      {step === "email" ? (
        <form
          className="flex flex-col gap-2 sm:flex-row"
          onSubmit={(e) => {
            e.preventDefault();
            if (email.includes("@")) send();
          }}
        >
          <input type="email" autoComplete="email" required placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} />
          <button type="submit" disabled={busy || !email.includes("@")} className={`${primaryButtonClass} shrink-0`}>
            {busy ? "Sending…" : "Email me a code"}
          </button>
        </form>
      ) : (
        <form
          className="flex flex-col gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            if (code.trim()) verify();
          }}
        >
          <span className="text-xs text-neutral-400">Enter the code sent to {email}.</span>
          <div className="flex flex-col gap-2 sm:flex-row">
            <input
              inputMode="numeric"
              autoComplete="one-time-code"
              placeholder="Code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className={`${inputClass} tracking-widest`}
            />
            <button type="submit" disabled={busy || !code.trim()} className={`${primaryButtonClass} shrink-0`}>
              {busy ? "Checking…" : "Sign in"}
            </button>
          </div>
          <button type="button" onClick={() => { setStep("email"); setCode(""); }} className="w-fit text-xs text-amber-400 hover:text-amber-300">
            Use a different email / send a new code
          </button>
        </form>
      )}
      {error && <p className="mt-2 text-sm text-red-400">{error}</p>}
    </div>
  );
}
