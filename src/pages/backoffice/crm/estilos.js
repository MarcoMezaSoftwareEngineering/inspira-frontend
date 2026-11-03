// Clases de botón y utilidades del kit CRM (separadas de los componentes por el refresco rápido de Vite).
export const TOQUE = "inline-flex min-h-[44px] items-center justify-center gap-1.5 rounded-xl px-3.5 text-[13px] font-bold transition active:scale-[.98] disabled:opacity-50";
export const BOTON = {
  principal: `${TOQUE} bg-primary-dark text-white hover:bg-primary`,
  exito: `${TOQUE} bg-emerald-600 text-white hover:bg-emerald-700`,
  whatsapp: `${TOQUE} bg-[#1fa855] text-white hover:bg-[#178a45]`,
  secundario: `${TOQUE} border border-neutral-300 bg-white text-neutral-800 hover:bg-neutral-50`,
  peligro: `${TOQUE} border border-red-200 bg-white text-red-600 hover:bg-red-50`,
  suave: `${TOQUE} bg-neutral-100 text-neutral-800 hover:bg-neutral-200`,
};

export function iniciales(nombre = "") {
  const p = String(nombre).replace(/@.*/, "").trim().split(/[\s._-]+/).filter(Boolean);
  return ((p[0]?.[0] || "?") + (p.length > 1 ? p[p.length - 1][0] : "")).toUpperCase();
}
