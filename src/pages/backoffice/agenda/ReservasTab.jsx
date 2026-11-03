// Reservas: todo lo que hay que atender de las citas propias en una lista — pagos por confirmar,
// próximas, informes por aprobar — con los botones a mano (confirmar pago, voucher, accesos,
// recordatorios, formulario previo, informe, Meet y cancelar).
import { useCallback, useEffect, useMemo, useState } from "react";
import { boGET } from "../../../services/backofficeApi";
import { addDays, toISODate } from "./utilidades";
import ApptRow from "./mi-calendario/ApptRow";

const FILTROS = [
  { id: "pagar", texto: "Por pagar", vacio: "No hay reservas esperando pago." },
  { id: "informe", texto: "Informe por aprobar", vacio: "No hay informes por aprobar." },
  { id: "proximas", texto: "Próximas", vacio: "No hay citas confirmadas próximas." },
  { id: "pasadas", texto: "Pasadas", vacio: "Sin citas pasadas en este rango." },
  { id: "todas", texto: "Todas", vacio: "Sin reservas en este rango." },
];

// Fecha y hora de Lima (UTC-5, sin horario de verano).
const inicioDe = (r) => new Date(`${r.fecha}T${r.hora_inicio}:00-05:00`).getTime();

export default function ReservasTab() {
  const [reservas, setReservas] = useState([]);
  const [elegido, setElegido] = useState(null); // lo que tocó la persona; si no, el primer filtro con algo
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [ahora, setAhora] = useState(() => Date.now());

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
      proximas: vivas.filter((r) => ["CONFIRMADA"].includes(r.estado) && futuras(r)).sort((a, b) => inicioDe(a) - inicioDe(b)),
      pasadas: vivas.filter((r) => r.estado !== "PENDIENTE_PAGO" && !futuras(r)).sort((a, b) => inicioDe(b) - inicioDe(a)),
      todas: [...vivas].sort((a, b) => inicioDe(b) - inicioDe(a)),
    };
  }, [reservas, ahora]);

  const filtro = elegido || ["pagar", "informe", "proximas", "todas"].find((id) => grupos[id].length) || "todas";
  const actual = FILTROS.find((f) => f.id === filtro);
  const lista = grupos[filtro];

  return (
    <div className="h-full min-h-0 flex flex-col p-3 sm:p-4 gap-3">
      <div className="flex-none flex items-center gap-1.5 flex-wrap">
        {FILTROS.map((f) => (
          <button key={f.id} onClick={() => setElegido(f.id)}
            className={`px-3 py-1.5 rounded-full text-[11px] font-bold border transition-colors ${filtro === f.id ? "bg-primary-dark text-white border-primary-dark" : "bg-white text-neutral-600 border-neutral-200 hover:bg-neutral-50"}`}>
            {f.texto}
            <span className={`ml-1.5 px-1.5 rounded-full text-[10px] ${filtro === f.id ? "bg-white/20" : "bg-neutral-100 text-neutral-500"}`}>{grupos[f.id].length}</span>
          </button>
        ))}
        <button onClick={() => { setCargando(true); cargar(); }} className="ml-auto px-3 py-1.5 rounded-full text-[11px] font-bold border border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50">
          {cargando ? "Actualizando…" : "Actualizar"}
        </button>
      </div>
      {error && <div className="flex-none bg-red-50 border border-red-200 rounded-xl p-3 text-red-700 text-xs">Error: {error}</div>}
      <section className="flex-1 min-h-0 overflow-y-auto bg-white border border-neutral-200 rounded-2xl shadow-sm p-2">
        {lista.length === 0 ? (
          <p className="text-[12px] text-neutral-400 text-center py-10">{cargando ? "Cargando…" : actual.vacio}</p>
        ) : (
          <div className="grid gap-1 max-w-3xl mx-auto">
            {lista.map((r) => (
              <ApptRow key={r.id_reserva} reserva={r} onChanged={cargar} mostrarAsesor />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
