import { useEffect, useRef, useState } from "react";

// Subtle fade-up when a block scrolls into view. Shows immediately when
// IntersectionObserver is missing or the user prefers reduced motion.
export default function Reveal({ children, className = "", as: Tag = "div", ...rest }) {
  const ref = useRef(null);
  const [shown, setShown] = useState(() => typeof IntersectionObserver === "undefined");

  useEffect(() => {
    if (shown || !ref.current) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShown(true);
          io.disconnect();
        }
      },
      { rootMargin: "0px 0px -8% 0px" }
    );
    io.observe(ref.current);
    return () => io.disconnect();
  }, [shown]);

  return (
    <Tag ref={ref} className={`reveal ${shown ? "in" : ""} ${className}`} {...rest}>
      {children}
    </Tag>
  );
}
