// vite.config.js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  resolve: { mainFields: ["browser", "module", "main"] },
  optimizeDeps: { include: ["firebase/app", "firebase/auth", "firebase/firestore"] },
  build: { commonjsOptions: { transformMixedEsModules: true } },
});
