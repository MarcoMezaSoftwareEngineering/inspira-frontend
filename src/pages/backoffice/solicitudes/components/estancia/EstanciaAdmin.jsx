// Panel del asesor para la estancia por estudios.
//
// Empieza por el punto 0 —dónde está el expediente— porque es lo primero que
// necesita saber quien lo abre: qué le toca hacer ahora.
//
// Los documentos van como checklist con aprobar y observar, no como listado:
// que un documento esté subido no significa que sirva. Extranjería devuelve
// los que no cumplen, así que alguien tiene que mirarlos antes de presentar y
// el asesorado tiene que saber si el suyo pasó.
import { useCallback, useEffect, useState } from "react";
import { boGET, boPATCH, boFetch } from "../../../../../services/backofficeApi";
import GeneradoresEstancia from "./GeneradoresEstancia";

const TONOS = {
  neutral: "bg-neutral-100 text-neutral-700 border-neutral-300",
  azul:    "bg-[#EEF2F8] text-[#1A3557] border-[#1A3557]/25",
  ambar:   "bg-amber-50 text-amber-800 border-amber-300",
  violeta: "bg-violet-50 text-violet-800 border-violet-300",
  rojo:    "bg-red-50 text-red-800 border-red-300",
  verde:   "bg-[#E8F5EE] text-[#14532d] border-[#1D6A4A]/35",
};

const input = "text-[12px] border border-neutral-300 rounded-lg px-2.5 py-1.5 bg-white " +
  "focus:outline-none focus:ring-1 focus:ring-[#1D6A4A] focus:border-[#1D6A4A]";

function Cabecera({ numero, titulo, extra }) {
  return (
    <div className="flex items-center gap-2 mb-3 flex-wrap">
      <span className="shrink-0 w-7 h-7 rounded-lg grid place-items-center text-[12px]
        font-bold text-white font-serif" style={{ background: "#023A4B" }}>{numero}</span>
      <span className="text-[13.5px] font-bold text-[#1A3557]">{titulo}</span>
      {extra}
    </div>
  );
}

/* ── 0 · Flujo ───────────────────────────────────────────────────────────── */

function Flujo({ revision, onCambiar, guardando }) {
  const recorrido = revision?.recorrido || [];
  const etapa = revision?.etapa;
  if (!etapa) return null;

  return (
    <div id="bloque-flujo" className="bg-white border border-neutral-200 rounded-xl p-4 scroll-mt-4">
      <Cabecera numero="0" titulo="Dónde está el expediente"
        extra={
          <span className={`ml-auto text-[11px] font-bold uppercase tracking-wide px-2 py-1 rounded border ${TONOS[etapa.tono]}`}>
            {etapa.asesor}
          </span>
        } />

      {/* Los pasos son botones: mover el expediente es la acción más frecuente
          de esta pantalla, y esconderla en un desplegable la vuelve lenta. */}
      <div className="flex flex-wrap gap-1.5">
        {recorrido.map((e) => (
          <button
            key={e.clave} type="button" disabled={guardando}
            onClick={() => onCambiar(e.clave)}
            className={`text-[11.5px] font-semibold px-2.5 py-1.5 rounded-lg border transition-colors ${
              e.actual ? `${TONOS[e.tono]} ring-1 ring-offset-1 ring-[#023A4B]`
                : e.pasada ? "bg-[#E8F5EE] text-[#14532d] border-[#1D6A4A]/25"
                : "bg-white text-neutral-500 border-neutral-200 hover:border-neutral-400"
            } disabled:opacity-50`}
          >
            {e.pasada && "✓ "}{e.asesor}
          </button>
        ))}
        <button type="button" disabled={guardando} onClick={() => onCambiar("DESFAVORABLE")}
          className="text-[11.5px] font-semibold px-2.5 py-1.5 rounded-lg border border-red-200
            text-red-600 hover:bg-red-50 disabled:opacity-50">
          Desfavorable
        </button>
      </div>

      <p className="text-[11.5px] text-neutral-500 mt-2.5 leading-relaxed">
        El asesorado ve «{etapa.cliente}»: {etapa.explica_cliente}
      </p>
    </div>
  );
}

/* ── 1 · Datos y plazos ──────────────────────────────────────────────────── */

function Plazos({ plazos }) {
  if (!plazos) return null;
  const filas = [
    ["Antelación · 2 meses antes de clases", plazos.antelacion],
    ["Tope desde la llegada a España", plazos.tope],
  ].filter(([, d]) => d);
  if (!filas.length) return null;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
      {filas.map(([label, d]) => (
        <div key={label} className={`rounded-xl border px-3 py-2.5 ${
          d.a_tiempo ? "border-[#1D6A4A]/25 bg-[#E8F5EE]/50" : "border-red-300 bg-red-50/60"
        }`}>
          <p className="text-[10px] font-bold uppercase tracking-wide font-mono text-neutral-500 leading-tight">
            {label}
          </p>
          <p className={`text-[17px] font-bold leading-tight mt-0.5 ${
            d.a_tiempo ? "text-[#14532d]" : "text-red-700"
          }`}>{d.limite}</p>
          <p className="text-[11px] text-neutral-500">
            {d.a_tiempo ? `quedan ${d.dias_restantes} días` : `pasado hace ${Math.abs(d.dias_restantes)} días`}
          </p>
        </div>
      ))}
    </div>
  );
}

function Datos({ exp, onGuardar }) {
  const rev = exp.revision;
  return (
    <div id="bloque-datos" className="bg-white border border-neutral-200 rounded-xl p-4 scroll-mt-4">
      <Cabecera numero="1" titulo="Datos y plazos"
        extra={
          <span className={`ml-auto text-[11.5px] font-semibold ${
            rev?.faltan?.length ? "text-amber-600" : "text-[#1D6A4A]"
          }`}>
            {rev?.faltan?.length ? `faltan ${rev.faltan.length}` : "completos"}
          </span>
        } />

      <Plazos plazos={rev?.plazos} />

      {rev?.plazos?.escrito_excepcionalidad && (
        <p className="text-[12px] text-red-700 font-semibold mt-2.5">
          Hace falta la declaración jurada de excepcionalidad.
        </p>
      )}

      {rev?.avisos?.map((a, i) => (
        <p key={i} className="text-[12px] text-red-700 bg-red-50 border border-red-200
          rounded-lg px-3 py-2 mt-2.5 leading-relaxed">{a}</p>
      ))}

      {rev?.faltan?.length > 0 && (
        <p className="text-[11.5px] text-neutral-500 mt-2.5 leading-relaxed">
          <b className="text-amber-700">Al asesorado le falta:</b> {rev.faltan.join(" · ")}
        </p>
      )}

      <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-neutral-100">
        <label className="flex items-center gap-1.5 text-[11.5px] text-neutral-500">
          Nº de expediente
          <input className={`${input} w-40`} defaultValue={exp.expediente_numero || ""}
            onBlur={(e) => onGuardar({ expediente_numero: e.target.value })} />
        </label>
        <label className="flex items-center gap-1.5 text-[11.5px] text-neutral-500">
          Ingresado el
          <input type="date" className={input} defaultValue={exp.expediente_fecha || ""}
            onBlur={(e) => onGuardar({ expediente_fecha: e.target.value })} />
        </label>
      </div>
    </div>
  );
}

/* ── 2 · Documentos: checklist con revisión ──────────────────────────────── */

const ESTADO_DOC = {
  SIN_SUBIR: { icono: "○", label: "sin subir",   clase: "text-neutral-300" },
  PENDIENTE: { icono: "◐", label: "por revisar", clase: "text-amber-500" },
  APROBADO:  { icono: "✓", label: "aprobado",    clase: "text-[#1D6A4A]" },
  OBSERVADO: { icono: "✕", label: "observado",   clase: "text-red-600" },
};

function FilaDocumento({ id, clave, def, onCambio, onSubir, subiendo }) {
  const [observando, setObservando] = useState(false);
  const [texto, setTexto] = useState("");
  const [enviando, setEnviando] = useState(false);

  const ultimo = def.archivos[0];
  const est = ESTADO_DOC[def.estado] || ESTADO_DOC.SIN_SUBIR;

  async function revisar(estado, observacion) {
    if (!ultimo) return;
    setEnviando(true);
    const r = await boPATCH(
      `/backoffice/solicitudes/${id}/estancia/documentos/archivo/${ultimo.id_documento}/revision`,
      { estado, observacion }
    );
    setEnviando(false);
    if (r?.ok) { setObservando(false); setTexto(""); onCambio(); }
  }

  const fondo =
    def.estado === "APROBADO" ? "border-[#1D6A4A]/25 bg-[#E8F5EE]/40"
      : def.estado === "OBSERVADO" ? "border-red-300 bg-red-50/50"
      : def.estado === "PENDIENTE" ? "border-amber-300 bg-amber-50/40"
      : "border-neutral-200 bg-white";

  return (
    <div className={`rounded-xl border px-3 py-2.5 ${fondo}`}>
      <div className="flex items-start gap-2.5">
        <span className={`shrink-0 mt-0.5 text-[15px] font-bold leading-none ${est.clase}`}>
          {est.icono}
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[12.5px] font-semibold text-neutral-800">{def.etiqueta}</span>
            {def.obligatorio && def.estado === "SIN_SUBIR" && (
              <span className="text-[9.5px] font-bold uppercase tracking-wide px-1.5 py-0.5
                rounded bg-neutral-100 text-neutral-500">obligatorio</span>
            )}
            <span className={`text-[10px] font-bold uppercase tracking-wide ${est.clase}`}>
              {est.label}
            </span>
          </div>

          {def.requisito && (
            <p className="text-[11px] text-neutral-400 leading-snug mt-0.5">{def.requisito}</p>
          )}

          {def.archivos.map((a) => (
            <a key={a.id_documento}
              href={`/api/backoffice/solicitudes/${id}/estancia/documentos/archivo/${a.id_documento}`}
              target="_blank" rel="noreferrer"
              className="block text-[11.5px] text-[#046C8C] hover:underline truncate mt-1">
              📄 {a.nombre}
            </a>
          ))}

          {ultimo?.observacion && (
            <p className="text-[11.5px] text-red-700 bg-red-50 border border-red-200
              rounded-lg px-2 py-1.5 mt-1.5 leading-relaxed">
              <b>Observado:</b> {ultimo.observacion}
            </p>
          )}

          {observando && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              <input autoFocus className={`${input} flex-1 min-w-[200px]`}
                placeholder="Qué tiene que corregir…"
                value={texto} onChange={(e) => setTexto(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && texto.trim() && revisar("OBSERVADO", texto)} />
              <button type="button" disabled={!texto.trim() || enviando}
                onClick={() => revisar("OBSERVADO", texto)}
                className="text-[11.5px] font-semibold px-2.5 py-1.5 rounded-lg bg-red-600
                  text-white disabled:opacity-40">Observar</button>
              <button type="button" onClick={() => setObservando(false)}
                className="text-[11.5px] text-neutral-500 hover:text-neutral-800">Cancelar</button>
            </div>
          )}
        </div>

        <div className="shrink-0 flex items-center gap-1.5">
          {ultimo && !observando && (
            <>
              {def.estado !== "APROBADO" && (
                <button type="button" disabled={enviando} onClick={() => revisar("APROBADO")}
                  className="text-[11px] font-semibold px-2 py-1 rounded-lg border
                    border-[#1D6A4A]/40 text-[#1D6A4A] hover:bg-[#E8F5EE] disabled:opacity-40">
                  Aprobar
                </button>
              )}
              {def.estado !== "OBSERVADO" && (
                <button type="button" disabled={enviando} onClick={() => setObservando(true)}
                  className="text-[11px] font-semibold px-2 py-1 rounded-lg border
                    border-red-200 text-red-600 hover:bg-red-50 disabled:opacity-40">
                  Observar
                </button>
              )}
            </>
          )}
          {def.de === "asesor" && (
            <label className="text-[11px] font-semibold text-[#023A4B] cursor-pointer hover:underline px-1">
              {subiendo === clave ? "…" : def.archivos.length ? "reemplazar" : "subir"}
              <input type="file" className="hidden" accept="application/pdf,image/*"
                onChange={(e) => onSubir(clave, e.target.files?.[0])} />
            </label>
          )}
        </div>
      </div>
    </div>
  );
}

function Documentos({ id, docs, onCambio }) {
  const [subiendo, setSubiendo] = useState("");

  async function subir(clave, archivo) {
    if (!archivo) return;
    setSubiendo(clave);
    const datos = new FormData();
    datos.append("archivo", archivo);
    const r = await boFetch(`/backoffice/solicitudes/${id}/estancia/documentos/${clave}`, {
      method: "POST", body: datos,
    });
    setSubiendo("");
    if (r?.ok) onCambio();
  }

  const del = (de) => Object.entries(docs?.ranuras || {}).filter(([, d]) => d.de === de);
  const oblig = docs ? Object.values(docs.ranuras).filter((d) => d.obligatorio) : [];
  const aprobados = oblig.filter((d) => d.estado === "APROBADO").length;
  const pct = oblig.length ? (aprobados / oblig.length) * 100 : 0;

  return (
    <div id="bloque-documentos" className="bg-white border border-neutral-200 rounded-xl p-4 scroll-mt-4">
      <Cabecera numero="2" titulo="Documentos"
        extra={
          <span className="ml-auto text-[11.5px] text-neutral-500">
            {aprobados} de {oblig.length} aprobados
          </span>
        } />

      {/* De un vistazo, cuánto falta para poder presentar */}
      <div className="h-1.5 rounded-full bg-neutral-100 overflow-hidden mb-4">
        <div className="h-full bg-[#1D6A4A] transition-all" style={{ width: `${pct}%` }} />
      </div>

      <p className="text-[9px] font-bold uppercase tracking-widest font-mono text-neutral-400 mb-2">
        Los aporta el asesorado
      </p>
      <div className="space-y-1.5 mb-4">
        {del("cliente").map(([clave, d]) => (
          <FilaDocumento key={clave} id={id} clave={clave} def={d}
            onCambio={onCambio} onSubir={subir} subiendo={subiendo} />
        ))}
      </div>

      <p className="text-[9px] font-bold uppercase tracking-widest font-mono text-neutral-400 mb-2">
        Los prepara Inspira
      </p>
      <div className="space-y-1.5">
        {del("asesor").map(([clave, d]) => (
          <FilaDocumento key={clave} id={id} clave={clave} def={d}
            onCambio={onCambio} onSubir={subir} subiendo={subiendo} />
        ))}
      </div>
    </div>
  );
}

/* ── 3 · Extranjería ─────────────────────────────────────────────────────── */

function Extranjeria({ id, registros, onCambio }) {
  const [abierto, setAbierto] = useState(false);
  const [f, setF] = useState({ tipo: "REQUERIMIENTO", titulo: "", detalle: "", fecha: "", plazo: "" });
  const [archivo, setArchivo] = useState(null);
  const [avisar, setAvisar] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [msg, setMsg] = useState("");

  async function registrar() {
    setEnviando(true); setMsg("");
    const datos = new FormData();
    Object.entries(f).forEach(([k, v]) => v && datos.append(k, v));
    datos.append("avisar", avisar ? "true" : "false");
    if (archivo) datos.append("archivo", archivo);
    const r = await boFetch(`/backoffice/solicitudes/${id}/estancia/extranjeria`, {
      method: "POST", body: datos,
    });
    const j = await r?.json().catch(() => null);
    setEnviando(false);
    setMsg(j?.msg || (j?.ok ? "Registrado" : "No se pudo registrar"));
    if (j?.ok) {
      setF({ tipo: "REQUERIMIENTO", titulo: "", detalle: "", fecha: "", plazo: "" });
      setArchivo(null); setAbierto(false); onCambio();
    }
  }

  return (
    <div id="bloque-extranjeria" className="bg-white border border-neutral-200 rounded-xl p-4 scroll-mt-4">
      <Cabecera numero="4" titulo="Extranjería"
        extra={
          <button type="button" onClick={() => setAbierto((v) => !v)}
            className="ml-auto text-[11.5px] font-semibold text-[#023A4B] hover:underline">
            {abierto ? "Cancelar" : "+ Registrar comunicación"}
          </button>
        } />

      {abierto && (
        <div className="border border-dashed border-[#023A4B]/30 rounded-xl p-3 mb-3 space-y-2">
          <div className="flex flex-wrap gap-2">
            <select className={input} value={f.tipo} onChange={(e) => setF({ ...f, tipo: e.target.value })}>
              <option value="REQUERIMIENTO">Requerimiento</option>
              <option value="TASA">Solicitud de tasa</option>
              <option value="NOTIFICACION">Notificación</option>
              <option value="RESOLUCION">Resolución</option>
            </select>
            <input className={`${input} flex-1 min-w-[200px]`} placeholder="Título"
              value={f.titulo} onChange={(e) => setF({ ...f, titulo: e.target.value })} />
          </div>
          <div className="flex flex-wrap gap-2">
            <label className="flex items-center gap-1.5 text-[11.5px] text-neutral-500">
              Fecha del documento
              <input type="date" className={input} value={f.fecha}
                onChange={(e) => setF({ ...f, fecha: e.target.value })} />
            </label>
            <label className="flex items-center gap-1.5 text-[11.5px] text-neutral-500">
              Plazo para responder
              <input type="date" className={input} value={f.plazo}
                onChange={(e) => setF({ ...f, plazo: e.target.value })} />
            </label>
          </div>
          <textarea rows={2} className={`${input} w-full`} placeholder="Detalle para el cliente…"
            value={f.detalle} onChange={(e) => setF({ ...f, detalle: e.target.value })} />
          <div className="flex items-center gap-3 flex-wrap">
            <label className={`${input} cursor-pointer ${archivo ? "border-[#1D6A4A] text-[#1D6A4A] font-semibold" : "text-neutral-500"}`}>
              {archivo ? `✓ ${archivo.name.slice(0, 24)}` : "📎 Adjuntar documento"}
              <input type="file" className="hidden" accept="application/pdf,image/*"
                onChange={(e) => setArchivo(e.target.files?.[0] || null)} />
            </label>
            <label className="flex items-center gap-1.5 text-[12px] text-neutral-600">
              <input type="checkbox" checked={avisar} onChange={(e) => setAvisar(e.target.checked)} />
              Avisar al cliente por correo
            </label>
            <button type="button" onClick={registrar} disabled={enviando || !f.titulo.trim()}
              className="text-[12px] font-semibold px-3 py-1.5 rounded-lg bg-[#1D6A4A] text-white disabled:opacity-40">
              {enviando ? "…" : "Registrar"}
            </button>
          </div>
          <p className="text-[11px] text-neutral-400 leading-relaxed">
            El aviso va por defecto: los plazos de subsanación se cuentan desde la
            notificación y enterarse tarde cuesta el expediente.
          </p>
        </div>
      )}

      {msg && <p className="text-[11.5px] text-neutral-600 mb-2">{msg}</p>}

      {registros.length === 0 ? (
        <p className="text-[12px] text-neutral-400">Sin comunicaciones registradas.</p>
      ) : (
        <div className="space-y-2">
          {registros.map((r) => (
            <div key={r.id_registro} className="border border-neutral-200 rounded-lg px-3 py-2">
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded border ${
                  r.tipo === "RESOLUCION" ? TONOS.verde : r.tipo === "REQUERIMIENTO" ? TONOS.rojo : TONOS.ambar
                }`}>{r.tipo_label}</span>
                <span className="text-[12.5px] font-semibold text-neutral-800">{r.titulo}</span>
                {r.notificado_at
                  ? <span className="ml-auto text-[10.5px] text-[#1D6A4A]">✓ avisado</span>
                  : <span className="ml-auto text-[10.5px] text-amber-600">sin avisar</span>}
              </div>
              {r.plazo && <p className="text-[11.5px] text-red-700 mt-0.5">Plazo: {r.plazo}</p>}
              {r.tiene_archivo && (
                <a href={`/api/backoffice/solicitudes/${id}/estancia/extranjeria/${r.id_registro}/archivo`}
                  target="_blank" rel="noreferrer"
                  className="text-[11px] text-[#046C8C] hover:underline">📄 {r.archivo_nombre}</a>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── Principal ───────────────────────────────────────────────────────────── */

export default function EstanciaAdmin({ idSolicitud }) {
  const [exp, setExp] = useState(null);
  const [docs, setDocs] = useState(null);
  const [ext, setExt] = useState([]);
  const [guardando, setGuardando] = useState(false);

  const cargar = useCallback(() => Promise.all([
    boGET(`/backoffice/solicitudes/${idSolicitud}/estancia`),
    boGET(`/backoffice/solicitudes/${idSolicitud}/estancia/documentos`),
    boGET(`/backoffice/solicitudes/${idSolicitud}/estancia/extranjeria`),
  ]).then(([a, b, c]) => {
    if (a?.ok) setExp(a.expediente);
    if (b?.ok) setDocs(b);
    if (c?.ok) setExt(c.registros || []);
  }), [idSolicitud]);

  useEffect(() => { cargar(); }, [cargar]);

  const guardar = useCallback(async (cambios) => {
    setGuardando(true);
    const r = await boPATCH(`/backoffice/solicitudes/${idSolicitud}/estancia`, cambios);
    setGuardando(false);
    if (r?.ok) setExp(r.expediente);
  }, [idSolicitud]);

  if (!exp) return <p className="text-[13px] text-neutral-400 py-6">Cargando el expediente…</p>;

  return (
    <div className="space-y-3">
      <Flujo revision={exp.revision} guardando={guardando}
        onCambiar={(estado_proceso) => guardar({ estado_proceso })} />
      <Datos exp={exp} onGuardar={guardar} />
      <Documentos id={idSolicitud} docs={docs} onCambio={cargar} />
      <GeneradoresEstancia id={idSolicitud} exp={exp} onArchivado={cargar} />
      <Extranjeria id={idSolicitud} registros={ext} onCambio={cargar} />
    </div>
  );
}
