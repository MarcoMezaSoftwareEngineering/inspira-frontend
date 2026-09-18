// Contenido de la guía interna del servicio de Doctorado (18/09/2026).
// Todo lo que lleva cifra o norma sale de fuentes oficiales consultadas ese
// día (BOE, UGE, RUCT, decretos de precios, webs de las escuelas de
// doctorado). Lo que no se pudo confirmar va marcado como «por confirmar».
// Al renovar el curso, se revisa aquí y en inspira-backend/src/modules/doctorados/datos.

export const PAQUETES = [
  {
    nombre: "Doctorado", precio: "300 €", alcance: "Hasta 3 programas",
    incluye: [
      "Diagnóstico de acceso: título, carta de acceso en origen, complementos",
      "Selección de programas en el catálogo interno, con plazos y precio",
      "Mapa de posibles directores de tesis y plantilla del primer correo",
      "Revisión de forma del CV y del anteproyecto (no su contenido científico)",
      "Comprobación de nivel, preinscripción y matrícula en cada programa",
      "Seguimiento de plazos y becas en el Expediente Digital",
    ],
  },
  {
    nombre: "Doctorado Plus", precio: "450 €", alcance: "Hasta 5 programas", destacado: true,
    incluye: [
      "Todo lo del paquete Doctorado",
      "Acompañamiento en el contacto con directores: priorizamos, revisamos cada correo y seguimos las respuestas",
      "Plan B de programas si un director no contesta a tiempo",
    ],
  },
  {
    nombre: "Residencia para investigación (UGE)", precio: "400 €", alcance: "Con la matrícula hecha",
    incluye: [
      "Expediente ante la UGE-CE: formulario MI-T, tasa 790-038 y documentación",
      "Medios económicos, seguro y antecedentes revisados antes de presentar",
      "Visado consular si se solicita desde fuera; sin visado si ya está en España",
    ],
  },
  {
    nombre: "Familiar", precio: "200 €", alcance: "Por cada familiar",
    incluye: ["Autorización del cónyuge o pareja, hijos o ascendientes a cargo (modelo MI-F), a la vez o después"],
  },
];

export const NO_HACEMOS = [
  "Escribir la tesis, el plan de investigación, el anteproyecto o artículos: es fraude académico. Revisamos forma, no contenido científico.",
  "Garantizar la admisión, el director ni la beca: lo decide la comisión académica de cada programa y cada entidad.",
  "Firmar en nombre del asesorado ante la universidad sin representación otorgada.",
  "Prometer la nacionalidad en un plazo: se puede SOLICITAR a los 2 años de residencia legal; la resolución la da el Ministerio de Justicia.",
];

export const VIA = [
  ["Qué es", "Autorización de residencia para investigación nacional (art. 72.2.b de la Ley 14/2013), ante la Unidad de Grandes Empresas y Colectivos Estratégicos (UGE-CE). No es estancia por estudios."],
  ["Desde cuándo", "Criterio de gestión DGGM 2/2026 (firmado el 07/08/2026, publicado el 11/08/2026): el doctorado (MECES 4) se tramita como investigación; si se pide estancia (art. 52.1.a RD 1155/2024) o visado de estudios, se informará de que no procede."],
  ["Quién la pide", "El doctorando o la universidad, por vía electrónica. Desde fuera: primero la autorización y después el visado en el consulado (10 días hábiles). Desde España con estancia o residencia: sin visado."],
  ["Plazo", "La UGE resuelve en 20 días; si no contesta, silencio positivo. Presentar la solicitud prorroga la situación que tenga el interesado mientras se resuelve (art. 76 Ley 14/2013)."],
  ["Duración", "3 años (o lo que dure el contrato o la matrícula si es menos), renovable por periodos de 2 años. Da acceso a la residencia de larga duración a los 5 años."],
  ["Medios económicos", "Sin contrato: como mínimo el 50 % del SMI anual = 8.547 €/año (SMI 2026: 17.094 €/año, RD 126/2026). Con familiares: 100 % del SMI = 17.094 €/año. Con contrato predoctoral, el propio contrato."],
  ["Requisitos", "Admisión y matrícula pagada en un programa del RUCT; seguro médico sin copagos ni carencias (no vale el de viaje); antecedentes penales de 2 años + declaración de 5; formulario MI-T; tasa 790-038 (epígrafe 7.1); traducción jurada y apostilla."],
  ["Familia", "Cónyuge o pareja, hijos menores (o mayores a cargo) y ascendientes a cargo, con el modelo MI-F, a la vez o después. Su autorización depende de la del doctorando."],
  ["Al terminar", "Hasta 12 meses para buscar empleo relacionado o emprender (art. 72.9), comunicándolo a la UGE entre 60 días antes y 90 después del vencimiento."],
];

export const NACIONALIDAD = {
  frase: "El camino más corto si ya tienes maestría: tu doctorado es residencia, y a los 2 años puedes solicitar la nacionalidad española.",
  puntos: [
    "Iberoamericanos: 2 años de residencia legal, continuada e inmediatamente anterior a la solicitud (art. 22 del Código Civil).",
    "La estancia por estudios NO computa; la residencia para investigación del doctorado SÍ, porque es residencia.",
    "Además: examen CCSE del Instituto Cervantes (los iberoamericanos están exentos del DELE), antecedentes y buena conducta cívica.",
    "La resolución tarda: nunca decir «en dos años tienes la nacionalidad»; decir «a los dos años puedes solicitarla».",
    "Por confirmar: régimen de quien ya cursa el doctorado con estancia (el criterio no fija transitorio) y si el tiempo previo con estancia se recalcula.",
  ],
};

export const ACCESO = [
  ["Regla general", "Grado + Máster oficiales con al menos 300 ECTS entre los dos (RD 99/2011, art. 6.1)."],
  ["Título latinoamericano", "Se entra SIN homologar (art. 6.2.c): la universidad comprueba que equivale a un máster español y que da acceso al doctorado en el país de origen. Esa comprobación solo sirve para el doctorado."],
  ["El documento que más falta", "Carta o certificado de la universidad de origen que diga que ese título da acceso al doctorado en su país. Pedirlo el primer día."],
  ["Licenciatura sin maestría", "No hay regla nacional que la acepte sola; depende de que faculte para el doctorado en origen. Si no: complementos de formación (dentro de un año) o, mejor, un máster en España antes: venta cruzada con el Paquete Máster."],
  ["Trámite previo aparte", "Salamanca (210,97 €, 01/03–07/09), Zaragoza (todo el año), UPV/EHU, Málaga, Murcia, A Coruña, Politècnica de València y Alicante (~155 €), UCAM. En Cataluña se pagan 218,15 € al registrar el acceso. En el resto, dentro de la admisión."],
];

export const PASOS = [
  ["Diagnóstico", "Título, maestría, carta de acceso, idioma, financiación y vía (fuera o dentro de España).", "1–2 semanas"],
  ["Apostilla y traducción", "Título y notas apostillados; traducción jurada si no está en español. Pedir la carta de acceso en origen.", "4–8 semanas"],
  ["Programas y directores", "3 a 5 programas del catálogo; 10–20 posibles directores de sus portales de producción científica. Un correo por profesor, nunca en masa.", "2–4 meses"],
  ["Aval del director", "Carta de compromiso o formulario de aval (UAM: «Director endorsement form»; USAL: carta de compromiso).", "con el contacto"],
  ["Comprobación de nivel", "Donde va aparte (Salamanca, Zaragoza, Málaga…), antes o junto con la preinscripción.", "1–3 meses"],
  ["Preinscripción", "CV, carta de motivación, anteproyecto, aval, títulos y notas. La mayoría, entre mayo y octubre.", "según universidad"],
  ["Admisión y matrícula", "La comisión académica resuelve (sept.–nov.). Con la matrícula pagada empieza el doctorado.", "oct.–dic."],
  ["Residencia UGE", "MI-T, tasa 790-038, medios (50 % SMI), seguro, antecedentes y matrícula. 20 días y silencio positivo.", "≈1 mes"],
  ["Visado (si viene de fuera)", "En el consulado con la autorización concedida: 10 días hábiles de resolución, más la espera de cita.", "2–6 semanas"],
  ["Llegada", "Empadronamiento y TIE (autorización de más de 6 meses).", "2–6 semanas"],
  ["Primer año", "Plan de investigación y documento de actividades; evaluación anual de la comisión académica.", "anual"],
  ["Renovaciones", "Matrícula de tutela cada año; autorización cada 2 años (hasta 90 días después del vencimiento).", "cada año / 2 años"],
  ["Defensa", "Depósito dentro de 4 años a tiempo completo (7 a parcial) + 1 de prórroga. Mención internacional: 3 meses fuera, informes y experto extranjero.", "3–5 años"],
];

export const CALENDARIO_PATRON = [
  "Abren entre mayo y septiembre y cierran entre junio y octubre. Primavera/verano: Pompeu Fabra (desde noviembre), Oviedo y València (junio), Zaragoza (julio), Salamanca (07/09).",
  "Plazo corto en septiembre: Galicia (01–08/09), Sevilla, Málaga, Valladolid, Jaén, Córdoba, Extremadura, Alcalá.",
  "Octubre: Alicante, Cádiz, Castilla-La Mancha (por confirmar), Politècnica de València (15/10), CEU (22/10).",
  "Resolución entre finales de septiembre y noviembre; matrícula casi siempre en octubre o noviembre. El doctorado empieza con la matrícula (Complutense 15/10, Politécnica de Madrid 01/10, Carlos III 15/11, Nebrija enero).",
  "Segundo plazo entre enero y marzo (normalmente solo con vacantes) en 12 universidades: Autónoma de Madrid, Granada, Córdoba, Jaén, las tres de Galicia, Alicante, Sevilla, Murcia, Politècnica de València y Navarra.",
  "Todo el año: Politècnica de Catalunya; Zaragoza desde octubre con vacantes; Comillas en varios programas.",
  "Para empezar en octubre de 2027: arrancar en noviembre de 2026 (10–14 meses del primer contacto a la llegada).",
];

export const DOCUMENTOS = [
  "Pasaporte vigente (todas las páginas)", "Título de licenciatura o grado, apostillado", "Certificado de notas con escala y carga horaria, apostillado",
  "Título de maestría y sus notas, apostillados", "Carta de la universidad de origen: el título da acceso al doctorado", "Traducciones juradas (si no está en español)",
  "Declaración de equivalencia de nota media (Complutense y otras)", "CV académico", "Carta de motivación", "Anteproyecto de investigación",
  "Aval o carta de compromiso del director", "Certificado de idioma (si el programa lo pide)", "Justificante de la comprobación de nivel",
  "Resolución de admisión y justificante de matrícula", "Formulario MI-T y tasa 790-038", "Medios económicos (50 % del SMI)",
  "Seguro médico sin copagos ni carencias", "Antecedentes penales (2 años) + declaración responsable (5)", "En España: empadronamiento, EX-17 y tasa 790-012 para la TIE",
];

export const ERRORES = [
  "No tener la carta que acredita el acceso al doctorado en su país.",
  "Dar por hecho que la licenciatura sin maestría basta.",
  "Apostillar tarde o traducir sin traducción jurada.",
  "Olvidar el trámite previo de acceso (Salamanca, Zaragoza, Málaga…) y perder el plazo.",
  "Correos genéricos y masivos a profesores.",
  "Pedir la admisión sin el aval del director.",
  "Confundir el calendario: la matrícula llega en octubre/noviembre y la residencia va después; hay que ir con margen para no llegar tarde.",
  "No acreditar los medios (8.547 €/año sin contrato).",
  "Olvidar las renovaciones anuales de matrícula, la evaluación y la renovación de la autorización.",
];

export const COSTES = [
  ["Pública: tutela anual", "Entre 60,30 € (Andalucía) y 401,12 € (Cataluña). Madrid 390 €, Castilla y León 400,85 €, Valencia 300 €, Galicia 200 €. Media nacional 254,4 €."],
  ["Pública: doctorado completo", "≈ 600 € a 2.500 € en tasas (apertura, tutelas, defensa 117–260 €, título 183–287 €)."],
  ["Recargo a extranjeros", "Ninguna comunidad lo aplica a la tutela de doctorado. Sí puede aplicarse a los complementos de formación (Valencia al doble, La Rioja)."],
  ["Privada", "Entre 425 € y 3.640 € al año: Navarra 1.750 €, Nebrija 1.100–1.550 €, CEU 2.630–3.050 €, UCAM 1.350 € (+2.000 € por reconocer título extranjero). Completo: ≈ 5.500 € a 15.000 €."],
  ["Coste de vida (orientativo)", "Madrid 800–1.100 €/mes, Barcelona 720–1.200 €/mes, Granada 700–800 €/mes (guías de UCM, UAB y UGR; los alquileres de 2026 suelen estar en la parte alta)."],
];

export const BECAS = [
  ["FPU (Ministerio)", "25.116 € brutos/año, 4 años. FPU 2026 sale después del verano (AEI); ya no exige estar admitido al solicitar. En la práctica, el no UE necesita NIE para solicitar."],
  ["FPI / contratos de proyectos PID (AEI)", "El grupo del proyecto selecciona; sin requisito de nacionalidad. Plazas que salen entre finales de año y primavera."],
  ["FPI-UAM 2026", "ABIERTA hasta el 27/09/2026: 20 contratos; nota media 7,5 (7,0 en ingenierías); admitido o preadmitido en un doctorado."],
  ["«la Caixa» INPhINIT", "Cualquier nacionalidad; 35.800 €/año de coste laboral (≥25.000 € brutos). Incoming: no haber residido más de 12 meses en España en los 3 años anteriores. Ciclo enero–febrero."],
  ["AGAUR FI (Cataluña) · ACIF (Valencia)", "Contratos predoctorales autonómicos que admiten no UE. FI: enero; ACIF: noviembre."],
  ["Fundación Carolina", "Solo docentes o personal de universidades latinoamericanas asociadas, con retorno: 1.200 €/mes durante las estancias. Plazo enero–abril."],
  ["AUIP", "Movilidad (hasta 1.200 € de viaje) para miembros de instituciones asociadas. Convocatorias en noviembre y abril."],
];

export const MERCADO = [
  ["1.234", "programas de doctorado oficiales vigentes (RUCT)"],
  ["83", "universidades con doctorado (50 públicas, 33 privadas)"],
  ["14.166", "doctorandos latinoamericanos (14,5 % del total)"],
  ["44 %", "de los latinoamericanos, en Ciencias Sociales y Jurídicas"],
];

export const FUENTES = [
  ["Criterio de gestión DGGM 2/2026", "https://ciudadaniaexterior.inclusion.gob.es/documents/d/unidadgrandesempresas/criterio-de-gestion-dggm-2-2026.pdf"],
  ["Guía UGE para doctorandos", "https://ciudadaniaexterior.inclusion.gob.es/documents/d/unidadgrandesempresas/instrucciones-presentacion-autorizaciones-estudiantes-doctorado.pdf"],
  ["Ley 14/2013 (art. 72 y ss.)", "https://www.boe.es/buscar/act.php?id=BOE-A-2013-10074"],
  ["RD 99/2011 de doctorado (consolidado)", "https://www.boe.es/buscar/act.php?id=BOE-A-2011-2541"],
  ["SMI 2026 (RD 126/2026)", "https://www.boe.es/buscar/doc.php?id=BOE-A-2026-3815"],
  ["Datos y Cifras del SUE 2025/26", "https://www.ciencia.gob.es/dam/jcr:747444d8-7089-4b15-97e1-0fc27874e6a7/DatosCifras_SUE2025_2026.pdf"],
  ["RUCT (consulta de títulos)", "https://www.educacion.gob.es/ruct/consultaestudios?actual=estudios"],
];
