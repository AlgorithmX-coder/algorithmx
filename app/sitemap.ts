import type { MetadataRoute } from "next";

/* The pages a search engine may index today: the corporate line and the
 * site's legal pages. The homepage and the consumer courses join when the
 * launch password comes off. */
export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://algorithmx.io";
  const now = new Date();
  return [
    { url: `${base}/corporate`, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/corporate/buy`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/corporate/security`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${base}/corporate/uk-gdpr`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${base}/corporate/eu-ai-act`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${base}/privacy`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${base}/terms`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
  ];
}
