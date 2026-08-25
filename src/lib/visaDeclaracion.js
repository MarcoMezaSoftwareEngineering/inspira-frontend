// src/lib/visaDeclaracion.js
//
// Generador de la declaración jurada de solvencia económica que se presenta
// ante el consulado.
//
// Es una PLANTILLA DETERMINISTA a propósito: mismos datos, mismo texto, siempre.
// Es un documento jurado bajo responsabilidad penal, así que no puede redactarse
// de forma distinta en cada ejecución ni contener una cifra que nadie tecleó.
// Todo lo que aparece en el documento sale de `dj`; lo que falta se marca en
// rojo como hueco pendiente, nunca se rellena por conveniencia.
//
// Lo comparten el portal del cliente y el backoffice del asesor.

/* ── Estructura de datos ─────────────────────────────────────────────────── */

export const ROLES = [
  "Estudiante", "Padre", "Madre", "Tío", "Tía",
  "Hermano", "Hermana", "Abuelo", "Abuela", "Avalista", "Otro",
];

// Cómo se nombra a cada rol dentro del texto legal.
const ROL_GENITIVO = {
  Estudiante: "de la/el declarante",
  Padre: "del padre",
  Madre: "de la madre",
  "Tío": "del tío",
  "Tía": "de la tía",
  Hermano: "del hermano",
  Hermana: "de la hermana",
  Abuelo: "del abuelo",
  Abuela: "de la abuela",
  Avalista: "del avalista",
  Otro: "del garante",
};

export function perfilVacio(rol = "Estudiante") {
  return {
    rol,
    nombre: "", doc: "", nacionalidad: "", formacion: "",
    trabajaActual: true,
    cargo: "", empresa: "", ruc: "", desde: "", ultimaRemuneracion: "",
    ultEmpEmpresa: "", ultEmpCargo: "", ultEmpDesde: "", ultEmpHasta: "",
    aniosTrabajo: "", tipoIngresos: "", arraigo: "", notas: "",
    empleos: [], ingresos: [], saldos: [], cuentas: [], donaciones: [],
  };
}

export function djVacia() {
  return {
    consulado: "Consulado General del Reino de España en Lima",
    tipoVisado: "larga duración por estudios",
    est: { nombre: "", dni: "", pasaporte: "", domicilio: "" },
    estudios: {
      programa: "", nivel: "Máster Universitario", universidad: "", facultad: "",
      ciudadUni: "", codigo: "", modalidad: "presencial", periodoTotal: "",
      inicio: "", fin: "", ects: "60", costoTotal: "", abonado: "", pendiente: "",
    },
    costos: [],
    sustento: {
      alojamiento: "", alojCoste: "", alojMensual: "", alojPeriodo: "",
      ipremAnual: "7.200,00", seguro: true, vuelo: "", vueloFecha: "",
    },
    perfiles: [perfilVacio("Estudiante")],
    pagos: [],
    gastos: [],
    firma: { ciudad: "Lima", dia: "", mes: "", anio: "" },
  };
}

/* Columnas de las tablas repetibles. [clave, etiqueta, ejemplo, ocupaFila] */
export const FILAS = {
  costos:     [["concepto", "Concepto", "60 ECTS (extracomunitarios)", 1], ["importe", "Importe", "5.044,20 €"]],
  pagos:      [["concepto", "Concepto", "reserva de plaza", 1], ["importe", "Importe", "2.100,00 €"], ["fecha", "Fecha", "19 de mayo de 2026"], ["entidad", "Entidad", "—"], ["referencia", "Referencia", "—"]],
  gastos:     [["concepto", "Concepto", "Matrícula (pendiente)", 1], ["importe", "Importe (EUR)", "8.468,00"]],
  empleos:    [["cargo", "Cargo", "Analista…", 1], ["empresa", "Empresa", "Empresa S.A.C.", 1], ["ruc", "RUC", "20…"], ["desde", "Desde", "1 de enero de 2024"], ["hasta", 'Hasta / "actual"', "actual"], ["remuneracion", "Remuneración", "S/ 11.660,00"]],
  ingresos:   [["mes", "Mes / Año", "Marzo 2026"], ["concepto", "Concepto", "Remuneración básica"], ["bruto", "Bruto", "S/ 11.773,01"], ["neto", "Neto", "S/ 8.829,47"]],
  saldos:     [["mes", "Mes / Año", "Abril 2026"], ["cuenta", "Cuenta", "Ahorros BBVA N.° …"], ["saldo", "Saldo final", "S/ 33.148,01"]],
  cuentas:    [["banco", "Banco", "BBVA"], ["tipo", "Tipo", "Ahorros"], ["moneda", "Moneda", "Soles"], ["numero", "N.° cuenta", "0011-…"], ["saldo", "Saldo", "S/ 33.148,01"], ["fechaCorte", "Fecha de corte", "30 de abril de 2026"]],
  donaciones: [["monto", "Monto", "6.200,00 USD"], ["fecha", "Fecha", "15 de julio de 2026"], ["origen", "Donante / origen", "Tío — Michael C. Castillo", 1], ["notas", "Trazabilidad (notario, transferencia, apostilla)", "Escritura pública ante notario…", 1]],
};

export function filaVacia(nombre) {
  const o = {};
  (FILAS[nombre] || []).forEach((f) => { o[f[0]] = ""; });
  return o;
}

/* Ajusta la lista de perfiles a la vía de solvencia elegida, conservando lo
   que el usuario ya hubiera escrito para cada rol. */
export function perfilesSegunVia(via, actuales = []) {
  const quiere =
    via === "PROPIOS" ? ["Estudiante"] :
    via === "AVAL"    ? ["Estudiante", "Padre"] :
                        ["Estudiante", "Padre"];
  return quiere.map((rol) => actuales.find((p) => p.rol === rol) || perfilVacio(rol));
}

/* Siembra la DJ con lo que el expediente ya sabe, para no pedirlo dos veces.
   Sólo rellena huecos: nunca pisa algo escrito a mano. */
export function sembrarDesdeExpediente(dj, exp = {}) {
  const d = { ...dj, est: { ...dj.est }, estudios: { ...dj.estudios }, sustento: { ...dj.sustento } };
  const poner = (obj, k, v) => { if (!String(obj[k] || "").trim() && v) obj[k] = String(v); };

  poner(d.est, "dni", exp.dni);
  poner(d.est, "pasaporte", exp.num_pasaporte);
  poner(d.est, "domicilio", exp.domicilio);
  poner(d.estudios, "inicio", exp.centro_inicio);
  poner(d.estudios, "fin", exp.centro_fin);
  poner(d.estudios, "universidad", exp.centro_nombre);
  poner(d.estudios, "ciudadUni", exp.centro_direccion);
  poner(d.sustento, "alojamiento", exp.domicilio_espana || exp.centro_direccion);

  if (exp.tipo_estudios && d.estudios.nivel === "Máster Universitario") {
    const mapa = { Grado: "Grado Oficial", "Máster": "Máster Universitario", FP: "Ciclo Formativo", Doctorado: "Doctorado" };
    d.estudios.nivel = mapa[exp.tipo_estudios] || exp.tipo_estudios;
  }

  const c = exp.medios_calc || {};
  const num = (v) => Number(v || 0).toLocaleString("es-ES", { minimumFractionDigits: 2 });
  if (c.programa) poner(d.estudios, "costoTotal", num(c.programa));
  if (c.pagado) poner(d.estudios, "abonado", num(c.pagado));
  if (c.programa && c.pagado != null) poner(d.estudios, "pendiente", num(Math.max(0, c.programa - c.pagado)));
  if (c.anual) poner(d.sustento, "ipremAnual", num(c.anual));

  return d;
}

/* ── Generación del documento ────────────────────────────────────────────── */

function esc(v) {
  return String(v == null ? "" : v).replace(/[&<>"]/g, (c) => (
    { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]
  ));
}

/* Dato presente → resaltado. Ausente → hueco visible, para que nadie firme un
   documento con un campo a medias sin darse cuenta. */
function campo(valor, respaldo) {
  return String(valor || "").trim()
    ? `<span class="dj-dato">${esc(valor)}</span>`
    : `<span class="dj-falta">${respaldo}</span>`;
}
const texto = (v) => (String(v || "").trim() ? esc(v) : "");

function tabla(columnas, filas) {
  const th = `<tr>${columnas.map((c) => `<td class="dj-th">${c}</td>`).join("")}</tr>`;
  const tr = filas.map((f) => `<tr>${f.map((c) => `<td class="dj-td">${c || ""}</td>`).join("")}</tr>`).join("");
  return `<table class="dj-tabla">${th}${tr}</table>`;
}

const conDatos = (arr, ...claves) =>
  (arr || []).filter((x) => claves.some((k) => String(x[k] || "").trim()));

/* Cláusula de situación económica de una persona (declarante o garante). */
function clausulaSituacion(p) {
  const esEstudiante = p.rol === "Estudiante";
  const titulo = esEstudiante
    ? "SITUACIÓN ECONÓMICA, LABORAL Y ARRAIGO DE LA/EL DECLARANTE"
    : `SITUACIÓN ECONÓMICA ${(ROL_GENITIVO[p.rol] || "del garante").toUpperCase()}: ${p.nombre ? esc(p.nombre).toUpperCase() : `[${p.rol}]`}`;

  let b = "";

  if (p.formacion) {
    const sujeto = esEstudiante ? "La declarante" : `El/La ${(ROL_GENITIVO[p.rol] || "garante").replace(/^del? /, "")}`;
    b += `<p>${sujeto} cuenta con la siguiente formación: ${esc(p.formacion)}.</p>`;
  }

  if (p.trabajaActual && (p.empresa || p.cargo)) {
    const partes = [`Se desempeña como <b>${texto(p.cargo)}</b>`];
    if (p.empresa) partes.push(`en ${esc(p.empresa)}`);
    if (p.ruc) partes.push(`(R.U.C. N.° ${esc(p.ruc)})`);
    if (p.desde) partes.push(`con relación laboral vigente desde el ${esc(p.desde)}`);
    if (p.ultimaRemuneracion) partes.push(`percibiendo una remuneración de ${esc(p.ultimaRemuneracion)}`);
    b += `<p>${partes.join(" ")}.</p>`;
  } else if (!p.trabajaActual && p.ultEmpEmpresa) {
    const rango = [
      p.ultEmpDesde ? `desde ${esc(p.ultEmpDesde)}` : "",
      p.ultEmpHasta ? `hasta ${esc(p.ultEmpHasta)}` : "",
    ].filter(Boolean).join(" ");
    b += `<p>Su último vínculo laboral fue como ${texto(p.ultEmpCargo)} en ${esc(p.ultEmpEmpresa)}${rango ? ` (${rango})` : ""}.</p>`;
  }

  if (p.aniosTrabajo) b += `<p>Acredita ${esc(p.aniosTrabajo)} de trayectoria laboral.</p>`;

  const empleos = conDatos(p.empleos, "cargo", "empresa");
  if (empleos.length) {
    b += "<ul>";
    empleos.forEach((m) => {
      const pt = [];
      if (m.cargo) pt.push(`<b>${esc(m.cargo)}</b>`);
      if (m.empresa) pt.push(`en ${esc(m.empresa)}`);
      if (m.ruc) pt.push(`(RUC ${esc(m.ruc)})`);
      if (m.desde) pt.push(`desde ${esc(m.desde)}`);
      if (m.hasta && !/actual/i.test(m.hasta)) pt.push(`hasta ${esc(m.hasta)}`);
      if (m.remuneracion) pt.push(`· ${esc(m.remuneracion)}`);
      b += `<li>${pt.join(" ")}.</li>`;
    });
    b += "</ul>";
  }

  const ingresos = conDatos(p.ingresos, "mes", "bruto");
  if (ingresos.length) {
    b += "<p><b>A. Ingresos (últimos meses disponibles):</b></p>";
    b += tabla(["Mes / Año", "Concepto", "Bruto", "Neto"],
      ingresos.map((x) => [esc(x.mes), esc(x.concepto), esc(x.bruto), esc(x.neto)]));
  }

  if (p.tipoIngresos) b += `<p><b>B. Otros ingresos:</b> ${esc(p.tipoIngresos)}.</p>`;

  const saldos = conDatos(p.saldos, "mes", "saldo");
  const cuentas = conDatos(p.cuentas, "saldo", "numero");
  if (saldos.length) {
    b += "<p><b>C. Evolución de saldos bancarios:</b></p>";
    b += tabla(["Mes / Año", "Cuenta", "Saldo final"],
      saldos.map((x) => [esc(x.mes), esc(x.cuenta), esc(x.saldo)]));
  } else if (cuentas.length) {
    b += "<p><b>Fondos bancarizados disponibles:</b></p><ul>";
    cuentas.forEach((c) => {
      const pt = [`Cuenta ${esc([c.tipo, c.banco].filter(Boolean).join(" ") || "bancaria")}`];
      if (c.moneda) pt.push(`en ${esc(c.moneda)}`);
      if (c.numero) pt.push(`N.° ${esc(c.numero)}`);
      if (c.saldo) pt.push(`con saldo de ${esc(c.saldo)}`);
      if (c.fechaCorte) pt.push(`al ${esc(c.fechaCorte)}`);
      b += `<li>${pt.join(" ")}.</li>`;
    });
    b += "</ul>";
  }

  const donaciones = conDatos(p.donaciones, "monto");
  if (donaciones.length) {
    b += "<p><b>Donaciones / ingresos especiales:</b></p><ul>";
    donaciones.forEach((d) => {
      const pt = [`Donación de ${esc(d.monto)}`];
      if (d.fecha) pt.push(`formalizada el ${esc(d.fecha)}`);
      if (d.origen) pt.push(`otorgada por ${esc(d.origen)}`);
      if (d.notas) pt.push(`— ${esc(d.notas)}`);
      b += `<li>${pt.join(" ")}.</li>`;
    });
    b += "</ul>";
  }

  if (p.notas) b += `<p class="dj-nota"><i>${esc(p.notas)}</i></p>`;
  if (p.arraigo) b += esEstudiante ? `<p><b>Arraigo:</b> ${esc(p.arraigo)}</p>` : `<p>${esc(p.arraigo)}</p>`;

  if (!b.trim()) {
    b = `<p class="dj-falta">[Completa la situación económica de ${p.nombre ? esc(p.nombre) : `[${p.rol}]`}]</p>`;
  }
  return { h: titulo, b };
}

const ORDINALES = [
  "PRIMERO", "SEGUNDO", "TERCERO", "CUARTO", "QUINTO", "SEXTO", "SÉPTIMO",
  "OCTAVO", "NOVENO", "DÉCIMO", "UNDÉCIMO", "DUODÉCIMO", "DECIMOTERCERO", "DECIMOCUARTO",
];

/**
 * Construye el HTML de la declaración jurada.
 * @param {object} dj  datos del generador
 * @param {string} via PROPIOS | AVAL | MIXTO
 */
export function generarDeclaracion(dj, via = "PROPIOS") {
  const { est: e, estudios: es, sustento: su, firma: fi } = dj;
  const garantes = (dj.perfiles || []).filter((p) => p.rol !== "Estudiante");
  const C = [];

  /* PRIMERO — objeto de la estancia */
  let b1 = `<p>La suscrita/o ha sido admitida/o para cursar el ${campo(es.nivel, "[nivel]")} ${campo(es.programa, "[programa]")} en la ${campo(es.universidad, "[universidad]")}${es.facultad ? `, ${esc(es.facultad)}` : ""}${es.ciudadUni ? ` (${esc(es.ciudadUni)})` : ""}${es.codigo ? `, código de registro ${esc(es.codigo)}` : ""}, institución de educación superior reconocida por las autoridades académicas del Reino de España.</p>`;
  b1 += `<p>El programa, de modalidad ${texto(es.modalidad) || "presencial"} y a tiempo completo${es.ects ? ` (${esc(es.ects)} créditos ECTS)` : ""}, se desarrollará${es.periodoTotal ? ` en el periodo ${esc(es.periodoTotal)}, siendo el primer año académico` : ""} del ${campo(es.inicio, "[inicio]")} al ${campo(es.fin, "[fin]")}.</p>`;

  const costos = conDatos(dj.costos, "concepto", "importe");
  if (costos.length) {
    b1 += "<p><b>Estructura de costes académicos del primer año:</b></p><ul>";
    costos.forEach((c) => { b1 += `<li>${esc(c.concepto)}${c.importe ? `: ${esc(c.importe)}` : ""}</li>`; });
    b1 += "</ul>";
  }
  if (es.costoTotal || es.pendiente) {
    b1 += `<p>Total coste académico: ${campo(es.costoTotal, "[total]")} EUR.${es.abonado ? ` Importe abonado: ${esc(es.abonado)} EUR.` : ""}${es.pendiente ? ` Importe pendiente: ${esc(es.pendiente)} EUR.` : ""}</p>`;
  }
  C.push({ h: "OBJETO DE LA ESTANCIA: ESTUDIOS OFICIALES", b: b1 });

  /* SEGUNDO — sustento */
  let b2 = "";
  if (via === "PROPIOS") {
    b2 += "<p>Durante la vigencia de la estancia autorizada, la declarante sufragará la totalidad de sus gastos con medios y recursos propios, sin constituir carga alguna para el sistema de bienestar social del Reino de España.</p>";
  } else {
    b2 += `<p>Durante toda la vigencia de la estancia, el sustento económico ${via === "MIXTO" ? "se cubrirá de forma conjunta entre la declarante y" : "íntegro de la declarante correrá a cargo de"} ${garantes.length > 1 ? "sus garantes" : "su garante"}:</p><ul>`;
    garantes.forEach((g) => {
      b2 += `<li>${campo(g.nombre, "[nombre]")}${g.doc ? ` — ${esc(g.doc)}` : ""}${g.rol ? ` (${g.rol.toLowerCase()})` : ""}</li>`;
    });
    b2 += "</ul><p>Quien(es) asume(n) formal, solidaria e irrevocablemente la obligación de sufragar los gastos de la declarante, con inclusión de:</p>";
  }
  b2 += "<ul><li>Matrícula universitaria, apertura de expediente y cuotas de docencia.</li>";
  if (su.alojamiento) {
    b2 += `<li>Alojamiento${su.alojCoste ? ` (coste total previsto: ${esc(su.alojCoste)} EUR${su.alojMensual ? `; cuota mensual: ${esc(su.alojMensual)} EUR` : ""})` : ""} en ${esc(su.alojamiento)}${su.alojPeriodo ? `, periodo ${esc(su.alojPeriodo)}` : ""}.</li>`;
  }
  b2 += `<li>Manutención y gastos corrientes de subsistencia (referencia IPREM anual: ${campo(su.ipremAnual, "[IPREM]")} EUR).</li>`;
  if (su.seguro) b2 += "<li>Seguro médico privado con cobertura integral para el periodo de estancia.</li>";
  if (su.vuelo) b2 += `<li>Transporte aéreo internacional ${esc(su.vuelo)}${su.vueloFecha ? ` (vuelo reservado con fecha prevista ${esc(su.vueloFecha)})` : ""}.</li>`;
  b2 += "<li>Gastos personales, material académico, imprevistos y repatriación al término de los estudios.</li></ul>";
  C.push({
    h: via === "PROPIOS" ? "SUSTENTO ECONÓMICO Y ALOJAMIENTO" : "GARANTES ECONÓMICOS Y OBLIGACIÓN DE SUSTENTO",
    b: b2,
  });

  /* Situación de cada persona */
  (dj.perfiles || []).forEach((p) => C.push(clausulaSituacion(p)));

  /* Pagos anticipados */
  const pagos = conDatos(dj.pagos, "concepto", "importe");
  if (pagos.length) {
    let bp = "<p>Como manifestación concreta de la planificación económica de la estancia, se han efectuado los siguientes desembolsos y compromisos:</p><ul>";
    pagos.forEach((p) => {
      const pt = [];
      if (p.importe) pt.push(`Pago de ${esc(p.importe)}`);
      if (p.concepto) pt.push(`por ${esc(p.concepto)}`);
      if (p.fecha) pt.push(`el ${esc(p.fecha)}`);
      if (p.entidad && p.entidad !== "—") pt.push(`mediante ${esc(p.entidad)}`);
      if (p.referencia && p.referencia !== "—") pt.push(`(Ref.: ${esc(p.referencia)})`);
      bp += `<li>${pt.join(" ")}.</li>`;
    });
    bp += "</ul>";
    C.push({ h: "PAGOS ANTICIPADOS Y COMPROMISOS ASUMIDOS", b: bp });
  }

  /* Trazabilidad */
  let bt = "<p>Los fondos destinados a financiar los estudios y la estancia de la declarante provienen de fuentes lícitas, formales y verificables:</p><ul>";
  (dj.perfiles || []).forEach((p) => {
    const tieneFondos = p.empresa || (p.ingresos || []).length || (p.saldos || []).length || (p.cuentas || []).length;
    if (p.nombre && tieneFondos) {
      bt += `<li>Ingresos y fondos bancarizados de ${esc(p.nombre)}${p.empresa ? ` (${esc(p.empresa)})` : ""}.</li>`;
    }
    conDatos(p.donaciones, "monto").forEach((d) => {
      bt += `<li>Donación de ${esc(d.monto)}${d.origen ? ` otorgada por ${esc(d.origen)}` : ""}, con trazabilidad documentada.</li>`;
    });
  });
  bt += "<li>Correspondencia plena entre ingresos declarados, saldos bancarios, pagos efectuados y gastos previstos, sin constituir carga para el sistema de bienestar social del Reino de España.</li></ul>";
  C.push({ h: "TRAZABILIDAD, ORIGEN LÍCITO Y DISPONIBILIDAD DE FONDOS", b: bt });

  /* Capacidad global */
  const gastos = conDatos(dj.gastos, "concepto", "importe");
  if (gastos.length) {
    C.push({
      h: "CAPACIDAD ECONÓMICA GLOBAL ESTIMADA (PRIMER AÑO)",
      b: "<p>Cuadro estimado de gastos para el primer año de estancia:</p>" +
         tabla(["Concepto", "Importe (EUR)"], gastos.map((x) => [esc(x.concepto), esc(x.importe)])),
    });
  }

  /* Cierre */
  let bf = "<p>La declarante manifiesta expresamente su voluntad de regresar a su país de origen al término del periodo de estancia autorizado o de la finalización de sus estudios. ";
  if (via !== "PROPIOS") {
    bf += "Los garantes se comprometen de forma irrevocable a asumir íntegramente cualesquiera gastos que se generen durante la estancia, con inclusión de los de repatriación. ";
  }
  bf += "Por lo expuesto, se declara bajo juramento contar con el respaldo económico suficiente, lícito, trazable y disponible para solventar la estancia por estudios en España en base al IPREM durante el periodo formativo.</p>";
  C.push({ h: "DECLARACIÓN FINAL Y COMPROMISO DE RETORNO", b: bf });

  /* Montaje */
  let h = `<div class="dj-cab"><div class="dj-org">${esc((dj.consulado || "").toUpperCase())}</div><div class="dj-sub">Solicitud de visado de ${esc(dj.tipoVisado || "estudios")}</div></div>`;
  h += '<div class="dj-titulo">Declaración jurada de solvencia económica y sustento familiar del solicitante</div>';
  h += '<p class="dj-norma">(Artículo 25 del Reglamento (CE) n.º 810/2009 del Parlamento Europeo)</p>';
  h += "<h5>DATOS DE LA DECLARANTE</h5>";
  h += `<p>Yo, ${campo(e.nombre, "[NOMBRE]")}, identificada/o con Documento Nacional de Identidad N.° ${campo(e.dni, "[DNI]")} y Pasaporte N.° ${campo(e.pasaporte, "[pasaporte]")}, con domicilio en ${campo(e.domicilio, "[domicilio]")}, con plena capacidad jurídica y obrando en mi propio nombre y derecho, ante el ${texto(dj.consulado)},</p>`;
  h += '<p class="dj-declaro">DECLARO SOLEMNEMENTE BAJO JURAMENTO</p>';
  h += "<p>que los hechos y circunstancias que se exponen a continuación son verídicos, completos y exactos, siendo plenamente consciente de las responsabilidades civiles, administrativas y penales derivadas de la formulación de una declaración falsa o incompleta ante autoridad consular extranjera.</p>";
  C.forEach((c, i) => { h += `<h5>${ORDINALES[i] || `CLÁUSULA ${i + 1}`}. — ${c.h}</h5>${c.b}`; });
  h += `<div class="dj-firma"><p>La presente declaración jurada se formula en la ciudad de ${campo(fi.ciudad, "[ciudad]")}, a los ${campo(fi.dia, "[día]")} días del mes de ${campo(fi.mes, "[mes]")} de ${campo(fi.anio, "[año]")}, para ser presentada ante el ${texto(dj.consulado)}, en el marco de la solicitud de visado de ${texto(dj.tipoVisado)}.</p>`;
  h += `<div class="dj-linea"><div class="dj-nombre">${texto(e.nombre) || "[Nombre de la declarante]"}</div><div class="dj-id">DNI N.° ${texto(e.dni) || "—"} · Pasaporte N.° ${texto(e.pasaporte) || "—"}</div></div></div>`;
  return h;
}

/* Estilos de la hoja. Se inyectan también en la exportación a Word y en la
   impresión, para que el documento salga igual en los tres sitios. */
export const ESTILOS_HOJA = `
.dj-hoja{background:#fff;color:#111;font-family:'Times New Roman',Times,serif;font-size:13.5px;line-height:1.6;text-align:justify}
.dj-hoja p{margin:6px 0}
.dj-hoja h5{font-size:13.5px;font-weight:700;margin:16px 0 6px;text-transform:uppercase}
.dj-cab{text-align:center;font-weight:700;margin-bottom:12px}
.dj-org{font-size:13px}
.dj-sub{font-size:12px;font-weight:400;font-style:italic}
.dj-titulo{text-align:center;font-weight:700;text-transform:uppercase;margin:14px 0 4px}
.dj-norma{text-align:center;font-style:italic;font-size:12px;margin-top:0}
.dj-declaro{font-weight:700;text-align:center;margin:14px 0}
.dj-tabla{border-collapse:collapse;width:100%;margin:8px 0 12px}
.dj-th{border:1px solid #b9b4a7;padding:4px 8px;font-weight:700;font-size:12px;background:#f1eee4}
.dj-td{border:1px solid #cfcabd;padding:4px 8px;font-size:12px}
.dj-dato{background:#eef7f1}
.dj-falta{background:#fde8e6;color:#b3261e;font-style:italic}
.dj-nota{color:#555;font-size:12.5px}
.dj-firma{margin-top:34px}
.dj-linea{border-top:1px solid #000;width:320px;padding-top:6px;margin-top:52px}
.dj-nombre{font-weight:700}
.dj-id{font-size:12px}
.dj-hoja ul{margin:4px 0 4px 18px;padding:0}
.dj-hoja li{margin-bottom:3px}
`;

/* ── Exportaciones ───────────────────────────────────────────────────────── */

/** Documento Word (.doc). Los resaltados se neutralizan: el documento final va en negro. */
export function descargarWord(html, nombreArchivo) {
  const doc = `<html xmlns:w="urn:schemas-microsoft-com:office:word"><head><meta charset="utf-8"><style>
    body{font-family:'Times New Roman',serif;font-size:11.5pt;line-height:1.55;color:#000}
    h5{font-size:11.5pt;margin:13pt 0 5pt}
    p{text-align:justify;margin:5pt 0}
    ul{margin:3pt 0}li{margin-bottom:2pt}
    table{border-collapse:collapse;width:100%}
    td{border:1px solid #999;padding:3pt 5pt;font-size:10.5pt}
    .dj-titulo{text-align:center;font-weight:bold;text-transform:uppercase;margin-bottom:8pt}
    .dj-cab{text-align:center;font-weight:bold;margin-bottom:10pt}
    .dj-declaro{font-weight:bold;text-align:center}
    .dj-dato,.dj-falta{background:none;color:#000;font-style:normal}
    .dj-linea{border-top:1px solid #000;width:300pt;padding-top:6pt;margin-top:40pt}
  </style></head><body>${html}</body></html>`;
  const blob = new Blob(["﻿", doc], { type: "application/msword" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `${nombreArchivo}.doc`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}

/** Imprime la hoja (el usuario elige "Guardar como PDF" en el diálogo). */
export function imprimirDeclaracion(html) {
  const v = window.open("", "_blank", "width=900,height=1000");
  if (!v) return false; // bloqueado por el navegador
  v.document.write(`<!doctype html><html><head><meta charset="utf-8"><title>Declaración jurada</title><style>
    ${ESTILOS_HOJA}
    @page{size:A4;margin:22mm 20mm}
    body{margin:0}
    .dj-dato,.dj-falta{background:none;color:#000;font-style:normal}
  </style></head><body><div class="dj-hoja">${html}</div></body></html>`);
  v.document.close();
  v.focus();
  setTimeout(() => v.print(), 300);
  return true;
}
