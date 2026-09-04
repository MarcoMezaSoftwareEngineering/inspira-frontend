// src/pages/panel/BecasEspana.jsx
import { useState, useMemo } from "react";

const BD = [
  {id:"upv",grupo:"AUIP – UPV Universitat Politècnica de València",becas:"33 ayudas",dot:"Matrícula 60 ECTS + €750 bolsa de viaje",estado:"cerrada2026",tipo:"AUIP",cob:["Matrícula hasta 60 ECTS","€750 bolsa de viaje al incorporarse y presentar 1er informe bimensual","SOLO válida para másteres presenciales o híbridos"],req:["Egresado de universidad latinoamericana (no es obligatorio pertenecer a AUIP)","No haber residido en España más de 12 meses en los últimos 3 años","Preinscripción en Fase 0 o Fase 1 del máster UPV ANTES de solicitar la beca","Nuevo ingreso en la UPV"],doc:["Pasaporte","Título apostillado","Equivalencia nota media MEC (obligatorio)","Comprobante preinscripción UPV (Fase 0 o 1)","Declaración jurada no residencia (Anexo IV)","Seguro privado de salud (obligatorio)"],areas:["ingenieria","arquitectura","ciencias","economia","tecnologia","medioambiente"],nota:"⚠️ Preinscripción UPV Fase 1 cierra también el 30 de abril — hacer ambos a la vez.",link:"https://auip.org/es/becas-auip/3030-becas-auip325"},
  {id:"uah",grupo:"AUIP – UAH Universidad de Alcalá (Becas Miguel de Cervantes)",becas:"20 becas",dot:"Matrícula precio UE + €1.300 alojamiento Residencia CRUSA",estado:"proxima",tipo:"AUIP",cob:["Matrícula a precio UE (mucho menor que extracomunitario)","€1.300 alojamiento en Residencia Universitaria CRUSA (habitación doble compartida)"],req:["Egresado/profesor de universidad AUIP extranjera","No residir en España","Preinscripción en máster UAH + pago €250 reserva de plaza","Registro en Santander Open Academy (obligatorio como plataforma de inscripción)"],doc:["Pasaporte","Título apostillado","Cert. calificaciones","Comprobante preinscripción UAH","Resguardo Santander Open Academy","Carta de referencia autoridad académica (recomendada)"],areas:["derecho","ciencias","educacion","ingenieria","humanidades","economia","salud","tecnologia","medioambiente","comunicacion"],nota:"Cierre 19 junio 2026. Santander Open Academy es SOLO la plataforma de inscripción.",link:"https://auip.org/es/becas-auip/3040-becas-auip328"},
  {id:"uv",grupo:"AUIP – UV Universitat de València",becas:"8 nuevas + 4 renovaciones",dot:"Matrícula 60 ECTS + €2.500 + alojamiento Colegio Mayor",estado:"cerrada2026",tipo:"AUIP",cob:["Matrícula hasta 60 ECTS","Ayuda económica global €2.500","Alojamiento + manutención pensión completa en Colegio Mayor UV"],req:["Egresado de universidad latinoamericana AUIP","Nota media ≥8/10","No haber residido en España más de 12 meses en últimos 3 años","No tener nacionalidad española"],doc:["Pasaporte","Título apostillado","Cert. calificaciones con nota media","Carta de referencia rector/vicerrector","Compromiso de preinscripción en máster UV"],areas:["derecho","ciencias","educacion","ingenieria","humanidades","economia","salud","arte","tecnologia","medioambiente","cooperacion","comunicacion"],nota:"Cerrada 24 abr 2026. Nueva convocatoria ~abr 2027.",link:"https://auip.org/es/becas-auip/3032-becas-auip326"},
  {id:"uc3m",grupo:"AUIP – UC3M Universidad Carlos III de Madrid",becas:"15 ayudas",dot:"Matrícula 60 ECTS + bolsa €1.500",estado:"cerrada2026",tipo:"AUIP",cob:["Matrícula hasta 60 ECTS","Bolsa de estudios €1.500"],req:["Egresado de universidad latinoamericana AUIP","Solicitud admisión UC3M + pago tasa acceso antes del 30 abr","Carta de motivación","Carta de presentación de autoridad AUIP"],doc:["Pasaporte","Carta de motivación","Carta presentación AUIP","Documentación económica (opcional)"],areas:["derecho","humanidades","tecnologia","arte","comunicacion","ingenieria","economia","ciencias"],nota:"Cerrada 30 abr 2026.",link:"https://www.uc3m.es/becas-ayudas"},
  {id:"urjc",grupo:"AUIP – URJC Universidad Rey Juan Carlos",becas:"Variable (máx. 2 por máster)",dot:"Hasta €5.077,85 en matrícula (60 ECTS)",estado:"cerrada2026",tipo:"AUIP",cob:["Matrícula hasta 60 ECTS (máx. €5.077,85)","Si la matrícula cuesta menos, no hay efectivo adicional"],req:["Egresado de universidad latinoamericana AUIP","No tener nacionalidad española ni residir en España","No haber sido beneficiario AUIP antes"],doc:["Pasaporte","Título apostillado","Cert. calificaciones","CV modelo AUIP"],areas:["derecho","ciencias","educacion","ingenieria","humanidades","economia","salud","tecnologia","medioambiente","comunicacion","logistica"],nota:"Cerrada 30 abr 2026. ⚠️ No convocó en 2025 — no es garantía anual.",link:"https://auip.org/es/becas-auip/3038-becas-auip327"},
  {id:"andalucia",grupo:"AUIP – Universidades Andaluzas (Programa García Lorca)",becas:"56 becas",dot:"Matrícula + alojamiento y manutención período presencial",estado:"cerrada2026",tipo:"AUIP",cob:["Exención matrícula hasta 60 ECTS","Alojamiento y manutención (pensión completa) durante período presencial"],req:["Egresado/docente de universidad latinoamericana o portuguesa AUIP","No residir en España","Nota media 7.5–10/10"],doc:["Pasaporte","Título apostillado","Cert. calificaciones","Carta de motivación","Vinculación AUIP"],areas:["derecho","ciencias","educacion","ingenieria","humanidades","economia","salud","arte","tecnologia","medioambiente","cooperacion"],nota:"Cerrada 8 abr 2026. Nueva convocatoria ~mar–abr 2027. Plataforma: solicitudeslorca.auip.org",link:"https://auip.org/es/becas-federico-garcia-lorca"},
  {id:"usc",grupo:"AUIP – USC Universidade de Santiago de Compostela",becas:"20 becas (generales + específicas)",dot:"€5.000 general / €1.500 Ing. Ambiental + Ing. Química / €1.000 Matemáticas",estado:"cerrada2026",tipo:"AUIP",cob:["€5.000 beca general","€1.500 becas específicas: M. Ing. Ambiental (3 becas) y M. Ing. Química y Bioprocesos (2 becas)","€1.000 becas específicas: M. Matemáticas virtual (5 becas)"],req:["Egresado o docente de universidad latinoamericana AUIP","Nota media >8/10","No residir en España","B2 en idioma distinto al nativo"],doc:["Pasaporte","Título apostillado","Cert. calificaciones","Cert. idioma B2","CV modelo AUIP","Carta de motivación"],areas:["ingenieria","ciencias","tecnologia","medioambiente","humanidades","economia","derecho","salud","educacion","arte"],nota:"Cerrada 20 mar 2026. Nueva convocatoria ~ene–mar 2027.",link:"https://auip.org/es/becas-auip/3028-becas-auip324"},
  {id:"upna",grupo:"AUIP – UPNA Universidad Pública de Navarra",becas:"~3 becas",dot:"€8.000 globales (matrícula + alojamiento + manutención)",estado:"cerrada2026",tipo:"AUIP",cob:["€8.000 para matrícula + alojamiento + manutención","Posibilidad de continuar con beca de Doctorado al terminar"],req:["Egresado de universidad latinoamericana AUIP","Residir en América Latina al momento de aplicar","Nota media ≥8/10","B2 inglés para programas en inglés"],doc:["Pasaporte","Título apostillado","Cert. calificaciones con equivalencia MEC","Cert. idioma si aplica"],areas:["economia","ingenieria","tecnologia","salud","medioambiente","derecho","humanidades","educacion"],nota:"Cerrada 23 abr 2026. Incompatible con becas Talento y Fundación Carolina.",link:"https://auip.org/es/becas-auip/3058-becas-auip331"},
  {id:"ucm",grupo:"AUIP – UCM Universidad Complutense de Madrid",becas:"Hasta 10 becas",dot:"50%, 75% o 100% de matrícula según puntuación",estado:"proxima",tipo:"AUIP",cob:["Exención del 100%, 75% o 50% de la matrícula hasta 60 ECTS según puntuación"],req:["Egresado de universidad latinoamericana o del Caribe AUIP","No ser residente en España ni en otro país UE","Nuevo ingreso en máster UCM","No poseer otro título de máster"],doc:["Pasaporte","Resguardo solicitud admisión máster UCM","Carta de motivación","Declaración equivalencia nota media MEC"],areas:["derecho","ciencias","educacion","ingenieria","humanidades","economia","salud","arte","tecnologia","medioambiente","cooperacion","comunicacion"],nota:"⚠️ Plazo históricamente MUY corto (~2 semanas en julio). Vigilar ucm.es/becas-ayudas desde junio.",link:"https://www.ucm.es/becas-ayudas"},
  {id:"talent",grupo:"TalentUnileon – Universidad de León (ULE)",becas:"15 becas (2 con bonus Santander +€1.800)",dot:"Matrícula + complementos hasta €300 + €3.000 bolsa",estado:"abierta",tipo:"TalentUnileon",cob:["Matrícula de primer curso","Complementos formativos hasta €300","Bolsa €3.000 (seguro de salud + desplazamiento)","Curso español 40h gratuito si lengua materna no es español","2 mejores candidaturas: +€1.800 bonus Santander"],req:["Cualquier latinoamericano — NO requiere pertenecer a AUIP ni ninguna red","No poseer residencia legal permanente en España","Nota media ≥8/10","Preinscripción en máster ULE desde 1 de abril (preinscripcion.unileon.es)","Equivalencia oficial MEC de notas (obligatorio)","No tener título de nivel igual o superior al máster"],doc:["Pasaporte","Título apostillado","Cert. calificaciones + equivalencia MEC","Resguardo preinscripción ULE","Declaración jurada no residencia"],areas:["derecho","ciencias","salud","ingenieria","economia","tecnologia","deporte","medioambiente","humanidades"],nota:"Email: talent@unileon.es. No requiere AUIP ni convenio.",link:"https://www.unileon.es/internacional/estudiantes/estudiantes-internacionales/becas-talentunileon"},
  {id:"luisvives",grupo:"Becas Luis Vives – Universitat de València",becas:"~12 nuevas + 6 renovaciones",dot:"🏆 BECA COMPLETA: matrícula + vuelo + alojamiento + manutención + seguro + €700",estado:"proxima",tipo:"Universidad",cob:["100% tasas de matrícula y preinscripción","Billete avión ida/vuelta clase turista","Alojamiento + manutención pensión completa en Colegio Mayor UV","Seguro de repatriación y asistencia médica","€700 para transporte urbano, material y depósito de título"],req:["⚠️ Solo 11 países: Bolivia, Colombia, Cuba, Ecuador, El Salvador, Guatemala, Honduras, Nicaragua, Paraguay, Perú, Rep. Dominicana","Residir en el país de origen (NO en España)","No tener nacionalidad española ni permiso de residencia en España","⭐ Nota media MÍNIMA 9/10 — muy exigente","No poseer título de máster previo","Acreditar situación económica desfavorable"],doc:["Pasaporte","Título apostillado","Cert. calificaciones con nota 9/10","Documentación económica familiar","Carta de motivación"],areas:["derecho","ciencias","educacion","ingenieria","humanidades","economia","salud","arte","tecnologia","medioambiente","cooperacion"],nota:"⭐ La beca más completa, pero la más exigente: nota 9/10. Solo 11 países.",link:"https://www.uv.es/uvcooperation"},
  {id:"usal",grupo:"Becas Internacionales Máster – Universidad de Salamanca (USAL)",becas:"~25 becas (+10 ICETEX Colombia)",dot:"Matrícula + alojamiento residencias USAL + manutención + seguro",estado:"proxima",tipo:"Universidad",cob:["Exención tasas académicas de matrícula","Alojamiento + manutención en Residencias Universitarias USAL (habitación doble)","Seguro de asistencia sanitaria"],req:["País latinoamericano elegible","No residir en España","Registro en Santander Open Academy (solo plataforma de inscripción)","Preinscripción en máster USAL","Equivalencia nota media MEC (obligatorio)","Carta de motivación máx. 2.000 caracteres"],doc:["Pasaporte","Cert. calificaciones + equivalencia MEC","Resguardo preinscripción USAL","Carta de motivación"],areas:["derecho","ciencias","educacion","ingenieria","humanidades","economia","salud","arte","tecnologia","medioambiente","cooperacion"],nota:"⚠️ Plazo históricamente MUY CORTO (~2 semanas en marzo–abril). Vigila rel-int.usal.es desde enero.",link:"https://rel-int.usal.es"},
  {id:"carolina",grupo:"Fundación Carolina – Becas de Posgrado (Másteres)",becas:"228 becas posgrado (736 total)",dot:"Matrícula + ~€1.200/mes + vuelo + seguro médico",estado:"cerrada2026",tipo:"Fundacion",cob:["Matrícula completa","~€1.200/mes manutención","Seguro médico en España","Vuelo ida y vuelta"],req:["Ciudadano latinoamericano o iberoamericano","Grado universitario","Expediente sólido (>7.5 recomendado)","Vinculación con sector público, academia o tercer sector (muy valorado)","Proyecto profesional vinculado al desarrollo del país de origen"],doc:["Pasaporte","Título apostillado","Cert. calificaciones","CV académico/profesional","Carta motivación con enfoque en impacto social","Cartas de recomendación"],areas:["derecho","ciencias","educacion","ingenieria","humanidades","economia","salud","arte","tecnologia","medioambiente","cooperacion","comunicacion"],nota:"Cerrada mar 2026. Próxima apertura ~enero 2027. Plataforma: gestion.fundacioncarolina.es",link:"https://www.fundacioncarolina.es/convocatoria-de-becas-2026-2027/"},
  {id:"maec",grupo:"MAEC-AECID – Programa Máster (SOLO empleados públicos)",becas:"~90 nuevas becas",dot:"€1.900/mes + seguro sanitario (10 meses: sep–jul)",estado:"proxima",tipo:"MAEC",cob:["€1.900/mes durante 10 meses (septiembre a julio)","Seguro de asistencia sanitaria en España"],req:["⚠️ EXCLUSIVAMENTE empleados públicos fijos o personal fijo del sistema educativo/universitario","Países: Bolivia, Colombia, Cuba, Ecuador, El Salvador, Guatemala, Haití, Honduras, Paraguay, Perú, Rep. Dominicana, Filipinas","No residir en España","No haber sido becario MAEC-AECID en los últimos 10 años"],doc:["Pasaporte","Acreditación de ser empleado público fijo","Cert. calificaciones","Preadmisión al máster en universidad española","Solicitud telemática vía sede electrónica AECID"],areas:["derecho","ciencias","educacion","ingenieria","humanidades","economia","salud","arte","tecnologia","medioambiente","cooperacion","comunicacion"],nota:"SOLO empleados públicos. Plazo histórico: ~2 semanas en enero–febrero. Seguir el BOE.",link:"https://www.aecid.es"},
  {id:"santander_uc3m",grupo:"Beca Santander – Ayudas Completas Máster UC3M",becas:"18 plazas",dot:"€10.000 + matrícula incluida",estado:"proxima",tipo:"Santander",cob:["€10.000 ayuda económica global","Matrícula del máster incluida"],req:["Ser graduado (no estudiante en curso)","Matriculado o admitido en máster presencial UC3M","Registro en Santander Open Academy (plataforma)","Proceso de selección competitivo — 18 plazas"],doc:["Pasaporte o DNI","Carta de admisión al máster UC3M","Expediente académico","Registro Santander Open Academy"],areas:["derecho","humanidades","tecnologia","comunicacion","ingenieria","economia","ciencias"],nota:"⚠️ Plazo muy corto. Santander Open Academy es solo la plataforma de inscripción.",link:"https://www.santanderopenacademy.com"},
  {id:"erasmus",grupo:"Erasmus Mundus – Másteres Conjuntos (EMJM)",becas:">2.500 becas anuales (UE)",dot:"Matrícula + hasta €1.400/mes + vuelo + seguro (hasta 24 meses)",estado:"abierta",tipo:"Erasmus",cob:["Matrícula completa en consorcio europeo","Hasta €1.400/mes (máx. 24 meses)","Billete avión ida y vuelta","Seguro médico","Estudias en al menos 2 países europeos distintos"],req:["Grado universitario (mín. 16 años de educación total)","IELTS ≥6.5 o TOEFL ≥90","No haber vivido en la UE más de 12 meses en los últimos 5 años","Sin restricción de edad ni nota mínima global","Máximo 3 programas distintos por candidato"],doc:["Título apostillado","Cert. calificaciones","IELTS/TOEFL","CV en inglés","Carta de motivación en inglés","2 cartas de recomendación"],areas:["derecho","ciencias","educacion","ingenieria","humanidades","economia","salud","arte","tecnologia","medioambiente","cooperacion","comunicacion"],nota:"Aplicar directamente en la web de cada programa. Muchos cierran en enero. Verificar vigencia.",link:"https://erasmus-plus.ec.europa.eu/opportunities/individuals/students/erasmus-mundus-joint-masters"},
];

const PAISES_AUIP = [
  {p:"🇦🇷 Argentina",u:["U. de Buenos Aires (UBA)","U. Nac. de Córdoba (UNC)","U. Nac. de La Plata","U. Nac. de Cuyo","U. Nac. del Litoral","U. Nac. de Mar del Plata","U. Nac. de San Martín","U. Nac. de Quilmes","U. Siglo 21","y otras (~28 total) — ver auip.org"]},
  {p:"🇧🇴 Bolivia",u:["U. Católica Boliviana San Pablo","U. Mayor Real y Pontificia UMRPSFXCH","U. Privada de Santa Cruz","U. Privada del Valle","U. Tecnológica Privada de Santa Cruz"]},
  {p:"🇧🇷 Brasil",u:["U. de São Paulo (USP)","U. Estadual de Campinas (UNICAMP)","U. Estadual Paulista (UNESP)","U. Federal de Minas Gerais (UFMG)","U. Federal do Rio Grande do Sul (UFRGS)","U. de Brasília (UnB)","PUC Minas Gerais","PUC Rio Grande do Sul (PUCRS)","y otras (~15 total)"]},
  {p:"🇨🇱 Chile",u:["Pontificia U. Católica de Chile","U. de Chile","U. de Concepción","U. de Santiago (USACH)","U. Técnica F. Santa María","U. Austral de Chile","U. de La Frontera","U. de Valparaíso","y otras (~15 total)"]},
  {p:"🇨🇴 Colombia",u:["U. de los Andes","U. Nacional de Colombia","Pontificia U. Javeriana (Bogotá y Cali)","U. de Antioquia","U. del Valle","U. del Rosario","U. Industrial de Santander (UIS)","U. EAFIT","U. Externado de Colombia","U. de Medellín","U. Distrital Francisco José de Caldas","U. Libre","y otras (~49+ total)"]},
  {p:"🇨🇷 Costa Rica",u:["U. de Costa Rica (UCR)","U. Nacional (UNA)","Instituto Tecnológico de Costa Rica (TEC)","U. Estatal a Distancia (UNED)"]},
  {p:"🇨🇺 Cuba",u:["U. de La Habana","U. de Oriente","U. Central de Las Villas (UCLV)","U. de Holguín","U. de Camagüey"]},
  {p:"🇪🇨 Ecuador",u:["Escuela Politécnica Nacional (EPN)","U. Central del Ecuador","U. de Cuenca","FLACSO Ecuador","U. Técnica Particular de Loja (UTPL)","U. Técnica de Ambato","U. Andina Simón Bolívar","y otras (~16 total)"]},
  {p:"🇲🇽 México",u:["U. Nacional Autónoma de México (UNAM)","U. Autónoma Metropolitana (UAM)","U. Autónoma de Nuevo León (UANL)","U. de Guadalajara","Benemérita U. Autónoma de Puebla (BUAP)","U. Iberoamericana","ITESO","U. Autónoma de Sinaloa","U. Veracruzana","U. de Guanajuato","y otras (~20+ total)"]},
  {p:"🇵🇪 Perú",u:["Pontificia U. Católica del Perú (PUCP)","U. Nac. Mayor de San Marcos (UNMSM)","U. de Lima","U. Peruana Cayetano Heredia","U. Nac. de Ingeniería (UNI)","U. Peruana de Ciencias Aplicadas (UPC)","U. San Ignacio de Loyola (USIL)","y otras (~20 total)"]},
  {p:"🇻🇪 Venezuela",u:["U. Central de Venezuela (UCV)","U. de Los Andes (ULA)","U. Simón Bolívar (USB)","U. Católica Andrés Bello (UCAB)","U. del Zulia (LUZ)","U. de Carabobo"]},
  {p:"🇺🇾 Uruguay",u:["U. de la República (UdelaR)","U. de Montevideo","U. Católica del Uruguay","CLAEH","U. Tecnológica (UTEC)"]},
  {p:"🇵🇦 Panamá",u:["U. de Panamá","U. Tecnológica de Panamá (UTP)","U. Santa María La Antigua"]},
  {p:"🇵🇾 Paraguay",u:["U. Nacional de Asunción (UNA)","U. Autónoma de Asunción","U. Nacional del Este"]},
  {p:"🇩🇴 Rep. Dominicana",u:["Pontificia U. Católica Madre y Maestra (PUCMM)","Instituto Tecnológico de Santo Domingo (INTEC)","U. Nacional Pedro Henríquez Ureña"]},
  {p:"🇵🇹 Portugal",u:["U. de Coimbra","U. de Lisboa","U. de Aveiro","Instituto Politécnico de Leiria","Instituto Politécnico de Viana do Castelo"]},
];

const CCAA_DATA = [
  {ccaa:"🇪🇸 Nacional", ayudas:[
    {n:"Beca MEC 2026-27",t:"Estudio",d:"Matrícula + cuantías fija por renta (€1.700), residencia (€2.700) y excelencia (€50–125). Plazo: abril–mayo 2026.",r:"TIE en vigor, matriculado en máster oficial, umbrales económicos.",link:"https://www.becaseducacion.gob.es"},
    {n:"Bono Alquiler Joven",t:"Vivienda",d:"Hasta €300/mes vivienda o €200/mes habitación. Hasta 48 meses.",r:"18–35 años, TIE en vigor, ingresos <3×IPREM (~€25.200), contrato alquiler legal.",link:"https://www.mivau.gob.es/vivienda/bono-alquiler-joven"},
    {n:"Tarjeta sanitaria gratuita",t:"Salud",d:"Con TIE + empadronamiento puedes pedirla en tu centro de salud. Gratuita en la mayoría de CCAA.",r:"TIE en vigor + empadronado + más de 3 meses de estancia.",link:""},
  ]},
  {ccaa:"🏙️ Madrid", ayudas:[
    {n:"Bono Alquiler Joven Madrid",t:"Vivienda",d:"€250/mes hasta 2 años (€6.000 total). Verificar presupuesto 2026.",r:"18–35 años, contrato alquiler ≤€900/mes, ingresos <3×IPREM, empadronado.",link:"https://www.comunidad.madrid/servicios/vivienda/bono-alquiler-joven"},
    {n:"Abono Transporte Joven",t:"Transporte",d:"Tarjeta reducida para <26 años en Metro + Cercanías + buses EMT.",r:"<26 años, TIE o pasaporte en vigor.",link:"https://www.metromadrid.es"},
  ]},
  {ccaa:"🌊 Valencia", ayudas:[
    {n:"Beca de Excelencia GVA",t:"Estudio",d:"Hasta €1.800/año para estudiantes de máster oficial con nota ≥8.",r:"Matriculado en universidad valenciana, nota media ≥8, umbral económico.",link:"https://www.ceice.gva.es"},
    {n:"Bono Alquiler Joven GVA",t:"Vivienda",d:"Hasta €250/mes para jóvenes <35 años. Gestionado por la Generalitat Valenciana.",r:"Empadronado en C. Valenciana, ingresos <3×IPREM.",link:"https://habitatge.gva.es"},
  ]},
  {ccaa:"🌿 Andalucía", ayudas:[
    {n:"Becas Junta de Andalucía – Máster",t:"Estudio",d:"Ayudas complementarias para estudios de posgrado en universidades andaluzas.",r:"Matriculado en universidad andaluza, residencia habitual en Andalucía, umbral económico.",link:"https://www.juntadeandalucia.es/educacion"},
    {n:"Bono Joven Alquiler Andalucía",t:"Vivienda",d:"Hasta €250/mes para jóvenes <35 años. Gestionado por la Consejería de Fomento.",r:"Empadronado en Andalucía, ingresos <3×IPREM.",link:"https://www.juntadeandalucia.es/fomentoinfraestructuras"},
  ]},
  {ccaa:"🌿 País Vasco", ayudas:[
    {n:"Beca GV Máster",t:"Estudio",d:"Hasta €3.000/año para másteres oficiales en el País Vasco.",r:"Empadronado en País Vasco mínimo 2 años, matrícula máster oficial UPV/EHU o Deusto.",link:"https://www.euskadi.eus/becas"},
  ]},
];

const ESTADO_CFG = {
  abierta:      { label: "✅ Abierta",     bg: "bg-[#E8F5EE]", text: "text-[#1D6A4A]", border: "border-[#1D6A4A]/25" },
  proxima:      { label: "🔜 Próxima",     bg: "bg-amber-50",  text: "text-amber-700", border: "border-amber-200"     },
  cerrada2026:  { label: "🔒 Cerrada 26",  bg: "bg-red-50",    text: "text-red-700",   border: "border-red-200"       },
  cerrada2025:  { label: "📁 Cerrada 25",  bg: "bg-neutral-100", text: "text-neutral-500", border: "border-neutral-200" },
};

const TIPO_COLORES = {
  AUIP:         "bg-purple-50 text-purple-700 border-purple-200",
  TalentUnileon:"bg-[#E8F5EE] text-[#1D6A4A] border-[#1D6A4A]/20",
  Universidad:  "bg-pink-50 text-pink-700 border-pink-200",
  Fundacion:    "bg-[#E8F5EE] text-[#1D6A4A] border-[#1D6A4A]/20",
  MAEC:         "bg-red-50 text-red-700 border-red-200",
  Santander:    "bg-orange-50 text-orange-700 border-orange-200",
  Erasmus:      "bg-blue-50 text-blue-700 border-blue-200",
};

const AREA_OPTS = [
  {v:"",l:"Todas las áreas"},{v:"logistica",l:"📦 Logística"},{v:"economia",l:"💼 Economía y Negocios"},
  {v:"ingenieria",l:"⚙️ Ingeniería"},{v:"tecnologia",l:"💻 Tecnología"},{v:"derecho",l:"⚖️ Derecho"},
  {v:"salud",l:"🏥 Salud"},{v:"ciencias",l:"🔬 Ciencias"},{v:"humanidades",l:"📚 Humanidades"},
  {v:"educacion",l:"🎓 Educación"},{v:"medioambiente",l:"🌿 Medioambiente"},{v:"cooperacion",l:"🤝 Cooperación"},
  {v:"comunicacion",l:"📡 Comunicación"},{v:"arte",l:"🎨 Arte"},{v:"deporte",l:"⚽ Deportes"},
  {v:"arquitectura",l:"🏛️ Arquitectura"},
];
const TIPO_OPTS = [
  {v:"",l:"Todos los tipos"},{v:"AUIP",l:"AUIP"},{v:"TalentUnileon",l:"TalentUnileon"},
  {v:"Universidad",l:"Becas Universitarias"},{v:"Fundacion",l:"Fundación Carolina"},
  {v:"MAEC",l:"MAEC-AECID"},{v:"Santander",l:"Santander"},{v:"Erasmus",l:"Erasmus Mundus"},
];
const ESTADO_OPTS = [
  {v:"",l:"Todos los estados"},{v:"abierta",l:"✅ Abiertas ahora"},
  {v:"proxima",l:"🔜 Próximamente"},{v:"cerrada2026",l:"🔒 Cerradas 2026"},{v:"cerrada2025",l:"📁 Cerradas 2025"},
];

export default function BecasEspana() {
  const [tab, setTab]       = useState("becas");
  const [q, setQ]           = useState("");
  const [area, setArea]     = useState("");
  const [tipo, setTipo]     = useState("");
  const [estado, setEstado] = useState("");
  const [abierto, setAbierto] = useState(null);
  const [paisBusq, setPaisBusq] = useState("");

  const filtradas = useMemo(() => {
    return BD.filter((b) => {
      if (area && !b.areas.includes(area)) return false;
      if (tipo && b.tipo !== tipo) return false;
      if (estado && b.estado !== estado) return false;
      if (q) {
        const ql = q.toLowerCase();
        if (!b.grupo.toLowerCase().includes(ql) && !b.dot.toLowerCase().includes(ql) && !b.cob.join(" ").toLowerCase().includes(ql)) return false;
      }
      return true;
    });
  }, [q, area, tipo, estado]);

  const paisesFiltrados = useMemo(() => {
    if (!paisBusq) return PAISES_AUIP;
    const ql = paisBusq.toLowerCase();
    return PAISES_AUIP.filter((p) =>
      p.p.toLowerCase().includes(ql) || p.u.some((u) => u.toLowerCase().includes(ql))
    );
  }, [paisBusq]);

  function toggle(id) { setAbierto((v) => (v === id ? null : id)); }

  const tabs = [
    { id: "becas", label: "🎓 Becas" },
    { id: "auip",  label: "🏫 ¿Califico AUIP?" },
    { id: "ccaa",  label: "🏠 Ayudas en España" },
  ];

  return (
    <div className="flex-1 overflow-y-auto">
      {/* Header */}
      <div className="px-5 py-8 text-center relative overflow-hidden"
        style={{ background: "linear-gradient(135deg, #312e81 0%, #013446 45%, #1D6A4A 100%)" }}>
        <div className="text-3xl mb-2">🎓</div>
        <h1 className="font-serif text-2xl font-bold text-white mb-1">Becas para Latinos · España</h1>
        <p className="text-white/60 text-xs mb-4">Historial 2024–2026 · AUIP · TalentUnileon · Luis Vives · USAL · F. Carolina · MAEC · Santander · Erasmus Mundus</p>
        <div className="flex flex-wrap gap-2 justify-center">
          <span className="text-[11px] px-3 py-1 rounded-full bg-white/15 text-white border border-white/10">
            📋 {BD.length} programas
          </span>
          <span className="text-[11px] px-3 py-1 rounded-full bg-[#E8F5EE]/20 text-[#a7f3d0] border border-[#1D6A4A]/30">
            ✅ {BD.filter((b)=>b.estado==="abierta").length} abiertas
          </span>
          <span className="text-[11px] px-3 py-1 rounded-full bg-amber-400/15 text-amber-200 border border-amber-400/20">
            🔜 {BD.filter((b)=>b.estado==="proxima").length} próximas
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[#E2E8F0] bg-white overflow-x-auto sticky top-0 z-10">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-4 py-3 text-[13px] font-semibold border-b-2 transition-all whitespace-nowrap ${
              tab === t.id ? "text-primary border-primary" : "text-neutral-400 border-transparent hover:text-neutral-600"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* TAB BECAS */}
      {tab === "becas" && (
        <div>
          {/* Filtros */}
          <div className="bg-white border-b border-[#E2E8F0] px-4 py-3">
            <div className="max-w-3xl mx-auto space-y-2">
              <input
                type="search"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="🔍  Buscar beca, universidad, cobertura..."
                className="w-full px-3 py-2 text-[13px] border border-[#E2E8F0] rounded-lg bg-[#F4F6F9] text-neutral-800 placeholder:text-neutral-400 outline-none focus:border-[#1D6A4A]"
              />
              <div className="grid grid-cols-3 gap-2">
                {[
                  {val:area,set:setArea,opts:AREA_OPTS},
                  {val:tipo,set:setTipo,opts:TIPO_OPTS},
                  {val:estado,set:setEstado,opts:ESTADO_OPTS},
                ].map((f,i) => (
                  <select key={i} value={f.val} onChange={(e)=>f.set(e.target.value)}
                    className="w-full px-2 py-2 text-[12px] border border-[#E2E8F0] rounded-lg bg-[#F4F6F9] text-neutral-700 outline-none focus:border-[#1D6A4A]">
                    {f.opts.map((o)=><option key={o.v} value={o.v}>{o.l}</option>)}
                  </select>
                ))}
              </div>
              <p className="text-[11px] text-neutral-400">{filtradas.length} programa{filtradas.length!==1?"s":""} encontrado{filtradas.length!==1?"s":""}</p>
            </div>
          </div>

          {/* Cards */}
          <div className="max-w-3xl mx-auto px-4 py-4 space-y-2">
            {filtradas.length === 0 && (
              <div className="text-center py-12 text-neutral-400">
                <p className="text-3xl mb-2">🔍</p>
                <p className="text-sm">No se encontraron becas con esos filtros</p>
              </div>
            )}
            {filtradas.map((b) => {
              const ec = ESTADO_CFG[b.estado] || ESTADO_CFG.cerrada2025;
              const tc = TIPO_COLORES[b.tipo] || "bg-neutral-100 text-neutral-600 border-neutral-200";
              const abt = abierto === b.id;
              return (
                <div key={b.id}
                  className={`bg-white border border-[#E2E8F0] rounded-2xl overflow-hidden shadow-sm transition-all ${abt ? "border-[#1D6A4A]/30 shadow-md" : "hover:shadow-md hover:-translate-y-[1px]"}`}>
                  {/* Card header */}
                  <button type="button" onClick={()=>toggle(b.id)}
                    className="w-full text-left px-4 py-4 flex items-start gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap gap-1.5 mb-1.5">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${ec.bg} ${ec.text} ${ec.border}`}>{ec.label}</span>
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${tc}`}>{b.tipo}</span>
                      </div>
                      <p className="font-semibold text-primary text-[14px] leading-snug">{b.grupo}</p>
                      <p className="text-[12px] text-[#1D6A4A] font-medium mt-1">{b.dot}</p>
                      <p className="text-[11px] text-neutral-500 mt-0.5">{b.becas}</p>
                    </div>
                    <svg className={`w-4 h-4 text-neutral-400 shrink-0 mt-1 transition-transform ${abt?"rotate-180":""}`} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                    </svg>
                  </button>

                  {/* Expanded content */}
                  {abt && (
                    <div className="border-t border-[#E2E8F0] bg-[#F4F6F9]/50 px-4 py-4 space-y-3">
                      <div className="grid sm:grid-cols-2 gap-3">
                        <div>
                          <p className="text-[9px] font-bold uppercase tracking-widest text-[#1D6A4A] mb-1.5 font-mono">Cobertura</p>
                          <ul className="space-y-1">
                            {b.cob.map((c,i)=><li key={i} className="text-[12px] text-neutral-700 flex gap-2"><span className="text-[#1D6A4A] shrink-0">✓</span>{c}</li>)}
                          </ul>
                        </div>
                        <div>
                          <p className="text-[9px] font-bold uppercase tracking-widest text-primary mb-1.5 font-mono">Requisitos</p>
                          <ul className="space-y-1">
                            {b.req.map((r,i)=><li key={i} className="text-[12px] text-neutral-700 flex gap-2"><span className="text-primary shrink-0">→</span>{r}</li>)}
                          </ul>
                        </div>
                      </div>
                      <div>
                        <p className="text-[9px] font-bold uppercase tracking-widest text-neutral-500 mb-1.5 font-mono">Documentos</p>
                        <div className="flex flex-wrap gap-1.5">
                          {b.doc.map((d,i)=><span key={i} className="text-[11px] bg-white border border-[#E2E8F0] text-neutral-600 px-2 py-0.5 rounded-lg">📄 {d}</span>)}
                        </div>
                      </div>
                      {b.nota && (
                        <div className="bg-amber-50 border border-amber-200 rounded-xl px-3 py-2 text-[12px] text-amber-800 leading-relaxed">
                          {b.nota}
                        </div>
                      )}
                      <div className="flex gap-2 pt-1">
                        <a href={b.link} target="_blank" rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary text-white text-[12px] font-semibold rounded-lg hover:bg-[#1D6A4A] transition">
                          Ver convocatoria →
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

            {/* Portales clave */}
            <div className="bg-white border border-[#E2E8F0] rounded-2xl p-4 mt-2">
              <p className="text-[9px] font-bold uppercase tracking-widest text-neutral-400 mb-2 font-mono">📌 Portales clave</p>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[11px] text-neutral-500">
                {[["AUIP central","auip.org/es/becasauip"],["García Lorca","solicitudeslorca.auip.org"],["F. Carolina","gestion.fundacioncarolina.es"],["MAEC-AECID","aecid.es"],["TalentUnileon","unileon.es/becas-talentunileon"],["Erasmus catálogo","eacea.ec.europa.eu/scholarships/erasmus-mundus-catalogue_en"]].map(([n,u])=>(
                  <p key={n}><strong className="text-neutral-700">{n}:</strong> {u}</p>
                ))}
              </div>
              <p className="text-[10px] text-neutral-400 mt-2 border-t border-[#E2E8F0] pt-2">⚡ Estados calculados a 01/05/2026. Verificar siempre en portales oficiales.</p>
            </div>
          </div>
        </div>
      )}

      {/* TAB AUIP */}
      {tab === "auip" && (
        <div className="max-w-3xl mx-auto px-4 py-5">
          <div className="bg-[#EEF2F8] border border-primary/15 rounded-2xl p-4 mb-4">
            <h2 className="font-serif text-primary text-[15px] font-bold mb-2">🏫 ¿Mi universidad está en AUIP?</h2>
            <p className="text-[13px] text-neutral-600 leading-relaxed mb-1">Para la mayoría de becas AUIP tu universidad debe ser <strong>institución asociada activa</strong>. Si no aparece puedes aplicar igualmente a <strong>TalentUnileon, Fundación Carolina, Erasmus Mundus y MAEC-AECID</strong>.</p>
            <p className="text-[12px] text-neutral-500">Lista oficial completa (+310): <strong className="text-primary">auip.org/es/instituciones-asociadas</strong></p>
          </div>
          <input
            type="search"
            value={paisBusq}
            onChange={(e)=>setPaisBusq(e.target.value)}
            placeholder="🔍  Buscar por país o universidad..."
            className="w-full px-3 py-2.5 text-[13px] border border-[#E2E8F0] rounded-xl bg-white text-neutral-800 placeholder:text-neutral-400 outline-none focus:border-primary mb-3"
          />
          <div className="space-y-2">
            {paisesFiltrados.map((p)=>(
              <div key={p.p} className="bg-white border border-[#E2E8F0] rounded-xl overflow-hidden">
                <div className="px-4 py-2.5 bg-[#F4F6F9] border-b border-[#E2E8F0]">
                  <p className="font-semibold text-primary text-[13px]">{p.p}</p>
                </div>
                <div className="px-4 py-3">
                  {p.u.map((u,i)=>(
                    <p key={i} className="text-[12px] text-neutral-600 py-0.5 border-b border-[#F4F6F9] last:border-0">→ {u}</p>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mt-3 text-[12px] text-amber-800 leading-relaxed">
            ⚠️ Lista orientativa. Tu universidad debe estar al día en el pago de cuotas AUIP. Verificar en <strong>auip.org/es/instituciones-asociadas</strong>
          </div>
        </div>
      )}

      {/* TAB CCAA */}
      {tab === "ccaa" && (
        <div className="max-w-3xl mx-auto px-4 py-5">
          <div className="bg-[#EEF2F8] border border-primary/15 rounded-2xl p-4 mb-4">
            <h2 className="font-serif text-primary text-[15px] font-bold mb-2">🏠 Ayudas cuando ya estás en España</h2>
            <p className="text-[13px] text-neutral-600 leading-relaxed">Con <strong>TIE</strong> y <strong>empadronamiento</strong> puedes acceder a estas ayudas. Son compatibles con tu beca de máster.</p>
          </div>
          <div className="space-y-3">
            {CCAA_DATA.map((region)=>(
              <div key={region.ccaa} className="bg-white border border-[#E2E8F0] rounded-2xl overflow-hidden">
                <div className="px-4 py-3 border-b border-[#E2E8F0] bg-[#F4F6F9]">
                  <h3 className="font-semibold text-primary text-[14px]">{region.ccaa}</h3>
                </div>
                <div className="p-4 space-y-3">
                  {region.ayudas.map((a,i)=>(
                    <div key={i} className="pl-3 border-l-2 border-[#E2E8F0]">
                      <div className="flex items-center gap-2 mb-0.5">
                        <p className="font-semibold text-[13px] text-neutral-800">{a.n}</p>
                        <span className="text-[10px] bg-[#EEF2F8] text-primary px-1.5 py-0.5 rounded border border-primary/10">{a.t}</span>
                      </div>
                      <p className="text-[12px] text-neutral-600 leading-relaxed">{a.d}</p>
                      <p className="text-[11px] text-neutral-400 mt-0.5">→ {a.r}</p>
                      {a.link && <a href={a.link} target="_blank" rel="noopener noreferrer" className="text-[11px] text-[#1D6A4A] underline mt-0.5 block">{a.link}</a>}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div className="bg-[#EEF2F8] border border-primary/15 rounded-xl p-3 mt-3 text-[12px] text-primary">
            <strong>💡 Primeros pasos:</strong> 1) Empadronarte en el ayuntamiento. 2) Con TIE + empadronamiento pides tarjeta sanitaria gratuita. 3) La Beca MEC es compatible con la mayoría de becas universitarias.
          </div>
        </div>
      )}
    </div>
  );
}
