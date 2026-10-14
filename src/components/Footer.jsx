import { useMemo } from "react";
import { Link } from "react-router-dom";
import Logo from "./Logo";
import { STORE_CONFIG } from "../config";
import { categoryUrl, genderUrl, getCategories, getGenders } from "../catalog";
import { whatsappSupportUrl } from "../services/orderService";

export default function Footer() {
  const categories = useMemo(getCategories, []);
  const genders = useMemo(getGenders, []);
  const ext = { target: "_blank", rel: "noopener noreferrer" };
  const socialLinks = [
    { label: "Instagram", href: STORE_CONFIG.instagram },
    { label: "Facebook", href: STORE_CONFIG.facebook },
  ].filter((link) => link.href);

  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        <div className="footer-brand">
          <Logo />
          <p>Premium eyewear for everyday confidence, delivered across Pakistan.</p>
        </div>
        <div>
          <h2>Shop</h2>
          <ul>
            {categories.map((c) => (
              <li key={c}><Link to={categoryUrl(c)}>{c}</Link></li>
            ))}
            {genders.map((g) => (
              <li key={g}><Link to={genderUrl(g)}>{g}</Link></li>
            ))}
          </ul>
        </div>
        <div>
          <h2>Company</h2>
          <ul>
            <li><Link to="/about">About us</Link></li>
            <li><Link to="/contact">Contact</Link></li>
            <li><Link to="/#services">Delivery</Link></li>
            <li><Link to="/#services">Exchange</Link></li>
          </ul>
        </div>
        <div>
          <h2>Get in touch</h2>
          <ul>
            <li><a href={whatsappSupportUrl()} {...ext}>WhatsApp</a></li>
            <li><a href={`tel:${STORE_CONFIG.phone.replace(/[^\d+]/g, "")}`}>{STORE_CONFIG.phone}</a></li>
            <li><a href={`mailto:${STORE_CONFIG.email}`}>{STORE_CONFIG.email}</a></li>
          </ul>
        </div>
        {socialLinks.length > 0 && (
          <div>
            <h2>Social</h2>
            <ul>
              {socialLinks.map(({ label, href }) => (
                <li key={label}><a href={href} {...ext}>{label}</a></li>
              ))}
            </ul>
          </div>
        )}
      </div>
      <div className="container">
        <p className="footer-word" aria-hidden="true">{STORE_CONFIG.name}</p>
      </div>
      <div className="container footer-bottom">
        <p>© {new Date().getFullYear()} {STORE_CONFIG.name}. All rights reserved.</p>
        <p>Made in Karachi</p>
      </div>
    </footer>
  );
}
