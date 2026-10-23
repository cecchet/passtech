import { createClient, Session, SupabaseClient } from "@supabase/supabase-js";
import { SUPABASE_ANON_KEY, SUPABASE_URL, TECH_SHEET_PHOTO_BUCKET } from "@/lib/serverConfig";
import { TechSheetDeclaredItem, TechSheetInspection, TechSheetPictures, TechSheetTemplate } from "@/data/techSheetTypes";
import { dataUrlToBytes } from "@/lib/techSheet";

/** A tech sheet template as the server keeps it (id = the server's template id). */
export interface TechSheetServerTemplate {
  id: string;
  key: string;
  title: string;
  version: number;
  body?: string | null;
  definition: TechSheetTemplate;
}

/** One of an event's tech sheets, with the event classes it covers (empty = no specific classes). */
export interface TechSheetEventTemplate extends TechSheetServerTemplate {
  classes: string[];
}

/** An event a competitor can submit a tech sheet to, as tech_sheet_events() returns it. */
export interface TechSheetEvent {
  id: string;
  name: string;
  location?: string | null;
  body?: string | null;
  bodyName?: string | null;
  scrutineeringStartsOn?: string | null;
  startsOn?: string | null;
  endsOn?: string | null;
  /** The event's first sheet (kept for servers / clients from before several sheets per event). */
  template: TechSheetServerTemplate | null;
  /** Every sheet the event uses, in order — one per group of classes (e.g. NEHA X vs non-X). */
  templates?: TechSheetEventTemplate[];
}

/** The event's sheets: its templates list, else its single template (covering no specific classes). */
export function eventTemplates(ev: TechSheetEvent | undefined): TechSheetEventTemplate[] {
  if (!ev) return [];
  const list = (ev.templates ?? []).filter((t) => t && t.definition);
  if (list.length > 0) return list.map((t) => ({ ...t, classes: Array.isArray(t.classes) ? t.classes : [] }));
  return ev.template ? [{ ...ev.template, classes: [] }] : [];
}

/** The sheet listing this event class (case-insensitive), if any. */
export function templateForClass(templates: TechSheetEventTemplate[], eventClass: string | undefined): TechSheetEventTemplate | undefined {
  const c = (eventClass ?? "").trim().toLowerCase();
  if (!c) return undefined;
  return templates.find((t) => t.classes.some((x) => x.trim().toLowerCase() === c));
}

/** "NEHA Tech Sheet — X classes: X, XS" / "NEHA Tech Sheet — all other classes". */
export function templateChoiceLabel(t: TechSheetEventTemplate): string {
  return `${t.title} — ${t.classes.length > 0 ? `${t.classes.length === 1 ? "class" : "classes"}: ${t.classes.join(", ")}` : "all other classes"}`;
}

export type TechSheetStatus = "submitted" | "inspecting" | "passed" | "failed";

/** One of the signed-in competitor's own sheets, as my_tech_sheets() returns it. */
export interface MyTechSheet {
  id: string;
  event: string;
  eventName?: string | null;
  body?: string | null;
  startsOn?: string | null;
  carNumber: string;
  status: TechSheetStatus;
  variant?: string | null;
  header?: Record<string, unknown> | null;
  template?: TechSheetTemplate | null;
  competitor?: { items?: Record<string, TechSheetDeclaredItem>; pictures?: TechSheetPictures } | null;
  inspection?: TechSheetInspection | null;
  submittedAt?: string | null;
  inspectedAt?: string | null;
  /** A scrutineer has the sheet open right now: re-submitting waits until they're done. */
  lockedNow?: boolean;
}

/** What the team can still do with a submitted sheet: re-submit it (all of it, or after a fail its
 * failed lines), wait (a scrutineer has it open), or nothing (passed: final). */
export function resubmitState(s: MyTechSheet): "open" | "failed" | "locked" | "final" {
  if (s.status === "passed") return "final";
  if (s.lockedNow) return "locked";
  return s.status === "failed" ? "failed" : "open";
}

export interface TechSheetSubmission {
  event: string;
  carNumber: string;
  header: Record<string, string | string[]>;
  variant: string | null;
  competitor: { items: Record<string, TechSheetDeclaredItem>; pictures?: TechSheetPictures };
  /** The event's sheet filled (a server template id) — without it the server picks the sheet
   * listing the car's class, else the first. */
  template?: string;
}

let client: SupabaseClient | null = null;

/** Lazily created, browser-only client — implicit flow with a persisted session, so a competitor
 * signs in once (email + one-time code) and stays signed in on that phone. */
export function getSupabase(): SupabaseClient {
  if (!client) {
    client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: { flowType: "implicit", persistSession: true, autoRefreshToken: true, detectSessionInUrl: false, storageKey: "passtech-auth" },
    });
  }
  return client;
}

function messageOf(error: unknown): string {
  if (error && typeof error === "object" && "message" in error && typeof (error as { message: unknown }).message === "string") {
    return (error as { message: string }).message;
  }
  return String(error);
}

export async function getSession(): Promise<Session | null> {
  const { data } = await getSupabase().auth.getSession();
  return data.session;
}

export function onAuthChange(callback: (session: Session | null) => void): () => void {
  const { data } = getSupabase().auth.onAuthStateChange((_event, session) => callback(session));
  return () => data.subscription.unsubscribe();
}

/** Sends the one-time sign-in code to this email (creating the account on first use). */
export async function sendSignInCode(email: string): Promise<void> {
  const { error } = await getSupabase().auth.signInWithOtp({ email, options: { shouldCreateUser: true } });
  if (error) throw new Error(messageOf(error));
}

export async function verifySignInCode(email: string, token: string): Promise<Session> {
  const { data, error } = await getSupabase().auth.verifyOtp({ email, token, type: "email" });
  if (error) throw new Error(messageOf(error));
  if (!data.session) throw new Error("Sign-in didn't complete — request a new code and try again.");
  return data.session;
}

export async function signOut(): Promise<void> {
  await getSupabase().auth.signOut();
}

/** Upcoming events and the tech sheet each uses — callable signed out. */
export async function fetchTechSheetEvents(): Promise<TechSheetEvent[]> {
  const { data, error } = await getSupabase().rpc("tech_sheet_events");
  if (error) throw new Error(messageOf(error));
  return Array.isArray(data) ? (data as TechSheetEvent[]) : [];
}

export async function fetchMyTechSheets(): Promise<MyTechSheet[]> {
  const { data, error } = await getSupabase().rpc("my_tech_sheets");
  if (error) throw new Error(messageOf(error));
  return Array.isArray(data) ? (data as MyTechSheet[]) : [];
}

/** One of the signed-in team's own submitted photos, as a data URL (null when it can't be read). */
export async function downloadTechSheetPhoto(sha256: string): Promise<string | null> {
  const { data, error } = await getSupabase().storage.from(TECH_SHEET_PHOTO_BUCKET).download(sha256);
  if (error || !data) return null;
  return await new Promise<string | null>((resolve) => {
    const reader = new FileReader();
    reader.onload = () => resolve(typeof reader.result === "string" ? reader.result : null);
    reader.onerror = () => resolve(null);
    reader.readAsDataURL(data.type === "image/jpeg" ? data : new Blob([data], { type: "image/jpeg" }));
  });
}

/** Uploads one photo under its SHA-256. An object that's already there (the same photo sent
 * before, by this sheet or another) is fine — the name is the content. */
export async function uploadTechSheetPhoto(sha256: string, dataUrl: string): Promise<void> {
  const bytes = dataUrlToBytes(dataUrl);
  const blob = new Blob([bytes as BlobPart], { type: "image/jpeg" });
  const { error } = await getSupabase().storage.from(TECH_SHEET_PHOTO_BUCKET).upload(sha256, blob, { contentType: "image/jpeg", upsert: false });
  if (!error) return;
  const status = (error as { statusCode?: string | number }).statusCode;
  if (String(status) === "409" || /already exists|duplicate/i.test(messageOf(error))) return;
  throw new Error(`Photo upload failed: ${messageOf(error)}`);
}

/** A car on the event's entry list, as event_entry_lookup() returns it (the VIN only for the car's
 * own competitor or logbook owner, signed in). */
export interface EventEntryLookup {
  carNumber: string;
  driver?: string;
  codriver?: string;
  class?: string;
  make?: string;
  model?: string;
  year?: string;
  color?: string;
  vin?: string;
  logbookNumber?: string;
  logbookBody?: string;
}

/** The event's entry for this car number, or null when it isn't entered (yet). Callable signed out. */
export async function lookupEventEntry(eventId: string, carNumber: string): Promise<EventEntryLookup | null> {
  const { data, error } = await getSupabase().rpc("event_entry_lookup", { p_event: eventId, p_car: carNumber });
  if (error) throw new Error(messageOf(error));
  return (data as EventEntryLookup | null) ?? null;
}

/** A body's Public tech sheet, as public_tech_sheets() returns it: its generic sheet, for
 * competitors to pre-fill without an event. */
export interface PublicTechSheet {
  id: string;
  key: string;
  title: string;
  version: number;
  body: string;
  bodyName: string;
  definition: TechSheetTemplate;
}

/** The sanctioning bodies' Public tech sheets — callable signed out. (The automatic sheets made
 * from the rulesets, and the bodies' Private ones, are never listed.) */
export async function fetchPublicTechSheets(): Promise<PublicTechSheet[]> {
  const { data, error } = await getSupabase().rpc("public_tech_sheets");
  if (error) throw new Error(messageOf(error));
  return Array.isArray(data) ? (data as PublicTechSheet[]) : [];
}

/** Submits (or, until inspection starts, replaces) the car's declaration. Returns the sheet id. */
export async function submitTechSheet(submission: TechSheetSubmission): Promise<string> {
  const { data, error } = await getSupabase().rpc("submit_tech_sheet", { p: submission });
  if (error) throw new Error(messageOf(error));
  return String(data);
}
