// src/pages/grado/VidaEspana.jsx
// «Vivir en España»: gasto mensual orientativo de un estudiante por ciudad
// (rango bajo–medio) frente al mínimo legal del IPREM. Datos: config/costeVida.js.
import { useState } from "react";
import { numero } from "../../config/paqueteMaster2027Resumen";
import { CIUDADES, FUENTE_VIDA, IPREM_REFERENCIA } from "../../config/costeVida";
import { Orientativo, evento } from "./piezas";

const COLOR = "#0079A8";
const INICIALES = 10;
const ESCALA = 1200;
const pct = (v) => `${(v / ESCALA) * 100}%`;

export default function VidaEspana() {
  const [todas, setTodas] = useState(false);
  const filas = [...CIUDADES].sort((a, b) => a.mensual.min - b.mensual.min || a.mensual.max - b.mensual.max);
  const visibles = todas ? filas : filas.slice(0, INICIALES);
  const iprem = IPREM_REFERENCIA.mensual;
  const porEncima = filas.filter((c) => c.mensual.min > iprem).length;

  return (
    <div className="rounded-3xl border border-neutral-200 bg-white p-5 sm:p-7">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <ul className="flex flex-wrap gap-x-5 gap-y-2 text-xs font-semibold text-neutral-700">
          <li className="flex items-center gap-2">
            <span aria-hidden="true" className="h-3 w-6 rounded-[4px]" style={{ background: COLOR }} />
            Gasto al mes, de bajo a medio
          </li>
          <li className="flex items-center gap-2">
            <span aria-hidden="true" className="h-4 w-[2px] bg-primary" />
            Mínimo legal: {iprem} € al mes (IPREM 2026)
          </li>
        </ul>
        <Orientativo />
      </div>

      <p className="mt-4 rounded-2xl bg-secondary-light px-4 py-3 text-sm leading-relaxed text-primary">
        En {porEncima} de las {filas.length} ciudades, hasta el gasto más ajustado supera el mínimo que pide la ley.
        Conviene que la familia prevea más que esos {iprem} € al mes.
      </p>

      <div className="relative mt-5">
        <div className="hidden grid-cols-[11rem_minmax(0,1fr)_7.5rem] gap-4 text-[11px] text-neutral-500 md:grid" aria-hidden="true">
          <span />
          <span className="relative h-4">
            {[0, 300, 600, 900, 1200].map((t) => (
              <span key={t} className="absolute -translate-x-1/2 tabular-nums" style={{ left: pct(t) }}>
                {numero(t)}
              </span>
            ))}
          </span>
          <span />
        </div>

        <ul className="divide-y divide-neutral-100">
          {visibles.map((c) => (
            <li key={c.id} className="grid gap-x-4 gap-y-1.5 py-2.5 md:grid-cols-[11rem_minmax(0,1fr)_7.5rem] md:items-center">
              <p className="flex items-baseline justify-between gap-2 text-sm leading-tight md:block">
                <span className="font-bold text-primary">{c.nombre}</span>
                <span className="text-[11px] text-neutral-500 md:block">{c.comunidad}</span>
              </p>
              <div className="relative h-4" title={c.nota || undefined}>
                <span aria-hidden="true" className="absolute inset-y-[-4px] w-[2px] bg-primary/70" style={{ left: pct(iprem) }} />
                <span
                  className="absolute inset-y-[3px] rounded-[4px]"
                  style={{ left: pct(c.mensual.min), width: `max(${pct(c.mensual.max - c.mensual.min)}, 8px)`, background: COLOR }}
                />
              </div>
              <p className="text-right text-xs font-bold tabular-nums text-neutral-900 max-md:text-left">
                {numero(c.mensual.min)}–{numero(c.mensual.max)} €
                {!c.verificado && <span className="ml-1 font-semibold text-neutral-500">aprox.</span>}
              </p>
            </li>
          ))}
        </ul>
      </div>

      {filas.length > INICIALES && (
        <button
          type="button"
          onClick={() => {
            setTodas((v) => !v);
            evento("grado_vida_todas", { abrir: !todas });
          }}
          aria-expanded={todas}
          className="mt-3 min-h-[44px] rounded-xl bg-secondary-light px-4 text-sm font-bold text-primary hover:bg-secondary"
        >
          {todas ? "Ver menos ciudades" : `Ver las ${filas.length} ciudades`}
        </button>
      )}

      <p className="mt-4 text-xs leading-relaxed text-neutral-600">
        {FUENTE_VIDA.metodo} No incluye: {FUENTE_VIDA.noIncluye.replace(/\.$/, "")}. «Aprox.»: alguna cifra de la
        ciudad, sobre todo el transporte, no está confirmada en fuente oficial de 2026. Muchos abonos jóvenes exigen
        empadronarse. Fuente: {FUENTE_VIDA.documento}, Inspira, {FUENTE_VIDA.fecha.split("-").reverse().join("/")}.
      </p>
    </div>
  );
}
