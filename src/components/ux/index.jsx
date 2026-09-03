// Piezas de interfaz compartidas por el portal del asesor y el panel del
// asesorado.
//
// Existen para que una tarjeta, un campo o una tabla se comporten igual en
// las dos mitades del producto. El asesor y el asesorado hablan por teléfono
// mirando cada uno su pantalla; si el mismo dato se pinta distinto en cada
// una, la conversación se rompe.
//
// Los estilos viven en `styles/ergonomia.css`. Aquí solo hay comportamiento.
import { useId, useState } from "react";
import { AlertCircle, CheckCircle2, ChevronDown } from "lucide-react";

/* ── Tarjeta ─────────────────────────────────────────────────────────────── */

/**
 * @param {boolean} pulsable  responde al ratón y al dedo
 * @param {boolean} sel       seleccionada
 * @param {boolean} realce    degradado suave para separarla del fondo
 */
export function Tarjeta({
  pulsable = false, sel = false, realce = false,
  className = "", children, onClick, ...rest
}) {
  const interactiva = pulsable || typeof onClick === "function";
  return (
    <div
      className={`ux-tarjeta ${realce ? "ux-tarjeta-realce" : ""} ${className}`}
      data-pulsable={interactiva ? "1" : "0"}
      data-sel={sel ? "1" : "0"}
      onClick={onClick}
      // Una tarjeta que se pulsa es un botón, aunque sea un div: sin esto no
      // la alcanza el teclado ni la anuncia un lector de pantalla.
      role={interactiva ? "button" : undefined}
      tabIndex={interactiva ? 0 : undefined}
      onKeyDown={interactiva ? (e) => {
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onClick?.(e); }
      } : undefined}
      {...rest}
    >
      {children}
    </div>
  );
}

/* ── Campo ───────────────────────────────────────────────────────────────── */

// Qué teclado abre el móvil. Pedir un teléfono y que salga el teclado de
// letras obliga a un toque más y a acertar en teclas de 4mm.
const TECLADO = {
  texto:    { inputMode: "text" },
  numero:   { inputMode: "numeric", pattern: "[0-9]*" },
  decimal:  { inputMode: "decimal" },
  dinero:   { inputMode: "decimal", autoComplete: "off" },
  telefono: { inputMode: "tel", type: "tel", autoComplete: "tel" },
  email:    { inputMode: "email", type: "email", autoComplete: "email",
              autoCapitalize: "none", spellCheck: false },
  url:      { inputMode: "url", type: "url", autoCapitalize: "none", spellCheck: false },
  busqueda: { inputMode: "search", type: "search" },
};

/**
 * Un campo con su etiqueta, su estado y el teclado que le toca.
 *
 * @param {"texto"|"numero"|"decimal"|"dinero"|"telefono"|"email"|"url"|"busqueda"} tipo
 * @param {"error"|"ok"|null} estado
 * @param {string} nota   ayuda, o el motivo del error
 */
export function CampoUX({
  etiqueta, tipo = "texto", estado = null, nota, ancho = false,
  children, className = "", ...rest
}) {
  const id = useId();
  const props = TECLADO[tipo] || TECLADO.texto;
  const Icono = estado === "error" ? AlertCircle : estado === "ok" ? CheckCircle2 : null;

  return (
    <div className={`ux-campo ${ancho ? "ux-ancho" : ""} ${className}`} data-estado={estado || undefined}>
      {etiqueta && <label className="ux-campo-etq" htmlFor={id}>{etiqueta}</label>}
      {children
        ? children
        : <input id={id}
            // El error se anuncia, no solo se pinta.
            aria-invalid={estado === "error" || undefined}
            aria-describedby={nota ? `${id}-nota` : undefined}
            {...props} {...rest} />}
      {nota && (
        <p className="ux-campo-nota" id={`${id}-nota`}
           role={estado === "error" ? "alert" : undefined}>
          {Icono && <Icono size={13} strokeWidth={2.4} style={{ flexShrink: 0, marginTop: 1 }} />}
          <span>{nota}</span>
        </p>
      )}
    </div>
  );
}

/** Una rejilla de campos: una columna en el móvil, dos en el escritorio. */
export function FormularioUX({ children, className = "" }) {
  return <div className={`ux-form ${className}`}>{children}</div>;
}

/* ── Acordeón ────────────────────────────────────────────────────────────── */

/**
 * Para lo secundario. Lo crítico no se pliega: si hay que abrir algo para
 * saber si un plazo está abierto, el plazo está escondido.
 */
export function Acordeon({ titulo, resumen, defecto = false, children, className = "" }) {
  const [abierto, setAbierto] = useState(defecto);
  const id = useId();
  return (
    <div className={`ux-acordeon ${className}`} data-abierto={abierto ? "1" : "0"}>
      <button type="button" className="ux-acordeon-cab"
        aria-expanded={abierto} aria-controls={id}
        onClick={() => setAbierto((v) => !v)}>
        <span style={{ flex: 1, minWidth: 0 }}>
          <span style={{ display: "block", fontSize: "var(--t-cuerpo)", fontWeight: 700 }}>
            {titulo}
          </span>
          {resumen && (
            <span style={{ display: "block", fontSize: "var(--t-mini)",
                           color: "var(--muted)", marginTop: 2 }}>
              {resumen}
            </span>
          )}
        </span>
        <ChevronDown size={18} className="ux-acordeon-flecha" />
      </button>
      {abierto && <div className="ux-acordeon-cuerpo" id={id}>{children}</div>}
    </div>
  );
}

/* ── Tabla que se vuelve tarjetas ────────────────────────────────────────── */

/**
 * Tabla en escritorio; debajo de 768px, una tarjeta por fila.
 *
 * No es una tabla con scroll horizontal: leer en horizontal es lo que hace
 * que nadie mire el catálogo desde el móvil. Cada celda lleva el rótulo de su
 * columna en `data-etq` y el CSS lo pinta delante cuando se apila.
 *
 * @param {Array<{clave, etiqueta, principal?, ancho?, pinta?}>} columnas
 * @param {Array}    filas
 * @param {Function} claveFila
 */
export function TablaAdaptativa({ columnas, filas, claveFila, onFila, vacio = null }) {
  if (!filas?.length) return vacio;
  return (
    <div className="ux-scroll-x">
      <table className="ux-tabla-adapt" style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            {columnas.map((c) => (
              <th key={c.clave} style={{
                width: c.ancho, textAlign: c.alinea || "left", padding: "6px 10px 8px",
                fontSize: "var(--t-micro)", fontWeight: 800, letterSpacing: ".07em",
                textTransform: "uppercase", color: "var(--muted)",
                borderBottom: "1px solid var(--line)", whiteSpace: "nowrap",
              }}>{c.etiqueta}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {filas.map((f, i) => (
            <tr key={claveFila ? claveFila(f) : i}
              onClick={onFila ? () => onFila(f) : undefined}
              style={onFila ? { cursor: "pointer" } : undefined}>
              {columnas.map((c) => (
                <td key={c.clave}
                  data-etq={c.etiqueta}
                  data-principal={c.principal || undefined}
                  style={{ padding: "10px", fontSize: "var(--t-cuerpo)",
                           textAlign: c.alinea || "left",
                           borderBottom: "1px solid var(--line)",
                           color: "var(--ink)" }}>
                  {c.pinta ? c.pinta(f) : f[c.clave]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ── Acción principal al alcance del pulgar ──────────────────────────────── */

/**
 * En el móvil se queda pegada abajo, por encima de la barra de gestos; en
 * escritorio fluye con el contenido, porque allí el ratón llega a todo y una
 * barra fija solo roba pantalla.
 */
export function AccionPulgar({ children, className = "" }) {
  return <div className={`ux-accion-pulgar ${className}`}>{children}</div>;
}
