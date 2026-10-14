const SHORT_LINK_HOSTS = ["maps.app.goo.gl", "goo.gl", "g.co"];

// Follows short share links (maps.app.goo.gl/...) to the full Google Maps URL
async function expandShortLink(url: string) {
  let current = url;
  for (let hop = 0; hop < 5; hop++) {
    const host = new URL(current).hostname;
    if (!SHORT_LINK_HOSTS.includes(host)) return current;

    const res = await fetch(current, {
      redirect: "manual",
      next: { revalidate: 60 * 60 * 24 },
    });
    const location = res.headers.get("location");
    if (!location) return current;
    current = new URL(location, current).toString();
  }
  return current;
}

/** Extracts something the Maps embed can search for: coordinates, a place name, or a query. */
export function parseMapQuery(url: string): string | null {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return null;
  }

  // Exact pin coordinates in place URLs: ...!3d13.7563!4d100.5018
  const pin = url.match(/!3d(-?\d+(?:\.\d+)?)!4d(-?\d+(?:\.\d+)?)/);
  if (pin) return `${pin[1]},${pin[2]}`;

  const q = parsed.searchParams.get("q") ?? parsed.searchParams.get("query") ?? parsed.searchParams.get("destination");
  if (q) return q;

  const place = parsed.pathname.match(/\/place\/([^/]+)/);
  if (place) return decodeURIComponent(place[1].replace(/\+/g, " "));

  // Map viewport center: /@13.7563,100.5018,17z
  const center = parsed.pathname.match(/@(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/);
  if (center) return `${center[1]},${center[2]}`;

  return null;
}

export async function resolveMapQuery(googleMapUrl: string | null, locationName: string | null) {
  if (googleMapUrl) {
    try {
      const fullUrl = await expandShortLink(googleMapUrl.trim());
      const query = parseMapQuery(fullUrl);
      if (query) return query;
    } catch (error) {
      console.error("Failed to resolve Google Maps link", error);
    }
  }
  return locationName?.trim() || null;
}

export function mapEmbedUrl(query: string) {
  return `https://maps.google.com/maps?q=${encodeURIComponent(query)}&z=16&hl=th&output=embed`;
}

export function mapDirectionsUrl(query: string) {
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(query)}`;
}
