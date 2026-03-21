import { headers } from "next/headers"

/**
 * Medusa locale header for server-side SDK calls. Only works in Server Components /
 * Route Handlers (uses `next/headers`). Client-side SDK calls skip this — `config.ts`
 * wraps fetch in try/catch.
 */
export async function getLocaleHeader(): Promise<
  Record<string, string | null | undefined>
> {
  try {
    const h = await headers()
    const locale = h.get("x-medusa-locale")
    if (locale) {
      return { "x-medusa-locale": locale }
    }
  } catch {
    // Not in a request context (e.g. static generation) or client bundle
  }
  return {}
}
