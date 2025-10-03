import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { AppRouter } from "./AppRouter";
import ContextProvider from "./providers/ContextProvider";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ContextProvider>
      <AppRouter />
    </ContextProvider>
  </StrictMode>
);
