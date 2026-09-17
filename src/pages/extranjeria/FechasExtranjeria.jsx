// src/pages/extranjeria/FechasExtranjeria.jsx
// «¿Por qué fecha va Extranjería?» (/por-que-fecha-va-extranjeria).
//
// Es la pregunta que más repiten los asesorados y hasta hoy se contestaba a
// mano por WhatsApp, oficina por oficina. Aquí se publica lo que las propias
// oficinas dicen: hasta qué fecha de presentación llevan grabado, instruido y
// resuelto cada trámite, y lo mismo para los recursos.
//
// Datos: GET /api/extranjeria/fechas (inspira-backend). La lista de oficinas
// NO está escrita en el código: cuando otra subdelegación empiece a publicar
// sus fechas, el equipo la da de alta en Core y sale sola aquí (encargo de la
// clienta, 17/09/2026). Por eso hasta la frase de la cabecera —«solo Madrid,
// Valencia y Mallorca»— se construye con los nombres que devuelve la API.
//
// Qué la separa de las páginas que ya hacen esto (dos tablas planas y poco
// más): buscador por trámite, agrupación por familias plegable en móvil, la
// calculadora de «presenté el __», las dos fechas bien distinguidas (el día
// del folleto oficial y el día en que lo cargamos) y la explicación del
// silencio administrativo.
//
// Sin datos no hay pantalla en blanco: esqueleto mientras carga, aviso con los
// enlaces oficiales si la API falla, y «aún no publicado» para la oficina que
// está dada de alta pero todavía no publica fechas. Lo que se pinta con los
// datos va dentro de un CercoErrores: un fallo en una tabla no tumba la
// página y queda registrado en /api/errores-web.
import { useCallback, useEffect, useId, useMemo, useState } from "react";
import PageHero from "../../components/layout/PageHero";
import CercoErrores from "../../components/common/CercoErrores";
import Icono from "../../components/common/Icono";
import SEOSchema from "../../components/SEOSchema";
import { CALENDLY_URL, whatsappDesde } from "../../config/contacto";
import { registrarEvento } from "../../lib/analytics";
import {
  FASES,
  GRUPOS,
  cuentaCoincidencias,
  enumerar,
  familiasDe,
  fechaDeActualizacion,
  fechaLarga,
  nombreCorto,
  pedirFechas,
} from "./fechas";
import CalculadoraFechas from "./CalculadoraFechas";
import HistorialOficina from "./HistorialOficina";
import "../../styles/extranjeria-fechas.css";

const evento = (nombre, datos = {}) => {
  try {
    registrarEvento(nombre, datos);
  } catch {
    /* sin analítica: la página funciona igual */
  }
};

const WA_GENERAL = whatsappDesde(
  "extranjeria-fechas",
  "Quiero saber por dónde va mi expediente de Extranjería.",
);
const WA_SIN_OFICINA = whatsappDesde(
  "extranjeria-fechas",
  "Mi provincia no publica las fechas de Extranjería. ¿Pueden ayudarme con mi trámite?",
);
const WA_SILENCIO = whatsappDesde(
  "extranjeria-fechas",
  "Mi expediente ya pasó la fecha que están resolviendo y sigo sin respuesta.",
);

// Enlaces oficiales de respaldo: SOLO se enseñan si la API no responde, para
// que nadie se quede sin a dónde ir. La fuente de cada oficina llega en
// `fuente_url` y es la que se enseña en condiciones normales.
//
// Son las páginas de donde salen las fechas, no la sede electrónica: esta
// página trata de por qué fecha va cada oficina, y consultar el estado del
// expediente propio es otra cosa, que cada uno hace con su número.
const FUENTES_GENERALES = [
  {
    nombre: "Delegación del Gobierno en Madrid · Extranjería",
    url: "https://mptmd.gob.es/portal/delegaciones_gobierno/delegaciones/madrid/servicios/extranjeria",
  },
  {
    nombre: "Delegación del Gobierno en la Comunitat Valenciana · Extranjería",
    url: "https://mptmd.gob.es/portal/delegaciones_gobierno/delegaciones/comunidad_valenciana/servicios/extranjeria",
  },
  {
    nombre: "Delegación del Gobierno en Illes Balears · Extranjería",
    url: "https://mptmd.gob.es/portal/delegaciones_gobierno/delegaciones/illesbalears/servicios/extranjeria",
  },
];

// Texto por defecto del aviso legal. El bueno es el campo `aviso` de la API
// (lo edita el equipo desde Core); este solo cubre el rato en que aún no ha
// llegado o la petición falló.
const AVISO_POR_DEFECTO =
  "Las fechas de esta página son las que publican las propias oficinas de Extranjería con carácter orientativo. No son plazos legales ni comprometen a la Administración ni a Inspira Legal: una oficina puede adelantarse, retrasarse o dejar de publicarlas sin avisar. Cada oficina publica las suyas cuando quiere y en el formato que quiere; aquí las recogemos tal como las publica.";

const PREGUNTAS = [
  {
    q: "¿Qué significa que Extranjería «va por» una fecha?",
    a: "Significa que la oficina está trabajando con los expedientes presentados hasta ese día. Si presentaste tu solicitud después de esa fecha, el tuyo todavía no ha llegado a esa fase. No es un plazo de resolución: es una foto de por dónde van.",
  },
  {
    q: "¿Cuál es la diferencia entre grabación, instrucción y resolución?",
    a: "Grabación es cuando tu solicitud entra en el sistema y recibe número de expediente. Instrucción es cuando un instructor la estudia, comprueba requisitos y, si falta algo, te lo requiere. Resolución es la decisión final: concedida, denegada o archivada. Una misma oficina puede ir por fechas muy distintas en cada fase.",
  },
  {
    q: "¿Por qué mi provincia no aparece?",
    a: "Porque publicar estas fechas es una decisión de cada subdelegación del Gobierno, y la mayoría no lo hace. Cuando una oficina no publica, no existe un dato oficial equivalente: nadie puede decirte por qué fecha va sin inventárselo. Lo que sí puedes hacer en cualquier provincia es consultar el estado concreto de tu expediente en la sede electrónica con su número.",
  },
  {
    q: "Mi fecha ya pasó la que están resolviendo y no tengo respuesta. ¿Qué hago?",
    a: "Lo primero es descartar lo más habitual: que haya un requerimiento de documentación sin contestar, que la notificación esté en la sede electrónica sin abrir o que el expediente esté en otra fase. Si nada de eso ocurre, tu expediente está fuera del ritmo que la propia oficina declara, y ahí sí conviene revisar el plazo máximo de resolución de tu trámite y el sentido del silencio administrativo, que dependen de la normativa concreta de cada autorización. Eso se mira caso por caso, con el expediente delante.",
  },
  {
    q: "¿Estas fechas garantizan cuándo saldrá mi resolución?",
    a: "No. Las oficinas no avanzan a un ritmo constante: dentro de un mismo mes hay expedientes que salen antes y otros después, y un expediente con requerimiento se retrasa respecto a los de su tanda. Estas fechas sirven para situarte, no para contar los días.",
  },
  {
    q: "¿Cada cuánto se actualizan?",
    a: "Cada oficina publica cuando quiere: unas cada semana, otras cada varios meses. Por eso en cada bloque verás dos fechas distintas: el día al que se refiere el folleto oficial y el día en que nosotros lo revisamos y lo cargamos.",
  },
];

const SCHEMA_FAQ = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: PREGUNTAS.map((p) => ({
    "@type": "Question",
    name: p.q,
    acceptedAnswer: { "@type": "Answer", text: p.a },
  })),
};

/* ── Piezas de maquetación ───────────────────────────────────────────── */

function Seccion({ id, fondo = "bg-white", children, etiqueta }) {
  return (
    <section
      id={id}
      aria-label={etiqueta}
      className={`scroll-mt-24 px-4 py-12 min-[380px]:px-5 sm:px-6 sm:py-16 ${fondo}`}
    >
      <div className="mx-auto max-w-5xl">{children}</div>
    </section>
  );
}

function Titulo({ eyebrow, titulo, intro }) {
  return (
    <div className="max-w-3xl">
      {eyebrow && (
        <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-primary-light">
          <span aria-hidden="true" className="h-[3px] w-5 rounded-full bg-accent" />
          {eyebrow}
        </span>
      )}
      <h2 className="mt-3 font-fraunces text-[24px] font-bold leading-tight text-primary sm:text-4xl">
        {titulo}
      </h2>
      {intro && <p className="mt-4 leading-relaxed text-neutral-700">{intro}</p>}
    </div>
  );
}

/** Enlace externo: siempre avisa a los lectores de pantalla de que se abre fuera. */
function EnlaceFuente({ url, nombre, onClick }) {
  if (!url) return null;
  return (
    <a href={url} target="_blank" rel="noopener noreferrer nofollow" onClick={onClick} className="ext-fuente ext-foco">
      <Icono nombre="documento" size={15} />
      {nombre || "Publicación oficial de la oficina"}
      <span className="sr-only"> (se abre en otra pestaña)</span>
    </a>
  );
}

/* ── Estados sin datos ───────────────────────────────────────────────── */

function Esqueleto() {
  return (
    <div role="status" aria-live="polite" className="grid gap-5">
      <span className="sr-only">Cargando las fechas publicadas por las oficinas de Extranjería…</span>
      {[0, 1].map((i) => (
        <div key={i} className="rounded-3xl border border-neutral-200 p-5">
          <div className="ext-esqueleto h-5 w-52" />
          <div className="ext-esqueleto mt-3 h-3.5 w-72 max-w-full" />
          <div className="ext-esqueleto mt-5 h-40 w-full" />
        </div>
      ))}
    </div>
  );
}

function ErrorCarga({ onReintentar }) {
  return (
    <div role="alert" className="rounded-3xl border border-neutral-200 bg-white p-6 sm:p-8">
      <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-secondary-light text-accent">
        <Icono nombre="reloj" size={24} />
      </span>
      <h3 className="mt-4 font-fraunces text-xl font-bold text-primary sm:text-2xl">
        Ahora mismo no podemos mostrarte las fechas
      </h3>
      <p className="mt-2 text-sm leading-relaxed text-neutral-700">
        No hemos podido conectar con nuestro servidor. Las fechas no desaparecen por eso: siguen
        publicadas por cada oficina. Puedes consultarlas directamente en las fuentes oficiales o
        escribirnos y lo miramos contigo.
      </p>
      <ul className="mt-4 space-y-2">
        {FUENTES_GENERALES.map((f) => (
          <li key={f.url}>
            <EnlaceFuente url={f.url} nombre={f.nombre} />
          </li>
        ))}
      </ul>
      <div className="mt-6 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={onReintentar}
          className="ext-foco inline-flex min-h-[46px] items-center justify-center rounded-xl bg-primary px-5 py-3 text-sm font-extrabold text-white transition hover:bg-primary-light"
        >
          Volver a intentarlo
        </button>
        <a
          href={WA_GENERAL}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => evento("extranjeria_fechas_whatsapp", { ubicacion: "error" })}
          className="ext-foco inline-flex items-center gap-2 text-sm font-bold text-primary-light underline underline-offset-4 hover:text-primary"
        >
          <Icono nombre="chat" size={17} />
          Escríbenos por WhatsApp
        </a>
      </div>
    </div>
  );
}

/* ── Tabla de una familia ────────────────────────────────────────────── */

function TablaFamilia({ oficina, grupo, familia, filas }) {
  const titulo = `${familia} · ${grupo.etiqueta} en ${oficina.nombre}`;
  return (
    // El contenedor es enfocable y tiene nombre: si la tabla no cabe en un
    // móvil estrecho, se puede desplazar también con el teclado.
    <div className="ext-tabla-wrap" tabIndex={0} role="region" aria-label={titulo}>
      <table className="ext-tabla">
        <caption>{titulo}: hasta qué fecha de presentación han llegado.</caption>
        <thead>
          <tr>
            <th scope="col">Trámite</th>
            <th scope="col">Fase</th>
            <th scope="col">Van por lo presentado hasta el…</th>
          </tr>
        </thead>
        <tbody>
          {filas.map((t) => {
            const fase = FASES.find((f) => f.id === t.fase);
            return (
              <tr key={t.id}>
                <th scope="row">
                  {t.tramite}
                  {t.nota && (
                    <span className="mt-1 block text-[12px] font-medium leading-snug text-neutral-600">
                      {t.nota}
                    </span>
                  )}
                </th>
                <td>
                  <span className="ext-fase" title={fase?.explicacion}>
                    {fase ? fase.etiqueta : "—"}
                  </span>
                </td>
                <td>
                  {t.fecha ? (
                    <>
                      <span className="ext-fecha">{fechaLarga(t.fecha)}</span>
                      {t.texto && (
                        <span className="mt-1 block text-[12px] leading-snug text-neutral-600">{t.texto}</span>
                      )}
                    </>
                  ) : (
                    <span className="ext-fecha-vacia">{t.texto || "Aún no publicado"}</span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

/* ── Grupo (solicitudes o recursos), con sus familias plegables ──────── */

function Grupo({ oficina, grupo, consulta, esEscritorio }) {
  const familias = useMemo(
    () => familiasDe(oficina, grupo.id, consulta),
    [oficina, grupo.id, consulta],
  );
  // `undefined` = como toque por defecto (abierta en escritorio, plegada en
  // móvil). Al buscar se abren todas: si no, el resultado queda escondido.
  const [abiertas, setAbiertas] = useState({});

  if (familias.length === 0) return null;

  return (
    <div className={`ext-grupo ext-grupo-${grupo.id}`}>
      <p className="ext-grupo-cabecera">
        <Icono nombre={grupo.icono} size={14} />
        {grupo.etiqueta}
        <span className="ext-grupo-intro">{grupo.intro}</span>
      </p>

      {familias.map(({ familia, filas }) => {
        const abierta = consulta ? true : (abiertas[familia] ?? esEscritorio);
        return (
          <details
            key={familia}
            className="ext-familia"
            open={abierta}
            onToggle={(e) => {
              const ahora = e.currentTarget.open;
              setAbiertas((s) => (s[familia] === ahora ? s : { ...s, [familia]: ahora }));
            }}
          >
            <summary className="ext-familia-summary ext-foco">
              <span className="ext-familia-nombre">{familia}</span>
              <span className="ext-familia-cuenta">
                {filas.length} {filas.length === 1 ? "línea" : "líneas"}
              </span>
              <span className="ext-chevron" aria-hidden="true" />
            </summary>
            <TablaFamilia oficina={oficina} grupo={grupo} familia={familia} filas={filas} />
          </details>
        );
      })}
    </div>
  );
}

/* ── Bloque de una oficina ───────────────────────────────────────────── */

function BloqueOficina({ oficina, consulta, esEscritorio }) {
  // Dos fechas que no son lo mismo y que conviene no mezclar.
  const diaDelFolleto = fechaDeActualizacion(oficina.fecha_dato);
  const diaDeCarga = fechaDeActualizacion(oficina.actualizado_en);
  const sinResultados = Boolean(consulta) && cuentaCoincidencias(oficina, consulta) === 0;

  return (
    <article className="ext-oficina" aria-labelledby={`of-${oficina.id}`}>
      <div className="p-5 sm:p-7">
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <h3 id={`of-${oficina.id}`} className="font-fraunces text-xl font-bold text-primary sm:text-2xl">
            {oficina.nombre}
          </h3>
          {(oficina.provincia || oficina.comunidad) && (
            <p className="text-sm font-semibold text-neutral-500">
              {[oficina.provincia, oficina.comunidad].filter(Boolean).join(" · ")}
            </p>
          )}
        </div>

        {oficina.nota && <p className="mt-2 text-sm leading-relaxed text-neutral-700">{oficina.nota}</p>}

        {/* Las dos fechas, separadas y con su explicación: la del folleto es la
            que manda para leer la tabla; la nuestra solo dice cuándo miramos. */}
        {(diaDelFolleto || diaDeCarga) && (
          <dl className="ext-fechas-meta">
            {diaDelFolleto && (
              <div>
                <dt>Datos referidos al</dt>
                <dd>{diaDelFolleto}</dd>
                <p>Es el día al que se refiere la publicación de la oficina.</p>
              </div>
            )}
            {diaDeCarga && (
              <div>
                <dt>Revisado por Inspira el</dt>
                <dd>{diaDeCarga}</dd>
                <p>Cuándo comprobamos su publicación y actualizamos esta tabla.</p>
              </div>
            )}
          </dl>
        )}

        <HistorialOficina oficina={oficina} />

        {!oficina.publicada && (
          <div className="mt-5 rounded-2xl border border-dashed border-neutral-200 bg-neutral-200/20 p-5">
            <p className="font-bold text-primary">Aún no publicado</p>
            <p className="mt-1 text-sm leading-relaxed text-neutral-700">
              Esta oficina está en nuestra lista, pero todavía no ha publicado por qué fecha va. En
              cuanto lo haga, aparecerá aquí. No estimamos su fecha por comparación con otras
              provincias: sería inventárnosla.
            </p>
          </div>
        )}

        {oficina.publicada && sinResultados && (
          <p className="mt-5 rounded-2xl border border-dashed border-neutral-200 bg-neutral-200/20 p-4 text-sm leading-relaxed text-neutral-700">
            Esta oficina no publica ningún trámite que coincida con tu búsqueda.
          </p>
        )}

        {oficina.publicada && !sinResultados && (
          <div className="mt-5 grid gap-4">
            {GRUPOS.map((g) => (
              <Grupo key={g.id} oficina={oficina} grupo={g} consulta={consulta} esEscritorio={esEscritorio} />
            ))}
          </div>
        )}

        <p className="mt-4">
          <EnlaceFuente
            url={oficina.fuente_url}
            nombre={oficina.fuente_nombre}
            onClick={() => evento("extranjeria_fechas_fuente", { oficina: oficina.id })}
          />
        </p>
      </div>
    </article>
  );
}

/* ── Buscador ────────────────────────────────────────────────────────── */

function Buscador({ valor, onCambio, total }) {
  const id = useId();
  return (
    <div className="ext-buscador">
      <label htmlFor={id} className="mb-1.5 block text-sm font-bold text-primary">
        Busca tu trámite
      </label>
      <div className="relative">
        <span className="ext-buscador-icono" aria-hidden="true">
          <Icono nombre="brujula" size={18} />
        </span>
        <input
          id={id}
          type="search"
          className="ext-campo ext-campo-buscador"
          placeholder="arraigo, familiar de comunitario, larga duración…"
          value={valor}
          onChange={(e) => onCambio(e.target.value)}
          autoComplete="off"
        />
      </div>
      <p aria-live="polite" className="mt-2 text-[13px] text-neutral-600">
        {valor
          ? `${total} ${total === 1 ? "línea encontrada" : "líneas encontradas"} en todas las oficinas.`
          : "Escribe una palabra y se filtran las tablas de todas las oficinas a la vez."}
      </p>
    </div>
  );
}

/* ── Página ──────────────────────────────────────────────────────────── */

/** Escritorio: las familias salen abiertas. Móvil: plegadas, para poder hojear. */
function useEsEscritorio() {
  const [es, setEs] = useState(
    () => typeof window !== "undefined" && window.matchMedia("(min-width: 640px)").matches,
  );
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 640px)");
    const alCambiar = (e) => setEs(e.matches);
    mq.addEventListener("change", alCambiar);
    return () => mq.removeEventListener("change", alCambiar);
  }, []);
  return es;
}

export default function FechasExtranjeria() {
  const [carga, setCarga] = useState({ estado: "cargando" });
  const [consulta, setConsulta] = useState("");
  const esEscritorio = useEsEscritorio();

  // Mismo patrón que el mapa: el efecto solo dispara la petición y el
  // reintento sube `intento`. Poner el estado «cargando» dentro del efecto
  // encadenaría renders (react-hooks/set-state-in-effect).
  const [intento, setIntento] = useState(0);

  useEffect(() => {
    let vivo = true;
    pedirFechas()
      .then((datos) => {
        if (vivo) setCarga({ estado: "listo", datos });
      })
      .catch((error) => {
        console.error("[extranjeria-fechas] no se pudieron cargar:", error);
        if (vivo) setCarga({ estado: "error" });
      });
    return () => {
      vivo = false;
    };
  }, [intento]);

  const reintentar = useCallback(() => {
    setCarga({ estado: "cargando" });
    setIntento((n) => n + 1);
  }, []);

  const datos = carga.estado === "listo" ? carga.datos : null;
  const oficinas = useMemo(() => datos?.oficinas || [], [datos]);

  // Frase de la cabecera: los nombres salen de la API, nunca escritos a mano.
  // Si mañana se añade otra oficina desde Core, la frase se actualiza sola.
  const ciudades = useMemo(
    () => enumerar(oficinas.filter((o) => o.publicada).map(nombreCorto)),
    [oficinas],
  );
  // Corta a propósito: tiene que caber en dos líneas de móvil sin empujar el
  // resto de la cabecera. El porqué se explica entero en «¿Y las demás
  // provincias?», más abajo.
  const fraseCabecera = ciudades
    ? `La Administración solo publica estas fechas en ${ciudades}. El resto de subdelegaciones, no.`
    : "La Administración solo publica estas fechas en unas pocas oficinas. El resto, no.";

  const coincidencias = useMemo(
    () => oficinas.reduce((n, o) => n + cuentaCoincidencias(o, consulta), 0),
    [oficinas, consulta],
  );

  const actualizado = fechaDeActualizacion(datos?.actualizado);
  const aviso = datos?.aviso || AVISO_POR_DEFECTO;

  return (
    <main className="ext-pagina w-full overflow-x-hidden bg-white">
      <SEOSchema schema={SCHEMA_FAQ} id="faq-extranjeria-fechas" />

      <PageHero
        etiqueta="Extranjería · Fechas orientativas"
        icono="reloj"
        titulo="¿Por qué fecha"
        destacado="va Extranjería?"
        descripcion="Hasta qué fecha de presentación están grabando, instruyendo y resolviendo cada trámite y cada recurso, según lo que publica cada oficina."
      >
        {/* Aviso principal, en la cabecera y no en letra pequeña: estas fechas
            solo existen donde la Administración decide publicarlas. */}
        <p className="ext-hero-nota">
          <Icono nombre="brujula" size={17} />
          <span>{fraseCabecera}</span>
        </p>
        <a
          href="#calculadora"
          onClick={(e) => {
            e.preventDefault();
            document.getElementById("calculadora")?.scrollIntoView({ block: "start" });
            evento("extranjeria_fechas_ancla", { destino: "calculadora" });
          }}
          className="ext-foco-claro inline-flex min-h-[46px] items-center justify-center gap-2 rounded-xl bg-accent px-5 py-3 font-bold text-white shadow-lg shadow-accent/25 transition hover:bg-accent-dark"
        >
          <Icono nombre="calendario" size={18} />
          Situar mi fecha
        </a>
        {actualizado && (
          <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3.5 py-2 text-[13px] font-semibold text-white/85 ring-1 ring-white/20">
            <Icono nombre="reloj" size={15} />
            Revisado el {actualizado}
          </span>
        )}
      </PageHero>

      {/* ── Lo esencial, en dos frases ── */}
      <Seccion fondo="bg-secondary-light" etiqueta="Lo esencial">
        <div className="ext-esencial">
          <p className="ext-esencial-rotulo">
            <Icono nombre="destello" size={15} />
            Lo esencial
          </p>
          <p className="ext-esencial-texto">
            {ciudades ? `${ciudades} publican` : "Unas pocas oficinas publican"} hasta qué fecha de
            presentación llevan tramitados sus expedientes: si presentaste <b>antes</b> de esa fecha, el
            tuyo ya debería estar en esa fase; si presentaste <b>después</b>, todavía no le ha llegado el
            turno. Son datos orientativos de las propias oficinas, no plazos ni promesas.
          </p>
        </div>
        <p className="ext-aviso mt-5">
          <b className="block text-primary">Aviso legal</b>
          {aviso}
        </p>
      </Seccion>

      {/* ── Calculadora ── */}
      <Seccion id="calculadora" etiqueta="Calculadora de fecha">
        <Titulo
          eyebrow="Sitúa tu expediente"
          titulo="Presenté mi solicitud el…"
          intro="Elige la oficina y el trámite, escribe la fecha en la que presentaste y te decimos cuántos meses de expedientes tienes por delante o si el tuyo ya debería estar en revisión."
        />
        <div className="mt-7">
          {carga.estado === "cargando" && (
            <div className="ext-esqueleto h-48 w-full" role="status" aria-label="Cargando la calculadora" />
          )}
          {carga.estado === "error" && (
            <p className="rounded-2xl border border-neutral-200 bg-secondary-light p-5 text-sm leading-relaxed text-neutral-700">
              La calculadora necesita las fechas publicadas y ahora mismo no hemos podido cargarlas.
              Vuelve a intentarlo desde el aviso de abajo.
            </p>
          )}
          {carga.estado === "listo" && (
            <CercoErrores donde="extranjeria-fechas-calculadora" titulo="La calculadora no se pudo mostrar">
              <CalculadoraFechas oficinas={oficinas} />
            </CercoErrores>
          )}
        </div>
      </Seccion>

      {/* ── Oficinas ── */}
      <Seccion fondo="bg-secondary-light" etiqueta="Oficinas que publican sus fechas">
        <Titulo
          eyebrow="Oficina por oficina"
          titulo="Por dónde va cada oficina"
          intro="Cada línea dice hasta qué fecha de presentación ha llegado esa oficina en esa fase: si pone «12 de marzo», están resolviendo (o grabando, o instruyendo) lo presentado hasta ese día. Las solicitudes y los recursos van por separado porque avanzan a ritmos distintos."
        />

        {carga.estado === "listo" && oficinas.length > 0 && (
          <div className="mt-7">
            <Buscador
              valor={consulta}
              onCambio={(v) => {
                setConsulta(v);
                if (v.length === 3) evento("extranjeria_fechas_busqueda", {});
              }}
              total={coincidencias}
            />
          </div>
        )}

        <div className="mt-6 grid gap-5">
          {carga.estado === "cargando" && <Esqueleto />}
          {carga.estado === "error" && <ErrorCarga onReintentar={reintentar} />}
          {carga.estado === "listo" && oficinas.length === 0 && (
            <div className="rounded-3xl border border-dashed border-neutral-200 bg-white p-6">
              <p className="font-bold text-primary">Aún no publicado</p>
              <p className="mt-1 text-sm leading-relaxed text-neutral-700">
                Ninguna oficina tiene fechas cargadas en este momento. En cuanto se publiquen,
                aparecerán aquí.
              </p>
            </div>
          )}
          {carga.estado === "listo" &&
            oficinas.map((o) => (
              <CercoErrores key={o.id} donde={`extranjeria-fechas-${o.id}`} titulo="Esta oficina no se pudo mostrar">
                <BloqueOficina oficina={o} consulta={consulta} esEscritorio={esEscritorio} />
              </CercoErrores>
            ))}
        </div>
      </Seccion>

      {/* ── Silencio administrativo ── */}
      <Seccion id="silencio" etiqueta="Silencio administrativo">
        <Titulo
          eyebrow="Si tu fecha ya pasó"
          titulo="Mi expediente pasó la fecha y sigo sin respuesta"
          intro="Que tu fecha haya quedado por detrás de la que están resolviendo no significa que te vayan a contestar mañana, pero sí que tu expediente está fuera del ritmo que la propia oficina declara."
        />
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          {[
            {
              icono: "documento",
              titulo: "Primero, lo más común",
              texto:
                "Casi siempre hay una explicación sencilla: un requerimiento de documentación sin contestar, una notificación esperando en la sede electrónica o un expediente que avanzó por otra vía. Compruébalo antes que nada.",
            },
            {
              icono: "reloj",
              titulo: "Qué es el silencio administrativo",
              texto:
                "Cada trámite tiene un plazo máximo para resolverse y una regla sobre qué ocurre si ese plazo pasa sin respuesta. No es el mismo para un arraigo que para una tarjeta de familiar de comunitario, y por eso no se puede contestar en general.",
            },
            {
              icono: "balanza",
              titulo: "Qué se puede hacer",
              texto:
                "Con el expediente delante se revisa el plazo que le corresponde, si hay algo pendiente por tu parte y qué actuaciones caben. A veces solo toca esperar; a veces no, y esperar te resta opciones.",
            },
          ].map((c) => (
            <div key={c.titulo} className="rounded-2xl border border-neutral-200 bg-white p-5">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-white">
                <Icono nombre={c.icono} size={19} />
              </span>
              <p className="mt-3 font-bold leading-snug text-primary">{c.titulo}</p>
              <p className="mt-1.5 text-sm leading-relaxed text-neutral-700">{c.texto}</p>
            </div>
          ))}
        </div>
        <p className="mt-5">
          <a
            href={WA_SILENCIO}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => evento("extranjeria_fechas_whatsapp", { ubicacion: "silencio" })}
            className="ext-foco inline-flex items-center gap-2 text-sm font-bold text-primary-light underline underline-offset-4 hover:text-primary"
          >
            <Icono nombre="chat" size={17} />
            Cuéntanos tu caso y lo miramos
          </a>
        </p>
      </Seccion>

      {/* ── Las demás provincias ── */}
      <Seccion id="otras-provincias" fondo="bg-secondary-light" etiqueta="Las demás provincias">
        <div className="rounded-3xl border border-neutral-200 bg-white p-6 sm:p-8">
          <Titulo eyebrow="Si tu provincia no está" titulo="¿Y las demás provincias?" />
          <div className="mt-4 max-w-3xl space-y-3 text-[15px] leading-relaxed text-neutral-700">
            <p>
              Publicar por qué fecha va la tramitación es una decisión de cada subdelegación del
              Gobierno, no una obligación. <b>La mayoría no lo hace</b>, y por eso aquí solo verás las
              oficinas que sí publican.
            </p>
            <p>
              Cuando una oficina no publica, <b>no existe un dato oficial equivalente</b>. No vamos a
              estimarlo por parecido con otra provincia ni a darte un plazo «de media»: sería un número
              inventado, y con un expediente de extranjería en juego eso hace más daño que no saber.
            </p>
            <p>
              Si tu subdelegación empieza a publicarlas, la añadimos aquí. Y si crees que ya las
              publica y no la ves, dínoslo: la buscamos y la damos de alta.
            </p>
          </div>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <a
              href={WA_SIN_OFICINA}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => evento("extranjeria_fechas_whatsapp", { ubicacion: "otras-provincias" })}
              className="ext-foco inline-flex min-h-[46px] items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-extrabold text-white transition hover:bg-primary-light"
            >
              <Icono nombre="chat" size={18} />
              Mi provincia no publica: ayúdenme
            </a>
            <EnlaceFuente
              url={FUENTES_GENERALES[0].url}
              nombre="Ver las delegaciones del Gobierno"
              onClick={() => evento("extranjeria_fechas_fuente", { oficina: "delegaciones" })}
            />
          </div>
        </div>
      </Seccion>

      {/* ── Preguntas frecuentes ── */}
      <Seccion etiqueta="Preguntas frecuentes">
        <Titulo eyebrow="Preguntas frecuentes" titulo="Lo que más nos preguntan" />
        <div className="mt-6 grid gap-3">
          {PREGUNTAS.map((p) => (
            <details key={p.q} className="ext-faq">
              <summary className="ext-foco">
                {p.q}
                <span className="ext-chevron" aria-hidden="true" />
              </summary>
              <p>{p.a}</p>
            </details>
          ))}
        </div>
      </Seccion>

      {/* ── CTA final ── */}
      <Seccion fondo="bg-secondary-light" etiqueta="Asesoría de Inspira">
        <div className="rounded-3xl bg-primary p-7 text-white sm:p-10">
          <h2 className="font-fraunces text-2xl font-bold leading-tight sm:text-3xl">
            ¿Tu expediente lleva más tiempo del que debería?
          </h2>
          <p className="mt-3 max-w-2xl leading-relaxed text-white/80">
            Si tu fecha ya quedó muy atrás de la que publica la oficina, hay cosas que se pueden
            hacer: comprobar que no haya un requerimiento sin contestar, revisar la vía y, cuando
            procede, reclamar. Lo vemos con un abogado en la sesión diagnóstico.
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-4">
            <a
              href={CALENDLY_URL}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => evento("extranjeria_fechas_cta_sesion", { ubicacion: "final" })}
              className="ext-foco-claro inline-flex min-h-[46px] items-center justify-center gap-2 rounded-xl bg-accent px-6 py-3.5 font-bold text-white shadow-lg shadow-accent/25 transition hover:bg-accent-dark"
            >
              <Icono nombre="calendario" size={18} />
              Reservar la sesión diagnóstico
            </a>
            <a
              href={WA_GENERAL}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => evento("extranjeria_fechas_whatsapp", { ubicacion: "final" })}
              className="ext-foco-claro inline-flex items-center gap-2 text-sm font-semibold text-white/90 underline underline-offset-4 hover:text-white"
            >
              <Icono nombre="chat" size={18} />
              Escríbenos por WhatsApp
            </a>
          </div>
        </div>
      </Seccion>
    </main>
  );
}
