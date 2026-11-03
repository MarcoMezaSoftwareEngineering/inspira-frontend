// src/pages/reservar/SalidaReserva.jsx
// Última oportunidad amable: si en escritorio el cursor se va hacia fuera de la
// página (cerrar pestaña, otra pestaña) sin haber reservado, se ofrece dejar el
// correo para recibir el acceso a la agenda. Una sola vez por visita, se cierra
// con Escape o con el botón, y no aparece en móvil (allí no existe «salir con
// el ratón»); en móvil funciona el camino «Aún lo estoy pensando» de la cabecera.
import { useEffect, useRef, useState } from "react";
import { whatsappUrl } from "../../config/contacto";
import { Icono } from "./iconos";
import { FormRecordarme } from "./HeroReserva";

const CLAVE = "inspira:reservar-salida";

export default function SalidaReserva({ activo, servicioId }) {
  const [abierto, setAbierto] = useState(false);
  const dialogo = useRef(null);

  useEffect(() => {
    if (!activo) return undefined;
    let yaMostrado = false;
    try {
      yaMostrado = sessionStorage.getItem(CLAVE) === "1";
    } catch { /* sin almacenamiento: se muestra como máximo una vez por carga */ }
    if (yaMostrado) return undefined;

    const alSalir = (e) => {
      if (e.clientY > 0 || e.relatedTarget) return;
      try {
        sessionStorage.setItem(CLAVE, "1");
      } catch { /* ignorado */ }
      setAbierto(true);
      document.removeEventListener("mouseout", alSalir);
    };
    // Un margen de 8 s evita que salte nada más entrar.
    const t = setTimeout(() => document.addEventListener("mouseout", alSalir), 8000);
    return () => {
      clearTimeout(t);
      document.removeEventListener("mouseout", alSalir);
    };
  }, [activo]);

  useEffect(() => {
    if (!abierto) return undefined;
    dialogo.current?.querySelector("input[type=email]")?.focus();
    const tecla = (e) => e.key === "Escape" && setAbierto(false);
    document.addEventListener("keydown", tecla);
    return () => document.removeEventListener("keydown", tecla);
  }, [abierto]);

  if (!abierto) return null;
  return (
    <div className="fixed inset-0 z-[80] grid place-items-center bg-black/50 px-4 backdrop-blur-sm" onClick={() => setAbierto(false)}>
      <div
        ref={dialogo}
        role="dialog"
        aria-modal="true"
        aria-labelledby="rv-salida-titulo"
        onClick={(e) => e.stopPropagation()}
        className="rv-entrada relative w-full max-w-md rounded-3xl bg-primary p-6 text-white shadow-2xl ring-1 ring-white/15"
      >
        <button type="button" onClick={() => setAbierto(false)} aria-label="Cerrar" className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full text-white/70 hover:bg-white/10 hover:text-white">
          <Icono nombre="cerrar" className="h-4 w-4" />
        </button>
        <h2 id="rv-salida-titulo" className="pr-8 font-fraunces text-2xl font-semibold leading-snug">
          ¿Lo piensas con calma?
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-white/80">
          Déjanos tu correo y te enviamos el acceso a la agenda con el próximo horario libre. Sin compromiso.
        </p>
        <div className="mt-4">
          <FormRecordarme servicioId={servicioId} compacto onListo={() => setTimeout(() => setAbierto(false), 3500)} />
        </div>
        <a href={whatsappUrl("Hola Inspira, tengo dudas antes de reservar mi asesoría.")} className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-sky underline underline-offset-4">
          <Icono nombre="whatsapp" className="h-4 w-4" /> O escríbenos por WhatsApp
        </a>
      </div>
    </div>
  );
}
