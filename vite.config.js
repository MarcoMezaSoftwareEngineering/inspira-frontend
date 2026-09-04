import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { resolve } from "node:path";

export default defineConfig({
  // Dos HTML de entrada para la misma aplicación: index.html (web y panel del
  // asesorado) y backoffice.html (Inspira Core, con su manifiesto e icono).
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, "index.html"),
        backoffice: resolve(__dirname, "backoffice.html"),
      },
    },
  },


  server: {
    host: "0.0.0.0",
    port: 5173
  },

  plugins: [
    react(),
    tailwindcss(),
  ],

  optimizeDeps: {
    include: [
      "@codemirror/lang-html",
      "@codemirror/state",
      "@codemirror/view",
    ],
  },
});
