// src/components/common/BarraCta.jsx
//
// La barra de acción que aparece abajo cuando la cabecera ya quedó atrás:
// WhatsApp y la sesión siempre a un pulgar de distancia. Se esconde mientras
// hay una ficha abierta (`oculta`) y respeta la barra inferior del sitio en
// móvil dejando el hueco con --barra-sitio (se lee en <body>, así que la
// página la fija en :root o en el propio body; por defecto, 64px en móvil).
//
// Las dos piezas van por portal a <body>: el envoltorio de página lleva una
// transformación de entrada y un position: fixed dentro de él se mide contra
// la página entera, no contra la pantalla.
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Icono from "./Icono";
import "../../styles/barra-cta.css";

export default function BarraCta({ whatsapp, sesion, textoWhatsapp = "WhatsApp", textoSesion, desde = 480, oculta = false, onWhatsapp, onSesion }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const mirar = () => setVisible(window.scrollY > desde);
    mirar();
    window.addEventListener("scroll", mirar, { passive: true });
    return () => window.removeEventListener("scroll", mirar);
  }, [desde]);

  // Mientras la barra se ve, el botón flotante de WhatsApp del sitio sobra:
  // serían dos WhatsApp uno encima del otro. Se avisa con una clase en <body>.
  useEffect(() => {
    const activa = visible && !oculta;
    document.body.classList.toggle("con-barra-cta", activa);
    return () => document.body.classList.remove("con-barra-cta");
  }, [visible, oculta]);
  return createPortal(
    <div className={`bcta${visible && !oculta ? " bcta-visible" : ""}`} aria-hidden={!visible || oculta}>
      <a href={whatsapp} target="_blank" rel="noopener" className="bcta-btn bcta-wa" onClick={onWhatsapp} tabIndex={visible ? 0 : -1}>
        <Icono nombre="whatsapp" size={18} />
        {textoWhatsapp}
      </a>
      <a href={sesion} target="_blank" rel="noopener" className="bcta-btn bcta-sesion" onClick={onSesion} tabIndex={visible ? 0 : -1}>
        <Icono nombre="calendario" size={16} />
        {textoSesion}
      </a>
    </div>,
    document.body,
  );
}

/** La línea fina de arriba que avanza con el scroll: cuánto queda por leer. */
export function ProgresoLectura() {
  const [p, setP] = useState(0);
  useEffect(() => {
    const mirar = () => {
      const total = document.documentElement.scrollHeight - window.innerHeight;
      setP(total > 0 ? Math.min(1, window.scrollY / total) : 0);
    };
    mirar();
    window.addEventListener("scroll", mirar, { passive: true });
    return () => window.removeEventListener("scroll", mirar);
  }, []);
  return createPortal(
    <div className="bcta-progreso" aria-hidden="true"><span style={{ transform: `scaleX(${p})` }} /></div>,
    document.body,
  );
}
