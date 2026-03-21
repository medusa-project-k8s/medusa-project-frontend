import { getLocaleHeader } from "@lib/util/get-locale-header"
import Medusa, { FetchArgs, FetchInput } from "@medusajs/js-sdk"

const K8S_DEFAULT_BACKEND =
  "http://medusa-backend.medusa-store.svc.cluster.local:9000"

/**
 * Read env in a way Webpack won't replace with `undefined` at build time (must work at
 * `next start` in K8s when vars come only from the pod, not the build image).
 */
function env(key: string): string | undefined {
  if (typeof process === "undefined") return undefined
  return process.env[key]
}

/**
 * Server: prefer MEDUSA_BACKEND_URL (Secret), then in-cluster default when running in K8s,
 * then public URL. Client: NEXT_PUBLIC_* only.
 */
function getMedusaBackendUrl(): string {
  if (typeof window !== "undefined") {
    return env("NEXT_PUBLIC_MEDUSA_BACKEND_URL")?.trim() || "http://localhost:9000"
  }

  const medusa = env("MEDUSA_BACKEND_URL")?.trim()
  const publicUrl = env("NEXT_PUBLIC_MEDUSA_BACKEND_URL")?.trim()
  const inCluster = Boolean(env("KUBERNETES_SERVICE_HOST"))

  if (inCluster) {
    return medusa || K8S_DEFAULT_BACKEND
  }
  return medusa || publicUrl || "http://localhost:9000"
}

let _sdk: Medusa | null = null

function getSdk(): Medusa {
  if (_sdk) {
    return _sdk
  }

  const baseUrl = getMedusaBackendUrl()
  _sdk = new Medusa({
    baseUrl,
    debug: env("NODE_ENV") === "development",
    publishableKey: env("NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY"),
  })

  const originalFetch = _sdk.client.fetch.bind(_sdk.client)

  _sdk.client.fetch = async <T>(
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
      // client / no request context
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

  return _sdk
}

/**
 * Lazy proxy so the Medusa client is created **after** Node has the real K8s `process.env`,
 * not only whatever existed during `next build`.
 */
export const sdk = new Proxy({} as Medusa, {
  get(_target, prop, receiver) {
    const instance = getSdk()
    const value = Reflect.get(instance, prop, receiver)
    if (typeof value === "function") {
      return value.bind(instance)
    }
    return value
  },
})
