import { StrictMode } from "react";
import { createRoot, hydrateRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "@fontsource-variable/jost";
import "@fontsource-variable/bodoni-moda/opsz.css";
import App from "./App.jsx";
import "./styles.css";

const app = (
  <StrictMode>
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <App />
    </BrowserRouter>
  </StrictMode>
);
const root = document.getElementById("root");

if (root.hasChildNodes() && root.dataset.hydrate !== "false") hydrateRoot(root, app);
else createRoot(root).render(app);
