// src/pages/grado/SimuladorGrado.jsx
// El corazón de /grado-en-espana: la familia elige universidad, años, vía
// migratoria, acceso y vida, y ve la inversión año a año en columnas apiladas
// (matrícula · acceso · vida · Inspira), con leyenda, desglose y tabla.
// Toda la lógica está en config/gradoEspana.js (simular); aquí solo se pinta.
import { useMemo, useState } from "react";
import Icono from "../../components/common/Icono";
import { numero } from "../../config/paqueteMaster2027Resumen";
import {
  CATEGORIAS,
  CIUDADES,
  ESTANCIA,
  FUENTE_VIDA,
  IPREM_MES,
  META,
  NO_RESIDENTE,
  OPCIONES_DEFECTO,
  PUBLICAS,
  TIPOS,
  VISADOS,
  hayCosteVida,
  nombreCiudad,
  simular,
} from "../../config/gradoEspana";
import { Opciones, Orientativo, evento } from "./piezas";

const euros = (n) => `${numero(Math.round(n))} €`;
const compacto = (n) => (n >= 10000 ? `${String(Math.round(n / 100) / 10).replace(".", ",")} mil` : numero(Math.round(n)));
const rangoTexto = (r) => (Math.round(r.min) === Math.round(r.max) ? euros(r.max) : `${numero(Math.round(r.min))}–${euros(r.max)}`);

// Ciudades agrupadas por comunidad para el desplegable.
const GRUPOS_CIUDAD = Object.entries(
  CIUDADES.reduce((g, c) => {
    (g[c.comunidad] ||= []).push(c);
    return g;
  }, {})
).sort(([a], [b]) => a.localeCompare(b, "es"));

/** Techo «redondo» con aire por encima de la columna más alta. */
function techo(v) {
  if (v <= 0) return 1000;
  const bruto = v * 1.15;
  const paso = Math.pow(10, Math.floor(Math.log10(bruto)));
  return Math.ceil(bruto / (paso / 2)) * (paso / 2);
}

function Etiqueta({ children, htmlFor }) {
  return (
    <label htmlFor={htmlFor} className="mb-2 block text-xs font-bold uppercase tracking-wider text-neutral-700">
      {children}
    </label>
  );
}

function Columnas({ anios, lado, activo, onActivo }) {
  const totales = anios.map((a) => CATEGORIAS.reduce((s, c) => s + a[c.id][lado], 0));
  const tope = techo(Math.max(...totales));
  return (
    <div>
      <div className="relative h-56 sm:h-64" role="group" aria-label="Inversión por año">
        {[1, 0.5, 0].map((f) => (
          <div key={f} aria-hidden="true" className="absolute inset-x-0 border-t border-neutral-200" style={{ bottom: `${f * 100}%` }}>
            <span className="absolute -top-2 left-0 bg-white pr-1 text-[10px] tabular-nums text-neutral-500 sm:text-[11px]">
              {f ? compacto(tope * f) : "0"}
            </span>
          </div>
        ))}
        <div className="absolute inset-y-0 left-10 right-0 flex items-end justify-around sm:left-12">
          {anios.map((a, i) => (
            <button
              key={a.n}
              type="button"
              onMouseEnter={() => onActivo(i)}
              onFocus={() => onActivo(i)}
              onClick={() => onActivo(i)}
              aria-pressed={activo === i}
              aria-label={`Año ${a.n}: ${euros(totales[i])}`}
              className="relative flex h-full w-11 flex-col items-center justify-end rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky sm:w-16"
            >
              <span className={`mb-1 whitespace-nowrap text-[10px] font-bold tabular-nums sm:text-xs ${activo === i ? "text-primary" : "text-neutral-700"}`}>
                {compacto(totales[i])}
              </span>
              <span className="flex w-6 flex-col-reverse gap-[2px]" style={{ height: `${(totales[i] / tope) * 100}%` }}>
                {CATEGORIAS.map((c) =>
                  a[c.id][lado] > 0 ? (
                    <span
                      key={c.id}
                      className="block min-h-[2px] w-full last:rounded-t-[4px]"
                      style={{ flexGrow: a[c.id][lado], flexBasis: 0, background: c.color }}
                    />
                  ) : null
                )}
              </span>
            </button>
          ))}
        </div>
      </div>
      <div className="ml-10 flex justify-around border-t border-neutral-300 pt-2 sm:ml-12">
        {anios.map((a, i) => (
          <span key={a.n} className={`w-11 text-center text-[11px] font-semibold sm:w-16 sm:text-xs ${activo === i ? "text-primary" : "text-neutral-500"}`}>
            Año {a.n}
          </span>
        ))}
      </div>
    </div>
  );
}

function Desglose({ anio, lado }) {
  return (
    <div className="rounded-2xl bg-secondary-light p-4 sm:p-5">
      <p className="text-sm font-bold text-primary">
        Año {anio.n}: {euros(CATEGORIAS.reduce((s, c) => s + anio[c.id][lado], 0))}
      </p>
      <ul className="mt-3 space-y-3">
        {CATEGORIAS.map((c) => {
          const lineas = anio.lineas[c.id];
          if (!lineas.length) return null;
          return (
            <li key={c.id}>
              <p className="flex items-center justify-between gap-3 text-sm font-semibold text-neutral-900">
                <span className="flex items-center gap-2">
                  <span aria-hidden="true" className="h-3 w-3 shrink-0 rounded-sm" style={{ background: c.color }} />
                  {c.nombre}
                </span>
                <span className="tabular-nums">{euros(anio[c.id][lado])}</span>
              </p>
              <ul className="mt-1 space-y-0.5 pl-5">
                {lineas.map((l) => (
                  <li key={l.texto} className="flex justify-between gap-3 text-xs leading-snug text-neutral-700">
                    <span>{l.texto}</span>
                    <span className="shrink-0 tabular-nums">{euros(l[lado])}</span>
                  </li>
                ))}
              </ul>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export default function SimuladorGrado() {
  const [o, setO] = useState(OPCIONES_DEFECTO);
  const [lado, setLado] = useState("max");
  const [activo, setActivo] = useState(0);
  const res = useMemo(() => simular(o), [o]);

  const cambiar = (campo, valor) => {
    setO((prev) => {
      const sig = { ...prev, [campo]: valor };
      if (campo === "tipo") {
        sig.comunidadId = "";
        if (valor === "madrid" && CIUDADES.some((c) => c.id === "madrid")) sig.ciudadId = "madrid";
      }
      return sig;
    });
    if (campo === "anios") setActivo(0);
    evento("grado_simulador", { campo, valor: String(valor) });
  };

  const total = res.total;
  const suma = CATEGORIAS.reduce((s, c) => s + res.totales[c.id][lado], 0) || 1;

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,22rem)_minmax(0,1fr)] lg:gap-8">
      {/* Controles */}
      <div className="space-y-6 rounded-3xl border border-neutral-200 bg-white p-5 sm:p-6">
        <div>
          <Etiqueta>1. Universidad</Etiqueta>
          {["Pública", "Privada"].map((grupo) => (
            <div key={grupo} className="mb-2">
              <p className="mb-1.5 text-[11px] font-semibold text-neutral-500">{grupo}</p>
              <Opciones
                nombre={`Universidad ${grupo.toLowerCase()}`}
                columnas="grid-cols-1 min-[380px]:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3"
                valor={o.comunidadId ? null : o.tipo}
                onCambio={(v) => cambiar("tipo", v)}
                opciones={TIPOS.filter((t) => t.grupo === grupo).map((t) => ({
                  valor: t.id,
                  etiqueta: t.nombre.replace(/^(Pública|Privada) /, "").replace(/^./, (l) => l.toUpperCase()),
                }))}
              />
            </div>
          ))}
          <label htmlFor="ge-comunidad" className="mt-3 block text-[11px] font-semibold text-neutral-500">
            O elige una comunidad (universidad pública)
          </label>
          <select
            id="ge-comunidad"
            value={o.comunidadId}
            onChange={(e) => {
              const v = e.target.value;
              // La ciudad sigue a la comunidad elegida (la primera con datos).
              const ciudad = CIUDADES.find((c) => c.comunidadId === v);
              setO((prev) => ({ ...prev, comunidadId: v, ...(ciudad ? { ciudadId: ciudad.id } : {}) }));
              evento("grado_simulador", { campo: "comunidad", valor: v });
            }}
            className="mt-1.5 min-h-[44px] w-full rounded-xl border border-neutral-200 bg-white px-3 text-sm font-semibold text-primary focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sky"
          >
            <option value="">Sin elegir comunidad</option>
            {[...PUBLICAS]
              .sort((a, b) => a.nombre.localeCompare(b.nombre, "es"))
              .map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nombre}
                </option>
              ))}
          </select>
        </div>

        <div>
          <Etiqueta>2. Duración</Etiqueta>
          <Opciones
            nombre="Duración del grado"
            valor={o.anios}
            onCambio={(v) => cambiar("anios", v)}
            opciones={[
              { valor: 4, etiqueta: "4 años", nota: "La mayoría de grados" },
              { valor: 6, etiqueta: "6 años", nota: "Medicina" },
            ]}
          />
        </div>

        <div>
          <Etiqueta>3. Vía migratoria</Etiqueta>
          <Opciones
            nombre="Vía migratoria"
            valor={o.via}
            onCambio={(v) => cambiar("via", v)}
            opciones={[
              { valor: "visado", etiqueta: "Visado de estudiante", nota: "Desde Perú" },
              { valor: "estancia", etiqueta: "Estancia por estudios", nota: `Desde España · ${ESTANCIA.eur} €` },
            ]}
          />
          {o.via === "visado" && (
            <div className="mt-2">
              <Opciones
                nombre="Asesoría de visado"
                columnas="grid-cols-3"
                valor={o.visadoId}
                onCambio={(v) => cambiar("visadoId", v)}
                opciones={VISADOS.map((v) => ({
                  valor: v.id,
                  etiqueta: v.nombre.replace("Asesoría ", ""),
                  nota: `${v.eur} €${v.recomendado ? " · recomendada" : ""}`,
                }))}
              />
            </div>
          )}
          <p className="mt-2 text-xs leading-snug text-neutral-600">
            Con las dos vías paga matrícula como no residente.
          </p>
        </div>

        <div>
          <Etiqueta>4. Acceso a la universidad</Etiqueta>
          <Opciones
            nombre="Vía de acceso"
            valor={o.examen}
            onCambio={(v) => cambiar("examen", v)}
            opciones={[
              { valor: false, etiqueta: "Sin examen", nota: "Recomendada" },
              { valor: true, etiqueta: "Con examen", nota: "PCE de UNEDasiss" },
            ]}
          />
          {o.examen && (
            <div className="mt-3 flex items-center justify-between gap-3 rounded-xl bg-secondary-light px-3 py-2">
              <span className="text-sm font-semibold text-primary">Asignaturas PCE</span>
              <span className="flex items-center gap-2">
                <button
                  type="button"
                  aria-label="Una asignatura menos"
                  disabled={o.pce <= 1}
                  onClick={() => cambiar("pce", o.pce - 1)}
                  className="h-9 w-9 rounded-lg bg-white text-lg font-bold text-primary ring-1 ring-neutral-200 disabled:opacity-40"
                >
                  −
                </button>
                <span aria-live="polite" className="w-5 text-center font-bold tabular-nums text-primary">
                  {o.pce}
                </span>
                <button
                  type="button"
                  aria-label="Una asignatura más"
                  disabled={o.pce >= 6}
                  onClick={() => cambiar("pce", o.pce + 1)}
                  className="h-9 w-9 rounded-lg bg-white text-lg font-bold text-primary ring-1 ring-neutral-200 disabled:opacity-40"
                >
                  +
                </button>
              </span>
            </div>
          )}
        </div>

        <div>
          <Etiqueta htmlFor={hayCosteVida() ? "ge-ciudad" : undefined}>5. Vida en España</Etiqueta>
          {hayCosteVida() ? (
            <>
              <Opciones
                nombre="Vida en España"
                valor={o.vida}
                onCambio={(v) => cambiar("vida", v)}
                opciones={[
                  { valor: "ciudad", etiqueta: "Por ciudad", nota: "Gasto de estudiante" },
                  { valor: "iprem", etiqueta: "Mínimo legal", nota: `${IPREM_MES} € al mes` },
                ]}
              />
              {o.vida === "ciudad" && (
                <select
                  id="ge-ciudad"
                  value={o.ciudadId}
                  onChange={(e) => cambiar("ciudadId", e.target.value)}
                  className="mt-2 min-h-[44px] w-full rounded-xl border border-neutral-200 bg-white px-3 text-sm font-semibold text-primary focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sky"
                >
                  {GRUPOS_CIUDAD.map(([comunidad, lista]) => (
                    <optgroup key={comunidad} label={comunidad}>
                      {lista.map((c) => (
                        <option key={c.id} value={c.id}>
                          {nombreCiudad(c)} · {c.mensual.min}–{c.mensual.max} € al mes
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              )}
              <p className="mt-2 text-xs leading-snug text-neutral-600">
                Gasto orientativo de estudiante: habitación compartida, comida, transporte y móvil, por 12 meses. La ley
                pide acreditar al menos {IPREM_MES} € al mes; en las ciudades caras el gasto real es mayor.
              </p>
            </>
          ) : (
            <>
              <Opciones
                nombre="Vida en España"
                valor={o.vida}
                onCambio={(v) => cambiar("vida", v)}
                opciones={[
                  { valor: "iprem", etiqueta: "Sumar el mínimo legal", nota: `${IPREM_MES} € al mes` },
                  { valor: "no", etiqueta: "No sumar", nota: "Solo estudios y trámites" },
                ]}
              />
              <p className="mt-2 text-xs leading-snug text-neutral-600">
                El coste de vida por ciudad está en preparación. Mientras, usamos el mínimo que exige la ley para
                acreditar medios económicos (IPREM 2026).
              </p>
            </>
          )}
        </div>
      </div>

      {/* Resultado */}
      <div className="min-w-0 rounded-3xl border border-neutral-200 bg-white p-5 sm:p-7" aria-live="polite">
        <div className="flex flex-wrap items-center gap-2">
          <Orientativo />
          <span className="text-xs font-semibold text-neutral-500">Curso de referencia {META.curso}</span>
        </div>
        <p className="mt-3 text-sm font-semibold text-neutral-700">Inversión total en {o.anios} años</p>
        <p className="mt-1 font-sans text-4xl font-extrabold leading-none text-primary sm:text-5xl">
          {rangoTexto(total)}
        </p>
        <p className="mt-2 text-xs text-neutral-600">
          {Math.round(total.min) === Math.round(total.max)
            ? "Con los precios publicados de la opción elegida."
            : "Entre el precio más bajo y el más alto de la opción elegida (según la carrera)."}
        </p>

        {/* Reparto del total */}
        <div className="mt-5">
          <div className="flex h-3 w-full gap-[2px] overflow-hidden rounded-full" aria-hidden="true">
            {CATEGORIAS.map((c) =>
              res.totales[c.id][lado] > 0 ? (
                <span key={c.id} className="h-full" style={{ flexGrow: res.totales[c.id][lado], flexBasis: 0, background: c.color }} />
              ) : null
            )}
          </div>
          <ul className="mt-3 grid gap-x-6 gap-y-2 sm:grid-cols-2">
            {CATEGORIAS.map((c) => (
              <li key={c.id} className="flex items-start justify-between gap-3 text-sm">
                <span className="flex items-start gap-2">
                  <span aria-hidden="true" className="mt-1 h-3 w-3 shrink-0 rounded-sm" style={{ background: c.color }} />
                  <span>
                    <span className="block font-semibold leading-snug text-neutral-900">{c.nombre}</span>
                    <span className="block text-[11px] text-neutral-500">{c.pagaA}</span>
                  </span>
                </span>
                <span className="shrink-0 text-right font-bold tabular-nums text-neutral-900">
                  {euros(res.totales[c.id][lado])}
                  <span className="block text-[11px] font-semibold text-neutral-500">
                    {Math.round((res.totales[c.id][lado] / suma) * 100)} %
                  </span>
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* Columnas por año */}
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm font-bold text-primary">Año a año</p>
          {Math.round(total.min) !== Math.round(total.max) && (
            <div role="radiogroup" aria-label="Escenario" className="inline-flex rounded-lg bg-secondary-light p-1 text-xs font-bold">
              {[
                ["min", "Precio más bajo"],
                ["max", "Precio más alto"],
              ].map(([v, t]) => (
                <button
                  key={v}
                  type="button"
                  role="radio"
                  aria-checked={lado === v}
                  onClick={() => setLado(v)}
                  className={`rounded-md px-3 py-1.5 ${lado === v ? "bg-primary text-white" : "text-primary"}`}
                >
                  {t}
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="mt-4">
          <Columnas anios={res.anios} lado={lado} activo={activo} onActivo={setActivo} />
        </div>
        <p className="mt-2 text-[11px] text-neutral-500">Toca o pasa el cursor por un año para ver su desglose.</p>

        <div className="mt-4">
          <Desglose anio={res.anios[Math.min(activo, res.anios.length - 1)]} lado={lado} />
        </div>

        <div className="mt-4 flex gap-3 rounded-2xl border border-sky/60 p-4 text-sm leading-relaxed text-neutral-700">
          <span className="mt-0.5 shrink-0 text-primary">
            <Icono nombre="balanza" size={20} />
          </span>
          <p>
            <strong className="text-primary">El precio de Inspira es el de sus servicios.</strong> La matrícula se paga
            directamente a la universidad, y las tasas, a cada organismo. {NO_RESIDENTE}
          </p>
        </div>

        {res.avisos.length > 0 && (
          <ul className="mt-4 space-y-1.5">
            {res.avisos.map((a) => (
              <li key={a} className="flex gap-2 text-xs leading-snug text-neutral-600">
                <span aria-hidden="true" className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                {a}
              </li>
            ))}
          </ul>
        )}

        <details className="mt-5 rounded-2xl border border-neutral-200">
          <summary className="cursor-pointer px-4 py-3 text-sm font-bold text-primary">Ver la tabla por año</summary>
          <div className="overflow-x-auto px-4 pb-4">
            <table className="w-full min-w-[520px] text-left text-xs">
              <thead>
                <tr className="border-b border-neutral-200 text-neutral-500">
                  <th className="py-2 pr-3 font-semibold">Concepto</th>
                  {res.anios.map((a) => (
                    <th key={a.n} className="py-2 pr-3 text-right font-semibold">
                      Año {a.n}
                    </th>
                  ))}
                  <th className="py-2 text-right font-semibold">Total</th>
                </tr>
              </thead>
              <tbody>
                {CATEGORIAS.map((c) => (
                  <tr key={c.id} className="border-b border-neutral-100">
                    <td className="py-2 pr-3 font-semibold text-neutral-900">{c.nombre}</td>
                    {res.anios.map((a) => (
                      <td key={a.n} className="py-2 pr-3 text-right tabular-nums text-neutral-700">
                        {rangoTexto(a[c.id])}
                      </td>
                    ))}
                    <td className="py-2 text-right font-bold tabular-nums text-neutral-900">{rangoTexto(res.totales[c.id])}</td>
                  </tr>
                ))}
                <tr>
                  <td className="py-2 pr-3 font-bold text-primary">Total</td>
                  {res.anios.map((a) => (
                    <td key={a.n} className="py-2 pr-3 text-right font-bold tabular-nums text-primary">
                      {rangoTexto({
                        min: CATEGORIAS.reduce((s, c) => s + a[c.id].min, 0),
                        max: CATEGORIAS.reduce((s, c) => s + a[c.id].max, 0),
                      })}
                    </td>
                  ))}
                  <td className="py-2 text-right font-bold tabular-nums text-primary">{rangoTexto(total)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </details>

        {hayCosteVida() && FUENTE_VIDA.documento && (
          <p className="mt-3 text-[11px] text-neutral-500">
            Coste de vida: {FUENTE_VIDA.documento} ({FUENTE_VIDA.fecha}).
          </p>
        )}
      </div>
    </div>
  );
}
