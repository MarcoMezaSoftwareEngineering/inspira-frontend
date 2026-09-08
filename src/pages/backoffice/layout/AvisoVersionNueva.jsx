// Aviso de versión nueva.
//
// Inspira e Inspira Core se usan instaladas en el móvil y se quedan abiertas
// días. Cada despliegue cambia los archivos del servidor, pero la aplicación
// ya cargada sigue siendo la de cuando se abrió: nadie ve lo nuevo hasta que
// cierra y vuelve a abrir, y mientras tanto se pregunta por qué «no ha
// cambiado nada».
//
// Cada pocos minutos —y al volver a la pestaña— se pide al servidor el HTML de
// entrada sin caché y se mira si sigue apuntando a los mismos archivos que
// esta pestaña tiene cargados. Vite pone un hash en el nombre de cada uno, así
// que basta con que el de entrada ya no esté para saber que hay otra versión.
//
// Si la app llevaba un rato en segundo plano (nadie estaba escribiendo nada)
// y hay versión nueva, se recarga sola al volver: es lo que pasó el
// 08/09/2026, cuando Carina abrió la app instalada y vio la de antes. Si se
// descubre con la app en uso, se avisa y se deja el botón.
import { useEffect, useState } from "react";

const CADA = 5 * 60 * 1000;
const RATO_FUERA = 3 * 60 * 1000;

function cargados() {
  return [...document.querySelectorAll('script[src*="/assets/"]')]
    .map((s) => new URL(s.src, window.location.href).pathname);
}

async function hayVersionNueva() {
  const propios = cargados();
  if (!propios.length) return false;
  const entrada = window.location.pathname.startsWith("/backoffice") ? "/backoffice" : "/";
  const r = await fetch(entrada, { cache: "no-store", headers: { Accept: "text/html" } });
  if (!r.ok) return false;
  const html = await r.text();
  const enServidor = new Set([...html.matchAll(/\/assets\/[^"' >]+\.js/g)].map((m) => m[0]));
  if (!enServidor.size) return false;
  return !propios.some((p) => enServidor.has(p));
}

export default function AvisoVersionNueva({ producto = "Inspira Core" }) {
  const [nueva, setNueva] = useState(false);

  useEffect(() => {
    if (!import.meta.env.PROD) return undefined;
    let vivo = true;
    let ocultaDesde = null;
    const mirar = (recargarSiFuera = false) => hayVersionNueva()
      .then((v) => {
        if (!vivo || !v) return;
        const fuera = ocultaDesde ? Date.now() - ocultaDesde : 0;
        if (recargarSiFuera && fuera >= RATO_FUERA) { window.location.reload(); return; }
        setNueva(true);
      })
      .catch(() => {});
    const cada = setInterval(() => mirar(false), CADA);
    const primera = setTimeout(() => mirar(false), 20000);
    const alCambiar = () => {
      if (document.visibilityState === "hidden") { ocultaDesde = Date.now(); return; }
      mirar(true);
      ocultaDesde = null;
    };
    document.addEventListener("visibilitychange", alCambiar);
    return () => {
      vivo = false;
      clearInterval(cada); clearTimeout(primera);
      document.removeEventListener("visibilitychange", alCambiar);
    };
  }, []);

  if (!nueva) return null;
  return (
    <div role="status"
      className="fixed left-3 right-3 bottom-[76px] md:left-auto md:right-5 md:bottom-5 md:w-[380px] z-[60]
        flex items-center gap-3 rounded-2xl bg-[#023A4B] text-white px-4 py-3
        shadow-[0_18px_40px_-18px_rgba(2,58,75,.95)]">
      <span className="flex-1 text-[12.5px] leading-snug">
        <b className="font-bold">Hay una versión nueva de {producto}.</b>
        <br />
        <span className="text-white/75">Actualiza para ver los últimos cambios.</span>
      </span>
      <button type="button" onClick={() => window.location.reload()}
        className="shrink-0 text-[12px] font-bold px-3.5 py-2 rounded-xl bg-white text-[#023A4B] active:scale-95 transition-transform">
        Actualizar
      </button>
    </div>
  );
}
