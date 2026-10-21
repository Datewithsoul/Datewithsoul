import type { Metadata } from "next";

// Strips one trailing slash: matches the "/" in "https://a.com/", nothing in "https://a.com"
// https://regex101.com/?regex=%5C%2F%24&testString=https%3A%2F%2Fa.com%2F
const TRAILING_SLASH = /\/$/;
// public/logo.jpg is a 500×500 square
const LOGO_SIZE_PX = 500;

export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://datewithsoul.vercel.app").replace(TRAILING_SLASH, "");
export const SITE_NAME = "Date with Soul Love";
export const DEFAULT_OG_IMAGE = { url: "/logo.jpg", width: LOGO_SIZE_PX, height: LOGO_SIZE_PX, alt: SITE_NAME };

// Child metadata replaces (not merges) top-level keys like `alternates` and `openGraph`,
// so every indexable page sets its own canonical and og:url through this helper.
export function pageMetadata({
  title,
  description,
  path,
}: {
  title: string;
  description: string;
  path: string;
}): Metadata {
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      type: "website",
      locale: "th_TH",
      siteName: SITE_NAME,
      url: path,
      title: `${title} | ${SITE_NAME}`,
      description,
      images: [DEFAULT_OG_IMAGE],
    },
  };
}

export const noIndexMetadata: Metadata = {
  robots: { index: false, follow: false },
};
