import { useEffect, useMemo, useRef, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { ChevronDown, Menu, Search, ShoppingBag, X } from "lucide-react";
import Logo from "./Logo";
import Img from "./Img";
import { useCart } from "../context/CartContext";
import { STORE_CONFIG } from "../config";
import { categoryUrl, genderUrl, getCategories, getGenders, queryProducts } from "../catalog";
import { formatPrice } from "../utils";

const SEARCH_RESULTS_LIMIT = 6;

export default function Navbar() {
  const { count } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuTop, setMenuTop] = useState(0);
  const [dropOpen, setDropOpen] = useState(false);
  const [mobileProducts, setMobileProducts] = useState(false);
  const headerRef = useRef(null);
  const dropRef = useRef(null);
  const dropBtnRef = useRef(null);
  const pointerType = useRef("");
  const location = useLocation();
  const navigate = useNavigate();
  const isHome = location.pathname === "/";

  // ---- Home-page-only search (uses the same product data/routing as the Products page) ----
  const [searchOpen, setSearchOpen] = useState(false);
  const [q, setQ] = useState("");
  const searchRef = useRef(null);
  const searchInputRef = useRef(null);
  const results = useMemo(
    () => (q.trim() ? queryProducts({ q }).slice(0, SEARCH_RESULTS_LIMIT) : []),
    [q]
  );

  const closeSearch = () => {
    setSearchOpen(false);
    setQ("");
  };

  const openSearch = () => {
    setSearchOpen(true);
    requestAnimationFrame(() => searchInputRef.current?.focus());
  };

  const goToProduct = (id) => {
    closeSearch();
    navigate(`/product/${id}`);
  };

  useEffect(() => {
    // search only exists on Home — make sure it's closed on any other page
    if (!isHome) closeSearch();
  }, [isHome]);

  useEffect(() => {
    if (!searchOpen) return undefined;
    const onDown = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) closeSearch();
    };
    const onKey = (e) => {
      if (e.key === "Escape") closeSearch();
    };
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [searchOpen]);

  // Menus are generated from products.js — no hard-coded category list
  const categories = useMemo(getCategories, []);
  const genders = useMemo(getGenders, []);

  useEffect(() => {
    setMenuOpen(false);
    setDropOpen(false);
  }, [location.pathname, location.search]);

  useEffect(() => {
    const onDown = (e) => {
      if (dropRef.current && !dropRef.current.contains(e.target)) setDropOpen(false);
    };
    const onKey = (e) => {
      if (e.key !== "Escape") return;
      setDropOpen((open) => {
        if (open) dropBtnRef.current?.focus();
        return false;
      });
      setMenuOpen(false);
    };
    const onResize = () => window.innerWidth > 960 && setMenuOpen(false);
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    window.addEventListener("resize", onResize);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  useEffect(() => {
    document.body.classList.toggle("no-scroll", menuOpen);
    return () => document.body.classList.remove("no-scroll");
  }, [menuOpen]);

  const toggleMenu = () => {
    if (!menuOpen && headerRef.current) setMenuTop(Math.max(0, headerRef.current.getBoundingClientRect().bottom));
    setMenuOpen((o) => !o);
  };

  const cartLabel = `Cart, ${count} ${count === 1 ? "item" : "items"}`;
  const linkClass = ({ isActive }) => (isActive ? "nav-link active" : "nav-link");

  return (
    <>
      <a href="#main" className="skip-link">
        Skip to content
      </a>
      <header className="site-header" ref={headerRef}>
        <div className="container nav">
          <div className="nav-left">
            <button
              type="button"
              className="menu-toggle"
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              aria-expanded={menuOpen}
              aria-controls="mobile-menu"
              onClick={toggleMenu}
            >
              {menuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            <nav className="nav-links" aria-label="Main">
              <NavLink to="/" end className={linkClass}>
                Home
              </NavLink>
              <div
                className="dropdown"
                ref={dropRef}
                onPointerEnter={(e) => e.pointerType === "mouse" && setDropOpen(true)}
                onPointerLeave={(e) => e.pointerType === "mouse" && setDropOpen(false)}
              >
                <button
                  type="button"
                  ref={dropBtnRef}
                  className="nav-link"
                  aria-expanded={dropOpen}
                  aria-controls="products-menu"
                  onPointerDown={(e) => (pointerType.current = e.pointerType)}
                  onClick={(e) =>
                    // mouse users already opened it by hovering — a click must not close it again
                    setDropOpen((o) => (pointerType.current === "mouse" && e.detail > 0 ? true : !o))
                  }
                >
                  Products <ChevronDown size={14} className={dropOpen ? "chev open" : "chev"} aria-hidden="true" />
                </button>
                <div id="products-menu" className={dropOpen ? "dropdown-menu open" : "dropdown-menu"}>
                  <div>
                    <p className="dd-title">Categories</p>
                    <ul>
                      {categories.map((c) => (
                        <li key={c}>
                          <Link to={categoryUrl(c)}>{c}</Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                  {genders.length > 0 && (
                    <div>
                      <p className="dd-title">Shop for</p>
                      <ul>
                        {genders.map((g) => (
                          <li key={g}>
                            <Link to={genderUrl(g)}>{g}</Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  <Link to="/products" className="dd-all">
                    View all products
                  </Link>
                </div>
              </div>
              <NavLink to="/about" className={linkClass}>
                About
              </NavLink>
              <NavLink to="/contact" className={linkClass}>
                Contact
              </NavLink>
            </nav>
          </div>

          <Logo />

          <div className="nav-right">
            {isHome && (
              <div className="nav-search" ref={searchRef}>
                <button
                  type="button"
                  className="search-toggle"
                  aria-label={searchOpen ? "Close search" : "Search products"}
                  aria-expanded={searchOpen}
                  aria-controls="home-search-panel"
                  onClick={() => (searchOpen ? closeSearch() : openSearch())}
                >
                  {searchOpen ? <X size={20} aria-hidden="true" /> : <Search size={20} aria-hidden="true" />}
                </button>

                <div id="home-search-panel" className={searchOpen ? "search-panel open" : "search-panel"}>
                  <label className="search">
                    <span className="visually-hidden">Search products</span>
                    <Search size={18} aria-hidden="true" />
                    <input
                      ref={searchInputRef}
                      type="search"
                      placeholder="Search frames, e.g. black, aviator..."
                      value={q}
                      onChange={(e) => setQ(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && q.trim()) {
                          closeSearch();
                          navigate(`/products?q=${encodeURIComponent(q.trim())}`);
                        }
                      }}
                    />
                  </label>

                  {q.trim() && (
                    <>
                      {results.length > 0 ? (
                        <ul className="search-results">
                          {results.map((p) => (
                            <li key={p.id}>
                              <button type="button" className="search-result" onClick={() => goToProduct(p.id)}>
                                <span className="search-result-media">
                                  <Img src={p.image} alt="" />
                                </span>
                                <span className="search-result-info">
                                  <span className="search-result-name">{p.name}</span>
                                  <span className="search-result-meta">
                                    {p.category} · {formatPrice(p.price)}
                                  </span>
                                </span>
                              </button>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="search-empty">No products found for "{q}".</p>
                      )}
                      <Link
                        to={`/products?q=${encodeURIComponent(q.trim())}`}
                        className="search-view-all"
                        onClick={closeSearch}
                      >
                        View all results
                      </Link>
                    </>
                  )}
                </div>
              </div>
            )}

            <Link to="/cart" className="cart-btn" aria-label={cartLabel}>
              <ShoppingBag size={20} aria-hidden="true" />
              <span className="cart-text">Add to cart</span>
              {count > 0 && (
                <span key={count} className="badge" aria-hidden="true">
                  {count}
                </span>
              )}
            </Link>
          </div>
        </div>
      </header>

      <div id="mobile-menu" className={menuOpen ? "mobile-menu open" : "mobile-menu"} style={{ top: menuTop }}>
        <nav aria-label="Mobile">
          <Link to="/" className="m-link">
            Home
          </Link>
          <button
            type="button"
            className="m-link m-toggle"
            aria-expanded={mobileProducts}
            aria-controls="m-products"
            onClick={() => setMobileProducts((o) => !o)}
          >
            Products <ChevronDown size={18} className={mobileProducts ? "chev open" : "chev"} aria-hidden="true" />
          </button>
          <ul id="m-products" className={mobileProducts ? "m-sub open" : "m-sub"}>
            <li>
              <Link to="/products">All products</Link>
            </li>
            {categories.map((c) => (
              <li key={c}>
                <Link to={categoryUrl(c)}>{c}</Link>
              </li>
            ))}
            {genders.map((g) => (
              <li key={g}>
                <Link to={genderUrl(g)}>{g}</Link>
              </li>
            ))}
          </ul>
          <Link to="/about" className="m-link">
            About
          </Link>
          <Link to="/contact" className="m-link">
            Contact
          </Link>
          <Link to="/cart" className="btn btn-primary btn-block m-cart">
            <ShoppingBag size={18} aria-hidden="true" /> Add to cart{count > 0 ? ` (${count})` : ""}
          </Link>
        </nav>
      </div>
    </>
  );
}
