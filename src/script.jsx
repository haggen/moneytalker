import { createRoot } from "react-dom";
import { StrictMode } from "react";
import { App } from "~/src/components/App";

createRoot(window.root).render(
  <StrictMode>
    <App />
  </StrictMode>
);
