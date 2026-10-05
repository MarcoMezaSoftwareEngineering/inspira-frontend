// src/pages/carina/Historia.jsx
//
// La historia de Carina en formato «stories»: láminas que avanzan solas, con
// la foto en movimiento lento y el texto entrando por partes. Se ve como un
// vídeo, pero es HTML: pesa lo que pesan cinco fotos, se lee sin sonido y los
// textos se cambian en textos.js sin volver a editar nada.
//
// El reloj es la propia animación CSS de la barra de progreso: cuando termina
// (onAnimationEnd) se pasa a la siguiente lámina. Pausar es poner
// animation-play-state en paused, así que barra, foto y reloj se detienen a la
// vez y no hay temporizadores que desincronizar.
//
//  - Toque a la derecha: siguiente. A la izquierda: anterior.
//  - Mantener pulsado: pausa. Hay además un botón de pausa visible.
//  - Fuera de pantalla no corre: arranca cuando asoma.
//  - Con «reducir movimiento» no avanza sola ni mueve la foto.
import { useEffect, useRef, useState } from "react";
import Icono from "../../components/common/Icono";
import { registrarEvento } from "../../lib/analytics";
import { sinMovimiento } from "../../lib/revelar";
import { CARINA } from "./textos";
import { FOTOS } from "./fotos";

const H = CARINA.historia;
const TOQUE_MS = 280;

export default function Historia({ whatsapp }) {
  const [i, setI] = useState(0);
  const [vuelta, setVuelta] = useState(0);
  const [enVista, setEnVista] = useState(false);
  const [pausaManual, setPausaManual] = useState(false);
  const [pulsando, setPulsando] = useState(false);
  const [fin, setFin] = useState(false);
  const caja = useRef(null);
  const pulso = useRef(0);
  const quieto = useRef(sinMovimiento()).current;

  useEffect(() => {
    const el = caja.current;
    if (!el || typeof IntersectionObserver !== "function") { setEnVista(true); return undefined; }
    const o = new IntersectionObserver(([e]) => setEnVista(e.isIntersecting), { threshold: 0.55 });
    o.observe(el);
    return () => o.disconnect();
  }, []);

  const total = H.laminas.length;
  const corriendo = enVista && !pausaManual && !pulsando && !fin && !quieto;

  const ir = (n) => {
    if (n >= total) {
      setFin(true);
      registrarEvento("carina_historia", { accion: "completa" });
      return;
    }
    setFin(false);
    setI(Math.max(0, n));
  };

  const repetir = () => {
    setFin(false);
    setPausaManual(false);
    setI(0);
    setVuelta((v) => v + 1);
  };

  const alPulsar = (e) => {
    if (e.target.closest("a,button")) return;
    pulso.current = Date.now();
    setPulsando(true);
  };
  const alSoltar = (e) => {
    if (!pulso.current) return;
    const corto = Date.now() - pulso.current < TOQUE_MS;
    pulso.current = 0;
    setPulsando(false);
    if (!corto) return;
    const r = caja.current.getBoundingClientRect();
    ir((e.clientX - r.left) / r.width < 0.3 ? i - 1 : i + 1);
  };
  const alCancelar = () => { pulso.current = 0; setPulsando(false); };

  const alTeclear = (e) => {
    if (e.key === "ArrowRight") ir(i + 1);
    else if (e.key === "ArrowLeft") ir(i - 1);
    else if (e.key === " ") { e.preventDefault(); setPausaManual((p) => !p); }
  };

  return (
    <section className="car-his" aria-labelledby="car-his-t">
      <p className="car-his-rotulo" data-revelar>
        <Icono nombre="destello" size={14} />
        {H.rotulo}
      </p>
      <h2 id="car-his-t" className="car-h2" data-revelar>{H.titulo}</h2>

      <div
        ref={caja}
        className={`car-his-caja${corriendo ? "" : " car-his-pausa"}${quieto ? " car-his-quieta" : ""}`}
        data-revelar="escala"
        role="group"
        aria-roledescription="historia"
        aria-label={`${H.titulo}. Lámina ${i + 1} de ${total}`}
        tabIndex={0}
        onKeyDown={alTeclear}
        onPointerDown={alPulsar}
        onPointerUp={alSoltar}
        onPointerLeave={alCancelar}
        onPointerCancel={alCancelar}
        onContextMenu={(e) => e.preventDefault()}
      >
        {H.laminas.map((l, n) => {
          const f = l.foto ? FOTOS[l.foto] : null;
          const activa = n === i;
          // La foto se pide cuando su lámina es la actual o la siguiente.
          const pedir = n <= i + 1;
          return (
            <article
              key={`${l.id}-${vuelta}`}
              className={`car-his-lamina car-his-${l.modo}${activa ? " car-his-activa" : ""}`}
              aria-hidden={!activa}
            >
              {f && pedir && l.modo !== "llena" && <img src={f.src} alt="" className="car-his-fondo" aria-hidden="true" />}
              {f && pedir && (
                <img src={f.src} alt={f.alt} width={f.ancho} height={f.alto} className="car-his-foto" draggable="false" decoding="async" />
              )}
              {l.foto2 && pedir && (
                <img src={FOTOS[l.foto2].src} alt={FOTOS[l.foto2].alt} width={FOTOS[l.foto2].ancho} height={FOTOS[l.foto2].alto} className="car-his-foto car-his-foto2" draggable="false" decoding="async" />
              )}
              <div className="car-his-texto">
                <span className="car-his-etiqueta">{l.etiqueta}</span>
                <strong className="car-his-titulo">{l.titulo}</strong>
                <p>{l.texto}</p>
                {l.final && (
                  <a
                    href={whatsapp}
                    target="_blank"
                    rel="noopener"
                    className="car-btn car-btn-wa car-his-cta"
                    tabIndex={activa ? 0 : -1}
                    onClick={() => registrarEvento("carina_whatsapp", { donde: "historia" })}
                  >
                    <Icono nombre="whatsapp" size={18} />
                    {H.cta}
                  </a>
                )}
              </div>
            </article>
          );
        })}

        <div className="car-his-barras" aria-hidden="true">
          {H.laminas.map((l, n) => (
            <span key={l.id} className="car-his-barra">
              <span
                key={n === i ? `v-${i}-${vuelta}` : "q"}
                className={n < i || (n === i && (fin || quieto)) ? "car-his-llena-ya" : n === i ? "car-his-corre" : ""}
                onAnimationEnd={n === i ? () => ir(i + 1) : undefined}
              />
            </span>
          ))}
        </div>

        {fin ? (
          <button type="button" className="car-his-control car-his-repetir" onClick={repetir}>
            <Icono nombre="flecha" size={14} />
            {H.repetir}
          </button>
        ) : !quieto && (
          <button
            type="button"
            className="car-his-control"
            aria-label={pausaManual ? "Reanudar la historia" : "Pausar la historia"}
            onClick={() => setPausaManual((p) => !p)}
          >
            <span className={pausaManual ? "car-his-ico-play" : "car-his-ico-pausa"} aria-hidden="true" />
          </button>
        )}
      </div>

      <p className="car-his-ayuda">{H.ayuda}</p>
    </section>
  );
}
