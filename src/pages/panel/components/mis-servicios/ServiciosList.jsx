// src/pages/panel/components/mis-servicios/ServiciosList.jsx
import { formatearFecha, badgeEstadoSolicitud } from "./utils";

function AlertaChip({ tipo, count }) {
  if (tipo === "docs_pendientes") return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
      {count} doc{count > 1 ? "s" : ""}. pendiente{count > 1 ? "s" : ""}
    </span>
  );
  if (tipo === "docs_observados") return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-red-50 text-red-700 border border-red-200">
      <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
      {count} doc{count > 1 ? "s" : ""}. observado{count > 1 ? "s" : ""}
    </span>
  );
  if (tipo === "datos") return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
      {count} dato{count > 1 ? "s" : ""} por completar
    </span>
  );
  if (tipo === "formulario") return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
      <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
      Formulario pendiente
    </span>
  );
  if (tipo === "informe") return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-purple-50 text-purple-700 border border-purple-200">
      <span className="w-1.5 h-1.5 rounded-full bg-purple-500 shrink-0" />
      Informe en preparación
    </span>
  );
  if (tipo === "eleccion") return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
      <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0" />
      Pendiente elegir másteres
    </span>
  );
  return null;
}

function ServicioCard({ s, onVerDetalle }) {
  // «Borrador» es el primer estado del flujo administrativo genérico. Para un
  // servicio que el asesor ya dio de alta es falso: está contratado y en
  // marcha. Cuando el servicio tiene recorrido propio, se enseña el suyo.
  const estadoBadge = badgeEstadoSolicitud(s.estado?.nombre, s.estado?.es_final);
  const r = s.resumen || {};

  // Qué avisos tocan lo decide el servidor: es él quien sabe qué tiene cada
  // servicio. Filtrarlo aquí por el nombre obligaba a acordarse en cada
  // servicio nuevo, y ya falló dos veces.
  const alertas = [];
  if (r.datos_faltan > 0)      alertas.push({ tipo: "datos", count: r.datos_faltan });
  if (r.docs_pendientes > 0)   alertas.push({ tipo: "docs_pendientes", count: r.docs_pendientes });
  if (r.docs_observados > 0)   alertas.push({ tipo: "docs_observados", count: r.docs_observados });
  if (!r.formulario_completo)  alertas.push({ tipo: "formulario" });
  if (!r.informe_disponible)   alertas.push({ tipo: "informe" });
  if (!r.eleccion_completa)    alertas.push({ tipo: "eleccion" });

  return (
    <div className="bg-white border border-neutral-200 rounded-2xl shadow-sm hover:shadow-md hover:border-neutral-300 transition-all duration-200 flex flex-col">

      {/* Cabecera */}
      <div className="px-5 pt-5 pb-4 flex-1 space-y-3">
        {/* Badges de estado */}
        <div className="flex flex-wrap items-center gap-1.5">
          {r.etapa_propia ? (
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-[#EEF2F8]
              text-[#1A3557] font-semibold border border-[#1A3557]/20">
              {r.etapa_propia}
            </span>
          ) : (
            <span className={estadoBadge.classes}>{estadoBadge.text}</span>
          )}
          {s.tipo?.nombre && (
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-[#023A4B]/8 text-[#023A4B] font-medium border border-[#023A4B]/15">
              {s.tipo.nombre}
            </span>
          )}
        </div>

        {/* Título */}
        <div>
          {/* De quién es. Sin esto, quien entra invitado ve en «Mis servicios»
              un expediente con apellidos ajenos y no entiende qué mira. */}
          {s.invitado && (
            <p className="text-[11.5px] font-semibold text-amber-700 mb-0.5">
              Expediente de {s.titular}
            </p>
          )}
          <h3 className="text-base font-bold text-neutral-900 leading-snug">
            {s.titulo || "Servicio sin título"}
          </h3>
          {s.descripcion && (
            <p className="text-xs text-neutral-500 mt-1 line-clamp-2">{s.descripcion}</p>
          )}
        </div>

        {/* Alertas de pendientes */}
        {alertas.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {alertas.map((a) => (
              <AlertaChip key={a.tipo} tipo={a.tipo} count={a.count} />
            ))}
          </div>
        )}
        {alertas.length === 0 && (
          <div className="flex items-center gap-1.5 pt-1">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
              Todo al día
            </span>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-5 py-3.5 border-t border-neutral-100 flex items-center justify-between gap-3">
        <div className="text-[11px] text-neutral-400 space-y-0.5 min-w-0">
          <p>Creada el <span className="font-medium text-neutral-500">{formatearFecha(s.fecha_creacion)}</span></p>
          <p className="font-mono truncate">{s.codigo_publico}</p>
        </div>
        <button
          type="button"
          onClick={() => onVerDetalle(s)}
          className="shrink-0 inline-flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-xl bg-[#023A4B] text-white hover:bg-[#035670] active:scale-95 transition-all shadow-sm"
        >
          Ver servicio
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
          </svg>
        </button>
      </div>
    </div>
  );
}

function ServiciosList({ servicios, loading, error, onRecargar, onVerDetalle }) {
  return (
    <div className="space-y-5">
      {/* Cabecera */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-neutral-900">Mis servicios</h2>
          <p className="text-sm text-neutral-500">Servicios contratados con Inspira</p>
        </div>
        <button
          type="button"
          onClick={onRecargar}
          className="inline-flex items-center gap-1.5 text-sm font-medium px-3.5 py-2 rounded-xl border border-neutral-200 bg-white hover:bg-neutral-50 shadow-sm transition"
        >
          <svg className="w-4 h-4 text-neutral-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
          </svg>
          Actualizar
        </button>
      </div>

      {/* Loading */}
      {loading && (
        <div className="bg-white border border-neutral-200 rounded-2xl p-10 text-center shadow-sm">
          <div className="w-6 h-6 border-2 border-[#046C8C] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-neutral-400">Cargando tus servicios…</p>
        </div>
      )}

      {/* Error */}
      {!loading && error && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* Vacío */}
      {!loading && !error && (!servicios || servicios.length === 0) && (
        <div className="bg-white border border-neutral-200 rounded-2xl p-12 text-center shadow-sm">
          <div className="w-12 h-12 rounded-full bg-neutral-100 flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-neutral-400" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0M12 12.75h.008v.008H12v-.008z" />
            </svg>
          </div>
          <p className="text-sm font-semibold text-neutral-700 mb-1">Aún no tienes servicios contratados</p>
          <p className="text-xs text-neutral-400 max-w-xs mx-auto">
            Cuando se apruebe un pago, tu servicio aparecerá aquí automáticamente.
          </p>
        </div>
      )}

      {/* Cards */}
      {!loading && !error && servicios && servicios.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {servicios.map((s) => (
            <ServicioCard key={s.id_solicitud} s={s} onVerDetalle={onVerDetalle} />
          ))}
        </div>
      )}

      <p className="text-xs text-neutral-400">
        Las solicitudes se generan automáticamente cuando un pago se aprueba.
      </p>
    </div>
  );
}

export default ServiciosList;
