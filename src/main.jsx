import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";

// Stub for window.storage (browser localStorage-based)
// The original artifact uses window.storage; this maps it to localStorage for a deployed web app
if (typeof window !== "undefined" && !window.storage) {
  window.storage = {
    async get(key) {
      try {
        const v = localStorage.getItem(key);
        return v !== null ? { key, value: v } : null;
      } catch {
        return null;
      }
    },
    async set(key, value) {
      try {
        localStorage.setItem(key, value);
        return { key, value };
      } catch {
        return null;
      }
    },
    async delete(key) {
      try {
        localStorage.removeItem(key);
        return { key, deleted: true };
      } catch {
        return null;
      }
    },
    async list(prefix) {
      try {
        const keys = [];
        for (let i = 0; i < localStorage.length; i++) {
          const k = localStorage.key(i);
          if (k && (!prefix || k.startsWith(prefix))) keys.push(k);
        }
        return { keys, prefix };
      } catch {
        return { keys: [] };
      }
    },
  };
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
