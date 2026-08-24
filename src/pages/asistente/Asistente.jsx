// src/pages/asistente/Asistente.jsx
// Pestaña del asistente de IA. Hoy funciona como un orientador guiado que
// responde con el contenido propio del catálogo (sin llamadas externas):
// hace preguntas, deduce la vía que encaja y deriva a la asesoría 1:1.
// La versión conversacional por suscripción es la fase siguiente.
import { useState } from "react";
import Icono from "../../components/common/Icono";
import BotonAsesoria from "../../components/common/BotonAsesoria";
import { navigate } from "../../services/navigate";
import { CALENDLY_URL } from "../../config/contacto";

const go = (e, href) => {
  e.preventDefault();
  navigate(href);
  window.scrollTo({ top: 0, behavior: "instant" });
};

// Árbol de decisión: cada respuesta lleva a otra pregunta o a un resultado.
const ARBOL = {
  inicio: {
    pregunta: "¿Dónde estás ahora mismo?",
    opciones: [
      { txt: "En mi país de origen", ir: "objetivo" },
      { txt: "Ya estoy en España", ir: "enEspana" },
    ],
  },
  objetivo: {
    pregunta: "¿Qué quieres hacer en España?",
    opciones: [
      { txt: "Estudiar (máster, grado o FP)", ir: "estudiar" },
      { txt: "Trabajar con una oferta cualificada", res: "pac" },
      { txt: "Trabajar en remoto para el extranjero", res: "nomada" },
      { txt: "Vivir sin trabajar, con mis propios medios", res: "noLucrativa" },
    ],
  },
  estudiar: {
    pregunta: "¿Ya tienes carta de admisión de un centro español?",
    opciones: [
      { txt: "Sí, ya tengo la admisión", ir: "admitido" },
      { txt: "Todavía no, necesito elegir programa", res: "asesoriaEducativa" },
      { txt: "Me denegaron el visado", res: "recurso" },
    ],
  },
  admitido: {
    pregunta: "¿Cómo prefieres tramitar tu permiso?",
    opciones: [
      { txt: "Desde mi país, en el consulado", res: "visaEstudios" },
      { txt: "Viajando primero y tramitando allá", res: "estanciaEstudios" },
      { txt: "No sé cuál me conviene", res: "diagnostico" },
    ],
  },
  enEspana: {
    pregunta: "¿Cuál es tu situación?",
    opciones: [
      { txt: "Tengo estancia por estudios y quiero quedarme", res: "modificatoria" },
      { txt: "Llevo años y quiero la nacionalidad", res: "nacionalidad" },
      { txt: "Estoy en situación irregular", res: "arraigos" },
      { txt: "Necesito renovar o hacer un trámite", res: "tramites" },
    ],
  },
};

const RESULTADOS = {
  visaEstudios: {
    icono: "pasaporte",
    titulo: "Visa de Estudios",
    texto:
      "Tramitas desde tu país ante el consulado español y viajas con el visado ya resuelto. Te acompañamos en la acreditación económica, el seguro médico, los formularios y la cita consular.",
    href: "/servicios/visa-estudios",
  },
  estanciaEstudios: {
    icono: "bandera",
    titulo: "Estancia por Estudios",
    texto:
      "Entras como turista y regularizas tu situación ante Extranjería. Proceso 100% digital vía MERCURIO, sin citas ni colas, con permiso para trabajar 30 h semanales.",
    href: "/servicios/estancia-estudios",
  },
  diagnostico: {
    icono: "balanza",
    titulo: "Necesitas un diagnóstico",
    texto:
      "Elegir entre visado y estancia depende de tus fechas de clase, de la carga de tu consulado y de tu situación documental. Es exactamente lo que resolvemos en la asesoría de 30 minutos.",
    href: "/servicios#estudios",
  },
  asesoriaEducativa: {
    icono: "birrete",
    titulo: "Asesoría educativa",
    texto:
      "Primero hay que elegir bien el programa: máster, grado o formación profesional. Analizamos tu perfil, tu presupuesto y tus plazos, y armamos tu shortlist con becas incluidas.",
    href: "/servicios#educativa",
  },
  recurso: {
    icono: "documento",
    titulo: "Recurso de Reposición",
    texto:
      "Analizamos la resolución de denegación y te decimos con honestidad si el recurso es viable. Si no lo es, reconducimos tu caso hacia una estancia por estudios.",
    href: "/servicios/recurso-reposicion",
  },
  pac: {
    icono: "maletin",
    titulo: "Visado PAC — Profesional Altamente Cualificado",
    texto:
      "Con una oferta cualificada en una empresa española, esta es la vía más ágil: plazos cortos, silencio administrativo positivo y autorización para tu familia.",
    href: "/servicios/visado-pac",
  },
  nomada: {
    icono: "laptop",
    titulo: "Residencia de Nómada Digital",
    texto:
      "Para teletrabajadores de empresas extranjeras. Requisitos exigentes de ingresos y antigüedad, pero residencia de hasta 3 años que computa para la nacionalidad.",
    href: "/servicios/nomada-digital",
  },
  noLucrativa: {
    icono: "casa",
    titulo: "Residencia No Lucrativa",
    texto:
      "Vives en España con tus propios medios económicos, sin ejercer actividad laboral. Vía predecible siempre que la acreditación económica esté impecable.",
    href: "/servicios/no-lucrativa",
  },
  modificatoria: {
    icono: "brujula",
    titulo: "Modificatoria de Estudiante a Residente",
    texto:
      "Clave: la estancia por estudios NO computa para la nacionalidad, la residencia sí. Este trámite convierte tus años de estudio en el punto de partida real.",
    href: "/servicios/modificatoria-residente",
  },
  nacionalidad: {
    icono: "bandera",
    titulo: "Nacionalidad española",
    texto:
      "Como latinoamericano solo necesitas 2 años de residencia legal, frente a los 10 de la regla general. Verificamos qué años te computan y preparamos el expediente.",
    href: "/servicios/nacionalidad",
  },
  arraigos: {
    icono: "escudo",
    titulo: "Arraigos",
    texto:
      "Hay varios tipos de arraigo y elegir el correcto lo cambia todo: social, laboral, familiar o para la formación. Determinamos cuál encaja con tu situación real.",
    href: "/servicios/arraigos",
  },
  tramites: {
    icono: "huella",
    titulo: "Trámites en España",
    texto:
      "TIE, empadronamiento, certificado digital, canje de licencia, seguridad social, prórrogas y renovaciones. Gestionamos las citas y la documentación.",
    href: "/servicios#tramites-espana",
  },
};

export default function Asistente() {
  const [nodo, setNodo] = useState("inicio");
  const [resultado, setResultado] = useState(null);
  const [historial, setHistorial] = useState([]);

  const responder = (op) => {
    setHistorial((h) => [...h, { pregunta: ARBOL[nodo].pregunta, resp: op.txt }]);
    if (op.res) setResultado(RESULTADOS[op.res]);
    else setNodo(op.ir);
  };

  const reiniciar = () => {
    setNodo("inicio");
    setResultado(null);
    setHistorial([]);
  };

  const actual = ARBOL[nodo];

  return (
    <div className="w-full">
      {/* Hero */}
      <section
        className="relative w-full overflow-hidden px-6 py-16 md:py-20"
        style={{ background: "linear-gradient(150deg, #012938 0%, #013446 50%, #02506B 100%)" }}
      >
        <div className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-sky/20 blur-3xl" />
        <div className="relative mx-auto max-w-3xl text-center">
          <span className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-sm font-semibold text-white/85">
            <Icono nombre="robot" size={16} />
            Asistente Inspira
          </span>
          <h1 className="mb-4 font-fraunces text-3xl font-extrabold leading-tight text-white md:text-5xl">
            ¿No sabes qué trámite
            <br />
            <span style={{ color: "#88C4FC" }}>te corresponde?</span>
          </h1>
          <p className="mx-auto max-w-xl text-base leading-relaxed text-white/70 md:text-lg">
            Responde tres preguntas y te decimos cuál es tu vía. Gratis, en
            menos de un minuto.
          </p>
        </div>
      </section>

      {/* Asistente */}
      <section className="mx-auto max-w-3xl px-5 py-12 md:py-16">
        <div className="overflow-hidden rounded-3xl border border-neutral-200 bg-white shadow-lg">
          {/* Cabecera tipo chat */}
          <div className="flex items-center gap-3 border-b border-neutral-200 bg-secondary-light px-5 py-4">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-white">
              <Icono nombre="robot" size={20} />
            </span>
            <div>
              <p className="text-sm font-extrabold text-neutral-900">
                Asistente Inspira
              </p>
              <p className="flex items-center gap-1.5 text-xs text-green-700">
                <span className="h-1.5 w-1.5 rounded-full bg-green-600" />
                En línea
              </p>
            </div>
          </div>

          <div className="px-5 py-6 md:px-7">
            {/* Historial */}
            {historial.map((h, i) => (
              <div key={i} className="mb-4">
                <p className="text-sm text-neutral-500">{h.pregunta}</p>
                <p className="mt-1 inline-block rounded-2xl rounded-tr-sm bg-primary px-4 py-2 text-sm font-semibold text-white">
                  {h.resp}
                </p>
              </div>
            ))}

            {!resultado ? (
              <>
                <p className="text-lg font-bold text-neutral-900">
                  {actual.pregunta}
                </p>
                <div className="mt-4 grid gap-2.5">
                  {actual.opciones.map((op) => (
                    <button
                      key={op.txt}
                      type="button"
                      onClick={() => responder(op)}
                      className="flex items-center justify-between gap-3 rounded-2xl border-2 border-neutral-200 px-5 py-4 text-left text-sm font-semibold text-neutral-900 transition hover:-translate-y-0.5 hover:border-accent hover:bg-accent/5 hover:shadow-md"
                    >
                      {op.txt}
                      <span className="text-accent" aria-hidden>→</span>
                    </button>
                  ))}
                </div>
              </>
            ) : (
              <div>
                <p className="text-sm font-semibold text-neutral-500">
                  Según lo que nos cuentas, tu vía es:
                </p>
                <div className="mt-3 rounded-2xl border-2 border-accent bg-accent/5 p-6">
                  <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent text-white">
                    <Icono nombre={resultado.icono} size={24} />
                  </span>
                  <h2 className="mt-4 font-fraunces text-2xl font-extrabold text-primary">
                    {resultado.titulo}
                  </h2>
                  <p className="mt-2 leading-relaxed text-neutral-700">
                    {resultado.texto}
                  </p>
                  <div className="mt-5 flex flex-wrap gap-3">
                    <a
                      href={resultado.href}
                      onClick={(e) => go(e, resultado.href)}
                      className="rounded-xl bg-primary px-5 py-3 text-sm font-extrabold text-white transition hover:bg-primary-light"
                    >
                      Ver este servicio →
                    </a>
                    <a
                      href={CALENDLY_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-xl bg-accent px-5 py-3 text-sm font-extrabold text-white transition hover:bg-accent-dark"
                    >
                      Confirmarlo con un abogado →
                    </a>
                  </div>
                </div>

                <p className="mt-5 text-xs leading-relaxed text-neutral-500">
                  Esta orientación es automática y no sustituye el diagnóstico
                  jurídico de un abogado. Tu caso concreto puede tener matices
                  que solo se ven en una asesoría personalizada.
                </p>

                <button
                  type="button"
                  onClick={reiniciar}
                  className="mt-5 text-sm font-semibold text-primary hover:underline"
                >
                  ↺ Empezar de nuevo
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Próximamente: versión conversacional */}
        <div className="mt-8 rounded-2xl border border-dashed border-neutral-300 bg-secondary-light p-6">
          <div className="flex items-start gap-4">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-sky-dark">
              <Icono nombre="destello" size={20} />
            </span>
            <div>
              <h3 className="font-bold text-neutral-900">
                Pronto: InspiraGPT, tu asistente 24/7
              </h3>
              <p className="mt-1.5 text-sm leading-relaxed text-neutral-700">
                Estamos preparando la versión conversacional con suscripción
                mensual: podrás preguntar cualquier duda de extranjería y
                estudios en España a cualquier hora, entrenada con nuestras
                guías y con el criterio de nuestro equipo legal.
              </p>
              <a
                href="/tienda"
                onClick={(e) => go(e, "/tienda")}
                className="mt-3 inline-block text-sm font-bold text-primary hover:underline"
              >
                Verlo en la Tiendita →
              </a>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-10 text-center">
          <h2 className="font-fraunces text-2xl font-extrabold text-primary">
            ¿Prefieres hablar con una persona?
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-neutral-700">
            La asesoría 1:1 de 30 minutos con un abogado especialista es donde
            de verdad se resuelve tu caso.
          </p>
          <div className="mt-5 flex justify-center">
            <BotonAsesoria>Agenda tu asesoría 1:1</BotonAsesoria>
          </div>
        </div>
      </section>
    </div>
  );
}
