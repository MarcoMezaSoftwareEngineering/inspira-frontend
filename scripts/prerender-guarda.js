// scripts/prerender-guarda.js — se ejecuta en el NAVEGADOR, no en Node.
//
// Guarda del HTML prerenderizado (scripts/prerender.mjs, 09/10/2026). El
// prerender la copia a dist/assets/ con un hash en el nombre (caché larga) y
// la enlaza al final del <head> de cada página prerenderizada (por qué ahí,
// en `inyectar`), junto a unas reglas <style> en línea.
//
// 1. nginx sirve index.html, que trae la portada ya pintada, a "/" y también
//    a toda ruta sin HTML propio (/mapa, /panel, un 404…). Por eso #root sale
//    escondido por defecto y solo se enseña cuando la ruta de la barra es la
//    que trae el HTML (<html data-prerender>): esto marca entonces
//    <html data-prerender-ok>, antes de que se lea el <body>. Si no lo es, no
//    hace nada y la portada nunca se ve; main.jsx vacía #root y monta la
//    aplicación de cero, como siempre. Si esto no llegara a cargar, lo peor
//    es esperar a main.jsx, como antes del prerender. Sin JavaScript, un
//    <noscript> enseña el contenido.
// 2. El aviso de cookies va en el HTML para quien entra por primera vez. Si
//    este navegador ya tiene una decisión guardada (la clave de
//    src/lib/consent.js), marca <html data-aviso-cookies-oculto> en el mismo
//    paso y la regla lo esconde; al hidratar, CookieConsent decide de verdad.
//
// Externo y no en línea: la CSP del sitio no admite scripts en línea.
(function () {
  var html = document.documentElement;
  if (html.getAttribute("data-prerender") !== location.pathname) return;
  try {
    if (localStorage.getItem("inspira_consent")) html.setAttribute("data-aviso-cookies-oculto", "");
  } catch {
    // Almacenamiento bloqueado: el aviso se queda y CookieConsent decide.
  }
  html.setAttribute("data-prerender-ok", "");
})();
