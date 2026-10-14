import { useEffect, useState } from "react";

const PLACEHOLDER_IMG = "/images/placeholder.svg";

// Lazy image with a graceful fallback if the file is missing
export default function Img({ src, alt, priority = false, className = "", ...rest }) {
  const [failed, setFailed] = useState(false);
  useEffect(() => setFailed(false), [src]);
  return (
    <img
      src={failed ? PLACEHOLDER_IMG : src}
      alt={alt}
      loading={priority ? "eager" : "lazy"}
      fetchpriority={priority ? "high" : undefined}
      decoding="async"
      onError={() => setFailed(true)}
      className={className}
      {...rest}
    />
  );
}
