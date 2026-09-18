// Plantillas del servicio de Doctorado (18/09/2026). Cada una recibe los datos
// del caso y devuelve texto listo para copiar. Reglas:
//  · lo que sale hacia el asesorado va de usted y en registro formal;
//  · el correo al director lo firma el asesorado (primera persona);
//  · carta de motivación y anteproyecto son ESTRUCTURAS con huecos: el
//    contenido científico lo escribe el asesorado (no redactamos su tesis).
// Cifras: SMI 2026 = 17.094 €/año (RD 126/2026); UGE pide el 50 % sin
// familiares y el 100 % con ellos.

export const SMI_ANUAL = 17094;

export const VACIO = {
  nombre: "", pais: "", correo: "", titulo_grado: "", titulo_master: "", uni_origen: "",
  programa: "", uni_destino: "", director: "", director_correo: "", linea: "", tema: "", publicacion: "",
  familiares: "0", desde_espana: "no", financiacion: "fondos propios", asesor: "",
};

const hueco = (v, t) => (String(v || "").trim() ? String(v).trim() : `[${t}]`);
const eur = (n) => `${Math.round(n).toLocaleString("es-ES")} €`;

export function mediosNecesarios(d) {
  const fam = Math.max(0, Number(d.familiares) || 0);
  return { fam, minimo: fam > 0 ? SMI_ANUAL : SMI_ANUAL / 2 };
}

export const PLANTILLAS = [
  {
    id: "director",
    titulo: "Correo al posible director de tesis",
    para: "Lo envía el asesorado, un correo por profesor (nunca en masa).",
    asunto: (d) => `Solicitud de dirección de tesis · ${hueco(d.programa, "programa de doctorado")} · ${hueco(d.tema, "tema")}`,
    texto: (d) => `Estimado/a Dr./Dra. ${hueco(d.director, "apellido del profesor")}:

Me dirijo a usted porque estoy preparando mi candidatura al ${hueco(d.programa, "programa de doctorado")} de la ${hueco(d.uni_destino, "universidad")} y mi propuesta de investigación encaja con su línea sobre ${hueco(d.linea, "línea de investigación del profesor")}.

He leído su trabajo ${hueco(d.publicacion, "título de un artículo reciente suyo")} y me interesa especialmente ${hueco("", "qué le interesa de ese trabajo y por qué, en 1–2 frases propias")}.

Soy ${hueco(d.titulo_master, "máster")} por la ${hueco(d.uni_origen, "universidad de origen")} (${hueco(d.pais, "país")}) y ${hueco(d.titulo_grado, "grado o licenciatura")}. Mi propuesta, «${hueco(d.tema, "título provisional")}», plantea ${hueco("", "pregunta de investigación en una frase")}. Adjunto un anteproyecto de una página y mi CV.

Tengo prevista la financiación mediante ${hueco(d.financiacion, "fondos propios / beca / contrato")} y quisiera presentar la solicitud en el plazo de ${hueco("", "fechas de preinscripción del programa")}.

¿Estaría dispuesto/a a valorar la dirección o tutela de mi tesis y, en su caso, a firmar la carta de aval que pide el programa? Quedo a su disposición para una breve reunión en línea.

Un cordial saludo,

${hueco(d.nombre, "nombre completo")}
${hueco(d.correo, "correo")}`,
  },
  {
    id: "acceso",
    titulo: "Solicitud del certificado de acceso a doctorado (universidad de origen)",
    para: "Lo envía el asesorado a su universidad. Es el documento que más suele faltar.",
    asunto: () => "Solicitud de certificado: el título faculta para el acceso a estudios de doctorado",
    texto: (d) => `A la Secretaría General / Oficina de Registros Académicos de la ${hueco(d.uni_origen, "universidad de origen")}:

${hueco(d.nombre, "nombre completo")}, con documento de identidad n.º [número], titulado/a en ${hueco(d.titulo_master || d.titulo_grado, "título")} por esta universidad, solicita respetuosamente la expedición de un certificado en el que conste que:

1. El título de ${hueco(d.titulo_master || d.titulo_grado, "título")} es un título oficial de posgrado (o equivalente) de esta institución.
2. Dicho título faculta, en ${hueco(d.pais, "país")}, para el acceso a estudios de doctorado.

El certificado se presentará ante la ${hueco(d.uni_destino, "universidad española")} (España) para el acceso a un programa de doctorado, conforme al artículo 6.2 del Real Decreto 99/2011. Solicito, si es posible, que se emita firmado y en condiciones de ser apostillado.

Atentamente,

${hueco(d.nombre, "nombre completo")}
${hueco(d.correo, "correo")}`,
  },
  {
    id: "motivacion",
    titulo: "Carta de motivación: estructura",
    para: "Esqueleto para el asesorado. Él escribe el contenido; nosotros revisamos la forma.",
    asunto: () => "Carta de motivación · estructura",
    texto: (d) => `CARTA DE MOTIVACIÓN · ${hueco(d.programa, "programa")} · ${hueco(d.uni_destino, "universidad")}
(Extensión orientativa: 1 página, 4 párrafos. Redacción propia del candidato.)

1. Quién soy y qué propongo (3–4 líneas)
   · Formación: ${hueco(d.titulo_grado, "grado")}, ${hueco(d.titulo_master, "máster")} (${hueco(d.uni_origen, "universidad")}).
   · Propuesta: «${hueco(d.tema, "título provisional")}».

2. Por qué este programa y esta línea (5–6 líneas)
   · Línea del programa con la que encaja: ${hueco(d.linea, "línea de investigación")}.
   · Grupo o director: ${hueco(d.director, "director/a")} — qué aporta su trabajo a la propuesta.

3. Qué he hecho que me prepara (5–6 líneas)
   · Trabajo de fin de máster, publicaciones, experiencia profesional o docente relacionada.
   · Métodos o herramientas que ya domino.

4. Qué espero aportar y después (3–4 líneas)
   · Resultado esperado de la tesis y su utilidad.
   · Plan profesional o académico tras el doctorado.

Revisión de Inspira: extensión, estructura, coherencia con el programa y corrección formal. No se revisa ni se redacta el contenido científico.`,
  },
  {
    id: "anteproyecto",
    titulo: "Anteproyecto de investigación: índice orientativo",
    para: "Para una propuesta de 1–3 páginas. Cada programa puede pedir su propio formato.",
    asunto: () => "Anteproyecto · índice orientativo",
    texto: (d) => `ANTEPROYECTO DE TESIS DOCTORAL
Título provisional: ${hueco(d.tema, "título")}
Candidato/a: ${hueco(d.nombre, "nombre")} · Programa: ${hueco(d.programa, "programa")} · ${hueco(d.uni_destino, "universidad")}
Director/a propuesto/a: ${hueco(d.director, "director/a")}

1. Planteamiento y justificación (problema, relevancia, hueco en la literatura)
2. Estado de la cuestión (5–10 referencias clave, incluidas las del grupo del director)
3. Pregunta(s) de investigación e hipótesis
4. Objetivos: general y 2–4 específicos
5. Metodología (diseño, fuentes o muestra, técnicas de análisis)
6. Cronograma por años (plan de 3 años a tiempo completo)
7. Resultados esperados y difusión
8. Bibliografía

Nota: el contenido es del candidato. Inspira revisa la forma y la adecuación al formato que pide el programa.`,
  },
  {
    id: "checklist",
    titulo: "Documentos para la residencia (UGE) · para el asesorado",
    para: "Se envía al asesorado. Formal, de usted.",
    asunto: () => "Documentación para su autorización de residencia para investigación (doctorado)",
    texto: (d) => {
      const { fam, minimo } = mediosNecesarios(d);
      const fuera = d.desde_espana !== "si";
      return `Estimado/a ${hueco(d.nombre, "nombre")}:

Le indicamos la documentación necesaria para solicitar su autorización de residencia para investigación ante la Unidad de Grandes Empresas y Colectivos Estratégicos (UGE-CE), vía que corresponde a los estudios de doctorado desde el Criterio de gestión DGGM 2/2026.

DOCUMENTACIÓN
1. Pasaporte completo y vigente.
2. Formulario MI-T cumplimentado (lo preparamos nosotros para su firma).
3. Resolución de admisión y justificante de matrícula pagada en el ${hueco(d.programa, "programa")} de la ${hueco(d.uni_destino, "universidad")}.
4. Acreditación de medios económicos por un mínimo de ${eur(minimo)} al año${fam > 0 ? ` (100 % del SMI, al incluir ${fam} familiar${fam === 1 ? "" : "es"})` : " (50 % del SMI anual)"}, mediante ${hueco(d.financiacion, "extractos bancarios, beca o contrato")}.
5. Seguro médico sin copagos ni carencias, con cobertura en España (no se admite un seguro de viaje).
6. Certificado de antecedentes penales de los últimos dos años, apostillado y, en su caso, traducido, y declaración responsable de los últimos cinco años.
7. Justificante del pago de la tasa 790-038 (epígrafe 7.1).
${fam > 0 ? `8. Para cada familiar: pasaporte, documento que acredite el vínculo (apostillado) y formulario MI-F.\n` : ""}
PLAZOS Y TRAMITACIÓN
· La UGE resuelve en un plazo de veinte (20) días; transcurrido sin respuesta, la solicitud se entiende estimada.
${fuera ? "· Concedida la autorización, deberá solicitar el visado en el consulado de España de su país de residencia (resolución en diez (10) días hábiles, más el tiempo de cita)." : "· Al encontrarse en España en situación regular, no necesitará visado."}
· Tras su llegada o concesión, deberá empadronarse y solicitar la TIE.

ADVERTENCIA
La concesión corresponde a la Administración. La falta o insuficiencia de cualquiera de los documentos indicados puede dar lugar a un requerimiento o a la denegación de la solicitud.

Atentamente,
${hueco(d.asesor, "nombre del asesor")}
Inspira Legal`;
    },
  },
  {
    id: "antecedentes",
    titulo: "Declaración responsable de antecedentes (últimos 5 años)",
    para: "Modelo para que firme el asesorado; acompaña al certificado de 2 años.",
    asunto: () => "Declaración responsable de ausencia de antecedentes penales",
    texto: (d) => `DECLARACIÓN RESPONSABLE

D./D.ª ${hueco(d.nombre, "nombre completo")}, de nacionalidad ${hueco(d.pais, "nacionalidad")}, con pasaporte n.º [número],

DECLARA bajo su responsabilidad:

Que en los últimos cinco (5) años no ha sido condenado/a por delitos existentes en el ordenamiento jurídico español en ningún país en el que haya residido.

Y para que conste a los efectos de la solicitud de autorización de residencia para investigación ante la Unidad de Grandes Empresas y Colectivos Estratégicos, firma la presente en [lugar], a [fecha].

Firma: ______________________`,
  },
];
