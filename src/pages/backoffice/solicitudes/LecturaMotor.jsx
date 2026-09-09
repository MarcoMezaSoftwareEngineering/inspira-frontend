// Tal como lo lee el motor (08/09/2026): a la izquierda lo que respondió el
// asesorado en el formulario académico; a la derecha, en qué se convierte
// para el cálculo del informe. Si algo no cuadra, se corrige aquí antes de
// recalcular. El perfil sale del mismo endpoint que usa el informe.
import { useEffect, useState } from "react";
import { boGET } from "../../../services/backofficeApi";
import IconoPaso from "../../../components/common/IconoPaso";
import { FIELD_CONFIG } from "./formularioDatosConfig";

function texto(v) {
  if (v == null || v === "") return null;
  if (Array.isArray(v)) return v.filter(Boolean).join(" · ") || null;
  if (typeof v === "object") return v.etiqueta || v.nombre || v.valor || null;
  return String(v);
}

export default function LecturaMotor({ datos, idSolicitud, onEditar, onIrAInforme }) {
  // null mientras se lee; después el perfil o false si el motor no lo dio.
  const [perfil, setPerfil] = useState(null);
  const hayDatos = Boolean(datos && Object.keys(datos).length > 0);
  const cargando = hayDatos && perfil === null;

  useEffect(() => {
    if (!idSolicitud || !hayDatos) return undefined;
    let vivo = true;
    boGET(`/backoffice/solicitudes/${idSolicitud}/compatibilidad`)
      .then((r) => { if (vivo) setPerfil((r?.ok && r.perfil) ? r.perfil : false); })
      .catch(() => { if (vivo) setPerfil(false); });
    return () => { vivo = false; };
  }, [idSolicitud, hayDatos]);

  const extra = { escala: datos?.promedio_escala };
  const leer = (k) => {
    const v = datos?.[k];
    if (v == null || v === "") return null;
    const cfg = FIELD_CONFIG[k];
    try { return texto(cfg?.format ? cfg.format(v, extra) : v); } catch { return texto(v); }
  };

  const filas = [
    ["Carrera", [leer("carrera_titulo"), leer("universidad_origen")].filter(Boolean).join(" · ") || null,
      perfil?.carrera ? `«${perfil.carrera}» · se cruza con la lista de acceso de cada máster` : null],
    ["Promedio", leer("promedio_peru"), datos?.promedio_peru ? "expediente académico sobre 10 (tabla del país)" : null],
    ["Qué busca", [leer("masteres_deseados"), leer("especializaciones")].filter(Boolean).join(" · ") || null,
      perfil ? [perfil.rama_label ? `rama ${perfil.rama_label}` : null, perfil.sub_area_label ? `subárea ${perfil.sub_area_label}` : null].filter(Boolean).join(" · ") || "sin rama: se deduce de lo que busca" : null],
    ["Enlace de referencia", leer("masteres_enlaces"),
      perfil ? (perfil.anclas?.length ? `${perfil.anclas.length} máster${perfil.anclas.length === 1 ? "" : "es"} ancla del catálogo` : perfil.enlaces_sin_resolver?.length ? `${perfil.enlaces_sin_resolver.length} enlace${perfil.enlaces_sin_resolver.length === 1 ? "" : "s"} sin resolver en el catálogo` : null) : null],
    ["Objetivo", leer("objetivo_master"), perfil?.objetivo ? `objetivo ${texto(perfil.objetivo)}` : null],
    ["Descarta", leer("descartes"), perfil?.descartes?.length ? `fuera: ${perfil.descartes.map(texto).filter(Boolean).join(", ")}` : null],
    ["Modalidad y duración", [leer("modalidad_preferida"), leer("duracion_preferida"), leer("practicas_preferencia")].filter(Boolean).join(" · ") || null, null],
    ["Presupuesto", leer("presupuesto_hasta"), perfil?.presupuesto ? `tope ${Number(perfil.presupuesto).toLocaleString("es-ES")} € por curso` : null],
    ["Comunidades", leer("comunidades_preferidas"), perfil?.ccaa?.length ? `solo ${perfil.ccaa.join(", ")}` : perfil ? "toda España" : null],
    ["Inicio", leer("inicio_previsto"), null],
    ["Idiomas", [leer("ingles_situacion"), leer("idioma_master_ingles") === "Sí" ? "acepta máster en inglés" : null].filter(Boolean).join(" · ") || null, null],
  ].filter(([, v]) => v);

  return (
    <section className="ex-sec" style={{ marginBottom: 14 }}>
      <div className="ex-h">
        <span className="ex-h-ico"><IconoPaso nombre="search" /></span>
        <h3>Tal como lo lee el motor</h3>
        <span className="ex-est" data-e={hayDatos ? "ok" : "warn"}>
          <IconoPaso nombre={hayDatos ? "check" : "clock"} /> {hayDatos ? "Formulario recibido" : "Sin formulario"}
        </span>
      </div>
      {hayDatos ? (
        <>
          <p className="ex-lead">
            A la izquierda lo que respondió el asesorado; a la derecha, en qué se convierte para el cálculo.
            {cargando ? " Leyendo el perfil del motor…" : perfil ? "" : " El motor todavía no devuelve perfil para este expediente."}
            {" "}Si algo no cuadra, se corrige aquí antes de recalcular.
          </p>
          <dl className="ex-kv">
            {filas.map(([k, v, m]) => (
              <div key={k} style={{ display: "contents" }}>
                <dt>{k}</dt>
                <dd>{v}{m ? <span className="motor">→ {m}</span> : null}</dd>
              </div>
            ))}
          </dl>
        </>
      ) : (
        <p className="ex-lead">El asesorado aún no ha enviado el formulario académico. Se puede rellenar desde aquí con lo que diga en la reunión.</p>
      )}
      <div className="ex-fila" style={{ marginTop: 12 }}>
        {onEditar && (
          <button type="button" className="ex-btn sec" onClick={onEditar}><IconoPaso nombre="edit" /> Abrir el formulario</button>
        )}
        {onIrAInforme && hayDatos && (
          <button type="button" className="ex-btn" onClick={onIrAInforme}><IconoPaso nombre="refresh" /> Recalcular y ver el informe</button>
        )}
      </div>
    </section>
  );
}
