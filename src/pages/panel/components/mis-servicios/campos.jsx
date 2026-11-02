// Los campos del portal del cliente.
//
// Están aquí y no dentro de cada pantalla porque el titular de una estancia y
// su acompañante rellenan el mismo formulario —el bloque 1 del EX-00— y no
// tiene sentido que se vean distintos según por dónde se entre.
//
// Estilos: .pnl-campo* de styles/panel/base.css (la etiqueta encima, la caja de
// 48 y 16 px en táctil); lo propio de estas pantallas, en panel/tramites.css.
import { useId, useState } from "react";
import IconoPaso from "../../../../components/common/IconoPaso";

/** La ⓘ que explica un campo cuando el nombre no basta. */
export function Ayuda({ texto }) {
  const [abierto, setAbierto] = useState(false);
  if (!texto) return null;
  return (
    <span className="relative inline-flex">
      <button type="button" onClick={() => setAbierto((v) => !v)}
        aria-label="Qué va aquí" aria-expanded={abierto}
        className="pnl-info">
        i
      </button>
      {abierto && (
        <span className="pnl-burbuja absolute z-20 left-0 top-7">
          {texto}
          <button type="button" onClick={() => setAbierto(false)}
            className="pnl-burbuja-cerrar">cerrar</button>
        </span>
      )}
    </span>
  );
}

/**
 * El rótulo.
 *
 * Se marca lo opcional y no lo obligatorio: aquí casi todo lo es, y un
 * asterisco en veinte campos seguidos no informa de nada.
 */
export function Etiqueta({ id, label, ayuda, obligatorio }) {
  return (
    <span className="pnl-campo-etiqueta flex items-center gap-x-2 gap-y-1 flex-wrap">
      <label htmlFor={id}>
        {label}
      </label>
      {!obligatorio && <small>opcional</small>}
      <Ayuda texto={ayuda} />
    </span>
  );
}

export function Campo({ label, valor, onChange, tipo = "text", ayuda, obligatorio, falta }) {
  const id = useId();
  // Lo que va al impreso se guarda en mayúsculas, así que se escribe en
  // mayúsculas: si no, se teclea «pérez» y al recargar aparece «PÉREZ», y
  // parece que el sistema ha cambiado algo por su cuenta. El correo no, que en
  // mayúsculas parece roto, ni las fechas.
  const mayus = tipo === "text";
  return (
    <div className="pnl-campo">
      <Etiqueta id={id} label={label} ayuda={ayuda} obligatorio={obligatorio} />
      <input
        id={id} type={tipo} value={valor ?? ""} onChange={(e) => onChange(e.target.value)}
        data-estado={falta ? "falta" : undefined}
        className={`pnl-campo-control ${mayus ? "uppercase placeholder:normal-case" : ""}`}
      />
    </div>
  );
}

export function Selector({ label, valor, onChange, opciones, ayuda, obligatorio, falta }) {
  const pares = opciones.map((o) => (Array.isArray(o) ? o : [o, o]));
  const id = useId();
  return (
    <div className="pnl-campo">
      <Etiqueta id={id} label={label} ayuda={ayuda} obligatorio={obligatorio} />
      <select
        id={id} value={valor ?? ""} onChange={(e) => onChange(e.target.value)}
        data-estado={falta ? "falta" : undefined}
        className="pnl-campo-control"
      >
        <option value="">—</option>
        {pares.map(([v, t]) => <option key={v} value={v}>{t}</option>)}
      </select>
    </div>
  );
}

/** En qué anda el guardado. Se guarda solo; esto lo cuenta. */
export function Guardado({ guardando, tocado, completo, arriba }) {
  const texto = guardando ? "Guardando…"
    : tocado ? "Sin guardar…"
    : completo ? "Guardado. Ya está todo."
    : "Guardado";
  const ok = !guardando && !tocado;
  return (
    <p className={`pnl-guardado ${arriba ? "pnl-guardado-arriba" : "pnl-guardado-abajo"}`} data-ok={ok ? "1" : undefined}>
      {guardando ? <span className="pnl-spinner" data-talla="s" aria-hidden="true" />
        : tocado ? <span className="pnl-guardado-punto" aria-hidden="true" />
        : <IconoPaso nombre="check" className="w-3.5 h-3.5" strokeWidth={2.4} />}
      {texto}
      {ok && <span className="pnl-guardado-solo">· se guarda solo</span>}
    </p>
  );
}
