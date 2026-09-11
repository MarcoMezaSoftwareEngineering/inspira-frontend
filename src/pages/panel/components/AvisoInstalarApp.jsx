// «Instala la app»: una tarjeta discreta en Inicio para quien ya tiene servicio.
//
// Carina quiere que el panel se use de verdad, y en el teléfono eso pasa por
// tenerlo como app. Solo sale en teléfonos, fuera de la app instalada, y nunca
// tapa nada: «Ahora no» lo aparca 14 días en este dispositivo.
//
// Android/Chrome lanza `beforeinstallprompt`: se guarda y el botón abre el
// diálogo nativo. Si no lo lanza, no hay botón, sino instrucciones del menú.
// iPhone no tiene evento: se explican los pasos del instructivo de Carina
// (core/email/instructivosApp.js), que solo funcionan en Safari.
import { useEffect, useState } from "react";
import { registrarEvento } from "../../../lib/analytics";

const CLAVE_POSPUESTO = "inspira:app-aviso-pospuesto";
const CLAVE_INSTALADA = "inspira:app-instalada";
const DIAS_POSPUESTO = 14;

// El evento puede llegar antes de que se pinte Inicio: se escucha en cuanto
// se carga este módulo y se guarda para cuando haga falta.
// main.jsx lo captura antes por si llega antes de que cargue este trozo.
let eventoInstalar = (typeof window !== "undefined" && window.__inspiraEventoInstalar) || null;
const oyentes = new Set();
const avisar = () => oyentes.forEach((f) => f());

if (typeof window !== "undefined") {
  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    eventoInstalar = e;
    avisar();
  });
  window.addEventListener("appinstalled", () => {
    eventoInstalar = null;
    try { localStorage.setItem(CLAVE_INSTALADA, new Date().toISOString()); } catch { /* sin almacenamiento */ }
    registrarEvento("app_instalada", { origen: "panel" });
    avisar();
  });
}

function leer(clave) {
  try { return localStorage.getItem(clave); } catch { return null; }
}

/** «iphone», «android» o null (escritorio, tablet o desconocido). */
function plataforma() {
  const ua = navigator.userAgent || "";
  if (/iPhone|iPod/i.test(ua)) return "iphone";
  if (/Android/i.test(ua) && /Mobile/i.test(ua)) return "android";
  return null;
}

function yaInstalada() {
  try {
    if (window.matchMedia?.("(display-mode: standalone)").matches) return true;
  } catch { /* navegador antiguo */ }
  return window.navigator.standalone === true;
}

/** En iPhone solo Safari permite añadir a la pantalla de inicio. */
function iphoneFueraDeSafari() {
  const ua = navigator.userAgent || "";
  if (/CriOS|FxiOS|EdgiOS|OPiOS|GSA\/|FBAN|FBAV|Instagram|WhatsApp|Line\/|LinkedInApp|TikTok|musical_ly|Snapchat|Twitter/i.test(ua)) return true;
  return !/Safari\//.test(ua);
}

/** Navegadores dentro de otras apps en Android: ahí tampoco se instala. */
function androidDentroDeApp() {
  const ua = navigator.userAgent || "";
  return /; wv\)|FBAN|FBAV|Instagram|WhatsApp|Line\/|TikTok|musical_ly|Snapchat/i.test(ua);
}

function pospuestoVigente() {
  const f = Date.parse(leer(CLAVE_POSPUESTO) || "");
  return Number.isFinite(f) && Date.now() - f < DIAS_POSPUESTO * 864e5;
}

function IconoCompartir() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 3v12M8 7l4-4 4 4" />
      <path d="M5 11v8a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-8" />
    </svg>
  );
}
function IconoAnadir() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="4" y="4" width="16" height="16" rx="4" />
      <path d="M12 8v8M8 12h8" />
    </svg>
  );
}
function IconoListo() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"
      strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M5 12.5l4.5 4.5L19 7.5" />
    </svg>
  );
}
function IconoTelefono() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="7" y="2.5" width="10" height="19" rx="2.5" />
      <path d="M11 18.5h2" />
    </svg>
  );
}

function PasosIphone() {
  const pasos = [
    { icono: <IconoCompartir />, texto: <>Pulsa <b>Compartir</b>, el cuadrado con la flecha hacia arriba de la barra de Safari.</> },
    { icono: <IconoAnadir />, texto: <>Baja en las opciones y elige <b>«Añadir a pantalla de inicio»</b>.</> },
    { icono: <IconoListo />, texto: <>Pulsa <b>«Añadir»</b>. El icono de Inspira aparecerá en tu pantalla de inicio.</> },
  ];
  return (
    <ol className="ex-app-pasos">
      {pasos.map((p, i) => (
        <li key={i}>
          <span className="ex-app-paso-icono text-primary">{p.icono}</span>
          <span className="ex-app-paso-num text-accent">{i + 1}</span>
          <span>{p.texto}</span>
        </li>
      ))}
    </ol>
  );
}

export default function AvisoInstalarApp({ bloqueado = false }) {
  const [, refrescar] = useState(0);
  const [oculto, setOculto] = useState(() => Boolean(leer(CLAVE_INSTALADA)) || pospuestoVigente());

  useEffect(() => {
    const f = () => refrescar((n) => n + 1);
    oyentes.add(f);
    return () => { oyentes.delete(f); };
  }, []);

  const so = plataforma();
  const visible = !bloqueado && !oculto && so && !yaInstalada() && !leer(CLAVE_INSTALADA);

  useEffect(() => {
    if (visible) registrarEvento("app_aviso_visto", { plataforma: so });
  }, [visible, so]);

  if (!visible) return null;

  function ahoraNo() {
    try { localStorage.setItem(CLAVE_POSPUESTO, new Date().toISOString()); } catch { /* sin almacenamiento */ }
    registrarEvento("app_aviso_ahora_no", { plataforma: so });
    setOculto(true);
  }

  async function instalar() {
    const e = eventoInstalar;
    if (!e) return;
    registrarEvento("app_instalar_pulsado", { plataforma: so });
    try {
      await e.prompt();
      const eleccion = await e.userChoice;
      registrarEvento("app_instalar_resultado", { resultado: eleccion?.outcome || "desconocido" });
      eventoInstalar = null; // el mismo evento no se puede volver a usar
      if (eleccion?.outcome === "accepted") {
        try { localStorage.setItem(CLAVE_INSTALADA, new Date().toISOString()); } catch { /* sin almacenamiento */ }
        setOculto(true);
      } else {
        refrescar((n) => n + 1);
      }
    } catch {
      eventoInstalar = null;
      refrescar((n) => n + 1);
    }
  }

  let cuerpo;
  if (so === "iphone") {
    cuerpo = iphoneFueraDeSafari()
      ? <p className="ex-app-texto">En iPhone solo se instala desde <b>Safari</b>. Abre este enlace en Safari (en el menú de esta app, «Abrir en Safari») y sigue los pasos que verás aquí.</p>
      : <PasosIphone />;
  } else if (eventoInstalar) {
    cuerpo = <p className="ex-app-texto">Tu panel, a un toque desde la pantalla de inicio, sin pasar por ninguna tienda.</p>;
  } else if (androidDentroDeApp()) {
    cuerpo = <p className="ex-app-texto">Desde aquí no se puede instalar. Abre este enlace en <b>Chrome</b> y vuelve a entrar en tu panel.</p>;
  } else {
    cuerpo = <p className="ex-app-texto">Abre el menú <b>⋮</b> de Chrome, arriba a la derecha, y pulsa <b>«Instalar aplicación»</b> o <b>«Añadir a pantalla de inicio»</b>.</p>;
  }

  return (
    <section className="ex-app" aria-label="Instala la app de Inspira">
      <div className="ex-app-cabecera">
        <span className="ex-app-icono bg-sky/20 text-primary"><IconoTelefono /></span>
        <div className="min-w-0">
          <h2 className="ex-app-titulo text-primary">Instala la app de Inspira</h2>
          <p className="ex-app-sub">Entras más rápido y tienes tu expediente siempre a mano.</p>
        </div>
      </div>
      {cuerpo}
      <div className="ex-app-botones">
        {so === "android" && eventoInstalar && (
          <button type="button" className="pnl-btn-cta ux-tap" onClick={instalar}>Instalar la app</button>
        )}
        <button type="button" className="ex-app-ahora-no" onClick={ahoraNo}>Ahora no</button>
      </div>
    </section>
  );
}
