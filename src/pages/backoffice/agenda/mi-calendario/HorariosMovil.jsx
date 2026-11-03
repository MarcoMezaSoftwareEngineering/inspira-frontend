// Horarios disponibles en el celular. La cuadrícula semanal no cabe en una pantalla de teléfono,
// así que aquí se trabaja por día: una tira de 7 días (con cuántos horarios libres tiene cada uno)
// y la lista de horarios del día elegido, con botones grandes: bloquear o quitar un horario libre,
// abrir uno bloqueado, ver la cita de uno reservado; cerrar el día entero o abrir horas extra.
// Usa los mismos datos y acciones que la cuadrícula (useMiCalendario).
import { useState } from "react";
import { boPOST } from "../../../../services/backofficeApi";
import { dialog } from "../../../../services/dialogService";
import { addDays, startOfDay, toISODate } from "../utilidades";
import { Chip } from "../../crm/kit";
import { BOTON } from "../../crm/estilos";
import FichaReserva from "./FichaReserva";

const DIAS = ["dom", "lun", "mar", "mié", "jue", "vie", "sáb"];
const DIAS_LARGOS = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];
const MESES = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];
const sumar30 = (h) => { const [a, b] = h.split(":").map(Number); const m = a * 60 + b + 30; return `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`; };

const ESTADO = {
  LIBRE: { texto: "Libre", tono: "ok" },
  RESERVADO: { texto: "Separado, por pagar", tono: "ojo" },
  OCUPADO: { texto: "Con cita", tono: "marca" },
  BLOQUEADO: { texto: "Bloqueado", tono: "neutro" },
};

export default function HorariosMovil({
  displayedDays, slotMap, reservaPorClave, claveDeSlot, setWeekStart, rangoTexto,
  esAdmin, filtro, setFiltro, asesores, combinado, onClickSlot, bloquearSlot, cargar, esPasado, todayKey, loading,
}) {
  const [elegido, setElegido] = useState(null);
  const [abrir, setAbrir] = useState(false);
  const [horas, setHoras] = useState({ desde: "09:00", hasta: "12:00" });
  const [ocupado, setOcupado] = useState("");
  const [cita, setCita] = useState(null);

  const dias = displayedDays.map((d) => toISODate(d));
  const dia = elegido && dias.includes(elegido) ? elegido : (dias.includes(todayKey) ? todayKey : dias[0]);
  const slotsDe = (f) => [...slotMap.entries()].filter(([k]) => k.startsWith(`${f}|`)).flatMap(([, v]) => v)
    .sort((a, b) => a.hora_inicio.localeCompare(b.hora_inicio));
  const delDia = slotsDe(dia);
  const cuenta = (lista, e) => lista.filter((s) => s.estado === e).length;
  const [y, m, d] = dia.split("-").map(Number);
  const titulo = `${DIAS_LARGOS[new Date(Date.UTC(y, m - 1, d)).getUTCDay()]} ${d} ${MESES[m - 1]}`;

  async function hacer(clave, ruta, cuerpo, ok) {
    setOcupado(clave);
    const r = await boPOST(ruta, cuerpo);
    setOcupado("");
    if (r?.ok === false) return dialog.toast(r.msg || "No se pudo completar", "error");
    dialog.toast(r?.texto || ok, "success");
    setAbrir(false);
    cargar();
  }
  async function cerrarDia() {
    const motivo = await dialog.prompt(`Motivo para cerrar el ${titulo} (se ve en tu Google Calendar):`, "", "Cerrar el día");
    if (motivo === null) return;
    hacer("dia", "/backoffice/agenda/bloqueos", { fecha: dia, motivo }, "Día cerrado.");
  }

  return (
    <div className="grid grid-cols-[minmax(0,1fr)] gap-3">
      {/* Semana y asesor */}
      <div className="rounded-2xl bg-white p-3 shadow-sm ring-1 ring-neutral-200/80">
        <div className="flex items-center gap-2">
          <button type="button" aria-label="Semana anterior" onClick={() => setWeekStart((w) => addDays(w, -7))} className={`${BOTON.secundario} !px-0 w-11`}>‹</button>
          <p className="min-w-0 flex-1 truncate text-center text-[14px] font-bold capitalize text-primary-dark">{rangoTexto()}</p>
          <button type="button" aria-label="Semana siguiente" onClick={() => setWeekStart((w) => addDays(w, 7))} className={`${BOTON.secundario} !px-0 w-11`}>›</button>
          <button type="button" onClick={() => { setWeekStart(startOfDay(new Date())); setElegido(null); }} className={BOTON.secundario}>Hoy</button>
        </div>
        {esAdmin && (
          <label className="mt-2 block">
            <span className="sr-only">Calendario de</span>
            <select value={filtro} onChange={(e) => setFiltro(e.target.value)} className="min-h-[44px] w-full rounded-xl border border-neutral-300 bg-white px-3 text-[14px] font-semibold text-neutral-800">
              <option value="todos">Todo el equipo</option>
              <option value="yo">Solo yo</option>
              {asesores.map((a) => <option key={a.id_usuario} value={a.id_usuario}>{a.nombre}</option>)}
            </select>
          </label>
        )}
      </div>

      {/* Tira de días */}
      <div role="tablist" aria-label="Día" className="-mx-1 flex gap-1.5 overflow-x-auto px-1 pb-1 [scrollbar-width:none]">
        {dias.map((f) => {
          const [yy, mm, dd] = f.split("-").map(Number);
          const ls = slotsDe(f);
          const libres = cuenta(ls, "LIBRE");
          const citas = cuenta(ls, "OCUPADO") + cuenta(ls, "RESERVADO");
          const on = f === dia;
          return (
            <button key={f} type="button" role="tab" aria-selected={on} onClick={() => { setElegido(f); setAbrir(false); }}
              className={`flex min-h-[64px] w-[58px] shrink-0 flex-col items-center justify-center rounded-2xl text-center ring-1 transition ${on ? "bg-primary-dark text-white ring-primary-dark" : "bg-white text-neutral-800 ring-neutral-200"}`}>
              <span className={`text-[11px] font-bold uppercase ${on ? "text-white/80" : "text-[#4f6672]"}`}>{f === todayKey ? "hoy" : DIAS[new Date(Date.UTC(yy, mm - 1, dd)).getUTCDay()]}</span>
              <span className="text-[18px] font-bold leading-tight">{dd}</span>
              <span className={`text-[10.5px] font-semibold ${on ? "text-white/85" : libres ? "text-emerald-700" : "text-[#4f6672]"}`}>
                {citas ? `${citas} cita${citas > 1 ? "s" : ""}` : libres ? `${libres} libres` : ls.length ? "cerrado" : "—"}
              </span>
            </button>
          );
        })}
      </div>

      {/* El día */}
      <section className="rounded-2xl bg-white p-3.5 shadow-sm ring-1 ring-neutral-200/80">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="text-[16px] font-bold capitalize text-primary-dark">{titulo}</h3>
            <p className="text-[12.5px] text-[#4f6672]">
              {delDia.length ? `${cuenta(delDia, "LIBRE")} libres · ${cuenta(delDia, "OCUPADO") + cuenta(delDia, "RESERVADO")} con cita · ${cuenta(delDia, "BLOQUEADO")} bloqueados` : "Sin horarios este día"}
            </p>
          </div>
          {loading && <span className="text-[12px] text-[#4f6672]">Cargando…</span>}
        </div>

        <div className="mt-3 flex flex-wrap gap-2 [&>*]:flex-1">
          {cuenta(delDia, "LIBRE") > 0 && <button type="button" disabled={!!ocupado} onClick={cerrarDia} className={BOTON.peligro}>{ocupado === "dia" ? "Cerrando…" : "Cerrar este día"}</button>}
          <button type="button" onClick={() => setAbrir((v) => !v)} aria-expanded={abrir} className={BOTON.secundario}>{abrir ? "Cancelar" : "Abrir horas"}</button>
        </div>
        {abrir && (
          <div className="mt-3 rounded-xl bg-neutral-50 p-3">
            <div className="flex items-end gap-2">
              <label className="grid flex-1 gap-1 text-[12px] font-bold text-neutral-700">Desde<input type="time" step={1800} value={horas.desde} onChange={(e) => setHoras((h) => ({ ...h, desde: e.target.value }))} className="min-h-[44px] rounded-xl border border-neutral-300 bg-white px-3 text-[15px]" /></label>
              <label className="grid flex-1 gap-1 text-[12px] font-bold text-neutral-700">Hasta<input type="time" step={1800} value={horas.hasta} onChange={(e) => setHoras((h) => ({ ...h, hasta: e.target.value }))} className="min-h-[44px] rounded-xl border border-neutral-300 bg-white px-3 text-[15px]" /></label>
            </div>
            <button type="button" disabled={!!ocupado} onClick={() => hacer("abrir", "/backoffice/agenda/abrir", { fecha: dia, desde_hora: horas.desde, hasta_hora: horas.hasta }, "Horarios abiertos.")}
              className={`${BOTON.exito} mt-2 w-full`}>{ocupado === "abrir" ? "Abriendo…" : `Abrir de ${horas.desde} a ${horas.hasta}`}</button>
          </div>
        )}

        <ul className="mt-3 grid gap-2">
          {delDia.map((s) => {
            const e = ESTADO[s.estado] || ESTADO.LIBRE;
            const r = reservaPorClave.get(claveDeSlot(s));
            const pasado = esPasado(s.fecha, s.hora_inicio);
            return (
              <li key={s.id_slot} className={`flex items-center gap-3 rounded-xl p-2.5 ring-1 ring-neutral-200/80 ${pasado ? "opacity-60" : ""}`}>
                <div className="w-[64px] shrink-0">
                  <p className="text-[15px] font-bold tabular-nums text-neutral-900">{s.hora_inicio}</p>
                  <p className="text-[11.5px] tabular-nums text-[#4f6672]">a {sumar30(s.hora_inicio)}</p>
                </div>
                <div className="min-w-0 flex-1">
                  <Chip tono={e.tono}>{e.texto}</Chip>
                  {(r?.cliente?.nombre || (combinado && s.asesor?.nombre)) && (
                    <p className="mt-1 truncate text-[12.5px] font-semibold text-neutral-800">{[r?.cliente?.nombre, combinado ? s.asesor?.nombre : null].filter(Boolean).join(" · ")}</p>
                  )}
                </div>
                {!pasado && s.estado === "LIBRE" && <button type="button" onClick={(ev) => bloquearSlot(s, ev)} className={`${BOTON.secundario} shrink-0`}>Bloquear</button>}
                {!pasado && s.estado === "BLOQUEADO" && <button type="button" onClick={() => onClickSlot(s)} className={`${BOTON.exito} shrink-0`}>Abrir</button>}
                {(s.estado === "OCUPADO" || s.estado === "RESERVADO") && r && <button type="button" onClick={() => setCita(r)} className={`${BOTON.principal} shrink-0`}>Ver cita</button>}
              </li>
            );
          })}
        </ul>
        {delDia.some((s) => s.estado === "LIBRE") && (
          <p className="mt-2 text-[12px] text-[#4f6672]">Para quitar del todo un horario libre, use la vista de computadora.</p>
        )}
      </section>

      {cita && <FichaReserva reserva={cita} onCerrar={() => setCita(null)} onChanged={cargar} />}
    </div>
  );
}
