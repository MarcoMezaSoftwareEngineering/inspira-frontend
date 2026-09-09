// La ficha de un máster en el informe: la misma en el panel del asesorado y
// en Inspira Core (08/09/2026). Anillo de ajuste, por qué está en la lista,
// los cuatro datos que deciden (precio, duración, trámite previo y plazo),
// qué valora la universidad para admitir y las acciones.
//
// Todo sale de lo que ya manda el motor en `resultados[]`: master, score y
// ventana. Nada que no se pueda comprobar.
import IconoPaso from "./IconoPaso";
import "../../styles/pasos.css";
import "../../styles/tarjeta-master.css";

const eur = (n) => (n == null || Number.isNaN(Number(n)))
  ? null
  : `${Math.round(Number(n)).toLocaleString("es-ES")} €`;

const tono = (v) => (v == null ? "#9db0ba" : v >= 85 ? "#1d7a52" : v >= 75 ? "#3d8fe0" : "#b8730c");

function fechaCorta(iso) {
  if (!iso) return null;
  const d = /^\d{4}-\d{2}-\d{2}$/.test(String(iso)) ? new Date(iso + "T12:00:00") : new Date(iso);
  if (Number.isNaN(d.getTime())) return String(iso);
  return d.toLocaleDateString("es-ES", { day: "numeric", month: "short" });
}

// El motor manda algunos campos del catálogo como {valor, etiqueta} (la
// subárea, por ejemplo). Aquí solo interesa el texto; un objeto como hijo de
// React tumba la pantalla entera.
function texto(v) {
  if (v == null) return null;
  if (typeof v === "object") return v.etiqueta || v.nombre || v.valor || null;
  return String(v);
}

/** Por qué este máster está en la lista, en etiquetas cortas. */
function razonesDe(m) {
  const out = [];
  if (m.es_ancla) out.push(["ancla", "El enlace que nos pasaste"]);
  // Quién paga. Es la primera razón, por delante del acceso y de la sub-área:
  // un máster de 5.044 € que oferta la Fundación Carolina no es un máster de
  // 5.044 €, y era lo que faltaba por decir en la tarjeta.
  const becas = [...new Set((m.becas || []).map((b) => b.entidad))];
  if (becas.length) out.push(["beca", `Lo oferta ${becas.join(" · ")}`]);
  if (m.acceso_titulo === "directo") out.push(["ok", "Admite tu carrera"]);
  else if (m.acceso_titulo === "afin") out.push(["ok", "Admite carreras afines a la tuya"]);
  else if (m.acceso_titulo === "sin_lista") out.push(["info", "No publica lista de acceso: se puntúa por rama"]);
  // El motor dice "fuerte" y "parcial" desde el 08/09/2026; aquí se seguían
  // buscando "nombre" y "tema", así que esta etiqueta no salía nunca.
  if (m.afinidad_deseada === "fuerte") {
    out.push(["tema", m.coincide_con ? `Coincide con «${m.coincide_con}»` : "Coincide con lo que buscas"]);
  } else if (m.afinidad_deseada === "parcial") {
    out.push(["tema", m.coincide_con ? `Se acerca a «${m.coincide_con}»` : "Se acerca a lo que buscas"]);
  }
  if (texto(m.sub_area)) out.push(["info", texto(m.sub_area)]);
  if (m.es_titulo_oficial === false) out.push(["warn", "Título propio: no se homologa ni da acceso al doctorado"]);
  if (m.estado_ficha === "no_hallado") out.push(["warn", "Sin ficha localizada: tu asesor lo confirma con la universidad"]);
  // El que él eligió sale siempre, cuadre o no; si no cuadra, se dice por qué.
  if (m.es_ancla && m.motivo_descarte) out.push(["warn", `Ojo: ${m.motivo_descarte}`]);
  // Lo que dijo que no quería y este máster sí es. No lo saca de la lista
  // —obligatorio es sólo la geografía contratada y el dinero—, pero se dice.
  for (const a of (m.avisos || [])) out.push(["warn", a]);
  // Y si está aquí por llenar el cupo de su comunidad y no por parecerse a lo
  // que pidió, también: callarlo haría creer que tiene que ver con lo suyo.
  if (m.relleno) out.push(["info", m.relleno]);
  return out.slice(0, 6);
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
          <h3>{texto(m.nombre_limpio)}</h3>
          <p className="ex-m-uni"><b>{texto(uni.nombre_completo) || texto(uni.sigla)}</b>{uni.ciudad ? ` · ${texto(uni.ciudad)}` : ""}</p>
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
        <div className="ex-m-nota"><b>Nota de tu asesor:</b> {texto(nota)}</div>
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
          <span>{texto(m.modalidad) || "—"}</span>
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
              <p className="ex-m-previo"><b>Antes de postular:</b> {texto(m.proceso_previo)}</p>
            )}
            {baremo.length > 0 ? baremo.map((b) => (
              <div key={(b.criterio || b.categoria) + b.peso} className="ex-m-bar">
                <span>{texto(b.criterio) || texto(b.categoria)}</span>
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
