// Cartas de representación de la modificatoria.
//
// Son dos, y no una: en este trámite hay dos partes que tienen que autorizar a
// Inspira. El asesorado otorga la representación de su propio expediente; la
// empresa la otorga por separado, firmada por quien tenga poder para ello,
// porque extranjería le pide documentos a ella y no al trabajador.
//
// Las dos las firma a mano quien las otorga, así que se deja el espacio.
import { useState } from "react";
import { boFetch } from "../../../../../services/backofficeApi";

/** La letrada que representa. Es siempre la misma; lo que cambia es quién otorga. */
const REPRESENTANTE = {
  nombre: "CYNTHIA ESCOBAR RODRIGUEZ",
  dni: "29505718F",
  colegiatura: "15.695",
};

const MESES = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio",
  "agosto", "septiembre", "octubre", "noviembre", "diciembre"];

function hoyLargo() {
  const d = new Date();
  return `${d.getDate()} de ${MESES[d.getMonth()]} de ${d.getFullYear()}`;
}

function nombreCompleto(exp = {}) {
  return [exp.nombres, exp.apellido1, exp.apellido2]
    .filter(Boolean).join(" ").toUpperCase();
}

/**
 * Dibuja una carta en A4.
 *
 * El cuerpo se parte por palabras: el texto es corto y no compensa un
 * algoritmo de justificado completo.
 */
async function dibujarCarta({ titulo, cuerpo, ciudad, firmante, identificacion }) {
  const { PDFDocument, StandardFonts, rgb } = await import("pdf-lib");
  const pdf = await PDFDocument.create();
  const pagina = pdf.addPage([595.28, 841.89]);
  const normal = await pdf.embedFont(StandardFonts.TimesRoman);
  const negrita = await pdf.embedFont(StandardFonts.TimesRomanBold);

  const M = 70;
  const ANCHO = 595.28 - M * 2;
  const TAM = 11.5;
  let y = 760;

  const w = negrita.widthOfTextAtSize(titulo, 14);
  pagina.drawText(titulo, { x: (595.28 - w) / 2, y, size: 14, font: negrita });
  y -= 50;

  let linea = "";
  for (const palabra of cuerpo.split(" ")) {
    const prueba = linea ? `${linea} ${palabra}` : palabra;
    if (normal.widthOfTextAtSize(prueba, TAM) > ANCHO) {
      pagina.drawText(linea, { x: M, y, size: TAM, font: normal });
      y -= 19;
      linea = palabra;
    } else {
      linea = prueba;
    }
  }
  if (linea) { pagina.drawText(linea, { x: M, y, size: TAM, font: normal }); y -= 19; }

  y -= 40;
  pagina.drawText(`${ciudad}, ${hoyLargo()}`, { x: M, y, size: TAM, font: normal });

  // Espacio para la firma manuscrita de quien otorga.
  y -= 90;
  pagina.drawLine({
    start: { x: M, y }, end: { x: M + 240, y },
    thickness: 0.8, color: rgb(0.4, 0.4, 0.4),
  });
  y -= 18;
  pagina.drawText(firmante, { x: M, y, size: TAM, font: negrita });
  if (identificacion) {
    y -= 17;
    pagina.drawText(identificacion, { x: M, y, size: TAM, font: normal });
  }

  return pdf.save();
}

/* ── Carta del asesorado ─────────────────────────────────────────────────── */

async function construirCartaAsesorado(exp) {
  const completo = nombreCompleto(exp) || "________________";
  const nie = exp.nie || "____________";
  const pasaporte = exp.pasaporte_numero || "____________";

  const cuerpo =
    `Yo, ${completo}, identificado con N.I.E. ${nie} y Pasaporte N.º ${pasaporte}, ` +
    `comparezco y por medio de la presente OTORGO a la letrada ${REPRESENTANTE.nombre}, ` +
    `identificada con número de DNI ${REPRESENTANTE.dni}, y número de colegiatura ` +
    `(Colegiado N. ${REPRESENTANTE.colegiatura}), para que inicie y siga ante la Oficina de ` +
    `Extranjería de España el procedimiento de modificación de mi situación de estancia por ` +
    `estudios a residencia y trabajo por cuenta ajena.`;

  const bytes = await dibujarCarta({
    titulo: "CARTA DE REPRESENTACIÓN",
    cuerpo,
    ciudad: exp.dom_localidad || exp.con_centro_localidad || "________________",
    firmante: completo,
    identificacion: `N.I.E. ${nie}`,
  });

  const apellido = (exp.apellido1 || "carta").split(" ")[0].toLowerCase();
  return {
    blob: new Blob([bytes], { type: "application/pdf" }),
    nombre: `Carta-representacion-${apellido}.pdf`,
  };
}

/* ── Carta de la empresa ─────────────────────────────────────────────────── */

async function construirCartaEmpresa(exp) {
  const razon = (exp.emp_razon_social || "________________").toUpperCase();
  const nif = exp.emp_nif || "____________";
  const trabajador = nombreCompleto(exp) || "________________";
  const nie = exp.nie || "____________";

  // El representante de la empresa firma; su nombre no lo tenemos en los datos,
  // así que se deja en blanco para que lo rellene quien firme.
  const cuerpo =
    `D./Dña. ______________________________, con DNI/NIE ______________, en su condición ` +
    `de representante legal de la empresa ${razon}, con N.I.F. ${nif}, por medio de la ` +
    `presente OTORGA a la letrada ${REPRESENTANTE.nombre}, identificada con número de DNI ` +
    `${REPRESENTANTE.dni}, y número de colegiatura (Colegiado N. ${REPRESENTANTE.colegiatura}), ` +
    `la representación necesaria para iniciar y seguir ante la Oficina de Extranjería de ` +
    `España el procedimiento de modificación a residencia y trabajo por cuenta ajena de ` +
    `${trabajador}, con N.I.E. ${nie}, así como para aportar en nombre de esta empresa cuanta ` +
    `documentación sea requerida en dicho procedimiento.`;

  const bytes = await dibujarCarta({
    titulo: "CARTA DE REPRESENTACIÓN DE LA EMPRESA",
    cuerpo,
    ciudad: exp.emp_localidad || exp.con_centro_localidad || "________________",
    firmante: razon,
    identificacion: `N.I.F. ${nif} · Firma y sello del representante legal`,
  });

  const nombre = (exp.emp_razon_social || "empresa").split(" ")[0].toLowerCase();
  return {
    blob: new Blob([bytes], { type: "application/pdf" }),
    nombre: `Carta-representacion-empresa-${nombre}.pdf`,
  };
}

/* ── Interfaz ────────────────────────────────────────────────────────────── */

function Generador({ id, titulo, descripcion, ranura, construir, exp, faltan, onArchivado }) {
  const [estado, setEstado] = useState(null);
  const [ocupado, setOcupado] = useState(false);

  async function conDoc(quehacer, aviso) {
    setOcupado(true);
    setEstado({ tipo: "trabajando", texto: aviso });
    try {
      const { blob, nombre } = await construir(exp);
      await quehacer(blob, nombre);
    } catch (e) {
      setEstado({ tipo: "error", texto: e.message || "No se pudo generar" });
    } finally {
      setOcupado(false);
    }
  }

  const descargar = () => conDoc((blob, nombre) => {
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = nombre;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
    setEstado({ tipo: "ok", texto: "Generada y descargada." });
  }, "Generando…");

  const archivar = () => conDoc(async (blob, nombre) => {
    const datos = new FormData();
    datos.append("archivo", new File([blob], nombre, { type: "application/pdf" }));
    const r = await boFetch(`/backoffice/solicitudes/${id}/modificatoria/documentos/${ranura}`, {
      method: "POST", body: datos,
    });
    const j = await r?.json().catch(() => null);
    if (!r?.ok || j?.ok === false) throw new Error(j?.msg || "No se pudo archivar");
    onArchivado?.();
    setEstado({ tipo: "ok", texto: "Archivada en el expediente." });
  }, "Generando y archivando…");

  return (
    <div className="rounded-xl border border-neutral-200 px-3.5 py-3">
      <p className="text-[12.5px] font-semibold text-neutral-800">{titulo}</p>
      <p className="text-[11.5px] text-neutral-500 leading-relaxed mt-0.5">{descripcion}</p>

      {faltan.length > 0 && (
        <p className="text-[11.5px] text-amber-700 bg-amber-50 border border-amber-200
          rounded-lg px-2.5 py-1.5 mt-2 leading-relaxed">
          Saldrá con huecos: falta {faltan.join(", ")}.
        </p>
      )}

      <div className="flex items-center gap-2 flex-wrap mt-2.5">
        <button type="button" onClick={descargar} disabled={ocupado}
          className="text-[11.5px] font-semibold px-3 py-1.5 rounded-lg bg-[#023A4B]
            text-white hover:opacity-90 disabled:opacity-40">
          {ocupado ? "…" : "Generar y descargar"}
        </button>
        <button type="button" onClick={archivar} disabled={ocupado}
          className="text-[11.5px] font-semibold px-3 py-1.5 rounded-lg border-[1.5px]
            border-[#023A4B] text-[#023A4B] hover:bg-[#023A4B]/5 disabled:opacity-40">
          Archivar en el expediente
        </button>
        {estado && (
          <span className={`text-[11.5px] ${
            estado.tipo === "error" ? "text-red-600"
              : estado.tipo === "ok" ? "text-[#1D6A4A]" : "text-neutral-500"
          }`}>{estado.texto}</span>
        )}
      </div>
    </div>
  );
}

export default function GeneradoresModificatoria({ id, exp, onArchivado }) {
  const faltaAsesorado = [
    !exp.apellido1 && "nombre",
    !exp.nie && "NIE",
  ].filter(Boolean);

  const faltaEmpresa = [
    !exp.emp_razon_social && "razón social",
    !exp.emp_nif && "NIF",
  ].filter(Boolean);

  return (
    <div id="bloque-generadores" className="bg-white border border-neutral-200 rounded-xl p-4 scroll-mt-4">
      <div className="flex items-center gap-2 mb-3 flex-wrap">
        <span className="shrink-0 w-7 h-7 rounded-lg grid place-items-center text-[12px]
          font-bold text-white font-serif" style={{ background: "#023A4B" }}>5</span>
        <span className="text-[13.5px] font-bold text-[#1A3557]">Cartas de representación</span>
        <span className="ml-auto text-[11.5px] text-neutral-400">a nombre de {REPRESENTANTE.nombre}</span>
      </div>

      <div className="space-y-2">
        <Generador
          id={id} exp={exp} faltan={faltaAsesorado} onArchivado={onArchivado}
          construir={construirCartaAsesorado} ranura="otros_asesor"
          titulo="Carta del asesorado"
          descripcion="La firma el trabajador. Otorga la representación de su propio expediente."
        />
        <Generador
          id={id} exp={exp} faltan={faltaEmpresa} onArchivado={onArchivado}
          construir={construirCartaEmpresa} ranura="emp_autorizacion"
          titulo="Carta de la empresa"
          descripcion="La firma y sella el representante legal de la empresa. Su nombre y DNI van en blanco para que los rellene quien firme, porque no los tenemos en el expediente."
        />
      </div>

      <p className="text-[11px] text-neutral-400 leading-relaxed mt-3">
        Las dos salen de los datos del expediente. Revísalas antes de mandarlas a firmar.
      </p>
    </div>
  );
}
