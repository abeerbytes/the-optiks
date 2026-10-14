import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { STORE_CONFIG } from "../config";

const upsertMeta = (attribute, key, content) => {
  let tag = document.head.querySelector(`meta[${attribute}="${key}"]`);
  if (!tag) {
    tag = document.createElement("meta");
    tag.setAttribute(attribute, key);
    document.head.appendChild(tag);
  }
  tag.setAttribute("content", content);
};

export default function usePageMeta(title, description, {
  noIndex = false,
  canonicalPath,
  image = "/images/banner.jpg",
  openGraphType = "website",
  schema = [],
  enabled = true,
} = {}) {
  const location = useLocation();
  const schemaJson = JSON.stringify(Array.isArray(schema) ? schema : [schema]).replace(/</g, "\\u003c");

  useEffect(() => {
    if (!enabled) return;

    document.title = title;

    upsertMeta("name", "description", description || "Page not found.");

    const configuredSiteUrl = import.meta.env.VITE_SITE_URL || STORE_CONFIG.siteUrl;
    const siteUrl = configuredSiteUrl.replace(/\/+$/, "");
    const canonicalUrl = new URL(canonicalPath || location.pathname, `${siteUrl}/`).href;
    const imageUrl = new URL(image, `${siteUrl}/`).href;
    const logoUrl = new URL("/images/logo.png", `${siteUrl}/`).href;
    const robots = noIndex ? "noindex, follow" : "index, follow, max-image-preview:large";

    upsertMeta("name", "robots", robots);
    upsertMeta("property", "og:site_name", STORE_CONFIG.name);
    upsertMeta("property", "og:type", openGraphType);
    upsertMeta("property", "og:title", title);
    upsertMeta("property", "og:description", description || "Page not found.");
    upsertMeta("property", "og:url", canonicalUrl);
    upsertMeta("property", "og:image", imageUrl);
    upsertMeta("property", "og:image:alt", `${STORE_CONFIG.name} eyewear`);
    upsertMeta("name", "twitter:card", "summary_large_image");
    upsertMeta("name", "twitter:title", title);
    upsertMeta("name", "twitter:description", description || "Page not found.");
    upsertMeta("name", "twitter:image", imageUrl);

    let canonical = document.head.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.setAttribute("rel", "canonical");
      document.head.appendChild(canonical);
    }
    canonical.setAttribute("href", canonicalUrl);

    const globalSchemas = [
      {
        "@context": "https://schema.org",
        "@type": "Organization",
        name: STORE_CONFIG.name,
        url: `${siteUrl}/`,
        logo: logoUrl,
      },
      {
        "@context": "https://schema.org",
        "@type": "WebSite",
        name: STORE_CONFIG.name,
        url: `${siteUrl}/`,
        potentialAction: {
          "@type": "SearchAction",
          target: `${siteUrl}/products?q={search_term_string}`,
          "query-input": "required name=search_term_string",
        },
      },
      ...JSON.parse(schemaJson),
    ];
    let structuredData = document.getElementById("structured-data");
    if (!structuredData) {
      structuredData = document.createElement("script");
      structuredData.id = "structured-data";
      structuredData.type = "application/ld+json";
      document.head.appendChild(structuredData);
    }
    structuredData.textContent = JSON.stringify(globalSchemas).replace(/</g, "\\u003c");
  }, [title, description, noIndex, canonicalPath, image, openGraphType, schemaJson, enabled, location.pathname, location.search]);
}
