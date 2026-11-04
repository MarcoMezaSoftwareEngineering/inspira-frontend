// Reservas, como la agenda de un CRM: filtros en píldoras con contador (Por pagar, Informe por
// aprobar, Próximas, Pasadas, Todas) y la lista agrupada por día («Hoy», «Mañana», «jueves 5 nov»).
// Cada cita abre su ficha completa; en la lista solo va lo de todos los días.
import { useCallback, useEffect, useMemo, useState } from "react";
import { boGET } from "../../../services/backofficeApi";
import { addDays, toISODate } from "./utilidades";
import ApptRow from "./mi-calendario/ApptRow";
import AgendarCita from "./AgendarCita";
import { Segmentado } from "../crm/kit";
import { BOTON } from "../crm/estilos";

const FILTROS = [
  { id: "pagar", texto: "Por pagar", vacio: "No hay reservas esperando pago." },
  { id: "informe", texto: "Informe por aprobar", vacio: "No hay informes por aprobar." },
  { id: "proximas", texto: "Próximas", vacio: "No hay citas confirmadas próximas." },
  { id: "pasadas", texto: "Pasadas", vacio: "Sin citas pasadas en los últimos 30 días." },
  { id: "todas", texto: "Todas", vacio: "Sin reservas en este rango." },
];

const DIAS = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];
const MESES = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];
const hoyLima = () => new Intl.DateTimeFormat("en-CA", { timeZone: "America/Lima" }).format(new Date());
function nombreDia(f) {
  const hoy = hoyLima();
  const dif = Math.round((Date.UTC(...f.split("-").map((n, i) => (i === 1 ? n - 1 : +n))) - Date.UTC(...hoy.split("-").map((n, i) => (i === 1 ? n - 1 : +n)))) / 86400e3);
  const [y, m, d] = f.split("-").map(Number);
  const largo = `${DIAS[new Date(Date.UTC(y, m - 1, d)).getUTCDay()]} ${d} ${MESES[m - 1]}`;
  return dif === 0 ? `Hoy · ${largo}` : dif === 1 ? `Mañana · ${largo}` : dif === -1 ? `Ayer · ${largo}` : largo;
}

// Fecha y hora de Lima (UTC-5, sin horario de verano).
const inicioDe = (r) => new Date(`${r.fecha}T${r.hora_inicio}:00-05:00`).getTime();

export default function ReservasTab() {
  const [reservas, setReservas] = useState([]);
  const [elegido, setElegido] = useState(null); // lo que tocó la persona; si no, el primer filtro con algo
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [ahora, setAhora] = useState(() => Date.now());
  const [agendando, setAgendando] = useState(false);

  const cargar = useCallback(async () => {
    const hoy = new Date();
    const qs = new URLSearchParams({ desde: toISODate(addDays(hoy, -30)), hasta: toISODate(addDays(hoy, 120)) });
    const res = await boGET(`/backoffice/agenda/reservas?${qs}`);
    setAhora(Date.now());
    if (res?.ok === false) setError(res.msg || "No se pudieron cargar las reservas");
    else { setError(""); setReservas(res?.reservas || []); }
    setCargando(false);
  }, []);
  useEffect(() => { cargar(); }, [cargar]); // eslint-disable-line react-hooks/set-state-in-effect

  const grupos = useMemo(() => {
    const vivas = reservas.filter((r) => r.estado !== "CANCELADA" && r.estado !== "EXPIRADA");
    const futuras = (r) => inicioDe(r) >= ahora - 3600e3;
    return {
      pagar: vivas.filter((r) => r.estado === "PENDIENTE_PAGO").sort((a, b) => inicioDe(a) - inicioDe(b)),
      informe: vivas.filter((r) => r.informe_estado === "BORRADOR").sort((a, b) => inicioDe(b) - inicioDe(a)),
      proximas: vivas.filter((r) => r.estado === "CONFIRMADA" && futuras(r)).sort((a, b) => inicioDe(a) - inicioDe(b)),
      pasadas: vivas.filter((r) => r.estado !== "PENDIENTE_PAGO" && !futuras(r)).sort((a, b) => inicioDe(b) - inicioDe(a)),
      todas: [...reservas].filter((r) => r.estado !== "EXPIRADA").sort((a, b) => inicioDe(b) - inicioDe(a)),
    };
  }, [reservas, ahora]);

  const filtro = elegido || ["pagar", "informe", "proximas", "todas"].find((id) => grupos[id].length) || "todas";
  const actual = FILTROS.find((f) => f.id === filtro);
  const lista = grupos[filtro];

  // Agrupadas por día, en el orden de la lista.
  const porDia = useMemo(() => {
    const out = [];
    for (const r of lista) {
      const ultimo = out[out.length - 1];
      if (ultimo && ultimo.fecha === r.fecha) ultimo.items.push(r);
      else out.push({ fecha: r.fecha, items: [r] });
    }
    return out;
  }, [lista]);

  return (
    <div className="h-full min-h-0 overflow-y-auto overflow-x-hidden">
      <div className="mx-auto grid max-w-3xl grid-cols-[minmax(0,1fr)] gap-3 p-3 sm:p-4">
        <div className="flex items-center gap-2">
          <div className="min-w-0 flex-1">
            <Segmentado etiqueta="Filtrar reservas" valor={filtro} onCambio={setElegido}
              opciones={FILTROS.map((f) => ({ id: f.id, texto: f.texto, n: grupos[f.id].length }))} />
          </div>
          <button type="button" onClick={() => { setCargando(true); cargar(); }} aria-label="Actualizar" className={`${BOTON.secundario} !px-3`}>
            <span aria-hidden className={cargando ? "animate-spin" : ""}>↻</span>
          </button>
          <button type="button" onClick={() => setAgendando(true)} className={`${BOTON.principal} shrink-0`}>
            <span aria-hidden>+</span> Agendar cita
          </button>
        </div>
        {agendando && (
          <AgendarCita onCerrar={() => setAgendando(false)} onAgendada={() => { setElegido("proximas"); cargar(); }} />
        )}

        {error && <div className="rounded-xl bg-red-50 p-3 text-[13px] text-red-700 ring-1 ring-red-200">{error}</div>}

        {lista.length === 0 ? (
          <div className="rounded-2xl bg-white p-8 text-center shadow-sm ring-1 ring-neutral-200/80">
            <p className="text-[14px] font-semibold text-neutral-800">{cargando ? "Cargando…" : actual.vacio}</p>
            {!cargando && <p className="mt-1 text-[12.5px] text-[#4f6672]">Las reservas de la web, las que agenda Clawsito y las del calendario aparecen aquí.</p>}
          </div>
        ) : porDia.map((d) => (
          <section key={d.fecha} aria-label={nombreDia(d.fecha)}>
            <h2 className="sticky top-0 z-[1] -mx-1 mb-2 bg-[#F2F6FA]/95 px-1 py-1.5 text-[13px] font-bold capitalize text-primary-dark backdrop-blur">
              {nombreDia(d.fecha)} <span className="ml-1 font-semibold text-[#4f6672]">· {d.items.length}</span>
            </h2>
            <div className="grid gap-2.5">
              {d.items.map((r) => <ApptRow key={r.id_reserva} reserva={r} onChanged={cargar} mostrarAsesor pasada={inicioDe(r) < ahora - 3600e3} />)}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
