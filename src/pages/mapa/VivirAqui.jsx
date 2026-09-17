// src/pages/mapa/VivirAqui.jsx
// «Vivir aquí»: coste de vida de un estudiante en la comunidad, con lo que
// trae `comunidad.vida` de GET /api/mapa (lectura en vida.js).
//
// Si la API aún no trae `vida` (o no trae ninguna cifra), no se pinta nada.
// Siempre «Aproximado · fuente…» y la referencia legal del IPREM. Con varias
// ciudades, selector de ciudad. Con `presupuesto` (vida.js, presupuestoAnual),
// la suma orientativa de matrícula y vida al año.
import { useState } from "react";
import Icono from "../../components/common/Icono";
import { leerVida, mismaCiudad, textoMes } from "./vida";
import { fechaCorta } from "./plazos";
import { PRESUPUESTO, VIDA, eur } from "./mapaTextos";

function Cifra({ etiqueta, valor, nota, ancho = false }) {
  if (!valor) return null;
  return (
    <div className={`rounded-2xl bg-white px-3 py-2.5 ring-1 ring-[#E1EFFD] ${ancho ? "col-span-2" : ""}`}>
      <dt className="text-[11px] font-bold text-neutral-700">{etiqueta}</dt>
      <dd className="mapa-titular mt-0.5 text-lg font-bold leading-tight text-[#003648]">{valor}</dd>
      {nota && <dd className="mt-0.5 text-[11px] leading-snug text-neutral-700">{nota}</dd>}
    </div>
  );
}

/**
 * `soloCiudad`: en la ficha de una ciudad, solo esa ciudad (si la comunidad la
 * trae); si no está, se muestran todas.
 */
export default function VivirAqui({ comunidad, soloCiudad = null, presupuesto = null }) {
  const vida = leerVida(comunidad);
  const propia = vida && soloCiudad ? vida.ciudades.findIndex((x) => mismaCiudad(x.nombre, soloCiudad)) : -1;
  const [elegida, setElegida] = useState(0);
  if (!vida) return null;

  const ciudades = propia >= 0 ? [vida.ciudades[propia]] : vida.ciudades;
  const ciudad = ciudades[Math.min(elegida, ciudades.length - 1)];
  const gasto = textoMes(ciudad.gasto_mes);
  const fuente = String(vida.fuente_resumen || "").trim().replace(/\.+$/, "");

  return (
    <section className="mt-6 rounded-3xl bg-[#F6FBFF] p-4 ring-1 ring-[#E1EFFD]" aria-labelledby={`vida-${comunidad.id}`}>
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h3 id={`vida-${comunidad.id}`} className="mapa-rotulo">
          <Icono nombre="casa" size={14} />
          {VIDA.titulo}
          {ciudades.length === 1 ? ` · ${ciudad.nombre}` : ""}
        </h3>
        <span className="rounded-full bg-white px-2 py-0.5 text-[10px] font-extrabold text-[#0A5873] ring-1 ring-[#CFE6FD]">{VIDA.aproximado}</span>
      </div>

      {ciudades.length > 1 && (
        <div role="group" aria-label={VIDA.elegirCiudad} className="mt-2 flex flex-wrap gap-1.5">
          {ciudades.map((x, i) => (
            <button
              key={`${x.nombre}-${i}`}
              type="button"
              aria-pressed={i === elegida}
              onClick={() => setElegida(i)}
              className={`mapa-boton mov-toque inline-flex min-h-[40px] items-center rounded-full px-3 py-1 text-[11px] font-bold focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#F09C48] ${
                i === elegida ? "bg-[#003648] text-white" : "bg-white text-[#003648] ring-1 ring-[#CFE6FD] hover:bg-[#E6F2FE]"
              }`}
            >
              {x.nombre}
            </button>
          ))}
        </div>
      )}

      <dl className="mt-3 grid grid-cols-2 gap-2">
        <Cifra ancho etiqueta={VIDA.gasto} valor={gasto} nota={gasto ? VIDA.gastoNota : null} />
        <Cifra etiqueta={VIDA.habitacion} valor={textoMes(ciudad.habitacion_mes)} />
        <Cifra etiqueta={VIDA.transporte} valor={textoMes(ciudad.transporte_mes)} />
        <Cifra etiqueta={VIDA.estudio} valor={textoMes(ciudad.estudio_mes)} />
      </dl>

      {(vida.clima || vida.idioma_cooficial) && (
        <ul className="mt-3 space-y-1 text-[12.5px] leading-snug text-neutral-900">
          {vida.clima && (
            <li>
              <strong className="text-[#003648]">{VIDA.clima}:</strong> {vida.clima}
            </li>
          )}
          {vida.idioma_cooficial && (
            <li>
              <strong className="text-[#003648]">{VIDA.idioma}:</strong> {vida.idioma_cooficial}
            </li>
          )}
        </ul>
      )}

      {vida.estilo.length > 0 && (
        <ul className="mt-2 list-disc space-y-1 pl-4 text-[12px] leading-snug text-neutral-800 marker:text-[#F09C48]">
          {vida.estilo.map((e) => (
            <li key={e}>{e}</li>
          ))}
        </ul>
      )}

      {presupuesto && (
        <div className="mt-3 rounded-2xl bg-[#003648] px-3 py-2.5 text-white">
          <p className="mapa-rotulo mapa-rotulo-claro">
            <Icono nombre="maletin" size={14} />
            {PRESUPUESTO.ficha}
          </p>
          <p className="mapa-titular mt-0.5 text-lg font-bold leading-tight">≈ {eur(presupuesto.total)} al año</p>
          <p className="mt-0.5 text-[11px] leading-snug text-white/80">{PRESUPUESTO.desglose(presupuesto)}</p>
        </div>
      )}

      <p className="mt-3 flex items-start gap-2 rounded-xl bg-white px-3 py-2 text-[11.5px] font-semibold leading-snug text-[#003648] ring-1 ring-[#F09C48]/50">
        <Icono nombre="balanza" size={15} className="mt-0.5 shrink-0 text-[#F09C48]" />
        <span>{VIDA.iprem}</span>
      </p>
      <p className="mt-2 text-[11px] leading-snug text-neutral-700">
        {VIDA.aproximado}
        {ciudad.verificado === false ? ` (${VIDA.sinVerificar})` : ""}
        {fuente ? ` · fuente: ${fuente}` : ""}
        {vida.actualizado ? ` · actualizado ${fechaCorta(vida.actualizado) || vida.actualizado}` : ""}
      </p>
    </section>
  );
}
