// Cargar fases del tracker en bloque, y duplicar un curso entero.
//
// Añadirlas de una en una funciona con quince universidades. Con cuarenta y
// siete, y preparando ya las postulaciones de los másteres que empiezan en
// 2027-2028 —que abren en 2026, o sea ahora—, son doscientas fechas tecleadas a
// mano y una sola errata deja a alguien fuera de plazo.
//
// Son dos caminos porque España funciona de dos maneras:
//
//   · Andalucía tiene distrito único. Las diez universidades comparten las
//     mismas tres fases de máster —la de extranjeros, la ordinaria de junio y
//     la de septiembre—, así que se cargan una vez para la comunidad entera.
//   · Madrid y Cataluña no: cada universidad publica su propio calendario. Ahí
//     la carga en bloque sirve para poner la estructura, y las fechas se
//     corrigen luego universidad por universidad. Sigue siendo menos trabajo
//     que partir de la hoja en blanco.
import { useCallback, useEffect, useMemo, useState } from "react";
import { boGET, boPOST } from "../../../services/backofficeApi";
import { dialog } from "../../../services/dialogService";

const vacia = () => ({
  nombre: "", postulacion_inicio: "", postulacion_fin: "", resultados: "", notas: "",
});

export default function CargaDeFases({ anio, anios = [], onCerrar, onCargado }) {
  const [via, setVia] = useState("bloque");

  // ── Carga en bloque ──
  const [comunidades, setComunidades] = useState([]);
  const [plantillas, setPlantillas] = useState([]);
  const [idComunidad, setIdComunidad] = useState("");
  const [modo, setModo] = useState("anadir");
  const [fases, setFases] = useState([vacia()]);
  const [guardando, setGuardando] = useState(false);

  // ── Duplicar curso ──
  const [desde, setDesde] = useState(anio);
  const [hastaManual, setHastaManual] = useState(null);
  const [conFechas, setConFechas] = useState(true);

  useEffect(() => {
    let vivo = true;
    Promise.all([
      boGET(`/backoffice/tracker/comunidades?anio=${encodeURIComponent(anio)}`),
      boGET("/backoffice/tracker/plantillas"),
    ]).then(([c, p]) => {
      if (!vivo) return;
      if (c?.ok) setComunidades(c.comunidades || []);
      if (p?.ok) setPlantillas(p.plantillas || []);
    }).catch(() => {});
    return () => { vivo = false; };
  }, [anio]);

  const com = useMemo(
    () => comunidades.find((c) => String(c.id_comunidad) === String(idComunidad)) || null,
    [comunidades, idComunidad],
  );

  // El curso siguiente al elegido, propuesto solo: es lo que se va a querer
  // casi siempre y escribirlo a mano invita a la errata. En cuanto alguien
  // escribe otro, manda lo que ha escrito.
  const propuesto = useMemo(() => {
    const m = /^(\d{4})-(\d{4})$/.exec(desde || "");
    return m ? `${Number(m[1]) + 1}-${Number(m[2]) + 1}` : "";
  }, [desde]);
  const hasta = hastaManual ?? propuesto;

  const aplicarPlantilla = useCallback((id) => {
    const p = plantillas.find((x) => x.id === id);
    if (!p) return;
    setFases(p.fases.map((f) => ({ ...vacia(), nombre: f.nombre, notas: f.notas || "" })));
  }, [plantillas]);

  // La plantilla que le toca a la comunidad elegida, si la hay. En Andalucía
  // ahorra el paso; en el resto no se presupone nada.
  const sugerida = useMemo(
    () => (com ? plantillas.find((p) => p.aplica_a && com.nombre.includes(p.aplica_a)) : null),
    [com, plantillas],
  );

  function editar(i, campo, valor) {
    setFases((prev) => prev.map((f, j) => (j === i ? { ...f, [campo]: valor } : f)));
  }

  async function cargarBloque() {
    if (!com) return dialog.toast("Elige una comunidad", "error");
    const utiles = fases.filter((f) => f.nombre.trim());
    if (!utiles.length) return dialog.toast("Ninguna fase tiene nombre", "error");

    const ok = await dialog.confirm(
      modo === "reemplazar"
        ? `Se borran las fases que ya tengan estas ${com.universidades.length} universidades en `
          + `${anio} y se ponen estas ${utiles.length}. No hay deshacer.`
        : `Se añaden ${utiles.length} fase(s) a las ${com.universidades.length} universidades de `
          + `${com.nombre} en el curso ${anio}.`,
      `${modo === "reemplazar" ? "Reemplazar" : "Añadir"} fases en ${com.nombre}`,
    );
    if (!ok) return;

    setGuardando(true);
    try {
      const r = await boPOST("/backoffice/tracker/fases/masivo", {
        anio_academico: anio,
        id_comunidad: com.id_comunidad,
        modo,
        fases: utiles,
      });
      if (r?.ok) {
        dialog.toast(`${r.creadas} fases en ${r.universidades} universidades`, "exito");
        onCargado?.();
      } else dialog.toast(r?.msg || "No se pudo cargar", "error");
    } catch (e) {
      dialog.toast(e.message || "No se pudo cargar", "error");
    }
    setGuardando(false);
  }

  async function duplicar(sobrescribir = false) {
    if (!desde || !hasta) return;
    setGuardando(true);
    try {
      const r = await boPOST("/backoffice/tracker/anios/duplicar", {
        desde, hasta, con_fechas: conFechas, sobrescribir,
      });
      if (r?.ok) {
        dialog.toast(`${r.creadas} fases copiadas a ${hasta}`, "exito");
        onCargado?.(hasta);
      } else if (r?.ya_hay && !sobrescribir) {
        // El aviso llega del servidor, que es quien sabe cuántas hay. Preguntar
        // antes con una cifra inventada sería peor que no preguntar.
        const ok = await dialog.confirm(r.msg, `Reemplazar ${hasta}`);
        if (ok) { setGuardando(false); return duplicar(true); }
      } else dialog.toast(r?.msg || "No se pudo duplicar", "error");
    } catch (e) {
      dialog.toast(e.message || "No se pudo duplicar", "error");
    }
    setGuardando(false);
  }

  const inp = "text-[12px] border border-neutral-300 rounded-lg px-2 py-1.5 bg-white "
    + "text-neutral-800 focus:outline-none focus:border-[#1D6A4A] w-full";
  const lbl = "text-[10.5px] text-neutral-500";

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      style={{ background: "rgba(15,36,68,.45)" }} onClick={onCerrar}>
      {/* En el móvil sube desde abajo y ocupa lo que necesita; en escritorio,
          una ventana centrada. */}
      <div onClick={(e) => e.stopPropagation()}
        className="bg-neutral-50 w-full sm:max-w-2xl rounded-t-2xl sm:rounded-2xl
          max-h-[92vh] overflow-y-auto shadow-2xl">

        <div className="sticky top-0 bg-white border-b border-neutral-200 px-4 py-3 flex
          items-center gap-3 z-10">
          <div className="min-w-0 flex-1">
            <p className="text-[14px] font-bold text-neutral-900">Cargar fases</p>
            <p className="text-[11px] text-neutral-500">Curso {anio}</p>
          </div>
          <button type="button" onClick={onCerrar}
            className="text-[12px] text-neutral-400 hover:text-neutral-800 px-2 py-1">cerrar</button>
        </div>

        <div className="px-4 py-3 flex gap-1.5">
          {[["bloque", "Por comunidad"], ["duplicar", "Duplicar un curso"]].map(([v, l]) => (
            <button key={v} type="button" onClick={() => setVia(v)}
              className={`text-[12px] font-semibold px-3 py-1.5 rounded-lg border transition-colors ${
                via === v
                  ? "border-[#1D6A4A] bg-[#1D6A4A] text-white"
                  : "border-neutral-200 bg-white text-neutral-600"}`}>
              {l}
            </button>
          ))}
        </div>

        {via === "bloque" ? (
          <div className="px-4 pb-5 space-y-3">
            <div className="bg-white border border-neutral-200 rounded-xl p-3.5 space-y-2.5">
              <label className="block space-y-1">
                <span className={lbl}>Comunidad</span>
                <select value={idComunidad} onChange={(e) => setIdComunidad(e.target.value)}
                  className={inp}>
                  <option value="">Elige una…</option>
                  {comunidades.map((c) => (
                    <option key={c.id_comunidad} value={c.id_comunidad}>
                      {c.nombre} · {c.universidades.length} universidades
                      {c.distrito_unico ? " · distrito único" : ""}
                    </option>
                  ))}
                </select>
              </label>

              {com && (
                <div className={`text-[11.5px] rounded-lg px-3 py-2 border ${
                  com.distrito_unico
                    ? "bg-[#E8F5EE] border-[#1D6A4A]/30 text-[#14532d]"
                    : "bg-[#FEF3E7] border-amber-300/60 text-[#8a5a12]"}`}>
                  {com.distrito_unico
                    ? "Distrito único: estas fechas valen igual para las "
                      + `${com.universidades.length} universidades de la comunidad.`
                    : "Aquí cada universidad publica su propio calendario. Esto pone la "
                      + "estructura de fases en las "
                      + `${com.universidades.length}; las fechas hay que ajustarlas después una a una.`}
                  <div className="text-[10.5px] mt-1 opacity-80">
                    {com.universidades.map((u) => u.sigla).join(" · ")}
                  </div>
                </div>
              )}

              {sugerida && (
                <button type="button" onClick={() => aplicarPlantilla(sugerida.id)}
                  className="w-full text-left text-[11.5px] bg-[#EEF2F8] border border-[#1A3557]/25
                    rounded-lg px-3 py-2 hover:border-[#1A3557]/50">
                  <b className="text-[#1A3557]">Usar «{sugerida.nombre}»</b>
                  <span className="block text-neutral-600 mt-0.5">{sugerida.descripcion}</span>
                </button>
              )}

              <label className="block space-y-1">
                <span className={lbl}>Estructura de fases</span>
                <select value="" onChange={(e) => e.target.value && aplicarPlantilla(e.target.value)}
                  className={inp}>
                  <option value="">Elegir una plantilla…</option>
                  {plantillas.map((p) => <option key={p.id} value={p.id}>{p.nombre}</option>)}
                </select>
              </label>
            </div>

            <div className="space-y-2">
              {fases.map((f, i) => (
                <div key={i} className="bg-white border border-neutral-200 rounded-xl p-3 space-y-2">
                  <div className="flex items-center gap-2">
                    <input value={f.nombre} onChange={(e) => editar(i, "nombre", e.target.value)}
                      placeholder={`Nombre de la fase ${i + 1}`}
                      className={`${inp} font-semibold`} />
                    {fases.length > 1 && (
                      <button type="button"
                        onClick={() => setFases((p) => p.filter((_, j) => j !== i))}
                        className="text-[15px] text-neutral-300 hover:text-red-500 px-1">×</button>
                    )}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <label className="space-y-0.5">
                      <span className={lbl}>Abre</span>
                      <input type="date" value={f.postulacion_inicio}
                        onChange={(e) => editar(i, "postulacion_inicio", e.target.value)}
                        className={inp} />
                    </label>
                    <label className="space-y-0.5">
                      <span className={lbl}>Cierra</span>
                      <input type="date" value={f.postulacion_fin}
                        onChange={(e) => editar(i, "postulacion_fin", e.target.value)}
                        className={inp} />
                    </label>
                    <label className="space-y-0.5">
                      <span className={lbl}>Resultados</span>
                      <input type="date" value={f.resultados}
                        onChange={(e) => editar(i, "resultados", e.target.value)}
                        className={inp} />
                    </label>
                  </div>
                </div>
              ))}

              {fases.length < 8 && (
                <button type="button" onClick={() => setFases((p) => [...p, vacia()])}
                  className="w-full text-[12px] text-neutral-500 border border-dashed
                    border-neutral-300 rounded-xl py-2 hover:border-neutral-400">
                  + otra fase
                </button>
              )}
            </div>

            <div className="bg-white border border-neutral-200 rounded-xl p-3.5 space-y-2">
              <span className={lbl}>Si esas universidades ya tienen fases cargadas</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {[
                  ["anadir", "Añadirlas detrás", "Se conservan las que hay."],
                  ["reemplazar", "Reemplazarlas", "Se borran las de este curso. Sin deshacer."],
                ].map(([v, t, d]) => (
                  <button key={v} type="button" onClick={() => setModo(v)}
                    className={`text-left rounded-lg border px-3 py-2 transition-colors ${
                      modo === v
                        ? v === "reemplazar"
                          ? "border-red-400 bg-red-50"
                          : "border-[#1D6A4A] bg-[#E8F5EE]"
                        : "border-neutral-200 hover:border-neutral-300"}`}>
                    <p className="text-[12px] font-semibold text-neutral-800">{t}</p>
                    <p className="text-[10.5px] text-neutral-500 mt-0.5">{d}</p>
                  </button>
                ))}
              </div>
            </div>

            <button type="button" onClick={cargarBloque} disabled={!com || guardando}
              className={`w-full text-[13px] font-semibold px-4 py-2.5 rounded-lg ${
                !com || guardando
                  ? "bg-neutral-200 text-neutral-500 cursor-not-allowed"
                  : "bg-[#1D6A4A] text-white hover:opacity-90"}`}>
              {guardando ? "Cargando…"
                : com ? `Cargar en ${com.universidades.length} universidades` : "Elige la comunidad"}
            </button>
          </div>
        ) : (
          <div className="px-4 pb-5 space-y-3">
            <div className="bg-white border border-neutral-200 rounded-xl p-3.5">
              <p className="text-[12px] text-neutral-600 leading-relaxed">
                Casi ninguna universidad mueve la estructura de un curso a otro: las mismas
                fases, las mismas fechas con unos días de diferencia. Se copia el curso
                anterior y se corrige lo que cambie.
              </p>
            </div>

            <div className="bg-white border border-neutral-200 rounded-xl p-3.5 space-y-2.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <label className="space-y-1">
                  <span className={lbl}>Copiar del curso</span>
                  <select value={desde} onChange={(e) => setDesde(e.target.value)} className={inp}>
                    {(anios.length ? anios : [{ anio, fases: 0 }]).map((a) => (
                      <option key={a.anio} value={a.anio}>{a.anio} · {a.fases} fases</option>
                    ))}
                  </select>
                </label>
                <label className="space-y-1">
                  <span className={lbl}>Al curso</span>
                  <input value={hasta} onChange={(e) => setHastaManual(e.target.value)}
                    placeholder="2027-2028" className={inp} />
                </label>
              </div>

              <label className="flex items-start gap-2 cursor-pointer">
                <input type="checkbox" checked={conFechas}
                  onChange={(e) => setConFechas(e.target.checked)} className="mt-0.5" />
                <span className="text-[11.5px] text-neutral-600 leading-snug">
                  Correr también las fechas al año que le toca.
                  <span className="block text-neutral-400 text-[10.5px]">
                    Si lo desmarcas, se copian sólo los nombres de las fases y las fechas
                    quedan en blanco.
                  </span>
                </span>
              </label>
            </div>

            <p className="text-[11px] text-[#B9770E] leading-relaxed">
              Las fechas copiadas son una base de trabajo, no las oficiales. Hay que
              contrastarlas con cada universidad antes de decirle una a un asesorado.
            </p>

            <button type="button" onClick={() => duplicar(false)}
              disabled={!desde || !hasta || desde === hasta || guardando}
              className={`w-full text-[13px] font-semibold px-4 py-2.5 rounded-lg ${
                !desde || !hasta || desde === hasta || guardando
                  ? "bg-neutral-200 text-neutral-500 cursor-not-allowed"
                  : "bg-[#1A3557] text-white hover:opacity-90"}`}>
              {guardando ? "Copiando…" : `Copiar ${desde} → ${hasta || "…"}`}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
