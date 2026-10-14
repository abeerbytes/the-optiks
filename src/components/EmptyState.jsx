import { Link } from "react-router-dom";

export default function EmptyState({ title, text, to, cta }) {
  return (
    <div className="empty">
      <h1>{title}</h1>
      <p>{text}</p>
      <Link className="btn btn-primary" to={to}>
        {cta}
      </Link>
    </div>
  );
}
