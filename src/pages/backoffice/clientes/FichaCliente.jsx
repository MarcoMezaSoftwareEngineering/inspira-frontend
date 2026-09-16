// Ficha del cliente: todo lo suyo en una pantalla.
//
// Antes había que abrir cuatro sitios distintos para entender a alguien: sus
// datos en Clientes, sus procesos en Solicitudes, sus pagos en ningún lado y
// sus notas dentro de cada expediente. Aquí está junto.
import HistorialCliente from "./HistorialCliente";
import CoherenciaDatos from "./CoherenciaDatos";
import CorreosCliente from "./CorreosCliente";
import { useCallback, useEffect, useState } from "react";
import { boGET, boPOST, boPATCH, boDELETE, boFetch } from "../../../services/backofficeApi";
import AltaRapida from "./AltaRapida";
// Se oculta sola a quien no tiene pagos.ver.
import PlanesCliente from "../pagos/PlanesCliente";

/* El voucher está detrás de autenticación, así que un enlace normal daría 401:
   el token va en cabecera, no en la URL. Se pide, se convierte en blob y se
   abre en otra pestaña. */
function VerVoucher({ idPago }) {
  const [abriendo, setAbriendo] = useState(false);

  async function abrir() {
    setAbriendo(true);
    try {
      const r = await boFetch(`/backoffice/procesos/pago/${idPago}/comprobante`);
      if (r?.ok) {
        const url = URL.createObjectURL(await r.blob());
        window.open(url, "_blank", "noopener");
        // Se suelta después de que el navegador lo haya cargado; revocarlo
        // en el acto deja la pestaña en blanco.
        setTimeout(() => URL.revokeObjectURL(url), 60000);
      }
    } finally {
      setAbriendo(false);
    }
  }

  return (
    <button type="button" onClick={abrir} disabled={abriendo}
      title="Ver voucher"
      className="shrink-0 text-[10.5px] font-semibold text-[#046C8C] hover:underline disabled:opacity-50">
      {abriendo ? "…" : "voucher"}
    </button>
  );
}

const TONO_SERVICIO = {
  master: "bg-[#EEF2F8] text-[#1A3557]",
  visa:   "bg-[#FEF3E7] text-[#B9770E]",
  ee:     "bg-[#F5EEF8] text-[#7D3C98]",
  fp:     "bg-[#E8F5EE] text-[#1D6A4A]",
  legal:  "bg-[#FDEDEC] text-[#C0392B]",
};

function fecha(v) {
  if (!v) return "—";
  try {
    return new Date(v).toLocaleDateString("es-PE", { day: "2-digit", month: "short", year: "numeric" });
  } catch { return "—"; }
}

function Dato({ label, valor }) {
  return (
    <div>
      <p className="text-[9px] font-bold uppercase tracking-widest font-mono text-[#62808f]">{label}</p>
      <p className="text-[13px] text-neutral-800 mt-0.5">{valor || <span className="text-neutral-300">—</span>}</p>
    </div>
  );
}

function Bloque({ titulo, extra, children }) {
  return (
    <section className="bg-white border border-neutral-200 rounded-xl p-4">
      <div className="flex items-center justify-between gap-2 mb-3">
        <p className="text-[9px] font-bold uppercase tracking-widest font-mono text-[#62808f]">{titulo}</p>
        {extra}
      </div>
      {children}
    </section>
  );
}

/**
 * Un servicio del cliente, con lo que se puede hacer con el.
 *
 * Antes era solo un enlace: para asignar a alguien, reenviar el acceso o
 * retirar un duplicado habia que ir a otra pantalla o pedirselo a alguien. Lo
 * que se ve mal desde aqui se arregla desde aqui.
 */
function TarjetaServicio({ p: proc, equipo, onAbrir, onCambio }) {
  const [ocupado, setOcupado] = useState("");
  const [msg, setMsg] = useState(null);

  async function asignar(id) {
    setOcupado("asesor");
    const r = await boPATCH(`/backoffice/solicitudes/${proc.id_solicitud}/asesor`, {
      id_asesor_asignado: id || null,
    });
    setOcupado("");
    if (r?.ok) onCambio(); else setMsg({ mal: true, texto: r?.msg || "No se pudo asignar" });
  }

  async function reenviar() {
    setOcupado("correo"); setMsg(null);
    const r = await boPOST(`/backoffice/solicitudes/${proc.id_solicitud}/reenviar-acceso`, {});
    setOcupado("");
    setMsg(r?.ok
      ? { texto: `Acceso reenviado a ${r.para}` }
      : { mal: true, texto: r?.msg || "No se pudo reenviar" });
  }

  async function retirar() {
    const seguro = window.confirm(
      `¿Retirar «${proc.servicio_label}» de este cliente?\n\n` +
      "Va a la papelera, no se borra: un administrador puede recuperarlo."
    );
    if (!seguro) return;
    setOcupado("papelera"); setMsg(null);
    const r = await boDELETE(`/backoffice/solicitudes/${proc.id_solicitud}`);
    setOcupado("");
    if (r?.ok) onCambio(); else setMsg({ mal: true, texto: r?.msg || "No se pudo retirar" });
  }

  return (
    <div className={`border rounded-lg px-3 py-2.5 ${
      proc.cerrado ? "border-neutral-200 bg-neutral-50 opacity-70" : "border-neutral-200 bg-white"
    }`}>
      <button type="button" onClick={() => onAbrir?.(proc.id_solicitud)}
        className="w-full text-left">
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${TONO_SERVICIO[proc.servicio]}`}>
            {proc.servicio_label}
          </span>
          <span className="text-[12.5px] font-semibold text-neutral-800">{proc.etapa}</span>
          {proc.etapa_deducida && (
            <span className="text-[10px] text-[#62808f]"
              title="Sale del estado del expediente; nadie la ha confirmado a mano">
              (deducida)
            </span>
          )}
          <span className="ml-auto text-[11px] text-[#62808f]">{proc.progreso}%</span>
        </div>
        {proc.que && !proc.cerrado && (
          <p className="mt-1.5 text-[12.5px] text-[#0d2c3a] leading-snug">
            <b className="font-semibold">{proc.le_toca === "asesor" ? (proc.responsable?.split(" ")[0] || "Asesor") : proc.le_toca === "asesorado" ? "Asesorado" : proc.le_toca === "tercero" ? "Organismo" : ""}{proc.le_toca !== "nadie" ? ": " : ""}</b>
            {proc.que}
            {proc.proximo && <span className={proc.proximo.vencido ? "text-[#c0392b] font-semibold" : "text-[#62808f]"}> · {proc.proximo.etiqueta} {proc.proximo.vencido ? `hace ${-proc.proximo.dias} d` : `en ${proc.proximo.dias} d`}</span>}
          </p>
        )}
        <div className="flex items-center gap-2 mt-1 flex-wrap text-[11px] text-neutral-500">
          {proc.paquete && <span>{proc.paquete}</span>}
          {proc.comunidades.length > 0 && <span>· {proc.comunidades.join(", ")}</span>}
          {proc.docs_observados > 0 && (
            <span className="text-red-600 font-semibold">· {proc.docs_observados} obs</span>
          )}
        </div>
      </button>

      <div className="flex items-center gap-2 flex-wrap mt-2 pt-2 border-t border-neutral-100">
        <select
          value={proc.id_responsable || ""} disabled={ocupado === "asesor"}
          onChange={(e) => asignar(e.target.value)}
          className={`text-[11px] rounded-lg border px-2 py-1 bg-white max-w-[170px] ${
            proc.id_responsable ? "border-neutral-300 text-neutral-700"
              : "border-amber-300 bg-amber-50 text-amber-700 font-semibold"
          }`}
        >
          <option value="">Sin asignar</option>
          {equipo.map((u) => (
            <option key={u.id_usuario} value={u.id_usuario}>{u.nombre}</option>
          ))}
        </select>

        <button type="button" onClick={reenviar} disabled={Boolean(ocupado)}
          title="Vuelve a mandarle el correo con sus datos de acceso al portal"
          className="text-[11px] font-semibold text-[#046C8C] hover:underline disabled:opacity-40">
          {ocupado === "correo" ? "enviando…" : "✉ Reenviar acceso"}
        </button>

        <button type="button" onClick={retirar} disabled={Boolean(ocupado)}
          title="A la papelera. No se borra."
          className="ml-auto text-[11px] text-[#62808f] hover:text-red-600 disabled:opacity-40">
          {ocupado === "papelera" ? "…" : "Retirar"}
        </button>
      </div>

      {msg && (
        <p className={`text-[11px] mt-1.5 leading-relaxed ${
          msg.mal ? "text-red-600" : "text-[#1D6A4A]"
        }`}>{msg.texto}</p>
      )}
    </div>
  );
}

export default function FichaCliente({ idCliente, onVolver, onAbrirProceso }) {
  const [datos, setDatos] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [nota, setNota] = useState("");
  const [guardandoNota, setGuardandoNota] = useState(false);
  const [anadiendo, setAnadiendo] = useState(false);
  const [cobrando, setCobrando] = useState(false);
  const [pestana, setPestana] = useState("resumen");
  const [cobro, setCobro] = useState({ monto: "", moneda: "EUR", id_solicitud: "", cobrado: true, vence: "" });

  const cargar = useCallback(() => {
    return boGET(`/backoffice/ficha-cliente/${idCliente}`).then((r) => {
      if (r.ok) { setDatos(r); setError(""); }
      else setError(r.msg || "No se pudo cargar la ficha");
      setCargando(false);
    });
  }, [idCliente]);

  // Quién puede llevar un servicio. Se pide una vez: no cambia cada rato.
  const [equipo, setEquipo] = useState([]);
  useEffect(() => {
    boGET("/backoffice/solicitudes/equipo").then((r) => {
      if (r?.ok) setEquipo(r.equipo || []);
    });
  }, []);

  useEffect(() => {
    boGET(`/backoffice/ficha-cliente/${idCliente}`).then((r) => {
      if (r.ok) { setDatos(r); setError(""); }
      else setError(r.msg || "No se pudo cargar la ficha");
      setCargando(false);
    });
  }, [idCliente]);

  // La nota es del cliente, no de un proceso suyo: lo que se anota de alguien
  // ("no contesta", "quiere esperar al año que viene") no pertenece a un
  // trámite concreto.
  async function anadirNota() {
    const texto = nota.trim();
    if (!texto) return;
    setGuardandoNota(true);
    const r = await boPOST(`/backoffice/ficha-cliente/${idCliente}/notas`, { texto });
    setGuardandoNota(false);
    if (r.ok) { setNota(""); cargar(); }
  }

  async function registrarCobro() {
    const r = await boPOST(`/backoffice/procesos/${cobro.id_solicitud}/pago`, {
      monto: cobro.monto,
      moneda: cobro.moneda,
      estado_pago: cobro.cobrado ? "aprobado" : "pendiente",
      fecha_vencimiento: cobro.vence || undefined,
    });
    if (r.ok) {
      setCobrando(false);
      setCobro({ monto: "", moneda: "EUR", id_solicitud: "", cobrado: true, vence: "" });
      cargar();
    }
  }

  if (cargando) {
    return (
      <div className="space-y-3">
        <div className="ase-esq" style={{ height: 150, borderRadius: 20 }} />
        <div className="ase-esq" style={{ height: 44 }} />
        <div className="ase-esq" style={{ height: 120 }} />
        <div className="ase-esq" style={{ height: 120, opacity: .7 }} />
      </div>
    );
  }
  if (error) return (
    <div className="space-y-3">
      <button onClick={onVolver} className="text-[12px] font-semibold text-[#1D6A4A]">← Volver</button>
      <p className="text-[13px] text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>
    </div>
  );

  const { cliente, procesos, finanzas, notas } = datos;
  const activos = procesos.filter((p) => !p.cerrado);
  const tel = String(cliente.telefono || "").replace(/[^\d]/g, "");
  const pila = String(cliente.nombre || "").trim().split(/\s+/)[0] || "";
  const inic = String(cliente.nombre || "?").trim().split(/\s+/).slice(0, 2).map((w) => w[0]?.toUpperCase() || "").join("");

  // La frase de estado: lo más urgente de sus procesos activos.
  const urgente = [...activos].filter((p) => p.que)
    .sort((a, b) => (a.proximo?.dias ?? 999) - (b.proximo?.dias ?? 999))[0];
  const quien = urgente
    ? urgente.le_toca === "asesor" ? (urgente.responsable ? urgente.responsable.split(" ")[0] : "Asesor")
      : urgente.le_toca === "asesorado" ? pila : urgente.le_toca === "tercero" ? "Organismo" : null
    : null;

  const PESTANAS = [
    { k: "resumen", t: "Resumen" },
    { k: "servicios", t: "Servicios", n: activos.length },
    { k: "historial", t: "Historial" },
    { k: "correos", t: "Correos" },
    { k: "pagos", t: "Pagos", alerta: finanzas.pendiente > 0 },
    { k: "notas", t: "Notas", n: notas.length },
    { k: "datos", t: "Datos" },
  ];

  const servicios = (
    <Bloque
      titulo={`Servicios · ${activos.length} activo${activos.length === 1 ? "" : "s"}`}
      extra={
        <button type="button" onClick={() => setAnadiendo((v) => !v)}
          className="text-[12px] font-semibold text-[#013446] min-h-[36px] px-2 rounded-lg hover:bg-[#e3f0fe]">
          {anadiendo ? "Cancelar" : "+ Añadir servicio"}
        </button>
      }
    >
      {anadiendo && (
        <div className="border-2 border-[#013446]/15 rounded-xl p-3 mb-3">
          <AltaRapida cliente={cliente} onCancelar={() => setAnadiendo(false)} onCreado={() => { setAnadiendo(false); cargar(); }} />
        </div>
      )}
      {procesos.length === 0 ? (
        <p className="text-[12.5px] text-[#62808f]">Todavía no tiene ningún servicio contratado.</p>
      ) : (
        <div className="space-y-2">
          {procesos.map((p) => (
            <TarjetaServicio key={p.id_solicitud} p={p} equipo={equipo} onAbrir={onAbrirProceso} onCambio={cargar} />
          ))}
        </div>
      )}
    </Bloque>
  );

  const bloqueNotas = (
    <Bloque titulo={`Notas · ${notas.length}`}>
      <div className="rounded-xl border border-[#d8e4ef] bg-white p-2.5 mb-3">
        <textarea rows={3} value={nota} onChange={(e) => setNota(e.target.value)}
          placeholder="Qué se habló, qué se acordó, qué hay que vigilar…"
          className="w-full text-[13.5px] text-neutral-800 bg-transparent border-none outline-none resize-y placeholder:text-[#9db2bf]" />
        <div className="flex items-center gap-3">
          <button type="button" onClick={anadirNota} disabled={!nota.trim() || guardandoNota}
            className="text-[12.5px] font-semibold px-4 min-h-[38px] rounded-xl bg-[#013446] text-white disabled:opacity-40">
            {guardandoNota ? "Guardando…" : "Añadir nota"}
          </button>
          <p className="text-[11px] text-[#62808f]">Solo la ve el equipo</p>
        </div>
      </div>
      {notas.length === 0 ? (
        <p className="text-[12.5px] text-[#62808f] py-4 text-center">Nada anotado todavía sobre este cliente.</p>
      ) : (
        <div className="space-y-2.5">
          {notas.map((n) => (
            <div key={n.id_nota} className="rounded-xl border border-[#e6eef5] bg-[#f8fbfd] p-3">
              <div className="flex items-center gap-2 mb-1">
                <span className="w-6 h-6 rounded-full bg-[#013446] text-white grid place-items-center text-[9px] font-bold shrink-0">
                  {String(n.autor || "?").split(/\s+/).slice(0, 2).map((w) => w[0]?.toUpperCase() || "").join("")}
                </span>
                <span className="text-[12px] font-semibold text-neutral-700">{n.autor}</span>
                <span className="text-[11px] text-[#62808f]">{fecha(n.created_at)}</span>
              </div>
              <p className="text-[13.5px] text-neutral-700 whitespace-pre-wrap leading-relaxed">{n.texto}</p>
            </div>
          ))}
        </div>
      )}
    </Bloque>
  );

  const bloqueFinanzas = (
    <Bloque
      titulo="Finanzas"
      extra={procesos.length > 0 && (
        <button type="button" onClick={() => setCobrando((v) => !v)}
          className="text-[12px] font-semibold text-[#013446] min-h-[36px] px-2 rounded-lg hover:bg-[#e3f0fe]">
          {cobrando ? "Cancelar" : "+ Registrar cobro"}
        </button>
      )}
    >
      {cobrando && (
        <div className="rounded-xl border-2 border-[#013446]/15 p-2.5 mb-3 space-y-2">
          <div className="flex gap-2">
            <input type="number" placeholder="Importe" value={cobro.monto}
              onChange={(e) => setCobro({ ...cobro, monto: e.target.value })}
              className="w-28 text-[13px] border border-[#d8e4ef] rounded-lg px-2 py-2" />
            <select value={cobro.moneda} onChange={(e) => setCobro({ ...cobro, moneda: e.target.value })}
              className="text-[13px] border border-[#d8e4ef] rounded-lg px-2 py-2">
              <option>EUR</option><option>PEN</option><option>USD</option>
            </select>
          </div>
          <select value={cobro.id_solicitud} onChange={(e) => setCobro({ ...cobro, id_solicitud: e.target.value })}
            className="w-full text-[13px] border border-[#d8e4ef] rounded-lg px-2 py-2">
            <option value="">¿De qué servicio?</option>
            {procesos.map((p) => <option key={p.id_solicitud} value={p.id_solicitud}>{p.servicio_label} · {p.paquete || "sin paquete"}</option>)}
          </select>
          <label className="flex items-center gap-1.5 text-[12.5px] text-neutral-600">
            <input type="checkbox" checked={cobro.cobrado} onChange={(e) => setCobro({ ...cobro, cobrado: e.target.checked })} />
            Ya cobrado
          </label>
          {!cobro.cobrado && (
            <input type="date" value={cobro.vence} onChange={(e) => setCobro({ ...cobro, vence: e.target.value })}
              className="w-full text-[13px] border border-[#d8e4ef] rounded-lg px-2 py-2" />
          )}
          <button type="button" onClick={registrarCobro} disabled={!cobro.monto || !cobro.id_solicitud}
            className="w-full text-[13px] font-semibold min-h-[40px] rounded-xl bg-[#013446] text-white disabled:opacity-40">
            Guardar cobro
          </button>
        </div>
      )}
      <div className="grid grid-cols-3 gap-2 mb-3">
        {[["Cobrado", finanzas.cobrado, "text-[#1D6A4A]"], ["Pendiente", finanzas.pendiente, finanzas.pendiente > 0 ? "text-[#c0392b]" : "text-[#9db2bf]"], ["Total", finanzas.total, "text-[#0d2c3a]"]].map(([t, v, c]) => (
          <div key={t} className="rounded-xl bg-[#f4f8fb] px-3 py-2">
            <p className={`text-[18px] font-bold leading-none tabular-nums ${c}`}>{Number(v).toFixed(0)}</p>
            <p className="text-[10.5px] text-[#62808f] mt-1">{t}</p>
          </div>
        ))}
      </div>
      {finanzas.pagos.length === 0 ? (
        <p className="text-[12.5px] text-[#62808f]">Sin cobros registrados.</p>
      ) : (
        <ul className="space-y-2">
          {finanzas.pagos.map((p) => (
            <li key={p.id_pago} className="flex items-start gap-2 text-[12.5px]">
              <span className={`w-2 h-2 rounded-full shrink-0 mt-1.5 ${p.pagado ? "bg-[#1D6A4A]" : "bg-[#fa943a]"}`} />
              <span className="min-w-0 flex-1">
                <span className="block"><b className="text-neutral-800">{Number(p.monto).toFixed(0)} {p.moneda}</b><span className="text-[#62808f]"> · {p.proceso}</span></span>
                {(p.metodo || p.referencia) && (
                  <span className="block text-[11px] text-[#62808f] truncate">{[p.metodo, p.referencia && `op. ${p.referencia}`].filter(Boolean).join(" · ")}</span>
                )}
              </span>
              {p.tiene_comprobante && <VerVoucher idPago={p.id_pago} />}
              <span className="text-[#62808f] shrink-0 whitespace-nowrap text-[11.5px]">
                {p.pagado ? fecha(p.fecha_pago) : `vence ${fecha(p.fecha_vencimiento)}`}
              </span>
            </li>
          ))}
        </ul>
      )}
    </Bloque>
  );

  const bloqueDatos = (
    <Bloque titulo="Datos">
      <div className="grid grid-cols-2 gap-3">
        <Dato label="Correo" valor={cliente.email} />
        <Dato label="Teléfono" valor={cliente.telefono} />
        <Dato label="DNI" valor={cliente.dni} />
        <Dato label="Pasaporte" valor={cliente.pasaporte} />
        <Dato label="País" valor={cliente.pais_origen} />
        <Dato label="Origen" valor={cliente.origen} />
        <Dato label="Registrado" valor={fecha(cliente.registrado)} />
      </div>
    </Bloque>
  );

  return (
    <div className="space-y-3">
      {/* Cabecera de perfil */}
      <section className="ase-hero !rounded-[20px] !px-4 !py-4 sm:!px-5" style={{ margin: 0 }}>
        <div className="flex items-start gap-3">
          <button onClick={onVolver} aria-label="Volver"
            className="shrink-0 w-10 h-10 rounded-xl grid place-items-center text-white bg-white/10 hover:bg-white/20">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
          </button>
          <span className="shrink-0 w-14 h-14 rounded-2xl grid place-items-center text-[18px] font-bold text-[#013446]"
            style={{ background: "linear-gradient(135deg, #ffffff, #e3f0fe)" }}>
            {inic}
          </span>
          <div className="min-w-0 flex-1">
            <h1 className="ase-titulo !text-[22px] !leading-tight break-words">{cliente.nombre}</h1>
            <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
              {cliente.prueba && <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-violet-200 text-violet-900">Prueba</span>}
              {(cliente.etiquetas || []).map((t) => (
                <span key={t} className="text-[10.5px] font-semibold px-2 py-0.5 rounded-full bg-white/15 text-white">{t}</span>
              ))}
              {finanzas.pendiente > 0 && (
                <span className={`text-[10.5px] font-bold px-2 py-0.5 rounded-full ${finanzas.vencido ? "bg-[#ff9b8f] text-[#5c1a12]" : "bg-[#ffd29e] text-[#6b3a06]"}`}>
                  Debe {finanzas.pendiente.toFixed(0)}
                </span>
              )}
            </div>
          </div>
        </div>

        {urgente && quien && (
          <p className="mt-3 text-[14px] leading-snug text-white/90">
            <b className="text-white">{quien}:</b> {urgente.que}
            {urgente.proximo && (
              <span className={urgente.proximo.vencido ? "text-[#ff9b8f] font-semibold" : "text-[#ffb066]"}>
                {" · "}{urgente.proximo.etiqueta} {urgente.proximo.vencido ? `hace ${-urgente.proximo.dias} d` : urgente.proximo.dias === 0 ? "hoy" : `en ${urgente.proximo.dias} d`}
              </span>
            )}
          </p>
        )}

        <div className="grid grid-cols-3 gap-2 mt-3">
          {[
            { t: "WhatsApp", href: tel ? `https://wa.me/${tel}` : null, externo: true },
            { t: "Llamar", href: tel ? `tel:+${tel}` : null },
            { t: "Correo", href: cliente.email ? `mailto:${cliente.email}` : null },
          ].map((b) => (
            b.href ? (
              <a key={b.t} href={b.href} target={b.externo ? "_blank" : undefined} rel="noreferrer"
                className="min-h-[44px] rounded-xl grid place-items-center text-[13px] font-semibold text-white bg-white/12 border border-white/20 hover:bg-white/20 active:scale-[.98] transition"
                style={{ background: "rgba(255,255,255,.12)" }}>
                {b.t}
              </a>
            ) : (
              <span key={b.t} className="min-h-[44px] rounded-xl grid place-items-center text-[12px] text-white/40 border border-white/10">
                Sin {b.t === "Correo" ? "correo" : "teléfono"}
              </span>
            )
          ))}
        </div>
      </section>

      {/* Pestañas */}
      <div className="sticky top-0 z-20 -mx-1 px-1 py-1.5 bg-[#f4f8fb]/95 backdrop-blur">
        <div className="flex gap-1 overflow-x-auto [&::-webkit-scrollbar]:hidden" style={{ scrollbarWidth: "none" }} role="tablist">
          {PESTANAS.map((x) => (
            <button key={x.k} type="button" role="tab" aria-selected={pestana === x.k} onClick={() => setPestana(x.k)}
              className={`shrink-0 min-h-[40px] px-3.5 rounded-xl text-[13px] font-semibold transition ${
                pestana === x.k ? "bg-[#013446] text-white shadow-[0_8px_18px_-8px_rgba(1,52,70,.6)]" : "text-[#62808f] hover:bg-white"}`}>
              {x.t}
              {x.n ? <span className={`ml-1.5 text-[11px] ${pestana === x.k ? "text-white/70" : "text-[#9db2bf]"}`}>{x.n}</span> : null}
              {x.alerta && <span className="ml-1.5 inline-block w-1.5 h-1.5 rounded-full bg-[#c0392b] align-middle" />}
            </button>
          ))}
        </div>
      </div>

      {pestana === "resumen" && (
        <div className="space-y-3">
          <CoherenciaDatos idCliente={idCliente} />
          {servicios}
          {finanzas.pendiente > 0 && bloqueFinanzas}
          {notas.length > 0 && (
            <Bloque titulo="Última nota" extra={<button type="button" onClick={() => setPestana("notas")} className="text-[12px] font-semibold text-[#013446]">Ver todas</button>}>
              <p className="text-[13.5px] text-neutral-700 whitespace-pre-wrap leading-relaxed">{notas[0].texto}</p>
              <p className="text-[11px] text-[#62808f] mt-1">{notas[0].autor} · {fecha(notas[0].created_at)}</p>
            </Bloque>
          )}
        </div>
      )}
      {pestana === "servicios" && servicios}
      {pestana === "historial" && <HistorialCliente idCliente={idCliente} />}
      {pestana === "correos" && <CorreosCliente idCliente={idCliente} correo={cliente.email} procesos={procesos} />}
      {pestana === "pagos" && (
        <div className="space-y-3">
          {bloqueFinanzas}
          <PlanesCliente idCliente={idCliente} onCambio={cargar} />
        </div>
      )}
      {pestana === "notas" && bloqueNotas}
      {pestana === "datos" && (
        <div className="space-y-3">
          <CoherenciaDatos idCliente={idCliente} />
          {bloqueDatos}
        </div>
      )}
    </div>
  );
}
