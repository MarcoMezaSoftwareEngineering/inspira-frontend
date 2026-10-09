// src/config/serviciosIndice.js
// ─────────────────────────────────────────────────────────────────────────────
// Índice LIGERO del catálogo de servicios: nombres, resúmenes, etiquetas,
// enlaces y la ficha corta (título y gancho) de los que tienen página propia.
// Es lo que leen el header (mega-menú), el catálogo /servicios, la portada y
// el SEO de App.jsx, y por eso viaja en el paquete inicial.
//
// El contenido largo de cada servicio (intro, bloques, FAQ…) vive en
// config/servicios.js, que solo descarga la página /servicios/<id>. Antes el
// catálogo entero, con el detalle, entraba en el paquete de la portada: 39 KB
// minificados de los que el 77 % no se pintaba hasta abrir un servicio
// (09/10/2026).
//
// Un servicio nuevo: sus datos aquí y, si tiene página propia, su `ficha`
// aquí y su detalle en DETALLES de config/servicios.js con el mismo `id`.
//
// Único precio visible en toda la web: la primera asesoría — los paquetes se
// cotizan caso por caso.
// ─────────────────────────────────────────────────────────────────────────────

import { NOMBRE_PORTAL, NOMBRE_CORTO } from "./portalMarca.js";
import { SESION_PRECIOS } from "./paqueteMaster2027Resumen.js";
// Importes de la fuente única (precios-inspira.json).
export const PRECIO_ASESORIA = {
  eur: `${SESION_PRECIOS.eur} €`,
  usd: `${SESION_PRECIOS.usd} US$`,
  pen: `S/ ${SESION_PRECIOS.pen}`,
  descripcion:
    "Primera asesoría personalizada de 30 minutos. Después de conocer tu caso armamos un paquete a tu medida — sin precios genéricos.",
};

// Ventajas transversales que se repiten en el material de la empresa.
export const DIFERENCIALES = [
  {
    titulo: "Solo asumimos casos viables",
    texto:
      "Tras evaluar tu caso asumimos únicamente los expedientes con posibilidades reales de éxito. Si tu vía no es la correcta, te lo decimos.",
    icono: "brujula",
  },
  {
    titulo: "Abogados especialistas en extranjería",
    texto:
      "Tu expediente lo lleva un abogado colegiado especializado en derecho migratorio español, no un gestor.",
    icono: "balanza",
  },
  {
    titulo: "Procesos 100% digitales",
    texto:
      "Presentación telemática con firma digital del abogado vía MERCURIO: sin citas presenciales, sin colas, sin desplazamientos.",
    icono: "destello",
  },
  {
    titulo: `${NOMBRE_CORTO} y app propios, no un chat`,
    texto:
      `Tu expediente vive en el ${NOMBRE_PORTAL}, que también se instala como app: documentos revisados por tu asesor con sus observaciones, tus plazos a la vista y mensajes con constancia de lectura.`,
    icono: "laptop",
  },
  {
    titulo: "Acompañamiento hasta la resolución",
    texto:
      "Seguimiento del expediente, requerimientos y subsanaciones incluidos hasta la resolución final del procedimiento.",
    icono: "escudo",
  },
];

// ── Categorías ──────────────────────────────────────────────────────────────
export const CATEGORIAS = [
  {
    id: "extranjeria",
    titulo: "Extranjería",
    descripcion:
      "Visados, residencias y permisos para migrar a España. Nuestro destino principal: migrar a España por estudios.",
    grupos: [
      {
        id: "estudios",
        titulo: "Migra a España por estudios",
        nota: "Mismo permiso, distinto proceso: elige según dónde inicies el trámite.",
        destacado: true,
        servicios: [
          {
            id: "visa-estudios",
            nombre: "Visa de Estudios",
            resumen:
              "Visado de estudiante tramitado desde tu país, ante el consulado español.",
            etiqueta: "Principal",
            ficha: {
              titulo: "Visa de Estudios en España",
              gancho:
                "Te acompañamos en cada detalle para que te presentes al consulado con un expediente sólido y sin errores.",
            },
          },
          {
            id: "estancia-estudios",
            nombre: "Estancia por Estudios",
            resumen:
              "Convierte tu ingreso como turista en una estancia legal por estudios, sin salir de España.",
            etiqueta: "100% digital",
            ficha: {
              titulo: "Estancia por Estudios en España",
              gancho:
                "Convierte tu ingreso como turista en una Estancia por Estudios y estudia legalmente en España.",
            },
          },
        ],
      },
      {
        id: "rapidos",
        titulo: "Procesos rápidos, requisitos altos",
        nota: "Resoluciones ágiles para perfiles que cumplen requisitos exigentes.",
        servicios: [
          {
            id: "visado-pac",
            nombre: "Visado PAC (Profesional Altamente Cualificado)",
            resumen:
              "Autorización de residencia y trabajo para profesionales altamente cualificados con oferta en España.",
            ficha: {
              titulo: "Visado PAC — Profesional Altamente Cualificado",
              gancho:
                "La vía más rápida para trabajar en España con un puesto cualificado y un salario acorde.",
            },
          },
          {
            id: "nomada-digital",
            nombre: "Residencia Nómada Digital",
            resumen:
              "Residencia para teletrabajadores de empresas extranjeras con ingresos acreditados.",
            ficha: {
              titulo: "Residencia de Nómada Digital en España",
              gancho:
                "Vive en España trabajando en remoto para tu empresa o tus clientes de fuera.",
            },
          },
          {
            id: "no-lucrativa",
            nombre: "Residencia No Lucrativa",
            resumen:
              "Residencia sin trabajar en España, acreditando medios económicos suficientes.",
            ficha: {
              titulo: "Residencia No Lucrativa en España",
              gancho:
                "Vive en España con tus propios medios económicos, sin ejercer actividad laboral.",
            },
          },
          {
            id: "residencia-doctorado",
            nombre: "Residencia Española para Doctorado",
            resumen:
              "Ahora es residencia, no estancia: el tiempo de tu doctorado computa para la nacionalidad española.",
            etiqueta: "Novedad",
            ficha: {
              titulo: "Residencia para Doctorado en España",
              gancho:
                "Ya es residencia — y eso significa que tu doctorado cuenta para la nacionalidad.",
            },
          },
        ],
      },
      {
        id: "especializados",
        titulo: "Especializados",
        servicios: [
          {
            id: "recurso-reposicion",
            nombre: "Recurso de Reposición",
            resumen:
              "Apelación legal frente a denegatorias de visa y trámites de extranjería.",
            etiqueta: "Urgente",
            ficha: {
              titulo: "¿Te denegaron la visa de estudios?",
              gancho: "No todo está perdido.",
            },
          },
          {
            id: "modificatoria-residente",
            nombre: "Modificatoria de Estudiante a Residente",
            resumen:
              "Cambio de tu permiso de estudiante a residencia y trabajo en España.",
            ficha: {
              titulo: "De estudiante a residente en España",
              gancho:
                "El paso que convierte tus años de estudio en residencia — y arranca el reloj de la nacionalidad.",
            },
          },
        ],
      },
      {
        id: "otros-extranjeria",
        titulo: "Otros trámites de extranjería",
        servicios: [
          {
            id: "nacionalidad",
            nombre: "Nacionalidad Española para Latinoamericanos",
            resumen:
              "Nacionalidad por residencia: los latinoamericanos solo necesitan 2 años legales en España.",
            ficha: {
              titulo: "Nacionalidad española para latinoamericanos",
              gancho: "Solo 2 años de residencia legal, no 10.",
            },
          },
          {
            id: "arraigos",
            nombre: "Arraigos",
            resumen:
              "Arraigo social, laboral, familiar o para la formación según tu situación en España.",
            ficha: {
              titulo: "Arraigos en España",
              gancho:
                "Vías de regularización para quienes ya llevan tiempo en España.",
            },
          },
          {
            id: "permiso-retorno",
            nombre: "Permiso de Retorno (estudiantes)",
            resumen:
              "Autorización para salir y volver a entrar a España con tu TIE en trámite.",
            ficha: {
              titulo: "Permiso de retorno para estudiantes",
              gancho: "Viaja tranquilo mientras tu tarjeta está en trámite.",
            },
          },
          {
            id: "prorroga-estancia",
            nombre: "Prórroga o Renovación de Estancia por Estudios",
            resumen:
              "Renueva tu estancia de estudiante sin salir de España ni perder estatus.",
            ficha: {
              titulo: "Prórroga o renovación de tu estancia por estudios",
              gancho: "Continúa tus estudios sin perder tu situación regular.",
            },
          },
          {
            id: "modificatorias",
            nombre: "Modificatorias de Situaciones Migratorias",
            resumen:
              "Cambio entre situaciones migratorias: estudios, trabajo, residencia y más.",
            ficha: {
              titulo: "Modificación de tu situación migratoria",
              gancho: "Cambiar de permiso sin romper tu continuidad legal.",
            },
          },
        ],
      },
    ],
  },
  {
    id: "tramites-espana",
    titulo: "Trámites adicionales en España",
    descripcion:
      "Gestiones del día a día una vez estás en España: citas, certificados y registros oficiales.",
    grupos: [
      {
        id: "gestiones",
        titulo: "Gestiones y citas",
        servicios: [
          {
            id: "tie",
            nombre: "Gestión de TIE (toma de huellas)",
            resumen:
              "Cita y acompañamiento para obtener tu Tarjeta de Identidad de Extranjero.",
            ficha: {
              titulo: "Gestión de TIE — toma de huellas",
              gancho:
                "La disponibilidad de citas es limitada y cambia por provincia. Nosotros la conseguimos.",
            },
          },
          {
            id: "empadronamiento",
            nombre: "Cita de Empadronamiento",
            resumen:
              "Registro en el padrón municipal, requisito clave para casi todo trámite.",
            ficha: {
              titulo: "Cita de empadronamiento",
              gancho: "El primer papel que te pedirán para casi todo lo demás.",
            },
          },
          {
            id: "certificado-ue",
            nombre: "Certificado UE",
            resumen: "Certificado de registro para ciudadanos de la Unión Europea.",
            ficha: {
              titulo: "Certificado de registro de ciudadano de la UE",
              gancho: "El registro que acredita tu residencia como comunitario.",
            },
          },
          {
            id: "certificado-digital",
            nombre: "Certificado Digital",
            resumen:
              "Identidad digital para hacer trámites online con la administración española.",
            ficha: {
              titulo: "Certificado digital",
              gancho: "Tu llave para hacer trámites sin pisar una oficina.",
            },
          },
          {
            id: "prueba-cervantes",
            nombre: "Prueba Cervantes (CCSE)",
            resumen:
              "Inscripción y preparación de la prueba de nacionalidad del Instituto Cervantes.",
            ficha: {
              titulo: "Prueba CCSE del Instituto Cervantes",
              gancho: "El examen obligatorio para tu nacionalidad española.",
            },
          },
          {
            id: "carta-invitacion",
            nombre: "Carta de Invitación",
            resumen:
              "Trámite de la carta de invitación para recibir familiares o amigos en España.",
            ficha: {
              titulo: "Carta de invitación",
              gancho: "Para que tu familia pueda visitarte sin sustos en frontera.",
            },
          },
          {
            id: "canje-dgt",
            nombre: "Canje DGT",
            resumen: "Canje de tu licencia de conducir latinoamericana por la española.",
            ficha: {
              titulo: "Canje de licencia de conducir (DGT)",
              gancho: "Conduce en España con permiso español.",
            },
          },
          {
            id: "seguridad-social",
            nombre: "Alta en la Seguridad Social",
            resumen:
              "Número de seguridad social y alta para trabajar o hacer prácticas.",
            ficha: {
              titulo: "Alta en la Seguridad Social",
              gancho: "El número que necesitas antes de tu primer contrato o práctica.",
            },
          },
        ],
      },
    ],
  },
  {
    id: "educativa",
    titulo: "Asesoría educativa",
    descripcion:
      "Elegimos el programa correcto y gestionamos la postulación, la homologación y las becas.",
    grupos: [
      {
        id: "master",
        titulo: "Máster en Europa",
        nota: "España con el Paquete Máster 2027/2028. En Países Bajos, Italia y Francia: asesoría de postulación.",
        destacado: true,
        servicios: [
          {
            id: "master-espana",
            nombre: "Máster en España",
            resumen:
              "Paquete Máster 2027/2028: seleccionamos tus opciones, postulamos por ti y te acompañamos hasta la matrícula, con pago por etapas.",
            href: "/servicios/master",
            etiqueta: "Principal",
          },
          {
            id: "master-paises-bajos",
            nombre: "Máster en Países Bajos",
            resumen: "Asesoría de postulación a universidades neerlandesas.",
            etiqueta: "Postulación",
            ficha: {
              titulo: "Máster en Países Bajos",
              gancho: "Programas en inglés, con reconocimiento internacional.",
            },
          },
          {
            id: "master-italia",
            nombre: "Máster en Italia",
            resumen: "Asesoría de postulación a universidades italianas.",
            etiqueta: "Postulación",
            ficha: {
              titulo: "Máster en Italia",
              gancho: "Universidades públicas con tasas accesibles y becas regionales.",
            },
          },
          {
            id: "master-francia",
            nombre: "Máster en Francia",
            resumen: "Asesoría de postulación a universidades francesas.",
            etiqueta: "Postulación",
            ficha: {
              titulo: "Máster en Francia",
              gancho: "Formación de prestigio con costos públicos contenidos.",
            },
          },
        ],
      },
      {
        id: "becas-homologacion",
        titulo: "Becas y homologaciones",
        servicios: [
          {
            id: "becas-espana",
            nombre: "Asesoría de Becas en España",
            resumen:
              "Identificamos y postulamos las becas compatibles con tu perfil y tu programa.",
            ficha: {
              titulo: "Asesoría de becas en España",
              gancho:
                "Nuestros asesorados han obtenido becas de Generación Bicentenario, Universidad de Jaén y Fundación Carolina.",
            },
          },
          {
            id: "homologacion-bachillerato",
            nombre: "Homologación al Bachillerato Español",
            resumen: "Homologa tus estudios de secundaria al sistema educativo español.",
            ficha: {
              titulo: "Homologación al Bachillerato español",
              gancho:
                "El paso obligatorio para estudiar un Grado o una Formación Profesional en España.",
            },
          },
          {
            id: "homologacion-titulo",
            nombre: "Homologación y Equivalencia de Título Universitario",
            resumen:
              "Reconocimiento oficial de tu título universitario latinoamericano en España.",
            ficha: {
              titulo: "Homologación de títulos universitarios en España",
              gancho:
                "Para que tu título sea reconocido oficialmente y puedas ejercer tu profesión.",
            },
          },
          {
            id: "grado-espana",
            nombre: "Grado en España",
            resumen:
              "Asesoría para estudiar una carrera universitaria completa en España.",
            ficha: {
              titulo: "Grado universitario en España",
              gancho: "Cuatro años, título europeo y permiso para trabajar 30 h semanales.",
            },
          },
        ],
      },
      {
        id: "adicionales",
        titulo: "Servicios adicionales",
        servicios: [
          {
            id: "formacion-profesional",
            nombre: "Grado Técnico en España (Formación Profesional)",
            resumen:
              "Estudia una carrera técnica (FP) en España, con matrícula subvencionada y prácticas desde el primer año.",
            etiqueta: "Alta empleabilidad",
            ficha: {
              titulo: "Formación Profesional en España",
              gancho: "Formación práctica, rápida y con alta empleabilidad.",
            },
          },
          {
            id: "seguro-medico",
            nombre: "Gestión de Seguro Médico",
            resumen:
              "Contratación del seguro médico válido y obligatorio para tu visado o tu estancia.",
            ficha: {
              titulo: "Gestión de seguro médico para España",
              gancho:
                "Un seguro mal elegido es de las causas más frecuentes de denegación.",
            },
          },
          {
            id: "apostillas",
            nombre: "Apostillas",
            resumen: "Apostillado de documentos para que tengan validez internacional.",
            ficha: {
              titulo: "Apostillado y legalización de documentos",
              gancho: "Sin apostilla, tus documentos no existen para la administración española.",
            },
          },
          {
            id: "pasajes",
            nombre: "Gestión de Pasajes",
            resumen:
              "Búsqueda y gestión de tus pasajes al mejor precio para tu viaje de estudios.",
            ficha: {
              titulo: "Gestión de pasajes",
              gancho: "Que el vuelo no sea el eslabón caro de tu proceso.",
            },
          },
          {
            id: "diligencias-peru",
            nombre: "Diligencias en Centros Peruanos",
            resumen:
              "Trámites presenciales en universidades e instituciones del Perú en tu nombre.",
            ficha: {
              titulo: "Diligencias en centros peruanos",
              gancho: "Si ya estás fuera o no tienes tiempo, vamos nosotros.",
            },
          },
          {
            id: "poderes",
            nombre: "Poderes",
            resumen:
              "Redacción y gestión de poderes notariales para actuar en tu representación.",
            ficha: {
              titulo: "Poderes notariales",
              gancho: "Para que podamos actuar por ti sin que tengas que viajar.",
            },
          },
        ],
      },
    ],
  },
];

// ── Utilidades ──────────────────────────────────────────────────────────────
export const TODOS_SERVICIOS = CATEGORIAS.flatMap((cat) =>
  cat.grupos.flatMap((g) =>
    g.servicios.map((s) => ({ ...s, categoriaId: cat.id, categoria: cat.titulo }))
  )
);

export const getServicio = (id) => TODOS_SERVICIOS.find((s) => s.id === id);

// Destino de un servicio: landing propia, página de detalle o catálogo.
// Vale igual para los objetos del índice y para los completos de servicios.js.
export const hrefServicio = (s) =>
  s.href || (s.ficha ? `/servicios/${s.id}` : `/servicios#${s.id}`);
