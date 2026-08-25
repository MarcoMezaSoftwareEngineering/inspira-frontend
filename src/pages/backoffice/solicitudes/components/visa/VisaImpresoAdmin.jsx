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
import { useCallback, useEffect, useMemo, useState } from "react";
import { boPATCH, boFetch } from "../../../../../services/backofficeApi";
import { esVersionCaducada, recargarUnaVez } from "../../../../../lib/versionNueva";
import { Campo, Selecc, SubLabel } from "./visaWidgets";

const RUTA_PDF = "/formularios/solicitud-visado-nacional.pdf";

/* yyyy-mm-dd → dd/mm/yyyy. El impreso se rellena en formato español. */
function aDMY(v) {
  if (!v) return "";
  const m = String(v).match(/^(\d{4})-(\d{2})-(\d{2})$/);
  return m ? `${m[3]}/${m[2]}/${m[1]}` : String(v);
}

/* dd/mm/yyyy → yyyy-mm-dd. Se guarda siempre en ISO aunque el impreso se
   rellene en formato español: si no, la columna acaba con dos formatos
   mezclados según quién la tocó por última vez. */
function aISO(v) {
  if (!v) return "";
  const m = String(v).match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  return m ? `${m[3]}-${m[2].padStart(2, "0")}-${m[1].padStart(2, "0")}` : String(v);
}

/* Hoy, en el formato del impreso. */
function hoyDMY() {
  const d = new Date();
  return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
}

/* El cliente escribe sus apellidos y nombres por separado en su portal, que es
   como los pide el impreso: los dos apellidos juntos en la primera línea y los
   nombres en la segunda. Esta partición es sólo el último recurso para
   expedientes antiguos que sólo tienen el nombre completo; adivina suponiendo
   dos apellidos al final, así que puede fallar con nombres compuestos. */
function partirNombre(completo) {
  const partes = String(completo || "").trim().split(/\s+/).filter(Boolean);
  if (partes.length === 0) return { nombres: "", apellidos: "" };
  if (partes.length === 1) return { nombres: partes[0], apellidos: "" };
  if (partes.length === 2) return { nombres: partes[0], apellidos: partes[1] };
  return {
    nombres: partes.slice(0, partes.length - 2).join(" "),
    apellidos: partes.slice(-2).join(" "),
  };
}

/* Siembra el impreso con lo que el expediente ya sabe. */
function desdeExpediente(exp = {}, dj = {}, cliente = {}) {
  const est = dj.est || {};
  const estudios = dj.estudios || {};
  // Lo que escribió el cliente manda; sólo si no hay nada se adivina.
  const partido = partirNombre(est.nombre || cliente.nombre || "");
  return {
    apellidos: exp.apellidos || partido.apellidos,
    nombres:   exp.nombres   || partido.nombres,
    fnac: aDMY(exp.fecha_nacimiento), lugarnac: exp.lugar_nacimiento || "",
    paisnac: exp.pais_nacimiento || "", nacionalidad: exp.nacionalidad || "PERUANA",
    sexo: exp.sexo || "", civil: exp.estado_civil || "",
    dni: exp.dni || "", pasaporte: exp.num_pasaporte || "",
    pasexp: aDMY(exp.exp_pasaporte), pasvenc: aDMY(exp.venc_pasaporte),
    expedidoPor: exp.pais_expedicion || "PERÚ",
    domicilio: exp.domicilio || "", correo: exp.correo || "", telefono: exp.telefono || "",
    profesion: exp.profesion || "",
    entrada: aDMY(exp.viaje_fecha_prevista),
    entradas: exp.impreso_entradas || "Múltiples",
    domesp: exp.domicilio_espana || "", nie: exp.impreso_nie || "",
    centroNombre: exp.centro_nombre || estudios.universidad || "",
    centroDir: exp.centro_direccion || "", centroTel: exp.centro_telefono || "",
    centroMail: exp.centro_correo || "",
    iniEst: aDMY(exp.centro_inicio), finEst: aDMY(exp.centro_fin),
    // Lo guardado manda; luego la firma de la DJ; y si no hay nada, la fecha
    // de hoy con la ciudad del cliente. El impreso se firma el día que se
    // imprime, así que dejarlo en blanco solo obligaba a escribirlo a mano.
    lugarFecha:
      exp.impreso_lugar_fecha ||
      (dj.firma?.ciudad
        ? `${dj.firma.ciudad}${dj.firma.dia ? `, ${dj.firma.dia} de ${dj.firma.mes || ""} de ${dj.firma.anio || ""}` : ""}`
        : [est.ciudad || cliente.ciudad || "", hoyDMY()].filter(Boolean).join(", ")),
  };
}

const ESTADOS_CIVILES = ["", "Soltero/a", "Casado/a", "Unión registrada", "Separado/a", "Divorciado/a", "Viudo/a"];

// Campos que el impreso oficial no admite vacíos.
const OBLIGATORIOS = [
  ["apellidos", "1. Apellidos"], ["nombres", "3. Nombres"],
  ["fnac", "4. Fecha de nacimiento"], ["lugarnac", "5. Lugar de nacimiento"],
  ["paisnac", "6. País de nacimiento"], ["nacionalidad", "7. Nacionalidad"],
  ["sexo", "8. Sexo"], ["civil", "9. Estado civil"],
  ["pasaporte", "13. N.º pasaporte"], ["pasexp", "14. Fecha expedición"],
  ["pasvenc", "15. Válido hasta"], ["domicilio", "17. Domicilio"],
  ["profesion", "19. Profesión"], ["entrada", "21. Fecha de entrada"],
  ["domesp", "23. Domicilio en España"],
  ["centroNombre", "28. Centro de estudios"], ["centroDir", "28. Dirección del centro"],
  ["iniEst", "28. Inicio de estudios"], ["finEst", "28. Fin de estudios"],
  ["lugarFecha", "30. Lugar y fecha"],
];

export default function VisaImpresoAdmin({ expediente, cliente, idSolicitud, onSaved, onDocumentoGuardado }) {
  // `expediente` puede llegar null en la primera carga; el fallback va dentro
  // del useMemo para no crear un objeto nuevo en cada render.
  const inicial = useMemo(() => {
    const exp = expediente || {};
    return desdeExpediente(exp, exp.dj_datos || {}, cliente || {});
  }, [expediente, cliente]);

  const [f, setF] = useState(inicial);
  const [tocado, setTocado] = useState(false);
  const [guardando, setGuardando] = useState(false);

  /* Lo que se escribe aquí se guarda; antes vivía sólo en la memoria del
     navegador y una recarga se lo llevaba por delante.
     Se persisten ÚNICAMENTE los campos que esta pantalla posee. Los demás
     (nombre, pasaporte, fechas del viaje…) los gobierna el bloque 1 y
     reescribirlos desde aquí, ya reformateados, los estropearía. */
  const guardarPropios = useCallback(async (datos) => {
    if (!idSolicitud) return;
    setGuardando(true);
    try {
      const r = await boPATCH(`/backoffice/solicitudes/${idSolicitud}/visa-expediente`, {
        centro_nombre: datos.centroNombre || null,
        centro_direccion: datos.centroDir || null,
        centro_telefono: datos.centroTel || null,
        centro_correo: datos.centroMail || null,
        centro_inicio: aISO(datos.iniEst) || null,
        centro_fin: aISO(datos.finEst) || null,
        impreso_lugar_fecha: datos.lugarFecha || null,
        impreso_nie: datos.nie || null,
        impreso_entradas: datos.entradas || null,
      });
      if (r?.ok) onSaved?.(r.expediente);
    } finally {
      setGuardando(false);
    }
  }, [idSolicitud, onSaved]);

  // Se guarda al salir del campo, como el resto de las tablas editables.
  const alSalir = () => guardarPropios(f);
  const [estado, setEstado] = useState(null); // {tipo, texto}
  const [generando, setGenerando] = useState(false);

  useEffect(() => { if (!tocado) setF(inicial); }, [inicial, tocado]);

  const set = (k) => (v) => { setTocado(true); setEstado(null); setF((p) => ({ ...p, [k]: v })); };

  /* Construye el PDF y devuelve los bytes. Separado de lo que se hace luego
     con ellos: el mismo documento se descarga o se archiva en el expediente
     del cliente, y no tendría sentido armarlo dos veces distintas. */
  async function construirPDF() {
    {
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
      const nombre = (f.apellidos || f.nombres || "solicitud").split(" ")[0].toLowerCase();
      return {
        blob: new Blob([bytes], { type: "application/pdf" }),
        nombre: `Solicitud-visado-${nombre}.pdf`,
      };
    }
  }

  /* Antes de armar el PDF se guarda lo escrito: si algo falla a media
     generación, al menos los datos ya no se pierden. */
  async function conPDF(quehacer, textoTrabajando) {
    setGenerando(true);
    setEstado({ tipo: "trabajando", texto: textoTrabajando });
    try {
      await guardarPropios(f);
      const { blob, nombre } = await construirPDF();
      await quehacer(blob, nombre);
    } catch (e) {
      // El código que arma el PDF se descarga al pulsar el botón, no antes.
      // Si mientras tanto se publicó una versión nueva, ese archivo pudo
      // cambiar de nombre: no es culpa de los datos ni del impreso.
      if (esVersionCaducada(e)) {
        setEstado({
          tipo: "error",
          texto: "Se publicó una versión nueva de la aplicación mientras tenías " +
                 "esta pantalla abierta. Recarga la página y vuelve a darle; " +
                 "no perderás lo que has escrito.",
        });
        recargarUnaVez();
      } else {
        setEstado({ tipo: "error", texto: `No se pudo generar: ${e.message}` });
      }
    } finally {
      setGenerando(false);
    }
  }

  function descargar() {
    return conPDF((blob, nombre) => {
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = nombre;
      a.click();
      setTimeout(() => URL.revokeObjectURL(a.href), 1000);
      setEstado({
        tipo: "ok",
        texto: "Impreso generado y descargado. Revísalo antes de imprimir; la firma (punto 31) va manuscrita.",
      });
    }, "Generando el impreso oficial…");
  }

  /* Lo deja en la ranura "formulario" del expediente, que es la que el cliente
     ve en su portal. Descargarlo sólo lo deja en el ordenador de quien pulsó
     el botón; archivarlo aquí es lo que hace que el cliente pueda cogerlo y
     que quede constancia de la versión entregada. */
  function archivar() {
    return conPDF(async (blob, nombre) => {
      const datos = new FormData();
      datos.append("archivo", new File([blob], nombre, { type: "application/pdf" }));
      const r = await boFetch(`/backoffice/solicitudes/${idSolicitud}/visa-documentos/formulario`, {
        method: "POST", body: datos,
      });
      const j = await r?.json().catch(() => null);
      if (!r?.ok || j?.ok === false) {
        throw new Error(j?.msg || "No se pudo archivar el impreso");
      }
      onDocumentoGuardado?.();
      setEstado({
        tipo: "ok",
        texto: "Impreso archivado en los documentos del cliente. Ya puede descargarlo desde su portal.",
      });
    }, "Generando y archivando…");
  }

  const color = {
    ok: "border-emerald-200 bg-emerald-50 text-emerald-800",
    error: "border-red-200 bg-red-50 text-red-800",
    trabajando: "border-sky-200 bg-sky-50 text-sky-800",
  };

  const faltan = OBLIGATORIOS.filter(([k]) => !String(f[k] || "").trim());
  const llenos = OBLIGATORIOS.length - faltan.length;

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-2.5 rounded-lg border border-sky-200 bg-sky-50 px-3 py-2.5">
        <span className="text-base leading-none">⚙️</span>
        <p className="text-[12px] text-sky-900 leading-relaxed">
          El impreso <b>se rellena solo</b> con los datos que el cliente cargó en su portal
          y con los de la declaración jurada. Aquí sólo revisas y corriges lo que haga
          falta. El punto 2 (apellidos de nacimiento) y la columna de la Administración
          quedan siempre vacíos, y el 31 (firma) va manuscrito.
        </p>
      </div>

      {/* Qué falta antes de generar. Un campo vacío en el impreso es un
          formulario devuelto en ventanilla, así que se avisa por adelantado. */}
      <div className={`rounded-lg border px-3 py-2.5 ${
        faltan.length ? "border-amber-200 bg-amber-50" : "border-emerald-200 bg-emerald-50"
      }`}>
        <p className={`text-[12.5px] font-semibold ${faltan.length ? "text-amber-900" : "text-emerald-800"}`}>
          {faltan.length
            ? `Faltan ${faltan.length} de ${OBLIGATORIOS.length} datos obligatorios`
            : `Los ${OBLIGATORIOS.length} datos obligatorios están completos`}
        </p>
        {faltan.length > 0 && (
          <>
            <p className="text-[11.5px] text-amber-800 mt-1 leading-relaxed">
              Se autocompletaron {llenos}. Los que faltan no los ha cargado el cliente
              todavía, o hay que escribirlos aquí:
            </p>
            <ul className="mt-1.5 flex flex-wrap gap-1.5">
              {faltan.map(([k, etiqueta]) => (
                <li key={k} className="text-[10.5px] font-semibold text-amber-800 bg-white border border-amber-200 rounded-full px-2 py-0.5">
                  {etiqueta}
                </li>
              ))}
            </ul>
          </>
        )}
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
          12. Tipo de documento: se marca <b>Pasaporte ordinario</b> automáticamente. ·
          Los apellidos van <b>juntos en la línea 1</b>, tal como los escribió el
          cliente en su portal.
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
          <Campo label="24. NIE (si procede)" value={f.nie} onChange={set("nie")} onBlur={alSalir} placeholder="opcional" />
        </div>
        <p className="text-[11px] text-neutral-400 mt-2">
          18. Residente en país distinto: se marca <b>No</b>. · 20. Motivo: se marca <b>Estudios</b>.
        </p>
      </div>

      <div>
        <SubLabel>28 · Centro de estudios</SubLabel>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
          <Campo label="Nombre del centro" value={f.centroNombre} onChange={set("centroNombre")} onBlur={alSalir} />
          <Campo label="Dirección postal" value={f.centroDir} onChange={set("centroDir")} onBlur={alSalir} />
          <Campo label="Teléfono" value={f.centroTel} onChange={set("centroTel")} onBlur={alSalir} />
          <Campo label="Correo electrónico" value={f.centroMail} onChange={set("centroMail")} onBlur={alSalir} />
          <Campo label="Inicio de estudios" value={f.iniEst} onChange={set("iniEst")} onBlur={alSalir} placeholder="07/09/2026" />
          <Campo label="Fin de estudios" value={f.finEst} onChange={set("finEst")} onBlur={alSalir} placeholder="08/07/2027" />
        </div>
      </div>

      <div>
        <SubLabel>30 · Lugar y fecha</SubLabel>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <Campo label="Lugar y fecha" value={f.lugarFecha} onChange={set("lugarFecha")} onBlur={alSalir} placeholder="Lima, 4 de agosto de 2026" />
        </div>
        <p className="text-[11px] text-neutral-400 mt-2">
          ✍️ El punto 31 (firma) queda en blanco para la firma manuscrita del solicitante.
        </p>
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <button
          type="button" onClick={descargar} disabled={generando}
          className="inline-flex items-center gap-2 text-[12px] font-semibold px-5 py-2 rounded-lg bg-[#023A4B] text-white hover:bg-[#035670] disabled:opacity-50 transition-colors"
        >
          {generando && <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />}
          {faltan.length ? "📄 Generar igualmente (incompleto)" : "📄 Generar impreso oficial (PDF)"}
        </button>
        {idSolicitud && (
          <button
            type="button" onClick={archivar} disabled={generando}
            title="Lo guarda en el expediente para que el cliente pueda descargarlo"
            className="inline-flex items-center gap-2 text-[12px] font-semibold px-4 py-2 rounded-lg border-[1.5px] border-[#023A4B] text-[#023A4B] hover:bg-[#023A4B]/5 disabled:opacity-50 transition-colors"
          >
            📥 Guardar en los documentos del cliente
          </button>
        )}
        {guardando && (
          <span className="text-[11px] text-neutral-400 font-mono">guardando…</span>
        )}
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
