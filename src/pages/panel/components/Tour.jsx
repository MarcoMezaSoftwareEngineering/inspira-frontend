// El recorrido guiado: señala en la propia pantalla dónde está cada cosa.
//
// Sin dependencias. Cada paso apunta a un elemento marcado con `data-tour`;
// se oscurece todo menos ese elemento y al lado va una tarjeta con la
// explicación y los botones. Si el elemento de un paso no está en pantalla
// —en el móvil el menú es un botón, en escritorio una barra— se busca el
// primero visible; si no hay ninguno, el paso se salta.
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";

const MARGEN = 12;

function visible(el) {
  if (!el) return false;
  const r = el.getBoundingClientRect();
  return r.width > 0 && r.height > 0 && getComputedStyle(el).visibility !== "hidden";
}

function buscar(clave) {
  const todos = Array.from(document.querySelectorAll(`[data-tour="${clave}"]`));
  return todos.find(visible) || null;
}

export default function Tour({ pasos, onFin }) {
  // Solo los pasos cuyo elemento existe; los demás no se cuentan.
  const [validos] = useState(() => pasos.filter((p) => !p.clave || buscar(p.clave)));
  const [i, setI] = useState(0);
  const [caja, setCaja] = useState(null);      // rect del elemento señalado
  const [tarjeta, setTarjeta] = useState({});  // posición de la tarjeta
  const tarjetaRef = useRef(null);
  const paso = validos[i];
  const ultimo = i >= validos.length - 1;

  const medir = useCallback(() => {
    if (!paso) return;
    const el = paso.clave ? buscar(paso.clave) : null;
    if (!el) { setCaja(null); setTarjeta({ bottom: MARGEN, left: MARGEN, right: MARGEN }); return; }
    const r = el.getBoundingClientRect();
    const pad = 6;
    setCaja({ top: r.top - pad, left: r.left - pad, width: r.width + pad * 2, height: r.height + pad * 2 });

    const alto = tarjetaRef.current?.offsetHeight || 180;
    const ancho = Math.min(360, window.innerWidth - MARGEN * 2);
    const cabeAbajo = r.bottom + MARGEN + alto < window.innerHeight;
    const top = cabeAbajo ? r.bottom + MARGEN : Math.max(MARGEN, r.top - MARGEN - alto);
    const left = Math.min(Math.max(MARGEN, r.left), window.innerWidth - ancho - MARGEN);
    setTarjeta({ top, left, width: ancho });
  }, [paso]);

  // Al cambiar de paso: llevar el elemento a la vista y medir cuando termine de moverse.
  useLayoutEffect(() => {
    if (!paso) return undefined;
    const el = paso.clave ? buscar(paso.clave) : null;
    if (el) el.scrollIntoView({ block: "center", behavior: "smooth" });
    const t = setTimeout(medir, el ? 380 : 0);
    return () => clearTimeout(t);
  }, [paso, medir]);

  function siguiente() {
    if (ultimo) onFin?.("terminado");
    else setI((n) => n + 1);
  }

  useEffect(() => {
    window.addEventListener("resize", medir);
    window.addEventListener("scroll", medir, true);
    const tecla = (e) => {
      if (e.key === "Escape") onFin?.("saltado");
      if (e.key === "ArrowRight" || e.key === "Enter") siguiente();
      if (e.key === "ArrowLeft") setI((n) => Math.max(0, n - 1));
    };
    window.addEventListener("keydown", tecla);
    return () => {
      window.removeEventListener("resize", medir);
      window.removeEventListener("scroll", medir, true);
      window.removeEventListener("keydown", tecla);
    };
  });

  useEffect(() => { if (!paso) onFin?.("vacio"); }, [paso, onFin]);
  if (!paso) return null;

  return (
    <div className="pnl-tour" role="dialog" aria-modal="true" aria-label="Recorrido por el panel">
      {caja
        ? <div className="pnl-tour-foco" style={caja} />
        : <div className="pnl-tour-velo" />}

      <div ref={tarjetaRef} className="pnl-tour-tarjeta pnl-entra" style={tarjeta}>
        <span className="pnl-tour-paso">{i + 1} de {validos.length}</span>
        <h4>{paso.titulo}</h4>
        <p>{paso.texto}</p>
        <div className="pnl-tour-botones">
          <button type="button" className="pnl-tour-saltar" onClick={() => onFin?.("saltado")}>
            Saltar
          </button>
          <span style={{ flex: 1 }} />
          {i > 0 && (
            <button type="button" className="pnl-btn ux-tap" onClick={() => setI((n) => n - 1)}>
              Anterior
            </button>
          )}
          <button type="button" className="pnl-btn-cta ux-tap" onClick={siguiente}>
            {ultimo ? "Entendido" : "Siguiente"}
          </button>
        </div>
      </div>
    </div>
  );
}
