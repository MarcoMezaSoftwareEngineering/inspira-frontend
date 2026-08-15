// src/pages/backoffice/settings/RolesPermisos.jsx
//
// Checklist de permisos por rol. Admin siempre tiene acceso total (columna
// fija, no editable) — solo Asesor y Soporte se configuran aquí.
import { useCallback, useEffect, useMemo, useState } from "react";
import { boGET, boPUT } from "../../../services/backofficeApi";
import { dialog } from "../../../services/dialogService";

const ROL_LABEL = { asesor: "Asesor", soporte: "Soporte" };
const ROL_ACCENT = {
  asesor: { border: "border-t-emerald-500", text: "text-primary" },
  soporte: { border: "border-t-amber-500", text: "text-amber-700" },
};

function Toggle({ checked, onChange }) {
  return (
    <label className="relative inline-flex items-center cursor-pointer">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="sr-only peer"
      />
      <div className="w-9 h-5 bg-neutral-300 peer-checked:bg-emerald-500 rounded-full transition-colors after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-4" />
    </label>
  );
}

function AdminCheck() {
  return (
    <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-emerald-50 text-emerald-600">
      <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
      </svg>
    </span>
  );
}

export default function RolesPermisos() {
  const [catalogo, setCatalogo] = useState([]);
  const [roles, setRoles] = useState([]);
  const [matriz, setMatriz] = useState({});
  const [original, setOriginal] = useState({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const cargar = useCallback(async () => {
    setLoading(true);
    const r = await boGET("/backoffice/permisos");
    if (r.ok) {
      setCatalogo(r.catalogo || []);
      setRoles(r.roles || []);
      setMatriz(r.matriz || {});
      setOriginal(r.matriz || {});
    } else {
      dialog.toast(r.msg || "Error cargando permisos", "error");
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    cargar();
  }, [cargar]);

  function toggle(rol, clave) {
    setMatriz((prev) => ({
      ...prev,
      [rol]: { ...prev[rol], [clave]: !prev[rol]?.[clave] },
    }));
  }

  const grupos = useMemo(() => {
    const map = new Map();
    for (const p of catalogo) {
      if (!map.has(p.modulo)) map.set(p.modulo, []);
      map.get(p.modulo).push(p);
    }
    return [...map.entries()];
  }, [catalogo]);

  const rolesConCambios = roles.filter(
    (rol) => JSON.stringify(matriz[rol]) !== JSON.stringify(original[rol])
  );
  const hayCambios = rolesConCambios.length > 0;

  async function guardar() {
    setSaving(true);
    for (const rol of rolesConCambios) {
      const r = await boPUT("/backoffice/permisos", { rol, cambios: matriz[rol] });
      if (!r.ok) {
        dialog.toast(r.msg || `Error guardando permisos de ${rol}`, "error");
        setSaving(false);
        return;
      }
    }
    setOriginal(matriz);
    setSaving(false);
    dialog.toast("Permisos actualizados", "success");
  }

  if (loading) {
    return (
      <div className="p-4 sm:p-6">
        <div className="bg-white border border-neutral-200 rounded-xl shadow-sm p-10 text-center text-sm text-neutral-400">
          Cargando…
        </div>
      </div>
    );
  }

  const total = catalogo.length;

  return (
    <div className="p-4 sm:p-6 space-y-5">
      {/* Cabecera */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-primary">Roles y Permisos</h1>
          <p className="text-sm text-neutral-500 mt-1 max-w-xl">
            Marca qué puede hacer cada rol en el backoffice. El rol{" "}
            <span className="font-semibold text-neutral-700">Admin</span> siempre
            tiene acceso total y no se puede editar aquí.
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {hayCambios && (
            <span className="text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-full whitespace-nowrap">
              Cambios sin guardar
            </span>
          )}
          <button
            type="button"
            onClick={guardar}
            disabled={!hayCambios || saving}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-white text-sm font-medium shadow-sm hover:opacity-90 disabled:opacity-40 disabled:shadow-none transition"
          >
            {saving && (
              <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
              </svg>
            )}
            {saving ? "Guardando…" : "Guardar cambios"}
          </button>
        </div>
      </div>

      {/* Stat cards por rol */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {roles.map((rol) => {
          const activos = Object.values(matriz[rol] || {}).filter(Boolean).length;
          const accent = ROL_ACCENT[rol] || ROL_ACCENT.asesor;
          return (
            <div key={rol} className={`bg-white rounded-xl border border-neutral-200 border-t-4 ${accent.border} p-4 shadow-sm`}>
              <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-1">{ROL_LABEL[rol] || rol}</p>
              <p className={`font-['Fraunces'] text-3xl font-bold leading-none ${accent.text}`}>
                {activos}<span className="text-lg text-neutral-300">/{total}</span>
              </p>
              <p className="text-[11px] text-neutral-400 mt-1">permisos activos</p>
            </div>
          );
        })}
        <div className="bg-[#1A3557]/5 rounded-xl border border-[#1A3557]/15 border-t-4 border-t-[#1A3557] p-4">
          <p className="text-xs font-semibold text-[#1A3557]/70 uppercase tracking-wide mb-1">Admin</p>
          <p className="font-['Fraunces'] text-3xl font-bold leading-none text-[#1A3557]">
            {total}<span className="text-lg text-[#1A3557]/40">/{total}</span>
          </p>
          <p className="text-[11px] text-[#1A3557]/50 mt-1">acceso total fijo</p>
        </div>
      </div>

      {/* Módulos */}
      <div className="space-y-4">
        {grupos.map(([modulo, permisos]) => (
          <div key={modulo} className="bg-white rounded-2xl border border-neutral-200 shadow-sm overflow-hidden">
            <div className="px-5 py-3 bg-[#e8f5ee] border-b border-neutral-200 flex items-center justify-between gap-4">
              <h3 className="text-xs font-bold text-[#1a5c3a] uppercase tracking-wide">{modulo}</h3>
              <div className="flex items-center gap-6 sm:gap-10 shrink-0">
                {roles.map((rol) => (
                  <span key={rol} className="w-10 sm:w-14 text-center text-[10px] font-bold text-[#1a5c3a]/70 uppercase tracking-wide">
                    {ROL_LABEL[rol] || rol}
                  </span>
                ))}
                <span className="w-10 sm:w-14 text-center text-[10px] font-bold text-[#1a5c3a]/40 uppercase tracking-wide">Admin</span>
              </div>
            </div>
            <div className="divide-y divide-neutral-100">
              {permisos.map((p) => (
                <div key={p.clave} className="flex items-center justify-between gap-4 px-5 py-3 hover:bg-neutral-50 transition-colors">
                  <span className="text-sm text-neutral-700 flex-1 min-w-0">{p.label}</span>
                  <div className="flex items-center gap-6 sm:gap-10 shrink-0">
                    {roles.map((rol) => (
                      <span key={rol} className="w-10 sm:w-14 flex justify-center">
                        <Toggle
                          checked={!!matriz[rol]?.[p.clave]}
                          onChange={() => toggle(rol, p.clave)}
                        />
                      </span>
                    ))}
                    <span className="w-10 sm:w-14 flex justify-center">
                      <AdminCheck />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
