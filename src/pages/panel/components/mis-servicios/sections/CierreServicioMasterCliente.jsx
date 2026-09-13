// src/pages/panel/components/mis-servicios/sections/CierreServicioMasterCliente.jsx
//
// Paso 6 del máster, lado del asesorado (12/09/2026):
//   · con la primera admisión elige su vía (visado o estancia) y pide
//     contratar el plan; el asesor la confirma en Inspira Core (no cobra aquí);
//   · cuando el asesor cierra el servicio, responde la encuesta (editable) y,
//     si la valoración es alta, se le ofrece dejar reseña en Google.
import { useEffect, useState } from "react";
import { apiGET, apiPOST } from "../../../../../services/api";
import { descargarArchivoProtegido } from "../../../../../services/descargas";
import { dialog } from "../../../../../services/dialogService";
import { navigate } from "../../../../../services/navigate";
import { rutaDe } from "../../../ruta";
import SeccionPanel from "./SeccionPanel";
import IconoPaso from "../../../../../components/common/IconoPaso";

/* Estos documentos van detrás de un endpoint con token: un <a href> relativo
   apuntaba al dominio del frontend y no descargaba nada. Ver
   services/descargas.js. */
function BotonVerDocumento({ id, etiqueta }) {
  const [cargando, setCargando] = useState(false);

  const abrir = async () => {
    setCargando(true);
    const r = await descargarArchivoProtegido(`/portales/justificantes/${id}/descargar`);
    setCargando(false);
    if (!r.ok) dialog.toast(r.error, "error");
  };

  return (
    <button
      type="button"
      onClick={abrir}
      disabled={cargando}
      className="text-xs font-semibold text-primary hover:underline disabled:opacity-50"
    >
      {cargando ? "Abriendo…" : etiqueta}
    </button>
  );
}

function ResultadosAdmision({ masters }) {
  return (
    <div className="space-y-2">
      {masters.map((m) => (
        <div key={m.id_acceso_portal} className="border border-neutral-200 rounded-xl p-3">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-neutral-900 leading-snug">
                {m.master_label || m.organismo}
              </p>
              <p className="text-xs text-neutral-500 mt-0.5">{m.organismo}</p>
            </div>
            <span className="ex-est" data-e="ok">
              {m.estado_tramite === "MATRICULADO" ? "Matriculado" : "Admitido"}
            </span>
          </div>
          {(m.carta_admision || m.comprobante_pago) && (
            <div className="flex gap-3 mt-2 pt-2 border-t border-neutral-100">
              {m.carta_admision && (
                <BotonVerDocumento id={m.carta_admision.id_justificante} etiqueta="Ver carta de admisión" />
              )}
              {m.comprobante_pago && (
                <BotonVerDocumento id={m.comprobante_pago.id_justificante} etiqueta="Ver comprobante" />
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

const fecha = (iso) => {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" });
  } catch {
    return "";
  }
};

const ICONO_VIA = { visa: "idCard", ee: "home" };
const DETALLE_VIA = {
  visa: "Se pide en el consulado con la carta de admisión, medios económicos de seis meses de origen lícito y seguro médico.",
  ee: "Si estás en España con estancia legal (por ejemplo, como turista). Cuenta con fondos propios en una cuenta española. Inspira presenta el EX-00.",
};

// ── Vía migratoria y contratación ─────────────────────────────────────────────
function Derivacion({ idSolicitud, derivacion, opciones, testUrl, onCambio }) {
  const [enviando, setEnviando] = useState(null);
  const via = derivacion?.via || null;
  const c = derivacion?.contratacion || null;
  const confirmada = c?.estado === "CONFIRMADA";
  const pendiente = c?.estado === "PENDIENTE_CONFIRMACION";

  async function elegir(nueva) {
    if (confirmada || nueva === via) return;
    if (pendiente && !(await dialog.confirm("Ya pediste un plan de la otra vía. Si cambias de vía, esa petición se anula. ¿Continuar?", "Cambiar de vía"))) return;
    setEnviando(`via:${nueva}`);
    const r = await apiPOST(`/cierre-master/panel/solicitudes/${idSolicitud}/bloque8/camino`, { via: nueva });
    setEnviando(null);
    if (!r.ok) return dialog.toast(r.msg || "No se pudo guardar la vía.", "error");
    onCambio(r.derivacion);
    dialog.toast("Vía registrada. Tu asesor ya está avisado.", "success");
  }

  async function contratar(plan) {
    const ok = await dialog.confirm(
      `Se enviará a tu asesor la petición de contratar «${plan.nombre}» (${plan.precio} €). Él confirma el alta y te indica la forma de pago; hasta entonces no se cobra nada.`,
      "Solicitar contratación"
    );
    if (!ok) return;
    setEnviando(`plan:${plan.id}`);
    const r = await apiPOST(`/cierre-master/panel/solicitudes/${idSolicitud}/bloque8/contratar`, { plan: plan.id });
    setEnviando(null);
    if (!r.ok) return dialog.toast(r.msg || "No se pudo registrar la petición.", "error");
    onCambio(r.derivacion);
    dialog.toast("Petición registrada. Tu asesor la confirmará.", "success");
  }

  const planes = via ? opciones?.[via]?.planes || [] : [];

  return (
    <section className="ex-sec">
      <div className="ex-h">
        <span className="ex-h-ico"><IconoPaso nombre="globe" /></span>
        <h3>El siguiente paso: tu visado o tu estancia</h3>
      </div>
      <p className="ex-lead">
        El camino depende de dónde estés cuando empiece el trámite. ¿Dudas?{" "}
        <a href={testUrl} target="_blank" rel="noopener noreferrer" className="font-semibold text-primary underline">
          Haz el test «¿Visa o estancia?»
        </a>{" "}
        (cinco preguntas).
      </p>

      <div className="ex-rutas">
        {["visa", "ee"].map((k) => (
          <button
            key={k}
            type="button"
            className="ex-ruta"
            aria-pressed={via === k}
            disabled={confirmada || enviando !== null}
            onClick={() => elegir(k)}
          >
            <span className="ex-h-ico"><IconoPaso nombre={ICONO_VIA[k]} /></span>
            <b>{opciones?.[k]?.etiqueta || (k === "visa" ? "Visado de estudios" : "Estancia por estudios")}</b>
            <em>{via === k ? "Elegida" : enviando === `via:${k}` ? "…" : "Elegir"}</em>
            <span className="d">{DETALLE_VIA[k]}</span>
          </button>
        ))}
      </div>

      {confirmada && (
        <div className="ex-final" style={{ marginTop: 12 }}>
          <span className="ex-final-ico">✅</span>
          <div className="min-w-0">
            <small>Servicio dado de alta</small>
            <b>{c.nombre} · {c.precio} €</b>
            <span className="l">Confirmado el {fecha(c.confirmada_at)}. Ya lo tienes en «Mis servicios».</span>
            {c.id_solicitud_nueva && (
              <div style={{ marginTop: 8 }}>
                <button type="button" className="ex-btn" onClick={() => navigate(rutaDe({ idServicio: c.id_solicitud_nueva }))}>
                  <IconoPaso nombre="arrowRight" /> Abrir el nuevo expediente
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {via && !confirmada && (
        <div style={{ marginTop: 14 }}>
          <p className="ex-sub">Planes y precios vigentes</p>
          {pendiente && (
            <p className="text-[12.5px] leading-relaxed text-primary bg-sky/10 border border-sky/30 rounded-xl px-3 py-2 mb-2">
              Pediste <b>{c.nombre}</b> ({c.precio} €) el {fecha(c.solicitada_at)}. Tu asesor confirmará el alta y te indicará la forma de pago. Puedes cambiar de plan mientras tanto.
            </p>
          )}
          {c?.estado === "DESCARTADA" && (
            <p className="text-[12.5px] leading-relaxed text-neutral-600 bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2 mb-2">
              Tu asesor no dio curso a la petición anterior ({c.nombre}). Si quieres, escríbele por mensajes o vuelve a pedirla.
            </p>
          )}
          <div className="grid gap-2 sm:grid-cols-3">
            {planes.map((plan) => {
              const esEste = pendiente && c.plan === plan.id;
              return (
                <div
                  key={plan.id}
                  className={`rounded-xl border p-3 flex flex-col gap-1 ${plan.recomendado ? "border-accent" : "border-neutral-200"} ${esEste ? "bg-sky/10" : "bg-white"}`}
                >
                  {plan.recomendado && planes.length > 1 && (
                    <span className="self-start text-[10px] font-extrabold uppercase tracking-wider text-accent">Recomendado</span>
                  )}
                  <b className="text-sm text-primary">{plan.nombre}</b>
                  <span className="text-xl font-black text-primary">{plan.precio} €</span>
                  <button
                    type="button"
                    className={`ex-btn ${plan.recomendado ? "" : "sec"}`}
                    style={{ marginTop: "auto" }}
                    disabled={esEste || enviando !== null}
                    onClick={() => contratar(plan)}
                  >
                    {esEste ? "Pedido" : enviando === `plan:${plan.id}` ? "Enviando…" : "Solicitar contratación"}
                  </button>
                </div>
              );
            })}
          </div>
          <p className="text-[11.5px] text-neutral-500 mt-2">
            El detalle de cada plan está en{" "}
            <a href="/metodo-inspira" target="_blank" rel="noopener noreferrer" className="underline">el Método Inspira</a>.
          </p>
        </div>
      )}
    </section>
  );
}

// ── Encuesta de cierre ────────────────────────────────────────────────────────
function Escala({ desde, hasta, valor, onChange, etiqueta }) {
  const nums = [];
  for (let i = desde; i <= hasta; i += 1) nums.push(i);
  return (
    <div role="radiogroup" aria-label={etiqueta} className="flex flex-wrap gap-1.5">
      {nums.map((n) => (
        <button
          key={n}
          type="button"
          role="radio"
          aria-checked={valor === n}
          onClick={() => onChange(n)}
          className={`min-w-[34px] h-[34px] rounded-lg text-sm font-bold border transition-colors ${
            valor === n ? "bg-primary text-white border-primary" : "bg-white text-primary border-neutral-200 hover:border-primary"
          }`}
        >
          {n}
        </button>
      ))}
    </div>
  );
}

function Encuesta({ idSolicitud, encuesta, resenaUrl, onGuardada }) {
  const [editando, setEditando] = useState(!encuesta);
  const [f, setF] = useState(() => ({
    general: encuesta?.general ?? null,
    asesor: encuesta?.asesor ?? null,
    nps: encuesta?.nps ?? null,
    comentario: encuesta?.comentario ?? "",
    autoriza_publicar: !!encuesta?.autoriza_publicar,
  }));
  const [guardando, setGuardando] = useState(false);
  const completo = f.general !== null && f.asesor !== null && f.nps !== null;

  async function enviar() {
    if (!completo) return;
    setGuardando(true);
    const r = await apiPOST(`/cierre-master/panel/solicitudes/${idSolicitud}/bloque8/encuesta`, f);
    setGuardando(false);
    if (!r.ok) return dialog.toast(r.msg || "No se pudo guardar la encuesta.", "error");
    onGuardada(r.encuesta);
    setEditando(false);
    dialog.toast("Gracias por tu valoración.", "success");
  }

  const alta = (encuesta?.general ?? 0) >= 4;

  return (
    <section className="ex-sec">
      <div className="ex-h">
        <span className="ex-h-ico"><IconoPaso nombre="star" /></span>
        <h3>Valoración del servicio</h3>
        {encuesta && !editando && <span className="ex-est" data-e="ok"><IconoPaso nombre="check" /> Enviada</span>}
      </div>

      {encuesta && !editando ? (
        <>
          <p className="ex-lead">
            Enviada el {fecha(encuesta.enviada_at)}{encuesta.editada_at ? ` · editada el ${fecha(encuesta.editada_at)}` : ""}.
            General {encuesta.general}/5 · Asesor {encuesta.asesor}/5 · Recomendación {encuesta.nps}/10.
          </p>
          {alta && (
            <div className="rounded-xl border border-accent/40 bg-sun/10 px-4 py-3 mb-3">
              <p className="text-sm font-semibold text-primary">¿Nos ayudas con una reseña en Google?</p>
              <p className="text-xs text-neutral-600 mt-0.5 mb-2">Es lo que más ayuda a otros estudiantes a encontrarnos. Un minuto.</p>
              <a href={resenaUrl} target="_blank" rel="noopener noreferrer" className="ex-btn" style={{ textDecoration: "none" }}>
                <IconoPaso nombre="star" /> Dejar reseña en Google
              </a>
            </div>
          )}
          <button type="button" className="ex-btn sec" onClick={() => setEditando(true)}>
            <IconoPaso nombre="edit" /> Editar mis respuestas
          </button>
        </>
      ) : (
        <div className="space-y-4">
          <p className="ex-lead">Dos minutos. Tus respuestas son confidenciales y solo se publican, anonimizadas, si lo autorizas abajo.</p>
          <div>
            <label className="ex-lab">Valoración general del servicio (1 a 5)</label>
            <Escala desde={1} hasta={5} valor={f.general} onChange={(v) => setF({ ...f, general: v })} etiqueta="Valoración general" />
          </div>
          <div>
            <label className="ex-lab">Valoración de la atención del asesor (1 a 5)</label>
            <Escala desde={1} hasta={5} valor={f.asesor} onChange={(v) => setF({ ...f, asesor: v })} etiqueta="Valoración del asesor" />
          </div>
          <div>
            <label className="ex-lab">¿Recomendaría Inspira a un amigo? (0 nada probable · 10 muy probable)</label>
            <Escala desde={0} hasta={10} valor={f.nps} onChange={(v) => setF({ ...f, nps: v })} etiqueta="Recomendación" />
          </div>
          <div>
            <label className="ex-lab">Comentario (opcional)</label>
            <textarea
              rows={3}
              maxLength={2000}
              className="ex-campo"
              value={f.comentario}
              onChange={(e) => setF({ ...f, comentario: e.target.value })}
              placeholder="Lo que más valoró, lo que mejoraría…"
            />
          </div>
          <label className="ex-conmuta" style={{ alignItems: "flex-start" }}>
            <input
              type="checkbox"
              checked={f.autoriza_publicar}
              onChange={(e) => setF({ ...f, autoriza_publicar: e.target.checked })}
              style={{ marginTop: 3 }}
            />
            <span>Autorizo publicar mi opinión de forma anonimizada.</span>
          </label>
          <div className="ex-fila">
            <button type="button" className="ex-btn" disabled={!completo || guardando} onClick={enviar}>
              <IconoPaso nombre="send" /> {guardando ? "Enviando…" : encuesta ? "Guardar cambios" : "Enviar valoración"}
            </button>
            {encuesta && (
              <button type="button" className="ex-btn plano" onClick={() => setEditando(false)}>Cancelar</button>
            )}
            {!completo && <span className="text-[11.5px] text-neutral-500">Faltan las tres puntuaciones.</span>}
          </div>
        </div>
      )}
    </section>
  );
}

export default function CierreServicioMasterCliente({ idSolicitud }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setMsg("");
      try {
        const r = await apiGET(`/cierre-master/panel/solicitudes/${idSolicitud}/bloque8`);
        if (!r.ok) {
          if (!cancelled) setMsg(r.msg || "No se pudo cargar el resumen final.");
          return;
        }
        if (!cancelled) setData(r);
      } catch {
        if (!cancelled) setMsg("No se pudo cargar el resumen final.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [idSolicitud]);

  const masters = data?.masters || [];
  const masterFinal = data?.master_final || null;
  const cerrado = !!data?.cierre?.archivado;
  const hayResumen = data && (data.inversion_total || data.matricula_minima);

  const subtitulo = loading
    ? "Cargando…"
    : masterFinal
    ? `Admitido en: ${masterFinal.master_label || masterFinal.organismo}`
    : "Resultados de admisión, tu visado o estancia y la valoración final.";

  if (!loading && !msg && !data) return null;

  return (
    <SeccionPanel numero="6" titulo="Cierre y visado" subtitulo={subtitulo} sectionId="6">
      {loading && (
        <div className="flex items-center gap-2 text-neutral-400 py-2">
          <div className="w-4 h-4 border-2 border-neutral-300 border-t-primary-light rounded-full animate-spin" />
          <span className="text-sm">Cargando…</span>
        </div>
      )}

      {msg && !loading && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
          <span className="text-red-500">⚠</span>
          <p className="text-sm text-red-700">{msg}</p>
        </div>
      )}

      {!loading && !msg && data && (
        <div className="space-y-4">
          {masterFinal ? (
            <div className="ex-final">
              <span className="ex-final-ico">🎓</span>
              <div className="min-w-0">
                <small>Tu máster</small>
                <b>{masterFinal.master_label || masterFinal.organismo}</b>
                <span className="l">{masterFinal.master_label ? masterFinal.organismo : "Admisión confirmada"} · tu carta de admisión y tu matrícula quedan en Postulaciones</span>
              </div>
            </div>
          ) : (
            <div className="ex-vacio">
              <span className="ico"><IconoPaso nombre="flag" /></span>
              Este paso se activa con tu primera admisión. Cuando llegue, aquí eliges cómo tramitar tu visado o tu estancia.
            </div>
          )}

          {data.admitido && (
            <Derivacion
              idSolicitud={idSolicitud}
              derivacion={data.derivacion}
              opciones={data.opciones_derivacion}
              testUrl={data.test_url}
              onCambio={(derivacion) => setData((d) => ({ ...d, derivacion }))}
            />
          )}

          {masters.length > 1 && (
            <section className="ex-sec">
              <p className="ex-sub">Resultados de admisión</p>
              <ResultadosAdmision masters={masters} />
            </section>
          )}
          {masters.length === 1 && (masters[0].carta_admision || masters[0].comprobante_pago) && (
            <ResultadosAdmision masters={masters} />
          )}

          {hayResumen && (
            <section className="ex-sec">
              <p className="ex-sub">Resumen financiero del caso</p>
              <div className="ex-grid3">
                <div>
                  <label className="ex-lab">Inversión total en másteres</label>
                  <b className="text-primary">{data.inversion_total || "—"}</b>
                </div>
                <div>
                  <label className="ex-lab">Plan contratado</label>
                  <b className="text-primary">{data.plan_nombre || "—"}</b>
                </div>
                <div>
                  <label className="ex-lab">Matrícula más económica</label>
                  <b className="text-primary">{data.matricula_minima || "—"}</b>
                </div>
              </div>
            </section>
          )}

          {data.notas_cierre && (
            <section className="ex-sec">
              <p className="ex-sub">Notas de cierre de tu asesor</p>
              <p className="text-sm text-neutral-700 whitespace-pre-line">{data.notas_cierre}</p>
            </section>
          )}

          {cerrado && (
            <Encuesta
              idSolicitud={idSolicitud}
              encuesta={data.encuesta}
              resenaUrl={data.resena_url}
              onGuardada={(encuesta) => setData((d) => ({ ...d, encuesta }))}
            />
          )}
        </div>
      )}
    </SeccionPanel>
  );
}
