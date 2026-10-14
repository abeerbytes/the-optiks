import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Check, RefreshCw, ShieldCheck, Truck } from "lucide-react";
import { STORE_CONFIG } from "../config";
import { MAX_QTY, formatPrice, getProduct } from "../utils";
import { categoryUrl, getRelated } from "../catalog";
import { useCart } from "../context/CartContext";
import usePageMeta from "../hooks/usePageMeta";
import Img from "../components/Img";
import ProductCard from "../components/ProductCard";
import QtyControl from "../components/QtyControl";
import SectionTitle from "../components/SectionTitle";
import ZoomImage from "../components/ZoomImage";
import NotFound from "./NotFound";

export default function ProductPage() {
  const { id } = useParams();
  return <ProductDetail key={id} id={id} />;
}

function ProductDetail({ id }) {
  const navigate = useNavigate();
  const { addItem } = useCart();
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const [imgIndex, setImgIndex] = useState(0);
  const timer = useRef(null);

  const product = /^\d+$/.test(id) ? getProduct(id) : undefined;
  const related = useMemo(() => (product ? getRelated(product, 4) : []), [product]);
  const gallery = product?.images?.length ? product.images : product ? [product.image] : [];
  const siteUrl = (import.meta.env.VITE_SITE_URL || STORE_CONFIG.siteUrl).replace(/\/+$/, "");
  const productSchema = product
    ? [
        {
          "@context": "https://schema.org",
          "@type": "Product",
          name: product.name,
          description: product.description,
          sku: product.model || String(product.id),
          image: gallery.map((src) => new URL(src, `${siteUrl}/`).href),
          offers: {
            "@type": "Offer",
            price: Number(product.price),
            priceCurrency: STORE_CONFIG.currency,
            availability: `https://schema.org/${product.available ? "InStock" : "OutOfStock"}`,
            url: new URL(`/product/${product.id}`, `${siteUrl}/`).href,
          },
        },
        {
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home", item: new URL("/", `${siteUrl}/`).href },
            {
              "@type": "ListItem",
              position: 2,
              name: product.category,
              item: new URL(categoryUrl(product.category), `${siteUrl}/`).href,
            },
            { "@type": "ListItem", position: 3, name: product.name, item: new URL(`/product/${product.id}`, `${siteUrl}/`).href },
          ],
        },
      ]
    : [];

  usePageMeta(
    product ? `${product.name} | ${STORE_CONFIG.name}` : `Product not found | ${STORE_CONFIG.name}`,
    product ? `${product.name}. ${product.description} Price: ${formatPrice(product.price)}.` : "",
    {
      noIndex: !product,
      image: product ? gallery[0] : "/images/logo-small.png",
      openGraphType: product ? "product" : "website",
      schema: productSchema,
    }
  );
  useEffect(() => () => clearTimeout(timer.current), []);

  if (!product) return <NotFound product manageMeta={false} />;
  const unavailable = !product.available;

  const handleAdd = () => {
    addItem(product.id, qty);
    setAdded(true);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setAdded(false), 4000);
  };
  const handlePlaceOrder = () => {
    addItem(product.id, qty);
    navigate("/checkout");
  };

  const details = [
    ["Category", product.category],
    ["Gender", product.gender],
    ...(product.size ? [["Size", product.size]] : []),
  ];

  return (
    <div className="container page">
      <nav className="crumbs" aria-label="Breadcrumb">
        <Link to="/">Home</Link>
        <span aria-hidden="true">/</span>
        <Link to={categoryUrl(product.category)}>{product.category}</Link>
        <span aria-hidden="true">/</span>
        <span aria-current="page">{product.name}</span>
      </nav>

      <div className="pd">
        <div className="pd-gallery">
          <div className="pd-media">
            <ZoomImage src={gallery[imgIndex]} alt={`${product.name} ${product.category}`} />
          </div>
          {gallery.length > 1 && (
            <ul className="thumbs" aria-label="Product photos">
              {gallery.map((src, i) => (
                <li key={src}>
                  <button
                    type="button"
                    className={i === imgIndex ? "thumb active" : "thumb"}
                    aria-label={`Show photo ${i + 1}`}
                    aria-pressed={i === imgIndex}
                    onClick={() => setImgIndex(i)}
                  >
                    <Img src={src} alt="" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="pd-info">
          <p className="pd-cat">{product.category}</p>
          <h1>{product.name}</h1>
          <p className="pd-price">{formatPrice(product.price)}</p>
          <p className="pd-desc">{product.description}</p>

          {unavailable ? (
            <p className="notice">This product is currently unavailable.</p>
          ) : (
            <>
              <div className="pd-qty">
                <span>Quantity</span>
                <QtyControl value={qty} onChange={(v) => setQty(Math.min(MAX_QTY, Math.max(1, v)))} label="Quantity" />
              </div>

              <div className="pd-actions">
                <button type="button" className="btn btn-primary btn-block" onClick={handleAdd}>
                  Add to cart
                </button>
                <button type="button" className="btn btn-outline btn-block" onClick={handlePlaceOrder}>
                  Place order
                </button>
              </div>

              <p className="added" role="status">
                {added && (
                  <>
                    <Check size={16} aria-hidden="true" /> Added to cart. <Link to="/cart">View cart</Link>
                  </>
                )}
              </p>
            </>
          )}

          <ul className="pd-perks">
            <li><Truck size={20} strokeWidth={1.4} aria-hidden="true" /> Delivery across Pakistan</li>
            <li><RefreshCw size={20} strokeWidth={1.4} aria-hidden="true" /> Easy exchange</li>
            <li><ShieldCheck size={20} strokeWidth={1.4} aria-hidden="true" /> Quality checked before dispatch</li>
          </ul>

          <details className="acc" open>
            <summary>Frame details</summary>
            <dl className="pd-details">
              {details.map(([k, v]) => (
                <div key={k}>
                  <dt>{k}</dt>
                  <dd>{v}</dd>
                </div>
              ))}
            </dl>
          </details>
          <details className="acc">
            <summary>Delivery and exchange</summary>
            <p>
              We deliver across Pakistan. Standard delivery is {formatPrice(STORE_CONFIG.deliveryFee)}. If the frame does not suit you, message us on WhatsApp
              and we will help with an exchange.
            </p>
          </details>
        </div>
      </div>

      {related.length > 0 && (
        <section className="related" aria-labelledby="rel-title">
          <SectionTitle id="rel-title">You may also like</SectionTitle>
          <div className="grid">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
