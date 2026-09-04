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
import { SERVICIO, servicioDe } from "../servicios";
import { datosQueFaltan } from "../hooks/usePerfilIncompletoBool";
import ServiciosList from "./mis-servicios/ServiciosList";

function diasHasta(iso) {
  const hoy = new Date(); hoy.setHours(0, 0, 0, 0);
  const [a, m, d] = iso.split("-").map(Number);
  return Math.round((new Date(a, m - 1, d) - hoy) / 86400000);
}

function cuando(dias) {
  if (dias <= 0) return "hoy";
  if (dias === 1) return "mañana";
  return `en ${dias} días`;
}

const plural = (n, uno, varios) => `${n} ${n === 1 ? uno : varios}`;

// El nombre del servicio arrastra el plan y las comunidades («Postulación a
// Máster · Plan Full Económico · Andalucía, Castilla…»): en una línea de
// pendientes basta con saber de cuál es.
const recorta = (t, n = 44) => (t && t.length > n ? t.slice(0, n - 1).trim() + "…" : t);

/**
 * Lo pendiente, con su peso: 0 es lo que no puede esperar. Solo entra lo que
 * depende del asesorado; lo que está en manos de Inspira —un informe en
 * preparación— no es una tarea suya y no se le pone en la lista.
 */
function pendientesDe(servicios, perfil, conAcademico) {
  const items = [];

  const faltan = datosQueFaltan(perfil, conAcademico);
  if (faltan > 0) {
    items.push({
      clave: "perfil", peso: 3, tono: "aviso", icono: "usuario",
      texto: `Te ${faltan === 1 ? "falta un dato" : `faltan ${faltan} datos`} del perfil`,
      accion: "Completar", href: rutaDe({ tab: "perfil" }),
    });
  }

  for (const s of servicios || []) {
    const r = s.resumen || {};
    const tipo = servicioDe(s);
    // Estancia y modificatoria no tienen secciones con URL: se abre el expediente.
    const conSecciones = !r.servicio_propio;
    const ir = (seccion) => rutaDe({ idServicio: s.id_solicitud, seccion: conSecciones ? seccion : null });
    const de = recorta(s.invitado ? `Expediente de ${s.titular}` : s.titulo);
    const id = s.id_solicitud;

    for (const q of r.requerimientos || []) {
      items.push({
        clave: `req-${id}-${q.titulo}`, peso: 0, tono: "alto", icono: "escudo",
        texto: `Requerimiento de Extranjería: ${q.titulo}`,
        detalle: q.plazo ? `Plazo: ${q.plazo}` : null, servicio: de,
        accion: "Ver", href: ir(null),
      });
    }
    if (r.docs_observados > 0) {
      items.push({
        clave: `obs-${id}`, peso: 1, tono: "alto", icono: "documento",
        texto: plural(r.docs_observados, "documento observado", "documentos observados"),
        detalle: "Hay que volver a subirlos corregidos", servicio: de,
        accion: "Corregir", href: ir("docs"),
      });
    }
    for (const p of r.plazos || []) {
      const d = diasHasta(p.cierra);
      items.push({
        clave: `plazo-${id}-${p.id_master}`, peso: d <= 3 ? 0 : 2, tono: d <= 3 ? "alto" : "aviso",
        icono: "reloj",
        texto: `${p.universidad || "Postulación"}: cierra ${cuando(d)}`,
        detalle: p.nombre, servicio: de,
        accion: "Ver plazos", href: ir("post"),
      });
    }
    if (r.datos_faltan > 0) {
      items.push({
        clave: `datos-${id}`, peso: 3, tono: "aviso", icono: "usuario",
        texto: `${plural(r.datos_faltan, "dato del expediente", "datos del expediente")} por completar`,
        servicio: de, accion: "Completar", href: ir(null),
      });
    }
    // En el máster «pendiente» es lo que el asesor aún no revisó, y eso no es
    // tarea del asesorado. En los expedientes propios es lo que falta por subir.
    if (r.servicio_propio && r.docs_pendientes > 0) {
      items.push({
        clave: `docs-${id}`, peso: 3, tono: "aviso", icono: "documento",
        texto: `${plural(r.docs_pendientes, "documento", "documentos")} por subir`,
        servicio: de, accion: "Subir", href: ir("docs"),
      });
    }
    if (r.formulario_completo === false) {
      items.push({
        clave: `form-${id}`, peso: 4, tono: "info", icono: "documento",
        texto: "Formulario académico pendiente",
        detalle: "Con él preparamos tu informe de másteres", servicio: de,
        accion: "Rellenar", href: ir("form"),
      });
    }
    if (r.eleccion_completa === false && r.informe_disponible && tipo !== SERVICIO.VISADO) {
      items.push({
        clave: `elec-${id}`, peso: 4, tono: "info", icono: "brujula",
        texto: "Elige tus másteres", detalle: "Tu informe ya está listo", servicio: de,
        accion: "Elegir", href: ir("eleccion"),
      });
    }
  }

  return items.sort((a, b) => a.peso - b.peso);
}

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
