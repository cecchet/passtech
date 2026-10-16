/**
 * The shared Supabase backend PassTech submits tech sheets to (the same one the Digital logbooks
 * app uses). The anon key is public by design — every row and object is protected by row-level
 * security and SECURITY DEFINER functions on the server, not by keeping this key secret.
 * Override both with NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY (inlined at build
 * time) to point a build at another project.
 */
export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://opltqtjxrzlgucrgznft.supabase.co";

export const SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9wbHRxdGp4cnpsZ3Vjcmd6bmZ0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTExNjk0NTAsImV4cCI6MjEwNjc0NTQ1MH0.zp9-mI7BUpjIltkZLa707tayiQ-9SvdOomYONU36wPI";

/** Storage bucket for tech sheet photos — object name is the JPEG's lowercase hex SHA-256. */
export const TECH_SHEET_PHOTO_BUCKET = "tech-sheet-photos";
