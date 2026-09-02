// Ventana emergente del asesor.
//
// En escritorio es un cuadro centrado; en el móvil, una hoja que sube desde
// abajo, que es lo que el pulgar espera. Se cierra con Escape, tocando fuera o
// con la equis, y al cerrarse no desaparece de golpe: se le da un instante de
// salida para que el ojo entienda a dónde se ha ido.
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

const SALIDA_MS = 220;

export default function Ventana({ abierta, onCerrar, titulo, subtitulo, ancho = "md", pie, children }) {
  // Para animar la salida hay que seguir pintando la ventana un momento
  // después de que `abierta` pase a false. Se anota el cambio en el propio
  // render (el patrón de «estado derivado del anterior» de React) y un
  // temporizador la retira cuando la animación ha terminado.
  const [antes, setAntes] = useState(abierta);
  const [saliendo, setSaliendo] = useState(false);
  if (antes !== abierta) {
    setAntes(abierta);
    if (!abierta) setSaliendo(true);
  }

  useEffect(() => {
    if (!saliendo) return undefined;
    const t = setTimeout(() => setSaliendo(false), SALIDA_MS);
    return () => clearTimeout(t);
  }, [saliendo]);

  const pintada = abierta || saliendo;

  useEffect(() => {
    if (!pintada) return undefined;
    const antesOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = antesOverflow; };
  }, [pintada]);

  useEffect(() => {
    if (!abierta) return undefined;
    const onKey = (e) => { if (e.key === "Escape") onCerrar?.(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [abierta, onCerrar]);

  if (!pintada) return null;

  return createPortal(
    <div className="ase-ventana" data-saliendo={saliendo && !abierta ? "1" : "0"} role="dialog" aria-modal="true">
      <div className="ase-ventana-fondo" onClick={onCerrar} />
      <div className="ase-ventana-panel" data-ancho={ancho}>
        <div className="ase-ventana-asa" />
        {(titulo || onCerrar) && (
          <div className="ase-ventana-cab">
            <div style={{ flex: 1, minWidth: 0 }}>
              {titulo && <h2 className="ase-ventana-cab-t">{titulo}</h2>}
              {subtitulo && <p className="ase-ventana-cab-s">{subtitulo}</p>}
            </div>
            {onCerrar && (
              <button type="button" className="ase-ventana-x" onClick={onCerrar} aria-label="Cerrar">
                <X strokeWidth={2.4} />
              </button>
            )}
          </div>
        )}
        <div className="ase-ventana-cuerpo">{children}</div>
        {pie && <div className="ase-ventana-pie">{pie}</div>}
      </div>
    </div>,
    document.body,
  );
}
