// src/pages/mapa/Fichas.jsx
// Fichas del panel del mapa: inicio, comunidad, ciudad, universidad, caso de
// éxito y comunidades fuera de las listas. Solo pintan lo que llega de
// GET /api/mapa y de config/casos.js: ni importes ni recuentos escritos a mano.
//
// Decisión del cliente (14/09/2026): no se enlaza a las webs de las
// universidades. Las acciones son WhatsApp («Quiero postular aquí») y la
// calculadora.
//
// 17/09/2026: cada rótulo y cada bloque llevan su icono, para que la ficha se
// recorra con la vista sin leerla entera. Los iconos son opcionales: un Bloque
// sin `icono` sigue pintando igual que antes.
import Icono from "../../components/common/Icono";
import { CALENDLY_URL, whatsappDesde } from "../../config/contacto";
import { registrarEvento } from "../../lib/analytics";
import { navigate } from "../../services/navigate";
import {
  SIN_RAMA,
  ejemplosDeComunidad,
  masteresDe,
  nombreRama,
  leerBecas,
  ordenarUniversidades,
  precioDeUniversidad,
  ramasOrdenadas,
  universidadPorNombre,
} from "./indice";
import { cursoCorto, leerPlazos, plazoMasTemprano, rangoFechas } from "./plazos";
import TarjetaPrecio from "./TarjetaPrecio";
import IlustracionCiudad from "./IlustracionesMapa";
import IconoMapa from "./IconosMapa";
import { rutaComunidad, rutaUniversidad } from "./rutasLugar";
import PrimerAnio from "./PrimerAnio";
import AvisoPlazo from "./AvisoPlazo";
import { presupuestoEnCiudad } from "./vida";
import VivirAqui from "./VivirAqui";
import { SelectorOrden } from "./ResultadosUniversidades";
import { BotonGuardar } from "./GuardarComparativa";
import { tonoDe } from "./tonosMapa";
import { useContador } from "./useContador";
import {
  BECAS,
  INICIO,
  PAQUETE,
  PLAZOS,
  RECOMENDAR,
  SESION,
  T,
  eur,
  etiquetaLista,
  etiquetaListaLarga,
  importeMatricula,
  mayus,
  notasMatricula,
  numero,
  plural,
  textoRanking,
} from "./mapaTextos";

const irA = (href) => (e) => {
  e.preventDefault();
  navigate(href);
  window.scrollTo({ top: 0, behavior: "instant" });
};

const FOCO = "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#F09C48]";

/**
 * Enlace a la página propia del sitio (/master/galicia, /universidad/udc).
 * Desde el mapa lleva a una dirección que se puede compartir y que Google
 * puede posicionar; dentro de esa misma página no se pinta, para no ofrecer
 * un enlace a donde ya se está.
 */
function EnlacePagina({ href, texto }) {
  if (typeof window !== "undefined" && window.location.pathname === href) return null;
  return (
    <a
      href={href}
      onClick={irA(href)}
      className={`mapa-boton mov-toque mt-3 inline-flex min-h-[46px] w-full items-center justify-center gap-2 rounded-2xl border border-[#CFE6FD] bg-white px-4 py-2.5 text-sm font-bold text-[#0A5873] hover:bg-[#F6FBFF] ${FOCO}`}
    >
      <Icono nombre="documento" size={16} />
      {texto}
    </a>
  );
}

/**
 * Sello de título oficial. Es la pregunta que más repiten en los comentarios
 * de los vídeos («¿son de título oficial?») y la respuesta que separa a
 * Inspira de quien vende programas sin validez en España.
 *
 * El dibujo es propio: los escudos del Ministerio y del RUCT son marcas y no
 * se reproducen sin permiso.
 */
function SelloOficial({ className = "" }) {
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full bg-[#EAF6EE] px-3 py-1.5 text-[12px] font-extrabold text-[#1B5E35] ring-1 ring-[#BFE3CC] ${className}`}
      title="Inscrito en el Registro de Universidades, Centros y Títulos del Ministerio"
    >
      <IconoMapa nombre="sello" size={15} strokeWidth={1.6} />
      Título oficial · RUCT
    </span>
  );
}

/**
 * Prueba social donde se decide: junto a la cifra, no al final de la ficha.
 * Quien acaba de ver lo que cuesta Valencia quiere saber quién lo ha hecho ya.
 */
function PruebaSocial({ casos, onElegir }) {
  if (!casos?.length) return null;
  return (
    <div className="mt-2.5 rounded-2xl border border-[#E1EFFD] bg-[#F6FBFF] px-3.5 py-2.5">
      <p className="mapa-rotulo mb-1.5">
        <Icono nombre="trofeo" size={13} />
        Ya lo lograron
      </p>
      <ul className="space-y-1.5">
        {casos.slice(0, 3).map((k) => (
          <li key={k.id}>
            <button
              type="button"
              onClick={() => onElegir("caso", k.id)}
              className={`mov-toque w-full rounded-xl px-1 py-0.5 text-left text-[13px] leading-snug text-neutral-800 hover:bg-white ${FOCO}`}
            >
              <strong className="text-[#003648]">{k.nombre}</strong>
              {k.destacado ? ` · ${k.destacado}` : ""}
              <span className="block text-[12px] text-neutral-700">{k.universidad}</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

/**
 * Cabecera ilustrada de la ficha: la silueta de la ciudad de la que se está
 * hablando (IlustracionesMapa.jsx). Una ciudad sin dibujo propio enseña el
 * edificio universitario genérico, así que la ficha nunca se queda coja.
 */
function Postal({ ciudad, pie = null }) {
  if (!ciudad) return null;
  return (
    <div className="mapa-ciudad-lienzo mb-3 overflow-hidden rounded-2xl ring-1 ring-[#CFE6FD]">
      <IlustracionCiudad ciudad={ciudad} />
      {pie && (
        <span className="absolute bottom-2 left-3 right-3 z-[2] flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-wide text-white">
          <Icono nombre="ubicacion" size={12} className="text-[#F09C48]" />
          {pie}
        </span>
      )}
    </div>
  );
}

/* ── Piezas ──────────────────────────────────────────────────────────── */

/** Número que sube hasta su valor al aparecer. */
export function Cifra({ n }) {
  const v = useContador(Number(n) || 0);
  return <span className="tabular-nums">{numero(v)}</span>;
}

function Rotulo({ children, icono = null }) {
  return (
    <p className="mapa-rotulo">
      {icono && <Icono nombre={icono} size={14} />}
      {children}
    </p>
  );
}

function Titulo({ children }) {
  return <h2 className="mapa-titular mt-1 text-[24px] font-bold leading-tight text-[#003648]">{children}</h2>;
}

/**
 * Tramo de matrícula. El color va en el punto, no en todo el chip: el naranja
 * pleno se guarda para el botón que hay que pulsar, que si no compite con él.
 */
function ChipLista({ lista }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full bg-[#F2F7FC] px-3 py-1.5 text-[12px] font-bold text-[#003648] ring-1 ring-[#E1EFFD]">
      <span aria-hidden="true" className={`h-2.5 w-2.5 shrink-0 rounded-full ${tonoDe(lista?.id).muestra}`} />
      {etiquetaListaLarga(lista)}
    </span>
  );
}

function ChipTitularidad({ valor }) {
  if (!valor) return null;
  return (
    <span className="inline-flex items-center rounded-full bg-white px-2.5 py-1 text-[11px] font-bold text-[#003648] ring-1 ring-[#96CCFC]">
      {valor}
    </span>
  );
}

function ChipComunidad({ com, onElegir }) {
  if (!com) return null;
  return (
    <button
      type="button"
      onClick={() => onElegir("comunidad", com.id)}
      className={`mapa-boton rounded-full border border-neutral-200 bg-white px-2.5 py-1 text-[11px] font-bold text-[#003648] hover:bg-[#F6FBFF] ${FOCO}`}
    >
      {com.nombre}
    </button>
  );
}

function Dato({ etiqueta, valor, nota, ancho = false }) {
  return (
    <div className={`rounded-2xl bg-[#F6FBFF] px-3 py-2.5 ring-1 ring-[#E1EFFD] ${ancho ? "col-span-2" : ""}`}>
      <dt className="text-[11px] font-bold text-neutral-700">{etiqueta}</dt>
      <dd className="mapa-titular mt-0.5 text-xl font-bold leading-tight text-[#003648]">{valor}</dd>
      {nota && <dd className="mt-0.5 text-[11px] leading-snug text-neutral-700">{nota}</dd>}
    </div>
  );
}

function Bloque({ titulo, accion = null, icono = null, children }) {
  return (
    <section className="mt-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="mapa-rotulo">
          {icono && <Icono nombre={icono} size={14} />}
          {titulo}
        </h3>
        {accion}
      </div>
      <div className="mt-2">{children}</div>
    </section>
  );
}

function BotonChip({ children, onClick, icono }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`mapa-boton mov-toque inline-flex min-h-[44px] items-center gap-1.5 rounded-full border border-neutral-200 bg-white px-3.5 py-1.5 text-xs font-bold text-[#003648] hover:border-[#96CCFC] hover:bg-[#F6FBFF] ${FOCO}`}
    >
      {icono && <Icono nombre={icono} size={13} className="text-[#F09C48]" />}
      {children}
    </button>
  );
}

function Migas({ foco, indice, geoPorId, onElegir }) {
  const pasos = [{ etiqueta: "España", ir: () => onElegir(null) }];
  if (foco.comunidad) {
    pasos.push({
      etiqueta: indice.comunidades.get(foco.comunidad)?.nombre || geoPorId.get(foco.comunidad)?.nombre || foco.comunidad,
      ir: () => onElegir("comunidad", foco.comunidad),
    });
  }
  if (foco.ciudad) {
    pasos.push({ etiqueta: indice.ciudades.get(foco.ciudad)?.nombre || foco.ciudad, ir: () => onElegir("ciudad", foco.ciudad) });
  }
  if (foco.universidad) pasos.push({ etiqueta: indice.universidades.get(foco.universidad)?.sigla || foco.universidad });
  if (foco.caso) pasos.push({ etiqueta: "Caso de éxito" });

  return (
    <nav aria-label="Dónde estás en el mapa">
      <ol className="flex flex-wrap items-center gap-1 text-xs">
        {pasos.map((p, i) => (
          <li key={`${i}-${p.etiqueta}`} className="flex items-center gap-1">
            {i > 0 && <Icono nombre="flecha" size={11} className="text-neutral-400" />}
            {i === pasos.length - 1 ? (
              <span aria-current="location" className="font-bold text-[#003648]">
                {p.etiqueta}
              </span>
            ) : (
              <button
                type="button"
                onClick={p.ir}
                className="font-semibold text-[#0A5873] underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F09C48]"
              >
                {p.etiqueta}
              </button>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

/** Barras por rama: un solo tono, etiqueta y cifra en cada fila. */
function BarrasRamas({ conteo, ramas, resaltada }) {
  const filas = ramasOrdenadas(conteo, ramas);
  if (!filas.length) return <p className="text-sm text-neutral-700">Sin másteres oficiales cargados.</p>;
  const max = Math.max(...filas.map((f) => f.n));
  return (
    <ul className="space-y-2.5">
      {filas.map((f, i) => {
        const sinRama = f.id === SIN_RAMA;
        const apagada = resaltada && resaltada !== f.id;
        return (
          <li key={f.id} title={`${f.nombre}: ${numero(f.n)}`}>
            <div className="flex items-baseline justify-between gap-3 text-[12.5px]">
              <span className={`min-w-0 truncate ${resaltada === f.id ? "font-extrabold text-[#003648]" : "font-semibold text-neutral-900"}`}>
                {f.nombre}
              </span>
              <span className="shrink-0 font-bold tabular-nums text-[#003648]">{numero(f.n)}</span>
            </div>
            <div className="mt-1 h-2 overflow-hidden rounded-full bg-[#E6F2FE]" aria-hidden="true">
              <div
                className={`mapa-barra h-2 rounded-full ${sinRama ? "bg-neutral-500" : apagada ? "bg-[#0A5873]/35" : "bg-[#0A5873]"}`}
                style={{ width: `${Math.max(3, (f.n / max) * 100)}%`, animationDelay: `${i * 60}ms` }}
              />
            </div>
          </li>
        );
      })}
    </ul>
  );
}

function NotasMatricula({ m }) {
  const notas = notasMatricula(m);
  if (!notas.length) return null;
  return (
    <ul className="mt-2 space-y-0.5 text-[11px] leading-snug text-neutral-700">
      {notas.map((n) => (
        <li key={n}>{n}</li>
      ))}
    </ul>
  );
}

function PlanInspira({ plan, lista }) {
  if (!plan) return null;
  return (
    <section className="relative mt-6 overflow-hidden rounded-3xl border-2 border-[#F09C48]/70 bg-[#FFF6EC] p-4">
      <span aria-hidden="true" className="pointer-events-none absolute -right-3 -top-3 text-[#F09C48]/25">
        <Icono nombre="avion" size={72} />
      </span>
      <p className="mapa-rotulo mapa-rotulo-sol relative">
        <Icono nombre="paquete" size={14} />
        {PAQUETE.rotulo}
      </p>
      <p className="mapa-titular relative mt-1 text-[15px] font-bold leading-tight text-[#003648]">Paquete de postulación desde</p>
      <p className="mapa-titular relative text-[28px] font-bold leading-none text-[#003648]">
        <Cifra n={plan.eur} />
        {" "}€
      </p>
      <p className="relative mt-1 text-sm font-bold text-[#003648]">
        {plan.nombre}
        {lista ? ` · ${etiquetaLista(lista)}` : ""}
      </p>
      {plan.alcance && <p className="relative mt-0.5 text-xs text-neutral-700">{plan.alcance}</p>}
      {(plan.comunidadCompleta || plan.listaCompleta) && (
        <ul className="relative mt-2 space-y-1 text-xs text-neutral-900">
          {plan.comunidadCompleta && (
            <li>
              Paquete de postulación de toda la comunidad: <strong>{plan.comunidadCompleta.nombre}</strong> · {eur(plan.comunidadCompleta.eur)}
            </li>
          )}
          {plan.listaCompleta && (
            <li>
              Paquete de postulación de toda la lista: <strong>{plan.listaCompleta.nombre}</strong> · {eur(plan.listaCompleta.eur)}
            </li>
          )}
        </ul>
      )}
      <p className="relative mt-2 text-[11px] leading-snug text-neutral-700">{T.planCubre}</p>
      <a
        href="/servicios/master"
        onClick={irA("/servicios/master")}
        className="relative mt-2 inline-block text-xs font-bold text-[#0A5873] underline underline-offset-2 hover:text-[#003648]"
      >
        {T.verPlanes}
      </a>
    </section>
  );
}

function ListaUniversidades({ unis, campus = [], indice, rama, onElegir }) {
  const filas = [...unis.map((u) => [u, false]), ...campus.map((u) => [u, true])];
  if (!filas.length) return null;
  return (
    <ul className="divide-y divide-neutral-200 overflow-hidden rounded-2xl border border-neutral-200 bg-white">
      {filas.map(([u, esCampus]) => {
        const ciudad = indice.ciudades.get(u.ciudad)?.nombre || u.sedes[0];
        const detalle = [esCampus ? `Campus · sede principal en ${ciudad}` : ciudad, u.titularidad].filter(Boolean).join(" · ");
        const ranking = textoRanking(u.ranking);
        return (
          <li key={`${u.id}-${esCampus ? "c" : "s"}`}>
            <button
              type="button"
              onClick={() => onElegir("universidad", u.id)}
              className="group flex w-full items-center gap-3 px-3 py-2.5 text-left transition hover:bg-[#F6FBFF] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-inset focus-visible:ring-[#F09C48]"
            >
              <span className="flex h-9 min-w-[3.4rem] shrink-0 items-center justify-center rounded-xl bg-[#003648] px-1.5 text-[10px] font-extrabold text-white transition group-hover:bg-[#0A5873]">
                {u.sigla}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[13px] font-bold leading-snug text-[#003648]">{u.nombre}</span>
                <span className="block text-xs text-neutral-700">{detalle}</span>
                {ranking && <span className="mt-0.5 block text-[11px] font-semibold leading-snug text-[#0A5873]">{ranking}</span>}
                {leerBecas(u).length > 0 && (
                  <span className="mt-1 inline-block rounded-full bg-[#FFF6EC] px-2 py-0.5 text-[10px] font-extrabold text-[#B8661F] ring-1 ring-[#F09C48]/40">
                    {BECAS.etiqueta}
                  </span>
                )}
              </span>
              <span className="shrink-0 text-right text-xs font-extrabold tabular-nums text-[#003648]">
                {numero(masteresDe(u, rama))}
                <span className="block text-[10px] font-semibold text-neutral-700">másteres</span>
              </span>
              <span aria-hidden="true" className="shrink-0 text-[#96CCFC] transition group-hover:translate-x-0.5 group-hover:text-[#0A5873]">
                <Icono nombre="flecha" size={14} />
              </span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}

function BotonComparar({ tipo, id, comparador }) {
  const dentro = comparador.ids.includes(id);
  const lleno = !dentro && comparador.tipo === tipo && comparador.ids.length >= comparador.maximo;
  return (
    <button
      type="button"
      aria-pressed={dentro}
      disabled={lleno}
      onClick={() => comparador.alternar(tipo, id)}
      className={`mapa-boton mov-toque inline-flex min-h-[46px] items-center justify-center gap-2 rounded-2xl border-2 px-3 py-2.5 text-sm font-extrabold disabled:cursor-not-allowed disabled:opacity-50 ${FOCO} ${
        dentro ? "border-[#003648] bg-[#003648] text-white" : "border-[#003648] text-[#003648] hover:bg-[#F6FBFF]"
      }`}
    >
      <Icono nombre="balanza" size={17} />
      {dentro ? T.quitarComparar : lleno ? T.comparadorLleno : T.comparar}
    </button>
  );
}

function Acciones({ whatsapp, guardar = null, children }) {
  return (
    <div className="mt-6 grid gap-2">
      <a
        href={whatsapp.href}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => registrarEvento("mapa_whatsapp", whatsapp.evento)}
        className={`mapa-boton mov-toque inline-flex min-h-[48px] items-center justify-center gap-2 rounded-2xl bg-[#F09C48] px-4 py-3 text-sm font-extrabold text-[#003648] hover:bg-[#F4AD62] ${FOCO}`}
      >
        <Icono nombre="chat" size={18} />
        {whatsapp.texto}
      </a>
      <div className="grid grid-cols-2 gap-2">
        <a
          href="/calculadora-master"
          onClick={irA("/calculadora-master")}
          className={`mapa-boton mov-toque inline-flex min-h-[46px] items-center justify-center gap-2 rounded-2xl border-2 border-[#003648] px-3 py-2.5 text-sm font-extrabold text-[#003648] hover:bg-[#F6FBFF] ${FOCO}`}
        >
          <Icono nombre="euro" size={17} />
          {T.calculadora}
        </a>
        {children}
      </div>
      {guardar && <BotonGuardar onClick={guardar} />}
    </div>
  );
}

const Descargo = () => <p className="mt-4 text-[11px] leading-snug text-neutral-700">{T.descargo}</p>;

/** «Próximo plazo de postulación: 13–29 ene 2027 (Fase 1 — extranjeros)», con sus fases. Siempre estimadas. */
function Plazo({ rotulo, fase, curso, detalle = null, fases = [], sitio = null, sitioId = null }) {
  return (
    <section className="mt-4 rounded-2xl bg-white px-4 py-3 ring-1 ring-[#96CCFC]">
      <p className="mapa-rotulo">
        <Icono nombre="calendario" size={14} />
        {rotulo}
      </p>
      {fase ? (
        <p className="mapa-titular mt-1 text-[15px] font-bold leading-snug text-[#003648]">
          {rangoFechas(fase.inicio, fase.fin)}{" "}
          <span className="text-[13px] font-semibold text-neutral-700">({[detalle, fase.nombre].filter(Boolean).join(" · ")})</span>
        </p>
      ) : (
        <p className="mt-1 text-sm text-neutral-700">{PLAZOS.sinProximo}</p>
      )}
      {fases.length > 0 && (
        <ul className="mt-2 space-y-1 border-t border-[#E1EFFD] pt-2" aria-label={PLAZOS.fases}>
          {fases.map((f, i) => {
            const esProxima = !!fase && f.inicio === fase.inicio && f.nombre === fase.nombre;
            return (
              <li
                key={`${f.nombre}-${i}`}
                className={`flex items-baseline justify-between gap-3 text-xs ${esProxima ? "font-bold text-[#003648]" : "text-neutral-800"}`}
              >
                <span className="min-w-0">{f.nombre}</span>
                <span className="shrink-0 tabular-nums">{rangoFechas(f.inicio, f.fin)}</span>
              </li>
            );
          })}
        </ul>
      )}
      <p className="mt-1.5 text-[11px] text-neutral-700">{PLAZOS.estimadas(cursoCorto(curso) || "2027/28")}</p>
      {sitio && (
        <AvisoPlazo sitio={sitio} sitioId={sitioId} curso={cursoCorto(curso)} fecha={fase ? rangoFechas(fase.inicio, fase.fin) : null} />
      )}
    </section>
  );
}

function BecasUniversidad({ becas }) {
  if (!becas.length) return null;
  return (
    <Bloque titulo={BECAS.titulo} icono="regalo">
      <ul className="flex flex-wrap gap-2">
        {becas.map((b, i) => (
          <li key={`${b.nombre}-${i}`} className="inline-flex flex-col rounded-2xl bg-[#FFF6EC] px-3 py-1.5 ring-1 ring-[#F09C48]/50">
            <span className="text-xs font-bold text-[#003648]">{b.nombre}</span>
            {(b.entidad || b.masteres || b.curso) && (
              <span className="text-[10.5px] text-neutral-700">
                {[
                  b.entidad && !b.nombre.startsWith(b.entidad) ? b.entidad : null,
                  b.curso ? `convocatoria ${b.curso}` : null,
                  b.masteres ? plural(b.masteres, "máster vinculado", "másteres vinculados") : null,
                ]
                  .filter(Boolean)
                  .join(" · ")}
              </span>
            )}
          </li>
        ))}
      </ul>
      <p className="mt-2 text-[11px] leading-snug text-neutral-700">{BECAS.aclaracion}</p>
    </Bloque>
  );
}

/* ── Fichas ──────────────────────────────────────────────────────────── */

export function FichaInicio({ indice, casos, onElegir, onRecomendar = null }) {
  const { totales, listas } = indice.datos;
  const top = [...indice.datos.ciudades].sort((a, b) => b.masteres - a.masteres).slice(0, 6);
  const sinPublicar = indice.datos.precios?.sinPublicar || [];
  const conPrecio = indice.datos.comunidades
    .filter((c) => c.precioAnual && !sinPublicar.includes(c.id))
    .sort((a, b) => a.precioAnual.tipico - b.precioAnual.tipico);
  const desdePaquete = Math.min(...listas.map((l) => l.desde).filter(Number.isFinite));
  return (
    <article>
      <Rotulo icono="diana">{INICIO.rotulo}</Rotulo>
      <Titulo>{INICIO.titulo}</Titulo>
      <p className="mt-2 text-sm leading-relaxed text-neutral-700">{INICIO.texto}</p>
      {onRecomendar && (
        <button
          type="button"
          onClick={onRecomendar}
          className={`mapa-boton mov-toque mt-3 inline-flex min-h-[48px] w-full items-center justify-center gap-2 rounded-2xl bg-[#F09C48] px-4 py-2.5 text-sm font-extrabold text-[#003648] hover:bg-[#F4AD62] ${FOCO}`}
        >
          <Icono nombre="brujula" size={17} />
          {RECOMENDAR.boton}: {RECOMENDAR.titulo.charAt(0).toLowerCase() + RECOMENDAR.titulo.slice(1)}
        </button>
      )}
      <dl className="mt-4 grid grid-cols-3 gap-2">
        <Dato etiqueta="Comunidades" valor={<Cifra n={totales.comunidades} />} />
        <Dato etiqueta="Universidades" valor={<Cifra n={totales.universidades} />} />
        <Dato etiqueta="Másteres" valor={<Cifra n={totales.masteres} />} />
      </dl>
      {conPrecio.length > 0 && (
        <Bloque titulo={INICIO.precios} icono="euro">
          <div className="flex flex-wrap gap-2">
            {conPrecio.map((c) => (
              <BotonChip key={c.id} onClick={() => onElegir("comunidad", c.id)}>
                {c.nombre} · ≈ {eur(Math.round(c.precioAnual.tipico))}
              </BotonChip>
            ))}
          </div>
          <p className="mt-2 text-[11px] leading-snug text-neutral-700">{INICIO.preciosNota}</p>
        </Bloque>
      )}
      <Bloque titulo="Las tres listas" icono="paquete">
        <ul className="space-y-2.5">
          {listas.map((l) => (
            <li key={l.id} className="flex items-start gap-2.5 text-sm">
              <span aria-hidden="true" className={`mt-1 h-3.5 w-3.5 shrink-0 rounded ${tonoDe(l.id).muestra}`} />
              <span>
                <span className="font-bold text-[#003648]">{etiquetaLista(l)}</span>
                <span className="block text-xs text-neutral-700">
                  {l.comunidades
                    .map((id) => indice.comunidades.get(id)?.nombre)
                    .filter(Boolean)
                    .join(", ")}{" "}
                  · {PAQUETE.desdeCorto(l.desde)}
                </span>
              </span>
            </li>
          ))}
        </ul>
        {Number.isFinite(desdePaquete) && <p className="mt-2 text-[11px] leading-snug text-neutral-700">{PAQUETE.leyenda}</p>}
      </Bloque>
      <Bloque titulo="Ciudades con más másteres" icono="ubicacion">
        <div className="flex flex-wrap gap-2">
          {top.map((c) => (
            <BotonChip key={c.id} onClick={() => onElegir("ciudad", c.id)}>
              {c.nombre} · {numero(c.masteres)}
            </BotonChip>
          ))}
        </div>
      </Bloque>
      {casos.length > 0 && (
        <Bloque titulo="Casos de éxito en el mapa" icono="estrella">
          <div className="flex flex-wrap gap-2">
            {casos.map((k) => (
              <BotonChip key={k.id} icono="estrella" onClick={() => onElegir("caso", k.id)}>
                {k.nombre} · {k.ciudad}
              </BotonChip>
            ))}
          </div>
        </Bloque>
      )}
    </article>
  );
}

export function FichaComunidad({ c, indice, foco, geoPorId, rama, orden, onOrden, casos = [], comparador, onElegir, onGuardar }) {
  const lista = indice.listas.get(c.lista) || null;
  const m = c.matricula;
  const ciudades = c.ciudades
    .map((id) => indice.ciudades.get(id))
    .filter(Boolean)
    .sort((a, b) => b.masteres - a.masteres);
  const unis = ordenarUniversidades(
    c.universidadesIds.map((id) => indice.universidades.get(id)).filter(Boolean),
    orden,
    rama
  );
  const temprano = plazoMasTemprano(unis);

  return (
    <article>
      <Migas foco={foco} indice={indice} geoPorId={geoPorId} onElegir={onElegir} />
      <div className="mt-3">
        <Postal ciudad={ciudades[0]?.id} pie={ciudades[0]?.nombre} />
        <Rotulo icono="mapa">Comunidad autónoma</Rotulo>
        <Titulo>{c.nombre}</Titulo>
        <div className="mt-2">
          <ChipLista lista={lista} />
        </div>
      </div>
      <PrimerAnio
        comunidad={c}
        presupuesto={indice.presupuestos?.get(c.id) || null}
        paquete={lista?.desde}
        lugar={c.nombre}
      />
      <PruebaSocial casos={casos.filter((k) => k.comunidadId === c.id)} onElegir={onElegir} />
      <TarjetaPrecio
        precio={c.precioAnual}
        ejemplos={ejemplosDeComunidad(indice, c)}
        ramas={indice.ramas}
        sinPublicar={!!indice.datos.precios?.sinPublicar?.includes(c.id)}
      />
      <dl className="mt-4 grid grid-cols-2 gap-2">
        <Dato
          ancho
          etiqueta={c.precioAnual ? "Matrícula según la norma de la comunidad" : "Matrícula orientativa al año"}
          valor={mayus(importeMatricula(m))}
          nota={m ? `Máster de ${m.creditos} ECTS · estudiante extracomunitario · curso ${m.curso}` : null}
        />
        <Dato etiqueta="Universidades" valor={<Cifra n={c.universidades} />} />
        <Dato etiqueta="Másteres oficiales" valor={<Cifra n={masteresDe(c, rama)} />} nota={rama ? `de ${nombreRama(indice, rama)}` : null} />
      </dl>
      <NotasMatricula m={m} />

      {temprano && (
        <Plazo rotulo={PLAZOS.temprano} fase={temprano.fase} curso={temprano.curso} detalle={temprano.u.sigla} sitio={c.nombre} sitioId={c.id} />
      )}

      <VivirAqui comunidad={c} presupuesto={indice.presupuestos?.get(c.id) || null} />

      <Bloque titulo="Cómo se postula" icono="documento">
        <p className="text-sm leading-relaxed text-neutral-900">{c.postulacion.texto}</p>
      </Bloque>

      <PlanInspira plan={c.plan} lista={lista} />

      <Bloque titulo={`Universidades (${unis.length})`} icono="casa" accion={<SelectorOrden compacto orden={orden} onOrden={onOrden} />}>
        <ListaUniversidades unis={unis} indice={indice} rama={rama} onElegir={onElegir} />
      </Bloque>

      <Bloque titulo="Másteres oficiales por rama" icono="grafico">
        <BarrasRamas conteo={c.ramas} ramas={indice.ramas} resaltada={rama} />
      </Bloque>

      {ciudades.length > 0 && (
        <Bloque titulo="Ciudades" icono="ubicacion">
          <div className="flex flex-wrap gap-2">
            {ciudades.map((ci) => (
              <BotonChip key={ci.id} onClick={() => onElegir("ciudad", ci.id)}>
                {ci.nombre} · {ci.masteres ? numero(masteresDe(ci, rama)) : "campus"}
              </BotonChip>
            ))}
          </div>
        </Bloque>
      )}

      <Acciones
        guardar={onGuardar ? () => onGuardar("comunidad", c.id) : null}
        whatsapp={{
          texto: `Quiero postular en ${c.nombre}`,
          href: whatsappDesde("mapa", `Quiero postular a másteres en ${c.nombre}.`),
          evento: { tipo: "comunidad", id: c.id },
        }}
      >
        <BotonComparar tipo="comunidad" id={c.id} comparador={comparador} />
      </Acciones>
      <EnlacePagina href={rutaComunidad(c.id)} texto={`Ver la página de ${c.nombre}`} />
      <Descargo />
    </article>
  );
}

export function FichaFuera({ id, foco, indice, geoPorId, planFuera, onElegir }) {
  const nombre = geoPorId.get(id)?.nombre || id;
  const islas = id === "baleares" || id === "canarias";
  return (
    <article>
      <Migas foco={foco} indice={indice} geoPorId={geoPorId} onElegir={onElegir} />
      <div className="mt-3">
        <Rotulo icono="mapa">{islas ? "Comunidad autónoma" : "Ciudad autónoma"}</Rotulo>
        <Titulo>{nombre}</Titulo>
        <div className="mt-2">
          <ChipLista lista={null} />
        </div>
      </div>
      <div className="mt-4 rounded-3xl bg-[#F6FBFF] p-4 ring-1 ring-[#E1EFFD]">
        <p className="text-sm leading-relaxed text-neutral-900">
          {islas
            ? `Fuera de las tres listas: no tiene universidades en nuestras listas de comunidades. Entra en el ${planFuera.nombre}, paquete de postulación de ${eur(
                planFuera.eur
              )} para toda España (la matrícula de la universidad se paga aparte); por separado, te hacemos un presupuesto personalizado en la sesión diagnóstico.`
            : "Sin universidad propia en nuestro catálogo."}
        </p>
      </div>
      <div className="mt-6 grid gap-2">
        <a
          href={CALENDLY_URL}
          target="_blank"
          rel="noopener noreferrer"
          className={`mapa-boton inline-flex items-center justify-center gap-2 rounded-2xl bg-[#F09C48] px-4 py-3 text-sm font-extrabold text-[#003648] hover:bg-[#F4AD62] ${FOCO}`}
        >
          <Icono nombre="calendario" size={18} />
          {SESION}
        </a>
        <a
          href={whatsappDesde("mapa", `Me interesa estudiar en ${nombre}.`)}
          target="_blank"
          rel="noopener noreferrer"
          className={`mapa-boton inline-flex items-center justify-center gap-2 rounded-2xl border-2 border-[#003648] px-4 py-2.5 text-sm font-extrabold text-[#003648] hover:bg-[#F6FBFF] ${FOCO}`}
        >
          <Icono nombre="chat" size={18} />
          Escríbenos por WhatsApp
        </a>
      </div>
    </article>
  );
}

export function FichaCiudad({ c, indice, foco, geoPorId, rama, orden, onOrden, casos, onElegir }) {
  const com = indice.comunidades.get(c.comunidad);
  const lista = com ? indice.listas.get(com.lista) : null;
  const unis = ordenarUniversidades(c.universidades.map((id) => indice.universidades.get(id)).filter(Boolean), orden, rama);
  const campus = ordenarUniversidades(c.campus.map((id) => indice.universidades.get(id)).filter(Boolean), orden, rama);
  const casosAqui = casos.filter((k) => k.ciudadId === c.id);

  return (
    <article>
      <Migas foco={foco} indice={indice} geoPorId={geoPorId} onElegir={onElegir} />
      <div className="mt-3">
        <Postal ciudad={c.id} pie={com?.nombre} />
        <Rotulo icono="ubicacion">Ciudad</Rotulo>
        <Titulo>{c.nombre}</Titulo>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <ChipLista lista={lista} />
          <ChipComunidad com={com} onElegir={onElegir} />
        </div>
      </div>
      {com && (
        <PrimerAnio
          comunidad={com}
          presupuesto={presupuestoEnCiudad(com, c.nombre, !!indice.datos.precios?.sinPublicar?.includes(com.id))}
          paquete={lista?.desde}
          lugar={c.nombre}
        />
      )}
      <PruebaSocial casos={casosAqui} onElegir={onElegir} />
      <dl className="mt-4 grid grid-cols-2 gap-2">
        <Dato
          etiqueta="Universidades"
          valor={<Cifra n={unis.length} />}
          nota={campus.length ? `y ${plural(campus.length, "campus", "campus")} de otra sede` : null}
        />
        <Dato etiqueta="Másteres oficiales" valor={<Cifra n={masteresDe(c, rama)} />} nota={rama ? `de ${nombreRama(indice, rama)}` : null} />
        {com && (
          <Dato
            ancho
            etiqueta={`Matrícula orientativa al año en ${com.nombre}`}
            valor={mayus(importeMatricula(com.matricula))}
            nota={com.matricula ? `Máster de ${com.matricula.creditos} ECTS · curso ${com.matricula.curso}` : null}
          />
        )}
      </dl>
      {campus.length > 0 && (
        <p className="mt-2 text-[11px] leading-snug text-neutral-700">
          Los másteres de {campus.map((u) => u.sigla).join(", ")} se cuentan en su sede principal.
        </p>
      )}

      <Bloque titulo="Universidades" icono="casa" accion={unis.length + campus.length > 1 ? <SelectorOrden compacto orden={orden} onOrden={onOrden} /> : null}>
        <ListaUniversidades unis={unis} campus={campus} indice={indice} rama={rama} onElegir={onElegir} />
      </Bloque>

      {com && <VivirAqui comunidad={com} soloCiudad={c.nombre} />}

      {c.masteres > 0 && (
        <Bloque titulo="Másteres oficiales por rama" icono="grafico">
          <BarrasRamas conteo={c.ramas} ramas={indice.ramas} resaltada={rama} />
        </Bloque>
      )}

      {casosAqui.length > 0 && (
        <Bloque titulo="Casos de éxito aquí" icono="estrella">
          <div className="flex flex-wrap gap-2">
            {casosAqui.map((k) => (
              <BotonChip key={k.id} icono="estrella" onClick={() => onElegir("caso", k.id)}>
                {k.nombre} · {k.destacado}
              </BotonChip>
            ))}
          </div>
        </Bloque>
      )}

      <Acciones
        whatsapp={{
          texto: `Quiero estudiar en ${c.nombre}`,
          href: whatsappDesde("mapa", `Me interesa estudiar un máster en ${c.nombre}.`),
          evento: { tipo: "ciudad", id: c.id },
        }}
      >
        {com ? (
          <button
            type="button"
            onClick={() => onElegir("comunidad", com.id)}
            className={`mapa-boton inline-flex items-center justify-center gap-2 rounded-2xl border-2 border-[#003648] px-3 py-2.5 text-sm font-extrabold text-[#003648] hover:bg-[#F6FBFF] ${FOCO}`}
          >
            <Icono nombre="mapa" size={17} />
            Ver comunidad
          </button>
        ) : null}
      </Acciones>
      <Descargo />
    </article>
  );
}

export function FichaUniversidad({ u, indice, foco, geoPorId, rama, comparador, onElegir, onGuardar }) {
  const com = indice.comunidades.get(u.comunidad);
  const lista = indice.listas.get(u.lista) || null;
  const ciudad = indice.ciudades.get(u.ciudad);
  const ranking = textoRanking(u.ranking);
  const plazos = leerPlazos(u);

  return (
    <article>
      <Migas foco={foco} indice={indice} geoPorId={geoPorId} onElegir={onElegir} />
      <div className="mt-3">
        <Postal ciudad={ciudad?.id || u.ciudad} pie={ciudad?.nombre} />
        <Rotulo icono="casa">Universidad</Rotulo>
        <Titulo>{u.nombre}</Titulo>
        <p className="mt-1 text-sm font-semibold text-[#0A5873]">
          {u.sigla} · {u.sedes.join(", ")}
        </p>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <SelloOficial />
          <ChipLista lista={lista} />
          <ChipTitularidad valor={u.titularidad} />
          <ChipComunidad com={com} onElegir={onElegir} />
        </div>
      </div>

      <dl className="mt-4 grid grid-cols-2 gap-2">
        <Dato
          etiqueta="Másteres oficiales"
          valor={<Cifra n={masteresDe(u, rama)} />}
          nota={rama ? `de ${nombreRama(indice, rama)}, de ${numero(u.masteres)} en total` : null}
        />
        <Dato etiqueta="Matrícula al año" valor={mayus(importeMatricula(com?.matricula))} nota={com ? `Orientativa en ${com.nombre}` : null} />
      </dl>
      {u.sedes.length > 1 && (
        <p className="mt-2 text-[11px] leading-snug text-neutral-700">Tiene varias sedes; sus másteres se cuentan en {ciudad?.nombre || u.sedes[0]}.</p>
      )}
      {com && <NotasMatricula m={com.matricula} />}

      <TarjetaPrecio
        precio={precioDeUniversidad(indice, u)}
        ejemplos={u.ejemplos}
        ramas={indice.ramas}
        referencia={!u.precioAnual && com?.precioAnual ? com.nombre : null}
        sinPublicar={!!indice.datos.precios?.sinPublicar?.includes(u.comunidad)}
      />

      {ranking && (
        <div className="mt-4 flex items-start gap-3 rounded-2xl bg-[#003648] px-4 py-3 text-white">
          <span className="mt-0.5 shrink-0 text-[#F09C48]">
            <Icono nombre="estrella" size={18} />
          </span>
          <span className="min-w-0">
            <span className="mapa-rotulo mapa-rotulo-claro">Ranking mundial</span>
            {/* Siempre «QS World University Rankings 2027 · puesto X» y sin enlace (cliente, 14/09/2026). */}
            <span className="mapa-titular block text-sm font-bold leading-snug">{ranking}</span>
          </span>
        </div>
      )}

      {plazos && (
        <Plazo rotulo={PLAZOS.proximo} fase={plazos.proxima} curso={plazos.curso} fases={plazos.fases} sitio={u.sigla} sitioId={u.id} />
      )}

      <BecasUniversidad becas={leerBecas(u)} />

      <Bloque titulo="Másteres oficiales por rama" icono="grafico">
        <BarrasRamas conteo={u.ramas} ramas={indice.ramas} resaltada={rama} />
      </Bloque>

      {com && (
        <Bloque titulo="Cómo se postula" icono="documento">
          <p className="text-sm leading-relaxed text-neutral-900">{com.postulacion.texto}</p>
        </Bloque>
      )}

      {com && <PlanInspira plan={com.plan} lista={lista} />}

      <Acciones
        guardar={onGuardar ? () => onGuardar("universidad", u.id) : null}
        whatsapp={{
          texto: "Quiero postular aquí",
          href: whatsappDesde("mapa", `Quiero postular a la ${u.nombre} (${u.sigla}), en ${ciudad?.nombre || u.sedes[0]}.`),
          evento: { tipo: "universidad", id: u.id },
        }}
      >
        <BotonComparar tipo="universidad" id={u.id} comparador={comparador} />
      </Acciones>
      <EnlacePagina href={rutaUniversidad(u.id)} texto={`Ver la página de ${u.sigla}`} />
      <Descargo />
    </article>
  );
}

export function FichaCaso({ k, indice, foco, geoPorId, onElegir }) {
  const ciudad = indice.ciudades.get(k.ciudadId);
  // El catálogo de la universidad principal, para enlazar el caso con su
  // página. Un nombre que no esté en el catálogo (un centro privado, por
  // ejemplo) devuelve null y el botón no se pinta.
  const uni = universidadPorNombre(indice, k.universidad);
  // Las demás admisiones de la misma persona. La principal ya está en la
  // tabla de arriba, así que no se repite.
  const otras = (k.destinos || []).filter(
    (d) => !(d.universidad === k.universidad && d.programa === k.programa)
  );
  const filas = [
    { icono: "casa", etiqueta: "Universidad", valor: k.universidad },
    { icono: "birrete", etiqueta: "Máster", valor: k.programa },
    { icono: "euro", etiqueta: "Costo del máster", valor: k.costo },
  ].filter((f) => f.valor);

  return (
    <article>
      <Migas foco={foco} indice={indice} geoPorId={geoPorId} onElegir={onElegir} />
      <Postal ciudad={k.ciudadId} pie={`Lima → ${k.ciudad}`} />
      <div className="relative overflow-hidden rounded-3xl bg-[#003648] p-4 text-white">
        <span aria-hidden="true" className="pointer-events-none absolute -right-2 -top-2 text-white/10">
          <Icono nombre="avion" size={84} />
        </span>
        <p className="mapa-rotulo mapa-rotulo-claro relative">
          <Icono nombre="trofeo" size={14} />
          Caso de éxito real
        </p>
        <h2 className="mapa-titular relative mt-1 text-[26px] font-bold leading-tight">{k.nombre}</h2>
        {k.destacado && (
          <span className="relative mt-2 inline-flex items-center gap-1.5 rounded-full bg-[#F09C48] px-3 py-1 text-[11px] font-extrabold text-[#003648]">
            <Icono nombre="estrella" size={12} />
            {k.destacado}
          </span>
        )}
        <p className="relative mt-3 text-xs text-white/75">Lima → {k.ciudad}</p>
      </div>
      <dl className="mt-4 space-y-3">
        {filas.map((f) => (
          <div key={f.etiqueta} className="flex gap-3">
            <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[#E6F2FE] text-[#0A5873]">
              <Icono nombre={f.icono} size={16} />
            </span>
            <div className="min-w-0">
              <dt className="text-[10px] font-extrabold uppercase tracking-wide text-neutral-700">{f.etiqueta}</dt>
              <dd className="text-[13px] font-semibold leading-snug text-neutral-900">{f.valor}</dd>
            </div>
          </div>
        ))}
      </dl>
      {otras.length > 0 && (
        <div className="mt-4 rounded-2xl border border-[#E1EFFD] bg-[#F6FBFF] px-3.5 py-3">
          <p className="mapa-rotulo mb-1.5">
            <Icono nombre="trofeo" size={13} />
            Otras admisiones
          </p>
          <ul className="space-y-1.5">
            {otras.map((d, i) => (
              <li key={`${d.universidad}-${i}`} className="text-[13px] leading-snug text-neutral-800">
                <strong className="text-[#003648]">{d.universidad}</strong>
                <span className="block text-[12px] text-neutral-700">
                  {d.programa}
                  {d.ciudad ? ` · ${d.ciudad}` : ""}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
      {k.texto && <p className="mt-4 border-l-2 border-[#F09C48] pl-3 text-[13px] italic leading-relaxed text-neutral-700">{k.texto}</p>}
      <div className="mt-5 grid gap-2">
        {ciudad && (
          <button
            type="button"
            onClick={() => onElegir("ciudad", ciudad.id)}
            className={`mapa-boton inline-flex items-center justify-center gap-2 rounded-2xl border-2 border-[#003648] px-3 py-2.5 text-sm font-extrabold text-[#003648] hover:bg-[#F6FBFF] ${FOCO}`}
          >
            <Icono nombre="mapa" size={17} />
            Ver {ciudad.nombre} en el mapa
          </button>
        )}
        {uni && (
          <a
            href={rutaUniversidad(uni.id)}
            onClick={irA(rutaUniversidad(uni.id))}
            className={`mapa-boton inline-flex items-center justify-center gap-2 rounded-2xl border-2 border-[#003648] px-3 py-2.5 text-sm font-extrabold text-[#003648] hover:bg-[#F6FBFF] ${FOCO}`}
          >
            <Icono nombre="casa" size={17} />
            Ver {uni.sigla} en el catálogo
          </a>
        )}
        <a
          href="/casos-de-exito"
          onClick={irA("/casos-de-exito")}
          className="inline-flex items-center justify-center gap-2 rounded-2xl px-3 py-2 text-sm font-bold text-[#0A5873] underline underline-offset-2 hover:text-[#003648]"
        >
          Ver todos los casos de éxito
        </a>
      </div>
      <Descargo />
    </article>
  );
}
