// src/components/common/WhatsAppFlotante.jsx
//
// Botón flotante de WhatsApp para toda la web pública (17/09/2026). Nació en
// /enlaces y se saca aquí para tenerlo en una sola pieza: mismo número, mismo
// tono y un saludo distinto según la página desde la que se escribe.
//
// Va al <body> con un portal a propósito: el contenedor de página de App.jsx
// tiene `transform`, y eso ancla lo `fixed` a la página en vez de a la
// pantalla —el botón se quedaba al final del documento, fuera de vista—.
//
// Dónde NO sale: panel del asesorado, backoffice, vuelta de Google (/auth) y
// las landings que ya traen su propia barra de acción fija: /master-2027-2028
// (BarraReserva) y /enlaces, que lo pinta ella misma con `forzar` para darle
// el saludo del bloque que se está mirando.
//
// Sitio: abajo a la izquierda. A la derecha ya están el botón flotante de
// AsesoriaCTA y la pestaña de ReservaLateral, y taparlos sería cambiar una
// llamada por otra. Por abajo se mide el alto real de BarraInferior —que ya
// incluye env(safe-area-inset-bottom) en su relleno— y el botón se coloca
// encima; sin barra (escritorio o landings) se apoya en el borde respetando
// el área segura.
//
// Medición: el mismo evento que usan los botones de /enlaces (ENLACE de
// enviarEventoEmbudo) con un origen_detalle por página, más el evento
// WHATSAPP que lib/analytics saca solo de cualquier clic a wa.me.
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { origenDeRuta, whatsappDesde } from "../../config/contacto";
import { enviarEventoEmbudo } from "../../lib/analytics";
// La hoja se importa aquí y no en un trozo perezoso: App.jsx importa este
// componente de forma estática, así que el CSS viaja en el paquete inicial y
// el botón nunca se pinta sin estilos.
import "../../styles/whatsapp-flotante.css";

// Rutas sin botón: privadas o con su propio CTA fijo abajo.
const SIN_BOTON = [/^\/panel/, /^\/backoffice/, /^\/auth/, /^\/master-2027-2028/, /^\/enlaces/];

// Qué pide la persona según dónde estaba. El «Hola Inspira, vengo de …» lo
// pone `whatsappDesde` con la ruta; esto es la segunda frase. Las claves son
// las de ORIGENES_WHATSAPP (config/contacto.js).
const DETALLES = {
  inicio: "Quiero información para migrar a España.",
  servicios: "Quiero información sobre sus servicios.",
  "servicio-master": "Quiero información del Paquete Máster 2027/2028.",
  "servicio-estancia": "Quiero información sobre la estancia por estudios.",
  servicio: "Quiero información sobre este servicio.",
  ruta: "Quiero información sobre esta ruta para migrar.",
  blog: "Estaba leyendo el blog y quiero información.",
  eventos: "Quiero información sobre la próxima charla gratuita.",
  casos: "Vi sus casos de éxito y quiero información.",
  nosotros: "Quiero información sobre cómo trabajan.",
  plataforma: "Quiero información sobre el Expediente Digital.",
  calculadora: "Usé la calculadora y quiero información.",
  mapa: "Vengo del mapa de costos y quiero información.",
  asistente: "Hice el diagnóstico y quiero información.",
  "visa-o-estancia": "Hice el test y quiero saber qué camino me conviene.",
  "grado-espana": "Quiero información sobre el grado en España para mi hijo o hija.",
  "bicentenario-2026": "Vengo de la beca y quiero información.",
  enlaces: "Quiero información para estudiar en España.",
  web: "Quiero información para estudiar en España.",
};

const DETALLE_GENERAL = "Quiero información para estudiar en España.";

export default function WhatsAppFlotante({
  path,
  origen,
  detalle,
  clave,
  lado = "izquierda",
  forzar = false,
  etiqueta = "WhatsApp",
}) {
  const ruta = path || (typeof window === "undefined" ? "/" : window.location.pathname);
  const [abajo, setAbajo] = useState(null);

  // El alto de la barra inferior no es fijo: crece con el área segura del móvil
  // y desaparece a partir de 1100 px. Se mide de verdad en vez de copiar un
  // número que se quedaría viejo al tocar la barra.
  useEffect(() => {
    const barra = document.querySelector(".barra-inferior");
    // Sin barra (escritorio, landings) el alto es nulo y manda el reserva del
    // área segura que pone la hoja de estilos.
    const medir = () => setAbajo(barra ? barra.getBoundingClientRect().height || null : null);
    medir();
    if (!barra) return undefined;
    const ro = typeof ResizeObserver === "function" ? new ResizeObserver(medir) : null;
    ro?.observe(barra);
    window.addEventListener("resize", medir);
    return () => {
      ro?.disconnect();
      window.removeEventListener("resize", medir);
    };
  }, [ruta]);

  if (typeof document === "undefined") return null;
  if (!forzar && SIN_BOTON.some((r) => r.test(ruta))) return null;

  const claveOrigen = origen || origenDeRuta(ruta);
  const texto = detalle || DETALLES[claveOrigen] || DETALLE_GENERAL;

  return createPortal(
    <a
      href={whatsappDesde(origen || ruta, texto)}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() =>
        enviarEventoEmbudo("ENLACE", { origen_detalle: `whatsapp-flotante:${clave || claveOrigen}` })
      }
      className={`wa-flotante${lado === "derecha" ? " wa-flotante-derecha" : ""}`}
      // El alto medido manda; sin barra, la hoja se apoya en el área segura.
      style={abajo ? { "--wa-abajo": `${Math.round(abajo) + 12}px` } : undefined}
      aria-label="Escríbenos por WhatsApp"
    >
      <svg viewBox="0 0 32 32" fill="currentColor" aria-hidden="true">
        <path d="M16.04 3C8.86 3 3.04 8.8 3.04 15.96c0 2.29.6 4.52 1.74 6.49L3 29l6.72-1.76a13 13 0 0 0 6.32 1.61h.01c7.17 0 13-5.8 13-12.96C29.05 8.8 23.22 3 16.04 3Zm0 23.67h-.01a10.8 10.8 0 0 1-5.5-1.5l-.4-.23-3.99 1.04 1.07-3.88-.26-.4a10.7 10.7 0 0 1-1.65-5.73c0-5.95 4.85-10.79 10.83-10.79 5.97 0 10.82 4.84 10.82 10.79 0 5.95-4.85 10.7-10.91 10.7Zm5.94-8.05c-.33-.16-1.93-.95-2.23-1.06-.3-.11-.52-.16-.73.16-.22.33-.84 1.06-1.03 1.28-.19.22-.38.24-.71.08-.33-.16-1.38-.51-2.63-1.62-.97-.86-1.63-1.93-1.82-2.25-.19-.33-.02-.5.14-.66.15-.15.33-.38.49-.57.16-.19.22-.33.33-.54.11-.22.05-.41-.03-.57-.08-.16-.73-1.76-1-2.41-.27-.63-.54-.55-.73-.56h-.62c-.22 0-.57.08-.87.41-.3.33-1.14 1.11-1.14 2.71 0 1.6 1.17 3.14 1.33 3.36.16.22 2.3 3.5 5.57 4.91.78.34 1.39.54 1.86.69.78.25 1.49.21 2.05.13.63-.09 1.93-.79 2.2-1.55.27-.76.27-1.41.19-1.55-.08-.14-.3-.22-.62-.38Z" />
      </svg>
      <span className="wa-flotante-txt">{etiqueta}</span>
    </a>,
    document.body
  );
}
