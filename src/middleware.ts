import { HttpTypes } from "@medusajs/types"
import { NextRequest, NextResponse } from "next/server"

/** In-cluster Medusa (K8s); avoids relying on Traefik/DNS from inside the pod. */
const K8S_DEFAULT_BACKEND =
  "http://medusa-backend.medusa-store.svc.cluster.local:9000"

/**
 * Resolve at call time (not module load) so K8s-injected env is visible in Node middleware.
 * Order: runtime server URL → public URL (build-time) → K8s default when running in-cluster.
 */
function getBackendUrl(): string {
  return (
    process.env.MEDUSA_BACKEND_URL?.trim() ||
    process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL?.trim() ||
    (typeof process.env.KUBERNETES_SERVICE_HOST === "string"
      ? K8S_DEFAULT_BACKEND
      : "")
  )
}

const PUBLISHABLE_API_KEY = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY
const DEFAULT_REGION = process.env.NEXT_PUBLIC_DEFAULT_REGION || "us"

const regionMapCache = {
  regionMap: new Map<string, HttpTypes.StoreRegion>(),
  regionMapUpdated: Date.now(),
}

async function fetchJsonFromMedusa<T>(path: string): Promise<T> {
  const base = getBackendUrl()
  if (!base) {
    throw new Error(
      "No backend URL: set MEDUSA_BACKEND_URL (K8s) or NEXT_PUBLIC_MEDUSA_BACKEND_URL (build)."
    )
  }
  const url = `${base.replace(/\/$/, "")}${path.startsWith("/") ? path : `/${path}`}`
  // Do NOT use next.revalidate / force-cache here — in middleware it can return wrong/stale data
  // (including HTML) from Next's Data Cache.
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

async function getRegionMap(_cacheId: string) {
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

    // Create a map of country codes to regions.
    regions.forEach((region: HttpTypes.StoreRegion) => {
      region.countries?.forEach((c) => {
        regionMapCache.regionMap.set(c.iso_2 ?? "", region)
      })
    })

    regionMapCache.regionMapUpdated = Date.now()
  }

  return regionMapCache.regionMap
}

/**
 * Fetches regions from Medusa and sets the region cookie.
 * @param request
 * @param response
 */
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

    if (urlCountryCode && regionMap.has(urlCountryCode)) {
      countryCode = urlCountryCode
    } else if (vercelCountryCode && regionMap.has(vercelCountryCode)) {
      countryCode = vercelCountryCode
    } else if (regionMap.has(DEFAULT_REGION)) {
      countryCode = DEFAULT_REGION
    } else if (regionMap.keys().next().value) {
      countryCode = regionMap.keys().next().value
    }

    return countryCode
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error(
        "Middleware: set NEXT_PUBLIC_MEDUSA_BACKEND_URL at build time."
      )
    }
  }
}

/**
 * Debug: hit /?__middleware_debug=1 to see what Edge middleware sees and what the backend returns.
 * Remove or guard with NODE_ENV once done.
 */
async function debugMiddleware(request: NextRequest) {
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
      keyPrefix: PUBLISHABLE_API_KEY ? `${PUBLISHABLE_API_KEY.slice(0, 20)}...` : null,
      keyLength: PUBLISHABLE_API_KEY ? PUBLISHABLE_API_KEY.length : 0,
      backendUrlResolved: base || null,
      kubernetes: !!process.env.KUBERNETES_SERVICE_HOST,
      fetchStatus,
      fetchMessage,
    },
    { status: 200 }
  )
}

/**
 * Middleware to handle region selection and onboarding status.
 */
export async function middleware(request: NextRequest) {
  if (request.nextUrl.searchParams.get("__middleware_debug") === "1") {
    return debugMiddleware(request)
  }

  let redirectUrl = request.nextUrl.href

  let response = NextResponse.redirect(redirectUrl, 307)

  let cacheIdCookie = request.cookies.get("_medusa_cache_id")

  let cacheId = cacheIdCookie?.value || crypto.randomUUID()

  let regionMap
  try {
    regionMap = await getRegionMap(cacheId)
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    return new NextResponse(
      JSON.stringify({
        error: "getRegionMap failed",
        message: msg,
        keyPresent: !!PUBLISHABLE_API_KEY,
      }),
      { status: 502, headers: { "Content-Type": "application/json" } }
    )
  }

  const countryCode = regionMap && (await getCountryCode(request, regionMap))

  const urlHasCountryCode =
    countryCode && request.nextUrl.pathname.split("/")[1].includes(countryCode)

  // if one of the country codes is in the url and the cache id is set, return next
  if (urlHasCountryCode && cacheIdCookie) {
    return NextResponse.next()
  }

  // if one of the country codes is in the url and the cache id is not set, set the cache id and redirect
  if (urlHasCountryCode && !cacheIdCookie) {
    response.cookies.set("_medusa_cache_id", cacheId, {
      maxAge: 60 * 60 * 24,
    })

    return response
  }

  // check if the url is a static asset
  if (request.nextUrl.pathname.includes(".")) {
    return NextResponse.next()
  }

  const redirectPath =
    request.nextUrl.pathname === "/" ? "" : request.nextUrl.pathname

  const queryString = request.nextUrl.search ? request.nextUrl.search : ""

  // If no country code is set, we redirect to the relevant region.
  if (!urlHasCountryCode && countryCode) {
    redirectUrl = `${request.nextUrl.origin}/${countryCode}${redirectPath}${queryString}`
    response = NextResponse.redirect(`${redirectUrl}`, 307)
  } else if (!urlHasCountryCode && !countryCode) {
    // Handle case where no valid country code exists (empty regions)
    return new NextResponse(
      "No valid regions configured. Please set up regions with countries in your Medusa Admin.",
      { status: 500 }
    )
  }

  return response
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|images|assets|png|svg|jpg|jpeg|gif|webp).*)",
  ],
  // Node runtime: read MEDUSA_BACKEND_URL from the container (e.g. in-cluster Medusa URL).
  runtime: "nodejs",
}
