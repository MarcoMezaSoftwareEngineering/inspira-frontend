import { useEffect } from "react";

const BASE_URL = "https://inspira-legal.cloud";

// Imagen de compartir por sección. Las genera scripts/og.py en public/og/.
// Sin esto, al pegar un enlace en WhatsApp o Instagram no aparece imagen.
const OG_POR_RUTA = [
  [/^\/servicios/, "servicios"],
  [/^\/ruta\//, "servicios"],
  [/^\/casos-de-exito/, "casos"],
  [/^\/eventos/, "eventos"],
  [/^\/blog/, "blog"],
  [/^\/asistente/, "asistente"],
  [/^\/calculadora/, "calculadora"],
  [/^\/plataforma/, "plataforma"],
  [/^\/nosotros/, "nosotros"],
  [/^\/tienda/, "tienda"],
];

function imagenDe(path = "/") {
  const encontrada = OG_POR_RUTA.find(([re]) => re.test(path));
  return `${BASE_URL}/og/${encontrada ? encontrada[1] : "default"}.jpg`;
}

function setMeta(attr, value, content) {
  let el = document.querySelector(`meta[${attr}="${value}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, value);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

function setCanonical(href) {
  let el = document.querySelector('link[rel="canonical"]');
  if (!href) {
    if (el) el.remove();
    return;
  }
  if (!el) {
    el = document.createElement("link");
    el.setAttribute("rel", "canonical");
    document.head.appendChild(el);
  }
  el.setAttribute("href", href);
}

export function useSEO({ title, description, path, noIndex = false }) {
  useEffect(() => {
    const fullTitle = title
      ? `${title} | Inspira Legal`
      : "Inspira Legal – Másteres y Visas en España";
    const canonical = path ? `${BASE_URL}${path}` : `${BASE_URL}/`;

    document.title = fullTitle;

    setMeta("name", "description", description || "");
    setMeta("name", "robots", noIndex ? "noindex, nofollow" : "index, follow");

    setCanonical(noIndex ? null : canonical);

    const imagen = imagenDe(path);

    setMeta("property", "og:title", fullTitle);
    setMeta("property", "og:description", description || "");
    setMeta("property", "og:url", canonical);
    setMeta("property", "og:image", imagen);
    setMeta("property", "og:image:width", "1200");
    setMeta("property", "og:image:height", "630");
    setMeta("property", "og:image:alt", fullTitle);

    setMeta("name", "twitter:title", fullTitle);
    setMeta("name", "twitter:description", description || "");
    setMeta("name", "twitter:image", imagen);
  }, [title, description, path, noIndex]);
}
