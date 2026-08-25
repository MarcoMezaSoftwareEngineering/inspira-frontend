// Clientes duplicados.
//
// La misma persona acaba con dos fichas: escribió desde otro correo, o un
// asesor la dio de alta a mano después de que ya existiera. Lo malo no es la
// fila de más, es que su historial queda partido en dos.
//
// Fusionar une historiales de personas reales, así que aquí no se pulsa un
// botón y ya: primero se ve exactamente qué se va a mover y adónde.
import { useCallback, useEffect, useState } from "react";
import { boGET, boPOST } from "../../../services/backofficeApi";

const TONO_MOTIVO = {
  "Mismo DNI": "bg-red-50 text-red-700 border-red-200",
  "Mismo pasaporte": "bg-red-50 text-red-700 border-red-200",
  "Mismo teléfono": "bg-amber-50 text-amber-700 border-amber-200",
  "Mismo usuario de correo": "bg-sky-50 text-sky-700 border-sky-200",
  "Mismo nombre": "bg-neutral-100 text-neutral-600 border-neutral-200",
};

function fecha(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("es-PE", { day: "2-digit", month: "short", year: "numeric" });
}

function Grupo({ g, onFusionado, isAdmin, avisar }) {
  const [destino, setDestino] = useState(g.sugerido);
  const [descartados, setDescartados] = useState([]);
  const [confirmar, setConfirmar] = useState(false);
  const [enviando, setEnviando] = useState(false);

  const aFusionar = g.clientes.filter(
    (c) => c.id_cliente !== destino && !descartados.includes(c.id_cliente)
  );
  const elDestino = g.clientes.find((c) => c.id_cliente === destino);
  const mueve = aFusionar.reduce(
    (t, c) => ({
      procesos: t.procesos + c.procesos,
      notas: t.notas + c.notas,
      reservas: t.reservas + c.reservas,
    }),
    { procesos: 0, notas: 0, reservas: 0 }
  );

  const fusionar = async () => {
    setEnviando(true);
    const r = await boPOST("/backoffice/duplicados/fusionar", {
      hacia: destino,
      desde: aFusionar.map((c) => c.id_cliente),
    });
    setEnviando(false);
    setConfirmar(false);
    avisar(r.msg || (r.ok ? "Fusionado" : "No se pudo fusionar"), r.ok ? "ok" : "error");
    if (r.ok) onFusionado();
  };

  return (
    <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden">
      <div className="px-3.5 py-2 border-b border-neutral-100 flex items-center gap-2">
        <span className={`text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded border ${
          TONO_MOTIVO[g.motivo] || TONO_MOTIVO["Mismo nombre"]
        }`}>
          {g.motivo}
        </span>
        <span className="text-[11.5px] text-neutral-400">{g.clientes.length} fichas</span>
      </div>

      <div className="divide-y divide-neutral-100">
        {g.clientes.map((c) => {
          const esDestino = c.id_cliente === destino;
          const fuera = descartados.includes(c.id_cliente);
          return (
            <div key={c.id_cliente}
              className={`px-3.5 py-2.5 flex items-start gap-2.5 ${
                esDestino ? "bg-[#E8F5EE]/40" : fuera ? "opacity-40" : ""
              }`}
            >
              <input
                type="radio" name={`destino-${g.motivo}-${g.clientes[0].id_cliente}`}
                checked={esDestino} disabled={fuera}
                onChange={() => setDestino(c.id_cliente)}
                className="mt-1 accent-[#1D6A4A]"
                aria-label={`Conservar ${c.nombre}`}
              />
              <div className="min-w-0 flex-1">
                <p className="text-[13px] font-semibold text-neutral-900 truncate">
                  {c.nombre}
                  <span className="ml-1.5 text-[10.5px] font-normal text-neutral-300">#{c.id_cliente}</span>
                  {esDestino && (
                    <span className="ml-1.5 text-[9px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded bg-[#1D6A4A] text-white">
                      se conserva
                    </span>
                  )}
                </p>
                <p className="text-[11.5px] text-neutral-400 truncate">
                  {c.email_contacto}{c.telefono ? ` · ${c.telefono}` : ""}
                  {c.dni ? ` · DNI ${c.dni}` : ""}
                </p>
                <p className="text-[11px] text-neutral-500 mt-0.5">
                  {c.procesos === 0 && c.notas === 0 && c.reservas === 0
                    ? <span className="text-neutral-400">sin historial</span>
                    : [
                        c.procesos && `${c.procesos} proceso${c.procesos > 1 ? "s" : ""}`,
                        c.notas && `${c.notas} nota${c.notas > 1 ? "s" : ""}`,
                        c.reservas && `${c.reservas} reserva${c.reservas > 1 ? "s" : ""}`,
                      ].filter(Boolean).join(" · ")}
                  <span className="text-neutral-300"> · alta {fecha(c.fecha_registro)}</span>
                </p>
              </div>
              {!esDestino && (
                <button
                  type="button"
                  onClick={() => setDescartados((d) =>
                    fuera ? d.filter((x) => x !== c.id_cliente) : [...d, c.id_cliente]
                  )}
                  className="shrink-0 text-[11px] font-semibold text-neutral-400 hover:text-neutral-700"
                >
                  {fuera ? "incluir" : "no es la misma"}
                </button>
              )}
            </div>
          );
        })}
      </div>

      {isAdmin && (
        <div className="px-3.5 py-2.5 bg-neutral-50/60 border-t border-neutral-100">
          {aFusionar.length === 0 ? (
            <p className="text-[11.5px] text-neutral-400">
              No queda nada por fusionar en este grupo.
            </p>
          ) : !confirmar ? (
            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button" onClick={() => setConfirmar(true)}
                className="text-[12px] font-semibold px-3 py-1.5 rounded-lg bg-[#023A4B] text-white hover:opacity-90"
              >
                Fusionar {aFusionar.length} en «{elDestino?.nombre?.split(" ")[0]}»
              </button>
              <span className="text-[11px] text-neutral-500">
                se moverán {mueve.procesos} proceso(s), {mueve.notas} nota(s) y {mueve.reservas} reserva(s)
              </span>
            </div>
          ) : (
            <div className="space-y-2">
              {/* Qué pasa exactamente, con nombres, antes de tocar nada. */}
              <p className="text-[12px] text-neutral-700 leading-relaxed">
                Todo el historial de{" "}
                <b>{aFusionar.map((c) => c.nombre).join(", ")}</b> pasará a{" "}
                <b>{elDestino?.nombre}</b> (#{destino}). Las fichas absorbidas no se
                borran: quedan ocultas y marcadas como fusionadas.
              </p>
              <div className="flex items-center gap-2">
                <button
                  type="button" onClick={fusionar} disabled={enviando}
                  className="text-[12px] font-semibold px-3 py-1.5 rounded-lg bg-[#1D6A4A] text-white hover:opacity-90 disabled:opacity-50"
                >
                  {enviando ? "Fusionando…" : "Sí, fusionar"}
                </button>
                <button
                  type="button" onClick={() => setConfirmar(false)} disabled={enviando}
                  className="text-[12px] font-semibold text-neutral-500 hover:text-neutral-800"
                >
                  Cancelar
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function Duplicados({ onVolver, isAdmin, avisar }) {
  const [datos, setDatos] = useState({ grupos: [] });
  const [cargando, setCargando] = useState(true);

  // El efecto no toca el estado de forma síncrona: `cargando` ya arranca en
  // true y sólo se apaga cuando llega la respuesta.
  const cargar = useCallback(() => {
    return boGET("/backoffice/duplicados").then((r) => {
      if (r.ok) setDatos(r);
      setCargando(false);
    });
  }, []);

  // Tras una fusión sí se vuelve a mostrar el aviso de espera: el grupo
  // recién fusionado tiene que desaparecer de la lista.
  const recargar = useCallback(() => { setCargando(true); return cargar(); }, [cargar]);

  useEffect(() => { cargar(); }, [cargar]);

  return (
    <div className="space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-[15px] font-bold text-neutral-900">Posibles duplicados</h2>
          <p className="text-[12px] text-neutral-500">
            Fichas que parecen de la misma persona. Elige cuál se conserva; el
            resto le cede su historial.
          </p>
        </div>
        <button
          type="button" onClick={onVolver}
          className="shrink-0 text-[12px] font-semibold text-neutral-500 hover:text-primary"
        >
          ← Volver a clientes
        </button>
      </div>

      {cargando ? (
        <p className="text-[13px] text-neutral-400 py-10 text-center">Comparando fichas…</p>
      ) : datos.grupos.length === 0 ? (
        <div className="py-12 text-center">
          <p className="text-[13px] font-semibold text-neutral-600">No hay duplicados a la vista</p>
          <p className="text-[12px] text-neutral-400 mt-1">
            Se comparan DNI, pasaporte, teléfono, usuario del correo y nombre.
          </p>
        </div>
      ) : (
        <>
          <p className="text-[11.5px] text-neutral-400">
            {datos.total_grupos} grupo(s) · {datos.total_clientes} fichas implicadas
            {!isAdmin && " · sólo un administrador puede fusionar"}
          </p>
          <div className="space-y-2.5">
            {datos.grupos.map((g, i) => (
              <Grupo
                key={`${g.motivo}-${g.clientes[0].id_cliente}-${i}`}
                g={g} isAdmin={isAdmin} avisar={avisar} onFusionado={recargar}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
