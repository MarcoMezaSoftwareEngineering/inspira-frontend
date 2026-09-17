// Una explicación plegable: una línea a la vista y el resto a un toque.
//
// Muchas secciones del panel empezaban con un recuadro de cuatro o cinco
// líneas antes de la tarea. La primera vez se lee; la quinta vez que entras a
// subir un documento solo empuja el botón hacia abajo. Así queda la idea en una
// línea y el texto entero, sin quitarle una coma, dentro.
//
// Regla que no se negocia: si el texto dice algo de lo que el asesorado
// RESPONDE (que los datos sean correctos, un plazo que no se prorroga), esa
// frase va en `resumen`, que se ve siempre. Plegar no puede servir para
// esconder una advertencia legal.
//
// `resumen` es texto (con <b> si hace falta): va dentro del botón que pliega,
// así que no puede llevar enlaces ni botones.
//
// Si lleva `clave`, recuerda en este navegador si la dejó abierta o cerrada.
// Estilos en styles/panel-documentos.css (pnl-ayuda-*).
import { useId, useState } from "react";

const PREFIJO = "pnl-ayuda:";

function leer(clave, porDefecto) {
  if (!clave) return porDefecto;
  try {
    const v = localStorage.getItem(PREFIJO + clave);
    if (v === "1") return true;
    if (v === "0") return false;
  } catch { /* modo privado o almacenamiento bloqueado: se usa el valor por defecto */ }
  return porDefecto;
}

function guardar(clave, abierta) {
  if (!clave) return;
  try { localStorage.setItem(PREFIJO + clave, abierta ? "1" : "0"); } catch { /* no pasa nada */ }
}

const SIGNO = { info: "i", aviso: "!", importante: "!" };

export default function AyudaPlegable({
  titulo, resumen, tono = "info", abiertaPorDefecto = false, clave, className = "", children,
}) {
  const [abierta, setAbierta] = useState(() => leer(clave, abiertaPorDefecto));
  const id = useId();

  function alternar() {
    const siguiente = !abierta;
    setAbierta(siguiente);
    guardar(clave, siguiente);
  }

  return (
    <div className={`pnl-ayuda ${className}`} data-tono={tono} data-abierta={abierta ? "1" : "0"}>
      <button type="button" className="pnl-ayuda-cab" onClick={alternar}
        aria-expanded={abierta} aria-controls={id}>
        <span className="pnl-ayuda-ico" aria-hidden="true">{SIGNO[tono] || SIGNO.info}</span>
        <span className="pnl-ayuda-txt">
          {titulo && <span className="pnl-ayuda-titulo">{titulo}</span>}
          {resumen && <span className="pnl-ayuda-resumen">{resumen}</span>}
        </span>
        <span className="pnl-ayuda-mas">{abierta ? "Ocultar" : "Ver más"}</span>
        <svg className="pnl-ayuda-chev" width="16" height="16" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>
      {abierta && <div id={id} className="pnl-ayuda-cuerpo">{children}</div>}
    </div>
  );
}
