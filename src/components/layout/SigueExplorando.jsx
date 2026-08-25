// src/components/layout/SigueExplorando.jsx
// Bloque de salida común: ninguna página termina en un callejón sin salida.
// Se le pasan los destinos relevantes para esa página.
import Icono from "../common/Icono";
import { navigate } from "../../services/navigate";

const go = (e, href) => {
  e.preventDefault();
  navigate(href);
  window.scrollTo({ top: 0, behavior: "instant" });
};

// Catálogo de destinos reutilizables.
export const DESTINOS = {
  estudios: { icono: "birrete", titulo: "Migrar por estudios", texto: "La vía más efectiva: máster, grado o FP.", href: "/ruta/estudios" },
  rapidas: { icono: "maletin", titulo: "Vías rápidas", texto: "Nómada digital, PAC, no lucrativa y doctorado.", href: "/ruta/rapidas" },
  enEspana: { icono: "bandera", titulo: "Ya estoy en España", texto: "Renovaciones, arraigos, nacionalidad y gestiones.", href: "/ruta/en-espana" },
  denegado: { icono: "documento", titulo: "Me denegaron", texto: "Recurso de reposición y plan alternativo.", href: "/ruta/denegado" },
  tramites: { icono: "libro", titulo: "Adelanta trámites", texto: "Homologa tus estudios antes de migrar.", href: "/ruta/tramites" },
  asistente: { icono: "robot", titulo: "Asistente gratuito", texto: "Responde 3 preguntas y sabrás cuál es tu vía.", href: "/asistente", destacado: true },
  inspiragpt: { icono: "chat", titulo: "InspiraGPT", texto: "Chat con IA sobre tus trámites, 30 días por S/ 100.", href: "/asistente-ia", destacado: true },
  calculadora: { icono: "euro", titulo: "Calculadora gratis", texto: "Cuánto cuesta de verdad tu máster en España.", href: "/calculadora-master", destacado: true },
  casos: { icono: "estrella", titulo: "Casos de éxito", texto: "Visas, admisiones y apelaciones ganadas.", href: "/casos-de-exito" },
  eventos: { icono: "calendario", titulo: "Eventos gratuitos", texto: "Estudia en España en 5 pasos, rumbo al 2027.", href: "/eventos" },
  tienda: { icono: "libro", titulo: "Tiendita", texto: "Ebooks, guías y recursos descargables.", href: "/tienda" },
  blog: { icono: "documento", titulo: "Blog", texto: "Guías de extranjería y estudios en España.", href: "/blog" },
  servicios: { icono: "brujula", titulo: "Todos los servicios", texto: "El catálogo completo, trámite por trámite.", href: "/servicios" },
  plataforma: { icono: "laptop", titulo: "Nuestro sistema", texto: "Panel privado, checklist y avisos automáticos.", href: "/plataforma" },
  nosotros: { icono: "usuarios", titulo: "Conoce al equipo", texto: "Los abogados que llevan tu expediente.", href: "/nosotros" },
};

export default function SigueExplorando({
  titulo = "Sigue explorando",
  subtitulo = "Todo lo que necesitas está a un clic.",
  destinos = ["asistente", "calculadora", "servicios", "casos"],
}) {
  return (
    <section className="sigue">
      <div className="sigue-inner">
        <div className="sigue-head">
          <h2>{titulo}</h2>
          <p>{subtitulo}</p>
        </div>
        <div className="sigue-grid">
          {destinos.map((k) => {
            const d = DESTINOS[k];
            if (!d) return null;
            return (
              <a
                key={k}
                href={d.href}
                onClick={(e) => go(e, d.href)}
                className={`sigue-card${d.destacado ? " destacada" : ""}`}
              >
                <span className="sigue-icon">
                  <Icono nombre={d.icono} size={21} />
                </span>
                <b>{d.titulo}</b>
                <small>{d.texto}</small>
                <span className="sigue-arr" aria-hidden>→</span>
              </a>
            );
          })}
        </div>
      </div>
    </section>
  );
}
