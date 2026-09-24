// Las landings de Inspira, en un solo sitio, con el mensaje de WhatsApp que
// las acompaña.
//
// Quien atiende recibe «hola, ya tengo carta de admisión» o «quiero hacer un
// máster» veinte veces al día y cada vez reescribe lo mismo. Aquí está cada
// landing con para quién es, el enlace con su utm y una plantilla lista para
// copiar, con el nombre de la persona y el de quien firma. Formato fijado por
// Marco (24/09/2026): tres líneas, contexto con un dato, un solo enlace y una
// pregunta. Los precios y las cifras salen de config, nunca escritos aquí.
import { useMemo, useState } from "react";
import { Check, Copy, ExternalLink, MessageCircle } from "lucide-react";
import { SESION_DIAGNOSTICO } from "../../../config/metodo";
import { CATEGORIAS_CASOS } from "../../../config/casos";
import { IPREM_REFERENCIA } from "../../../config/costeVida";
import { MATRICULA } from "../../../config/paqueteMaster2027";
import { eur } from "../../../config/paqueteMaster2027Resumen";
import { Pagina, Cabecera, Cuerpo, Seccion, Boton, Chip, Campo } from "../ui";

const BASE = "https://www.inspira-legal.cloud";
const UTM = "utm_source=whatsapp&utm_medium=asesor&utm_campaign=landing";
const enlace = (ruta) => `${BASE}${ruta}${ruta.includes("?") ? "&" : "?"}${UTM}`;

const sesion = `${eur(SESION_DIAGNOSTICO.precio)} · ${SESION_DIAGNOSTICO.duracion}, por Google Meet`;

/** Cada landing: para quién es, el enlace y la plantilla con {nombre} y {asesor}. */
// Mensajes cortos, como los manda Marco: contexto con un dato, un solo
// enlace y una pregunta que obligue a contestar. Los datos salen de config.
const hola = (n, a) => `Hola${n ? ` ${n}` : ""}, soy ${a} de Inspira 👋`;
const admitidos = CATEGORIAS_CASOS.find((c) => c.id === "admitidos-master")?.cifra || "+2.000";
const visas = CATEGORIAS_CASOS.find((c) => c.id === "visas-aprobadas")?.cifra || "+500";
const desdeMatricula = eur(Math.min(...MATRICULA.filas.filter((f) => f.min).map((f) => f.min)));
const ipremAnual = eur(IPREM_REFERENCIA.anual);

/** Cada landing: para quién es, el enlace y la plantilla con {nombre} y {asesor}. */
const LANDINGS = [
  {
    id: "visado",
    ruta: "/visado",
    grupo: "Vender",
    nombre: "Visado de estudios · «Ya tengo carta de admisión»",
    para: "Quien ya tiene admisión y pregunta por el visado. Test visa/estancia, vídeos, opiniones, los tres paquetes, cómo se empieza y el checklist.",
    plantilla: (n, a, url) =>
      `${hola(n, a)} Con la carta de admisión lo que sigue es el visado, y ahí es donde más se deniega: el dinero (${ipremAnual} en cuenta) y el seguro sin copagos.\n` +
      `👉 ${url}\n` +
      `En dos minutos ves si te toca visado o estancia y qué incluye cada paquete. ¿Para qué ciudad es tu admisión?`,
  },
  {
    id: "master",
    ruta: "/master",
    grupo: "Vender",
    nombre: "Máster en España · todo lo que hacemos",
    para: "Quien escribe «quiero hacer un máster». Por qué España, por qué oficial, cuánto cuesta el máster, errores comunes, qué hacemos y cómo; el paquete se cotiza.",
    plantilla: (n, a, url) =>
      `${hola(n, a)} Un máster oficial en una universidad pública española cuesta desde ${desdeMatricula} al año y te deja trabajar 30 horas a la semana.\n` +
      `👉 ${url}\n` +
      `Ahí tienes por qué España, cuánto cuesta y cómo trabajamos. ¿Qué carrera terminaste y en qué te gustaría especializarte?`,
  },
  {
    id: "asesoria",
    ruta: "/reservar",
    grupo: "Vender",
    nombre: "Reservar la sesión diagnóstico",
    para: "Cuando ya contó su caso y toca cerrar: la sesión antes que el paquete.",
    plantilla: (n, a, url) =>
      `${hola(n, a)} Lo siguiente es la sesión diagnóstico (${sesion}): un abogado revisa tu caso y sales con la vía definida y un plan escrito.\n` +
      `👉 ${url}\n` +
      `Reserva el horario que te venga bien. ¿Prefieres esta semana o la próxima?`,
  },
  {
    id: "curso",
    ruta: "/visado",
    grupo: "Vender",
    nombre: "Curso + visado con autorización de trabajo (convenio)",
    para: "Quien pregunta por el curso de la escuela con convenio. El importe del curso no está en la fuente única de precios: revisar antes de enviar.",
    plantilla: (n, a, url) =>
      `${hola(n, a)} El curso con la escuela en convenio cuesta 2.850 €: 10 meses de estudios más la tramitación del visado con autorización de trabajo de 30 horas semanales, en la ciudad que elijas.\n` +
      `👉 ${url}\n` +
      `Empezamos con una sesión diagnóstico (${sesion}) para confirmar que cumples los requisitos. ¿Tienes pasaporte vigente?`,
  },
  {
    id: "estancia",
    ruta: "/servicios/estancia-estudios",
    grupo: "Vender",
    nombre: "Estancia por estudios",
    para: "Quien ya está en España o va a entrar como turista, o a quien le denegaron el visado.",
    plantilla: (n, a, url) =>
      `${hola(n, a)} Si ya estás en España o vas a entrar como turista, tu vía es la estancia por estudios: 100 % telemática y con permiso de trabajo de 30 horas.\n` +
      `👉 ${url}\n` +
      `Ahí ves qué incluye y cómo se presenta. ¿Cuándo empiezan tus clases?`,
  },
  {
    id: "carina",
    ruta: "/carina",
    grupo: "Confianza",
    nombre: "Conoce a Carina (link in bio)",
    para: "Quien viene de TikTok o Instagram y quiere ver quién le va a atender.",
    plantilla: (n, a, url) =>
      `${hola(n, a)} Antes de contarte más, mírame aquí: cómo hablo y a quién hemos llevado hasta el aula (${admitidos} admitidos a máster).\n` +
      `👉 ${url}\n` +
      `¿Qué te gustaría estudiar en España?`,
  },
  {
    id: "casos",
    ruta: "/casos-de-exito",
    grupo: "Confianza",
    nombre: "Casos de éxito y opiniones",
    para: "Cuando dudan de si somos de fiar.",
    plantilla: (n, a, url) =>
      `${hola(n, a)} Te entiendo: es tu dinero y tu año. Este curso llevamos ${admitidos} admisiones a máster y ${visas} visas aprobadas, con nombre y universidad.\n` +
      `👉 ${url}\n` +
      `Míralo con calma. ¿Qué es lo que más te preocupa del proceso?`,
  },
  {
    id: "expediente",
    ruta: "/expediente",
    grupo: "Confianza",
    nombre: "Expediente de ejemplo, papel por papel",
    para: "Quien pregunta «¿y qué papeles son?». Nueve documentos reconstruidos y lo que hace que los rechacen.",
    plantilla: (n, a, url) =>
      `${hola(n, a)} Un expediente de visado aprobado lleva 9 documentos, y cada uno tiene su trampa: la frase exacta del certificado médico, el extracto sellado, la apostilla.\n` +
      `👉 ${url}\n` +
      `Marca los que ya tienes y me escribes con la lista. ¿Cuáles te faltan?`,
  },
  {
    id: "juego",
    ruta: "/te-alcanza",
    grupo: "Ganchos",
    nombre: "Juego: ¿dónde te ves estudiando? (6 cartas)",
    para: "Quien todavía no sabe ciudad. Treinta segundos, sin registro.",
    plantilla: (n, a, url) =>
      `${hola(n, a)} Seis ciudades en treinta segundos: sus universidades, un máster de ejemplo y lo que cuesta la matrícula.\n` +
      `👉 ${url}\n` +
      `¿Con cuáles te quedas?`,
  },
  {
    id: "mapa",
    ruta: "/mapa-estudiar-en-espana",
    grupo: "Ganchos",
    nombre: "Mapa de universidades y costos",
    para: "Quien compara ciudades y precios de matrícula.",
    plantilla: (n, a, url) =>
      `${hola(n, a)} 47 universidades públicas en un mapa, con la matrícula de máster por comunidad y nuestros casos de este curso.\n` +
      `👉 ${url}\n` +
      `¿Qué ciudad te llama más?`,
  },
  {
    id: "calculadora",
    ruta: "/calculadora-master",
    grupo: "Ganchos",
    nombre: "Calculadora del máster",
    para: "Quien pregunta «¿cuánto me va a costar todo?».",
    plantilla: (n, a, url) =>
      `${hola(n, a)} Para tener el número real y no una estimación de TikTok: matrícula, vivir, seguro y paquete, ciudad por ciudad.\n` +
      `👉 ${url}\n` +
      `¿Con qué presupuesto anual cuentas?`,
  },
  {
    id: "test",
    ruta: "/visa-o-estancia",
    grupo: "Ganchos",
    nombre: "Test: ¿visa o estancia?",
    para: "Quien no sabe por qué vía entrar.",
    plantilla: (n, a, url) =>
      `${hola(n, a)} Visado y estancia dan el mismo permiso; cambian dónde se presentan y cómo te piden el dinero.\n` +
      `👉 ${url}\n` +
      `Cinco preguntas y te dice tu vía. ¿Me mandas el resultado?`,
  },
  {
    id: "grado",
    ruta: "/grado-en-espana",
    grupo: "Otros públicos",
    nombre: "Grado en España (familias)",
    para: "Padres y madres que preguntan por una carrera para su hijo o hija.",
    plantilla: (n, a, url) =>
      `${hola(n, a)} Una carrera completa en España, en una guía para familias: costos por ciudad, la PCE y los plazos.\n` +
      `👉 ${url}\n` +
      `¿En qué año está tu hijo o hija?`,
  },
  {
    id: "doctorado",
    ruta: "/doctorado-en-espana",
    grupo: "Otros públicos",
    nombre: "Doctorado en España",
    para: "Quien ya tiene máster y quiere investigar.",
    plantilla: (n, a, url) =>
      `${hola(n, a)} El doctorado en España se paga por tutela anual, que fija cada comunidad, y se entra con el máster.\n` +
      `👉 ${url}\n` +
      `¿Sobre qué te gustaría investigar?`,
  },
  {
    id: "beca",
    ruta: "/beca-generacion-bicentenario-2026",
    grupo: "Otros públicos",
    nombre: "Beca Generación del Bicentenario",
    para: "Quien pregunta por becas del Estado peruano.",
    plantilla: (n, a, url) =>
      `${hola(n, a)} La Beca Generación del Bicentenario es la del Estado peruano para posgrados en el extranjero: requisitos y fechas, aquí.\n` +
      `👉 ${url}\n` +
      `¿Ya revisaste si cumples los requisitos?`,
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
        subtitulo="Cada página pública con su para quién y un mensaje corto listo para copiar: contexto con un dato, un solo enlace y una pregunta. Escribe el nombre de la persona y sale ya puesto."
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
