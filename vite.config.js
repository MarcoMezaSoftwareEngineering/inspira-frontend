import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { resolve } from "node:path";
import { readFileSync } from "node:fs";

// Fuente única de precios para los HTML estáticos de public/ (calculadora):
// publica /precios-inspira.js (window.PRECIOS_INSPIRA) desde
// src/config/precios-inspira.json, que es copia del backend. No hay un
// segundo archivo de precios en el repositorio.
function preciosPublicos() {
  const JSON_PRECIOS = resolve(__dirname, "src/config/precios-inspira.json");
  const js = () =>
    `window.PRECIOS_INSPIRA=${JSON.stringify(JSON.parse(readFileSync(JSON_PRECIOS, "utf8")))};\n`;
  return {
    name: "precios-publicos",
    configureServer(server) {
      server.middlewares.use("/precios-inspira.js", (req, res) => {
        res.setHeader("Content-Type", "application/javascript; charset=utf-8");
        res.end(js());
      });
    },
    generateBundle() {
      this.emitFile({ type: "asset", fileName: "precios-inspira.js", source: js() });
    },
  };
}

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
    preciosPublicos(),
  ],

  optimizeDeps: {
    include: [
      "@codemirror/lang-html",
      "@codemirror/state",
      "@codemirror/view",
    ],
  },
});
