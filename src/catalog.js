// ============================================================
//  Everything the UI needs to know about categories, genders,
//  colours, filtering and sorting is DERIVED from products.js.
//  Nothing here is hard-coded — add a product and it just works.
// ============================================================
import products, { categoryDetails } from "./data/products";

const unique = (list) => [...new Set(list.filter(Boolean))];

export const getCategories = () => unique(products.map((p) => p.category));

// Genders that are not already a category (avoids a duplicate "Kids")
export const getGenders = () => {
  const categories = getCategories();
  return unique(products.map((p) => p.gender)).filter((g) => !categories.includes(g));
};

export const getColors = () => unique(products.map((p) => p.color)).sort();

export const categoryUrl = (name) => `/products?category=${encodeURIComponent(name)}`;
export const genderUrl = (name) => `/products?gender=${encodeURIComponent(name)}`;

export function getCategoryInfo(name) {
  const list = products.filter((p) => p.category === name);
  const custom = categoryDetails[name] || {};
  return {
    name,
    count: list.length,
    image: custom.image || list[0]?.image,
    description: custom.description || `Explore our ${name.toLowerCase()} collection.`,
    to: categoryUrl(name),
  };
}

export function getGenderInfo(name) {
  const list = products.filter((p) => p.gender === name);
  // prefer a sunglasses photo for the big tile, fall back to the first product
  const pick = list.find((p) => /sun/i.test(p.category)) || list[0];
  return { name, count: list.length, image: pick?.image, to: genderUrl(name) };
}

const slugify = (s) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-+|-+$)/g, "");

// Homepage "Shop by category" section: a category becomes a Men/Women pair of
// cards when products.js has more than one gender in it, otherwise it's a
// single wide card (e.g. "Kids"). Add a new category/gender in products.js
// and a matching row appears here automatically, no other edit needed.
//
// Images are placeholders, not real photos — each card looks for a file at
// /images/category-<category>-<gender>.jpg (or /images/category-<category>.jpg
// for a single card) and falls back to the site's neutral placeholder until
// that file exists. Drop your own photo in at that path, or set a path
// yourself via categoryDetails in products.js:
//   Sunglasses: { images: { Men: "/images/my-photo.jpg" } }
export function getCategoryGroups() {
  return getCategories().map((name) => {
    const genders = unique(products.filter((p) => p.category === name).map((p) => p.gender));
    const custom = categoryDetails[name] || {};
    const cardFor = (gender) => ({
      key: gender || name,
      label: gender || name,
      to: gender ? `${categoryUrl(name)}&gender=${encodeURIComponent(gender)}` : categoryUrl(name),
      image:
        (gender ? custom.images?.[gender] : custom.image) ||
        `/images/category-${slugify(name)}${gender ? `-${slugify(gender)}` : ""}.jpg`,
    });
    return { name, to: categoryUrl(name), cards: genders.length > 1 ? genders.map(cardFor) : [cardFor(undefined)] };
  });
}

export const SORTS = [
  { value: "featured", label: "Featured" },
  { value: "newest", label: "Newest" },
  { value: "price-asc", label: "Price: low to high" },
  { value: "price-desc", label: "Price: high to low" },
  { value: "name", label: "Name: A to Z" },
];

export function queryProducts({ category = "All", gender = "All", color = "All", q = "", sort = "featured" } = {}) {
  const tokens = q.toLowerCase().split(/\s+/).filter(Boolean);
  const list = products.filter((p) => {
    if (category !== "All" && p.category !== category) return false;
    if (gender !== "All" && p.gender !== gender) return false;
    if (color !== "All" && p.color !== color) return false;
    if (!tokens.length) return true;
    const hay = [p.name, p.category, p.gender, p.color, p.material, p.frameType, p.description]
      .join(" ")
      .toLowerCase();
    return tokens.every((t) => hay.includes(t));
  });
  const by = {
    "price-asc": (a, b) => a.price - b.price,
    "price-desc": (a, b) => b.price - a.price,
    name: (a, b) => a.name.localeCompare(b.name),
    newest: (a, b) => b.id - a.id,
  }[sort];
  return by ? [...list].sort(by) : list;
}

// Same category first, then anything else, never the product itself
export function getRelated(product, count = 4) {
  const others = products.filter((p) => p.id !== product.id && p.available);
  const same = others.filter((p) => p.category === product.category);
  const rest = others.filter((p) => p.category !== product.category);
  return [...same, ...rest].slice(0, count);
}
