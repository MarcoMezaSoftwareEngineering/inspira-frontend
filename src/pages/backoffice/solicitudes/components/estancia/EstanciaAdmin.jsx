// Panel del asesor para la estancia por estudios.
//
// Empieza por el punto 0 —dónde está el expediente— porque es lo primero que
// necesita saber quien lo abre: qué le toca hacer ahora. Debajo, lo mismo que
// ve el asesorado pero editable, más lo que sólo lleva Inspira.
import { useCallback, useEffect, useState } from "react";
import { boGET, boPATCH, boFetch } from "../../../../../services/backofficeApi";

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

/* ── Punto 0: el flujo ───────────────────────────────────────────────────── */

function Flujo({ revision, onCambiar, guardando }) {
  const recorrido = revision?.recorrido || [];
  const etapa = revision?.etapa;
  if (!etapa) return null;

  return (
    <div className="bg-white border border-neutral-200 rounded-xl p-4">
      <div className="flex items-center gap-2 mb-3 flex-wrap">
        <span className="shrink-0 w-7 h-7 rounded-lg grid place-items-center text-[12px] font-bold text-white font-serif"
          style={{ background: "#023A4B" }}>0</span>
        <span className="text-[13.5px] font-bold text-[#1A3557]">Dónde está el expediente</span>
        <span className={`ml-auto text-[11px] font-bold uppercase tracking-wide px-2 py-1 rounded border ${TONOS[etapa.tono]}`}>
          {etapa.asesor}
        </span>
      </div>

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
        <button
          type="button" disabled={guardando}
          onClick={() => onCambiar("DESFAVORABLE")}
          className="text-[11.5px] font-semibold px-2.5 py-1.5 rounded-lg border border-red-200
            text-red-600 hover:bg-red-50 disabled:opacity-50"
        >
          Desfavorable
        </button>
      </div>

      <p className="text-[11.5px] text-neutral-500 mt-2.5 leading-relaxed">
        El asesorado ve «{etapa.cliente}» y esta explicación: {etapa.explica_cliente}
      </p>
    </div>
  );
}

/* ── Plazos ──────────────────────────────────────────────────────────────── */

function Plazos({ plazos }) {
  if (!plazos) return null;
  const filas = [
    ["Antelación (2 meses antes de clases)", plazos.antelacion],
    ["Tope desde la llegada", plazos.tope],
  ].filter(([, d]) => d);

  if (!filas.length) return null;

  return (
    <div className="bg-white border border-neutral-200 rounded-xl p-4 space-y-2">
      <p className="text-[9px] font-bold uppercase tracking-widest font-mono text-neutral-400">
        Plazos
      </p>
      {filas.map(([label, d]) => (
        <div key={label} className="flex items-center gap-2 flex-wrap">
          <span className="text-[12px] text-neutral-500 min-w-[210px]">{label}</span>
          <span className={`text-[13px] font-bold ${d.a_tiempo ? "text-[#14532d]" : "text-red-700"}`}>
            {d.limite}
          </span>
          <span className="text-[11.5px] text-neutral-400">
            {d.a_tiempo ? `quedan ${d.dias_restantes} d.` : `pasado hace ${Math.abs(d.dias_restantes)} d.`}
          </span>
        </div>
      ))}
      {plazos.escrito_excepcionalidad && (
        <p className="text-[12px] text-red-700 font-semibold">
          Hace falta la declaración jurada de excepcionalidad.
        </p>
      )}
      {plazos.avisos?.map((a, i) => (
        <p key={i} className={`text-[12px] leading-relaxed ${
          a.nivel === "alto" ? "text-red-700" : a.nivel === "medio" ? "text-amber-700" : "text-neutral-500"
        }`}>{a.texto}</p>
      ))}
    </div>
  );
}

/* ── Documentos ──────────────────────────────────────────────────────────── */

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

  const grupos = [
    ["Del asesorado", "cliente"],
    ["Los prepara Inspira", "asesor"],
  ];

  return (
    <div className="bg-white border border-neutral-200 rounded-xl p-4 space-y-4">
      {grupos.map(([titulo, de]) => (
        <div key={de}>
          <p className="text-[9px] font-bold uppercase tracking-widest font-mono text-neutral-400 mb-2">
            {titulo}
          </p>
          <div className="space-y-1.5">
            {Object.entries(docs?.ranuras || {})
              .filter(([, d]) => d.de === de)
              .map(([clave, d]) => (
                <div key={clave} className="flex items-center gap-2 text-[12.5px]">
                  <span className="shrink-0">{d.archivos.length ? "✅" : d.obligatorio ? "⚠️" : "○"}</span>
                  <span className="min-w-0 flex-1">
                    <span className="text-neutral-800">{d.etiqueta}</span>
                    {d.archivos.map((a) => (
                      <a key={a.id_documento}
                        href={`/api/backoffice/solicitudes/${id}/estancia/documentos/archivo/${a.id_documento}`}
                        target="_blank" rel="noreferrer"
                        className="block text-[11px] text-[#046C8C] hover:underline truncate">
                        {a.nombre}
                      </a>
                    ))}
                  </span>
                  {de === "asesor" && (
                    <label className="shrink-0 text-[11px] font-semibold text-[#023A4B] cursor-pointer hover:underline">
                      {subiendo === clave ? "…" : d.archivos.length ? "reemplazar" : "subir"}
                      <input type="file" className="hidden" accept="application/pdf,image/*"
                        onChange={(e) => subir(clave, e.target.files?.[0])} />
                    </label>
                  )}
                </div>
              ))}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ── Extranjería ─────────────────────────────────────────────────────────── */

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
    <div className="bg-white border border-neutral-200 rounded-xl p-4">
      <div className="flex items-center gap-2 mb-3">
        <p className="text-[9px] font-bold uppercase tracking-widest font-mono text-neutral-400">
          Extranjería
        </p>
        <button type="button" onClick={() => setAbierto((v) => !v)}
          className="ml-auto text-[11.5px] font-semibold text-[#023A4B] hover:underline">
          {abierto ? "Cancelar" : "+ Registrar comunicación"}
        </button>
      </div>

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

  const rev = exp.revision;

  return (
    <div className="space-y-3">
      <Flujo revision={rev} guardando={guardando}
        onCambiar={(estado_proceso) => guardar({ estado_proceso })} />

      <Plazos plazos={rev?.plazos} />

      {rev?.faltan?.length > 0 && (
        <div className="bg-amber-50 border border-amber-300 rounded-xl px-4 py-3">
          <p className="text-[12px] text-amber-900 leading-relaxed">
            <b>Al asesorado le faltan {rev.faltan.length} datos:</b> {rev.faltan.join(", ")}.
          </p>
        </div>
      )}
      {rev?.avisos?.map((a, i) => (
        <div key={i} className="bg-red-50 border border-red-300 rounded-xl px-4 py-3">
          <p className="text-[12px] text-red-800 leading-relaxed">{a}</p>
        </div>
      ))}

      {/* Número de expediente: lo que permite el seguimiento en la sede */}
      <div className="bg-white border border-neutral-200 rounded-xl p-4">
        <p className="text-[9px] font-bold uppercase tracking-widest font-mono text-neutral-400 mb-2">
          Expediente en extranjería
        </p>
        <div className="flex flex-wrap gap-2">
          <input className={`${input} w-44`} placeholder="Nº de expediente"
            defaultValue={exp.expediente_numero || ""}
            onBlur={(e) => guardar({ expediente_numero: e.target.value })} />
          <input type="date" className={input} defaultValue={exp.expediente_fecha || ""}
            onBlur={(e) => guardar({ expediente_fecha: e.target.value })} />
        </div>
      </div>

      <Documentos id={idSolicitud} docs={docs} onCambio={cargar} />
      <Extranjeria id={idSolicitud} registros={ext} onCambio={cargar} />
    </div>
  );
}
