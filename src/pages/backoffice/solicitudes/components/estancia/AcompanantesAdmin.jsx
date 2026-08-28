// Los acompañantes de una estancia, vistos por el asesor.
//
// Cada uno lleva sus datos, sus documentos y sus dos impresos: el EX-00 —del
// que sólo se rellena el bloque 1— y la carta de representación. Quien firma
// la carta cambia según la edad: un cónyuge adulto la firma él; por un menor
// la firma su representante legal, que casi siempre es el titular.
import { useCallback, useEffect, useState } from "react";
import { boGET, boFetch } from "../../../../../services/backofficeApi";
import VisorArchivo from "../../../../../components/common/VisorArchivo";
import { dialog } from "../../../../../services/dialogService";
import {
  REPRESENTANTE, valoresEX00Acompanante, casillasEX00Acompanante,
  faltaParaEX00Acompanante, nombreAcompanante, domicilioAcompanante,
} from "./ex00";

const RUTA_EX00 = "/formularios/ex00-estancia.pdf";

const MESES = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio",
  "agosto", "septiembre", "octubre", "noviembre", "diciembre"];

const VINCULOS = { CONYUGE: "Cónyuge", HIJO: "Hijo/a", OTRO: "Otro familiar" };

const ESTADO_DOC = {
  SIN_SUBIR: { label: "Sin subir",   clase: "text-neutral-400" },
  PENDIENTE: { label: "Por revisar", clase: "text-sky-700" },
  APROBADO:  { label: "Aprobado",    clase: "text-emerald-700" },
  OBSERVADO: { label: "Observado",   clase: "text-red-600" },
};

function hoyLargo() {
  const d = new Date();
  return `${d.getDate()} de ${MESES[d.getMonth()]} de ${d.getFullYear()}`;
}

/* ── Los impresos ────────────────────────────────────────────────────────── */

async function construirEX00(a, exp) {
  const [{ PDFDocument, StandardFonts }, resp] = await Promise.all([
    import("pdf-lib"),
    fetch(RUTA_EX00),
  ]);
  if (!resp.ok) throw new Error("No se encontró la plantilla del EX-00");

  const pdf = await PDFDocument.load(await resp.arrayBuffer());
  const form = pdf.getForm();
  const times = await pdf.embedFont(StandardFonts.TimesRoman);

  for (const [campo, valor] of Object.entries(valoresEX00Acompanante(a, exp))) {
    if (!valor) continue;
    try {
      const c = form.getTextField(campo);
      c.setText(String(valor));
      c.setFontSize(9);
    } catch { /* casilla ausente en esta versión de la plantilla */ }
  }
  for (const casilla of casillasEX00Acompanante(a)) {
    try { form.getCheckBox(casilla).check(); } catch { /* idem */ }
  }
  for (const c of form.getFields()) {
    try { c.updateAppearances?.(times); } catch { /* no todos aceptan fuente */ }
  }
  form.updateFieldAppearances(times);

  const apellido = (a.apellido1 || "familiar").split(" ")[0].toLowerCase();
  return {
    blob: new Blob([await pdf.save()], { type: "application/pdf" }),
    nombre: `EX00-familiar-${apellido}.pdf`,
  };
}

async function construirCarta(a, exp) {
  const { PDFDocument, StandardFonts, rgb } = await import("pdf-lib");
  const pdf = await PDFDocument.create();
  const pagina = pdf.addPage([595.28, 841.89]); // A4
  const normal = await pdf.embedFont(StandardFonts.TimesRoman);
  const negrita = await pdf.embedFont(StandardFonts.TimesRomanBold);

  const M = 70;
  const ANCHO = 595.28 - M * 2;
  let y = 760;

  const centrar = (txt, fuente, tam) => {
    const w = fuente.widthOfTextAtSize(txt, tam);
    pagina.drawText(txt, { x: (595.28 - w) / 2, y, size: tam, font: fuente, color: rgb(0, 0, 0) });
  };

  centrar("CARTA DE REPRESENTACIÓN", negrita, 14);
  y -= 50;

  const suyo = nombreAcompanante(a) || "________________";
  const pasaporte = a.pasaporte || "____________";
  const menor = a.revision?.menor;
  const parentesco = (VINCULOS[a.vinculo] || "familiar").toLowerCase();

  // Un menor no otorga poder: lo hace quien le representa. Firmar en su nombre
  // una carta que dice «yo comparezco» la deja sin valor.
  const cuerpo = menor
    ? `Yo, ${(a.repr_nombre || "________________").toUpperCase()}, identificado/a con ` +
      `documento N.º ${a.repr_doc || "____________"}, en calidad de ` +
      `${(a.repr_titulo || "representante legal").toLowerCase()} del menor ${suyo}, ` +
      `identificado con Pasaporte N.º ${pasaporte}, comparezco y por medio de la presente ` +
      `OTORGO a la letrada ${REPRESENTANTE.nombre}, identificada con número de DNI ` +
      `${REPRESENTANTE.dni}, y número de colegiatura (Colegiado N. ${REPRESENTANTE.colegiatura}) ` +
      `para que inicie con el procedimiento administrativo ante la oficina de extranjería de ` +
      `España para la autorización de estancia del menor como familiar acompañante, vinculada ` +
      `a la autorización de estancia por estudios del titular.`
    : `Yo, ${suyo}, identificado/a con Pasaporte N.º ${pasaporte}, en calidad de ` +
      `${parentesco} del titular, comparezco y por medio de la presente OTORGO a la letrada ` +
      `${REPRESENTANTE.nombre}, identificada con número de DNI ${REPRESENTANTE.dni}, y número ` +
      `de colegiatura (Colegiado N. ${REPRESENTANTE.colegiatura}) para que inicie con el ` +
      `procedimiento administrativo ante la oficina de extranjería de España para mi ` +
      `autorización de estancia como familiar acompañante, vinculada a la autorización de ` +
      `estancia por estudios del titular.`;

  const TAM = 11.5;
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
  const dom = domicilioAcompanante(a, exp);
  const ciudad = dom.localidad || exp.uni_localidad || "________________";
  pagina.drawText(`${ciudad}, ${hoyLargo()}`, { x: M, y, size: TAM, font: normal });

  y -= 90;
  pagina.drawLine({
    start: { x: M, y }, end: { x: M + 220, y },
    thickness: 0.8, color: rgb(0.4, 0.4, 0.4),
  });
  y -= 18;
  pagina.drawText(menor ? (a.repr_nombre || "").toUpperCase() || "________________" : suyo,
    { x: M, y, size: TAM, font: negrita });
  y -= 17;
  pagina.drawText(
    menor ? `Documento N.º ${a.repr_doc || "____________"}` : `Pasaporte N.º ${pasaporte}`,
    { x: M, y, size: TAM, font: normal });

  const apellido = (a.apellido1 || "familiar").split(" ")[0].toLowerCase();
  return {
    blob: new Blob([await pdf.save()], { type: "application/pdf" }),
    nombre: `Carta-representacion-familiar-${apellido}.pdf`,
  };
}

/* ── Interfaz ────────────────────────────────────────────────────────────── */

function Generador({ base, titulo, ranura, construir, faltan, onCambio }) {
  const [estado, setEstado] = useState(null);
  const [ocupado, setOcupado] = useState(false);

  async function conDoc(quehacer, aviso) {
    setOcupado(true);
    setEstado({ tipo: "trabajando", texto: aviso });
    try {
      const { blob, nombre } = await construir();
      await quehacer(blob, nombre);
    } catch (e) {
      setEstado({ tipo: "error", texto: e.message || "No se pudo generar" });
    } finally { setOcupado(false); }
  }

  const descargar = () => conDoc((blob, nombre) => {
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = nombre;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
    setEstado({ tipo: "ok", texto: "Generado y descargado." });
  }, "Generando…");

  const archivar = () => conDoc(async (blob, nombre) => {
    const datos = new FormData();
    datos.append("archivo", new File([blob], nombre, { type: "application/pdf" }));
    const r = await boFetch(`${base}/documentos/${ranura}`, { method: "POST", body: datos });
    const j = await r?.json().catch(() => null);
    if (!r?.ok || j?.ok === false) throw new Error(j?.msg || "No se pudo archivar");
    onCambio?.();
    setEstado({ tipo: "ok", texto: "Archivado. El cliente ya puede descargarlo." });
  }, "Generando y archivando…");

  return (
    <div className="rounded-lg border border-neutral-200 px-3 py-2.5">
      <p className="text-[12.5px] font-semibold text-neutral-800">{titulo}</p>
      {faltan.length > 0 && (
        <p className="text-[11.5px] text-amber-700 mt-1 leading-relaxed">
          Saldrá incompleto: falta {faltan.slice(0, 3).join(", ")}
          {faltan.length > 3 ? ` y ${faltan.length - 3} más` : ""}.
        </p>
      )}
      <div className="flex items-center gap-2 flex-wrap mt-2">
        <button type="button" onClick={descargar} disabled={ocupado}
          className="text-[11.5px] font-semibold px-3 py-1.5 rounded-lg bg-[#023A4B]
            text-white hover:opacity-90 disabled:opacity-40">
          {ocupado ? "…" : "Generar y descargar"}
        </button>
        <button type="button" onClick={archivar} disabled={ocupado}
          className="text-[11.5px] font-semibold px-3 py-1.5 rounded-lg border-[1.5px]
            border-[#023A4B] text-[#023A4B] hover:bg-[#023A4B]/5 disabled:opacity-40">
          Archivar
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

function Dato({ k, v }) {
  const vacio = !String(v || "").trim();
  return (
    <div className="min-w-0 flex items-baseline gap-3 py-[7px] border-b border-neutral-100">
      <p className="text-[11.5px] text-neutral-500 leading-snug w-[44%] shrink-0">{k}</p>
      <p className={`text-[12.5px] leading-snug break-words min-w-0 flex-1 ${
        vacio ? "text-neutral-300" : "text-neutral-900 font-medium"
      }`}>{vacio ? "—" : v}</p>
    </div>
  );
}

function FilaDoc({ base, def, onCambio, onVer }) {
  const [ocupado, setOcupado] = useState(false);
  const est = ESTADO_DOC[def.estado] || ESTADO_DOC.SIN_SUBIR;
  const ultimo = def.archivos[0];

  async function revisar(estado) {
    const observacion = estado === "OBSERVADO"
      ? window.prompt("¿Qué hay que corregir?")
      : null;
    if (estado === "OBSERVADO" && !observacion) return;
    setOcupado(true);
    await boFetch(
      `${base}/documentos/archivo/${ultimo.id_documento}/revision`,
      { method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ estado, observacion }) },
    );
    setOcupado(false);
    onCambio();
  }

  return (
    <div className="flex items-center gap-2.5 py-2 border-b border-neutral-100 flex-wrap">
      <span className="text-[12.5px] text-neutral-800 min-w-0 flex-1">{def.etiqueta}</span>
      {ultimo && (
        <button type="button" onClick={() => onVer(ultimo)}
          className="text-[11.5px] text-[#046C8C] hover:underline truncate max-w-[45%]">
          {ultimo.nombre}
        </button>
      )}
      <span className={`text-[11px] font-semibold ${est.clase}`}>{est.label}</span>
      {ultimo && (
        <span className="flex gap-1.5">
          <button type="button" disabled={ocupado} onClick={() => revisar("APROBADO")}
            className="text-[11px] font-semibold px-2 py-1 rounded border border-emerald-300
              text-emerald-700 hover:bg-emerald-50 disabled:opacity-40">✓</button>
          <button type="button" disabled={ocupado} onClick={() => revisar("OBSERVADO")}
            className="text-[11px] font-semibold px-2 py-1 rounded border border-red-300
              text-red-600 hover:bg-red-50 disabled:opacity-40">✕</button>
        </span>
      )}
    </div>
  );
}

function Ficha({ idSolicitud, a, exp, abierta, onAbrir, onCambio }) {
  const base = `/backoffice/solicitudes/${idSolicitud}/estancia/acompanantes/${a.id_acompanante}`;
  const [viendo, setViendo] = useState(null);
  const [abriendoCarpeta, setAbriendoCarpeta] = useState(false);

  /** Aprobar u observar sin salir del documento. */
  async function revisarDesdeVisor(archivo, estado, observacion = null) {
    const r = await boFetch(`${base}/documentos/archivo/${archivo.id_documento}/revision`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ estado, observacion }),
    });
    if (r?.ok !== false) onCambio();
    else dialog.toast("No se pudo guardar la revisión", "error");
  }

  /**
   * Su subcarpeta en Drive, dentro de la del titular. Cada acompañante tiene
   * la suya porque un expediente con familia se revisa persona a persona.
   *
   * Sin "noopener": con esa opción `window.open` devuelve null y no queda
   * referencia para mandar la pestaña a Drive. Y si el navegador la bloquea
   * igual —en el móvil pasa casi siempre— se navega en la misma pestaña.
   */
  async function abrirCarpeta(e) {
    e.stopPropagation();
    const ventana = window.open("", "_blank");
    if (ventana) { try { ventana.opener = null; } catch { /* da igual */ } }

    setAbriendoCarpeta(true);
    const r = await boGET(`${base}/carpeta-drive`);
    setAbriendoCarpeta(false);

    if (r?.ok && r.url) {
      if (ventana) ventana.location.replace(r.url);
      else window.location.assign(r.url);
      return;
    }
    ventana?.close();
    dialog.toast(r?.msg || "No se pudo abrir la carpeta en Drive", "error");
  }
  const rev = a.revision || {};
  const docs = a.documentos || {};
  const ranuras = Object.entries(docs.ranuras || {});
  const docsFaltan = (docs.faltan || []).length + (docs.observados || []).length;
  const dom = domicilioAcompanante(a, exp);

  return (
    <div className="rounded-xl border border-neutral-200 overflow-hidden">
      <button type="button" onClick={onAbrir}
        className="w-full flex items-center gap-2.5 px-3 py-2.5 text-left hover:bg-neutral-50">
        <span className="min-w-0 flex-1">
          <span className="block text-[13px] font-semibold text-neutral-900 truncate">
            {nombreAcompanante(a) || "Sin nombre"}
          </span>
          <span className="block text-[11px] text-neutral-400">
            {VINCULOS[a.vinculo] || "Sin vínculo"}
            {rev.edad !== null && rev.edad !== undefined ? ` · ${rev.edad} años` : ""}
            {rev.menor ? " · menor" : ""}
          </span>
        </span>
        {(rev.faltan?.length > 0 || docsFaltan > 0) && (
          <span className="shrink-0 text-[10.5px] font-semibold text-amber-700">
            {[rev.faltan?.length ? `${rev.faltan.length} datos` : null,
              docsFaltan ? `${docsFaltan} docs` : null].filter(Boolean).join(" · ")}
          </span>
        )}
        <span className="shrink-0 text-neutral-300 text-[11px]">{abierta ? "▲" : "▼"}</span>
      </button>

      {abierta && (
        <div className="border-t border-neutral-100 px-3 py-3">
          <div className="rounded-xl border border-neutral-200 bg-white px-3 py-0.5
            grid grid-cols-1 sm:grid-cols-2 gap-x-7">
            <Dato k="Vínculo" v={VINCULOS[a.vinculo]} />
            <Dato k="Pasaporte" v={a.pasaporte} />
            <Dato k="NIE" v={a.nie} />
            <Dato k="Sexo" v={a.sexo} />
            <Dato k="Fecha de nacimiento" v={a.fecha_nacimiento} />
            <Dato k="Lugar de nacimiento" v={a.lugar_nacimiento} />
            <Dato k="País de nacimiento" v={a.pais_nacimiento} />
            <Dato k="Nacionalidad" v={a.nacionalidad} />
            <Dato k="Estado civil" v={a.estado_civil} />
            <Dato k="Nombre del padre" v={a.nombre_padre} />
            <Dato k="Nombre de la madre" v={a.nombre_madre} />
            <Dato k="Teléfono" v={a.telefono} />
            <Dato k="Correo" v={a.correo} />
            <Dato k="Domicilio" v={[dom.calle, dom.numero, dom.piso].filter(Boolean).join(" ")} />
            <Dato k="Localidad" v={[dom.localidad, dom.cp].filter(Boolean).join(" · ")} />
            <Dato k="Provincia" v={dom.provincia} />
            {rev.menor && <Dato k="Representante legal" v={a.repr_nombre} />}
            {rev.menor && <Dato k="Doc. del representante" v={a.repr_doc} />}
          </div>

          {(rev.avisos || []).map((t) => (
            <p key={t} className="text-[11.5px] text-amber-700 leading-relaxed mt-2">⚠ {t}</p>
          ))}

          <div className="flex items-center gap-2 mt-4 mb-1">
            <p className="text-[12px] font-semibold text-neutral-700">Sus documentos</p>
            <button
              type="button"
              onClick={abrirCarpeta}
              disabled={abriendoCarpeta}
              className="ml-auto text-[11px] px-2 py-1 rounded-lg border border-neutral-300
                hover:bg-neutral-50 disabled:opacity-50 shrink-0"
            >
              {abriendoCarpeta ? "Abriendo…" : "📁 Su carpeta en Drive"}
            </button>
          </div>
          <div>
            {ranuras.map(([clave, def]) => (
              <FilaDoc key={clave} base={base} def={def} onCambio={onCambio} onVer={setViendo} />
            ))}
          </div>

          {viendo && (
            <VisorArchivo
              interno
              ruta={`${base}/documentos/archivo/${viendo.id_documento}`}
              nombre={viendo.nombre}
              mime={viendo.mime}
              tamano={viendo.tamano}
              onAprobar={() => revisarDesdeVisor(viendo, "APROBADO")}
              onObservar={(motivo) => revisarDesdeVisor(viendo, "OBSERVADO", motivo)}
              onCerrar={() => setViendo(null)}
            />
          )}

          <p className="text-[12px] font-semibold text-neutral-700 mt-4 mb-2">Sus impresos</p>
          <div className="space-y-2">
            <Generador
              base={base} ranura="ex00" onCambio={onCambio}
              titulo="EX-00 del familiar (bloque 1)"
              faltan={faltaParaEX00Acompanante(a, exp)}
              construir={() => construirEX00(a, exp)}
            />
            <Generador
              base={base} ranura="representacion" onCambio={onCambio}
              titulo={rev.menor
                ? "Carta de representación (la firma su representante legal)"
                : "Carta de representación del familiar"}
              faltan={rev.menor && !a.repr_nombre ? ["el representante legal"] : []}
              construir={() => construirCarta(a, exp)}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default function AcompanantesAdmin({ idSolicitud, exp, numero = "6" }) {
  const [lista, setLista] = useState([]);
  const [abierta, setAbierta] = useState(null);

  const cargar = useCallback(
    () => boGET(`/backoffice/solicitudes/${idSolicitud}/estancia/acompanantes`).then((r) => {
      if (r?.ok) setLista(r.acompanantes || []);
    }),
    [idSolicitud],
  );

  useEffect(() => { cargar(); }, [cargar]);

  const sinCerrar = lista.filter(
    (a) => a.revision?.faltan?.length || a.documentos?.faltan?.length,
  ).length;

  return (
    <div id="bloque-acompanantes"
      className="bg-white border border-neutral-200 rounded-xl p-4 scroll-mt-4">
      <div className="flex items-center gap-2 mb-3 flex-wrap">
        <span className="shrink-0 w-7 h-7 rounded-lg grid place-items-center text-[12px]
          font-bold text-white font-serif" style={{ background: "#023A4B" }}>{numero}</span>
        <span className="text-[13.5px] font-bold text-[#1A3557]">Acompañantes</span>
        <span className="ml-auto text-[11.5px] text-neutral-400">
          {!exp?.con_acompanantes && lista.length === 0 ? "viaja solo"
            : lista.length === 0 ? "ninguno todavía"
            : sinCerrar > 0 ? `${sinCerrar} de ${lista.length} sin cerrar`
            : `${lista.length} listo${lista.length === 1 ? "" : "s"}`}
        </span>
      </div>

      <p className="text-[11.5px] text-neutral-500 leading-relaxed mb-3">
        Van vinculados a la autorización del titular y sin permiso de trabajo. Cada uno lleva
        su propio EX-00 —sólo el bloque 1— y su carta de representación.
      </p>

      {lista.length === 0 ? (
        <p className="text-[12.5px] text-neutral-400">
          {exp?.con_acompanantes
            ? "Ha marcado que viaja acompañado pero todavía no ha añadido a nadie."
            : "Ha indicado que viaja solo. Si eso cambia, lo marca desde su portal."}
        </p>
      ) : (
        <div className="space-y-2">
          {lista.map((a) => (
            <Ficha
              key={a.id_acompanante} idSolicitud={idSolicitud} a={a} exp={exp}
              abierta={abierta === a.id_acompanante}
              onAbrir={() => setAbierta(abierta === a.id_acompanante ? null : a.id_acompanante)}
              onCambio={cargar}
            />
          ))}
        </div>
      )}
    </div>
  );
}
