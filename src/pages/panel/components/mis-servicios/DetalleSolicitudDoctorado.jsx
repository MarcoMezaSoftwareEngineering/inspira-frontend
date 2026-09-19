// El expediente del Doctorado en el panel (18/09/2026).
//
// Hasta hoy el doctorado abría el expediente del máster, con su formulario
// académico, su informe y su elección de másteres, que no le tocan. Aquí
// tiene su propio recorrido, sencillo, en seis pasos (doctorado.js):
//
//   Diagnóstico de acceso → Programas y director → Candidatura →
//   Admisión y matrícula → Residencia (UGE) → En España
//
// El paso en el que está lo marca la etapa que mueve el equipo en Core
// (`etapa` en /solicitudes/mias, solo para el doctorado). Se reutilizan las
// piezas del expediente: la fila de pasos, «Te toca», Novedades (con su línea
// de tiempo), la lista de documentos con su subida, los documentos del
// proceso y los mensajes.
import { useEffect, useMemo, useState } from "react";
import { apiGET } from "../../../../services/api";
import SeccionPanel, { SeccionSiempreAbiertoCtx } from "./sections/SeccionPanel";
import ChecklistDocumentos from "./sections/ChecklistDocumentos";
import DocumentosProceso from "../../../../components/common/DocumentosProceso";
import CercoErrores from "../../../../components/common/CercoErrores";
import { RutaPasos, TituloPaso, LeToca, ExpedienteCabecera } from "../../../../components/common/RutaPasos";
import Icono from "../../../../components/common/Icono";
import { EsqueletoExpediente } from "../Esqueleto";
import NovedadesExpediente from "../NovedadesExpediente";
import EncuestaCierre from "../EncuestaCierre";
import MensajesFlotante from "./MensajesFlotante";
import { usePublicarCabecera } from "../../cabeceraExpediente";
import {
  ETIQUETA_DOC, GUIA_DOCTORADO, PASOS_DOCTORADO, checklistPorPaso, docDeItem, docsDelPaso, pasoDoctorado,
} from "../../doctorado";

function inicialesDe(nombre) {
  return String(nombre || "").trim().split(/\s+/).slice(0, 2).map((p) => p[0]?.toUpperCase() || "").join("") || "•";
}

const estadoDe = (it) => String(it?.estado_item || "pendiente").toLowerCase();
const nombreDe = (it) => it?.item?.nombre_item || "un documento";
const pasoDeItem = (it) => docDeItem(it)?.paso || PASOS_DOCTORADO[0].id;

/** Lo primero que le toca, dicho una vez y arriba. */
function calcularLeToca({ checklist, situacion }) {
  const items = checklist || [];
  const obs = items.find((it) => ["observado", "rechazado"].includes(estadoDe(it)));
  if (obs) return { tono: "warn", icono: "upload", etiqueta: "Te toca:", texto: `corregir «${nombreDe(obs)}»`, seccion: pasoDeItem(obs) };
  const pedido = items.find((it) => estadoDe(it) === "solicitado" && !(it.documentos || []).length);
  if (pedido) return { tono: "warn", icono: "upload", etiqueta: "Te toca:", texto: `subir «${nombreDe(pedido)}», que te pidió tu asesor`, seccion: pasoDeItem(pedido) };
  if (situacion.pausa) {
    return { tono: "on", icono: "clock", etiqueta: "En pausa.", texto: "Tu proceso está detenido. Si quieres retomarlo, escríbele a tu asesor.", seccion: null };
  }
  if (situacion.hecho) {
    return { tono: "ok", icono: "check", etiqueta: "Recorrido completo.", texto: "Tu expediente sigue aquí, con tus documentos, cuando lo necesites.", seccion: null };
  }
  const actual = PASOS_DOCTORADO[situacion.indice];
  const falta = items.find((it) => pasoDeItem(it) === actual.id && it.item?.obligatorio !== false
    && estadoDe(it) === "pendiente" && !(it.documentos || []).length);
  if (falta) return { tono: "on", icono: "upload", etiqueta: "Te toca:", texto: `subir «${nombreDe(falta)}»`, seccion: actual.id };
  return { tono: "ok", icono: "check", etiqueta: "Al día.", texto: "Tu asesor avanza con tu candidatura y te avisará por mensaje.", seccion: null };
}

/** Los documentos del servicio en este paso, con cómo va cada uno. */
function DocsDelPaso({ docs }) {
  if (!docs.length) return null;
  return (
    <section className="pnl-doc-lista" aria-label="Documentos de este paso">
      <h3>Documentos de este paso</h3>
      <ul>
        {docs.map((d) => {
          const e = ETIQUETA_DOC[d.estado] || ETIQUETA_DOC.falta;
          return (
            <li key={d.clave}>
              <span className="pnl-doc-nombre">{d.nombre}</span>
              <span className={`pnl-chip pnl-chip-${e.tono}`}><span className="punto" />{e.texto}</span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

export default function DetalleSolicitudDoctorado({ solicitudBase, onIrAGuia, seccion, onSeccion, perfil }) {
  const idSolicitud = solicitudBase.id_solicitud;
  const [checklist, setChecklist] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [mensajesAbierto, setMensajesAbierto] = useState(false);

  async function cargarTodo() {
    setError("");
    try {
      const r = await apiGET(`/checklist/${idSolicitud}`);
      if (r?.ok) setChecklist(r.checklist || []);
      else setError(r?.msg || "No se pudieron cargar tus documentos.");
    } catch {
      setError("No se pudieron cargar tus documentos.");
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => { setCargando(true); cargarTodo(); }, [idSolicitud]); // eslint-disable-line react-hooks/exhaustive-deps

  const situacion = pasoDoctorado(solicitudBase.etapa);
  const porPaso = useMemo(() => checklistPorPaso(checklist), [checklist]);

  // Los seis pasos, con su estado: hechos, el actual, y los que vienen.
  const pasos = PASOS_DOCTORADO.map((p, i) => {
    const items = porPaso[p.id] || [];
    const corregir = items.some((it) => ["observado", "rechazado"].includes(estadoDe(it)));
    const hecho = situacion.hecho || i < situacion.indice;
    const actual = !situacion.hecho && i === situacion.indice;
    return {
      id: p.id, num: i + 1, icono: p.icono, titulo: p.titulo, corto: p.corto,
      subtitulo: hecho ? "Hecho" : actual ? (situacion.pausa ? "En pausa" : "Ahora") : null,
      estado: corregir ? "warn" : hecho ? "ok" : actual ? "on" : "",
      badge: items.filter((it) => ["observado", "rechazado", "solicitado"].includes(estadoDe(it))).length,
    };
  });

  // Sin sección en la URL, se abre el paso en el que está.
  const activo = pasos.some((p) => p.id === seccion) ? seccion : PASOS_DOCTORADO[situacion.indice].id;
  const indice = pasos.findIndex((p) => p.id === activo);
  const paso = PASOS_DOCTORADO[indice];
  const pct = situacion.hecho ? 100 : Math.round((situacion.indice / PASOS_DOCTORADO.length) * 100);

  usePublicarCabecera({
    eyebrow: `Solicitud #${idSolicitud} · Doctorado`,
    titulo: solicitudBase.titulo || "Doctorado en España",
    pct,
  });

  const leToca = calcularLeToca({ checklist, situacion });
  const itemsPaso = porPaso[activo] || [];
  const docsPaso = docsDelPaso(activo, checklist);
  const sinLeer = solicitudBase?.resumen?.mensajes_sin_leer || 0;
  const titulo = solicitudBase.titulo || "Doctorado en España";

  const guia = (
    <a className="pnl-doc-guia ux-tap" href={GUIA_DOCTORADO} target="_blank" rel="noopener noreferrer">
      <Icono nombre="libro" size={16} />
      <span>
        <b>Guía del servicio de Doctorado</b>
        <small>Los pasos, los documentos y la residencia, en PDF</small>
      </span>
    </a>
  );

  if (cargando) return <EsqueletoExpediente />;

  return (
    <div className="flex flex-col lg:h-full lg:min-h-0">
      {error && (
        <div className="shrink-0 mb-3 flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-3 py-2">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Móvil y tablet: la fila de pasos arriba. */}
      <div className="lg:hidden shrink-0 mb-3 space-y-3">
        <div className="pnl-solo-grande">
          <ExpedienteCabecera iniciales={inicialesDe(perfil?.nombre)} eyebrow={`Solicitud #${idSolicitud}`} titulo={titulo} linea="Tu doctorado, paso a paso" pct={pct} />
        </div>
        <RutaPasos pasos={pasos} activo={activo} onIr={onSeccion} />
      </div>

      <div className="flex flex-col lg:flex-row gap-3 lg:flex-1 lg:min-h-0">
        {/* Pantalla grande: cabecera, pasos y la guía, en la columna izquierda. */}
        <div className="hidden lg:flex w-[290px] shrink-0 flex-col gap-3 overflow-y-auto pr-0.5">
          <ExpedienteCabecera iniciales={inicialesDe(perfil?.nombre)} eyebrow={`Solicitud #${idSolicitud}`} titulo={titulo} linea="Tu doctorado, paso a paso" pct={pct} />
          <RutaPasos pasos={pasos} activo={activo} onIr={onSeccion} vertical />
          {guia}
        </div>

        <div className="flex-1 min-w-0 flex flex-col gap-3 lg:min-h-0 lg:overflow-y-auto">
          <div key={`${activo}-titulo`} className="shrink-0 space-y-3 rp-entra">
            <TituloPaso paso={pasos[indice]} total={pasos.length} indice={indice + 1} />
            <LeToca
              tono={leToca.tono}
              icono={leToca.icono}
              etiqueta={leToca.etiqueta}
              texto={leToca.texto}
              onIr={leToca.seccion && leToca.seccion !== activo ? () => onSeccion(leToca.seccion) : null}
            />
            <NovedadesExpediente idSolicitud={idSolicitud} onIrSeccion={(s) => onSeccion(PASOS_DOCTORADO.some((p) => p.id === s) ? s : null)} />
          </div>

          <div key={activo} className="pnl-entra flex flex-col gap-3">
            <CercoErrores clave={activo} donde={`panel/doctorado/${activo}`} onVolver={() => onSeccion(null)}>
              <section className="pnl-doc-paso" data-estado={pasos[indice].estado || "futuro"}>
                <p className="pnl-doc-eyebrow">Qué hacemos en este paso</p>
                <p>{paso.explica}</p>
                <p className="pnl-doc-eyebrow">Lo que te toca</p>
                <p>{paso.tuParte}</p>
              </section>

              <DocsDelPaso docs={docsPaso} />

              {itemsPaso.length > 0 && (
                <SeccionSiempreAbiertoCtx.Provider value={true}>
                  <ChecklistDocumentos
                    checklist={itemsPaso}
                    cargarTodo={cargarTodo}
                    idSolicitud={idSolicitud}
                    numero={String(indice + 1)}
                    titulo="Sube tus documentos"
                    sectionId={`doc-${activo}`}
                    onIrAGuia={onIrAGuia}
                  />
                </SeccionSiempreAbiertoCtx.Provider>
              )}

              {/* Carta de admisión, resguardo, matrícula, resolución: lo que
                  Inspira va consiguiendo, desde la candidatura. */}
              {["candidatura", "admision", "residencia", "espana"].includes(activo) && (
                <SeccionSiempreAbiertoCtx.Provider value={true}>
                  <SeccionPanel numero="·" titulo="Documentos del proceso" subtitulo="Lo que Inspira consigue por ti: admisión, matrícula, resoluciones" sectionId={`proc-${activo}`}>
                    <DocumentosProceso idSolicitud={idSolicitud} modo="cliente" />
                  </SeccionPanel>
                </SeccionSiempreAbiertoCtx.Provider>
              )}

              {/* Al cerrar con buen resultado: la encuesta (sale sola si toca). */}
              {(activo === "espana" || situacion.hecho) && <EncuestaCierre idSolicitud={idSolicitud} servicio={titulo} />}

              <div className="lg:hidden">{guia}</div>
            </CercoErrores>
          </div>
        </div>
      </div>

      <MensajesFlotante
        abierto={mensajesAbierto}
        onAbrir={() => setMensajesAbierto(true)}
        onCerrar={() => setMensajesAbierto(false)}
        sinLeer={sinLeer}
        idSolicitud={idSolicitud}
      />
    </div>
  );
}
