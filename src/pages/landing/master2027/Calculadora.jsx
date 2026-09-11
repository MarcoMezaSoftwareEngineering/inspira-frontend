// src/pages/landing/master2027/Calculadora.jsx
// A10: la calculadora de costos en un iframe que solo se carga al abrirla.
// Mientras está en pantalla avisa a la página para esconder la barra fija.
//
// Altura: la calculadora es del mismo origen, así que se mide su contenido y
// el iframe crece con él (sin scroll dentro de otro scroll). Hasta medir, o si
// no se puede, alto de min(85vh, 900px) en escritorio y 80vh en móvil.
import { useCallback, useEffect, useRef, useState } from "react";
import { CALCULADORA, DESCARGOS } from "../../../config/paqueteMaster2027";
import { Descargo, TituloSeccion } from "./comunes";
import { evento, prefiereMenosMovimiento } from "./medicion";
import ilusPortatil from "../../../assets/images/landing/master-2027/ilus-persona-portatil-busqueda.webp";

const ALTO_MINIMO = 320;

// `abiertaInicial`: en /servicios/master la calculadora se ve incrustada desde
// el principio; en la landing se abre con el botón.
// `margenScroll`: en /servicios/master la cabecera fija del sitio tapa el
// principio de la sección al bajar hasta ella; la landing no tiene cabecera.
export default function Calculadora({ onEnPantalla, abiertaInicial = false, margenScroll = "scroll-mt-4" }) {
  const [abierta, setAbierta] = useState(abiertaInicial);
  const [alto, setAlto] = useState(null);
  const marcoRef = useRef(null);
  const iframeRef = useRef(null);
  const observadorRef = useRef(null);

  const subirAlMarco = useCallback(() => {
    const el = marcoRef.current;
    if (!el || el.getBoundingClientRect().top >= 0) return;
    el.scrollIntoView({ block: "start", behavior: prefiereMenosMovimiento() ? "auto" : "smooth" });
  }, []);

  useEffect(() => {
    if (!abierta) return undefined;
    let ultimo = null;
    const medir = () => {
      const el = marcoRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const visible = r.top < window.innerHeight && r.bottom > 0;
      if (visible !== ultimo) {
        ultimo = visible;
        onEnPantalla?.(visible);
      }
    };
    // Por si la calculadora pide «subir» con postMessage al cambiar de paso.
    const alMensaje = (e) => {
      if (e.source && e.source === iframeRef.current?.contentWindow && e.data?.type === "scrollTop") subirAlMarco();
    };
    const raf = requestAnimationFrame(medir);
    window.addEventListener("scroll", medir, { passive: true });
    window.addEventListener("resize", medir);
    window.addEventListener("message", alMensaje);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", medir);
      window.removeEventListener("resize", medir);
      window.removeEventListener("message", alMensaje);
      observadorRef.current?.disconnect();
      observadorRef.current = null;
      onEnPantalla?.(false);
    };
  }, [abierta, onEnPantalla, subirAlMarco]);

  function alCargar(marco) {
    try {
      const win = marco.contentWindow;
      const doc = win?.document;
      if (!doc?.body) return;
      // Su body tiene min-height: 100vh; dentro de un iframe que crece, eso lo
      // haría crecer sin fin.
      const estilo = doc.createElement("style");
      estilo.textContent = "html,body{min-height:0!important;overflow-y:hidden!important}";
      doc.head.appendChild(estilo);
      // Al cambiar de paso la calculadora sube a su principio: con el iframe a
      // toda altura, lo que hay que subir es la página hasta el marco.
      win.scrollTo = subirAlMarco;
      const ajustar = () => {
        const h = Math.ceil(doc.body.offsetHeight);
        if (h > ALTO_MINIMO) setAlto(h);
      };
      observadorRef.current?.disconnect();
      observadorRef.current = new ResizeObserver(ajustar);
      observadorRef.current.observe(doc.body);
      ajustar();
    } catch {
      /* otro origen: se queda el alto por defecto */
    }
  }

  function alternar() {
    if (!abierta) evento("ads2027_calculadora_abrir");
    else setAlto(null);
    setAbierta((v) => !v);
  }

  return (
    <section id="calculadora" className={`${margenScroll} bg-secondary-light px-4 py-16 min-[380px]:px-5 sm:px-6 sm:py-20`}>
      <div className="mx-auto max-w-[1100px]">
        <div className="grid items-center gap-6 md:grid-cols-[minmax(0,1fr)_200px] md:gap-10">
          <TituloSeccion
            centrado={false}
            eyebrow={CALCULADORA.eyebrow}
            titulo={CALCULADORA.titulo}
            intro={CALCULADORA.intro}
          />
          <img
            src={ilusPortatil}
            alt=""
            width={683}
            height={679}
            loading="lazy"
            decoding="async"
            className="order-first mx-auto h-auto w-[140px] md:order-none md:w-[200px]"
          />
        </div>

        <div className="mt-6 flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:gap-5">
          <button
            type="button"
            onClick={alternar}
            aria-expanded={abierta}
            aria-controls="m27-calculadora"
            className="inline-flex items-center justify-center rounded-xl bg-primary px-6 py-3.5 font-bold text-white transition-transform hover:scale-[1.02] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sun active:scale-95"
          >
            {abierta ? CALCULADORA.cerrar : CALCULADORA.abrir}
          </button>
          <a
            href={CALCULADORA.pestanaHref}
            target="_blank"
            rel="noopener"
            className="text-sm font-bold text-primary-light underline underline-offset-4 hover:text-primary"
          >
            {CALCULADORA.pestana}
          </a>
        </div>

        {abierta && (
          <div
            id="m27-calculadora"
            ref={marcoRef}
            data-m27-zona="calculadora"
            className="mb-[var(--m27-barra)] mt-6 scroll-mt-4 overflow-hidden rounded-2xl border border-neutral-200 bg-white"
          >
            <iframe
              ref={iframeRef}
              src={CALCULADORA.iframeSrc}
              title={CALCULADORA.iframeTitulo}
              loading="lazy"
              onLoad={(e) => alCargar(e.currentTarget)}
              style={alto ? { height: `${alto}px` } : undefined}
              className={`block w-full border-0 ${alto ? "" : "h-[80vh] sm:h-[min(85vh,900px)]"}`}
            />
          </div>
        )}

        <Descargo className="mt-4">{DESCARGOS.calculadora}</Descargo>
      </div>
    </section>
  );
}
