// Notas internas del expediente.
//
// Un caso lo tocan varios asesores a lo largo de meses, así que no sirve un
// campo único que se pisa: son entradas, cada una firmada por quien la
// escribió y con su fecha. El cliente no las ve nunca.
import { useCallback, useEffect, useState } from "react";
import { boGET, boPOST, boDELETE } from "../../../../../services/backofficeApi";

function cuando(iso) {
  if (!iso) return "";
  try {
    const d = new Date(iso);
    const hoy = new Date();
    const mismoDia = d.toDateString() === hoy.toDateString();
    return mismoDia
      ? `hoy ${d.toLocaleTimeString("es-PE", { hour: "2-digit", minute: "2-digit" })}`
      : d.toLocaleDateString("es-PE", { day: "numeric", month: "short", year: "numeric" }) +
        ` · ${d.toLocaleTimeString("es-PE", { hour: "2-digit", minute: "2-digit" })}`;
  } catch {
    return iso;
  }
}

function iniciales(nombre) {
  return String(nombre || "?")
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() || "")
    .join("");
}

export default function NotasExpediente({ idSolicitud }) {
  const [notas, setNotas] = useState([]);
  const [texto, setTexto] = useState("");
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [msg, setMsg] = useState("");

  const cargar = useCallback(async () => {
    const r = await boGET(`/backoffice/solicitudes/${idSolicitud}/notas`);
    if (r.ok) setNotas(r.notas || []);
    setCargando(false);
  }, [idSolicitud]);

  useEffect(() => { cargar(); }, [cargar]);

  async function anadir() {
    const limpio = texto.trim();
    if (!limpio || guardando) return;
    setGuardando(true);
    setMsg("");
    try {
      const r = await boPOST(`/backoffice/solicitudes/${idSolicitud}/notas`, { texto: limpio });
      if (!r.ok) throw new Error(r.msg || "No se pudo guardar");
      setTexto("");
      await cargar();
    } catch (e) {
      setMsg(e.message || "Error al guardar");
    } finally {
      setGuardando(false);
    }
  }

  async function borrar(id_nota) {
    const r = await boDELETE(`/backoffice/solicitudes/${idSolicitud}/notas/${id_nota}`);
    if (r.ok) cargar();
    else setMsg(r.msg || "No se pudo borrar");
  }

  return (
    <div className="space-y-3">
      <div className="flex items-baseline gap-2">
        <p className="text-[9px] font-bold uppercase tracking-widest font-mono text-neutral-400">
          Notas internas
        </p>
        <span className="text-[10.5px] text-neutral-400">
          {notas.length > 0 ? `${notas.length} nota${notas.length > 1 ? "s" : ""}` : "sin notas"} · el cliente no las ve
        </span>
      </div>

      {/* Escribir */}
      <div className="rounded-xl border border-neutral-200 bg-white p-3">
        <textarea
          rows={3}
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          placeholder="Qué se habló, qué se acordó, qué hay que vigilar…"
          className="w-full text-[13px] text-neutral-800 bg-transparent border-none outline-none resize-y placeholder:text-neutral-300"
        />
        <div className="flex items-center gap-3 mt-1">
          <button
            type="button" onClick={anadir} disabled={guardando || !texto.trim()}
            className="text-[12px] font-semibold px-4 py-1.5 rounded-lg bg-[#1D6A4A] text-white hover:bg-[#15533a] disabled:opacity-40 transition-colors"
          >
            {guardando ? "Guardando…" : "Añadir nota"}
          </button>
          {msg && <p className="text-[11.5px] text-red-600">{msg}</p>}
        </div>
      </div>

      {/* Historial */}
      {cargando ? (
        <p className="text-[12px] text-neutral-400">Cargando notas…</p>
      ) : notas.length === 0 ? (
        <p className="text-[12.5px] text-neutral-400 leading-relaxed">
          Todavía no hay notas. Escribe la primera para que el resto del equipo sepa
          en qué punto está este caso.
        </p>
      ) : (
        <div className="space-y-2">
          {notas.map((n) => (
            <div key={n.id_nota} className="rounded-xl border border-neutral-200 bg-neutral-50/60 p-3">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="shrink-0 w-6 h-6 rounded-full bg-[#023A4B] text-white grid place-items-center text-[9px] font-bold">
                  {iniciales(n.autor)}
                </span>
                <span className="text-[12px] font-semibold text-neutral-800">{n.autor}</span>
                <span className="text-[10.5px] text-neutral-400">{cuando(n.created_at)}</span>
                <button
                  type="button" onClick={() => borrar(n.id_nota)}
                  className="ml-auto text-[10.5px] text-neutral-300 hover:text-red-600 transition-colors"
                >
                  Borrar
                </button>
              </div>
              <p className="text-[13px] text-neutral-700 leading-relaxed whitespace-pre-wrap">{n.texto}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
