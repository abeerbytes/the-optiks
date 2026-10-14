import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { STORE_CONFIG } from "../config";
import { SORTS, getCategories, getColors, getGenders, queryProducts } from "../catalog";
import usePageMeta from "../hooks/usePageMeta";
import ProductCard from "../components/ProductCard";

function Chips({ label, value, options, onPick }) {
  return (
    <div className="filter-group" role="group" aria-label={label}>
      <span className="filter-label">{label}</span>
      <div className="chips">
        {["All", ...options].map((o) => (
          <button
            key={o}
            type="button"
            className={o === value ? "chip active" : "chip"}
            aria-pressed={o === value}
            onClick={() => onPick(o)}
          >
            {o}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function Products() {
  const [params, setParams] = useSearchParams();
  const [filtersOpen, setFiltersOpen] = useState(false);

  // every filter list is generated from products.js
  const categories = useMemo(getCategories, []);
  const genders = useMemo(getGenders, []);
  const colors = useMemo(getColors, []);

  const pick = (key, valid) => (valid.includes(params.get(key)) ? params.get(key) : "All");
  const category = pick("category", categories);
  const gender = pick("gender", genders);
  const color = pick("color", colors);
  const q = params.get("q") || "";
  const sort = SORTS.some((s) => s.value === params.get("sort")) ? params.get("sort") : "featured";

  const update = (patch) => {
    const next = new URLSearchParams(params);
    Object.entries(patch).forEach(([k, v]) => {
      if (!v || v === "All" || (k === "sort" && v === "featured")) next.delete(k);
      else next.set(k, v);
    });
    setParams(next, { replace: true });
  };

  const list = useMemo(
    () => queryProducts({ category, gender, color, q, sort }),
    [category, gender, color, q, sort]
  );

  const active = [
    category !== "All" && { key: "category", label: category },
    gender !== "All" && { key: "gender", label: gender },
    color !== "All" && { key: "color", label: color },
    q && { key: "q", label: `“${q}”` },
  ].filter(Boolean);

  let heading = "All eyewear";
  if (gender !== "All" && category === "All") heading = `${gender}'s eyewear`;
  else if (gender === "All" && category !== "All") heading = category;
  else if (gender !== "All" && category !== "All") heading = `${gender}'s ${category.toLowerCase()}`;

  usePageMeta(
    `${heading} | ${STORE_CONFIG.name}`,
    `Browse ${heading.toLowerCase()} from ${STORE_CONFIG.name}. Explore frame styles, compare prices, and order online.`,
    {
      noIndex: Boolean(q || color !== "All" || params.has("sort")),
      canonicalPath: (() => {
        const canonicalParams = new URLSearchParams();
        if (category !== "All") canonicalParams.set("category", category);
        if (gender !== "All") canonicalParams.set("gender", gender);
        const query = canonicalParams.toString();
        return query ? `/products?${query}` : "/products";
      })(),
    }
  );

  return (
    <>
      <header className="page-band">
        <div className="container">
          <h1 className="page-title">{heading}</h1>
          <p>Frames chosen for comfort, clarity and everyday style.</p>
        </div>
      </header>

      <div className="container page products-page">
        <div className="toolbar">
          <label className="search">
            <span className="visually-hidden">Search frames</span>
            <Search size={18} aria-hidden="true" />
            <input
              type="search"
              placeholder="Search by name, colour or material"
              value={q}
              onChange={(e) => update({ q: e.target.value })}
            />
          </label>
          <label className="sort">
            <span>Sort by</span>
            <select value={sort} onChange={(e) => update({ sort: e.target.value })}>
              {SORTS.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </label>
          <button
            type="button"
            className="btn btn-outline filters-toggle"
            aria-expanded={filtersOpen}
            aria-controls="filters"
            onClick={() => setFiltersOpen((o) => !o)}
          >
            <SlidersHorizontal size={16} aria-hidden="true" /> Filters{active.length ? ` (${active.length})` : ""}
          </button>
        </div>

        <div id="filters" className={filtersOpen ? "filters open" : "filters"}>
          <Chips label="Category" value={category} options={categories} onPick={(v) => update({ category: v })} />
          {genders.length > 0 && (
            <Chips label="For" value={gender} options={genders} onPick={(v) => update({ gender: v })} />
          )}
          {colors.length > 1 && (
            <Chips label="Colour" value={color} options={colors} onPick={(v) => update({ color: v })} />
          )}
        </div>

        <div className="result-bar">
          <p className="result-count" aria-live="polite">
            {list.length} {list.length === 1 ? "product" : "products"}
          </p>
          {active.length > 0 && (
            <div className="active-tags">
              {active.map((a) => (
                <button key={a.key} type="button" className="tag-btn" onClick={() => update({ [a.key]: "" })}>
                  {a.label} <X size={14} aria-label="Remove filter" />
                </button>
              ))}
              <button type="button" className="link-btn" onClick={() => setParams({}, { replace: true })}>
                Clear all
              </button>
            </div>
          )}
        </div>

        {list.length ? (
          <div className="grid">
            {list.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        ) : (
          <div className="empty">
            <h2>No products found</h2>
            <p>Try another category or search term.</p>
            <button type="button" className="btn btn-primary" onClick={() => setParams({}, { replace: true })}>
              Clear filters
            </button>
          </div>
        )}
      </div>
    </>
  );
}
