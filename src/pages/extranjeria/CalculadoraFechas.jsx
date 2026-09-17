// src/pages/extranjeria/CalculadoraFechas.jsx
// «Presenté mi solicitud el …»: sitúa la fecha del visitante dentro de lo que
// la oficina dice tener grabado, instruido y resuelto.
//
// Deliberadamente NO estima cuándo saldrá su resolución: la oficina publica
// por dónde va, no a qué ritmo avanza, y una fecha inventada aquí se
// convierte en una promesa por WhatsApp al día siguiente. Lo que sí se puede
// decir con honestidad es cuántos meses de expedientes tiene por delante y si
// su fecha ya quedó dentro del tramo publicado.
import { useId, useMemo, useState } from "react";
import Icono from "../../components/common/Icono";
import { registrarEvento } from "../../lib/analytics";
import { FASES, GRUPOS, distancia, fechaLarga, hoyISO, textoDistancia } from "./fechas";

const evento = (nombre, datos) => {
  try {
    registrarEvento(nombre, datos);
  } catch {
    /* sin analítica: la calculadora funciona igual */
  }
};

/** Trámites únicos de una oficina (un trámite tiene hasta tres filas, una por fase). */
function tramitesDe(oficina) {
  const vistos = new Map();
  for (const t of oficina?.tramites || []) {
    if (!vistos.has(t.tramite)) vistos.set(t.tramite, { nombre: t.tramite, grupo: t.grupo });
  }
  return [...vistos.values()];
}

/** Estado de cada fase para la fecha que escribió el visitante. */
function analizar(oficina, nombreTramite, fechaUsuario) {
  const filas = (oficina?.tramites || []).filter((t) => t.tramite === nombreTramite);
  return FASES.map((f) => {
    const fila = filas.find((t) => t.fase === f.id);
    if (!fila || !fila.fecha) return { fase: f, estado: "sin-dato", fila: fila || null };
    const d = distancia(fila.fecha, fechaUsuario);
    // signo 1 = la fecha del visitante es POSTERIOR a la publicada: aún no le toca.
    const dentro = !d || d.signo === -1 || (d.meses === 0 && d.dias === 0);
    return {
      fase: f,
      estado: dentro ? "pasada" : "espera",
      fila,
      distancia: d,
    };
  });
}

export default function CalculadoraFechas({ oficinas }) {
  const conFechas = useMemo(() => (oficinas || []).filter((o) => o.publicada), [oficinas]);
  const [oficinaId, setOficinaId] = useState(() => conFechas[0]?.id || "");
  const [tramite, setTramite] = useState("");
  const [fecha, setFecha] = useState("");
  const idOficina = useId();
  const idTramite = useId();
  const idFecha = useId();

  const oficina = useMemo(
    () => conFechas.find((o) => o.id === oficinaId) || conFechas[0] || null,
    [conFechas, oficinaId],
  );
  const listaTramites = useMemo(() => (oficina ? tramitesDe(oficina) : []), [oficina]);
  const tramiteElegido = listaTramites.some((t) => t.nombre === tramite)
    ? tramite
    : listaTramites[0]?.nombre || "";

  const analisis = useMemo(
    () => (oficina && tramiteElegido && fecha ? analizar(oficina, tramiteElegido, fecha) : null),
    [oficina, tramiteElegido, fecha],
  );

  // Sin ninguna oficina con fechas publicadas no hay nada que calcular.
  if (conFechas.length === 0) return null;

  const cambiarOficina = (e) => {
    setOficinaId(e.target.value);
    setTramite(""); // los trámites de cada oficina son distintos
  };

  const cambiarFecha = (e) => {
    const v = e.target.value;
    setFecha(v);
    if (v) evento("extranjeria_fechas_calculo", { oficina: oficina?.id, tramite: tramiteElegido });
  };

  // La fase de resolución es la que de verdad pregunta la gente; si esa
  // oficina no la publica, se toma la última que sí tenga dato.
  const principal =
    analisis?.find((a) => a.fase.id === "resolucion" && a.estado !== "sin-dato") ||
    [...(analisis || [])].reverse().find((a) => a.estado !== "sin-dato") ||
    null;

  return (
    <div className="rounded-3xl border border-neutral-200 bg-white p-5 sm:p-7">
      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label htmlFor={idOficina} className="mb-1.5 block text-sm font-bold text-primary">
            ¿En qué oficina?
          </label>
          <select id={idOficina} className="ext-campo" value={oficina?.id || ""} onChange={cambiarOficina}>
            {conFechas.map((o) => (
              <option key={o.id} value={o.id}>
                {o.nombre}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor={idTramite} className="mb-1.5 block text-sm font-bold text-primary">
            ¿Qué presentaste?
          </label>
          <select
            id={idTramite}
            className="ext-campo"
            value={tramiteElegido}
            onChange={(e) => setTramite(e.target.value)}
          >
            {GRUPOS.map((g) => {
              const items = listaTramites.filter((t) => t.grupo === g.id);
              if (items.length === 0) return null;
              return (
                <optgroup key={g.id} label={g.etiqueta}>
                  {items.map((t) => (
                    <option key={t.nombre} value={t.nombre}>
                      {t.nombre}
                    </option>
                  ))}
                </optgroup>
              );
            })}
          </select>
        </div>

        <div>
          <label htmlFor={idFecha} className="mb-1.5 block text-sm font-bold text-primary">
            Lo presenté el…
          </label>
          <input
            id={idFecha}
            type="date"
            className="ext-campo"
            value={fecha}
            max={hoyISO()}
            onChange={cambiarFecha}
          />
        </div>
      </div>

      {/* El resultado se anuncia solo a quien usa lector de pantalla: cambia
          sin que haya botón que pulsar. */}
      <div aria-live="polite" className="mt-5">
        {!fecha && (
          <p className="text-sm leading-relaxed text-neutral-700">
            Escribe la fecha en la que presentaste tu solicitud o tu recurso y te decimos si tu
            expediente ya entró en el tramo que la oficina dice estar tramitando.
          </p>
        )}

        {fecha && analisis && (
          <div className="ext-resultado">
            {principal && (
              <div
                className={`rounded-2xl p-4 sm:p-5 ${
                  principal.estado === "pasada"
                    ? "bg-[#f4fbf4] ring-1 ring-[#9ccf9c]"
                    : "bg-[#fffaf3] ring-1 ring-[#f2c894]"
                }`}
              >
                <p className="font-fraunces text-lg font-bold leading-snug text-primary sm:text-xl">
                  {principal.estado === "pasada"
                    ? "Tu expediente ya debería estar en revisión"
                    : `Tienes por delante ${textoDistancia(principal.distancia)} de expedientes`}
                </p>
                <p className="mt-2 text-sm leading-relaxed text-neutral-700">
                  {principal.estado === "pasada" ? (
                    <>
                      La oficina declara ir por <b>{fechaLarga(principal.fila.fecha)}</b> en la fase de{" "}
                      {principal.fase.etiqueta.toLowerCase()}, y tú presentaste el{" "}
                      <b>{fechaLarga(fecha)}</b>. Es decir: tu solicitud ya cae dentro del tramo que dicen
                      estar tramitando. Que ya le toque no significa que esté resuelta ni que vayan a
                      avisarte hoy.
                    </>
                  ) : (
                    <>
                      Entre la fecha por la que va la oficina (<b>{fechaLarga(principal.fila.fecha)}</b>) y
                      la tuya (<b>{fechaLarga(fecha)}</b>) hay{" "}
                      <b>{textoDistancia(principal.distancia)}</b> de solicitudes presentadas antes que la
                      tuya. No es un plazo: la oficina no avanza siempre al mismo ritmo y un mes puede
                      tardar semanas o meses en despacharse.
                    </>
                  )}
                </p>
              </div>
            )}

            <ul className="mt-4 grid gap-3 sm:grid-cols-3">
              {analisis.map((a) => (
                <li key={a.fase.id} className="ext-paso" data-estado={a.estado}>
                  <p className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-neutral-500">
                    <Icono nombre={a.estado === "pasada" ? "escudo" : "reloj"} size={14} />
                    {a.fase.etiqueta}
                  </p>
                  {a.estado === "sin-dato" ? (
                    <p className="mt-1.5 text-sm font-semibold leading-snug text-neutral-600">
                      Esta oficina no publica esta fase.
                    </p>
                  ) : (
                    <>
                      <p className="mt-1.5 text-sm font-bold leading-snug text-primary">
                        Va por {fechaLarga(a.fila.fecha)}
                      </p>
                      <p className="mt-1 text-[13px] leading-snug text-neutral-700">
                        {a.estado === "pasada"
                          ? "Tu fecha ya quedó dentro."
                          : `Te faltan ${textoDistancia(a.distancia)}.`}
                      </p>
                    </>
                  )}
                </li>
              ))}
            </ul>

            <p className="mt-4 text-xs leading-relaxed text-neutral-600">
              Cálculo orientativo hecho con la última fecha publicada por la propia oficina. No es una
              previsión de cuándo se resolverá tu expediente, ni un compromiso de la Administración ni de
              Inspira Legal.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
