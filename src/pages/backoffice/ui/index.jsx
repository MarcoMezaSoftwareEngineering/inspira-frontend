// Piezas comunes de la vista del asesor.
//
// Cada pantalla del asesor se arma con lo mismo: una cabecera petróleo con el
// título en serif y las cifras del día, y debajo tarjetas, botones, chips y
// ventanas emergentes que se comportan igual en todas. Si cada pantalla se
// inventara las suyas, a la tercera ya no parecerían del mismo sitio.
import { useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, Inbox } from "lucide-react";
import { navigate } from "../../../services/navigate";

export { default as Ventana } from "./Ventana";

/** El envoltorio de toda página del asesor: fondo, tipografía y tokens. */
export function Pagina({ children, className = "" }) {
  return <div className={`ase ${className}`}>{children}</div>;
}

/** El cuerpo bajo la cabecera, con su ancho y su padding. */
export function Cuerpo({ children, className = "" }) {
  return <div className={`ase-cuerpo ${className}`}>{children}</div>;
}

/**
 * La banda de arriba: eyebrow, título en serif, una frase y las acciones.
 * `stats` es una lista de {n, l, tono, onClick} que se pinta en cristal.
 */
export function Cabecera({ eyebrow, titulo, subtitulo, acciones, stats, volver, children }) {
  return (
    <header className="ase-hero">
      <div className="ase-hero-int">
        {volver && (
          <button type="button" className="ase-volver" onClick={() => navigate(volver.href)}>
            <ArrowLeft size={14} strokeWidth={2.4} /> {volver.texto || "Volver"}
          </button>
        )}
        <div className="ase-hero-fila">
          <div style={{ minWidth: 0, flex: "1 1 320px" }}>
            {eyebrow && <span className="ase-eyebrow">{eyebrow}</span>}
            <h1 className="ase-titulo">{titulo}</h1>
            {subtitulo && <p className="ase-sub">{subtitulo}</p>}
          </div>
          {acciones && <div className="ase-acciones">{acciones}</div>}
        </div>
        {stats && stats.length > 0 && (
          <div className="ase-stats ase-anim">
            {stats.map((s, i) => <Stat key={i} {...s} />)}
          </div>
        )}
        {children}
      </div>
    </header>
  );
}

/** Cuenta desde cero hasta el valor: la cifra que se mueve es la que se mira. */
function useContador(valor, ms = 700) {
  const [n, setN] = useState(0);
  const anterior = useRef(0);
  useEffect(() => {
    const objetivo = Number(valor) || 0;
    const desde = anterior.current;
    anterior.current = objetivo;
    let raf;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) {
      raf = requestAnimationFrame(() => setN(objetivo));
      return () => cancelAnimationFrame(raf);
    }
    const t0 = performance.now();
    const paso = (t) => {
      const k = Math.min(1, (t - t0) / ms);
      const e = 1 - Math.pow(1 - k, 3);
      setN(Math.round(desde + (objetivo - desde) * e));
      if (k < 1) raf = requestAnimationFrame(paso);
    };
    raf = requestAnimationFrame(paso);
    return () => cancelAnimationFrame(raf);
  }, [valor, ms]);
  return n;
}

export function Stat({ n, l, tono, onClick, formato, sufijo = "" }) {
  const animado = useContador(typeof n === "number" ? n : 0);
  const texto = typeof n === "number"
    ? (formato ? formato(animado) : animado.toLocaleString("es-ES")) + sufijo
    : n;
  const Tag = onClick ? "button" : "div";
  return (
    <Tag type={onClick ? "button" : undefined} className="ase-stat" data-tono={tono} data-clic={onClick ? "1" : "0"} onClick={onClick}>
      <span className="ase-stat-n">{texto}</span>
      <span className="ase-stat-l">{l}</span>
    </Tag>
  );
}

export function Boton({ tono = "primario", tam, cargando, icono: Icono, children, className = "", type = "button", ...rest }) {
  return (
    <button
      type={type}
      className={`ase-btn ase-btn-${tono} ${tam ? `ase-btn-${tam}` : ""} ${className}`}
      disabled={rest.disabled || cargando}
      {...rest}
    >
      {cargando ? <span className="ase-spin" /> : Icono ? <Icono strokeWidth={2.2} /> : null}
      {children}
    </button>
  );
}

export function Chip({ tono = "gris", punto, children, className = "" }) {
  return (
    <span className={`ase-chip ${className}`} data-tono={tono}>
      {punto && <span className="ase-chip-punto" />}
      {children}
    </span>
  );
}

export function Pill({ on, n, children, ...rest }) {
  return (
    <button type="button" className="ase-pill" data-on={on ? "1" : "0"} {...rest}>
      {children}
      {n !== undefined && n !== null && <span className="ase-pill-n">{n}</span>}
    </button>
  );
}

export function Campo({ etiqueta, children, className = "", style }) {
  return (
    <label className={`ase-campo-grupo ${className}`} style={{ display: "block", ...style }}>
      {etiqueta && <span className="ase-etiqueta">{etiqueta}</span>}
      {children}
    </label>
  );
}

export function Seccion({ titulo, subtitulo, derecha, children, className = "" }) {
  return (
    <section className={className}>
      <div className="ase-seccion-cab">
        <div style={{ flex: 1, minWidth: 0 }}>
          <h2 className="ase-seccion-t">{titulo}</h2>
          {subtitulo && <p className="ase-seccion-s">{subtitulo}</p>}
        </div>
        {derecha}
      </div>
      {children}
    </section>
  );
}

/** Tarjeta que lleva a otra pantalla: icono, título, descripción y flecha. */
export function TarjetaEnlace({ icono, tono = "petrol", titulo, descripcion, chip, dato, href, onClick, disabled }) {
  const ir = () => { if (disabled) return; if (onClick) onClick(); else if (href) navigate(href); };
  return (
    <button type="button" className="ase-tarjeta-link" onClick={ir} disabled={disabled}>
      <span className="ase-icono" data-tono={tono}>{icono}</span>
      <span style={{ minWidth: 0, flex: 1 }}>
        <span style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
          <span style={{ fontSize: 14, fontWeight: 700 }}>{titulo}</span>
          {chip}
        </span>
        {descripcion && (
          <span style={{ display: "block", fontSize: 12.2, color: "var(--muted)", lineHeight: 1.5, marginTop: 3 }}>
            {descripcion}
          </span>
        )}
        {dato && (
          <span className="ase-num" style={{ display: "block", fontSize: 11, color: "#8aa0ad", marginTop: 6 }}>
            {dato}
          </span>
        )}
      </span>
      {!disabled && <ArrowRight className="ase-flecha" size={18} strokeWidth={2.2} />}
    </button>
  );
}

export function Aviso({ n, texto, tono = "petrol", href, onClick }) {
  const ir = () => { if (onClick) onClick(); else if (href) navigate(href); };
  return (
    <button type="button" className="ase-aviso" data-tono={tono} onClick={ir}>
      <span className="ase-aviso-n">{n}</span>
      <span className="ase-aviso-t">{texto}</span>
    </button>
  );
}

export function Vacio({ icono, titulo, texto, acciones }) {
  const Icono = icono || Inbox;
  return (
    <div className="ase-vacio">
      <div className="ase-vacio-ico"><Icono strokeWidth={1.8} /></div>
      <p className="ase-vacio-t">{titulo}</p>
      {texto && <p className="ase-vacio-p">{texto}</p>}
      {acciones && <div className="ase-vacio-acc">{acciones}</div>}
    </div>
  );
}

export function Esqueleto({ filas = 3, alto = 56 }) {
  return (
    <div className="ase-lista">
      {Array.from({ length: filas }).map((_, i) => (
        <div key={i} className="ase-esq" style={{ height: alto, opacity: 1 - i * 0.12 }} />
      ))}
    </div>
  );
}
