// src/pages/backoffice/solicitudes/SolicitudDetalleBackoffice.jsx
import { useEffect, useRef, useState } from "react";
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
import VisaSesionAdmin from "./components/visa/VisaSesionAdmin";
import VisaCitaAdmin from "./components/visa/VisaCitaAdmin";
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
      className={`flex items-center gap-3 w-full text-left px-4 py-3 mb-2 rounded-[12px] bg-white border shadow-sm transition-all active:scale-[0.995] ${cardBorder[e] || cardBorder.inactivo} ${open ? "rounded-b-none mb-0 border-b-0" : ""}`}
    >
      <div className={`w-[28px] h-[28px] rounded-[7px] flex items-center justify-center text-[12px] font-extrabold font-mono shrink-0 ${badge[e] || badge.inactivo}`}>
        {numero}
      </div>
      <span className="font-serif text-[15px] text-[#1A3557] flex-1 font-semibold">{titulo}</span>
      <span className={`text-[10px] font-semibold px-[10px] py-1 rounded-full shrink-0 ${chip[e] || chip.inactivo}`}>
        {chipLabel[e] || "—"}
      </span>
      <svg
        className={`w-4 h-4 text-neutral-400 transition-transform duration-200 shrink-0 ${open ? "rotate-0" : "-rotate-90"}`}
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
  const isOpen = (id) => activeBloque === id;

  // Datos de Visado (Fase 2)
  const [visaExp, setVisaExp] = useState(null);
  const [visaSesiones, setVisaSesiones] = useState([]);

  function toggleBloque(id) {
    setActiveBloque(id);
  }

  function irABloque(id) {
    setActiveBloque(id);
    setTimeout(() => {
      const el = document.getElementById(`bloque-${id}`);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 50);
  }

  const [progRefreshKey,   setProgRefreshKey]   = useState(0);
  const [eleccionResetKey, setEleccionResetKey] = useState(0);

  // Los 8 bloques y su estado vienen calculados del servidor.
  const bloques  = detalle?.estado_expediente?.bloques ?? [];
  const isVisado = bloques.some((b) => b.id === "solvencia");
  const estadoDe = (id) => bloques.find((b) => b.id === id)?.estado ?? "pendiente";

  // Cargar expediente + sesiones de Visado
  useEffect(() => {
    if (!detalle || !isVisado) return;
    let cancel = false;
    (async () => {
      const [e, s] = await Promise.all([
        boGET(`/backoffice/solicitudes/${detalle.id_solicitud}/visa-expediente`),
        boGET(`/backoffice/solicitudes/${detalle.id_solicitud}/sesiones`),
      ]);
      if (cancel) return;
      if (e.ok) setVisaExp(e.expediente || null);
      if (s.ok) setVisaSesiones(s.sesiones || []);
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

  async function cambiarSolvencia(nuevo) {
    const r = await boPATCH(`/backoffice/solicitudes/${detalle.id_solicitud}/visa-expediente`, { tipo_solvencia: nuevo });
    if (r.ok) setVisaExp(r.expediente);
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

  const pct      = detalle?.estado_expediente?.pct ?? 0;
  const etiqueta = detalle?.estado_expediente?.etiqueta ?? "sin iniciar";

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

  function dotColor(estado) {
    if (estado === "completado") return "bg-[#1D6A4A]";
    if (estado === "observado")  return "bg-[#DC2626]";
    if (estado === "pendiente")  return "bg-[#F59E0B]";
    if (estado === "revision")   return "bg-[#6D28D9]";
    return "bg-[#E2E8F0]";
  }

  return (
    <div className="flex-1 min-h-0 flex overflow-hidden">

      {/* ── SIDEBAR ── */}
      <aside className="w-[220px] flex-none border-r border-[#E2E8F0] bg-white overflow-y-auto px-[9px] py-3">

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
        <div className="p-[22px] pb-20">

          {/* B1 — Encabezado del cliente */}
          <div id="bloque-cliente" className="scroll-mt-4">
            <BlqHead numero="1" titulo="Encabezado del cliente" estado={estadoDe("cliente")}
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

          {/* B2 — Documentos requeridos */}
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

          {isVisado ? (
            <>
              {/* B3 — Tipo de medios económicos */}
              <div id="bloque-solvencia" className="scroll-mt-4">
                <BlqHead numero="3" titulo="Tipo de medios económicos"
                  estado={(visaExp?.tipo_solvencia && visaExp.tipo_solvencia !== "PENDIENTE") ? "completado" : "pendiente"}
                  open={isOpen("solvencia")} onToggle={() => toggleBloque("solvencia")} />
                {isOpen("solvencia") && (
                  <CBox>
                    <VisaSolvenciaAdmin idSolicitud={detalle.id_solicitud} expediente={visaExp} onSaved={setVisaExp} />
                  </CBox>
                )}
              </div>

              {/* B4 — Sesión diagnóstico */}
              <div id="bloque-diagnostico" className="scroll-mt-4">
                <BlqHead numero="4" titulo="Sesión de diagnóstico"
                  estado={sesionEstadoBloque("DIAGNOSTICO")}
                  open={isOpen("diagnostico")} onToggle={() => toggleBloque("diagnostico")} />
                {isOpen("diagnostico") && (
                  <CBox>
                    <VisaSesionAdmin idSolicitud={detalle.id_solicitud} tipo="DIAGNOSTICO"
                      sesion={sesionPorTipo("DIAGNOSTICO")} onSaved={onSesionGuardada}
                      solvencia={visaExp?.tipo_solvencia || "PENDIENTE"} onSolvencia={cambiarSolvencia}
                      agenda={["Revisar situación migratoria actual", "Evaluar viabilidad del expediente", "Definir tipo de medios económicos (propios o aval)", "Identificar documentos complejos y plazos", "Instrucciones certificado médico y antecedentes penales"]} />
                  </CBox>
                )}
              </div>

              {/* B5 — Sesión seguimiento */}
              <div id="bloque-seguimiento" className="scroll-mt-4">
                <BlqHead numero="5" titulo="Sesión de seguimiento"
                  estado={sesionEstadoBloque("SEGUIMIENTO")}
                  open={isOpen("seguimiento")} onToggle={() => toggleBloque("seguimiento")} />
                {isOpen("seguimiento") && (
                  <CBox>
                    <VisaSesionAdmin idSolicitud={detalle.id_solicitud} tipo="SEGUIMIENTO"
                      sesion={sesionPorTipo("SEGUIMIENTO")} onSaved={onSesionGuardada}
                      agenda={["Revisión de documentos ya reunidos", "Observaciones pendientes por subsanar", "Estado de la solvencia económica y apostillas", "Definir fecha estimada para formulario y cita"]} />
                  </CBox>
                )}
              </div>

              {/* B6 — Formulario de visado */}
              <div id="bloque-formulario" className="scroll-mt-4">
                <BlqHead numero="6" titulo="Formulario de visado"
                  estado={visaExp?.formulario_estado === "FIRMADO" ? "completado" : visaExp?.formulario_estado === "ENVIADO" ? "revision" : "pendiente"}
                  open={isOpen("formulario")} onToggle={() => toggleBloque("formulario")} />
                {isOpen("formulario") && (
                  <CBox>
                    <VisaFormularioAdmin idSolicitud={detalle.id_solicitud} expediente={visaExp} onSaved={setVisaExp} mode="estado" />
                  </CBox>
                )}
              </div>

              {/* B7 — Sesión pre-cita */}
              <div id="bloque-precita" className="scroll-mt-4">
                <BlqHead numero="7" titulo="Sesión pre-cita"
                  estado={sesionEstadoBloque("PRECITA")}
                  open={isOpen("precita")} onToggle={() => toggleBloque("precita")} />
                {isOpen("precita") && (
                  <CBox>
                    <VisaSesionAdmin idSolicitud={detalle.id_solicitud} tipo="PRECITA"
                      sesion={sesionPorTipo("PRECITA")} onSaved={onSesionGuardada}
                      agenda={["Verificar que todos los documentos estén aprobados", "Confirmar expediente original completo (original + copia)", "Recordar efectivo para la tasa consular", "Instrucciones logísticas: dirección BLS, hora, qué llevar", "Recordar no comprar billete de avión aún (solo reserva)"]} />
                  </CBox>
                )}
              </div>

              {/* B8 — Cita BLS / Consulado */}
              <div id="bloque-cita" className="scroll-mt-4">
                <BlqHead numero="8" titulo="Cita BLS / Consulado España"
                  estado={visaExp?.cita_estado === "REALIZADA" ? "completado" : (visaExp?.cita_estado && visaExp.cita_estado !== "PENDIENTE") ? "revision" : "pendiente"}
                  open={isOpen("cita")} onToggle={() => toggleBloque("cita")} />
                {isOpen("cita") && (
                  <CBox>
                    <VisaCitaAdmin idSolicitud={detalle.id_solicitud} expediente={visaExp} onSaved={setVisaExp} />
                  </CBox>
                )}
              </div>

              {/* B9 — Cierre del expediente */}
              <div id="bloque-cierre" className="scroll-mt-4">
                <BlqHead numero="9" titulo="Cierre del expediente"
                  estado={visaExp?.cierre_estado === "CERRADO" ? "completado" : visaExp?.cierre_estado === "CANCELADO" ? "observado" : "pendiente"}
                  open={isOpen("cierre")} onToggle={() => toggleBloque("cierre")} />
                {isOpen("cierre") && (
                  <CBox>
                    <VisaCierreAdmin idSolicitud={detalle.id_solicitud} expediente={visaExp} onSaved={setVisaExp} />
                  </CBox>
                )}
              </div>

              {/* Portales · Claves (herramienta interna del asesor) */}
              <div id="bloque-portales" className="scroll-mt-4">
                <BlqHead numero="P" titulo="Portales, claves y justificantes" estado="pendiente"
                  open={isOpen("portales")} onToggle={() => toggleBloque("portales")} />
                {isOpen("portales") && (
                  <CBox>
                    <div className="p-5">
                      <PortalesYJustificantesAdmin idSolicitud={detalle.id_solicitud} />
                    </div>
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
