import { readdir, unlink, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { STORE_CONFIG } from "./src/config.js";
import products from "./src/data/products.js";

function sitemapPlugin() {
  let siteUrl = "";
  let outputDir = "";

  return {
    name: "generate-sitemap",
    apply: "build",
    configResolved(config) {
      siteUrl = config.env.VITE_SITE_URL || process.env.VITE_SITE_URL || STORE_CONFIG.siteUrl;
      outputDir = resolve(config.root, config.build.outDir);
    },
    transformIndexHtml(html) {
      return html.replaceAll("__SITE_URL__", siteUrl.replace(/\/+$/, ""));
    },
    async closeBundle() {
      let base;
      try {
        base = new URL(siteUrl);
      } catch {
        throw new Error("[sitemap] VITE_SITE_URL must be a valid http(s) origin.");
      }
      if (!["http:", "https:"].includes(base.protocol) || base.pathname !== "/" || base.search || base.hash) {
        throw new Error("[sitemap] VITE_SITE_URL must be a bare http(s) origin, e.g. https://example.com.");
      }

      const paths = new Set(["/", "/products", "/about", "/contact"]);
      products.forEach((product) => paths.add(`/product/${product.id}`));
      const categories = [...new Set(products.map((product) => product.category))];
      const genders = [...new Set(products.map((product) => product.gender))];
      categories.forEach((category) => {
        paths.add(`/products?${new URLSearchParams({ category })}`);
        genders
          .filter((gender) => products.some((product) => product.category === category && product.gender === gender))
          .forEach((gender) => {
            paths.add(`/products?${new URLSearchParams({ category, gender })}`);
          });
      });
      genders.forEach((gender) => paths.add(`/products?${new URLSearchParams({ gender })}`));

      const escapeXml = (value) => value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
      const urls = [...paths]
        .map((path) => `  <url><loc>${escapeXml(new URL(path, base).href)}</loc></url>`)
        .join("\n");
      const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
      const robots = `User-agent: *\nAllow: /\nSitemap: ${new URL("/sitemap.xml", base).href}\n`;
      await Promise.all([
        writeFile(resolve(outputDir, "sitemap.xml"), sitemap, "utf8"),
        writeFile(resolve(outputDir, "robots.txt"), robots, "utf8"),
      ]);
    },
  };
}

function excludeOptimizedImageSourcesPlugin() {
  let outputDir = "";

  return {
    name: "exclude-optimized-image-sources",
    apply: "build",
    configResolved(config) {
      outputDir = resolve(config.root, config.build.outDir);
    },
    async closeBundle() {
      const imagesDir = resolve(outputDir, "images");
      const entries = await readdir(imagesDir, { withFileTypes: true });
      const originals = entries.filter(
        ({ name }) => /^img.*\.png$/i.test(name) || ["banner.png", "shop3.png"].includes(name),
      );
      await Promise.all(originals.map(({ name }) => unlink(resolve(imagesDir, name))));
    },
  };
}

export default defineConfig({
  plugins: [react(), sitemapPlugin(), excludeOptimizedImageSourcesPlugin()],
});
