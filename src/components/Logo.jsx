import { Link } from "react-router-dom";
import { STORE_CONFIG } from "../config";
import Img from "./Img";

// To use your own logo: drop the file in public/images/ and update the
// path below (and in config.js, if you want it kept in one place).
const LOGO_SRC = "/images/logo.png";

export default function Logo() {
  return (
    <Link to="/" className="logo" aria-label={`${STORE_CONFIG.name} — home`}>
      <Img src={LOGO_SRC} alt={STORE_CONFIG.name} className="logo-img" priority />
    </Link>
  );
}
