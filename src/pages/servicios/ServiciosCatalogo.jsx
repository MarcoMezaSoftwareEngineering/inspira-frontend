// src/pages/servicios/ServiciosCatalogo.jsx
// Catálogo completo de servicios, organizado por categorías con anclas
// (#extranjeria, #tramites-espana, #educativa) para el mega-menú del header.
import { useEffect } from "react";
import {
  CATEGORIAS,
  PRECIO_ASESORIA,
  DIFERENCIALES,
  hrefServicio,
} from "../../config/servicios";
import { ASESORIA } from "../../config/contacto";
import BotonAsesoria from "../../components/common/BotonAsesoria";
import PageHero from "../../components/layout/PageHero";
import ExploradorServicios from "./ExploradorServicios";
import CarruselCategorias from "./CarruselCategorias";
import SigueExplorando from "../../components/layout/SigueExplorando";
import Icono from "../../components/common/Icono";
import { navigate } from "../../services/navigate";

const go = (e, href) => {
  e.preventDefault();
  navigate(href);
};

// Icono representativo de cada subgrupo, para que el catálogo respire.
const ICONO_GRUPO = {
  estudios: "birrete",
  rapidos: "maletin",
  especializados: "balanza",
  "otros-extranjeria": "bandera",
  gestiones: "huella",
  master: "birrete",
  "becas-homologacion": "documento",
  adicionales: "avion",
};

// Cada categoría enlaza con su página de ruta, para no dejar callejones.
const RUTA_DE_CATEGORIA = {
  extranjeria: { href: "/ruta/rapidas", label: "Ver vías rápidas de residencia" },
  "tramites-espana": { href: "/ruta/en-espana", label: "Ya estoy en España" },
  educativa: { href: "/ruta/estudios", label: "Ver la ruta de estudios" },
};

function ServicioCard({ servicio }) {
  const body = (
    <>
      <div className="flex items-start justify-between gap-3">
        <h4 className="text-base font-bold text-neutral-900 leading-snug">
          {servicio.nombre}
        </h4>
        {servicio.etiqueta && (
          <span className="shrink-0 rounded-full bg-secondary px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wide text-primary">
            {servicio.etiqueta}
          </span>
        )}
      </div>
      <p className="mt-2 text-sm leading-relaxed text-neutral-700">
        {servicio.resumen}
      </p>
      <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-bold text-primary">
        Ver servicio
        <span aria-hidden>→</span>
      </span>
    </>
  );

  const destino = hrefServicio(servicio);
  return (
    <a
      id={servicio.id}
      href={destino}
      onClick={(e) => go(e, destino)}
      className="flex flex-col rounded-2xl border border-neutral-200 bg-white p-5 transition hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-lg scroll-mt-40"
    >
      {body}
    </a>
  );
}

export default function ServiciosCatalogo() {
  // Con navegación SPA el hash no dispara scroll nativo: lo hacemos a mano,
  // tanto al montar como cuando el mega-menú navega dentro de /servicios.
  useEffect(() => {
    const scrollToHash = () => {
      const hash = window.location.hash.slice(1);
      if (!hash) return;
      document
        .getElementById(hash)
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    };
    scrollToHash();
    window.addEventListener("popstate", scrollToHash);
    return () => window.removeEventListener("popstate", scrollToHash);
  }, []);

  return (
    <main className="w-full">
      <PageHero
        etiqueta="Todos nuestros servicios"
        icono="brujula"
        titulo="Tu camino a España,"
        destacado="trámite por trámite"
        descripcion="Extranjería, asesoría educativa y gestiones en España. Cada paquete se arma a tu medida: el único precio fijo es tu primera asesoría."
        accesos={[
          { icono: "birrete", label: "Máster en España", href: "/servicios/master" },
          { icono: "pasaporte", label: "Visa de Estudios", href: "/servicios/visa-estudios" },
          { icono: "documento", label: "Homologaciones", href: "/servicios#becas-homologacion" },
          { icono: "robot", label: "¿Cuál me toca?", href: "/asistente" },
        ]}
      >
        <BotonAsesoria>Agenda tu asesoría 1:1</BotonAsesoria>
        <span className="text-sm text-white/65">
          {ASESORIA.duracion} · {PRECIO_ASESORIA.eur} · {PRECIO_ASESORIA.usd} ·{" "}
          {PRECIO_ASESORIA.pen}
        </span>
      </PageHero>

      <CarruselCategorias />

      <ExploradorServicios />

      {/* Diferenciales */}
      <section className="border-b border-neutral-200 bg-secondary-light px-6 py-10">
        <div className="mx-auto grid max-w-5xl gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {DIFERENCIALES.map((v) => (
            <div key={v.titulo}>
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-sky-dark">
                <Icono nombre={v.icono} size={20} />
              </span>
              <h3 className="mt-2 text-sm font-bold text-neutral-900">
                {v.titulo}
              </h3>
              <p className="mt-1 text-xs leading-relaxed text-neutral-600">
                {v.texto}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Navegación por categoría */}
      {/* top-20 deja libre la franja del header flotante (fixed, ~80px) */}
      <nav className="sticky top-20 z-30 rounded-b-2xl border-b border-neutral-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-center gap-2 overflow-x-auto px-4 py-3">
          {CATEGORIAS.map((cat) => (
            <a
              key={cat.id}
              href={`#${cat.id}`}
              onClick={(e) => {
                e.preventDefault();
                document
                  .getElementById(cat.id)
                  ?.scrollIntoView({ behavior: "smooth", block: "start" });
              }}
              className="whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold text-neutral-700 transition hover:bg-secondary hover:text-primary"
            >
              {cat.titulo}
            </a>
          ))}
        </div>
      </nav>

      {/* Categorías */}
      <div className="mx-auto max-w-5xl px-6 py-16">
        {CATEGORIAS.map((cat, i) => (
          <section
            key={cat.id}
            id={cat.id}
            className={`scroll-mt-40 ${i > 0 ? "mt-20" : ""}`}
          >
            <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
              <div className="max-w-2xl">
                <span className="text-xs font-extrabold uppercase tracking-widest text-accent">
                  {cat.titulo}
                </span>
                <p className="mt-2 text-lg leading-relaxed text-neutral-700">
                  {cat.descripcion}
                </p>
              </div>
              {RUTA_DE_CATEGORIA[cat.id] && (
                <a
                  href={RUTA_DE_CATEGORIA[cat.id].href}
                  onClick={(e) => go(e, RUTA_DE_CATEGORIA[cat.id].href)}
                  className="inline-flex items-center gap-2 rounded-xl bg-secondary px-4 py-2.5 text-sm font-bold text-primary transition hover:bg-sky hover:text-primary-dark"
                >
                  {RUTA_DE_CATEGORIA[cat.id].label}
                  <span aria-hidden>→</span>
                </a>
              )}
            </div>

            {cat.grupos.map((grupo) => (
              <div key={grupo.id} className="mb-10">
                <div className="mb-4 flex items-start gap-3">
                  <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sky-light text-sky-dark">
                    <Icono nombre={ICONO_GRUPO[grupo.id] || "documento"} size={20} />
                  </span>
                  <div>
                    <h3 className="font-fraunces text-xl font-bold text-primary md:text-2xl">
                      {grupo.titulo}
                    </h3>
                    {grupo.nota && (
                      <span className="text-sm text-neutral-500">{grupo.nota}</span>
                    )}
                  </div>
                </div>
                <div
                  className={`grid gap-4 ${
                    grupo.destacado
                      ? "sm:grid-cols-2"
                      : "sm:grid-cols-2 lg:grid-cols-3"
                  }`}
                >
                  {grupo.servicios.map((s) => (
                    <ServicioCard key={s.id} servicio={s} />
                  ))}
                </div>
              </div>
            ))}
          </section>
        ))}

        {/* CTA final */}
        <section className="mt-20 rounded-3xl bg-primary px-8 py-12 text-center text-white">
          <h2 className="font-fraunces text-3xl font-bold">
            ¿No sabes por dónde empezar?
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-white/75">
            {PRECIO_ASESORIA.descripcion}
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-4">
            <BotonAsesoria />
            <span className="text-sm text-white/70">
              {ASESORIA.duracion} · {PRECIO_ASESORIA.eur} · {PRECIO_ASESORIA.usd} ·{" "}
              {PRECIO_ASESORIA.pen}
            </span>
          </div>
        </section>
      </div>
      <SigueExplorando destinos={["asistente","calculadora","casos","eventos"]} />
    </main>
  );
}
