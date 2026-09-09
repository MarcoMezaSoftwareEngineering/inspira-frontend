// La ficha de un máster en el informe: la misma en el panel del asesorado y
// en Inspira Core (08/09/2026). Anillo de ajuste, por qué está en la lista,
// los cuatro datos que deciden (precio, duración, trámite previo y plazo),
// qué valora la universidad para admitir y las acciones.
//
// Todo sale de lo que ya manda el motor en `resultados[]`: master, score y
// ventana. Nada que no se pueda comprobar.
import IconoPaso from "./IconoPaso";
import "../../styles/pasos.css";

const eur = (n) => (n == null || Number.isNaN(Number(n)))
  ? null
  : `${Math.round(Number(n)).toLocaleString("es-ES")} €`;

const tono = (v) => (v == null ? "#9db0ba" : v >= 85 ? "#1d7a52" : v >= 75 ? "#3d8fe0" : "#b8730c");

function fechaCorta(iso) {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return String(iso);
  return d.toLocaleDateString("es-ES", { day: "numeric", month: "short" });
}

/** Por qué este máster está en la lista, en etiquetas cortas. */
function razonesDe(m) {
  const out = [];
  if (m.es_ancla) out.push(["ancla", "El enlace que nos pasaste"]);
  if (m.acceso_titulo === "directo") out.push(["ok", "Admite tu carrera"]);
  else if (m.acceso_titulo === "afin") out.push(["ok", "Admite carreras afines a la tuya"]);
  else if (m.acceso_titulo === "sin_lista") out.push(["info", "No publica lista de acceso: se puntúa por rama"]);
  if (m.afinidad_deseada === "nombre") out.push(["tema", "Coincide con lo que buscas"]);
  else if (m.afinidad_deseada === "tema") out.push(["tema", "Coincide con tus temas"]);
  if (m.sub_area) out.push(["info", m.sub_area]);
  if (m.es_titulo_oficial === false) out.push(["warn", "Título propio: no se homologa ni da acceso al doctorado"]);
  if (m.estado_ficha === "no_hallado") out.push(["warn", "Sin ficha localizada: tu asesor lo confirma con la universidad"]);
  return out.slice(0, 4);
}

export default function TarjetaMaster({
  resultado, posicion, total, nota, children, cabecera = null,
}) {
  const m = resultado.master || {};
  const score = resultado.score ?? null;
  const v = resultado.ventana || {};
  const uni = m.universidad || {};

  const precio = eur(m.precio_total_estimado);
  const porCredito = m.precio_credito ? `${String(m.precio_credito).replace(".", ",")} €/cr` : null;
  const dur = m.duracion_anios ? (Number(m.duracion_anios) === 1 ? "1 año" : `${String(m.duracion_anios).replace(".", ",")} años`) : "—";
  const tasa = m.tasa_estudio_titulo != null ? Number(m.tasa_estudio_titulo) : null;
  const hayTramite = Boolean(m.requiere_estudio_titulo || tasa > 0 || m.proceso_previo);
  const abre = fechaCorta(v.inicio) || fechaCorta(v.postulacion_inicio);
  const cierra = fechaCorta(v.fin) || fechaCorta(v.postulacion_fin);

  const baremo = (m.baremo || []).filter((b) => b.peso != null).slice(0, 4);

  return (
    <article className="ex-m">
      <div className="ex-m-top">
        <div className="min-w-0">
          {posicion != null && (
            <p className="ex-m-rank"><b>{posicion}</b>{total ? ` de ${total}` : ""}</p>
          )}
          {cabecera}
          <h3>{m.nombre_limpio}</h3>
          <p className="ex-m-uni"><b>{uni.nombre_completo || uni.sigla}</b>{uni.ciudad ? ` · ${uni.ciudad}` : ""}</p>
        </div>
        {score != null && (
          <div className="ex-anillo" style={{ "--v": Math.max(0, Math.min(100, score)), "--tono": tono(score) }}>
            <b>{score}</b><small>AJUSTE</small>
          </div>
        )}
      </div>

      {razonesDe(m).length > 0 && (
        <div className="ex-m-razones">
          {razonesDe(m).map(([k, t]) => <span key={t} className="ex-rz" data-k={k}>{t}</span>)}
        </div>
      )}

      {nota && (
        <div className="ex-m-nota"><b>Nota de tu asesor:</b> {nota}</div>
      )}

      <div className="ex-m-datos">
        <div>
          <small>Precio</small>
          <b>{precio || "por confirmar"}</b>
          <span>{porCredito ? `${porCredito}${m.ects ? ` · ${m.ects} ECTS` : ""}` : "matrícula del curso"}</span>
        </div>
        <div>
          <small>Duración</small>
          <b>{dur}</b>
          <span>{m.modalidad || "—"}</span>
        </div>
        <div data-hay={hayTramite ? 1 : 0}>
          <small>Trámite previo</small>
          <b>{tasa > 0 ? eur(tasa) : hayTramite ? "sí" : "ninguno"}</b>
          <span>{tasa > 0 ? "tasa de equivalencia" : hayTramite ? "antes de postular" : "solicitud directa"}</span>
        </div>
        <div className="plazo">
          <small>Plazo</small>
          <b>{abre || (v.estado === "cerrada" ? "cerrado" : "por publicar")}</b>
          <span>{cierra ? `cierra ${cierra}` : v.fase || ""}</span>
        </div>
      </div>

      {(baremo.length > 0 || m.proceso_previo || m.url_ficha) && (
        <details className="ex-m-baremo">
          <summary>Qué valora la universidad para admitir</summary>
          <div>
            {m.proceso_previo && (
              <p className="ex-m-previo"><b>Antes de postular:</b> {m.proceso_previo}</p>
            )}
            {baremo.length > 0 ? baremo.map((b) => (
              <div key={(b.criterio || b.categoria) + b.peso} className="ex-m-bar">
                <span>{b.criterio || b.categoria}</span>
                <b>{b.peso} {b.escala === "puntos" ? "pts" : "%"}</b>
                <i style={{ "--w": `${Math.min(100, b.peso)}%` }} />
              </div>
            )) : <p className="ex-m-previo">La universidad no publica sus criterios de admisión.</p>}
            {m.url_ficha && (
              <a className="ex-m-ficha" href={m.url_ficha} target="_blank" rel="noreferrer noopener">
                Ver la ficha del máster <IconoPaso nombre="external" className="w-3.5 h-3.5" />
              </a>
            )}
          </div>
        </details>
      )}

      {children}
    </article>
  );
}
