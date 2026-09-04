// El presupuesto que se le manda al asesorado.
//
// Se hacía a mano sobre una plantilla y se mandaba por WhatsApp. Aquí se rellena
// una vez, se ve mientras se escribe, y sale el PDF de dos páginas —honorarios y
// condiciones— listo para descargar o mandar por correo.
//
// Nada se pierde: en cuanto tiene cliente o un servicio se guarda solo, y queda
// en el historial con su estado (borrador, descargado, enviado). El asesorado
// que vuelve a los quince días encuentra el mismo presupuesto, no uno parecido
// rehecho de memoria. Y no hay botón de borrar: un presupuesto emitido es un
// documento, aunque no se llegara a mandar.
//
// La vista previa no es adorno: quien lo rellena tiene que ver lo que va a
// recibir el cliente antes de mandarlo. Un importe mal puesto en un presupuesto
// se discute después con el cliente delante.
import { useEffect, useMemo, useState } from "react";
import {
  Check, Copy, Download, FilePlus2, FileText, History, Plus, Search, Send, Trash2, X,
} from "lucide-react";
import { boGET, boPATCH, boPOST } from "../../../services/backofficeApi";
import { dialog } from "../../../services/dialogService";
import { construirPresupuestoPDF, CONDICIONES_POR_DEFECTO, JUEGOS_CONDICIONES, contravalor } from "./presupuestoPdf";
import {
  Pagina, Cabecera, Cuerpo, Boton, Chip, Campo, Ventana, Vacio, Esqueleto,
} from "../ui";

const hoy = () => {
  const d = new Date();
  const M = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio",
             "agosto", "septiembre", "octubre", "noviembre", "diciembre"];
  return `${d.getDate()} de ${M[d.getMonth()]} de ${d.getFullYear()}`;
};

const eur = (n) => `${Number(n || 0).toLocaleString("es-ES", {
  minimumFractionDigits: 2, maximumFractionDigits: 2 })} €`;
const eur0 = (n) => `${Number(n || 0).toLocaleString("es-ES", { maximumFractionDigits: 0 })} €`;

const hora = (d) => new Date(d).toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" });

/** «hace 3 min», «ayer», «12 ago». Para saber de un vistazo cuál es el reciente. */
function haceCuanto(iso) {
  const ms = Date.now() - new Date(iso).getTime();
  const min = Math.round(ms / 60000);
  if (min < 1) return "ahora mismo";
  if (min < 60) return `hace ${min} min`;
  const h = Math.round(min / 60);
  if (h < 24) return `hace ${h} h`;
  const dd = Math.round(h / 24);
  if (dd === 1) return "ayer";
  if (dd < 7) return `hace ${dd} días`;
  return new Date(iso).toLocaleDateString("es-ES", { day: "numeric", month: "short" });
}

const ESTADO = {
  borrador: { texto: "borrador", tono: "gris" },
  descargado: { texto: "descargado", tono: "petrol" },
  enviado: { texto: "enviado", tono: "verde" },
};

const VACIO = () => ({
  cliente: "", numero: "", fecha: hoy(),
  correo: "",
  servicios: [{ concepto: "", importe: "" }],
  tasas: [
    { concepto: "Tasa de homologación", importe: "" },
    { concepto: "Tasa de arraigo", importe: "" },
  ],
  nota_tasas: "Las tasas se abonan directamente al organismo y no forman parte de los honorarios.",
  pagos: [
    { texto: "50 % al contratar el servicio" },
    { texto: "50 % antes de la presentación del expediente" },
  ],
  nota_pago: "",
  // El contravalor en la moneda del asesorado, orientativo. Se rellena a mano
  // con el cambio del día: no hay una fuente que valga para un presupuesto.
  tipo_cambio: "",
  moneda_cambio: "PEN",
  // Qué juego de cláusulas lleva: el general o el del paquete de máster.
  juego_condiciones: "general",
  web: "www.inspira-legal.cloud",
  email: "administracion@inspira-legal.cloud",
});

/** Lo que llega de la base, completado con lo que le falte para que la pantalla no rompa. */
const desdeGuardado = (datos) => {
  const base = VACIO();
  const { condiciones, ...resto } = datos || {};
  return {
    d: { ...base, ...resto,
      servicios: Array.isArray(resto.servicios) && resto.servicios.length ? resto.servicios : base.servicios,
      tasas: Array.isArray(resto.tasas) ? resto.tasas : base.tasas,
      pagos: Array.isArray(resto.pagos) ? resto.pagos : base.pagos,
    },
    condiciones: Array.isArray(condiciones) && condiciones.length ? condiciones : CONDICIONES_POR_DEFECTO,
  };
};

/** Lo que se manda a guardar. Una sola función para que comparar sea comparar lo mismo. */
const armarCarga = (d, condiciones) => JSON.stringify({ datos: { ...d, condiciones } });

/** Una lista de filas que se añaden y se quitan. */
function Filas({ titulo, filas, onCambio, campos, minimo = 1 }) {
  const set = (i, k, v) => onCambio(filas.map((f, j) => (j === i ? { ...f, [k]: v } : f)));
  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
        <p className="ase-rotulo" style={{ margin: 0 }}>{titulo}</p>
        <span style={{ flex: 1, height: 1, background: "var(--line)" }} />
        <Boton tono="fantasma" tam="xs" icono={Plus} onClick={() => onCambio([...filas, {}])}>añadir</Boton>
      </div>
      {/* En el móvil el concepto y el importe no caben en la misma línea: el
          concepto ocupa su propia fila y el importe baja debajo. */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {filas.map((f, i) => (
          <div key={i} style={{ display: "flex", flexWrap: "wrap", gap: 6, alignItems: "center" }}>
            {campos.map((c) => (
              <input key={c.k}
                className="ase-campo"
                style={c.estilo || { flex: "1 1 100%", minWidth: 0 }}
                type={c.tipo || "text"} placeholder={c.ph} inputMode={c.tipo === "number" ? "decimal" : undefined}
                value={f[c.k] ?? ""} onChange={(e) => set(i, c.k, e.target.value)} />
            ))}
            <button type="button"
              onClick={() => filas.length > minimo && onCambio(filas.filter((_, j) => j !== i))}
              disabled={filas.length <= minimo}
              title="Quitar"
              style={{
                width: 34, height: 34, borderRadius: 9, border: 0, background: "transparent",
                color: filas.length <= minimo ? "#d3dfe9" : "#9fb3c0", cursor: filas.length <= minimo ? "default" : "pointer",
                display: "grid", placeItems: "center", flexShrink: 0,
              }}>
              <Trash2 size={15} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

const IMPORTE = { flex: "1 1 120px", maxWidth: 150, minWidth: 0 };

export default function PresupuestoAsesor() {
  const [d, setD] = useState(VACIO);
  const [condiciones, setCondiciones] = useState(CONDICIONES_POR_DEFECTO);
  const [id, setId] = useState(null);
  const [estado, setEstado] = useState("borrador");

  // El guardado automático: lo último que se mandó y si hay algo en vuelo.
  const [ultimoGuardado, setUltimoGuardado] = useState(null);
  const [guardando, setGuardando] = useState(false);
  const [guardadoA, setGuardadoA] = useState(null);

  const [historial, setHistorial] = useState(null);
  const [busca, setBusca] = useState("");
  const [verHistorial, setVerHistorial] = useState(
    () => new URLSearchParams(window.location.search).get("historial") === "1",
  );
  const [verCondiciones, setVerCondiciones] = useState(false);
  const [verEnviar, setVerEnviar] = useState(false);
  const [correoEnvio, setCorreoEnvio] = useState("");
  const [generando, setGenerando] = useState(false);
  const [enviando, setEnviando] = useState(false);

  const set = (k, v) => setD((p) => ({ ...p, [k]: v }));

  const total = useMemo(
    () => (d.servicios || []).reduce((n, s) => n + (parseFloat(s.importe) || 0), 0),
    [d.servicios],
  );
  const totalTasas = useMemo(
    () => (d.tasas || []).reduce((n, s) => n + (parseFloat(s.importe) || 0), 0),
    [d.tasas],
  );

  const significativo = Boolean(d.cliente?.trim() || (d.servicios || []).some((s) => s.concepto?.trim()));
  const carga = armarCarga(d, condiciones);
  const sinGuardar = significativo && carga !== ultimoGuardado;

  // ── Historial ──────────────────────────────────────────────────────────
  const cargarHistorial = () => boGET("/backoffice/presupuesto")
    .then((r) => { if (r?.ok) setHistorial(r); return r; })
    .catch(() => null);

  function cargarEnPantalla(p, { comoCopia = false, numero } = {}) {
    const { d: nd, condiciones: nc } = desdeGuardado(p.datos);
    if (comoCopia) {
      nd.numero = numero || "";
      nd.fecha = hoy();
      setId(null);
      setEstado("borrador");
      setUltimoGuardado(null);
      setGuardadoA(null);
    } else {
      setId(p.id_presupuesto);
      setEstado(p.estado || "borrador");
      setUltimoGuardado(armarCarga(nd, nc));
      setGuardadoA(p.actualizado_at);
    }
    setD(nd);
    setCondiciones(nc);
    setVerHistorial(false);
  }

  async function abrir(idAbrir, opciones) {
    const r = await boGET(`/backoffice/presupuesto/${idAbrir}`).catch(() => null);
    if (!r?.ok) return dialog.toast("No se pudo abrir ese presupuesto", "error");
    cargarEnPantalla(r.presupuesto, opciones);
    return undefined;
  }

  const duplicar = (p) => abrir(p.id_presupuesto, { comoCopia: true, numero: historial?.siguiente_numero });

  function nuevo() {
    const n = VACIO();
    n.numero = historial?.siguiente_numero || "";
    setD(n);
    setCondiciones(CONDICIONES_POR_DEFECTO);
    setId(null);
    setEstado("borrador");
    setUltimoGuardado(null);
    setGuardadoA(null);
    window.history.replaceState({}, "", "/backoffice/presupuesto");
  }

  useEffect(() => {
    const abrirId = new URLSearchParams(window.location.search).get("abrir");
    cargarHistorial().then((r) => {
      if (abrirId) abrir(abrirId);
      // Al empezar de cero se propone el número que toca. Se puede cambiar.
      else if (r?.siguiente_numero) setD((p) => (p.numero ? p : { ...p, numero: r.siguiente_numero }));
    });
    // Sólo al montar: lo demás se recarga a mano tras cada guardado.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Guardado automático ────────────────────────────────────────────────
  // Se guarda 1,2 s después de la última tecla, nunca con otro guardado en
  // vuelo. Al terminar uno, si lo escrito ya cambió, se programa el siguiente.
  useEffect(() => {
    if (!sinGuardar || guardando) return undefined;
    const t = setTimeout(() => guardar(carga), 1200);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [carga, sinGuardar, guardando, id]);

  async function guardar(cargaAGuardar) {
    setGuardando(true);
    try {
      const cuerpo = JSON.parse(cargaAGuardar);
      const r = id
        ? await boPATCH(`/backoffice/presupuesto/${id}`, cuerpo)
        : await boPOST("/backoffice/presupuesto", cuerpo);
      if (r?.ok) {
        if (!id) setId(r.presupuesto.id_presupuesto);
        setUltimoGuardado(cargaAGuardar);
        setGuardadoA(r.presupuesto.actualizado_at || new Date().toISOString());
        cargarHistorial();
        return r.presupuesto.id_presupuesto;
      }
      dialog.toast(r?.msg || "No se pudo guardar el presupuesto", "error");
    } catch (e) {
      dialog.toast(e.message || "No se pudo guardar el presupuesto", "error");
    } finally {
      setGuardando(false);
    }
    return id;
  }

  /** Antes de descargar o enviar: que lo que sale sea lo que está guardado. */
  async function asegurarGuardado() {
    if (!significativo) return id;
    if (carga === ultimoGuardado) return id;
    return guardar(carga);
  }

  async function marcar(idMarcar, nuevoEstado) {
    if (!idMarcar) return;
    // Enviado pesa más que descargado: no se vuelve atrás.
    if (estado === "enviado" && nuevoEstado !== "enviado") return;
    const r = await boPATCH(`/backoffice/presupuesto/${idMarcar}`, { estado: nuevoEstado }).catch(() => null);
    if (r?.ok) { setEstado(nuevoEstado); cargarHistorial(); }
  }

  const datos = () => ({ ...d, condiciones });

  /** Ejecuta un paso y, si falla, dice cuál. «No se pudo enviar» a secas no
   *  deja saber si fue el borrador, el PDF o el correo, y sin eso no se
   *  arregla: la asesora prueba tres veces y llama. */
  async function paso(nombre, fn) {
    try { return await fn(); }
    catch (e) {
      console.error(`[presupuesto][${nombre}]`, e);
      throw new Error(`${nombre}: ${e?.message || "error desconocido"}`);
    }
  }

  async function descargar() {
    setGenerando(true);
    try {
      const idActual = await paso("No se pudo guardar el borrador", asegurarGuardado);
      const bytes = await paso("No se pudo generar el PDF", () => construirPresupuestoPDF(datos()));
      const url = URL.createObjectURL(new Blob([bytes], { type: "application/pdf" }));
      const a = document.createElement("a");
      a.href = url;
      a.download = `Presupuesto ${d.numero || ""} ${d.cliente || ""}`.trim().replace(/\s+/g, " ") + ".pdf";
      a.click();
      URL.revokeObjectURL(url);
      await marcar(idActual, "descargado");
    } catch (e) {
      dialog.toast(e.message || "No se pudo generar el PDF", "error");
    }
    setGenerando(false);
  }

  function pedirEnvio() {
    setCorreoEnvio(d.correo || "");
    setVerEnviar(true);
  }

  async function enviar() {
    const para = correoEnvio.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(para)) return dialog.toast("Ese correo no parece válido", "error");
    setEnviando(true);
    try {
      if (para !== d.correo) set("correo", para);
      const idActual = await paso("No se pudo guardar el borrador", asegurarGuardado);
      const bytes = await paso("No se pudo generar el PDF", () => construirPresupuestoPDF({ ...datos(), correo: para }));
      // Se manda en base64 dentro del cuerpo: el PDF lo arma el navegador y el
      // servidor sólo lo adjunta, así que no hace falta subirlo a ningún sitio.
      let bin = "";
      const b = new Uint8Array(bytes);
      for (let i = 0; i < b.length; i += 1) bin += String.fromCharCode(b[i]);
      const r = await paso("No se pudo enviar el correo", () => boPOST("/backoffice/presupuesto/enviar", {
        para, cliente: d.cliente, numero: d.numero, total,
        pdf_base64: btoa(bin), id_presupuesto: idActual,
      }));
      if (r?.ok) {
        dialog.toast(`Enviado a ${r.enviado_a}`, "exito");
        setEstado("enviado");
        setVerEnviar(false);
        cargarHistorial();
      } else dialog.toast(r?.msg || "No se pudo enviar", "error");
    } catch (e) {
      dialog.toast(e.message || "No se pudo enviar", "error");
    }
    setEnviando(false);
    return undefined;
  }

  // ── Derivados de pantalla ──────────────────────────────────────────────
  const est = ESTADO[estado] || ESTADO.borrador;
  const lista = useMemo(() => {
    const todos = historial?.presupuestos || [];
    const q = busca.trim().toLowerCase();
    if (!q) return todos;
    return todos.filter((p) => [p.cliente, p.numero, p.correo, p.usuario?.nombre]
      .some((x) => (x || "").toLowerCase().includes(q)));
  }, [historial, busca]);

  const textoGuardado = guardando ? "Guardando…"
    : sinGuardar ? "Cambios sin guardar"
    : guardadoA ? `Guardado a las ${hora(guardadoA)}`
    : significativo ? "Guardado" : "Se guarda solo en cuanto tenga cliente o un servicio";

  const stats = [
    { n: historial?.mes?.cuantos ?? 0, l: "este mes" },
    { n: historial?.mes?.honorarios ?? 0, l: "honorarios del mes", tono: "cielo", formato: eur0 },
    { n: historial?.mes?.enviados ?? 0, l: "enviados", tono: "ok" },
    { n: (historial?.presupuestos || []).length, l: "en el historial", onClick: () => setVerHistorial(true) },
  ];

  return (
    <Pagina>
      <Cabecera
        eyebrow="Presupuesto"
        titulo={d.cliente?.trim() ? d.cliente : "Presupuesto nuevo"}
        subtitulo={
          <>
            {d.numero ? `Nº ${d.numero} · ` : ""}{d.fecha}
            {" · "}
            <span style={{ color: "#fff", fontWeight: 600 }}>{est.texto}</span>
            {" — se rellena aquí, se ve al lado y sale en PDF de dos páginas con las condiciones."}
          </>
        }
        acciones={
          <>
            <Boton tono="cristal" icono={History} onClick={() => setVerHistorial(true)}>
              Últimos presupuestos
            </Boton>
            <Boton tono="cristal" icono={FilePlus2} onClick={nuevo}>Nuevo</Boton>
          </>
        }
        stats={stats}
      />

      <Cuerpo>
        {/* La barra de acciones acompaña al hacer scroll: en el móvil el
            formulario es largo y el botón de enviar no puede quedarse arriba. */}
        <div className="ase-pegajosa" style={{ marginTop: -22 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 11.5, color: "var(--muted)", flex: "1 1 200px" }}>
              {guardando ? <span className="ase-spin" style={{ width: 12, height: 12 }} />
                : sinGuardar ? <span style={{ width: 8, height: 8, borderRadius: 4, background: "var(--accent)" }} />
                : <Check size={14} color="#1D6A4A" />}
              {textoGuardado}
              {id && <span style={{ opacity: .6 }}>· #{id}</span>}
            </span>
            <Chip tono={est.tono}>{est.texto}</Chip>
            <div style={{ display: "flex", gap: 8, flex: "1 1 auto", justifyContent: "flex-end" }}>
              <Boton tono="secundario" icono={Download} cargando={generando} onClick={descargar} style={{ flex: "1 1 auto" }}>
                Descargar PDF
              </Boton>
              <Boton tono="cta" icono={Send} onClick={pedirEnvio} style={{ flex: "1 1 auto" }}>
                Enviar por correo
              </Boton>
            </div>
          </div>
        </div>

        {estado === "enviado" && (
          <div className="ase-tarjeta" style={{ padding: "10px 14px", fontSize: 12.5, color: "var(--amber)", background: "var(--amber-soft)", borderColor: "rgba(185,119,14,.3)" }}>
            Este presupuesto ya se envió. Si hay que cambiarle algo, mejor <b>duplicarlo</b> desde el historial y mandar el nuevo: así queda constancia de lo que recibió cada vez.
          </div>
        )}

        {/* En el móvil no caben dos columnas: el formulario va entero y la vista
            previa debajo. */}
        <div style={{ display: "grid", gap: 18, gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 24rem), 1fr))", alignItems: "start" }}>

          {/* ── Formulario ── */}
          <div className="ase-anim" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div className="ase-tarjeta ase-tarjeta-p">
              <p className="ase-rotulo">A quién</p>
              <div style={{ display: "grid", gap: 12, gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 12rem), 1fr))" }}>
                <Campo etiqueta="Cliente">
                  <input className="ase-campo" value={d.cliente} autoFocus
                    onChange={(e) => set("cliente", e.target.value)} placeholder="Nombre y apellidos" />
                </Campo>
                <Campo etiqueta="Nº de presupuesto">
                  <input className="ase-campo ase-num" value={d.numero}
                    onChange={(e) => set("numero", e.target.value)} placeholder={historial?.siguiente_numero || "2026-001"} />
                </Campo>
                <Campo etiqueta="Fecha">
                  <input className="ase-campo" value={d.fecha} onChange={(e) => set("fecha", e.target.value)} />
                </Campo>
                <Campo etiqueta="Correo del asesorado">
                  <input className="ase-campo" type="email" value={d.correo} inputMode="email"
                    onChange={(e) => set("correo", e.target.value)} placeholder="nombre@correo.com" />
                </Campo>
              </div>
            </div>

            <div className="ase-tarjeta ase-tarjeta-p" style={{ display: "flex", flexDirection: "column", gap: 18 }}>
              <Filas titulo="Servicios y honorarios" filas={d.servicios}
                onCambio={(v) => set("servicios", v)}
                campos={[
                  { k: "concepto", ph: "Servicio (p. ej. Tramitación de estancia por estudios)" },
                  { k: "importe", ph: "0,00 €", tipo: "number", estilo: IMPORTE },
                ]} />
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", padding: "10px 12px", borderRadius: 11, background: "var(--sky-soft)" }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: "var(--primary)" }}>Total honorarios</span>
                <span className="ase-precio" style={{ fontSize: 20 }}>{eur(total)}</span>
              </div>
              <Filas titulo="Tasas adicionales" filas={d.tasas}
                onCambio={(v) => set("tasas", v)} minimo={0}
                campos={[
                  { k: "concepto", ph: "Concepto de la tasa" },
                  { k: "importe", ph: "0,00 €", tipo: "number", estilo: IMPORTE },
                  // A quién se paga, cuándo, si el importe es estimado. Sale
                  // debajo de la tasa en el PDF, en letra pequeña.
                  { k: "nota", ph: "Detalle de esta tasa (opcional)" },
                ]} />
              <Campo etiqueta="Nota sobre las tasas">
                <textarea rows={2} className="ase-campo" value={d.nota_tasas}
                  onChange={(e) => set("nota_tasas", e.target.value)} />
              </Campo>
              <Filas titulo="Formas de pago" filas={d.pagos}
                onCambio={(v) => set("pagos", v)} minimo={0}
                campos={[{ k: "texto", ph: "50 % al contratar…" }]} />

              {/* El asesorado piensa en soles o en dólares. Sin el contravalor
                  hace la cuenta por su lado con el cambio que encuentre y luego
                  discute la diferencia; con él, queda escrito que es orientativo
                  y que el cobro es en euros. */}
              <div>
                <p className="ase-rotulo" style={{ margin: "0 0 8px" }}>Moneda de referencia</p>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
                  <span style={{ fontSize: 12.5, color: "var(--muted)" }}>1 € =</span>
                  <input className="ase-campo ase-num" type="number" inputMode="decimal" step="0.01" min="0"
                    style={{ flex: "0 1 120px", minWidth: 0 }} placeholder="4,10"
                    value={d.tipo_cambio} onChange={(e) => set("tipo_cambio", e.target.value)} />
                  <select className="ase-campo" style={{ flex: "0 1 150px" }}
                    value={d.moneda_cambio} onChange={(e) => set("moneda_cambio", e.target.value)}>
                    <option value="PEN">PEN · soles</option>
                    <option value="USD">USD · dólares</option>
                    <option value="COP">COP · pesos colombianos</option>
                    <option value="MXN">MXN · pesos mexicanos</option>
                    <option value="CLP">CLP · pesos chilenos</option>
                    <option value="ARS">ARS · pesos argentinos</option>
                  </select>
                  {contravalor(d, total) && (
                    <span style={{ flex: "1 1 100%", fontSize: 11.5, color: "var(--muted)" }}>{contravalor(d, total)}</span>
                  )}
                </div>
              </div>
            </div>

            <div className="ase-tarjeta ase-tarjeta-p" style={{ display: "flex", gap: 14, alignItems: "center", flexWrap: "wrap" }}>
              <span className="ase-icono" data-tono="petrol"><FileText /></span>
              <div style={{ flex: "1 1 200px", minWidth: 0 }}>
                <p style={{ margin: 0, fontSize: 13.5, fontWeight: 700 }}>Condiciones del servicio</p>
                <p style={{ margin: "3px 0 0", fontSize: 12, color: "var(--muted)", lineHeight: 1.5 }}>
                  {condiciones.length} cláusulas en la segunda página del PDF. Un presupuesto sin
                  condiciones es una cifra suelta: cuando alguien discute qué incluía, no hay a qué mirar.
                </p>
              </div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
                {/* Cambiar de juego sustituye las cláusulas enteras: quien haya
                    retocado alguna a mano la pierde, y se avisa antes. */}
                <select className="ase-campo" style={{ minWidth: 200 }} value={d.juego_condiciones || "general"}
                  onChange={(e) => {
                    const j = e.target.value;
                    const base = JUEGOS_CONDICIONES[d.juego_condiciones || "general"]?.lista;
                    const retocadas = JSON.stringify(condiciones) !== JSON.stringify(base);
                    if (retocadas && !window.confirm("Hay cláusulas retocadas a mano. Al cambiar de juego se sustituyen por las del nuevo. ¿Seguir?")) return;
                    set("juego_condiciones", j);
                    setCondiciones(JUEGOS_CONDICIONES[j]?.lista || CONDICIONES_POR_DEFECTO);
                  }}>
                  {Object.entries(JUEGOS_CONDICIONES).map(([k, v]) => <option key={k} value={k}>{v.etiqueta}</option>)}
                </select>
                <Boton tono="secundario" tam="sm" onClick={() => setVerCondiciones(true)}>Editar cláusulas</Boton>
              </div>
            </div>
          </div>

          {/* ── Vista previa ── */}
          <div className="ase-entra" style={{ position: "sticky", top: 70 }}>
            <p className="ase-rotulo">Lo que va a recibir</p>
            <div style={{
              background: "#fff", border: "1px solid var(--line)", borderRadius: 14, overflow: "hidden",
              boxShadow: "0 24px 50px -24px rgba(1,52,70,.35), 0 1px 2px rgba(1,52,70,.06)",
            }}>
              <div style={{ padding: "20px 22px 12px", display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                <div>
                  <p style={{ margin: 0, fontSize: 21, fontWeight: 800, color: "#173A5E", lineHeight: 1 }}>inspira</p>
                  <p style={{ margin: "4px 0 0", fontSize: 7.5, letterSpacing: ".18em", color: "#9fb3c0" }}>SUEÑA · APRENDE · VIAJA</p>
                </div>
                <div style={{ textAlign: "right" }}>
                  <p style={{ margin: 0, fontSize: 8.5, color: "#9fb3c0" }}>Especialistas en Extranjería</p>
                  <p style={{ margin: 0, fontSize: 17, fontWeight: 800, color: "#173A5E", lineHeight: 1.2 }}>PRESUPUESTO</p>
                  {d.numero && (
                    <span style={{ display: "inline-block", marginTop: 4, fontSize: 10, fontWeight: 700, color: "#fff", background: "#F58220", padding: "2px 8px", borderRadius: 4 }}>
                      Nº {d.numero}
                    </span>
                  )}
                </div>
              </div>

              <div style={{ padding: "0 22px 12px" }}>
                <p style={{ margin: 0, fontSize: 9, fontWeight: 700, color: "#173A5E" }}>CLIENTE</p>
                <p style={{ margin: 0, fontSize: 12.5, color: "#0d2c3a", borderBottom: "1px solid #e4ecf3", paddingBottom: 4 }}>
                  {d.cliente || <span style={{ color: "#c5d5e2" }}>—</span>}
                </p>
                <p style={{ margin: "4px 0 0", fontSize: 9, color: "#9fb3c0" }}>{d.fecha}</p>
              </div>

              <div style={{ padding: "0 22px" }}>
                <div style={{ background: "#173A5E", color: "#fff", display: "flex", padding: "8px 12px", borderRadius: "6px 6px 0 0" }}>
                  <span style={{ fontSize: 10, fontWeight: 700, flex: 1 }}>SERVICIO</span>
                  <span style={{ fontSize: 10, fontWeight: 700 }}>HONORARIOS</span>
                </div>
                {(d.servicios || []).filter((s) => s.concepto || s.importe).map((s, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", padding: "8px 12px", borderBottom: "1px solid #eef3f8", background: i % 2 === 0 ? "#f8fafc" : "#fff" }}>
                    <span style={{ fontSize: 11.5, color: "#33505e", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.concepto || "—"}</span>
                    <span className="ase-num" style={{ fontSize: 11.5, fontWeight: 700, color: "#173A5E" }}>{eur(s.importe)}</span>
                  </div>
                ))}
                <div style={{ display: "flex", alignItems: "center", padding: "8px 12px", background: "rgba(23,58,94,.06)", borderRadius: "0 0 6px 6px" }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: "#173A5E", flex: 1 }}>Total honorarios</span>
                  <span className="ase-num" style={{ fontSize: 14, fontWeight: 800, color: "#173A5E" }}>{eur(total)}</span>
                </div>
                {contravalor(d, total) && (
                  <p style={{ margin: "6px 2px 0", fontSize: 8.5, color: "#8aa0ad", lineHeight: 1.4 }}>{contravalor(d, total)}</p>
                )}
              </div>

              <div style={{ padding: "16px 22px", display: "grid", gap: 12, gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 12rem), 1fr))" }}>
                <div style={{ border: "1px solid rgba(245,130,32,.7)", background: "#FEF6EC", borderRadius: 8, padding: 12 }}>
                  <p style={{ margin: "0 0 6px", fontSize: 9.5, fontWeight: 700, color: "#173A5E" }}>TASAS ADICIONALES</p>
                  {(d.tasas || []).filter((t) => t.concepto || t.importe).map((t, i) => (
                    <div key={i}>
                      <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
                        <span style={{ fontSize: 10, color: "#33505e", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>· {t.concepto}</span>
                        <span className="ase-num" style={{ fontSize: 10, fontWeight: 600, color: "#33505e" }}>{eur(t.importe)}</span>
                      </div>
                      {t.nota && <p style={{ margin: "1px 0 3px 10px", fontSize: 8.5, color: "#8aa0ad", lineHeight: 1.35 }}>{t.nota}</p>}
                    </div>
                  ))}
                  {totalTasas > 0 && (
                    <p style={{ margin: "6px 0 0", paddingTop: 6, borderTop: "1px solid rgba(245,130,32,.3)", fontSize: 9.5, color: "#62808f" }}>
                      Aparte de los honorarios: <b>{eur(totalTasas)}</b>
                    </p>
                  )}
                  {d.nota_tasas && <p style={{ margin: "6px 0 0", fontSize: 8.5, color: "#62808f", lineHeight: 1.4 }}>{d.nota_tasas}</p>}
                </div>
                <div style={{ border: "1px solid rgba(23,58,94,.5)", borderRadius: 8, padding: 12 }}>
                  <p style={{ margin: "0 0 6px", fontSize: 9.5, fontWeight: 700, color: "#173A5E" }}>FORMAS DE PAGO</p>
                  {(d.pagos || []).filter((p) => p.texto).map((p, i) => (
                    <div key={i} style={{ display: "flex", gap: 6 }}>
                      <span style={{ fontSize: 10, fontWeight: 700, color: "#F58220" }}>{i + 1}.</span>
                      <span style={{ fontSize: 10, color: "#33505e", lineHeight: 1.4 }}>{p.texto}</span>
                    </div>
                  ))}
                  {d.nota_pago && <p style={{ margin: "6px 0 0", fontSize: 8.5, color: "#62808f", lineHeight: 1.4 }}>{d.nota_pago}</p>}
                </div>
              </div>

              <div style={{ padding: "8px 22px 16px", display: "flex", justifyContent: "space-between", borderTop: "1px solid #eef3f8" }}>
                <span style={{ fontSize: 8.5, color: "#9fb3c0" }}>{d.web}</span>
                <span style={{ fontSize: 8.5, color: "#9fb3c0" }}>{d.email}</span>
              </div>
            </div>
            <p style={{ fontSize: 10.5, color: "#8aa0ad", marginTop: 8, lineHeight: 1.5 }}>
              La segunda página del PDF lleva las {condiciones.length} cláusulas de condiciones. Aquí sólo se ve la primera.
            </p>
          </div>
        </div>
      </Cuerpo>

      {/* ── Ventana: últimos presupuestos ── */}
      <Ventana
        abierta={verHistorial}
        onCerrar={() => setVerHistorial(false)}
        titulo="Últimos presupuestos"
        subtitulo="Todo lo que se ha escrito, se haya mandado o no. Nada se borra."
        ancho="lg"
        pie={<Boton tono="primario" icono={FilePlus2} onClick={() => { nuevo(); setVerHistorial(false); }}>Empezar uno nuevo</Boton>}
      >
        <div className="ase-buscar" style={{ marginBottom: 12 }}>
          <Search />
          <input className="ase-campo" placeholder="Buscar por cliente, número o correo…" value={busca}
            onChange={(e) => setBusca(e.target.value)} autoFocus />
        </div>
        {historial === null ? <Esqueleto filas={4} /> : lista.length === 0 ? (
          <Vacio icono={History} titulo={busca ? "Nada coincide" : "Todavía no hay presupuestos"}
            texto={busca ? "Prueba con otro nombre o con el número." : "El primero que se escriba quedará aquí aunque no se llegue a mandar."} />
        ) : (
          <div className="ase-lista ase-anim">
            {lista.map((p) => {
              const e = ESTADO[p.estado] || ESTADO.borrador;
              const actual = p.id_presupuesto === id;
              return (
                <div key={p.id_presupuesto} className="ase-fila" data-activa={actual ? "1" : "0"}
                  role="button" tabIndex={0}
                  onClick={() => abrir(p.id_presupuesto)}
                  onKeyDown={(ev) => { if (ev.key === "Enter") abrir(p.id_presupuesto); }}>
                  <span style={{ minWidth: 0, flex: 1 }}>
                    <span style={{ display: "flex", alignItems: "center", gap: 7, flexWrap: "wrap" }}>
                      <span style={{ fontSize: 13.5, fontWeight: 700 }}>{p.cliente || "Sin nombre"}</span>
                      <Chip tono={e.tono}>{e.texto}</Chip>
                      {actual && <Chip tono="ambar">abierto</Chip>}
                    </span>
                    <span className="ase-num" style={{ display: "block", fontSize: 11.5, color: "var(--muted)", marginTop: 3 }}>
                      {p.numero ? `Nº ${p.numero} · ` : ""}{haceCuanto(p.actualizado_at)}
                      {p.usuario?.nombre ? ` · ${p.usuario.nombre.split(" ")[0]}` : ""}
                      {p.correo ? ` · ${p.correo}` : ""}
                    </span>
                  </span>
                  <span className="ase-precio" style={{ fontSize: 16 }}>{eur0(p.total)}</span>
                  <Boton tono="secundario" tam="xs" icono={Copy} title="Duplicar como uno nuevo"
                    onClick={(ev) => { ev.stopPropagation(); duplicar(p); }}>
                    <span className="hidden sm:inline">Duplicar</span>
                  </Boton>
                </div>
              );
            })}
          </div>
        )}
      </Ventana>

      {/* ── Ventana: condiciones ── */}
      <Ventana
        abierta={verCondiciones}
        onCerrar={() => setVerCondiciones(false)}
        titulo="Condiciones del servicio"
        subtitulo="Van en la segunda página del PDF, numeradas. Se guardan con este presupuesto."
        ancho="lg"
        pie={
          <>
            <Boton tono="secundario" onClick={() => setCondiciones(JUEGOS_CONDICIONES[d.juego_condiciones || "general"]?.lista || CONDICIONES_POR_DEFECTO)}>Volver a las del juego</Boton>
            <Boton tono="primario" icono={Check} onClick={() => setVerCondiciones(false)}>Listo</Boton>
          </>
        }
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {condiciones.map((c, i) => (
            <div key={i} className="ase-tarjeta" style={{ padding: 12, display: "flex", gap: 10 }}>
              <span className="ase-num" style={{ fontFamily: "Merriweather, Georgia, serif", fontSize: 15, fontWeight: 700, color: "var(--sky-2)", width: 24, flexShrink: 0, paddingTop: 8 }}>{i + 1}</span>
              <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 6 }}>
                <input className="ase-campo" style={{ fontWeight: 700 }} value={c.t} placeholder="Título de la cláusula"
                  onChange={(e) => setCondiciones(condiciones.map((x, j) => (j === i ? { ...x, t: e.target.value } : x)))} />
                <textarea rows={3} className="ase-campo" value={c.p} placeholder="Texto"
                  onChange={(e) => setCondiciones(condiciones.map((x, j) => (j === i ? { ...x, p: e.target.value } : x)))} />
              </div>
              <button type="button" title="Quitar" onClick={() => setCondiciones(condiciones.filter((_, j) => j !== i))}
                style={{ width: 30, height: 30, borderRadius: 8, border: 0, background: "transparent", color: "#9fb3c0", cursor: "pointer", display: "grid", placeItems: "center", flexShrink: 0 }}>
                <X size={15} />
              </button>
            </div>
          ))}
          <Boton tono="fantasma" icono={Plus} onClick={() => setCondiciones([...condiciones, { t: "", p: "" }])} style={{ alignSelf: "flex-start" }}>
            Añadir cláusula
          </Boton>
        </div>
      </Ventana>

      {/* ── Ventana: enviar ── */}
      <Ventana
        abierta={verEnviar}
        onCerrar={() => !enviando && setVerEnviar(false)}
        titulo="Enviar el presupuesto"
        subtitulo="Va como PDF adjunto, con las dos páginas, desde el correo de administración."
        ancho="sm"
        pie={
          <>
            <Boton tono="secundario" onClick={() => setVerEnviar(false)} disabled={enviando}>Cancelar</Boton>
            <Boton tono="cta" icono={Send} cargando={enviando} onClick={enviar}>Enviar ahora</Boton>
          </>
        }
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div className="ase-tarjeta" style={{ padding: 14, background: "var(--ground)" }}>
            <dl className="ase-kv">
              <dt>Cliente</dt><dd style={{ fontWeight: 700 }}>{d.cliente || "—"}</dd>
              <dt>Número</dt><dd className="ase-num">{d.numero || "—"}</dd>
              <dt>Honorarios</dt><dd className="ase-num" style={{ fontWeight: 700 }}>{eur(total)}</dd>
              {totalTasas > 0 && <><dt>Tasas aparte</dt><dd className="ase-num">{eur(totalTasas)}</dd></>}
            </dl>
          </div>
          <Campo etiqueta="Correo del asesorado">
            <input className="ase-campo" type="email" inputMode="email" autoFocus value={correoEnvio}
              onChange={(e) => setCorreoEnvio(e.target.value)} placeholder="nombre@correo.com"
              onKeyDown={(e) => { if (e.key === "Enter") enviar(); }} />
          </Campo>
          {estado === "enviado" && (
            <p style={{ margin: 0, fontSize: 12, color: "var(--amber)" }}>
              Ya se envió una vez. Se volverá a mandar tal como está ahora.
            </p>
          )}
        </div>
      </Ventana>
    </Pagina>
  );
}
