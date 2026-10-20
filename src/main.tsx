import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { applyTheme } from "./lib/theme";
import { cleanupLegacyAppWorker } from "./lib/launch";

applyTheme();

// Keep home-screen metadata, but do not let old app caches control launch.
void cleanupLegacyAppWorker();

const root = document.getElementById("root");
if (!root) throw new Error("Burn & Shed launch element is missing.");

createRoot(root).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
