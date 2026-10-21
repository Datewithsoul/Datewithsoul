import { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";
import { ClassEventStatus } from "@/app/generated/prisma";
import { SITE_URL } from "@/lib/seo";

// Regenerate hourly so newly published classes show up without a redeploy
export const revalidate = 3600;

// Google ignores <priority> and <changefreq>, so entries only carry url + lastmod
const STATIC_PATHS = ["", "/classes", "/schedule", "/how-it-works", "/faq", "/contact", "/terms", "/privacy"];

async function upcomingClassEntries(): Promise<MetadataRoute.Sitemap> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  try {
    const classes = await prisma.classEvent.findMany({
      where: { date: { gte: today }, status: ClassEventStatus.PUBLISHED },
      select: { id: true, updatedAt: true },
      orderBy: { date: "asc" },
    });
    return classes.map((c) => ({ url: `${SITE_URL}/classes/${c.id}`, lastModified: c.updatedAt }));
  } catch (error) {
    // Keep the static part of the sitemap available if the database is unreachable
    console.error("sitemap: failed to load classes", error);
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticEntries = STATIC_PATHS.map((path) => ({ url: `${SITE_URL}${path}` }));
  return [...staticEntries, ...(await upcomingClassEntries())];
}
