// src/pages/backoffice/solicitudes/SolicitudDetalleBackoffice.jsx
import { useEffect, useMemo, useRef, useState } from "react";
import { boGET, boPATCH } from "../../../services/backofficeApi";
import FormularioDatosAcademicosAdmin from "./FormularioDatosAcademicosAdmin";
import EleccionMastersAdmin from "./EleccionMastersAdmin";
import ProgramacionPostulacionesAdmin from "./ProgramacionPostulacionesAdmin";
import PortalesYJustificantesAdmin from "./PortalesYJustificantesAdmin";
import CierreServicioMasterAdmin from "./CierreServicioMasterAdmin";
import { useSolicitudDetalle } from "./hooks/useSolicitudDetalle";
import ChecklistSolicitudAdmin from "./components/ChecklistSolicitudAdmin";
import InformeAdmin from "./components/InformeAdmin";
import EncabezadoClienteAdmin from "./EncabezadoClienteAdmin";
import VisaSolvenciaAdmin from "./components/visa/VisaSolvenciaAdmin";
import VisaDeclaracionAdmin from "./components/visa/VisaDeclaracionAdmin";
import VisaImpresoAdmin from "./components/visa/VisaImpresoAdmin";
import EstanciaAdmin from "./components/estancia/EstanciaAdmin";
import VisaRecordatoriosAdmin from "./components/visa/VisaRecordatoriosAdmin";
import VisaFlujoInternoAdmin from "./components/visa/VisaFlujoInternoAdmin";
import VisaEstadoVisadoAdmin from "./components/visa/VisaEstadoVisadoAdmin";
import VisaSubirDocumento from "./components/visa/VisaSubirDocumento";
import MarcadoPorCliente from "./components/visa/MarcadoPorCliente";
import NotasExpediente from "./components/visa/NotasExpediente";
import DocumentosProceso from "../../../components/common/DocumentosProceso";
import VisaSesionAdmin from "./components/visa/VisaSesionAdmin";
import VisaCierreAdmin from "./components/visa/VisaCierreAdmin";
import VisaFormularioAdmin from "./components/visa/VisaFormularioAdmin";

const RING_R = 13;
const RING_C = 2 * Math.PI * RING_R;

function BlqHead({ numero, titulo, estado, open, onToggle }) {
  // Vista de sección única: solo se muestra la cabecera del bloque activo.
  if (!open) return null;
  const badge = {
    completado: "bg-[#1D6A4A] text-white",
    observado:  "bg-[#DC2626] text-white",
    pendiente:  "bg-[#FFFBEA] text-[#F59E0B] border-2 border-[#F59E0B]/30",
    revision:   "bg-[#6D28D9] text-white",
    inactivo:   "bg-[#F4F6F9] text-[#6B7280] border-2 border-[#E2E8F0]",
  };
  const chip = {
    completado: "bg-[#E8F5EE] text-[#1D6A4A]",
    observado:  "bg-[#FEF2F2] text-[#DC2626]",
    pendiente:  "bg-[#FFFBEA] text-[#F59E0B]",
    revision:   "bg-[#EDE9FE] text-[#6D28D9]",
    inactivo:   "bg-[#F4F6F9] text-[#6B7280]",
  };
  const chipLabel = {
    completado: "✓ Completo",
    observado:  "⚠ Observado",
    pendiente:  "● En progreso",
    revision:   "◎ Pendiente revisión",
    inactivo:   "— Inactivo",
  };
  const e = estado || "inactivo";
  const cardBorder = {
    completado: "border-[#1D6A4A]/20 hover:border-[#1D6A4A]/40",
    observado:  "border-[#DC2626]/20 hover:border-[#DC2626]/40",
    pendiente:  "border-[#F59E0B]/30 hover:border-[#F59E0B]/60",
    revision:   "border-[#6D28D9]/20 hover:border-[#6D28D9]/40",
    inactivo:   "border-[#E2E8F0] hover:border-[#CBD5E1]",
  };
  return (
    <button
      type="button"
      onClick={onToggle}
      className={`flex items-center gap-2 sm:gap-3 w-full text-left px-3 sm:px-4 py-3 mb-2 rounded-[12px] bg-white border shadow-sm transition-all active:scale-[0.995] ${cardBorder[e] || cardBorder.inactivo} ${open ? "rounded-b-none mb-0 border-b-0" : ""}`}
    >
      <div className={`w-[28px] h-[28px] rounded-[7px] flex items-center justify-center text-[12px] font-extrabold font-mono shrink-0 ${badge[e] || badge.inactivo}`}>
        {numero}
      </div>
      {/* min-w-0 para que el título pueda encogerse: sin él, en móvil empuja
          la insignia fuera de la tarjeta y se corta a media palabra. */}
      <span className="font-serif text-[14px] sm:text-[15px] text-[#1A3557] flex-1 min-w-0 font-semibold">{titulo}</span>
      <span className={`text-[10px] font-semibold px-2 sm:px-[10px] py-1 rounded-full shrink-0 whitespace-nowrap ${chip[e] || chip.inactivo}`}>
        {chipLabel[e] || "—"}
      </span>
      <svg
        className={`hidden sm:block w-4 h-4 text-neutral-400 transition-transform duration-200 shrink-0 ${open ? "rotate-0" : "-rotate-90"}`}
        fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
      </svg>
    </button>
  );
}

function CBox({ children }) {
  return (
    <div className="bg-white border border-[#E2E8F0] border-t-0 rounded-b-[12px] overflow-hidden shadow-sm mb-2">
      {children}
    </div>
  );
}

export default function SolicitudDetalleBackoffice({ idSolicitud, onVolver }) {
  const mainRef = useRef(null);

  const {
    detalle, setDetalle,
    checklistPorEtapa,
    loading, error, cargar,
  } = useSolicitudDetalle(idSolicitud);

  // Acordeón de apertura única: solo un bloque abierto a la vez.
  const [activeBloque, setActiveBloque] = useState("cliente");
  const [navMovilAbierta, setNavMovilAbierta] = useState(false);
  const isOpen = (id) => activeBloque === id;

  // Datos de Visado (Fase 2)
  const [visaExp, setVisaExp] = useState(null);
  const [visaSesiones, setVisaSesiones] = useState([]);
  // Qué documentos terminados ya tiene subidos el cliente (acta, DJ, formulario).
  const [visaDocs, setVisaDocs] = useState({});

  async function cargarVisaDocs() {
    const r = await boGET(`/backoffice/solicitudes/${idSolicitud}/visa-documentos`);
    if (r.ok) setVisaDocs(r.documentos || {});
  }

  function toggleBloque(id) {
    setActiveBloque(id);
  }

  function irABloque(id) {
    setActiveBloque(id);
    setNavMovilAbierta(false);
    setTimeout(() => {
      const el = document.getElementById(`bloque-${id}`);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 50);
  }

  const [progRefreshKey,   setProgRefreshKey]   = useState(0);
  const [eleccionResetKey, setEleccionResetKey] = useState(0);

  // Los bloques y su estado vienen calculados del servidor.
  const bloquesServidor = detalle?.estado_expediente?.bloques ?? [];
  const isVisado = bloquesServidor.some((b) => b.id === "solvencia");
  // La estancia por estudios no es una variante del visado ni del master: su
  // panel entero es otro, asi que se detecta aqui y se muestra el suyo.
  const isEstancia =
    Number(detalle?.id_tipo_solicitud) === 18 ||
    String(detalle?.tipo?.nombre || detalle?.titulo || "").toLowerCase().includes("estancia");
  const estadoDe = (id) => bloquesServidor.find((b) => b.id === id)?.estado ?? "pendiente";

  // En visado la lista se arma aquí y no en el servidor: los bloques nuevos
  // (declaración jurada, impreso oficial) dependen del expediente, que esta
  // pantalla ya tiene cargado. Calcularlo allí obligaría a arrastrar el
  // expediente a todas las consultas de solicitudes.
  // Los 8 bloques del asesor (0-7). Se corresponden con los 6 del cliente; los
  // que faltan alli son los internos: el checklist de gestion y el estado del
  // proceso. Y de la declaracion jurada y el formulario, el cliente ve el
  // documento terminado que se le sube, nunca el generador.
  const bloques = useMemo(() => {
    if (!isVisado) {
      // El bloque de documentos del proceso vive solo en el frontend: el
      // servidor calcula la lista sin saber de el.
      const i = bloquesServidor.findIndex((b) => b.id === "portales");
      if (i < 0) return bloquesServidor;
      const copia = [...bloquesServidor];
      copia.splice(i, 0, { id: "docsproceso", numero: "D", label: "Documentos del proceso", estado: "pendiente" });
      return copia;
    }
    const hecho = (v) => (v ? "completado" : "pendiente");
    const diag = visaSesiones.find((x) => x.tipo === "DIAGNOSTICO");
    const via = visaExp?.tipo_solvencia && visaExp.tipo_solvencia !== "PENDIENTE";
    return [
      { id: "proceso",     numero: "0", label: "Checklist y estado",   estado: hecho(visaExp?.visado_resultado === "FAVORABLE") },
      { id: "cliente",     numero: "1", label: "Datos del cliente",    estado: estadoDe("cliente") },
      { id: "diagnostico", numero: "2", label: "Sesion diagnostico",   estado: hecho(diag?.estado === "COMPLETADA") },
      { id: "solvencia",   numero: "3", label: "Datos economicos",     estado: hecho(via) },
      { id: "checklist",   numero: "4", label: "Documentos",           estado: estadoDe("checklist") },
      { id: "declaracion", numero: "5", label: "Declaracion jurada",   estado: hecho(visaExp?.dj_borrador || visaExp?.dj_datos) },
      { id: "impreso",     numero: "6", label: "Formulario",           estado: hecho(visaExp?.formulario_estado === "FIRMADO") },
      { id: "cierre",      numero: "7", label: "Cierre del expediente", estado: hecho(visaExp?.cierre_estado === "CERRADO") },
    ];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isVisado, bloquesServidor, visaExp, visaSesiones]);

  // Cargar expediente, sesiones y documentos entregables del visado
  useEffect(() => {
    if (!detalle || !isVisado) return;
    let cancel = false;
    (async () => {
      const [e, ses, docs] = await Promise.all([
        boGET(`/backoffice/solicitudes/${detalle.id_solicitud}/visa-expediente`),
        boGET(`/backoffice/solicitudes/${detalle.id_solicitud}/sesiones`),
        boGET(`/backoffice/solicitudes/${detalle.id_solicitud}/visa-documentos`),
      ]);
      if (cancel) return;
      if (e.ok) setVisaExp(e.expediente || null);
      if (ses.ok) setVisaSesiones(ses.sesiones || []);
      if (docs.ok) setVisaDocs(docs.documentos || {});
    })();
    return () => { cancel = true; };
  }, [detalle, isVisado]);

  const sesionPorTipo = (tipo) => visaSesiones.find((s) => s.tipo === tipo) || null;
  const sesionEstadoBloque = (tipo) => (sesionPorTipo(tipo)?.estado === "COMPLETADA" ? "completado" : "pendiente");

  function onSesionGuardada(sesion) {
    setVisaSesiones((prev) => {
      const otras = prev.filter((s) => s.tipo !== sesion.tipo);
      return [...otras, sesion];
    });
  }

  function handleEleccionesActualizadas(nuevasElecciones) {
    setDetalle((prev) => ({ ...prev, eleccion_masters: nuevasElecciones }));
    setProgRefreshKey((k) => k + 1);
    cargar({ silencioso: true });
  }

  async function handleInformeRegenerado() {
    setEleccionResetKey((k) => k + 1);
    try {
      const r = await boPATCH(`/backoffice/solicitudes/${detalle.id_solicitud}/eleccion-plan`, { eleccion_masters: [] });
      if (r.ok) {
        setDetalle((prev) => ({ ...prev, eleccion_masters: [] }));
        cargar({ silencioso: true });
      }
    } catch { /* silencioso */ }
  }

  const completos = bloques.filter((b) => b.estado === "completado").length;
  const pct = isVisado
    ? (bloques.length ? Math.round((completos / bloques.length) * 100) : 0)
    : (detalle?.estado_expediente?.pct ?? 0);
  const etiqueta = isVisado
    ? (pct === 0 ? "sin iniciar" : pct === 100 ? "completo" : `${completos} de ${bloques.length} bloques`)
    : (detalle?.estado_expediente?.etiqueta ?? "sin iniciar");

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center gap-3 text-neutral-500">
        <div className="w-5 h-5 border-2 border-[#023A4B] border-t-transparent rounded-full animate-spin" />
        <span className="text-sm">Cargando solicitud…</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <button type="button" onClick={onVolver} className="text-xs text-[#1D6A4A] hover:underline mb-3">← Volver</button>
        <p className="text-sm text-red-600">{error}</p>
      </div>
    );
  }

  if (!detalle) return null;

  const indiceBloque = Math.max(0, bloques.findIndex((b) => b.id === activeBloque));
  const bloqueActual = bloques[indiceBloque] || bloques[0];

  function irBloqueRelativo(paso) {
    const destino = bloques[indiceBloque + paso];
    if (destino) irABloque(destino.id);
  }

  function dotColor(estado) {
    if (estado === "completado") return "bg-[#1D6A4A]";
    if (estado === "observado")  return "bg-[#DC2626]";
    if (estado === "pendiente")  return "bg-[#F59E0B]";
    if (estado === "revision")   return "bg-[#6D28D9]";
    return "bg-[#E2E8F0]";
  }

  return (
    <div className="flex-1 min-h-0 flex flex-col lg:flex-row overflow-hidden">

      {/* ── NAVEGACIÓN EN MÓVIL ──
          La barra lateral mide 220 px fijos: en un teléfono se come la
          pantalla y deja el contenido en una columna ilegible. Debajo de
          1024 px se sustituye por una cabecera compacta con desplegable. */}
      <div className="lg:hidden shrink-0 border-b border-[#E2E8F0] bg-white px-3 py-2.5 space-y-2">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onVolver}
            aria-label="Volver a solicitudes"
            className="shrink-0 w-9 h-9 rounded-lg border border-[#E2E8F0] grid place-items-center text-[#6B7280] active:scale-95 transition-all"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
          </button>
          <div className="min-w-0 flex-1">
            <p className="font-mono text-[9px] tracking-[.18em] text-[#6B7280] uppercase leading-none">
              #{detalle.id_solicitud} · {detalle.cliente?.nombre || "Sin nombre"}
            </p>
            <p className="font-serif text-[13px] text-[#1A3557] leading-tight truncate mt-0.5">
              {detalle.titulo || "(Sin título)"}
            </p>
          </div>
          <span className="shrink-0 text-[11px] font-bold text-[#1D6A4A] bg-[#E8F5EE] border border-[#1D6A4A]/20 rounded-full px-2 py-1">
            {pct}%
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => irBloqueRelativo(-1)}
            disabled={indiceBloque <= 0}
            aria-label="Bloque anterior"
            className="shrink-0 w-9 h-9 rounded-lg border border-[#E2E8F0] grid place-items-center text-[#6B7280] disabled:opacity-30 active:scale-95 transition-all"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
          </button>

          <button
            type="button"
            onClick={() => setNavMovilAbierta((v) => !v)}
            aria-expanded={navMovilAbierta}
            className="flex-1 min-w-0 flex items-center gap-2 rounded-lg border border-[#E2E8F0] bg-[#F4F6F9] px-2.5 py-2 text-left"
          >
            <span className="shrink-0 w-6 h-6 rounded-md bg-[#1D6A4A] text-white grid place-items-center text-[10px] font-bold font-mono">
              {bloqueActual?.numero || "—"}
            </span>
            <span className="flex-1 min-w-0 text-[12.5px] font-semibold text-[#1A3557] truncate">
              {bloqueActual?.label || "Bloques"}
            </span>
            <svg className={`shrink-0 w-4 h-4 text-[#6B7280] transition-transform ${navMovilAbierta ? "rotate-180" : ""}`}
              fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
            </svg>
          </button>

          <button
            type="button"
            onClick={() => irBloqueRelativo(1)}
            disabled={indiceBloque >= bloques.length - 1}
            aria-label="Bloque siguiente"
            className="shrink-0 w-9 h-9 rounded-lg border border-[#E2E8F0] grid place-items-center text-[#6B7280] disabled:opacity-30 active:scale-95 transition-all"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
          </button>
        </div>

        {navMovilAbierta && (
          <div className="rounded-xl border border-[#E2E8F0] bg-white shadow-lg p-1.5 max-h-[55vh] overflow-y-auto">
            {bloques.map((b) => (
              <button
                key={b.id}
                type="button"
                onClick={() => irABloque(b.id)}
                className={`w-full flex items-center gap-2.5 px-2.5 py-2.5 rounded-lg text-left transition-colors ${
                  activeBloque === b.id ? "bg-[#E8F5EE]" : "active:bg-[#F4F6F9]"
                }`}
              >
                <span className={`shrink-0 w-6 h-6 rounded-md grid place-items-center text-[10px] font-bold font-mono ${
                  activeBloque === b.id ? "bg-[#1D6A4A] text-white" : "bg-[#F4F6F9] text-[#6B7280]"
                }`}>{b.numero}</span>
                <span className={`flex-1 min-w-0 text-[12.5px] truncate ${
                  activeBloque === b.id ? "font-bold text-[#1D6A4A]" : "font-medium text-[#6B7280]"
                }`}>{b.label}</span>
                <span className={`w-[7px] h-[7px] rounded-full shrink-0 ${dotColor(b.estado)}`} />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ── SIDEBAR (sólo escritorio) ── */}
      <aside className="hidden lg:block w-[220px] flex-none border-r border-[#E2E8F0] bg-white overflow-y-auto px-[9px] py-3">

        {/* Back button */}
        <button
          type="button"
          onClick={onVolver}
          className="flex items-center gap-2 px-2 py-2 mb-2 rounded-[8px] text-[12px] font-semibold text-[#6B7280] hover:bg-[#F4F6F9] hover:text-[#1A1A2E] transition-all group w-full"
        >
          <svg className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
          Solicitudes
        </button>

        {/* Case info box */}
        <div className="bg-[#EEF2F8] border border-[#1A3557]/[.12] rounded-[11px] p-[11px] mb-[9px]">
          <p className="font-mono text-[9px] tracking-[.2em] text-[#6B7280] uppercase mb-[3px]">
            Solicitud #{detalle.id_solicitud}
          </p>
          <p className="font-serif text-[12.5px] text-[#1A3557] leading-[1.3] mb-1">
            {detalle.titulo || "(Sin título)"}
          </p>
          <p className="text-[11px] text-[#6B7280]">{detalle.cliente?.nombre || "Sin nombre"}</p>
        </div>

        {/* Progress ring */}
        <div className="bg-[#E8F5EE] border border-[#1D6A4A]/20 rounded-[9px] px-[11px] py-[9px] mb-[9px] flex items-center gap-2.5">
          <div className="relative w-[34px] h-[34px] shrink-0">
            <svg width="34" height="34" viewBox="0 0 34 34" style={{ transform: "rotate(-90deg)" }}>
              <circle fill="none" stroke="rgba(29,106,74,.15)" cx="17" cy="17" r={RING_R} strokeWidth="3" />
              <circle
                fill="none"
                stroke="#1D6A4A"
                cx="17" cy="17" r={RING_R}
                strokeWidth="3"
                strokeLinecap="round"
                strokeDasharray={RING_C}
                strokeDashoffset={RING_C * (1 - pct / 100)}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center font-mono text-[9px] font-bold text-[#1D6A4A]">
              {pct}%
            </div>
          </div>
          <div>
            <p className="text-[13px] font-bold text-[#1D6A4A]">Progreso</p>
            <p className="text-[11px] text-[#6B7280]">{etiqueta}</p>
          </div>
        </div>

        {/* Nav title */}
        <p className="text-[9px] font-bold text-[#6B7280] uppercase tracking-[.15em] px-2 pt-[7px] pb-[3px]">
          Bloques del expediente
        </p>

        {/* Nav links */}
        {bloques.map((b) => {
          const activo = activeBloque === b.id;
          return (
          <button
            key={b.id}
            type="button"
            onClick={() => irABloque(b.id)}
            className={`flex items-center gap-2 px-2 py-2 rounded-[8px] transition-all cursor-pointer w-full mb-[2px] border text-left ${
              activo
                ? "bg-[#E8F5EE] border-[#1D6A4A]/30 text-[#1D6A4A]"
                : `border-transparent hover:bg-[#F4F6F9] hover:text-[#1A1A2E] ${b.estado === "completado" ? "text-[#155a3d]" : "text-[#6B7280]"}`
            }`}
          >
            <span className={`w-[21px] h-[21px] rounded-[6px] flex items-center justify-center text-[10px] font-bold font-mono shrink-0 ${
              activo ? "bg-[#1D6A4A] text-white" : b.estado === "completado" ? "bg-[#E8F5EE] text-[#1D6A4A]" : "bg-[#F4F6F9] text-[#6B7280]"
            }`}>
              {b.numero}
            </span>
            <span className={`text-[11.5px] flex-1 leading-[1.3] ${activo ? "font-bold" : "font-medium"}`}>{b.label}</span>
            <span className={`w-[7px] h-[7px] rounded-full shrink-0 ${dotColor(b.estado)}`} />
          </button>
          );
        })}
      </aside>

      {/* ── MAIN SCROLL ── */}
      <main ref={mainRef} className="flex-1 overflow-y-auto bg-[#F4F6F9]">
        <div className="p-3 sm:p-[22px] pb-20">

          {/* Estancia por estudios: panel propio, empezando por el punto 0 con
              el flujo del expediente. */}
          {isEstancia && (
            <div className="mb-4">
              <EstanciaAdmin idSolicitud={detalle?.id_solicitud} />
            </div>
          )}

          {/* B0 — Checklist y estado del proceso (sólo visado, sólo interno) */}
          {isVisado && (
            <div id="bloque-proceso" className="scroll-mt-4">
              <BlqHead numero="0" titulo="Checklist y estado del proceso"
                estado={visaExp?.visado_resultado === "FAVORABLE" ? "completado" : "pendiente"}
                open={isOpen("proceso")} onToggle={() => toggleBloque("proceso")} />
              {isOpen("proceso") && (
                <CBox>
                  <div className="p-5 space-y-5">
                    <VisaFlujoInternoAdmin idSolicitud={detalle.id_solicitud} expediente={visaExp} onSaved={setVisaExp} />
                    <div className="border-t border-[#E2E8F0] pt-5">
                      <VisaEstadoVisadoAdmin idSolicitud={detalle.id_solicitud} expediente={visaExp} onSaved={setVisaExp} />
                    </div>
                    <div className="border-t border-[#E2E8F0] pt-5">
                      <VisaRecordatoriosAdmin idSolicitud={detalle.id_solicitud} expediente={visaExp} onSaved={setVisaExp} />
                    </div>
                    <div className="border-t border-[#E2E8F0] pt-5">
                      <NotasExpediente idSolicitud={detalle.id_solicitud} />
                    </div>
                  </div>
                </CBox>
              )}
            </div>
          )}

          {/* B1 — Encabezado del cliente */}
          <div id="bloque-cliente" className="scroll-mt-4">
            <BlqHead numero="1" titulo={isVisado ? "Datos del cliente y credenciales BLS" : "Encabezado del cliente"} estado={estadoDe("cliente")}
              open={isOpen("cliente")} onToggle={() => toggleBloque("cliente")} />
            {isOpen("cliente") && (
              <CBox>
                <EncabezadoClienteAdmin
                  detalle={detalle}
                  onClienteActualizado={(clienteActualizado) =>
                    setDetalle((prev) => ({ ...prev, cliente: clienteActualizado }))
                  }
                />
                {isVisado && (
                  <div className="border-t border-[#E2E8F0]">
                    <VisaFormularioAdmin idSolicitud={detalle.id_solicitud} expediente={visaExp} onSaved={setVisaExp} />
                  </div>
                )}
              </CBox>
            )}
          </div>

          {/* B2 — Documentos requeridos (en visado se renderiza en su orden, más abajo) */}
          {!isVisado && (
          <div id="bloque-checklist" className="scroll-mt-4">
            <BlqHead numero="2" titulo="Documentos requeridos" estado={estadoDe("checklist")}
              open={isOpen("checklist")} onToggle={() => toggleBloque("checklist")} />
            {isOpen("checklist") && (
              <CBox>
                <div className="p-5">
                  <ChecklistSolicitudAdmin
                    detalle={detalle}
                    checklistPorEtapa={checklistPorEtapa}
                    recargar={cargar}
                    isVisado={isVisado}
                    tipoSolvencia={visaExp?.tipo_solvencia || "PENDIENTE"}
                  />
                </div>
              </CBox>
            )}
          </div>
          )}

          {isVisado ? (
            <>
              {/* B2 — Sesión de diagnóstico y estrategia */}
              <div id="bloque-diagnostico" className="scroll-mt-4">
                <BlqHead numero="2" titulo="Sesión de diagnóstico y estrategia"
                  estado={sesionEstadoBloque("DIAGNOSTICO")}
                  open={isOpen("diagnostico")} onToggle={() => toggleBloque("diagnostico")} />
                {isOpen("diagnostico") && (
                  <CBox>
                    <VisaSesionAdmin idSolicitud={detalle.id_solicitud} tipo="DIAGNOSTICO"
                      sesion={sesionPorTipo("DIAGNOSTICO")} onSaved={onSesionGuardada}
                      recomendada={visaExp?.solvencia_recomendada}
                      onRecomendar={setVisaExp}
                      eleccionCliente={visaExp?.tipo_solvencia}
                      agenda={["Revisar situación migratoria actual", "Evaluar viabilidad del expediente", "Plantear la estrategia de medios económicos (propios, aval o mixto)", "Identificar documentos complejos y plazos", "Instrucciones certificado médico y antecedentes penales"]} />
                    <div className="border-t border-[#E2E8F0] p-5">
                      <VisaSubirDocumento
                        idSolicitud={detalle.id_solicitud} slot="diagnostico"
                        titulo="Toma de notas de la reunión (interna)"
                        pista="Acta, resumen o grabación de Meet. Es material de trabajo del equipo: el cliente NO lo ve."
                        documento={visaDocs.diagnostico} onCambio={cargarVisaDocs}
                      />
                    </div>
                  </CBox>
                )}
              </div>

              {/* B3 — Datos y medios económicos */}
              <div id="bloque-solvencia" className="scroll-mt-4">
                <BlqHead numero="3" titulo="Datos y medios económicos"
                  estado={(visaExp?.tipo_solvencia && visaExp.tipo_solvencia !== "PENDIENTE") ? "completado" : "pendiente"}
                  open={isOpen("solvencia")} onToggle={() => toggleBloque("solvencia")} />
                {isOpen("solvencia") && (
                  <CBox>
                    <VisaSolvenciaAdmin idSolicitud={detalle.id_solicitud} expediente={visaExp} onSaved={setVisaExp} />
                    <div className="border-t border-[#E2E8F0] p-5">
                      <p className="text-[9px] font-bold uppercase tracking-widest font-mono text-neutral-400 mb-2">
                        Lo que marcó el cliente
                      </p>
                      <MarcadoPorCliente expediente={visaExp} />
                    </div>
                  </CBox>
                )}
              </div>

              {/* B4 — Documentos requeridos */}
              <div id="bloque-checklist" className="scroll-mt-4">
                <BlqHead numero="4" titulo="Documentos requeridos" estado={estadoDe("checklist")}
                  open={isOpen("checklist")} onToggle={() => toggleBloque("checklist")} />
                {isOpen("checklist") && (
                  <CBox>
                    <div className="p-5">
                      <ChecklistSolicitudAdmin
                        detalle={detalle}
                        checklistPorEtapa={checklistPorEtapa}
                        recargar={cargar}
                        isVisado={isVisado}
                        tipoSolvencia={visaExp?.tipo_solvencia || "PENDIENTE"}
                      />
                    </div>
                  </CBox>
                )}
              </div>

              {/* B5 — Declaración jurada */}
              <div id="bloque-declaracion" className="scroll-mt-4">
                <BlqHead numero="5" titulo="Declaración jurada de solvencia"
                  estado={visaDocs.dj ? "completado" : (visaExp?.dj_borrador || visaExp?.dj_datos) ? "revision" : "pendiente"}
                  open={isOpen("declaracion")} onToggle={() => toggleBloque("declaracion")} />
                {isOpen("declaracion") && (
                  <CBox>
                    <div className="p-5 space-y-5">
                      <VisaSubirDocumento
                        idSolicitud={detalle.id_solicitud} slot="dj"
                        titulo="Declaración jurada final (la que ve el cliente)"
                        pista="Genera el borrador abajo, revísalo, expórtalo y súbelo aquí ya firmado o listo."
                        documento={visaDocs.dj} onCambio={cargarVisaDocs}
                      />
                      <div className="border-t border-[#E2E8F0] pt-5">
                        <VisaDeclaracionAdmin idSolicitud={detalle.id_solicitud} expediente={visaExp} onSaved={setVisaExp} />
                      </div>
                    </div>
                  </CBox>
                )}
              </div>

              {/* B6 — Formulario de visado */}
              <div id="bloque-impreso" className="scroll-mt-4">
                <BlqHead numero="6" titulo="Formulario de visado"
                  estado={visaDocs.formulario ? "completado" : visaExp?.formulario_estado === "ENVIADO" ? "revision" : "pendiente"}
                  open={isOpen("impreso")} onToggle={() => toggleBloque("impreso")} />
                {isOpen("impreso") && (
                  <CBox>
                    <div className="p-5 space-y-5">
                      <VisaSubirDocumento
                        idSolicitud={detalle.id_solicitud} slot="formulario"
                        titulo="Formulario final (el que ve el cliente)"
                        pista="Genera el impreso abajo, revísalo y súbelo aquí para que el cliente lo descargue."
                        documento={visaDocs.formulario} onCambio={cargarVisaDocs}
                      />
                      <div className="border-t border-[#E2E8F0] pt-5">
                        <VisaFormularioAdmin idSolicitud={detalle.id_solicitud} expediente={visaExp} onSaved={setVisaExp} mode="estado" />
                      </div>
                      <div className="border-t border-[#E2E8F0] pt-5">
                        <VisaImpresoAdmin
                          expediente={visaExp} cliente={detalle.cliente}
                          idSolicitud={detalle.id_solicitud}
                          onSaved={setVisaExp}
                          onDocumentoGuardado={cargarVisaDocs}
                        />
                      </div>
                    </div>
                  </CBox>
                )}
              </div>

              {/* B7 — Cierre del expediente */}
              <div id="bloque-cierre" className="scroll-mt-4">
                <BlqHead numero="7" titulo="Cierre del expediente"
                  estado={visaExp?.cierre_estado === "CERRADO" ? "completado" : visaExp?.cierre_estado === "CANCELADO" ? "observado" : "pendiente"}
                  open={isOpen("cierre")} onToggle={() => toggleBloque("cierre")} />
                {isOpen("cierre") && (
                  <CBox>
                    <VisaCierreAdmin idSolicitud={detalle.id_solicitud} expediente={visaExp} onSaved={setVisaExp} />
                  </CBox>
                )}
              </div>

            </>
          ) : (
            <>
              {/* B3 — Formulario académico */}
              <div id="bloque-formulario" className="scroll-mt-4">
                <BlqHead
                  numero="3"
                  titulo="Formulario de datos académicos"
                  estado={estadoDe("formulario")}
                  open={isOpen("formulario")} onToggle={() => toggleBloque("formulario")}
                />
                {isOpen("formulario") && (
                  <CBox>
                    <div className="p-5">
                      <FormularioDatosAcademicosAdmin
                        datos={detalle.datos_formulario}
                        idSolicitud={detalle.id_solicitud}
                        onActualizado={(nuevosDatos) =>
                          setDetalle((prev) => ({ ...prev, datos_formulario: nuevosDatos }))
                        }
                      />
                    </div>
                  </CBox>
                )}
              </div>

              {/* B4 — Informe de búsqueda */}
              <div id="bloque-informe" className="scroll-mt-4">
                <BlqHead
                  numero="4"
                  titulo="Informe de búsqueda de másteres"
                  estado={estadoDe("informe")}
                  open={isOpen("informe")} onToggle={() => toggleBloque("informe")}
                />
                {isOpen("informe") && (
                  <CBox>
                    <div className="px-5 pt-4">
                      <InformeAdmin detalle={detalle} recargar={cargar} onRegenerado={handleInformeRegenerado} />
                    </div>
                  </CBox>
                )}
              </div>

              {/* B5 — Elección de másteres */}
              <div id="bloque-eleccion" className="scroll-mt-4">
                <BlqHead
                  numero="5"
                  titulo="Elección de másteres (cliente)"
                  estado={estadoDe("eleccion")}
                  open={isOpen("eleccion")} onToggle={() => toggleBloque("eleccion")}
                />
                {isOpen("eleccion") && (
                  <CBox>
                    <div className="p-5">
                      <EleccionMastersAdmin
                        elecciones={detalle.eleccion_masters}
                        idSolicitud={detalle.id_solicitud}
                        onEleccionesActualizadas={handleEleccionesActualizadas}
                        resetKey={eleccionResetKey}
                      />
                    </div>
                  </CBox>
                )}
              </div>

              {/* B6 — Programación de postulaciones */}
              <div id="bloque-programacion" className="scroll-mt-4">
                <BlqHead numero="6" titulo="Programación de postulaciones" estado={estadoDe("programacion")}
                  open={isOpen("programacion")} onToggle={() => toggleBloque("programacion")} />
                {isOpen("programacion") && (
                  <CBox>
                    <div className="p-5">
                      <ProgramacionPostulacionesAdmin idSolicitud={detalle.id_solicitud} refreshKey={progRefreshKey} />
                    </div>
                  </CBox>
                )}
              </div>

              {/* B7 — Portales y justificantes */}
              {/* Documentos del proceso: lo que se genera durante el tramite.
                  Aparte del checklist para que no se pierda entre lo pendiente. */}
              <div id="bloque-docsproceso" className="scroll-mt-4">
                <BlqHead numero="D" titulo="Documentos del proceso" estado="pendiente"
                  open={isOpen("docsproceso")} onToggle={() => toggleBloque("docsproceso")} />
                {isOpen("docsproceso") && (
                  <CBox>
                    <div className="p-5">
                      <DocumentosProceso idSolicitud={detalle.id_solicitud} modo="asesor" />
                    </div>
                  </CBox>
                )}
              </div>

              <div id="bloque-portales" className="scroll-mt-4">
                <BlqHead numero="7" titulo="Portales, claves y justificantes" estado={estadoDe("portales")}
                  open={isOpen("portales")} onToggle={() => toggleBloque("portales")} />
                {isOpen("portales") && (
                  <CBox>
                    <div className="p-5">
                      <PortalesYJustificantesAdmin idSolicitud={detalle.id_solicitud} />
                    </div>
                  </CBox>
                )}
              </div>

              {/* B8 — Cierre de servicio */}
              <div id="bloque-cierre" className="scroll-mt-4">
                <BlqHead numero="8" titulo="Cierre de servicio y derivación" estado={estadoDe("cierre")}
                  open={isOpen("cierre")} onToggle={() => toggleBloque("cierre")} />
                {isOpen("cierre") && (
                  <CBox>
                    <div className="px-5 pt-4">
                      <CierreServicioMasterAdmin idSolicitud={detalle.id_solicitud} />
                    </div>
                  </CBox>
                )}
              </div>
            </>
          )}

        </div>
      </main>

    </div>
  );
}
