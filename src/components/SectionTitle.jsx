// Centred title with hairlines either side (echoes the reference site)
export default function SectionTitle({ id, children, as: Tag = "h2", align = "center", sub }) {
  return (
    <div className={`sec-head is-${align}`}>
      <Tag id={id} className="sec-title">
        <span>{children}</span>
      </Tag>
      {sub && <p className="sec-sub">{sub}</p>}
    </div>
  );
}
