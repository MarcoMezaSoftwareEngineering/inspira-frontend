// Ficha de una reserva («Administrar»): todo lo de esa cita en un solo lugar — datos, pago y
// política aceptada, formulario previo, notas de Gemini, informe (ver, enviar, pedir cambios),
// avisos al asesorado y la cotización. La lista de reservas solo lleva lo de todos los días
// (unirse, WhatsApp, cancelar); lo demás vive aquí.
import { useCallback, useEffect, useState } from "react";
import { boGET, boPOST } from "../../../../services/backofficeApi";
import { dialog } from "../../../../services/dialogService";
import { GruposAcciones, InformeBtns, VerVoucherBtn, EditMeetBtn, CancelBtn } from "./BotonesCita";

const MESES = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];
const fechaCorta = (f) => { const [y, m, d] = String(f || "").split("-").map(Number); return d ? `${d} ${MESES[m - 1]} ${y}` : ""; };
const cuando = (iso) => (iso ? new Date(iso).toLocaleString("es-PE", { timeZone: "America/Lima", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }) : "");

const ETIQUETAS = {
  formacion: "Estudios", experiencia: "Experiencia laboral", idiomas: "Idiomas", residencia: "Residencia", interes: "Interés",
  inicio: "Cuándo quiere empezar", presupuesto: "Presupuesto de matrícula", masteres_pensados: "Másteres que ya pensó",
  becas_interes: "Becas que le interesan", documentos_listos: "Documentos que ya tiene", dudas: "Dudas",
};
function texto(v) {
  if (Array.isArray(v)) return v.filter(Boolean).join(", ");
  if (v && typeof v === "object") return Object.values(v).filter(Boolean).join(" · ");
  return String(v ?? "");
}

function Seccion({ titulo, nota, children }) {
  return (
    <section className="rounded-2xl border border-neutral-200 bg-white p-4">
      <div className="flex items-baseline justify-between gap-2">
        <h3 className="text-[13px] font-extrabold text-primary-dark">{titulo}</h3>
        {nota && <span className="text-[10.5px] text-neutral-400">{nota}</span>}
      </div>
      <div className="mt-2.5 text-[12.5px] text-neutral-700">{children}</div>
    </section>
  );
}
const Fila = ({ k, v }) => (v ? <p className="mb-1"><span className="text-neutral-400">{k}: </span><strong className="font-semibold text-neutral-800">{v}</strong></p> : null);
const BTN = "px-3 py-2.5 rounded-xl text-[12px] font-bold disabled:opacity-50";

export default function FichaReserva({ reserva, onCerrar, onChanged }) {
  const [f, setF] = useState(null);
  const [error, setError] = useState("");
  const [cambio, setCambio] = useState("");
  const [ocupado, setOcupado] = useState("");

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
  const estadoInforme = !f ? "" : inf.estado === "ENVIADO" ? "Enviado al asesorado" : inf.estado === "BORRADOR" ? "Borrador por aprobar" : f.notas.texto ? "En cola: Clawsito lo redacta en unos minutos" : "Aún sin notas de Gemini";
  const cotizar = f ? `/backoffice/presupuesto?${new URLSearchParams({ cliente: f.cotizar.cliente, correo: f.cotizar.correo, concepto: f.cotizar.concepto, importe: f.cotizar.importe })}` : "#";

  return (
    <div className="fixed inset-0 z-50 bg-black/40 overflow-y-auto" onClick={onCerrar}>
      <div className="mx-auto min-h-full sm:my-6 max-w-2xl bg-neutral-50 sm:rounded-2xl shadow-xl" onClick={(e) => e.stopPropagation()}>
        <header className="sticky top-0 z-10 flex items-start justify-between gap-3 bg-primary-dark px-4 py-3 text-white sm:rounded-t-2xl">
          <div className="min-w-0">
            <p className="text-[10px] uppercase tracking-[.14em] text-white/60 font-bold">Reserva N.° {reserva.id_reserva}</p>
            <h2 className="truncate text-[16px] font-bold">{reserva.cliente?.nombre || "Sin nombre"}</h2>
            <p className="text-[11.5px] text-white/70">{fechaCorta(reserva.fecha)} · {reserva.hora_inicio} (hora Perú)</p>
          </div>
          <button type="button" onClick={onCerrar} className="shrink-0 rounded-lg bg-white/10 px-3 py-1.5 text-[12px] font-bold hover:bg-white/20">Cerrar</button>
        </header>

        <div className="grid gap-3 p-3 sm:p-4">
          {error && <p className="rounded-xl bg-red-50 p-3 text-[12px] text-red-700">{error}</p>}
          {!f && !error && <p className="p-6 text-center text-[12px] text-neutral-400">Cargando…</p>}
          {f && (
            <>
              <Seccion titulo="La reserva">
                <Fila k="Correo" v={f.cliente.email} />
                <Fila k="Celular" v={f.cliente.telefono} />
                <Fila k="Interés" v={f.interes} />
                <Fila k="Inicio" v={f.inicio} />
                <Fila k="Detalle" v={f.detalle} />
                <Fila k="Importe" v={`${f.monto} ${f.moneda}`} />
                <Fila k="Pago" v={f.pagado_en ? `confirmado el ${cuando(f.pagado_en)}${["TRANSFERENCIA", "DESPUES", "PENDIENTE"].includes(f.metodo_pago) ? " manualmente" : ""}` : "pendiente"} />
                <Fila k="Política aceptada" v={f.terminos.aceptados_en ? `${f.terminos.version} · ${cuando(f.terminos.aceptados_en)}` : "sin registro (reserva anterior al 03/11)"} />
                <div className="mt-2 flex flex-wrap gap-2">
                  <VerVoucherBtn reserva={reserva} className={`${BTN} bg-white border border-neutral-200 text-neutral-700`} />
                  {!f.meet_url && reserva.estado !== "CANCELADA" && <EditMeetBtn reserva={reserva} onChanged={cambiado} className={`${BTN} bg-amber-50 text-amber-700 border border-amber-200`} />}
                  {reserva.estado !== "CANCELADA" && <CancelBtn reserva={reserva} onChanged={() => { onChanged?.(); onCerrar(); }} className={`${BTN} bg-white border border-red-200 text-red-500`} />}
                </div>
              </Seccion>

              <Seccion titulo="Formulario previo" nota={f.formulario?.actualizado_en ? `completado ${cuando(f.formulario.actualizado_en)}` : "sin completar"}>
                {f.formulario ? (
                  <div>{Object.entries(ETIQUETAS).map(([k, et]) => <Fila key={k} k={et} v={texto(f.formulario[k])} />)}</div>
                ) : <p className="text-neutral-500">Aún no respondió. Se le envía al confirmar el pago; puede reenviarlo desde «Avisos y cambios».</p>}
              </Seccion>

              <Seccion titulo="Notas de Gemini" nota={f.notas.obtenidas_en ? `recogidas ${cuando(f.notas.obtenidas_en)}` : ""}>
                {f.notas.texto ? (
                  <>
                    <div className="max-h-60 overflow-y-auto whitespace-pre-wrap rounded-xl bg-neutral-50 p-3 text-[12px] leading-relaxed">{f.notas.texto}</div>
                    {f.notas.url && <a href={f.notas.url} target="_blank" rel="noopener noreferrer" className="mt-2 inline-block text-[12px] font-bold text-primary underline">Abrir el documento original</a>}
                  </>
                ) : (
                  <>
                    <p className="text-neutral-500">Gemini las deja unos minutos después de terminar la reunión; Core las recoge solo cada pocos minutos.</p>
                    <button type="button" disabled={!!ocupado} onClick={() => accion("notas", "notas", {}, "Notas recogidas.")} className={`${BTN} mt-2 bg-white border border-neutral-200 text-neutral-700`}>
                      {ocupado === "notas" ? "Buscando…" : "Traer las notas ahora"}
                    </button>
                  </>
                )}
              </Seccion>

              <Seccion titulo="Informe de la asesoría" nota={estadoInforme}>
                {inf.tema && <p className="mb-1 font-semibold text-neutral-800">{inf.tema}</p>}
                {inf.conclusion && <p className="mb-2 text-neutral-600">{inf.conclusion}</p>}
                {inf.por_confirmar.length > 0 && (
                  <div className="mb-2 rounded-xl bg-amber-50 p-3">
                    <p className="mb-1 text-[11px] font-extrabold text-amber-800">Clawsito marcó por confirmar</p>
                    <ul className="list-disc pl-4 text-[12px] text-amber-900">{inf.por_confirmar.map((p, i) => <li key={i}>{p}</li>)}</ul>
                  </div>
                )}
                <div className="flex flex-wrap gap-2"><InformeBtns reserva={{ ...reserva, informe_estado: inf.estado }} onChanged={cambiado} /></div>
                {inf.estado !== "ENVIADO" && f.notas.texto && (
                  <div className="mt-3">
                    {inf.pedido && <p className="mb-2 rounded-xl bg-sky-50 p-2.5 text-[11.5px] text-sky-800">Pedido a Clawsito: «{inf.pedido}». Lo rehace en su próxima pasada (hasta 10 min) y le llega un borrador nuevo.</p>}
                    <label className="mb-1 block text-[11px] font-bold text-neutral-500" htmlFor="rv-cambio">{inf.estado ? "¿Qué debe cambiar?" : "¿Algo que deba tener en cuenta al redactarlo?"}</label>
                    <textarea id="rv-cambio" value={cambio} onChange={(e) => setCambio(e.target.value)} rows={2} maxLength={600} placeholder="Ej.: añade la beca Carolina y baja el presupuesto a 1 500 €"
                      className="w-full rounded-xl border border-neutral-200 p-2.5 text-[12.5px]" />
                    <button type="button" disabled={!!ocupado || !cambio.trim()} onClick={() => accion("rehacer", "informe/rehacer", { instruccion: cambio }, "Pedido enviado a Clawsito.").then(() => setCambio(""))}
                      className={`${BTN} mt-2 bg-primary text-white`}>{ocupado === "rehacer" ? "Enviando…" : inf.estado ? "Pedir cambios a Clawsito" : "Pedir el informe con esta nota"}</button>
                  </div>
                )}
              </Seccion>

              <Seccion titulo="Cotización" nota="lleva lo que ya sabemos">
                <p className="text-neutral-600">Abre el presupuesto con su nombre y correo{f.interes ? `, el interés (${f.interes})` : ""}{f.cotizar.importe ? " y el paquete e importe que propone el informe" : ""}. Lo demás lo completa usted.</p>
                <a href={cotizar} className={`${BTN} mt-2 inline-block bg-primary text-white`}>Preparar cotización</a>
              </Seccion>

              <Seccion titulo="Avisos y cambios">
                <GruposAcciones reserva={{ ...reserva, estado: reserva.estado }} onChanged={cambiado} sinOtras />
              </Seccion>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
