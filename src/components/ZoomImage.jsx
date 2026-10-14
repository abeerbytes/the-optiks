import { useState } from "react";
import Img from "./Img";

// Product photo that zooms toward the cursor on desktop (mouse only)
export default function ZoomImage({ src, alt }) {
  const [zoom, setZoom] = useState({ x: 50, y: 50, on: false });

  const move = (e) => {
    if (e.pointerType !== "mouse") return;
    const r = e.currentTarget.getBoundingClientRect();
    setZoom({ x: ((e.clientX - r.left) / r.width) * 100, y: ((e.clientY - r.top) / r.height) * 100, on: true });
  };

  return (
    <div className="zoom" onPointerMove={move} onPointerLeave={() => setZoom((z) => ({ ...z, on: false }))}>
      <Img
        src={src}
        alt={alt}
        priority
        style={{ transformOrigin: `${zoom.x}% ${zoom.y}%`, transform: zoom.on ? "scale(1.7)" : "scale(1)" }}
      />
    </div>
  );
}
