import { Minus, Plus } from "lucide-react";
import { MAX_QTY } from "../utils";

export default function QtyControl({ value, onChange, label }) {
  return (
    <div className="qty" role="group" aria-label={label}>
      <button type="button" onClick={() => onChange(value - 1)} disabled={value <= 1} aria-label="Decrease quantity">
        <Minus size={16} />
      </button>
      <output aria-live="polite">{value}</output>
      <button type="button" onClick={() => onChange(value + 1)} disabled={value >= MAX_QTY} aria-label="Increase quantity">
        <Plus size={16} />
      </button>
    </div>
  );
}
