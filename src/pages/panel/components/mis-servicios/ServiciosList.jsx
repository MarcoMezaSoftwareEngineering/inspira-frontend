// src/pages/panel/components/mis-servicios/ServiciosList.jsx
import Icono from "../../../../components/common/Icono";
import { LINEAS, whatsappLinea } from "../../../../config/contacto";
import { formatearFecha, badgeEstadoSolicitud, refCorta } from "./utils";
import { EsqueletoTarjetas } from "../Esqueleto";

/** Los avisos que puede llevar una tarjeta, con su tono y su redacción. */
// No hay aviso de «documentos pendientes»: contaba lo que el asesor todavía
// no había revisado, y el asesorado ya había hecho su parte. Lo que sí es suyo
// —lo que falta por subir y lo que hay que corregir— sigue avisando.
const AVISOS = {
  datos:          { tono: "aviso", texto: (n) => `${n} dato${n > 1 ? "s" : ""} por completar` },
  docs_observados:{ tono: "alto",  texto: (n) => `${n} doc${n > 1 ? "s" : ""}. observado${n > 1 ? "s" : ""}` },
  formulario:     { tono: "info",  texto: () => "Formulario pendiente" },
  informe:        { tono: "info",  texto: () => "Informe en preparación" },
  eleccion:       { tono: "info",  texto: () => "Pendiente elegir másteres" },
};

function Chip({ tono, children }) {
  return (
    <span className={`pnl-chip pnl-chip-${tono}`}>
      <span className="punto" />
      {children}
    </span>
  );
}

function ServicioCard({ s, onVerDetalle }) {
  // «Borrador» es el primer estado del flujo administrativo genérico. Para un
  // servicio que el asesor ya dio de alta es falso: está contratado y en
  // marcha. Cuando el servicio tiene recorrido propio, se enseña el suyo.
  const estado = badgeEstadoSolicitud(s.estado?.nombre, s.estado?.es_final);
  const r = s.resumen || {};

  // Qué avisos tocan lo decide el servidor: es él quien sabe qué tiene cada
  // servicio. Filtrarlo aquí por el nombre obligaba a acordarse en cada
  // servicio nuevo, y ya falló dos veces.
  const avisos = [];
  if (r.datos_faltan > 0)      avisos.push(["datos", r.datos_faltan]);
  if (r.docs_observados > 0)   avisos.push(["docs_observados", r.docs_observados]);
  if (!r.formulario_completo)  avisos.push(["formulario"]);
  if (!r.informe_disponible)   avisos.push(["informe"]);
  if (!r.eleccion_completa)    avisos.push(["eleccion"]);

  return (
    <article className="pnl-card pnl-card-link">
      <div className="pnl-card-cuerpo">
        <div className="flex flex-wrap items-center gap-1.5">
          {r.etapa_propia ? (
            <span className="pnl-chip pnl-chip-etapa">{r.etapa_propia}</span>
          ) : (
            <span className={`pnl-chip pnl-chip-${estado.tono || "tipo"}`}>{estado.text}</span>
          )}
          {s.tipo?.nombre && <span className="pnl-chip pnl-chip-tipo">{s.tipo.nombre}</span>}
        </div>

        <div>
          {/* De quién es. Sin esto, quien entra invitado ve en «Mis servicios»
              un expediente con apellidos ajenos y no entiende qué mira. */}
          {s.invitado && (
            <span className="pnl-chip pnl-chip-titular mb-2">
              Expediente de {s.titular}
            </span>
          )}
          <h3>{s.titulo || "Servicio sin título"}</h3>
          {s.descripcion && <p className="pnl-card-desc line-clamp-2">{s.descripcion}</p>}
        </div>

        <div className="flex flex-wrap gap-1.5 mt-auto pt-1">
          {avisos.length > 0 ? (
            avisos.map(([tipo, n]) => (
              <Chip key={tipo} tono={AVISOS[tipo].tono}>{AVISOS[tipo].texto(n)}</Chip>
            ))
          ) : (
            <Chip tono="ok">Todo al día</Chip>
          )}
        </div>
      </div>

      <div className="pnl-card-pie">
        <div className="pnl-card-meta">
          <span>Creada el {formatearFecha(s.fecha_creacion)}</span>
          <span className="codigo">{refCorta(s.codigo_publico)}</span>
        </div>
        <button type="button" onClick={() => onVerDetalle(s)} className="pnl-btn-cta shrink-0">
          Ver servicio
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor"
            strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M13.5 4.5L21 12l-7.5 7.5M21 12H3" />
          </svg>
        </button>
      </div>
    </article>
  );
}

/**
 * Quien no tiene ningún servicio contratado no tiene expediente que mirar: el
 * panel no le abre nada. Lo único que puede hacer aquí es dejar sus datos
 * completos —el asistente se los pide al entrar— y pedir el acceso por
 * teléfono, que es quien lo concede. Por eso el número va escrito y no
 * escondido detrás de un botón: se lee también desde un ordenador sin
 * WhatsApp.
 */
function SinAcceso() {
  return (
    <div className="pnl-vacio">
      <div className="pnl-vacio-icono">
        <Icono nombre="escudo" size={28} />
      </div>
      <h3>Tu panel todavía no tiene acceso</h3>
      <p>
        El acceso se activa cuando tienes un servicio contratado con nosotros.
        Completa tus datos en «Mi perfil» y escríbenos para que te lo demos.
      </p>
      {/* Las dos líneas, con el número escrito y para qué es cada una: se lee
          también desde un ordenador sin WhatsApp, y evita que quien pregunta
          por una cita escriba a la línea de clientes. */}
      <div className="pnl-lineas">
        {LINEAS.map((l) => (
          <a
            key={l.id}
            href={whatsappLinea(l, "Hola Inspira, acabo de crear mi cuenta y quiero acceso a mi panel.")}
            target="_blank"
            rel="noopener noreferrer"
            className="pnl-linea"
          >
            <Icono nombre="chat" size={16} />
            <span className="pnl-linea-datos">
              <strong>{l.numero}</strong>
              <small>{l.nombre} · {l.para}</small>
            </span>
          </a>
        ))}
      </div>
      <div className="pnl-vacio-acciones">
        <a href="/servicios" className="pnl-vacio-fantasma">
          Ver todos los servicios
        </a>
      </div>
    </div>
  );
}

function ServiciosList({ servicios, loading, error, onRecargar, onVerDetalle }) {
  const hayServicios = !loading && !error && servicios && servicios.length > 0;

  return (
    <div className="space-y-5">
      <div className="pnl-head">
        <div>
          <h2>Mis servicios</h2>
          <p>Servicios contratados con Inspira</p>
        </div>
        <button type="button" onClick={onRecargar} className="pnl-btn">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor"
            strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M16.02 9.35h5V4.36M2.99 14.65h5v4.99" />
            <path d="M4.03 9.87a8.25 8.25 0 0113.8-3.7l3.19 3.18M21.01 14.65a8.25 8.25 0 01-13.8 3.7l-3.19-3.18" />
          </svg>
          Actualizar
        </button>
      </div>

      {loading && <EsqueletoTarjetas n={2} />}

      {!loading && error && <div className="pnl-error">{error}</div>}

      {!loading && !error && (!servicios || servicios.length === 0) && <SinAcceso />}

      {hayServicios && (
        <div className="pnl-grid">
          {servicios.map((s) => (
            <ServicioCard key={s.id_solicitud} s={s} onVerDetalle={onVerDetalle} />
          ))}
        </div>
      )}

      {/* Solo tiene sentido junto a una lista con algo dentro: bajo el estado
          vacío repetía lo que el propio recuadro ya acaba de decir. */}
      {hayServicios && (
        <p className="pnl-nota">
          Las solicitudes se generan automáticamente cuando un pago se aprueba.
        </p>
      )}
    </div>
  );
}

export default ServiciosList;
