// src/pages/landing/master2027/MasterAds2027.jsx
//
// Landing de Ads «Paquete Máster 2027/2028» (/master-2027-2028). Standalone
// como /master-espana: sin Header ni Footer del sitio y sin indexar
// (App.jsx, LANDING_ADS_PATHS). Un solo objetivo: reservar la sesión
// diagnóstico en Calendly.
//
// Textos y precios: config/paqueteMaster2027.js. Medición y reglas de la
// ventana emergente: ./medicion.js.
import { useCallback, useEffect, useRef, useState } from "react";
import { CABECERA } from "../../../config/paqueteMaster2027";
import {
  ctaPulsado,
  evento,
  irA,
  marcarModal,
  modalYaMostrado,
  modalesSuprimidos,
  vigilarZonas,
} from "./medicion";
import { Hero, BarraPrueba } from "./Hero";
import Beneficios from "./Beneficios";
import MasElegidos from "./MasElegidos";
import MapaListas from "./MapaListas";
import Avanzados from "./Avanzados";
import PresupuestoPersonalizado from "./PresupuestoPersonalizado";
import { HASH_OTROS, VentanaOtrosServicios } from "./OtrosServicios";
import Promesa from "./Promesa";
import MetodoEtapas from "./MetodoEtapas";
import Rastreo from "./Rastreo";
import BecasPrincipales from "./BecasPrincipales";
import Calculadora from "./Calculadora";
import Fechas from "./Fechas";
import Equipo from "./Equipo";
import Faq from "./Faq";
import { CtaFinal, Pie } from "./CtaFinal";
import { BarraReserva, VentanaModal } from "./BarraYModales";
import { ESTILOS_M27 } from "./comunes";
import logo from "../../../assets/images/logo.png";


// Una sola ventana emergente (cliente, 11/09/2026, tarde): la de la sesión
// diagnóstico, a los 40 s en la página y una vez por sesión.
const TIPO_VENTANA = "sesion";
const VENTANA_SEGUNDOS = 40;

export default function MasterAds2027() {
  const [seleccion, setSeleccion] = useState({ comunidad: null, lista: null });
  const [modal, setModal] = useState(null); // null | "sesion"
  const [otrosAbierto, setOtrosAbierto] = useState(false);
  const [barraCerrada, setBarraCerrada] = useState(false);
  const [calculadoraEnPantalla, setCalculadoraEnPantalla] = useState(false);
  const modalRef = useRef(null);
  const otrosRef = useRef(false);
  const origenOtrosRef = useRef(null);

  useEffect(() => {
    document.title = `${CABECERA.tituloPagina} | Inspira Legal`;
  }, []);

  useEffect(() => vigilarZonas(), []);

  const abrirModal = useCallback(() => {
    // Espera también mientras el usuario tiene abierta la ventana de otras opciones.
    if (modalRef.current || otrosRef.current || ctaPulsado() || modalYaMostrado(TIPO_VENTANA) || modalesSuprimidos()) {
      return false;
    }
    marcarModal(TIPO_VENTANA);
    modalRef.current = TIPO_VENTANA;
    setModal(TIPO_VENTANA);
    evento("ads2027_modal", { tipo: TIPO_VENTANA, accion: "ver" });
    return true;
  }, []);

  const cerrarModal = useCallback(() => {
    const tipo = modalRef.current;
    if (!tipo) return;
    evento("ads2027_modal", { tipo, accion: "cerrar" });
    modalRef.current = null;
    setModal(null);
  }, []);

  const ctaModal = useCallback(() => {
    const tipo = modalRef.current;
    if (!tipo) return;
    evento("ads2027_modal", { tipo, accion: "cta" });
    modalRef.current = null;
    setModal(null);
  }, []);

  // Se reevalúa cada segundo: si en ese momento hay que callar (el visitante
  // está en el simulador, el mapa o la calculadora, o acaba de pulsar un CTA),
  // la ventana espera a que deje de haberlo.
  useEffect(() => {
    const inicio = Date.now();
    const intervalo = setInterval(() => {
      if (ctaPulsado() || modalYaMostrado(TIPO_VENTANA)) {
        clearInterval(intervalo);
        return;
      }
      if ((Date.now() - inicio) / 1000 >= VENTANA_SEGUNDOS && abrirModal()) clearInterval(intervalo);
    }, 1000);
    return () => clearInterval(intervalo);
  }, [abrirModal]);

  // Ventana de parciales, individuales y asesorías: la abre el usuario.
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

  // #otros-servicios en la URL (enlace del PDF): abre la ventana al cargar.
  useEffect(() => {
    const revisarHash = () => {
      if (window.location.hash === HASH_OTROS) abrirOtros(null, "url");
    };
    revisarHash();
    window.addEventListener("hashchange", revisarHash);
    return () => window.removeEventListener("hashchange", revisarHash);
  }, [abrirOtros]);

  // «Ver la lista» desde los más elegidos: abre esa lista y la lleva a la vista.
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
          <a
            href="/"
            onClick={() => evento("ads2027_salir_sitio")}
            className="shrink-0 text-[13px] text-neutral-600 underline underline-offset-4 hover:text-primary"
          >
            {CABECERA.salir}
          </a>
        </div>
      </header>

      <main>
        <Hero />
        <BarraPrueba />
        <Promesa />
        <Beneficios />
        <MasElegidos onAbrirLista={abrirLista} />
        <MapaListas seleccion={seleccion} onSeleccion={setSeleccion} />
        <Avanzados />
        <PresupuestoPersonalizado onAbrirOtros={abrirOtros} />
        <MetodoEtapas />
        <Rastreo />
        <BecasPrincipales />
        <Calculadora onEnPantalla={setCalculadoraEnPantalla} />
        <Fechas />
        <Equipo />
        <Faq onAbrirOtros={abrirOtros} />
        <CtaFinal />
      </main>

      <Pie />

      {!barraCerrada && (
        <BarraReserva
          oculta={!!modal || otrosAbierto || calculadoraEnPantalla}
          onCerrar={() => setBarraCerrada(true)}
        />
      )}
      {otrosAbierto && <VentanaOtrosServicios onCerrar={cerrarOtros} />}
      {modal && <VentanaModal tipo={modal} onCerrar={cerrarModal} onCta={ctaModal} />}
    </div>
  );
}
