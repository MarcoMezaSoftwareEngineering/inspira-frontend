// Portal del cliente para la modificación de estudios a residencia por trabajo.
//
// Tiene tres bloques de datos en vez de uno: tú, tu empresa y tu contrato. Los
// de la empresa se piden aquí a propósito aunque no sean suyos —es él quien
// tiene el trato con ella, y quien puede conseguirlos.
//
// El contrato lleva sus condiciones comprobadas mientras se rellena: si el
// salario no llega al SMI o la jornada no es completa, se avisa ahí mismo. No
// tiene sentido descubrirlo con el expediente ya presentado.
import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import { apiGET, apiPUT, apiPOST, apiUpload, apiDELETE } from "../../../../services/api";
import { abrirArchivo } from "../../../../services/archivos";
import HiloMensajes from "../../../../components/common/HiloMensajes";
import VisorArchivo from "../../../../components/common/VisorArchivo";

import { Bloque, Paso, EstadoProceso, OtraPersona, ComoInvitado, ComoEscanear } from "./Bloques";
const TONOS = {
  neutral: "bg-neutral-100 text-neutral-600 border-neutral-200",
  azul:    "bg-[#EEF2F8] text-primary border-primary/20",
  ambar:   "bg-amber-50 text-amber-800 border-amber-300",
  violeta: "bg-violet-50 text-violet-800 border-violet-300",
  rojo:    "bg-red-50 text-red-800 border-red-300",
  verde:   "bg-[#E8F5EE] text-[#14532d] border-[#1D6A4A]/30",
};

const OPCIONES = {
  sexo: ["Hombre", "Mujer", "X"],
  estado_civil: ["Soltero/a", "Casado/a", "Viudo/a", "Divorciado/a", "Separado/a"],
  con_duracion: ["1 año", "Indefinido"],
};

/* ── Campos con ayuda ────────────────────────────────────────────────────── */

function Ayuda({ texto }) {
  const [ver, setVer] = useState(false);
  if (!texto) return null;
  return (
    <>
      <button type="button" onClick={() => setVer((v) => !v)}
        aria-label="Qué va en este campo"
        className={`shrink-0 w-4 h-4 rounded-full text-[10px] font-bold leading-none
          border transition-colors ${
          ver ? "bg-primary border-primary text-white"
              : "border-neutral-300 text-neutral-400 hover:border-primary hover:text-primary"
        }`}>i</button>
      {ver && (
        <span className="block w-full text-[11.5px] text-primary bg-[#EEF2F8]
          border border-primary/15 rounded-lg px-2.5 py-1.5 mt-1 leading-relaxed order-last">
          {texto}
        </span>
      )}
    </>
  );
}

function Etiqueta({ id, label, ayuda, obligatorio }) {
  return (
    <span className="flex items-center gap-1.5 flex-wrap">
      <label htmlFor={id} className="text-[12.5px] font-medium text-neutral-700">
        {label}
      </label>
      {!obligatorio && (
        <span className="text-[10.5px] text-neutral-400">opcional</span>
      )}
      <Ayuda texto={ayuda} />
    </span>
  );
}

function Campo({ label, valor, onChange, tipo = "text", ayuda, obligatorio, falta }) {
  const id = useId();
  return (
    <div className="flex flex-col gap-1.5">
      <Etiqueta id={id} label={label} ayuda={ayuda} obligatorio={obligatorio} />
      <input id={id} type={tipo} value={valor ?? ""} onChange={(e) => onChange(e.target.value)}
        className={`text-[14px] border rounded-lg px-3 py-2.5 bg-white transition-colors
          focus:outline-none focus:ring-2 focus:ring-[#1D6A4A]/25 focus:border-[#1D6A4A] ${
          falta ? "border-amber-400 bg-amber-50/40" : "border-neutral-300"
        }`} />
    </div>
  );
}

function Selector({ label, valor, onChange, opciones, ayuda, obligatorio, falta }) {
  const id = useId();
  return (
    <div className="flex flex-col gap-1.5">
      <Etiqueta id={id} label={label} ayuda={ayuda} obligatorio={obligatorio} />
      <select id={id} value={valor ?? ""} onChange={(e) => onChange(e.target.value)}
        className={`text-[14px] border rounded-lg px-3 py-2.5 bg-white
          focus:outline-none focus:ring-2 focus:ring-[#1D6A4A]/25 focus:border-[#1D6A4A] ${
          falta ? "border-amber-400 bg-amber-50/40" : "border-neutral-300"
        }`}>
        <option value="">—</option>
        {opciones.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );
}

function Guardado({ guardando, tocado, completo, arriba }) {
  const texto = guardando ? "Guardando…"
    : tocado ? "Sin guardar…"
    : completo ? "Guardado. Ya está todo."
    : "Guardado";
  const tono = guardando || tocado ? "text-neutral-400" : "text-[#1D6A4A]";
  return (
    <p className={`flex items-center gap-1.5 text-[11.5px] ${tono} ${arriba ? "mb-3" : "mt-4"}`}>
      <span aria-hidden="true">{guardando || tocado ? "•" : "✓"}</span>
      {texto}
      {!guardando && !tocado && (
        <span className="text-neutral-400">· se guarda solo</span>
      )}
    </p>
  );
}

/* ── Estado ──────────────────────────────────────────────────────────────── */

/* ── Documentos ──────────────────────────────────────────────────────────── */

const ESTADO_DOC = {
  SIN_SUBIR: { label: "Pendiente",   bg: "bg-neutral-100", text: "text-neutral-500", borde: "border-neutral-200 bg-white" },
  PENDIENTE: { label: "En revisión", bg: "bg-sky-50",      text: "text-sky-700",     borde: "border-sky-200 bg-sky-50/30" },
  APROBADO:  { label: "Aprobado",    bg: "bg-emerald-50",  text: "text-emerald-700", borde: "border-emerald-200 bg-emerald-50/20" },
  OBSERVADO: { label: "Corrígelo",   bg: "bg-red-50",      text: "text-red-700",     borde: "border-red-300 bg-red-50/30" },
};

function TarjetaDocumento({ id, clave, def, onCambio }) {
  // El asesorado ve sus documentos con el mismo visor que en estancia:
  // antes aqui se abrian en otra pestaña y en estancia no, sin motivo.
  const [viendo, setViendo] = useState(null);
  const [subiendo, setSubiendo] = useState(false);
  const [error, setError] = useState("");
  const cfg = ESTADO_DOC[def.estado] || ESTADO_DOC.SIN_SUBIR;
  const ultimo = def.archivos[0];
  const esDelAsesor = def.de === "asesor";

  async function subir(archivo) {
    if (!archivo) return;
    setSubiendo(true); setError("");
    try {
      const datos = new FormData();
      datos.append("archivo", archivo);
      await apiUpload(`/solicitudes/${id}/modificatoria/documentos/${clave}`, datos);
      onCambio();
    } catch (e) { setError(e.message || "No se pudo subir"); }
    finally { setSubiendo(false); }
  }

  async function quitar(idDoc) {
    const r = await apiDELETE(`/solicitudes/${id}/modificatoria/documentos/archivo/${idDoc}`);
    if (r?.ok) onCambio();
  }

  return (
    <div className={`border rounded-xl p-3 relative flex flex-col gap-2 ${cfg.borde}`}>
      <span className={`absolute top-2.5 right-2.5 text-[10px] font-semibold px-2 py-0.5
        rounded-full ${cfg.bg} ${cfg.text}`}>
        {esDelAsesor && def.estado === "SIN_SUBIR" ? "Lo hacemos nosotros" : cfg.label}
      </span>

      <p className="text-[13px] font-semibold text-neutral-900 pr-24 leading-snug">
        {def.etiqueta}{def.obligatorio && <span className="text-orange-500"> *</span>}
      </p>

      {def.requisito && (
        <details className="group -mt-1">
          <summary className="cursor-pointer select-none text-[11.5px] font-semibold
            text-primary-light hover:underline list-none">
            <span className="group-open:hidden">Ver requisitos ▾</span>
            <span className="hidden group-open:inline">Ocultar requisitos ▴</span>
          </summary>
          <p className="mt-1.5 text-[11.5px] text-neutral-600 leading-relaxed border-l-2
            border-neutral-200 pl-3">{def.requisito}</p>
        </details>
      )}

      {ultimo?.observacion && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-2.5 py-2">
          <p className="text-[10px] font-bold uppercase tracking-wide text-red-700 mb-0.5">
            Hay que corregirlo</p>
          <p className="text-[12px] text-red-800 leading-relaxed">{ultimo.observacion}</p>
        </div>
      )}

      {def.estado === "PENDIENTE" && (
        <p className="text-[11.5px] text-sky-700 leading-relaxed">
          Lo tenemos. Tu asesor lo está revisando.
        </p>
      )}

      {def.archivos.map((a) => (
        <div key={a.id_documento} className="flex items-center gap-2">
          <button type="button" onClick={() => setViendo(a)}
            className="text-[11.5px] text-primary-light hover:underline truncate flex-1 text-left">
            📄 {a.nombre}
          </button>
          {a.subido_por === "CLIENTE" && (
            <button type="button" onClick={() => quitar(a.id_documento)}
              className="shrink-0 text-[11px] text-neutral-400 hover:text-red-600">quitar</button>
          )}
        </div>
      ))}

      {viendo && (
        <VisorArchivo
          ruta={`/solicitudes/${id}/modificatoria/documentos/archivo/${viendo.id_documento}`}
          nombre={viendo.nombre}
          mime={viendo.mime}
          tamano={viendo.tamano}
          onCerrar={() => setViendo(null)}
        />
      )}

      {!esDelAsesor && (
        <label className="inline-flex items-center gap-1.5 text-[11.5px] font-semibold
          text-primary cursor-pointer hover:underline w-fit">
          {subiendo ? "Subiendo…"
            : def.estado === "OBSERVADO" ? "📎 Subir la corrección"
            : def.archivos.length ? (def.varios ? "+ añadir otro" : "Reemplazar")
            : "📎 Subir"}
          <input type="file" className="hidden" accept="application/pdf,image/*"
            disabled={subiendo} onChange={(e) => subir(e.target.files?.[0])} />
        </label>
      )}

      {esDelAsesor && def.archivos.length === 0 && (
        <p className="text-[11px] text-neutral-400">
          Lo preparamos nosotros y aparecerá aquí.
        </p>
      )}
      {error && <p className="text-[11.5px] text-red-600">{error}</p>}
    </div>
  );
}

function PedirRevision({ id, docs, exp, onHecho }) {
  const [abierto, setAbierto] = useState(false);
  const [nota, setNota] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [msg, setMsg] = useState("");

  const subidos = Object.values(docs?.ranuras || {})
    .filter((r) => r.de === "cliente" && r.archivos.length).length;
  const yaPedida = Boolean(exp?.revision_solicitada_at);

  async function pedir() {
    setEnviando(true); setMsg("");
    const r = await apiPOST(`/solicitudes/${id}/modificatoria/solicitar-revision`, { nota });
    setEnviando(false);
    setMsg(r?.msg || (r?.ok ? "Avisado" : "No se pudo avisar"));
    if (r?.ok) { setAbierto(false); setNota(""); onHecho(); }
  }

  // Se ve siempre, tambien sin documentos. Escondiendolo hasta que subiera
  // algo, quien buscaba como avisar a su asesor no encontraba nada y concluia
  // que no existe.
  if (!subidos) {
    return (
      <div className="rounded-xl border border-neutral-200 bg-neutral-50 px-3.5 py-3 mb-3
        flex items-center gap-3 flex-wrap">
        <div className="min-w-0 flex-1">
          <p className="text-[12.5px] font-semibold text-neutral-600">
            ¿Terminaste de subir?
          </p>
          <p className="text-[11.5px] text-neutral-500 leading-relaxed">
            Cuando subas tus documentos, avísanos desde aquí y los revisamos.
          </p>
        </div>
        <button type="button" disabled
          className="shrink-0 text-[12.5px] font-semibold px-4 py-2 rounded-lg
            border border-neutral-300 text-neutral-400 cursor-not-allowed">
          Pedir revisión
        </button>
      </div>
    );
  }

  if (yaPedida) {
    return (
      <div className="rounded-xl border border-sky-200 bg-sky-50/50 px-3.5 py-3 mb-3 flex gap-2.5">
        <span className="shrink-0 text-[14px]">👀</span>
        <p className="text-[12.5px] text-sky-900 leading-relaxed">
          <b>Tu asesor ya sabe que has subido documentos.</b> Los está revisando y te dirá si
          están correctos o qué hay que corregir. Si subes algo más, vuelve a avisarle.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-[#1D6A4A]/30 bg-[#E8F5EE]/50 px-3.5 py-3 mb-3">
      {!abierto ? (
        <div className="flex items-center gap-3 flex-wrap">
          <div className="min-w-0 flex-1">
            <p className="text-[12.5px] font-semibold text-[#14532d]">¿Has terminado de subir?</p>
            <p className="text-[11.5px] text-neutral-600 leading-relaxed">
              Avísanos y revisamos tus {subidos} documento(s).
            </p>
          </div>
          <button type="button" onClick={() => setAbierto(true)}
            className="shrink-0 text-[12.5px] font-semibold px-4 py-2 rounded-lg
              bg-[#1D6A4A] text-white hover:opacity-90">
            Pedir revisión
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          <p className="text-[12.5px] font-semibold text-[#14532d]">Avisar a tu asesor</p>
          <textarea rows={2} value={nota} onChange={(e) => setNota(e.target.value)}
            placeholder="¿Algo que debamos saber? (opcional)"
            className="w-full text-[12.5px] border border-neutral-300 rounded-lg px-3 py-2
              focus:outline-none focus:ring-1 focus:ring-[#1D6A4A] focus:border-[#1D6A4A]" />
          <div className="flex items-center gap-2">
            <button type="button" onClick={pedir} disabled={enviando}
              className="text-[12.5px] font-semibold px-4 py-2 rounded-lg bg-[#1D6A4A]
                text-white disabled:opacity-40 hover:opacity-90">
              {enviando ? "Avisando…" : "Enviar"}
            </button>
            <button type="button" onClick={() => setAbierto(false)}
              className="text-[12px] text-neutral-500 hover:text-neutral-800">Cancelar</button>
          </div>
        </div>
      )}
      {msg && <p className="text-[11.5px] text-neutral-600 mt-2">{msg}</p>}
    </div>
  );
}

/* ── Principal ───────────────────────────────────────────────────────────── */

export default function DetalleSolicitudModificatoria({ solicitudBase, onVolver, onIrAGuia }) {
  const id = solicitudBase?.id_solicitud;
  const [exp, setExp] = useState(null);
  const [docs, setDocs] = useState(null);
  const [ext, setExt] = useState([]);
  const sinLeer = solicitudBase?.resumen?.mensajes_sin_leer || 0;
  // Si el asesor escribió, se entra por ahí.
  const [bloque, setBloque] = useState(sinLeer > 0 ? 5 : 1);
  const [paso, setPaso] = useState(1);
  const [guardando, setGuardando] = useState(false);
  const [tocado, setTocado] = useState(false);

  const cargar = useCallback(() => Promise.all([
    apiGET(`/solicitudes/${id}/modificatoria`),
    apiGET(`/solicitudes/${id}/modificatoria/documentos`),
    apiGET(`/solicitudes/${id}/modificatoria/extranjeria`),
  ]).then(([a, b, c]) => {
    if (a?.ok) setExp(a.expediente);
    if (b?.ok) setDocs(b);
    if (c?.ok) setExt(c.registros || []);
  }), [id]);

  useEffect(() => { cargar(); }, [cargar]);

  // Cada retoque sube un numero, para no pisar lo que escriba mientras se
  // guarda ni dar por guardado lo que aun no lo esta.
  const version = useRef(0);
  // Qué ha tocado él. Es lo único que se manda: ver el comentario del guardado.
  const pendientes = useRef({});
  const set = (k) => (v) => {
    version.current += 1;
    pendientes.current[k] = v;
    setTocado(true);
    setExp((p) => ({ ...p, [k]: v }));
  };

  // Se guarda solo al dejar de escribir, sin botón que ir a buscar.
  useEffect(() => {
    if (!tocado) return undefined;

    const t = setTimeout(async () => {
      const v = version.current;
      // Solo lo tocado: mandar el expediente entero haría que dos personas
      // trabajando a la vez se pisaran campos que ninguna ha llegado a tocar.
      setGuardando(true);
      const r = await apiPUT(
        `/solicitudes/${id}/modificatoria/datos`, { ...pendientes.current },
      );
      setGuardando(false);
      if (r?.ok) {
        setExp((p) => ({ ...p, revision: r.expediente?.revision }));
        if (version.current === v) { pendientes.current = {}; setTocado(false); }
      }
    }, 900);

    return () => clearTimeout(t);
  }, [exp, tocado, id]);

  const rev = exp?.revision;
  const faltaSet = useMemo(() => new Set(rev?.faltan || []), [rev]);
  const falta = (l) => faltaSet.has(l);
  const cuenta = useCallback((ls) => ls.filter((l) => faltaSet.has(l)).length, [faltaSet]);

  const porGrupo = useCallback((g) =>
    Object.entries(docs?.ranuras || {}).filter(([, d]) => d.grupo === g), [docs]);

  if (!exp) {
    return <p className="text-[13px] text-neutral-400 py-10 text-center">Cargando tu expediente…</p>;
  }

  const g = "grid grid-cols-1 sm:grid-cols-2 gap-3";
  const abrir = (n) => setPaso(paso === n ? 0 : n);

  const PASOS = {
    1: ["Primer apellido", "Nombres", "Nº de pasaporte", "NIE", "Sexo", "Fecha de nacimiento",
        "Lugar de nacimiento", "País de nacimiento", "Nacionalidad", "Estado civil",
        "Nombre del padre", "Nombre de la madre", "Domicilio en España", "Localidad",
        "Código postal", "Provincia", "Teléfono", "Correo electrónico"],
    2: ["Razón social de la empresa", "NIF de la empresa", "Actividad de la empresa",
        "Domicilio social", "Localidad de la empresa", "C.P. de la empresa",
        "Provincia de la empresa"],
    3: ["Puesto de trabajo", "Retribución bruta anual", "Horas de jornada",
        "Duración del contrato", "Dirección del centro de trabajo",
        "Localidad del centro de trabajo", "Provincia del centro de trabajo"],
  };
  const totalCampos = Object.values(PASOS).flat().length;
  const hechos = totalCampos - (rev?.faltan?.length || 0);

  return (
    <div className="flex-1 min-h-0 overflow-auto">
      <div className="max-w-4xl mx-auto p-4 sm:p-5 space-y-3">
        <button type="button" onClick={onVolver}
          className="text-[12px] font-semibold text-neutral-500 hover:text-primary">
          ← Mis servicios
        </button>

        <div>
          <p className="text-[10px] font-bold uppercase tracking-[.2em] font-mono text-[#1D6A4A]">
            Modificación a residencia por trabajo
          </p>
          <h1 className="font-serif text-xl font-bold text-primary">Tu expediente</h1>
        </div>

        <EstadoProceso revision={rev} />

        {/* ── 1 · Datos ── */}
<ComoInvitado solicitud={solicitudBase} />
        <OtraPersona invitados={exp.invitados} />

        <Bloque numero="1" titulo="Tus datos"
          subtitulo={rev?.completo ? "Completos" : `${hechos} de ${totalCampos} completados`}
          abierto={bloque === 1} onToggle={() => setBloque(bloque === 1 ? 0 : 1)}>

          <div className="rounded-xl border-l-[3px] border-orange-400 bg-orange-50 px-3.5 py-3 mb-3">
            <p className="text-[11px] font-bold uppercase tracking-wider text-orange-800 mb-1">
              Antes de empezar</p>
            <p className="text-[12.5px] text-orange-900 leading-relaxed">
              Estos datos se copian <b>tal cual</b> al formulario oficial que presentamos ante
              Extranjería. Escríbelos exactamente como figuran en tus documentos y en tu
              precontrato: <b>es tu responsabilidad que sean correctos</b>.
            </p>
            <p className="text-[12px] text-orange-800 leading-relaxed mt-1.5">
              Si dudas de algún campo, pulsa la <b>ⓘ</b> que hay junto a su nombre.
            </p>
          </div>

          <div className="flex items-center gap-2.5 mb-3">
            <div className="flex-1 h-2 rounded-full bg-neutral-100 overflow-hidden">
              <div className="h-full bg-[#1D6A4A] transition-all"
                style={{ width: `${totalCampos ? (hechos / totalCampos) * 100 : 0}%` }} />
            </div>
            <span className="text-[11.5px] font-bold text-neutral-500 shrink-0">
              {rev?.completo ? "listo" : `${hechos}/${totalCampos}`}
            </span>
          </div>

          {rev?.avisos?.map((a, i) => (
            <div key={i} className="rounded-xl bg-amber-50 border border-amber-300 px-3.5 py-2.5
              mb-3 flex gap-2">
              <span className="shrink-0 text-[13px]">⚠️</span>
              <p className="text-[12px] text-amber-900 leading-relaxed">{a}</p>
            </div>
          ))}

          <div className="space-y-2">
            <Paso numero="1" titulo="Tú" subtitulo="Como figura en tu pasaporte y tu TIE"
              faltan={cuenta(PASOS[1])} abierto={paso === 1} onToggle={() => abrir(1)} onSiguiente={() => setPaso(2)}>
              <div className={g}>
                <Campo label="1er apellido" obligatorio falta={falta("Primer apellido")}
                  ayuda="Exactamente como aparece en tu pasaporte."
                  valor={exp.apellido1} onChange={set("apellido1")} />
                <Campo label="2º apellido" valor={exp.apellido2} onChange={set("apellido2")}
                  ayuda="Si en tu país no se usan dos, déjalo vacío." />
                <Campo label="Nombres" obligatorio falta={falta("Nombres")}
                  valor={exp.nombres} onChange={set("nombres")} />
                <Campo label="Nº de pasaporte" obligatorio falta={falta("Nº de pasaporte")}
                  valor={exp.pasaporte_numero} onChange={set("pasaporte_numero")} />
                <Campo label="NIE" obligatorio falta={falta("NIE")}
                  ayuda="El de tu TIE actual de estudiante."
                  valor={exp.nie} onChange={set("nie")} />
                <Selector label="Sexo" obligatorio falta={falta("Sexo")} opciones={OPCIONES.sexo}
                  valor={exp.sexo} onChange={set("sexo")} />
                <Campo label="Fecha de nacimiento" tipo="date" obligatorio
                  falta={falta("Fecha de nacimiento")}
                  valor={exp.fecha_nacimiento} onChange={set("fecha_nacimiento")} />
                <Campo label="Lugar de nacimiento" obligatorio falta={falta("Lugar de nacimiento")}
                  ayuda="La ciudad, no el país." valor={exp.lugar_nacimiento} onChange={set("lugar_nacimiento")} />
                <Campo label="País de nacimiento" obligatorio falta={falta("País de nacimiento")}
                  valor={exp.pais_nacimiento} onChange={set("pais_nacimiento")} />
                <Campo label="Nacionalidad" obligatorio falta={falta("Nacionalidad")}
                  valor={exp.nacionalidad} onChange={set("nacionalidad")} />
                <Selector label="Estado civil" obligatorio falta={falta("Estado civil")}
                  opciones={OPCIONES.estado_civil} valor={exp.estado_civil} onChange={set("estado_civil")} />
                <Campo label="Nombre del padre" obligatorio falta={falta("Nombre del padre")}
                  ayuda="Nombre y apellidos completos." valor={exp.nombre_padre} onChange={set("nombre_padre")} />
                <Campo label="Nombre de la madre" obligatorio falta={falta("Nombre de la madre")}
                  valor={exp.nombre_madre} onChange={set("nombre_madre")} />
                <Campo label="Teléfono" obligatorio falta={falta("Teléfono")}
                  valor={exp.telefono} onChange={set("telefono")} />
                <Campo label="Correo" tipo="email" obligatorio falta={falta("Correo electrónico")}
                  valor={exp.correo} onChange={set("correo")} />
              </div>

              <p className="text-[10px] font-bold uppercase tracking-widest font-mono
                text-neutral-400 mt-4 mb-2">Tu domicilio en España</p>
              <div className={g}>
                <Campo label="Calle" obligatorio falta={falta("Domicilio en España")}
                  valor={exp.dom_direccion} onChange={set("dom_direccion")} />
                <div className="grid grid-cols-2 gap-3">
                  <Campo label="Número" valor={exp.dom_numero} onChange={set("dom_numero")} />
                  <Campo label="Piso" valor={exp.dom_piso} onChange={set("dom_piso")} />
                </div>
                <Campo label="Localidad" obligatorio falta={falta("Localidad")}
                  valor={exp.dom_localidad} onChange={set("dom_localidad")} />
                <Campo label="Código postal" obligatorio falta={falta("Código postal")}
                  valor={exp.dom_cp} onChange={set("dom_cp")} />
                <Campo label="Provincia" obligatorio falta={falta("Provincia")}
                  valor={exp.dom_provincia} onChange={set("dom_provincia")} />
              </div>

              <label className="flex items-start gap-2 mt-3 text-[12.5px] text-neutral-700">
                <input type="checkbox" className="mt-0.5 accent-[#1D6A4A]"
                  checked={exp.hijos_escolarizacion === true}
                  onChange={(e) => set("hijos_escolarizacion")(e.target.checked)} />
                <span>
                  Tengo hijas o hijos a cargo en edad de escolarización en España
                  <span className="block text-[11px] text-neutral-400">
                    El impreso lo pregunta y cambia algunos trámites.
                  </span>
                </span>
              </label>
            </Paso>

            <Paso numero="2" titulo="Tu empresa"
              subtitulo="Los datos te los da tu empleador"
              faltan={cuenta(PASOS[2])} abierto={paso === 2} onToggle={() => abrir(2)} onSiguiente={() => setPaso(3)}>
              <div className={g}>
                <Campo label="Razón social" obligatorio falta={falta("Razón social de la empresa")}
                  ayuda="El nombre legal completo, no el comercial."
                  valor={exp.emp_razon_social} onChange={set("emp_razon_social")} />
                <Campo label="NIF de la empresa" obligatorio falta={falta("NIF de la empresa")}
                  valor={exp.emp_nif} onChange={set("emp_nif")} />
                <Campo label="Actividad" obligatorio falta={falta("Actividad de la empresa")}
                  ayuda="A qué se dedica." valor={exp.emp_actividad} onChange={set("emp_actividad")} />
                <Campo label="CNAE" ayuda="Código de actividad. Si no lo sabes, lo pedimos nosotros."
                  valor={exp.emp_cnae} onChange={set("emp_cnae")} />
                <Campo label="Domicilio social" obligatorio falta={falta("Domicilio social")}
                  valor={exp.emp_direccion} onChange={set("emp_direccion")} />
                <div className="grid grid-cols-2 gap-3">
                  <Campo label="Número" valor={exp.emp_numero} onChange={set("emp_numero")} />
                  <Campo label="Piso" valor={exp.emp_piso} onChange={set("emp_piso")} />
                </div>
                <Campo label="Localidad" obligatorio falta={falta("Localidad de la empresa")}
                  valor={exp.emp_localidad} onChange={set("emp_localidad")} />
                <Campo label="Código postal" obligatorio falta={falta("C.P. de la empresa")}
                  valor={exp.emp_cp} onChange={set("emp_cp")} />
                <Campo label="Provincia" obligatorio falta={falta("Provincia de la empresa")}
                  valor={exp.emp_provincia} onChange={set("emp_provincia")} />
                <Campo label="Teléfono" valor={exp.emp_telefono} onChange={set("emp_telefono")} />
                <Campo label="Correo" tipo="email" valor={exp.emp_correo} onChange={set("emp_correo")} />
              </div>
            </Paso>

            <Paso numero="3" titulo="Tu contrato"
              subtitulo="Lo que decide el expediente"
              faltan={cuenta(PASOS[3])} abierto={paso === 3} onToggle={() => abrir(3)}>

              <div className="rounded-xl bg-[#EEF2F8] border border-primary/15 px-3.5 py-2.5 mb-3">
                <p className="text-[12px] text-primary leading-relaxed">
                  Extranjería exige tres cosas del precontrato: <b>salario igual o superior al
                  SMI</b> (unos {(rev?.smi_referencia || 16576).toLocaleString("es-ES")} € brutos
                  al año), <b>jornada completa de 40 horas</b> y <b>duración de un año o
                  indefinida</b>. Si algo no cumple, lo deniegan sin mirar el resto.
                </p>
              </div>

              <div className={g}>
                <Campo label="Puesto de trabajo" obligatorio falta={falta("Puesto de trabajo")}
                  ayuda="Tal como figura en el precontrato."
                  valor={exp.con_puesto} onChange={set("con_puesto")} />
                <Campo label="Retribución bruta anual" obligatorio
                  falta={falta("Retribución bruta anual")}
                  ayuda="En euros y al año, antes de impuestos."
                  valor={exp.con_retribucion} onChange={set("con_retribucion")} />
                <Campo label="Horas de jornada" obligatorio falta={falta("Horas de jornada")}
                  ayuda="Semanales. Tienen que ser 40."
                  valor={exp.con_jornada_horas} onChange={set("con_jornada_horas")} />
                <Selector label="Duración" obligatorio falta={falta("Duración del contrato")}
                  opciones={OPCIONES.con_duracion}
                  valor={exp.con_duracion} onChange={set("con_duracion")} />
                <Campo label="Grupo de cotización" valor={exp.con_grupo_cotizacion}
                  onChange={set("con_grupo_cotizacion")} />
                <Campo label="CNO SEPE 2011" ayuda="Código de ocupación. Suele venir en el contrato."
                  valor={exp.con_cno_sepe} onChange={set("con_cno_sepe")} />
                <Campo label="Código de convenio" valor={exp.con_codigo_convenio}
                  onChange={set("con_codigo_convenio")} />
                <Campo label="Denominación del convenio" valor={exp.con_denom_convenio}
                  onChange={set("con_denom_convenio")} />
                <Campo label="Código de contrato" valor={exp.con_codigo_contrato}
                  onChange={set("con_codigo_contrato")} />
                <Campo label="Denominación del contrato" valor={exp.con_denom_contrato}
                  onChange={set("con_denom_contrato")} />
                <Campo label="Cuenta de cotización" valor={exp.con_cuenta_cotizacion}
                  onChange={set("con_cuenta_cotizacion")} />
              </div>

              <p className="text-[10px] font-bold uppercase tracking-widest font-mono
                text-neutral-400 mt-4 mb-2">Centro de trabajo</p>
              <div className={g}>
                <Campo label="Dirección" obligatorio falta={falta("Dirección del centro de trabajo")}
                  ayuda="Dónde vas a trabajar de verdad, que puede no ser el domicilio social."
                  valor={exp.con_centro_direccion} onChange={set("con_centro_direccion")} />
                <div className="grid grid-cols-2 gap-3">
                  <Campo label="Número" valor={exp.con_centro_numero} onChange={set("con_centro_numero")} />
                  <Campo label="Piso" valor={exp.con_centro_piso} onChange={set("con_centro_piso")} />
                </div>
                <Campo label="Localidad" obligatorio falta={falta("Localidad del centro de trabajo")}
                  valor={exp.con_centro_localidad} onChange={set("con_centro_localidad")} />
                <Campo label="Código postal" valor={exp.con_centro_cp} onChange={set("con_centro_cp")} />
                <Campo label="Provincia" obligatorio falta={falta("Provincia del centro de trabajo")}
                  valor={exp.con_centro_provincia} onChange={set("con_centro_provincia")} />
              </div>

              <p className="text-[10px] font-bold uppercase tracking-widest font-mono
                text-neutral-400 mt-4 mb-2">Algo más que debamos saber</p>
              <textarea rows={3} value={exp.notas ?? ""} onChange={(e) => set("notas")(e.target.value)}
                placeholder="Cualquier cosa sobre tu situación o tu contrato…"
                className="w-full text-[13px] border border-neutral-300 rounded-lg px-3 py-2
                  focus:outline-none focus:ring-1 focus:ring-[#1D6A4A] focus:border-[#1D6A4A]" />
            </Paso>
          </div>

          <Guardado guardando={guardando} tocado={tocado} completo={rev?.completo} />
        </Bloque>

        {/* ── 2 · Documentos ── */}
        {/* ── 2 · Guía ── */}
        <Bloque numero="2" titulo="Guía del proceso"
          subtitulo="Los plazos, los requisitos y qué pide tu empresa"
          abierto={bloque === 2} onToggle={() => setBloque(bloque === 2 ? 0 : 2)}>
          <p className="text-[13px] text-neutral-700 leading-relaxed mb-3">
            Léela antes de subir nada. Lleva la <b>calculadora de tu ventana de
            presentación</b> —que se abre dos meses antes y se cierra tres después—, la lista
            de lo que tiene que aportar tu empresa y la <b>cláusula que tu contrato debe
            incluir palabra por palabra</b>.
          </p>
          <button type="button" onClick={() => onIrAGuia?.("modificatoria")}
            className="inline-flex items-center gap-2 text-[13px] font-semibold px-4 py-2.5
              rounded-lg text-white hover:opacity-90"
            style={{ background: "linear-gradient(135deg, #013446 0%, #013446 100%)" }}>
            📖 Abrir la guía de residencia y trabajo
          </button>
        </Bloque>

        {/* ── 3 · Documentos ── */}
        <Bloque numero="3" titulo="Tus documentos"
          subtitulo={docs?.faltan?.length ? `Te faltan ${docs.faltan.length}`
            : docs?.observados?.length ? `${docs.observados.length} por corregir`
            : "Todo entregado"}
          abierto={bloque === 3} onToggle={() => setBloque(bloque === 3 ? 0 : 3)}>

          <ComoEscanear />

          <PedirRevision id={id} docs={docs} exp={exp} onHecho={cargar} />

          {docs?.observados?.length > 0 && (
            <div className="rounded-xl bg-red-50 border border-red-300 px-3.5 py-2.5 mb-3">
              <p className="text-[12.5px] text-red-800 leading-relaxed">
                Hay {docs.observados.length} documento(s) que hay que corregir.
              </p>
            </div>
          )}

          {[["extranjero", "Los aportas tú"],
            ["empresa", "Los aporta tu empresa"],
            ["inspira", "Los preparamos nosotros"]].map(([clave, titulo]) => (
            <div key={clave} className="mb-4">
              <p className="text-[10px] font-bold uppercase tracking-widest font-mono
                text-neutral-400 mb-2">{titulo}</p>
              {clave === "empresa" && (
                <p className="text-[11.5px] text-neutral-500 leading-relaxed mb-2">
                  Estos los tiene que darte tu empleador. Es donde más se retrasa este trámite,
                  así que pídeselos cuanto antes.
                </p>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {porGrupo(clave).map(([k, def]) => (
                  <TarjetaDocumento key={k} id={id} clave={k} def={def} onCambio={cargar} />
                ))}
              </div>
            </div>
          ))}
        </Bloque>

        {/* ── 3 · Extranjería ── */}
        <Bloque numero="4" titulo="Extranjería"
          subtitulo={ext.length ? `${ext.length} comunicación(es)` : "Sin novedades"}
          abierto={bloque === 4} onToggle={() => setBloque(bloque === 4 ? 0 : 4)}>

          {(exp.expediente_numero || exp.expediente_justificante || exp.nie) && (
            <div className="rounded-xl border border-primary/20 bg-[#EEF2F8] px-3.5 py-3 mb-3">
              <p className="text-[10px] font-bold uppercase tracking-widest font-mono
                text-primary mb-2">Para consultar tu expediente</p>
              <table className="w-full"><tbody>
                {[["Nº de expediente", exp.expediente_numero],
                  ["Nº de justificante", exp.expediente_justificante],
                  ["NIE", exp.nie],
                  ["Fecha de ingreso", exp.expediente_fecha],
                  ["Año de nacimiento", (exp.fecha_nacimiento || "").slice(0, 4)],
                ].filter(([, v]) => v).map(([k, v]) => (
                  <tr key={k}>
                    <td className="text-[11.5px] text-neutral-500 py-0.5 pr-3 align-top w-[45%]">{k}</td>
                    <td className="text-[12.5px] font-bold text-primary py-0.5 select-all">{v}</td>
                  </tr>
                ))}
              </tbody></table>
              <a href="https://infoext2.delegaciondelgobierno.gob.es/infoext2/consulta.html"
                target="_blank" rel="noreferrer"
                className="inline-block text-[11.5px] font-semibold text-primary-light hover:underline mt-2">
                Consultar en la sede de la Delegación del Gobierno →
              </a>
            </div>
          )}

          {ext.length === 0 ? (
            <p className="text-[13px] text-neutral-400">
              Cuando Extranjería nos comunique algo, aparecerá aquí y te avisaremos por correo.
            </p>
          ) : (
            <div className="space-y-2.5">
              {ext.map((r) => (
                <div key={r.id_registro} className="rounded-xl border border-neutral-200 px-3.5 py-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-[10px] font-bold uppercase tracking-wide px-2 py-0.5
                      rounded border ${
                      r.tipo === "RESOLUCION" ? TONOS.verde
                        : r.tipo === "REQUERIMIENTO" ? TONOS.rojo : TONOS.ambar
                    }`}>{r.tipo_label}</span>
                    {r.fecha && <span className="text-[11px] text-neutral-400">{r.fecha}</span>}
                  </div>
                  <p className="text-[13.5px] font-semibold text-neutral-800 mt-1">{r.titulo}</p>
                  {r.detalle && (
                    <p className="text-[12.5px] text-neutral-600 leading-relaxed mt-1">{r.detalle}</p>
                  )}
                  {r.plazo && (
                    <p className="text-[12px] font-semibold text-red-700 mt-1">
                      Plazo para responder: {r.plazo}
                    </p>
                  )}
                  {r.tiene_archivo && (
                    <button type="button" onClick={() => abrirArchivo(`/solicitudes/${id}/modificatoria/extranjeria/${r.id_registro}/archivo`, {})}
                      className="inline-block text-[11.5px] font-semibold text-primary-light
                        hover:underline mt-1.5">
                      📄 Ver el documento
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </Bloque>
        {/* ── 5 · Mensajes: lo que tiene que quedar por escrito ── */}
        <Bloque numero="5" titulo="Mensajes con tu asesor"
          subtitulo={sinLeer > 0 ? `${sinLeer} sin leer` : "Queda en tu expediente, con fecha y constancia de lectura"}
          abierto={bloque === 5} onToggle={() => setBloque(bloque === 5 ? 0 : 5)}>
          <HiloMensajes
            lado="cliente"
            aviso="Lo que se escribe aquí forma parte de tu expediente: queda con fecha, con quién lo escribió y con constancia de cuándo lo leyó tu asesor. Para lo que importa, mejor aquí que por WhatsApp."
            cargar={() => apiGET(`/solicitudes/${id}/mensajes`)}
            enviar={(texto) => apiPOST(`/solicitudes/${id}/mensajes`, { texto })}
          />
        </Bloque>
      </div>
    </div>
  );
}
