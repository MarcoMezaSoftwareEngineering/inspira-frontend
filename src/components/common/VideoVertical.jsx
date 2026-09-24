// src/components/common/VideoVertical.jsx
//
// Un TikTok en vertical, servido desde /media (no incrustado de TikTok: el
// embed pesa, pide cookies y no funciona dentro del navegador de TikTok, que es
// desde donde llega buena parte del tráfico). Póster hasta que se toca, sin
// sonido hasta entonces, y solo uno sonando a la vez: el padre lleva `activo`.
import { useEffect, useRef, useState } from "react";
import Icono from "./Icono";
import { registrarEvento } from "../../lib/analytics";
import "../../styles/video-vertical.css";

export default function VideoVertical({ v, activo, onActivar, evento = "video_vertical" }) {
  const ref = useRef(null);
  const [sonando, setSonando] = useState(false);

  const alternar = () => {
    const el = ref.current;
    if (!el) return;
    if (el.paused) {
      onActivar(v.id);
      el.play().then(() => setSonando(true)).catch(() => {});
      registrarEvento(evento, { id: v.id });
    } else {
      el.pause();
      setSonando(false);
    }
  };

  // Si otro vídeo arranca, este se para. En un efecto y no en el render: los
  // refs no se leen mientras se pinta.
  useEffect(() => {
    if (activo) return;
    const el = ref.current;
    if (el && !el.paused) el.pause();
  }, [activo]);

  return (
    <figure className="vv">
      <button type="button" className="vv-boton" onClick={alternar} aria-label={sonando ? `Pausar: ${v.titulo}` : `Reproducir: ${v.titulo}`}>
        <video ref={ref} src={v.src} poster={v.poster} playsInline preload="none" onPause={() => setSonando(false)} onEnded={() => setSonando(false)} className="vv-lienzo" />
        {!sonando && (
          <span className="vv-play" aria-hidden="true">
            <Icono nombre="video" size={26} />
          </span>
        )}
      </button>
      <figcaption className="vv-pie">{v.titulo}</figcaption>
    </figure>
  );
}

/** Una rejilla de vídeos con un solo activo. */
export function RejillaVideos({ lista, evento }) {
  const [activo, setActivo] = useState(null);
  return (
    <div className="vv-rejilla">
      {lista.map((v) => (
        <VideoVertical key={v.id} v={v} activo={activo === v.id} onActivar={setActivo} evento={evento} />
      ))}
    </div>
  );
}
