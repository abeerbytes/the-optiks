import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import React from "react";
import { renderToString } from "react-dom/server";
import { StaticRouter } from "react-router-dom/server.js";
import { createServer } from "vite";

const outputDir = resolve(process.cwd(), "dist");
const indexPath = resolve(outputDir, "index.html");
const indexTemplate = await readFile(indexPath, "utf8");
const vite = await createServer({
  server: { middlewareMode: true },
  appType: "custom",
});

const escapeHtml = (value) =>
  String(value).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

function replaceMeta(html, attribute, key, content) {
  const pattern = new RegExp(`<meta\\s+${attribute}="${escapeRegExp(key)}"[^>]*>`, "i");
  const tag = `<meta ${attribute}="${escapeHtml(key)}" content="${escapeHtml(content)}" />`;
  if (!pattern.test(html)) throw new Error(`[prerender] Missing meta tag: ${attribute}="${key}".`);
  return html.replace(pattern, tag);
}

function renderDocument(metadata, markup, hydrate = true, preloadHero = false) {
  let html = indexTemplate.replace(
    /<title>[\s\S]*?<\/title>/i,
    `<title>${escapeHtml(metadata.title)}</title>`
  );
  if (!preloadHero) {
    html = html.replace(/<link\s+rel="preload"\s+as="image"\s+href="\/images\/banner\.jpg"\s+fetchpriority="high"\s*\/?>/i, "");
  }
  html = replaceMeta(html, "name", "description", metadata.description);
  html = replaceMeta(html, "name", "robots", metadata.robots);
  html = replaceMeta(html, "property", "og:site_name", "The Optiks");
  html = replaceMeta(html, "property", "og:type", metadata.openGraphType);
  html = replaceMeta(html, "property", "og:title", metadata.title);
  html = replaceMeta(html, "property", "og:description", metadata.description);
  html = replaceMeta(html, "property", "og:url", metadata.canonicalUrl);
  html = replaceMeta(html, "property", "og:image", metadata.imageUrl);
  html = replaceMeta(html, "property", "og:image:alt", "The Optiks eyewear");
  html = replaceMeta(html, "name", "twitter:card", "summary_large_image");
  html = replaceMeta(html, "name", "twitter:title", metadata.title);
  html = replaceMeta(html, "name", "twitter:description", metadata.description);
  html = replaceMeta(html, "name", "twitter:image", metadata.imageUrl);
  html = html.replace(
    /<link\s+rel="canonical"\s+href="[^"]*"\s*\/?>/i,
    `<link rel="canonical" href="${escapeHtml(metadata.canonicalUrl)}" />`
  );
  const schemas = JSON.stringify(metadata.schemas).replace(/</g, "\\u003c");
  html = html.replace("</head>", `<script id="structured-data" type="application/ld+json">${schemas}</script>\n</head>`);
  const root = `<div id="root"${hydrate ? "" : ' data-hydrate="false"'}>${markup}</div>`;
  if (!/<div id="root"><\/div>/.test(html)) throw new Error("[prerender] Could not find the empty app root in index.html.");
  return html.replace(/<div id="root"><\/div>/, root);
}

try {
  const [{ default: App }, { PageMetaContext }, { default: products }] = await Promise.all([
    vite.ssrLoadModule("/src/App.jsx"),
    vite.ssrLoadModule("/src/hooks/usePageMeta.js"),
    vite.ssrLoadModule("/src/data/products.js"),
  ]);
  const routes = [
    { location: "/", output: "index.html" },
    { location: "/products", output: "products/index.html" },
    { location: "/about", output: "about/index.html" },
    { location: "/contact", output: "contact/index.html" },
    { location: "/cart", output: "cart/index.html" },
    { location: "/checkout", output: "checkout/index.html" },
    ...products.map((product) => ({
      location: `/product/${product.id}`,
      output: `product/${product.id}/index.html`,
    })),
  ];

  for (const route of routes) {
    let metadata;
    const registerMeta = (pageMetadata) => {
      if (metadata) throw new Error(`[prerender] Multiple page metadata registrations for ${route.location}.`);
      metadata = pageMetadata;
    };
    const app = React.createElement(
      PageMetaContext.Provider,
      { value: registerMeta },
      React.createElement(
        StaticRouter,
        { location: route.location },
        React.createElement(App)
      )
    );
    const markup = renderToString(app);
    if (!metadata) throw new Error(`[prerender] No page metadata registered for ${route.location}.`);
    const outputPath = resolve(outputDir, route.output);
    await mkdir(dirname(outputPath), { recursive: true });
    await writeFile(outputPath, renderDocument(metadata, markup, true, route.location === "/"), "utf8");
  }

  let notFoundMetadata;
  const notFoundApp = React.createElement(
    PageMetaContext.Provider,
    { value: (pageMetadata) => { notFoundMetadata = pageMetadata; } },
    React.createElement(StaticRouter, { location: "/not-found" }, React.createElement(App))
  );
  const notFoundMarkup = renderToString(notFoundApp);
  if (!notFoundMetadata) throw new Error("[prerender] No page metadata registered for the 404 page.");
  await writeFile(
    resolve(outputDir, "404.html"),
    renderDocument(notFoundMetadata, notFoundMarkup, false),
    "utf8"
  );
  console.log(`[prerender] Generated ${routes.length} route pages and a 404 page.`);
} finally {
  await vite.close();
}
