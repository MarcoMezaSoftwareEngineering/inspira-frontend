// src/pages/backoffice/solicitudes/EleccionMastersAdmin.jsx
// Bloque 5 — Elección de másteres.
// MODO A: admin selecciona en nombre del cliente (cuando no hay selección o tras "Rehacer")
// MODO B: asesor decide Sí/No para cada master elegido por el cliente
import { useEffect, useState } from "react";
import { boGET, boPATCH } from "../../../services/backofficeApi";
import { dialog } from "../../../services/dialogService";

// El nombre suele delatar al título propio, así que la casilla se propone
// sola y el asesor la corrige si se equivoca. Anclado a «máster de formación
// permanente/profesional»: buscar «formación profesional» suelta marcaba el
// Máster en Formación del Profesorado, que es oficial y habilitante.
const NOMBRE_TITULO_PROPIO =
  new RegExp("(^|\\b)m[aá]ster\\s+(universitario\\s+)?de\\s+formaci[oó]n\\s+(permanente|profesional)\\b|t[ií]tulo\\s+propio|\\bexperto\\s+universitario\\b|microcredencial", "i");

const COLORES_PRIORIDAD = ["bg-[#1A3557]", "bg-[#1D6A4A]", "bg-amber-500", "bg-neutral-400", "bg-neutral-300"];

// ── Tarjeta máster para el modo picker ───────────────────────────────────────

function MasterPickCard({ r, selected, prioridad, onToggle }) {
  const { master, score } = r;
  const dur =
    master.duracion_anios === 1    ? "1 año"
    : master.duracion_anios === 1.5 ? "18 meses"
    : master.duracion_anios         ? `${master.duracion_anios} años`
    : null;
  // El final si lo hay, el estimado si no: el mismo criterio que el informe.
  const importe = master.precio_final ?? master.precio_total_estimado;
  const precio = importe
    ? `€${Math.round(importe).toLocaleString("es-ES")}`
    : null;

  return (
    <button
      type="button"
      onClick={onToggle}
      className={`w-full text-left flex items-center gap-2.5 px-3 py-2.5 rounded-xl border transition-all ${
        selected
          ? "border-[#1A3557] bg-[#1A3557]/[0.04]"
          : "border-neutral-200 bg-white hover:border-neutral-300"
      }`}
    >
      <div className={`shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
        selected ? "border-[#1A3557] bg-[#1A3557]" : "border-neutral-300 bg-white"
      }`}>
        {selected && <span className="text-white text-[9px] font-black leading-none">✓</span>}
      </div>
      {selected && (
        <div className="shrink-0 w-5 h-5 rounded-full bg-[#1A3557] text-white text-[10px] font-black flex items-center justify-center">
          {prioridad}
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-[#1A3557] leading-tight">{master.nombre_limpio}</p>
        <p className="text-[11px] text-neutral-500 leading-tight truncate mt-0.5">
          {master.universidad.nombre_completo}
          {master.universidad.ciudad ? ` · ${master.universidad.ciudad}` : ""}
        </p>
        <div className="flex flex-wrap gap-1 mt-1.5">
          {precio && <span className="text-[10px] bg-neutral-100 text-neutral-500 px-1.5 py-0.5 rounded">{precio}</span>}
          {dur    && <span className="text-[10px] bg-neutral-100 text-neutral-500 px-1.5 py-0.5 rounded">{dur}</span>}
          {/* Se ve al elegir, que es cuando sirve de algo. */}
          {master.es_titulo_oficial === false && (
            <span className="text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200 px-1.5 py-0.5 rounded">
              título propio
            </span>
          )}
          {score  && (
            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
              score >= 80 ? "bg-emerald-50 text-emerald-700"
              : score >= 60 ? "bg-amber-50 text-amber-700"
              : "bg-red-50 text-red-600"
            }`}>{score}% match</span>
          )}
        </div>
      </div>
    </button>
  );
}

// ── Componente principal ──────────────────────────────────────────────────────

/**
 * Alta manual de un máster.
 *
 * El informe de compatibilidad sólo conoce el catálogo, y la realidad se sale
 * de él: una universidad abre un programa nuevo, el cliente encuentra uno por
 * su cuenta, o llega una modificatoria después de haber elegido. Sin esto
 * había que dejarlo fuera del bloque —y por tanto fuera del tracker.
 */
function FormManual({ onAnadir, onCancelar, guardando }) {
  const VACIO = { nombre_limpio: "", universidad: "", ciudad: "",
                  url_ficha: "", ects: "", precio_final: "", es_titulo_oficial: true };
  const [f, setF] = useState(VACIO);
  const listo = f.nombre_limpio.trim() && f.universidad.trim();

  const pareceTituloPropio = NOMBRE_TITULO_PROPIO.test(f.nombre_limpio);

  const campo = "w-full text-[12px] border border-neutral-200 rounded-lg px-2.5 py-1.5 text-neutral-800 placeholder:text-neutral-300 outline-none focus:border-[#1A3557] transition";

  return (
    <div className="bg-white border border-dashed border-[#1A3557]/30 rounded-xl px-3 py-3 space-y-2">
      <p className="text-[9px] font-bold uppercase tracking-widest text-[#1A3557] font-mono">
        + Máster fuera del catálogo
      </p>
      <div className="grid sm:grid-cols-3 gap-2">
        <input className={campo} placeholder="Nombre del máster *" value={f.nombre_limpio}
          onChange={(e) => setF({ ...f, nombre_limpio: e.target.value })} />
        <input className={campo} placeholder="Universidad *" value={f.universidad}
          onChange={(e) => setF({ ...f, universidad: e.target.value })} />
        <input className={campo} placeholder="Ciudad" value={f.ciudad}
          onChange={(e) => setF({ ...f, ciudad: e.target.value })} />
      </div>
      {/* Un máster añadido a mano llegaba al informe con nombre y universidad y
          nada más: sin enlace el asesorado no puede ir a mirarlo, y sin precio
          ni créditos queda descolgado al lado de los del catálogo, que sí los
          llevan. Los tres son opcionales, pero estar, están. */}
      <div className="grid sm:grid-cols-3 gap-2">
        <input className={`${campo} sm:col-span-2`} placeholder="Enlace a la ficha del máster"
          value={f.url_ficha} onChange={(e) => setF({ ...f, url_ficha: e.target.value })} />
        <div className="grid grid-cols-2 gap-2">
          <input className={campo} placeholder="ECTS" inputMode="numeric"
            value={f.ects} onChange={(e) => setF({ ...f, ects: e.target.value })} />
          <input className={campo} placeholder="Precio €" inputMode="numeric"
            value={f.precio_final} onChange={(e) => setF({ ...f, precio_final: e.target.value })} />
        </div>
      </div>
      <label className="flex items-center gap-2 text-[11px] text-neutral-600 cursor-pointer">
        <input type="checkbox" className="accent-amber-600"
          checked={f.es_titulo_oficial === false || (pareceTituloPropio && f.es_titulo_oficial !== true)}
          onChange={(e) => setF({ ...f, es_titulo_oficial: !e.target.checked })} />
        Es un <strong className="font-semibold">título propio</strong> de la universidad,
        no un título oficial
      </label>
      <div className="flex items-center gap-2">
        <button
          type="button" disabled={!listo || guardando}
          onClick={() => {
            onAnadir({ ...f,
              es_titulo_oficial: f.es_titulo_oficial === false ? false : !pareceTituloPropio });
            setF(VACIO);
          }}
          className="text-[11px] font-bold px-3 py-1.5 rounded-lg bg-[#1A3557] text-white hover:bg-[#142a45] disabled:opacity-40 transition"
        >
          {guardando ? "Guardando…" : "Añadir al bloque"}
        </button>
        {onCancelar && (
          <button type="button" onClick={onCancelar}
            className="text-[11px] font-semibold text-neutral-500 hover:text-neutral-800">
            Cancelar
          </button>
        )}
        <span className="text-[10px] text-neutral-400 ml-auto">
          Se sincroniza con el tracker igual que los del informe
        </span>
      </div>
    </div>
  );
}

export default function EleccionMastersAdmin({ elecciones, idSolicitud, onEleccionesActualizadas, resetKey }) {
  const [filas, setFilas]           = useState(() => normalizar(elecciones));
  const [guardando, setGuardando]   = useState(false);
  const [nota, setNota]             = useState(() => extraerNota(elecciones));

  // MODO PICKER (selección inicial o "Rehacer")
  const [modoSeleccion, setModoSeleccion] = useState(() => !elecciones || elecciones.length === 0);
  const [informe, setInforme]             = useState(null);
  const [loadingInf, setLoadingInf]       = useState(false);
  const [selAdmin, setSelAdmin]           = useState([]); // selección admin en modo picker
  const [manualAbierto, setManualAbierto] = useState(false);
  const [avisando, setAvisando]           = useState(false);
  const [avisadoAt, setAvisadoAt]         = useState(null);

  // La elección llega cuando llega —el detalle se carga después de montar
  // esto— y cambia cada vez que el asesorado guarda. Si solo se leyera al
  // montar, el asesor caía en el selector vacío y tenía que elegir de nuevo.
  const firma = JSON.stringify(elecciones || []);
  const [firmaVista, setFirmaVista] = useState(firma);
  if (firma !== firmaVista) {
    setFirmaVista(firma);
    setFilas(normalizar(elecciones));
    setNota(extraerNota(elecciones));
    if (Array.isArray(elecciones) && elecciones.length > 0) setModoSeleccion(false);
  }

  function normalizar(raw) {
    if (!Array.isArray(raw) || raw.length === 0) return [];
    return [...raw]
      .sort((a, b) => (a.prioridad || 0) - (b.prioridad || 0))
      .map((f) => ({ ...f, plan_incluido: f.plan_incluido ?? null }));
  }

  function extraerNota(raw) {
    if (!Array.isArray(raw) || raw.length === 0) return "";
    return raw[0]?._nota_asesor ?? "";
  }

  // Cuando el informe se regenera se vuelve a cargar; la elección del
  // asesorado se queda y solo se va al selector si no había ninguna.
  useEffect(() => {
    if (!resetKey) return;
    setSelAdmin([]);
    setInforme(null);
    setModoSeleccion(filas.length === 0);
  }, [resetKey]); // eslint-disable-line

  // Cargar informe cuando entramos en modo picker
  useEffect(() => {
    if (!modoSeleccion || !idSolicitud || informe) return;
    setLoadingInf(true);
    boGET(`/backoffice/solicitudes/${idSolicitud}/compatibilidad`)
      .then((r) => { if (r.ok) setInforme(r); })
      .catch(() => {})
      .finally(() => setLoadingInf(false));
  }, [modoSeleccion, idSolicitud]);

  // ── Modo Picker: toggle selección ────────────────────────────────────────────

  const selectedIds = new Set(selAdmin.map((s) => s.id_master));

  function toggleAdmin(r) {
    const id = r.master.id_master;
    if (selectedIds.has(id)) {
      setSelAdmin((prev) =>
        prev.filter((s) => s.id_master !== id).map((s, i) => ({ ...s, prioridad: i + 1 }))
      );
    } else {
      setSelAdmin((prev) => [
        ...prev,
        {
          id_master:     id,
          nombre_limpio: r.master.nombre_limpio,
          universidad:   r.master.universidad.nombre_completo,
          ciudad:        r.master.universidad.ciudad,
          es_titulo_oficial: r.master.es_titulo_oficial,
          score:         r.score,
          prioridad:     prev.length + 1,
          comentario:    "",
          plan_incluido: null,
        },
      ]);
    }
  }

  async function guardarSeleccionAdmin() {
    if (selAdmin.length === 0) return;
    await guardar(selAdmin, nota);
    setFilas(selAdmin.map((s, i) => ({ ...s, prioridad: i + 1 })));
    setModoSeleccion(false);
  }

  /**
   * Los del catálogo traen un id_master positivo de CatMaster. A los manuales
   * se les da uno negativo: no puede chocar con el catálogo, y el sync al
   * tracker lo acepta igual porque allí id_master es una relación blanda.
   */
  async function anadirManual(datos) {
    const minimo = Math.min(0, ...filas.map((f) => Number(f.id_master) || 0));
    const nuevas = [
      ...filas,
      {
        id_master: minimo - 1,
        nombre_limpio: datos.nombre_limpio.trim(),
        universidad: datos.universidad.trim(),
        ciudad: datos.ciudad.trim(),
        // Lo opcional se guarda solo si se escribió: una cadena vacía en el
        // enlace pintaría un «ver la ficha» que no lleva a ninguna parte.
        url_ficha: (datos.url_ficha || "").trim() || null,
        ects: datos.ects ? Number(datos.ects) : null,
        precio_final: datos.precio_final ? Number(datos.precio_final) : null,
        es_titulo_oficial: datos.es_titulo_oficial !== false,
        score: null,
        prioridad: filas.length + 1,
        comentario: "",
        plan_incluido: null,
        manual: true,
      },
    ];
    setFilas(nuevas);
    setModoSeleccion(false);
    await guardar(nuevas, nota);
  }

  // Quitar sólo vale para los manuales: los del informe se rehacen desde el
  // picker, y borrarlos de aquí dejaría el tracker descuadrado sin avisar.
  async function quitarManual(idx) {
    const nuevas = filas.filter((_, i) => i !== idx).map((f, i) => ({ ...f, prioridad: i + 1 }));
    setFilas(nuevas);
    await guardar(nuevas, nota);
  }

  // ── Modo B: toggle plan_incluido ──────────────────────────────────────────────

  async function setPlan(idx, valor) {
    const nuevas = filas.map((f, i) => i === idx ? { ...f, plan_incluido: valor } : f);
    setFilas(nuevas);
    await guardar(nuevas, nota);
  }

  async function guardarNota(textoNota) {
    setNota(textoNota);
    await guardar(filas, textoNota);
  }

  // Un clic y todos entran: lo normal es aprobar lo que eligió el asesorado
  // y dejar el «No» para las excepciones.
  async function aprobarTodos() {
    const nuevas = filas.map((f) => ({ ...f, plan_incluido: true }));
    setFilas(nuevas);
    await guardar(nuevas, nota);
  }

  // Cierra la revisión: se guarda y el asesorado recibe el correo con lo que
  // entra en el plan y lo que queda para coordinar, con la nota.
  async function confirmarYAvisar() {
    const sinDecidir = filas.filter((f) => f.plan_incluido == null).length;
    if (sinDecidir > 0) {
      const ok = await dialog.confirm(`Hay ${sinDecidir} máster(es) sin sí o no. ¿Avisar igual? Los que no tengan decisión no entran en el plan.`);
      if (!ok) return;
    }
    setAvisando(true);
    try {
      const r = await guardar(filas, nota, true);
      if (r?.avisado) { setAvisadoAt(new Date().toISOString()); dialog.toast("Elección confirmada y asesorado avisado.", "success"); }
      else dialog.toast("Se guardó, pero el correo no salió.", "error");
    } finally { setAvisando(false); }
  }

  async function guardar(filasActuales, notaActual, avisar = false) {
    if (!idSolicitud) return null;
    setGuardando(true);
    try {
      const payload = filasActuales.map((f, idx) => ({
        ...f,
        ...(idx === 0 ? { _nota_asesor: notaActual } : {}),
      }));
      const r = await boPATCH(`/backoffice/solicitudes/${idSolicitud}/eleccion-plan`, {
        eleccion_masters: payload,
        avisar,
      });
      if (r.ok && onEleccionesActualizadas) {
        onEleccionesActualizadas(r.eleccion_masters);
      }
      return r;
    } catch (e) {
      console.error("Error guardando elección:", e);
      return null;
    } finally {
      setGuardando(false);
    }
  }

  // ── MODO PICKER ───────────────────────────────────────────────────────────────

  if (modoSeleccion) {
    const resultados = informe?.resultados ?? [];
    const noSel      = resultados.filter((r) => !selectedIds.has(r.master.id_master));

    return (
      <div className="space-y-3">
        {/* Banner */}
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl text-white text-sm"
          style={{ background: "linear-gradient(135deg, #1A3557, #1D6A4A)" }}
        >
          <span className="text-base shrink-0">🎯</span>
          <div className="flex-1 min-w-0">
            <p className="font-serif text-[13px] font-bold">Seleccionar másteres (desde backoffice)</p>
            <p className="text-[11px] text-white/70">Elige en nombre del cliente. El orden importa.</p>
          </div>
          {filas.length > 0 && (
            <button
              type="button"
              onClick={() => setModoSeleccion(false)}
              className="text-[11px] text-white/70 hover:text-white underline shrink-0 transition"
            >
              Cancelar
            </button>
          )}
        </div>

        {loadingInf && (
          <div className="flex items-center gap-2 py-4 text-neutral-400">
            <div className="w-4 h-4 border-2 border-[#1A3557] border-t-transparent rounded-full animate-spin shrink-0" />
            <span className="text-sm">Cargando informe…</span>
          </div>
        )}

        {!loadingInf && informe && (
          <div className="space-y-1.5">
            {selAdmin.length > 0 && (
              <>
                <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-wide px-1 pt-1">
                  Seleccionados · {selAdmin.length}
                </p>
                {selAdmin.map((s) => {
                  const r = resultados.find((r) => r.master.id_master === s.id_master);
                  if (!r) return null;
                  return (
                    <MasterPickCard
                      key={s.id_master}
                      r={r}
                      selected={true}
                      prioridad={s.prioridad}
                      onToggle={() => toggleAdmin(r)}
                    />
                  );
                })}
              </>
            )}
            {noSel.length > 0 && (
              <>
                <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-wide px-1 pt-2">
                  {selAdmin.length > 0 ? "Otros del informe" : `Del informe · ${informe.total} programas`}
                </p>
                {noSel.map((r) => (
                  <MasterPickCard
                    key={r.master.id_master}
                    r={r}
                    selected={false}
                    prioridad={null}
                    onToggle={() => toggleAdmin(r)}
                  />
                ))}
              </>
            )}
            {resultados.length === 0 && (
              <p className="text-sm text-neutral-400 italic py-6 text-center">
                No hay másteres compatibles en el informe.
              </p>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between gap-3 pt-1">
          <p className="text-xs text-neutral-500">
            {selAdmin.length > 0
              ? `${selAdmin.length} seleccionado${selAdmin.length > 1 ? "s" : ""}`
              : "Ninguno seleccionado"}
          </p>
          <button
            type="button"
            onClick={guardarSeleccionAdmin}
            disabled={guardando || selAdmin.length === 0}
            className="inline-flex items-center gap-2 text-sm font-semibold px-5 py-2 rounded-lg bg-[#1A3557] text-white hover:bg-[#142a45] disabled:opacity-40 transition"
          >
            {guardando ? "Guardando…" : "Guardar selección"}
          </button>
        </div>
      </div>
    );
  }

  // ── MODO B — Sí/No ───────────────────────────────────────────────────────────

  if (filas.length === 0) {
    return (
      <div className="space-y-2">
        <p className="text-sm text-neutral-500">
          El cliente aún no ha registrado másteres preferidos en este bloque.{" "}
          <button
            type="button"
            onClick={() => setModoSeleccion(true)}
            className="underline text-[#1A3557] hover:text-[#1D6A4A] transition"
          >
            Seleccionar desde el backoffice
          </button>
          {" · "}
          <button
            type="button"
            onClick={() => setManualAbierto(true)}
            className="underline text-[#1A3557] hover:text-[#1D6A4A] transition"
          >
            añadir uno manualmente
          </button>
        </p>
        {manualAbierto && (
          <FormManual
            guardando={guardando}
            onAnadir={anadirManual}
            onCancelar={() => setManualAbierto(false)}
          />
        )}
      </div>
    );
  }

  const nSi = filas.filter((f) => f.plan_incluido === true).length;
  const nNo = filas.filter((f) => f.plan_incluido === false).length;

  return (
    <div className="space-y-3">
      {/* Banner */}
      <div className="flex items-center gap-3 px-4 py-3 rounded-xl text-white text-sm"
        style={{ background: "linear-gradient(135deg, #1D6A4A, #1A3557)" }}
      >
        <span className="text-base shrink-0">🎯</span>
        <div className="flex-1 min-w-0">
          <p className="font-serif text-[13px] font-bold">Selección del cliente</p>
          <p className="text-[11px] text-white/70">
            El asesorado eligió. Di sí o no a cada uno: los que entran pasan solos al bloque de postulaciones.
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0 flex-wrap justify-end">
          {guardando && (
            <span className="text-[10px] text-white/60 font-mono">Guardando…</span>
          )}
          <button
            type="button"
            onClick={aprobarTodos}
            disabled={guardando || filas.length === 0 || filas.every((f) => f.plan_incluido === true)}
            className="text-[11px] font-bold px-3 py-1.5 rounded-full bg-white/15 text-white hover:bg-white/25 disabled:opacity-40 transition"
          >
            ✓ Aprobar todos
          </button>
          <button
            type="button"
            onClick={confirmarYAvisar}
            disabled={guardando || avisando || filas.length === 0}
            className="text-[11px] font-bold px-3 py-1.5 rounded-full bg-[#FA943A] text-white hover:opacity-90 disabled:opacity-40 transition"
          >
            {avisando ? "Avisando…" : "Confirmar y avisar al asesorado"}
          </button>
          <button
            type="button"
            onClick={() => { setSelAdmin([]); setModoSeleccion(true); }}
            className="text-[10px] text-white/70 hover:text-white underline transition"
          >
            Rehacer
          </button>
        </div>
      </div>

      {/* Contadores */}
      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="bg-neutral-50 border border-neutral-200 rounded-xl py-2">
          <p className="text-[9px] font-bold uppercase tracking-widest text-neutral-400 font-mono mb-0.5">Elegidos</p>
          <p className="font-serif text-lg font-bold text-[#1A3557]">{filas.length}</p>
        </div>
        <div className="bg-[#E8F5EE] border border-[#1D6A4A]/20 rounded-xl py-2">
          <p className="text-[9px] font-bold uppercase tracking-widest text-[#1D6A4A] font-mono mb-0.5">En plan</p>
          <p className="font-serif text-lg font-bold text-[#1D6A4A]">{nSi}</p>
        </div>
        <div className="bg-amber-50 border border-amber-200 rounded-xl py-2">
          <p className="text-[9px] font-bold uppercase tracking-widest text-amber-600 font-mono mb-0.5">Coordinar</p>
          <p className="font-serif text-lg font-bold text-amber-600">{nNo}</p>
        </div>
      </div>

      {(avisadoAt || filas[0]?._confirmado_at) && (
        <p className="text-[11px] text-neutral-500 px-1">
          Asesorado avisado el {new Date(avisadoAt || filas[0]._confirmado_at).toLocaleString("es-ES")}. Si cambias algo, vuelve a confirmar.
        </p>
      )}

      {/* Filas de másteres */}
      <div className="space-y-2">
        {filas.map((fila, idx) => (
          <div
            key={idx}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl border transition-all
              ${fila.plan_incluido === true
                ? "border-[#1D6A4A]/25 bg-[#E8F5EE]"
                : fila.plan_incluido === false
                  ? "border-amber-200 bg-amber-50"
                  : "border-neutral-200 bg-white"}`}
          >
            <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-[11px] font-bold text-white shrink-0 font-mono ${COLORES_PRIORIDAD[idx] ?? "bg-neutral-400"}`}>
              P{fila.prioridad ?? idx + 1}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-semibold text-[#1A3557] leading-snug truncate">
                {fila.nombre_limpio || fila.programa || "(Sin título)"}
                {fila.manual && (
                  <span className="ml-1.5 text-[9px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded bg-neutral-100 text-neutral-500 align-middle">
                    manual
                  </span>
                )}
                {/* El asesor tiene que verlo aquí, antes de publicar el
                    informe, no enterarse cuando el asesorado pregunte. */}
                {fila.es_titulo_oficial === false && (
                  <span className="ml-1.5 text-[9px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200 align-middle">
                    título propio
                  </span>
                )}
              </p>
              {(fila.universidad || fila.ciudad || fila.score || fila.comentario) && (
                <p className="text-[11px] text-neutral-500 truncate">
                  {[fila.universidad, fila.ciudad, fila.score ? `${fila.score}% match` : null, fila.comentario]
                    .filter(Boolean).join(" · ")}
                </p>
              )}
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <span className="text-[10px] text-neutral-500 hidden sm:block">Plan:</span>
              <button
                type="button"
                onClick={() => setPlan(idx, true)}
                disabled={guardando}
                className={`px-2.5 py-1 rounded-full text-[11px] font-bold border-[1.5px] transition-all
                  ${fila.plan_incluido === true
                    ? "bg-[#1D6A4A] border-[#1D6A4A] text-white"
                    : "bg-white border-neutral-300 text-neutral-400 hover:border-[#1D6A4A] hover:text-[#1D6A4A]"}`}
              >
                Sí
              </button>
              <button
                type="button"
                onClick={() => setPlan(idx, false)}
                disabled={guardando}
                className={`px-2.5 py-1 rounded-full text-[11px] font-bold border-[1.5px] transition-all
                  ${fila.plan_incluido === false
                    ? "bg-amber-500 border-amber-500 text-white"
                    : "bg-white border-neutral-300 text-neutral-400 hover:border-amber-500 hover:text-amber-600"}`}
              >
                No
              </button>
              {fila.manual && (
                <button
                  type="button" onClick={() => quitarManual(idx)} disabled={guardando}
                  aria-label="Quitar máster manual"
                  className="text-[13px] leading-none text-neutral-300 hover:text-red-600 px-1 transition"
                >
                  ×
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Alta manual: el informe no lo cubre todo */}
      {manualAbierto ? (
        <FormManual
          guardando={guardando}
          onAnadir={anadirManual}
          onCancelar={() => setManualAbierto(false)}
        />
      ) : (
        <button
          type="button"
          onClick={() => setManualAbierto(true)}
          className="w-full text-[11.5px] font-semibold text-neutral-500 hover:text-[#1A3557] border border-dashed border-neutral-300 hover:border-[#1A3557]/40 rounded-xl py-2 transition"
        >
          + Añadir un máster que no esté en el informe
        </button>
      )}

      {/* Totales */}
      <div className="flex gap-4 px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs">
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-[#1D6A4A]" />
          <strong className="font-serif text-base text-[#1D6A4A]">{nSi}</strong>
          <span className="text-neutral-500">incluidos en plan</span>
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-amber-400" />
          <strong className="font-serif text-base text-amber-600">{nNo}</strong>
          <span className="text-neutral-500">fuera del plan — coordinar</span>
        </span>
      </div>

      {/* Nota para el cliente */}
      <div className="bg-white border border-neutral-200 rounded-xl px-4 py-3">
        <p className="text-[9px] font-bold uppercase tracking-widest text-amber-600 font-mono mb-2">
          ✎ Nota para enviar al cliente
        </p>
        <textarea
          rows={3}
          value={nota}
          onChange={(e) => setNota(e.target.value)}
          onBlur={(e) => guardarNota(e.target.value)}
          placeholder="Ej: Claudia, hemos revisado tu selección. Los primeros 3 másteres están dentro de tu Plan Comfort y comenzamos esta semana..."
          className="w-full text-xs border border-neutral-200 rounded-lg px-3 py-2 text-neutral-800 placeholder:text-neutral-300 outline-none focus:border-amber-400 resize-none transition leading-relaxed"
        />
      </div>
    </div>
  );
}
