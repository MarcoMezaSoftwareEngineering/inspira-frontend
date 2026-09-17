// La cabecera de Inicio: saludo, tres cifras y quién le atiende.
//
// Sustituye a la tarjeta «Te atiende», que ocupaba media pantalla del móvil
// para decir un nombre y un botón. Ahora esa misma franja dice además cómo va
// todo —pendientes, servicios, mensajes— y cada cifra lleva a donde se mira.
import Icono from "../../../components/common/Icono";
import { lineaDe, whatsappDesde } from "../../../config/contacto";
import { datosUsuario } from "../../../components/common/usuario";
import { navigate } from "../../../services/navigate";
import { rutaDe } from "../ruta";
import { saludoDeHora, useContador } from "../hooks/useMovimiento";

function iniciales(nombre) {
  const p = String(nombre || "").trim().split(/\s+/).filter(Boolean);
  return ((p[0]?.[0] || "") + (p[1]?.[0] || "")).toUpperCase() || "IN";
}

function Cifra({ valor, texto, tono, onClick, etiqueta }) {
  const n = useContador(valor);
  return (
    <button type="button" className="pnl-hero-stat" data-tono={tono} onClick={onClick} aria-label={etiqueta}>
      <b>{n}</b>
      <small>{texto}</small>
    </button>
  );
}

export default function SaludoInicio({ perfil, servicios, pendientes = 0, onVerPendientes }) {
  const lista = servicios || [];
  const { corto } = datosUsuario(perfil);
  const propio = lista.find((s) => !s.invitado && s.asesor);
  const asesor = propio?.asesor || null;
  const linea = lineaDe("inspira");
  const sinLeer = lista.reduce((t, s) => t + (s.resumen?.mensajes_sin_leer || 0), 0);
  const conMensajes = lista.find((s) => s.resumen?.mensajes_sin_leer > 0);

  const hoy = new Date().toLocaleDateString("es-PE", { weekday: "long", day: "numeric", month: "long" });
  const resumen = pendientes === 0
    ? "Todo al día. Te avisaremos aquí y por correo cuando haya algo nuevo."
    : pendientes === 1
      ? "Tienes una cosa pendiente. Empieza por aquí abajo."
      : `Tienes ${pendientes} cosas pendientes, ordenadas por urgencia.`;

  return (
    <section className="pnl-hero" aria-label="Resumen de tu expediente">
      <span className="pnl-hero-reticula" aria-hidden="true" />
      <p className="pnl-hero-fecha">{hoy}</p>
      <h2 className="pnl-hero-saludo">
        {saludoDeHora()}{corto ? <>, <span>{corto}</span></> : null}
      </h2>
      <p className="pnl-hero-resumen">{resumen}</p>

      <div className="pnl-hero-stats">
        <Cifra
          valor={pendientes} texto={pendientes === 1 ? "Pendiente" : "Pendientes"}
          tono={pendientes ? "aviso" : "ok"} onClick={onVerPendientes}
          etiqueta={`${pendientes} pendientes: ver la lista`}
        />
        <Cifra
          valor={lista.length} texto={lista.length === 1 ? "Servicio" : "Servicios"}
          onClick={() => navigate(rutaDe({ tab: "servicios" }))}
          etiqueta={`${lista.length} servicios: abrir Mis servicios`}
        />
        <Cifra
          valor={sinLeer} texto={sinLeer === 1 ? "Mensaje" : "Mensajes"} tono={sinLeer ? "alto" : undefined}
          onClick={() => navigate(conMensajes
            ? rutaDe({ idServicio: conMensajes.id_solicitud, seccion: conMensajes.resumen?.servicio_propio ? null : "mensajes" })
            : rutaDe({ tab: "servicios" }))}
          etiqueta={sinLeer ? `${sinLeer} mensajes sin leer: abrir` : "Sin mensajes nuevos"}
        />
      </div>

      <div className="pnl-hero-asesor" data-tour="asesor">
        <span className="pnl-hero-asesor-ini" aria-hidden="true">{asesor ? iniciales(asesor.nombre) : <Icono nombre="usuarios" size={18} />}</span>
        <span className="pnl-hero-asesor-datos">
          <small>Te atiende</small>
          <strong>{asesor ? asesor.nombre : "El equipo de Inspira"}</strong>
          <span>{asesor?.cargo || "Tu expediente está en buenas manos"}</span>
          {/* El número escrito: desde un ordenador sin WhatsApp también se lee. */}
          <span className="pnl-hero-asesor-linea">{linea.para} · {linea.numero}</span>
        </span>
        <a
          className="pnl-hero-wa"
          href={whatsappDesde("panel-inicio", "Soy cliente y tengo una consulta sobre mi expediente.")}
          target="_blank" rel="noopener noreferrer"
          aria-label="Escribir por WhatsApp"
        >
          <Icono nombre="chat" size={16} />
          <span className="pnl-hero-wa-texto">WhatsApp</span>
        </a>
      </div>
    </section>
  );
}
