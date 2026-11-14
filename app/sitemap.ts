import type { MetadataRoute } from "next";
import { site } from "@/lib/site";

// Only existing public routes. Update this list when the approved site
// structure changes; do not include drafts, private pages, or API endpoints.
const publicPaths = [
  "/",
  "/about",
  "/contact",
  "/method",
  "/applications",
  "/standards",
  "/evidence",
] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  return publicPaths.map((path) => ({
    url: new URL(path, site.url).toString(),
  }));
}
