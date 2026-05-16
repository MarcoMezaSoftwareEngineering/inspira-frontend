// ModalMaster.jsx — modal compartido para crear / editar un máster
import { useEffect, useState } from "react";
import { boGET, boPOST } from "../../../services/backofficeApi";
import {
  MODALIDADES, TIENE_PRACTICAS_OPCIONES, CATEGORIAS_CRITERIO,
  formatPrecio, duracionLabel,
  MODAL_OVERLAY, MODAL_PANEL,
} from "./catalogoConstants";

const FORM_INIT = {
  id_universidad: "", nombre_limpio: "", nombre_original: "",
  rama: "CIENCIAS_SOCIALES_JURIDICAS", id_sub_area: "", modalidad: "PRESENCIAL", ects: "60",
  es_habilitante: false, tiene_practicas: "", es_interuniversitario: false, es_dual: false,
  titulo_acceso: "", notas: "", activo: true,
};

// onSaved(master | null) — para crear recibe el objeto master nuevo, para editar recibe null
export default function ModalMaster({ item, universidades, comunidades, ramas, onClose, onSaved }) {
  const isEdit = !!item?.id_master;
  const [form, setForm] = useState(
    isEdit
      ? {
          id_universidad:        String(item.id_universidad),
          nombre_limpio:         item.nombre_limpio        || "",
          nombre_original:       item.nombre_original      || "",
          rama:                  item.rama                 || "CIENCIAS_SOCIALES_JURIDICAS",
          id_sub_area:           item.sub_area?.id_sub_area != null ? String(item.sub_area.id_sub_area) : "",
          modalidad:             item.modalidad            || "PRESENCIAL",
          ects:                  String(item.ects          || 60),
          es_habilitante:        !!item.es_habilitante,
          tiene_practicas:       item.tiene_practicas == null ? "" : String(item.tiene_practicas),
          es_interuniversitario: !!item.es_interuniversitario,
          es_dual:               !!item.es_dual,
          titulo_acceso:         item.titulo_acceso        || "",
          notas:                 item.notas                || "",
          activo:                item.activo,
        }
      : { ...FORM_INIT }
  );
  const [saving,      setSaving]      = useState(false);
  const [err,         setErr]         = useState(null);
  const [criterios,   setCriterios]   = useState([]);
  const [loadingCrit, setLoadingCrit] = useState(false);
  const [subAreas,    setSubAreas]    = useState([]);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  useEffect(() => {
    if (!form.rama) { setSubAreas([]); return; }
    boGET(`/backoffice/catalogo/subareas?rama=${form.rama}`)
      .then((d) => { if (d.ok) setSubAreas(d.subareas || []); });
  }, [form.rama]); // eslint-disable-line

  const univSel      = universidades.find((u) => String(u.id_universidad) === String(form.id_universidad));
  const comUniv      = univSel ? comunidades.find((c) => c.id_comunidad === univSel.id_comunidad) : null;
  const precioPreview = comUniv && form.ects
    ? Number(comUniv.precio_credito_extranjero) * Number(form.ects)
    : null;

  useEffect(() => {
    if (!isEdit) return;
    setLoadingCrit(true);
    boGET(`/backoffice/catalogo/masters/${item.id_master}`)
      .then((d) => {
        if (d.ok) setCriterios((d.master.criterios || []).map((c) => ({
          categoria: c.categoria, descripcion: c.descripcion, peso_porcentaje: c.peso_porcentaje ?? "",
        })));
      })
      .finally(() => setLoadingCrit(false));
  }, [item?.id_master, isEdit]); // eslint-disable-line

  function addCriterio()           { setCriterios((prev) => [...prev, { categoria: "EXPEDIENTE_ACADEMICO", descripcion: "", peso_porcentaje: "" }]); }
  function removeCriterio(i)       { setCriterios((prev) => prev.filter((_, idx) => idx !== i)); }
  function updateCriterio(i, k, v) { setCriterios((prev) => prev.map((c, idx) => idx === i ? { ...c, [k]: v } : c)); }

  async function submit(e) {
    e.preventDefault();
    if (!form.rama.trim()) { setErr("La rama es obligatoria"); return; }
    setErr(null); setSaving(true);
    try {
      const url = isEdit
        ? `/backoffice/catalogo/masters/${item.id_master}`
        : "/backoffice/catalogo/masters";
      const data = await boPOST(url, {
        id_universidad:        form.id_universidad,
        nombre_limpio:         form.nombre_limpio,
        nombre_original:       form.nombre_original || form.nombre_limpio,
        rama:                  form.rama,
        id_sub_area:           form.id_sub_area === "" ? null : Number(form.id_sub_area),
        modalidad:             form.modalidad,
        ects:                  form.ects,
        es_habilitante:        form.es_habilitante,
        tiene_practicas:       form.tiene_practicas === "" ? null : form.tiene_practicas,
        es_interuniversitario: form.es_interuniversitario,
        es_dual:               form.es_dual,
        titulo_acceso:         form.titulo_acceso || null,
        notas:                 form.notas || null,
        activo:                form.activo,
      });
      if (!data.ok) throw new Error(data.msg || "Error guardando");
      const masterId = isEdit ? item.id_master : data.master?.id_master;
      if (masterId) {
        await boPOST(`/backoffice/catalogo/masters/${masterId}/criterios`, { criterios });
      }
      onSaved(isEdit ? null : data.master);
    } catch (ex) { setErr(ex.message); }
    finally { setSaving(false); }
  }

  return (
    <div className={MODAL_OVERLAY} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className={MODAL_PANEL}>
        <div className="flex items-center justify-between px-6 py-4 border-b sticky top-0 bg-white z-10">
          <h2 className="text-base font-bold text-primary">{isEdit ? "Editar Máster" : "Nuevo Máster"}</h2>
          <button onClick={onClose} className="w-7 h-7 rounded-lg bg-neutral-100 hover:bg-neutral-200 flex items-center justify-center text-neutral-500 transition text-sm">✕</button>
        </div>
        <form onSubmit={submit} className="px-6 py-5 space-y-4">
          {err && <p className="text-sm text-red-600 bg-red-50 rounded-xl px-3 py-2">{err}</p>}

          <div>
            <label className="block text-xs font-semibold text-neutral-500 mb-1">Universidad *</label>
            <select required className="w-full border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              value={form.id_universidad} onChange={(e) => set("id_universidad", e.target.value)}>
              <option value="">Seleccionar…</option>
              {universidades.map((u) => (
                <option key={u.id_universidad} value={u.id_universidad}>{u.sigla} — {u.nombre_completo}</option>
              ))}
            </select>
            {comUniv && (
              <p className="mt-1 text-xs text-neutral-500">
                CCAA: {comUniv.nombre} — {formatPrecio(comUniv.precio_credito_extranjero)}/crédito
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-500 mb-1">Nombre limpio *</label>
            <input required className="w-full border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              value={form.nombre_limpio} onChange={(e) => set("nombre_limpio", e.target.value)}
              placeholder="Sin sufijos como '(a distancia)' o '(Interuniversitario)'" />
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-500 mb-1">Nombre original</label>
            <input className="w-full border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              value={form.nombre_original} onChange={(e) => set("nombre_original", e.target.value)}
              placeholder="Tal cual aparece en la web (opcional)" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-neutral-500 mb-1">Rama *</label>
              <select required className="w-full border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                value={form.rama} onChange={(e) => { set("rama", e.target.value); set("id_sub_area", ""); }}>
                <option value="">Seleccionar…</option>
                {ramas.filter((r) => r.activo).map((r) => (
                  <option key={r.id_rama} value={r.valor}>{r.etiqueta}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-neutral-500 mb-1">Modalidad *</label>
              <select required className="w-full border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                value={form.modalidad} onChange={(e) => set("modalidad", e.target.value)}>
                {MODALIDADES.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-500 mb-1">Sub-área</label>
            <select className="w-full border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              value={form.id_sub_area} onChange={(e) => set("id_sub_area", e.target.value)}>
              <option value="">Sin sub-área</option>
              {subAreas.filter((s) => s.activo).map((s) => (
                <option key={s.id_sub_area} value={s.id_sub_area}>{s.etiqueta}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-500 mb-1">
              ECTS * <span className="font-normal text-neutral-400">— precio = ECTS × €/crédito CCAA</span>
            </label>
            <input required type="number" min="1" max="300"
              className="w-full border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              value={form.ects} onChange={(e) => set("ects", e.target.value)} />
            {precioPreview != null && (
              <p className="mt-1 text-xs text-neutral-500">
                Precio estimado: <span className="font-semibold text-neutral-700">{formatPrecio(precioPreview)}</span>
                {" · Duración: "}
                <span className="font-semibold text-neutral-700">
                  {duracionLabel(Number(form.ects) <= 60 ? 1 : Number(form.ects) <= 90 ? 1.5 : 2)}
                </span>
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-x-6 gap-y-3">
            {[["es_habilitante","Máster habilitante"],["es_interuniversitario","Interuniversitario"],["es_dual","Dual (empresa)"]].map(([key, label]) => (
              <label key={key} className="flex items-center gap-2 text-sm text-neutral-700 cursor-pointer">
                <input type="checkbox" checked={form[key]} onChange={(e) => set(key, e.target.checked)}
                  className="w-4 h-4 rounded border-neutral-300 text-primary focus:ring-primary" />
                {label}
              </label>
            ))}
            <div>
              <label className="block text-xs font-semibold text-neutral-500 mb-1">Prácticas</label>
              <select className="w-full border rounded-xl px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                value={form.tiene_practicas} onChange={(e) => set("tiene_practicas", e.target.value)}>
                {TIENE_PRACTICAS_OPCIONES.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-500 mb-1">Título de acceso</label>
            <input className="w-full border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              value={form.titulo_acceso} onChange={(e) => set("titulo_acceso", e.target.value)}
              placeholder="Carreras que dan acceso al máster" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-neutral-500 mb-1">Notas internas</label>
            <textarea rows={2} className="w-full border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
              value={form.notas} onChange={(e) => set("notas", e.target.value)} />
          </div>
          <label className="flex items-center gap-2 text-sm text-neutral-700 cursor-pointer">
            <input type="checkbox" checked={form.activo} onChange={(e) => set("activo", e.target.checked)}
              className="w-4 h-4 rounded border-neutral-300 text-primary focus:ring-primary" />
            Activo
          </label>

          <div className="border border-neutral-200 rounded-xl overflow-hidden">
            <div className="flex items-center justify-between px-4 py-2.5 bg-neutral-50 border-b">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-neutral-700">Criterios de admisión</span>
                {loadingCrit
                  ? <span className="text-[10px] text-neutral-400">Cargando…</span>
                  : <span className="text-[10px] bg-neutral-200 text-neutral-500 px-1.5 py-0.5 rounded-full font-semibold">{criterios.length}</span>
                }
              </div>
              <button type="button" onClick={addCriterio}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary text-xs font-semibold transition">
                + Añadir
              </button>
            </div>
            {criterios.length === 0 && !loadingCrit && (
              <p className="text-xs text-neutral-400 text-center py-4 italic">Sin criterios. Pulsa "Añadir" para agregar.</p>
            )}
            {criterios.map((c, i) => (
              <div key={i} className="flex items-start gap-2 px-3 py-2.5 border-b border-neutral-100 last:border-0 bg-white">
                <span className="shrink-0 text-[10px] text-neutral-300 tabular-nums w-4 text-right pt-2">{i + 1}</span>
                <select value={c.categoria} onChange={(e) => updateCriterio(i, "categoria", e.target.value)}
                  className="shrink-0 border border-neutral-200 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary/30 bg-white">
                  {CATEGORIAS_CRITERIO.map((cat) => (
                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                  ))}
                </select>
                <input value={c.descripcion} onChange={(e) => updateCriterio(i, "descripcion", e.target.value)}
                  placeholder="Descripción del criterio…"
                  className="flex-1 border border-neutral-200 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary/30" />
                <input type="number" min="0" max="100" value={c.peso_porcentaje}
                  onChange={(e) => updateCriterio(i, "peso_porcentaje", e.target.value)}
                  placeholder="%" className="shrink-0 w-14 border border-neutral-200 rounded-lg px-2 py-1.5 text-xs text-center focus:outline-none focus:ring-2 focus:ring-primary/30" />
                <button type="button" onClick={() => removeCriterio(i)}
                  className="shrink-0 w-6 h-6 mt-1 rounded-md bg-red-50 hover:bg-red-100 text-red-500 text-xs flex items-center justify-center transition">
                  ✕
                </button>
              </div>
            ))}
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t">
            <button type="button" onClick={onClose}
              className="px-4 py-2 rounded-xl border border-neutral-200 text-sm font-medium hover:bg-neutral-50 transition">
              Cancelar
            </button>
            <button type="submit" disabled={saving}
              className="px-5 py-2 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition disabled:opacity-60">
              {saving ? "Guardando…" : isEdit ? "Guardar cambios" : "Crear máster"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
