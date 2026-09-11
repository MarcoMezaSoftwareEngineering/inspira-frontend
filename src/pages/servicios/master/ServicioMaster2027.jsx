// src/pages/servicios/master/ServicioMaster2027.jsx
//
// /servicios/master: la página de referencia del Paquete Máster 2027/2028,
// dentro del sitio (con cabecera y pie) e indexable.
//
// Reutiliza las secciones de la landing de Ads (pages/landing/master2027) y su
// config (config/paqueteMaster2027.js): una sola fuente de precios y textos.
// A diferencia de la landing: sin ventana emergente por tiempo y sin barra fija
// propia (el sitio ya tiene BarraInferior y AsesoriaCTA); el hero lleva dos
// botones secundarios (calculadora y portal) y el aviso de títulos oficiales;
// la matrícula por comunidad va antes de las listas; la calculadora, incrustada;
// y en lugar del rastreo, el «Portal propio» con capturas.
//
// Parciales, individuales y asesorías: discretos, en la tarjeta compacta tras
// el presupuesto personalizado y en su ventana. #otros-servicios la abre.
import { useCallback, useEffect, useRef, useState } from "react";
import { PAGINA_MASTER } from "../../../config/paqueteMaster2027";
import { ESTILOS_M27, TituloSeccion } from "../../landing/master2027/comunes";
import { evento, fijarPagina, irA } from "../../landing/master2027/medicion";
import { Hero, BarraPrueba } from "../../landing/master2027/Hero";
import MapaListas from "../../landing/master2027/MapaListas";
import MatriculaComunidades from "../../landing/master2027/MatriculaComunidades";
import Avanzados from "../../landing/master2027/Avanzados";
import PresupuestoPersonalizado from "../../landing/master2027/PresupuestoPersonalizado";
import { HASH_OTROS, VentanaOtrosServicios } from "../../landing/master2027/OtrosServicios";
import MetodoEtapas from "../../landing/master2027/MetodoEtapas";
import Calculadora from "../../landing/master2027/Calculadora";
import BecasPrincipales from "../../landing/master2027/BecasPrincipales";
import Fechas from "../../landing/master2027/Fechas";
import Opiniones from "../../landing/master2027/Opiniones";
import Faq from "../../landing/master2027/Faq";
import { CtaFinal } from "../../landing/master2027/CtaFinal";
import PortalPropio from "./PortalPropio";

const PREGUNTAS_EXTRA = [PAGINA_MASTER.faqOficial];

export default function ServicioMaster2027() {
  const [seleccion, setSeleccion] = useState({ comunidad: null, lista: null });
  const [otrosAbierto, setOtrosAbierto] = useState(false);
  const otrosRef = useRef(false);
  const origenOtrosRef = useRef(null);

  // Los eventos de las secciones compartidas llevan esta página.
  useEffect(() => {
    fijarPagina("servicios_master");
    return () => fijarPagina("landing_2027");
  }, []);

  const abrirOtros = useCallback((origen = null, desde = "url") => {
    if (otrosRef.current) return;
    origenOtrosRef.current = origen instanceof HTMLElement ? origen : null;
    otrosRef.current = true;
    setOtrosAbierto(true);
    evento("ads2027_otros_servicios", { accion: "abrir", origen: desde });
  }, []);

  const cerrarOtros = useCallback(() => {
    if (!otrosRef.current) return;
    otrosRef.current = false;
    setOtrosAbierto(false);
    evento("ads2027_otros_servicios", { accion: "cerrar" });
    if (window.location.hash === HASH_OTROS) {
      window.history.replaceState(window.history.state, "", window.location.pathname + window.location.search);
    }
    const origen = origenOtrosRef.current;
    origenOtrosRef.current = null;
    if (origen) setTimeout(() => origen.focus({ preventScroll: true }), 0);
  }, []);

  // Anclas de la URL: #otros-servicios (lo enlaza el PDF) abre la ventana; el
  // resto (#pago-por-etapas, al que redirige /metodo-inspira) baja a la sección.
  useEffect(() => {
    let temporizador;
    const revisarHash = () => {
      const hash = window.location.hash;
      if (!hash) return;
      if (hash === HASH_OTROS) {
        abrirOtros(null, "url");
        return;
      }
      clearTimeout(temporizador);
      temporizador = setTimeout(() => irA(decodeURIComponent(hash.slice(1))), 400);
    };
    revisarHash();
    window.addEventListener("hashchange", revisarHash);
    return () => {
      clearTimeout(temporizador);
      window.removeEventListener("hashchange", revisarHash);
    };
  }, [abrirOtros]);

  return (
    <main className="w-full overflow-x-hidden bg-white font-sans text-neutral-900">
      <style>{ESTILOS_M27}</style>
      <Hero secundarios={PAGINA_MASTER.heroSecundarios} oficial={PAGINA_MASTER.heroOficial} />
      <BarraPrueba />
      <MatriculaComunidades />
      <MapaListas seleccion={seleccion} onSeleccion={setSeleccion} nota={PAGINA_MASTER.planesOficial} />
      <Avanzados />
      <PresupuestoPersonalizado onAbrirOtros={abrirOtros} />
      <div id="pago-por-etapas" className="scroll-mt-24 pb-16 sm:pb-20">
        <MetodoEtapas />
      </div>
      <Calculadora abiertaInicial margenScroll="scroll-mt-24" />
      <PortalPropio />
      <BecasPrincipales />
      <Fechas />
      <section className="bg-secondary-light px-4 py-16 min-[380px]:px-5 sm:px-6 sm:py-20">
        <div className="mx-auto max-w-[1100px]">
          <TituloSeccion eyebrow={PAGINA_MASTER.opinionesEyebrow} titulo={PAGINA_MASTER.opinionesTitulo} />
          <Opiniones ubicacion="servicios_master" className="mt-8" />
        </div>
      </section>
      <Faq onAbrirOtros={abrirOtros} preguntasExtra={PREGUNTAS_EXTRA} />
      <CtaFinal />
      {otrosAbierto && <VentanaOtrosServicios onCerrar={cerrarOtros} />}
    </main>
  );
}
