// Los impresos del PAC que generamos con los datos del expediente, persona
// a persona: el MI-F del familiar, la declaración responsable de suficiencia
// de recursos, la declaración jurada de mantenimiento del vínculo (la firma
// el titular) y la carta de representación a la letrada. Si la persona ya
// subió su firma digitalizada, va estampada en el recuadro de firma.
//
// Además de descargarse, se archivan en la ranura que les toca: la del
// solicitante o la del acompañante, para que cada uno descargue lo suyo.
import { useCallback, useEffect, useState } from "react";
import { boGET, boFetch } from "../../../../../services/backofficeApi";
import {
  REPRESENTANTE, RUTAS, valoresMIF, valoresRecursos, valoresVinculo, faltaParaMIF,
  nombreCompleto, personaDe, titularDe, hoyPartes,
} from "./pacForms";

/* ── Plantillas rellenas ─────────────────────────────────────────────────── */

async function firmaDe(base, docs) {
  const archivo = docs?.ranuras?.firma?.archivos?.[0];
  if (!archivo) return null;
  try {
    const r = await boFetch(`${base}/documentos/archivo/${archivo.id_documento}`);
    if (!r?.ok) return null;
    const mime = r.headers.get("content-type") || archivo.mime || "";
    if (!/image\/(png|jpe?g)/.test(mime)) return null;
    return { bytes: await r.arrayBuffer(), png: /png/.test(mime) };
  } catch { return null; }
}

async function rellenar(ruta, { textos, casillas, sueltos, firma, nombre }, firmaImg) {
  const [{ PDFDocument, StandardFonts, rgb }, resp] = await Promise.all([import("pdf-lib"), fetch(ruta)]);
  if (!resp.ok) throw new Error("No se encontró la plantilla oficial");
  const pdf = await PDFDocument.load(await resp.arrayBuffer(), { ignoreEncryption: true });
  const form = pdf.getForm();
  const helv = await pdf.embedFont(StandardFonts.Helvetica);

  for (const [campo, valor] of Object.entries(textos)) {
    if (!valor) continue;
    try { const c = form.getTextField(campo); c.setText(String(valor)); c.setFontSize(8); } catch { /* casilla ausente */ }
  }
  for (const casilla of casillas) {
    try { form.getCheckBox(casilla).check(); } catch { /* idem */ }
  }
  const pagina = pdf.getPages()[0];
  for (const s of sueltos) {
    if (s.texto) pagina.drawText(String(s.texto), { x: s.x, y: s.y, size: 8, font: helv, color: rgb(0, 0, 0) });
  }
  if (firmaImg && firma) {
    try {
      const campo = form.getTextField(firma);
      const w = campo.acroField.getWidgets()[0];
      const r = w.getRectangle();
      const img = firmaImg.png ? await pdf.embedPng(firmaImg.bytes) : await pdf.embedJpg(firmaImg.bytes);
      const esc = Math.min((r.width - 6) / img.width, (r.height - 6) / img.height);
      // La página del recuadro: la última si no es la primera (las declaraciones firman en la 2.ª).
      const paginas = pdf.getPages();
      let pag = paginas[0];
      for (const p of paginas) { const an = p.node.Annots(); if (an) for (let k = 0; k < an.size(); k++) { if (an.get(k) === w.dict || an.get(k) === campo.acroField.ref) pag = p; } }
      pag.drawImage(img, { x: r.x + 3, y: r.y + 3, width: img.width * esc, height: img.height * esc });
    } catch { /* sin firma: queda el recuadro en blanco */ }
  }
  try { form.updateFieldAppearances(helv); } catch { /* algunas plantillas no lo admiten */ }
  return { blob: new Blob([await pdf.save()], { type: "application/pdf" }), nombre };
}

/* ── Carta de representación (como la de estancia, para la UGE) ──────────── */

async function construirCarta(exp, a, firmaImg) {
  const { PDFDocument, StandardFonts, rgb } = await import("pdf-lib");
  const pdf = await PDFDocument.create();
  const pagina = pdf.addPage([595.28, 841.89]);
  const normal = await pdf.embedFont(StandardFonts.TimesRoman);
  const negrita = await pdf.embedFont(StandardFonts.TimesRomanBold);
  const M = 70; const ANCHO = 595.28 - M * 2; let y = 760;
  const centrar = (txt, f, tam) => { const w = f.widthOfTextAtSize(txt, tam); pagina.drawText(txt, { x: (595.28 - w) / 2, y, size: tam, font: f }); };
  centrar("CARTA DE REPRESENTACIÓN", negrita, 14); y -= 50;

  const p = personaDe(exp, a);
  const t = titularDe(exp);
  const completo = nombreCompleto(p) || "________________";
  const pasaporte = p.pasaporte || "____________";
  const menor = p.edad !== null && p.edad < 18;
  const quien = menor && p.representante?.nombre
    ? `Yo, ${p.representante.nombre.toUpperCase()}, identificado con documento N.º ${p.representante.doc || "__________"}, en calidad de representante legal del menor ${completo}, identificado con Pasaporte N.º ${pasaporte},`
    : `Yo, ${completo}, identificado con Pasaporte N.º ${pasaporte},`;
  const objeto = exp.rol !== "FAMILIAR" && !a
    ? "la solicitud de autorización de residencia como profesional altamente cualificado de mi persona"
    : `la solicitud de autorización de residencia como familiar de profesional altamente cualificado, vinculada a la autorización del titular ${t.completo || "________________"}${t.expediente ? ` (expediente ${t.expediente})` : ""}`;
  const cuerpo =
    `${quien} comparezco y por medio de la presente OTORGO a la letrada ${REPRESENTANTE.completo}, ` +
    `identificada con DNI ${REPRESENTANTE.dni} y número de colegiatura (Colegiada N. ${REPRESENTANTE.colegiatura}), ` +
    `representación expresa para presentar y tramitar ante la Unidad de Grandes Empresas y Colectivos Estratégicos ` +
    `(UGE-CE) de la Dirección General de Gestión Migratoria, a través de la plataforma telemática Mercurio y con su ` +
    `certificado profesional, ${objeto}, así como para aportar documentación, atender requerimientos, recibir ` +
    `notificaciones y recoger la resolución que recaiga, y para solicitar en mi nombre el visado correspondiente ` +
    `ante el Consulado de España.`;
  const TAM = 11.5; let linea = "";
  for (const palabra of cuerpo.split(" ")) {
    const prueba = linea ? `${linea} ${palabra}` : palabra;
    if (normal.widthOfTextAtSize(prueba, TAM) > ANCHO) { pagina.drawText(linea, { x: M, y, size: TAM, font: normal }); y -= 19; linea = palabra; }
    else linea = prueba;
  }
  if (linea) { pagina.drawText(linea, { x: M, y, size: TAM, font: normal }); y -= 19; }
  y -= 40;
  const ciudad = exp.dom_localidad || p.dom?.localidad || "________________";
  pagina.drawText(`${ciudad}, ${hoyPartes().largo}`, { x: M, y, size: TAM, font: normal });
  y -= 90;
  if (firmaImg) {
    try {
      const img = firmaImg.png ? await pdf.embedPng(firmaImg.bytes) : await pdf.embedJpg(firmaImg.bytes);
      const esc = Math.min(200 / img.width, 70 / img.height);
      pagina.drawImage(img, { x: M, y: y + 4, width: img.width * esc, height: img.height * esc });
    } catch { /* sin firma */ }
  }
  pagina.drawLine({ start: { x: M, y }, end: { x: M + 220, y }, thickness: 0.8, color: rgb(0.4, 0.4, 0.4) });
  y -= 18;
  pagina.drawText(menor && p.representante?.nombre ? p.representante.nombre.toUpperCase() : completo, { x: M, y, size: TAM, font: negrita });
  y -= 17;
  pagina.drawText(menor && p.representante?.nombre ? `Representante legal de ${completo}` : `Pasaporte N.º ${pasaporte}`, { x: M, y, size: TAM, font: normal });
  const apellido = (p.apellido1 || "carta").split(" ")[0].toLowerCase();
  return { blob: new Blob([await pdf.save()], { type: "application/pdf" }), nombre: `Carta-representacion-${apellido}.pdf` };
}

/* ── Interfaz ────────────────────────────────────────────────────────────── */

function Generador({ base, titulo, descripcion, ranura, construir, faltan = [], onArchivado }) {
  const [estado, setEstado] = useState(null);
  const [ocupado, setOcupado] = useState(false);

  async function conDoc(quehacer, aviso) {
    setOcupado(true); setEstado({ tipo: "trabajando", texto: aviso });
    try { const { blob, nombre } = await construir(); await quehacer(blob, nombre); }
    catch (e) { setEstado({ tipo: "error", texto: e.message || "No se pudo generar" }); }
    finally { setOcupado(false); }
  }
  const descargar = () => conDoc((blob, nombre) => {
    const el = document.createElement("a"); el.href = URL.createObjectURL(blob); el.download = nombre; el.click();
    setTimeout(() => URL.revokeObjectURL(el.href), 1000); setEstado({ tipo: "ok", texto: "Generado y descargado." });
  }, "Generando…");
  const archivar = () => conDoc(async (blob, nombre) => {
    const datos = new FormData(); datos.append("archivo", new File([blob], nombre, { type: "application/pdf" }));
    const r = await boFetch(`${base}/documentos/${ranura}`, { method: "POST", body: datos });
    const j = await r?.json().catch(() => null);
    if (!r?.ok || j?.ok === false) throw new Error(j?.msg || "No se pudo archivar");
    onArchivado?.(); setEstado({ tipo: "ok", texto: "Archivado: ya puede descargarlo desde su portal." });
  }, "Generando y archivando…");

  return (
    <div className="rounded-lg border border-neutral-200 px-3 py-2.5">
      <p className="text-[12.5px] font-semibold text-neutral-800">{titulo}</p>
      {descripcion && <p className="text-[11.5px] text-neutral-500 leading-relaxed mt-0.5">{descripcion}</p>}
      {faltan.length > 0 && (
        <p className="text-[11.5px] text-amber-700 mt-1 leading-relaxed">Saldrá incompleto: falta {faltan.slice(0, 4).join(", ")}{faltan.length > 4 ? ` y ${faltan.length - 4} más` : ""}.</p>
      )}
      <div className="flex items-center gap-2 flex-wrap mt-2">
        <button type="button" onClick={descargar} disabled={ocupado} className="text-[11.5px] font-semibold px-3 py-1.5 rounded-lg bg-[#023A4B] text-white hover:opacity-90 disabled:opacity-40">{ocupado ? "…" : "Generar y descargar"}</button>
        <button type="button" onClick={archivar} disabled={ocupado} className="text-[11.5px] font-semibold px-3 py-1.5 rounded-lg border-[1.5px] border-[#023A4B] text-[#023A4B] hover:bg-[#023A4B]/5 disabled:opacity-40">Archivar en su expediente</button>
        {estado && <span className={`text-[11.5px] ${estado.tipo === "error" ? "text-red-600" : estado.tipo === "ok" ? "text-[#1D6A4A]" : "text-neutral-500"}`}>{estado.texto}</span>}
      </div>
    </div>
  );
}

const VINCULO = { CONYUGE: "cónyuge", PAREJA: "pareja de hecho", HIJO_COMUN: "hijo/a", HIJO_NO_COMUN: "hijo/a no común", ASCENDIENTE: "ascendiente" };

/** Los impresos de UNA persona: el solicitante (a = null) o un acompañante. */
function Persona({ idSolicitud, exp, a, docs, onArchivado }) {
  const base = a ? `/backoffice/solicitudes/${idSolicitud}/pac/acompanantes/${a.id_acompanante}` : `/backoffice/solicitudes/${idSolicitud}/pac`;
  const p = personaDe(exp, a);
  const esFamiliar = a || exp.rol === "FAMILIAR";
  const esTitular = !a && exp.rol !== "FAMILIAR";
  const tieneFirma = Boolean(docs?.ranuras?.firma?.archivos?.length);
  const firma = () => firmaDe(base, docs);

  return (
    <div className="rounded-xl border border-neutral-200 p-3">
      <div className="flex items-center gap-2 flex-wrap mb-2">
        <span className="text-[13px] font-bold text-[#1A3557]">{nombreCompleto(p) || "Sin nombre"}</span>
        <span className="text-[11px] text-neutral-500">{a ? VINCULO[a.vinculo] || "acompañante" : exp.rol === "FAMILIAR" ? "solicitante (familiar del titular)" : "titular del PAC"}{p.edad !== null && p.edad < 18 ? " · menor" : ""}</span>
        <span className={`ml-auto text-[10.5px] font-semibold px-2 py-0.5 rounded-full ${tieneFirma ? "bg-[#E8F5EE] text-[#14532d]" : "bg-amber-50 text-amber-700"}`}>{tieneFirma ? "✓ firma digitalizada" : "sin firma: saldrá el recuadro vacío"}</span>
      </div>
      <div className="space-y-2">
        {esFamiliar && (
          <Generador base={base} ranura="formulario_uge" onArchivado={onArchivado} faltan={faltaParaMIF(exp, a)}
            titulo="Formulario MI-F · solicitud de residencia de familiar"
            descripcion="Marca «familiar de profesional altamente cualificado», inicial; sus datos, el titular que da derecho (pasaporte y nº de expediente) y quien presenta."
            construir={async () => rellenar(RUTAS.mif, valoresMIF(exp, a), await firma())} />
        )}
        <Generador base={base} ranura="declaracion_recursos" onArchivado={onArchivado}
          titulo="Declaración responsable de suficiencia de recursos"
          descripcion="Sus datos y, como origen de los medios, el contrato de trabajo del titular."
          construir={async () => rellenar(RUTAS.recursos, valoresRecursos(exp, a), await firma())} />
        {esFamiliar && (
          <Generador base={base} ranura="declaracion_vinculo" onArchivado={onArchivado}
            titulo="Declaración jurada de mantenimiento del vínculo"
            descripcion={`La firma el titular del PAC sobre esta persona (${VINCULO[a?.vinculo] || "familiar"}). Se archiva en el expediente de la persona.`}
            construir={async () => rellenar(RUTAS.vinculo, valoresVinculo(exp, a), esTitular ? await firma() : null)} />
        )}
        <Generador base={base} ranura="representacion" onArchivado={onArchivado}
          faltan={[p.apellido1 || p.nombres, p.pasaporte].every(Boolean) ? [] : ["nombre y pasaporte"]}
          titulo={`Carta de representación a ${REPRESENTANTE.completo}`}
          descripcion="Para presentar por Mercurio con su certificado profesional. La firma la persona (o su representante legal si es menor)."
          construir={async () => construirCarta(exp, a, await firma())} />
      </div>
    </div>
  );
}

export default function GeneradoresPac({ id, exp, docs, onArchivado, numero = "5" }) {
  const [acomp, setAcomp] = useState([]);
  const cargar = useCallback(() => boGET(`/backoffice/solicitudes/${id}/pac/acompanantes`).then((r) => { if (r?.ok) setAcomp(r.acompanantes || []); }), [id]);
  useEffect(() => { cargar(); }, [cargar]);
  const recargar = () => { cargar(); onArchivado?.(); };

  return (
    <div id="bloque-generadores" className="bg-white border border-neutral-200 rounded-xl p-4 scroll-mt-4">
      <div className="flex items-center gap-2 mb-3 flex-wrap">
        <span className="shrink-0 w-7 h-7 rounded-lg grid place-items-center text-[12px] font-bold text-white font-serif" style={{ background: "#023A4B" }}>{numero}</span>
        <span className="text-[13.5px] font-bold text-[#1A3557]">Impresos que generamos</span>
        <span className="ml-auto text-[11.5px] text-neutral-400">con los datos y la firma de cada persona</span>
      </div>
      <p className="text-[11.5px] text-neutral-500 leading-relaxed mb-3">
        Plantillas oficiales de la UGE rellenas con lo que hay en el expediente. Si un dato está mal escrito allí, saldrá mal aquí: revísalo antes de presentar. El MI-T del titular no tiene plantilla rellenable: se cumplimenta en Mercurio.
      </p>
      <div className="space-y-3">
        <Persona idSolicitud={id} exp={exp} a={null} docs={docs} onArchivado={recargar} />
        {acomp.map((a) => <Persona key={a.id_acompanante} idSolicitud={id} exp={exp} a={a} docs={a.documentos} onArchivado={recargar} />)}
      </div>
    </div>
  );
}
