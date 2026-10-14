import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, MapPin, MessageCircle, RefreshCw, ShieldCheck, Truck } from "lucide-react";
import products from "../data/products";
import { STORE_CONFIG } from "../config";
import { getCategories, getCategoryGroups, getCategoryInfo, categoryUrl } from "../catalog";
import { formatPrice } from "../utils";
import { whatsappSupportUrl } from "../services/orderService";
import usePageMeta from "../hooks/usePageMeta";
import Img from "../components/Img";
import ProductCard from "../components/ProductCard";
import Reveal from "../components/Reveal";
import SectionTitle from "../components/SectionTitle";

const SERVICES = [
  { icon: Truck, title: "Fast delivery", text: "Delivery across Pakistan" },
  { icon: RefreshCw, title: "Easy exchange", text: "Simple exchange process" },
  { icon: ShieldCheck, title: "Premium quality", text: "Quality eyewear products" },
  { icon: MessageCircle, title: "WhatsApp support", text: "Quick customer support" },
];

export default function Home() {
  usePageMeta(
    `${STORE_CONFIG.name} | Eyeglass Frames in Pakistan`,
    "Explore eyeglass frames from The Optiks with product photos, frame details and clear PKR pricing. Standard delivery is available across Pakistan."
  );

  // Everything below is generated from products.js
  const categories = useMemo(() => getCategories().map(getCategoryInfo), []);
  const categoryGroups = useMemo(
    () => getCategoryGroups().filter((group) => !["Kids", "Sunglasses"].includes(group.name)),
    []
  );
  const tabs = useMemo(() => ["All", ...categories.map((c) => c.name)], [categories]);
  const [tab, setTab] = useState("All");
  const shown = useMemo(
    () => products.filter((p) => p.available && (tab === "All" || p.category === tab)).slice(0, 8),
    [tab]
  );
  return (
    <>
      {/* ---------- Hero ---------- */}
      <section className="hero hero-image-only" aria-label="Featured banner">
        <h1 className="visually-hidden">Eyeglass frames from The Optiks</h1>
        <div className="hero-inner">
          <div className="hero-media hero-banner">
            <Img src="/images/banner.jpg" alt="Explore The Optiks eyewear collection" priority />
          </div>
        </div>
      </section>

      {/* ---------- Categories (auto-generated, Men/Women paired per category) ---------- */}
      <section className="section container" aria-labelledby="cat-title">
        <SectionTitle id="cat-title">Shop by category</SectionTitle>
        <div className="cat-groups">
          {categoryGroups.map((group) => (
            <Reveal as="div" className="cat-group" key={group.name}>
              <p className="cat-group-title">
                <span>{group.name}</span>
              </p>
              <div className={group.cards.length > 1 ? "cat-row" : "cat-row cat-row-single"}>
                {group.cards.map((c) => (
                  <Link key={c.key} to={c.to} className="cat-card">
                    <div className="cat-card-media">
                      <Img src={c.image} alt="" />
                    </div>
                    <span className="cat-tag">{c.label}</span>
                  </Link>
                ))}
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ---------- Featured with dynamic tabs ---------- */}
      <section className="section section-stone" aria-labelledby="feat-title">
        <div className="container">
          <SectionTitle id="feat-title">Featured eyewear</SectionTitle>
          <div className="tabs" role="tablist" aria-label="Filter featured eyewear">
            {tabs.map((t) => (
              <button
                key={t}
                type="button"
                role="tab"
                id={`tab-${t}`}
                aria-selected={tab === t}
                aria-controls="feat-panel"
                className={tab === t ? "tab active" : "tab"}
                onClick={() => setTab(t)}
              >
                {t}
              </button>
            ))}
          </div>
          <div id="feat-panel" role="tabpanel" aria-labelledby={`tab-${tab}`} className="grid">
            {shown.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
          <div className="center">
            <Link className="btn btn-primary" to={tab === "All" ? "/products" : categoryUrl(tab)}>
              {tab === "All" ? "View all products" : `View all ${tab.toLowerCase()}`}
            </Link>
          </div>
        </div>
      </section>

      {/* ---------- Banner ---------- */}
      <section className="container section" aria-label="Brand banner">
        <div className="banner-standalone">
          <div className="banner-standalone-copy">
            <p className="eyebrow">The Optiks</p>
            <h2>Premium frames for everyday style.</h2>
            <Link className="btn btn-primary" to="/products">Shop collection</Link>
          </div>
          <div className="banner-standalone-media">
            <Img src="/images/banner.jpg" alt="Premium eyewear collection banner" />
          </div>
        </div>
      </section>

      {/* ---------- Statement ---------- */}
      <section className="statement container" aria-label="Our promise">
        <p>Frames chosen with care, delivered with confidence.</p>
        <Link to="/about" className="text-link">
          Our story <ArrowRight size={16} aria-hidden="true" />
        </Link>
      </section>

      {/* ---------- Promo banners ---------- */}
      <section className="container promo-row" aria-label="Promotions">
        <div className="promo promo-light">
          <div className="promo-copy">
            <h2>Fast, reliable delivery</h2>
            <p>We deliver across Pakistan with speed, care, and convenience—so your new frames arrive on time, with easy exchange support whenever you need it.</p>
            <Link className="btn btn-primary" to="/products">
              Shop now
            </Link>
          </div>
          <div className="promo-media">
            <Img src={categories[1]?.image || categories[0]?.image} alt="" />
          </div>
        </div>
      </section>

      {/* ---------- Services ---------- */}
      <section id="services" className="services" aria-labelledby="svc-title">
        <div className="container">
          <h2 id="svc-title" className="visually-hidden">Our services</h2>
          <ul className="svc-grid">
            {SERVICES.map(({ icon: Icon, title, text }) => (
              <li key={title}>
                <Icon size={30} strokeWidth={1.3} aria-hidden="true" />
                <div>
                  <h3>{title}</h3>
                  <p>{text}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ---------- Stores ---------- */}
      <section id="visit" className="section container" aria-labelledby="visit-title">
        <div className="visit">
          <div className="visit-media">
            <Img src="/images/shop-1.jpg" alt="Interior of The Optiks eyewear store" />
          </div>
          <div className="visit-copy">
            <SectionTitle id="visit-title" align="left">Our Store</SectionTitle>
            <ul className="loc-list">
              {STORE_CONFIG.locations.map((l) => (
                <li key={`${l.city}-${l.area}-${l.address}`}>
                  <MapPin size={18} aria-hidden="true" />
                  <span>
                    <strong>{l.address}</strong>
                  </span>
                </li>
              ))}
            </ul>
            <div className="btn-row">
              <Link className="btn btn-primary" to="/contact">
                Contact us
              </Link>
              <a className="btn btn-outline" href={whatsappSupportUrl()} target="_blank" rel="noopener noreferrer">
                <MessageCircle size={18} aria-hidden="true" /> WhatsApp
              </a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
