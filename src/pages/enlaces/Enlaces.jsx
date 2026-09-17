// src/pages/enlaces/Enlaces.jsx
//
// Página de enlaces para las biografías de redes: sustituye a Linktree
// (https://linktr.ee/inspira_educa) desde el 15/09/2026. Sin cabecera, pie ni
// barras del sitio (LANDING_ADS_PATHS en App.jsx) y sin indexar.
//
// Rediseño del mismo día (la clienta la quería más bonita e interactiva):
// imágenes de las páginas (las de /og), beca con cuenta atrás, reserva de
// asesoría con opciones que se eligen, opiniones que rotan, carrusel de
// recursos gratuitos, visado y estancia, y fondo animado. Todo respeta
// prefers-reduced-motion.
//
// Medición: los enlaces internos llevan utm_source=enlaces y cada botón manda
// un evento ENLACE a Inspira Core (origen_detalle = qué botón), solo con
// consentimiento de analítica (lib/analytics).
// Redes y correo, copiados del Linktree el 15/09/2026; el número es la línea
// única de la web (config/contacto.js). Opiniones: literales y completas de
// config/testimonios.js, sin enlazar la ficha de Google (clienta: no poner a
// mano el botón de escribir reseña).
//
// 17/09/2026, cuatro cosas más:
// - El mapa ya no se descarga al entrar: se ve su imagen y el mapa de verdad
//   llega cuando el bloque está a punto de verse o al primer scroll. Con
//   «ahorro de datos», solo si se toca.
// - Enlace profundo: /enlaces?ver=mapa&comunidad=<id> abre la muestra en esa
//   comunidad, quieta y desplazada hasta ella.
// - Cada bloque tiene su saludo de WhatsApp (DETALLE_WA): el botón flotante
//   cambia el detalle según lo que se está mirando.
// - La beca y los eventos se ordenan solos por temporada (ver más abajo).
import { Suspense, lazy, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import logo from "../../assets/images/logo.png";
import Icono from "../../components/common/Icono";
import WhatsAppFlotante from "../../components/common/WhatsAppFlotante";
import { CALENDLY_URL, LINEAS, MENSAJE_SEGURO, WHATSAPP_INSPIRA, WHATSAPP_SEGURO } from "../../config/contacto";
import { OPCIONES_ASESORIA } from "../../config/asesorias";
import { CIFRAS, estadoPostulacion } from "../../config/bicentenario2026";
import { eventosActivos } from "../../config/eventos";
import { getServicio, hrefServicio } from "../../config/servicios";
import { TESTIMONIOS } from "../../config/testimonios";
import { enviarEventoEmbudo } from "../../lib/analytics";
import { useRevelar } from "../../lib/revelar";
import "../../styles/movimiento.css";

// El mapa en vivo va en su propio trozo: no pesa hasta que se pinta.
const MuestraMapa = lazy(() => import("./MuestraMapa"));
const MuestraPortal = lazy(() => import("./MuestraPortal"));

const UTM = "utm_source=enlaces&utm_medium=bio";
/** Ruta interna con utm (antes del #, si lo hay). */
const interno = (ruta) => {
  const [base, hash] = ruta.split("#");
  return `${base}${base.includes("?") ? "&" : "?"}${UTM}${hash ? `#${hash}` : ""}`;
};
const BECA = interno("/beca-generacion-bicentenario-2026");
const marcar = (clave) => enviarEventoEmbudo("ENLACE", { origen_detalle: clave });

// Un saludo por punto de contacto: quien escribe desde el mapa no pide lo
// mismo que quien viene de la beca. Cambia SOLO el detalle; el saludo («Hola
// Inspira, vengo de la página de enlaces de Inspira»), el tono y el número los
// pone whatsappDesde y no se tocan. La clave es el `data-wa` del bloque.
const DETALLE_WA = {
  general: "Quiero información para estudiar en España.",
  cabecera: "Quiero información para empezar.",
  mapa: "Vengo del mapa de costos y quiero información.",
  reserva: "Quiero reservar una asesoría.",
  opiniones: "Vi las opiniones de otros asesorados y quiero información.",
  contacto: "Quiero hablar con alguien del equipo.",
  recursos: "Vengo de los recursos gratuitos y quiero información.",
  beca: "Vengo de la beca y quiero información.",
  servicios: "Quiero información sobre el visado y la estancia por estudios.",
  master: "Quiero información del Paquete Máster 2027/2028.",
  viaje: "Quiero información para preparar mi viaje a España.",
};

// Línea única de la web, atendida por el equipo de Perú y España.
const NUMERO = LINEAS[0].numero;
const TEL = `tel:+${NUMERO.replace(/\D/g, "")}`;

// Lo que hacemos, en tres palabras. Sustituye a la línea de emojis de la
// biografía (17/09/2026): cada sistema dibuja los emojis a su manera —en varios
// Android salían de otra familia y de otro tamaño— y la cabecera cambiaba de
// aspecto según el teléfono. Estos iconos son nuestros y siempre se ven igual.
const OFICIOS = [
  { icono: "balanza", texto: "Extranjería" },
  { icono: "pasaporte", texto: "Visados" },
  { icono: "birrete", texto: "Másteres" },
];

const hrefDe = (id) => {
  const s = getServicio(id);
  return s ? hrefServicio(s) : "/servicios";
};

const RECURSOS = [
  {
    clave: "recurso:mapa",
    img: "/og/mapa-estudiar-en-espana.jpg",
    titulo: "Mapa de universidades y costos de máster",
    texto: "Cuánto cuesta un máster en cada ciudad de España",
    href: interno("/mapa-estudiar-en-espana"),
  },
  {
    clave: "recurso:grado",
    img: "/og/grado-en-espana.jpg",
    titulo: "Grado en España: guía para familias",
    texto: "Cuánto cuesta que tu hijo estudie una carrera",
    href: interno("/grado-en-espana"),
  },
  {
    clave: "recurso:calculadora",
    img: "/og/calculadora-master.jpg",
    titulo: "Calculadora: encuentra gratis tu máster",
    texto: "Másteres oficiales en España según tu perfil",
    href: interno("/calculadora-master"),
  },
  {
    clave: "recurso:visa-o-estancia",
    icono: "brujula",
    titulo: "Test: ¿visa o estancia por estudios?",
    texto: "Descubre qué camino te conviene según tu caso",
    href: interno("/visa-o-estancia"),
  },
];

const SERVICIOS = [
  { clave: "servicio:visado", icono: "pasaporte", titulo: "Visado de estudios", texto: "Te acompañamos en todo el trámite", href: interno(hrefDe("visa-estudios")) },
  { clave: "servicio:estancia", icono: "casa", titulo: "Estancia por estudios", texto: "El trámite desde España, paso a paso", href: interno(hrefDe("estancia-estudios")) },
];

// El portal va a /plataforma, como «Mi portal» de la barra inferior sin sesión.
const ENLACES = [
  { clave: "eventos", icono: "microfono", titulo: "Eventos y charlas gratuitas", href: interno("/eventos") },
  { clave: "portal", icono: "movil", titulo: "Mi portal: acceso para asesorados", href: interno("/plataforma") },
  { clave: "web", icono: "globo", titulo: "Nuestra web oficial", href: interno("/") },
];

/**
 * ¿Queda alguna charla por delante?
 *
 * Los eventos declaran la fecha como «2026-10» (mes, cuando el día aún no está
 * anunciado) o «2026-10-15». Vale hasta el final de ese día o de ese mes.
 */
function eventoProximo(ahora = Date.now()) {
  return eventosActivos().some((e) => {
    const [anio, mes, dia] = String(e.fecha || "").split("-").map(Number);
    if (!anio || !mes) return true; // sin fecha aún: se sigue anunciando
    const fin = dia
      ? new Date(anio, mes - 1, dia, 23, 59, 59)
      : new Date(anio, mes, 0, 23, 59, 59);
    return fin.getTime() >= ahora;
  });
}

/**
 * La lista de enlaces por temporada: si ya no hay charla próxima, «Eventos»
 * deja de ocupar el primer sitio y baja al final. No se borra ni se esconde:
 * la página de eventos sigue publicada y enlazada.
 */
function enlacesPorTemporada() {
  if (eventoProximo()) return ENLACES;
  const esEventos = (e) => e.clave === "eventos";
  return [...ENLACES.filter((e) => !esEventos(e)), ...ENLACES.filter(esEventos)];
}

// Para el viaje: aliados externos que la clienta recomienda (17/09/2026). Se
// abren fuera de la web. El seguro va a WhatsApp de StarSeguro con el mensaje
// que pidió Carina; la eSIM, a su enlace de referido de Holafly.
const VIAJE = [
  {
    clave: "aliado:seguro",
    icono: "salud",
    titulo: "Seguro de salud para España",
    texto: "Cotiza tu seguro Adeslas para la visa con StarSeguro",
    // El mensaje sale escrito y es el que da la atención prioritaria: si lo
    // borran, entran como cualquier consulta. Se avisa antes de tocar.
    chip: "Atención prioritaria",
    nota: "Envía este mensaje tal cual: es lo que te da la atención prioritaria.",
    mensaje: MENSAJE_SEGURO,
    href: WHATSAPP_SEGURO,
  },
  {
    clave: "aliado:esim",
    icono: "senal",
    titulo: "eSIM para Europa",
    texto: "Datos en toda Europa desde el aterrizaje, con nuestro enlace de Holafly",
    // El descuento es el gancho: va en grande, no escondido en la frase.
    descuento: "10 %",
    descuentoPie: "de descuento",
    href: "https://holafly.go.link/3pDol",
  },
];

// Solo las opiniones cortas: se citan completas, nunca recortadas.
const OPINIONES = TESTIMONIOS.filter((t) => t.texto.length <= 260);

const REDES = [
  {
    nombre: "Instagram",
    href: "https://instagram.com/inspira_educa_",
    icono: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
        <rect x="3" y="3" width="18" height="18" rx="5" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
  {
    nombre: "TikTok",
    href: "https://tiktok.com/@abogadainternacionalista",
    icono: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
        <path d="M16.6 5.82A4.28 4.28 0 0 1 15.54 3h-3.09v12.4a2.59 2.59 0 1 1-2.59-2.59c.27 0 .53.04.77.12V9.8a5.7 5.7 0 1 0 4.91 5.64V9.01a7.33 7.33 0 0 0 4.3 1.38V7.3a4.3 4.3 0 0 1-3.24-1.48z" />
      </svg>
    ),
  },
  {
    nombre: "Facebook",
    href: "https://www.facebook.com/people/Inspira/61560309818697/",
    icono: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
        <path d="M14 8h3V4h-3a4 4 0 0 0-4 4v2H8v4h2v8h4v-8h3l1-4h-4V8.5a.5.5 0 0 1 .5-.5z" />
      </svg>
    ),
  },
  {
    nombre: "LinkedIn",
    href: "https://www.linkedin.com/company/inspira-educa/",
    icono: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
        <path d="M4.98 3.5A2.5 2.5 0 1 1 5 8.5a2.5 2.5 0 0 1-.02-5zM3 9.5h4V21H3zM10 9.5h3.8v1.6h.05c.53-1 1.84-2.1 3.8-2.1 4.06 0 4.35 2.67 4.35 6.15V21h-4v-5.2c0-1.24-.02-2.84-1.73-2.84-1.73 0-2 1.35-2 2.75V21h-4z" />
      </svg>
    ),
  },
  {
    nombre: "Correo",
    href: "mailto:asesorias@inspira-educa.org",
    icono: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <path d="m3 7 9 6 9-6" />
      </svg>
    ),
  },
];

const ESTILOS = `
/* Hilo de progreso de lectura, arriba del todo. */
.enl-hilo { position: fixed; top: 0; left: 0; right: 0; z-index: 60; height: 3px; pointer-events: none; transform-origin: left; transform: scaleX(var(--p, 0)); background: linear-gradient(90deg, #FA943A, #F9C846 45%, #88C4FC); }
/* Rótulo de sección: el texto entre dos hilos. */
.enl-rotulo { display: flex; align-items: center; justify-content: center; gap: 10px; margin-top: 32px; font-size: 11px; font-weight: 700; letter-spacing: .16em; text-transform: uppercase; color: rgba(255,255,255,.66); }
.enl-rotulo-linea { flex: 1 1 0; max-width: 56px; height: 1px; background: linear-gradient(90deg, transparent, rgba(255,255,255,.3)); }
.enl-rotulo-linea:last-child { background: linear-gradient(90deg, rgba(255,255,255,.3), transparent); }
/* Epígrafe de tarjeta: icono y texto, siempre a la misma altura. */
.enl-epigrafe { display: flex; align-items: center; gap: 7px; font-size: 11px; font-weight: 800; letter-spacing: .14em; text-transform: uppercase; color: #88C4FC; }
/* Lo que hacemos, en la cabecera. */
.enl-oficios { display: flex; flex-wrap: wrap; justify-content: center; gap: 6px; margin: 12px 0 0; padding: 0; list-style: none; }
.enl-oficio { display: inline-flex; align-items: center; gap: 6px; padding: 5px 11px; border-radius: 999px; background: rgba(255,255,255,.08); border: 1px solid rgba(255,255,255,.16); font-size: 11.5px; font-weight: 700; color: rgba(255,255,255,.9); }
.enl-oficio svg { color: #FA943A; }
/* Marca de urgencia: las becas que quedan, el paquete. */
.enl-marca-fuego { display: inline-flex; align-items: center; gap: 5px; font-size: 10px; font-weight: 800; letter-spacing: .05em; text-transform: uppercase; color: #F9C846; }
/* La portada de un recurso que no tiene imagen. */
.enl-recurso-icono { display: flex; aspect-ratio: 1200 / 630; width: 100%; align-items: center; justify-content: center; color: #fff; background: linear-gradient(135deg, rgba(136,196,252,.38), rgba(250,148,58,.38)); }
/* El dedo que desliza, en el pie del carrusel. */
@keyframes enl-desliza { 0%, 70%, 100% { transform: none; } 80% { transform: translateX(5px); } 90% { transform: translateX(1px); } }
.enl-desliza { animation: enl-desliza 3.2s ease-in-out infinite; }
@media (prefers-reduced-motion: reduce) { .enl-desliza { animation: none; } }
.enl-msg { display: block; margin-top: 8px; border-radius: 14px; border: 1px dashed rgba(255,255,255,.28); background: rgba(255,255,255,.06); padding: 8px 10px; }
.enl-msg-texto { display: block; font-size: 11.5px; line-height: 1.45; color: rgba(255,255,255,.8); }
.enl-msg button { display: inline-flex; align-items: center; gap: 5px; margin-top: 6px; border: 0; border-radius: 999px; background: rgba(250,148,58,.22); color: #ffd7ae; font: inherit; font-size: 11px; font-weight: 800; padding: 4px 10px; cursor: pointer; }
.enl-msg button:active { transform: scale(.96); }
.enl-portal-eyebrow { display: flex; align-items: center; gap: 6px; margin: 0; font-size: 11px; font-weight: 800; letter-spacing: .16em; text-transform: uppercase; color: #88C4FC; }
.enl-portal-lema { margin: 4px 0 0; font-family: Fraunces, Merriweather, Georgia, serif; font-style: italic; font-size: 15px; font-weight: 700; color: #FFB066; }
.enl-portal-fila { display: flex; align-items: center; gap: 14px; margin-top: 12px; }
.enl-portal-movil { position: relative; flex: 0 0 auto; width: 104px; height: 208px; border-radius: 18px; overflow: hidden; border: 2px solid rgba(255,255,255,.35); background: #012938; box-shadow: 0 16px 30px -18px rgba(0,0,0,.9); }
.enl-portal-pantalla { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; object-position: top center; opacity: 0; transition: opacity .6s ease; }
.enl-portal-pantalla[data-on="1"] { opacity: 1; }
.enl-portal-texto { min-width: 0; flex: 1; }
.enl-portal-titulo { margin: 0 0 2px; font-size: 15px; font-weight: 800; color: #fff; }
.enl-portal-puntos { display: flex; gap: 6px; margin-top: 10px; }
.enl-portal-puntos button { width: 7px; height: 7px; padding: 0; border: 0; border-radius: 999px; background: rgba(255,255,255,.3); cursor: pointer; transition: width .3s, background-color .3s; }
.enl-portal-puntos button.on { width: 20px; background: #FA943A; }
.enl-portal-cta { display: flex; align-items: center; justify-content: center; gap: 8px; margin-top: 14px; height: 44px; border-radius: 14px; background: rgba(255,255,255,.12); border: 1px solid rgba(255,255,255,.2); color: #fff; font-size: 13.5px; font-weight: 800; text-decoration: none; }
.enl-portal-cta:active { transform: scale(.98); }
@media (prefers-reduced-motion: reduce) { .enl-portal-pantalla { transition: none; } }
/* Tarjetas de la página: cristal sobre el petróleo de la marca, no bloques
   blancos. El blanco recortado sobre el fondo oscuro pesaba y rompía la
   continuidad; el cristal deja ver el fondo y la marca se lee como una sola
   pieza (17/09/2026). */
.enl-tarjeta {
  border-radius: 24px;
  border: 1px solid rgba(255, 255, 255, .14);
  background: linear-gradient(160deg, rgba(255, 255, 255, .13), rgba(255, 255, 255, .06));
  box-shadow: 0 18px 40px -26px rgba(0, 0, 0, .85), inset 0 1px 0 rgba(255, 255, 255, .12);
  backdrop-filter: blur(14px) saturate(1.3);
  -webkit-backdrop-filter: blur(14px) saturate(1.3);
  color: #fff;
}
a.enl-tarjeta { text-decoration: none; transition: transform .25s cubic-bezier(.22,1,.36,1), border-color .25s, background-color .25s; }
@media (hover: hover) and (pointer: fine) {
  a.enl-tarjeta:hover { border-color: rgba(250, 148, 58, .5); transform: translateY(-3px); box-shadow: 0 26px 46px -28px rgba(0, 0, 0, .9), inset 0 1px 0 rgba(255, 255, 255, .16); }
}
a.enl-tarjeta:active { transform: scale(.985); }
.enl-tarjeta-titulo { font-weight: 800; line-height: 1.3; color: #fff; }
.enl-tarjeta-texto { font-size: 12.5px; line-height: 1.45; color: rgba(255, 255, 255, .72); }
/* Placa del icono, el mismo gesto que las píldoras del hero. */
.enl-icono {
  display: grid; place-items: center; width: 44px; height: 44px; flex: 0 0 auto;
  border-radius: 15px; color: #FFC58A;
  background: linear-gradient(145deg, rgba(250, 148, 58, .28), rgba(136, 196, 252, .16));
  border: 1px solid rgba(255, 255, 255, .18);
  transition: transform .3s cubic-bezier(.22,1,.36,1), color .3s, box-shadow .3s;
}
.enl-icono-chico { width: 38px; height: 38px; border-radius: 13px; }
@media (hover: hover) and (pointer: fine) {
  a:hover > .enl-icono { transform: translateY(-2px) scale(1.06); color: #fff; box-shadow: 0 10px 22px -12px rgba(250, 148, 58, .9); }
}
@media (prefers-reduced-motion: reduce) { .enl-icono { transition: none; } }
.enl-chip-prioridad { display: inline-flex; align-items: center; gap: 4px; align-self: flex-start; margin-top: 6px; padding: 3px 9px; border-radius: 999px; background: #FFF3E0; color: #96591a; font-size: 11px; font-weight: 800; letter-spacing: .01em; }
.enl-dcto { display: flex; flex-direction: column; align-items: center; justify-content: center; flex: 0 0 auto; min-width: 74px; padding: 8px 10px; border-radius: 18px; background: linear-gradient(135deg, #FA943A, #e07f22); color: #fff; box-shadow: 0 10px 20px -10px rgba(250,148,58,.8); }
.enl-dcto b { font-size: 22px; font-weight: 900; line-height: 1; letter-spacing: -.02em; }
.enl-dcto small { font-size: 9.5px; font-weight: 700; line-height: 1.15; text-align: center; margin-top: 3px; opacity: .95; }
.enl-numero { display: inline-flex; align-items: center; gap: 8px; margin-top: 12px; padding: 8px 16px 8px 12px; border-radius: 999px; background: rgba(37,211,102,.16); border: 1px solid rgba(37,211,102,.5); color: #fff; font-size: 16px; font-weight: 800; letter-spacing: .01em; text-decoration: none; transition: transform .2s, background-color .2s; }
.enl-numero:hover { background: rgba(37,211,102,.28); }
.enl-numero:active { transform: scale(.96); }
.enl-numero svg { width: 20px; height: 20px; color: #25D366; flex: 0 0 auto; }
.enl-mapa { margin-top: 22px; border-radius: 28px; background: #fff; padding: 12px; box-shadow: 0 30px 60px -30px rgba(0,0,0,.55); }
.enl-mapa-cab { display: flex; align-items: center; gap: 8px; padding: 2px 6px 10px; font-size: 11px; font-weight: 800; letter-spacing: .12em; text-transform: uppercase; color: #013446; }
.enl-mapa-vivo { width: 8px; height: 8px; border-radius: 999px; background: #22c55e; animation: enl-latido 1.6s ease-out infinite; }
.enl-mapa-lienzo { position: relative; overflow: hidden; border-radius: 20px; border: 1px solid #CFE6FD; min-height: 260px; }
.enl-mapa-cargando { display: grid; place-items: center; min-height: 260px; font-size: 13px; font-weight: 700; color: #02506b; }
.enl-mapa-previa { background: #e8f3fd; }
.enl-mapa-previa img { display: block; width: 100%; height: 260px; object-fit: cover; }
.enl-mapa-rotulo { position: absolute; left: 10px; right: 10px; bottom: 10px; display: flex; flex-direction: column; gap: 1px; padding: 10px 12px; border-radius: 16px; background: rgba(1,52,70,.92); color: #fff; box-shadow: 0 12px 30px -12px rgba(1,41,56,.7); backdrop-filter: blur(6px); animation: enl-sube .45s cubic-bezier(.22,1,.36,1) both; pointer-events: none; }
.enl-mapa-rotulo small { font-size: 10px; font-weight: 800; letter-spacing: .12em; text-transform: uppercase; color: #ffb066; }
.enl-mapa-rotulo b { font-size: 16px; line-height: 1.25; }
.enl-mapa-rotulo span { font-size: 12.5px; color: rgba(255,255,255,.8); }
.enl-mapa-puntos { display: flex; justify-content: center; gap: 6px; padding: 10px 0 4px; }
.enl-mapa-puntos button { width: 7px; height: 7px; padding: 0; border: 0; border-radius: 999px; background: #CFE6FD; cursor: pointer; transition: width .3s, background-color .3s; }
.enl-mapa-puntos button.on { width: 20px; background: #FA943A; }
.enl-mapa-cta { margin-top: 6px; width: 100%; display: flex; align-items: center; justify-content: center; gap: 8px; height: 48px; border: 0; border-radius: 16px; background: linear-gradient(135deg, #FA943A, #e07f22); color: #fff; font: inherit; font-weight: 800; font-size: 14px; cursor: pointer; box-shadow: 0 12px 24px -10px rgba(250,148,58,.7); transition: transform .2s; }
.enl-mapa-cta:active { transform: scale(.97); }
@media (prefers-reduced-motion: reduce) { .enl-mapa-vivo, .enl-mapa-rotulo { animation: none; } }
@keyframes enl-sube { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: none; } }
@keyframes enl-aparece { from { opacity: 0; } to { opacity: 1; } }
@keyframes enl-barrido { 0%, 60% { transform: translateX(-120%); } 100% { transform: translateX(120%); } }
@keyframes enl-gira { to { transform: rotate(360deg); } }
@keyframes enl-fondo { from { background-position: 0% 0%, 0% 50%; } to { background-position: 0% 0%, 100% 50%; } }
@keyframes enl-latido { 0% { box-shadow: 0 0 0 0 rgba(74, 222, 128, .7); } 100% { box-shadow: 0 0 0 9px rgba(74, 222, 128, 0); } }
.enl-fondo {
  background:
    radial-gradient(900px 520px at 85% -8%, rgba(27, 141, 181, .85) 0%, transparent 60%),
    linear-gradient(135deg, #013446, #02506B, #0A5873, #013446);
  background-size: auto, 300% 300%;
  animation: enl-fondo 16s ease-in-out infinite alternate;
}
/* .enl-sube ya no anima nada: desde el 17/09/2026 la entrada la manda
   data-revelar (styles/movimiento.css), que espera a que el bloque asome. La
   clase se queda porque marca los bloques que entran y la usa el barrido de
   lib/revelar. El @keyframes enl-sube sigue vivo: lo usa el rótulo del mapa. */
.enl-aparece { animation: enl-aparece .5s ease both; }
.enl-brillo { position: relative; overflow: hidden; }
.enl-brillo::after { content: ""; position: absolute; inset: 0; pointer-events: none; background: linear-gradient(110deg, transparent 30%, rgba(255, 255, 255, .45) 50%, transparent 70%); transform: translateX(-120%); animation: enl-barrido 3.8s ease-in-out infinite; }
.enl-vidrio { border: 1px solid transparent; background: linear-gradient(160deg, rgba(255, 255, 255, .14), rgba(255, 255, 255, .05)) padding-box, linear-gradient(135deg, rgba(255, 255, 255, .45), rgba(255, 255, 255, .06) 45%, rgba(250, 148, 58, .5)) border-box; }
.enl-anillo { position: relative; isolation: isolate; }
.enl-anillo::before { content: ""; position: absolute; inset: -5px; z-index: -1; border-radius: 9999px; background: conic-gradient(#FA943A, #96CCFC, #FFC940, #FA943A); animation: enl-gira 6s linear infinite; }
.enl-latido { animation: enl-latido 1.6s ease-out infinite; }
.enl-carrusel { scroll-snap-type: x mandatory; scrollbar-width: none; }
.enl-carrusel::-webkit-scrollbar { display: none; }
.enl-carrusel > * { scroll-snap-align: start; }
@media (prefers-reduced-motion: reduce) {
  .enl-fondo, .enl-aparece, .enl-anillo::before, .enl-latido { animation: none; }
  .enl-brillo::after { display: none; }
}
`;

function Flecha({ className = "" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className={`h-4 w-4 shrink-0 ${className}`} aria-hidden="true">
      <path d="m9 6 6 6-6 6" />
    </svg>
  );
}

/**
 * Hilo de progreso de lectura.
 *
 * La página es larga y aquí no hay cabecera ni barra que diga por dónde vas.
 * Este hilo de tres píxeles lo dice sin robar sitio. Va al <body> con un portal
 * porque el contenedor de página de App.jsx lleva `transform`, y eso ancla lo
 * `fixed` a la página en vez de a la pantalla (el mismo motivo que el botón
 * flotante de WhatsApp). El avance se escribe en una variable CSS desde un
 * listener pasivo: React no vuelve a pintar en cada scroll.
 */
function HiloProgreso() {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    let pendiente = 0;
    const medir = () => {
      pendiente = 0;
      const recorrido = document.documentElement.scrollHeight - window.innerHeight;
      el.style.setProperty("--p", recorrido > 40 ? String(Math.min(1, window.scrollY / recorrido)) : "0");
    };
    const alDesplazar = () => {
      if (!pendiente) pendiente = requestAnimationFrame(medir);
    };
    medir();
    window.addEventListener("scroll", alDesplazar, { passive: true });
    window.addEventListener("resize", alDesplazar);
    return () => {
      if (pendiente) cancelAnimationFrame(pendiente);
      window.removeEventListener("scroll", alDesplazar);
      window.removeEventListener("resize", alDesplazar);
    };
  }, []);
  return createPortal(<div ref={ref} className="enl-hilo" aria-hidden="true" />, document.body);
}

function Rotulo({ icono, children }) {
  return (
    <p data-revelar="suave" className="enl-rotulo">
      <span className="enl-rotulo-linea" aria-hidden="true" />
      {icono && <Icono nombre={icono} size={14} className="text-sun" />}
      {children}
      <span className="enl-rotulo-linea" aria-hidden="true" />
    </p>
  );
}

const dias = (n) => `${n} ${n === 1 ? "día" : "días"}`;

/**
 * Estado de la beca y cuántos días faltan.
 *
 * La hora se lee en un efecto y no al pintar: leer el reloj durante el render
 * es impuro (lo avisa el compilador de React) y, además, así la cuenta atrás
 * se actualiza sola si la pestaña se queda abierta.
 */
function useBeca() {
  const [ahora, setAhora] = useState(() => Date.now());
  useEffect(() => {
    const t = setInterval(() => setAhora(Date.now()), 60000);
    return () => clearInterval(t);
  }, []);
  const est = estadoPostulacion();
  const faltan = est.objetivo ? Math.max(0, Math.ceil((est.objetivo - ahora) / 86400000)) : 0;
  const estado =
    est.fase === "antes" ? `Abre en ${dias(faltan)}` : est.fase === "abierta" ? `Abierta · cierra en ${dias(faltan)}` : "Postulación cerrada";
  return { est, faltan, estado };
}

/**
 * La beca, debajo del mapa: un botón con vista previa (17/09/2026).
 *
 * El bloque grande empujaba todo lo demás hacia abajo. Aquí solo va la imagen
 * pequeña, el titular y el estado de la convocatoria; quien quiera, entra.
 */
function BotonBeca({ style }) {
  const { estado } = useBeca();
  return (
    <a
      data-wa="beca"
      href={BECA}
      onClick={() => marcar("beca:boton")}
      data-revelar className="enl-sube enl-tarjeta mt-3 flex items-center gap-3 overflow-hidden p-2.5"
      style={style}
    >
      <img
        src="/og/beca-generacion-bicentenario-2026.jpg"
        alt=""
        className="h-16 w-24 shrink-0 rounded-2xl object-cover"
        loading="lazy"
        decoding="async"
      />
      <span className="flex min-w-0 flex-1 flex-col">
        <span className="enl-marca-fuego">
          <Icono nombre="llama" size={12} aria-hidden="true" /> Solo {CIFRAS.total} becas
        </span>
        <span className="enl-tarjeta-titulo">Beca Generación del Bicentenario</span>
        <span className="enl-tarjeta-texto">{estado}</span>
      </span>
      <Flecha className="mr-1 shrink-0 text-white opacity-60" />
    </a>
  );
}

function BannerBeca({ style }) {
  const { estado: vivo } = useBeca();
  return (
    <section data-wa="beca" aria-label="Beca Generación del Bicentenario 2026" data-revelar className="enl-sube mt-6 overflow-hidden rounded-3xl bg-primary-dark shadow-2xl ring-1 ring-white/15" style={style}>
      <a href={BECA} onClick={() => marcar("beca:imagen")} className="block">
        <img
          src="/og/beca-generacion-bicentenario-2026.jpg"
          alt="Beca Generación del Bicentenario 2026: solo 20 becas"
          className="aspect-[1200/630] w-full object-cover"
          decoding="async"
        />
      </a>
      <div className="p-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-accent px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wide text-primary-dark">
            <Icono nombre="llama" size={12} aria-hidden="true" /> Solo {CIFRAS.total} becas
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-1 text-[11px] font-bold text-white ring-1 ring-white/20">
            <span className="enl-latido h-2 w-2 rounded-full bg-green-400" aria-hidden="true" />
            {vivo}
          </span>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-2">
          <a
            href={`${BECA}#simulador`}
            onClick={() => marcar("beca:simulador")}
            className="enl-brillo flex items-center justify-center gap-1.5 rounded-xl bg-accent px-2 py-3 text-sm font-extrabold text-primary-dark shadow-lg shadow-accent/30 transition hover:bg-sun active:scale-[.98]"
          >
            <Icono nombre="diana" size={17} /> Calcula tu puntaje
          </a>
          <a
            href={`${BECA}#aviso`}
            onClick={() => marcar("beca:aviso")}
            className="flex items-center justify-center gap-1.5 rounded-xl bg-white px-2 py-3 text-sm font-extrabold text-primary transition hover:bg-secondary-light active:scale-[.98]"
          >
            <Icono nombre="campana" size={17} /> Avísame
          </a>
        </div>
      </div>
    </section>
  );
}

/**
 * El mensaje que da la atención prioritaria, a la vista y copiable.
 *
 * WhatsApp lo lleva ya escrito, pero mucha gente lo borra antes de enviar sin
 * saber que es justo lo que le abre la puerta. Aquí se lee antes de tocar y se
 * puede copiar para pegarlo si hiciera falta.
 */
function MensajeParaCopiar({ texto, clave }) {
  const [copiado, setCopiado] = useState(false);
  return (
    <span className="enl-msg">
      <span className="enl-msg-texto">«{texto}»</span>
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          marcar(`${clave}:copiar`);
          navigator.clipboard?.writeText(texto).then(() => setCopiado(true), () => setCopiado(false));
        }}
      >
        <Icono nombre={copiado ? "check" : "copiar"} size={12} aria-hidden="true" />
        {copiado ? "Copiado" : "Copiar mensaje"}
      </button>
    </span>
  );
}

function ReservaAsesoria({ style }) {
  // Una sola asesoría (clienta, 17/09/2026): la de 30 minutos. Tres precios a
  // elegir distraían de lo único que se reserva desde aquí. Las demás siguen
  // en la web y en Calendly; aquí no se ofrecen.
  const actual = OPCIONES_ASESORIA.find((o) => o.destacada) || OPCIONES_ASESORIA[0];
  if (!actual) return null;
  return (
    <section data-wa="reserva" aria-label="Reserva tu asesoría" data-revelar className="enl-sube enl-tarjeta mt-3 p-4" style={style}>
      <p className="enl-epigrafe">
        <Icono nombre="calendario" size={13} /> Reserva tu asesoría · online
      </p>
      <div className="mt-2 flex items-end justify-between gap-3">
        <div className="min-w-0">
          <p className="enl-tarjeta-titulo text-[15px]">{actual.nombre}</p>
          <p className="enl-tarjeta-texto">{actual.duracion} · con un abogado especialista</p>
        </div>
        <p className="shrink-0 text-right">
          <span className="block font-fraunces text-2xl font-bold leading-none text-white">{actual.precio}</span>
          <span className="block text-[11px] font-semibold text-white/60">{actual.precioAlt}</span>
        </p>
      </div>
      <a
        href={actual.url || CALENDLY_URL}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => marcar(`reserva:${actual.id}`)}
        className="enl-brillo mov-toque mt-3 flex items-center justify-center gap-2 rounded-xl bg-accent px-4 py-3.5 text-sm font-extrabold text-primary-dark shadow-lg shadow-accent/25 transition hover:bg-sun"
      >
        <Icono nombre="calendario" size={17} /> Reservar ahora
      </a>
    </section>
  );
}

function Opiniones({ style }) {
  const [i, setI] = useState(0);
  useEffect(() => {
    if (OPINIONES.length < 2) return undefined;
    const t = setInterval(() => setI((n) => (n + 1) % OPINIONES.length), 7000);
    return () => clearInterval(t);
  }, []);
  const o = OPINIONES[i];
  if (!o) return null;
  return (
    <section data-wa="opiniones" aria-label="Opiniones de asesorados" data-revelar className="enl-sube enl-tarjeta mt-6 p-4" style={style}>
      <p className="enl-epigrafe">
        <Icono nombre="chat" size={13} /> Lo que dicen nuestros asesorados
      </p>
      <div key={i} className="enl-aparece mt-2 min-h-[7.5rem]">
        <p className="flex gap-1 text-accent" aria-label={`${o.estrellas} de 5 estrellas`}>
          {Array.from({ length: o.estrellas }, (_, n) => (
            <Icono key={n} nombre="estrella" size={15} />
          ))}
        </p>
        <blockquote className="mt-2 text-sm leading-relaxed text-white/90">“{o.texto}”</blockquote>
        <p className="mt-2 text-xs font-bold text-white">
          {o.nombre} <span className="font-semibold text-white/55">· {o.servicio} · opinión publicada en {o.fuente}</span>
        </p>
      </div>
      <div className="mt-3 flex items-center justify-between gap-3">
        <div className="flex gap-1.5">
          {OPINIONES.map((op, n) => (
            <button
              key={op.nombre}
              type="button"
              onClick={() => setI(n)}
              aria-label={`Ver la opinión de ${op.nombre}`}
              className={`h-2 rounded-full transition-all ${n === i ? "w-5 bg-accent" : "w-2 bg-white/30"}`}
            />
          ))}
        </div>
        <a
          href={interno("/casos-de-exito")}
          onClick={() => marcar("opiniones")}
          className="flex items-center gap-1 text-xs font-extrabold text-sky underline underline-offset-4"
        >
          Opiniones y casos de éxito <Flecha />
        </a>
      </div>
    </section>
  );
}

function Contacto({ style }) {
  return (
    <section data-wa="contacto" aria-label="Contacto" data-revelar className="enl-sube enl-vidrio mt-6 rounded-3xl p-4 text-center text-white" style={style}>
      <p className="enl-epigrafe justify-center">
        <Icono nombre="telefono" size={13} /> Equipo Perú · España
      </p>
      <p className="mt-1 font-fraunces text-2xl font-bold tabular-nums">{NUMERO}</p>
      <div className="mt-3 grid grid-cols-2 gap-2">
        <a
          href={WHATSAPP_INSPIRA}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => marcar("contacto:whatsapp")}
          className="flex items-center justify-center gap-2 rounded-xl bg-green-600 px-3 py-3 text-sm font-extrabold text-white shadow-lg shadow-black/20 transition hover:bg-green-700 active:scale-[.98]"
        >
          <Icono nombre="whatsapp" size={18} /> WhatsApp
        </a>
        <a
          href={TEL}
          onClick={() => marcar("contacto:llamar")}
          className="flex items-center justify-center gap-2 rounded-xl bg-white px-3 py-3 text-sm font-extrabold text-primary shadow-lg shadow-black/20 transition hover:bg-secondary-light active:scale-[.98]"
        >
          <Icono nombre="telefono" size={17} /> Llamar
        </a>
      </div>
      <a
        href="/contacto/inspira-legal.vcf"
        type="text/vcard"
        onClick={() => marcar("contacto:guardar")}
        className="mt-2 flex items-center justify-center gap-2 rounded-xl bg-white/10 px-3 py-2.5 text-sm font-bold text-white ring-1 ring-white/25 transition hover:bg-white/20 active:scale-[.98]"
      >
        <Icono nombre="usuario-mas" size={17} /> Guardar contacto en mi celular
      </a>
    </section>
  );
}

function Carrusel({ style }) {
  const ref = useRef(null);
  const [activo, setActivo] = useState(0);
  const alDesplazar = () => {
    const el = ref.current;
    const primero = el?.firstElementChild;
    if (!el || !primero) return;
    const paso = primero.getBoundingClientRect().width + 12;
    setActivo(Math.min(RECURSOS.length - 1, Math.round(el.scrollLeft / paso)));
  };
  const ir = (i) => {
    const el = ref.current;
    const hijo = el?.children[i];
    if (el && hijo) el.scrollTo({ left: hijo.offsetLeft - el.offsetLeft - 16, behavior: "smooth" });
  };
  return (
    <div data-wa="recursos" data-revelar className="enl-sube" style={style}>
      <div ref={ref} onScroll={alDesplazar} className="enl-carrusel relative -mx-4 flex gap-3 overflow-x-auto px-4 pb-2" style={{ scrollPaddingLeft: "1rem" }}>
        {RECURSOS.map((r, i) => (
          <a
            key={r.titulo}
            href={r.href}
            onClick={() => marcar(r.clave)}
            className="enl-vidrio flex w-[78%] shrink-0 flex-col overflow-hidden rounded-3xl text-white transition active:scale-[.98] sm:w-[70%]"
          >
            {r.img ? (
              <img src={r.img} alt="" className="aspect-[1200/630] w-full object-cover" loading={i === 0 ? "eager" : "lazy"} decoding="async" />
            ) : (
              <span className="enl-recurso-icono" aria-hidden="true">
                <Icono nombre={r.icono} size={58} strokeWidth={1.3} />
              </span>
            )}
            <span className="flex flex-1 flex-col p-3.5">
              <span className="font-extrabold leading-snug">{r.titulo}</span>
              <span className="mt-1 text-xs leading-snug text-white/75">{r.texto}</span>
              <span className="mt-auto flex items-center gap-1 pt-2 text-xs font-bold text-sun">
                Ver gratis <Flecha />
              </span>
            </span>
          </a>
        ))}
      </div>
      <div className="mt-2 flex items-center justify-center gap-2">
        {RECURSOS.map((r, i) => (
          <button
            key={r.titulo}
            type="button"
            onClick={() => ir(i)}
            aria-label={`Ver ${r.titulo}`}
            className={`h-2 rounded-full transition-all ${i === activo ? "w-6 bg-accent" : "w-2 bg-white/35"}`}
          />
        ))}
        <span className="ml-2 inline-flex items-center gap-1.5 text-[11px] font-semibold text-white/60">
          <Icono nombre="toque" size={13} className="enl-desliza" aria-hidden="true" /> Desliza
        </span>
      </div>
    </div>
  );
}

/**
 * La muestra del mapa, solo cuando hace falta.
 *
 * El mapa de verdad son un trozo de JavaScript aparte y una llamada a
 * /api/mapa, y hasta hoy se pedían nada más entrar, aunque la visita durase
 * dos segundos. Ahora se piden cuando el bloque está a punto de verse
 * (IntersectionObserver, 200 px antes) y con la página ya pintada, o al primer
 * scroll. Mientras tanto se ve la imagen de /og con el mismo alto que el
 * lienzo del mapa, así que no salta el diseño.
 *
 * Con «ahorro de datos» (navigator.connection.saveData) no se descarga sola:
 * el botón del marcador la trae. Con ?ver=mapa (`abrirYa`) no hay espera:
 * quien llega por ese enlace viene justamente a ver el mapa.
 */
function MapaDiferido({ abrirYa, comunidad, onAbrir }) {
  const [cargar, setCargar] = useState(Boolean(abrirYa));
  const marco = useRef(null);

  useEffect(() => {
    if (cargar) return undefined;
    const pedir = () => setCargar(true);
    const ocioso = "requestIdleCallback" in window;
    let obs = null;
    let id = null;
    const mirar = () => {
      if (!marco.current || typeof IntersectionObserver !== "function") { pedir(); return; }
      obs = new IntersectionObserver(
        (entradas) => { if (entradas.some((e) => e.isIntersecting)) pedir(); },
        { rootMargin: "200px" }
      );
      obs.observe(marco.current);
    };
    if (!navigator.connection?.saveData) {
      // En tiempo ocioso: ni el trozo ni /api/mapa compiten con el primer pintado.
      id = ocioso ? window.requestIdleCallback(mirar, { timeout: 2500 }) : setTimeout(mirar, 1200);
      window.addEventListener("scroll", pedir, { once: true, passive: true });
    }
    return () => {
      if (id !== null) { if (ocioso) window.cancelIdleCallback(id); else clearTimeout(id); }
      obs?.disconnect();
      window.removeEventListener("scroll", pedir);
    };
  }, [cargar]);

  if (cargar) {
    return (
      <Suspense fallback={<div className="enl-mapa"><div className="enl-mapa-lienzo enl-mapa-cargando">Cargando el mapa…</div></div>}>
        <MuestraMapa onAbrir={onAbrir} comunidadInicial={comunidad} avanceAuto={!abrirYa} />
      </Suspense>
    );
  }

  return (
    <section ref={marco} aria-label="Mapa de costos de máster" className="enl-mapa">
      <div className="enl-mapa-cab">
        <span className="enl-mapa-vivo" aria-hidden="true" />
        <span>Mapa de costos de máster · en vivo</span>
      </div>
      <div className="enl-mapa-lienzo enl-mapa-previa">
        <img
          src="/og/mapa-estudiar-en-espana.jpg"
          alt="Mapa de universidades y costos de máster en España"
          width="1200"
          height="630"
          decoding="async"
        />
      </div>
      <button type="button" className="enl-mapa-cta" onClick={() => setCargar(true)}>
        Ver el mapa en vivo
        <Icono nombre="flecha" size={16} strokeWidth={2.4} />
      </button>
    </section>
  );
}

export default function Enlaces() {
  useEffect(() => {
    document.title = "Inspira Legal · Enlaces";
    // Fondo azul también al estirar la página en iOS (rebote del scroll). El
    // hueco de la barra inferior se quita aparte (.sin-relleno-barra en v4.css).
    const previo = document.body.style.backgroundColor;
    document.body.style.backgroundColor = "#013446";
    return () => {
      document.body.style.backgroundColor = previo;
    };
  }, []);

  // Enlace profundo desde los vídeos del mapa:
  // /enlaces?ver=mapa&comunidad=galicia. Se lee una sola vez; sin parámetros,
  // la página se comporta exactamente igual que antes.
  const profundo = useMemo(() => {
    const q = new URLSearchParams(window.location.search);
    return { verMapa: q.get("ver") === "mapa", comunidad: q.get("comunidad") || null };
  }, []);

  const refPagina = useRef(null);
  const refMapa = useRef(null);
  const [bloque, setBloque] = useState("general");

  // Con ?ver=mapa la página arranca en el mapa, no en la cabecera.
  useEffect(() => {
    if (!profundo.verMapa || !refMapa.current) return undefined;
    const quieto = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    refMapa.current.scrollIntoView({ behavior: quieto ? "auto" : "smooth", block: "start" });
    return undefined;
  }, [profundo.verMapa]);

  // Qué bloque se está mirando: de ahí sale el saludo del botón de WhatsApp.
  useEffect(() => {
    const raiz = refPagina.current;
    if (!raiz || typeof IntersectionObserver !== "function") return undefined;
    const vistos = new Map();
    const obs = new IntersectionObserver(
      (entradas) => {
        entradas.forEach((e) => vistos.set(e.target.dataset.wa, e.intersectionRatio));
        let mejor = "general";
        let max = 0;
        vistos.forEach((ratio, clave) => {
          if (ratio > max) { max = ratio; mejor = clave; }
        });
        setBloque(max > 0 ? mejor : "general");
      },
      { threshold: [0, 0.25, 0.5, 0.75, 1] }
    );
    raiz.querySelectorAll("[data-wa]").forEach((n) => obs.observe(n));
    return () => obs.disconnect();
  }, []);

  // Orden por temporada: la beca sube al primer sitio mientras la postulación
  // está abierta, se queda en su hueco de siempre antes de que abra y baja al
  // final cuando cierra (el bloque sigue enlazando la página, que publica los
  // resultados el 15/12/2026).
  const faseBeca = estadoPostulacion().fase;

  // Cada bloque entra cuando asoma. Se vuelve a barrer si cambia la temporada
  // de la beca, porque entonces aparece (o desaparece) su bloque grande.
  useRevelar(refPagina, [faseBeca]);

  return (
    <>
    <HiloProgreso />
    <main className="enl-fondo min-h-[100dvh] w-full px-4 pb-28 pt-10 [overflow-x:clip]">
      <style>{ESTILOS}</style>
      <div ref={refPagina} className="mx-auto w-full max-w-md">
        <header data-revelar className="enl-sube flex flex-col items-center text-center">
          <span className="enl-anillo flex h-24 w-24 items-center justify-center rounded-full">
            <span className="flex h-full w-full items-center justify-center rounded-full bg-white shadow-2xl">
              <img src={logo} alt="Inspira Legal" className="h-auto w-[76%]" />
            </span>
          </span>
          <h1 className="mt-4 font-fraunces text-2xl font-bold text-white">Inspira Legal</h1>
          <p className="mt-1 text-sm font-semibold text-sky">@inspira_educa</p>
          <p className="mt-3 max-w-xs text-sm leading-relaxed text-white/85">
            Te acompañamos hasta que resides legalmente en España.
          </p>
          <ul className="enl-oficios" aria-label="Lo que hacemos">
            {OFICIOS.map((o, i) => (
              <li key={o.texto} className="enl-oficio" style={{ "--r": `${i * 90}ms` }} data-revelar="escala">
                <Icono nombre={o.icono} size={14} />
                {o.texto}
              </li>
            ))}
          </ul>
          {/* El número, escrito y a un toque: es lo que más piden desde la
              biografía, y así se ve sin bajar ni abrir nada (17/09/2026). */}
          <a
            href={WHATSAPP_INSPIRA}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => marcar("whatsapp:cabecera")}
            className="enl-numero"
          >
            <svg viewBox="0 0 32 32" fill="currentColor" aria-hidden="true">
              <path d="M16.04 3C8.86 3 3.04 8.8 3.04 15.96c0 2.29.6 4.52 1.74 6.49L3 29l6.72-1.76a13 13 0 0 0 6.32 1.61h.01c7.17 0 13-5.8 13-12.96C29.05 8.8 23.22 3 16.04 3Zm0 23.67h-.01a10.8 10.8 0 0 1-5.5-1.5l-.4-.23-3.99 1.04 1.07-3.88-.26-.4a10.7 10.7 0 0 1-1.65-5.73c0-5.95 4.85-10.79 10.83-10.79 5.97 0 10.82 4.84 10.82 10.79 0 5.95-4.85 10.7-10.91 10.7Zm5.94-8.05c-.33-.16-1.93-.95-2.23-1.06-.3-.11-.52-.16-.73.16-.22.33-.84 1.06-1.03 1.28-.19.22-.38.24-.71.08-.33-.16-1.38-.51-2.63-1.62-.97-.86-1.63-1.93-1.82-2.25-.19-.33-.02-.5.14-.66.15-.15.33-.38.49-.57.16-.19.22-.33.33-.54.11-.22.05-.41-.03-.57-.08-.16-.73-1.76-1-2.41-.27-.63-.54-.55-.73-.56h-.62c-.22 0-.57.08-.87.41-.3.33-1.14 1.11-1.14 2.71 0 1.6 1.17 3.14 1.33 3.36.16.22 2.3 3.5 5.57 4.91.78.34 1.39.54 1.86.69.78.25 1.49.21 2.05.13.63-.09 1.93-.79 2.2-1.55.27-.76.27-1.41.19-1.55-.08-.14-.3-.22-.62-.38Z" />
            </svg>
            {NUMERO}
          </a>
        </header>

        {/* Arriba: el mapa funcionando, para quien llega desde los vídeos del mapa. */}
        <div ref={refMapa} data-wa="mapa" data-revelar className="enl-sube">
          <MapaDiferido
            abrirYa={profundo.verMapa}
            comunidad={profundo.comunidad}
            onAbrir={() => marcar("mapa:muestra")}
          />
        </div>

        {/* La beca, justo debajo del mapa: un botón con vista previa. */}
        <BotonBeca />

        <ReservaAsesoria />

        {/* El portal del asesorado, enseñado: tres pantallas reales (clienta
            ficticia) que se van pasando solas. */}
        <Suspense fallback={<div className="enl-tarjeta mt-3" style={{ height: 300 }} />}>
          <MuestraPortal
           
            href={interno("/plataforma")}
            onAbrir={() => marcar("portal:muestra")}
          />
        </Suspense>

        <Rotulo icono="destello">Servicios, paquetes y más</Rotulo>
        <div data-wa="servicios" data-revelar className="enl-sube mt-3 grid grid-cols-2 gap-3">
          {SERVICIOS.map((s, i) => (
            <a
              key={s.clave}
              href={s.href}
              style={{ "--r": `${i * 80}ms` }}
              onClick={() => marcar(s.clave)}
              className="enl-vidrio flex flex-col rounded-3xl p-3.5 text-white transition hover:bg-white/10 active:scale-[.98]"
            >
              <span className="enl-icono" aria-hidden="true">
                <Icono nombre={s.icono} size={22} />
              </span>
              <span className="mt-2 font-extrabold leading-snug">{s.titulo}</span>
              <span className="mt-0.5 text-xs leading-snug text-white/70">{s.texto}</span>
            </a>
          ))}
        </div>

        <a
          href={interno("/servicios/master")}
          onClick={() => marcar("paquete-master")}
          data-wa="master"
          data-revelar className="enl-sube enl-tarjeta mt-3 flex overflow-hidden"
         
        >
          <img src="/og/master-2027-2028.jpg" alt="" className="w-[42%] shrink-0 object-cover object-left" loading="lazy" decoding="async" />
          <span className="flex min-w-0 flex-1 flex-col justify-center p-3.5 text-white">
            <span className="enl-marca-fuego">
              <Icono nombre="paquete" size={12} aria-hidden="true" /> Paquete Máster
            </span>
            <span className="font-extrabold leading-snug">Postula a tu máster 2027/2028</span>
            <span className="enl-tarjeta-texto mt-1">Paquetes de postulación desde 219 € y pago por etapas</span>
          </span>
        </a>

        <Rotulo icono="maleta">Para tu viaje a España</Rotulo>
        <div data-wa="viaje" className="mt-3 space-y-3">
          {VIAJE.map((v, i) => (
            <a
              key={v.clave}
              href={v.href}
              style={{ "--r": `${i * 80}ms` }}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => marcar(v.clave)}
              data-revelar className="enl-sube enl-tarjeta flex items-start gap-3 px-3.5 py-3.5"
             
            >
              <span className="enl-icono" aria-hidden="true">
                <Icono nombre={v.icono} size={22} />
              </span>
              <span className="flex min-w-0 flex-1 flex-col">
                <span className="enl-tarjeta-titulo">{v.titulo}</span>
                <span className="enl-tarjeta-texto">{v.texto}</span>
                {v.chip && (
                  <span className="enl-chip-prioridad">
                    <Icono nombre="rayo" size={11} aria-hidden="true" /> {v.chip}
                  </span>
                )}
                {v.nota && <span className="mt-1 text-[11px] leading-snug text-white/55">{v.nota}</span>}
                {v.mensaje && <MensajeParaCopiar texto={v.mensaje} clave={v.clave} />}
              </span>
              {v.descuento ? (
                <span className="enl-dcto self-center" aria-hidden="true">
                  <b>{v.descuento}</b>
                  <small>{v.descuentoPie}</small>
                </span>
              ) : (
                <Flecha className="mt-3.5 opacity-60" />
              )}
            </a>
          ))}
        </div>

        <Rotulo icono="regalo">Recursos gratuitos</Rotulo>
        <div className="mt-3">
          <Carrusel />
        </div>

        {/* La beca bajó aquí el 17/09/2026: arriba va la muestra del mapa.
          Este es su sitio mientras la convocatoria aún no abre. */}

        <Opiniones />
        <Contacto />

        {/* Con la convocatoria abierta, además del botón, el bloque grande con
            su cuenta atrás y el simulador. */}
        {faseBeca === "abierta" && <BannerBeca />}

        <nav aria-label="Más enlaces de Inspira" className="mt-6 space-y-3">
          {enlacesPorTemporada().map((e, i) => (
            <a
              key={e.clave}
              href={e.href}
              style={{ "--r": `${i * 80}ms` }}
              onClick={() => marcar(e.clave)}
              data-revelar className="enl-sube enl-tarjeta flex items-center gap-3 px-4 py-3.5 font-bold"
             
            >
              <span className="enl-icono enl-icono-chico" aria-hidden="true">
                <Icono nombre={e.icono} size={19} />
              </span>
              <span className="flex-1">{e.titulo}</span>
              <Flecha className="opacity-60" />
            </a>
          ))}
        </nav>

        {/* Cerrada la convocatoria, la beca deja de ocupar sitio arriba y se
          queda aquí abajo, con su enlace intacto. */}
        {faseBeca !== "abierta" && <BannerBeca />}

        <div data-revelar className="enl-sube mt-8 flex justify-center gap-3">
          {REDES.map((r, i) => (
            <a
              key={r.nombre}
              href={r.href}
              style={{ "--r": `${i * 60}ms` }}
              data-revelar="escala"
              target="_blank"
              rel="noopener noreferrer"
              aria-label={r.nombre}
              onClick={() => marcar(`red:${r.nombre.toLowerCase()}`)}
              className="flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white ring-1 ring-white/20 transition hover:bg-white/20 active:scale-95"
            >
              {r.icono}
            </a>
          ))}
        </div>

        <p data-revelar className="enl-sube mt-8 text-center text-xs text-white/55">
          inspira-legal.cloud
        </p>
      </div>

    </main>
      {/* WhatsApp siempre a mano: un toque y se abre el chat con la línea de
        Inspira (17/09/2026), con el detalle del bloque que se está mirando.
        Es el botón común de la web (components/common/WhatsAppFlotante), que
        ya va al <body> con un portal porque el contenedor de página de App.jsx
        tiene `transform` y eso ancla lo `fixed` a la página en vez de a la
        pantalla. Aquí se fuerza —/enlaces está en LANDING_ADS_PATHS, donde no
        sale solo— y se queda a la derecha, que es donde se diseñó y donde no
        hay ni barra inferior ni CTA de asesoría. El relleno de abajo de <main>
        evita que tape el último enlace. */}
      <WhatsAppFlotante
        forzar
        lado="derecha"
        origen="enlaces"
        detalle={DETALLE_WA[bloque] || DETALLE_WA.general}
        clave={`enlaces:${bloque}`}
      />
    </>
  );
}
