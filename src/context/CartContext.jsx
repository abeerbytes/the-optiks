import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { MAX_QTY, calcTotals, getProduct } from "../utils";

// Cart lives in localStorage and stores ONLY { id, quantity }.
// Names and prices always come from products.js.
const CART_KEY = "cart";
const clampQty = (q) => Math.min(MAX_QTY, Math.max(1, Math.floor(Number(q)) || 1));

function loadCart() {
  try {
    const raw = JSON.parse(localStorage.getItem(CART_KEY) || "[]");
    if (!Array.isArray(raw)) return [];
    return raw
      .filter((l) => l && Number.isInteger(l.id) && Number(l.quantity) > 0)
      .map((l) => ({ id: l.id, quantity: clampQty(l.quantity) }));
  } catch {
    return [];
  }
}

const CartContext = createContext(null);
export const useCart = () => useContext(CartContext);

export function CartProvider({ children }) {
  const [cart, setCart] = useState([]);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    setCart(loadCart());
    setInitialized(true);
  }, []);

  useEffect(() => {
    if (!initialized) return;
    try {
      localStorage.setItem(CART_KEY, JSON.stringify(cart));
    } catch {
      /* storage unavailable (private mode) — cart still works in memory */
    }
  }, [cart, initialized]);

  // keep several open tabs in sync
  useEffect(() => {
    const onStorage = (e) => e.key === CART_KEY && setCart(loadCart());
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const lines = useMemo(
    () =>
      cart
        .map((l) => ({ product: getProduct(l.id), quantity: l.quantity }))
        .filter((l) => l.product && l.product.available),
    [cart]
  );
  const count = useMemo(() => lines.reduce((s, l) => s + l.quantity, 0), [lines]);
  const totals = useMemo(() => calcTotals(lines), [lines]);

  const addItem = useCallback((id, qty = 1) => {
    setCart((c) =>
      c.some((l) => l.id === id)
        ? c.map((l) => (l.id === id ? { ...l, quantity: clampQty(l.quantity + qty) } : l))
        : [...c, { id, quantity: clampQty(qty) }]
    );
  }, []);
  const setQuantity = useCallback(
    (id, qty) => setCart((c) => c.map((l) => (l.id === id ? { ...l, quantity: clampQty(qty) } : l))),
    []
  );
  const removeItem = useCallback((id) => setCart((c) => c.filter((l) => l.id !== id)), []);
  const clearCart = useCallback(() => setCart([]), []);

  const value = useMemo(
    () => ({ lines, count, totals, addItem, setQuantity, removeItem, clearCart }),
    [lines, count, totals, addItem, setQuantity, removeItem, clearCart]
  );
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
