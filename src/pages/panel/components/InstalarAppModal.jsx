// «Instalar la app»: la ventana que abre el menú del panel (18/09/2026).
//
// La tarjeta de Inicio (AvisoInstalarApp) solo sale en el teléfono y, con
// «Ahora no», se va dos semanas. Aquí está siempre: detecta el sistema y
// enseña sus pasos (iPhone, Android u ordenador), con pestañas para ver los
// de otro dispositivo. Si el navegador ofrece el diálogo nativo
// (`beforeinstallprompt`, Chrome y Edge), hay un botón «Instalar» de verdad.
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { registrarEvento } from "../../../lib/analytics";
import {
  alCambiar, androidDentroDeApp, androidSamsung, instalarAhora, iphoneFueraDeSafari, puedeInstalar, sistema, yaInstalada,
} from "../instalarApp";
import { IconoTelefono, PasosAndroid, PasosEscritorio, PasosIphone } from "./PasosInstalar";

const PESTANAS = [
  { clave: "iphone", texto: "iPhone" },
  { clave: "android", texto: "Android" },
  { clave: "escritorio", texto: "Ordenador" },
];

export default function InstalarAppModal({ onCerrar }) {
  const propio = sistema();
  const [ver, setVer] = useState(propio);
  const [, refrescar] = useState(0);
  const [resultado, setResultado] = useState(null);

  useEffect(() => alCambiar(() => refrescar((n) => n + 1)), []);
  useEffect(() => { registrarEvento("app_instalar_ayuda_vista", { plataforma: propio }); }, [propio]);
  useEffect(() => {
    const antes = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e) => { if (e.key === "Escape") onCerrar(); };
    window.addEventListener("keydown", onKey);
    return () => { document.body.style.overflow = antes; window.removeEventListener("keydown", onKey); };
  }, [onCerrar]);

  const instalada = yaInstalada();
  const conEvento = puedeInstalar() && ver === propio;

  async function instalar() {
    setResultado(await instalarAhora("menu"));
  }

  let aviso = null;
  if (ver === propio && propio === "iphone" && iphoneFueraDeSafari()) {
    aviso = <>En iPhone solo se instala desde <b>Safari</b>. Abre este enlace en Safari (en el menú de esta app, «Abrir en Safari») y sigue estos pasos.</>;
  } else if (ver === propio && propio === "android" && androidDentroDeApp()) {
    aviso = <>Desde aquí no se puede instalar. Abre este enlace en <b>Chrome</b> y vuelve a entrar en tu panel.</>;
  }

  return createPortal(
    <div className="pnl pnl-inst" role="dialog" aria-modal="true" aria-labelledby="pnl-inst-titulo">
      <div className="pnl-inst-fondo" onClick={onCerrar} />
      <div className="pnl-inst-hoja">
        <header className="pnl-inst-cab">
          <span className="ex-app-icono bg-sky/20 text-primary"><IconoTelefono /></span>
          <div className="min-w-0">
            <h2 id="pnl-inst-titulo">Instala la app de Inspira</h2>
            <p>Tu panel a un toque, sin pasar por ninguna tienda de aplicaciones.</p>
          </div>
          <button type="button" className="pnl-lt-x ux-tap" onClick={onCerrar} aria-label="Cerrar">✕</button>
        </header>

        {instalada ? (
          <p className="pnl-inst-ok">Ya estás usando la app instalada. Puedes abrirla siempre desde el icono de Inspira.</p>
        ) : (
          <>
            <div className="pnl-inst-pestanas" role="tablist" aria-label="Dispositivo">
              {PESTANAS.map((p) => (
                <button key={p.clave} type="button" role="tab" aria-selected={ver === p.clave}
                  className="pnl-inst-pestana ux-tap" onClick={() => setVer(p.clave)}>
                  {p.texto}{p.clave === propio ? " · este" : ""}
                </button>
              ))}
            </div>

            {conEvento && (
              <div className="pnl-inst-directo">
                <p>Tu navegador permite instalarla directamente:</p>
                <button type="button" className="pnl-btn-cta ux-tap" onClick={instalar}>Instalar</button>
              </div>
            )}
            {resultado === "accepted" && <p className="pnl-inst-ok" role="status">Listo: la app de Inspira ya está instalada.</p>}
            {resultado === "dismissed" && <p className="pnl-nota" role="status">No pasa nada: puedes instalarla cuando quieras con los pasos de abajo.</p>}

            {aviso && <p className="ex-app-texto">{aviso}</p>}
            {ver === "iphone" && <PasosIphone />}
            {ver === "android" && <PasosAndroid samsung={ver === propio && androidSamsung()} />}
            {ver === "escritorio" && <PasosEscritorio />}
          </>
        )}

        <p className="pnl-nota pnl-inst-nota">Después entra con tu correo de Google, el mismo con el que te dimos el acceso.</p>
      </div>
    </div>,
    document.body,
  );
}
