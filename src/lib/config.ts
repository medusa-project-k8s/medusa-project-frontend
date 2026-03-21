import { getLocaleHeader } from "@lib/util/get-locale-header"
import Medusa, { FetchArgs, FetchInput } from "@medusajs/js-sdk"

const K8S_DEFAULT_BACKEND =
  "http://medusa-backend.medusa-store.svc.cluster.local:9000"

function getMedusaBackendUrl(): string {
  if (typeof window !== "undefined") {
    return (
      process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL?.trim() ||
      "http://localhost:9000"
    )
  }
  if (typeof process.env.KUBERNETES_SERVICE_HOST === "string") {
    return (
      process.env.MEDUSA_BACKEND_URL?.trim() || K8S_DEFAULT_BACKEND
    )
  }
  return (
    process.env.MEDUSA_BACKEND_URL?.trim() ||
    process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL?.trim() ||
    "http://localhost:9000"
  )
}

export const sdk = new Medusa({
  baseUrl: getMedusaBackendUrl(),
  debug: process.env.NODE_ENV === "development",
  publishableKey: process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY,
})

const originalFetch = sdk.client.fetch.bind(sdk.client)

sdk.client.fetch = async <T>(
  input: FetchInput,
  init?: FetchArgs
): Promise<T> => {
  const headers = { ...(init?.headers as Record<string, string> | undefined) }
  let localeHeader: Record<string, string | null | undefined> = {}
  try {
    localeHeader = await getLocaleHeader()
    if (localeHeader["x-medusa-locale"] != null) {
      headers["x-medusa-locale"] ??= localeHeader["x-medusa-locale"] as string
    }
  } catch {
    // No request context (client / static) — optional
  }

  const newHeaders: Record<string, string> = {}
  for (const [k, v] of Object.entries({ ...localeHeader, ...headers })) {
    if (v != null && v !== "") {
      newHeaders[k] = String(v)
    }
  }

  return originalFetch(input, {
    ...init,
    headers: newHeaders,
  })
}
