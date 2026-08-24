// src/config/servicios.js
// ─────────────────────────────────────────────────────────────────────────────
// FUENTE ÚNICA DE VERDAD del catálogo de servicios de Inspira Legal.
// El header (mega-menú), la página /servicios y las secciones del home leen
// de aquí. Si cambia un servicio, se cambia SOLO en este archivo.
//
// Único precio visible en toda la web: la primera asesoría. Cada paquete
// posterior se cotiza de forma personalizada según el caso.
// ─────────────────────────────────────────────────────────────────────────────

export const PRECIO_ASESORIA = {
  eur: "25 €",
  usd: "28 US$",
  pen: "S/ 100",
  descripcion:
    "Primera asesoría personalizada. Después de conocer tu caso armamos un paquete a tu medida — sin precios genéricos.",
};

// Categorías con ancla en /servicios (#extranjeria, #educativa, #tramites-espana)
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
            href: "/servicios/estancia",
          },
          {
            id: "estancia-estudios",
            nombre: "Estancia por Estudios",
            resumen:
              "Autorización de estancia solicitada ya estando en España, ante extranjería.",
            href: "/servicios/estancia",
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
            nombre: "Visado PAC",
            resumen:
              "Visado de prácticas para recién egresados con oferta de prácticas en España.",
          },
          {
            id: "nomada-digital",
            nombre: "Residencia Nómada Digital",
            resumen:
              "Residencia para teletrabajadores de empresas extranjeras con ingresos acreditados.",
          },
          {
            id: "no-lucrativa",
            nombre: "Residencia No Lucrativa",
            resumen:
              "Residencia sin trabajar en España, acreditando medios económicos suficientes.",
          },
          {
            id: "residencia-doctorado",
            nombre: "Residencia Española para Doctorado",
            resumen:
              "Residencia para doctorandos admitidos en programas de doctorado en España.",
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
          },
          {
            id: "modificatoria-residente",
            nombre: "Modificatoria de Estudiante a Residente",
            resumen:
              "Cambio de tu permiso de estudiante a residencia y trabajo en España.",
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
          },
          {
            id: "arraigos",
            nombre: "Arraigos",
            resumen:
              "Arraigo social, laboral, familiar o para la formación según tu situación en España.",
          },
          {
            id: "permiso-retorno",
            nombre: "Permiso de Retorno (estudiantes)",
            resumen:
              "Autorización para salir y volver a entrar a España con tu TIE en trámite.",
          },
          {
            id: "prorroga-estancia",
            nombre: "Prórroga o Renovación de Estancia por Estudios",
            resumen:
              "Renueva tu estancia de estudiante sin salir de España ni perder estatus.",
          },
          {
            id: "modificatorias",
            nombre: "Modificatorias de Situaciones Migratorias",
            resumen:
              "Cambio entre situaciones migratorias: estudios, trabajo, residencia y más.",
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
            resumen: "Cita y acompañamiento para obtener tu Tarjeta de Identidad de Extranjero.",
          },
          {
            id: "empadronamiento",
            nombre: "Cita de Empadronamiento",
            resumen: "Registro en el padrón municipal, requisito clave para casi todo trámite.",
          },
          {
            id: "certificado-ue",
            nombre: "Certificado UE",
            resumen: "Certificado de registro para ciudadanos de la Unión Europea.",
          },
          {
            id: "certificado-digital",
            nombre: "Certificado Digital",
            resumen: "Identidad digital para hacer trámites online con la administración española.",
          },
          {
            id: "prueba-cervantes",
            nombre: "Prueba Cervantes (CCSE)",
            resumen: "Inscripción y preparación de la prueba de nacionalidad del Instituto Cervantes.",
          },
          {
            id: "carta-invitacion",
            nombre: "Carta de Invitación",
            resumen: "Trámite de la carta de invitación para recibir familiares o amigos en España.",
          },
          {
            id: "canje-dgt",
            nombre: "Canje DGT",
            resumen: "Canje de tu licencia de conducir latinoamericana por la española.",
          },
          {
            id: "seguridad-social",
            nombre: "Alta en la Seguridad Social",
            resumen: "Número de seguridad social y alta para trabajar o hacer prácticas.",
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
        nota: "España con acompañamiento 360°. En Países Bajos, Italia y Francia: asesoría de postulación.",
        destacado: true,
        servicios: [
          {
            id: "master-espana",
            nombre: "Máster en España",
            resumen:
              "Programa 360°: búsqueda, postulación, matrícula y visado con seguimiento completo.",
            href: "/servicios/master",
            etiqueta: "Principal",
          },
          {
            id: "master-paises-bajos",
            nombre: "Máster en Países Bajos",
            resumen: "Asesoría de postulación a universidades neerlandesas.",
            etiqueta: "Postulación",
          },
          {
            id: "master-italia",
            nombre: "Máster en Italia",
            resumen: "Asesoría de postulación a universidades italianas.",
            etiqueta: "Postulación",
          },
          {
            id: "master-francia",
            nombre: "Máster en Francia",
            resumen: "Asesoría de postulación a universidades francesas.",
            etiqueta: "Postulación",
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
          },
          {
            id: "homologacion-bachillerato",
            nombre: "Homologación al Bachillerato Español",
            resumen: "Homologa tus estudios de secundaria al sistema educativo español.",
          },
          {
            id: "homologacion-titulo",
            nombre: "Homologación y Equivalencia de Título Universitario",
            resumen:
              "Reconocimiento oficial de tu título universitario latinoamericano en España.",
          },
          {
            id: "grado-espana",
            nombre: "Grado en España",
            resumen:
              "Asesoría para estudiar una carrera universitaria completa en España.",
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
              "Estudia una carrera técnica (FP) en España, incluso en centros públicos gratuitos.",
          },
          {
            id: "apostillas",
            nombre: "Apostillas",
            resumen: "Apostillado de documentos para que tengan validez internacional.",
          },
          {
            id: "pasajes",
            nombre: "Gestión de Pasajes",
            resumen: "Búsqueda y gestión de tus pasajes al mejor precio para tu viaje de estudios.",
          },
          {
            id: "diligencias-peru",
            nombre: "Diligencias en Centros Peruanos",
            resumen:
              "Trámites presenciales en universidades e instituciones del Perú en tu nombre.",
          },
          {
            id: "poderes",
            nombre: "Poderes",
            resumen: "Redacción y gestión de poderes notariales para actuar en tu representación.",
          },
        ],
      },
    ],
  },
];

// Resumen plano por categoría para menús compactos (header / footer)
export const MENU_SERVICIOS = CATEGORIAS.map((cat) => ({
  id: cat.id,
  titulo: cat.titulo,
  href: `/servicios#${cat.id}`,
  items: cat.grupos.flatMap((g) =>
    g.servicios.map((s) => ({
      id: s.id,
      nombre: s.nombre,
      href: s.href || `/servicios#${s.id}`,
    }))
  ),
}));
