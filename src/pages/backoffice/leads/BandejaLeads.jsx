// Bandeja de leads en dos grupos (03/11/2026):
//   · Oportunidades: ya pasaron (o van a pasar) por una asesoría → cerrar: informe, cotización, seguimiento.
//   · Por convertir: llenaron un formulario, calculadora, mapa… → que reserven la asesoría.
// Una lista ordenada por urgencia, con lo que toca hacer en una frase y botones grandes: WhatsApp
// con el mensaje ya escrito (queda anotado el contacto), cambiar de etapa con un toque (sin
// arrastrar), abrir la cita o preparar la cotización. El cálculo vive en el backend (leads.bandeja.js).
import { useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { boPATCH, boPOST } from "../../../services/backofficeApi";
import { dialog } from "../../../services/dialogService";
import Icono from "../../../components/common/Icono";
import FichaReserva from "../agenda/mi-calendario/FichaReserva";
import { ETAPAS, haceCuanto } from "./leadsComun";
import { Avatar, Chip } from "../crm/kit";
import { BOTON } from "../crm/estilos";

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
  return createPortal(
    <div className="fixed inset-0 flex items-end justify-center bg-black/45 sm:items-center" style={{ zIndex: 2000 }} onClick={onCerrar}>
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
    </div>,
    document.body
  );
}

function Tarjeta({ item: i, grupo, onAbrir, onRecargar, puedeEditar }) {
  const [hoja, setHoja] = useState(false);
  const [cita, setCita] = useState(false);
  const urgente = i.urgencia === 3;
  const nombre = i.nombre || i.email || `Lead #${i.id_lead}`;
  const cotizar = `/backoffice/presupuesto?${new URLSearchParams({ cliente: i.nombre || "", correo: i.email || "", ...(i.reserva ? { reserva: String(i.reserva.id_reserva) } : {}) })}`;
  const anotar = () => {
    if (!puedeEditar) return;
    boPOST(`/backoffice/leads/${i.id_lead}/${grupo === "convertir" ? "invitar" : "seguimiento"}`, {}).then((r) => { if (r?.ok) onRecargar(); });
  };
  const sinCotizar = grupo === "oportunidades" && i.reserva && !i.cotizacion && /cotización/i.test(i.sigue);
  const textoWa = grupo === "convertir" ? (i.paso === "Separó horario" ? "Recordar pago" : "Invitar a reservar") : "Seguimiento";

  return (
    <article className={`rounded-2xl bg-white shadow-sm ring-1 ${urgente ? "ring-[#f4b98a]" : "ring-neutral-200/80"}`}>
      <button type="button" onClick={() => onAbrir(i.id_lead)} aria-label={`Abrir la ficha de ${nombre}`}
        className="flex w-full items-start gap-3 rounded-2xl p-3.5 text-left hover:bg-neutral-50/70">
        <Avatar nombre={nombre} tam={42} />
        <span className="min-w-0 flex-1">
          <span className="flex items-baseline justify-between gap-2">
            <span className="truncate text-[15px] font-bold text-neutral-900">{nombre}</span>
            <span className="shrink-0 text-[12px] text-[#4f6672]">{haceCuanto(i.created_at)}</span>
          </span>
          <span className={`mt-1 flex items-start gap-1.5 text-[13.5px] font-semibold leading-snug ${urgente ? "text-[#9a4a06]" : "text-primary-dark"}`}>
            {urgente && <span aria-hidden className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-[#FA943A]" />}{i.sigue}
          </span>
          <span className="mt-2 flex flex-wrap gap-1.5">
            <Chip tono={grupo === "oportunidades" ? "marca" : "neutro"}>{i.paso}</Chip>
            {i.cotizacion && <Chip tono={i.cotizacion.estado === "enviado" ? "ok" : "neutro"}>{i.cotizacion.texto}</Chip>}
            {grupo === "convertir" && <Chip>{i.origen_txt}</Chip>}
            {i.servicio_interes && <Chip>{i.servicio_interes}</Chip>}
          </span>
        </span>
        <span aria-hidden className="mr-1 h-2.5 w-2.5 shrink-0 self-center rotate-45 border-r-2 border-t-2 border-neutral-400" />
      </button>
      <div className="flex flex-wrap gap-2 border-t border-neutral-100 px-3.5 py-2.5 [&>*]:flex-1">
        {i.whatsapp_url && <a href={i.whatsapp_url} target="_blank" rel="noopener noreferrer" onClick={anotar} className={BOTON.whatsapp}><Icono nombre="whatsapp" size={16} />{textoWa}</a>}
        {i.reserva && <button type="button" onClick={() => setCita(true)} className={BOTON.principal}><Icono nombre="calendario" size={16} />Cita</button>}
        {sinCotizar && <a href={cotizar} className={BOTON.principal}><Icono nombre="euro" size={16} />Cotizar</a>}
        {puedeEditar && <button type="button" onClick={() => setHoja(true)} className={`${BOTON.secundario} !flex-none`}>Etapa</button>}
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
            <span className="mt-0.5 block text-[12.5px] font-normal text-[#4f6672]">{g.ayuda}</span>
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
