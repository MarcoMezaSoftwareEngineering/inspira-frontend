// Ficha de una reserva («Administrar»): todo lo de esa cita en un solo lugar — datos, pago y
// política aceptada, formulario previo, notas de Gemini, informe (ver, enviar, pedir cambios),
// avisos al asesorado y la cotización. La lista de reservas solo lleva lo de todos los días
// (unirse, WhatsApp, cancelar); lo demás vive aquí.
import { useCallback, useEffect, useState } from "react";
import { boGET, boPOST } from "../../../../services/backofficeApi";
import { dialog } from "../../../../services/dialogService";
import Icono from "../../../../components/common/Icono";
import { GruposAcciones, InformeBtns, VerVoucherBtn, EditMeetBtn, CancelBtn } from "./BotonesCita";

const MESES = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];
const fechaCorta = (f) => { const [y, m, d] = String(f || "").split("-").map(Number); return d ? `${d} ${MESES[m - 1]} ${y}` : ""; };
const cuando = (iso) => (iso ? new Date(iso).toLocaleString("es-PE", { timeZone: "America/Lima", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }) : "");

const ETIQUETAS = {
  formacion: "Estudios", experiencia: "Experiencia laboral", idiomas: "Idiomas", residencia: "Residencia", interes: "Interés",
  inicio: "Quiere empezar", presupuesto: "Presupuesto de matrícula", masteres_pensados: "Másteres que ya pensó",
  becas_interes: "Becas que le interesan", documentos_listos: "Documentos que ya tiene", dudas: "Dudas",
};
const VISA_ETIQ = {
  situacion: "Dónde está hoy", fecha_viaje: "Viaje o vencimiento", pasaporte_hasta: "Pasaporte vence", admision: "Carta de admisión", centro: "Universidad y programa",
  inicio_clases: "Inicio de clases", estados_cuenta: "6 meses de estados de cuenta", saldo: "Saldo aproximado", origen_fondos: "Origen del dinero",
  denegada: "Visa denegada antes", denegada_detalle: "Qué pasó", acompanantes: "Acompañantes", documentos: "Documentos de visado que ya tiene",
};
function texto(v) {
  if (Array.isArray(v)) return v.filter(Boolean).join(", ");
  if (v && typeof v === "object") return Object.values(v).filter(Boolean).join(" · ");
  return String(v ?? "");
}

// Un dato: la etiqueta pequeña arriba y el valor debajo (mejor que «etiqueta: valor» en una línea).
const Dato = ({ k, v, ancho }) => (v ? (
  <div className={ancho ? "col-span-2" : ""}>
    <p className="text-[9.5px] font-extrabold uppercase tracking-[.1em] text-neutral-400">{k}</p>
    <p className="mt-0.5 text-[13px] font-semibold leading-snug text-neutral-800 break-words">{v}</p>
  </div>
) : null);

// Tarjeta plegable: icono, título y una línea de resumen visibles; el detalle, al abrirla.
function Tarjeta({ icono, titulo, resumen, tono = "neutral", abierta = false, children }) {
  const tonos = { neutral: "bg-neutral-100 text-neutral-500", ok: "bg-emerald-100 text-emerald-700", ojo: "bg-amber-100 text-amber-700" };
  return (
    <details open={abierta} className="group overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm">
      <summary className="flex cursor-pointer list-none items-center gap-3 p-3.5 [&::-webkit-details-marker]:hidden">
        <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl ${tonos[tono]}`}><Icono nombre={icono} size={18} /></span>
        <span className="min-w-0 flex-1">
          <span className="block text-[14px] font-bold text-primary-dark">{titulo}</span>
          {resumen && <span className="block truncate text-[11.5px] text-neutral-500">{resumen}</span>}
        </span>
        <span className="text-neutral-400 transition-transform group-open:rotate-180" aria-hidden>▾</span>
      </summary>
      <div className="border-t border-neutral-100 p-3.5 text-[12.5px] text-neutral-700">{children}</div>
    </details>
  );
}
const BTN = "px-3.5 py-2.5 rounded-xl text-[12px] font-bold disabled:opacity-50";

function Paso({ hecho, texto: t }) {
  return (
    <span className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-bold ${hecho ? "bg-emerald-50 text-emerald-700" : "bg-neutral-100 text-neutral-400"}`}>
      <Icono nombre={hecho ? "check" : "reloj"} size={13} />{t}
    </span>
  );
}

export default function FichaReserva({ reserva, onCerrar, onChanged }) {
  const [f, setF] = useState(null);
  const [error, setError] = useState("");
  const [cambio, setCambio] = useState("");
  const [ocupado, setOcupado] = useState("");
  const [ahora] = useState(() => Date.now());

  const cargar = useCallback(async () => {
    const r = await boGET(`/backoffice/agenda/reservas/${reserva.id_reserva}/ficha`);
    if (r?.ok === false) setError(r.msg || "No se pudo abrir la ficha");
    else setF(r?.ficha || null);
  }, [reserva.id_reserva]);
  useEffect(() => { cargar(); }, [cargar]); // eslint-disable-line react-hooks/set-state-in-effect

  async function accion(clave, ruta, cuerpo, hecho) {
    setOcupado(clave);
    const r = await boPOST(`/backoffice/agenda/reservas/${reserva.id_reserva}/${ruta}`, cuerpo);
    setOcupado("");
    if (r?.ok === false) return dialog.toast(r.msg || "No se pudo completar", "error");
    dialog.toast(hecho, "success");
    cargar();
    onChanged?.();
  }

  const cambiado = () => { cargar(); onChanged?.(); };
  const inf = f?.informe;
  const pagada = !!f?.pagado_en;
  const pasada = f ? new Date(`${f.fecha}T${f.hora_inicio}:00-05:00`).getTime() < ahora : false;
  const conFormulario = !!f?.formulario?.actualizado_en;
  const conNotas = !!f?.notas.texto;
  const enviado = inf?.estado === "ENVIADO";
  const sinInforme = inf?.estado === "DESCARTADO";
  const cotizaciones = f?.cotizaciones || [];
  const enviadas = cotizaciones.filter((q) => q.estado === "enviado");

  // Qué toca ahora: una sola frase que ordena todo lo demás.
  const siguiente = !f ? "" : reserva.estado === "CANCELADA" ? "La reserva está cancelada."
    : !pagada ? "Falta confirmar el pago."
    : !pasada ? (conFormulario ? "Todo listo para la reunión." : "Esperando su formulario previo (puede reenviárselo).")
    : !conNotas ? "Esperando las notas de Gemini."
    : sinInforme ? (enviadas.length ? "Cotización enviada: queda esperar su respuesta." : "Sin informe: prepare la cotización si corresponde.")
    : !inf.estado ? "Clawsito está redactando el informe."
    : !enviado ? "Revise el informe y envíelo al asesorado."
    : enviadas.length ? "Informe y cotización enviados: queda esperar su respuesta." : "Informe enviado: prepare la cotización.";
  const abrir = { datos: !pagada, formulario: pagada && !pasada && !conFormulario, notas: pasada && !conNotas, informe: pasada && conNotas && !enviado, cotizacion: (enviado || sinInforme) && !enviadas.length };
  const cotizar = f ? `/backoffice/presupuesto?${new URLSearchParams({ cliente: f.cotizar.cliente, correo: f.cotizar.correo, concepto: f.cotizar.concepto, importe: f.cotizar.importe, reserva: String(reserva.id_reserva) })}` : "#";
  const estadoInforme = !f ? "" : sinInforme ? "sin informe" : enviado ? "enviado al asesorado" : inf.estado ? "borrador por aprobar" : conNotas ? "en cola" : "sin notas todavía";

  return (
    <div className="fixed inset-0 z-50 bg-black/50 overflow-y-auto" onClick={onCerrar}>
      <div className="mx-auto min-h-full max-w-2xl bg-[#F4F9FE] sm:my-6 sm:min-h-0 sm:rounded-3xl shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <header className="sticky top-0 z-10 bg-gradient-to-br from-[#013446] to-[#012938] px-4 pb-4 pt-3 text-white sm:rounded-t-3xl">
          <div className="flex items-start justify-between gap-3">
            <p className="text-[10px] font-bold uppercase tracking-[.16em] text-white/55">Reserva N.° {reserva.id_reserva}</p>
            <button type="button" onClick={onCerrar} aria-label="Cerrar" className="grid h-9 w-9 place-items-center rounded-full bg-white/10 text-[16px] hover:bg-white/20">✕</button>
          </div>
          <h2 className="font-fraunces text-[22px] font-bold leading-tight">{reserva.cliente?.nombre || "Sin nombre"}</h2>
          <p className="mt-1 flex items-center gap-1.5 text-[12.5px] text-white/75"><Icono nombre="calendario" size={14} />{fechaCorta(reserva.fecha)} · {reserva.hora_inicio} (hora Perú)</p>
        </header>

        <div className="grid gap-3 p-3 sm:p-4">
          {error && <p className="rounded-xl bg-red-50 p-3 text-[12px] text-red-700">{error}</p>}
          {!f && !error && <p className="p-8 text-center text-[12px] text-neutral-400">Cargando…</p>}
          {f && (
            <>
              <section className="rounded-2xl bg-white p-3.5 shadow-sm border border-neutral-200">
                <p className="text-[9.5px] font-extrabold uppercase tracking-[.12em] text-neutral-400">Qué sigue</p>
                <p className="mt-0.5 text-[15px] font-bold text-primary-dark">{siguiente}</p>
                <div className="-mx-1 mt-3 flex gap-1.5 overflow-x-auto px-1 pb-1">
                  <Paso hecho={pagada} texto="Pago" />
                  <Paso hecho={conFormulario} texto="Formulario" />
                  <Paso hecho={pasada && reserva.estado !== "CANCELADA"} texto="Reunión" />
                  <Paso hecho={conNotas} texto="Notas" />
                  <Paso hecho={enviado || sinInforme} texto="Informe" />
                  <Paso hecho={enviadas.length > 0} texto="Cotización" />
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {reserva.whatsapp_url && <a href={reserva.whatsapp_url} target="_blank" rel="noopener noreferrer" className={`${BTN} bg-[#25D366] text-white`}>Enviar por WhatsApp</a>}
                  {reserva.meet_url && reserva.estado !== "CANCELADA" && <a href={reserva.meet_url} target="_blank" rel="noopener noreferrer" className={`${BTN} bg-primary text-white`}>Unirse</a>}
                  {!enviadas.length && <a href={cotizar} className={`${BTN} bg-primary-dark text-white`}>Preparar cotización</a>}
                </div>
              </section>

              <Tarjeta icono="usuario" titulo="Datos y pago" resumen={`${f.monto} ${f.moneda} · ${pagada ? "pagado" : "por pagar"}`} tono={pagada ? "ok" : "ojo"} abierta={abrir.datos}>
                <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                  <Dato k="Correo" v={f.cliente.email} ancho />
                  <Dato k="Celular" v={f.cliente.telefono} />
                  <Dato k="Interés" v={f.interes} />
                  <Dato k="Quiere empezar" v={f.inicio} />
                  <Dato k="Importe" v={`${f.monto} ${f.moneda}`} />
                  <Dato k="Pago" v={pagada ? `confirmado el ${cuando(f.pagado_en)}${["TRANSFERENCIA", "DESPUES", "PENDIENTE", "EQUIPO"].includes(f.metodo_pago) ? " (manual)" : ""}` : f.metodo_pago === "EQUIPO" ? "pendiente (se coordina aparte)" : "pendiente"} ancho />
                  <Dato k="Lo que contó al reservar" v={f.detalle} ancho />
                  <Dato k="Política aceptada" v={f.terminos.aceptados_en ? `${f.terminos.version} · ${cuando(f.terminos.aceptados_en)}` : "sin registro (reserva anterior al 03/11)"} ancho />
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {f.metodo_pago === "EQUIPO" && !pagada && (
                    <button type="button" disabled={!!ocupado} onClick={() => accion("pago", "pago-recibido", {}, "Pago anotado.")} className={`${BTN} bg-emerald-600 text-white`}>
                      {ocupado === "pago" ? "Anotando…" : "Anotar pago recibido"}
                    </button>
                  )}
                  <VerVoucherBtn reserva={reserva} className={`${BTN} bg-white border border-neutral-200 text-neutral-700`} />
                  {!f.meet_url && reserva.estado !== "CANCELADA" && <EditMeetBtn reserva={reserva} onChanged={cambiado} className={`${BTN} bg-amber-50 text-amber-700 border border-amber-200`} />}
                  {reserva.estado !== "CANCELADA" && <CancelBtn reserva={reserva} onChanged={() => { onChanged?.(); onCerrar(); }} className={`${BTN} bg-white border border-red-200 text-red-500`} />}
                </div>
              </Tarjeta>

              <Tarjeta icono="documento" titulo="Formulario previo" resumen={conFormulario ? `completado ${cuando(f.formulario.actualizado_en)}` : "aún sin completar"} tono={conFormulario ? "ok" : "ojo"} abierta={abrir.formulario}>
                {f.formulario ? (
                  <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                    {Object.entries(ETIQUETAS).map(([k, et]) => <Dato key={k} k={et} v={texto(f.formulario[k])} ancho />)}
                    {Object.entries(VISA_ETIQ).map(([k, et]) => <Dato key={k} k={et} v={texto(f.formulario.visa?.[k])} ancho />)}
                  </div>
                ) : <p className="text-neutral-500">Aún no respondió. Se le envía al confirmar el pago; puede reenviarlo desde «Avisos y cambios».</p>}
              </Tarjeta>

              <Tarjeta icono="video" titulo="Notas de Gemini" resumen={conNotas ? `recogidas ${cuando(f.notas.obtenidas_en)}` : "todavía no hay notas"} tono={conNotas ? "ok" : "neutral"} abierta={abrir.notas}>
                {conNotas ? (
                  <>
                    <div className="max-h-64 overflow-y-auto whitespace-pre-wrap rounded-xl bg-neutral-50 p-3 text-[12.5px] leading-relaxed">{f.notas.texto}</div>
                    {f.notas.url && <a href={f.notas.url} target="_blank" rel="noopener noreferrer" className="mt-2 inline-block text-[12px] font-bold text-primary underline">Abrir el documento original</a>}
                  </>
                ) : (
                  <>
                    <p className="text-neutral-500">Gemini las deja unos minutos después de terminar la reunión; Core las recoge solo.</p>
                    <button type="button" disabled={!!ocupado} onClick={() => accion("notas", "notas", {}, "Notas recogidas.")} className={`${BTN} mt-2 bg-white border border-neutral-200 text-neutral-700`}>
                      {ocupado === "notas" ? "Buscando…" : "Traer las notas ahora"}
                    </button>
                  </>
                )}
              </Tarjeta>

              <Tarjeta icono="libro" titulo="Informe de la asesoría" resumen={estadoInforme} tono={enviado || sinInforme ? "ok" : inf.estado ? "ojo" : "neutral"} abierta={abrir.informe}>
                {inf.tema && <p className="mb-1 text-[13.5px] font-bold text-neutral-800">{inf.tema}</p>}
                {inf.conclusion && <p className="mb-3 leading-relaxed text-neutral-600">{inf.conclusion}</p>}
                {inf.por_confirmar.length > 0 && (
                  <div className="mb-3 rounded-xl bg-amber-50 p-3">
                    <p className="mb-1 text-[11px] font-extrabold text-amber-800">Clawsito marcó por confirmar</p>
                    <ul className="list-disc pl-4 text-[12px] text-amber-900">{inf.por_confirmar.map((p, i) => <li key={i}>{p}</li>)}</ul>
                  </div>
                )}
                <div className="flex flex-wrap gap-2"><InformeBtns reserva={{ ...reserva, informe_estado: inf.estado }} onChanged={cambiado} /></div>
                {!enviado && !sinInforme && !conNotas && (
                  <button type="button" disabled={!!ocupado} onClick={() => accion("sininf", "sin-informe", {}, "Listo: esta cita queda sin informe.")} className={`${BTN} mt-1 bg-white border border-neutral-200 text-neutral-700`}>
                    No se grabó: sin informe
                  </button>
                )}
                {!enviado && !sinInforme && conNotas && (
                  <div className="mt-3 rounded-xl bg-neutral-50 p-3">
                    {inf.pedido && <p className="mb-2 rounded-lg bg-sky-50 p-2.5 text-[11.5px] text-sky-800">Pedido a Clawsito: «{inf.pedido}». Lo rehace en su próxima pasada (hasta 10 min) y le llega un borrador nuevo.</p>}
                    <label className="mb-1 block text-[11px] font-bold text-neutral-500" htmlFor="rv-cambio">{inf.estado ? "¿Qué debe cambiar?" : "¿Algo que deba tener en cuenta al redactarlo?"}</label>
                    <textarea id="rv-cambio" value={cambio} onChange={(e) => setCambio(e.target.value)} rows={2} maxLength={600} placeholder="Ej.: añade la beca Carolina y baja el presupuesto a 1 500 €"
                      className="w-full rounded-xl border border-neutral-200 bg-white p-2.5 text-[12.5px]" />
                    <button type="button" disabled={!!ocupado || !cambio.trim()} onClick={() => accion("rehacer", "informe/rehacer", { instruccion: cambio }, "Pedido enviado a Clawsito.").then(() => setCambio(""))}
                      className={`${BTN} mt-2 bg-primary text-white`}>{ocupado === "rehacer" ? "Enviando…" : inf.estado ? "Pedir cambios a Clawsito" : "Pedir el informe con esta nota"}</button>
                  </div>
                )}
              </Tarjeta>

              <Tarjeta icono="euro" titulo="Cotización" resumen={enviadas.length ? `enviada · ${enviadas[0].numero || ""} · S/ ${enviadas[0].total}` : cotizaciones.length ? "en borrador" : f.cotizar.importe ? `propuesta del informe: ${f.cotizar.importe}` : "con sus datos ya cargados"} tono={enviadas.length ? "ok" : "neutral"} abierta={abrir.cotizacion}>
                {cotizaciones.length > 0 && (
                  <ul className="mb-3 grid gap-1.5">
                    {cotizaciones.map((q) => (
                      <li key={q.id_presupuesto} className="flex items-center justify-between gap-2 rounded-xl bg-neutral-50 p-2.5">
                        <span><strong>{q.numero || "Sin número"}</strong> · S/ {q.total} · {q.estado === "enviado" ? `enviada ${cuando(q.enviado_at)}` : q.estado}</span>
                        <a href={`/backoffice/presupuesto?abrir=${q.id_presupuesto}`} className="text-[12px] font-bold text-primary underline">Abrir</a>
                      </li>
                    ))}
                  </ul>
                )}
                {(f.cotizaciones_por_correo || []).length > 0 && (
                  <div className="mb-3 rounded-xl bg-sky-50 p-2.5">
                    <p className="mb-1 text-[11px] font-extrabold text-sky-800">Hay cotizaciones a su correo sin vincular a esta cita</p>
                    {f.cotizaciones_por_correo.map((q) => (
                      <div key={q.id_presupuesto} className="flex items-center justify-between gap-2 py-1 text-[12px]">
                        <span>{q.numero || "Sin número"} · S/ {q.total} · {q.estado}</span>
                        <button type="button" disabled={!!ocupado} onClick={() => accion(`v${q.id_presupuesto}`, "vincular-cotizacion", { id_presupuesto: q.id_presupuesto }, "Cotización vinculada.")} className="font-bold text-primary underline">Vincular a esta cita</button>
                      </div>
                    ))}
                  </div>
                )}
                <p className="text-neutral-600">Abre el presupuesto con su nombre y correo{f.interes ? `, el interés (${f.interes})` : ""}{f.cotizar.importe ? " y el paquete e importe que propone el informe" : ""}. Lo demás lo completa usted.</p>
                <a href={cotizar} className={`${BTN} mt-3 inline-block bg-primary text-white`}>Preparar cotización</a>
                <button type="button" disabled={!!ocupado} className={`${BTN} mt-3 ml-2 bg-white border border-neutral-200 text-neutral-500`}
                  onClick={async () => { if (await dialog.confirm("¿Cerrar este contacto sin seguimiento? No habrá informe ni cotización y el lead se descarta.", "Cerrar sin seguimiento")) accion("cerrar", "sin-informe", { cerrar: true, motivo: "Sin seguimiento: contactará si necesita otra asesoría" }, "Contacto cerrado sin seguimiento."); }}>
                  Cerrar sin seguimiento
                </button>
              </Tarjeta>

              <Tarjeta icono="campana" titulo="Avisos y cambios" resumen="reenviar accesos, recordar, reagendar, inasistencia">
                <GruposAcciones reserva={{ ...reserva, estado: reserva.estado }} onChanged={cambiado} sinOtras />
              </Tarjeta>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
