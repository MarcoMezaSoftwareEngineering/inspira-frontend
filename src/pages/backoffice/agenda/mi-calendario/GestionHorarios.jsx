// Abrir y cerrar la agenda desde la app (lo mismo se le puede pedir a Clawsito por WhatsApp):
//   · cerrar el resto de hoy o mañana con un toque, o un periodo (días y horas) con su motivo;
//   · ver y quitar los bloqueos vigentes;
//   · abrir horas sueltas fuera del horario fijo;
//   · editar el horario fijo semanal (lo que se abre solo cada semana).
// Un bloqueo cierra los horarios libres de /reservar y deja la agenda ocupada en Google Calendar
// para que Clawsito no agende encima. Las citas ya reservadas en ese tramo siguen en pie.
import { useCallback, useEffect, useState } from "react";
import { boDELETE, boGET, boPOST, boPUT } from "../../../../services/backofficeApi";
import { dialog } from "../../../../services/dialogService";

const DIAS = [
  { n: "1", t: "Lunes" }, { n: "2", t: "Martes" }, { n: "3", t: "Miércoles" }, { n: "4", t: "Jueves" },
  { n: "5", t: "Viernes" }, { n: "6", t: "Sábado" }, { n: "0", t: "Domingo" },
];
const BTN = "inline-flex min-h-[44px] items-center justify-center rounded-xl px-3.5 text-[13px] font-bold disabled:opacity-50";
const CAMPO = "min-h-[44px] w-full rounded-xl border border-neutral-300 bg-white px-3 text-[14px] text-neutral-900 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20";
const hoyLima = () => new Intl.DateTimeFormat("en-CA", { timeZone: "America/Lima" }).format(new Date());
const mananaLima = () => new Intl.DateTimeFormat("en-CA", { timeZone: "America/Lima" }).format(new Date(Date.now() + 86400e3));

function Etiqueta({ texto, children }) {
  return <label className="grid gap-1 text-[12px] font-bold text-neutral-700">{texto}{children}</label>;
}

export default function GestionHorarios({ onChanged }) {
  const [datos, setDatos] = useState(null);
  const [ocupado, setOcupado] = useState("");
  const [f, setF] = useState({ fecha: hoyLima(), hasta_fecha: "", todo: true, desde_hora: "09:00", hasta_hora: "12:00", motivo: "" });
  const [semana, setSemana] = useState(null);
  const set = (k) => (e) => setF((p) => ({ ...p, [k]: e.target.type === "checkbox" ? e.target.checked : e.target.value }));

  const cargar = useCallback(async () => {
    const r = await boGET("/backoffice/agenda/bloqueos");
    if (r?.ok) { setDatos(r); setSemana((s) => s || r.semana || {}); }
  }, []);
  useEffect(() => { cargar(); }, [cargar]); // eslint-disable-line react-hooks/set-state-in-effect

  async function hacer(clave, fn, ok) {
    setOcupado(clave);
    const r = await fn();
    setOcupado("");
    if (r?.ok === false) return dialog.toast(r.msg || "No se pudo completar", "error");
    dialog.toast(r?.texto || ok, "success");
    cargar();
    onChanged?.();
  }

  async function cerrarRapido(clave, cuerpo) {
    const motivo = await dialog.prompt("Motivo (se ve en tu Google Calendar):", "", "Cerrar la agenda");
    if (motivo === null) return;
    hacer(clave, () => boPOST("/backoffice/agenda/bloqueos", { ...cuerpo, motivo }), "Agenda cerrada.");
  }

  const cuerpoPeriodo = () => ({
    fecha: f.fecha, ...(f.hasta_fecha ? { hasta_fecha: f.hasta_fecha } : {}),
    ...(f.todo ? {} : { desde_hora: f.desde_hora, hasta_hora: f.hasta_hora }), motivo: f.motivo,
  });

  const cambiarTramo = (dia, i, j, v) => setSemana((s) => ({ ...s, [dia]: (s[dia] || []).map((t, k) => (k === i ? (j === 0 ? [v, t[1]] : [t[0], v]) : t)) }));
  const agregarTramo = (dia) => setSemana((s) => ({ ...s, [dia]: [...(s[dia] || []), ["09:00", "12:00"]] }));
  const quitarTramo = (dia, i) => setSemana((s) => ({ ...s, [dia]: (s[dia] || []).filter((_, k) => k !== i) }));

  async function guardarSemana() {
    const ok = await dialog.confirm("Se aplicará a las próximas semanas: se abren los horarios nuevos y se quitan los libres que ya no tocan. Las citas reservadas y los bloqueos no se tocan.", "Guardar horario fijo");
    if (!ok) return;
    hacer("semana", () => boPUT("/backoffice/agenda/horario-semanal", { semana }), "Horario fijo guardado.");
  }

  return (
    <details className="group flex-none rounded-2xl border border-neutral-200 bg-white shadow-sm">
      <summary className="flex min-h-[48px] cursor-pointer list-none items-center justify-between gap-2 px-4 py-2 [&::-webkit-details-marker]:hidden">
        <span>
          <span className="block text-[14px] font-bold text-primary-dark">Cerrar o abrir la agenda</span>
          <span className="block text-[12px] text-neutral-600">
            {datos?.bloqueos?.length ? `${datos.bloqueos.length} bloqueo(s) vigente(s)` : "Bloquear días u horas, abrir horarios extra y el horario fijo semanal"}
          </span>
        </span>
        <span className="text-neutral-500 transition-transform group-open:rotate-180" aria-hidden>▾</span>
      </summary>

      <div className="grid gap-4 border-t border-neutral-100 p-4">
        <section>
          <h3 className="text-[13px] font-extrabold text-primary-dark">Rápido</h3>
          <div className="mt-2 flex flex-wrap gap-2">
            <button type="button" disabled={!!ocupado} onClick={() => cerrarRapido("hoy", { resto_de_hoy: true })} className={`${BTN} bg-primary-dark text-white`}>
              {ocupado === "hoy" ? "Cerrando…" : "Cerrar el resto de hoy"}
            </button>
            <button type="button" disabled={!!ocupado} onClick={() => cerrarRapido("manana", { fecha: mananaLima() })} className={`${BTN} border border-neutral-300 bg-white text-neutral-800`}>
              {ocupado === "manana" ? "Cerrando…" : "Cerrar mañana"}
            </button>
          </div>
        </section>

        <section>
          <h3 className="text-[13px] font-extrabold text-primary-dark">Un periodo</h3>
          <div className="mt-2 grid gap-3 sm:grid-cols-2">
            <Etiqueta texto="Desde el día"><input type="date" value={f.fecha} onChange={set("fecha")} className={CAMPO} /></Etiqueta>
            <Etiqueta texto="Hasta el día (opcional)"><input type="date" value={f.hasta_fecha} min={f.fecha} onChange={set("hasta_fecha")} className={CAMPO} /></Etiqueta>
            <label className="flex min-h-[44px] items-center gap-2 text-[13px] font-semibold text-neutral-800 sm:col-span-2">
              <input type="checkbox" checked={f.todo} onChange={set("todo")} className="h-5 w-5 accent-[#013446]" /> Todo el día
            </label>
            {!f.todo && (
              <>
                <Etiqueta texto="Desde la hora"><input type="time" step={1800} value={f.desde_hora} onChange={set("desde_hora")} className={CAMPO} /></Etiqueta>
                <Etiqueta texto="Hasta la hora"><input type="time" step={1800} value={f.hasta_hora} onChange={set("hasta_hora")} className={CAMPO} /></Etiqueta>
              </>
            )}
            <div className="sm:col-span-2">
              <Etiqueta texto="Motivo (opcional)"><input value={f.motivo} onChange={set("motivo")} maxLength={80} placeholder="Ej.: entrenamiento, viaje, feriado" className={CAMPO} /></Etiqueta>
            </div>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <button type="button" disabled={!!ocupado || !f.fecha} onClick={() => hacer("bloquear", () => boPOST("/backoffice/agenda/bloqueos", cuerpoPeriodo()), "Agenda cerrada.")}
              className={`${BTN} bg-red-600 text-white`}>{ocupado === "bloquear" ? "Cerrando…" : "Cerrar la agenda"}</button>
            <button type="button" disabled={!!ocupado || !f.fecha || f.todo} title={f.todo ? "Para abrir, indique las horas" : undefined}
              onClick={() => hacer("abrir", () => boPOST("/backoffice/agenda/abrir", cuerpoPeriodo()), "Horarios abiertos.")}
              className={`${BTN} bg-emerald-600 text-white`}>{ocupado === "abrir" ? "Abriendo…" : "Abrir esas horas"}</button>
          </div>
          {f.todo && <p className="mt-1 text-[12px] text-neutral-600">Para abrir horarios extra, desmarque «Todo el día» e indique las horas.</p>}
        </section>

        <section>
          <h3 className="text-[13px] font-extrabold text-primary-dark">Bloqueos vigentes</h3>
          {!datos ? <p className="mt-1 text-[12px] text-neutral-600">Cargando…</p> : datos.bloqueos.length === 0 ? (
            <p className="mt-1 text-[12.5px] text-neutral-600">No hay bloqueos. La agenda sigue el horario fijo.</p>
          ) : (
            <ul className="mt-2 grid gap-2">
              {datos.bloqueos.map((b) => (
                <li key={b.id_bloqueo} className="flex items-center justify-between gap-2 rounded-xl bg-neutral-50 p-3">
                  <span className="min-w-0 text-[13px] text-neutral-800"><strong>{b.texto}</strong>{b.motivo ? ` · ${b.motivo}` : ""}</span>
                  <button type="button" disabled={!!ocupado} onClick={() => hacer(`q${b.id_bloqueo}`, () => boDELETE(`/backoffice/agenda/bloqueos/${b.id_bloqueo}`), "Bloqueo quitado.")}
                    className={`${BTN} shrink-0 border border-neutral-300 bg-white text-neutral-800`}>{ocupado === `q${b.id_bloqueo}` ? "Quitando…" : "Quitar"}</button>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section>
          <h3 className="text-[13px] font-extrabold text-primary-dark">Horario fijo semanal</h3>
          <p className="text-[12px] text-neutral-600">Lo que se abre solo cada semana para reservar (hora de Perú, bloques de 30 minutos).</p>
          {semana && (
            <div className="mt-2 grid gap-2">
              {DIAS.map((d) => (
                <div key={d.n} className="rounded-xl border border-neutral-200 p-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[13px] font-bold text-neutral-800">{d.t}</span>
                    <button type="button" onClick={() => agregarTramo(d.n)} className="min-h-[40px] px-2 text-[12.5px] font-bold text-primary underline">+ Agregar horas</button>
                  </div>
                  {(semana[d.n] || []).length === 0 ? <p className="text-[12px] text-neutral-500">Cerrado</p> : (semana[d.n] || []).map((t, i) => (
                    <div key={i} className="mt-1.5 flex items-center gap-2">
                      <input type="time" step={1800} value={t[0]} onChange={(e) => cambiarTramo(d.n, i, 0, e.target.value)} aria-label={`${d.t}: desde`} className={CAMPO} />
                      <span className="text-neutral-500" aria-hidden>–</span>
                      <input type="time" step={1800} value={t[1]} onChange={(e) => cambiarTramo(d.n, i, 1, e.target.value)} aria-label={`${d.t}: hasta`} className={CAMPO} />
                      <button type="button" onClick={() => quitarTramo(d.n, i)} aria-label={`Quitar estas horas del ${d.t}`} className="min-h-[44px] min-w-[44px] rounded-xl text-[18px] text-red-600 hover:bg-red-50">×</button>
                    </div>
                  ))}
                </div>
              ))}
              <button type="button" disabled={!!ocupado} onClick={guardarSemana} className={`${BTN} bg-primary text-white`}>{ocupado === "semana" ? "Guardando…" : "Guardar horario fijo"}</button>
            </div>
          )}
        </section>
      </div>
    </details>
  );
}
