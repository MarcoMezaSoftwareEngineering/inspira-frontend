// Los campos del portal del cliente.
//
// Están aquí y no dentro de cada pantalla porque el titular de una estancia y
// su acompañante rellenan el mismo formulario —el bloque 1 del EX-00— y no
// tiene sentido que se vean distintos según por dónde se entre.
import { useId, useState } from "react";

/** La ⓘ que explica un campo cuando el nombre no basta. */
export function Ayuda({ texto }) {
  const [abierto, setAbierto] = useState(false);
  if (!texto) return null;
  return (
    <span className="relative inline-flex">
      <button type="button" onClick={() => setAbierto((v) => !v)}
        aria-label="Qué va aquí"
        className="w-[15px] h-[15px] rounded-full border border-neutral-300 text-neutral-400
          text-[10px] leading-none grid place-items-center hover:border-[#046C8C]
          hover:text-[#046C8C] shrink-0">
        i
      </button>
      {abierto && (
        <span className="absolute z-20 left-0 top-5 w-60 rounded-lg bg-[#1A3557] text-white
          text-[11.5px] leading-relaxed px-3 py-2 shadow-lg">
          {texto}
          <button type="button" onClick={() => setAbierto(false)}
            className="block mt-1.5 text-[10.5px] text-white/60 hover:text-white">cerrar</button>
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
    <span className="flex items-center gap-1.5 flex-wrap">
      <label htmlFor={id} className="text-[12.5px] font-medium text-neutral-700">
        {label}
      </label>
      {!obligatorio && <span className="text-[10.5px] text-neutral-400">opcional</span>}
      <Ayuda texto={ayuda} />
    </span>
  );
}

export function Campo({ label, valor, onChange, tipo = "text", ayuda, obligatorio, falta }) {
  const id = useId();
  return (
    <div className="flex flex-col gap-1.5">
      <Etiqueta id={id} label={label} ayuda={ayuda} obligatorio={obligatorio} />
      <input
        id={id} type={tipo} value={valor ?? ""} onChange={(e) => onChange(e.target.value)}
        className={`text-[14px] border rounded-lg px-3 py-2.5 bg-white transition-colors
          focus:outline-none focus:ring-2 focus:ring-[#1D6A4A]/25 focus:border-[#1D6A4A] ${
          falta ? "border-amber-400 bg-amber-50/40" : "border-neutral-300"
        }`}
      />
    </div>
  );
}

export function Selector({ label, valor, onChange, opciones, ayuda, obligatorio, falta }) {
  const pares = opciones.map((o) => (Array.isArray(o) ? o : [o, o]));
  const id = useId();
  return (
    <div className="flex flex-col gap-1.5">
      <Etiqueta id={id} label={label} ayuda={ayuda} obligatorio={obligatorio} />
      <select
        id={id} value={valor ?? ""} onChange={(e) => onChange(e.target.value)}
        className={`text-[14px] border rounded-lg px-3 py-2.5 bg-white
          focus:outline-none focus:ring-2 focus:ring-[#1D6A4A]/25 focus:border-[#1D6A4A] ${
          falta ? "border-amber-400 bg-amber-50/40" : "border-neutral-300"
        }`}
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
  const tono = guardando || tocado ? "text-neutral-400" : "text-[#1D6A4A]";
  return (
    <p className={`flex items-center gap-1.5 text-[11.5px] ${tono} ${arriba ? "mb-3" : "mt-4"}`}>
      <span aria-hidden="true">{guardando || tocado ? "•" : "✓"}</span>
      {texto}
      {!guardando && !tocado && <span className="text-neutral-400">· se guarda solo</span>}
    </p>
  );
}
