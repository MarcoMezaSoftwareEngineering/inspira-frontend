import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { resolve } from "node:path";
import { readFileSync } from "node:fs";
import process from "node:process";

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
  // Dos HTML de entrada: index.html (web y panel del asesorado, src/main.jsx)
  // y backoffice.html (Inspira Core, con su manifiesto e icono). Desde el
  // 09/10/2026 Core arranca de src/backoffice-main.jsx y no descarga la web
  // pública. En desarrollo Vite sirve backoffice.html solo para /backoffice
  // exacto; /backoffice/… cae en index.html y App.jsx monta BackofficeApp en
  // diferido: las dos entradas tienen que seguir funcionando.
  build: {
    // INSPIRA_DIST: compilar en otra carpeta sin tocar dist/ (pruebas de
    // rendimiento contra una versión anterior). La leen también
    // scripts/html-compartir.mjs y scripts/prerender.mjs.
    outDir: process.env.INSPIRA_DIST || "dist",
    emptyOutDir: true,
    // .vite/manifest.json: qué CSS y qué trozos necesita cada página diferida.
    // Lo usa scripts/prerender.mjs para enlazarlos en el HTML prerenderizado
    // (sin ellos la página se pintaría sin sus estilos) y lo borra después:
    // no se publica (09/10/2026).
    manifest: true,
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
    // React Compiler (babel-plugin-react-compiler, en devDeps): APAGADO a
    // propósito. Probado el 09/10/2026 solo sobre src/pages/backoffice/ con
    //   react({ babel: (id) => ({ plugins: /[\\/]src[\\/]pages[\\/]backoffice[\\/]/
    //     .test(id) ? [["babel-plugin-react-compiler", { target: "19" }]] : [] }) })
    // el build sale sin errores, pero cada trozo de Core crece entre un 30 y
    // un 50 % (el armazón de 14,8 a 19,7 KB gz; Clientes de 29,7 a 45; en total
    // +171 KB gz), y lo que pesaba en Core era la descarga, no el repintado.
    // Quedan además 13 avisos de set-state-in-effect del lint en la carpeta.
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
