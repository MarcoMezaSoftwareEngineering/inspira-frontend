// src/pages/reservar/CalendarioReserva.jsx
// Calendario mensual (lunes primero) que marca solo los días con horarios.
// Trabaja con fechas "YYYY-MM-DD" de Lima y aritmética de calendario pura:
// nunca pasa por la zona horaria del navegador.
import { useMemo, useState } from "react";
import { MESES, fechaCompleta } from "./fechas";

const DIAS_SEMANA = ["l", "m", "x", "j", "v", "s", "d"];
const pad = (n) => String(n).padStart(2, "0");
const claveMes = (y, m) => `${y}-${pad(m)}`; // m: 1-12

// Celdas del mes: null para los huecos antes del día 1, luego "YYYY-MM-DD".
function celdasDelMes(y, m) {
  const primero = new Date(Date.UTC(y, m - 1, 1)).getUTCDay(); // 0 = domingo
  const huecos = (primero + 6) % 7; // lunes primero
  const total = new Date(Date.UTC(y, m, 0)).getUTCDate();
  const celdas = Array(huecos).fill(null);
  for (let d = 1; d <= total; d += 1) celdas.push(`${y}-${pad(m)}-${pad(d)}`);
  return celdas;
}

export default function CalendarioReserva({ diasConHorario, seleccionado, onElegir, horariosPorDia = {} }) {
  const disponibles = useMemo(() => new Set(diasConHorario), [diasConHorario]);

  // Empieza en el mes del primer día con horario (o del elegido).
  const base = seleccionado || diasConHorario[0] || null;
  const [mes, setMes] = useState(() => {
    if (!base) {
      const hoy = new Date();
      return { y: hoy.getFullYear(), m: hoy.getMonth() + 1 };
    }
    const [y, m] = base.split("-").map(Number);
    return { y, m };
  });

  // Si se elige un día desde fuera (p. ej. «primer horario libre»), el calendario
  // lo sigue: se ajusta al renderizar, sin efecto, cuando cambia `seleccionado`.
  const [anterior, setAnterior] = useState(seleccionado);
  if (seleccionado !== anterior) {
    setAnterior(seleccionado);
    if (seleccionado) {
      const [y, m] = seleccionado.split("-").map(Number);
      setMes((actual) => (actual.y === y && actual.m === m ? actual : { y, m }));
    }
  }

  const meses = useMemo(() => new Set(diasConHorario.map((f) => f.slice(0, 7))), [diasConHorario]);
  const hayAnterior = [...meses].some((k) => k < claveMes(mes.y, mes.m));
  const haySiguiente = [...meses].some((k) => k > claveMes(mes.y, mes.m));

  const mover = (delta) =>
    setMes(({ y, m }) => {
      const t = y * 12 + (m - 1) + delta;
      return { y: Math.floor(t / 12), m: (t % 12) + 1 };
    });

  const flecha =
    "grid h-9 w-9 place-items-center rounded-full bg-primary text-white transition hover:bg-primary-light disabled:opacity-30 disabled:cursor-not-allowed";

  return (
    <div>
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold capitalize text-primary">
          {MESES[mes.m - 1]} {mes.y}
        </h2>
        <div className="flex gap-2">
          <button type="button" className={flecha} onClick={() => mover(-1)} disabled={!hayAnterior} aria-label="Mes anterior">
            ‹
          </button>
          <button type="button" className={flecha} onClick={() => mover(1)} disabled={!haySiguiente} aria-label="Mes siguiente">
            ›
          </button>
        </div>
      </div>

      <div
        className="mt-4 grid grid-cols-7 gap-y-2 text-center text-xs text-neutral-500"
        // Flechas: saltan al día anterior / siguiente con horarios, aunque esté en otro mes.
        onKeyDown={(e) => {
          if (!["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(e.key)) return;
          const orden = [...diasConHorario].sort();
          const i = orden.indexOf(seleccionado);
          const paso = e.key === "ArrowLeft" || e.key === "ArrowUp" ? -1 : 1;
          const destino = orden[i < 0 ? 0 : i + paso];
          if (!destino) return;
          e.preventDefault();
          const [y, m] = destino.split("-").map(Number);
          setMes({ y, m });
          onElegir(destino);
          requestAnimationFrame(() => document.getElementById(`dia-${destino}`)?.focus());
        }}
      >
        {DIAS_SEMANA.map((d) => (
          <span key={d}>{d}</span>
        ))}
        {celdasDelMes(mes.y, mes.m).map((fecha, i) => {
          if (!fecha) return <span key={`h${i}`} />;
          const dia = Number(fecha.slice(8));
          const libre = disponibles.has(fecha);
          const elegido = fecha === seleccionado;
          return (
            <button
              key={fecha}
              id={`dia-${fecha}`}
              type="button"
              disabled={!libre}
              title={libre && horariosPorDia[fecha] ? `${horariosPorDia[fecha]} horarios libres` : undefined}
              onClick={() => onElegir(fecha)}
              aria-pressed={elegido}
              aria-label={libre ? `${fechaCompleta(fecha)}, con horarios` : undefined}
              className={[
                "mx-auto grid h-9 w-9 place-items-center rounded-full text-sm transition active:scale-90 motion-reduce:active:scale-100",
                elegido
                  ? "bg-primary font-semibold text-white"
                  : libre
                  ? "bg-accent/15 font-semibold text-primary hover:bg-accent/30"
                  : "cursor-default text-neutral-300",
              ].join(" ")}
            >
              {dia}
            </button>
          );
        })}
      </div>
    </div>
  );
}
