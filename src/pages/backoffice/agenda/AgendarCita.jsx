// Agendar una cita a mano desde Agenda → Reservas.
// Va por el mismo camino que las que agenda Clawsito: evento en Google Calendar con Meet
// (o la dirección, si es presencial), invitación de Google al asesorado, cupos de /reservar
// cerrados, ficha en Reservas, lead, formulario previo y confirmación con la marca.
// Los horarios libres de /reservar salen como atajo, pero se puede escribir cualquier hora.
import { useEffect, useState } from "react";
import { boPOST } from "../../../services/backofficeApi";
import { apiGET } from "../../../services/api";
import { dialog } from "../../../services/dialogService";
import { Hoja, Seccion } from "../crm/kit";
import { BOTON } from "../crm/estilos";

const SERVICIOS = [
  { id: "sesion-diagnostico", texto: "Sesión diagnóstico", detalle: "30 min · online" },
  { id: "asesoria-ampliada", texto: "Asesoría ampliada", detalle: "1 hora · online" },
  { id: "sesion-presencial", texto: "Asesoría presencial", detalle: "1 hora · oficina de San Isidro" },
];

const PAGOS = [
  { id: "pendiente", texto: "Pagará después", detalle: "Lo anotas con «Anotar pago recibido»" },
  { id: "pagado", texto: "Ya pagó", detalle: "Tarjeta o transferencia fuera de la web" },
  { id: "cortesia", texto: "Cortesía", detalle: "Sin costo" },
];

const hoyLima = () => new Intl.DateTimeFormat("en-CA", { timeZone: "America/Lima" }).format(new Date());
const CAMPO = "w-full min-h-[44px] rounded-xl border border-neutral-300 bg-white px-3 text-[14px] text-neutral-900 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20";

function Opcion({ activa, onClick, texto, detalle }) {
  return (
    <button type="button" onClick={onClick} aria-pressed={activa}
      className={`min-h-[44px] rounded-xl border px-3 py-2 text-left transition-colors ${activa ? "border-primary-dark bg-primary-dark text-white" : "border-neutral-300 bg-white text-neutral-800 hover:border-primary"}`}>
      <span className="block text-[13.5px] font-bold">{texto}</span>
      {detalle && <span className={`block text-[11.5px] ${activa ? "text-white/75" : "text-[#4f6672]"}`}>{detalle}</span>}
    </button>
  );
}

function Etiqueta({ texto, children }) {
  return (
    <label className="grid gap-1">
      <span className="text-[12px] font-semibold text-[#4f6672]">{texto}</span>
      {children}
    </label>
  );
}

export default function AgendarCita({ onCerrar, onAgendada }) {
  const [f, setF] = useState({
    servicio_id: "sesion-diagnostico", fecha: "", hora: "", nombre: "", email: "", telefono: "",
    pago: "pendiente", nota: "", enviarCorreos: true,
  });
  const [libres, setLibres] = useState({}); // { "AAAA-MM-DD": ["17:30", …] } del servicio elegido
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState("");
  const [ocupado, setOcupado] = useState(false);
  const set = (k) => (v) => { setError(""); setOcupado(false); setF((p) => ({ ...p, [k]: v })); };

  // Horarios libres de /reservar para el servicio elegido (solo de atajo).
  useEffect(() => {
    let vivo = true;
    apiGET(`/api/reservas/disponibilidad?servicio=${f.servicio_id}`)
      .then((r) => {
        if (!vivo || !r?.ok) return;
        const mapa = {};
        (r.dias || []).forEach((d) => { mapa[d.fecha] = (d.slots || []).map((s) => s.hora_inicio); });
        setLibres(mapa);
      })
      .catch(() => {});
    return () => { vivo = false; };
  }, [f.servicio_id]);

  const proximosDias = Object.keys(libres).filter((d) => libres[d].length).sort().slice(0, 8);
  const horasDelDia = f.fecha ? libres[f.fecha] || [] : [];
  const correoOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email.trim());
  const listo = f.nombre.trim().length >= 2 && correoOk && f.fecha && /^\d{2}:\d{2}$/.test(f.hora);
  const fueraDeHorario = f.fecha && f.hora && !horasDelDia.includes(f.hora);

  async function agendar(forzar = false) {
    if (!listo || enviando) return;
    setEnviando(true);
    setError("");
    try {
      const r = await boPOST("/backoffice/agenda/reservas/manual", { ...f, forzar });
      if (r?.ok) {
        dialog.toast(r.aviso || "Cita agendada. Google le envió la invitación.", r.aviso ? "warning" : "success");
        onAgendada?.(r);
        onCerrar?.();
        return;
      }
      setOcupado(Boolean(r?.ocupado));
      setError(r?.msg || "No se pudo agendar la cita.");
    } catch {
      setError("Error de conexión.");
    } finally {
      setEnviando(false);
    }
  }

  const fechaLarga = f.fecha
    ? new Date(`${f.fecha}T12:00:00-05:00`).toLocaleDateString("es-PE", { weekday: "long", day: "numeric", month: "long", timeZone: "America/Lima" })
    : "";

  return (
    <Hoja
      etiqueta="Agendar cita"
      onCerrar={onCerrar}
      cabecera={{
        eyebrow: "Agenda · cita manual",
        titulo: f.nombre.trim() || "Nueva cita",
        subtitulo: f.fecha && f.hora ? `${fechaLarga} · ${f.hora} (hora de Lima)` : "Elige servicio, día y hora",
      }}
      pie={
        ocupado ? (
          <>
            <button type="button" className={BOTON.secundario} onClick={() => setOcupado(false)}>Cambiar la hora</button>
            <button type="button" className={BOTON.principal} disabled={enviando} onClick={() => agendar(true)}>
              {enviando ? "Agendando…" : "Agendar igual"}
            </button>
          </>
        ) : (
          <button type="button" className={BOTON.principal} disabled={!listo || enviando} onClick={() => agendar(false)}>
            {enviando ? "Agendando…" : "Agendar cita"}
          </button>
        )
      }
    >
      <Seccion titulo="Servicio">
        <div className="grid gap-2 sm:grid-cols-3">
          {SERVICIOS.map((s) => (
            <Opcion key={s.id} activa={f.servicio_id === s.id} onClick={() => set("servicio_id")(s.id)} texto={s.texto} detalle={s.detalle} />
          ))}
        </div>
      </Seccion>

      <Seccion titulo="Día y hora">
        {proximosDias.length > 0 && (
          <div className="mb-3">
            <p className="mb-1.5 text-[12px] font-semibold text-[#4f6672]">Días con horario libre en /reservar</p>
            <div className="flex flex-wrap gap-1.5">
              {proximosDias.map((d) => (
                <button key={d} type="button" onClick={() => setF((p) => ({ ...p, fecha: d, hora: "" }))}
                  className={`min-h-[36px] rounded-full border px-3 text-[12.5px] font-semibold capitalize ${f.fecha === d ? "border-primary-dark bg-primary-dark text-white" : "border-neutral-300 bg-white text-neutral-800 hover:border-primary"}`}>
                  {new Date(`${d}T12:00:00-05:00`).toLocaleDateString("es-PE", { weekday: "short", day: "numeric", month: "short", timeZone: "America/Lima" })}
                </button>
              ))}
            </div>
          </div>
        )}
        <div className="grid grid-cols-2 gap-2">
          <Etiqueta texto="Día">
            <input type="date" className={CAMPO} min={hoyLima()} value={f.fecha} onChange={(e) => set("fecha")(e.target.value)} />
          </Etiqueta>
          <Etiqueta texto="Hora (Lima)">
            <input type="time" className={CAMPO} step={900} value={f.hora} onChange={(e) => set("hora")(e.target.value)} />
          </Etiqueta>
        </div>
        {horasDelDia.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {horasDelDia.map((h) => (
              <button key={h} type="button" onClick={() => set("hora")(h)}
                className={`min-h-[36px] rounded-full border px-3 text-[12.5px] font-semibold tabular-nums ${f.hora === h ? "border-primary-dark bg-primary-dark text-white" : "border-neutral-300 bg-white text-neutral-800 hover:border-primary"}`}>
                {h}
              </button>
            ))}
          </div>
        )}
        {fueraDeHorario && (
          <p className="mt-2 rounded-xl bg-amber-50 px-3 py-2 text-[12.5px] text-amber-800 ring-1 ring-amber-200">
            Esa hora no está entre los horarios libres de /reservar. Se puede agendar igual: se comprueba tu Google Calendar antes de crearla.
          </p>
        )}
      </Seccion>

      <Seccion titulo="Asesorado">
        <div className="grid gap-2">
          <Etiqueta texto="Nombre completo">
            <input className={CAMPO} value={f.nombre} onChange={(e) => set("nombre")(e.target.value)} autoComplete="off" />
          </Etiqueta>
          <div className="grid gap-2 sm:grid-cols-2">
            <Etiqueta texto="Correo (le llega la invitación)">
              <input type="email" className={CAMPO} value={f.email} onChange={(e) => set("email")(e.target.value)} autoComplete="off" />
            </Etiqueta>
            <Etiqueta texto="Celular (opcional)">
              <input type="tel" className={CAMPO} value={f.telefono} onChange={(e) => set("telefono")(e.target.value)} autoComplete="off" />
            </Etiqueta>
          </div>
          <Etiqueta texto="Motivo o nota (opcional; sale en la invitación)">
            <textarea className={`${CAMPO} min-h-[72px] py-2`} maxLength={300} value={f.nota} onChange={(e) => set("nota")(e.target.value)} />
          </Etiqueta>
        </div>
      </Seccion>

      <Seccion titulo="Pago">
        <div className="grid gap-2 sm:grid-cols-3">
          {PAGOS.map((p) => (
            <Opcion key={p.id} activa={f.pago === p.id} onClick={() => set("pago")(p.id)} texto={p.texto} detalle={p.detalle} />
          ))}
        </div>
        <label className="mt-3 flex min-h-[44px] items-center gap-2 text-[13px] text-neutral-800">
          <input type="checkbox" className="h-4 w-4" checked={f.enviarCorreos} onChange={(e) => set("enviarCorreos")(e.target.checked)} />
          Enviarle la confirmación y el formulario previo por correo
        </label>
      </Seccion>

      {error && (
        <div role="alert" className="rounded-xl bg-red-50 p-3 text-[13px] text-red-700 ring-1 ring-red-200">
          {error}
          {ocupado && <p className="mt-1 text-red-800">Si igual la vas a atender a esa hora, pulsa «Agendar igual».</p>}
        </div>
      )}
    </Hoja>
  );
}
