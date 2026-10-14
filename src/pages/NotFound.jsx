import usePageMeta from "../hooks/usePageMeta";
import EmptyState from "../components/EmptyState";
import { STORE_CONFIG } from "../config";

export default function NotFound({ product = false, manageMeta = true }) {
  usePageMeta(`${product ? "Product" : "Page"} not found | ${STORE_CONFIG.name}`, "", {
    noIndex: true,
    enabled: manageMeta,
  });
  return (
    <div className="container page">
      <EmptyState
        title={product ? "Product not found" : "Page not found"}
        text={product ? "The product you're looking for is unavailable." : "The page you're looking for doesn't exist."}
        to="/products"
        cta="Back to products"
      />
    </div>
  );
}
