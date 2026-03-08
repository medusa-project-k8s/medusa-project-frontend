/**
 * Normalize product image URL. Images are served from backend (161), not frontend (160).
 * Rewrite wrong host (160, localhost, etc.) to backend origin so browser loads from 161.
 */
const BACKEND_ORIGIN =
  typeof process !== "undefined" && process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL
    ? new URL(process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL).origin
    : ""

export function getImageUrl(url: string | null | undefined): string {
  if (!url || typeof url !== "string") return ""
  const path = url.startsWith("http") ? new URL(url).pathname + new URL(url).search : url
  if (url.startsWith("/") && BACKEND_ORIGIN) return BACKEND_ORIGIN + path
  try {
    const parsed = new URL(url, "http://localhost")
    const pathnameAndSearch = parsed.pathname + parsed.search
    if (typeof window !== "undefined" && BACKEND_ORIGIN) {
      const origin = parsed.origin
      if (
        origin.includes("localhost") ||
        origin.includes("127.0.0.1") ||
        origin.includes("svc.cluster.local") ||
        origin === window.location.origin
      ) {
        return BACKEND_ORIGIN + pathnameAndSearch
      }
    }
    return url
  } catch {
    return url
  }
}
