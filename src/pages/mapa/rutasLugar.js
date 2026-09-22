// src/pages/mapa/rutasLugar.js
// Las direcciones de las páginas por comunidad y por universidad. Viven
// aparte de PaginaLugar.jsx para que ese archivo solo exporte componentes
// (regla de la recarga en caliente) y para que el sitemap y el mapa puedan
// enlazarlas sin cargar la página entera.
export const rutaComunidad = (id) => `/master/${id}`;
export const rutaUniversidad = (id) => `/universidad/${id}`;
