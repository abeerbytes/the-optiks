import { STORE_CONFIG } from "./config";
import products from "./data/products";

export const MAX_QTY = 10;

// "Rs. 4,900"
export const formatPrice = (n) =>
  `Rs. ${Number(n || 0).toLocaleString("en-US")}`;

export const getProduct = (id) => products.find((p) => p.id === Number(id));

// lines = [{ product, quantity }]  — single source of truth for all totals
export function calcTotals(lines) {
  const subtotal = lines.reduce((sum, l) => sum + l.product.price * l.quantity, 0);
  const delivery = subtotal === 0 ? 0 : STORE_CONFIG.deliveryFee;
  return { subtotal, delivery, total: subtotal + delivery };
}

// Unique, sorted filter values generated from products.js (no hard-coded lists)
export const uniqueValues = (key) => [...new Set(products.map((p) => p[key]))];
