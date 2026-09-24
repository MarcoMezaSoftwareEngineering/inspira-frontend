// src/pages/landing/master/MasterTodo.jsx
//
// /master: la landing completa del máster, la que se manda por WhatsApp a
// quien escribe «quiero hacer un máster en España». Es la misma columna
// vertebral que la landing de Ads (/master-2027-2028) —mismas secciones,
// mismos textos y precios de config/paqueteMaster2027.js— más lo que la de
// Ads no cuenta y que es lo que nos hace distintos: el expediente digital, las
// herramientas gratuitas (mapa, juego, test, expediente de ejemplo), la
// calculadora incrustada y los vídeos de Carina.
//
// Standalone como la de Ads (sin cabecera ni pie del sitio: un solo objetivo,
// la sesión diagnóstico), pero indexable.
import { useCallback, useEffect, useRef, useState } from "react";
import { CABECERA } from "../../../config/paqueteMaster2027";
import { useSEO } from "../../../hooks/useSEO";
import { evento, fijarPagina, irA, vigilarZonas } from "../master2027/medicion";
import { Hero, BarraPrueba } from "../master2027/Hero";
import Beneficios from "../master2027/Beneficios";
import MasElegidos from "../master2027/MasElegidos";
import MapaListas from "../master2027/MapaListas";
import Avanzados from "../master2027/Avanzados";
import PresupuestoPersonalizado from "../master2027/PresupuestoPersonalizado";
import { HASH_OTROS, VentanaOtrosServicios } from "../master2027/OtrosServicios";
import Promesa from "../master2027/Promesa";
import MetodoEtapas from "../master2027/MetodoEtapas";
import Rastreo from "../master2027/Rastreo";
import BecasPrincipales from "../master2027/BecasPrincipales";
import Calculadora from "../master2027/Calculadora";
import Fechas from "../master2027/Fechas";
import Equipo from "../master2027/Equipo";
import Faq from "../master2027/Faq";
import { CtaFinal, Pie } from "../master2027/CtaFinal";
import { BarraReserva } from "../master2027/BarraYModales";
import { ESTILOS_M27 } from "../master2027/comunes";
import ExpedienteDigital from "./ExpedienteDigital";
import Herramientas, { VideosCarina } from "./Herramientas";
import logo from "../../../assets/images/logo.png";

const SEO_MASTER_TODO = {
  title: "Máster en España 2027/2028: todo lo que hacemos por ti",
  description:
    "El Paquete Máster de Inspira Legal completo: listas y precios por comunidad, el método en etapas, tu expediente digital en un portal propio, el mapa de universidades, el juego de ciudades, la calculadora y los vídeos de Carina. Empieza con una sesión diagnóstico.",
  path: "/master",
  imagen: "/og/mapa-estudiar-en-espana.jpg",
};

export default function MasterTodo() {
  useSEO(SEO_MASTER_TODO);
  const [seleccion, setSeleccion] = useState({ comunidad: null, lista: null });
  const [otrosAbierto, setOtrosAbierto] = useState(false);
  const [barraCerrada, setBarraCerrada] = useState(false);
  const [calculadoraEnPantalla, setCalculadoraEnPantalla] = useState(false);
  const otrosRef = useRef(false);
  const origenOtrosRef = useRef(null);

  // Los eventos de esta página se distinguen de los de Ads por el nombre de
  // página; al salir vuelve el de la landing de Ads, que es el predeterminado.
  useEffect(() => {
    fijarPagina("master_todo");
    return () => fijarPagina("landing_2027");
  }, []);
  useEffect(() => vigilarZonas(), []);

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
      window.history.replaceState(null, "", window.location.pathname + window.location.search);
    }
    const origen = origenOtrosRef.current;
    origenOtrosRef.current = null;
    if (origen) setTimeout(() => origen.focus({ preventScroll: true }), 0);
  }, []);

  useEffect(() => {
    const revisarHash = () => {
      if (window.location.hash === HASH_OTROS) abrirOtros(null, "url");
    };
    revisarHash();
    window.addEventListener("hashchange", revisarHash);
    return () => window.removeEventListener("hashchange", revisarHash);
  }, [abrirOtros]);

  const abrirLista = useCallback((lista, planId) => {
    setSeleccion({ comunidad: null, lista });
    setTimeout(() => irA(planId ? `plan-${planId}` : `bloque-${lista}`), 60);
  }, []);

  return (
    <div className="w-full overflow-x-hidden bg-white font-sans text-neutral-900" style={{ "--m27-barra": "4.5rem" }}>
      <style>{ESTILOS_M27}</style>

      <header className="px-4 pt-4 min-[380px]:px-5 sm:px-6 sm:pt-6">
        <div className="mx-auto flex max-w-[1100px] items-center justify-between gap-3">
          <img src={logo} alt="Inspira Legal" width={320} height={107} className="h-8 w-auto sm:h-9" />
          <a href="/" onClick={() => evento("ads2027_salir_sitio")} className="shrink-0 text-[13px] text-neutral-600 underline underline-offset-4 hover:text-primary">
            {CABECERA.salir}
          </a>
        </div>
      </header>

      <main>
        <Hero />
        <BarraPrueba />
        <Promesa />
        <ExpedienteDigital />
        <Beneficios />
        <MasElegidos onAbrirLista={abrirLista} />
        <MapaListas seleccion={seleccion} onSeleccion={setSeleccion} />
        <Avanzados />
        <PresupuestoPersonalizado onAbrirOtros={abrirOtros} />
        <MetodoEtapas />
        <Rastreo />
        <Herramientas />
        <Calculadora onEnPantalla={setCalculadoraEnPantalla} />
        <BecasPrincipales />
        <VideosCarina />
        <Fechas />
        <Equipo />
        <Faq onAbrirOtros={abrirOtros} />
        <CtaFinal />
      </main>

      <Pie />

      {!barraCerrada && <BarraReserva oculta={otrosAbierto || calculadoraEnPantalla} onCerrar={() => setBarraCerrada(true)} />}
      {otrosAbierto && <VentanaOtrosServicios onCerrar={cerrarOtros} />}
    </div>
  );
}
