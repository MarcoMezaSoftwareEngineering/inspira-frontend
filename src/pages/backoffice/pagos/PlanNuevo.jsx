// «Nuevo plan de pagos»: cliente, proceso, precio, modalidad y fechas, con la
// vista previa de las cuotas calculada por el servidor.
//
// La regla de las dos cuotas (solo si faltan más de dos meses para la fecha
// límite de postulación) NO se copia aquí: cada cambio se manda a
// /backoffice/pagos/planes/simular, que usa la misma función que crea el plan,
// y lo que responde —cuotas o el motivo del 422— es lo que se enseña.
import { useEffect, useMemo, useState } from "react";
import { Plus, Search, X } from "lucide-react";
import { boGET, boPOST } from "../../../services/backofficeApi";
import { dialog } from "../../../services/dialogService";
import { Boton, Campo, Chip, Pill, Ventana } from "../ui";
import {
  MODALIDAD, TIPO_CATALOGO, LISTA_CATALOGO, dinero, dia, hoyLima,
} from "./pagosComun";

const MAX_CUOTAS = 12;

function etiquetaItem(i) {
  const lista = i.lista ? ` (${LISTA_CATALOGO[i.lista] || i.lista})` : "";
  const precio = i.eur !== null && i.eur !== undefined ? dinero(i.eur, "EUR") : dinero(i.pen, "PEN");
  return `${i.nombre}${lista} · ${precio}`;
}

function BuscadorCliente({ onElegir }) {
  const [texto, setTexto] = useState("");
  // Lo encontrado va con la búsqueda que lo trajo: si no coincide con lo
  // escrito ahora, se está buscando.
  const [resultado, setResultado] = useState({ q: "", clientes: [] });
  const q = texto.trim();
  const buscando = q.length >= 2 && resultado.q !== q;
  const lista = resultado.q === q ? resultado.clientes : [];

  useEffect(() => {
    if (q.length < 2) return undefined;
    let vivo = true;
    const t = setTimeout(() => {
      boGET(`/backoffice/clientes?orden=recientes&q=${encodeURIComponent(q)}`).then((r) => {
        if (vivo) setResultado({ q, clientes: r?.ok ? (r.clientes || []).slice(0, 8) : [] });
      });
    }, 300);
    return () => { vivo = false; clearTimeout(t); };
  }, [q]);

  return (
    <div className="ase-pg-buscador">
      <label className="ase-buscar">
        <Search />
        <input className="ase-campo" autoFocus value={texto} placeholder="Nombre, correo, celular o DNI"
          onChange={(e) => setTexto(e.target.value)} aria-label="Buscar cliente" />
      </label>
      {texto.trim().length >= 2 && (
        <ul className="ase-pg-sugerencias">
          {buscando && !lista.length && <li className="ase-pg-sug-vacia">Buscando…</li>}
          {!buscando && !lista.length && <li className="ase-pg-sug-vacia">Nadie con ese dato.</li>}
          {lista.map((c) => (
            <li key={c.id_cliente}>
              <button type="button" onClick={() => onElegir({ id_cliente: c.id_cliente, nombre: c.nombre, email: c.email_contacto })}>
                <b>{c.nombre || "Sin nombre"}</b>
                <span>{c.email_contacto || "sin correo"}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default function PlanNuevo({ opciones, clienteInicial = null, onCerrar, onCreado }) {
  const [cliente, setCliente] = useState(clienteInicial);
  const [cargaCliente, setCargaCliente] = useState({ id: null, datos: null });
  const [idSolicitud, setIdSolicitud] = useState("");
  const [origen, setOrigen] = useState("catalogo");
  const [idPrecio, setIdPrecio] = useState("");
  const [total, setTotal] = useState("");
  const [moneda, setMoneda] = useState("EUR");
  const [modalidad, setModalidad] = useState("CONTADO");
  const [fechaInicio, setFechaInicio] = useState(hoyLima());
  const [fechaLimite, setFechaLimite] = useState("");
  const [concepto, setConcepto] = useState("");
  const [notas, setNotas] = useState("");
  const [cuotas, setCuotas] = useState([{ monto: "", fecha: "" }, { monto: "", fecha: "" }]);
  // La última simulación, con la clave (el cuerpo) que la produjo.
  const [sim, setSim] = useState(null); // { clave, datos } | { clave, error, detalle }
  const [enviando, setEnviando] = useState(false);

  // Los procesos del cliente (y sus planes, para avisar si ya tiene uno).
  const idCliente = cliente?.id_cliente || null;
  useEffect(() => {
    if (!idCliente) return undefined;
    let vivo = true;
    boGET(`/backoffice/pagos/cliente/${idCliente}`).then((r) => {
      if (vivo) setCargaCliente({ id: idCliente, datos: r?.ok ? r : { procesos: [], planes: [] } });
    });
    return () => { vivo = false; };
  }, [idCliente]);
  const datosCliente = idCliente && cargaCliente.id === idCliente ? cargaCliente.datos : null;

  const grupos = useMemo(() => {
    const m = new Map();
    for (const i of opciones?.catalogo || []) {
      const k = i.tipo || "otro";
      if (!m.has(k)) m.set(k, []);
      m.get(k).push(i);
    }
    return [...m.entries()];
  }, [opciones]);
  const item = (opciones?.catalogo || []).find((i) => i.id === idPrecio) || null;

  const cuerpo = useMemo(() => {
    const b = {
      modalidad,
      fecha_inicio: fechaInicio || undefined,
      fecha_limite_postulacion: fechaLimite || undefined,
      concepto: concepto.trim() || undefined,
      notas: notas.trim() || undefined,
    };
    if (origen === "catalogo") b.id_precio_catalogo = idPrecio || undefined;
    else { b.total = total; b.moneda = moneda; }
    if (modalidad === "PERSONALIZADO") {
      b.cuotas = cuotas.filter((c) => c.monto !== "" || c.fecha).map((c) => ({ monto: c.monto, fecha_vencimiento: c.fecha }));
    }
    return b;
  }, [modalidad, fechaInicio, fechaLimite, concepto, notas, origen, idPrecio, total, moneda, cuotas]);

  const listo = (origen === "catalogo" ? Boolean(idPrecio) : Number(total) > 0)
    && (modalidad !== "PERSONALIZADO" || cuotas.some((c) => c.monto !== "" && c.fecha));

  // Vista previa: el servidor calcula. Cada respuesta se guarda con su clave;
  // la de un cuerpo anterior se descarta al limpiar el efecto.
  const clave = listo ? JSON.stringify(cuerpo) : null;
  useEffect(() => {
    if (!clave) return undefined;
    let vivo = true;
    const t = setTimeout(() => {
      boPOST("/backoffice/pagos/planes/simular", JSON.parse(clave)).then((r) => {
        if (!vivo) return;
        setSim(r?.ok
          ? { clave, datos: r.simulacion }
          : { clave, error: r?.msg || "No se pudo calcular el plan", detalle: r?.detalle || null });
      });
    }, 400);
    return () => { vivo = false; clearTimeout(t); };
  }, [clave]);
  const simCargando = Boolean(clave) && sim?.clave !== clave;
  const simError = sim && sim.clave === clave ? sim.error || null : null;
  // Mientras llega la nueva, se deja la anterior a la vista (atenuada).
  const d = !simError && sim?.datos ? sim.datos : null;

  function cambiarOrigen(o) {
    setOrigen(o);
    if (o === "manual") setModalidad("PERSONALIZADO");
  }

  async function crear() {
    if (!cliente?.id_cliente || simCargando || !(sim?.clave === clave && sim?.datos)) return;
    setEnviando(true);
    const r = await boPOST("/backoffice/pagos/planes", {
      ...cuerpo,
      id_cliente: cliente.id_cliente,
      id_solicitud: idSolicitud ? Number(idSolicitud) : undefined,
    });
    setEnviando(false);
    if (!r?.ok) { dialog.toast(r?.msg || "No se pudo crear el plan", "error"); return; }
    dialog.toast("Plan de pagos creado. El asesorado ya lo ve en su panel.", "success");
    onCreado?.(r.plan);
  }

  const proceso = (datosCliente?.procesos || []).find((p) => String(p.id_solicitud) === idSolicitud) || null;
  const activos = (datosCliente?.planes || []).filter((p) => p.estado === "ACTIVO").length;

  return (
    <Ventana
      abierta
      onCerrar={onCerrar}
      ancho="lg"
      titulo="Nuevo plan de pagos"
      subtitulo="Fija cuánto paga y cuándo vence cada cuota. El asesorado lo ve en su panel y recibe los recordatorios según este calendario."
      pie={(
        <>
          <Boton tono="fantasma" onClick={onCerrar}>Cancelar</Boton>
          <Boton tono="cta" cargando={enviando} disabled={!cliente || !d || simCargando} onClick={crear}>
            Crear plan
          </Boton>
        </>
      )}
    >
      <div className="ase-pg-form">
        <div style={{ display: "grid", gap: 12, alignContent: "start" }}>
          <Campo etiqueta="Cliente">
            {cliente ? (
              <div className="ase-pg-elegido">
                <div style={{ minWidth: 0 }}>
                  <b>{cliente.nombre || `Cliente #${cliente.id_cliente}`}</b>
                  {cliente.email && <span>{cliente.email}</span>}
                </div>
                {!clienteInicial && (
                  <button type="button" onClick={() => { setCliente(null); setIdSolicitud(""); }} aria-label="Cambiar de cliente">
                    <X size={15} />
                  </button>
                )}
              </div>
            ) : (
              <BuscadorCliente onElegir={setCliente} />
            )}
          </Campo>
          {activos > 0 && (
            <p className="ase-pg-nota" data-tono="ambar">
              Ya tiene {activos === 1 ? "un plan activo" : `${activos} planes activos`}. Crea otro solo si es un servicio distinto.
            </p>
          )}

          {cliente && (
            <Campo etiqueta="Proceso (opcional)">
              <select className="ase-campo" value={idSolicitud} onChange={(e) => setIdSolicitud(e.target.value)}>
                <option value="">Sin proceso</option>
                {(datosCliente?.procesos || []).map((p) => (
                  <option key={p.id_solicitud} value={String(p.id_solicitud)}>
                    {[p.servicio, p.paquete, p.etapa].filter(Boolean).join(" · ") || `Proceso #${p.id_solicitud}`}
                  </option>
                ))}
              </select>
            </Campo>
          )}
          {proceso?.fecha_limite_texto && (
            <p className="ase-pg-nota" data-tono="cielo">
              Plazo anotado en el proceso: «{proceso.fecha_limite_texto}»{proceso.fecha_limite_nota ? ` (${proceso.fecha_limite_nota})` : ""}. Úsalo como pista para la fecha límite.
            </p>
          )}

          <div>
            <span className="ase-etiqueta">Precio</span>
            <div className="ase-pills">
              <Pill on={origen === "catalogo"} onClick={() => cambiarOrigen("catalogo")}>Del catálogo 2027/28</Pill>
              <Pill on={origen === "manual"} onClick={() => cambiarOrigen("manual")}>Presupuesto a medida</Pill>
            </div>
          </div>
          {origen === "catalogo" ? (
            <Campo etiqueta="Servicio del catálogo">
              <select className="ase-campo" value={idPrecio} onChange={(e) => setIdPrecio(e.target.value)}>
                <option value="">Elige un precio…</option>
                {grupos.map(([tipo, items]) => (
                  <optgroup key={tipo} label={TIPO_CATALOGO[tipo] || tipo}>
                    {items.map((i) => <option key={i.id} value={i.id}>{etiquetaItem(i)}</option>)}
                  </optgroup>
                ))}
              </select>
            </Campo>
          ) : (
            <div className="ase-pg-dos">
              <Campo etiqueta="Total">
                <input className="ase-campo" type="number" min="0" step="0.01" value={total} onChange={(e) => setTotal(e.target.value)} />
              </Campo>
              <Campo etiqueta="Moneda">
                <select className="ase-campo" value={moneda} onChange={(e) => setMoneda(e.target.value)}>
                  {(opciones?.monedas || ["EUR", "PEN", "USD"]).map((m) => <option key={m} value={m}>{m}</option>)}
                </select>
              </Campo>
            </div>
          )}

          <div>
            <span className="ase-etiqueta">Modalidad</span>
            <div className="ase-pills">
              {Object.entries(MODALIDAD).map(([k, v]) => (
                <Pill key={k} on={modalidad === k} disabled={origen === "manual" && k !== "PERSONALIZADO"}
                  onClick={() => setModalidad(k)}>
                  {v}
                </Pill>
              ))}
            </div>
          </div>

          <div className="ase-pg-dos">
            <Campo etiqueta="Primera cuota (inicio)">
              <input className="ase-campo" type="date" value={fechaInicio} onChange={(e) => setFechaInicio(e.target.value)} />
            </Campo>
            <Campo etiqueta="Fecha límite de postulación">
              <input className="ase-campo" type="date" value={fechaLimite} onChange={(e) => setFechaLimite(e.target.value)} />
            </Campo>
          </div>

          {modalidad === "PERSONALIZADO" && (
            <div>
              <span className="ase-etiqueta">Cuotas (importe y vencimiento)</span>
              <div className="ase-pg-cuotas-edit">
                {cuotas.map((c, i) => (
                  <div key={i} className="ase-pg-cuota-edit">
                    <span className="ase-pg-nro">{i + 1}</span>
                    <input className="ase-campo" type="number" min="0" step="0.01" placeholder="Importe" value={c.monto}
                      onChange={(e) => setCuotas((cs) => cs.map((x, k) => (k === i ? { ...x, monto: e.target.value } : x)))} />
                    <input className="ase-campo" type="date" value={c.fecha}
                      onChange={(e) => setCuotas((cs) => cs.map((x, k) => (k === i ? { ...x, fecha: e.target.value } : x)))} />
                    <button type="button" className="ase-pg-quitar" aria-label={`Quitar la cuota ${i + 1}`}
                      disabled={cuotas.length === 1} onClick={() => setCuotas((cs) => cs.filter((_, k) => k !== i))}>
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
              {cuotas.length < MAX_CUOTAS && (
                <Boton tono="fantasma" tam="xs" icono={Plus} onClick={() => setCuotas((cs) => [...cs, { monto: "", fecha: "" }])}>
                  Añadir cuota
                </Boton>
              )}
            </div>
          )}

          <Campo etiqueta="Concepto">
            <input className="ase-campo" value={concepto} maxLength={200} placeholder={item?.nombre || "Qué se cobra"}
              onChange={(e) => setConcepto(e.target.value)} />
          </Campo>
          <Campo etiqueta="Notas internas (el asesorado no las ve)">
            <textarea className="ase-campo" rows={2} value={notas} onChange={(e) => setNotas(e.target.value)} />
          </Campo>
        </div>

        <aside className="ase-pg-previa" aria-live="polite">
          <p className="ase-rotulo">Vista previa</p>
          {!listo && <p className="ase-pg-previa-vacia">Elige el precio y la modalidad para ver las cuotas.</p>}
          {listo && simCargando && !d && <div className="ase-esq" style={{ height: 120 }} />}
          {listo && simError && (
            <div className="ase-pg-nota" data-tono="rojo">
              {simError}
              {modalidad === "DOS_CUOTAS" && sim.detalle?.regla === "dos_cuotas" && (
                <div style={{ marginTop: 8 }}>
                  <Boton tam="xs" tono="secundario" onClick={() => setModalidad("CONTADO")}>Pasar a contado</Boton>
                </div>
              )}
            </div>
          )}
          {listo && d && (
            <div style={{ opacity: simCargando ? 0.55 : 1, transition: "opacity .2s" }}>
              <div className="ase-pg-previa-total">
                <span>{MODALIDAD[d.modalidad]}</span>
                <b>{dinero(d.total, d.moneda)}</b>
              </div>
              <ol className="ase-pg-previa-cuotas">
                {d.cuotas.map((c) => (
                  <li key={c.nro_cuota}>
                    <span className="ase-pg-nro">{c.nro_cuota}</span>
                    <span>vence {dia(c.fecha_vencimiento)}</span>
                    <b>{dinero(c.monto, d.moneda)}</b>
                  </li>
                ))}
              </ol>
              {d.modalidad !== "DOS_CUOTAS" && d.dos_cuotas && (
                d.dos_cuotas.permitido ? (
                  <p className="ase-pg-nota" data-tono="cielo">
                    Cabría fraccionar en dos cuotas: la segunda vencería el {dia(d.dos_cuotas.segunda)}.
                  </p>
                ) : (
                  <p className="ase-pg-nota" data-tono="ambar">Dos cuotas no: {d.dos_cuotas.motivo}</p>
                )
              )}
              <div style={{ marginTop: 10 }}>
                {d.pago_en_linea
                  ? <Chip tono="verde">Pago en línea con Mercado Pago</Chip>
                  : <Chip tono="gris">Se paga por transferencia o Plin</Chip>}
              </div>
              {d.fecha_limite_postulacion && (
                <p className="ase-pg-previa-vacia" style={{ marginTop: 10 }}>
                  Todo tiene que quedar pagado antes del {dia(d.fecha_limite_postulacion)}.
                </p>
              )}
            </div>
          )}
        </aside>
      </div>
    </Ventana>
  );
}
