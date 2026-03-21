import { HttpTypes } from "@medusajs/types"
import { NextRequest, NextResponse } from "next/server"

/** In-cluster Medusa (K8s). */
const K8S_DEFAULT_BACKEND =
  "http://medusa-backend.medusa-store.svc.cluster.local:9000"

function getBackendUrl(): string {
  const inK8s = typeof process.env.KUBERNETES_SERVICE_HOST === "string"
  if (inK8s) {
    return process.env.MEDUSA_BACKEND_URL?.trim() || K8S_DEFAULT_BACKEND
  }
  return (
    process.env.MEDUSA_BACKEND_URL?.trim() ||
    process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL?.trim() ||
    ""
  )
}

/**
 * Default path segment for `/` and fallbacks. Must be an ISO 3166-1 alpha-2 **country** code
 * that exists in Medusa (e.g. `us`, `de`, `gb`). Not a macro region like `eu` — that will 500.
 * Set via K8s: DEFAULT_REGION (runtime) or NEXT_PUBLIC_DEFAULT_REGION (build).
 */
function getDefaultRegion(): string {
  return (
    process.env.DEFAULT_REGION?.trim() ||
    process.env.NEXT_PUBLIC_DEFAULT_REGION?.trim() ||
    "us"
  )
}

/** If true, skip /store/regions fetch; only use getDefaultRegion() (simplest / avoids API issues). */
function isStaticRegionOnly(): boolean {
  const v = process.env.REGION_MIDDLEWARE_STATIC
  return v === "true" || v === "1"
}

const PUBLISHABLE_API_KEY = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY

const regionMapCache = {
  regionMap: new Map<string, HttpTypes.StoreRegion>(),
  regionMapUpdated: Date.now(),
}

async function fetchJsonFromMedusa<T>(path: string): Promise<T> {
  const base = getBackendUrl()
  if (!base) {
    throw new Error(
      "No backend URL: set MEDUSA_BACKEND_URL or NEXT_PUBLIC_MEDUSA_BACKEND_URL."
    )
  }
  const url = `${base.replace(/\/$/, "")}${path.startsWith("/") ? path : `/${path}`}`
  const response = await fetch(url, {
    headers: {
      "x-publishable-api-key": PUBLISHABLE_API_KEY!,
      Accept: "application/json",
    },
    cache: "no-store",
  })
  const contentType = response.headers.get("content-type") ?? ""
  if (!contentType.includes("application/json")) {
    const body = await response.text()
    throw new Error(
      `Medusa returned non-JSON (${response.status}) for ${url}. Content-Type: ${contentType}. Body: ${body.slice(0, 200)}`
    )
  }
  const json = (await response.json()) as T & { message?: string }
  if (!response.ok) {
    throw new Error(json.message ?? response.statusText)
  }
  return json
}

function syntheticRegionMapForCountry(iso2: string) {
  const m = new Map<string, HttpTypes.StoreRegion>()
  m.set(iso2, {
    id: "fallback",
    countries: [{ iso_2: iso2 }],
  } as HttpTypes.StoreRegion)
  return m
}

async function getRegionMap(_cacheId: string) {
  if (isStaticRegionOnly()) {
    return syntheticRegionMapForCountry(getDefaultRegion())
  }

  const { regionMap, regionMapUpdated } = regionMapCache

  if (!PUBLISHABLE_API_KEY) {
    throw new Error(
      "NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY is missing. Pass at Docker build: --build-arg NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=pk_..."
    )
  }

  if (
    !regionMap.keys().next().value ||
    regionMapUpdated < Date.now() - 3600 * 1000
  ) {
    const { regions } = await fetchJsonFromMedusa<{ regions: HttpTypes.StoreRegion[] }>(
      "/store/regions"
    )

    if (!regions?.length) {
      throw new Error(
        "No regions found. Please set up regions in your Medusa Admin."
      )
    }

    regionMap.clear()
    regions.forEach((region: HttpTypes.StoreRegion) => {
      region.countries?.forEach((c) => {
        regionMap.set(c.iso_2 ?? "", region)
      })
    })

    regionMapCache.regionMapUpdated = Date.now()
  }

  return regionMapCache.regionMap
}

async function getCountryCode(
  request: NextRequest,
  regionMap: Map<string, HttpTypes.StoreRegion | number>
) {
  try {
    let countryCode

    const vercelCountryCode = request.headers
      .get("x-vercel-ip-country")
      ?.toLowerCase()

    const urlCountryCode = request.nextUrl.pathname.split("/")[1]?.toLowerCase()
    const fallback = getDefaultRegion()

    if (urlCountryCode && regionMap.has(urlCountryCode)) {
      countryCode = urlCountryCode
    } else if (vercelCountryCode && regionMap.has(vercelCountryCode)) {
      countryCode = vercelCountryCode
    } else if (regionMap.has(fallback)) {
      countryCode = fallback
    } else if (regionMap.keys().next().value) {
      countryCode = regionMap.keys().next().value
    }

    return countryCode
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("getCountryCode:", error)
    }
  }
}

async function debugMiddleware() {
  const base = getBackendUrl()
  const url = `${base.replace(/\/$/, "")}/store/regions`
  let fetchStatus: number | null = null
  let fetchMessage: string | null = null
  try {
    const res = await fetch(url, {
      headers: {
        "x-publishable-api-key": (PUBLISHABLE_API_KEY ?? "") || "",
        Accept: "application/json",
      },
      cache: "no-store",
    })
    fetchStatus = res.status
    const ct = res.headers.get("content-type") ?? ""
    if (!ct.includes("application/json")) {
      fetchMessage = `non-JSON: ${ct} ${(await res.text()).slice(0, 120)}`
    } else {
      const json = await res.json().catch(() => ({}))
      fetchMessage = (json as { message?: string }).message ?? res.statusText
    }
  } catch (e) {
    fetchMessage = e instanceof Error ? e.message : String(e)
  }
  return NextResponse.json(
    {
      keyPresent: !!PUBLISHABLE_API_KEY,
      backendUrlResolved: base || null,
      kubernetes: !!process.env.KUBERNETES_SERVICE_HOST,
      defaultRegion: getDefaultRegion(),
      staticOnly: isStaticRegionOnly(),
      medusaBackendUrlEnv: process.env.MEDUSA_BACKEND_URL ?? null,
      fetchStatus,
      fetchMessage,
    },
    { status: 200 }
  )
}

export async function middleware(request: NextRequest) {
  if (request.nextUrl.searchParams.get("__middleware_debug") === "1") {
    return debugMiddleware()
  }

  let redirectUrl = request.nextUrl.href
  let response = NextResponse.redirect(redirectUrl, 307)
  const cacheIdCookie = request.cookies.get("_medusa_cache_id")
  const cacheId = cacheIdCookie?.value || crypto.randomUUID()

  let regionMap: Map<string, HttpTypes.StoreRegion | number>
  try {
    regionMap = await getRegionMap(cacheId)
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    const dr = getDefaultRegion()
    regionMap = syntheticRegionMapForCountry(dr)
    if (process.env.NODE_ENV === "development") {
      console.warn(
        "[middleware] getRegionMap failed, using DEFAULT_REGION only:",
        msg
      )
    }
  }

  const countryCode = regionMap && (await getCountryCode(request, regionMap))

  const urlHasCountryCode =
    countryCode && request.nextUrl.pathname.split("/")[1]?.includes(countryCode)

  if (urlHasCountryCode && cacheIdCookie) {
    return NextResponse.next()
  }

  if (urlHasCountryCode && !cacheIdCookie) {
    response.cookies.set("_medusa_cache_id", cacheId, {
      maxAge: 60 * 60 * 24,
    })
    return response
  }

  if (request.nextUrl.pathname.includes(".")) {
    return NextResponse.next()
  }

  const redirectPath =
    request.nextUrl.pathname === "/" ? "" : request.nextUrl.pathname

  const queryString = request.nextUrl.search ? request.nextUrl.search : ""

  if (!urlHasCountryCode && countryCode) {
    redirectUrl = `${request.nextUrl.origin}/${countryCode}${redirectPath}${queryString}`
    response = NextResponse.redirect(`${redirectUrl}`, 307)
  } else if (!urlHasCountryCode && !countryCode) {
    return new NextResponse(
      "No valid regions configured. Set regions in Medusa Admin or DEFAULT_REGION in K8s.",
      { status: 500 }
    )
  }

  return response
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|images|assets|png|svg|jpg|jpeg|gif|webp).*)",
  ],
  runtime: "nodejs",
}
