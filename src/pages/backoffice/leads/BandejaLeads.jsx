// Bandeja de leads en dos grupos (03/11/2026):
//   · Oportunidades: ya pasaron (o van a pasar) por una asesoría → cerrar: informe, cotización, seguimiento.
//   · Por convertir: llenaron un formulario, calculadora, mapa… → que reserven la asesoría.
// Una lista ordenada por urgencia, con lo que toca hacer en una frase y botones grandes: WhatsApp
// con el mensaje ya escrito (queda anotado el contacto), cambiar de etapa con un toque (sin
// arrastrar), abrir la cita o preparar la cotización. El cálculo vive en el backend (leads.bandeja.js).
import { useMemo, useState } from "react";
import { boPATCH, boPOST } from "../../../services/backofficeApi";
import { dialog } from "../../../services/dialogService";
import Icono from "../../../components/common/Icono";
import FichaReserva from "../agenda/mi-calendario/FichaReserva";
import { ETAPAS, haceCuanto } from "./leadsComun";

const GRUPOS = {
  oportunidades: [
    { u: 3, titulo: "Para hoy", ayuda: "Informes, cotizaciones y seguimientos que no deben esperar." },
    { u: 2, titulo: "Pronto", ayuda: "Asesorías de las próximas 24 horas y seguimientos por retomar." },
    { u: 1, titulo: "En curso", ayuda: "Asesorías agendadas y cotizaciones recién enviadas." },
    { u: 0, titulo: "Esperando respuesta", ayuda: "Ya se hizo el seguimiento.", plegado: true },
  ],
  convertir: [
    { u: 3, titulo: "Para hoy", ayuda: "Llegaron hace menos de una semana y nadie les escribió, o separaron horario sin pagar." },
    { u: 2, titulo: "Pronto", ayuda: "Invitados o contactados que todavía no reservan." },
    { u: 1, titulo: "Tibios", ayuda: "Entraron hace más de una semana.", plegado: true },
    { u: 0, titulo: "Fríos y esperando", ayuda: "Más de un mes sin contacto, o recién invitados.", plegado: true },
  ],
};

const MOTIVOS = ["No le alcanza el presupuesto", "Eligió otra opción", "Lo pensará más adelante", "No responde", "No califica para el servicio", "Contactará si necesita otra asesoría"];
const BTN = "inline-flex min-h-[44px] items-center justify-center gap-1.5 rounded-xl px-3.5 text-[13px] font-bold disabled:opacity-50";

function HojaEtapa({ lead, onCerrar, onHecho }) {
  const [descartar, setDescartar] = useState(false);
  const [motivo, setMotivo] = useState("");
  const [guardando, setGuardando] = useState(false);
  async function guardar(etapa, m) {
    setGuardando(true);
    const r = await boPATCH(`/backoffice/leads/${lead.id_lead}`, { etapa, ...(m ? { motivo_descarte: m } : {}) });
    setGuardando(false);
    if (r?.ok === false) return dialog.toast(r.msg || "No se pudo cambiar la etapa", "error");
    dialog.toast("Etapa actualizada.", "success");
    onHecho();
  }
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/45 sm:items-center" onClick={onCerrar}>
      <div role="dialog" aria-modal="true" aria-label={`Cambiar etapa de ${lead.nombre || "este lead"}`}
        className="w-full max-w-md rounded-t-3xl bg-white p-4 pb-[max(16px,env(safe-area-inset-bottom))] shadow-2xl sm:rounded-3xl" onClick={(e) => e.stopPropagation()}>
        <div className="mx-auto mb-3 h-1.5 w-10 rounded-full bg-neutral-200 sm:hidden" aria-hidden />
        <h3 className="text-[16px] font-bold text-primary-dark">{descartar ? "¿Por qué no avanza?" : "Mover a otra etapa"}</h3>
        <p className="mt-0.5 text-[12.5px] text-neutral-600">{lead.nombre || lead.email}</p>
        {!descartar ? (
          <div className="mt-3 grid gap-2">
            {ETAPAS.map((e) => (
              <button key={e.valor} type="button" disabled={guardando || e.valor === lead.etapa}
                onClick={() => (e.valor === "DESCARTADO" ? setDescartar(true) : guardar(e.valor))}
                className={`${BTN} justify-between border text-left ${e.valor === lead.etapa ? "border-primary bg-primary/5 text-primary" : "border-neutral-200 bg-white text-neutral-800 hover:bg-neutral-50"}`}>
                <span className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full" style={{ background: e.color }} aria-hidden />{e.etiqueta}</span>
                {e.valor === lead.etapa && <span className="text-[11px] font-semibold">actual</span>}
              </button>
            ))}
          </div>
        ) : (
          <div className="mt-3 grid gap-2">
            {MOTIVOS.map((m) => (
              <button key={m} type="button" onClick={() => setMotivo(m)} aria-pressed={motivo === m}
                className={`${BTN} justify-start border ${motivo === m ? "border-primary bg-primary text-white" : "border-neutral-200 bg-white text-neutral-800"}`}>{m}</button>
            ))}
            <div className="mt-1 flex gap-2">
              <button type="button" onClick={() => setDescartar(false)} className={`${BTN} flex-1 border border-neutral-200 bg-white text-neutral-700`}>Volver</button>
              <button type="button" disabled={!motivo || guardando} onClick={() => guardar("DESCARTADO", motivo)} className={`${BTN} flex-1 bg-red-600 text-white`}>Descartar</button>
            </div>
          </div>
        )}
        <button type="button" onClick={onCerrar} className={`${BTN} mt-3 w-full bg-neutral-100 text-neutral-700`}>Cerrar</button>
      </div>
    </div>
  );
}

function Tarjeta({ item: i, grupo, onAbrir, onRecargar, puedeEditar }) {
  const [hoja, setHoja] = useState(false);
  const [cita, setCita] = useState(false);
  const urgente = i.urgencia === 3;
  const cotizar = `/backoffice/presupuesto?${new URLSearchParams({ cliente: i.nombre || "", correo: i.email || "", ...(i.reserva ? { reserva: String(i.reserva.id_reserva) } : {}) })}`;
  const anotar = () => {
    if (!puedeEditar) return;
    boPOST(`/backoffice/leads/${i.id_lead}/${grupo === "convertir" ? "invitar" : "seguimiento"}`, {}).then((r) => { if (r?.ok) onRecargar(); });
  };
  const sinCotizar = grupo === "oportunidades" && i.reserva && !i.cotizacion && /cotización/i.test(i.sigue);

  return (
    <article className={`rounded-2xl border bg-white p-3.5 shadow-sm ${urgente ? "border-l-4 border-l-[#FA943A] border-neutral-200" : "border-neutral-200"}`}>
      <button type="button" onClick={() => onAbrir(i.id_lead)} className="block w-full text-left">
        <div className="flex items-start justify-between gap-2">
          <h3 className="min-w-0 truncate text-[15px] font-bold text-neutral-900">{i.nombre || i.email || `Lead #${i.id_lead}`}</h3>
          <span className="shrink-0 rounded-full bg-neutral-100 px-2.5 py-1 text-[11px] font-bold text-neutral-700">{i.paso}</span>
        </div>
        <p className={`mt-1 text-[13.5px] font-semibold ${urgente ? "text-[#9a4a06]" : "text-primary-dark"}`}>{i.sigue}</p>
        <p className="mt-1 truncate text-[12px] text-neutral-600">
          {[i.servicio_interes, i.origen_txt, i.cotizacion ? `${i.cotizacion.numero || "cotización"} · ${i.cotizacion.texto}` : null, `entró ${haceCuanto(i.created_at)}`].filter(Boolean).join(" · ")}
        </p>
      </button>
      <div className="mt-3 flex flex-wrap gap-2">
        {i.whatsapp_url && (
          <a href={i.whatsapp_url} target="_blank" rel="noopener noreferrer" onClick={anotar} className={`${BTN} bg-[#25D366] text-white`}>
            <Icono nombre="whatsapp" size={16} />{grupo === "convertir" ? (i.paso === "Separó horario" ? "Recordar el pago" : "Invitar a reservar") : "Hacer seguimiento"}
          </a>
        )}
        {i.reserva && <button type="button" onClick={() => setCita(true)} className={`${BTN} bg-primary text-white`}><Icono nombre="calendario" size={16} />Abrir la cita</button>}
        {sinCotizar && <a href={cotizar} className={`${BTN} bg-primary-dark text-white`}><Icono nombre="euro" size={16} />Cotizar</a>}
        {puedeEditar && <button type="button" onClick={() => setHoja(true)} className={`${BTN} border border-neutral-200 bg-white text-neutral-700`}>Cambiar etapa</button>}
      </div>
      {hoja && <HojaEtapa lead={i} onCerrar={() => setHoja(false)} onHecho={() => { setHoja(false); onRecargar(); }} />}
      {cita && (
        <FichaReserva
          reserva={{ ...i.reserva, cliente: { nombre: i.nombre, email_contacto: i.email }, whatsapp_url: null }}
          onCerrar={() => setCita(false)} onChanged={onRecargar} />
      )}
    </article>
  );
}

export default function BandejaLeads({ grupo, datos, onAbrir, onRecargar, puedeEditar }) {
  const [buscar, setBuscar] = useState("");
  const lista = useMemo(() => {
    const t = buscar.trim().toLowerCase();
    const todos = datos?.[grupo] || [];
    return t ? todos.filter((i) => [i.nombre, i.email, i.whatsapp, i.servicio_interes].some((x) => String(x || "").toLowerCase().includes(t))) : todos;
  }, [datos, grupo, buscar]);

  if (!datos) return <p className="p-8 text-center text-[13px] text-neutral-600">Cargando…</p>;

  return (
    <div className="grid gap-4">
      <label className="block">
        <span className="sr-only">Buscar</span>
        <input type="search" value={buscar} onChange={(e) => setBuscar(e.target.value)} placeholder="Buscar por nombre, correo o WhatsApp"
          className="min-h-[44px] w-full rounded-xl border border-neutral-300 bg-white px-3.5 text-[14px] text-neutral-900 placeholder:text-neutral-500 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20" />
      </label>
      {lista.length === 0 && (
        <p className="rounded-2xl bg-white p-6 text-center text-[13px] text-neutral-600 shadow-sm">
          {grupo === "oportunidades" ? "No hay oportunidades abiertas. Cuando alguien reserve su asesoría, aparece aquí." : "No hay interesados por convertir."}
        </p>
      )}
      {GRUPOS[grupo].map((g) => {
        const items = lista.filter((i) => i.urgencia === g.u);
        if (!items.length) return null;
        const contenido = (
          <div className="mt-2 grid gap-2.5">
            {items.slice(0, 80).map((i) => <Tarjeta key={i.id_lead} item={i} grupo={grupo} onAbrir={onAbrir} onRecargar={onRecargar} puedeEditar={puedeEditar} />)}
            {items.length > 80 && <p className="text-center text-[12px] text-neutral-600">… y {items.length - 80} más: use el buscador o la vista Tablero.</p>}
          </div>
        );
        const cab = (
          <>
            <span className="text-[15px] font-bold text-primary-dark">{g.titulo}</span>
            <span className="ml-2 rounded-full bg-primary/10 px-2 py-0.5 text-[12px] font-bold text-primary">{items.length}</span>
            <span className="mt-0.5 block text-[12px] font-normal text-neutral-600">{g.ayuda}</span>
          </>
        );
        return g.plegado && !buscar ? (
          <details key={g.u} className="group">
            <summary className="flex cursor-pointer list-none items-start justify-between rounded-xl px-1 py-1 [&::-webkit-details-marker]:hidden">
              <span>{cab}</span><span className="text-neutral-500 transition-transform group-open:rotate-180" aria-hidden>▾</span>
            </summary>
            {contenido}
          </details>
        ) : (
          <section key={g.u} aria-label={g.titulo}><h2 className="px-1">{cab}</h2>{contenido}</section>
        );
      })}
    </div>
  );
}
