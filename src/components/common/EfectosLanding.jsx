// src/components/common/EfectosLanding.jsx
// Piezas de diseño de las landings de venta: la cinta que pasa, los stickers
// sobre la foto y el numeral de sección. Estilos en styles/landing-fx.css.
import "../../styles/landing-fx.css";

/** Una cinta que se desplaza sin fin: el contenido va dos veces seguidas. */
export function Cinta({ items, tono = "noche" }) {
  const doble = [...items, ...items];
  return (
    <div className={`lfx-cinta lfx-cinta-${tono}`} aria-hidden="true">
      <div className="lfx-cinta-pista">
        {doble.map((t, i) => (
          <span key={`${t}-${i}`}>{t}</span>
        ))}
      </div>
    </div>
  );
}

/** Stickers flotando sobre una foto: {texto, top/left/right/bottom, rot, tono}. */
export function Stickers({ lista }) {
  return (
    <div className="lfx-stickers" aria-hidden="true">
      {lista.map((s, i) => (
        <span
          key={s.texto}
          className={`lfx-sticker${s.tono ? ` lfx-sticker-${s.tono}` : ""}`}
          style={{ top: s.top, left: s.left, right: s.right, bottom: s.bottom, "--rot": `${s.rot || 0}deg`, "--r": `${i * 700}ms` }}
        >
          {s.texto}
        </span>
      ))}
    </div>
  );
}

/** El número grande y desvaído de cada sección. */
export function Numeral({ n, claro = false }) {
  return (
    <span className={`lfx-num${claro ? " lfx-num-claro" : ""}`} aria-hidden="true">
      {n}
    </span>
  );
}
