// «Instala la app»: una tarjeta discreta en Inicio para quien ya tiene servicio.
//
// Carina quiere que el panel se use de verdad, y en el teléfono eso pasa por
// tenerlo como app. Solo sale en teléfonos, fuera de la app instalada, y nunca
// tapa nada: «Ahora no» lo aparca 14 días en este dispositivo. Aparcada, sigue
// a mano en el menú: «Instalar la app» (InstalarAppModal).
//
// Android/Chrome lanza `beforeinstallprompt`: se guarda (instalarApp.js) y el
// botón abre el diálogo nativo. Si no lo lanza, no hay botón, sino los pasos
// del menú ⋮ (PasosInstalar.jsx). iPhone no tiene evento: se explican los
// pasos del instructivo de Carina, que solo funcionan en Safari.
import { useEffect, useState } from "react";
import { registrarEvento } from "../../../lib/analytics";
import {
  CLAVE_INSTALADA, CLAVE_POSPUESTO, alCambiar, androidDentroDeApp, androidSamsung, instalarAhora,
  iphoneFueraDeSafari, leer, plataforma, puedeInstalar, yaInstalada,
} from "../instalarApp";
import { IconoTelefono, PasosAndroid, PasosIphone } from "./PasosInstalar";

const DIAS_POSPUESTO = 14;

function pospuestoVigente() {
  const f = Date.parse(leer(CLAVE_POSPUESTO) || "");
  return Number.isFinite(f) && Date.now() - f < DIAS_POSPUESTO * 864e5;
}

export default function AvisoInstalarApp({ bloqueado = false }) {
  const [, refrescar] = useState(0);
  const [oculto, setOculto] = useState(() => Boolean(leer(CLAVE_INSTALADA)) || pospuestoVigente());

  useEffect(() => alCambiar(() => refrescar((n) => n + 1)), []);

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
    const resultado = await instalarAhora("inicio");
    if (resultado === "accepted") setOculto(true);
    else refrescar((n) => n + 1);
  }

  const conEvento = puedeInstalar();
  let cuerpo;
  if (so === "iphone") {
    cuerpo = iphoneFueraDeSafari()
      ? <p className="ex-app-texto">En iPhone solo se instala desde <b>Safari</b>. Abre este enlace en Safari (en el menú de esta app, «Abrir en Safari») y sigue los pasos que verás aquí.</p>
      : <PasosIphone />;
  } else if (conEvento) {
    cuerpo = <p className="ex-app-texto">Tu panel, a un toque desde la pantalla de inicio, sin pasar por ninguna tienda.</p>;
  } else if (androidDentroDeApp()) {
    cuerpo = <p className="ex-app-texto">Desde aquí no se puede instalar. Abre este enlace en <b>Chrome</b> y vuelve a entrar en tu panel.</p>;
  } else {
    cuerpo = <PasosAndroid samsung={androidSamsung()} />;
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
        {so === "android" && conEvento && (
          <button type="button" className="pnl-btn-cta ux-tap" onClick={instalar}>Instalar la app</button>
        )}
        <button type="button" className="ex-app-ahora-no" onClick={ahoraNo}>Ahora no</button>
      </div>
    </section>
  );
}
