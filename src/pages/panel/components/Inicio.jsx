// La portada del panel: qué le toca hacer hoy, quién le atiende, sus servicios.
//
// El panel estaba organizado por estructura —servicios, secciones— y no por
// acción. Al entrar, nada decía que había dos documentos observados, un plazo
// que cierra en tres días y un requerimiento sin responder. Esa información
// ya existía repartida por las tarjetas y los bloques; aquí se junta en una
// lista, ordenada por urgencia, y cada línea lleva a donde se resuelve.
import { useState } from "react";
import Icono from "../../../components/common/Icono";
import { LINEAS, whatsappLinea } from "../../../config/contacto";
import { navigate } from "../../../services/navigate";
import { rutaDe } from "../ruta";
import { pendientesDe, plural } from "../pendientes";
import ServiciosList from "./mis-servicios/ServiciosList";

function TuAsesor({ servicios }) {
  const propio = (servicios || []).find((s) => !s.invitado && s.asesor);
  const a = propio?.asesor || null;
  const linea = LINEAS.find((l) => l.id === "clientes") || LINEAS[0];
  return (
    <div className="pnl-asesor">
      <div className="pnl-asesor-avatar"><Icono nombre="usuarios" size={20} /></div>
      <div className="pnl-asesor-datos">
        <span className="pnl-asesor-eyebrow">Te atiende</span>
        <strong>{a ? a.nombre : "El equipo de Inspira"}</strong>
        <small>{a?.cargo || "Tu expediente está en manos de nuestro equipo"}</small>
      </div>
      <div className="pnl-asesor-contacto">
        <a
          className="pnl-btn-cta ux-tap"
          href={whatsappLinea(linea, "Hola, soy cliente de Inspira y tengo una consulta sobre mi expediente.")}
          target="_blank" rel="noopener noreferrer"
        >
          <Icono nombre="chat" size={15} />
          Escribir por WhatsApp
        </a>
        <small>Línea de clientes · {linea.numero}</small>
      </div>
    </div>
  );
}

// Cinco a la vista y el resto tras «ver más»: los servicios van debajo y
// tienen que seguir viéndose sin bajar media pantalla.
const A_LA_VISTA = 5;

function Pendientes({ items }) {
  const [todo, setTodo] = useState(false);
  if (!items.length) {
    return (
      <div className="pnl-pend-vacio">
        <span className="pnl-chip pnl-chip-ok"><span className="punto" />Todo al día</span>
        <p>No tienes nada pendiente ahora mismo. Te avisaremos aquí y por correo cuando haya algo.</p>
      </div>
    );
  }
  const visibles = todo ? items : items.slice(0, A_LA_VISTA);
  const ocultos = items.length - visibles.length;
  return (
    <ul className="pnl-pend">
      {visibles.map((it) => (
        <li key={it.clave} className="pnl-pend-item" data-tono={it.tono}>
          <span className="pnl-pend-icono"><Icono nombre={it.icono} size={17} /></span>
          <span className="pnl-pend-cuerpo">
            <span className="pnl-pend-texto">{it.texto}</span>
            {(it.detalle || it.servicio) && (
              <span className="pnl-pend-detalle">
                {[it.detalle, it.servicio].filter(Boolean).join(" · ")}
              </span>
            )}
          </span>
          <button type="button" className="pnl-btn ux-tap" onClick={() => navigate(it.href)}>
            {it.accion}
          </button>
        </li>
      ))}
      {ocultos > 0 && (
        <li>
          <button type="button" className="pnl-btn ux-tap" onClick={() => setTodo(true)}>
            Ver {ocultos} más
          </button>
        </li>
      )}
    </ul>
  );
}

export default function Inicio({ servicios, perfil, conAcademico, loading, error, onRecargar, onVerDetalle }) {
  const lista = servicios || [];
  const items = loading ? [] : pendientesDe(lista, perfil, conAcademico);
  const hayServicios = lista.length > 0;

  return (
    <div className="space-y-6">
      {hayServicios && <TuAsesor servicios={lista} />}

      {hayServicios && (
        <section>
          <div className="pnl-head mb-3">
            <div>
              <h2>Hoy</h2>
              <p>{items.length
                ? `${plural(items.length, "cosa pendiente", "cosas pendientes")}, por orden de urgencia`
                : "Lo que te toca hacer"}</p>
            </div>
            {/* Atajo a la lista: las tarjetas van debajo de los pendientes y en un
                teléfono quedan lejos. */}
            <button type="button" className="pnl-btn ux-tap"
              onClick={() => navigate(rutaDe({ tab: "servicios" }))}>
              <Icono nombre="maletin" size={15} />
              Mis servicios{lista.length ? ` (${lista.length})` : ""}
            </button>
          </div>
          {loading
            ? <div className="pnl-esq" style={{ height: 64, borderRadius: 16 }} />
            : <Pendientes items={items} />}
        </section>
      )}

      <ServiciosList
        servicios={servicios}
        loading={loading}
        error={error}
        onRecargar={onRecargar}
        onVerDetalle={onVerDetalle}
      />
    </div>
  );
}
