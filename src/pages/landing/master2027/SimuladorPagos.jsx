// src/pages/landing/master2027/SimuladorPagos.jsx
// Simulador del pago por etapas (A7). Con «Todavía no lo sé» la vía migratoria
// no suma 0 €: se muestra el rango y el total se escribe «+ vía por definir».
// La sesión es un pago aparte que suma al total (cliente, 11/09/2026, tarde):
// sesión + plan + vía + citas (25 + 359 + 250 + 75 = 709 € en el ejemplo por
// defecto). Regla de pago del plan: dos cuotas solo si faltan más de dos meses
// para postular; si no, al contado. El total no cambia.
import { useState } from "react";
import Icono from "../../../components/common/Icono";
import { SIMULADOR, TODOS_LOS_PLANES, eur, planPorId } from "../../../config/paqueteMaster2027";
import { evento } from "./medicion";

const GRUPOS = TODOS_LOS_PLANES.reduce((acc, p) => {
  const grupo = acc.find((g) => g.etiqueta === p.grupo);
  if (grupo) grupo.planes.push(p);
  else acc.push({ etiqueta: p.grupo, planes: [p] });
  return acc;
}, []);


function calcular({ planId, viaId, citas, cuotas }) {
  const plan = planPorId(planId) || planPorId(SIMULADOR.planPorDefecto);
  const via = SIMULADOR.vias.find((v) => v.id === viaId) || SIMULADOR.vias[0];
  const importeCitas = citas ? SIMULADOR.totalCitas : 0;
  const mitad = plan.precio / 2;
  const primerPago = cuotas ? mitad : plan.precio;
  const total = SIMULADOR.precioSesion + plan.precio + importeCitas + (via?.precio || 0);
  return { plan, via, importeCitas, mitad, primerPago, total };
}

/** Rótulo a la izquierda (se parte si hace falta) e importe siempre a la derecha. */
function Fila({ rotulo, nota, children, atenuada = false }) {
  return (
    <div className="grid grid-cols-[minmax(0,1fr)_auto] items-baseline gap-x-4 border-b border-primary/10 py-3 last:border-b-0">
      <dt className="min-w-0 text-sm text-neutral-700">
        {rotulo}
        {nota && <span className="mt-0.5 block text-xs text-primary-light">{nota}</span>}
      </dt>
      <dd
        className={`text-right text-sm ${
          atenuada ? "max-w-[10.5rem] font-semibold italic text-neutral-600" : "whitespace-nowrap font-bold text-primary"
        }`}
      >
        {children}
      </dd>
    </div>
  );
}

const CLASE_SELECT =
  "mt-2 w-full truncate rounded-xl border border-neutral-300 bg-white py-3 pl-3 pr-8 text-base text-primary focus:outline-none focus:ring-4 focus:ring-sky";

/** Dos opciones con radios nativos: flechas del teclado y foco visible de serie. */
function Opcion({ nombre, valor, marcada, onElegir, children }) {
  return (
    <label className="relative flex-1 cursor-pointer">
      <input
        type="radio"
        name={nombre}
        value={valor}
        checked={marcada}
        onChange={onElegir}
        className="peer absolute inset-0 h-full w-full cursor-pointer appearance-none rounded-lg focus:outline-none"
      />
      <span
        className={`pointer-events-none flex h-full items-center justify-center rounded-lg px-2 py-2.5 text-center text-sm font-bold leading-tight transition-colors peer-focus-visible:ring-4 peer-focus-visible:ring-sky ${
          marcada ? "bg-primary text-white" : "text-primary hover:bg-secondary-light"
        }`}
      >
        {children}
      </span>
    </label>
  );
}

export default function SimuladorPagos() {
  const [estado, setEstado] = useState({
    planId: SIMULADOR.planPorDefecto,
    viaId: SIMULADOR.viaPorDefecto,
    citas: SIMULADOR.citasPorDefecto,
    cuotas: true,
  });
  const { plan, via, importeCitas, mitad, primerPago, total } = calcular(estado);

  function cambiar(cambio) {
    const siguiente = { ...estado, ...cambio };
    setEstado(siguiente);
    const r = calcular(siguiente);
    evento("ads2027_simulador", {
      plan: r.plan.id,
      via: r.via.id,
      citas: siguiente.citas,
      cuotas: siguiente.cuotas,
      total: r.total,
    });
  }

  return (
    <div
      data-m27-zona="simulador"
      className="mb-[var(--m27-barra)] rounded-3xl border border-primary/10 bg-secondary-light p-5 sm:p-8"
    >
      <h3 className="flex items-center gap-3 font-fraunces text-xl font-bold text-primary sm:text-2xl">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary text-sun">
          <Icono nombre="euro" size={22} />
        </span>
        {SIMULADOR.titulo}
      </h3>

      <div className="mt-6 grid gap-6 lg:grid-cols-2 lg:gap-10">
        <div className="space-y-5">
          <div>
            <label htmlFor="m27-sim-plan" className="block text-sm font-bold text-primary">
              {SIMULADOR.planEtiqueta}
            </label>
            <select
              id="m27-sim-plan"
              value={estado.planId}
              onChange={(e) => cambiar({ planId: e.target.value })}
              className={CLASE_SELECT}
            >
              {GRUPOS.map((g) => (
                <optgroup key={g.etiqueta} label={g.etiqueta}>
                  {g.planes.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.opcion}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
            {/* El select lleva el nombre corto; aquí, el completo. */}
            <p className="mt-1.5 text-sm font-semibold leading-snug text-primary">
              {plan.nombreCompleto} · {eur(plan.precio)}
            </p>
          </div>

          <fieldset>
            <legend className="block text-sm font-bold text-primary">{SIMULADOR.plazo.pregunta}</legend>
            <div className="mt-2 flex gap-1 rounded-xl border border-neutral-300 bg-white p-1">
              <Opcion nombre="m27-sim-plazo" valor="si" marcada={estado.cuotas} onElegir={() => cambiar({ cuotas: true })}>
                {SIMULADOR.plazo.si}
              </Opcion>
              <Opcion nombre="m27-sim-plazo" valor="no" marcada={!estado.cuotas} onElegir={() => cambiar({ cuotas: false })}>
                {SIMULADOR.plazo.no}
              </Opcion>
            </div>
          </fieldset>

          <div>
            <label htmlFor="m27-sim-via" className="block text-sm font-bold text-primary">
              {SIMULADOR.viaEtiqueta}
            </label>
            <select
              id="m27-sim-via"
              value={estado.viaId}
              onChange={(e) => cambiar({ viaId: e.target.value })}
              className={CLASE_SELECT}
            >
              {SIMULADOR.vias.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.texto}
                </option>
              ))}
            </select>
          </div>

          <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-neutral-300 bg-white px-3 py-3">
            <input
              type="checkbox"
              checked={estado.citas}
              onChange={(e) => cambiar({ citas: e.target.checked })}
              className="mt-0.5 h-5 w-5 shrink-0 accent-accent"
            />
            <span className="text-sm leading-snug text-neutral-700">{SIMULADOR.citasEtiqueta}</span>
          </label>
        </div>

        <div aria-live="polite" className="rounded-2xl bg-white p-5 shadow-sm">
          <dl>
            <Fila rotulo={SIMULADOR.filas.hoy} nota={SIMULADOR.notaHoy}>
              {eur(SIMULADOR.precioSesion)}
            </Fila>
            <Fila rotulo={estado.cuotas ? SIMULADOR.filas.inicio : SIMULADOR.filas.contado}>
              {eur(primerPago)}
            </Fila>
            {estado.cuotas && <Fila rotulo={SIMULADOR.filas.dosMeses}>{eur(mitad)}</Fila>}
            <Fila rotulo={SIMULADOR.filas.carta} atenuada={!via}>
              {eur(via.precio)}
            </Fila>
            <Fila rotulo={SIMULADOR.filas.visa} atenuada={!estado.citas}>
              {estado.citas ? eur(importeCitas) : SIMULADOR.sinCitas}
            </Fila>
          </dl>
          <p className="mt-4 rounded-xl bg-primary px-4 py-3.5 text-white">
            <span className="block text-sm text-white/80">{SIMULADOR.totalRotulo}</span>
            <span className="font-fraunces text-3xl font-bold text-sun">{eur(total)}</span>          </p>
          <p className="mt-3 text-xs leading-relaxed text-neutral-600">{SIMULADOR.notaCuotas}</p>
        </div>
      </div>

      <p className="mt-5 text-xs leading-relaxed text-neutral-600 sm:text-[13px]">{SIMULADOR.pie}</p>
    </div>
  );
}
