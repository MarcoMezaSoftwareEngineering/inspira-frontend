// src/components/common/capturasPortal.js
// Capturas del Portal Inspira con datos de ejemplo. El desenfoque está
// horneado en la imagen (no con CSS) para que no se pueda quitar ni copiar el
// detalle: solo queda nítido lo que ilustra el beneficio.
import inicio from "../../assets/images/portal/inicio-movil.webp";
import inicioEscritorio from "../../assets/images/portal/inicio-escritorio.webp";
import masterExpediente from "../../assets/images/portal/master-expediente.webp";
import masterInforme from "../../assets/images/portal/master-informe.webp";
import masterPostulaciones from "../../assets/images/portal/master-postulaciones.webp";
import mensajes from "../../assets/images/portal/mensajes.webp";
import visadoCalculadora from "../../assets/images/portal/visado-calculadora.webp";
import visadoEstado from "../../assets/images/portal/visado-estado.webp";
import estanciaPlazos from "../../assets/images/portal/estancia-plazos.webp";
import estanciaExtranjeria from "../../assets/images/portal/estancia-extranjeria.webp";

// `foco`: object-position para miniaturas recortadas (dónde está lo nítido).
export const CAPTURAS_PORTAL = {
  inicio: { src: inicio, ancho: 420, alto: 909, foco: "50% 45%", alt: "Inicio del portal: lo que te toca hacer hoy, con los datos desenfocados" },
  inicioEscritorio: { src: inicioEscritorio, ancho: 1200, alto: 750, foco: "50% 30%", alt: "Inicio del portal en ordenador, con la lista de «Hoy» y los datos desenfocados" },
  masterExpediente: { src: masterExpediente, ancho: 420, alto: 909, foco: "50% 22%", alt: "Expediente de máster en seis pasos con su avance, con los datos desenfocados" },
  masterInforme: { src: masterInforme, ancho: 420, alto: 697, foco: "50% 30%", alt: "Un máster del informe personalizado con la nota del asesor, con los datos desenfocados" },
  masterPostulaciones: { src: masterPostulaciones, ancho: 420, alto: 909, foco: "50% 38%", alt: "Línea de tiempo de una postulación, con los datos desenfocados" },
  mensajes: { src: mensajes, ancho: 420, alto: 786, foco: "50% 40%", alt: "Mensajes con el asesor con constancia de lectura, con los datos desenfocados" },
  visadoCalculadora: { src: visadoCalculadora, ancho: 420, alto: 909, foco: "50% 45%", alt: "Calculadora de la cantidad que acreditar para el visado, con los datos desenfocados" },
  visadoEstado: { src: visadoEstado, ancho: 420, alto: 909, foco: "50% 40%", alt: "Estado de la visa con un requerimiento y su plazo, con los datos desenfocados" },
  estanciaPlazos: { src: estanciaPlazos, ancho: 420, alto: 909, foco: "50% 60%", alt: "Plazos de la estancia calculados con las fechas del asesorado, con los datos desenfocados" },
  estanciaExtranjeria: { src: estanciaExtranjeria, ancho: 420, alto: 909, foco: "50% 70%", alt: "Comunicaciones de Extranjería en el expediente, con los datos desenfocados" },
};
