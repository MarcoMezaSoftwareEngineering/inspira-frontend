// «Activa los avisos»: la tarjeta para recibir en el móvil lo que no puede
// esperar a que el asesorado abra el correo.
//
// Web Push estándar (services/push.js), sin servicios de pago. El correo sigue
// siendo la constancia; esto solo avisa al momento de un mensaje del asesor,
// un documento por corregir o un plazo.
//
// Dos variantes:
//   · inicio: solo sale si hay algo que hacer (activar, o instalar la app en
//     iPhone). «Ahora no» la aparca 14 días en este dispositivo, igual que
//     AvisoInstalarApp. Activa, no ocupa sitio.
//   · perfil: siempre enseña el estado y deja activar o desactivar. Sin
//     «Ahora no»: ahí se entra a propósito.
import { useEffect, useState } from "react";
import { activarAvisos, desactivarAvisos, estadoAvisos, esIOS } from "../../../services/push";

const CLAVE_POSPUESTO = "inspira:avisos-pospuesto";
const DIAS_POSPUESTO = 14;

function pospuestoVigente() {
  try {
    const f = Date.parse(localStorage.getItem(CLAVE_POSPUESTO) || "");
    return Number.isFinite(f) && Date.now() - f < DIAS_POSPUESTO * 864e5;
  } catch {
    return false;
  }
}

function IconoCampana() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
      <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
    </svg>
  );
}

const QUE_AVISA = "Te avisamos al momento de los mensajes de tu asesor, los documentos por corregir y los plazos.";

export default function AvisosMovil({ variante = "inicio" }) {
  const enPerfil = variante === "perfil";
  const [estado, setEstado] = useState(null); // null mientras se consulta
  const [ocupado, setOcupado] = useState(false);
  const [error, setError] = useState("");
  const [oculto, setOculto] = useState(() => !enPerfil && pospuestoVigente());

  useEffect(() => {
    let vivo = true;
    estadoAvisos()
      .then((e) => { if (vivo) setEstado(e); })
      .catch(() => { if (vivo) setEstado("no-disponible"); });
    return () => { vivo = false; };
  }, []);

  if (oculto || estado === null) return null;
  // Sin nada que ofrecer (navegador sin push, servidor sin claves) no se
  // enseña: una tarjeta que no deja hacer nada solo estorba.
  if (estado === "no-soportado" || estado === "no-disponible") return null;
  // En Inicio, ya activos no hace falta recordarlo.
  if (!enPerfil && estado === "activo") return null;

  function ahoraNo() {
    try { localStorage.setItem(CLAVE_POSPUESTO, new Date().toISOString()); } catch { /* sin almacenamiento */ }
    setOculto(true);
  }

  async function activar() {
    setOcupado(true);
    setError("");
    try {
      const r = await activarAvisos();
      setEstado(r.estado === "no-disponible" ? "inactivo" : r.estado);
      if (!r.ok && r.mensaje) setError(r.mensaje);
    } finally {
      setOcupado(false);
    }
  }

  async function desactivar() {
    setOcupado(true);
    setError("");
    try {
      const r = await desactivarAvisos();
      setEstado(r.estado);
    } finally {
      setOcupado(false);
    }
  }

  let texto;
  let botones = null;
  if (estado === "instalar-ios") {
    texto = <>En iPhone los avisos solo llegan con la app instalada. Añade Inspira a tu pantalla de inicio desde <b>Safari</b> (Compartir → «Añadir a pantalla de inicio») y actívalos desde allí.</>;
  } else if (estado === "denegado") {
    texto = esIOS()
      ? <>Tienes los avisos bloqueados. Para recibirlos, ve a <b>Ajustes → Notificaciones → Inspira</b> y permítelos.</>
      : <>Tienes los avisos bloqueados para esta web. Pulsa el candado junto a la dirección, entra en <b>Notificaciones</b> y elige «Permitir».</>;
  } else if (estado === "activo") {
    texto = <>Avisos activados en este dispositivo. {QUE_AVISA.replace("Te avisamos", "Te avisaremos")}</>;
    botones = (
      <button type="button" className="pnl-btn pnl-avisos-btn" onClick={desactivar} disabled={ocupado}>
        {ocupado ? "Desactivando…" : "Desactivar"}
      </button>
    );
  } else {
    texto = QUE_AVISA;
    botones = (
      <button type="button" className="pnl-btn-cta pnl-avisos-btn" onClick={activar} disabled={ocupado}>
        {ocupado ? "Activando…" : "Activar avisos"}
      </button>
    );
  }

  const activo = estado === "activo";
  return (
    <section className={`pnl-avisos pnl-avisos-${variante}${activo ? " pnl-avisos-activo" : ""}`} aria-label="Avisos en el móvil">
      <div className="pnl-avisos-cabecera">
        <span className="pnl-avisos-icono"><IconoCampana /></span>
        <div className="pnl-avisos-textos">
          <h2 className="pnl-avisos-titulo">{activo ? "Avisos activados" : "Avisos en tu móvil"}</h2>
          <p className="pnl-avisos-texto">{texto}</p>
        </div>
      </div>
      {error && <p className="pnl-avisos-error" role="alert">{error}</p>}
      {(botones || !enPerfil) && (
        <div className="pnl-avisos-botones">
          {botones}
          {!enPerfil && (
            <button type="button" className="pnl-avisos-ahora-no" onClick={ahoraNo}>Ahora no</button>
          )}
        </div>
      )}
    </section>
  );
}
