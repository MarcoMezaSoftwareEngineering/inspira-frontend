// «¿Qué me falta?»: un pliegue dentro de cada expediente con lo que le queda
// al asesorado, calculado en queMeFalta.js con los datos que ya se cargaron.
//
// Se abre solo si la URL trae `?falta=1` (el enlace de «Tu próximo paso»).
// Es un plegado, no una página: su estado es local, como los bloques.
import { useEffect, useRef, useState } from "react";
import IconoPaso from "../../../components/common/IconoPaso";

function abiertoPorUrl() {
  try { return new URLSearchParams(window.location.search).has("falta"); } catch { return false; }
}

export default function QueMeFalta({ resumen, filas = [], className = "" }) {
  const [abierto, setAbierto] = useState(abiertoPorUrl);
  const caja = useRef(null);
  const accionables = filas.filter((f) => f.onIr).length;

  useEffect(() => {
    if (abiertoPorUrl()) caja.current?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, []);

  return (
    <div ref={caja} className={`ex-falta ${className}`}>
      <button type="button" className="ex-falta-boton ux-tap" aria-expanded={abierto} onClick={() => setAbierto((v) => !v)}>
        <span className="ex-falta-boton-icono bg-sky/20 text-primary"><IconoPaso nombre="list" className="w-4 h-4" /></span>
        <span className="ex-falta-boton-texto text-primary">¿Qué me falta?</span>
        {accionables > 0
          ? <span className="ex-falta-cuenta bg-accent text-white">{accionables}</span>
          : <span className="pnl-chip pnl-chip-ok"><span className="punto" />Al día</span>}
        <IconoPaso nombre="arrowRight" className={`w-4 h-4 text-primary transition-transform ${abierto ? "-rotate-90" : "rotate-90"}`} />
      </button>

      {abierto && (
        <div className="ex-falta-cuerpo">
          <p className="ex-falta-resumen">{resumen}</p>
          {filas.length > 0 && (
            <ul className="ex-falta-lista">
              {filas.map((f) => (
                <li key={f.clave} className="ex-falta-fila" data-tono={f.tono}>
                  <span className="ex-falta-fila-icono"><IconoPaso nombre={f.icono} className="w-4 h-4" /></span>
                  <span className="ex-falta-fila-cuerpo">
                    <span className="ex-falta-fila-texto">{f.texto}</span>
                    {f.detalle && <span className="ex-falta-fila-detalle">{f.detalle}</span>}
                  </span>
                  {f.onIr && (
                    <button type="button" className="pnl-btn ux-tap" onClick={f.onIr}>{f.accion || "Ir"}</button>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
