// Los pasos del expediente, la misma pieza en el panel del asesorado y en
// Inspira Core (08/09/2026): cabecera con el anillo de avance, la fila de
// iconos unida por la línea de progreso (o la lista vertical en la barra
// lateral), el título del paso activo y el aviso de «le toca».
//
// Cada paso: { id, num, icono, titulo, corto?, subtitulo?, estado?, badge? }
// con estado en ok · on · warn · "" (hecho, en marcha, con aviso, sin empezar).
import IconoPaso from "./IconoPaso";
import "../../styles/pasos.css";

/** El estado del servidor o del panel, traducido al tono del paso. */
export function tonoDeEstado(estado) {
  const e = String(estado || "").toLowerCase();
  if (e === "completado") return "ok";
  if (e === "observado") return "warn";
  if (["pendiente", "cargando", "revision", "progreso"].includes(e)) return "on";
  return "";
}

export function ExpedienteCabecera({ iniciales, eyebrow, titulo, linea, pct = null }) {
  return (
    <div className="rp-exp">
      <span className="rp-exp-av">{iniciales || "•"}</span>
      <div className="rp-exp-txt">
        {eyebrow && <small>{eyebrow}</small>}
        <b title={titulo}>{titulo}</b>
        {linea && <p>{linea}</p>}
      </div>
      {pct != null && (
        <div className="rp-anillo" style={{ "--p": Math.max(0, Math.min(100, Number(pct) || 0)) }} aria-label={`Avance ${pct} %`}>
          <b>{Math.round(pct)} %</b>
        </div>
      )}
    </div>
  );
}

export function BotonVolver({ onClick, children = "Volver" }) {
  return (
    <button type="button" className="rp-volver" onClick={onClick}>
      <IconoPaso nombre="arrowLeft" strokeWidth={2.4} />
      {children}
    </button>
  );
}

export function RutaPasos({ pasos, activo, onIr, vertical = false }) {
  const idx = Math.max(0, pasos.findIndex((p) => p.id === activo));
  const hecho = pasos.length > 1 ? idx / (pasos.length - 1) : 1;
  return (
    <div className="rp-caja">
      <ol className="rp-ruta" data-vertical={vertical ? "1" : "0"} style={{ "--n": pasos.length, "--hecho": hecho.toFixed(3) }}>
        {pasos.map((p) => (
          <li key={p.id}>
            <button
              type="button"
              data-e={p.estado || ""}
              aria-current={p.id === activo ? "step" : "false"}
              onClick={() => onIr(p.id)}
              title={p.subtitulo ? `${p.titulo} · ${p.subtitulo}` : p.titulo}
            >
              <span className="rp-ico"><IconoPaso nombre={p.icono || "info"} /></span>
              <span className="rp-txt">
                <span className="rp-corto">{p.corto || p.titulo}</span>
                <span className="rp-largo">{p.titulo}</span>
                {p.subtitulo ? <em>{p.subtitulo}</em> : null}
              </span>
              {p.badge ? <i className="rp-n">{p.badge}</i> : null}
            </button>
          </li>
        ))}
      </ol>
    </div>
  );
}

export function TituloPaso({ paso, total, indice, etiquetaEstado }) {
  if (!paso) return null;
  const e = paso.estado || "";
  return (
    <header className="rp-tit">
      <span className="rp-tit-ico"><IconoPaso nombre={paso.icono || "info"} /></span>
      <div className="rp-tit-txt">
        <small>{Number(paso.num) === 0 ? "Antes de empezar" : `Paso ${indice ?? paso.num} de ${total}`}</small>
        <h2>{paso.titulo}</h2>
      </div>
      {(etiquetaEstado || paso.subtitulo) && (
        <span className="rp-estado" data-e={e}>{etiquetaEstado || paso.subtitulo}</span>
      )}
    </header>
  );
}

export function LeToca({ tono = "on", icono = "sparkles", etiqueta, texto, onIr, irEtiqueta = "Ir" }) {
  if (!texto) return null;
  return (
    <div className="rp-letoca" data-k={tono} role="status">
      <span className="rp-letoca-ico"><IconoPaso nombre={icono} /></span>
      <span className="rp-letoca-txt"><b>{etiqueta}</b> {texto}</span>
      {onIr && (
        <button type="button" onClick={onIr}>
          {irEtiqueta}
          <IconoPaso nombre="arrowRight" strokeWidth={2.2} />
        </button>
      )}
    </div>
  );
}
