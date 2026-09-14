// «Planes de pago» de un cliente: lo que debe y lo que ha pagado, plan por
// plan y cuota por cuota, con las mismas acciones que la lista de Pagos.
//
// Vive en la ficha del cliente y, arriba de la lista, en /backoffice/pagos
// cuando se llega con ?cliente=ID (el enlace de la barra «Hoy»). Datos:
// GET /backoffice/pagos/cliente/:id_cliente.
import { useCallback, useEffect, useState } from "react";
import { ExternalLink, Plus, RefreshCw } from "lucide-react";
import { boGET } from "../../../services/backofficeApi";
import { navigate } from "../../../services/navigate";
import { Boton, Chip, Esqueleto } from "../ui";
import { useAccionesCobro } from "./AccionesCobro";
import BotonesCobro from "./BotonesCobro";
import PlanNuevo from "./PlanNuevo";
import PlanDetalle from "./PlanDetalle";
import {
  ESTADO_PLAN, MODALIDAD, dinero, dia, diaDe, textoVence, textoCuota, estadoDe,
} from "./pagosComun";
import "../../../styles/pagos-core.css";

function Totales({ resumen }) {
  const monedas = Object.entries(resumen || {});
  if (!monedas.length) return null;
  return (
    <div className="ase-pg-totales">
      {monedas.map(([m, r]) => (
        <div key={m} className="ase-pg-cifras">
          <div><b>{dinero(r.total, m)}</b><span>total</span></div>
          <div><b style={{ color: "var(--green)" }}>{dinero(r.pagado, m)}</b><span>pagado</span></div>
          <div><b>{dinero(r.pendiente, m)}</b><span>pendiente</span></div>
          <div><b style={{ color: r.vencido ? "var(--red)" : undefined }}>{dinero(r.vencido, m)}</b><span>vencido</span></div>
          {r.en_revision > 0 && <div><b style={{ color: "#1f6fb8" }}>{dinero(r.en_revision, m)}</b><span>por validar</span></div>}
        </div>
      ))}
    </div>
  );
}

function TarjetaPlan({ plan, puede, onAbrir, onAccion }) {
  const est = ESTADO_PLAN[plan.estado] || ESTADO_PLAN.ACTIVO;
  const r = plan.resumen;
  const anulado = plan.estado === "ANULADO";
  return (
    <article className="ase-pg-plan" data-estado={plan.estado}>
      <button type="button" className="ase-pg-plan-boton" onClick={() => onAbrir(plan.id_plan)}>
        <span style={{ minWidth: 0, flex: 1 }}>
          <span className="ase-pg-cobro-n">{plan.concepto}</span>
          <span className="ase-pg-cobro-s">
            {[MODALIDAD[plan.modalidad], plan.proceso?.servicio, plan.fecha_limite_postulacion ? `límite ${dia(plan.fecha_limite_postulacion)}` : null]
              .filter(Boolean).join(" · ")}
          </span>
        </span>
        <span className="ase-pg-plan-der">
          <b className="ase-num">{dinero(plan.total, plan.moneda)}</b>
          <Chip tono={est.tono} punto>{est.etiqueta}</Chip>
        </span>
      </button>
      {!anulado && (
        <>
          <div className="ase-pg-plan-progreso">
            <div className="ase-progreso"><i style={{ width: `${r.cuotas ? (r.cuotas_pagadas / r.cuotas) * 100 : 0}%` }} /></div>
            <span>{r.cuotas_pagadas} de {r.cuotas} pagadas</span>
          </div>
          <ul className="ase-pg-mini">
            {plan.cuotas.filter((c) => c.estado !== "ANULADO").map((c) => {
              const e = estadoDe(c);
              return (
                <li key={c.id_pago}>
                  <span className="ase-pg-nro">{c.nro_cuota || "·"}</span>
                  <span className="ase-pg-mini-datos">
                    <b className="ase-num">{dinero(c.monto, c.moneda)}</b>
                    <span>{c.estado === "PAGADO" ? `pagada ${diaDe(c.fecha_pago)}` : textoVence(c)}</span>
                  </span>
                  <Chip tono={e.tono} punto>{e.etiqueta}</Chip>
                  <BotonesCobro cobro={{ ...c, cliente: plan.cliente, plan: { concepto: plan.concepto } }} puede={puede} onAccion={onAccion} max={3} />
                </li>
              );
            })}
          </ul>
        </>
      )}
    </article>
  );
}

export default function PlanesCliente({ idCliente, enPagos = false, onCambio }) {
  const [datos, setDatos] = useState(null);
  const [error, setError] = useState(null);
  const [opciones, setOpciones] = useState(null);
  const [nuevo, setNuevo] = useState(false);
  const [planAbierto, setPlanAbierto] = useState(null);

  const cargar = useCallback(async () => {
    const r = await boGET(`/backoffice/pagos/cliente/${idCliente}`);
    if (!r?.ok) { setError(r?.msg || "No se pudieron cargar los pagos del cliente"); return; }
    setError(null);
    setDatos(r);
  }, [idCliente]);

  const acciones = useAccionesCobro({ opciones, onHecho: () => { cargar(); onCambio?.(); } });
  const { puede } = acciones;

  useEffect(() => {
    if (!puede.ver) return undefined;
    let vivo = true;
    boGET(`/backoffice/pagos/cliente/${idCliente}`).then((r) => {
      if (!vivo) return;
      if (r?.ok) { setDatos(r); setError(null); } else setError(r?.msg || "No se pudieron cargar los pagos del cliente");
    });
    boGET("/backoffice/pagos/opciones").then((r) => { if (vivo && r?.ok) setOpciones(r); });
    return () => { vivo = false; };
  }, [idCliente, puede.ver]);

  if (!puede.ver) return null;

  const planes = datos?.planes || [];
  const ordenados = [...planes].sort((a, b) => (a.estado === "ANULADO") - (b.estado === "ANULADO"));
  const sueltos = datos?.pagos_sin_plan || [];

  return (
    <section className="ase ase-pg-ficha">
      <div className="ase-pg-ficha-cab">
        <div style={{ minWidth: 0 }}>
          <p className="ase-rotulo" style={{ margin: 0 }}>
            Planes de pago{planes.length ? ` · ${planes.length}` : ""}
          </p>
          {enPagos && datos?.cliente && (
            <h2 className="ase-seccion-t" style={{ marginTop: 4 }}>
              {datos.cliente.nombre}
              {datos.cliente.prueba && <Chip tono="morado" className="ase-pg-chip-titulo">prueba</Chip>}
            </h2>
          )}
        </div>
        <div className="ase-pg-acciones">
          {!enPagos && (
            <Boton tono="fantasma" tam="xs" icono={ExternalLink} onClick={() => navigate(`/backoffice/pagos?cliente=${idCliente}`)}>
              Ver en Pagos
            </Boton>
          )}
          {enPagos && <Boton tono="fantasma" tam="xs" icono={RefreshCw} onClick={cargar} aria-label="Recargar" />}
          {puede.planes && (
            <Boton tono="cta" tam="sm" icono={Plus} onClick={() => setNuevo(true)} disabled={!opciones}>Plan de pagos</Boton>
          )}
        </div>
      </div>

      {error && (
        <div className="ase-pg-error" style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
          {error}
          <Boton tono="secundario" tam="xs" onClick={cargar}>Reintentar</Boton>
        </div>
      )}
      {!datos && !error && <Esqueleto filas={2} alto={64} />}

      {datos && (
        <>
          <Totales resumen={datos.resumen} />
          {planes.length === 0 ? (
            <p className="ase-pg-previa-vacia">
              Sin planes de pago. {puede.planes ? "Crea uno para fijar las cuotas y sus vencimientos: el asesorado lo verá en su panel y le llegarán los recordatorios." : ""}
            </p>
          ) : (
            <div className="ase-lista">
              {ordenados.map((p) => (
                <TarjetaPlan key={p.id_plan} plan={p} puede={puede} onAbrir={setPlanAbierto} onAccion={acciones.abrir} />
              ))}
            </div>
          )}
          {sueltos.length > 0 && (
            <details className="ase-pg-sueltos">
              <summary>{sueltos.length === 1 ? "1 cobro sin plan" : `${sueltos.length} cobros sin plan`} (registrados a mano o antes de los planes)</summary>
              <ul className="ase-pg-mini">
                {sueltos.map((c) => {
                  const e = estadoDe(c);
                  return (
                    <li key={c.id_pago}>
                      <span className="ase-pg-mini-datos">
                        <b className="ase-num">{dinero(c.monto, c.moneda)}</b>
                        <span>{[c.concepto, textoCuota(c), c.estado === "PAGADO" ? `pagado ${diaDe(c.fecha_pago)}` : textoVence(c)].filter(Boolean).join(" · ")}</span>
                      </span>
                      <Chip tono={e.tono} punto>{e.etiqueta}</Chip>
                      <BotonesCobro cobro={c} puede={puede} onAccion={acciones.abrir} max={3} />
                    </li>
                  );
                })}
              </ul>
            </details>
          )}
        </>
      )}

      {nuevo && datos && (
        <PlanNuevo
          opciones={opciones}
          clienteInicial={{ id_cliente: datos.cliente.id_cliente, nombre: datos.cliente.nombre, email: datos.cliente.email }}
          onCerrar={() => setNuevo(false)}
          onCreado={(plan) => { setNuevo(false); cargar(); onCambio?.(); if (plan?.id_plan) setPlanAbierto(plan.id_plan); }}
        />
      )}
      {planAbierto && (
        <PlanDetalle
          key={planAbierto}
          idPlan={planAbierto}
          opciones={opciones}
          onCerrar={() => setPlanAbierto(null)}
          onCambio={() => { cargar(); onCambio?.(); }}
        />
      )}
      {acciones.ventanas}
    </section>
  );
}
