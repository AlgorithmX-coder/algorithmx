import type { MetadataRoute } from "next";

/* Crawlers may read the public pages; the consoles, the API, the dev
 * harness and the launch gate are not for them. */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/api/", "/ai-cleared/ops", "/ai-cleared/admin", "/ai-cleared/join/", "/dev", "/test", "/password", "/hub", "/dashboard"] }],
    sitemap: "https://algorithmx.io/sitemap.xml",
  };
}
