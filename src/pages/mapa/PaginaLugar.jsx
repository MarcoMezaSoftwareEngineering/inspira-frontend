// src/pages/mapa/PaginaLugar.jsx
//
// Una página propia por comunidad (/master/galicia) y por universidad
// (/universidad/udc), con los mismos datos del mapa.
//
// Por qué existen: el mapa entero vivía en una sola dirección, así que Google
// solo podía posicionarnos por una cosa. Quien busca «cuánto cuesta un máster
// en Galicia» no encuentra un mapa: encuentra una página que se llama así.
// Son unas sesenta puertas de entrada en vez de una, cada una con su precio,
// su plazo y sus universidades.
//
// Todo sale de GET /api/mapa, igual que el mapa: aquí no hay ni un dato
// escrito a mano. Las fichas son las mismas que en el panel del mapa
// (Fichas.jsx), así que lo que se arregle allí se arregla aquí.
import { useEffect, useMemo, useRef, useState } from "react";
import PageHero from "../../components/layout/PageHero";
import CercoErrores from "../../components/common/CercoErrores";
import SEOSchema from "../../components/SEOSchema";
import Icono from "../../components/common/Icono";
import { useSEO } from "../../hooks/useSEO";
import { navigate } from "../../services/navigate";
import { CASOS } from "../../config/casos";
import { CALENDLY_URL, whatsappDesde } from "../../config/contacto";
import { useRevelar } from "../../lib/revelar";
import { casosEnMapa, crearIndice, masteresDe, mejorRanking } from "./indice";
import { plazoMasTemprano, rangoFechas, cursoCorto } from "./plazos";
import { FichaComunidad, FichaUniversidad } from "./Fichas";
import IlustracionCiudad from "./IlustracionesMapa";
import EmblemaSeccion from "./EmblemasMapa";
import { rutaComunidad, rutaUniversidad } from "./rutasLugar";
import { RUTA as RUTA_MAPA, SESION, eur, importeMatricula, plural, textoRanking } from "./mapaTextos";
import "../../styles/movimiento.css";
import "./mapa.css";

const API_URL = import.meta.env.VITE_API_URL || "https://api.inspira-legal.cloud";
const SITIO = "https://www.inspira-legal.cloud";

async function pedirMapa() {
  const r = await fetch(`${API_URL}/api/mapa`, { headers: { Accept: "application/json" } });
  const j = await r.json().catch(() => null);
  if (!r.ok || !j?.ok || !Array.isArray(j.comunidades)) throw new Error(j?.msg || `HTTP ${r.status}`);
  return j;
}

const irA = (href) => (e) => {
  e.preventDefault();
  navigate(href);
  window.scrollTo({ top: 0, behavior: "instant" });
};

/* ── Preguntas frecuentes ────────────────────────────────────────────── */

/**
 * Las preguntas son las que de verdad llegan por los comentarios de los
 * vídeos («¿son de título oficial?», «¿cuánto cuesta?», «¿cuándo se
 * postula?»), no las que quedan bonitas. Cada respuesta sale de los datos de
 * esta página, así que nunca se queda desfasada.
 */
function preguntasDe({ lugar, tipo, matricula, presupuesto, plazo, universidades, ranking }) {
  const p = [];
  p.push({
    q: `¿Cuánto cuesta un máster en ${lugar}?`,
    a: `La matrícula de un máster oficial en ${lugar} ronda ${matricula}. La cobra la universidad. ${
      presupuesto ? `Sumando la vida de un año, el primer año sale por unos ${eur(presupuesto.total)}.` : ""
    } El paquete de postulación de Inspira se paga aparte.`,
  });
  p.push({
    q: `¿Los másteres de ${lugar} son de título oficial?`,
    a: "Sí. En esta página solo hay másteres oficiales, los que constan en el Registro de Universidades, Centros y Títulos del Ministerio de España. Un título oficial es el que vale para seguir estudiando, para homologar y para los trámites de extranjería.",
  });
  if (plazo) {
    p.push({
      q: `¿Cuándo se postula a un máster en ${lugar}?`,
      a: `El plazo estimado más temprano va del ${plazo.rango}${plazo.curso ? `, para el curso ${plazo.curso}` : ""}. Cada universidad publica sus fechas y suele haber varias fases; conviene preparar los documentos antes de que abra.`,
    });
  }
  if (tipo === "comunidad" && universidades) {
    p.push({
      q: `¿Qué universidades hay en ${lugar}?`,
      a: `${universidades}. ${ranking ? `La mejor situada en el ranking QS es ${ranking}.` : ""}`,
    });
  }
  p.push({
    q: "¿Necesito visa para estudiar el máster?",
    a: "Si el máster dura más de 90 días, necesitas visado de estudios. Para pedirlo tienes que demostrar que cuentas con al menos 7.200 € al año (600 € al mes), además de la carta de admisión y el seguro médico.",
  });
  return p;
}

function Preguntas({ preguntas }) {
  return (
    <section aria-labelledby="preguntas-titulo" className="mt-14" data-revelar>
      <div className="flex items-start gap-3.5">
        <EmblemaSeccion nombre="fuentes" className="mt-0.5 shrink-0" />
        <div className="min-w-0">
          <p className="mapa-rotulo">Preguntas frecuentes</p>
          <h2 id="preguntas-titulo" className="mapa-titular mt-0.5 text-[24px] font-bold leading-tight text-[#003648] sm:text-[27px]">
            Lo que más nos preguntan
          </h2>
        </div>
      </div>
      <div className="mt-5 grid gap-3">
        {preguntas.map((p) => (
          <details key={p.q} className="mapa-tarjeta group p-4 sm:p-5" data-revelar="suave">
            <summary className="mapa-titular flex cursor-pointer list-none items-start justify-between gap-3 text-[16px] font-bold text-[#003648]">
              {p.q}
              <span aria-hidden="true" className="mt-1 shrink-0 text-[#0A5873] transition-transform group-open:rotate-180">
                <Icono nombre="flecha" size={16} className="rotate-90" />
              </span>
            </summary>
            <p className="mt-2.5 text-[15px] leading-relaxed text-neutral-700">{p.a}</p>
          </details>
        ))}
      </div>
    </section>
  );
}

/* ── Enlaces a las demás páginas ─────────────────────────────────────── */

function OtrosLugares({ titulo, items, ruta }) {
  if (!items.length) return null;
  return (
    <section className="mt-14" data-revelar>
      <p className="mapa-rotulo">
        <Icono nombre="mapa" size={14} />
        Sigue mirando
      </p>
      <h2 className="mapa-titular mt-0.5 text-[24px] font-bold leading-tight text-[#003648]">{titulo}</h2>
      <div className="mt-4 flex flex-wrap gap-2">
        {items.map((it) => (
          <a
            key={it.id}
            href={ruta(it.id)}
            onClick={irA(ruta(it.id))}
            className="mapa-boton mov-toque inline-flex min-h-[44px] items-center gap-2 rounded-full border border-[#E1EFFD] bg-white px-4 py-2 text-[13px] font-bold text-[#003648] hover:bg-[#F6FBFF]"
          >
            {it.nombre}
            {it.detalle && <span className="font-semibold text-neutral-600">{it.detalle}</span>}
          </a>
        ))}
      </div>
    </section>
  );
}

/* ── La página ───────────────────────────────────────────────────────── */

function Contenido({ datos, tipo, id }) {
  const indice = useMemo(() => crearIndice(datos), [datos]);
  const casos = useMemo(() => casosEnMapa(indice, CASOS), [indice]);
  const pagina = useRef(null);
  useRevelar(pagina, [indice, id]);

  const com = tipo === "comunidad" ? indice.comunidades.get(id) : null;
  const uni = tipo === "universidad" ? indice.universidades.get(id) : null;
  const comunidadDeUni = uni ? indice.comunidades.get(uni.comunidad) : null;
  const base = com || comunidadDeUni;

  if ((tipo === "comunidad" && !com) || (tipo === "universidad" && !uni)) {
    return (
      <div className="mx-auto max-w-xl rounded-3xl border border-[#E1EFFD] bg-white p-8 text-center">
        <h2 className="mapa-titular text-2xl font-bold text-[#003648]">No encontramos esa página</h2>
        <p className="mt-2 text-sm text-neutral-700">Puede que haya cambiado de dirección. Búscalo en el mapa.</p>
        <a
          href={RUTA_MAPA}
          onClick={irA(RUTA_MAPA)}
          className="mapa-boton mov-toque mt-5 inline-flex min-h-[48px] items-center gap-2 rounded-2xl bg-[#003648] px-6 py-3 text-sm font-extrabold text-white"
        >
          <Icono nombre="mapa" size={17} className="text-[#F09C48]" />
          Ir al mapa
        </a>
      </div>
    );
  }

  const lugar = com ? com.nombre : uni.nombre;
  const presupuesto = base ? indice.presupuestos.get(base.id) || null : null;
  const unisDelLugar = com
    ? com.universidadesIds.map((x) => indice.universidades.get(x)).filter(Boolean)
    : [uni];
  const mejor = mejorRanking(indice, unisDelLugar.map((u) => u.id));
  const mejorFase = plazoMasTemprano(unisDelLugar);
  const plazo = mejorFase
    ? { rango: rangoFechas(mejorFase.fase.inicio, mejorFase.fase.fin), curso: cursoCorto(mejorFase.curso) }
    : null;

  const matricula = (com?.precioAnual || uni?.precioAnual)
    ? `${eur(Math.round((uni?.precioAnual || com.precioAnual).tipico))} al año`
    : importeMatricula(base?.matricula);

  const preguntas = preguntasDe({
    lugar,
    tipo,
    matricula,
    presupuesto,
    plazo,
    universidades: com ? unisDelLugar.map((u) => u.nombre).join(", ") : null,
    ranking: mejor ? `${mejor.u.nombre} (${textoRanking(mejor.u.ranking)})` : null,
  });

  const elegir = (t, x) => {
    if (t === "comunidad") navigate(rutaComunidad(x));
    else if (t === "universidad") navigate(rutaUniversidad(x));
    else navigate(`${RUTA_MAPA}?${t}=${x}`);
    window.scrollTo({ top: 0, behavior: "instant" });
  };

  const comunes = {
    indice,
    foco: { tipo, comunidad: base?.id || null, ciudad: uni?.ciudad || null, universidad: uni?.id || null, caso: null },
    geoPorId: new Map(),
    rama: null,
    orden: "masteres",
    onOrden: () => {},
    casos,
    comparador: { tipo: null, ids: [], maximo: 3, alternar: () => {} },
    onElegir: elegir,
    onGuardar: null,
  };

  const otras = com
    ? indice.datos.comunidades
        .filter((c) => c.id !== com.id)
        .map((c) => ({ id: c.id, nombre: c.nombre, detalle: c.precioAnual ? `· ${eur(Math.round(c.precioAnual.tipico))}` : null }))
    : unisDelLugar.length
      ? (comunidadDeUni?.universidadesIds || [])
          .map((x) => indice.universidades.get(x))
          .filter((u) => u && u.id !== uni.id)
          .map((u) => ({ id: u.id, nombre: u.sigla, detalle: `· ${plural(masteresDe(u, null), "máster", "másteres")}` }))
      : [];

  const esquema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Mapa de másteres en España", item: `${SITIO}${RUTA_MAPA}` },
          ...(com ? [] : [{ "@type": "ListItem", position: 2, name: comunidadDeUni?.nombre || "", item: `${SITIO}${rutaComunidad(comunidadDeUni?.id || "")}` }]),
          { "@type": "ListItem", position: com ? 2 : 3, name: lugar, item: `${SITIO}${com ? rutaComunidad(com.id) : rutaUniversidad(uni.id)}` },
        ],
      },
      {
        "@type": "FAQPage",
        mainEntity: preguntas.map((p) => ({
          "@type": "Question",
          name: p.q,
          acceptedAnswer: { "@type": "Answer", text: p.a },
        })),
      },
      ...(uni
        ? [
            {
              "@type": "CollegeOrUniversity",
              name: uni.nombre,
              alternateName: uni.sigla,
              address: { "@type": "PostalAddress", addressLocality: indice.ciudades.get(uni.ciudad)?.nombre, addressCountry: "ES" },
              url: `${SITIO}${rutaUniversidad(uni.id)}`,
            },
          ]
        : []),
    ],
  };

  return (
    <div ref={pagina}>
      <SEOSchema schema={esquema} id={`lugar-${tipo}-${id}`} />

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_340px] lg:items-start">
        <div className="min-w-0">
          <CercoErrores donde={`pagina-${tipo}`} titulo="No se pudo mostrar esta página">
            {com ? <FichaComunidad c={com} {...comunes} /> : <FichaUniversidad u={uni} {...comunes} />}
          </CercoErrores>
        </div>

        <aside className="mapa-tarjeta overflow-hidden lg:sticky lg:top-28" data-revelar="escala">
          {base && (
            <div className="mapa-ciudad-lienzo">
              <IlustracionCiudad ciudad={uni?.ciudad || base.ciudades?.[0] || "CAMPUS"} />
            </div>
          )}
          <div className="p-5">
            <p className="mapa-rotulo">
              <Icono nombre="calendario" size={14} />
              El siguiente paso
            </p>
            <p className="mt-1.5 text-sm leading-relaxed text-neutral-700">
              Revisamos tu perfil con un abogado especialista y te decimos si {lugar} tiene sentido para ti. Sales con un plan escrito.
            </p>
            <a
              href={CALENDLY_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="mapa-boton mov-toque mt-3 inline-flex min-h-[48px] w-full items-center justify-center gap-2 rounded-2xl bg-[#F09C48] px-4 py-3 text-sm font-extrabold text-[#003648] hover:bg-[#F4AD62]"
            >
              <Icono nombre="calendario" size={17} />
              {SESION}
            </a>
            <a
              href={whatsappDesde("mapa", `Hola, vi la página de ${lugar} y quiero postular. ¿Me ayudan?`)}
              target="_blank"
              rel="noopener noreferrer"
              className="mapa-boton mov-toque mt-2 inline-flex min-h-[46px] w-full items-center justify-center gap-2 rounded-2xl border-2 border-[#003648] px-4 py-2.5 text-sm font-extrabold text-[#003648] hover:bg-[#F6FBFF]"
            >
              <Icono nombre="chat" size={17} />
              Preguntar por WhatsApp
            </a>
            <a
              href={RUTA_MAPA}
              onClick={irA(RUTA_MAPA)}
              className="mov-toque mt-3 inline-flex w-full items-center justify-center gap-1.5 text-[13px] font-bold text-[#0A5873] underline underline-offset-2"
            >
              <Icono nombre="mapa" size={14} />
              Ver el mapa completo
            </a>
          </div>
        </aside>
      </div>

      <Preguntas preguntas={preguntas} />

      <OtrosLugares
        titulo={com ? "Otras comunidades" : `Otras universidades de ${comunidadDeUni?.nombre || "la comunidad"}`}
        items={otras}
        ruta={com ? rutaComunidad : rutaUniversidad}
      />
    </div>
  );
}

export default function PaginaLugar({ tipo, id }) {
  const [carga, setCarga] = useState({ estado: "cargando" });
  const nombreBonito = id.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

  useSEO({
    title:
      tipo === "comunidad"
        ? `Máster en ${nombreBonito}: cuánto cuesta y cómo postular | Inspira Legal`
        : `${nombreBonito.toUpperCase()}: másteres oficiales, precio y plazos | Inspira Legal`,
    description:
      tipo === "comunidad"
        ? `Cuánto cuesta un máster oficial en ${nombreBonito}: matrícula al año, gasto de vida, universidades, ranking QS y fechas de postulación.`
        : `Másteres oficiales de ${nombreBonito.toUpperCase()}: precio de la matrícula, ranking QS, plazos de postulación y cómo entrar desde Perú.`,
    path: tipo === "comunidad" ? rutaComunidad(id) : rutaUniversidad(id),
    imagen: "/og/mapa-estudiar-en-espana.jpg",
  });

  useEffect(() => {
    let vivo = true;
    pedirMapa()
      .then((datos) => vivo && setCarga({ estado: "listo", datos }))
      .catch((e) => {
        console.error("[pagina-lugar] no se pudo cargar:", e);
        if (vivo) setCarga({ estado: "error" });
      });
    return () => {
      vivo = false;
    };
  }, [tipo, id]);

  return (
    <main className="mapa-premium w-full bg-white">
      <PageHero
        etiqueta={tipo === "comunidad" ? "Máster oficial en España" : "Universidad española"}
        icono={tipo === "comunidad" ? "mapa" : "casa"}
        titulo={tipo === "comunidad" ? `Estudiar un máster en` : "Másteres oficiales de"}
        destacado={nombreBonito}
        descripcion={
          tipo === "comunidad"
            ? "Lo que cuesta la matrícula, lo que necesitas para vivir un año, qué universidades hay y cuándo se postula."
            : "Sus másteres oficiales, el precio de la matrícula, su puesto en el ranking y las fechas de postulación."
        }
        volver={{ href: RUTA_MAPA, label: "Volver al mapa" }}
      />
      <section id="mapa-explorador" className="px-4 pb-16 pt-10 sm:px-6">
        <div className="mx-auto max-w-[1180px]">
          {carga.estado === "cargando" && (
            <div role="status" className="mapa-tarjeta p-8 text-center text-sm text-neutral-700">
              Cargando los datos…
            </div>
          )}
          {carga.estado === "error" && (
            <div role="alert" className="mapa-tarjeta p-8 text-center">
              <p className="mapa-titular text-xl font-bold text-[#003648]">No pudimos cargar los datos</p>
              <a
                href={RUTA_MAPA}
                onClick={irA(RUTA_MAPA)}
                className="mapa-boton mov-toque mt-4 inline-flex min-h-[46px] items-center gap-2 rounded-2xl bg-[#003648] px-5 py-2.5 text-sm font-extrabold text-white"
              >
                Ir al mapa
              </a>
            </div>
          )}
          {carga.estado === "listo" && <Contenido datos={carga.datos} tipo={tipo} id={id} />}
        </div>
      </section>
    </main>
  );
}
