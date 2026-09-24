// Las landings de Inspira, en un solo sitio, con el mensaje de WhatsApp que
// las acompaña.
//
// Quien atiende recibe «hola, ya tengo carta de admisión» o «quiero hacer un
// máster» veinte veces al día y cada vez reescribe lo mismo. Aquí está cada
// landing con para quién es, el enlace con su utm y una plantilla lista para
// copiar, con el nombre de la persona y el de quien firma. Las plantillas
// siguen los mensajes que Carina y Jesús ya mandan; los precios salen de la
// fuente única, nunca escritos aquí.
import { useMemo, useState } from "react";
import { Check, Copy, ExternalLink, MessageCircle } from "lucide-react";
import { SESION_DIAGNOSTICO, PLANES_VISADO } from "../../../config/metodo";
import { eur } from "../../../config/paqueteMaster2027Resumen";
import { Pagina, Cabecera, Cuerpo, Seccion, Boton, Chip, Campo } from "../ui";

const BASE = "https://www.inspira-legal.cloud";
const UTM = "utm_source=whatsapp&utm_medium=asesor&utm_campaign=landing";
const enlace = (ruta) => `${BASE}${ruta}${ruta.includes("?") ? "&" : "?"}${UTM}`;

const sesion = `${eur(SESION_DIAGNOSTICO.precio)} · ${SESION_DIAGNOSTICO.duracion}, por Google Meet`;
const integral = PLANES_VISADO.find((p) => p.destacado);

/** Cada landing: para quién es, el enlace y la plantilla con {nombre} y {asesor}. */
const LANDINGS = [
  {
    id: "visado",
    ruta: "/visado",
    grupo: "Vender",
    nombre: "Visado de estudios · «Ya tengo carta de admisión»",
    para: "Quien ya tiene admisión y pregunta por el visado. Test visa/estancia, vídeos, opiniones, los tres paquetes, cómo se empieza y el checklist.",
    plantilla: (n, a, url) =>
      `¡Hola${n ? ` ${n}` : ""}! 😊 Te saluda ${a}, de Inspira Legal.\n\n` +
      `¡Felicitaciones por la carta de admisión! 🎓 Lo que sigue es el visado de estudios, y es justo la parte donde más se deniega: el dinero, el seguro médico y una frase en el certificado médico.\n\n` +
      `Te acompañamos de tres formas, según cuánto quieras que hagamos nosotros:\n` +
      PLANES_VISADO.map((p) => `${p.destacado ? "⭐" : "✔"} ${p.nombre} (${eur(p.precio)}): ${p.subtitulo.toLowerCase()}.`).join("\n") +
      `\n\nLa ${integral.nombre} es la que recomendamos: incluye la cita consular y el recurso si hiciera falta. El pago puede ser al contado o en dos cuotas (la mitad al iniciar y la otra mitad al mes).\n\n` +
      `Antes de cualquier paquete empezamos con una sesión diagnóstico (${sesion}): revisamos tu caso con tus documentos delante y te decimos si cumples los requisitos; si falta algo, te damos alternativas 🇪🇸\n\n` +
      `Puedes ver todo aquí, con un test de dos minutos para saber si te conviene visado o estancia 👉 ${url}\n\n` +
      `Cualquier consulta, con mucho gusto te ayudo 🙌🏻`,
  },
  {
    id: "master",
    ruta: "/master",
    grupo: "Vender",
    nombre: "Máster en España · todo lo que hacemos",
    para: "Quien escribe «quiero hacer un máster». Por qué España, por qué oficial, cuánto cuesta el máster, qué hacemos y cómo, expediente digital, vídeos; el paquete se cotiza.",
    plantilla: (n, a, url) =>
      `¡Hola${n ? ` ${n}` : ""}! 😊 Gracias por contactar a Inspira; te saluda ${a}.\n\n` +
      `Desde Inspira te acompañamos en todo tu proceso hacia España 🇪🇸 con asesoría personalizada en:\n\n` +
      `✈️ Visados y estancias por estudios\n🎓 Homologación de estudios\n📚 Postulación a másteres y universidades\n🛂 Trámites migratorios y académicos en general\n\n` +
      `Para orientarte mejor, cuéntame un poquito sobre ti:\n\n` +
      `📝 ¿Cuál es tu nombre completo?\n🎓 ¿Qué carrera o estudios realizaste? (grado, universidad)\n🛃 ¿Tienes pasaporte vigente?\n📖 ¿Te interesa hacer un máster en España? Si es así, ¿en qué especialidad?\n📦 ¿Estás pensando en migrar pronto?\n\n` +
      `Mientras tanto:\n` +
      `👉 Todo lo que hacemos por ti (por qué España, cuánto cuesta el máster y cómo trabajamos): ${url}\n` +
      `🗺️ ¿Qué ciudad te conviene más? Juega aquí: ${enlace("/te-alcanza")}\n` +
      `💶 ¿Realmente vale tu inversión? Calcúlalo aquí: ${enlace("/master#calculadora")}\n` +
      `🎓 ¿No sabes si calificas a una beca? Mira aquí: ${enlace("/beca-generacion-bicentenario-2026")}\n\n` +
      `¡Espero tus respuestas! ✨🙌🏼`,
  },
  {
    id: "asesoria",
    ruta: "/reservar",
    grupo: "Vender",
    nombre: "Reservar la sesión diagnóstico",
    para: "Cuando ya contó su caso y toca cerrar: la sesión antes que el paquete.",
    plantilla: (n, a, url) =>
      `¡Excelente${n ? `, ${n}` : ""}! 😊\n\n` +
      `Te recomiendo iniciar con la sesión diagnóstico (${sesion}), donde evaluamos tu perfil y te explicamos con claridad los pasos que debes seguir.\n\n` +
      `Es un servicio profesional individualizado: estarás a cargo de una especialista en Derecho Internacional y movilidad académica, con amplia experiencia en trámites hacia España 🇪🇸. Sales con tu vía definida y un plan de acción escrito.\n\n` +
      `Reserva tu horario aquí 👉 ${url}\n\n` +
      `Estamos aquí para ayudarte en todo lo que necesites. ✨🙌🏼\n— ${a}`,
  },
  {
    id: "curso",
    ruta: "/visado",
    grupo: "Vender",
    nombre: "Curso + visado con autorización de trabajo (convenio)",
    para: "Quien pregunta por el curso de la escuela con convenio. Texto de Jesús; el importe del curso no está en la fuente única de precios: revisar antes de enviar.",
    plantilla: (n, a, url) =>
      `Hola${n ? ` ${n}` : ""}, mucho gusto, te saluda ${a} 🙋\n\n` +
      `Perfecto, es un curso que ofrecemos con una escuela con la que tenemos convenio. El costo es de 2.850 € e incluye el pago total de tus estudios por 10 meses, más la tramitación de tu visado con autorización de trabajo por 30 horas semanales, y se puede gestionar para la ciudad que desees 🇪🇸\n\n` +
      `INCLUYE TRAMITACIÓN DE VISADO / ESTANCIA\n` +
      `✔ Asesoramiento y orientación en todo el camino.\n✔ Revisión de papeles para presentar al consulado.\n✔ Solicitud de cita.\n✔ Orientación para la cita de empadronamiento mediante certificado digital.\n✔ Orientación para la toma de huellas mediante tu certificado digital.\n✔ Orientación para el certificado digital.\n✔ Orientación para la cita de entrega del TIE.\n\n` +
      `Si te animas, agendamos una sesión diagnóstico (${sesion}) donde revisamos tu caso y si cumples todos los requisitos para aplicar al visado; si te falta algo, te damos alternativas para iniciar tu proceso 🇪🇸\n\n` +
      `Puedes seguir viendo nuestros paquetes aquí 👉 ${url}\n\nCualquier consulta, con mucho gusto te ayudo 🙌🏻`,
  },
  {
    id: "estancia",
    ruta: "/servicios/estancia-estudios",
    grupo: "Vender",
    nombre: "Estancia por estudios",
    para: "Quien ya está en España o va a entrar como turista, o a quien le denegaron el visado.",
    plantilla: (n, a, url) =>
      `Hola${n ? ` ${n}` : ""}, te saluda ${a} de Inspira 😊\n\nSi ya estás en España (o vas a entrar como turista), tu vía no es el consulado: es la estancia por estudios, 100 % telemática ante Extranjería, con permiso de trabajo de 30 horas.\n\nAquí tienes qué incluye y cómo se presenta 👉 ${url}\n\nEmpezamos con una sesión diagnóstico (${sesion}) para confirmar tus plazos con tus fechas.`,
  },
  {
    id: "carina",
    ruta: "/carina",
    grupo: "Confianza",
    nombre: "Conoce a Carina (link in bio)",
    para: "Quien viene de TikTok o Instagram y quiere ver quién le va a atender.",
    plantilla: (n, a, url) => `Hola${n ? ` ${n}` : ""}, soy ${a} 🙋 Antes de contarte más, mírame aquí: cómo hablo, cómo trabajo y a quién hemos llevado hasta el aula 👉 ${url}`,
  },
  {
    id: "casos",
    ruta: "/casos-de-exito",
    grupo: "Confianza",
    nombre: "Casos de éxito y opiniones",
    para: "Cuando dudan de si somos de fiar.",
    plantilla: (n, a, url) => `${n ? `${n}, ` : ""}te entiendo perfectamente: es tu dinero y tu año. Mira los casos de este curso, con nombre y máster, y las opiniones en Google 👉 ${url}\n— ${a}`,
  },
  {
    id: "expediente",
    ruta: "/expediente",
    grupo: "Confianza",
    nombre: "Expediente de ejemplo, papel por papel",
    para: "Quien pregunta «¿y qué papeles son?». Nueve documentos reconstruidos y lo que hace que los rechacen.",
    plantilla: (n, a, url) => `Hola${n ? ` ${n}` : ""}, para que veas exactamente qué te van a pedir, aquí tienes un expediente de visado aprobado, documento por documento, con los datos tapados 👉 ${url}\nMarca los que ya tienes y me escribes con la lista.\n— ${a}`,
  },
  {
    id: "juego",
    ruta: "/te-alcanza",
    grupo: "Ganchos",
    nombre: "Juego: ¿dónde te ves estudiando? (6 cartas)",
    para: "Quien todavía no sabe ciudad. Treinta segundos, sin registro.",
    plantilla: (n, a, url) => `${n ? `${n}, ` : ""}¿todavía sin ciudad? Seis cartas, treinta segundos: universidades, un máster de ejemplo y lo que cuesta 👉 ${url}\nDime con cuáles te quedaste y te digo cómo se entra. — ${a}`,
  },
  {
    id: "mapa",
    ruta: "/mapa-estudiar-en-espana",
    grupo: "Ganchos",
    nombre: "Mapa de universidades y costos",
    para: "Quien compara ciudades y precios de matrícula.",
    plantilla: (n, a, url) => `${n ? `${n}, ` : ""}aquí tienes el mapa con las 47 universidades públicas, la matrícula de máster por comunidad y nuestros casos de este curso 👉 ${url}\n— ${a}`,
  },
  {
    id: "calculadora",
    ruta: "/calculadora-master",
    grupo: "Ganchos",
    nombre: "Calculadora del máster",
    para: "Quien pregunta «¿cuánto me va a costar todo?».",
    plantilla: (n, a, url) => `${n ? `${n}, ` : ""}para que tengas el número real y no una estimación de TikTok: matrícula, vivir, seguro y el paquete, ciudad por ciudad 👉 ${url}\n— ${a}`,
  },
  {
    id: "test",
    ruta: "/visa-o-estancia",
    grupo: "Ganchos",
    nombre: "Test: ¿visa o estancia?",
    para: "Quien no sabe por qué vía entrar.",
    plantilla: (n, a, url) => `${n ? `${n}, ` : ""}cinco preguntas y te dice qué vía te toca y cuánto dinero tienes que acreditar 👉 ${url}\nMe mandas el resultado y lo vemos. — ${a}`,
  },
  {
    id: "grado",
    ruta: "/grado-en-espana",
    grupo: "Otros públicos",
    nombre: "Grado en España (familias)",
    para: "Padres y madres que preguntan por una carrera para su hijo o hija.",
    plantilla: (n, a, url) => `Hola${n ? ` ${n}` : ""}, te saluda ${a} de Inspira. Para una carrera completa en España, aquí está la guía para familias: costos por ciudad, la PCE y los plazos 👉 ${url}`,
  },
  {
    id: "doctorado",
    ruta: "/doctorado-en-espana",
    grupo: "Otros públicos",
    nombre: "Doctorado en España",
    para: "Quien ya tiene máster y quiere investigar.",
    plantilla: (n, a, url) => `Hola${n ? ` ${n}` : ""}, te saluda ${a}. Aquí tienes cuánto cuesta un doctorado por comunidad y qué programas hay 👉 ${url}`,
  },
  {
    id: "beca",
    ruta: "/beca-generacion-bicentenario-2026",
    grupo: "Otros públicos",
    nombre: "Beca Generación del Bicentenario",
    para: "Quien pregunta por becas del Estado peruano.",
    plantilla: (n, a, url) => `${n ? `${n}, ` : ""}¿no sabes si calificas a una beca? Empieza por esta, con requisitos y fechas 👉 ${url}\n— ${a}`,
  },
  {
    id: "ads",
    ruta: "/master-2027-2028",
    grupo: "Campañas",
    nombre: "Landing de Ads · Paquete Máster 2027/2028",
    para: "Solo para anuncios. Sin cabecera ni pie; no se indexa.",
    plantilla: null,
  },
  {
    id: "enlaces",
    ruta: "/enlaces",
    grupo: "Campañas",
    nombre: "Enlaces de la bio (TikTok / Instagram)",
    para: "La página que va en la biografía de redes.",
    plantilla: null,
  },
];

const GRUPOS = ["Vender", "Confianza", "Ganchos", "Otros públicos", "Campañas"];

async function copiar(texto) {
  try {
    await navigator.clipboard.writeText(texto);
    return true;
  } catch {
    return false;
  }
}

function Tarjeta({ l, nombre, asesor }) {
  const [copiado, setCopiado] = useState(null);
  const url = enlace(l.ruta);
  const mensaje = l.plantilla ? l.plantilla(nombre.trim(), asesor.trim() || "Carina", url) : null;
  const marcar = async (que, texto) => {
    if (await copiar(texto)) {
      setCopiado(que);
      setTimeout(() => setCopiado(null), 1600);
    }
  };
  return (
    <article className="ase-card" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8, flexWrap: "wrap" }}>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 15, fontWeight: 800 }}>{l.nombre}</div>
          <div className="ase-num" style={{ fontSize: 12, color: "#0a5873", marginTop: 2 }}>{BASE}{l.ruta}</div>
        </div>
        <Chip tono={l.plantilla ? "verde" : "gris"}>{l.plantilla ? "con plantilla" : "solo enlace"}</Chip>
      </div>
      <p style={{ margin: 0, fontSize: 12.5, lineHeight: 1.5, color: "var(--muted)" }}>{l.para}</p>
      {mensaje && (
        <pre
          style={{
            margin: 0, padding: 12, borderRadius: 12, background: "#f6fbff", border: "1px solid #dbe9f5",
            fontFamily: "inherit", fontSize: 12.5, lineHeight: 1.5, whiteSpace: "pre-wrap", maxHeight: 220, overflow: "auto",
          }}
        >
          {mensaje}
        </pre>
      )}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <Boton tono="secundario" tam="sm" icono={copiado === "url" ? Check : Copy} onClick={() => marcar("url", url)}>
          {copiado === "url" ? "Enlace copiado" : "Copiar enlace"}
        </Boton>
        {mensaje && (
          <Boton tono="primario" tam="sm" icono={copiado === "msg" ? Check : MessageCircle} onClick={() => marcar("msg", mensaje)}>
            {copiado === "msg" ? "Mensaje copiado" : "Copiar mensaje"}
          </Boton>
        )}
        <a href={url} target="_blank" rel="noopener" className="ase-btn ase-btn-fantasma ase-btn-sm" style={{ textDecoration: "none" }}>
          <ExternalLink strokeWidth={2.2} /> Abrir
        </a>
      </div>
    </article>
  );
}

export default function Landings() {
  const [nombre, setNombre] = useState("");
  const [asesor, setAsesor] = useState("Carina Meza");
  const porGrupo = useMemo(() => GRUPOS.map((g) => [g, LANDINGS.filter((l) => l.grupo === g)]), []);

  return (
    <Pagina>
      <Cabecera
        eyebrow="Herramientas"
        titulo="Landings y mensajes"
        subtitulo="Cada página pública con su para quién, el enlace con utm y el mensaje de WhatsApp listo para copiar. Escribe el nombre de la persona y sale ya puesto."
        volver={{ href: "/backoffice/herramientas", texto: "Herramientas" }}
      />
      <Cuerpo>
        <Seccion titulo="A quién le escribes" subtitulo="Se rellena en todas las plantillas de abajo">
          <div style={{ display: "grid", gap: 12, gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}>
            <Campo etiqueta="Nombre de la persona">
              <input className="ase-input" value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Valeria" />
            </Campo>
            <Campo etiqueta="Quien firma">
              <input className="ase-input" value={asesor} onChange={(e) => setAsesor(e.target.value)} placeholder="Carina Meza" />
            </Campo>
          </div>
        </Seccion>
        {porGrupo.map(([g, lista]) => (
          <Seccion key={g} titulo={g} subtitulo={`${lista.length} ${lista.length === 1 ? "landing" : "landings"}`}>
            <div style={{ display: "grid", gap: 12, gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))" }}>
              {lista.map((l) => (
                <Tarjeta key={l.id} l={l} nombre={nombre} asesor={asesor} />
              ))}
            </div>
          </Seccion>
        ))}
      </Cuerpo>
    </Pagina>
  );
}
