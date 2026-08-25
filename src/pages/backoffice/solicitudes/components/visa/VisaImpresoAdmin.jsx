// Bloque F, sólo asesor: rellena el Impreso oficial de Solicitud de Visado
// Nacional con los datos del expediente y lo descarga listo para imprimir.
//
// El PDF original es un formulario AcroForm; se rellena campo por campo con
// pdf-lib (dependencia local — la CSP del sitio no permite cargar scripts de
// CDNs). Los nombres de campo son los que trae el impreso oficial: si el
// Ministerio publica una versión nueva, hay que revisarlos.
//
// pdf-lib se importa de forma diferida: pesa ~450 KB y sólo hace falta al
// pulsar "Generar", no cada vez que se abre el expediente.
import { useEffect, useMemo, useState } from "react";
import { Campo, Selecc, SubLabel } from "./visaWidgets";

const RUTA_PDF = "/formularios/solicitud-visado-nacional.pdf";

/* yyyy-mm-dd → dd/mm/yyyy. El impreso se rellena en formato español. */
function aDMY(v) {
  if (!v) return "";
  const m = String(v).match(/^(\d{4})-(\d{2})-(\d{2})$/);
  return m ? `${m[3]}/${m[2]}/${m[1]}` : String(v);
}

/* Siembra el impreso con lo que el expediente ya sabe. */
function desdeExpediente(exp = {}, dj = {}) {
  const est = dj.est || {};
  const estudios = dj.estudios || {};
  return {
    apellidos: "", nombres: est.nombre || "",
    fnac: aDMY(exp.fecha_nacimiento), lugarnac: exp.lugar_nacimiento || "",
    paisnac: exp.pais_nacimiento || "", nacionalidad: exp.nacionalidad || "PERUANA",
    sexo: exp.sexo || "", civil: exp.estado_civil || "",
    dni: exp.dni || "", pasaporte: exp.num_pasaporte || "",
    pasexp: aDMY(exp.exp_pasaporte), pasvenc: aDMY(exp.venc_pasaporte),
    expedidoPor: exp.pais_expedicion || "PERÚ",
    domicilio: exp.domicilio || "", correo: exp.correo || "", telefono: exp.telefono || "",
    profesion: exp.profesion || "",
    entrada: aDMY(exp.viaje_fecha_prevista), entradas: "Múltiples",
    domesp: exp.domicilio_espana || "", nie: "",
    centroNombre: exp.centro_nombre || estudios.universidad || "",
    centroDir: exp.centro_direccion || "", centroTel: exp.centro_telefono || "",
    centroMail: exp.centro_correo || "",
    iniEst: aDMY(exp.centro_inicio), finEst: aDMY(exp.centro_fin),
    lugarFecha: dj.firma?.ciudad
      ? `${dj.firma.ciudad}${dj.firma.dia ? `, ${dj.firma.dia} de ${dj.firma.mes || ""} de ${dj.firma.anio || ""}` : ""}`
      : "",
  };
}

const ESTADOS_CIVILES = ["", "Soltero/a", "Casado/a", "Unión registrada", "Separado/a", "Divorciado/a", "Viudo/a"];

export default function VisaImpresoAdmin({ expediente }) {
  // `expediente` puede llegar null en la primera carga; el fallback va dentro
  // del useMemo para no crear un objeto nuevo en cada render.
  const inicial = useMemo(() => {
    const exp = expediente || {};
    return desdeExpediente(exp, exp.dj_datos || {});
  }, [expediente]);

  const [f, setF] = useState(inicial);
  const [tocado, setTocado] = useState(false);
  const [estado, setEstado] = useState(null); // {tipo, texto}
  const [generando, setGenerando] = useState(false);

  useEffect(() => { if (!tocado) setF(inicial); }, [inicial, tocado]);

  const set = (k) => (v) => { setTocado(true); setEstado(null); setF((p) => ({ ...p, [k]: v })); };

  async function generar() {
    setGenerando(true);
    setEstado({ tipo: "trabajando", texto: "Generando el impreso oficial…" });
    try {
      const [{ PDFDocument, rgb }, resp] = await Promise.all([
        import("pdf-lib"),
        fetch(RUTA_PDF),
      ]);
      if (!resp.ok) throw new Error("No se encontró la plantilla del impreso");
      const pdf = await PDFDocument.load(await resp.arrayBuffer());
      const form = pdf.getForm();

      // El impreso trae campos con nombres largos y truncados; si alguno no
      // existe se ignora en silencio en vez de abortar todo el documento.
      const T = (nombre, valor) => {
        if (!valor) return;
        try { form.getTextField(nombre).setText(String(valor)); } catch { /* campo ausente */ }
      };
      const X = (nombre) => {
        try { form.getCheckBox(nombre).check(); } catch { /* campo ausente */ }
      };

      T("1 Apellidos", f.apellidos);
      // El punto 2 (apellidos de nacimiento) se deja siempre vacío.
      T("3 Nombres3", f.nombres);
      T("4 Fecha de nacimiento díamesaño", f.fnac);
      T("Texto4", f.lugarnac);
      T("Texto5", f.paisnac);
      T("Texto6", f.nacionalidad);

      if (f.sexo === "Varón") X("Varón");
      if (f.sexo === "Mujer") X("Mujer");

      const CIVIL = {
        "Soltero/a": "ChkBox", "Casado/a": "ChkBox-0", "Unión registrada": "Unión registrada",
        "Separado/a": "ChkBox-1", "Divorciado/a": "ChkBox-2", "Viudo/a": "ChkBox-3",
      };
      if (CIVIL[f.civil]) X(CIVIL[f.civil]);

      T("11 Número de documento nacional de identidad si pr", f.dni);
      X("Pasaporte ordinario");
      T("Texto11", f.pasaporte);
      T("Texto12", f.pasexp);
      T("15 Válido hasta", f.pasvenc);
      T("16 Expedido por país", f.expedidoPor);
      T("17 Domicilio postal y dirección de correo electrón", [f.domicilio, f.correo].filter(Boolean).join(" · "));
      T("Números de teléfono", f.telefono);

      // 18 — "¿Residente en un país distinto del de origen?": siempre No.
      try { form.getRadioGroup("RadioButton").select("_No_On"); } catch { /* sin grupo */ }

      T("19 Profesión actual", f.profesion);
      X("Estudios"); // 20 — motivo del viaje
      T("21 Fecha prevista de entrada en España", f.entrada);

      const ENTRADAS = { Una: "Una-0", Dos: "Dos", "Múltiples": "Múltiples entradas" };
      if (ENTRADAS[f.entradas]) X(ENTRADAS[f.entradas]);

      T("23 Domicilio postal del solicitante en España", f.domesp);
      T("24 Número de Identificación de Extranjero NIE4", f.nie);
      T("Nombre del centro de estudios o investigación", f.centroNombre);
      T("Dirección postal del centro de estudios o investig", f.centroDir);
      T("Número de teléfono del centro de estudios o invest", f.centroTel);
      T("Correo electrónico del centro de estudios o invest", f.centroMail);
      T("Fecha prevista de inicio de los estudios o investi", f.iniEst);
      T("Fecha prevista de finalización de los estudios o i", f.finEst);
      T("30 Lugar y fecha", f.lugarFecha);

      // El "No" del punto 18 no siempre se dibuja desde el grupo de radio:
      // se marca además con una X trazada sobre la casilla.
      const pagina = pdf.getPages()[1];
      if (pagina) {
        const x = 48.7, y = 707.7, l = 4.9;
        pagina.drawLine({ start: { x, y }, end: { x: x + l, y: y + l }, thickness: 1.1, color: rgb(0, 0, 0) });
        pagina.drawLine({ start: { x, y: y + l }, end: { x: x + l, y }, thickness: 1.1, color: rgb(0, 0, 0) });
      }

      form.updateFieldAppearances();
      const bytes = await pdf.save();
      const blob = new Blob([bytes], { type: "application/pdf" });
      const nombre = (f.apellidos || f.nombres || "solicitud").split(" ")[0].toLowerCase();
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `Solicitud-visado-${nombre}.pdf`;
      a.click();
      setTimeout(() => URL.revokeObjectURL(a.href), 1000);

      setEstado({ tipo: "ok", texto: "Impreso generado y descargado. Revísalo antes de imprimir; la firma (punto 31) va manuscrita." });
    } catch (e) {
      setEstado({ tipo: "error", texto: `No se pudo generar: ${e.message}` });
    } finally {
      setGenerando(false);
    }
  }

  const color = {
    ok: "border-emerald-200 bg-emerald-50 text-emerald-800",
    error: "border-red-200 bg-red-50 text-red-800",
    trabajando: "border-sky-200 bg-sky-50 text-sky-800",
  };

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-2.5 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5">
        <span className="text-base leading-none">🔒</span>
        <p className="text-[12px] text-amber-900 leading-relaxed">
          Sección interna. Rellena el <b>Impreso oficial de Solicitud de Visado Nacional</b> con
          los datos del expediente. El punto 2 (apellidos de nacimiento) y la columna de la
          Administración quedan siempre vacíos.
        </p>
      </div>

      <div>
        <SubLabel>1–16 · Identidad y documento de viaje</SubLabel>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
          <Campo label="1. Apellidos" value={f.apellidos} onChange={set("apellidos")} placeholder="SOTOMAYOR CAMACHO" />
          <Campo label="3. Nombres" value={f.nombres} onChange={set("nombres")} placeholder="DIANE ANTOINETTE" />
          <Campo label="4. Fecha de nacimiento" value={f.fnac} onChange={set("fnac")} placeholder="27/09/1997" />
          <Campo label="5. Lugar de nacimiento" value={f.lugarnac} onChange={set("lugarnac")} placeholder="LIMA" />
          <Campo label="6. País de nacimiento" value={f.paisnac} onChange={set("paisnac")} placeholder="PERÚ" />
          <Campo label="7. Nacionalidad actual" value={f.nacionalidad} onChange={set("nacionalidad")} />
          <Selecc label="8. Sexo" value={f.sexo} onChange={set("sexo")}
            options={[{ value: "", label: "—" }, { value: "Varón", label: "Varón" }, { value: "Mujer", label: "Mujer" }]} />
          <Selecc label="9. Estado civil" value={f.civil} onChange={set("civil")}
            options={ESTADOS_CIVILES.map((v) => ({ value: v, label: v || "—" }))} />
          <Campo label="11. DNI" value={f.dni} onChange={set("dni")} />
          <Campo label="13. N.º pasaporte" value={f.pasaporte} onChange={set("pasaporte")} />
          <Campo label="14. Fecha expedición" value={f.pasexp} onChange={set("pasexp")} placeholder="22/05/2025" />
          <Campo label="15. Válido hasta" value={f.pasvenc} onChange={set("pasvenc")} placeholder="22/05/2030" />
          <Campo label="16. Expedido por (país)" value={f.expedidoPor} onChange={set("expedidoPor")} />
        </div>
        <p className="text-[11px] text-neutral-400 mt-2">
          12. Tipo de documento: se marca <b>Pasaporte ordinario</b> automáticamente.
        </p>
      </div>

      <div>
        <SubLabel>17–24 · Contacto, motivo y entrada</SubLabel>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
          <Campo label="17. Domicilio postal" value={f.domicilio} onChange={set("domicilio")} />
          <Campo label="17. Correo electrónico" value={f.correo} onChange={set("correo")} />
          <Campo label="17. Teléfono" value={f.telefono} onChange={set("telefono")} />
          <Campo label="19. Profesión actual" value={f.profesion} onChange={set("profesion")} />
          <Campo label="21. Fecha prevista de entrada" value={f.entrada} onChange={set("entrada")} placeholder="20/08/2026" />
          <Selecc label="22. Entradas" value={f.entradas} onChange={set("entradas")}
            options={["Una", "Dos", "Múltiples"].map((v) => ({ value: v, label: v }))} />
          <Campo label="23. Domicilio en España" value={f.domesp} onChange={set("domesp")} />
          <Campo label="24. NIE (si procede)" value={f.nie} onChange={set("nie")} placeholder="opcional" />
        </div>
        <p className="text-[11px] text-neutral-400 mt-2">
          18. Residente en país distinto: se marca <b>No</b>. · 20. Motivo: se marca <b>Estudios</b>.
        </p>
      </div>

      <div>
        <SubLabel>28 · Centro de estudios</SubLabel>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
          <Campo label="Nombre del centro" value={f.centroNombre} onChange={set("centroNombre")} />
          <Campo label="Dirección postal" value={f.centroDir} onChange={set("centroDir")} />
          <Campo label="Teléfono" value={f.centroTel} onChange={set("centroTel")} />
          <Campo label="Correo electrónico" value={f.centroMail} onChange={set("centroMail")} />
          <Campo label="Inicio de estudios" value={f.iniEst} onChange={set("iniEst")} placeholder="07/09/2026" />
          <Campo label="Fin de estudios" value={f.finEst} onChange={set("finEst")} placeholder="08/07/2027" />
        </div>
      </div>

      <div>
        <SubLabel>30 · Lugar y fecha</SubLabel>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <Campo label="Lugar y fecha" value={f.lugarFecha} onChange={set("lugarFecha")} placeholder="Lima, 4 de agosto de 2026" />
        </div>
        <p className="text-[11px] text-neutral-400 mt-2">
          ✍️ El punto 31 (firma) queda en blanco para la firma manuscrita del solicitante.
        </p>
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <button
          type="button" onClick={generar} disabled={generando}
          className="inline-flex items-center gap-2 text-[12px] font-semibold px-5 py-2 rounded-lg bg-[#023A4B] text-white hover:bg-[#035670] disabled:opacity-50 transition-colors"
        >
          {generando && <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />}
          📄 Generar impreso oficial (PDF)
        </button>
        <a
          href={RUTA_PDF} target="_blank" rel="noreferrer"
          className="text-[11.5px] font-semibold text-neutral-500 hover:text-[#023A4B] underline"
        >
          Ver plantilla en blanco
        </a>
      </div>

      {estado && (
        <div className={`rounded-lg border px-3 py-2.5 text-[12px] leading-relaxed ${color[estado.tipo]}`}>
          {estado.texto}
        </div>
      )}
    </div>
  );
}
