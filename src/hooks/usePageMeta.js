import { createContext, useContext, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { STORE_CONFIG } from "../config";

export const PageMetaContext = createContext(null);

const upsertMeta = (attribute, key, content) => {
  let tag = document.head.querySelector(`meta[${attribute}="${key}"]`);
  if (!tag) {
    tag = document.createElement("meta");
    tag.setAttribute(attribute, key);
    document.head.appendChild(tag);
  }
  tag.setAttribute("content", content);
};

export function resolvePageMeta({
  title,
  description,
  noIndex = false,
  canonicalPath,
  image = "/images/banner.jpg",
  openGraphType = "website",
  schema = [],
}, location) {
  const configuredSiteUrl = import.meta.env.VITE_SITE_URL || STORE_CONFIG.siteUrl;
  const siteUrl = configuredSiteUrl.replace(/\/+$/, "");
  const canonicalUrl = new URL(canonicalPath || location.pathname, `${siteUrl}/`).href;
  const imageUrl = new URL(image, `${siteUrl}/`).href;
  const logoUrl = new URL("/images/logo-small.png", `${siteUrl}/`).href;

  return {
    title,
    description: description || "Page not found.",
    canonicalUrl,
    imageUrl,
    robots: noIndex ? "noindex, follow" : "index, follow, max-image-preview:large",
    openGraphType,
    schemas: [
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
      ...(Array.isArray(schema) ? schema : [schema]),
    ],
  };
}

export default function usePageMeta(title, description, {
  noIndex = false,
  canonicalPath,
  image = "/images/banner.jpg",
  openGraphType = "website",
  schema = [],
  enabled = true,
} = {}) {
  const location = useLocation();
  const registerMeta = useContext(PageMetaContext);
  const schemaJson = JSON.stringify(Array.isArray(schema) ? schema : [schema]).replace(/</g, "\\u003c");
  const pageOptions = { title, description, noIndex, canonicalPath, image, openGraphType, schema };

  if (enabled && registerMeta) registerMeta(resolvePageMeta(pageOptions, location));

  useEffect(() => {
    if (!enabled) return;

    const metadata = resolvePageMeta(pageOptions, location);
    document.title = metadata.title;
    upsertMeta("name", "description", metadata.description);
    upsertMeta("name", "robots", metadata.robots);
    upsertMeta("property", "og:site_name", STORE_CONFIG.name);
    upsertMeta("property", "og:type", metadata.openGraphType);
    upsertMeta("property", "og:title", metadata.title);
    upsertMeta("property", "og:description", metadata.description);
    upsertMeta("property", "og:url", metadata.canonicalUrl);
    upsertMeta("property", "og:image", metadata.imageUrl);
    upsertMeta("property", "og:image:alt", `${STORE_CONFIG.name} eyewear`);
    upsertMeta("name", "twitter:card", "summary_large_image");
    upsertMeta("name", "twitter:title", metadata.title);
    upsertMeta("name", "twitter:description", metadata.description);
    upsertMeta("name", "twitter:image", metadata.imageUrl);

    let canonical = document.head.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.setAttribute("rel", "canonical");
      document.head.appendChild(canonical);
    }
    canonical.setAttribute("href", metadata.canonicalUrl);

    let structuredData = document.getElementById("structured-data");
    if (!structuredData) {
      structuredData = document.createElement("script");
      structuredData.id = "structured-data";
      structuredData.type = "application/ld+json";
      document.head.appendChild(structuredData);
    }
    structuredData.textContent = JSON.stringify(metadata.schemas).replace(/</g, "\\u003c");
  }, [title, description, noIndex, canonicalPath, image, openGraphType, schemaJson, enabled, location.pathname, location.search]);
}
