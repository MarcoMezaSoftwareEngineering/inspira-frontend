// src/pages/grado/Comparativa.jsx
// Pública vs privada: rangos por comunidad (residente frente a no residente)
// y precios de privadas por carrera. Solo datos verificados.
import { useState } from "react";
import { numero } from "../../config/paqueteMaster2027Resumen";
import { PRIVADAS_POR_CARRERA, PUBLICAS } from "../../config/gradoEspana";
import { evento } from "./piezas";

const COLOR_RESIDENTE = "#0079A8";
const COLOR_NO_RESIDENTE = "#E36A12";
const euros = (n) => `${numero(Math.round(n))} €`;
const rangoTexto = (min, max) => (Math.round(min) === Math.round(max) ? euros(max) : `${numero(Math.round(min))}–${euros(max)}`);

const ESTADOS = {
  sin: { texto: "Sin recargo", clase: "bg-secondary text-primary" },
  recargo: { texto: "Con recargo", clase: "bg-accent/15 text-accent-dark" },
  consultar: { texto: "Consultar", clase: "bg-neutral-200 text-neutral-700" },
};

const CARRERAS = [
  { id: "ade", nombre: "ADE" },
  { id: "derecho", nombre: "Derecho" },
  { id: "psicologia", nombre: "Psicología" },
  { id: "ingenieria", nombre: "Ingeniería" },
  { id: "medicina", nombre: "Medicina" },
];

function Leyenda({ items }) {
  return (
    <ul className="flex flex-wrap gap-x-5 gap-y-2 text-xs font-semibold text-neutral-700">
      {items.map((i) => (
        <li key={i.texto} className="flex items-center gap-2">
          <span aria-hidden="true" className="h-3 w-3 rounded-sm" style={{ background: i.color }} />
          {i.texto}
        </li>
      ))}
    </ul>
  );
}

function Tramo({ min, max, escala, color, alto = "h-2.5" }) {
  const izq = (min / escala) * 100;
  const ancho = Math.max(((max - min) / escala) * 100, 0);
  return (
    <div className={`relative ${alto} w-full`}>
      <span
        className="absolute inset-y-0 rounded-[4px]"
        style={{ left: `${izq}%`, width: `max(${ancho}%, 8px)`, background: color }}
      />
    </div>
  );
}

function Publicas() {
  const filas = [...PUBLICAS].sort((a, b) => a.noResidente.max - b.noResidente.max);
  const escala = 9000;
  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Leyenda
          items={[
            { texto: "Residente en España", color: COLOR_RESIDENTE },
            { texto: "Con visado o estancia (no residente)", color: COLOR_NO_RESIDENTE },
          ]}
        />
        <p className="text-xs text-neutral-500">Matrícula por curso (60 créditos)</p>
      </div>

      <div className="mt-5 hidden grid-cols-[9.5rem_minmax(0,1fr)_8.5rem] gap-4 pl-0 text-[11px] text-neutral-500 md:grid" aria-hidden="true">
        <span />
        <span className="relative h-4">
          {[0, 2000, 4000, 6000, 8000].map((t) => (
            <span key={t} className="absolute -translate-x-1/2 tabular-nums" style={{ left: `${(t / escala) * 100}%` }}>
              {t ? numero(t) : "0"}
            </span>
          ))}
        </span>
        <span />
      </div>

      <ul className="mt-2 divide-y divide-neutral-100">
        {filas.map((p) => {
          const e = ESTADOS[p.estado];
          return (
            <li key={p.id} className="grid gap-x-4 gap-y-1.5 py-2.5 md:grid-cols-[9.5rem_minmax(0,1fr)_8.5rem] md:items-center">
              <div className="flex items-center justify-between gap-2 md:block">
                <p className="text-sm font-bold leading-tight text-primary">{p.nombre}</p>
                <span className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-bold md:mt-1 ${e.clase}`}>{e.texto}</span>
              </div>
              <div className="space-y-1" title={p.regla}>
                <Tramo min={p.residente.min} max={p.residente.max} escala={escala} color={COLOR_RESIDENTE} alto="h-2" />
                <Tramo min={p.noResidente.min} max={p.noResidente.max} escala={escala} color={COLOR_NO_RESIDENTE} />
              </div>
              <div className="flex justify-between gap-3 text-xs tabular-nums md:block md:text-right">
                <span className="text-neutral-500">{rangoTexto(p.residente.min, p.residente.max)}</span>
                <span className="block font-bold text-neutral-900">
                  {rangoTexto(p.noResidente.min, p.noResidente.max)}
                  {!p.noResidente.maxVerificado || p.aviso ? <sup className="ml-0.5 text-accent-dark">*</sup> : null}
                </span>
              </div>
            </li>
          );
        })}
      </ul>
      <p className="mt-3 text-xs leading-relaxed text-neutral-600">
        <sup className="text-accent-dark">*</sup> Cifra de una universidad concreta o sin recargo confirmado: la
        universidad puede cobrar más a quien no es residente. Consultar en cada caso.
      </p>
    </div>
  );
}

function Privadas() {
  const [carrera, setCarrera] = useState("ade");
  const filas = PRIVADAS_POR_CARRERA[carrera] || [];
  const maximo = Math.max(...filas.map((f) => f.anual), 1);
  const escala = Math.ceil((maximo * 1.05) / 5000) * 5000;
  return (
    <div>
      <div role="radiogroup" aria-label="Carrera" className="flex flex-wrap gap-2">
        {CARRERAS.map((c) => (
          <button
            key={c.id}
            type="button"
            role="radio"
            aria-checked={carrera === c.id}
            onClick={() => {
              setCarrera(c.id);
              evento("grado_comparativa_carrera", { carrera: c.id });
            }}
            className={`min-h-[40px] rounded-full px-4 text-sm font-bold transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sky ${
              carrera === c.id ? "bg-primary text-white" : "bg-secondary-light text-primary hover:bg-secondary"
            }`}
          >
            {c.nombre}
          </button>
        ))}
      </div>
      <p className="mt-4 text-xs text-neutral-500">Precio del primer curso publicado por cada universidad</p>
      <ul className="mt-2 space-y-2.5">
        {filas.map((f) => (
          <li key={f.id + f.grado} className="grid gap-1 sm:grid-cols-[13rem_minmax(0,1fr)] sm:items-center sm:gap-4">
            <p className="text-sm leading-tight">
              <span className="font-bold text-primary">{f.universidad}</span>
              <span className="block text-[11px] text-neutral-500">
                {f.grado}
                {f.precioNoUE ? " · precio para fuera de la UE" : ""}
                {f.nota && !f.precioNoUE ? <sup className="ml-0.5 text-accent-dark">*</sup> : null}
              </span>
            </p>
            <div className="flex items-center gap-2">
              <span
                className="block h-3 rounded-r-[4px]"
                style={{ width: `${(f.anual / escala) * 100}%`, background: COLOR_RESIDENTE }}
                aria-hidden="true"
              />
              <span className="shrink-0 text-xs font-bold tabular-nums text-neutral-900">{euros(f.anual)}</span>
            </div>
          </li>
        ))}
      </ul>
      {filas.some((f) => f.nota && !f.precioNoUE) && (
        <ul className="mt-4 space-y-1 text-xs leading-relaxed text-neutral-600">
          {[...new Map(filas.filter((f) => f.nota && !f.precioNoUE).map((f) => [f.id, f])).values()].map((f) => (
            <li key={f.id}>
              <sup className="text-accent-dark">*</sup> {f.universidad}: {f.nota}
            </li>
          ))}
        </ul>
      )}
      <p className="mt-3 text-xs leading-relaxed text-neutral-600">
        Revisa en cada una qué incluye: reserva, matrícula o apertura se cuentan distinto. Las que no publican precio
        oficial (por ejemplo Comillas o Atlántico Medio) no aparecen: se piden por escrito.
      </p>
    </div>
  );
}

export default function Comparativa() {
  const [vista, setVista] = useState("publicas");
  return (
    <div className="rounded-3xl border border-neutral-200 bg-white p-5 sm:p-7">
      <div role="tablist" aria-label="Tipo de universidad" className="mb-6 inline-flex rounded-xl bg-secondary-light p-1">
        {[
          ["publicas", "Públicas por comunidad"],
          ["privadas", "Privadas por carrera"],
        ].map(([v, t]) => (
          <button
            key={v}
            type="button"
            role="tab"
            aria-selected={vista === v}
            onClick={() => setVista(v)}
            className={`rounded-lg px-3 py-2 text-sm font-bold sm:px-4 ${vista === v ? "bg-primary text-white" : "text-primary"}`}
          >
            {t}
          </button>
        ))}
      </div>
      {vista === "publicas" ? <Publicas /> : <Privadas />}
    </div>
  );
}
