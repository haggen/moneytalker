import { createRoot } from "react-dom/client";
import { StrictMode } from "react";
import { App } from "~/src/components/App";

createRoot(window.root).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
