// vite.config.js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  resolve: {
    mainFields: ["browser", "module", "main"]
  },
  // Make sure Vite pre-bundles firebase submodules (fixes "failed to resolve import 'firebase/auth'")
  optimizeDeps: {
    include: [
      "firebase/app",
      "firebase/auth",
      "firebase/firestore"
    ]
  },
  // Helps Rollup handle mixed CommonJS/ESM from some firebase packages
  build: {
    commonjsOptions: {
      transformMixedEsModules: true
    }
  },
  // For some environments, telling SSR not to externalize firebase helps builds
  ssr: {
    noExternal: ["firebase"]
  }
});
