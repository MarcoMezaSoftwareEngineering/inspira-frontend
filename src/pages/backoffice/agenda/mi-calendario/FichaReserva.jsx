// Ficha de una reserva («Administrar»), como ficha de registro de CRM: cabecera fija con la persona,
// su cita y contacto rápido; pestañas (Resumen · Asesorado · Informe · Cotización · Acciones) y UNA
// acción principal fija abajo, la que toca según el momento (confirmar pago, unirse, enviar el
// informe, cotizar…). Todo el contenido de antes sigue aquí, ordenado por pestañas.
import { useCallback, useEffect, useState } from "react";
import { boGET, boPOST } from "../../../../services/backofficeApi";
import { dialog } from "../../../../services/dialogService";
import Icono from "../../../../components/common/Icono";
import { ConfirmarPagoBtn, GruposAcciones, InformeBtns, VerVoucherBtn, EditMeetBtn, CancelBtn } from "./BotonesCita";
import { Chip, Contacto, Dato, Datos, Hoja, Progreso, Seccion } from "../../crm/kit";
import { BOTON } from "../../crm/estilos";

const DIAS = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];
const MESES = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];
function fechaLarga(f) {
  const [y, m, d] = String(f || "").split("-").map(Number);
  if (!d) return "";
  return `${DIAS[new Date(Date.UTC(y, m - 1, d)).getUTCDay()]} ${d} ${MESES[m - 1]}`;
}
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

export default function FichaReserva({ reserva, onCerrar, onChanged }) {
  const [f, setF] = useState(null);
  const [error, setError] = useState("");
  const [cambio, setCambio] = useState("");
  const [ocupado, setOcupado] = useState("");
  const [pestana, setPestana] = useState("resumen");
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
  const cancelada = reserva.estado === "CANCELADA";
  const pendientePago = reserva.estado === "PENDIENTE_PAGO";
  const pagada = !!f?.pagado_en;
  const pasada = f ? new Date(`${f.fecha}T${f.hora_inicio}:00-05:00`).getTime() < ahora : false;
  const conFormulario = !!f?.formulario?.actualizado_en;
  const conNotas = !!f?.notas.texto;
  const enviado = inf?.estado === "ENVIADO";
  const sinInforme = inf?.estado === "DESCARTADO";
  const borrador = inf?.estado === "BORRADOR";
  const cotizaciones = f?.cotizaciones || [];
  const enviadas = cotizaciones.filter((q) => q.estado === "enviado");
  const cotizar = f ? `/backoffice/presupuesto?${new URLSearchParams({ cliente: f.cotizar.cliente, correo: f.cotizar.correo, concepto: f.cotizar.concepto, importe: f.cotizar.importe, reserva: String(reserva.id_reserva) })}` : "#";

  // Qué toca ahora: una frase y UNA acción principal (va fija abajo).
  let siguiente = "";
  let principal = null;
  if (f) {
    if (cancelada) siguiente = reserva.cancelada_por === "INSPIRA" ? "Cancelada por Inspira: ofrecer nuevo horario o devolver." : "La reserva está cancelada.";
    else if (pendientePago) { siguiente = "Falta confirmar el pago."; principal = <ConfirmarPagoBtn reserva={reserva} onChanged={cambiado} className={BOTON.exito} />; }
    else if (!pasada) {
      siguiente = conFormulario ? "Todo listo para la reunión." : "Esperando su formulario previo.";
      if (reserva.meet_url) principal = <a href={reserva.meet_url} target="_blank" rel="noopener noreferrer" className={BOTON.principal}><Icono nombre="video" size={16} />Unirse a la reunión</a>;
    } else if (!conNotas && !sinInforme && !enviado) { siguiente = "Esperando las notas de Gemini."; principal = <button type="button" onClick={() => setPestana("informe")} className={BOTON.principal}>Ver notas e informe</button>; }
    else if (borrador) { siguiente = "Revise el informe y envíelo al asesorado."; principal = <button type="button" onClick={() => setPestana("informe")} className={BOTON.principal}>Revisar el informe</button>; }
    else if (!inf.estado) siguiente = "Clawsito está redactando el informe.";
    else if (!enviadas.length) { siguiente = enviado ? "Informe enviado: prepare la cotización." : "Prepare la cotización si corresponde."; principal = <a href={cotizar} className={BOTON.principal}><Icono nombre="euro" size={16} />Preparar cotización</a>; }
    else siguiente = "Cotización enviada: queda esperar su respuesta.";
  }
  const whatsappPie = reserva.whatsapp_url && !cancelada
    ? <a href={reserva.whatsapp_url} target="_blank" rel="noopener noreferrer" className={`${BOTON.whatsapp} !flex-none`} aria-label="Enviar por WhatsApp"><Icono nombre="whatsapp" size={18} />{principal ? "" : "WhatsApp"}</a>
    : null;

  const chipEstado = cancelada ? <Chip tono="mal">Cancelada</Chip>
    : pendientePago ? <Chip tono="ojo">Pago pendiente</Chip>
    : reserva.no_asistio_en ? <Chip tono="mal">No asistió</Chip>
    : <Chip tono="ok">Confirmada</Chip>;

  const pestanas = [
    { id: "resumen", texto: "Resumen" },
    { id: "asesorado", texto: "Asesorado" },
    { id: "informe", texto: "Informe" },
    { id: "cotizacion", texto: "Cotización", n: cotizaciones.length || null },
    { id: "acciones", texto: "Acciones" },
  ];

  return (
    <Hoja
      etiqueta={`Reserva de ${reserva.cliente?.nombre || "asesorado"}`}
      onCerrar={onCerrar}
      cabecera={{
        eyebrow: `Reserva N.° ${reserva.id_reserva}`,
        titulo: reserva.cliente?.nombre || reserva.cliente?.email_contacto || "Sin nombre",
        subtitulo: `${fechaLarga(reserva.fecha)} · ${reserva.hora_inicio} (hora Perú)`,
        chips: <>{chipEstado}{f && <Chip tono="info">{f.monto} {f.moneda}</Chip>}{reserva.metodo_pago === "EQUIPO" && <Chip>Agendada por el equipo</Chip>}</>,
        contacto: (
          <>
            {reserva.meet_url && !cancelada && <Contacto href={reserva.meet_url} icono="video" texto="Meet" />}
            {reserva.whatsapp_url && <Contacto href={reserva.whatsapp_url} icono="whatsapp" texto="WhatsApp" />}
            {f?.cliente?.email && <Contacto href={`mailto:${f.cliente.email}`} icono="chat" texto="Correo" />}
          </>
        ),
      }}
      pestanas={pestanas}
      pestana={pestana}
      onPestana={setPestana}
      pie={principal || whatsappPie ? <>{principal}{whatsappPie}</> : null}
    >
      {error && <p className="rounded-xl bg-red-50 p-3 text-[13px] text-red-700">{error}</p>}
      {!f && !error && <p className="p-10 text-center text-[13px] text-[#4f6672]">Cargando…</p>}

      {f && pestana === "resumen" && (
        <>
          <Seccion titulo="Qué sigue">
            <p className="text-[16px] font-bold text-primary-dark">{siguiente}</p>
            <div className="mt-4">
              <Progreso pasos={[
                { texto: "Pago", hecho: pagada },
                { texto: "Formulario", hecho: conFormulario },
                { texto: "Reunión", hecho: pasada && !cancelada },
                { texto: "Informe", hecho: enviado || sinInforme },
                { texto: "Cotización", hecho: enviadas.length > 0 },
              ]} />
            </div>
          </Seccion>
          <Seccion titulo="La cita">
            <Datos>
              <Dato k="Fecha" v={`${fechaLarga(f.fecha)} · ${f.hora_inicio}`} />
              <Dato k="Interés" v={f.interes} />
              <Dato k="Importe" v={`${f.monto} ${f.moneda}`} />
              <Dato k="Pago" v={pagada ? `confirmado ${cuando(f.pagado_en)}` : f.metodo_pago === "EQUIPO" ? "se coordina aparte" : "pendiente"} />
              <Dato k="Quiere empezar" v={f.inicio} />
              <Dato k="Lo que contó al reservar" v={f.detalle} ancho />
            </Datos>
            {Number(f.recargo) > 0 && <p className="mt-3 rounded-xl bg-neutral-50 p-2.5 text-[12.5px] text-[#4f6672]">Incluye {f.recargo} de comisión de tarjeta; sin tarjeta son {(Number(f.monto) - Number(f.recargo)).toFixed(2)} {f.moneda}.</p>}
          </Seccion>
        </>
      )}

      {f && pestana === "asesorado" && (
        <>
          <Seccion titulo="Contacto">
            <Datos>
              <Dato k="Correo" v={f.cliente.email} ancho />
              <Dato k="Celular" v={f.cliente.telefono} />
              <Dato k="Política aceptada" v={f.terminos.aceptados_en ? `${f.terminos.version} · ${cuando(f.terminos.aceptados_en)}` : "sin registro (anterior al 03/11)"} ancho />
            </Datos>
          </Seccion>
          <Seccion titulo="Formulario previo" extra={conFormulario ? `completado ${cuando(f.formulario.actualizado_en)}` : "sin completar"}>
            {f.formulario ? (
              <Datos>
                {Object.entries(ETIQUETAS).map(([k, et]) => <Dato key={k} k={et} v={texto(f.formulario[k])} ancho />)}
                {Object.entries(VISA_ETIQ).map(([k, et]) => <Dato key={k} k={et} v={texto(f.formulario.visa?.[k])} ancho />)}
              </Datos>
            ) : <p className="text-[#4f6672]">Aún no respondió. Puede reenviárselo desde la pestaña Acciones.</p>}
          </Seccion>
        </>
      )}

      {f && pestana === "informe" && (
        <>
          <Seccion titulo="Notas de Gemini" extra={conNotas ? `recogidas ${cuando(f.notas.obtenidas_en)}` : ""}>
            {conNotas ? (
              <details className="group">
                <summary className="flex min-h-[44px] cursor-pointer list-none items-center justify-between font-semibold text-primary [&::-webkit-details-marker]:hidden">
                  Ver las notas completas <span aria-hidden className="transition-transform group-open:rotate-180">▾</span>
                </summary>
                <div className="mt-2 max-h-80 overflow-y-auto whitespace-pre-wrap rounded-xl bg-neutral-50 p-3 text-[13px] leading-relaxed">{f.notas.texto}</div>
                {f.notas.url && <a href={f.notas.url} target="_blank" rel="noopener noreferrer" className="mt-2 inline-block font-bold text-primary underline">Abrir el documento original</a>}
              </details>
            ) : (
              <>
                <p className="text-[#4f6672]">Gemini las deja unos minutos después de la reunión y Core las recoge solo.</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <button type="button" disabled={!!ocupado} onClick={() => accion("notas", "notas", {}, "Notas recogidas.")} className={BOTON.secundario}>{ocupado === "notas" ? "Buscando…" : "Traer las notas ahora"}</button>
                  {!enviado && !sinInforme && <button type="button" disabled={!!ocupado} onClick={() => accion("sininf", "sin-informe", {}, "Listo: esta cita queda sin informe.")} className={BOTON.suave}>No se grabó: sin informe</button>}
                </div>
              </>
            )}
          </Seccion>
          <Seccion titulo="Informe de la asesoría" extra={sinInforme ? "sin informe" : enviado ? "enviado" : borrador ? "por aprobar" : conNotas ? "en cola" : "—"}>
            {inf.tema && <p className="mb-1 text-[15px] font-bold">{inf.tema}</p>}
            {inf.conclusion && <p className="mb-3 leading-relaxed text-neutral-700">{inf.conclusion}</p>}
            {inf.por_confirmar.length > 0 && (
              <div className="mb-3 rounded-xl bg-amber-50 p-3 ring-1 ring-amber-200">
                <p className="mb-1 text-[12px] font-bold text-amber-900">Clawsito marcó por confirmar</p>
                <ul className="list-disc pl-4 text-[13px] text-amber-950">{inf.por_confirmar.map((p, i) => <li key={i}>{p}</li>)}</ul>
              </div>
            )}
            {!inf.estado && !conNotas && <p className="text-[#4f6672]">Cuando lleguen las notas, Clawsito lo redacta y le llega a administración para su visto bueno.</p>}
            <div className="flex flex-wrap gap-2"><InformeBtns reserva={{ ...reserva, informe_estado: inf.estado }} onChanged={cambiado} /></div>
            {!enviado && !sinInforme && conNotas && (
              <div className="mt-3 rounded-xl bg-neutral-50 p-3">
                {inf.pedido && <p className="mb-2 rounded-lg bg-sky-50 p-2.5 text-[12.5px] text-sky-900">Pedido a Clawsito: «{inf.pedido}». Lo rehace en su próxima pasada (hasta 10 min).</p>}
                <label className="mb-1 block text-[12px] font-bold text-[#4f6672]" htmlFor="rv-cambio">{inf.estado ? "¿Qué debe cambiar?" : "¿Algo que deba tener en cuenta al redactarlo?"}</label>
                <textarea id="rv-cambio" value={cambio} onChange={(e) => setCambio(e.target.value)} rows={3} maxLength={600} placeholder="Ej.: añade la beca Carolina y baja el presupuesto a 1 500 €"
                  className="w-full rounded-xl border border-neutral-300 bg-white p-3 text-[14px]" />
                <button type="button" disabled={!!ocupado || !cambio.trim()} onClick={() => accion("rehacer", "informe/rehacer", { instruccion: cambio }, "Pedido enviado a Clawsito.").then(() => setCambio(""))}
                  className={`${BOTON.principal} mt-2`}>{ocupado === "rehacer" ? "Enviando…" : inf.estado ? "Pedir cambios a Clawsito" : "Pedir el informe con esta nota"}</button>
              </div>
            )}
          </Seccion>
        </>
      )}

      {f && pestana === "cotizacion" && (
        <Seccion titulo="Cotización" extra={enviadas.length ? "enviada" : cotizaciones.length ? "en borrador" : "sin cotizar"}>
          {cotizaciones.length > 0 && (
            <ul className="mb-3 grid gap-2">
              {cotizaciones.map((q) => (
                <li key={q.id_presupuesto} className="flex items-center justify-between gap-3 rounded-xl bg-neutral-50 p-3">
                  <span className="min-w-0"><strong>{q.numero || "Sin número"}</strong><span className="block text-[12.5px] text-[#4f6672]">{q.texto} · {q.estado === "enviado" ? `enviada ${cuando(q.enviado_at)}` : q.estado}</span></span>
                  <a href={`/backoffice/presupuesto?abrir=${q.id_presupuesto}`} className={BOTON.secundario}>Abrir</a>
                </li>
              ))}
            </ul>
          )}
          {(f.cotizaciones_por_correo || []).length > 0 && (
            <div className="mb-3 rounded-xl bg-sky-50 p-3 ring-1 ring-sky-200">
              <p className="mb-1 text-[12px] font-bold text-sky-900">Cotizaciones a su correo sin vincular</p>
              {f.cotizaciones_por_correo.map((q) => (
                <div key={q.id_presupuesto} className="flex items-center justify-between gap-2 py-1 text-[13px]">
                  <span>{q.numero || "Sin número"} · {q.texto}</span>
                  <button type="button" disabled={!!ocupado} onClick={() => accion(`v${q.id_presupuesto}`, "vincular-cotizacion", { id_presupuesto: q.id_presupuesto }, "Cotización vinculada.")} className="min-h-[44px] font-bold text-primary underline">Vincular</button>
                </div>
              ))}
            </div>
          )}
          <p className="text-[#4f6672]">Se abre con su nombre y correo{f.interes ? `, el interés (${f.interes})` : ""}{f.cotizar.importe ? " y el paquete que propone el informe" : ""}, y queda ligada a esta cita.</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <a href={cotizar} className={BOTON.principal}><Icono nombre="euro" size={16} />Preparar cotización</a>
            <button type="button" disabled={!!ocupado} className={BOTON.suave}
              onClick={async () => { if (await dialog.confirm("¿Cerrar este contacto sin seguimiento? No habrá informe ni cotización y el lead se descarta.", "Cerrar sin seguimiento")) accion("cerrar", "sin-informe", { cerrar: true, motivo: "Sin seguimiento: contactará si necesita otra asesoría" }, "Contacto cerrado sin seguimiento."); }}>
              Cerrar sin seguimiento
            </button>
          </div>
        </Seccion>
      )}

      {f && pestana === "acciones" && (
        <>
          <Seccion titulo="Pago y reunión">
            <div className="flex flex-wrap gap-2">
              {pendientePago && <ConfirmarPagoBtn reserva={reserva} onChanged={cambiado} className={BOTON.exito} />}
              {f.metodo_pago === "EQUIPO" && !pagada && (
                <button type="button" disabled={!!ocupado} onClick={() => accion("pago", "pago-recibido", {}, "Pago anotado.")} className={BOTON.exito}>{ocupado === "pago" ? "Anotando…" : "Anotar pago recibido"}</button>
              )}
              <VerVoucherBtn reserva={reserva} className={BOTON.secundario} />
              {!f.meet_url && !cancelada && <EditMeetBtn reserva={reserva} onChanged={cambiado} className={BOTON.secundario} />}
              {!cancelada && <CancelBtn reserva={reserva} onChanged={() => { onChanged?.(); onCerrar(); }} className={BOTON.peligro} />}
            </div>
          </Seccion>
          <Seccion titulo="Avisos y cambios de la cita">
            <GruposAcciones reserva={reserva} onChanged={cambiado} sinOtras />
          </Seccion>
        </>
      )}
    </Hoja>
  );
}
