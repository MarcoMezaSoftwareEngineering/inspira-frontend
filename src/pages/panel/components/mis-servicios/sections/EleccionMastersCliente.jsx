// src/pages/panel/components/mis-servicios/sections/EleccionMastersCliente.jsx
import { useEffect, useRef, useState } from "react";
import SeccionPanel from "./SeccionPanel";
import BaremoMaster from "../../../../../components/BaremoMaster";

// ── Tarjeta compacta de máster ────────────────────────────────────────────────

export function MasterCard({ master, score, prioridad, selected, comentario, onToggle, onComentario }) {
  const dur =
    master.duracion_anios === 1    ? "1 año"
    : master.duracion_anios === 1.5 ? "18 meses"
    : master.duracion_anios         ? `${master.duracion_anios} años`
    : null;
  // El precio que ve el asesorado es el final si lo hay —el que fija la
  // universidad—, y solo si no, el estimado por decreto. Estaba al revés:
  // ignoraba el final, y un máster privado de 6.750 € salía como 4.241 €.
  const importe = master.precio_final ?? master.precio_total_estimado;
  const precio = importe
    ? `€${Math.round(importe).toLocaleString("es-ES")}`
    : null;

  return (
    // El estado se dice con el filete de color y el fondo tenue, no con una
    // sombra distinta: dos señales de profundidad compitiendo aplanan la lista.
    <div className="ux-tarjeta overflow-hidden" data-sel={selected ? "1" : "0"}>
      <button type="button" onClick={onToggle}
        aria-pressed={selected}
        className="ux-tap w-full text-left flex items-center gap-3 px-3.5 py-3">
        <div className={`shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
          selected ? "border-primary bg-primary" : "border-neutral-300 bg-white"
        }`}>
          {selected && <span className="text-white text-[9px] font-black leading-none">✓</span>}
        </div>

        {selected && (
          <div className="shrink-0 w-5 h-5 rounded-full bg-primary text-white text-[10px] font-black flex items-center justify-center">
            {prioridad}
          </div>
        )}

        <div className="flex-1 min-w-0">
          <p className="text-[14.5px] font-semibold text-neutral-900 leading-snug">{master.nombre_limpio}</p>
          <p className="text-[11.5px] text-neutral-500 leading-snug mt-1">
            {master.universidad.nombre_completo}
            {master.universidad.ciudad ? ` · ${master.universidad.ciudad}` : ""}
          </p>
          <div className="flex flex-wrap gap-1 mt-1.5">
            {precio && <span className="text-[10px] bg-neutral-100 text-neutral-500 px-1.5 py-0.5 rounded">{precio}</span>}
            {dur    && <span className="text-[10px] bg-neutral-100 text-neutral-500 px-1.5 py-0.5 rounded">{dur}</span>}
            {/* Hay asesorados a quienes un título propio les encaja, así que
                esto informa, no advierte: se dice qué es y se explica debajo. */}
            {master.es_titulo_oficial === false && (
              <span className="text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200 px-1.5 py-0.5 rounded">
                Título propio
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

      {/* La baremación, siempre visible: es lo primero que pregunta quien ve un
          máster que le gusta —«¿qué posibilidades tengo de entrar?»— y hasta
          ahora solo estaba en el buscador interno del asesor. */}
      {master.baremo?.length > 0 && (
        <div className="px-3 pb-2">
          <BaremoMaster baremo={master.baremo} />
        </div>
      )}

      {/* Qué significa la etiqueta. Sin esto, «título propio» no le dice nada
          a quien no conoce el sistema español, y es justo lo que necesita
          saber para comparar este programa con el resto. */}
      {master.es_titulo_oficial === false && (
        <div className="px-3 pb-2">
          <p className="text-[10.5px] leading-snug text-amber-800 bg-amber-50/70 border border-amber-200 rounded-lg px-2 py-1.5">
            Es un <strong>título propio</strong> de la universidad, no un título
            oficial: no se homologa ni convalida y no da acceso al doctorado.
            Sirve para estudiar en España; consúltenos si le interesa este
            programa y le explicamos qué implica en su caso.
          </p>
        </div>
      )}

      {/* El enlace a la ficha del máster.
          Va FUERA del botón: un <a> dentro de un <button> es HTML inválido y
          en algunos navegadores el clic se lo come el botón, con lo que el
          enlace no abre y encima cambia la selección. Y sin enlace el informe
          le daba al asesorado veinte nombres que no podía ir a mirar. */}
      {(master.url_ficha || master.universidad?.url) && (
        <div className="px-3 pb-2.5 -mt-1">
          <a
            href={master.url_ficha || master.universidad.url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="inline-flex items-center gap-1 text-[10.5px] font-semibold text-primary hover:underline"
          >
            {master.url_ficha ? "Ver la ficha del máster" : "Ver la web de la universidad"}
            <span aria-hidden="true">↗</span>
          </a>
        </div>
      )}

      {selected && onComentario && (
        <div className="px-3 pb-2.5 border-t border-neutral-100">
          <textarea
            rows={1}
            value={comentario}
            onChange={(e) => onComentario(e.target.value)}
            onClick={(e) => e.stopPropagation()}
            placeholder="Comentario opcional…"
            className="w-full mt-2 text-xs border border-neutral-200 rounded-lg px-3 py-1.5 focus:outline-none focus:border-primary resize-none bg-white text-neutral-700 placeholder-neutral-400"
          />
        </div>
      )}
    </div>
  );
}

// ── Componente principal ──────────────────────────────────────────────────────
// compat y loadingCompat vienen del padre (DetalleSolicitud) — mismos datos que InformeBusqueda

export default function EleccionMastersCliente({
  elecciones, onGuardar, saving, idSolicitud, hasFormData, compat, loadingCompat, resetKey,
}) {
  const [seleccion, setSeleccion]     = useState([]);
  const [comentarios, setComentarios] = useState({});
  const isMount     = useRef(true);
  const initialized = useRef(false);

  // Limpiar selección cada vez que se regenera el informe (resetKey sube solo al guardar form)
  useEffect(() => {
    if (isMount.current) { isMount.current = false; return; }
    initialized.current = false;
    setSeleccion([]);
    setComentarios({});
  }, [resetKey]); // eslint-disable-line

  // Inicializar selección desde elecciones guardadas.
  // Se reactiva cuando el padre actualiza elecciones (ej. tras guardar),
  // pero solo inicializa una vez hasta el próximo reset.
  useEffect(() => {
    if (initialized.current) return;
    const saved = (Array.isArray(elecciones) ? elecciones : []).filter((e) => e.id_master);
    if (saved.length > 0) {
      initialized.current = true;
      setSeleccion(saved.map((e) => ({ ...e })));
      const coms = {};
      saved.forEach((e) => { if (e.comentario) coms[e.id_master] = e.comentario; });
      setComentarios(coms);
    }
  }, [elecciones]); // eslint-disable-line

  const resultados  = compat?.resultados ?? [];
  const selectedIds = new Set(seleccion.map((s) => s.id_master));

  function deseleccionar(id_master) {
    setSeleccion((prev) =>
      prev.filter((s) => s.id_master !== id_master).map((s, i) => ({ ...s, prioridad: i + 1 }))
    );
  }

  function toggleMaster(r) {
    const id = r.master.id_master;
    if (selectedIds.has(id)) {
      deseleccionar(id);
    } else {
      setSeleccion((prev) => [
        ...prev,
        {
          id_master:     id,
          nombre_limpio: r.master.nombre_limpio,
          universidad:   r.master.universidad.nombre_completo,
          ciudad:        r.master.universidad.ciudad,
          score:         r.score,
          prioridad:     prev.length + 1,
          comentario:    comentarios[id] || "",
        },
      ]);
    }
  }

  function limpiarSeleccion() {
    setSeleccion([]);
    setComentarios({});
  }

  function setComentario(id_master, texto) {
    setComentarios((prev) => ({ ...prev, [id_master]: texto }));
    setSeleccion((prev) =>
      prev.map((s) => s.id_master === id_master ? { ...s, comentario: texto } : s)
    );
  }

  function handleGuardar(e) {
    e.preventDefault();
    const data = seleccion.map((s) => ({ ...s, comentario: comentarios[s.id_master] || "" }));
    onGuardar && onGuardar(data);
  }

  const noSeleccionados = resultados.filter((r) => !selectedIds.has(r.master.id_master));

  const filled    = seleccion.length;
  const estado    = filled > 0 ? "completado" : loadingCompat ? "cargando" : "pendiente";
  const subtitulo = filled > 0
    ? `${filled} máster${filled > 1 ? "es" : ""} seleccionado${filled > 1 ? "s" : ""}`
    : loadingCompat
      ? "Cargando másteres recomendados…"
      : hasFormData
        ? "Selecciona los másteres de tu informe por orden de prioridad."
        : "Completa el formulario para ver los másteres recomendados.";

  return (
    <SeccionPanel
      numero="5"
      titulo="Elección de másteres"
      subtitulo={subtitulo}
      estado={estado}
      sectionId="5"
      grow
      contentClassName="flex-1 min-h-0 flex flex-col overflow-hidden"
    >
      <div className="flex flex-col flex-1 min-h-0">

        <div className="flex-1 min-h-0 overflow-y-auto px-4 py-3 space-y-1.5">

          {/* Sin formulario guardado */}
          {!hasFormData && !loadingCompat && (
            <div className="bg-neutral-50 rounded-xl p-4 text-sm text-neutral-500">
              Completa el formulario académico para ver los másteres recomendados aquí.
            </div>
          )}

          {/* Cargando másteres */}
          {loadingCompat && (
            <div className="flex items-center gap-3 py-6 px-4 bg-neutral-50 rounded-xl">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <div className="w-5 h-5 border-2 border-primary-light border-t-transparent rounded-full animate-spin" />
              </div>
              <div>
                <p className="text-sm font-medium text-neutral-800">Cargando másteres recomendados…</p>
                <p className="text-xs text-neutral-500 mt-0.5">Estamos preparando tu selección personalizada.</p>
              </div>
            </div>
          )}

          {/* Informe disponible */}
          {hasFormData && !loadingCompat && compat && (
            <>
              <div className="flex items-start gap-2 bg-primary/5 rounded-xl px-3 py-2.5 mb-2 text-xs text-neutral-600">
                <span className="shrink-0 mt-0.5">ℹ️</span>
                <span>Toca un programa para seleccionarlo. <strong>El orden importa</strong> — el primero es tu primera opción.</span>
              </div>

              {seleccion.length > 0 && (
                <>
                  <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-wide px-1 pt-1">
                    Seleccionados · {seleccion.length}
                  </p>
                  {seleccion.map((s) => {
                    const r = resultados.find((r) => r.master.id_master === s.id_master);
                    const masterData = r?.master ?? {
                      id_master: s.id_master,
                      nombre_limpio: s.nombre_limpio,
                      universidad: { nombre_completo: s.universidad, ciudad: s.ciudad },
                      precio_total_estimado: null,
                      duracion_anios: null,
                    };
                    return (
                      <MasterCard
                        key={s.id_master}
                        master={masterData}
                        score={s.score}
                        prioridad={s.prioridad}
                        selected={true}
                        comentario={comentarios[s.id_master] || ""}
                        onToggle={() => r ? toggleMaster(r) : deseleccionar(s.id_master)}
                        onComentario={(txt) => setComentario(s.id_master, txt)}
                      />
                    );
                  })}
                </>
              )}

              {noSeleccionados.length > 0 && (
                <>
                  <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-wide px-1 pt-2">
                    {seleccion.length > 0 ? "Otros del informe" : `Del informe · ${compat.total} programas`}
                  </p>
                  {noSeleccionados.map((r) => (
                    <MasterCard
                      key={r.master.id_master}
                      master={r.master}
                      score={r.score}
                      prioridad={null}
                      selected={false}
                      comentario=""
                      onToggle={() => toggleMaster(r)}
                      onComentario={null}
                    />
                  ))}
                </>
              )}

              {resultados.length === 0 && (
                <p className="text-sm text-neutral-400 italic py-6 text-center">
                  El informe no tiene programas compatibles aún.
                </p>
              )}
            </>
          )}

          {/* Formulario guardado pero sin compat (error de API) */}
          {hasFormData && !loadingCompat && !compat && (
            <div className="bg-neutral-50 rounded-xl p-4 text-sm text-neutral-500">
              No se pudo cargar el informe. Recarga la página para intentarlo de nuevo.
            </div>
          )}
        </div>

        {/* La acción principal, pegada abajo en el móvil: es donde llega el
            pulgar de quien sostiene el teléfono con una mano, y el asesorado
            elige másteres desplazando una lista larga. El respiro de abajo
            evita que la barra de gestos de iOS se coma el botón. */}
        <div className="shrink-0 sticky bottom-0 z-20 border-t border-neutral-100 bg-white/95 backdrop-blur px-4 py-3 flex items-center justify-between gap-3"
          style={{ paddingBottom: "calc(0.75rem + env(safe-area-inset-bottom, 0px))" }}>
          <div className="flex items-center gap-3">
            <p className="text-xs text-neutral-500">
              {filled > 0
                ? `${filled} seleccionado${filled > 1 ? "s" : ""}`
                : "Ninguno seleccionado"}
            </p>
            {filled > 0 && (
              <button
                type="button"
                onClick={limpiarSeleccion}
                className="ux-tap ux-tap-invisible text-[11.5px] text-neutral-400 hover:text-red-500 underline px-1"
              >
                Limpiar
              </button>
            )}
          </div>
          <button
            onClick={handleGuardar}
            disabled={saving || filled === 0}
            className="ux-tap inline-flex items-center justify-center gap-2 text-sm font-semibold px-5 min-h-[48px] rounded-xl bg-primary text-white hover:bg-primary-light disabled:opacity-40 shadow-sm"
          >
            {saving ? (
              <>
                <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                Guardando…
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
                Guardar elección
              </>
            )}
          </button>
        </div>
      </div>
    </SeccionPanel>
  );
}
