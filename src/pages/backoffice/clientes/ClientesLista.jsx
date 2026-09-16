// Lista de clientes.
//
// Responde a tres preguntas sin abrir nada: qué tiene en marcha cada cliente,
// a quién le toca mover (al asesor, al asesorado o a un organismo) y cuál es
// su próxima fecha clave. Desde la tarjeta se cambia la etapa, se asigna el
// responsable y se recuerda al asesorado lo que le falta; y en lote, con
// «Seleccionar», lo mismo para varios a la vez.
import { useMemo, useState } from "react";
import { boPATCH, boPOST } from "../../../services/backofficeApi";
import { dialog } from "../../../services/dialogService";
import RevisionRapida from "../comun/RevisionRapida";
import { cambiarEtapa as patchEtapa } from "../comun/cambiarEtapa";

const NOMBRE_SERVICIO = { master: "postulación a máster", visa: "visado de estudios", ee: "estancia por estudios", mod: "modificatoria", fp: "formación profesional", legal: "extranjería" };

/* Mensaje de WhatsApp ya redactado, de usted, según lo que le toca. */
function plantillaWhatsApp(c) {
  const pila = String(c.nombre || "").trim().split(/\s+/)[0] || "";
  const e = (c.etapas || []).find((x) => x.le_toca === "asesorado") || (c.etapas || [])[0];
  const servicio = e ? NOMBRE_SERVICIO[e.servicio] || "su expediente" : "su expediente";
  const pendiente = e?.le_toca === "asesorado" && e.que
    ? ` Para continuar con su trámite queda pendiente: ${e.que.charAt(0).toLowerCase()}${e.que.slice(1)}.`
    : "";
  const fecha = e?.proximo && !e.proximo.vencido
    ? ` Le recordamos que la fecha a tener en cuenta es el ${new Date(`${e.proximo.fecha}T12:00:00`).toLocaleDateString("es-ES", { day: "numeric", month: "long" })}.`
    : "";
  return {
    texto: `Estimado/a ${pila}: le escribimos de Inspira Legal en relación con su expediente de ${servicio}.${pendiente}${fecha} Quedamos a su disposición.`,
    id_solicitud: e?.id_solicitud,
  };
}

const SERVICIO = {
  master: { corto: "Máster",        tono: "bg-[#EEF2F8] text-[#1A3557]" },
  visa:   { corto: "Visado",        tono: "bg-[#FEF3E7] text-[#B9770E]" },
  ee:     { corto: "Estancia",      tono: "bg-[#F5EEF8] text-[#7D3C98]" },
  mod:    { corto: "Modificatoria", tono: "bg-[#FEF3E7] text-[#B9770E]" },
  fp:     { corto: "FP",            tono: "bg-[#E8F5EE] text-[#1D6A4A]" },
  legal:  { corto: "Extranjería",   tono: "bg-[#FDEDEC] text-[#C0392B]" },
};

/* Color del servicio principal, para el avatar, la franja y la barra. */
const ACENTO = {
  master: "#1A3557", visa: "#B9770E", ee: "#7D3C98", mod: "#B9770E", fp: "#1D6A4A", legal: "#C0392B",
};

// Quién tiene que mover. Mismo código de color que la pantalla Flujos.
const QUIEN = {
  asesor:    { clase: "bg-[#EEF2F8] text-[#1A3557]", punto: "#1A3557" },
  asesorado: { clase: "bg-[#FEF3E7] text-[#92400E]", punto: "#B45309" },
  tercero:   { clase: "bg-[#F5EEF8] text-[#6B2F86]", punto: "#7D3C98" },
};

// Servicios con recordatorio de pendientes al asesorado (correo formal).
const RUTA_RECORDATORIO = { master: "master", ee: "estancia", mod: "modificatoria", visa: "visa" };

function primerNombre(nombre) {
  return String(nombre || "").trim().split(/\s+/)[0] || "otro cliente";
}

function iniciales(nombre) {
  return String(nombre || "?")
    .trim().split(/\s+/).slice(0, 2)
    .map((p) => p[0]?.toUpperCase() || "").join("") || "?";
}

function desdeCuando(iso, ahora) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const dias = Math.floor((ahora - d) / 86400000);
  if (dias <= 0) return "hoy";
  if (dias === 1) return "ayer";
  if (dias < 7) return `hace ${dias} días`;
  return d.toLocaleDateString("es-PE", { day: "2-digit", month: "short", year: "numeric" });
}

const soloDigitos = (t) => String(t || "").replace(/[^\d]/g, "");

function Fecha({ p }) {
  if (!p) return null;
  const cuando = p.vencido ? `hace ${-p.dias} d` : p.dias === 0 ? "hoy" : `en ${p.dias} d`;
  const clase = p.vencido ? "bg-red-50 text-red-700 border-red-200"
    : p.urgente ? "bg-amber-50 text-amber-800 border-amber-200"
    : "bg-white text-neutral-600 border-neutral-200";
  return (
    <span className={`inline-flex items-center gap-1 text-[10.5px] font-semibold px-1.5 py-0.5 rounded-md border whitespace-nowrap ${clase}`}>
      <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
        <rect x="3" y="5" width="18" height="16" rx="2" /><path d="M3 10h18M8 3v4M16 3v4" strokeLinecap="round" />
      </svg>
      {p.etiqueta} · {cuando}
    </span>
  );
}

/* Recordar al asesorado lo que le falta. Usa el recordatorio de cada servicio,
   que lista sus pendientes reales y queda registrado. */
async function recordar(e, nombre) {
  const ruta = RUTA_RECORDATORIO[e.servicio];
  if (!ruta) return { ok: false, msg: "Este servicio no tiene recordatorio por correo" };
  const r = await boPOST(`/backoffice/solicitudes/${e.id_solicitud}/${ruta}/recordatorio`, {});
  return { ...r, msg: r.ok ? `Recordatorio enviado a ${nombre || "el asesorado"}` : r.msg };
}

/* Un proceso activo: servicio, etapa (editable), avance, responsable
   (asignable), a quién le toca, próxima fecha y botón de recordar. */
function Proceso({ e, cliente, equipo, onCambio }) {
  const sv = SERVICIO[e.servicio] || SERVICIO.master;
  const [etapa, setEtapa] = useState(e.etapa);
  const [deducida, setDeducida] = useState(e.etapa_deducida);
  const [resp, setResp] = useState(e.responsable);
  const [estado, setEstado] = useState("");
  const [enviando, setEnviando] = useState(false);
  const pasos = e.opciones?.length || e.pasos || 0;
  const paso = etapa && e.opciones ? e.opciones.indexOf(etapa) + 1 : e.paso;
  const pct = paso && pasos ? Math.round((paso / pasos) * 100) : 0;
  const quien = QUIEN[e.le_toca];

  const acusar = () => { setEstado("ok"); setTimeout(() => setEstado(""), 1800); };

  async function cambiarEtapa(nueva) {
    if (!nueva || nueva === etapa) return;
    const antes = etapa;
    setEtapa(nueva); setDeducida(false); setEstado("guardando");
    const r = await patchEtapa(e.id_solicitud, nueva, e.servicio);
    if (r.ok) { acusar(); if (nueva === "Finalizado") onCambio?.(); }
    else { setEtapa(antes); setEstado(r.cancelado ? "" : "error"); }
  }

  async function asignar(id) {
    if (!id) return;
    const persona = equipo.find((u) => String(u.id_usuario) === String(id));
    // Traspaso: si ya lo llevaba alguien, la nota es obligatoria.
    let nota = null;
    if (resp) {
      nota = await dialog.prompt(`Nota de traspaso para ${persona?.nombre}: qué está pasando y qué falta.`, "", "Traspasar proceso");
      if (!nota || !nota.trim()) { dialog.toast("Sin nota no se traspasa", "error"); return; }
    }
    const antes = resp;
    setResp(persona?.nombre || null); setEstado("guardando");
    const r = await boPATCH(`/backoffice/solicitudes/${e.id_solicitud}/asesor`, { id_asesor_asignado: Number(id), nota: nota?.trim() || undefined });
    if (r.ok) { acusar(); onCambio?.(); } else { setResp(antes); setEstado("error"); }
  }

  async function onRecordar() {
    const ok = await dialog.confirm(
      `Se enviará a ${cliente.nombre} un correo formal con lo que le falta en ${sv.corto}.`,
      "Recordar al asesorado",
    );
    if (!ok) return;
    setEnviando(true);
    const r = await recordar(e, primerNombre(cliente.nombre));
    setEnviando(false);
    dialog.toast(r.msg || (r.ok ? "Enviado" : "No se pudo enviar"), r.ok ? "success" : "error");
    if (r.ok) onCambio?.();
  }

  const [revisando, setRevisando] = useState(false);
  const puedeRevisar = e.le_toca === "asesor" && /^Revisar/.test(e.que || "");
  const recordado = e.recordado;
  const puedeRecordar = e.le_toca === "asesorado" && RUTA_RECORDATORIO[e.servicio];

  return (
    <div className="rounded-xl bg-neutral-50/80 border border-neutral-100 px-2.5 py-2"
      onClick={(ev) => ev.stopPropagation()} role="presentation">
      <div className="flex items-center gap-2.5">
        <span className={`shrink-0 text-[10px] font-bold px-1.5 py-0.5 rounded-md ${sv.tono}`}>{sv.corto}</span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <label className="relative min-w-0 inline-flex items-center gap-1 rounded-lg -ml-1 px-1 py-0.5 hover:bg-white cursor-pointer">
              <span className={`text-[12px] font-semibold truncate ${etapa ? "text-neutral-800" : "text-amber-700"}`}>
                {etapa || "Elegir etapa"}
              </span>
              {deducida && <span className="text-[9px] text-neutral-400" title="Deducida del expediente; elígela para fijarla">(auto)</span>}
              <svg className="w-3 h-3 shrink-0 text-neutral-400" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
              </svg>
              <select value={etapa || ""} onChange={(ev) => cambiarEtapa(ev.target.value)} aria-label={`Etapa de ${sv.corto}`}
                disabled={estado === "guardando"} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer">
                {!etapa && <option value="">Elegir etapa…</option>}
                {(e.opciones || []).map((o) => <option key={o} value={o}>{o}</option>)}
              </select>
            </label>
            <span className="shrink-0 text-[10px] tabular-nums">
              {estado === "guardando" ? <span className="text-neutral-400">guardando…</span>
                : estado === "ok" ? <span className="text-[#1D6A4A] font-bold">✓ guardado</span>
                : estado === "error" ? <span className="text-red-600 font-bold">no se guardó</span>
                : paso ? <span className="text-neutral-400">{paso}/{pasos}</span> : null}
            </span>
          </div>
          <div className="h-1 rounded-full bg-neutral-200/80 mt-1 overflow-hidden">
            <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: ACENTO[e.servicio] || "#1A3557" }} />
          </div>
        </div>

        {/* Responsable: tocar para asignar o cambiar (le llega un correo). */}
        <label className="relative shrink-0 cursor-pointer" title={resp ? `${resp} · tocar para cambiar` : "Sin responsable · tocar para asignar"}>
          <span className={`w-7 h-7 rounded-full grid place-items-center text-[9.5px] font-bold ${
            resp ? "bg-[#023A4B] text-white" : "bg-amber-100 text-amber-700 border border-amber-300 border-dashed"}`}>
            {resp ? iniciales(resp) : "+"}
          </span>
          <select value="" onChange={(ev) => asignar(ev.target.value)} aria-label="Asignar responsable"
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer">
            <option value="">{resp ? `Ahora: ${resp}` : "Asignar a…"}</option>
            {equipo.map((u) => <option key={u.id_usuario} value={u.id_usuario}>{u.nombre}</option>)}
          </select>
        </label>
      </div>

      {((quien && e.que) || e.proximo) && (
        <div className="flex items-center gap-1.5 flex-wrap mt-2">
          {quien && e.que && (
            <span className={`inline-flex items-center gap-1.5 text-[10.5px] font-semibold px-2 py-0.5 rounded-md ${quien.clase}`}>
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: quien.punto }} />
              {e.le_toca === "asesor" && resp ? `${primerNombre(resp)}: ` : ""}
              {e.le_toca === "asesorado" ? `${primerNombre(cliente.nombre)}: ` : ""}
              {e.que}
            </span>
          )}
          <Fecha p={e.proximo} />
        </div>
      )}

      {puedeRevisar && (
        <button type="button" onClick={() => setRevisando(true)}
          className="mt-2 w-full inline-flex items-center justify-center gap-1.5 text-[12px] font-bold text-white bg-[#1A3557] rounded-lg py-1.5 hover:bg-[#15294a]">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.4" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
          Revisar ahora
        </button>
      )}
      {revisando && <RevisionRapida idSolicitud={e.id_solicitud} onCerrar={(cambio) => { setRevisando(false); if (cambio) onCambio?.(); }} />}

      {(puedeRecordar || recordado) && (
        <div className="flex items-center gap-2 mt-2">
          {recordado && (
            <span className="text-[10.5px] text-neutral-500 truncate">
              Recordado {recordado.dias === 0 ? "hoy" : `hace ${recordado.dias} d`}
              {recordado.por ? ` por ${primerNombre(recordado.por)}` : ""}
              {recordado.total > 1 ? ` · ${recordado.total} veces` : ""}
            </span>
          )}
          {puedeRecordar && (
            <button type="button" onClick={onRecordar} disabled={enviando}
              className="ml-auto shrink-0 inline-flex items-center gap-1 text-[11px] font-bold text-[#92400E] bg-white border border-amber-200 rounded-lg px-2.5 py-1 hover:bg-amber-50 disabled:opacity-50">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.4-1.4A2 2 0 0 1 18 14.2V11a6 6 0 1 0-12 0v3.2a2 2 0 0 1-.6 1.4L4 17h5m6 0a3 3 0 1 1-6 0" />
              </svg>
              {enviando ? "Enviando…" : "Recordar"}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function Ficha({ c, ahora, equipo, seleccionando, marcado, onMarcar, onAbrir, onEditar, onServicios, onActivo, onPurgar, onCambio, isAdmin }) {
  const [menu, setMenu] = useState(false);

  function whatsapp(ev) {
    ev.stopPropagation();
    const { texto, id_solicitud } = plantillaWhatsApp(c);
    window.open(`https://wa.me/${soloDigitos(c.telefono)}?text=${encodeURIComponent(texto)}`, "_blank", "noopener");
    if (id_solicitud) boPOST(`/backoffice/gestion-clientes/proceso/${id_solicitud}/contacto`, { texto }).then(() => onCambio?.());
  }

  async function editarEtiquetas() {
    const v = await dialog.prompt("Etiquetas separadas por comas (VIP, Beca, Urgente…)", (c.etiquetas || []).join(", "), "Etiquetas");
    if (v === null) return;
    const r = await boPATCH(`/backoffice/gestion-clientes/cliente/${c.id_cliente}/marcas`, { etiquetas: v.split(",") });
    if (r.ok) onCambio?.(); else dialog.toast(r.msg || "No se pudo guardar", "error");
  }

  async function alternarPrueba() {
    const r = await boPATCH(`/backoffice/gestion-clientes/cliente/${c.id_cliente}/marcas`, { prueba: !c.prueba });
    if (r.ok) {
      dialog.toast(c.prueba ? "Ya no es cliente de prueba" : "Marcado como prueba: no cuenta en cifras ni genera tareas", "success");
      onCambio?.();
    }
  }
  const principal = c.etapas?.[0]?.servicio;
  const acento = principal ? ACENTO[principal] : null;
  const tel = soloDigitos(c.telefono);
  const parar = (e) => e.stopPropagation();

  const alertas = [
    ...(c.sin_abrir || []).map((x) => ({
      k: `sa${x.id_solicitud}`, rojo: x.horas >= 48,
      t: `Sin abrir · ${x.horas < 24 ? `${x.horas} h` : `${Math.floor(x.horas / 24)} d`}`,
    })),
    c.debe > 0 && { k: "debe", rojo: true, t: `Debe ${c.debe.toFixed(0)}` },
    c.activos > 0 && (c.sin_movimiento_dias ?? 0) >= 10 && { k: "mov", rojo: c.sin_movimiento_dias >= 21, t: `Sin movimiento · ${c.sin_movimiento_dias} d` },
    c.activos > 0 && !tel && { k: "tel", t: "Falta teléfono" },
  ].filter(Boolean);

  return (
    <div
      role="button" tabIndex={0}
      onClick={() => (seleccionando ? onMarcar(c) : onAbrir(c))}
      onKeyDown={(e) => { if (e.key === "Enter") onAbrir(c); }}
      className={`relative overflow-hidden bg-white rounded-2xl border transition-all cursor-pointer select-none touch-manipulation
        shadow-[0_1px_2px_rgba(16,24,40,.04),0_8px_24px_-18px_rgba(2,58,75,.35)]
        hover:shadow-[0_2px_4px_rgba(16,24,40,.05),0_16px_32px_-18px_rgba(2,58,75,.45)]
        ${marcado ? "border-[#1D6A4A] ring-2 ring-[#1D6A4A]/20" : "border-neutral-200/80"}
        ${c.activo === false ? "opacity-60" : ""}`}
    >
      {acento && <span aria-hidden="true" className="absolute left-0 top-0 bottom-0 w-1" style={{ background: acento }} />}

      <div className="p-3.5 pl-4">
        <div className="flex items-start gap-3">
          {seleccionando ? (
            <span className={`shrink-0 w-11 h-11 rounded-2xl grid place-items-center border-2 ${
              marcado ? "bg-[#1D6A4A] border-[#1D6A4A] text-white" : "border-neutral-300 text-transparent"}`}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
            </span>
          ) : (
            <span className="shrink-0 w-11 h-11 rounded-2xl grid place-items-center text-[13px] font-bold text-white"
              style={{ background: acento ? `linear-gradient(135deg, ${acento}, #023A4B)` : "#cfd4da" }}>
              {iniciales(c.nombre)}
            </span>
          )}

          <div className="min-w-0 flex-1">
            <p className="text-[14.5px] font-semibold text-neutral-900 leading-snug line-clamp-2 break-words">
              {c.nombre || c.email_contacto}
            </p>
            <div className="flex items-center gap-1.5 flex-wrap mt-1">
              {c.nuevo && (
                <span className="text-[9.5px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-md bg-[#E8F5EE] text-[#1D6A4A]">Nuevo</span>
              )}
              {c.activo === false && (
                <span className="text-[9.5px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-md bg-neutral-100 text-neutral-500">Inactivo</span>
              )}
              {c.prueba && (
                <span className="text-[9.5px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-md bg-violet-100 text-violet-700">Prueba</span>
              )}
              {(c.etiquetas || []).map((t) => (
                <span key={t} className="text-[10px] font-semibold px-1.5 py-0.5 rounded-md bg-[#FFF4E8] text-[#B45309] border border-[#FAD9B5]">{t}</span>
              ))}
              <span className="text-[11px] text-neutral-400 truncate">
                {desdeCuando(c.fecha_registro, ahora)}{c.canal_origen ? ` · ${c.canal_origen}` : ""}
              </span>
            </div>
          </div>

          {!seleccionando && (
            <div className="relative shrink-0 -mr-1 -mt-1">
              <button type="button" aria-label="Más acciones"
                onClick={(e) => { parar(e); setMenu((v) => !v); }}
                className="w-8 h-8 rounded-full grid place-items-center text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <circle cx="5" cy="12" r="1.8" /><circle cx="12" cy="12" r="1.8" /><circle cx="19" cy="12" r="1.8" />
                </svg>
              </button>
              {menu && (
                <>
                  <div className="fixed inset-0 z-10" onClick={(e) => { parar(e); setMenu(false); }} />
                  <div className="absolute right-0 top-9 z-20 w-44 bg-white border border-neutral-200 rounded-xl shadow-xl py-1 text-left">
                    {[
                      ["Etiquetas…", editarEtiquetas],
                      [c.prueba ? "Quitar marca de prueba" : "Marcar como prueba", alternarPrueba],
                      ...(isAdmin ? [
                        ["Editar datos", () => onEditar(c)],
                        ["Ver servicios", () => onServicios(c)],
                        [c.activo === false ? "Reactivar" : "Desactivar", () => onActivo(c)],
                        ["Eliminar", () => onPurgar(c), true],
                      ] : []),
                    ].map(([txt, fn, peligro]) => (
                      <button key={txt} type="button"
                        onClick={(e) => { parar(e); setMenu(false); fn(); }}
                        className={`block w-full text-left text-[12.5px] px-3 py-2 hover:bg-neutral-50 ${peligro ? "text-red-600" : "text-neutral-700"}`}>
                        {txt}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {c.etapas?.length > 0 ? (
          <div className="mt-3 space-y-1.5">
            {c.etapas.map((e) => (
              <Proceso key={`${e.id_solicitud}-${e.etapa}-${e.responsable}-${e.le_toca}`} e={e} cliente={c} equipo={equipo} onCambio={onCambio} />
            ))}
          </div>
        ) : !c.solo_invitado && (
          <p className="mt-2.5 text-[11.5px] text-neutral-400">
            {c.total_servicios > 0
              ? `${c.total_servicios} servicio${c.total_servicios > 1 ? "s" : ""}, ninguno activo`
              : "Sin servicios contratados"}
          </p>
        )}

        {c.invitado_en?.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-2">
            {c.invitado_en.map((i) => {
              const sv = SERVICIO[i.servicio] || SERVICIO.master;
              return (
                <span key={i.id_solicitud}
                  title={`${i.quien} · ${i.puede_editar ? "puede subir documentos y rellenar datos" : "solo lectura"}`}
                  className={`text-[10.5px] font-semibold px-2 py-0.5 rounded-full border border-dashed ${sv.tono}`}>
                  Invitada a {sv.corto} de {primerNombre(i.titular)}{!i.ha_entrado && " · sin entrar"}
                </span>
              );
            })}
          </div>
        )}

        <div className="flex items-center gap-2 mt-3 pt-2.5 border-t border-neutral-100">
          <div className="min-w-0 flex-1 flex flex-wrap gap-1.5">
            {alertas.map((a) => (
              <span key={a.k}
                className={`text-[10.5px] font-semibold px-2 py-0.5 rounded-full ${a.rojo ? "bg-red-50 text-red-700" : "bg-amber-50 text-amber-700"}`}>
                {a.t}
              </span>
            ))}
          </div>
          {tel && (
            <a href={`https://wa.me/${tel}`} target="_blank" rel="noreferrer" onClick={(ev) => { ev.preventDefault(); whatsapp(ev); }}
              aria-label="Escribir por WhatsApp con mensaje preparado" title={`${c.telefono} · mensaje preparado`}
              className="shrink-0 w-8 h-8 rounded-full grid place-items-center bg-[#E8F5EE] text-[#1D6A4A]">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 21l1.7-4.6A8.5 8.5 0 1 1 8 19.6L3 21z" />
              </svg>
            </a>
          )}
          {c.email_contacto && (
            <a href={`mailto:${c.email_contacto}`} onClick={parar}
              aria-label="Enviar correo" title={c.email_contacto}
              className="shrink-0 w-8 h-8 rounded-full grid place-items-center bg-[#EEF2F8] text-[#1A3557]">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 7 9 6 9-6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

/* Vista de tabla (ordenador): una fila por proceso activo, para comparar
   muchos de un vistazo. Tocar la fila abre al cliente. */
function Tabla({ clientes, onAbrir }) {
  const filas = clientes.flatMap((c) => (c.etapas?.length ? c.etapas : [null]).map((e) => ({ c, e })));
  const th = "text-[9.5px] font-bold uppercase tracking-widest font-mono text-neutral-400 px-3 py-2 text-left whitespace-nowrap";
  return (
    <div className="bg-white border border-neutral-200 rounded-2xl overflow-x-auto">
      <table className="w-full min-w-[980px]">
        <thead className="bg-neutral-50 border-b border-neutral-200">
          <tr>
            {["Cliente", "Servicio · etapa", "Le toca", "Qué hay que hacer", "Próxima fecha", "Responsable", "Recordado", "Sin mov."].map((h) => (
              <th key={h} className={th}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {filas.map(({ c, e }, i) => {
            const sv = e ? SERVICIO[e.servicio] || SERVICIO.master : null;
            const quien = e ? QUIEN[e.le_toca] : null;
            return (
              <tr key={`${c.id_cliente}-${e?.id_solicitud || i}`} onClick={() => onAbrir(c)}
                className="border-b border-neutral-100 last:border-b-0 hover:bg-[#F7FAF8] cursor-pointer">
                <td className="px-3 py-2.5">
                  <p className="text-[12.5px] font-semibold text-neutral-900 truncate max-w-[220px]">{c.nombre}</p>
                  <p className="text-[10.5px] text-neutral-400 truncate max-w-[220px]">{c.telefono || c.email_contacto}</p>
                </td>
                <td className="px-3 py-2.5 whitespace-nowrap">
                  {e ? (
                    <span className="inline-flex items-center gap-1.5">
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${sv.tono}`}>{sv.corto}</span>
                      <span className="text-[12px] text-neutral-700">{e.etapa || "—"}</span>
                    </span>
                  ) : <span className="text-[11.5px] text-neutral-400">Sin proceso activo</span>}
                </td>
                <td className="px-3 py-2.5 whitespace-nowrap">
                  {quien && e.le_toca !== "nadie" ? (
                    <span className={`inline-flex items-center gap-1.5 text-[10.5px] font-semibold px-2 py-0.5 rounded-md ${quien.clase}`}>
                      <span className="w-1.5 h-1.5 rounded-full" style={{ background: quien.punto }} />
                      {{ asesor: "Asesor", asesorado: "Asesorado", tercero: "Organismo" }[e.le_toca]}
                    </span>
                  ) : <span className="text-neutral-300">—</span>}
                </td>
                <td className="px-3 py-2.5 text-[12px] text-neutral-700 max-w-[240px]">{e?.que || "—"}</td>
                <td className="px-3 py-2.5">{e?.proximo ? <Fecha p={e.proximo} /> : <span className="text-neutral-300">—</span>}</td>
                <td className="px-3 py-2.5 text-[12px] whitespace-nowrap">
                  {e?.responsable || (e ? <span className="text-amber-700 font-semibold">Sin asignar</span> : "—")}
                </td>
                <td className="px-3 py-2.5 text-[11.5px] text-neutral-500 whitespace-nowrap">
                  {e?.recordado ? (e.recordado.dias === 0 ? "hoy" : `hace ${e.recordado.dias} d`) : "—"}
                </td>
                <td className="px-3 py-2.5 text-[11.5px] whitespace-nowrap">
                  {e?.sin_movimiento_dias != null ? (
                    <span className={e.sin_movimiento_dias >= 21 ? "text-red-700 font-bold" : e.sin_movimiento_dias >= 10 ? "text-amber-700 font-semibold" : "text-neutral-500"}>
                      {e.sin_movimiento_dias} d
                    </span>
                  ) : "—"}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function Resumen({ k, t, color, fondo, n, filtro, onFiltro }) {
  const on = filtro === k;
  return (
    <button type="button" onClick={() => onFiltro(on ? "activos" : k)} aria-pressed={on}
      className={`text-left rounded-2xl px-3 py-2.5 border transition-all active:scale-[.98] ${
        on ? "border-[#1D6A4A] ring-2 ring-[#1D6A4A]/15 bg-white" : "border-transparent"}`}
      style={on ? undefined : { background: fondo }}>
      <span className="block text-[22px] font-bold leading-none tabular-nums" style={{ color: n ? color : "#c4c4c4" }}>{n}</span>
      <span className="block text-[11px] font-semibold text-neutral-600 mt-1 leading-tight">{t}</span>
    </button>
  );
}

export default function ClientesLista({
  clientes, loading, orden, onOrden, onAbrir, onEditar,
  onServicios, onActivo, onPurgar, isAdmin, filtro, onFiltro, conteos = {},
  equipo = [], onRecargar, etiquetas = {}, etiqueta = "", onEtiqueta,
}) {
  const [traspaso, setTraspaso] = useState(null);
  const [servicio, setServicio] = useState("");
  const [masFiltros, setMasFiltros] = useState(false);
  const [seleccionando, setSeleccionando] = useState(false);
  const [marcados, setMarcados] = useState(new Set());
  const [enLote, setEnLote] = useState(false);
  const [ahora] = useState(() => Date.now());
  // Tarjetas o tabla (la tabla solo se ofrece en pantallas anchas). Se
  // recuerda por navegador: es una preferencia de cada persona.
  const [vista, setVista] = useState(() => {
    try { return localStorage.getItem("inspira.clientes.vista") || "tarjetas"; } catch { return "tarjetas"; }
  });
  const cambiarVista = (v) => { setVista(v); try { localStorage.setItem("inspira.clientes.vista", v); } catch { /* sin almacenamiento */ } };

  const porServicio = useMemo(() => {
    const n = {};
    for (const c of clientes) {
      for (const clave of new Set((c.etapas || []).map((e) => e.servicio))) n[clave] = (n[clave] || 0) + 1;
    }
    return n;
  }, [clientes]);

  const visibles = useMemo(() => clientes.filter((c) =>
    !servicio || (c.etapas || []).some((e) => e.servicio === servicio)
  ), [clientes, servicio]);

  const marcar = (c) => setMarcados((s) => {
    const n = new Set(s);
    if (n.has(c.id_cliente)) n.delete(c.id_cliente); else n.add(c.id_cliente);
    return n;
  });
  const salirSeleccion = () => { setSeleccionando(false); setMarcados(new Set()); };
  const elegidos = clientes.filter((c) => marcados.has(c.id_cliente));
  const n = (k) => conteos[k] ?? 0;

  async function asignarLote(id) {
    if (!id) return;
    const persona = equipo.find((u) => String(u.id_usuario) === String(id));
    const procesos = elegidos.flatMap((c) => c.etapas || []);
    if (!procesos.length) { dialog.toast("Los seleccionados no tienen procesos activos", "error"); return; }
    const nota = await dialog.prompt(
      `Se asignarán ${procesos.length} proceso(s) de ${elegidos.length} cliente(s) a ${persona?.nombre} (le llega un correo por cada uno). Nota de traspaso:`,
      "", "Asignar responsable",
    );
    if (nota === null) return;
    if (procesos.some((e) => e.responsable) && !nota.trim()) { dialog.toast("Hay procesos que ya llevaba alguien: la nota es obligatoria", "error"); return; }
    setEnLote(true);
    const r = await Promise.all(procesos.map((e) =>
      boPATCH(`/backoffice/solicitudes/${e.id_solicitud}/asesor`, { id_asesor_asignado: Number(id), nota: nota.trim() || undefined })));
    setEnLote(false);
    const fallos = r.filter((x) => !x.ok).length;
    dialog.toast(fallos ? `${r.length - fallos} asignados · ${fallos} fallaron` : `${r.length} proceso(s) asignados a ${persona?.nombre}`, fallos ? "error" : "success");
    salirSeleccion(); onRecargar?.();
  }

  async function recordarLote() {
    const destino = elegidos.flatMap((c) => (c.etapas || [])
      .filter((e) => e.le_toca === "asesorado" && RUTA_RECORDATORIO[e.servicio])
      .map((e) => ({ e, c })));
    if (!destino.length) {
      dialog.toast("Ninguno de los seleccionados está esperando al asesorado en un servicio con recordatorio", "error");
      return;
    }
    const ok = await dialog.confirm(
      `Se enviará un correo formal con sus pendientes a ${destino.length} proceso(s).`,
      "Recordar a los seleccionados",
    );
    if (!ok) return;
    setEnLote(true);
    const r = [];
    // De uno en uno: el servidor de correo no agradece las ráfagas.
    for (const x of destino) r.push(await recordar(x.e, x.c.nombre));
    setEnLote(false);
    const fallos = r.filter((x) => !x.ok).length;
    dialog.toast(fallos ? `${r.length - fallos} enviados · ${fallos} fallaron` : `${r.length} recordatorio(s) enviados`, fallos ? "error" : "success");
    salirSeleccion(); onRecargar?.();
  }

  const tab = (k, t) => (
    <button key={k || "todos"} type="button" onClick={() => onFiltro(k)} aria-pressed={filtro === k}
      className={`shrink-0 text-[12.5px] font-semibold px-3 py-1.5 rounded-lg transition-all ${
        filtro === k ? "bg-white text-[#1A3557] shadow-[0_1px_3px_rgba(16,24,40,.12)]" : "text-neutral-500 hover:text-neutral-800"}`}>
      {t} <span className="text-[10.5px] text-neutral-400 font-bold">{n(k === "" ? "todos" : k)}</span>
    </button>
  );

  const chip = (id, texto, tono) => (
    <button key={id} type="button" onClick={() => onFiltro(filtro === id ? "activos" : id)} aria-pressed={filtro === id}
      className={`shrink-0 flex items-center gap-1.5 text-[12px] font-semibold px-3 py-1.5 rounded-xl border transition-all active:scale-95 ${
        filtro === id ? "border-[#1D6A4A] bg-[#1D6A4A] text-white" : "border-neutral-200 bg-white text-neutral-600"}`}>
      {texto}
      <span className={`text-[10.5px] font-bold px-1.5 rounded-full ${filtro === id ? "bg-white/20" : tono}`}>{n(id)}</span>
    </button>
  );

  return (
    <div className="space-y-3">
      {/* Resumen: lo que pide atención hoy. Cada cifra filtra la lista. */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {[
          { k: "le_toca_asesor", t: "Le toca al asesor", color: "#1A3557", fondo: "#EEF2F8" },
          { k: "esperando_asesorado", t: "Esperando al asesorado", color: "#B45309", fondo: "#FEF3E7" },
          { k: "vencidos", t: "Con fecha vencida", color: "#B91C1C", fondo: "#FDEDEC" },
          { k: "sin_abrir", t: "Sin abrir por su asesor", color: "#B91C1C", fondo: "#F4F4F5" },
        ].map((x) => <Resumen key={x.k} {...x} n={n(x.k)} filtro={filtro} onFiltro={onFiltro} />)}
      </div>

      <div className="ase-sticky -mx-3 px-3 sm:-mx-6 sm:px-6 pt-1 pb-1.5 space-y-2">
        <div className="flex items-center gap-2">
          <div className="min-w-0 flex-1 overflow-x-auto [&::-webkit-scrollbar]:hidden" style={{ scrollbarWidth: "none" }}>
            <div className="inline-flex items-center gap-0.5 bg-neutral-100 rounded-xl p-1">
              {tab("activos", "Activos")}
              {tab("mios", "Míos")}
              {tab("nuevos", "Nuevos")}
              {tab("", "Todos")}
            </div>
          </div>
          <button type="button" onClick={() => setMasFiltros((v) => !v)} aria-expanded={masFiltros}
            className={`shrink-0 inline-flex items-center gap-1 text-[12px] font-semibold px-2.5 py-2 rounded-xl border ${
              masFiltros ? "border-[#1D6A4A] text-[#1D6A4A] bg-[#E8F5EE]" : "border-neutral-200 text-neutral-600 bg-white"}`}>
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
              <path strokeLinecap="round" d="M4 6h16M7 12h10M10 18h4" />
            </svg>
            Filtros
          </button>
          <div className="hidden lg:inline-flex shrink-0 rounded-xl border border-neutral-200 overflow-hidden text-[12px] font-semibold">
            {[["tarjetas", "Tarjetas"], ["tabla", "Tabla"]].map(([k, t]) => (
              <button key={k} type="button" onClick={() => cambiarVista(k)} aria-pressed={vista === k}
                className={`px-2.5 py-2 ${vista === k ? "bg-[#023A4B] text-white" : "bg-white text-neutral-600"}`}>{t}</button>
            ))}
          </div>
          <button type="button" onClick={() => (seleccionando ? salirSeleccion() : setSeleccionando(true))}
            className={`shrink-0 text-[12px] font-semibold px-2.5 py-2 rounded-xl border ${
              seleccionando ? "border-[#023A4B] bg-[#023A4B] text-white" : "border-neutral-200 text-neutral-600 bg-white"}`}>
            {seleccionando ? "Cancelar" : "Seleccionar"}
          </button>
        </div>

        {masFiltros && (
          <div className="bg-white border border-neutral-200 rounded-2xl p-2.5 space-y-2">
            <div className="flex flex-wrap gap-1.5">
              {chip("sin_responsable", "Sin responsable", "bg-amber-50 text-amber-700")}
              {chip("con_deuda", "Con deuda", "bg-red-50 text-red-700")}
              {chip("sin_movimiento", "Sin movimiento 10+ días", "bg-red-50 text-red-700")}
              {chip("sin_servicio", "Sin servicios", "bg-neutral-100 text-neutral-500")}
              {chip("prueba", "De prueba", "bg-violet-50 text-violet-700")}
            </div>
            <div className="flex flex-wrap gap-2">
              <select value={servicio} onChange={(e) => setServicio(e.target.value)}
                className="text-[12px] border border-neutral-200 rounded-lg px-2 py-1.5 bg-white text-neutral-700">
                <option value="">Todos los servicios</option>
                {Object.entries(SERVICIO).filter(([k]) => porServicio[k]).map(([k, sv]) => (
                  <option key={k} value={k}>{sv.corto} ({porServicio[k]})</option>
                ))}
              </select>
              {Object.keys(etiquetas).length > 0 && (
                <select value={etiqueta} onChange={(e) => onEtiqueta?.(e.target.value)}
                  className="text-[12px] border border-neutral-200 rounded-lg px-2 py-1.5 bg-white text-neutral-700">
                  <option value="">Todas las etiquetas</option>
                  {Object.entries(etiquetas).map(([t, k]) => <option key={t} value={t}>{t} ({k})</option>)}
                </select>
              )}
              <button type="button" onClick={() => setTraspaso({ de: "", a: "", hasta: "", nota: "" })}
                className="text-[12px] font-semibold border border-neutral-200 rounded-lg px-2.5 py-1.5 bg-white text-neutral-700">
                Traspasar cartera…
              </button>
              <select value={orden} onChange={(e) => onOrden(e.target.value)}
                className="text-[12px] border border-neutral-200 rounded-lg px-2 py-1.5 bg-white text-neutral-700">
                <option value="urgentes">Más urgentes primero</option>
                <option value="recientes">Últimos creados</option>
                <option value="antiguos">Más antiguos</option>
                <option value="nombre">Por nombre</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {loading && !clientes.length ? (
        <div className="grid gap-2.5 md:grid-cols-2">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="bg-white border border-neutral-200 rounded-2xl p-3.5 animate-pulse">
              <div className="flex gap-3">
                <div className="w-11 h-11 rounded-2xl bg-neutral-100" />
                <div className="flex-1 space-y-2 py-1">
                  <div className="h-3 bg-neutral-100 rounded w-1/2" />
                  <div className="h-2.5 bg-neutral-50 rounded w-1/3" />
                </div>
              </div>
              <div className="h-12 bg-neutral-50 rounded-xl mt-3" />
            </div>
          ))}
        </div>
      ) : visibles.length === 0 ? (
        <div className="py-12 text-center">
          <p className="text-[13px] font-semibold text-neutral-600">Ningún cliente en este filtro</p>
          <button type="button" onClick={() => { setServicio(""); onFiltro("activos"); }}
            className="mt-2 text-[12px] font-semibold text-[#1D6A4A] underline">Ver los activos</button>
        </div>
      ) : vista === "tabla" && !seleccionando && typeof window !== "undefined" && window.innerWidth >= 1024 ? (
        <Tabla clientes={visibles} onAbrir={onAbrir} />
      ) : (
        <div className="grid gap-2.5 md:grid-cols-2 items-start">
          {visibles.map((c) => (
            <Ficha
              key={c.id_cliente} c={c} ahora={ahora} isAdmin={isAdmin} equipo={equipo}
              seleccionando={seleccionando} marcado={marcados.has(c.id_cliente)} onMarcar={marcar}
              onAbrir={onAbrir} onEditar={onEditar} onServicios={onServicios}
              onActivo={onActivo} onPurgar={onPurgar} onCambio={onRecargar}
            />
          ))}
        </div>
      )}

      {traspaso && (
        <div className="fixed inset-0 z-[85] bg-[#011c26]/60 grid place-items-center p-4" onClick={() => setTraspaso(null)} role="presentation">
          <div className="bg-white rounded-2xl w-full max-w-md p-4 space-y-3 shadow-2xl" onClick={(ev) => ev.stopPropagation()} role="presentation">
            <p className="text-[16px] font-semibold text-[#1A3557]">Traspasar cartera</p>
            <p className="text-[12px] text-neutral-500">
              Pasa todos los procesos activos de una persona a otra (vacaciones, bajas). A quien los recibe le llega un
              correo por cada uno. Con fecha de vuelta, vuelven solos ese día.
            </p>
            {["de", "a"].map((k) => (
              <label key={k} className="block">
                <span className="text-[11.5px] font-semibold text-neutral-600">{k === "de" ? "De" : "A"}</span>
                <select value={traspaso[k]} onChange={(ev) => setTraspaso({ ...traspaso, [k]: ev.target.value })}
                  className="mt-1 w-full text-[13px] border border-neutral-300 rounded-xl px-3 py-2.5 bg-white">
                  <option value="">Elegir…</option>
                  {equipo.map((u) => <option key={u.id_usuario} value={u.id_usuario}>{u.nombre}</option>)}
                </select>
              </label>
            ))}
            <label className="block">
              <span className="text-[11.5px] font-semibold text-neutral-600">Vuelven el (opcional)</span>
              <input type="date" value={traspaso.hasta} onChange={(ev) => setTraspaso({ ...traspaso, hasta: ev.target.value })}
                className="mt-1 w-full text-[13px] border border-neutral-300 rounded-xl px-3 py-2" />
            </label>
            <label className="block">
              <span className="text-[11.5px] font-semibold text-neutral-600">Nota de traspaso (obligatoria)</span>
              <textarea rows={3} value={traspaso.nota} onChange={(ev) => setTraspaso({ ...traspaso, nota: ev.target.value })}
                placeholder="Qué está pasando con estos clientes y qué falta"
                className="mt-1 w-full text-[13px] border border-neutral-300 rounded-xl px-3 py-2" />
            </label>
            <div className="flex gap-2 justify-end">
              <button type="button" onClick={() => setTraspaso(null)} className="text-[13px] font-semibold px-4 py-2 rounded-xl text-neutral-600">Cancelar</button>
              <button type="button" disabled={!traspaso.de || !traspaso.a || !traspaso.nota.trim() || enLote}
                onClick={async () => {
                  setEnLote(true);
                  const r = await boPOST("/backoffice/gestion-clientes/traspaso", { ...traspaso, de: Number(traspaso.de), a: Number(traspaso.a) });
                  setEnLote(false);
                  if (r.ok) { dialog.toast(`${r.traspasados} proceso(s) traspasados`, "success"); setTraspaso(null); onRecargar?.(); }
                  else dialog.toast(r.msg || "No se pudo traspasar", "error");
                }}
                className="text-[13px] font-bold px-4 py-2 rounded-xl bg-[#1D6A4A] text-white disabled:opacity-40">
                Traspasar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Acciones en lote */}
      {seleccionando && (
        <div className="sticky bottom-20 md:bottom-4 z-30 bg-[#023A4B] text-white rounded-2xl px-3 py-2.5 shadow-[0_18px_40px_-18px_rgba(2,58,75,.9)] flex items-center gap-2 flex-wrap">
          <span className="text-[12.5px] font-semibold">
            {marcados.size ? `${marcados.size} seleccionado${marcados.size > 1 ? "s" : ""}` : "Toca los clientes"}
          </span>
          <div className="ml-auto flex items-center gap-2">
            <label className={`relative text-[12px] font-semibold px-3 py-1.5 rounded-lg bg-white text-[#023A4B] ${!marcados.size || enLote ? "opacity-50 pointer-events-none" : ""}`}>
              Asignar a…
              <select value="" onChange={(e) => asignarLote(e.target.value)} aria-label="Asignar responsable a los seleccionados"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer">
                <option value="">Asignar a…</option>
                {equipo.map((u) => <option key={u.id_usuario} value={u.id_usuario}>{u.nombre}</option>)}
              </select>
            </label>
            <button type="button" onClick={recordarLote} disabled={!marcados.size || enLote}
              className="text-[12px] font-semibold px-3 py-1.5 rounded-lg border border-white/40 disabled:opacity-50">
              {enLote ? "Enviando…" : "Recordar"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
