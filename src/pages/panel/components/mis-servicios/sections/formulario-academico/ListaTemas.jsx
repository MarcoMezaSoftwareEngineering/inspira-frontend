import { useState } from "react";

/* Lista de temas como etiquetas. Se escribe uno, se añade, y queda como
   chip que se quita con un toque; las sugerencias van debajo y entran igual.
   En el móvil nadie pulsa Enter, así que también se añade al salir del campo. */
export default function ListaTemas({ valor, onChange, sugerencias = [], campo, max = 6 }) {
  const [texto, setTexto] = useState("");
  const temas = (Array.isArray(valor) ? valor : []).map((t) => String(t || "").trim()).filter(Boolean);
  const yaEsta = (t) => temas.some((x) => x.toLowerCase() === t.toLowerCase());
  const lleno = temas.length >= max;

  function anadir(t) {
    const limpio = String(t || "").replace(/[,;]+/g, " ").trim();
    setTexto("");
    if (!limpio || yaEsta(limpio) || lleno) return;
    onChange([...temas, limpio]);
  }
  const quitar = (i) => onChange(temas.filter((_, j) => j !== i));
  const pendientes = sugerencias.filter((s) => !yaEsta(s));

  return (
    <div className="space-y-3">
      {temas.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {temas.map((t, i) => (
            <span key={`${t}-${i}`}
              className="inline-flex items-center gap-1.5 pl-3 pr-1.5 py-1.5 rounded-full bg-primary text-white text-sm font-medium shadow-sm">
              {t}
              <button type="button" onClick={() => quitar(i)} aria-label={`Quitar ${t}`}
                className="w-5 h-5 rounded-full grid place-items-center bg-white/20 hover:bg-white/35 text-[13px] leading-none">
                ×
              </button>
            </span>
          ))}
        </div>
      )}

      <div className="flex gap-2">
        <input type="text" value={texto} className={`${campo} min-w-0`}
          placeholder={lleno ? `Ya tienes ${max} temas` : "Ej.: cooperación internacional"}
          disabled={lleno}
          onChange={(e) => setTexto(e.target.value)}
          onBlur={() => anadir(texto)}
          onKeyDown={(e) => { if (e.key === "Enter" || e.key === ",") { e.preventDefault(); anadir(texto); } }} />
        <button type="button" onClick={() => anadir(texto)} disabled={lleno || !texto.trim()}
          className="shrink-0 px-4 rounded-xl bg-primary text-white text-sm font-semibold disabled:opacity-40 active:scale-95 transition">
          Añadir
        </button>
      </div>

      {pendientes.length > 0 && !lleno && (
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400 mb-2">Toca para añadir</p>
          <div className="flex flex-wrap gap-2">
            {pendientes.map((s) => (
              <button key={s} type="button" onClick={() => anadir(s)}
                className="px-3 py-1.5 rounded-full border border-dashed border-neutral-300 text-sm text-neutral-600 bg-white hover:border-primary hover:text-primary active:scale-95 transition">
                + {s}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
