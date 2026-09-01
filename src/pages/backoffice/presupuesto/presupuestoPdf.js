// El PDF del presupuesto: dos páginas, honorarios y condiciones.
//
// Se dibuja con pdf-lib, como el resto de escritos de la casa, en vez de
// imprimir la pantalla. Un presupuesto lo abre el asesorado en su móvil y lo
// reenvía a quien le paga: tiene que salir igual en todas partes, y lo que
// imprime un navegador depende del navegador.
//
// La segunda página no es relleno. Un presupuesto sin condiciones es una cifra
// suelta, y cuando alguien discute qué incluía el servicio no hay a qué mirar.

import logoUrl from "../../../assets/images/logo.png";

const NAVY = { r: 0.09, g: 0.21, b: 0.36 };   // #173A5E
const NARANJA = { r: 0.96, g: 0.51, b: 0.13 }; // #F58220
const TINTA = { r: 0.11, g: 0.14, b: 0.18 };
const SUAVE = { r: 0.45, g: 0.49, b: 0.55 };
const LINEA = { r: 0.85, g: 0.87, b: 0.90 };
const FONDO = { r: 0.96, g: 0.97, b: 0.98 };
const CREMA = { r: 0.996, g: 0.957, b: 0.906 };

const A4 = [595.28, 841.89];
const MARGEN = 42;

const eur = (n) => `${Number(n || 0).toLocaleString("es-ES", {
  minimumFractionDigits: 2, maximumFractionDigits: 2,
})} €`;

/**
 * Parte un texto en líneas que caben en `ancho`.
 *
 * pdf-lib no ajusta solo: sin esto, una condición larga se sale de la página
 * por el lado derecho y nadie la ve hasta que el cliente la recibe.
 */
function partir(texto, fuente, tam, ancho) {
  const palabras = String(texto || "").split(/\s+/).filter(Boolean);
  const lineas = [];
  let actual = "";
  for (const p of palabras) {
    const prueba = actual ? `${actual} ${p}` : p;
    if (fuente.widthOfTextAtSize(prueba, tam) > ancho && actual) {
      lineas.push(actual);
      actual = p;
    } else {
      actual = prueba;
    }
  }
  if (actual) lineas.push(actual);
  return lineas;
}

export const CONDICIONES_POR_DEFECTO = [
  {
    t: "Objeto del presupuesto",
    p: "El presente documento recoge los honorarios de esta asesoría por los servicios "
     + "relacionados en la primera página. No incluye tasas, aranceles ni pagos a "
     + "terceros, que se detallan aparte cuando corresponde.",
  },
  {
    t: "Tasas y pagos a la Administración",
    p: "Las tasas administrativas, aranceles notariales, traducciones juradas y "
     + "apostillas son ajenas a esta asesoría y se abonan directamente al organismo "
     + "correspondiente. Sus importes los fija la Administración y pueden variar sin "
     + "previo aviso.",
  },
  {
    t: "Alcance del servicio",
    p: "Esta asesoría asume la preparación, revisión y presentación del expediente, así "
     + "como el seguimiento de su tramitación. La resolución corresponde en exclusiva a "
     + "la Administración competente, que resuelve conforme a su propio criterio.",
  },
  {
    t: "Sobre el resultado",
    p: "Los honorarios retribuyen el trabajo profesional realizado, no el sentido de la "
     + "resolución. Ni el cumplimiento de los plazos ni la aportación de la documentación "
     + "prejuzgan que el expediente vaya a resolverse favorablemente.",
  },
  {
    t: "Documentación del asesorado",
    p: "Los documentos que se aporten al expediente son responsabilidad exclusiva de "
     + "quien los aporta. Esta asesoría verifica su presencia y su forma, y no responde "
     + "de su autenticidad, vigencia, contenido ni suficiencia ante la Administración.",
  },
  {
    t: "Plazos",
    p: "Los plazos de presentación son improrrogables. Esta asesoría prioriza en toda "
     + "circunstancia su cumplimiento, y presentará el expediente en la fecha prevista aun "
     + "cuando subsistiera la falta de algún documento, quedando a la espera del "
     + "requerimiento de subsanación.",
  },
  {
    t: "Validez",
    p: "Este presupuesto tiene una validez de treinta (30) días naturales desde su fecha "
     + "de emisión. Transcurrido ese plazo, los importes quedan sujetos a revisión.",
  },
  {
    t: "Aceptación",
    p: "El abono de la primera cuota supone la aceptación de este presupuesto y de las "
     + "presentes condiciones.",
  },
];

/**
 * @param {object} d datos del formulario
 * @returns {Promise<Uint8Array>}
 */
export async function construirPresupuestoPDF(d) {
  const { PDFDocument, StandardFonts, rgb } = await import("pdf-lib");
  const pdf = await PDFDocument.create();

  const negrita = await pdf.embedFont(StandardFonts.HelveticaBold);
  const normal = await pdf.embedFont(StandardFonts.Helvetica);

  let logo = null;
  try {
    const bytes = await fetch(logoUrl).then((r) => r.arrayBuffer());
    logo = await pdf.embedPng(bytes);
  } catch {
    // Sin logo el presupuesto sigue valiendo; se pone el nombre en su lugar.
  }

  const col = (c) => rgb(c.r, c.g, c.b);
  const ancho = A4[0] - MARGEN * 2;

  // ── Página 1 ─────────────────────────────────────────────────────────────
  const p1 = pdf.addPage(A4);
  let y = A4[1] - MARGEN;

  if (logo) {
    const esc = logo.scale(112 / logo.width);
    p1.drawImage(logo, { x: MARGEN, y: y - esc.height, width: esc.width, height: esc.height });
    y -= esc.height + 4;
  } else {
    p1.drawText("inspira", { x: MARGEN, y: y - 20, size: 22, font: negrita, color: col(NAVY) });
    y -= 28;
  }
  p1.drawText("SUEÑA · APRENDE · VIAJA", {
    x: MARGEN, y: y - 8, size: 7.5, font: normal, color: col(SUAVE),
  });

  // Cabecera derecha
  p1.drawText("PRESUPUESTO", {
    x: A4[0] - MARGEN - negrita.widthOfTextAtSize("PRESUPUESTO", 20), y: A4[1] - MARGEN - 30,
    size: 20, font: negrita, color: col(NAVY),
  });
  p1.drawText("Especialistas en Extranjería", {
    x: A4[0] - MARGEN - normal.widthOfTextAtSize("Especialistas en Extranjería", 8.5),
    y: A4[1] - MARGEN - 8, size: 8.5, font: normal, color: col(SUAVE),
  });
  if (d.numero) {
    const et = `Nº ${d.numero}`;
    const w = negrita.widthOfTextAtSize(et, 10) + 20;
    p1.drawRectangle({
      x: A4[0] - MARGEN - w, y: A4[1] - MARGEN - 56, width: w, height: 19,
      color: col(NARANJA), opacity: 0.95,
    });
    p1.drawText(et, {
      x: A4[0] - MARGEN - w + 10, y: A4[1] - MARGEN - 50, size: 10,
      font: negrita, color: rgb(1, 1, 1),
    });
  }

  y -= 34;

  // Cliente
  p1.drawText("CLIENTE", { x: MARGEN, y, size: 9, font: negrita, color: col(NAVY) });
  y -= 15;
  p1.drawText(d.cliente || "", { x: MARGEN, y, size: 12, font: normal, color: col(TINTA) });
  p1.drawLine({
    start: { x: MARGEN, y: y - 4 }, end: { x: MARGEN + 320, y: y - 4 },
    thickness: 0.8, color: col(LINEA),
  });
  if (d.fecha) {
    p1.drawText(d.fecha, {
      x: A4[0] - MARGEN - normal.widthOfTextAtSize(d.fecha, 9), y,
      size: 9, font: normal, color: col(SUAVE),
    });
  }
  y -= 30;

  // ── Tabla de servicios ──
  const ALTO_CAB = 26;
  p1.drawRectangle({ x: MARGEN, y: y - ALTO_CAB, width: ancho, height: ALTO_CAB, color: col(NAVY) });
  p1.drawText("SERVICIO", {
    x: MARGEN + 14, y: y - 17, size: 10, font: negrita, color: rgb(1, 1, 1),
  });
  const cabH = "HONORARIOS";
  p1.drawText(cabH, {
    x: A4[0] - MARGEN - 16 - negrita.widthOfTextAtSize(cabH, 10), y: y - 17,
    size: 10, font: negrita, color: rgb(1, 1, 1),
  });
  y -= ALTO_CAB;

  const servicios = (d.servicios || []).filter((s) => s.concepto || s.importe);
  const ALTO_FILA = 30;
  servicios.forEach((s, i) => {
    if (i % 2 === 0) {
      p1.drawRectangle({ x: MARGEN, y: y - ALTO_FILA, width: ancho, height: ALTO_FILA, color: col(FONDO) });
    }
    p1.drawLine({
      start: { x: MARGEN, y: y - ALTO_FILA }, end: { x: MARGEN + ancho, y: y - ALTO_FILA },
      thickness: 0.5, color: col(LINEA),
    });
    const txt = partir(s.concepto || "", normal, 10, ancho - 160)[0] || "";
    p1.drawText(txt, { x: MARGEN + 14, y: y - 19, size: 10, font: normal, color: col(TINTA) });
    const imp = eur(s.importe);
    p1.drawText(imp, {
      x: A4[0] - MARGEN - 16 - negrita.widthOfTextAtSize(imp, 10.5), y: y - 19,
      size: 10.5, font: negrita, color: col(NAVY),
    });
    y -= ALTO_FILA;
  });

  // Total de honorarios: es la cifra que se busca, así que va destacada.
  const total = servicios.reduce((n, s) => n + (parseFloat(s.importe) || 0), 0);
  p1.drawRectangle({ x: MARGEN, y: y - 30, width: ancho, height: 30, color: col(NAVY), opacity: 0.06 });
  p1.drawText("Total honorarios", {
    x: MARGEN + 14, y: y - 20, size: 10, font: negrita, color: col(NAVY),
  });
  const tot = eur(total);
  p1.drawText(tot, {
    x: A4[0] - MARGEN - 16 - negrita.widthOfTextAtSize(tot, 13), y: y - 21,
    size: 13, font: negrita, color: col(NAVY),
  });
  y -= 48;

  // ── Dos columnas: tasas y formas de pago ──
  const colW = (ancho - 16) / 2;
  const yCols = y;

  // Tasas
  const tasas = (d.tasas || []).filter((t) => t.concepto || t.importe);
  const altoTasas = 44 + tasas.length * 16 + (d.nota_tasas ? 34 : 0);
  p1.drawRectangle({
    x: MARGEN, y: y - altoTasas, width: colW, height: altoTasas,
    color: col(CREMA), borderColor: col(NARANJA), borderWidth: 0.8,
  });
  p1.drawText("TASAS ADICIONALES", {
    x: MARGEN + 14, y: y - 22, size: 10, font: negrita, color: col(NAVY),
  });
  let yt = y - 42;
  for (const t of tasas) {
    p1.drawText(`·  ${t.concepto || ""}`, {
      x: MARGEN + 14, y: yt, size: 9, font: normal, color: col(TINTA),
    });
    const imp = eur(t.importe);
    p1.drawText(imp, {
      x: MARGEN + colW - 14 - negrita.widthOfTextAtSize(imp, 9), y: yt,
      size: 9, font: negrita, color: col(TINTA),
    });
    yt -= 16;
  }
  if (d.nota_tasas) {
    for (const l of partir(d.nota_tasas, normal, 8, colW - 28).slice(0, 3)) {
      p1.drawText(l, { x: MARGEN + 14, y: yt - 4, size: 8, font: normal, color: col(SUAVE) });
      yt -= 11;
    }
  }

  // Formas de pago
  const pagos = (d.pagos || []).filter((p) => p.texto);
  const altoPagos = 44 + pagos.length * 16 + (d.nota_pago ? 34 : 0);
  const xP = MARGEN + colW + 16;
  p1.drawRectangle({
    x: xP, y: yCols - altoPagos, width: colW, height: altoPagos,
    color: rgb(1, 1, 1), borderColor: col(NAVY), borderWidth: 0.8,
  });
  p1.drawText("FORMAS DE PAGO", {
    x: xP + 14, y: yCols - 22, size: 10, font: negrita, color: col(NAVY),
  });
  let yp = yCols - 42;
  pagos.forEach((p, i) => {
    p1.drawText(`${i + 1}.`, { x: xP + 14, y: yp, size: 9, font: negrita, color: col(NARANJA) });
    const l = partir(p.texto, normal, 9, colW - 44)[0] || "";
    p1.drawText(l, { x: xP + 30, y: yp, size: 9, font: normal, color: col(TINTA) });
    yp -= 16;
  });
  if (d.nota_pago) {
    for (const l of partir(d.nota_pago, normal, 8, colW - 28).slice(0, 3)) {
      p1.drawText(l, { x: xP + 14, y: yp - 4, size: 8, font: normal, color: col(SUAVE) });
      yp -= 11;
    }
  }

  // Pie
  const pieY = MARGEN + 14;
  p1.drawLine({
    start: { x: MARGEN, y: pieY + 16 }, end: { x: A4[0] - MARGEN, y: pieY + 16 },
    thickness: 0.6, color: col(LINEA),
  });
  p1.drawText(d.web || "www.inspira-legal.cloud", {
    x: MARGEN, y: pieY, size: 8.5, font: normal, color: col(SUAVE),
  });
  const mail = d.email || "administracion@inspira-legal.cloud";
  p1.drawText(mail, {
    x: A4[0] - MARGEN - normal.widthOfTextAtSize(mail, 8.5), y: pieY,
    size: 8.5, font: normal, color: col(SUAVE),
  });

  // ── Página 2: condiciones ────────────────────────────────────────────────
  const p2 = pdf.addPage(A4);
  let y2 = A4[1] - MARGEN;

  p2.drawRectangle({ x: 0, y: y2 - 8, width: A4[0], height: 8 + MARGEN, color: col(NAVY) });
  p2.drawText("CONDICIONES DEL SERVICIO", {
    x: MARGEN, y: y2 + 12, size: 13, font: negrita, color: rgb(1, 1, 1),
  });
  y2 -= 34;

  const condiciones = d.condiciones?.length ? d.condiciones : CONDICIONES_POR_DEFECTO;
  for (const c of condiciones) {
    if (y2 < MARGEN + 70) break; // no se parte una condición entre páginas
    p2.drawText(c.t, { x: MARGEN, y: y2, size: 10, font: negrita, color: col(NAVY) });
    y2 -= 14;
    for (const l of partir(c.p, normal, 9, ancho)) {
      p2.drawText(l, { x: MARGEN, y: y2, size: 9, font: normal, color: col(TINTA) });
      y2 -= 12.5;
    }
    y2 -= 10;
  }

  p2.drawLine({
    start: { x: MARGEN, y: MARGEN + 30 }, end: { x: A4[0] - MARGEN, y: MARGEN + 30 },
    thickness: 0.6, color: col(LINEA),
  });
  p2.drawText("Inspira Legal · Especialistas en Extranjería", {
    x: MARGEN, y: MARGEN + 14, size: 8.5, font: negrita, color: col(NAVY),
  });
  p2.drawText(d.fecha || "", {
    x: A4[0] - MARGEN - normal.widthOfTextAtSize(d.fecha || "", 8.5), y: MARGEN + 14,
    size: 8.5, font: normal, color: col(SUAVE),
  });

  return pdf.save();
}
