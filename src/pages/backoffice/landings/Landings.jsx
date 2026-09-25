// Las landings de Inspira, en un solo sitio, con el mensaje de WhatsApp que
// las acompaña.
//
// Quien atiende recibe «hola, ya tengo carta de admisión» o «quiero hacer un
// máster» veinte veces al día y cada vez reescribe lo mismo. Aquí está cada
// landing con para quién es, el enlace directo y una plantilla lista para
// copiar, con el nombre de la persona y el de quien firma. Formato fijado por
// Marco (24/09/2026): tres líneas, contexto con un dato, un solo enlace y una
// pregunta. Los precios y las cifras salen de config, nunca escritos aquí.
import { useMemo, useState } from "react";
import { Check, Copy, ExternalLink, MessageCircle } from "lucide-react";
import { SESION_DIAGNOSTICO, PLANES_VISADO } from "../../../config/metodo";
import { CATEGORIAS_CASOS } from "../../../config/casos";
import { IPREM_REFERENCIA } from "../../../config/costeVida";
import { MATRICULA } from "../../../config/paqueteMaster2027";
import { eur } from "../../../config/paqueteMaster2027Resumen";
import { Pagina, Cabecera, Cuerpo, Seccion, Boton, Chip, Campo } from "../ui";

const BASE = "https://www.inspira-legal.cloud";
// Enlace directo, sin utm: WhatsApp muestra la vista previa de la página
// (título, descripción e imagen propias) y la URL queda limpia.
const enlace = (ruta) => `${BASE}${ruta}`;

const sesion = `${eur(SESION_DIAGNOSTICO.precio)} · ${SESION_DIAGNOSTICO.duracion}, por Google Meet`;

/** Cada landing: para quién es, el enlace y la plantilla con {nombre} y {asesor}. */
// Mensajes cortos, como los manda Marco: contexto con un dato, un solo
// enlace y una pregunta que obligue a contestar. Los datos salen de config.
const hola = (n, a) => `Hola${n ? ` ${n}` : ""}, soy ${a} de Inspira 👋`;
const admitidos = CATEGORIAS_CASOS.find((c) => c.id === "admitidos-master")?.cifra || "+2.000";
const visas = CATEGORIAS_CASOS.find((c) => c.id === "visas-aprobadas")?.cifra || "+500";
const desdeMatricula = eur(Math.min(...MATRICULA.filas.filter((f) => f.min).map((f) => f.min)));
const ipremAnual = eur(IPREM_REFERENCIA.anual);
const plan = (id) => PLANES_VISADO.find((p) => p.id === id);
const integral = plan("visado-integral");

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
    ruta: "/estancia",
    grupo: "Vender",
    nombre: "Estancia por estudios · «Ya estoy en España»",
    para: "Quien ya está en España o va a entrar como turista, o a quien le denegaron el visado. Calculadora de plazos, documentos, motivos de denegación, resultados y el paquete.",
    plantilla: (n, a, url) =>
      `${hola(n, a)} Si ya estás en España o vas a entrar como turista, tu vía es la estancia por estudios: se presenta desde aquí, 100 % telemática, dentro de tus 90 días y con permiso de trabajo de 30 horas.\n` +
      `👉 ${url}\n` +
      `Pon ahí tu fecha de entrada y la de clases y te dice hasta cuándo puedes presentar. ¿Cuándo entraste?`,
  },
  {
    id: "paquetes-visado",
    ruta: "/visado#paquetes",
    grupo: "Vender",
    nombre: "Conoce nuestros paquetes de visado",
    para: "Cuando ya sabe que va por visado y pregunta «¿y cuánto cuesta con ustedes?».",
    plantilla: (n, a, url) =>
      `${hola(n, a)} Tres formas de acompañarte con el visado: ${plan("visado-base").nombre} (${eur(plan("visado-base").precio)}), ${plan("visado-parcial").nombre} (${eur(plan("visado-parcial").precio)}) e ${integral.nombre} (${eur(integral.precio)}, con cita consular y recurso incluidos).\n` +
      `👉 ${url}\n` +
      `La ${integral.nombre} es la que recomendamos. ¿Cuál te encaja mejor?`,
  },
  {
    id: "cotizacion-visado",
    ruta: "/visado#como",
    grupo: "Vender",
    nombre: "Después de la sesión · cotización de visado",
    para: "Tras la sesión diagnóstico, cuando toca cerrar el paquete de visado.",
    plantilla: (n, a, url) =>
      `${hola(n, a)} Como hablamos en la sesión, te mando por escrito lo que incluye tu paquete de visado y cómo se paga: al contado o en dos cuotas, la mitad al iniciar y la otra mitad al mes, siempre antes de la cita consular.\n` +
      `👉 ${url}\n` +
      `¿Confirmo y abrimos tu expediente en el portal?`,
  },
  {
    id: "cotizacion-master",
    ruta: "/master#precio",
    grupo: "Vender",
    nombre: "Después de la sesión · cotización de máster",
    para: "Tras la sesión diagnóstico, cuando toca cerrar el paquete de máster.",
    plantilla: (n, a, url) =>
      `${hola(n, a)} Como hablamos en la sesión, te mando la cotización por escrito: a qué comunidades postulamos, qué incluye y las dos cuotas (la mitad al iniciar y la otra mitad a los dos meses). El plan queda pagado antes de la primera postulación.\n` +
      `👉 ${url}\n` +
      `¿Empezamos esta semana?`,
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
    id: "seguimiento-visado",
    ruta: "/visado#test",
    grupo: "Seguimiento",
    nombre: "No contestó · visado",
    para: "Un día después de mandar la landing del visado y sin respuesta.",
    plantilla: (n, a, url) =>
      `${hola(n, a)} Te escribí ayer por lo del visado. Dato: el consulado tarda entre uno y dos meses desde la cita, así que cada semana cuenta.\n` +
      `👉 ${url}\n` +
      `Si quieres, hago el test de dos minutos contigo. ¿Cuándo empiezan tus clases?`,
  },
  {
    id: "seguimiento-master",
    ruta: "/master#cuesta",
    grupo: "Seguimiento",
    nombre: "No contestó · máster",
    para: "Un día después de mandar la landing del máster y sin respuesta.",
    plantilla: (n, a, url) =>
      `${hola(n, a)} Te escribí por lo del máster. Dato: la primera ventana para postular a 2027/2028 abre en noviembre, y las fases solo para extranjeros cierran en enero y febrero.\n` +
      `👉 ${url}\n` +
      `¿Pudiste verlo? Dime qué carrera terminaste y te oriento.`,
  },
  {
    id: "recordatorio-sesion",
    ruta: "/visa-o-estancia",
    grupo: "Seguimiento",
    nombre: "Recordatorio · mañana es la sesión",
    para: "El día antes de la sesión diagnóstico.",
    plantilla: (n, a, url) =>
      `${hola(n, a)} Mañana tenemos la sesión diagnóstico (${SESION_DIAGNOSTICO.duracion}, por videollamada). Ten a mano tu pasaporte, la carta de admisión si la tienes y cómo vas a acreditar el dinero.\n` +
      `👉 ${url}\n` +
      `Si haces antes este test de cinco preguntas, aprovechamos mejor el tiempo. ¿Confirmas la hora?`,
  },
  {
    id: "documentos",
    ruta: "/visado#checklist",
    grupo: "Seguimiento",
    nombre: "¿Qué documentos te faltan?",
    para: "Quien pregunta «¿y qué papeles son?» o va a empezar a reunirlos.",
    plantilla: (n, a, url) =>
      `${hola(n, a)} Un expediente de visado lleva 9 documentos y cada uno tiene su trampa: el extracto sellado, la frase exacta del certificado médico, la apostilla.\n` +
      `👉 ${url}\n` +
      `Marca ahí los que ya tienes y me llega la lista. ¿Cuáles te faltan?`,
  },
  {
    id: "denegado",
    ruta: "/ruta/denegado",
    grupo: "Seguimiento",
    nombre: "Me denegaron el visado",
    para: "Quien escribe con la resolución de denegación en la mano.",
    plantilla: (n, a, url) =>
      `${hola(n, a)} Si te denegaron el visado, hay un mes desde la notificación para el recurso de reposición, y muchas denegaciones por medios económicos se dan la vuelta con el expediente bien armado.\n` +
      `👉 ${url}\n` +
      `Mándame la foto de la resolución y te digo si conviene recurrir o ir por la estancia. ¿Qué fecha tiene?`,
  },
  {
    id: "portal",
    ruta: "/plataforma",
    grupo: "Seguimiento",
    nombre: "Bienvenida al portal",
    para: "Cuando ya pagó y se le da acceso al Expediente Digital.",
    plantilla: (n, a, url) =>
      `${hola(n, a)} Ya tienes acceso a tu Expediente Digital: entras con tu correo de Google, subes tus documentos desde el teléfono y cada mensaje queda por escrito con constancia de lectura.\n` +
      `👉 ${url}\n` +
      `Instálalo como app y sube primero tu pasaporte. ¿Lo pudiste abrir?`,
  },
  {
    id: "fechas",
    ruta: "/master",
    grupo: "Seguimiento",
    nombre: "Las fechas para 2027/2028",
    para: "Quien duda de cuándo empezar.",
    plantilla: (n, a, url) =>
      `${hola(n, a)} Para empezar en septiembre de 2027 lo fuerte es postular entre noviembre y febrero: la Fase 0 valenciana abre hacia el 17 de noviembre y la fase de extranjeros de Andalucía cierra hacia el 29 de enero.\n` +
      `👉 ${url}\n` +
      `Llegar a esa ventana con todo listo es la diferencia. ¿Ya tienes tu título y tus notas apostillados?`,
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

const GRUPOS = ["Vender", "Seguimiento", "Confianza", "Ganchos", "Otros públicos", "Campañas"];

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
        subtitulo="Cada página con su para quién y un mensaje corto listo para copiar: contexto con un dato, el enlace directo (WhatsApp muestra su vista previa) y una pregunta. Escribe el nombre de la persona y sale ya puesto."
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
