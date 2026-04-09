/** Base URL for the Express API (must match backend PORT; Next.js usually runs on :3000). */
export const API_BASE = (
  process.env.NEXT_PUBLIC_API_URL || "http://3.19.222.155:3000"
).replace(/\/$/, "");

/** Use in client components when calling authenticated routes. */
export function getAuthHeaders() {
  if (typeof window === "undefined") return {};
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}
