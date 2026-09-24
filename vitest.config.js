// Pruebas del front. Se ejecutan con `npm test` y, antes de cada despliegue,
// desde scripts/desplegar_front.sh: si fallan, no se publica.
//
// Las pruebas viven junto a lo que prueban (src/**/*.test.js) o en tests/ para
// las que cruzan varios archivos (sitemap contra rutas, datos contra la API).
import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  test: {
    environment: "node",
    include: ["src/**/*.test.{js,jsx}", "tests/**/*.test.{js,jsx}"],
    // Sin red: los datos de la API se leen de una copia guardada en tests/.
    testTimeout: 10000,
    reporters: process.env.CI ? ["default"] : ["default"],
  },
  resolve: {
    alias: { "@": path.resolve(__dirname, "src") },
  },
});
