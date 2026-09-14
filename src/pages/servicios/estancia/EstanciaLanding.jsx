// /servicios/estancia: la página de la estancia por estudios.
//
// Hasta el 14/09/2026 era un aviso de «Detalle completo próximamente». El
// contenido ya existía en config: la ficha del catálogo (servicios.js,
// `estancia-estudios`: qué incluye, a quién va dirigido, qué no incluye,
// proceso y preguntas) y el paquete con su precio de la fuente única
// (metodo.js, ESTANCIA_ESTUDIOS, el mismo que enseña el test /visa-o-estancia).
// Se pinta con la plantilla de las páginas de servicio más el bloque del
// paquete. El SEO de la ruta sigue en App.jsx (SEO_PAGES).
import ServicioDetalle from "../ServicioDetalle";
import { ESTANCIA_ESTUDIOS } from "../../../config/metodo";

export default function EstanciaLanding() {
  return <ServicioDetalle id="estancia-estudios" paquete={ESTANCIA_ESTUDIOS} />;
}
