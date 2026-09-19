// El portal de Pagos de Inspira Core.
//
// Arriba, la caja del mes: cobrado, pendiente, vencido y por validar (por
// moneda; euros y soles no se suman). Debajo, cuatro pestañas: lo que hay que
// perseguir, los comprobantes que subieron los asesorados, lo cobrado en el
// mes y los planes. Cada cobro lleva las acciones que permite el rol.
//
// La URL dice qué se ve, para poder mandar el enlace:
//   ?vista=por-validar | cobrados | planes | caja   (pendientes por defecto)
//                 «caja» es la caja mensual (CajaMes.jsx): cobrado, pendiente,
//                 vencido y en revisión del mes elegido, con desglose y CSV.
//   ?cliente=ID   filtra por cliente y enseña sus planes arriba (barra «Hoy»)
//   ?pago=ID      abre ese cobro; si espera validación, la ventana de validar
//                 (el correo interno de «comprobante subido» enlaza aquí)
//   ?plan=ID      abre el detalle del plan
import { useCallback, useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Plus, RefreshCw, Search, X, Wallet } from "lucide-react";
import { boGET } from "../../../services/backofficeApi";
import { useAuth } from "../context/AuthContext";
import { Pagina, Cabecera, Cuerpo, Boton, Chip, Vacio, Esqueleto, Pill } from "../ui";
import { useAccionesCobro } from "./AccionesCobro";
import BotonesCobro from "./BotonesCobro";
import PlanNuevo from "./PlanNuevo";
import PlanDetalle from "./PlanDetalle";
import PlanesCliente from "./PlanesCliente";
import CajaMes from "./CajaMes";
import {
  ESTADO_PLAN, MODALIDAD, dinero, bolsaTexto, cobrosDe, diaDe, textoVence, textoCuota, estadoDe,
  mesLima, sumarMes, limitesMes, nombreMes, leerUrl, escribirUrl,
} from "./pagosComun";
import "../../../styles/pagos-core.css";

const PESTANAS = [
  { id: "pendientes", label: "Pendientes y vencidos" },
  { id: "por-validar", label: "Por validar" },
  { id: "cobrados", label: "Cobrados" },
  { id: "planes", label: "Planes" },
  { id: "caja", label: "Caja" },
];

const VACIOS = {
  pendientes: ["Nada pendiente", "No hay cobros pendientes con estos filtros."],
  "por-validar": ["Ningún comprobante por validar", "Cuando un asesorado suba su voucher desde el panel, aparecerá aquí."],
  cobrados: ["Sin cobros este mes", "Cambia de mes arriba o quita filtros."],
  planes: ["Sin planes de pago", "Crea el primero: fija las cuotas y el asesorado las verá en su panel."],
  caja: ["", ""],
};

const centimos = (v) => Math.round(Number(v || 0) * 100);

/** Los cobros con plan, agrupados por plan. Solo para pintar la lista. */
function agruparPlanes(pagos) {
  const m = new Map();
  for (const c of pagos) {
    if (!c.id_plan || !c.plan) continue;
    if (!m.has(c.id_plan)) {
      m.set(c.id_plan, {
        id_plan: c.id_plan, concepto: c.plan.concepto, modalidad: c.plan.modalidad, estado: c.plan.estado,
        cliente: c.cliente, responsable: c.responsable, prueba: c.prueba, moneda: c.moneda, cuotas: [],
      });
    }
    m.get(c.id_plan).cuotas.push(c);
  }
  return [...m.values()].map((g) => {
    const vivas = g.cuotas.filter((c) => c.estado !== "ANULADO");
    const suma = (f) => vivas.filter(f).reduce((t, c) => t + centimos(c.monto), 0) / 100;
    const proxima = vivas
      .filter((c) => c.estado === "PENDIENTE" || c.estado === "EN_REVISION")
      .sort((a, b) => String(a.fecha_vencimiento || "9999").localeCompare(String(b.fecha_vencimiento || "9999")))[0] || null;
    return {
      ...g,
      total: suma(() => true),
      pagado: suma((c) => c.estado === "PAGADO"),
      cuotasN: vivas.length,
      pagadasN: vivas.filter((c) => c.estado === "PAGADO").length,
      vencidas: vivas.filter((c) => c.vencido).length,
      porValidar: vivas.filter((c) => c.estado === "EN_REVISION").length,
      proxima,
    };
  });
}

function FilaCobro({ c, puede, onAccion, onPlan }) {
  const e = estadoDe(c);
  const conPago = c.estado === "PAGADO" || c.estado === "EN_REVISION";
  const recordado = c.recordatorio_vencido_at || c.recordatorio_previo_at;
  return (
    <li className="ase-pg-fila" data-tono={e.tono}>
      <button type="button" className="ase-pg-fila-main" onClick={() => onAccion(c.estado === "EN_REVISION" && puede.validar ? "validar" : "ver", c)}>
        <span className="ase-pg-fila-quien">
          <span className="ase-pg-cobro-n">
            {c.cliente?.nombre || "(sin cliente)"}
            {c.prueba && <Chip tono="morado" className="ase-pg-chip-titulo">prueba</Chip>}
          </span>
          <span className="ase-pg-cobro-s">{[c.concepto, textoCuota(c)].filter(Boolean).join(" · ") || "Cobro"}</span>
          {c.estado === "PENDIENTE" && c.motivo_rechazo && (
            <span className="ase-pg-cobro-s" style={{ color: "var(--red)" }}>Comprobante rechazado: {c.motivo_rechazo}</span>
          )}
        </span>
        <span className="ase-pg-fila-cuando">
          <span data-rojo={c.vencido ? "1" : "0"}>{c.estado === "PAGADO" ? `pagado ${diaDe(c.fecha_pago)}` : textoVence(c)}</span>
          {conPago && (c.metodo || c.referencia) && (
            <small>{[c.metodo?.nombre, c.referencia ? `op. ${c.referencia}` : null, c.pagado_en_linea ? "Mercado Pago" : null].filter(Boolean).join(" · ")}</small>
          )}
          {c.estado === "PENDIENTE" && recordado && <small>recordado {diaDe(recordado)}</small>}
        </span>
        <span className="ase-pg-fila-importe">
          <b className="ase-num">{dinero(c.monto, c.moneda)}</b>
          <Chip tono={e.tono} punto>{e.etiqueta}</Chip>
        </span>
      </button>
      <div className="ase-pg-fila-pie">
        <span className="ase-pg-cobro-s">
          {c.responsable?.nombre || "sin responsable"}
          {c.id_plan
            ? <> · <button type="button" className="ase-enlace ase-pg-enlace" onClick={() => onPlan(c.id_plan)}>ver plan</button></>
            : " · sin plan"}
        </span>
        <BotonesCobro cobro={c} puede={puede} onAccion={onAccion} />
      </div>
    </li>
  );
}

function FilaPlan({ p, onAbrir }) {
  const est = ESTADO_PLAN[p.estado] || ESTADO_PLAN.ACTIVO;
  return (
    <li>
      <button type="button" className="ase-pg-fila-main ase-pg-fila-plan" onClick={() => onAbrir(p.id_plan)}>
        <span className="ase-pg-fila-quien">
          <span className="ase-pg-cobro-n">
            {p.cliente?.nombre || "(sin cliente)"}
            {p.prueba && <Chip tono="morado" className="ase-pg-chip-titulo">prueba</Chip>}
          </span>
          <span className="ase-pg-cobro-s">{[p.concepto, MODALIDAD[p.modalidad], p.responsable?.nombre].filter(Boolean).join(" · ")}</span>
        </span>
        <span className="ase-pg-fila-cuando">
          <span data-rojo={p.vencidas ? "1" : "0"}>
            {p.estado === "ANULADO" ? "anulado" : p.proxima ? `próxima: ${textoVence(p.proxima)}` : "sin cuotas pendientes"}
          </span>
          <small>
            {p.pagadasN} de {p.cuotasN} cuotas pagadas
            {p.vencidas ? ` · ${p.vencidas} vencida${p.vencidas === 1 ? "" : "s"}` : ""}
            {p.porValidar ? ` · ${p.porValidar} por validar` : ""}
          </small>
        </span>
        <span className="ase-pg-fila-importe">
          <b className="ase-num">{dinero(p.total, p.moneda)}</b>
          <Chip tono={est.tono} punto>{est.etiqueta}</Chip>
        </span>
      </button>
    </li>
  );
}

export default function Pagos() {
  const { user } = useAuth();
  const inicial = useMemo(() => leerUrl(), []);
  const [vista, setVista] = useState(inicial.vista || "pendientes");
  const [cliente, setCliente] = useState(inicial.cliente);
  const [planAbierto, setPlanAbierto] = useState(inicial.plan);
  const [nuevoAbierto, setNuevoAbierto] = useState(false);

  const [mes, setMes] = useState(mesLima);
  const [resumen, setResumen] = useState(null);
  const [opciones, setOpciones] = useState(null);
  // `query` es la consulta a la que corresponde lo que hay en pantalla.
  const [lista, setLista] = useState({ query: null, pagos: [], total: 0, truncado: false, error: null });

  const [texto, setTexto] = useState("");
  const [textoAplicado, setTextoAplicado] = useState("");
  const [asesor, setAsesor] = useState("");
  const [medio, setMedio] = useState("");
  const [sinPruebas, setSinPruebas] = useState(true);
  const [soloVencidos, setSoloVencidos] = useState(false);
  const [estadoPlan, setEstadoPlan] = useState("ACTIVO");

  useEffect(() => {
    const t = setTimeout(() => setTextoAplicado(texto.trim()), 300);
    return () => clearTimeout(t);
  }, [texto]);

  const query = useMemo(() => {
    const p = new URLSearchParams();
    if (cliente) p.set("cliente", String(cliente));
    if (textoAplicado) p.set("q", textoAplicado);
    if (asesor) p.set("asesor", asesor);
    if (medio) p.set("medio", medio);
    // Con un cliente concreto se ve todo lo suyo, aunque sea una cuenta de prueba.
    if (sinPruebas && !cliente) p.set("sin_pruebas", "1");
    if (vista === "pendientes") {
      p.set("estado", "PENDIENTE");
      if (soloVencidos) p.set("vencido", "1");
    } else if (vista === "por-validar") {
      p.set("estado", "EN_REVISION");
    } else if (vista === "cobrados") {
      const { desde, hasta } = limitesMes(mes);
      p.set("estado", "PAGADO");
      p.set("por", "pago");
      p.set("desde", desde);
      p.set("hasta", hasta);
    } else {
      p.set("con_plan", "1");
      p.set("limite", "1000");
    }
    return p.toString();
  }, [cliente, textoAplicado, asesor, medio, sinPruebas, vista, soloVencidos, mes]);

  const aplicarLista = useCallback((q, r) => {
    if (!r?.ok) setLista({ query: q, pagos: [], total: 0, truncado: false, error: r?.msg || "No se pudieron cargar los cobros." });
    else setLista({ query: q, pagos: r.pagos || [], total: r.total || 0, truncado: Boolean(r.truncado), error: null });
  }, []);
  // Mientras no llega la respuesta de la consulta de ahora, se está cargando.
  const cargandoLista = lista.query !== query;

  useEffect(() => {
    let vivo = true;
    boGET(`/backoffice/pagos?${query}`).then((r) => { if (vivo) aplicarLista(query, r); });
    return () => { vivo = false; };
  }, [query, aplicarLista]);

  useEffect(() => {
    let vivo = true;
    boGET(`/backoffice/pagos/resumen?mes=${mes}`).then((r) => { if (vivo && r?.ok) setResumen(r); });
    return () => { vivo = false; };
  }, [mes]);

  useEffect(() => {
    boGET("/backoffice/pagos/opciones").then((r) => { if (r?.ok) setOpciones(r); });
  }, []);

  const recargar = useCallback(() => {
    boGET(`/backoffice/pagos?${query}`).then((r) => aplicarLista(query, r));
    boGET(`/backoffice/pagos/resumen?mes=${mes}`).then((r) => { if (r?.ok) setResumen(r); });
  }, [query, mes, aplicarLista]);
  const acciones = useAccionesCobro({ opciones, onHecho: recargar });
  const { puede, abrir } = acciones;

  // ?pago=ID: se abre ese cobro en su pestaña. Si llega con la página ya
  // abierta (otro enlace interno), se atiende igual escuchando el historial.
  const aplicarPagoDeUrl = useCallback((r) => {
    escribirUrl({ pago: null });
    if (!r?.ok) return;
    const p = r.pago;
    const v = p.estado === "EN_REVISION" ? "por-validar" : p.estado === "PAGADO" ? "cobrados" : "pendientes";
    setVista(v);
    escribirUrl({ vista: v });
    abrir(p.estado === "EN_REVISION" && puede.validar ? "validar" : "ver", p);
  }, [abrir, puede.validar]);

  useEffect(() => {
    if (inicial.pago) boGET(`/backoffice/pagos/${inicial.pago}`).then(aplicarPagoDeUrl);
    // Solo al entrar: después, el historial.
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const alVolver = () => {
      if (window.location.pathname !== "/backoffice/pagos") return;
      const u = leerUrl();
      setCliente(u.cliente);
      if (u.vista) setVista(u.vista);
      if (u.plan) setPlanAbierto(u.plan);
      if (u.pago) boGET(`/backoffice/pagos/${u.pago}`).then(aplicarPagoDeUrl);
    };
    window.addEventListener("popstate", alVolver);
    return () => window.removeEventListener("popstate", alVolver);
  }, [aplicarPagoDeUrl]);

  function cambiarVista(v) {
    setVista(v);
    escribirUrl({ vista: v });
  }
  function abrirPlan(id) {
    setPlanAbierto(id);
    escribirUrl({ plan: id });
  }
  function cerrarPlan() {
    setPlanAbierto(null);
    escribirUrl({ plan: null });
  }
  function quitarCliente() {
    setCliente(null);
    escribirUrl({ cliente: null });
  }

  const planesTodos = useMemo(() => (vista === "planes" ? agruparPlanes(lista.pagos) : []), [vista, lista.pagos]);
  const planes = useMemo(() => planesTodos
    .filter((p) => !estadoPlan || p.estado === estadoPlan)
    .sort((a, b) => (b.vencidas - a.vencidas) || (b.porValidar - a.porValidar)
      || String(a.proxima?.fecha_vencimiento || "9999").localeCompare(String(b.proxima?.fecha_vencimiento || "9999"))),
  [planesTodos, estadoPlan]);
  const cuentaPlanes = (e) => planesTodos.filter((p) => p.estado === e).length;

  const nVencidos = cobrosDe(resumen?.vencido);
  const nPorValidar = cobrosDe(resumen?.por_validar);
  const esMesActual = mes === mesLima();
  const nombre = (user?.nombre || "").split(" ")[0];

  const cuentas = {
    pendientes: resumen ? cobrosDe(resumen.pendiente) : null,
    "por-validar": resumen ? nPorValidar : null,
    cobrados: resumen ? cobrosDe(resumen.cobrado_mes) : null,
    planes: resumen ? resumen.planes?.ACTIVO || 0 : null,
    caja: null,
  };

  const stats = [
    { n: resumen ? bolsaTexto(resumen.cobrado_mes) : "…", l: `cobrado · ${nombreMes(mes)}`, tono: "ok", onClick: () => cambiarVista("cobrados") },
    { n: resumen ? bolsaTexto(resumen.pendiente) : "…", l: `pendiente · ${cuentas.pendientes ?? "…"} cobros`, onClick: () => { setSoloVencidos(false); cambiarVista("pendientes"); } },
    { n: resumen ? bolsaTexto(resumen.vencido) : "…", l: `vencido · ${nVencidos} cobros`, tono: nVencidos ? "rojo" : undefined, onClick: () => { setSoloVencidos(true); cambiarVista("pendientes"); } },
    { n: resumen ? bolsaTexto(resumen.por_validar) : "…", l: `por validar · ${nPorValidar}`, tono: nPorValidar ? "alerta" : undefined, onClick: () => cambiarVista("por-validar") },
  ];

  const vacio = VACIOS[vista];
  const hayFilas = vista === "planes" ? planes.length > 0 : lista.pagos.length > 0;

  return (
    <Pagina>
      <Cabecera
        eyebrow="Pagos"
        titulo={nombre ? `La caja del mes, ${nombre}` : "La caja del mes"}
        subtitulo="Lo cobrado, lo que falta por cobrar y los comprobantes que suben los asesorados. Cuentas de prueba fuera del resumen."
        acciones={(
          <>
            <div className="ase-pg-mes" role="group" aria-label="Mes del resumen">
              <button type="button" onClick={() => setMes((m) => sumarMes(m, -1))} aria-label="Mes anterior"><ChevronLeft size={15} /></button>
              <span>{nombreMes(mes)}</span>
              <button type="button" onClick={() => setMes((m) => sumarMes(m, 1))} disabled={esMesActual} aria-label="Mes siguiente"><ChevronRight size={15} /></button>
            </div>
            {puede.planes && (
              <Boton tono="cta" icono={Plus} onClick={() => setNuevoAbierto(true)} disabled={!opciones}>Nuevo plan</Boton>
            )}
            <Boton tono="cristal" icono={RefreshCw} onClick={recargar} aria-label="Recargar">
              <span className="hidden sm:inline">Recargar</span>
            </Boton>
          </>
        )}
        stats={stats}
      />

      <Cuerpo>
        {cliente && (
          <div className="ase-pg-filtro-cliente">
            <Chip tono="petrol">Filtrando por un cliente</Chip>
            <Boton tono="fantasma" tam="xs" icono={X} onClick={quitarCliente}>Ver todos</Boton>
          </div>
        )}
        {cliente && <PlanesCliente key={cliente} idCliente={cliente} enPagos onCambio={recargar} />}

        <div className="ase-pg-tabs" role="tablist" aria-label="Vistas de pagos">
          {PESTANAS.map((t) => (
            <button key={t.id} type="button" role="tab" aria-selected={vista === t.id}
              className="ase-tab" data-on={vista === t.id ? "1" : "0"} onClick={() => cambiarVista(t.id)}>
              {t.label}
              {cuentas[t.id] !== null && cuentas[t.id] !== undefined && <span className="ase-tab-n">{cuentas[t.id]}</span>}
            </button>
          ))}
        </div>

        {vista === "caja" ? <CajaMes mes={mes} /> : (<>
        <div className="ase-pg-filtros">
          <label className="ase-buscar">
            <Search />
            <input className="ase-campo" type="search" placeholder="Cliente, correo, concepto o n.º de operación"
              value={texto} onChange={(e) => setTexto(e.target.value)} aria-label="Buscar cobros" />
          </label>
          <select className="ase-campo" value={asesor} onChange={(e) => setAsesor(e.target.value)} aria-label="Responsable">
            <option value="">Todo el equipo</option>
            {user?.id_usuario && <option value={String(user.id_usuario)}>Los míos</option>}
            {(opciones?.asesores || []).filter((a) => a.id_usuario !== user?.id_usuario)
              .map((a) => <option key={a.id_usuario} value={String(a.id_usuario)}>{a.nombre}</option>)}
          </select>
          <select className="ase-campo" value={medio} onChange={(e) => setMedio(e.target.value)} aria-label="Medio de pago">
            <option value="">Todos los medios</option>
            {(opciones?.metodos || []).map((m) => <option key={m.id_metodo_pago} value={String(m.id_metodo_pago)}>{m.nombre}</option>)}
          </select>
          <div className="ase-pg-toggles">
            {vista === "pendientes" && (
              <label className="ase-toggle">
                <input type="checkbox" checked={soloVencidos} onChange={(e) => setSoloVencidos(e.target.checked)} />
                <i /> Solo vencidos
              </label>
            )}
            {!cliente && (
              <label className="ase-toggle ase-pg-toggle-verde">
                <input type="checkbox" checked={sinPruebas} onChange={(e) => setSinPruebas(e.target.checked)} />
                <i /> Sin pruebas
              </label>
            )}
          </div>
        </div>

        {vista === "planes" && (
          <div className="ase-pills">
            {["ACTIVO", "PAGADO", "ANULADO"].map((e) => (
              <Pill key={e} on={estadoPlan === e} n={cargandoLista ? undefined : cuentaPlanes(e)} onClick={() => setEstadoPlan(e)}>
                {ESTADO_PLAN[e].etiqueta}s
              </Pill>
            ))}
            <Pill on={!estadoPlan} onClick={() => setEstadoPlan("")}>Todos</Pill>
          </div>
        )}

        {lista.error && (
          <div className="ase-pg-error" style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
            {lista.error}
            <Boton tono="secundario" tam="xs" onClick={recargar}>Reintentar</Boton>
          </div>
        )}

        {cargandoLista && !hayFilas ? (
          <Esqueleto filas={5} alto={72} />
        ) : !lista.error && !hayFilas ? (
          <Vacio
            icono={Wallet}
            titulo={vacio[0]}
            texto={vacio[1]}
            acciones={vista === "planes" && puede.planes
              ? <Boton icono={Plus} onClick={() => setNuevoAbierto(true)} disabled={!opciones}>Nuevo plan</Boton>
              : null}
          />
        ) : (
          <div style={{ opacity: cargandoLista ? 0.6 : 1, transition: "opacity .2s" }}>
            {vista === "planes" ? (
              <ul className="ase-pg-lista">
                {planes.map((p) => <FilaPlan key={p.id_plan} p={p} onAbrir={abrirPlan} />)}
              </ul>
            ) : (
              <ul className="ase-pg-lista">
                {lista.pagos.map((c) => (
                  <FilaCobro key={c.id_pago} c={c} puede={puede} onAccion={abrir} onPlan={abrirPlan} />
                ))}
              </ul>
            )}
            {lista.truncado && (
              <p className="ase-pg-previa-vacia" style={{ marginTop: 10 }}>
                Se muestran los cobros más recientes; afina con los filtros para ver el resto.
              </p>
            )}
          </div>
        )}
        </>)}
      </Cuerpo>

      {nuevoAbierto && (
        <PlanNuevo
          opciones={opciones}
          onCerrar={() => setNuevoAbierto(false)}
          onCreado={(plan) => { setNuevoAbierto(false); recargar(); if (plan?.id_plan) abrirPlan(plan.id_plan); }}
        />
      )}
      {planAbierto && (
        <PlanDetalle key={planAbierto} idPlan={planAbierto} opciones={opciones} onCerrar={cerrarPlan} onCambio={recargar} />
      )}
      {acciones.ventanas}
    </Pagina>
  );
}
