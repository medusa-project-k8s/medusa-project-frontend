/**
 * Normalize product image URL so it loads when backend returns localhost or in-cluster host.
 * In the browser, rewrite to current origin so images work behind path-based ingress.
 */
export function getImageUrl(url: string | null | undefined): string {
  if (!url || typeof url !== "string") return ""
  try {
    const parsed = new URL(url, "http://localhost")
    const origin = parsed.origin
    const path = parsed.pathname + parsed.search
    if (typeof window !== "undefined") {
      if (
        origin.includes("localhost") ||
        origin.includes("127.0.0.1") ||
        origin.includes("svc.cluster.local")
      ) {
        return window.location.origin + path
      }
    }
    return url
  } catch {
    return url
  }
}
