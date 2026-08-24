// src/config/rutas.js
// Páginas puente entre el home y el catálogo. Cada "ruta" agrupa las vías
// que sirven a una misma situación del visitante, para que nadie aterrice
// en el catálogo completo sin contexto.

export const RUTAS = {
  estudios: {
    id: "estudios",
    etiqueta: "La vía más efectiva",
    icono: "birrete",
    titulo: "Estudiar en España es",
    destacado: "la puerta de entrada que más funciona",
    intro:
      "Entras legalmente, puedes trabajar 30 horas semanales desde el primer día y, cuando terminas, tienes varias vías para quedarte. Por eso es el camino que más recomendamos.",
    gancho: {
      titulo: "Con una matrícula desde 700 €",
      texto:
        "ya puedes iniciar tu proceso para estudiar y vivir legalmente en España. Hay másteres oficiales en universidades públicas por ese precio.",
      dato: "700 €",
      datoTexto: "matrícula en pública",
    },
    bloques: [
      {
        titulo: "Elige qué vas a estudiar",
        texto: "Primero el programa; el permiso viene después.",
        servicios: ["master-espana", "grado-espana", "formacion-profesional"],
      },
      {
        titulo: "Consigue tu permiso",
        texto: "Mismo permiso, dos procesos distintos según dónde lo tramites.",
        servicios: ["visa-estudios", "estancia-estudios"],
      },
      {
        titulo: "Prepara tu expediente",
        texto: "Lo que hay que tener listo antes de postular o presentar.",
        servicios: ["becas-espana", "homologacion-titulo", "seguro-medico", "apostillas"],
      },
    ],
    despues: {
      titulo: "¿Y después de estudiar?",
      texto:
        "La estancia por estudios no computa para la nacionalidad, pero la residencia sí. Por eso el siguiente paso natural es la modificación a residente.",
      servicios: ["modificatoria-residente", "nacionalidad"],
    },
  },

  rapidas: {
    id: "rapidas",
    etiqueta: "Las vías más rápidas",
    icono: "maletin",
    titulo: "Hay vías más fáciles para migrar",
    destacado: "y llegar antes a la nacionalidad",
    intro:
      "Si tienes una oferta de trabajo cualificada, trabajas en remoto o cuentas con medios económicos propios, no necesitas estudiar para vivir legalmente en España. Estas vías se resuelven en semanas y computan para la nacionalidad desde el primer día.",
    gancho: {
      titulo: "Con los ingresos adecuados",
      texto:
        "ya puedes vivir legalmente en España. Cada vía tiene su umbral económico: en la asesoría calculamos el tuyo y te decimos cuál te corresponde.",
      dato: "20 días",
      datoTexto: "plazos de resolución",
    },
    bloques: [
      {
        titulo: "Si trabajas en remoto o tienes una oferta",
        texto: "Requisitos altos, pero de los procesos más ágiles del sistema español.",
        servicios: ["nomada-digital", "visado-pac"],
      },
      {
        titulo: "Si tienes medios propios o vas a investigar",
        texto: "Sin necesidad de contrato en España.",
        servicios: ["no-lucrativa", "residencia-doctorado"],
      },
    ],
    despues: {
      titulo: "Todas llevan al mismo sitio",
      texto:
        "Estas residencias computan para la nacionalidad española, que para los latinoamericanos exige solo 2 años de residencia legal en vez de 10.",
      servicios: ["nacionalidad"],
    },
  },

  "en-espana": {
    id: "en-espana",
    etiqueta: "Ya estás en España",
    icono: "bandera",
    titulo: "Ya estás aquí:",
    destacado: "ahora toca consolidar tu situación",
    intro:
      "Renovaciones, cambios de situación, regularización y la nacionalidad. Y todas las gestiones del día a día que nadie te explicó: TIE, empadronamiento, seguridad social, certificado digital y más.",
    gancho: {
      titulo: "Solo 2 años de residencia legal",
      texto:
        "es lo que necesita un latinoamericano para pedir la nacionalidad española. El resto del mundo necesita 10. Cada trámite bien hecho te acerca.",
      dato: "2 años",
      datoTexto: "para la nacionalidad",
    },
    bloques: [
      {
        titulo: "Cambia o consolida tu situación",
        texto: "El paso que convierte tu estancia en residencia de verdad.",
        servicios: ["modificatoria-residente", "modificatorias", "prorroga-estancia"],
      },
      {
        titulo: "Regularización y nacionalidad",
        texto: "Si llevas tiempo aquí o quieres el pasaporte europeo.",
        servicios: ["nacionalidad", "arraigos", "prueba-cervantes"],
      },
      {
        titulo: "Gestiones y citas del día a día",
        texto: "Lo que hay que hacer al llegar y cada año.",
        servicios: [
          "tie",
          "empadronamiento",
          "certificado-digital",
          "seguridad-social",
          "canje-dgt",
          "carta-invitacion",
          "permiso-retorno",
          "certificado-ue",
        ],
      },
    ],
  },

  denegado: {
    id: "denegado",
    etiqueta: "Te denegaron un trámite",
    icono: "documento",
    titulo: "Una denegación",
    destacado: "no siempre es el final",
    intro:
      "Analizamos la resolución, te decimos con honestidad si el recurso es viable y, si no lo es, reconducimos tu caso hacia la vía que sí funciona. Los plazos para recurrir son cortos: conviene revisarlo cuanto antes.",
    gancho: {
      titulo: "Solo asumimos casos viables",
      texto:
        "Si tras leer tu resolución vemos que el recurso no prospera, te lo decimos y trabajamos la alternativa. Preferimos una conversación honesta a un expediente condenado.",
      dato: "Plan B",
      datoTexto: "siempre hay una salida",
    },
    bloques: [
      {
        titulo: "Recurrir la denegación",
        texto: "Análisis jurídico y escrito de reposición ante el consulado.",
        servicios: ["recurso-reposicion"],
      },
      {
        titulo: "El plan alternativo",
        texto: "Si el recurso no es la mejor vía, hay otro camino.",
        servicios: ["estancia-estudios", "visa-estudios"],
      },
    ],
  },

  tramites: {
    id: "tramites",
    etiqueta: "Todavía no migras",
    icono: "documento",
    titulo: "Aún no vas a migrar,",
    destacado: "pero puedes ir adelantando",
    intro:
      "Los trámites que más tardan son los que conviene empezar antes: la homologación de tus estudios puede llevar meses. Adelantarlos ahora es lo que después te permite postular a tiempo.",
    gancho: {
      titulo: "Empieza por lo que más tarda",
      texto:
        "La homologación al Bachillerato español es requisito para el Grado y la Formación Profesional, y su resolución puede tardar meses. Iniciarla hoy te ahorra perder un año entero.",
      dato: "Meses",
      datoTexto: "de antelación necesaria",
    },
    bloques: [
      {
        titulo: "Homologa tus estudios",
        texto: "El paso previo obligatorio para estudiar en España.",
        servicios: ["homologacion-bachillerato", "homologacion-titulo"],
      },
      {
        titulo: "Prepárate para la universidad española",
        texto: "Elige bien el programa y llega con el expediente listo.",
        servicios: ["grado-espana", "master-espana", "becas-espana"],
      },
      {
        titulo: "Deja la documentación lista",
        texto: "Sin apostillas, tus documentos no existen para la administración española.",
        servicios: ["apostillas", "diligencias-peru", "poderes"],
      },
    ],
  },
};

export const getRuta = (id) => RUTAS[id];
export const IDS_RUTAS = Object.keys(RUTAS);
