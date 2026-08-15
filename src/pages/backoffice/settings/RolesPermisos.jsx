// src/pages/backoffice/settings/RolesPermisos.jsx
//
// Checklist de permisos por rol. Admin siempre tiene acceso total (columna
// fija, no editable) — solo Asesor y Soporte se configuran aquí.
import { useCallback, useEffect, useMemo, useState } from "react";
import { boGET, boPUT } from "../../../services/backofficeApi";
import { dialog } from "../../../services/dialogService";

const ROL_LABEL = { asesor: "Asesor", soporte: "Soporte" };

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
    return <div className="p-6 text-sm text-neutral-400 text-center">Cargando…</div>;
  }

  return (
    <div className="p-4 sm:p-6 space-y-5 max-w-4xl mx-auto">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-primary">Roles y Permisos</h1>
          <p className="text-sm text-neutral-600 mt-1">
            Marca qué puede hacer cada rol en el backoffice. El rol{" "}
            <span className="font-semibold">Admin</span> siempre tiene acceso
            total y no se puede editar aquí.
          </p>
        </div>
        <button
          onClick={guardar}
          disabled={!hayCambios || saving}
          className="px-4 py-2 rounded-lg bg-primary text-white text-sm font-semibold disabled:opacity-40 shrink-0"
        >
          {saving ? "Guardando..." : "Guardar cambios"}
        </button>
      </div>

      <div className="bg-white border border-neutral-200 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="bg-[#e8f5ee] text-[#1a5c3a] text-left text-xs font-bold uppercase tracking-wide">
                <th className="px-4 py-3">Permiso</th>
                {roles.map((rol) => (
                  <th key={rol} className="px-4 py-3 text-center">{ROL_LABEL[rol] || rol}</th>
                ))}
                <th className="px-4 py-3 text-center text-neutral-400">Admin</th>
              </tr>
            </thead>
            <tbody>
              {grupos.map(([modulo, permisos]) => (
                <FragmentoModulo key={modulo} modulo={modulo} permisos={permisos} roles={roles} matriz={matriz} onToggle={toggle} />
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function FragmentoModulo({ modulo, permisos, roles, matriz, onToggle }) {
  return (
    <>
      <tr className="bg-neutral-50">
        <td colSpan={roles.length + 2} className="px-4 py-2 text-xs font-bold text-neutral-500 uppercase tracking-wide">
          {modulo}
        </td>
      </tr>
      {permisos.map((p) => (
        <tr key={p.clave} className="border-t hover:bg-neutral-50">
          <td className="px-4 py-2.5 text-neutral-700">{p.label}</td>
          {roles.map((rol) => (
            <td key={rol} className="px-4 py-2.5 text-center">
              <input
                type="checkbox"
                checked={!!matriz[rol]?.[p.clave]}
                onChange={() => onToggle(rol, p.clave)}
                className="w-4 h-4 accent-primary cursor-pointer"
              />
            </td>
          ))}
          <td className="px-4 py-2.5 text-center text-neutral-300">✓</td>
        </tr>
      ))}
    </>
  );
}
