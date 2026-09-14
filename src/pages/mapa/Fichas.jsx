// src/pages/mapa/Fichas.jsx
// Fichas del panel del mapa: inicio, comunidad, ciudad, universidad, caso de
// éxito y comunidades fuera de las listas. Solo pintan lo que llega de
// GET /api/mapa y de config/casos.js: ni importes ni recuentos escritos a mano.
//
// Decisión del cliente (14/09/2026): no se enlaza a las webs de las
// universidades. Las acciones son WhatsApp («Quiero postular aquí») y la
// calculadora.
import Icono from "../../components/common/Icono";
import { CALENDLY_URL, whatsappDesde } from "../../config/contacto";
import { registrarEvento } from "../../lib/analytics";
import { navigate } from "../../services/navigate";
import { SIN_RAMA, ejemplosDeComunidad, masteresDe, nombreRama, precioDeUniversidad, ramasOrdenadas } from "./indice";
import TarjetaPrecio from "./TarjetaPrecio";
import { tonoDe } from "./tonosMapa";
import { useContador } from "./useContador";
import {
  SESION,
  T,
  eur,
  etiquetaLista,
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

/* ── Piezas ──────────────────────────────────────────────────────────── */

/** Número que sube hasta su valor al aparecer. */
export function Cifra({ n }) {
  const v = useContador(Number(n) || 0);
  return <span className="tabular-nums">{numero(v)}</span>;
}

function Rotulo({ children }) {
  return <p className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-[#0A5873]">{children}</p>;
}

function Titulo({ children }) {
  return <h2 className="mapa-titular mt-1 text-[24px] font-bold leading-tight text-[#003648]">{children}</h2>;
}

function ChipLista({ lista }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-bold ${tonoDe(lista?.id).chip}`}>
      {etiquetaLista(lista)}
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

function Bloque({ titulo, children }) {
  return (
    <section className="mt-6">
      <h3 className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-[#0A5873]">{titulo}</h3>
      <div className="mt-2">{children}</div>
    </section>
  );
}

function BotonChip({ children, onClick, icono }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`mapa-boton inline-flex items-center gap-1.5 rounded-full border border-neutral-200 bg-white px-3 py-1.5 text-xs font-bold text-[#003648] hover:border-[#96CCFC] hover:bg-[#F6FBFF] ${FOCO}`}
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
            {i > 0 && (
              <span aria-hidden="true" className="text-neutral-500">
                ›
              </span>
            )}
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
      <p className="relative text-[11px] font-extrabold uppercase tracking-[0.14em] text-[#B8661F]">Plan de Inspira</p>
      <p className="mapa-titular relative mt-1 text-[28px] font-bold leading-none text-[#003648]">
        Desde <Cifra n={plan.eur} />
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
              Toda la comunidad: <strong>{plan.comunidadCompleta.nombre}</strong> · {eur(plan.comunidadCompleta.eur)}
            </li>
          )}
          {plan.listaCompleta && (
            <li>
              Toda la lista: <strong>{plan.listaCompleta.nombre}</strong> · {eur(plan.listaCompleta.eur)}
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
              </span>
              <span className="shrink-0 text-right text-xs font-extrabold tabular-nums text-[#003648]">
                {numero(masteresDe(u, rama))}
                <span className="block text-[10px] font-semibold text-neutral-700">másteres</span>
              </span>
              <span aria-hidden="true" className="shrink-0 text-[#96CCFC] transition group-hover:translate-x-0.5 group-hover:text-[#0A5873]">
                ›
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
      className={`mapa-boton inline-flex items-center justify-center gap-2 rounded-2xl border-2 px-3 py-2.5 text-sm font-extrabold disabled:cursor-not-allowed disabled:opacity-50 ${FOCO} ${
        dentro ? "border-[#003648] bg-[#003648] text-white" : "border-[#003648] text-[#003648] hover:bg-[#F6FBFF]"
      }`}
    >
      <Icono nombre="balanza" size={17} />
      {dentro ? T.quitarComparar : lleno ? T.comparadorLleno : T.comparar}
    </button>
  );
}

function Acciones({ whatsapp, children }) {
  return (
    <div className="mt-6 grid gap-2">
      <a
        href={whatsapp.href}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => registrarEvento("mapa_whatsapp", whatsapp.evento)}
        className={`mapa-boton inline-flex items-center justify-center gap-2 rounded-2xl bg-[#F09C48] px-4 py-3 text-sm font-extrabold text-[#003648] hover:bg-[#F4AD62] ${FOCO}`}
      >
        <Icono nombre="chat" size={18} />
        {whatsapp.texto}
      </a>
      <div className="grid grid-cols-2 gap-2">
        <a
          href="/calculadora-master"
          onClick={irA("/calculadora-master")}
          className={`mapa-boton inline-flex items-center justify-center gap-2 rounded-2xl border-2 border-[#003648] px-3 py-2.5 text-sm font-extrabold text-[#003648] hover:bg-[#F6FBFF] ${FOCO}`}
        >
          <Icono nombre="euro" size={17} />
          {T.calculadora}
        </a>
        {children}
      </div>
    </div>
  );
}

const Descargo = () => <p className="mt-4 text-[11px] leading-snug text-neutral-700">{T.descargo}</p>;

/* ── Fichas ──────────────────────────────────────────────────────────── */

export function FichaInicio({ indice, casos, onElegir }) {
  const { totales, listas } = indice.datos;
  const top = [...indice.datos.ciudades].sort((a, b) => b.masteres - a.masteres).slice(0, 6);
  return (
    <article>
      <Rotulo>Empieza aquí</Rotulo>
      <Titulo>España, comunidad a comunidad</Titulo>
      <p className="mt-2 text-sm leading-relaxed text-neutral-700">
        Toca una comunidad para ver cuánto cuesta la matrícula, cómo se postula y qué universidades tiene. Cada burbuja es una ciudad: cuanto
        más grande, más másteres oficiales.
      </p>
      <dl className="mt-4 grid grid-cols-3 gap-2">
        <Dato etiqueta="Comunidades" valor={<Cifra n={totales.comunidades} />} />
        <Dato etiqueta="Universidades" valor={<Cifra n={totales.universidades} />} />
        <Dato etiqueta="Másteres" valor={<Cifra n={totales.masteres} />} />
      </dl>
      <Bloque titulo="Las tres listas">
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
                  · planes desde {eur(l.desde)}
                </span>
              </span>
            </li>
          ))}
        </ul>
      </Bloque>
      <Bloque titulo="Ciudades con más másteres">
        <div className="flex flex-wrap gap-2">
          {top.map((c) => (
            <BotonChip key={c.id} onClick={() => onElegir("ciudad", c.id)}>
              {c.nombre} · {numero(c.masteres)}
            </BotonChip>
          ))}
        </div>
      </Bloque>
      {casos.length > 0 && (
        <Bloque titulo="Casos de éxito en el mapa">
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

export function FichaComunidad({ c, indice, foco, geoPorId, rama, comparador, onElegir }) {
  const lista = indice.listas.get(c.lista) || null;
  const m = c.matricula;
  const ciudades = c.ciudades
    .map((id) => indice.ciudades.get(id))
    .filter(Boolean)
    .sort((a, b) => b.masteres - a.masteres);
  const unis = c.universidadesIds
    .map((id) => indice.universidades.get(id))
    .filter(Boolean)
    .sort((a, b) => masteresDe(b, rama) - masteresDe(a, rama));

  return (
    <article>
      <Migas foco={foco} indice={indice} geoPorId={geoPorId} onElegir={onElegir} />
      <div className="mt-3">
        <Rotulo>Comunidad autónoma</Rotulo>
        <Titulo>{c.nombre}</Titulo>
        <div className="mt-2">
          <ChipLista lista={lista} />
        </div>
      </div>
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

      <Bloque titulo="Cómo se postula">
        <p className="text-sm leading-relaxed text-neutral-900">{c.postulacion.texto}</p>
      </Bloque>

      <PlanInspira plan={c.plan} lista={lista} />

      <Bloque titulo={`Universidades (${unis.length})`}>
        <ListaUniversidades unis={unis} indice={indice} rama={rama} onElegir={onElegir} />
      </Bloque>

      <Bloque titulo="Másteres oficiales por rama">
        <BarrasRamas conteo={c.ramas} ramas={indice.ramas} resaltada={rama} />
      </Bloque>

      {ciudades.length > 0 && (
        <Bloque titulo="Ciudades">
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
        whatsapp={{
          texto: `Quiero postular en ${c.nombre}`,
          href: whatsappDesde("mapa", `Quiero postular a másteres en ${c.nombre}.`),
          evento: { tipo: "comunidad", id: c.id },
        }}
      >
        <BotonComparar tipo="comunidad" id={c.id} comparador={comparador} />
      </Acciones>
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
        <Rotulo>{islas ? "Comunidad autónoma" : "Ciudad autónoma"}</Rotulo>
        <Titulo>{nombre}</Titulo>
        <div className="mt-2">
          <ChipLista lista={null} />
        </div>
      </div>
      <div className="mt-4 rounded-3xl bg-[#F6FBFF] p-4 ring-1 ring-[#E1EFFD]">
        <p className="text-sm leading-relaxed text-neutral-900">
          {islas
            ? `Fuera de las tres listas: no tiene universidades en nuestras listas de comunidades. Entra en el ${planFuera.nombre} (${eur(
                planFuera.eur
              )}, toda España); por separado, te hacemos un presupuesto personalizado en la sesión diagnóstico.`
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

export function FichaCiudad({ c, indice, foco, geoPorId, rama, casos, onElegir }) {
  const com = indice.comunidades.get(c.comunidad);
  const lista = com ? indice.listas.get(com.lista) : null;
  const unis = c.universidades.map((id) => indice.universidades.get(id)).filter(Boolean);
  const campus = c.campus.map((id) => indice.universidades.get(id)).filter(Boolean);
  const casosAqui = casos.filter((k) => k.ciudadId === c.id);

  return (
    <article>
      <Migas foco={foco} indice={indice} geoPorId={geoPorId} onElegir={onElegir} />
      <div className="mt-3">
        <Rotulo>Ciudad</Rotulo>
        <Titulo>{c.nombre}</Titulo>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <ChipLista lista={lista} />
          <ChipComunidad com={com} onElegir={onElegir} />
        </div>
      </div>
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

      <Bloque titulo="Universidades">
        <ListaUniversidades unis={unis} campus={campus} indice={indice} rama={rama} onElegir={onElegir} />
      </Bloque>

      {c.masteres > 0 && (
        <Bloque titulo="Másteres oficiales por rama">
          <BarrasRamas conteo={c.ramas} ramas={indice.ramas} resaltada={rama} />
        </Bloque>
      )}

      {casosAqui.length > 0 && (
        <Bloque titulo="Casos de éxito aquí">
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

export function FichaUniversidad({ u, indice, foco, geoPorId, rama, comparador, onElegir }) {
  const com = indice.comunidades.get(u.comunidad);
  const lista = indice.listas.get(u.lista) || null;
  const ciudad = indice.ciudades.get(u.ciudad);
  const ranking = textoRanking(u.ranking);

  return (
    <article>
      <Migas foco={foco} indice={indice} geoPorId={geoPorId} onElegir={onElegir} />
      <div className="mt-3">
        <Rotulo>Universidad</Rotulo>
        <Titulo>{u.nombre}</Titulo>
        <p className="mt-1 text-sm font-semibold text-[#0A5873]">
          {u.sigla} · {u.sedes.join(", ")}
        </p>
        <div className="mt-2 flex flex-wrap items-center gap-2">
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
            <span className="block text-[10px] font-extrabold uppercase tracking-[0.14em] text-[#96CCFC]">Ranking mundial</span>
            <span className="mapa-titular block text-sm font-bold leading-snug">{ranking}</span>
            {/* Sin enlace (el cliente no quiere enlaces externos): la ficha de QS se cita como texto de fuente. */}
            <span className="mt-0.5 block text-[11px] text-[#96CCFC]">
              Fuente: {[u.ranking?.fuente, u.ranking?.edicion].filter(Boolean).join(" ")}
              {(() => {
                try {
                  return u.ranking?.url ? ` · ${new URL(u.ranking.url).hostname.replace(/^www\./, "")}` : "";
                } catch {
                  return "";
                }
              })()}
            </span>
          </span>
        </div>
      )}

      <Bloque titulo="Másteres oficiales por rama">
        <BarrasRamas conteo={u.ramas} ramas={indice.ramas} resaltada={rama} />
      </Bloque>

      {com && (
        <Bloque titulo="Cómo se postula">
          <p className="text-sm leading-relaxed text-neutral-900">{com.postulacion.texto}</p>
        </Bloque>
      )}

      {com && <PlanInspira plan={com.plan} lista={lista} />}

      <Acciones
        whatsapp={{
          texto: "Quiero postular aquí",
          href: whatsappDesde("mapa", `Quiero postular a la ${u.nombre} (${u.sigla}), en ${ciudad?.nombre || u.sedes[0]}.`),
          evento: { tipo: "universidad", id: u.id },
        }}
      >
        <BotonComparar tipo="universidad" id={u.id} comparador={comparador} />
      </Acciones>
      <Descargo />
    </article>
  );
}

export function FichaCaso({ k, indice, foco, geoPorId, onElegir }) {
  const ciudad = indice.ciudades.get(k.ciudadId);
  const filas = [
    { icono: "casa", etiqueta: "Universidad", valor: k.universidad },
    { icono: "birrete", etiqueta: "Máster", valor: k.programa },
    { icono: "documento", etiqueta: "Carrera de origen", valor: k.origen },
    { icono: "euro", etiqueta: "Costo del máster", valor: k.costo },
  ].filter((f) => f.valor);

  return (
    <article>
      <Migas foco={foco} indice={indice} geoPorId={geoPorId} onElegir={onElegir} />
      <div className="relative mt-3 overflow-hidden rounded-3xl bg-[#003648] p-4 text-white">
        <span aria-hidden="true" className="pointer-events-none absolute -right-2 -top-2 text-white/10">
          <Icono nombre="avion" size={84} />
        </span>
        <p className="relative text-[11px] font-extrabold uppercase tracking-[0.14em] text-[#96CCFC]">Caso de éxito real</p>
        <h2 className="mapa-titular relative mt-1 text-[26px] font-bold leading-tight">{k.nombre}</h2>
        <span className="relative mt-2 inline-flex items-center gap-1.5 rounded-full bg-[#F09C48] px-3 py-1 text-[11px] font-extrabold text-[#003648]">
          <Icono nombre="estrella" size={12} />
          {k.destacado}
        </span>
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
