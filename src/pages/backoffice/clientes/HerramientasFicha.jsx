// Herramientas del asesor dentro de la ficha del cliente.
//
// Todo sale de /backoffice/herramientas-asesor (sin servicios de pago ni IA):
//   · semáforo del caso con su motivo (GET /caso/:id)
//   · Resumen: el párrafo que arma el backend con reglas, listo para copiar
//   · Registrar llamada: fecha, duración, resultado y nota; queda como nota
//     del expediente y en el historial (POST /llamada/:id)
//   · Plantillas: respuestas guardadas del servicio, rellenadas con los datos
//     del cliente; copiar, WhatsApp o correo (POST /respuestas/:id/uso)
//   · Plazos de estancia, cuando el proceso es de estancia
//
// Los textos de las plantillas son de usted (van al asesorado); la interfaz,
// de tú.
import { useCallback, useEffect, useMemo, useState } from "react";
import { FileText, PhoneCall, MessageSquareText, CalendarClock, Copy, Send, Mail } from "lucide-react";
import { boGET, boPOST } from "../../../services/backofficeApi";
import { dialog } from "../../../services/dialogService";
import { Ventana, Boton, Chip, Pill, Campo } from "../ui";
import { rellenar } from "../comun/rellenar";

const SEMAFORO = {
  verde: { t: "Listo para presentar", color: "#1D6A4A" },
  ambar: { t: "Listo, con avisos", color: "#B9770E" },
  rojo: { t: "Falta algo para presentar", color: "#C0392B" },
};
const ICONO_CHECK = { ok: "✓", aviso: "!", falta: "✕" };
const COLOR_CHECK = { ok: "text-[#1D6A4A]", aviso: "text-amber-700", falta: "text-[#C0392B]" };

const RESULTADOS = [
  ["contesto", "Contestó"],
  ["no_contesta", "No contesta"],
  ["buzon", "Buzón de voz"],
  ["reprogramar", "Pide llamar otro día"],
  ["numero_erroneo", "Número erróneo"],
];

function fechaLarga(iso) {
  const m = String(iso || "").match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!m) return iso || "—";
  return new Date(Date.UTC(+m[1], +m[2] - 1, +m[3])).toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
}
function ahoraLocal() {
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 16);
}
async function copiar(texto) {
  try {
    await navigator.clipboard.writeText(texto);
    dialog.toast("Copiado", "success");
    return true;
  } catch {
    dialog.toast("No se pudo copiar: selecciónalo y cópialo a mano", "error");
    return false;
  }
}

/* ── Resumen ─────────────────────────────────────────────────────────────── */

function VentanaResumen({ abierta, onCerrar, caso }) {
  return (
    <Ventana abierta={abierta} onCerrar={onCerrar} titulo="Resumen del caso"
      subtitulo="Sale de los datos de Core con reglas fijas, sin IA. Revísalo antes de pegarlo."
      pie={(
        <>
          <Boton tono="secundario" onClick={onCerrar}>Cerrar</Boton>
          <Boton icono={Copy} onClick={() => copiar(caso?.resumen || "")} disabled={!caso?.resumen}>Copiar</Boton>
        </>
      )}>
      <p className="whitespace-pre-wrap text-[13.5px] leading-relaxed text-neutral-800 bg-[#f4f8fb] rounded-xl p-3">
        {caso?.resumen || "Sin datos para resumir."}
      </p>
    </Ventana>
  );
}

/* ── Registrar llamada ───────────────────────────────────────────────────── */

const LLAMADA_VACIA = () => ({ fecha: ahoraLocal(), duracion_min: "", resultado: "contesto", resumen: "", acuerdos: "", paso: "", paso_fecha: "" });

function VentanaLlamada({ abierta, onCerrar, idSolicitud, onGuardada }) {
  const [f, setF] = useState(LLAMADA_VACIA);
  const [guardando, setGuardando] = useState(false);
  const set = (k) => (e) => setF((x) => ({ ...x, [k]: e.target.value }));
  const cerrar = () => { setF(LLAMADA_VACIA()); onCerrar?.(); };

  async function guardar() {
    setGuardando(true);
    const r = await boPOST(`/backoffice/herramientas-asesor/llamada/${idSolicitud}`, {
      fecha: f.fecha ? new Date(f.fecha).toISOString() : null,
      duracion_min: f.duracion_min ? Number(f.duracion_min) : null,
      resultado: f.resultado,
      // Si no contestó, basta con el resultado: no hay nada más que contar.
      resumen: f.resumen.trim() || (f.resultado !== "contesto" ? RESULTADOS.find(([k]) => k === f.resultado)[1] : ""),
      acuerdos: f.acuerdos.trim(),
      pasos: f.paso.trim() ? [{ texto: f.paso.trim(), fecha: f.paso_fecha || null }] : [],
    });
    setGuardando(false);
    if (!r.ok) { dialog.toast(r.msg || "No se pudo registrar la llamada", "error"); return; }
    dialog.toast(r.tareas ? "Llamada registrada y tarea creada" : "Llamada registrada", "success");
    setF(LLAMADA_VACIA());
    onGuardada?.();
  }

  return (
    <Ventana abierta={abierta} onCerrar={cerrar} titulo="Registrar llamada"
      subtitulo="Queda en las notas y en el historial del cliente. Solo la ve el equipo."
      pie={(
        <>
          <Boton tono="secundario" onClick={cerrar}>Cancelar</Boton>
          <Boton icono={PhoneCall} cargando={guardando} disabled={f.resultado === "contesto" && !f.resumen.trim()} onClick={guardar}>Guardar llamada</Boton>
        </>
      )}>
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-2.5">
          <Campo etiqueta="Fecha y hora">
            <input type="datetime-local" className="ase-campo w-full" value={f.fecha} onChange={set("fecha")} />
          </Campo>
          <Campo etiqueta="Duración (min)">
            <input type="number" min="0" max="600" className="ase-campo w-full" value={f.duracion_min} onChange={set("duracion_min")} placeholder="10" />
          </Campo>
        </div>
        <Campo etiqueta="Resultado">
          <select className="ase-campo w-full" value={f.resultado} onChange={set("resultado")}>
            {RESULTADOS.map(([k, t]) => <option key={k} value={k}>{t}</option>)}
          </select>
        </Campo>
        <Campo etiqueta="Nota: qué se habló">
          <textarea rows={3} className="ase-campo w-full" value={f.resumen} onChange={set("resumen")}
            placeholder={f.resultado === "contesto" ? "Qué se habló" : "Por ejemplo: sin respuesta, se le deja WhatsApp"} />
        </Campo>
        <Campo etiqueta="Acuerdos (opcional)">
          <textarea rows={2} className="ase-campo w-full" value={f.acuerdos} onChange={set("acuerdos")} />
        </Campo>
        <div className="grid grid-cols-[1fr_auto] gap-2.5">
          <Campo etiqueta="Próximo paso (crea una tarea)">
            <input className="ase-campo w-full" value={f.paso} onChange={set("paso")} placeholder="Opcional" />
          </Campo>
          <Campo etiqueta="Para el">
            <input type="date" className="ase-campo" value={f.paso_fecha} onChange={set("paso_fecha")} disabled={!f.paso.trim()} />
          </Campo>
        </div>
      </div>
    </Ventana>
  );
}

/* ── Plantillas ──────────────────────────────────────────────────────────── */

function VentanaPlantillas({ abierta, onCerrar, caso, idSolicitud }) {
  const [lista, setLista] = useState(null);
  const [q, setQ] = useState("");
  const [elegida, setElegida] = useState(null);
  const [texto, setTexto] = useState("");

  useEffect(() => {
    if (!abierta || lista) return;
    boGET("/backoffice/herramientas-asesor/respuestas").then((r) => setLista(r.ok ? r.respuestas || [] : []));
  }, [abierta, lista]);

  const vars = useMemo(() => caso?.variables || {}, [caso]);
  const visibles = useMemo(() => {
    const t = q.trim().toLowerCase();
    return (lista || [])
      .filter((r) => !r.servicio || r.servicio === caso?.servicio)
      .filter((r) => !t || `${r.titulo} ${r.categoria} ${r.texto}`.toLowerCase().includes(t));
  }, [lista, q, caso]);

  const elegir = (r) => { setElegida(r); setTexto(rellenar(r.texto, vars)); };
  const cerrar = () => { setElegida(null); setQ(""); onCerrar?.(); };
  const usar = (canal) => boPOST(`/backoffice/herramientas-asesor/respuestas/${elegida.id_respuesta}/uso`, { id_solicitud: idSolicitud, canal });

  const tel = String(caso?.telefono || "").replace(/[^\d]/g, "");
  const correo = caso?.correo || "";

  async function porCopiar() { if (await copiar(texto)) usar("copiar"); }
  function porWhatsApp() {
    usar("whatsapp");
    window.open(`https://wa.me/${tel}?text=${encodeURIComponent(texto)}`, "_blank", "noopener");
  }
  function porCorreo() {
    usar("correo");
    window.location.href = `mailto:${correo}?subject=${encodeURIComponent(`Inspira Legal · ${elegida.titulo}`)}&body=${encodeURIComponent(texto)}`;
  }

  return (
    <Ventana abierta={abierta} onCerrar={cerrar} titulo={elegida ? elegida.titulo : "Plantillas"}
      subtitulo={elegida ? "Rellenada con los datos del cliente. Puedes retocarla antes de mandarla." : "Respuestas guardadas de este servicio y las generales."}
      pie={elegida ? (
        <>
          <Boton tono="fantasma" onClick={() => setElegida(null)}>← Todas</Boton>
          <Boton tono="secundario" icono={Copy} onClick={porCopiar}>Copiar</Boton>
          <Boton tono="secundario" icono={Send} onClick={porWhatsApp} disabled={!tel}>WhatsApp</Boton>
          <Boton icono={Mail} onClick={porCorreo} disabled={!correo}>Correo</Boton>
        </>
      ) : <Boton tono="secundario" onClick={cerrar}>Cerrar</Boton>}>
      {elegida ? (
        <div className="space-y-2">
          <textarea rows={10} className="ase-campo w-full text-[13.5px]" value={texto} onChange={(e) => setTexto(e.target.value)} />
          {/\{\w+\}/.test(texto) && <p className="text-[12px] text-amber-700">Quedan datos entre llaves por completar a mano.</p>}
          {!tel && <p className="text-[11.5px] text-neutral-500">Sin teléfono en la ficha: WhatsApp no está disponible.</p>}
        </div>
      ) : (
        <div className="space-y-2">
          <input className="ase-campo w-full" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar plantilla…" />
          {lista === null ? <p className="text-[13px] text-neutral-400 py-4 text-center">Cargando…</p>
            : !visibles.length ? <p className="text-[13px] text-neutral-500 py-4 text-center">No hay plantillas para esto.</p>
            : (
              <ul className="divide-y divide-neutral-100">
                {visibles.map((r) => (
                  <li key={r.id_respuesta}>
                    <button type="button" onClick={() => elegir(r)} className="w-full text-left px-2 py-2.5 rounded-lg hover:bg-[#f4f8fb]">
                      <span className="flex items-center gap-2">
                        <span className="text-[13.5px] font-semibold text-neutral-800 flex-1 truncate">{r.titulo}</span>
                        <Chip tono="gris">{r.categoria}</Chip>
                      </span>
                      <span className="block text-[12px] text-neutral-500 truncate mt-0.5">{rellenar(r.texto, vars)}</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
        </div>
      )}
    </Ventana>
  );
}

/* ── Plazos de estancia ──────────────────────────────────────────────────── */

const MANDA = { antelacion: "la antelación de dos meses", tope: "el tope desde la llegada", limite_final: "el inicio de las clases" };

function Plazo({ titulo, p, fecha }) {
  if (!p) return null;
  return (
    <div className="rounded-xl border border-neutral-200 px-3 py-2">
      <div className="flex items-center gap-2">
        <span className="text-[12.5px] font-semibold text-neutral-800 flex-1">{titulo}</span>
        <Chip tono={p.a_tiempo ? "verde" : "rojo"}>{p.a_tiempo ? `${p.dias_restantes} d` : "pasado"}</Chip>
      </div>
      <p className="text-[12px] text-neutral-600 mt-0.5">{fechaLarga(fecha || p.limite)}</p>
      {p.explicacion && <p className="text-[11.5px] text-neutral-500 mt-1 leading-snug">{p.explicacion}</p>}
    </div>
  );
}

function VentanaPlazos({ abierta, onCerrar, plazos }) {
  const [llegada, setLlegada] = useState(plazos?.llegada || "");
  const [inicio, setInicio] = useState(plazos?.inicio || "");
  const [calculo, setCalculo] = useState(null);
  const p = calculo || plazos;

  async function recalcular() {
    const qs = new URLSearchParams({ ...(llegada && { llegada }), ...(inicio && { inicio }) }).toString();
    const r = await boGET(`/backoffice/herramientas-asesor/plazos-estancia?${qs}`);
    if (r.ok) setCalculo(r); else dialog.toast("No se pudo calcular", "error");
  }

  return (
    <Ventana abierta={abierta} onCerrar={onCerrar} titulo="Plazos de estancia"
      subtitulo="Con las fechas del expediente. Cambia una fecha para simular sin guardar nada."
      pie={<Boton tono="secundario" onClick={onCerrar}>Cerrar</Boton>}>
      <div className="space-y-3">
        <div className="grid grid-cols-[1fr_1fr_auto] gap-2 items-end">
          <Campo etiqueta="Llegada a España">
            <input type="date" className="ase-campo w-full" value={String(llegada || "").slice(0, 10)} onChange={(e) => setLlegada(e.target.value)} />
          </Campo>
          <Campo etiqueta="Inicio de clases">
            <input type="date" className="ase-campo w-full" value={String(inicio || "").slice(0, 10)} onChange={(e) => setInicio(e.target.value)} />
          </Campo>
          <Boton tono="secundario" onClick={recalcular}>Calcular</Boton>
        </div>
        {calculo && <p className="text-[11.5px] text-amber-700">Simulación: no cambia el expediente.</p>}
        {p?.recomendada ? (
          <div className="rounded-xl bg-[#E8F5EE] px-3 py-2.5">
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#1D6A4A]">Presentar antes del</p>
            <p className="text-[16px] font-bold text-neutral-900">{fechaLarga(p.recomendada.fecha)}</p>
            <p className="text-[12px] text-neutral-600">
              {p.recomendada.dias_restantes >= 0 ? `Quedan ${p.recomendada.dias_restantes} día(s)` : `Pasó hace ${-p.recomendada.dias_restantes} día(s)`}
              {MANDA[p.recomendada.manda] ? ` · la fija ${MANDA[p.recomendada.manda]}` : ""}
              {p.recomendada.con_escrito ? " · con escrito de excepcionalidad" : ""}
            </p>
          </div>
        ) : <p className="text-[12.5px] text-neutral-500">Sin fechas de llegada ni de inicio de clases no hay plazo que calcular.</p>}
        <Plazo titulo="Antelación de dos meses" p={p?.antelacion} />
        <Plazo titulo="Tope desde la llegada (90 días)" p={p?.tope} />
        <Plazo titulo="Último día antes de clases" p={p?.limite_final} />
        {(p?.avisos || []).length > 0 && (
          <ul className="space-y-1">
            {p.avisos.map((a) => (
              <li key={a.texto} className={`text-[12px] leading-snug ${a.nivel === "alto" ? "text-[#C0392B]" : a.nivel === "medio" ? "text-amber-700" : "text-neutral-500"}`}>• {a.texto}</li>
            ))}
          </ul>
        )}
      </div>
    </Ventana>
  );
}

/* ── El bloque de la ficha ───────────────────────────────────────────────── */

export default function HerramientasFicha({ procesos, onCambio }) {
  const activos = useMemo(() => (procesos || []).filter((p) => !p.cerrado), [procesos]);
  const [elegido, setElegido] = useState(null);
  const id = elegido && activos.some((p) => p.id_solicitud === elegido) ? elegido : activos[0]?.id_solicitud || null;
  const [caso, setCaso] = useState(null);
  const [ventana, setVentana] = useState(null);
  const [verChecks, setVerChecks] = useState(false);

  const cargar = useCallback(() => {
    if (!id) return undefined;
    return boGET(`/backoffice/herramientas-asesor/caso/${id}`).then((r) => setCaso(r.ok ? { ...r, id } : { error: r.msg || "No se pudo preparar el caso", id }));
  }, [id]);
  useEffect(() => { cargar(); }, [cargar]);
  const cerrar = useCallback(() => setVentana(null), []);

  if (!id) return null;
  const listo = caso && caso.id === id && !caso.error ? caso : null;
  const sem = listo?.semaforo ? SEMAFORO[listo.semaforo.color] : null;

  return (
    <section className="bg-white border border-neutral-200 rounded-xl p-4">
      <div className="flex items-center justify-between gap-2 mb-2.5">
        <p className="text-[9px] font-bold uppercase tracking-widest font-mono text-[#62808f]">Herramientas del caso</p>
        {activos.length > 1 && (
          <div className="flex gap-1 flex-wrap justify-end">
            {activos.map((p) => (
              <Pill key={p.id_solicitud} on={p.id_solicitud === id} onClick={() => setElegido(p.id_solicitud)}>{p.servicio_label}</Pill>
            ))}
          </div>
        )}
      </div>

      {caso?.error && caso.id === id ? (
        <p className="text-[12.5px] text-red-600">{caso.error}</p>
      ) : !listo ? (
        <div className="ase-esq" style={{ height: 52 }} />
      ) : (
        <button type="button" onClick={() => setVerChecks((v) => !v)} className="w-full text-left flex items-start gap-2.5 rounded-xl px-3 py-2.5 border border-neutral-100 hover:border-neutral-200"
          style={{ background: `linear-gradient(90deg, ${sem.color}14, #fff)` }} aria-expanded={verChecks}>
          <span className="mt-1 w-3 h-3 rounded-full shrink-0" style={{ background: sem.color, boxShadow: `0 0 0 4px ${sem.color}22` }} />
          <span className="min-w-0 flex-1">
            <span className="flex items-center gap-2 flex-wrap">
              <span className="text-[13.5px] font-bold text-neutral-900">{sem.t}</span>
            </span>
            <span className="block text-[12px] text-neutral-600 leading-snug mt-0.5">{listo.semaforo.motivo}</span>
          </span>
          <span className="text-[11px] font-semibold text-[#046C8C] shrink-0">{verChecks ? "ocultar" : "detalle"}</span>
        </button>
      )}

      {listo && verChecks && (
        <ul className="mt-2 space-y-1 px-1">
          {listo.checks.map((c) => (
            <li key={c.t} className="flex gap-2 text-[12.5px] leading-snug">
              <span className={`w-4 text-center font-bold ${COLOR_CHECK[c.estado]}`}>{ICONO_CHECK[c.estado]}</span>
              <span className="text-neutral-700">{c.t}{c.detalle ? <span className="text-neutral-400"> · {c.detalle}</span> : null}</span>
            </li>
          ))}
        </ul>
      )}

      <div className="flex flex-wrap gap-2 mt-3">
        <Boton tono="secundario" tam="sm" icono={FileText} disabled={!listo} onClick={() => setVentana("resumen")}>Resumen</Boton>
        <Boton tono="secundario" tam="sm" icono={PhoneCall} onClick={() => setVentana("llamada")}>Registrar llamada</Boton>
        <Boton tono="secundario" tam="sm" icono={MessageSquareText} disabled={!listo} onClick={() => setVentana("plantillas")}>Plantillas</Boton>
        {listo?.plazos_estancia && (
          <Boton tono="secundario" tam="sm" icono={CalendarClock} onClick={() => setVentana("plazos")}>Plazos de estancia</Boton>
        )}
      </div>

      <VentanaResumen abierta={ventana === "resumen"} onCerrar={cerrar} caso={listo} />
      <VentanaLlamada abierta={ventana === "llamada"} onCerrar={cerrar} idSolicitud={id}
        onGuardada={() => { setVentana(null); cargar(); onCambio?.(); }} />
      <VentanaPlantillas abierta={ventana === "plantillas"} onCerrar={cerrar} caso={listo} idSolicitud={id} />
      {listo?.plazos_estancia && ventana === "plazos" && (
        <VentanaPlazos key={id} abierta onCerrar={cerrar} plazos={listo.plazos_estancia} />
      )}
    </section>
  );
}
