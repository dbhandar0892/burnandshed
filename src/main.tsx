import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { applyTheme } from "./lib/theme";
import { cleanupLegacyAppWorker } from "./lib/launch";
import { handleAuthHandoff, initNativeAuthLinks } from "./lib/nativeAuth";
import { POST_SIGNIN_RETURN_KEY } from "./lib/authHandoff";

applyTheme();

// Keep home-screen metadata, but do not let old app caches control launch.
void cleanupLegacyAppWorker();

// A hosted OAuth return lands on the root with the session in the URL hash;
// mark it so the app returns the user to the feature they came from. The
// native handoff sets the same flag inside handleAuthHandoff.
if (/(^#|&)access_token=/.test(window.location.hash)) {
  localStorage.setItem(POST_SIGNIN_RETURN_KEY, "1");
}

const root = document.getElementById("root");
if (!root) throw new Error("Burn & Shed launch element is missing.");

// Consume any sign-in handoff before first render so the app starts signed in.
void initNativeAuthLinks().then(handleAuthHandoff).finally(() => {
  createRoot(root).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
});
