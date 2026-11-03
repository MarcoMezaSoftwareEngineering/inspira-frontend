// «Mis asesorías»: el historial de sus citas con Inspira — fecha, enlace de la reunión,
// formulario previo y el informe cuando ya se le envió. Datos: GET /cliente/asesorias
// (los pide PanelCliente). La pestaña solo existe si tiene alguna.
import { useState } from "react";
import { abrirArchivo } from "../../../services/archivos";
import { whatsappUrl } from "../../../config/contacto";

const ESTADO = {
  CONFIRMADA: { texto: "Confirmada", clase: "bg-emerald-50 text-emerald-700" },
  COMPLETADA: { texto: "Realizada", clase: "bg-sky-50 text-sky-700" },
  PENDIENTE_PAGO: { texto: "Por pagar", clase: "bg-amber-50 text-amber-700" },
  CANCELADA: { texto: "Cancelada", clase: "bg-neutral-100 text-neutral-500" },
};

const MESES = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];
function fechaLarga(f) {
  const [y, m, d] = String(f).split("-").map(Number);
  return `${d} ${MESES[m - 1]} ${y}`;
}

function Tarjeta({ a }) {
  const [abriendo, setAbriendo] = useState(false);
  const est = ESTADO[a.estado] || ESTADO.CONFIRMADA;
  async function verInforme() {
    setAbriendo(true);
    try { await abrirArchivo(`/cliente/asesorias/${a.id_reserva}/informe.pdf`, { nombre: "Informe-de-asesoria.pdf" }); }
    finally { setAbriendo(false); }
  }
  const enlace = "inline-flex items-center rounded-full border border-neutral-200 bg-white px-3 py-1.5 text-[12px] font-semibold text-primary hover:bg-neutral-50";
  return (
    <article className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <h3 className="font-semibold text-neutral-900">{a.servicio}</h3>
          <p className="text-[13px] text-neutral-500">{fechaLarga(a.fecha)} · {a.hora_inicio}–{a.hora_fin} (hora Perú){a.presencial ? " · presencial" : ""}</p>
        </div>
        <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${est.clase}`}>{est.texto}</span>
      </div>
      {(a.interes || a.inicio) && (
        <p className="mt-2 text-[13px] text-neutral-600">
          {a.interes && <>Interés: <strong>{a.interes}</strong></>}{a.interes && a.inicio ? " · " : ""}{a.inicio && <>Inicio: <strong>{a.inicio}</strong></>}
        </p>
      )}
      {a.detalle && <p className="mt-1 text-[13px] text-neutral-500">«{a.detalle}»</p>}
      <div className="mt-3 flex flex-wrap gap-2">
        {a.meet_url && a.estado === "CONFIRMADA" && <a href={a.meet_url} target="_blank" rel="noopener noreferrer" className={`${enlace} !bg-primary !text-white !border-primary`}>Entrar a la reunión</a>}
        {a.formulario && <a href={a.formulario.url} className={enlace}>{a.formulario.completado ? "Ver o editar mi formulario previo" : "Completar formulario previo"}</a>}
        {a.informe?.disponible && <button type="button" onClick={verInforme} disabled={abriendo} className={enlace}>{abriendo ? "Abriendo…" : "Ver mi informe"}</button>}
        {a.gestion_url && <a href={a.gestion_url} className={enlace}>{a.estado === "PENDIENTE_PAGO" ? "Completar mi reserva" : "Reprogramar o gestionar"}</a>}
      </div>
    </article>
  );
}

export default function MisAsesorias({ datos }) {
  const lista = datos?.asesorias || [];
  return (
    <div className="grid gap-3 max-w-3xl">
      <p className="text-[13px] text-neutral-500">
        Aquí queda el historial de sus asesorías con Inspira Legal: los datos que nos dio, el enlace de la reunión y, cuando se lo enviamos, su informe.{" "}
        <a href={whatsappUrl("Hola, tengo una consulta sobre mis asesorías.")} target="_blank" rel="noopener noreferrer" className="font-semibold text-primary underline">Escríbanos por WhatsApp</a>.
      </p>
      {lista.length === 0 ? <p className="text-[13px] text-neutral-400">Todavía no tiene asesorías.</p> : lista.map((a) => <Tarjeta key={a.id_reserva} a={a} />)}
    </div>
  );
}
