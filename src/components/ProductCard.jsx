import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Check, ShoppingBag } from "lucide-react";
import Img from "./Img";
import { useCart } from "../context/CartContext";
import { formatPrice } from "../utils";

export default function ProductCard({ product }) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);
  const timer = useRef(null);
  useEffect(() => () => clearTimeout(timer.current), []);

  const add = () => {
    addItem(product.id, 1);
    setAdded(true);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setAdded(false), 1800);
  };

  const hover = product.images?.[1]; // optional second photo, shown on hover

  return (
    <article className="card">
      <Link to={`/product/${product.id}`} className="card-media" tabIndex={-1} aria-hidden="true">
        <Img src={product.image} alt="" className="card-img" />
        {hover && <Img src={hover} alt="" className="card-img card-img-alt" />}
        {!product.available && <span className="tag">Sold out</span>}
      </Link>
      <div className="card-body">
        <p className="card-cat">{product.category}</p>
        <h3 className="card-name">
          <Link to={`/product/${product.id}`}>{product.name}</Link>
        </h3>
        <p className="card-price">{formatPrice(product.price)}</p>
      </div>
      <button
        type="button"
        className={added ? "btn btn-sm card-add is-added" : "btn btn-sm card-add"}
        onClick={add}
        disabled={!product.available}
        aria-label={added ? `${product.name} added to cart` : `Add ${product.name} to cart`}
      >
        {added ? <Check size={15} aria-hidden="true" /> : <ShoppingBag size={15} aria-hidden="true" />}
        {added ? "Added" : "Add to cart"}
        <span className="visually-hidden" role="status">
          {added ? `${product.name} added to cart` : ""}
        </span>
      </button>
    </article>
  );
}
