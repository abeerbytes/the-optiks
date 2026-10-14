import { Link } from "react-router-dom";
import { Trash2 } from "lucide-react";
import { STORE_CONFIG } from "../config";
import { formatPrice } from "../utils";
import { useCart } from "../context/CartContext";
import usePageMeta from "../hooks/usePageMeta";
import EmptyState from "../components/EmptyState";
import Img from "../components/Img";
import QtyControl from "../components/QtyControl";

export default function Cart() {
  usePageMeta(`Your cart | ${STORE_CONFIG.name}`, "Review the items in your cart.", { noIndex: true });
  const { lines, count, totals, setQuantity, removeItem, clearCart } = useCart();

  if (!lines.length) {
    return (
      <div className="container page">
        <EmptyState
          title="Your cart is empty"
          text="Add a frame you like and it will show up here."
          to="/products"
          cta="Shop products"
        />
      </div>
    );
  }

  return (
    <div className="container page">
      <header className="page-head">
        <h1 className="page-title">Your cart</h1>
        <p>
          {count} {count === 1 ? "item" : "items"}
        </p>
      </header>

      <div className="cart-layout">
        <ul className="cart-list">
          {lines.map(({ product, quantity }) => (
            <li key={product.id} className="cart-line">
              <Link to={`/product/${product.id}`} className="cart-thumb">
                <Img src={product.image} alt={`${product.name} ${product.category}`} />
              </Link>
              <div className="cart-info">
                <p className="muted">{product.category}</p>
                <h2>
                  <Link to={`/product/${product.id}`}>{product.name}</Link>
                </h2>
                <p className="muted">{formatPrice(product.price)} each</p>
                <div className="cart-controls">
                  <QtyControl
                    value={quantity}
                    onChange={(v) => setQuantity(product.id, v)}
                    label={`Quantity for ${product.name}`}
                  />
                  <button
                    type="button"
                    className="link-btn"
                    onClick={() => removeItem(product.id)}
                    aria-label={`Remove ${product.name}`}
                  >
                    <Trash2 size={16} aria-hidden="true" /> Remove
                  </button>
                </div>
              </div>
              <p className="cart-sub" aria-label="Item subtotal">
                {formatPrice(product.price * quantity)}
              </p>
            </li>
          ))}
        </ul>

        <aside className="summary" aria-labelledby="sum-title">
          <h2 id="sum-title">Order summary</h2>
          <dl className="sum-rows">
            <div><dt>Subtotal</dt><dd>{formatPrice(totals.subtotal)}</dd></div>
            <div><dt>Delivery</dt><dd>{totals.delivery ? formatPrice(totals.delivery) : "Free"}</dd></div>
            <div className="sum-total"><dt>Total</dt><dd>{formatPrice(totals.total)}</dd></div>
          </dl>
          <Link to="/checkout" className="btn btn-primary btn-block">
            Proceed to checkout
          </Link>
          <div className="summary-links">
            <Link to="/products" className="link-btn">Continue shopping</Link>
            <button type="button" className="link-btn" onClick={clearCart}>
              Clear cart
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
}
